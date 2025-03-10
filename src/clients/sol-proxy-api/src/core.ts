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
import { buildWalletKeypair, loadDefaultWalletKeypair, loadKeypairFromCfg, buildUmi, createConn, translateWeb3ToUmiKeypair } from './utls';

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

export async function setup(name: string, noOfTokens: number) {

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
}

export async function transferSol(amount: number) {

  const umi = buildUmi();

  const walletKeypair = await buildWalletKeypair(umi);
  const payerSigner = createSignerFromKeypair(umi, walletKeypair);

  const tournamentWeb3Keypair: Web3Keypair = await loadKeypairFromCfg('tournament-keypair.json');
  const tournamentUmiKeypair: UmiKeypair = translateWeb3ToUmiKeypair(umi, tournamentWeb3Keypair);

  umi.use(keypairIdentity(payerSigner));

  await mplTransferSol(umi, {
    source: payerSigner,
    destination: tournamentUmiKeypair.publicKey,
    amount: sol(amount),
  }).sendAndConfirm(umi);
}

export async function transferNft(destinationPubKey: string, mintPubKey: string) {
  const umi = buildUmi();

  const walletKeypair = await buildWalletKeypair(umi);
  const payerSigner = createSignerFromKeypair(umi, walletKeypair);

  umi.use(keypairIdentity(payerSigner));

  const newOwner = publicKey(destinationPubKey);

  const tournamentWeb3Keypair: Web3Keypair = await loadKeypairFromCfg('tournament-keypair.json');
  const tournamentUmiKeypair: UmiKeypair = translateWeb3ToUmiKeypair(umi, tournamentWeb3Keypair);

  const mint = publicKey(mintPubKey);

  await transferV1(umi, {
    mint,
    authority: payerSigner,
    tokenOwner: tournamentUmiKeypair.publicKey,
    destinationOwner: newOwner,
    tokenStandard: TokenStandard.NonFungible,
  }).sendAndConfirm(umi);
}