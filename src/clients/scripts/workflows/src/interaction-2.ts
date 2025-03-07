import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import {
  createApproveInstruction,
  createSetAuthorityInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
  AuthorityType,
} from "@solana/spl-token";
import {
  getMetadata,
  Metadata,
  PROGRAM_ID as METADATA_PROGRAM_ID,
  createDelegateInstruction,
  DelegateArgs,
  TokenDelegateRole,
  TokenStandard,
  AuthorityType as MetadataAuthorityType,
} from "@metaplex-foundation/mpl-token-metadata";

// Your game's marketplace program ID
const MARKETPLACE_PROGRAM_ID = new PublicKey("Your_Marketplace_Program_ID");

/**
 * Approve the marketplace to transfer AND burn NFTs on behalf of the player
 * Uses both SPL Token delegate for transfers and Token Metadata delegate for burns
 */
async function approveMarketplaceAsDelegate(
  connection: Connection,
  playerWallet: Keypair,
  nftMint: PublicKey,
  expireTimeSeconds: number = 0 // 0 means no expiration
) {
  // Get player's token account for this NFT
  const playerTokenAccount = await getAssociatedTokenAddress(
    nftMint,
    playerWallet.publicKey
  );
  
  // Get metadata account address
  const metadataAddress = await getMetadata(nftMint);
  
  // Find the marketplace's PDA that will act as the delegate
  const [marketplaceDelegate] = PublicKey.findProgramAddressSync(
    [Buffer.from("delegate"), nftMint.toBuffer()],
    MARKETPLACE_PROGRAM_ID
  );
  
  // Create a transaction with multiple instructions
  const tx = new Transaction();
  
  // 1. Standard SPL Token delegate for transfer capability
  const approveTransferIx = createApproveInstruction(
    playerTokenAccount,
    marketplaceDelegate,
    playerWallet.publicKey,
    1, // Amount (1 for NFTs)
    [],
    TOKEN_PROGRAM_ID
  );
  tx.add(approveTransferIx);
  
  // 2. Token Metadata delegate for burn capability
  // Create delegate for burn authority using Metaplex's Token Metadata program
  const delegateBurnIx = createDelegateInstruction(
    {
      delegate: marketplaceDelegate,
      metadata: metadataAddress,
      mint: nftMint,
      tokenAccount: playerTokenAccount,
      authority: playerWallet.publicKey,
      splTokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      payer: playerWallet.publicKey,
      updateAuthority: playerWallet.publicKey,
    },
    {
      delegateArgs: {
        __kind: "TokenDelegateV1",
        amount: 1,
        authorization_data: null,
        delegate_role: TokenDelegateRole.Burn,
      },
    }
  );
  tx.add(delegateBurnIx);
  
  // Send the transaction with both approvals
  const signature = await sendAndConfirmTransaction(
    connection,
    tx,
    [playerWallet]
  );
  
  console.log(`Marketplace approved as delegate for transfer AND burn. Signature: ${signature}`);
  return signature;
}

/**
 * Purchase and burn an NFT (for consumable game items)
 */
async function purchaseAndBurnNft(
  connection: Connection,
  buyerWallet: Keypair,
  nftMint: PublicKey,
  sellerPublicKey: PublicKey
) {
  // Get token accounts
  const buyerTokenAccount = await getAssociatedTokenAddress(
    nftMint,
    buyerWallet.publicKey
  );
  
  const sellerTokenAccount = await getAssociatedTokenAddress(
    nftMint,
    sellerPublicKey
  );
  
  // Get metadata account
  const metadataAddress = await getMetadata(nftMint);
  
  // Create the buyer's token account if it doesn't exist
  let tx = new Transaction();
  
  try {
    await connection.getAccountInfo(buyerTokenAccount);
  } catch (e) {
    tx.add(
      createAssociatedTokenAccountInstruction(
        buyerWallet.publicKey,
        buyerTokenAccount,
        buyerWallet.publicKey,
        nftMint
      )
    );
  }
  
  // Get the listing account
  const [listingAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from("listing"), nftMint.toBuffer(), sellerPublicKey.toBuffer()],
    MARKETPLACE_PROGRAM_ID
  );
  
  // Get the marketplace treasury account
  const [marketplaceTreasury] = PublicKey.findProgramAddressSync(
    [Buffer.from("treasury")],
    MARKETPLACE_PROGRAM_ID
  );
  
  // Get the marketplace delegate
  const [marketplaceDelegate] = PublicKey.findProgramAddressSync(
    [Buffer.from("delegate"), nftMint.toBuffer()],
    MARKETPLACE_PROGRAM_ID
  );
  
  // Create the purchase instruction with immediate burn (custom instruction for your marketplace)
  const purchaseAndBurnIx = {
    programId: MARKETPLACE_PROGRAM_ID,
    keys: [
      { pubkey: buyerWallet.publicKey, isSigner: true, isWritable: true },
      { pubkey: sellerPublicKey, isSigner: false, isWritable: true },
      { pubkey: nftMint, isSigner: false, isWritable: true },
      { pubkey: buyerTokenAccount, isSigner: false, isWritable: true },
      { pubkey: sellerTokenAccount, isSigner: false, isWritable: true },
      { pubkey: listingAccount, isSigner: false, isWritable: true },
      { pubkey: marketplaceDelegate, isSigner: false, isWritable: false },
      { pubkey: marketplaceTreasury, isSigner: false, isWritable: true },
      { pubkey: metadataAddress, isSigner: false, isWritable: true },
      { pubkey: METADATA_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: Buffer.from([2]) // Instruction index for "purchase_and_burn"
  };
  
  // Add purchase instruction to transaction
  tx.add(purchaseAndBurnIx);
  
  // Send the transaction
  const signature = await sendAndConfirmTransaction(
    connection,
    tx,
    [buyerWallet]
  );
  
  console.log(`NFT purchased and burned. Signature: ${signature}`);
  return signature;
}

// Other functions remain the same...
export {
  approveMarketplaceAsDelegate,
  listNftForSale,
  purchaseNft,
  purchaseAndBurnNft,
  checkNftListing
};