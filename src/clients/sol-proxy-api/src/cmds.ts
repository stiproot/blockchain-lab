import { Response } from 'express';
import { IReq, ITransferSolInstr, IBurnTokenInstr, ITransferTokenInstr, ICreateAccInstr, IMintTokenInstr, IMintTokensInstr, IInstr } from './types';
import { createAcc, transferToken, transferSol, burnToken, mintTokens, mintToken } from './core';

export const procTransferSolCmd = async (req: IReq<ITransferSolInstr>, res: Response) => {
  console.info(`procTransferSolCmd START.`);
  console.debug(`instr`, req.body);

  const resp = await transferSol(req.body);

  console.info(`procTransferSolCmd END.`);
  res.status(200).json(resp);
};

export const procTransferTokenCmd = async (req: IReq<ITransferTokenInstr>, res: Response) => {
  console.info(`procTransferTokenCmd START.`);
  console.debug(`instr`, req.body);

  const resp = await transferToken(req.body);

  console.info(`procTransferTokenCmd END.`);
  res.status(200).json(resp);
};

export const procBurnTokenCmd = async (req: IReq<IBurnTokenInstr>, res: Response) => {
  console.info(`procBurnTokenCmd START.`);
  console.debug(`instr`, req.body);

  const resp = await burnToken(req.body);

  console.info(`procBurnTokenCmd END.`);
  res.status(200).json(resp);
};

export const procMintTokenCmd = async (req: IReq<IMintTokenInstr>, res: Response) => {
  console.info(`procMintTokenCmd START.`);
  console.debug(`instr`, req.body);

  const resp = await mintToken(req.body);

  console.info(`procMintTokenCmd END.`);
  res.status(200).json(resp);
};

export const procMintTokensCmd = async (req: IReq<IMintTokensInstr>, res: Response) => {
  console.info(`procMintTokensCmd START.`);
  console.debug(`instr`, req.body);

  const resp = await mintTokens(req.body);

  console.info(`procMintTokensCmd END.`);
  res.status(200).json(resp);
};

export const procCreateAccCmd = async (req: IReq<ICreateAccInstr>, res: Response) => {
  console.info(`procCreateAccCmd START.`);
  console.debug(`instr`, req.body);

  const resp = await createAcc(req.body);

  console.info(`procCreateAccCmd END.`);
  res.status(200).json(resp);
};