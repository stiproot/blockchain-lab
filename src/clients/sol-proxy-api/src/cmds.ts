import { Response } from 'express';
import { IReq, ITransferSolInstr, IBurnTokenInstr, ITransferTokenInstr, ICreateAccInstr, IMintTokenInstr, IMintTokensInstr, IInstr, ISubscribeEvt, ISubscribeAccInstr, IUnsubscribeAccInstr } from './types';
import { createAcc, transferToken, transferSol, burnToken, mintTokens, mintToken } from './core';
import { Subscriber } from './listeners';
import { SubStore } from './store';
import { HttpClient } from './http-client';

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

const subStore = new SubStore();
const httpClient = new HttpClient();

export const procSubscribeAccCmd = async (req: IReq<ISubscribeAccInstr>, res: Response) => {
  console.debug(`procSubscribeAccCmd START.`);
  console.debug(`instr`, req.body);

  const fn = async (evt: ISubscribeEvt) => {
    console.log('sub-evt', evt);
    evt.extId = req.body.extId;
    await httpClient.post(req.body.webhookUrl, evt);
  };

  const sub = new Subscriber(req.body.account, fn);
  subStore.addSub(req.body.account, sub.start());

  console.debug(`procSubscribeAccCmd END.`);
  res.status(200).json({});
};

export const procUnsubscribeAccCmd = async (req: IReq<IUnsubscribeAccInstr>, res: Response) => {
  console.debug(`procUnsubscribeAccCmd START.`);
  console.debug(`instr`, req.body);

  subStore.getSub(req.body.account)?.stop();
  subStore.removeSub(req.body.account);

  console.debug(`procUnsubscribeAccCmd END.`);
  res.status(200).json({});
};