import express from "express";
import cors from "cors";
import { procSetupCmd, procCollisionCmd, procPopCmd } from "./cmds";
import { Request, Response } from 'express';

require("dotenv").config();

const BASE_URL = "/sim";
const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());

// CMDS...
app.post(`${BASE_URL}/cmd/setup`, express.json(), procSetupCmd);
app.post(`${BASE_URL}/cmd/collision`, express.json(), procCollisionCmd);
app.post(`${BASE_URL}/cmd/pop`, express.json(), procPopCmd);

// HEALTH...
app.get('/healthz', (req: Request, res: Response) => {
  res.status(200).send('OK');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
