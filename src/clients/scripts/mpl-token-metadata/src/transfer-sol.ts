import { buildUmi, buildWalletKeypair } from './utls';
import { createSignerFromKeypair, generateSigner, keypairIdentity, sol } from '@metaplex-foundation/umi';
import { transferSol } from '@metaplex-foundation/mpl-toolbox';


async function main() {

  const umi = buildUmi();

  const walletKeypair = await buildWalletKeypair(umi);
  const payerSigner = createSignerFromKeypair(umi, walletKeypair);

  umi.use(keypairIdentity(payerSigner));

  const destination = generateSigner(umi);

  await transferSol(umi, {
    source: payerSigner,
    destination: destination.publicKey,
    amount: sol(1.3),
  }).sendAndConfirm(umi);
}

main().then(() => {
  console.log("Done.");
}, err => {
  console.error(err);
});