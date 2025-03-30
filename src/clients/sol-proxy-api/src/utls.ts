import {
    Connection,
    clusterApiUrl,
    Keypair as Web3Keypair,
    Cluster,
    PublicKey,
    VersionedTransactionResponse,
} from '@solana/web3.js';
import { Keypair as UmiKeypair, Umi, createSignerFromKeypair, KeypairSigner } from '@metaplex-foundation/umi';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata'
import fs from 'mz/fs.js';
import os from 'os';
import path from 'path';
import yaml from 'yaml';
import bs58 from 'bs58';
import { IKeys, ISubscribeEvt, KeyType } from './types';
import { DEFAULT_NFT_URL, DEFAULT_TOURNAMENT_CFG, MEMO_PROGRAM_ID } from './consts';

const SOL_CLI_CONFIG_PATH = path.resolve(
    os.homedir(),
    '.config',
    'solana',
    'cli',
    'config.yml',
);

const KEYTYPE_DIR_HASH = {
    [KeyType.WALLET]: '.wallets',
    [KeyType.TOKEN]: '.tokens'
}

export const MEMO_PROGRAM_PUBKEY = () => new PublicKey(MEMO_PROGRAM_ID);

export const strToUint8Array = (str: string): Uint8Array => Uint8Array.from(JSON.parse(str));
export const uint8ArrayToStr = (arr: Uint8Array) => JSON.stringify(Array.from(arr));
export const strToPubKey = (str: string): PublicKey => new PublicKey(str);

export const readFileContent = async (filePath: string) => await fs.readFile(filePath, { encoding: 'utf8' });

export const createUmiKeypairFromSecretKey = (umi: Umi, pk: Uint8Array): UmiKeypair => umi.eddsa.createKeypairFromSecretKey(pk);

export const cfgBaseDir = (): string => process.env.SOLNET === 'localnet' ? '.cfg.localnet' : '.cfg.devnet';
export const keyBaseDir = (keyType: KeyType = KeyType.WALLET): string => path.join(cfgBaseDir(), KEYTYPE_DIR_HASH[keyType]);
export const buildTokenBasePath = (): string => path.resolve(keyBaseDir(KeyType.TOKEN));
export const buildWalletBasePath = (): string => path.resolve(keyBaseDir(KeyType.WALLET));
export const buildCfgPath = (fileName: string, keyType: KeyType = KeyType.WALLET): string => path.join(keyBaseDir(keyType), fileName);

export async function readKeypairFromFile(filePath: string): Promise<Web3Keypair> {
    const pk = await readFileContent(filePath);
    const secretKey = strToUint8Array(pk);
    return Web3Keypair.fromSecretKey(secretKey);
}
export const loadKeypairFromFile = async (fileName: string, keyType: KeyType = KeyType.WALLET): Promise<Web3Keypair> => await readKeypairFromFile(buildCfgPath(fileName, keyType));
export const loadWalletKeypairFromFile = async (fileName: string): Promise<Web3Keypair> => await loadKeypairFromFile(fileName, KeyType.WALLET);
export const loadTokenKeypairFromFile = async (fileName: string): Promise<Web3Keypair> => await loadKeypairFromFile(fileName, KeyType.TOKEN);

export async function loadDefaultWalletKeypair(): Promise<Web3Keypair> {
    let kpPath = null;
    if (process.env.SOLNET === 'localnet') {
        const configYml = await readFileContent(SOL_CLI_CONFIG_PATH);
        kpPath = await yaml.parse(configYml).keypair_path;
    } else {
        kpPath = buildCfgPath(DEFAULT_TOURNAMENT_CFG);
    }
    const cliKp = await readKeypairFromFile(kpPath);
    return cliKp;
}

export async function loadNTestWalletKeypairsFromFile(n: number): Promise<Array<Web3Keypair>> {
    const walletCfgDir = buildWalletBasePath();
    const cfgFiles = fs.readdirSync(walletCfgDir).filter(f => f !== DEFAULT_TOURNAMENT_CFG);

    const kps = [];
    for (const i of range(0, n)) {
        const cfg = cfgFiles[i];
        const keypair = await loadWalletKeypairFromFile(cfg);
        kps.push(keypair);
    }

    return kps;
}

export async function loadNTestTokensFromFile(n: number): Promise<Array<Web3Keypair>> {
    const cfgsDir = buildTokenBasePath();
    const cfgFiles = fs.readdirSync(cfgsDir);

    const kps = [];
    for (const i of range(0, n)) {
        const cfg = cfgFiles[i];
        const keypair = await loadTokenKeypairFromFile(cfg);
        kps.push(keypair);
    }

    return kps;
}

export async function loadDefaultWalletUmiKeypair(umi: Umi): Promise<UmiKeypair> {
    const defaultKp: Web3Keypair = await loadDefaultWalletKeypair();
    const umiKp = createUmiKeypairFromSecretKey(umi, defaultKp.secretKey);
    return umiKp;
}

export function instrKeyToSigner(umi: Umi, keys: IKeys): KeypairSigner {
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

export const buildDefaultTokenName = (name: string, tNo: number): string => `${name}:token-${tNo}`;
export const buildDefaultTokenUri = (name: string, tNo: number): string => `${DEFAULT_NFT_URL}?tournament=${name}&token-${tNo}`;

export function logTransactionLink(prefix: string, sig: string | Uint8Array) {
    let encodedSig = sig instanceof Uint8Array ? bs58.encode(sig) : sig;
    const cluster = process.env.SOLNET === 'localnet' ? 'custom' : process.env.SOLNET;
    console.log(prefix, `https://explorer.solana.com/tx/${encodedSig}?cluster=${cluster}`);
}

export function writeKeypairToFile(secretKey: Uint8Array, keyType: KeyType = KeyType.WALLET) {
    const keypair = Web3Keypair.fromSecretKey(secretKey);
    const filePath = path.join(cfgBaseDir(), KEYTYPE_DIR_HASH[keyType], `${keypair.publicKey.toBase58()}.json`);
    const secretKeyStr = JSON.stringify(Array.from(secretKey));

    fs.writeFileSync(filePath, secretKeyStr, { encoding: "utf-8" });
}

export function mapEvtFromTx(tx: VersionedTransactionResponse,): ISubscribeEvt {
    const sender = tx.transaction.message.staticAccountKeys[0].toBase58();
    const to = tx.transaction.message.staticAccountKeys[1].toBase58();

    let amt = 0;

    for (let i = 0; i < tx.meta!.preBalances.length; i++) {
        amt += (tx.meta!.preBalances[i] - tx.meta!.postBalances[i]);
    }

    let evt = {
        senderPk: sender,
        accountPk: to,
        amtLamports: amt,
        blockTime: tx.blockTime,
        feeLamports: tx.meta?.fee,
        computationalUnitsConsumed: tx.meta?.computeUnitsConsumed,
        signature: tx.transaction.signatures[0],
    } as ISubscribeEvt;

    return evt;
}