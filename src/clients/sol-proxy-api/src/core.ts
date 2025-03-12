import { createSignerFromKeypair, generateSigner, keypairIdentity, KeypairSigner, percentAmount, PublicKey, sol, Umi, Keypair as UmiKeypair } from '@metaplex-foundation/umi';
import { burnV1, createNft, TokenStandard, transferV1 } from '@metaplex-foundation/mpl-token-metadata';
import {
  PublicKey as Web3PublicKey,
  Connection,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
  Keypair as Web3Keypair,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';
import { transferSol as mplTransferSol } from '@metaplex-foundation/mpl-toolbox';
import { buildWalletKeypair, loadDefaultWalletKeypair, loadKeypairFromCfg, buildUmi, createConn, translateInstrKeyToSigner, createUmiKeypairFromSecretKey, range, buildTestWalletCfgName, uint8ArrayToStr, buildTokenName, buildTokenUri, logTransactionLink } from './utls';
import { IBurnNftInstr, IKeys, ISetupAccsInstr, ISetupInstr, ISetupResp, IToken, ITransferNftInstr, ITransferSolInstr } from './types';
import { DEFAULT_SELLER_FEE_BASIS_POINTS_AMT, DEFAULT_SOL_FUND_AMT, DEFAULT_SOL_TRANSFER_AMT, DEFAULT_TOURNAMENT_CFG } from './consts';


async function mintNft(umi: Umi, name: string, uri: string, signer: KeypairSigner | null = null): Promise<KeypairSigner> {
  const mint: KeypairSigner = signer || generateSigner(umi);

  const builder = createNft(umi, {
    mint,
    name,
    uri,
    sellerFeeBasisPoints: percentAmount(DEFAULT_SELLER_FEE_BASIS_POINTS_AMT),
    isMutable: true,
  });

  const { signature } = await builder.sendAndConfirm(umi);
  logTransactionLink('mintNft()', signature);

  return mint;
}

export async function transferSolCore(
  umi: Umi,
  sourceSigner: KeypairSigner,
  destPubKey: PublicKey,
  amt: number = DEFAULT_SOL_TRANSFER_AMT
) {
  const builder = mplTransferSol(umi, {
    source: sourceSigner,
    destination: destPubKey,
    amount: sol(amt),
  });

  const { signature } = await builder.sendAndConfirm(umi);
  logTransactionLink('transferSolCore()', signature);
}

export async function transferNftCore(
  umi: Umi,
  mintPubKey: PublicKey,
  authoritySigner: KeypairSigner,
  ownerPubKey: PublicKey,
  destOwnerPubKey: PublicKey
) {
  const builder = transferV1(umi, {
    mint: mintPubKey,
    authority: authoritySigner,
    tokenOwner: ownerPubKey,
    destinationOwner: destOwnerPubKey,
    tokenStandard: TokenStandard.NonFungible,
  });

  const { signature } = await builder.sendAndConfirm(umi);
  logTransactionLink('transferNftCore()', signature);
}

export async function burnNftCore(
  umi: Umi,
  mintPubKey: PublicKey,
  authoritySigner: KeypairSigner,
  ownerPubKey: PublicKey
) {
  const builder = burnV1(umi, {
    mint: mintPubKey,
    authority: authoritySigner,
    tokenOwner: ownerPubKey,
    tokenStandard: TokenStandard.NonFungible,
  });

  const { signature } = await builder.sendAndConfirm(umi);
  logTransactionLink('burnNftCore()', signature);
}

async function createAccount(
  umi: Umi,
  connection: Connection,
  fundingWallet: Web3Keypair,
  lamports: number,
  newAccountKeypair: Web3Keypair | null = null
): Promise<UmiKeypair> {
  const web3Keypair: Web3Keypair = newAccountKeypair || Web3Keypair.generate();

  const instruction = SystemProgram.createAccount({
    fromPubkey: fundingWallet.publicKey, // Funding wallet
    newAccountPubkey: web3Keypair.publicKey,
    lamports, // Minimum SOL needed
    space: 0, // Space required
    programId: SystemProgram.programId, // Assign to system program
  });

  const transaction = new Transaction().add(instruction);
  const signature = await sendAndConfirmTransaction(connection, transaction, [fundingWallet, web3Keypair]);

  console.log('createAccount()', 'pubKey', web3Keypair.publicKey.toBase58(), 'signature', signature);
  return createUmiKeypairFromSecretKey(umi, web3Keypair.secretKey);
}

async function getWalletKeypairFromFile(umi: Umi, indx: number): Promise<UmiKeypair> {
  const kp: Web3Keypair = await loadKeypairFromCfg(buildTestWalletCfgName(indx));
  return createUmiKeypairFromSecretKey(umi, kp.secretKey);
}

async function airdropSol(recipientPubKey: string, amountSol: number = DEFAULT_SOL_FUND_AMT) {
  const connection: Connection = createConn();
  const signature = await connection.requestAirdrop(
    new Web3PublicKey(recipientPubKey),
    amountSol * LAMPORTS_PER_SOL
  );

  // Wait for confirmation
  await connection.confirmTransaction(signature);
  console.log(`Airdropped ${amountSol} SOL to ${recipientPubKey}`, 'signature', signature);
}

export async function setupAccs(instr: ISetupAccsInstr): Promise<Array<IKeys>> {
  const connection: Connection = createConn();
  const lamports = await connection.getMinimumBalanceForRentExemption(0); // Get rent-exempt amount

  const umi = buildUmi();
  const walletWeb3Keypair: Web3Keypair = await loadDefaultWalletKeypair();
  const walletUmiKeypair: UmiKeypair = await buildWalletKeypair(umi);
  const payerSigner: KeypairSigner = createSignerFromKeypair(umi, walletUmiKeypair);
  umi.use(keypairIdentity(payerSigner));

  const indxs = range(0, instr.noAccs);

  let newAccs = [];
  if (instr.useExisting) {
    newAccs = await Promise.all(indxs.map(i => getWalletKeypairFromFile(umi, i)));
  }
  else {
    newAccs = await Promise.all(indxs.map(i => createAccount(umi, connection, walletWeb3Keypair, lamports)));
  }

  if (instr.fundAccs) {
    await Promise.all(newAccs.map(a => airdropSol(a.publicKey.toString())));
  }

  return newAccs.map(na => ({ pk: JSON.stringify(Array.from(na.secretKey)) } as IKeys));
}

export async function setup(instr: ISetupInstr): Promise<ISetupResp> {
  const connection: Connection = createConn();

  // CREATE TOURNAMENT ACC...
  const walletWeb3Keypair: Web3Keypair = await loadDefaultWalletKeypair();
  const lamports = await connection.getMinimumBalanceForRentExemption(0); // Get rent-exempt amount

  const tournamentWeb3Keypair: Web3Keypair = instr.useExisting ? await loadKeypairFromCfg(DEFAULT_TOURNAMENT_CFG) : Web3Keypair.generate();

  if (!instr.useExisting) {
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
    if (instr.fundAcc) {
      await airdropSol(tournamentWeb3Keypair.publicKey.toString());
    }
  }

  console.log("Trusted wallet created:", tournamentWeb3Keypair.publicKey.toBase58());

  const tokenIndxs = range(0, instr.noTokens);

  // INIT UMI...
  const umi = buildUmi();
  const walletUmiKeypair: UmiKeypair = await buildWalletKeypair(umi);
  const walletSigner: KeypairSigner = createSignerFromKeypair(umi, walletUmiKeypair);

  const tournamentUmiKeypair: UmiKeypair = createUmiKeypairFromSecretKey(umi, tournamentWeb3Keypair.secretKey);

  umi.use(keypairIdentity(walletSigner));

  // MINT NFTS...
  const mintAuthsPromises: Array<Promise<KeypairSigner>> = tokenIndxs.map(ti => mintNft(umi, buildTokenName(instr.name, ti), buildTokenUri(instr.name, ti)));
  const mintAuths: Array<KeypairSigner> = await Promise.all(mintAuthsPromises);

  // TRANSER...
  const transferPromises = mintAuths.map(ma => transferNftCore(
    umi,
    ma.publicKey,
    walletSigner,
    walletUmiKeypair.publicKey,
    tournamentUmiKeypair.publicKey,
  ));

  await Promise.all(transferPromises);

  return {
    tokens: mintAuths.map((v, i) => ({
      indx: i,
      mint: {
        pk: uint8ArrayToStr(v.secretKey)
      } as IKeys,
    } as IToken)),
    tournament: { pk: uint8ArrayToStr(tournamentUmiKeypair.secretKey) } as IKeys
  } as ISetupResp;
}

export async function transferSol(instr: ITransferSolInstr) {
  const umi = buildUmi();

  const tournamentSigner = translateInstrKeyToSigner(umi, instr.tournament);
  umi.use(keypairIdentity(tournamentSigner));

  // Transfer from user's wallet to trusted wallet...
  const sourceUserWalletSigner = translateInstrKeyToSigner(umi, instr.source);
  await transferSolCore(umi, sourceUserWalletSigner, tournamentSigner.publicKey);

  // Transfer from the trusted wallet to the user's wallet... 
  const destUserWallet = translateInstrKeyToSigner(umi, instr.dest!);
  await transferSolCore(umi, tournamentSigner, destUserWallet.publicKey);

  return {};
}

export async function transferNft(instr: ITransferNftInstr) {
  const umi = buildUmi();

  const tournamentSigner = translateInstrKeyToSigner(umi, instr.tournament);
  umi.use(keypairIdentity(tournamentSigner));
  const mintSigner = translateInstrKeyToSigner(umi, instr.mint!);

  if (instr.source.pk !== instr.tournament.pk) {
    // Transfer NFT from source user to trusted wallet...
    const sourceUserWalletSigner = translateInstrKeyToSigner(umi, instr.source);
    await transferNftCore(umi, mintSigner.publicKey, sourceUserWalletSigner, sourceUserWalletSigner.publicKey, tournamentSigner.publicKey);
  }

  // Transfer NFT from trusted wallet to dest user wallet...
  const destUserWalletSigner = translateInstrKeyToSigner(umi, instr.dest!);
  await transferNftCore(umi, mintSigner.publicKey, tournamentSigner, tournamentSigner.publicKey, destUserWalletSigner.publicKey);

  return {};
}

export async function burnNft(instr: IBurnNftInstr) {
  const umi = buildUmi();

  const tournamentSigner = translateInstrKeyToSigner(umi, instr.tournament);
  umi.use(keypairIdentity(tournamentSigner));
  const mintSigner = translateInstrKeyToSigner(umi, instr.mint!);

  // Transfer NFT from source user to trusted wallet...
  const sourceUserWalletSigner = translateInstrKeyToSigner(umi, instr.source);
  await transferNftCore(
    umi,
    mintSigner.publicKey,
    sourceUserWalletSigner,
    sourceUserWalletSigner.publicKey,
    tournamentSigner.publicKey
  );

  await burnNftCore(umi,
    mintSigner.publicKey,
    tournamentSigner,
    tournamentSigner.publicKey,
  );

  return {};
}