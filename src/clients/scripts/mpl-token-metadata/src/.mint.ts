import { createUmi } from '@metaplex-foundation/umi';
import { 
  createMetadataAccountV3, 
  CreateMetadataAccountV3InstructionAccounts,
  CreateMetadataAccountV3InstructionArgs,
  MPL_TOKEN_METADATA_PROGRAM_ID,
  TokenStandard,
} from '@metaplex-foundation/mpl-token-metadata';
import { 
  createMint, 
  mintTokens, 
  createToken, 
  TokenProgram,
  findMintPda,
  findAssociatedTokenPda,
} from '@metaplex-foundation/mpl-toolbox';
import { keypairIdentity } from '@metaplex-foundation/umi-signer-wallet';
import { web3JsConnection, web3JsWallets } from '@metaplex-foundation/umi-web3js-adapters';
import { Keypair, Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { createSignerFromKeypair } from '@metaplex-foundation/umi';
import { base58 } from '@metaplex-foundation/umi/serializers';

async function createTokenWithMetadata(
  connection: Connection,
  payer: Keypair,
  mintAuthority: Keypair,
  name: string,
  symbol: string,
  uri: string,
  amount: number,
): Promise<{
  mintAddress: string;
  tokenAddress: string;
  metadataAddress: string;
}> {
  // Create UMI instance
  const umi = createUmi(connection)
    .use(web3JsWallets())
    .use(web3JsConnection(connection));
  
  // Add payer and mint authority
  const payerSigner = createSignerFromKeypair(umi, payer);
  const mintAuthoritySigner = createSignerFromKeypair(umi, mintAuthority);
  
  umi.use(keypairIdentity(payerSigner));
  
  // Create a new mint
  const mint = findMintPda(umi, { programId: TokenProgram.publicKey });
  
  // Create token account
  const tokenAccount = findAssociatedTokenPda(umi, {
    mint: mint.publicKey,
    owner: mintAuthoritySigner.publicKey,
  });
  
  // Create metadata PDA
  const metadataAccount = umi.pda.find(MPL_TOKEN_METADATA_PROGRAM_ID, [
    Buffer.from('metadata', 'utf8'),
    MPL_TOKEN_METADATA_PROGRAM_ID.toBuffer(),
    mint.publicKey.toBuffer(),
  ])[0];
  
  console.log('1. Creating mint...');
  const mintTx = await createMint(umi, {
    mint,
    mintAuthority: mintAuthoritySigner.publicKey,
    freezeAuthority: mintAuthoritySigner.publicKey,
    decimals: 0, // 0 for NFTs, more for fungible tokens
    tokenProgram: TokenProgram.publicKey,
  }).sendAndConfirm(umi);
  
  console.log('Mint created:', base58.deserialize(mint.publicKey)[0]);
  console.log('Transaction signature:', mintTx.signature);
  
  console.log('2. Creating token account...');
  const tokenTx = await createToken(umi, {
    mint: mint.publicKey,
    owner: mintAuthoritySigner.publicKey,
  }).sendAndConfirm(umi);
  
  console.log('Token account created:', base58.deserialize(tokenAccount.publicKey)[0]);
  console.log('Transaction signature:', tokenTx.signature);
  
  console.log('3. Minting tokens...');
  const mintTokensTx = await mintTokens(umi, {
    mint: mint.publicKey,
    token: tokenAccount.publicKey,
    amount: { basisPoints: BigInt(amount), decimals: 0 },
    mintAuthority: mintAuthoritySigner,
  }).sendAndConfirm(umi);
  
  console.log(`${amount} tokens minted to token account`);
  console.log('Transaction signature:', mintTokensTx.signature);
  
  console.log('4. Creating metadata...');
  const metadataArgs: CreateMetadataAccountV3InstructionArgs = {
    data: {
      name,
      symbol,
      uri,
      sellerFeeBasisPoints: 0,
      creators: null,
      collection: null,
      uses: null,
    },
    isMutable: true,
    collectionDetails: null,
  };
  
  const accounts: CreateMetadataAccountV3InstructionAccounts = {
    metadata: metadataAccount,
    mint: mint.publicKey,
    mintAuthority: mintAuthoritySigner,
    payer: payerSigner.publicKey,
    updateAuthority: mintAuthoritySigner.publicKey,
  };
  
  const createMetadataTx = await createMetadataAccountV3(umi, {
    ...accounts,
    ...metadataArgs,
  }).sendAndConfirm(umi);
  
  console.log('Metadata account created:', base58.deserialize(metadataAccount)[0]);
  console.log('Transaction signature:', createMetadataTx.signature);
  
  return {
    mintAddress: base58.deserialize(mint.publicKey)[0],
    tokenAddress: base58.deserialize(tokenAccount.publicKey)[0],
    metadataAddress: base58.deserialize(metadataAccount)[0],
  };
}

// Uncomment to run the example
// main().catch(console.error);

export { createTokenWithMetadata };