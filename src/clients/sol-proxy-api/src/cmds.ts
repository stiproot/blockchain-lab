import { IReq, ICmd } from './types';
import { Response } from 'express';
import { }

export const procSetupCmd = async (req: IReq<ICmd>, res: Response) => {

  // const { id }: { userId: string } = req.body.cmdData;

  console.info("Processed cmd.");

  res.status(200).send('OK');
};

export const procCmd = async (req: IReq<ICmd>, res: Response) => {

  // const { id }: { userId: string } = req.body.cmdData;

  console.info("Processed cmd.");

  res.status(200).send('OK');
};