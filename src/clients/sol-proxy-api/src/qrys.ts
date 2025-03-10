import { buildQry } from "./qry.builder";
import { Response } from 'express';
import { IReq, IQry } from './types';

export const procQry = async (req: IReq<IQry>, res: Response) => {
  try {
    console.log("Processing projs qry request...", req.body);
    res.json({});
  } catch (error) {
    console.error("Process qry request error:", error);
    res.status(500).json({ error: "Error processing query." });
  }
};