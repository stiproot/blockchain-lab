import { buildUmi, buildWalletKeypair } from './utls';
import { createSignerFromKeypair, generateSigner, keypairIdentity, percentAmount, some } from '@metaplex-foundation/umi';
import { createNft, fetchMetadataFromSeeds, updateV1 } from '@metaplex-foundation/mpl-token-metadata';


async function main() {

  const umi = buildUmi();

  const walletKeypair = await buildWalletKeypair(umi);
  const payerSigner = createSignerFromKeypair(umi, walletKeypair);

  umi.use(keypairIdentity(payerSigner));

  const mint = generateSigner(umi);

  console.log('Attempting asset creation...');
  await createNft(umi, {
    mint,
    name: 'unassigned',
    uri: 'https://en.wikipedia.org/wiki/Scorpion_(Mortal_Kombat)#/media/File:ScorpionMortalKombatx.jpg',
    sellerFeeBasisPoints: percentAmount(5.5),
    symbol: '$',
    collection: some({ key: mint.publicKey, verified: false }),
    isMutable: true,
    primarySaleHappened: false,
  }).sendAndConfirm(umi);

  console.log("Attempting to fetch metadata from seeds...")
  let metadata = await fetchMetadataFromSeeds(umi, { mint: mint.publicKey });
  console.log(metadata);

  console.log("Attempting update metadata...");
  await updateV1(umi, {
    mint: mint.publicKey,
    authority: payerSigner,
    data: { ...metadata, name: 'player-a-pubkey' },
  }).sendAndConfirm(umi);

  console.log("Attempting to fetch metadata from seeds...");
  metadata = await fetchMetadataFromSeeds(umi, { mint: mint.publicKey });
  console.log(metadata);
}

main().then(() => {
  console.log("Done.");
}, err => {
  console.error(err);
});