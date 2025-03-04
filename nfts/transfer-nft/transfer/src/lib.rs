use {
    solana_program::{
        account_info::{next_account_info, AccountInfo},
        entrypoint,
        entrypoint::ProgramResult,
        msg,
        program::invoke,
        program_pack::Pack,
        pubkey::Pubkey,
    },
    spl_associated_token_account::get_associated_token_address,
    spl_token::instruction::transfer_checked,
};

entrypoint!(process_instruction);

pub fn process_instruction(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    _instruction_data: &[u8],
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();

    let sender = next_account_info(accounts_iter)?;
    let recipient = next_account_info(accounts_iter)?;
    let mint_account = next_account_info(accounts_iter)?;
    let sender_token_account = next_account_info(accounts_iter)?;
    let recipient_token_account = next_account_info(accounts_iter)?;
    let token_program = next_account_info(accounts_iter)?;

    // Ensure sender owns the token
    if sender_token_account.owner != sender.key {
        msg!("Error: Sender does not own the token account.");
        return Err(solana_program::program_error::ProgramError::InvalidAccountData);
    }

    // Ensure the recipient's associated token account exists
    let recipient_ata = get_associated_token_address(recipient.key, mint_account.key);
    if recipient_token_account.key != &recipient_ata {
        msg!("Error: Invalid recipient token account.");
        return Err(solana_program::program_error::ProgramError::InvalidAccountData);
    }

    // Transfer the NFT (amount = 1, decimals = 0 for NFTs)
    let transfer_ix = transfer_checked(
        token_program.key,
        sender_token_account.key,
        mint_account.key,
        recipient_token_account.key,
        sender.key,
        &[], // No multi-signers
        1,   // Transfer 1 NFT
        0,   // Decimals = 0
    )?;

    msg!("Transferring NFT from {} to {}", sender.key, recipient.key);
    invoke(
        &transfer_ix,
        &[
            sender.clone(),
            sender_token_account.clone(),
            recipient_token_account.clone(),
            mint_account.clone(),
            token_program.clone(),
        ],
    )?;

    msg!("NFT transfer completed successfully.");
    Ok(())
}
