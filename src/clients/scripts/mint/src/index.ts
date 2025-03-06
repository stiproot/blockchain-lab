// import { createTokenWithMetadata } from "./mint";
import { Keypair as Web3Keypair, Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { loadWalletKeypair } from './utls';
import { buildUmi } from './factories';
import { createSignerFromKeypair, generateSigner, Keypair, keypairIdentity, percentAmount, Umi } from '@metaplex-foundation/umi';
import { fromWeb3JsPublicKey } from '@metaplex-foundation/umi-web3js-adapters';
import { createV1, TokenStandard } from '@metaplex-foundation/mpl-token-metadata';

async function buildWalletKeypair(umi: Umi): Promise<Keypair> {
  const payer: Web3Keypair = await loadWalletKeypair();
  const umiKeypair = umi.eddsa.createKeypairFromSecretKey(payer.secretKey);
  return umiKeypair;
}

// Example usage
async function main() {

  const umi = buildUmi();

  const walletKeypair = await buildWalletKeypair(umi);
  const payerSigner = createSignerFromKeypair(umi, walletKeypair);
  const mintAuthoritySigner = createSignerFromKeypair(umi, walletKeypair);

  umi.use(keypairIdentity(payerSigner));

  // const mint = findMintPda(umi, { programId: TokenProgram.publicKey });

  const mint = generateSigner(umi);

  await createV1(umi, {
    mint: mint,
    authority: mintAuthoritySigner,
    name: 'scorpion-nft',
    uri: "https://en.wikipedia.org/wiki/Scorpion_(Mortal_Kombat)#/media/File:ScorpionMortalKombatx.jpg",
    sellerFeeBasisPoints: percentAmount(5.5),
    tokenStandard: TokenStandard.NonFungible,
  }).sendAndConfirm(umi);
}

main().then(() => {
  console.log("Done.");
}, err => {
  console.error(err);
});