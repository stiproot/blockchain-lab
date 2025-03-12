import { buildUmi, buildWalletKeypair, loadKeypairFromCfg, translateWeb3ToUmiKeypair } from './utls';
import { createSignerFromKeypair, generateSigner, keypairIdentity, sol } from '@metaplex-foundation/umi';
import { transferSol } from '@metaplex-foundation/mpl-toolbox';


async function main() {

  const umi = buildUmi();

  const kp = await loadKeypairFromCfg('tournament-keypair.json');
  const umiKp = translateWeb3ToUmiKeypair(umi, kp);
  const signer = createSignerFromKeypair(umi, umiKp);

  umi.use(keypairIdentity(signer));

  console.log('pubkey', kp.publicKey.toBase58());
}

main().then(() => {
  console.log("Done.");
}, err => {
  console.error(err);
});