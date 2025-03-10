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
  privKey: string;
}

export interface IInstruction {
  tournament: IKeys;
  source: IKeys;
  mint?: IKeys;
  dest?: IKeys;
  amount?: number;
}

export interface IToken {
  indx: number;
  owner?: IKeys;
  mint: IKeys;
}

export interface ISetupResp {
  tokens: Array<IToken>;
  tournament: IKeys;
}