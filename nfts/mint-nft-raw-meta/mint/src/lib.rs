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

    mpl_token_metadata::{
        instruction::create_metadata_accounts_v3,
        state::DataV2,
        ID as METAPLEX_PROGRAM_ID,
    },
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
    let metadata_account = next_account_info(accounts_iter)?;
    let metaplex_program = next_account_info(accounts_iter)?;

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

    // Create Metadata
    let metadata_data = DataV2 {
        name: "My NFT".to_string(),
        symbol: "NFT".to_string(),
        uri: "https://example.com/metadata.json".to_string(), // Replace with your metadata URI
        seller_fee_basis_points: 500, // 5% royalties
        creators: None,
        collection: None,
        uses: None,
    };

    let create_metadata_ix = create_metadata_accounts_v3(
        METAPLEX_PROGRAM_ID,
        metadata_account.key.clone(),
        mint_account.key.clone(),
        mint_authority.key.clone(),
        mint_authority.key.clone(),
        mint_authority.key.clone(),
        metadata_data.name,
        metadata_data.symbol,
        metadata_data.uri,
        None, // No creators
        metadata_data.seller_fee_basis_points,
        true,
        true,
        None, // No collection
        None, // No uses
    );

    msg!("Creating metadata account...");
    invoke(
        &create_metadata_ix,
        &[
            metadata_account.clone(),
            mint_account.clone(),
            mint_authority.clone(),
            metaplex_program.clone(),
        ],
    )?;

    msg!("Token mint process completed successfully.");

    Ok(())
}
