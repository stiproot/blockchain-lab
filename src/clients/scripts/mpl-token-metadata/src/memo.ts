// import { createConn, loadDefaultWalletKeypair, loadKeypairFromCfg } from './utls';
// import { createSignerFromKeypair, generateSigner, keypairIdentity, sol } from '@metaplex-foundation/umi';
// import { transferSol } from '@metaplex-foundation/mpl-toolbox';
import { PublicKey, Transaction, sendAndConfirmTransaction, SystemProgram } from "@solana/web3.js";
import { createConn, loadDefaultWalletKeypair, loadKeypairFromCfg, loadKeypairFromToken } from "./utls";

require("dotenv").config();


async function main() {

  const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
  const connection = createConn();

  const sender = await loadDefaultWalletKeypair();
  const newOwner = await loadKeypairFromCfg('wallet0-keypair.json');
  const token = await loadKeypairFromToken('0b22149a-df30-4fd0-b444-373f2b41f0f2.json');

  // Load sender's keypair (Replace with your actual private key)
  // const sender = Keypair.fromSecretKey(bs58.decode("YOUR_PRIVATE_KEY_IN_BASE58"));

  // Define memo content (JSON payload for the virtual transaction)
  const memoContent = JSON.stringify({
    type: "virtual_transfer",
    nft_mint: token.publicKey.toBase58(),
    from: sender.publicKey.toBase58(),
    to: newOwner.publicKey.toBase58(),
    timestamp: Date.now(),
  });

  console.log('memoContent', memoContent);

  // Create a memo instruction
  // const memoInstruction = SystemProgram.transfer({
  //   fromPubkey: sender.publicKey,
  //   toPubkey: MEMO_PROGRAM_ID, // Memo Program ID
  //   lamports: 0, // No SOL transfer, just a memo
  // });

  const transaction = new Transaction().add({
    keys: [{ pubkey: sender.publicKey, isSigner: true, isWritable: false }],  // Add sender's public key as signer
    programId: MEMO_PROGRAM_ID,  // Memo program ID
    data: Buffer.from(memoContent, "utf-8"),  // The actual memo data as a Buffer
  });

  // Create a transaction and add the memo instruction
  // const transaction = new Transaction().add(
  //   memoInstruction,
  //   {
  //     keys: [{ pubkey: sender.publicKey, isSigner: true, isWritable: false }],
  //     programId: MEMO_PROGRAM_ID,
  //     data: Buffer.from(memoContent, "utf-8"),
  //   }
  // );

  const txid = await sendAndConfirmTransaction(connection, transaction, [sender]);
  console.log(`Transaction successful: https://explorer.solana.com/tx/${txid}?cluster=custom`);
}

main().then(() => {
  console.log("Done.");
}, err => {
  console.error(err);
});