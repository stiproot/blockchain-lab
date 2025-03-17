import { Keypair, Signer } from "@solana/web3.js";
import { sellNft } from "./core";
import { loadKeypairFromCfg, loadKeypairFromToken } from "./utls";
import { DEFAULT_TOURNAMENT_CFG } from "./consts";

require("dotenv").config();

const GAMESTATE_CFG = 'gamestate-keypair.json';

async function init() {
    const walletKp: Keypair = await loadKeypairFromCfg(DEFAULT_TOURNAMENT_CFG);
    const walletSigner: Signer = Keypair.fromSecretKey(walletKp.secretKey);

    const gameStateKp = await loadKeypairFromCfg(GAMESTATE_CFG);
    const newOwnerKp = await loadKeypairFromCfg('wallet0-keypair.json');
    const mint1Kp = await loadKeypairFromToken('1e11ce88-7c27-4b6f-b5f0-e8e42ac52357.json');

    await sellNft(mint1Kp.publicKey.toBase58(), newOwnerKp.publicKey, gameStateKp.publicKey, walletSigner);
}

init().then(() => {
    console.log("Done.");
}, err => {
    console.error(err);
});