Name Purpose
sender	The current NFT owner.
recipient	The new NFT owner.
mint_account	The NFT mint account.
sender_token_account	Sender's Associated Token Account (ATA) for the NFT.
recipient_token_account	Recipient's Associated Token Account (ATA) for the NFT.
token_program	SPL Token Program.

```rs
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
```

```ts
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferCheckedInstruction,
} from "@solana/spl-token";

// Define Program & Wallets
const connection = new Connection("https://api.devnet.solana.com");
const sender = Keypair.fromSecretKey(Uint8Array.from([...]));
const recipient = new PublicKey("RECIPIENT_PUBLIC_KEY");
const mintAccount = new PublicKey("NFT_MINT_PUBLIC_KEY");
const tokenProgram = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");

// Fetch Associated Token Accounts
const senderTokenAccount = await getAssociatedTokenAddress(mintAccount, sender.publicKey);
const recipientTokenAccount = await getAssociatedTokenAddress(mintAccount, recipient);

// Create Transfer Instruction
const transferIx = createTransferCheckedInstruction(
  senderTokenAccount,
  mintAccount,
  recipientTokenAccount,
  sender.publicKey,
  1, // NFT Amount
  0  // Decimals (NFTs = 0)
);

// Execute Transaction
const tx = new Transaction().add(transferIx);
await sendAndConfirmTransaction(connection, tx, [sender]);

console.log("NFT successfully transferred!");
```

```rs
let transfer_instruction = spl_token::instruction::transfer(
    &spl_token::id(),
    &game_token_account_pubkey,  // The game’s non-ATA Token Account
    &user_ata_pubkey,            // The user’s ATA (must exist)
    &game_program_id,            // The program must sign the transaction
    &[],
    amount_to_transfer,          // Amount of tokens to send
)?;
```