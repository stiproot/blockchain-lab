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
  amount: number;
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
  useExisting: boolean;
  fundAcc: boolean;
}

export interface ISubscribeAccInstr extends IInstr {
  account: string;
}

export interface ISubscribeEvt {
  account: string;
  sender: string;
  amt: number;
}