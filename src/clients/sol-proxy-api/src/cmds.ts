import { Response } from 'express';
import { IReq, ICmd, ITransferSolInstr, IBurnTokenInstr, ITransferTokenInstr, ICreateAccInstr, IMintTokenInstr, IMintTokensInstr } from './types';
import { createAcc, transferToken, transferSol, burnToken, mintTokens, mintToken } from './core';

export const procTransferSolCmd = async (req: IReq<ICmd>, res: Response) => {
  console.info(`procTransferSolCmd START.`);

  const { instr }: { instr: ITransferSolInstr } = req.body.cmdData;
  console.log(`instr`, instr);

  const resp = await transferSol(instr);

  console.info(`procTransferSolCmd END.`);
  res.status(200).json(resp);
};

export const procTransferTokenCmd = async (req: IReq<ICmd>, res: Response) => {
  console.info(`procTransferTokenCmd START.`);

  const { instr }: { instr: ITransferTokenInstr } = req.body.cmdData;
  console.log(`instr`, instr);

  const resp = await transferToken(instr);

  console.info(`procTransferTokenCmd END.`);
  res.status(200).json(resp);
};

export const procBurnTokenCmd = async (req: IReq<ICmd>, res: Response) => {
  console.info(`procBurnTokenCmd START.`);

  const { instr }: { instr: IBurnTokenInstr } = req.body.cmdData;
  console.log(`instr`, instr);

  const resp = await burnToken(instr);

  console.info(`procBurnTokenCmd END.`);
  res.status(200).json(resp);
};

export const procMintTokenCmd = async (req: IReq<ICmd>, res: Response) => {
  console.info(`procMintTokenCmd START.`);

  const { instr }: { instr: IMintTokenInstr } = req.body.cmdData;
  console.log(`instr`, instr);

  const resp = await mintToken(instr);

  console.info(`procMintTokenCmd END.`);
  res.status(200).json(resp);
};

export const procMintTokensCmd = async (req: IReq<ICmd>, res: Response) => {
  console.info(`procMintTokensCmd START.`);

  const { instr }: { instr: IMintTokensInstr } = req.body.cmdData;
  console.log(`instr`, instr);

  const resp = await mintTokens(instr);

  console.info(`procMintTokensCmd END.`);
  res.status(200).json(resp);
};

export const procCreateAccCmd = async (req: IReq<ICmd>, res: Response) => {
  console.info(`procSetupAccCmd START.`);

  const { instr }: { instr: ICreateAccInstr } = req.body.cmdData;
  console.log(`instr`, instr);

  const resp = await createAcc(instr);

  console.info(`procSetupAccCmd END.`);
  res.status(200).json(resp);
};