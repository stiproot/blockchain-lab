import { Response } from 'express';
import { IReq, ITransferSolInstr, IBurnTokenInstr, ITransferTokenInstr, ICreateAccInstr, IMintTokenInstr, IMintTokensInstr, IInstr, ISubscribeEvt, ISubscribeAccInstr } from './types';
import { createAcc, transferToken, transferSol, burnToken, mintTokens, mintToken } from './core';
import { Subscriber } from './listeners';
import { SubStore } from './store';

const subStore = new SubStore();

export const procTransferSolCmd = async (req: IReq<ITransferSolInstr>, res: Response) => {
  console.debug(`procTransferSolCmd START.`);
  console.debug(`instr`, req.body);

  const resp = await transferSol(req.body);

  console.debug(`procTransferSolCmd END.`);
  res.status(200).json(resp);
};

export const procTransferTokenCmd = async (req: IReq<ITransferTokenInstr>, res: Response) => {
  console.debug(`procTransferTokenCmd START.`);
  console.debug(`instr`, req.body);

  const resp = await transferToken(req.body);

  console.debug(`procTransferTokenCmd END.`);
  res.status(200).json(resp);
};

export const procBurnTokenCmd = async (req: IReq<IBurnTokenInstr>, res: Response) => {
  console.debug(`procBurnTokenCmd START.`);
  console.debug(`instr`, req.body);

  const resp = await burnToken(req.body);

  console.debug(`procBurnTokenCmd END.`);
  res.status(200).json(resp);
};

export const procMintTokenCmd = async (req: IReq<IMintTokenInstr>, res: Response) => {
  console.debug(`procMintTokenCmd START.`);
  console.debug(`instr`, req.body);

  const resp = await mintToken(req.body);

  console.debug(`procMintTokenCmd END.`);
  res.status(200).json(resp);
};

export const procMintTokensCmd = async (req: IReq<IMintTokensInstr>, res: Response) => {
  console.debug(`procMintTokensCmd START.`);
  console.debug(`instr`, req.body);

  const resp = await mintTokens(req.body);

  console.debug(`procMintTokensCmd END.`);
  res.status(200).json(resp);
};

export const procCreateAccCmd = async (req: IReq<ICreateAccInstr>, res: Response) => {
  console.debug(`procCreateAccCmd START.`);
  console.debug(`instr`, req.body);

  const resp = await createAcc(req.body);

  console.debug(`procCreateAccCmd END.`);
  res.status(200).json(resp);
};

export const procSubscribeAccCmd = async (req: IReq<ISubscribeAccInstr>, res: Response) => {
  console.debug(`procCreateAccCmd START.`);
  console.debug(`instr`, req.body);

  const key = crypto.randomUUID();
  const fn = async (evt: ISubscribeEvt) => {
    console.log('sub-evt', evt);
  };

  const sub = new Subscriber(key, req.body.account, fn);
  subStore.addSub(key, sub.start());

  console.debug(`procCreateAccCmd END.`);
  res.status(200).json({});
};