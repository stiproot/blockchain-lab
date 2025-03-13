import express from "express";
import cors from "cors";
import { procQry } from "./qrys";
import { procSetupTournamentAccCmd, procTransferSolCmd, procBurnNftCmd, procTransferNftCmd, procMintNftsCmd, procCreateAccsCmd } from "./cmds";
import { Request, Response } from 'express';

require("dotenv").config();

const BASE_URL = "/sol";
const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());

// CMDS...
app.post(`${BASE_URL}/cmd/setup`, express.json(), procSetupTournamentAccCmd);
app.post(`${BASE_URL}/cmd/create-accs`, express.json(), procCreateAccsCmd);
app.post(`${BASE_URL}/cmd/transfer-sol`, express.json(), procTransferSolCmd);
app.post(`${BASE_URL}/cmd/transfer-nft`, express.json(), procTransferNftCmd);
app.post(`${BASE_URL}/cmd/burn-nft`, express.json(), procBurnNftCmd);
app.post(`${BASE_URL}/cmd/mint-nfts`, express.json(), procMintNftsCmd);

// QRYS...
app.post(`${BASE_URL}/qry`, express.json(), procQry);

// HEALTH...
app.get('/healthz', (req: Request, res: Response) => {
  res.status(200).send('OK');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
