import { buildUmi, buildWalletKeypair, loadKeypairFromCfg } from './utls';
import { createSignerFromKeypair, generateSigner, keypairIdentity, KeypairSigner, percentAmount, publicKey } from '@metaplex-foundation/umi';
import { burnV1, createNft, delegateStandardV1, fetchDigitalAssetWithAssociatedToken, TokenStandard, transferV1 } from '@metaplex-foundation/mpl-token-metadata';


async function main() {

  const umi = buildUmi();

  const walletKeypair = await buildWalletKeypair(umi);
  const payerSigner = createSignerFromKeypair(umi, walletKeypair);

  umi.use(keypairIdentity(payerSigner));

  const mint: KeypairSigner = generateSigner(umi);

  // Delegate...
  const delegateWeb3Keypair = await loadKeypairFromCfg('delegate-keypair.json');
  const delegateKeypair = umi.eddsa.createKeypairFromSecretKey(delegateWeb3Keypair.secretKey);
  const delegateAuthority = createSignerFromKeypair(umi, delegateKeypair);

  // Mint NFT...
  console.log("Attempting mint asset...");
  await createNft(umi, {
    mint,
    name: 'scorpion-nft-001',
    uri: 'https://en.wikipedia.org/wiki/Scorpion_(Mortal_Kombat)#/media/File:ScorpionMortalKombatx.jpg',
    sellerFeeBasisPoints: percentAmount(5.5),
    // optional if you directly want to add to a collection. Need to verify later.
    // collection: some({ key: collectionMint.publicKey, verified: false }),
  }).sendAndConfirm(umi);

  // Delegate...
  console.log("Attempting delegate setup...");
  const delegateTransactionBuilder = delegateStandardV1(umi, {
    mint: mint.publicKey,
    tokenOwner: walletKeypair.publicKey,
    authority: payerSigner,
    delegate: delegateKeypair.publicKey,
    tokenStandard: TokenStandard.NonFungible,
  });

  await delegateTransactionBuilder.sendAndConfirm(umi);

  // New owner...
  const newOwnerWeb3Keypair = await loadKeypairFromCfg('wallet-x-keypair.json');
  const newOwnerKeypair = umi.eddsa.createKeypairFromSecretKey(newOwnerWeb3Keypair.secretKey);
  const newOwnerAuthority = createSignerFromKeypair(umi, newOwnerKeypair);

  console.log("Attempting transfer...");
  await transferV1(umi, {
    mint: mint.publicKey,
    authority: delegateAuthority,
    tokenOwner: walletKeypair.publicKey,
    destinationOwner: newOwnerKeypair.publicKey,
    tokenStandard: TokenStandard.NonFungible,
  }).sendAndConfirm(umi);

  console.log("Attempting fetch asset...");
  const asset = await fetchDigitalAssetWithAssociatedToken(umi, mint.publicKey, walletKeypair.publicKey);
  console.log(asset);

  console.log("Attempting burn asset...");
  await burnV1(umi, {
    mint: mint.publicKey,
    authority: delegateAuthority,
    tokenOwner: newOwnerKeypair.publicKey,
    tokenStandard: TokenStandard.NonFungible,
  }).sendAndConfirm(umi);
}

main().then(() => {
  console.log("Done.");
}, err => {
  console.error(err);
});