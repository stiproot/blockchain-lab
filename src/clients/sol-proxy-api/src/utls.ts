import {
    Connection,
    clusterApiUrl,
    Keypair as Web3Keypair,
    Cluster,
    PublicKey,
} from '@solana/web3.js';
import { Keypair as UmiKeypair, Umi, createSignerFromKeypair, KeypairSigner } from '@metaplex-foundation/umi';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata'
import fs from 'mz/fs.js';
import os from 'os';
import path from 'path';
import yaml from 'yaml';
import bs58 from 'bs58';
import { IKeys } from './types';
import { DEFAULT_NFT_URL, DEFAULT_TOURNAMENT_CFG, MEMO_PROGRAM_ID } from './consts';

const SOL_CLI_CONFIG_PATH = path.resolve(
    os.homedir(),
    '.config',
    'solana',
    'cli',
    'config.yml',
);

export const strToUint8Array = (str: string): Uint8Array => Uint8Array.from(JSON.parse(str));
export const uint8ArrayToStr = (arr: Uint8Array) => JSON.stringify(Array.from(arr));
export const strToPubKey = (str: string): PublicKey => new PublicKey(str);

export const readFileContent = async (filePath: string) => await fs.readFile(filePath, { encoding: 'utf8' });

export function createUmiKeypairFromSecretKey(umi: Umi, pk: Uint8Array): UmiKeypair {
    return umi.eddsa.createKeypairFromSecretKey(pk);
}

export async function createKeypairFromFile(filePath: string): Promise<Web3Keypair> {
    const pk = await readFileContent(filePath);
    const secretKey = strToUint8Array(pk);
    return Web3Keypair.fromSecretKey(secretKey);
}

export function buildCfgPath(fileName: string): string {
    const cfgDir = process.env.SOLNET === 'localnet' ? '.cfg.localnet' : '.cfg.devnet';
    return path.join(path.resolve('.', cfgDir), fileName);
}

export function buildTokenBasePath(): string {
    const cfgDir = process.env.SOLNET === 'localnet' ? '.cfg.localnet' : '.cfg.devnet';
    return path.resolve('.', cfgDir, '.tokens');
}

export function buildTokenPath(fileName: string): string {
    return path.join(buildTokenBasePath(), fileName);
}

export const buildTestWalletCfgName = (indx: number): string => `wallet${indx}-keypair.json`;

export const loadKeypairFromCfg = async (fileName: string): Promise<Web3Keypair> => await createKeypairFromFile(buildCfgPath(fileName));
export const loadKeypairFromToken = async (fileName: string): Promise<Web3Keypair> => await createKeypairFromFile(buildTokenPath(fileName));

export async function loadDefaultWalletKeypair(): Promise<Web3Keypair> {
    let kpPath = null;
    if (process.env.SOLNET === 'localnet') {
        const configYml = await readFileContent(SOL_CLI_CONFIG_PATH);
        kpPath = await yaml.parse(configYml).keypair_path;
    } else {
        kpPath = buildCfgPath(DEFAULT_TOURNAMENT_CFG);
    }
    const cliKp = await createKeypairFromFile(kpPath);
    return cliKp;
}

export async function buildWalletKeypair(umi: Umi): Promise<UmiKeypair> {
    const defaultKp: Web3Keypair = await loadDefaultWalletKeypair();
    const umiKp = createUmiKeypairFromSecretKey(umi, defaultKp.secretKey);
    return umiKp;
}

export function translateInstrKeyToSigner(umi: Umi, keys: IKeys): KeypairSigner {
    return createSignerFromKeypair(umi, createUmiKeypairFromSecretKey(umi, strToUint8Array(keys.pk)));
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

export const range = (start: number, stop: number, step = 1) =>
    Array.from({ length: Math.ceil((stop - start) / step) }, (_, i) => start + i * step);

export const buildTokenName = (name: string, tNo: number): string => `${name}:token-${tNo}`;
export const buildTokenUri = (name: string, tNo: number): string => `${DEFAULT_NFT_URL}?tournament=${name}&token-${tNo}`;

export const logTransactionLinkFromDecoded = (prefix: string, decodedSig: Uint8Array) => console.log(prefix, `https://explorer.solana.com/tx/${bs58.encode(decodedSig)}?cluster=${process.env.SOLNET}`);
export const logTransactionLink = (prefix: string, sig: string) => console.log(prefix, `https://explorer.solana.com/tx/${sig}?cluster=${process.env.SOLNET}`);

export async function buildTestWalletUmiKeypair(umi: Umi, indx: number): Promise<UmiKeypair> {
    const kp: Web3Keypair = await loadKeypairFromCfg(buildTestWalletCfgName(indx));
    return createUmiKeypairFromSecretKey(umi, kp.secretKey);
}

export function writeKeypairToFile(secretKey: Uint8Array) {
    const filePath = path.join(buildTokenBasePath(), `${crypto.randomUUID()}.json`);
    const secretKeyStr = JSON.stringify(Array.from(secretKey));
    fs.writeFileSync(filePath, secretKeyStr, { encoding: "utf-8" });
    console.log(`Keypair saved to ${filePath}`);
}

export const memoProgramPubKey = () => new PublicKey(MEMO_PROGRAM_ID);