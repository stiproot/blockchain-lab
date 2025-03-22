import { PublicKey } from "@solana/web3.js";
import { createConn } from "./utls";

require("dotenv").config();

const WATCHED_WALLET = new PublicKey(process.env.WALLET_ADDRESS!);
const connection = createConn();
let subscriptionId: number | null = null;

export const startListener = async () => {
  if (subscriptionId !== null) {
    return; // Prevent duplicate listeners
  }

  subscriptionId = connection.onAccountChange(WATCHED_WALLET, async (accountInfo) => {
    console.log('📢 Wallet balance changed!', 'accountInfo', accountInfo, 'data', accountInfo.data.toJSON());

    const signatures = await connection.getSignaturesForAddress(WATCHED_WALLET, { limit: 1 });
    if (!signatures.length) return console.log("⚠️ No recent transactions found.");

    const txid = signatures[0].signature;
    const tx = await connection.getTransaction(txid, { commitment: "confirmed" });

    if (tx && tx.transaction) {
      const sender = tx.transaction.message.accountKeys[0].toBase58();
      const amount = (tx.meta!.preBalances[0] - tx.meta!.postBalances[0]) / 1e9; // Convert lamports to SOL
      console.log(`💰 SOL received! Sender: ${sender}, Amount: ${amount} SOL, TxID: ${txid}`);
    }
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
