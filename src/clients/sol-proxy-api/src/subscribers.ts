import { Connection, PublicKey } from "@solana/web3.js";
import { createConn, mapEvtFromTx } from "./utls";
import { ISubscribeEvt, ISubscriber } from "./types";

require("dotenv").config();


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
        return console.warn("No recent transactions found.");
      }

      const txid = signatures[0].signature;
      const tx = await this._connection.getTransaction(txid, { commitment: "confirmed", maxSupportedTransactionVersion: 0 });
      if (!tx || !tx.transaction) {
        return console.warn(`No transactions found with txid ${txid}.`);
      }

      let evt: ISubscribeEvt = mapEvtFromTx(tx);

      if (!this._fn) {
        return console.warn("No webhook callback function provided.");
      }

      console.debug(`SOL received! Sender: ${evt.senderPk}, Amount: ${evt.amtLamports} Lamports, TxID: ${txid}`);
      await this._fn(evt);
    });

    return this;
  }

  stop(): void {
    this._connection.removeAccountChangeListener(this.subscriptionId!);
    this.subscriptionId = null;
    console.log(`Solana account listener ${this._account.toBase58()} stopped.`);
  }
}