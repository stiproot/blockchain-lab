import express, { NextFunction } from "express";
import cors from "cors";
import {
  procTransferSolCmd,
  procTransferTokenCmd,
  procBurnTokenCmd,
  procMintTokenCmd,
  procMintTokensCmd,
  procCreateAccCmd,
  procSubscribeAccCmd,
  procUnsubscribeAccCmd,
  procMemoCmd
} from "./cmds";
import { Request, Response } from 'express';
import { delSubsFromDir } from "./subscriber.store";

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
app.post(`${BASE_URL}/cmd/subscribe/acc-transactions`, procSubscribeAccCmd);
app.post(`${BASE_URL}/cmd/unsubscribe/acc-transactions`, procUnsubscribeAccCmd);
app.post(`${BASE_URL}/cmd/memo`, procMemoCmd);

// HEALTH...
app.get('/healthz', (req: Request, res: Response) => {
  res.status(200).send('OK');
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

const server = app.listen(PORT, () => {
  // startListener();
  console.log(`Server is running on port ${PORT}`);
});

// Graceful shutdown
const shutdown = () => {
  console.log("Shutting down server...");

  server.close(async () => {
    console.log("HTTP server closed.");
    await delSubsFromDir();
    process.exit(0);
  });

  // Force exit if server doesn't close in time
  setTimeout(() => {
    console.error("Forcefully shutting down...");
    process.exit(1);
  }, 5000);
};

process.on("SIGINT", shutdown);  // Ctrl+C in terminal
process.on("SIGTERM", shutdown); // Kub
