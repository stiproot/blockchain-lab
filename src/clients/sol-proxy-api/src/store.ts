import {
  Keypair as Web3Keypair
} from '@solana/web3.js';
import { loadKeypairFromCfg, range, buildTestWalletCfgName, createUmiKeypairFromSecretKey } from './utls';
import { DEFAULT_NO_KEYS_IN_KEYSTORE } from './consts';
import { createSignerFromKeypair, KeypairSigner, Umi, Keypair as UmiKeypair } from '@metaplex-foundation/umi';
import { IKeys } from './types';

export interface IKeypairHandle {
  w3Kp: Web3Keypair;
  umiKp: UmiKeypair;
  signer: KeypairSigner;
}

export interface IKeyStore {
  getKeypair(pubKey: IKeys, umi: Umi): IKeypairHandle;
}

export class KeyStore implements IKeyStore {
  private readonly _memoryStore: any = {};

  constructor() {
    this.loadKeys()
      .then(
        _ => console.log('Keys loaded into keystore.'),
        err => console.error('Failed to load keys into keystore', err)
      );
  }

  async loadKeys() {
    for (const i of range(0, DEFAULT_NO_KEYS_IN_KEYSTORE)) {
      const cfg = buildTestWalletCfgName(i);
      const keypair = await loadKeypairFromCfg(cfg);
      this._memoryStore[keypair.publicKey.toBase58()] = keypair;
    }
  }

  getKeypair(pubKey: IKeys, umi: Umi): IKeypairHandle {
    const w3 = this._memoryStore[pubKey.pk];
    const umiKp = createUmiKeypairFromSecretKey(umi, w3.secretKey);
    return {
      w3Kp: w3,
      umiKp: umiKp,
      signer: createSignerFromKeypair(umi, umiKp)
    } as IKeypairHandle;
  }
}