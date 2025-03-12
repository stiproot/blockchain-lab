import { Response } from 'express';
import { IReq, ICmd, ISetupInstr, ISetupAccsInstr, ITransferSolInstr, ITransferNftInstr, IBurnNftInstr } from './types';
import { setup, setupAccs, transferNft, transferSol, burnNft } from './core';

export const procSetupCmd = async (req: IReq<ICmd>, res: Response) => {
  console.info(`procSetupCmd START.`);

  const { instr }: { instr: ISetupInstr } = req.body.cmdData;
  const resp = await setup(instr);

  console.info(`procSetupCmd END.`);
  res.status(200).json(resp);
};

export const procSetupAccsCmd = async (req: IReq<ICmd>, res: Response) => {
  console.info(`procSetupAccsCmd START.`);

  const { instr }: { instr: ISetupAccsInstr } = req.body.cmdData;
  const resp = await setupAccs(instr);

  console.info(`procSetupAccsCmd END.`);
  res.status(200).json(resp);
};

export const procTransferSol = async (req: IReq<ICmd>, res: Response) => {
  console.info(`procTransferSol START.`);

  const { instr }: { instr: ITransferSolInstr } = req.body.cmdData;
  const resp = await transferSol(instr);

  console.info(`procTransferSol END.`);
  res.status(200).json(resp);
};

export const procTransferNft = async (req: IReq<ICmd>, res: Response) => {
  console.info(`procTransferNft START.`);

  const { instr }: { instr: ITransferNftInstr } = req.body.cmdData;
  const resp = await transferNft(instr);

  console.info(`procTransferNft END.`);
  res.status(200).json(resp);
};

export const procBurnNft = async (req: IReq<ICmd>, res: Response) => {
  console.info(`procBurnNft START.`);

  const { instr }: { instr: IBurnNftInstr } = req.body.cmdData;
  const resp = await burnNft(instr);

  console.info(`procBurnNft END.`);
  res.status(200).json(resp);
};