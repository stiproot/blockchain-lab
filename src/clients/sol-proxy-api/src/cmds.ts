import { IReq, ICmd, IInstruction } from './types';
import { Response } from 'express';
import { createAccounts, setup, transferNft, transferSol } from './core';

export const procSetupCmd = async (req: IReq<ICmd>, res: Response) => {
  console.info(`procSetupCmd START.`);

  const { name, noTokens }: { name: string, noTokens: number } = req.body.cmdData;
  const resp = await setup(name, noTokens);

  console.info(`procSetupCmd END.`);
  res.status(200).json(resp);
};

export const procCreateAccsCmd = async (req: IReq<ICmd>, res: Response) => {
  console.info(`procCreateAccsCmd START.`);

  const { noAccs }: { noAccs: number } = req.body.cmdData;
  const resp = await createAccounts(noAccs);

  console.info(`procCreateAccsCmd END.`);
  res.status(200).json(resp);
};

export const procTransferSol = async (req: IReq<ICmd>, res: Response) => {
  console.info(`procTransferSol START.`);

  const { instr }: { instr: IInstruction } = req.body.cmdData;
  const resp = await transferSol(instr);

  console.info(`procTransferSol END.`);
  res.status(200).json(resp);
};

export const procTransferNft = async (req: IReq<ICmd>, res: Response) => {
  console.info(`procTransferNft START.`);

  const { instr }: { instr: IInstruction } = req.body.cmdData;
  const resp = await transferNft(instr);

  console.info(`procTransferNft END.`);
  res.status(200).json(resp);
};