import { buildWalletKeypair } from './utls';
import { buildUmi } from './factories';
import { createSignerFromKeypair, generateSigner, keypairIdentity, percentAmount, publicKey, some } from '@metaplex-foundation/umi';
import { createNft, fetchDigitalAssetWithAssociatedToken } from '@metaplex-foundation/mpl-token-metadata';
import { dasApi } from '@metaplex-foundation/digital-asset-standard-api';


async function main() {

  const umi = buildUmi();
  umi.use(dasApi());

  const walletKeypair = await buildWalletKeypair(umi);
  const payerSigner = createSignerFromKeypair(umi, walletKeypair);

  umi.use(keypairIdentity(payerSigner));

  const mint = generateSigner(umi);
  const collection = generateSigner(umi);

  await createNft(umi, {
    mint,
    name: 'unassigned',
    uri: 'https://en.wikipedia.org/wiki/Scorpion_(Mortal_Kombat)#/media/File:ScorpionMortalKombatx.jpg',
    sellerFeeBasisPoints: percentAmount(5.5),
    symbol: '$',
    collection: some({ key: collection.publicKey, verified: false }),
    isMutable: true,
    primarySaleHappened: false,
  }).sendAndConfirm(umi);

  const assets = await umi.rpc.getAssetsByGroup({
    groupKey: 'collection',
    groupValue: collection.publicKey,
  });

  console.log(assets);
}

main().then(() => {
  console.log("Done.");
}, err => {
  console.error(err);
});