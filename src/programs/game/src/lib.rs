use anchor_lang::prelude::*;

// declare_id!("YourProgramIdHere"); // Replace with your program ID

#[program]
pub mod nft_game {
    use super::*;

    pub fn sell_nft(ctx: Context<SellNft>, nft_id: String, new_owner: Pubkey) -> Result<()> {
        let game_state = &mut ctx.accounts.game_state;

        if let Some(nft_entry) = game_state.nft_mappings.iter_mut().find(|n| n.nft_id == nft_id) {
            nft_entry.owner = new_owner;
        } else {
            return Err(ErrorCode::NftNotFound.into());
        }

        Ok(())
    }

    pub fn burn_nft(ctx: Context<BurnNft>, nft_id: String) -> Result<()> {
        let game_state = &mut ctx.accounts.game_state;

        game_state.nft_mappings.retain(|n| n.nft_id != nft_id);

        Ok(())
    }
}

#[derive(Accounts)]
pub struct SellNft<'info> {
    #[account(mut)]
    pub game_state: Account<'info, GameState>,
    pub signer: Signer<'info>,
}

#[derive(Accounts)]
pub struct BurnNft<'info> {
    #[account(mut)]
    pub game_state: Account<'info, GameState>,
    pub signer: Signer<'info>,
}

#[account]
pub struct GameState {
    pub nft_mappings: Vec<NftMapping>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct NftMapping {
    pub nft_id: String,
    pub owner: Pubkey,
}

#[error_code]
pub enum ErrorCode {
    #[msg("NFT not found in game state.")]
    NftNotFound,
}
