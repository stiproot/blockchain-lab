import { buildUmi, loadKeypairFromCfg, logTransactionLink, createUmiKeypairFromSecretKey, uint8ArrayToStr, strToUint8Array } from './utls';
import { createSignerFromKeypair, generateSigner, keypairIdentity, percentAmount } from '@metaplex-foundation/umi';
import { createNft, fetchDigitalAssetWithAssociatedToken, TokenStandard, transferV1 } from '@metaplex-foundation/mpl-token-metadata';
import { DEFAULT_TOURNAMENT_CFG } from './consts';


async function main() {
  const umi = buildUmi();

  const walletKp = await loadKeypairFromCfg(DEFAULT_TOURNAMENT_CFG);
  const walletUmiKp = createUmiKeypairFromSecretKey(umi, walletKp.secretKey);
  let walletSigner = createSignerFromKeypair(umi, walletUmiKp);

  umi.use(keypairIdentity(walletSigner));

  let mintSigner = generateSigner(umi);
  console.log('mint', 'pubkey', mintSigner.publicKey);

  console.log('attempting mint...');
  const builder = createNft(umi, {
    mint: mintSigner,
    name: 'scorpion-nft',
    uri: 'https://en.wikipedia.org/wiki/Scorpion_(Mortal_Kombat)#/media/File:ScorpionMortalKombatx.jpg',
    sellerFeeBasisPoints: percentAmount(5.5),
    tokenOwner: walletUmiKp.publicKey
    // optional if you directly want to add to a collection. Need to verify later.
    // collection: some({ key: collectionMint.publicKey, verified: false }),
  });

  const { signature } = await builder.sendAndConfirm(umi);
  logTransactionLink('mint signature', signature);

  console.log('attempting fetch...')
  let asset = await fetchDigitalAssetWithAssociatedToken(umi, mintSigner.publicKey, walletUmiKp.publicKey);
  console.log('asset', asset);

  const mintSecretKeyStr = uint8ArrayToStr(mintSigner.secretKey);
  mintSigner = createSignerFromKeypair(umi, createUmiKeypairFromSecretKey(umi, strToUint8Array(mintSecretKeyStr)));

  const walletSecretkeyStr = uint8ArrayToStr(walletSigner.secretKey);
  walletSigner = createSignerFromKeypair(umi, createUmiKeypairFromSecretKey(umi, strToUint8Array(walletSecretkeyStr)));

  const destWallet = await loadKeypairFromCfg('wallet0-keypair.json');
  const destUmiWallet = createUmiKeypairFromSecretKey(umi, destWallet.secretKey);
  let destWalletSigner = createSignerFromKeypair(umi, destUmiWallet);
  let destWalletSecretKeyStr = uint8ArrayToStr(destWalletSigner.secretKey);
  destWalletSigner = createSignerFromKeypair(umi, createUmiKeypairFromSecretKey(umi, strToUint8Array(destWalletSecretKeyStr)));

  console.log('attempting transfer...');
  const transferBuilder = transferV1(umi, {
    mint: mintSigner.publicKey,
    authority: walletSigner,
    tokenOwner: walletSigner.publicKey,
    destinationOwner: destWalletSigner.publicKey,
    tokenStandard: TokenStandard.NonFungible,
  });

  const { signature: transSignature } = await transferBuilder.sendAndConfirm(umi);
  logTransactionLink('transfer signature:', transSignature);

  console.log('attempting fetch (post transfer)...')
  asset = await fetchDigitalAssetWithAssociatedToken(umi, mintSigner.publicKey, destWalletSigner.publicKey);
  console.log('asset', asset);
}

main().then(() => {
  console.log("Done.");
}, err => {
  console.error(err);
});