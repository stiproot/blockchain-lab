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
  accountPk: string;
  senderPk: string;
  amtLamports: number;
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