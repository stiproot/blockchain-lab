import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Signer } from "@solana/web3.js";
import { NftGame } from "../target/types/nft_game";

require("dotenv").config();

process.env.ACHOR_PROVIDER_URL = 'http://localhost:8899';
process.env.ANCHOR_WALLET = '.cfg.localnet/tournament-keypair.json';

const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);
const program = anchor.workspace.NftGame as anchor.Program<NftGame>;


export async function initGameState(
    gameStateSigner: Signer,
    walletSigner: Signer,
    gameId: string,
    initialNfts: Array<{ nftId: string; owner: PublicKey }>
) {

    const [gameStatePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("game_state"), Buffer.from(gameId)],
        program.programId
    );

    const i: any = {};

    await program.methods
        .initializeGameState(gameId, initialNfts)
        .accounts({
            gameState: gameStatePda,
            payer: walletSigner.publicKey,
        })
        .signers([walletSigner, gameStateSigner])
        .rpc();
}

// export async function sellNft(
//     nftId: string,
//     newOwner: PublicKey,
//     gameState: PublicKey,
//     walletSigner: Signer
// ) {
//     const [gameStatePda] = PublicKey.findProgramAddressSync(
//         [Buffer.from("game_state"), Buffer.from(gameId)],
//         program.programId
//     );

//     await program.methods
//         .sellNft(nftId, newOwner)
//         .accounts({
//             gameState: gameState,
//             signer: provider.wallet.publicKey,
//         })
//         .signers([walletSigner])
//         .rpc();

//     console.log(`NFT ${nftId} sold to ${newOwner.toBase58()}`);
// }

// export async function burnNft(nftId: string) {
//     // await program.rpc.burnNft(nftId, {
//     //     accounts: {
//     //         gameState: gameStateKeypair.publicKey,
//     //         signer: provider.wallet.publicKey,
//     //     },
//     // });

//     await program.methods
//         .burnNft(nftId)
//         .rpc();

//     console.log(`NFT ${nftId} burned`);
// }