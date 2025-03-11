import {
    Cluster,
    clusterApiUrl,
    Connection,
    Keypair as Web3Keypair,
} from '@solana/web3.js';
import { Keypair as UmiKeypair, Umi } from '@metaplex-foundation/umi';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata'
import fs from 'mz/fs.js';
import os from 'os';
import path from 'path';
import yaml from 'yaml';

require("dotenv").config();


const SOL_CLI_CONFIG_PATH = path.resolve(
    os.homedir(),
    '.config',
    'solana',
    'cli',
    'config.yml',
);

export async function createKeypairFromFile(filePath: string): Promise<Web3Keypair> {
    const secretKeyString = await fs.readFile(filePath, { encoding: 'utf8' });
    const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
    return Web3Keypair.fromSecretKey(secretKey);
}

export async function loadKeypairFromCfg(fileName: string): Promise<Web3Keypair> {
    return await createKeypairFromFile(
        path.join(
            path.resolve('.', '.cfg'),
            fileName
        ));
}

export async function loadDefaultWalletKeypair(): Promise<Web3Keypair> {
    const configYml = await fs.readFile(SOL_CLI_CONFIG_PATH, { encoding: 'utf8' });
    const keypairPath = await yaml.parse(configYml).keypair_path;
    const walletKeypair = await createKeypairFromFile(keypairPath);
    return walletKeypair;
}

export async function buildWalletKeypair(umi: Umi): Promise<UmiKeypair> {
    const payer: Web3Keypair = await loadDefaultWalletKeypair();
    const umiKeypair = umi.eddsa.createKeypairFromSecretKey(payer.secretKey);
    return umiKeypair;
}

export function translateWeb3ToUmiKeypair(umi: Umi, kp: Web3Keypair): UmiKeypair {
    return umi.eddsa.createKeypairFromSecretKey(kp.secretKey);
}

export function getClusterUrl(): string {
    if (process.env.SOLNET === 'localnet') {
        return 'http://localhost:8899';
    }

    if (process.env.SOLNET === 'alchemy') {
        return process.env.ALCHEMY_URL!;
    }

    if (process.env.SOLNET === 'helius') {
        return process.env.HELIUS_URL!;
    }

    return clusterApiUrl(process.env.SOLNET as Cluster);
}
export const buildUmi = () => createUmi(getClusterUrl()).use(mplTokenMetadata());
export const createConn = () => new Connection(getClusterUrl(), 'confirmed');