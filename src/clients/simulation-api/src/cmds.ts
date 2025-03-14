import { Response } from 'express';
import { IReq, ICmd, ISetupInstr, ICollisionInstr, IPopInstr } from './types';
import { collision, pop, setup } from './core';

export const procSetupCmd = async (req: IReq<ICmd>, res: Response) => {
  console.info(`procSetupCmd START.`);

  const { instr }: { instr: ISetupInstr } = req.body.cmdData;
  console.log(`instr`, instr);

  const resp = await setup(instr);

  console.info(`procSetupTournamentCmd END.`);
  res.status(200).json(resp);
};

export const procCollisionCmd = async (req: IReq<ICmd>, res: Response) => {
  console.info(`procTransferSol START.`);

  const { instr }: { instr: ICollisionInstr } = req.body.cmdData;
  console.log(`instr`, instr);

  const resp = await collision(instr);

  console.info(`procTransferSol END.`);
  res.status(200).json(resp);
};

export const procPopCmd = async (req: IReq<ICmd>, res: Response) => {
  console.info(`procTransferNft START.`);

  const { instr }: { instr: IPopInstr } = req.body.cmdData;
  console.log(`instr`, instr);

  const resp = await pop(instr);

  console.info(`procTransferNft END.`);
  res.status(200).json(resp);
};