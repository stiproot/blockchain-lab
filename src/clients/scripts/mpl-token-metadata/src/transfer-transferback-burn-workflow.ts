import { buildUmi, buildWalletKeypair, loadKeypairFromCfg } from './utls';
import { createSignerFromKeypair, generateSigner, keypairIdentity, KeypairSigner, percentAmount, publicKey } from '@metaplex-foundation/umi';
import { burnV1, createNft, delegateStandardV1, fetchDigitalAssetWithAssociatedToken, TokenStandard, transferV1, updateMetadataAccountV2, updateV1 } from '@metaplex-foundation/mpl-token-metadata';

async function main() {

  const umi = buildUmi();

  const walletKeypair = await buildWalletKeypair(umi);
  const walletSigner = createSignerFromKeypair(umi, walletKeypair);
  console.log('Wallet pubkey:', walletKeypair.publicKey);

  umi.use(keypairIdentity(walletSigner));

  const mint: KeypairSigner = generateSigner(umi);
  console.log('Mint pubkey:', mint.publicKey);

  // Mint NFT...
  console.log("Attempting mint asset...");
  await createNft(umi, {
    authority: walletSigner,
    mint,
    name: 'scorpion-nft-001',
    uri: 'https://en.wikipedia.org/wiki/Scorpion_(Mortal_Kombat)#/media/File:ScorpionMortalKombatx.jpg',
    sellerFeeBasisPoints: percentAmount(5.5),
    updateAuthority: walletSigner,
    isMutable: true,
  }).sendAndConfirm(umi);

  // New owner...
  const newOwnerWeb3Keypair = await loadKeypairFromCfg('wallet-x-keypair.json');
  const newOwnerKeypair = umi.eddsa.createKeypairFromSecretKey(newOwnerWeb3Keypair.secretKey);
  const newOwnerAuthority = createSignerFromKeypair(umi, newOwnerKeypair);
  console.log('new owner pubkey:', newOwnerAuthority.publicKey);

  console.log("Attempting transfer...");
  await transferV1(umi, {
    authority: walletSigner,
    payer: walletSigner,
    mint: mint.publicKey,
    tokenOwner: walletKeypair.publicKey,
    destinationOwner: newOwnerKeypair.publicKey,
    tokenStandard: TokenStandard.NonFungible,
  }).sendAndConfirm(umi);

  console.log("Attempting transfer back...");
  await transferV1(umi, {
    authority: newOwnerAuthority,
    payer: walletSigner,
    mint: mint.publicKey,
    tokenOwner: newOwnerKeypair.publicKey,
    destinationOwner: walletKeypair.publicKey,
    tokenStandard: TokenStandard.NonFungible,
  }).sendAndConfirm(umi);

  console.log("Attempting burn asset...");
  await burnV1(umi, {
    authority: walletSigner,
    mint: mint.publicKey,
    tokenOwner: walletKeypair.publicKey,
    tokenStandard: TokenStandard.NonFungible,
  }).sendAndConfirm(umi);
}

main().then(() => {
  console.log("Done.");
}, err => {
  console.error(err);
});