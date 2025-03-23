import { Response, Request } from 'express';
import { IReq, ICmd, ISetupInstr, ICollisionInstr, IPopInstr, IPlayerBuyInInstr, ISubscribeEvt } from './types';
import { collision, enterPlayer, gameStateStore, playerBuyIn, pop, setup } from './core';

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

export const procPlayerBuyInCmd = async (req: IReq<IPlayerBuyInInstr>, res: Response) => {
  console.info(`procPlayerBuyIn START.`);
  console.debug(`instr`, req.body);

  const resp = await playerBuyIn(req.body);

  console.info(`procPlayerBuyIn END.`);
  res.status(200).json(resp);
};

export const procAccTransactionsCmd = async (req: IReq<ISubscribeEvt>, res: Response) => {
  console.info(`procAccTransactionsCmd START.`);
  console.debug(`instr`, req.body);

  await enterPlayer(req.body);

  console.info(`procAccTransactionsCmd END.`);
  res.status(200).json({});
};

export const procGameStateQry = async (req: Request, res: Response) => {
  console.info(`procGameStateQry START.`);
  const gameState = gameStateStore.getState();
  console.info(`procGameStateQry END.`);
  res.status(200).json(gameState);
};