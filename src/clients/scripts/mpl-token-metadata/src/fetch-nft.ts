import { buildWalletKeypair } from './utls';
import { buildUmi } from './factories';
import { createSignerFromKeypair, keypairIdentity, publicKey } from '@metaplex-foundation/umi';
import { fetchDigitalAssetWithAssociatedToken } from '@metaplex-foundation/mpl-token-metadata';


async function main() {

  const umi = buildUmi();

  const walletKeypair = await buildWalletKeypair(umi);
  const payerSigner = createSignerFromKeypair(umi, walletKeypair);

  const mint = publicKey('GAyMwZFeNq2mcpBmnozgvwyy8J1vvwsZCe1rpDuY4KVN');

  // wallet...
  const owner = publicKey('4cCksob3hnM1a8J16jRU3E1UE8WHctYzb5vDgekq3Z6X');

  umi.use(keypairIdentity(payerSigner));

  // const asset: DigitalAsset = await fetchDigitalAsset(umi, mint);
  // const [assetA] = await fetchAllDigitalAsset(umi, [mint]);
  const asset = await fetchDigitalAssetWithAssociatedToken(umi, mint, owner);

  console.log(asset);
}

main().then(() => {
  console.log("Done.");
}, err => {
  console.error(err);
});