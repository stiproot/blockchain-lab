import { createSignerFromKeypair, generateSigner, keypairIdentity, KeypairSigner, percentAmount, publicKey, PublicKey, sol, Umi, Keypair as UmiKeypair } from '@metaplex-foundation/umi';
import { createNft, TokenStandard, transferV1 } from '@metaplex-foundation/mpl-token-metadata';
import {
  Connection,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
  Keypair as Web3Keypair,
} from '@solana/web3.js';
import { transferSol as mplTransferSol } from '@metaplex-foundation/mpl-toolbox';
import { buildWalletKeypair, loadDefaultWalletKeypair, loadKeypairFromCfg, buildUmi, createConn, translateWeb3ToUmiKeypair, translateInstrKeyToSigner } from './utls';
import { IInstruction, IKeys, ISetupResp, IToken } from './types';

const range = (start: number, stop: number, step = 1) =>
  Array.from({ length: Math.ceil((stop - start) / step) }, (_, i) => start + i * step);

async function mintNft(umi: Umi, name: string, uri: string, signer: KeypairSigner | null = null): Promise<KeypairSigner> {
  const mint: KeypairSigner = signer || generateSigner(umi);
  await createNft(umi, {
    mint,
    name,
    uri,
    sellerFeeBasisPoints: percentAmount(5.5),
    isMutable: true,
  }).sendAndConfirm(umi);
  return mint;
}

async function transferNftToTrustedWallet(
  umi: Umi,
  mintPubKey: PublicKey,
  authorityKeySigner: KeypairSigner,
  ownerPubKey: PublicKey,
  newOwnerPubKey: PublicKey,
) {
  console.log("Attempting asset transfer...")
  await transferV1(umi, {
    mint: mintPubKey,
    authority: authorityKeySigner,
    tokenOwner: ownerPubKey,
    destinationOwner: newOwnerPubKey,
    tokenStandard: TokenStandard.NonFungible,
  }).sendAndConfirm(umi);
}

async function createAccount(
  umi: Umi,
  connection: Connection,
  fundingWallet: Web3Keypair,
  lamports: number,
  newAccountKeypair: Web3Keypair | null = null
): Promise<UmiKeypair> {
  const web3Keypair: Web3Keypair = newAccountKeypair || Web3Keypair.generate();
  const transaction = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: fundingWallet.publicKey, // Funding wallet
      newAccountPubkey: web3Keypair.publicKey,
      lamports, // Minimum SOL needed
      space: 0, // Space required
      programId: SystemProgram.programId, // Assign to system program
    })
  );
  await sendAndConfirmTransaction(connection, transaction, [fundingWallet, web3Keypair]);
  console.log("Account created:", web3Keypair.publicKey.toBase58());
  return translateWeb3ToUmiKeypair(umi, web3Keypair);
}

async function getWalletXKeypair(umi: Umi, indx: number) {
  const cfg = `wallet-${indx}-keypair.json`
  const kp: Web3Keypair = await loadKeypairFromCfg(cfg);
  return translateWeb3ToUmiKeypair(umi, kp);
}

export async function createAccounts(no: number, useExisting: boolean = true): Promise<Array<IKeys>> {
  const connection: Connection = createConn();
  const lamports = await connection.getMinimumBalanceForRentExemption(0); // Get rent-exempt amount

  const umi = buildUmi();
  const walletWeb3Keypair: Web3Keypair = await loadDefaultWalletKeypair();
  const walletUmiKeypair: UmiKeypair = await buildWalletKeypair(umi);
  const payerSigner: KeypairSigner = createSignerFromKeypair(umi, walletUmiKeypair);
  umi.use(keypairIdentity(payerSigner));

  const indxs = range(0, no);

  let newAccs = [];
  if (useExisting) {
    newAccs = await Promise.all(indxs.map(i => getWalletXKeypair(umi, i)));
  }
  else {
    newAccs = await Promise.all(indxs.map(i => createAccount(umi, connection, walletWeb3Keypair, lamports)));
  }

  return newAccs.map(na => ({ privKey: JSON.stringify(Array.from(na.secretKey)) } as IKeys));
}

export async function setup(name: string, noOfTokens: number): Promise<ISetupResp> {
  const connection: Connection = createConn();

  // CREATE TOURNAMENT ACC...
  const walletWeb3Keypair: Web3Keypair = await loadDefaultWalletKeypair();
  const lamports = await connection.getMinimumBalanceForRentExemption(0); // Get rent-exempt amount
  const tournamentWeb3Keypair: Web3Keypair = await loadKeypairFromCfg('tournament-keypair.json');

  console.log("Attempting account creation...")
  const transaction = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: walletWeb3Keypair.publicKey, // Funding wallet
      newAccountPubkey: tournamentWeb3Keypair.publicKey,
      lamports, // Minimum SOL needed
      space: 0, // Space required
      programId: SystemProgram.programId, // Assign to system program
    })
  );

  await sendAndConfirmTransaction(connection, transaction, [walletWeb3Keypair, tournamentWeb3Keypair]);
  console.log("Account created:", tournamentWeb3Keypair.publicKey.toBase58());

  const tokenIndxs = range(0, noOfTokens);

  // INIT UMI...
  const umi = buildUmi();
  const walletUmiKeypair: UmiKeypair = await buildWalletKeypair(umi);
  const payerSigner: KeypairSigner = createSignerFromKeypair(umi, walletUmiKeypair);
  const tournamentUmiKeypair: UmiKeypair = translateWeb3ToUmiKeypair(umi, tournamentWeb3Keypair);

  umi.use(keypairIdentity(payerSigner));

  // MINT NFTS...
  const buildTokenName = (tNo: number): string => `${name}:token-${tNo}`;
  const buildTokenUri = (tNo: number): string => `https://en.wikipedia.org/wiki/Scorpion_(Mortal_Kombat)#/media/File:ScorpionMortalKombatx.jpg?tournament=${name}&token-${tNo}`;

  const mintAuthsPromises: Array<Promise<KeypairSigner>> = tokenIndxs.map(ti => mintNft(umi, buildTokenName(ti), buildTokenUri(ti)));
  const mintAuths: Array<KeypairSigner> = await Promise.all(mintAuthsPromises);

  // TRANSER...
  const transferPromises = mintAuths.map(ma => transferNftToTrustedWallet(
    umi,
    ma.publicKey,
    payerSigner,
    walletUmiKeypair.publicKey,
    tournamentUmiKeypair.publicKey,
  ));

  await Promise.all(transferPromises);

  return {
    tokens: mintAuths.map((v, i) => ({
      indx: i,
      mint: {
        privKey: JSON.stringify(Array.from(v.secretKey))
      } as IKeys,
    } as IToken)),
    tournament: { privKey: JSON.stringify(Array.from(tournamentUmiKeypair.secretKey)) } as IKeys
  } as ISetupResp;
}

export async function transferSol(instr: IInstruction) {
  const umi = buildUmi();

  const tournamentSigner = translateInstrKeyToSigner(umi, instr.tournament!);

  umi.use(keypairIdentity(tournamentSigner));

  // Transfer from user's wallet to trusted wallet...
  const sourceUserWalletSigner = translateInstrKeyToSigner(umi, instr.source);
  await mplTransferSol(umi, {
    source: sourceUserWalletSigner,
    destination: tournamentSigner.publicKey,
    amount: sol(instr.amount || 0.001),
  }).sendAndConfirm(umi);

  // Transfer from the trusted wallet to the user's wallet... 
  const destUserWallet = translateInstrKeyToSigner(umi, instr.dest!);
  await mplTransferSol(umi, {
    source: tournamentSigner,
    destination: destUserWallet.publicKey,
    amount: sol(instr.amount!),
  }).sendAndConfirm(umi);

  return {};
}

export async function transferNft(instr: IInstruction) {
  const umi = buildUmi();

  const tournamentSigner = translateInstrKeyToSigner(umi, instr.tournament!);
  umi.use(keypairIdentity(tournamentSigner));
  const mintSigner = translateInstrKeyToSigner(umi, instr.mint!);

  if (instr.source.privKey !== instr.tournament.privKey) {
    // Transfer NFT from source user to trusted wallet...
    const sourceUserWalletSigner = translateInstrKeyToSigner(umi, instr.source);
    await transferV1(umi, {
      mint: mintSigner.publicKey,
      authority: sourceUserWalletSigner,
      tokenOwner: sourceUserWalletSigner.publicKey,
      destinationOwner: tournamentSigner.publicKey,
      tokenStandard: TokenStandard.NonFungible,
    }).sendAndConfirm(umi);
  }

  // Transfer NFT from trusted wallet to dest user wallet...
  const destUserWalletSigner = translateInstrKeyToSigner(umi, instr.dest!);
  await transferV1(umi, {
    mint: mintSigner.publicKey,
    authority: tournamentSigner,
    tokenOwner: tournamentSigner.publicKey,
    destinationOwner: destUserWalletSigner.publicKey,
    tokenStandard: TokenStandard.NonFungible,
  }).sendAndConfirm(umi);
}