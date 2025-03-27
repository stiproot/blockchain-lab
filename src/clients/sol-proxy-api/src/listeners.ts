import { Connection, PublicKey } from "@solana/web3.js";
import { createConn } from "./utls";
import { ISubscribeEvt } from "./types";

require("dotenv").config();

export interface ISubscriber {
  subscriptionId: number | null;
  start(): ISubscriber;
  stop(): void;
}

export class Subscriber implements ISubscriber {
  private readonly _account: PublicKey;
  private readonly _connection: Connection;
  private readonly _fn: CallableFunction;

  public subscriptionId: number | null = null;

  constructor(
    account: string,
    fn: CallableFunction,
    connection: Connection | null = null
  ) {
    this._account = new PublicKey(account);
    this._fn = fn;
    this._connection = connection || createConn();
  }

  start(): ISubscriber {
    this.subscriptionId = this._connection.onAccountChange(this._account, async (accountInfo) => {
      console.log('📢 Wallet balance changed!', 'accountInfo', accountInfo, 'data', accountInfo.data.toJSON());

      const signatures = await this._connection.getSignaturesForAddress(this._account, { limit: 1 });
      if (!signatures.length) {
        return console.log("No recent transactions found.");
      }

      const txid = signatures[0].signature;
      const tx = await this._connection.getTransaction(txid, { commitment: "confirmed", maxSupportedTransactionVersion: 0 });
      if (tx && tx.transaction) {
        const sender = tx.transaction.message.staticAccountKeys[0].toBase58();
        // const amount = (tx.meta!.preBalances[0] - tx.meta!.postBalances[0]) / 1e9; // Convert lamports to SOL
        const amount: number = tx.meta!.preBalances[0] - tx.meta!.postBalances[0];

        console.log(`SOL received! Sender: ${sender}, Amount: ${amount} SOL, TxID: ${txid}`);

        if (this._fn) {
          await this._fn({
            sender: sender,
            amtLamports: amount,
            account: this._account.toBase58()
          } as ISubscribeEvt);
        }
      }
    });
    return this;
  }

  stop(): void {
    this._connection.removeAccountChangeListener(this.subscriptionId!);
    this.subscriptionId = null;
    console.log(`Solana account listener ${this._account.toBase58()} stopped.`);
  }
}