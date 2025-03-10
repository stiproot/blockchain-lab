import { IReq, ICmd } from './types';
import { Response } from 'express';
import { setup, transferNft, transferSol } from './core';

export const procSetupCmd = async (req: IReq<ICmd>, res: Response) => {
  console.info(`procSetupCmd START.`);

  const { name, noTokens }: { name: string, noTokens: number } = req.body.cmdData;
  await setup(name, noTokens);

  console.info(`procSetupCmd END.`);
  res.status(200).send('OK');
};

export const procTransferSol = async (req: IReq<ICmd>, res: Response) => {
  console.info(`procTransferSol START.`);

  const { amount }: { amount: number } = req.body.cmdData;
  await transferSol(amount);

  console.info(`procTransferSol END.`);
  res.status(200).send('OK');
};

export const procTransferNft = async (req: IReq<ICmd>, res: Response) => {
  console.info(`procTransferNft START.`);

  const { destinationPubKey, mintPubKey }: { destinationPubKey: string, mintPubKey: string } = req.body.cmdData;
  await transferNft(destinationPubKey, mintPubKey);

  console.info(`procTransferNft END.`);
  res.status(200).send('OK');
};