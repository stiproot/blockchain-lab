import { buildWalletKeypair, loadDefaultWalletKeypair, loadKeypairFromCfg, buildUmi, createConn, translateWeb3ToUmiKeypair } from './utls';
import { createSignerFromKeypair, generateSigner, keypairIdentity, KeypairSigner, percentAmount, Keypair as UmiKeypair } from '@metaplex-foundation/umi';
import { createNft, TokenStandard, transferV1 } from '@metaplex-foundation/mpl-token-metadata';
import {
  Connection,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
  Keypair as Web3Keypair,
} from '@solana/web3.js';

async function main() {

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
  const mints: Array<KeypairSigner> = [];

  for (var i in [1, 2, 3]) {
    console.log("Attempting mint asset...");
    const mint: KeypairSigner = generateSigner(umi);

    await createNft(umi, {
      mint,
      name: 'scorpion-nft-001',
      uri: 'https://en.wikipedia.org/wiki/Scorpion_(Mortal_Kombat)#/media/File:ScorpionMortalKombatx.jpg',
      sellerFeeBasisPoints: percentAmount(5.5),
      // updateAuthority: delegateAuthority,
      isMutable: true,
    }).sendAndConfirm(umi);

    mints.push(mint);
  }

  // TRANSER...
  for (const mint of mints) {
    console.log("Attempting asset transfer...")
    await transferV1(umi, {
      mint: mint.publicKey,
      authority: payerSigner,
      tokenOwner: walletUmiKeypair.publicKey,
      destinationOwner: tournamentUmiKeypair.publicKey,
      tokenStandard: TokenStandard.NonFungible,
    }).sendAndConfirm(umi);
  }

  // DELEGATE...
  // const delegateKeypair = umi.eddsa.createKeypairFromSecretKey(tournamentWeb3Keypair.secretKey);
  // const tournamentAuthority = createSignerFromKeypair(umi, tournamentUmiKeypair);

  // console.log("Attempting delegate setup...");
  // const delegateTransactionBuilder = delegateStandardV1(umi, {
  //   mint: mint.publicKey,
  //   tokenOwner: walletUmiKeypair.publicKey,
  //   authority: payerSigner,
  //   delegate: tournamentUmiKeypair.publicKey,
  //   tokenStandard: TokenStandard.NonFungible,
  // });

  // await delegateTransactionBuilder.sendAndConfirm(umi);

  // await updateV1(umi, {
  //   mint: mint.publicKey,
  //   authority: payerSigner,
  //   newUpdateAuthority: delegateAuthority.publicKey,
  // }).sendAndConfirm(umi);
}

main().then(() => {
  console.log("Done.");
}, err => {
  console.error(err);
});