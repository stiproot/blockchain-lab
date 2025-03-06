// import { createTokenWithMetadata } from "./mint";
import { Keypair, Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { loadWalletKeypair } from './utls';
import { buildUmi } from './factories';
import { createSignerFromKeypair } from '@metaplex-foundation/umi';
import { fromWeb3JsPublicKey } from '@metaplex-foundation/umi-web3js-adapters';

// Example usage
async function main() {

  const umi = buildUmi();

  const payer: Keypair = await loadWalletKeypair();

  const umiKeypair = umi.eddsa.createKeypairFromSecretKey(payer.secretKey);

  const payerSigner = createSignerFromKeypair(umi, umiKeypair);
  // const mintAuthoritySigner = createSignerFromKeypair(umi, mintAuthority);

  // umi.use(keypairIdentity(payerSigner));

  // Create a new mint
  // const mint = findMintPda(umi, { programId: TokenProgram.publicKey });
}

main().then(() => {
  console.log("Done.");
}, err => {
  console.error(err);
});