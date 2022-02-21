use anchor_lang::prelude::*;
use std::borrow::Borrow;

declare_id!("A8RuakCZpeS9x8ohNmZDdMY8rxGmCuLE6b8Sxkh1Gx41");

#[program]
pub mod donate {
    use super::*;
    use anchor_lang::solana_program::program::invoke;
    use anchor_lang::solana_program::system_instruction;
    use std::borrow::Borrow;
    pub fn initialize(ctx: Context<Initialize>) -> ProgramResult {
        let donation_receiver = &mut ctx.accounts.donation_receiver;
        donation_receiver.owner = *ctx.accounts.owner.key;
        Ok(())
    }

    pub fn withdraw(_ctx: Context<Withdraw>) -> ProgramResult {
        Ok(())
    }

    pub fn donate(ctx: Context<Donate>, donation_lamports: u64, account_bump: u8) -> ProgramResult {
        let donation_lamports = if donation_lamports > 0 {
            Ok(donation_lamports)
        } else {
            Err(ProgramError::InvalidInstructionData)
        }?;
        invoke(
            &system_instruction::transfer(
                ctx.accounts.donater.key,
                ctx.accounts.receiver.key,
                donation_lamports,
            ),
            &[
                ctx.accounts.donater.to_account_info(),
                ctx.accounts.receiver.to_account_info(),
            ],
        )?;

        let donate_acc = &mut ctx.accounts.donater_account;
        donate_acc.bump = account_bump;
        donate_acc.authority = *ctx.accounts.donater.key;
        donate_acc.donation_sum += donation_lamports;
        Ok(())
    }

    pub fn donation_sum_by_donater(
        ctx: Context<DonationSumByDonater>,
        _donater: [u8; 32],
    ) -> Result<u64, ProgramError> {
        let sum = ctx.accounts.donater_account.donation_sum;
        Ok(sum)
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
    init,
    payer = owner,
    space = 8 // account discriminator
    + 32 // pubkey
    )]
    pub donation_receiver: Account<'info, DonationReceiver>,
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct DonationReceiver {
    pub owner: Pubkey,
}

#[account]
#[derive(Default)]
pub struct DonaterAccount {
    pub donation_sum: u64,
    pub authority: Pubkey,
    pub bump: u8,
}

#[derive(Accounts)]
#[instruction(donation_lamports: u64, donate_bump: u8)]
pub struct Donate<'info> {
    #[account(init_if_needed,
    seeds=[
    b"donate",
    donater.to_account_info().key.as_ref(),
    ],
    bump = donate_bump,
    payer=donater,
    space=8 // account discriminator
    +32 // pubkey
    +8 // donation_sum
    +1, //bump
    )]
    pub donater_account: Account<'info, DonaterAccount>,
    #[account(mut)]
    pub donater: Signer<'info>,
    #[account(mut)]
    pub receiver: AccountInfo<'info>,
    pub system_program: AccountInfo<'info>,
}

#[derive(Accounts)]
#[instruction(donater: [u8; 32])]
pub struct DonationSumByDonater<'info> {
    #[account(seeds=[b"donate", donater.as_ref()], bump=donater_account.bump)]
    pub donater_account: Account<'info, DonaterAccount>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut, signer, owner = crate::ID, close = destination)]
    pub donation_receiver_data: Account<'info, DonationReceiver>,
    #[account(mut, address = donation_receiver_data.borrow().key(), signer)]
    pub payer: AccountInfo<'info>,
    #[account(mut, address = donation_receiver_data.owner)]
    pub destination: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}
