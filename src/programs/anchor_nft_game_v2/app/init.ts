import { Keypair, Signer } from "@solana/web3.js";
import { initGameState } from "./core";
import { loadKeypairFromCfg, loadKeypairFromToken } from "./utls";
import { DEFAULT_TOURNAMENT_CFG } from "./consts";

require("dotenv").config();

const GAMESTATE_CFG = 'gamestate-keypair.json';

async function init() {
    const walletKp: Keypair = await loadKeypairFromCfg(DEFAULT_TOURNAMENT_CFG);
    const walletSigner: Signer = Keypair.fromSecretKey(walletKp.secretKey);

    const gameStateKp = await loadKeypairFromCfg(GAMESTATE_CFG);
    const gameStateSigner = Keypair.fromSecretKey(gameStateKp.secretKey);

    const mint1Kp = await loadKeypairFromToken('1e11ce88-7c27-4b6f-b5f0-e8e42ac52357.json');
    const mint2Kp = await loadKeypairFromToken('8e7e8178-2539-43bc-a65a-2d726e8ed175.json');

    const initialNfts = [
        {
            nftId: mint1Kp.publicKey.toBase58(),
            owner: walletSigner.publicKey,
        },
        {
            nftId: mint2Kp.publicKey.toBase58(),
            owner: walletSigner.publicKey,
        },
    ];

    await initGameState(gameStateSigner, walletSigner, gameStateKp.publicKey.toBase58(), initialNfts);
}

init().then(() => {
    console.log("Done.");
}, err => {
    console.error(err);
});