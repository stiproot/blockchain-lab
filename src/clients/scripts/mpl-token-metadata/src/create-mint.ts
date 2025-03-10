import { buildUmi, buildWalletKeypair } from './utls';
import { createSignerFromKeypair, generateSigner, Keypair, keypairIdentity, percentAmount, Umi } from '@metaplex-foundation/umi';
import { createV1, mintV1, TokenStandard } from '@metaplex-foundation/mpl-token-metadata';


async function main() {

  const umi = buildUmi();

  const walletKeypair = await buildWalletKeypair(umi);
  const payerSigner = createSignerFromKeypair(umi, walletKeypair);
  const mintAuthoritySigner = createSignerFromKeypair(umi, walletKeypair);
  console.log('mint-authority-public-key:', mintAuthoritySigner.publicKey);

  umi.use(keypairIdentity(payerSigner));

  const mint = generateSigner(umi);

  // Create the necessary accounts mint + token.
  await createV1(umi, {
    mint: mint,
    authority: mintAuthoritySigner,
    name: 'scorpion-nft',
    uri: 'https://en.wikipedia.org/wiki/Scorpion_(Mortal_Kombat)#/media/File:ScorpionMortalKombatx.jpg',
    sellerFeeBasisPoints: percentAmount(5.5),
    tokenStandard: TokenStandard.NonFungible,
  }).sendAndConfirm(umi);

  // Mint tokne to wallet.
  await mintV1(umi, {
    mint: mint.publicKey,
    authority: mintAuthoritySigner,
    amount: 1,
    tokenOwner: walletKeypair.publicKey,
    tokenStandard: TokenStandard.NonFungible,
  }).sendAndConfirm(umi);
}

main().then(() => {
  console.log("Done.");
}, err => {
  console.error(err);
});