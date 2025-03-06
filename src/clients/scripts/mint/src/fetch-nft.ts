// import { createTokenWithMetadata } from "./mint";
import { Keypair as Web3Keypair, Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { loadWalletKeypair } from './utls';
import { buildUmi } from './factories';
import { createSignerFromKeypair, generateSigner, Keypair, keypairIdentity, percentAmount, publicKey, Umi } from '@metaplex-foundation/umi';
import { createV1, DigitalAsset, fetchAllDigitalAsset, fetchDigitalAsset, TokenStandard } from '@metaplex-foundation/mpl-token-metadata';

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

  const mint = publicKey("GAyMwZFeNq2mcpBmnozgvwyy8J1vvwsZCe1rpDuY4KVN");

  umi.use(keypairIdentity(payerSigner));

  const asset: DigitalAsset = await fetchDigitalAsset(umi, mint);

  // const [assetA] = await fetchAllDigitalAsset(umi, [mint]);

  console.log(asset);
}

main().then(() => {
  console.log("Done.");
}, err => {
  console.error(err);
});