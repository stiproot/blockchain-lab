```rs
let burn_instruction = spl_token::instruction::burn(
    &spl_token::id(),
    &game_token_account,  // The program-owned token account
    &mint_pubkey,         // The Mint Account of the token
    &game_program_id,     // The game contract (must be the owner)
    &[],                  // (optional) signer seeds if using PDA
    burn_amount,          // How many tokens to burn
)?;
invoke(
    &burn_instruction,
    &[
        game_token_account_info,
        mint_account_info,
        game_program_info,
        token_program_info,
    ],
)?;
```