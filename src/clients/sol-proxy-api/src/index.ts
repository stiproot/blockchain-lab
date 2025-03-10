import express from "express";
import cors from "cors";
import { procQry } from "./qrys";
import { procMintCmd } from "./cmds";
import { Request, Response } from 'express';

require("dotenv").config();

const BASE_URL = "/ui-api";
const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());

// CMDS...
app.post(`${BASE_URL}/cmd/mint`, express.json(), procMintCmd);

// QRYS...
app.post(`${BASE_URL}/qry`, express.json(), procQry);

// HEALTH...
app.get('/healthz', (req: Request, res: Response) => {
  res.status(200).send('OK');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
