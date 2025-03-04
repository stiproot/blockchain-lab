use {
    solana_program::{
        account_info::{next_account_info, AccountInfo},
        declare_id, entrypoint,
        entrypoint::ProgramResult,
        msg,
        native_token::LAMPORTS_PER_SOL,
        program::invoke,
        pubkey::Pubkey,
        system_instruction,
    },
    spl_associated_token_account::instruction as token_account_instruction,
    spl_token::instruction as token_instruction,
};

declare_id!("Gn6Lsrpsg7y3MzAsZVJMvgfp1V2pnLjsFH6w81D1hxzC");

entrypoint!(process_instruction);

fn process_instruction(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    _instruction_data: &[u8],
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();

    let mint_account = next_account_info(accounts_iter)?;
    let token_account = next_account_info(accounts_iter)?;
    let mint_authority = next_account_info(accounts_iter)?;
    let rent = next_account_info(accounts_iter)?;
    let _system_program = next_account_info(accounts_iter)?;
    let token_program = next_account_info(accounts_iter)?;
    let associated_token_program = next_account_info(accounts_iter)?;

    let create_mint_account_ix = system_instruction::create_account(
        &mint_authority.key,
        &mint_account.key,
        LAMPORTS_PER_SOL,
        82,
        &token_program.key,
    );

    msg!("Creating mint account...");
    msg!("Mint: {}", mint_account.key);
    invoke(
        &create_mint_account_ix,
        &[
            mint_account.clone(),
            mint_authority.clone(),
            token_program.clone(),
        ],
    )?;

    let init_mint_ix = token_instruction::initialize_mint(
        &token_program.key,
        &mint_account.key,
        &mint_authority.key,
        Some(&mint_authority.key),
        0,
    )?;

    msg!("Initializing mint account...");
    msg!("Mint: {}", mint_account.key);
    invoke(
        &init_mint_ix,
        &[
            mint_account.clone(),
            mint_authority.clone(),
            token_program.clone(),
            rent.clone(),
        ],
    )?;

    let create_token_account = token_account_instruction::create_associated_token_account(
        &mint_authority.key,
        &mint_authority.key,
        &mint_account.key,
        &token_program.key,
    );

    msg!("Creating token account...");
    msg!("Token Address: {}", token_account.key);
    invoke(
        &create_token_account,
        &[
            mint_account.clone(),
            token_account.clone(),
            mint_authority.clone(),
            token_program.clone(),
            associated_token_program.clone(),
        ],
    )?;

    let mint_token_to_ix = token_instruction::mint_to(
        &token_program.key,
        &mint_account.key,
        &token_account.key,
        &mint_authority.key,
        &[&mint_authority.key],
        1,
    )?;

    msg!("Minting token to token account...");
    msg!("Mint: {}", mint_account.key);
    msg!("Token Address: {}", token_account.key);
    invoke(
        &mint_token_to_ix,
        &[
            mint_account.clone(),
            mint_authority.clone(),
            token_account.clone(),
            token_program.clone(),
            rent.clone(),
        ],
    )?;

    msg!("Token mint process completed successfully.");

    Ok(())
}
