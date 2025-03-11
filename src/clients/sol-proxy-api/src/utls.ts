import {
    Connection,
    Keypair as Web3Keypair,
} from '@solana/web3.js';
import { Keypair as UmiKeypair, Umi, createSignerFromKeypair, KeypairSigner } from '@metaplex-foundation/umi';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata'
import fs from 'mz/fs.js';
import os from 'os';
import path from 'path';
import yaml from 'yaml';
import { IKeys } from './types';


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

export function translateInstrKeyToSigner(umi: Umi, keys: IKeys): KeypairSigner {
    return createSignerFromKeypair(umi, umi.eddsa.createKeypairFromSecretKey(new Uint8Array(JSON.parse(keys.pk))));
}

// export function translateInstrKeyToSigner(umi: Umi, keys: IKeys) {
//     return createSignerFromKeypair(umi, umi.eddsa.createKeypairFromSecretKey(new Uint8Array(JSON.parse(keys.privKey))));
// }

export const createConn = () => new Connection('http://127.0.0.1:8899', 'confirmed');
export const createDevConn = () => new Connection('https://api.devnet.solana.com', 'confirmed');

export const buildUmi = () => createUmi('http://127.0.0.1:8899').use(mplTokenMetadata());