import { createSignerFromKeypair, generateSigner, percentAmount, signerIdentity } from '@metaplex-foundation/umi';
import {
  createNft,
  fetchDigitalAsset,
  createV1,
  TokenStandard,
} from '@metaplex-foundation/mpl-token-metadata';
import {
    loadKeypairFromCfg,
    loadDefaultWalletKeypair,
    createConn,
    createDevConn
} from './utls.js';

import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata'

const walletKeypair = await loadDefaultWalletKeypair();

// Use the RPC endpoint of your choice.
// const umi = createUmi('http://127.0.0.1:8899')
//   .use(signerIdentity(createSignerFromKeypair(walletKeypair)))
//   .use(mplTokenMetadata());

const umi = createUmi('http://127.0.0.1:8899');
// const signer = createSignerFromKeypair(umi, walletKeypair);
const signer = generateSigner();

umi
  .use(signerIdentity(signer))
  .use(mplTokenMetadata());

const mint = generateSigner(umi);

await createNft(umi, {
  mint,
  name: 'My NFT',
  uri: 'https://example.com/my-nft.json',
  sellerFeeBasisPoints: percentAmount(5.5),
}).sendAndConfirm(umi)

const asset = await fetchDigitalAsset(umi, mint.publicKey)

// await createV1(umi, {
//   mint,
//   authority,
//   name: 'My NFT',
//   uri,
//   sellerFeeBasisPoints: percentAmount(5.5),
//   tokenStandard: TokenStandard.NonFungible,
// }).sendAndConfirm(umi)