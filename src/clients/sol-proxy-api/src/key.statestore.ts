import { createUmiKeypairFromSecretKey, strToUint8Array } from './utls';
import {
  Keypair as Web3Keypair,
} from '@solana/web3.js';
import { createSignerFromKeypair, Umi } from '@metaplex-foundation/umi';
import { IKeypairHandle, IKeys, IKeyStore, IKeyStoreEntry } from './types';
import { HttpClient } from './http.client';

require("dotenv").config();

const httpClient = new HttpClient();

export class KeyStateStore implements IKeyStore {
  private readonly _memoryStore: any = {};

  constructor() {
    this.loadWallets()
      .then(
        _ => console.log('Wallets loaded into keystore.'),
        err => console.error('Failed to load wallets into keystore', err)
      );
  }

  async loadWallets() {
    console.log('loadWallets()', 'START');
    const wallets: Array<IKeyStoreEntry> = await readFromStateStore();

    for (const w of wallets) {
      const kp = w3KeypairFromEntry(w);
      this._memoryStore[w.pk] = kp;
    }

    console.log('loadWallets()', 'END');
  }

  async getKeypair(pubKey: IKeys, umi: Umi): Promise<IKeypairHandle> {
    console.log('getKeypair()', 'pubKey', pubKey);

    if (pubKey.pk in this._memoryStore) {
      console.log('getKeypair()', 'pubKey found in memory');
      const w3 = this._memoryStore[pubKey.pk];
      return handleFromKeypair(w3, umi);
    }

    console.log('getKeypair()', 'Attempting to get from statestore');
    const key = await queryStateStore(pubKey.pk);
    if (!key) {
      throw new Error("Key not found in statestore");
    }

    const kp = w3KeypairFromEntry(key);
    this._memoryStore[kp.publicKey.toBase58()] = kp;

    return handleFromKeypair(kp, umi);
  }
}

function w3KeypairFromEntry(entry: IKeyStoreEntry): Web3Keypair {
  const sk = strToUint8Array(entry.sk);
  const kp = Web3Keypair.fromSecretKey(sk);
  return kp;
}

function handleFromKeypair(kp: Web3Keypair, umi: Umi): IKeypairHandle {
  const umiKp = createUmiKeypairFromSecretKey(umi, kp.secretKey);
  return {
    w3Kp: kp,
    umiKp: umiKp,
    signer: createSignerFromKeypair(umi, umiKp)
  } as IKeypairHandle;
}

export async function readFromStateStore(): Promise<Array<IKeyStoreEntry>> {
  const url = process.env.WALLET_STATESTORE_READ_URL!;
  const resp = await httpClient.get<Array<IKeyStoreEntry>>(url);
  console.log('readFromStateStore()', 'resp', resp);
  return resp;
}

export async function queryStateStore(pk: string): Promise<IKeyStoreEntry> {
  const url = process.env.WALLET_STATESTORE_QUERY_URL_PATTERN!.replace("{pk}", pk);
  console.log('queryStateStore()', 'url', url);
  const resp = await httpClient.get<IKeyStoreEntry>(url);
  console.log('queryStateStore()', 'resp', resp);
  return resp;
}

export async function writeToStateStore(instr: IKeyStoreEntry): Promise<void> {
  console.log('writetoStateStore()', 'START');
  const url = process.env.WALLET_STATESTORE_WRITE_URL!;
  await httpClient.post(url, instr);
}