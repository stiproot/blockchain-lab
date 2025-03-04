import { Connection, Keypair, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import * as fs from "fs";

// 🔹 Load your keypair (generated from solana-cli)
const keypair = Keypair.fromSecretKey(
  new Uint8Array(JSON.parse(fs.readFileSync("~/.config/solana/id.json", "utf8")))
);

// 🔹 Define your smart contract (Program) Public Key
const PROGRAM_ID = new PublicKey("<<program-id>>");

// 🔹 Connect to Local Solana Cluster
const connection = new Connection("http://127.0.0.1:8899", "confirmed");

// 🔹 Function to interact with the smart contract
async function callSmartContract() {
  console.log("🔹 Connecting to Solana...");

  // 🏷️ Create a new transaction
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: keypair.publicKey,
      toPubkey: PROGRAM_ID,
      lamports: 1000000, // Example: Sending 0.001 SOL
    })
  );

  console.log("🔹 Sending Transaction...");

  // ✅ Send transaction
  const signature = await sendAndConfirmTransaction(connection, transaction, [keypair]);
  console.log("✅ Transaction Confirmed! Signature:", signature);
  console.log(`https://explorer.solana.com/tx/${signature}?cluster=custom`);
}

// 🔹 Run the function
callSmartContract().catch(console.error);