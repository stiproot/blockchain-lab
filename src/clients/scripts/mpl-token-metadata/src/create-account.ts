import { Connection, clusterApiUrl, Keypair, SystemProgram, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import { loadDefaultWalletKeypair } from "./utls";

// 1. Connect to the Solana network (devnet/mainnet)
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");


// 2. Generate a new Keypair (this is your new account)
const newAccount = Keypair.generate();

console.log("New Account Public Key:", newAccount.publicKey.toBase58());

// 3. Fund the new account (send SOL from a funded wallet)
export async function createAccount() {

  const walletKeypair = await loadDefaultWalletKeypair();

  const lamports = await connection.getMinimumBalanceForRentExemption(0); // Get rent-exempt amount

  const transaction = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: walletKeypair.publicKey, // Funding wallet
      newAccountPubkey: newAccount.publicKey,
      lamports, // Minimum SOL needed
      space: 0, // Space required
      programId: SystemProgram.programId, // Assign to system program
    })
  );

  await sendAndConfirmTransaction(connection, transaction, [walletKeypair, newAccount]);
  console.log("Account created:", newAccount.publicKey.toBase58());
}

createAccount().then(() => {
  console.log("Done.");
}, err => {
  console.error(err);
});

