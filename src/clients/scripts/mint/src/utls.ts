import {
    Connection,
    Keypair,
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

export async function createKeypairFromFile(filePath: string) {
    const secretKeyString = await fs.readFile(filePath, { encoding: 'utf8' });
    const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
    return Keypair.fromSecretKey(secretKey);
}

export async function loadKeypairCfg(fileName: string) {
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

export const createConn = () => new Connection('http://127.0.0.1:8899', 'confirmed');
export const createDevConn = () => new Connection('https://api.devnet.solana.com', 'confirmed');