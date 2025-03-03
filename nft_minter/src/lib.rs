use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, MintTo};
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::metadata::{Metadata, CreateMetadataAccountsV3, CreateMasterEditionV3};
use solana_program::system_program;

declare_id!("BmPaWM5LC3TevKTuien6cdjmx6hrfDEjSRbn4KRFbqGV");

#[program]
pub mod tournament_nft_minter {
    use super::*;

    pub fn mint_nfts(ctx: Context<MintNFTs>, num_nfts: u64, name: String, symbol: String, uri: String) -> Result<()> {
        let mint = &ctx.accounts.mint;
        let metadata = &ctx.accounts.metadata;
        let master_edition = &ctx.accounts.master_edition;

        // Initialize Mint Account
        let cpi_accounts = token::InitializeMint {
            mint: mint.to_account_info(),
            rent: ctx.accounts.rent.to_account_info(),
        };
        token::initialize_mint(
            CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts),
            0, // NFTs have 0 decimals
            &ctx.accounts.mint_authority.key(),
            Some(&ctx.accounts.mint_authority.key()),
        )?;

        // Create Metadata
        let cpi_accounts = CreateMetadataAccountsV3 {
            metadata: metadata.to_account_info(),
            mint: mint.to_account_info(),
            mint_authority: ctx.accounts.mint_authority.to_account_info(),
            payer: ctx.accounts.payer.to_account_info(),
            update_authority: ctx.accounts.mint_authority.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
            rent: ctx.accounts.rent.to_account_info(),
        };
        metadata::create_metadata_accounts_v3(
            CpiContext::new(ctx.accounts.metadata_program.to_account_info(), cpi_accounts),
            name,
            symbol,
            uri,
            ctx.accounts.mint_authority.key(),
            Some(0),
            true,  // Immutable metadata
            false, // Not a collection
        )?;

        // Create Master Edition (1-of-1 NFT)
        let cpi_accounts = CreateMasterEditionV3 {
            edition: master_edition.to_account_info(),
            mint: mint.to_account_info(),
            update_authority: ctx.accounts.mint_authority.to_account_info(),
            mint_authority: ctx.accounts.mint_authority.to_account_info(),
            payer: ctx.accounts.payer.to_account_info(),
            metadata: metadata.to_account_info(),
            token_program: ctx.accounts.token_program.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
            rent: ctx.accounts.rent.to_account_info(),
        };
        metadata::create_master_edition_v3(
            CpiContext::new(ctx.accounts.metadata_program.to_account_info(), cpi_accounts),
            Some(1), // Ensure supply is exactly 1
        )?;

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(num_nfts: u64, name: String, symbol: String, uri: String)]
pub struct MintNFTs<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(init, payer = payer, space = 82)]
    pub mint: Account<'info, Mint>,

    #[account(mut)]
    pub mint_authority: Signer<'info>,

    #[account(mut)]
    pub metadata: Account<'info, Metadata>,

    #[account(mut)]
    pub master_edition: Account<'info, Metadata>,

    pub token_program: Program<'info, Token>,
    pub metadata_program: Program<'info, Metadata>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}
