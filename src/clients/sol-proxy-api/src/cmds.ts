import { IReq, ICmd } from './types';
import { Response } from 'express';
import { setup } from './core';

export const procSetupCmd = async (req: IReq<ICmd>, res: Response) => {
  console.info(`procSetupCmd START.`);

  const { name, noTokens }: { name: string, noTokens: number } = req.body.cmdData;
  await setup(name, noTokens);

  console.info(`procSetupCmd END.`);
  res.status(200).send('OK');
};

export const procCmd = async (req: IReq<ICmd>, res: Response) => {

  // const { id }: { userId: string } = req.body.cmdData;

  console.info("Processed cmd.");

  res.status(200).send('OK');
};