import * as anchor from "@coral-xyz/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import { NftGame } from "./target/types/nft_game";

const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);
const program = anchor.workspace.NftGame as anchor.Program<NftGame>;

const gameStateKeypair = Keypair.generate();

async function sellNft(nftId: string, newOwner: PublicKey) {
    await program.rpc.sellNft(nftId, newOwner, {
        accounts: {
            gameState: gameStateKeypair.publicKey,
            signer: provider.wallet.publicKey,
        },
    });

    console.log(`NFT ${nftId} sold to ${newOwner.toBase58()}`);
}

async function burnNft(nftId: string) {
    await program.rpc.burnNft(nftId, {
        accounts: {
            gameState: gameStateKeypair.publicKey,
            signer: provider.wallet.publicKey,
        },
    });

    console.log(`NFT ${nftId} burned`);
}

sellNft().then(() => {
    console.log("Done.");
}, err => {
    console.error(err);
});