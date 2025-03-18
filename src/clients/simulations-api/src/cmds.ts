import { Response } from 'express';
import { IReq, ICmd, ISetupInstr, ICollisionInstr, IPopInstr, IEnterPlayerInstr } from './types';
import { collision, enterPlayer, pop, setup } from './core';

export const procSetupCmd = async (req: IReq<ISetupInstr>, res: Response) => {
  console.info(`procSetupCmd START.`);
  console.debug(`instr`, req.body);

  const resp = await setup(req.body);

  console.info(`procSetupCmd END.`);
  res.status(200).json(resp);
};

export const procCollisionCmd = async (req: IReq<ICollisionInstr>, res: Response) => {
  console.info(`procCollisionCmd START.`);
  console.debug(`instr`, req.body);

  const resp = await collision(req.body);

  console.info(`procCollisionCmd END.`);
  res.status(200).json(resp);
};

export const procPopCmd = async (req: IReq<IPopInstr>, res: Response) => {
  console.info(`procPopCmd START.`);
  console.debug(`instr`, req.body);

  const resp = await pop(req.body);

  console.info(`procPopCmd END.`);
  res.status(200).json(resp);
};

export const procEnterPlayerCmd = async (req: IReq<IEnterPlayerInstr>, res: Response) => {
  console.info(`procEnterPlayerCmd START.`);
  console.debug(`instr`, req.body);

  const resp = await enterPlayer(req.body);

  console.info(`procEnterPlayerCmd END.`);
  res.status(200).json(resp);
};