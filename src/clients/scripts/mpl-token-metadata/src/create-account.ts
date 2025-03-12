import { Keypair, SystemProgram, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import { createConn, loadDefaultWalletKeypair, loadKeypairFromCfg } from "./utls";

const connection = createConn();
// const newAccount = Keypair.generate();

export async function createAccount() {
  const walletKeypair = await loadDefaultWalletKeypair();
  const lamports = await connection.getMinimumBalanceForRentExemption(0); // Get rent-exempt amount

  const newAccount = await loadKeypairFromCfg('lt1-keypair.json');
  console.log("New Account Public Key:", newAccount.publicKey.toBase58());

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

