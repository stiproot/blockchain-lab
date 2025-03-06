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