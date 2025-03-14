import { Response } from 'express';
import { IReq, ICmd, ISetupInstr, ICollisionInstr, IPopInstr, IEnterPlayerInstr } from './types';
import { collision, enterPlayer, pop, setup } from './core';

export const procSetupCmd = async (req: IReq<ICmd>, res: Response) => {
  console.info(`procSetupCmd START.`);

  const { instr }: { instr: ISetupInstr } = req.body.cmdData;
  console.log(`instr`, instr);

  const resp = await setup(instr);

  console.info(`procSetupCmd END.`);
  res.status(200).json(resp);
};

export const procCollisionCmd = async (req: IReq<ICmd>, res: Response) => {
  console.info(`procCollisionCmd START.`);

  const { instr }: { instr: ICollisionInstr } = req.body.cmdData;
  console.log(`instr`, instr);

  const resp = await collision(instr);

  console.info(`procCollisionCmd END.`);
  res.status(200).json(resp);
};

export const procPopCmd = async (req: IReq<ICmd>, res: Response) => {
  console.info(`procPopCmd START.`);

  const { instr }: { instr: IPopInstr } = req.body.cmdData;
  console.log(`instr`, instr);

  const resp = await pop(instr);

  console.info(`procPopCmd END.`);
  res.status(200).json(resp);
};

export const procEnterPlayerCmd = async (req: IReq<ICmd>, res: Response) => {
  console.info(`procEnterPlayerCmd START.`);

  const { instr }: { instr: IEnterPlayerInstr } = req.body.cmdData;
  console.log(`instr`, instr);

  const resp = await enterPlayer(instr);

  console.info(`procEnterPlayerCmd END.`);
  res.status(200).json(resp);
};