# NFTs (Non-Fungible Tokens)

An NFT (Non-Fungible Token) is a unique digital asset stored on a blockchain, representing ownership of a specific item—like artwork, music, videos, virtual goods, or even real-world assets. 
Unlike cryptocurrencies such as Bitcoin or Ethereum, NFTs cannot be exchanged on a one-to-one basis because each one has a unique value and identity.

The actual NFT content (image, video, audio, etc.) is usually not stored on the blockchain due to size and cost limitations. 
Instead, the NFT itself (the token) is a smart contract stored on the blockchain, which contains metadata and a reference (URI) pointing to the actual digital asset.

How NFTs Store Data:
1. On-Chain Metadata (Rare)
    - Some NFTs store everything directly on the blockchain (e.g., CryptoPunks on Ethereum). This is expensive and limited due to blockchain storage constraints.
        - Storage limits: Blockchains are designed for transactions, not media hosting.
        - Perf issues: Blockchain nodes would need to store huge amounts of data.
2. Off-Chain Storage (Most Common)
    - The NFT smart contract stores only a URI (Uniform Resource Identifier) linking to the actual file.
    - The digital asset is stored on an external system, like:
        - IPFS (InterPlanetary File System) – Decentralized and tamper-resistant.
        - Arweave – Permanent decentralized storage.
        - Centralized Servers – Like AWS, Google Drive (less secure, prone to link rot).

Example of an NFT smart contract:
```json
{
  "name": "Cool NFT",
  "description": "A unique digital collectible",
  "image": "ipfs://Qm123abc456xyz",  
  "attributes": {
    "rarity": "Legendary",
    "power": 95
  }
}
```

# Minting
The recommended way to mint NFTs on Solana is to use Metaplex’s Token Metadata Program with either:
1. Metaplex Candy Machine – Best for large-scale NFT drops.
2. Metaplex Token Metadata Program (Direct Minting) – Best for individual or custom-minted NFTs.

## 
In the context of game logic, NFTs are typically minted on demand and may need revocation logic, Metaplex Token Metadata Program is recommended. It allows you to:
- Mint NFTs dynamically when a player joins.
- Store tournament-specific metadata (like tournament_id).
- Revoke or update NFTs as needed.

```rs
use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount, MintTo};
use mpl_token_metadata::instruction as metadata_instruction;
use solana_program::program::invoke_signed;

declare_id!("YourProgramIDHere");

#[program]
pub mod tournament_nft {
    use super::*;

    pub fn mint_nft(ctx: Context<MintNFT>, uri: String, name: String, symbol: String) -> Result<()> {
        let mint = &ctx.accounts.mint;
        let metadata_account = &ctx.accounts.metadata;
        let token_program = &ctx.accounts.token_program;
        let payer = &ctx.accounts.payer;

        // Mint NFT Token (1 supply)
        anchor_spl::token::mint_to(
            CpiContext::new(
                token_program.to_account_info(),
                MintTo {
                    mint: mint.to_account_info(),
                    to: ctx.accounts.nft_account.to_account_info(),
                    authority: ctx.accounts.authority.to_account_info(),
                },
            ),
            1,
        )?;

        // Create NFT Metadata
        let metadata_instruction = metadata_instruction::create_metadata_accounts_v3(
            mpl_token_metadata::ID,
            metadata_account.key(),
            mint.key(),
            ctx.accounts.authority.key(),
            payer.key(),
            ctx.accounts.authority.key(),
            name,
            symbol,
            uri,
            None, // No creators
            500,  // Royalty 5%
            true, // Update authority is mutable
            true, // Primary sale happened
            None,
            None,
            None,
        );

        invoke_signed(
            &metadata_instruction,
            &[
                metadata_account.to_account_info(),
                mint.to_account_info(),
                payer.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
            &[],
        )?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct MintNFT<'info> {
    #[account(init, payer = payer, mint::decimals = 0, mint::authority = authority)]
    pub mint: Account<'info, Mint>,
    #[account(init, payer = payer, space = 8 + 32 + 32 + 200)]
    pub metadata: Account<'info, Metadata>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
    #[account(init, payer = payer, associated_token::mint = mint, associated_token::authority = authority)]
    pub nft_account: Account<'info, TokenAccount>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Metadata {
    pub mint: Pubkey,
    pub name: String,
    pub uri: String,
}
```

## High-Level Overview
- This program mints an NFT (a token with a supply of 1 and metadata) on the Solana blockchain.
- It uses the SPL Token program (via anchor_spl) to create the mint account.
- It also interacts with Metaplex's Token Metadata Program (mpl_token_metadata) to attach metadata to the minted NFT.

### Deps. and imports:
```rs
use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount, MintTo};
use mpl_token_metadata::instruction as metadata_instruction;
use solana_program::program::invoke_signed;
```
- `anchor_lang::prelude::*`: Provides core Anchor macros and types.
- `anchor_spl::token::{Mint, Token, TokenAccount, MintTo}`: Imports structures for working with SPL tokens.
- `mpl_token_metadata::instruction as metadata_instruction`: Aliases instruction to make it easier to call Metaplex's metadata-related instructions.
- `solana_program::program::invoke_signed`: Used to call other Solana programs, like Metaplex, with program-derived addresses (PDAs).

### Declare the Program ID
```rs
declare_id!("YourProgramIDHere");
```
- This sets the on-chain program ID.
- This must match the ID deployed on Solana.

### NFT Minting Function
```rs
pub fn mint_nft(ctx: Context<MintNFT>, uri: String, name: String, symbol: String) -> Result<()> {
```
- This function mints an NFT and attaches metadata to it.
- `ctx: Context<MintNFT>`: Provides access to all required accounts (defined later).
- `uri`: The metadata URI (e.g., JSON file with image and attributes).
- `name`: The name of the NFT.
- `symbol`: The token symbol.

### Minting the NFT Token
```rs
let mint = &ctx.accounts.mint;
let metadata_account = &ctx.accounts.metadata;
let token_program = &ctx.accounts.token_program;
let payer = &ctx.accounts.payer;

anchor_spl::token::mint_to(
    CpiContext::new(
        token_program.to_account_info(),
        MintTo {
            mint: mint.to_account_info(),
            to: ctx.accounts.nft_account.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        },
    ),
    1, // Supply = 1 (NFT)
)?;
```
- Extracts required accounts for minting.
- Calls `anchor_spl::token::mint_to()` to mint 1 unit of the token.
- Uses a CPI (Cross-Program Invocation) Context to mint the NFT.

*Why 1? NFTs are unique, so they always have a fixed supply of 1.*

### Create NFT Metadata (Metaplex)
```rs
let metadata_instruction = metadata_instruction::create_metadata_accounts_v3(
    mpl_token_metadata::ID,       // Metaplex Program ID
    metadata_account.key(),       // Metadata account
    mint.key(),                   // Mint address
    ctx.accounts.authority.key(), // Mint authority
    payer.key(),                  // Payer of transaction fees
    ctx.accounts.authority.key(), // Update authority (can change metadata)
    name,                         // NFT name
    symbol,                       // NFT symbol
    uri,                          // Metadata URI (points to off-chain JSON)
    None,                         // No creators
    500,                          // Royalty (5%)
    true,                         // Update authority is mutable
    true,                         // Primary sale happened
    None, None, None,             // No collection, uses, or data
);
```
- Calls `create_metadata_accounts_v3` from Metaplex's Token Metadata Program.
- Attaches metadata (name, symbol, URI, royalties).
- Royalties are set to 5% (500 basis points).

```rs
invoke_signed(
    &metadata_instruction,
    &[
        metadata_account.to_account_info(),
        mint.to_account_info(),
        payer.to_account_info(),
        ctx.accounts.system_program.to_account_info(),
    ],
    &[],
)?;
```
- Uses `invoke_signed()` to call the Metaplex program and register the metadata.

### Account Struct (MintNFT)
```rs
#[derive(Accounts)]
pub struct MintNFT<'info> {
```