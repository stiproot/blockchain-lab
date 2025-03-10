import { buildWalletKeypair } from './utls';
import { buildUmi } from './factories';
import { createSignerFromKeypair, keypairIdentity, publicKey } from '@metaplex-foundation/umi';
import { fetchDigitalAssetWithAssociatedToken, TokenStandard, transferV1 } from '@metaplex-foundation/mpl-token-metadata';


async function main() {

  const umi = buildUmi();

  const walletKeypair = await buildWalletKeypair(umi);
  const payerSigner = createSignerFromKeypair(umi, walletKeypair);

  const mint = publicKey('GAyMwZFeNq2mcpBmnozgvwyy8J1vvwsZCe1rpDuY4KVN');

  // wallet...
  const currentOwner = publicKey('4cCksob3hnM1a8J16jRU3E1UE8WHctYzb5vDgekq3Z6X');
  const newOwner = publicKey('8Ht66RCXxrh5JwYLNTNKWx6frNdVMxroThiH5Wmvmvju');

  umi.use(keypairIdentity(payerSigner));

  await transferV1(umi, {
    mint,
    authority: payerSigner,
    tokenOwner: currentOwner,
    destinationOwner: newOwner,
    tokenStandard: TokenStandard.NonFungible,
  }).sendAndConfirm(umi);

  const asset = await fetchDigitalAssetWithAssociatedToken(umi, mint, newOwner);
  console.log(asset);
}

main().then(() => {
  console.log("Done.");
}, err => {
  console.error(err);
});