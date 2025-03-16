import { PublicKey } from "@solana/web3.js";
import { createConn } from "./utls";

require("dotenv").config();

const WATCHED_WALLET = new PublicKey(process.env.WALLET_ADDRESS!);
const connection = createConn();
let subscriptionId: number | null = null;

export const startListener = () => {
  if (subscriptionId !== null) {
    return; // Prevent duplicate listeners
  }

  subscriptionId = connection.onAccountChange(WATCHED_WALLET, async (accountInfo) => {
    console.log("📢 Wallet balance changed!", accountInfo);

    // Fetch latest transaction to determine sender
    // const transactions = await connection.getConfirmedSignaturesForAddress2(WATCHED_WALLET, { limit: 1 });

    // let asset = await fetchDigitalAssetWithAssociatedToken(umi, mintSigner.publicKey, walletUmiKp.publicKey);

    // if (!transactions.length) {
    //   return;
    // }

    // const txid = transactions[0].signature;
    // const tx = await connection.getTransaction(txid, { commitment: "confirmed" });
    // if (!tx || !tx.transaction) {
    //   return;
    // }

    // const sender = tx.transaction.message.accountKeys[0].toBase58();
    // const newBalance = accountInfo.lamports / 1e9; // Convert lamports to SOL

    // console.log(`💰 SOL received from: ${sender}, New Balance: ${newBalance}`);

    // // Send data to backend API
    // // await notifyBackend({ txid, sender, newBalance });
    // console.log('startListener', 'tx', tx);
  });

  console.log("✅ Solana account listener started.");
};

export const stopListener = () => {
  if (subscriptionId !== null) {
    connection.removeAccountChangeListener(subscriptionId);
    subscriptionId = null;
    console.log("🛑 Solana account listener stopped.");
  }
};
