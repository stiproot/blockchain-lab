import { buildUmi, loadKeypairFromCfg, createUmiKeypairFromSecretKey } from './utls';
import { createSignerFromKeypair, keypairIdentity } from '@metaplex-foundation/umi';

async function main() {
  const umi = buildUmi();
  const kp = await loadKeypairFromCfg('tournament-keypair.json');
  const umiKp = createUmiKeypairFromSecretKey(umi, kp.secretKey);
  const signer = createSignerFromKeypair(umi, umiKp);

  umi.use(keypairIdentity(signer));

  console.log('pubkey', kp.publicKey.toBase58());
}

main().then(() => {
  console.log("Done.");
}, err => {
  console.error(err);
});