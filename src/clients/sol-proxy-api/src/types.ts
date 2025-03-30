import {
  Keypair as Web3Keypair
} from '@solana/web3.js';
import { KeypairSigner, Umi, Keypair as UmiKeypair } from '@metaplex-foundation/umi';
import { Request } from 'express';

export interface IReq<T> extends Request {
  body: T;
}

export interface IQry {
  qryData: any;
}

export interface ICmd {
  cmdData: any;
}

export interface IKeys {
  pk: string;
  sk: string | null;
}

export interface IInstr {
  id: string;
}

export interface IToken {
  owner: IKeys;
  mint: IKeys;
}

export interface IMintTokenInstr extends IInstr {
  payer: IKeys;
  owner: IKeys;
  name: string;
  uri: string;
}

export interface IMintTokensInstr extends IInstr {
  instrs: Array<IMintTokenInstr>;
}

export interface ITransferSolInstr extends IInstr {
  source: IKeys;
  dest: IKeys;
  amtLamports: number;
}

export interface ITransferTokenInstr extends IInstr {
  source: IKeys;
  dest: IKeys;
  mint: IKeys;
}

export interface IBurnTokenInstr extends IInstr {
  owner: IKeys;
  mint: IKeys;
}

export interface ICreateAccInstr extends IInstr {
  payer: IKeys;
  fundAcc: boolean;
  spaceBytes: number | null;
}

export interface ISubscribeAccInstr extends IInstr {
  accountPk: string;
  extId: number;
  status: number;
  webhookUrl: string;
  expirationTimestamp: number | null;
}

export interface IUnsubscribeAccInstr extends IInstr {
  accountPk: string;
}

export interface ISubscribeEvt {
  senderPk: string;
  accountPk: string;
  amtLamports: number;
  blockTime: number | null | undefined;
  feeLamports: number | undefined;
  computationalUnitsConsumed: number | undefined;
  signature: string;
  extId: number | null;
}

export interface IMemoInstr extends IInstr {
  sender: IKeys;
  payload: string;
}

export enum KeyType {
  WALLET,
  TOKEN,
}

export interface IKeypairHandle {
  w3Kp: Web3Keypair;
  umiKp: UmiKeypair;
  signer: KeypairSigner;
}

export interface IKeyStore {
  getKeypair(pubKey: IKeys, umi: Umi): Promise<IKeypairHandle>;
  loadWallets(): Promise<void>;
}

export interface IKeyStoreEntry {
  name: string;
  pk: string;
  sk: string;
}

export interface ISubscriber {
  subscriptionId: number | null;
  start(): ISubscriber;
  stop(): void;
}

export interface ISubStore {
  loadSubs(): Promise<void>;
  getSub(key: string): ISubscriber | null;
  addSub(instr: ISubscribeAccInstr, sub: ISubscriber): Promise<void>;
  removeSub(instr: IUnsubscribeAccInstr): void;
}