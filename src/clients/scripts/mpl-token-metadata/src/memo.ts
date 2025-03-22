import { PublicKey, Transaction, sendAndConfirmTransaction, SystemProgram } from "@solana/web3.js";
import { createConn, loadDefaultWalletKeypair, loadKeypairFromCfg, loadKeypairFromToken } from "./utls";

require("dotenv").config();


async function main() {

  const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
  const connection = createConn();

  const sender = await loadDefaultWalletKeypair();
  const newOwner = await loadKeypairFromCfg('wallet0-keypair.json');
  const token = await loadKeypairFromToken('0b22149a-df30-4fd0-b444-373f2b41f0f2.json');

  const memoContent = JSON.stringify({
    type: "VIRTUAL_TRANSFER",
    nft_mint: token.publicKey.toBase58(),
    seller: sender.publicKey.toBase58(),
    buyer: newOwner.publicKey.toBase58(),
    amt_paid_lamports: 13230000,
    timestamp: Date.now(),
  });

  console.log('memoContent', memoContent);

  const transaction = new Transaction().add({
    keys: [{ pubkey: sender.publicKey, isSigner: true, isWritable: false }],  // Add sender's public key as signer
    programId: MEMO_PROGRAM_ID,  // Memo program ID
    data: Buffer.from(memoContent, "utf-8"),  // The actual memo data as a Buffer
  });

  const txid = await sendAndConfirmTransaction(connection, transaction, [sender]);
  console.log(`Transaction successful: https://explorer.solana.com/tx/${txid}?cluster=custom`);
}

main().then(() => {
  console.log("Done.");
}, err => {
  console.error(err);
});