import {
  Keypair as Web3Keypair
} from '@solana/web3.js';
import { loadKeypairFromCfg, range, buildTestWalletCfgName, createUmiKeypairFromSecretKey, buildTokenBasePath, loadKeypairFromToken } from './utls';
import { DEFAULT_NO_KEYS_IN_KEYSTORE, DEFAULT_TOURNAMENT_CFG } from './consts';
import { createSignerFromKeypair, KeypairSigner, Umi, Keypair as UmiKeypair } from '@metaplex-foundation/umi';
import { IKeys } from './types';
import { fs } from 'mz';
import { ISubscriber } from './listeners';

require("dotenv").config();

export interface ISubStore {
  getSub(key: string): ISubscriber | null;
  addSub(key: string, sub: ISubscriber): void;
}

export class SubStore implements ISubStore {
  private readonly _memoryStore: any = {};

  getSub(key: string): ISubscriber | null {
    if (key in this._memoryStore) {
      return this._memoryStore[key];
    }
    return null;
  }

  addSub(key: string, sub: ISubscriber): void {
    this._memoryStore[key] = sub;
  }

  removeSub(key: string): void {
    delete this._memoryStore[key];
  }
}

export interface IKeypairHandle {
  w3Kp: Web3Keypair;
  umiKp: UmiKeypair;
  signer: KeypairSigner;
}

export interface IKeyStore {
  getKeypair(pubKey: IKeys, umi: Umi): IKeypairHandle;
  loadTokens(): Promise<void>;
}

export class KeyStore implements IKeyStore {
  private readonly _memoryStore: any = {};

  constructor() {
    this.loadKeys()
      .then(
        _ => console.log('Keys loaded into keystore.'),
        err => console.error('Failed to load keys into keystore', err)
      );
    this.loadTokens()
      .then(
        _ => console.log('Tokens loaded into keystore.'),
        err => console.error('Failed to load tokens into keystore', err)
      );
  }

  async loadKeys() {
    console.log('loadKeys()', 'START');
    const cfgs = [DEFAULT_TOURNAMENT_CFG];
    for (const i of range(0, DEFAULT_NO_KEYS_IN_KEYSTORE)) {
      const cfg = buildTestWalletCfgName(i);
      cfgs.push(cfg);
    }
    for (const cfg of cfgs) {
      const keypair = await loadKeypairFromCfg(cfg);
      this._memoryStore[keypair.publicKey.toBase58()] = keypair;
    }
    console.log('key store', this._memoryStore);
  }

  async loadTokens() {
    const tokenDir = buildTokenBasePath();
    const cfgs = fs.readdirSync(tokenDir);
    for (const cfg of cfgs) {
      const keypair = await loadKeypairFromToken(cfg);
      this._memoryStore[keypair.publicKey.toBase58()] = keypair;
    }
    console.log('loadTokens()', 'key store', this._memoryStore);
  }

  getKeypair(pubKey: IKeys, umi: Umi): IKeypairHandle {
    console.log('getKeypair()', pubKey);
    const w3 = this._memoryStore[pubKey.pk];
    const umiKp = createUmiKeypairFromSecretKey(umi, w3.secretKey);
    return {
      w3Kp: w3,
      umiKp: umiKp,
      signer: createSignerFromKeypair(umi, umiKp)
    } as IKeypairHandle;
  }
}