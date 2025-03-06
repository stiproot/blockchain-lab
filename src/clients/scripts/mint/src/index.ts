// import { createTokenWithMetadata } from "./mint";
import { Keypair, Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { loadWalletKeypair } from './utls';

// Example usage
async function main() {
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
  const payer = Keypair.generate(); // In a real app, you'd load an existing keypair
  const mintAuthority = Keypair.generate(); // In a real app, you'd load an existing keypair

  // You would need to airdrop SOL to the payer before running this
  console.log('Payer public key:', payer.publicKey.toBase58());

  // const result = await createTokenWithMetadata(
  //   connection,
  //   payer,
  //   mintAuthority,
  //   'My Token',
  //   'MTK',
  //   'https://example.com/metadata.json',
  //   100
  // );

  // console.log('Token created with metadata:');
  // console.log('Mint address:', result.mintAddress);
  // console.log('Token account address:', result.tokenAddress);
  // console.log('Metadata address:', result.metadataAddress);
}

main().then(() => {
  console.log("Done.");
}, err => {
  console.error(err);
});