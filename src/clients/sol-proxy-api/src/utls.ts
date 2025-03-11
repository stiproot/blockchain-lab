import {
    Connection,
    clusterApiUrl,
    Keypair as Web3Keypair,
    Cluster,
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

export const strToUint8Array = (str: string): Uint8Array => Uint8Array.from(JSON.parse(str));
export const uint8ArrayToStr = (arr: Uint8Array) => JSON.stringify(Array.from(arr));

export const readFileContent = async (filePath: string) => await fs.readFile(filePath, { encoding: 'utf8' });

export function createUmiKeypairFromSecretKey(umi: Umi, pk: Uint8Array): UmiKeypair {
    return umi.eddsa.createKeypairFromSecretKey(pk);
}

export async function createKeypairFromFile(filePath: string): Promise<Web3Keypair> {
    const pk = await readFileContent(filePath);
    const secretKey = strToUint8Array(pk);
    return Web3Keypair.fromSecretKey(secretKey);
}

export const buildCfgPath = (fileName: string): string => path.join(
    path.resolve('.', '.cfg'),
    fileName
);

export const buildTestWalletCfgName = (indx: number): string => `wallet-${indx}-keypair.json`;

export const loadKeypairFromCfg = async (fileName: string): Promise<Web3Keypair> => await createKeypairFromFile(buildCfgPath(fileName));

export async function loadDefaultWalletKeypair(): Promise<Web3Keypair> {
    const configYml = await readFileContent(SOL_CLI_CONFIG_PATH);
    const kpPath = await yaml.parse(configYml).keypair_path;
    const cliKp = await createKeypairFromFile(kpPath);
    return cliKp;
}

export async function buildWalletKeypair(umi: Umi): Promise<UmiKeypair> {
    const defaultKp: Web3Keypair = await loadDefaultWalletKeypair();
    const umiKp = createUmiKeypairFromSecretKey(umi, defaultKp.secretKey);
    return umiKp;
}

export function translateInstrKeyToSigner(umi: Umi, keys: IKeys): KeypairSigner {
    return createSignerFromKeypair(umi, createUmiKeypairFromSecretKey(umi, new Uint8Array(JSON.parse(keys.pk))));
}

export const getClusterUrl = (): string => clusterApiUrl(process.env.SOLNET as Cluster);

export const buildUmi = () => createUmi(getClusterUrl()).use(mplTokenMetadata());

export const createConn = () => new Connection(getClusterUrl(), 'confirmed');

export const range = (start: number, stop: number, step = 1) =>
    Array.from({ length: Math.ceil((stop - start) / step) }, (_, i) => start + i * step);