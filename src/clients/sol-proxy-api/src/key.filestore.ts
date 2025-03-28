import { createUmiKeypairFromSecretKey, buildTokenBasePath, buildWalletBasePath, loadWalletKeypairFromFile, loadTokenKeypairFromFile } from './utls';
import { createSignerFromKeypair, Umi } from '@metaplex-foundation/umi';
import { IKeys } from './types';
import { fs } from 'mz';
import { IKeypairHandle, IKeyStore } from './keys';

require("dotenv").config();


export class KeyFileStore implements IKeyStore {
  private readonly _memoryStore: any = {};

  constructor() {
    this.loadWallets()
      .then(
        _ => console.log('Wallets loaded into keystore.'),
        err => console.error('Failed to load wallets into keystore', err)
      );

    this.loadTokens()
      .then(
        _ => console.log('Tokens loaded into keystore.'),
        err => console.error('Failed to load tokens into keystore', err)
      );
  }

  async loadWallets() {
    console.log('loadWallets()', 'START');
    const walletCfgDir = buildWalletBasePath();
    const cfgFiles = fs.readdirSync(walletCfgDir);
    for (const cfg of cfgFiles) {
      const keypair = await loadWalletKeypairFromFile(cfg);
      this._memoryStore[keypair.publicKey.toBase58()] = keypair;
    }
    // console.log('loadWallets()', 'END', '_memoryStore', this._memoryStore);
    console.log('loadWallets()', 'END');
  }

  async loadTokens() {
    const tokenDir = buildTokenBasePath();
    const cfgFiles = fs.readdirSync(tokenDir);
    for (const cfg of cfgFiles) {
      const keypair = await loadTokenKeypairFromFile(cfg);
      this._memoryStore[keypair.publicKey.toBase58()] = keypair;
    }
  }

  getKeypair(pubKey: IKeys, umi: Umi): Promise<IKeypairHandle> {
    console.log('getKeypair()', 'pubKey', pubKey);
    if (!(pubKey.pk in this._memoryStore)) {
      throw new Error(`${pubKey.pk} not found in key store. _memoryStore: ${this._memoryStore}`);
    }
    const w3 = this._memoryStore[pubKey.pk];
    const umiKp = createUmiKeypairFromSecretKey(umi, w3.secretKey);

    const handle = {
      w3Kp: w3,
      umiKp: umiKp,
      signer: createSignerFromKeypair(umi, umiKp)
    } as IKeypairHandle;

    return Promise.resolve(handle);
  }
}