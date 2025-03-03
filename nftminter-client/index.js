import { 
  Connection, 
  Keypair, 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  sendAndConfirmTransaction 
} from "@solana/web3.js";
import * as fs from "fs";
import * as bs58 from "bs58";
import dotenv from "dotenv";

dotenv.config();

// Load wallet keypair from a local file
const WALLET_PATH = process.env.WALLET_PATH || "~/.config/solana/id.json";
const walletSecret = JSON.parse(fs.readFileSync(WALLET_PATH, "utf-8"));
const payer = Keypair.fromSecretKey(Uint8Array.from(walletSecret));

// Connect to Solana
const connection = new Connection("http://127.0.0.1:8899", "confirmed");

// Your deployed NFT Minter Program ID
const PROGRAM_ID = new PublicKey("BmPaWM5LC3TevKTuien6cdjmx6hrfDEjSRbn4KRFbqGV"); // Replace with your actual program ID

// Mint NFT by calling the on-chain program
const mintNFT = async () => {
  console.log("🔹 Calling NFT Minter Program...");

  // Create a new transaction
  let transaction = new Transaction().add(
      new SystemProgram({
          programId: PROGRAM_ID, // Calls your smart contract
          keys: [
              { pubkey: payer.publicKey, isSigner: true, isWritable: true }, // Payer
          ],
          data: Buffer.from([]), // Add any instruction data needed
      })
  );

  // Send transaction
  const signature = await sendAndConfirmTransaction(connection, transaction, [payer]);
  console.log(`✅ NFT Minted Successfully! 🎉 Transaction: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
};

// Run the function
mintNFT().catch(console.error);