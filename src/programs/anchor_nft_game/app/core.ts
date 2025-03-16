import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Signer } from "@solana/web3.js";
import { NftGame } from "../target/types/nft_game";

const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);
const program = anchor.workspace.NftGame as anchor.Program<NftGame>;

export async function sellNft(
    nftId: string,
    newOwner: PublicKey,
    gameState: PublicKey,
    walletSigner: Signer
) {
    // await program.rpc.sellNft(nftId, newOwner, {
    //     accounts: {
    //         gameState: gameStateKeypair.publicKey,
    //         signer: provider.wallet.publicKey,
    //     },
    // });

    await program.methods
        .sellNft(nftId, newOwner)
        .accounts({
            gameState: gameState,
            signer: provider.wallet.publicKey,
        })
        // .signers([])
        .rpc();

    console.log(`NFT ${nftId} sold to ${newOwner.toBase58()}`);
}

export async function burnNft(nftId: string) {
    // await program.rpc.burnNft(nftId, {
    //     accounts: {
    //         gameState: gameStateKeypair.publicKey,
    //         signer: provider.wallet.publicKey,
    //     },
    // });

    await program.methods.burnNft(nftId).rpc();

    console.log(`NFT ${nftId} burned`);
}