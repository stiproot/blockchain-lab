```rs
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};
use mpl_token_metadata::instruction as mpl_instruction;
use solana_program::{
    program::{invoke, invoke_signed},
    pubkey::Pubkey,
    system_instruction,
};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"); // Replace with your program ID

#[program]
pub mod token_minting_program {
    use super::*;

    pub fn initialize_and_mint(
        ctx: Context<InitializeAndMint>,
        name: String,
        symbol: String,
        uri: String,
        amount: u64,
    ) -> Result<()> {
        // 1. Create token mint account
        let seeds = &[b"mint".as_ref(), &[ctx.bumps.mint]];
        let signer = [&seeds[..]];
        
        // Transfer rent for the mint account
        invoke_signed(
            &system_instruction::transfer(
                &ctx.accounts.payer.key(),
                &ctx.accounts.mint.key(),
                ctx.accounts.rent.minimum_balance(Mint::LEN),
            ),
            &[
                ctx.accounts.payer.to_account_info(),
                ctx.accounts.mint.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
            &signer,
        )?;
        
        // Initialize the mint account
        invoke_signed(
            &token::instruction::initialize_mint(
                &ctx.accounts.token_program.key(),
                &ctx.accounts.mint.key(),
                &ctx.accounts.mint.key(),
                Some(&ctx.accounts.mint.key()),
                0, // 0 decimals for NFT
            )?,
            &[
                ctx.accounts.mint.to_account_info(),
                ctx.accounts.rent.to_account_info(),
                ctx.accounts.token_program.to_account_info(),
            ],
            &signer,
        )?;
        
        // 2. Create token account
        invoke_signed(
            &system_instruction::create_account(
                &ctx.accounts.payer.key(),
                &ctx.accounts.token_account.key(),
                ctx.accounts.rent.minimum_balance(TokenAccount::LEN),
                TokenAccount::LEN as u64,
                &ctx.accounts.token_program.key(),
            ),
            &[
                ctx.accounts.payer.to_account_info(),
                ctx.accounts.token_account.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
            &[&[b"token_account".as_ref(), &[ctx.bumps.token_account]]],
        )?;
        
        // Initialize token account
        invoke_signed(
            &token::instruction::initialize_account(
                &ctx.accounts.token_program.key(),
                &ctx.accounts.token_account.key(),
                &ctx.accounts.mint.key(),
                &ctx.accounts.mint.key(), // Owner is the mint PDA (the program)
            )?,
            &[
                ctx.accounts.token_account.to_account_info(),
                ctx.accounts.mint.to_account_info(),
                ctx.accounts.rent.to_account_info(),
                ctx.accounts.token_program.to_account_info(),
            ],
            &[&[b"token_account".as_ref(), &[ctx.bumps.token_account]]],
        )?;
        
        // 3. Mint tokens to the token account
        invoke_signed(
            &token::instruction::mint_to(
                &ctx.accounts.token_program.key(),
                &ctx.accounts.mint.key(),
                &ctx.accounts.token_account.key(),
                &ctx.accounts.mint.key(), // Mint authority (the program)
                &[],
                amount,
            )?,
            &[
                ctx.accounts.mint.to_account_info(),
                ctx.accounts.token_account.to_account_info(),
                ctx.accounts.mint.to_account_info(), // Mint authority
                ctx.accounts.token_program.to_account_info(),
            ],
            &signer,
        )?;
        
        // 4. Create metadata account
        let metadata_seeds = &[
            b"metadata".as_ref(),
            &mpl_token_metadata::ID.to_bytes(),
            &ctx.accounts.mint.key().to_bytes(),
        ];
        let (metadata_account, _) = Pubkey::find_program_address(metadata_seeds, &mpl_token_metadata::ID);
        
        invoke_signed(
            &mpl_instruction::create_metadata_accounts_v3(
                mpl_token_metadata::ID,
                metadata_account,
                ctx.accounts.mint.key(),
                ctx.accounts.mint.key(), // Mint authority
                ctx.accounts.payer.key(),
                ctx.accounts.mint.key(), // Update authority
                name,
                symbol,
                uri,
                None, // Creators
                0,    // Seller fee basis points
                true, // Update authority is signer
                true, // Is mutable
                None, // Collection
                None, // Uses
                None, // Collection Details
            ),
            &[
                ctx.accounts.metadata_program.to_account_info(),
                ctx.accounts.metadata_account.to_account_info(),
                ctx.accounts.mint.to_account_info(),
                ctx.accounts.mint.to_account_info(), // Mint authority
                ctx.accounts.payer.to_account_info(),
                ctx.accounts.mint.to_account_info(), // Update authority
                ctx.accounts.system_program.to_account_info(),
                ctx.accounts.rent.to_account_info(),
            ],
            &signer,
        )?;
        
        msg!("Token initialized with metadata and {} tokens minted", amount);
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeAndMint<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    
    #[account(
        init,
        payer = payer,
        space = 8 + Mint::LEN,
        seeds = [b"mint"],
        bump
    )]
    pub mint: Account<'info, Mint>,
    
    #[account(
        init,
        payer = payer,
        space = 8 + TokenAccount::LEN,
        seeds = [b"token_account"],
        bump
    )]
    pub token_account: Account<'info, TokenAccount>,
    
    /// CHECK: Created through CPI
    #[account(mut)]
    pub metadata_account: UncheckedAccount<'info>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    /// CHECK: This is the Token Metadata Program
    pub metadata_program: UncheckedAccount<'info>,
    pub rent: Sysvar<'info, Rent>,
}

// Client-side function to derive PDA addresses (for reference)
#[cfg(not(target_arch = "bpf"))]
pub fn get_program_addresses(program_id: &Pubkey) -> (Pubkey, Pubkey, Pubkey) {
    let (mint, _) = Pubkey::find_program_address(&[b"mint"], program_id);
    let (token_account, _) = Pubkey::find_program_address(&[b"token_account"], program_id);
    
    let metadata_seeds = &[
        b"metadata".as_ref(),
        &mpl_token_metadata::ID.to_bytes(),
        &mint.to_bytes(),
    ];
    let (metadata_account, _) = Pubkey::find_program_address(metadata_seeds, &mpl_token_metadata::ID);
    
    (mint, token_account, metadata_account)
}
```