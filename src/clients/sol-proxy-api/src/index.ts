import express from "express";
import cors from "cors";
import { procQry } from "./qrys";
import {
  procTransferSolCmd,
  procTransferTokenCmd,
  procBurnTokenCmd,
  procMintTokenCmd,
  procMintTokensCmd,
  procCreateAccCmd,
  procSubscribeAccCmd
} from "./cmds";
import { Request, Response } from 'express';
import { startListener } from "./global-listeners";

require("dotenv").config();

const BASE_URL = "/sol";
const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors(), express.json());

// CMDS...
app.post(`${BASE_URL}/cmd/transfer-sol`, procTransferSolCmd);
app.post(`${BASE_URL}/cmd/transfer-token`, procTransferTokenCmd);
app.post(`${BASE_URL}/cmd/burn-token`, procBurnTokenCmd);
app.post(`${BASE_URL}/cmd/mint-token`, procMintTokenCmd);
app.post(`${BASE_URL}/cmd/mint-tokens`, procMintTokensCmd);
app.post(`${BASE_URL}/cmd/create-acc`, procCreateAccCmd);
app.post(`${BASE_URL}/cmd/subscribe-acc`, procSubscribeAccCmd);

// QRYS...
app.post(`${BASE_URL}/qry`, express.json(), procQry);

// HEALTH...
app.get('/healthz', (req: Request, res: Response) => {
  res.status(200).send('OK');
});

app.listen(PORT, () => {
  // startListener();
  console.log(`Server is running on port ${PORT}`);
});
