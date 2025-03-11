import { buildUmi, loadKeypairFromCfg, translateWeb3ToUmiKeypair } from './utls';
import { createSignerFromKeypair, generateSigner, keypairIdentity, percentAmount } from '@metaplex-foundation/umi';
import { createNft } from '@metaplex-foundation/mpl-token-metadata';


async function main() {
  const umi = buildUmi();

  // const walletKeypair = await buildWalletKeypair(umi);
  const walletKp = await loadKeypairFromCfg('tournament-keypair.json');
  const walletUmiKp = translateWeb3ToUmiKeypair(umi, walletKp);
  const walletSigner = createSignerFromKeypair(umi, walletUmiKp);

  umi.use(keypairIdentity(walletSigner));

  const mint = generateSigner(umi);
  console.log(mint.publicKey);

  await createNft(umi, {
    mint,
    name: 'scorpion-nft',
    uri: 'https://en.wikipedia.org/wiki/Scorpion_(Mortal_Kombat)#/media/File:ScorpionMortalKombatx.jpg',
    sellerFeeBasisPoints: percentAmount(5.5),
    // optional if you directly want to add to a collection. Need to verify later.
    // collection: some({ key: collectionMint.publicKey, verified: false }),
  }).sendAndConfirm(umi);
}

main().then(() => {
  console.log("Done.");
}, err => {
  console.error(err);
});