import { Keypair, PublicKey, Signer } from "@solana/web3.js";
import { initGameState, sellNft } from "./core";
import { buildCfgPath, loadKeypairFromCfg, writeKeypairToFile } from "./utls";
import { DEFAULT_TOURNAMENT_CFG } from "./consts";

require("dotenv").config();

const gameStateKeypairCfg = 'gamestate-keypair.json';

async function init() {
    const walletKp: Keypair = await loadKeypairFromCfg(DEFAULT_TOURNAMENT_CFG);
    const walletSigner: Signer = Keypair.fromSecretKey(walletKp.secretKey);

    const gameStateKp = await loadKeypairFromCfg(gameStateKeypairCfg);
    const gameStateSigner = Keypair.fromSecretKey(gameStateKp.secretKey);

    // const gameStateKeypair = Keypair.generate();
    // writeKeypairToFile(gameStateKeypair.secretKey, gameStateKeypairCfg);

    await initGameState(gameStateSigner, walletSigner);
}

init().then(() => {
    console.log("Done.");
}, err => {
    console.error(err);
});