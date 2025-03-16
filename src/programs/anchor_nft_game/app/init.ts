import { Keypair, PublicKey, Signer } from "@solana/web3.js";
import { initGameState, sellNft } from "./core";
import { buildCfgPath, loadKeypairFromCfg, writeKeypairToFile } from "./utls";
import { DEFAULT_TOURNAMENT_CFG } from "./consts";

require("dotenv").config();

async function init() {
    const gameStateKeypair = Keypair.generate();

    writeKeypairToFile(gameStateKeypair.secretKey, 'gamestate');

    const walletKp: Keypair = await loadKeypairFromCfg(buildCfgPath(DEFAULT_TOURNAMENT_CFG));
    const walletSigner: Signer = Keypair.fromSecretKey(walletKp.secretKey);

    await initGameState(gameStateKeypair, walletSigner);
}

init().then(() => {
    console.log("Done.");
}, err => {
    console.error(err);
});