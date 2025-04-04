import { Response } from 'express';
import {
  IReq,
  ITransferSolInstr,
  IBurnTokenInstr,
  ITransferTokenInstr,
  ICreateAccInstr,
  IMintTokenInstr,
  IMintTokensInstr,
  ISubscribeAccInstr,
  IUnsubscribeAccInstr,
  IMemoInstr
} from './types';
import {
  createAcc,
  transferToken,
  transferSol,
  burnToken,
  mintTokens,
  mintToken,
  memo,
  registerAccSub,
  unregisterAccSub
} from './core';


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
  console.debug(`procSubscribeAccCmd START.`);
  console.debug(`instr`, req.body);

  await registerAccSub(req.body);

  console.debug(`procSubscribeAccCmd END.`);
  res.status(200).json({});
};

export const procUnsubscribeAccCmd = async (req: IReq<IUnsubscribeAccInstr>, res: Response) => {
  console.debug(`procUnsubscribeAccCmd START.`);
  console.debug(`instr`, req.body);

  unregisterAccSub(req.body);

  console.debug(`procUnsubscribeAccCmd END.`);
  res.status(200).json({});
};

export const procMemoCmd = async (req: IReq<IMemoInstr>, res: Response) => {
  console.debug(`procMemoCmd START.`);
  console.debug(`instr`, req.body);

  await memo(req.body);

  console.debug(`procMemoCmd END.`);
  res.status(200).json({});
};