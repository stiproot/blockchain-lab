import {
  Keypair as Web3Keypair
} from '@solana/web3.js';
import { KeypairSigner, Umi, Keypair as UmiKeypair } from '@metaplex-foundation/umi';
import { IKeys } from './types';

export interface IKeypairHandle {
  w3Kp: Web3Keypair;
  umiKp: UmiKeypair;
  signer: KeypairSigner;
}

export interface IKeyStore {
  getKeypair(pubKey: IKeys, umi: Umi): Promise<IKeypairHandle>;
  loadWallets(): Promise<void>;
  // loadTokens(): Promise<void>;
}

export interface IKeyStoreEntry {
  name: string;
  pk: string;
  sk: string;
}
