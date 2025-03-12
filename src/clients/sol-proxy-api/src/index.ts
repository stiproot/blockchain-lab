import express from "express";
import cors from "cors";
import { procQry } from "./qrys";
import { procSetupAccsCmd, procSetupCmd, procTransferNft, procTransferSol, procBurnNft } from "./cmds";
import { Request, Response } from 'express';

require("dotenv").config();

const BASE_URL = "/sol";
const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());

// CMDS...
app.post(`${BASE_URL}/cmd/setup`, express.json(), procSetupCmd);
app.post(`${BASE_URL}/cmd/create-accs`, express.json(), procSetupAccsCmd);
app.post(`${BASE_URL}/cmd/transfer-sol`, express.json(), procTransferSol);
app.post(`${BASE_URL}/cmd/transfer-nft`, express.json(), procTransferNft);
app.post(`${BASE_URL}/cmd/burn-nft`, express.json(), procBurnNft);

// QRYS...
app.post(`${BASE_URL}/qry`, express.json(), procQry);

// HEALTH...
app.get('/healthz', (req: Request, res: Response) => {
  res.status(200).send('OK');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
