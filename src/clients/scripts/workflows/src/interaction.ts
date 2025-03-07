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
} from "@metaplex-foundation/mpl-token-metadata";

// Your game's marketplace program ID
const MARKETPLACE_PROGRAM_ID = new PublicKey("Your_Marketplace_Program_ID");

/**
 * Approve the marketplace to transfer NFTs on behalf of the player
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
  
  // Find the marketplace's PDA that will act as the delegate
  const [marketplaceDelegate] = PublicKey.findProgramAddressSync(
    [Buffer.from("delegate"), nftMint.toBuffer()],
    MARKETPLACE_PROGRAM_ID
  );
  
  // Create the approval instruction
  const approveIx = createApproveInstruction(
    playerTokenAccount,
    marketplaceDelegate,
    playerWallet.publicKey,
    1, // Amount (1 for NFTs)
    [],
    TOKEN_PROGRAM_ID
  );
  
  // Create and send the transaction
  const tx = new Transaction().add(approveIx);
  const signature = await sendAndConfirmTransaction(
    connection,
    tx,
    [playerWallet]
  );
  
  console.log(`Marketplace approved as delegate. Signature: ${signature}`);
  return signature;
}

/**
 * List an NFT for sale on the marketplace
 */
async function listNftForSale(
  connection: Connection,
  playerWallet: Keypair,
  nftMint: PublicKey,
  priceInSol: number
) {
  // Get metadata account
  const metadataAddress = await getMetadata(nftMint);
  
  // Create listing account PDA
  const [listingAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from("listing"), nftMint.toBuffer(), playerWallet.publicKey.toBuffer()],
    MARKETPLACE_PROGRAM_ID
  );
  
  // Create the listing instruction (custom instruction for your marketplace)
  const createListingIx = {
    programId: MARKETPLACE_PROGRAM_ID,
    keys: [
      { pubkey: playerWallet.publicKey, isSigner: true, isWritable: true },
      { pubkey: nftMint, isSigner: false, isWritable: false },
      { pubkey: listingAccount, isSigner: false, isWritable: true },
      { pubkey: metadataAddress, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    ],
    data: Buffer.from([
      0, // Instruction index for "create_listing"
      ...new Uint8Array(new Float64Array([priceInSol]).buffer) // Price in SOL
    ])
  };
  
  // Create and send the transaction
  const tx = new Transaction().add(createListingIx);
  const signature = await sendAndConfirmTransaction(
    connection,
    tx,
    [playerWallet]
  );
  
  console.log(`NFT listed for sale. Signature: ${signature}`);
  return signature;
}

/**
 * Purchase an NFT from the marketplace
 */
async function purchaseNft(
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
  
  // Create the purchase instruction (custom instruction for your marketplace)
  const purchaseIx = {
    programId: MARKETPLACE_PROGRAM_ID,
    keys: [
      { pubkey: buyerWallet.publicKey, isSigner: true, isWritable: true },
      { pubkey: sellerPublicKey, isSigner: false, isWritable: true },
      { pubkey: nftMint, isSigner: false, isWritable: false },
      { pubkey: buyerTokenAccount, isSigner: false, isWritable: true },
      { pubkey: sellerTokenAccount, isSigner: false, isWritable: true },
      { pubkey: listingAccount, isSigner: false, isWritable: true },
      { pubkey: marketplaceDelegate, isSigner: false, isWritable: false },
      { pubkey: marketplaceTreasury, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: Buffer.from([1]) // Instruction index for "purchase"
  };
  
  // Add purchase instruction to transaction
  tx.add(purchaseIx);
  
  // Send the transaction
  const signature = await sendAndConfirmTransaction(
    connection,
    tx,
    [buyerWallet]
  );
  
  console.log(`NFT purchased. Signature: ${signature}`);
  return signature;
}

// Function to check if an NFT is listed for sale
async function checkNftListing(
  connection: Connection,
  nftMint: PublicKey,
  sellerPublicKey: PublicKey
) {
  const [listingAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from("listing"), nftMint.toBuffer(), sellerPublicKey.toBuffer()],
    MARKETPLACE_PROGRAM_ID
  );
  
  try {
    const accountInfo = await connection.getAccountInfo(listingAccount);
    if (accountInfo && accountInfo.data.length > 0) {
      // Parse the listing data from your program's format
      const price = new Float64Array(accountInfo.data.slice(8, 16))[0];
      return {
        isListed: true,
        price: price,
        seller: sellerPublicKey.toBase58()
      };
    }
  } catch (e) {
    console.error("Error checking listing:", e);
  }
  
  return { isListed: false };
}

export {
  approveMarketplaceAsDelegate,
  listNftForSale,
  purchaseNft,
  checkNftListing
};