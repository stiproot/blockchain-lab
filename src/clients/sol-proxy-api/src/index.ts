import express from "express";
import cors from "cors";
import { procQry } from "./qrys";
import { procTransferSolCmd, procTransferTokenCmd, procBurnTokenCmd, procMintTokenCmd, procMintTokensCmd, procCreateAccCmd } from "./cmds";
import { Request, Response } from 'express';
import { startListener } from "./listeners";

require("dotenv").config();

const BASE_URL = "/sol";
const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());

// CMDS...
app.post(`${BASE_URL}/cmd/transfer-sol`, express.json(), procTransferSolCmd);
app.post(`${BASE_URL}/cmd/transfer-token`, express.json(), procTransferTokenCmd);
app.post(`${BASE_URL}/cmd/burn-token`, express.json(), procBurnTokenCmd);
app.post(`${BASE_URL}/cmd/mint-token`, express.json(), procMintTokenCmd);
app.post(`${BASE_URL}/cmd/mint-tokens`, express.json(), procMintTokensCmd);
app.post(`${BASE_URL}/cmd/create-acc`, express.json(), procCreateAccCmd);

// QRYS...
app.post(`${BASE_URL}/qry`, express.json(), procQry);

// HEALTH...
app.get('/healthz', (req: Request, res: Response) => {
  res.status(200).send('OK');
});

app.listen(PORT, () => {
  startListener();
  console.log(`Server is running on port ${PORT}`);
});
