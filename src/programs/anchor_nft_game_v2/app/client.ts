import { Keypair, PublicKey, Signer } from "@solana/web3.js";
import { sellNft } from "./core";
import { buildCfgPath, loadKeypairFromCfg } from "./utls";
import { DEFAULT_TOURNAMENT_CFG } from "./consts";

require("dotenv").config();

const gameStateKeypair = Keypair.generate();

async function main() {
    const nftId = process.env.NFT_ID!;
    const newOwner = new PublicKey(process.env.NEW_OWNER_ID);
    const walletKp: Keypair = await loadKeypairFromCfg(buildCfgPath(DEFAULT_TOURNAMENT_CFG));
    const walletSigner: Signer = Keypair.fromSecretKey(walletKp.secretKey);

    await sellNft(nftId, newOwner, gameStateKeypair.publicKey, walletSigner);
}

main().then(() => {
    console.log("Done.");
}, err => {
    console.error(err);
});