// import { createTokenWithMetadata } from "./mint";
import { Keypair, Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { loadWalletKeypair } from './utls';
import { buildUmi } from './factories';

// Example usage
async function main() {

  const umi = buildUmi();
}

main().then(() => {
  console.log("Done.");
}, err => {
  console.error(err);
});