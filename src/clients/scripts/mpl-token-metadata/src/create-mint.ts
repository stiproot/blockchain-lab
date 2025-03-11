import { buildUmi, buildWalletKeypair, loadKeypairFromCfg, translateWeb3ToUmiKeypair } from './utls';
import { createSignerFromKeypair, generateSigner, Keypair, keypairIdentity, percentAmount, Umi } from '@metaplex-foundation/umi';
import { createV1, mintV1, TokenStandard } from '@metaplex-foundation/mpl-token-metadata';


async function main() {

  const umi = buildUmi();

  // const walletKeypair = await buildWalletKeypair(umi);
  // const payerSigner = createSignerFromKeypair(umi, walletKeypair);
  // const mintAuthoritySigner = createSignerFromKeypair(umi, walletKeypair);
  // console.log('mint-authority-public-key:', mintAuthoritySigner.publicKey);

  const walletKp = await loadKeypairFromCfg('tournament-keypair.json');
  const walletUmiKp = translateWeb3ToUmiKeypair(umi, walletKp);
  const walletSigner = createSignerFromKeypair(umi, walletUmiKp);

  umi.use(keypairIdentity(walletSigner));

  const mint = generateSigner(umi);

  // Create the necessary accounts mint + token.
  await createV1(umi, {
    mint: mint,
    authority: walletSigner,
    name: 'scorpion-nft',
    uri: 'https://en.wikipedia.org/wiki/Scorpion_(Mortal_Kombat)#/media/File:ScorpionMortalKombatx.jpg',
    sellerFeeBasisPoints: percentAmount(5.5),
    tokenStandard: TokenStandard.NonFungible,
  }).sendAndConfirm(umi);

  // Mint tokne to wallet.
  await mintV1(umi, {
    mint: mint.publicKey,
    authority: walletSigner,
    amount: 1,
    tokenOwner: walletUmiKp.publicKey,
    tokenStandard: TokenStandard.NonFungible,
  }).sendAndConfirm(umi);
}

main().then(() => {
  console.log("Done.");
}, err => {
  console.error(err);
});