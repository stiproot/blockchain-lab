import { buildWalletKeypair, loadKeypairFromCfg } from './utls';
import { buildUmi } from './factories';
import { createSignerFromKeypair, keypairIdentity, publicKey } from '@metaplex-foundation/umi';
import { burnV1, TokenStandard } from '@metaplex-foundation/mpl-token-metadata';


async function main() {

  const umi = buildUmi();

  const walletKeypair = await buildWalletKeypair(umi);
  const payerSigner = createSignerFromKeypair(umi, walletKeypair);
  const mint = publicKey('GAyMwZFeNq2mcpBmnozgvwyy8J1vvwsZCe1rpDuY4KVN');

  const ownerWeb3Keypair = await loadKeypairFromCfg('tmp-keypair.json');
  const ownerKeypair = umi.eddsa.createKeypairFromSecretKey(ownerWeb3Keypair.secretKey);
  const ownerAuthority = createSignerFromKeypair(umi, ownerKeypair);

  umi.use(keypairIdentity(payerSigner));

  await burnV1(umi, {
    mint,
    authority: ownerAuthority,
    tokenOwner: ownerAuthority.publicKey,
    tokenStandard: TokenStandard.NonFungible,
  }).sendAndConfirm(umi);
}

main().then(() => {
  console.log("Done.");
}, err => {
  console.error(err);
});