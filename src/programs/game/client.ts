import { buildUmi, buildWalletKeypair } from './utls';
import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);
const program = anchor.workspace.NftGame as anchor.Program<NftGame>;

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


main().then(() => {
  console.log("Done.");
}, err => {
  console.error(err);
});