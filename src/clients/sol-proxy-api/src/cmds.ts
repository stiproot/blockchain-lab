import { Response } from 'express';
import { IReq, ICmd, ISetupTournamentAccInstr, ICreateAccsInstr, ITransferSolInstr, ITransferNftInstr, IBurnNftInstr, IMintNftsInstr } from './types';
import { createAccs, transferNft, transferSol, burnNft, mintNfts, setupTournamentAcc } from './core';

export const procSetupTournamentAccCmd = async (req: IReq<ICmd>, res: Response) => {
  console.info(`procSetupTournamentCmd START.`);

  const { instr }: { instr: ISetupTournamentAccInstr } = req.body.cmdData;
  console.log(`instr`, instr);

  const resp = await setupTournamentAcc(instr);

  console.info(`procSetupTournamentCmd END.`);
  res.status(200).json(resp);
};

export const procCreateAccsCmd = async (req: IReq<ICmd>, res: Response) => {
  console.info(`procSetupAccsCmd START.`);

  const { instr }: { instr: ICreateAccsInstr } = req.body.cmdData;
  console.log(`instr`, instr);

  const resp = await createAccs(instr);

  console.info(`procSetupAccsCmd END.`);
  res.status(200).json(resp);
};

export const procTransferSolCmd = async (req: IReq<ICmd>, res: Response) => {
  console.info(`procTransferSol START.`);

  const { instr }: { instr: ITransferSolInstr } = req.body.cmdData;
  console.log(`instr`, instr);

  const resp = await transferSol(instr);

  console.info(`procTransferSol END.`);
  res.status(200).json(resp);
};

export const procTransferNftCmd = async (req: IReq<ICmd>, res: Response) => {
  console.info(`procTransferNft START.`);

  const { instr }: { instr: ITransferNftInstr } = req.body.cmdData;
  console.log(`instr`, instr);

  const resp = await transferNft(instr);

  console.info(`procTransferNft END.`);
  res.status(200).json(resp);
};

export const procBurnNftCmd = async (req: IReq<ICmd>, res: Response) => {
  console.info(`procBurnNft START.`);

  const { instr }: { instr: IBurnNftInstr } = req.body.cmdData;
  console.log(`instr`, instr);

  const resp = await burnNft(instr);

  console.info(`procBurnNft END.`);
  res.status(200).json(resp);
};

export const procMintNftsCmd = async (req: IReq<ICmd>, res: Response) => {
  console.info(`procMintNftsCmd START.`);

  const { instr }: { instr: IMintNftsInstr } = req.body.cmdData;
  console.log(`instr`, instr);

  const resp = await mintNfts(instr);

  console.info(`procMintNftsCmd END.`);
  res.status(200).json(resp);
};