import express from "express";
import cors from "cors";
import { procSetupCmd, procCollisionCmd, procPopCmd, procEnterPlayerCmd, procAccTransactionsCmd } from "./cmds";
import { Request, Response } from 'express';

require("dotenv").config();

const BASE_URL = "/sim";
const PORT = process.env.PORT || 3002;

const app = express();
app.use(cors(), express.json());

// CMDS...
app.post(`${BASE_URL}/cmd/setup`, procSetupCmd);
app.post(`${BASE_URL}/cmd/collision`, procCollisionCmd);
app.post(`${BASE_URL}/cmd/pop`, procPopCmd);
app.post(`${BASE_URL}/cmd/enter-player`, procEnterPlayerCmd);
app.post(`${BASE_URL}/web-hook/account-transactions`, procAccTransactionsCmd);

// HEALTH...
app.get('/healthz', (req: Request, res: Response) => {
  res.status(200).send('OK');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
