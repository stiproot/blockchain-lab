import { PublicKey } from "@solana/web3.js";
import { createConn } from "./utls";

const connection = createConn();

const HISTORY = {};

// const accAddr = "DpHbbv3EK17ELC9XLDvLDSJCLLLP4Mb8ZFk9AuL9aQgA";
const accAddr = "7c9huCcxA1r9s3nJ1Bx3NJvbWegBThGadNWXu3ZP7ASM";
const accPk = new PublicKey(accAddr);

async function logAccTransactions() {

  console.log('------------------------------------------------------------')

  const signatures = await connection.getSignaturesForAddress(accPk, { limit: 5 });
  if (!signatures.length) {
    return console.log("No recent transactions found.");
  }

  for (const sig of signatures) {
    const txid = sig.signature;

    const tx = await connection.getTransaction(txid, { commitment: "confirmed", maxSupportedTransactionVersion: 0 });
    if (!tx || !tx.transaction) {
      console.log(`No transaction found with txid: ${txid}`);
      continue;
    }

    console.log(JSON.stringify(tx));

    // for (const statAccKey of tx.transaction.message.staticAccountKeys) {
    //   console.log(`static acc key: ${statAccKey.toBase58()}`);
    // }

    for (let i = 0; i < tx.meta!.preBalances.length; i++) {
      // console.log(JSON.stringify(tx.meta));
      // console.log(`PRE-BALANCE: ${tx.meta?.preBalances[i]}`, `POST-BALANCE: ${tx.meta?.postBalances[i]}`);
      // const amount: number = tx.meta!.preBalances[i] - tx.meta!.postBalances[i];
      // console.log(`AMOUNT: ${amount}`);
    }
  }
}

export async function accountInformation() {
  // connection.onAccountChange(accPk, async (accountInfo) => {
  //   console.log('📢 Wallet balance changed!', 'accountInfo', accountInfo, 'data', accountInfo.data.toJSON());
  // });
}

accountInformation().then(() => {
  console.log("Done.");
}, err => {
  console.error(err);
});

setInterval(async () => {
  console.log('------------------------------------------------------------')
  console.log('------------------------------------------------------------')
  console.log('------------------------------------------------------------')
  await logAccTransactions();
}, 7000);
