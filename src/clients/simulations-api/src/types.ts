import { Request } from 'express';

export interface IReq<T> extends Request {
  body: T;
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
  noPlayers: number;
  useExisting: boolean;
  fundAccs: boolean;
}

export interface ISetupResp {
  tournament: IKeys;
}

export interface ICollisionInstr extends IInstr {
  tournament: IKeys;
  source: IKeys;
  dest: IKeys;
  mint: IKeys;
}

export interface IPopInstr extends IInstr {
  tournament: IKeys;
  source: IKeys;
  dest: IKeys;
  mint: IKeys;
}

export interface IEnterPlayerInstr extends IInstr {
  tournament: IKeys;
  dest: IKeys;
  mint: IKeys;
}

export interface IToken {
  owner: IKeys;
  mint: IKeys;
}