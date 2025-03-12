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

export interface ISetupInstr extends IInstr {
  name: string;
  noTokens: number;
  useExisting: boolean;
  fundAcc: boolean;
}

export interface ISetupAccsInstr extends IInstr {
  noAccs: number;
  useExisting: boolean;
  fundAccs: boolean;
}

export interface ISetupResp {
  tokens: Array<IToken>;
  tournament: IKeys;
}

export interface ITransferSolInstr extends IInstr {
  tournament: IKeys;
  source: IKeys;
  dest: IKeys;
  amount: number;
}

export interface ITransferNftInstr extends IInstr {
  tournament: IKeys;
  source: IKeys;
  dest: IKeys;
  mint: IKeys;
}

export interface IBurnNftInstr extends IInstr {
  tournament: IKeys;
  source: IKeys;
  mint: IKeys;
}


export interface IToken {
  indx: number;
  owner?: IKeys;
  mint: IKeys;
}