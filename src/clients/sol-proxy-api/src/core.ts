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

  // INIT UMI...
  const umi = buildUmi();
  const walletUmiKeypair: UmiKeypair = await buildWalletKeypair(umi);
  const payerSigner: KeypairSigner = createSignerFromKeypair(umi, walletUmiKeypair);
  const tournamentUmiKeypair: UmiKeypair = translateWeb3ToUmiKeypair(umi, tournamentWeb3Keypair);

  umi.use(keypairIdentity(payerSigner));

  // MINT NFT...
  const tokenIndxs = range(0, noOfTokens);

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
    tokens: mintAuths.map((v, i) => ({ indx: i, mint: { privKey: JSON.stringify(Array.from(v.secretKey)) } as IKeys } as IToken)),
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
    amount: sol(instr.amount!),
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

  // Transfer NFT from user to trusted wallet...
  const sourceUserWalletSigner = translateInstrKeyToSigner(umi, instr.source);
  await transferV1(umi, {
    mint: mintSigner.publicKey,
    authority: sourceUserWalletSigner,
    tokenOwner: sourceUserWalletSigner.publicKey,
    destinationOwner: tournamentSigner.publicKey,
    tokenStandard: TokenStandard.NonFungible,
  }).sendAndConfirm(umi);

  // Transfer NFT from user to trusted wallet...
  const destUserWalletSigner = translateInstrKeyToSigner(umi, instr.dest!);
  await transferV1(umi, {
    mint: mintSigner.publicKey,
    authority: tournamentSigner,
    tokenOwner: tournamentSigner.publicKey,
    destinationOwner: destUserWalletSigner.publicKey,
    tokenStandard: TokenStandard.NonFungible,
  }).sendAndConfirm(umi);
}