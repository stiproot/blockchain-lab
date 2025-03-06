import {
    getAssociatedTokenAddress,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import {
    Keypair,
    SystemProgram,
    SYSVAR_RENT_PUBKEY,
    TransactionInstruction,
    Transaction,
    sendAndConfirmTransaction,
    PublicKey,
} from '@solana/web3.js';
import {
    loadKeypairCfg,
    loadWalletKeypair,
    createConn,
    createDevConn
} from './utls.js';
import * as borsh from "borsh";

class BurnCircleInstruction {
    burn_circle_name;
    number_of_tokens;

    constructor(burnCircleName, noTokens) {
        this.burn_circle_name = burnCircleName;
        this.number_of_tokens = noTokens;
    }
}

function buildInstructionData(name, noTokens) {
    const schema = new Map([
        [BurnCircleInstruction, { kind: "struct", fields: [["burn_circle_name", "string"], ["number_of_tokens", "u64"]] }]
    ]);

    const instructionData = new BurnCircleInstruction(name, noTokens);
    const serializedData = Buffer.from(borsh.serialize(schema, instructionData));

    return serializedData;
}

export async function main() {
    const connection = createDevConn();

    const walletKeypair = await loadWalletKeypair();
    const programKeypair = await loadKeypairCfg('mint_nfts-keypair.json');
    const programId = programKeypair.publicKey;

    const mintKeypair = Keypair.generate();
    const tokenAddress = await getAssociatedTokenAddress(
        mintKeypair.publicKey,
        walletKeypair.publicKey
    );

    console.log(`Program ID: ${programId.toBase58()}`);

    const accounts = [
        // Mint account
        {
            pubkey: mintKeypair.publicKey,
            isSigner: true,
            isWritable: true,
        },
        // Token account
        {
            pubkey: tokenAddress,
            isSigner: false,
            isWritable: true,
        },
        // Mint Authority
        {
            pubkey: walletKeypair.publicKey,
            isSigner: true,
            isWritable: false,
        },
        // Rent account
        {
            pubkey: SYSVAR_RENT_PUBKEY,
            isSigner: false,
            isWritable: false,
        },
        // System program
        {
            pubkey: SystemProgram.programId,
            isSigner: false,
            isWritable: false,
        },
        // Token program
        {
            pubkey: TOKEN_PROGRAM_ID,
            isSigner: false,
            isWritable: false,
        },
        // Associated token program
        {
            pubkey: ASSOCIATED_TOKEN_PROGRAM_ID,
            isSigner: false,
            isWritable: false,
        },
    ];

    const instructionData = buildInstructionData("ring-of-fire", 5);

    const instruction = new TransactionInstruction({
        keys: accounts,
        programId: programId,
        data: instructionData
    });

    await sendAndConfirmTransaction(
        connection,
        new Transaction().add(instruction),
        [walletKeypair, mintKeypair],
    );

    console.log(`New token: ${mintKeypair.publicKey}`);
}

main().then(
    () => process.exit(),
    err => {
        console.error(err);
        process.exit(-1);
    },
);