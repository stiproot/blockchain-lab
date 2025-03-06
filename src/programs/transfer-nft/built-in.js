import {
    getAssociatedTokenAddress,
    createTransferCheckedInstruction,
} from '@solana/spl-token';
import {
    Connection,
    Keypair,
    PublicKey,
    Transaction,
    sendAndConfirmTransaction,
} from '@solana/web3.js';
import fs from 'mz/fs.js';
import os from 'os';
import path from 'path';
import yaml from 'yaml';


// Path to local Solana CLI config file.
const CONFIG_FILE_PATH = path.resolve(
    os.homedir(),
    '.config',
    'solana',
    'cli',
    'config.yml',
);

export async function createKeypairFromFile(filePath) {
    const secretKeyString = await fs.readFile(filePath, { encoding: 'utf8' });
    const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
    return Keypair.fromSecretKey(secretKey);
}

export async function loadKeypairCfg(fileName) {
    const keypair = await createKeypairFromFile(
        path.join(
            path.resolve('.', '.cfg'),
            fileName
        ));
    return keypair;
}

export async function loadWalletKeypair() {
    const configYml = await fs.readFile(CONFIG_FILE_PATH, { encoding: 'utf8' });
    const keypairPath = await yaml.parse(configYml).keypair_path;
    const walletKeypair = await createKeypairFromFile(keypairPath);
    return walletKeypair;
}

let createConn = () => new Connection('http://127.0.0.1:8899', 'confirmed');

export async function main() {

    const conn = createConn();
    console.log(`Successfully connected to Solana net.`);

    const walletKeypair = await loadWalletKeypair()
    const recipientKeypair = await loadKeypairCfg('recipient-keypair.json');
    const mintPublicKey = new PublicKey("9z7NcrGnb2a6tYTr7wLrs7ffhT2ADQxAsDEWEt8tANvM");

    const senderTokenAccount = await getAssociatedTokenAddress(mintPublicKey, walletKeypair.publicKey);
    const recipientTokenAccount = await getAssociatedTokenAddress(mintPublicKey, recipientKeypair.publicKey);

    const transferIx = createTransferCheckedInstruction(
        senderTokenAccount,
        mintPublicKey,
        recipientTokenAccount,
        walletKeypair.publicKey,
        1, // NFT Amount
        0  // Decimals (NFTs = 0)
    );

    // Execute Transaction
    const tx = new Transaction().add(transferIx);
    await sendAndConfirmTransaction(conn, tx, [walletKeypair]);
}

main().then(
    () => process.exit(),
    err => {
        console.error(err);
        process.exit(-1);
    },
);