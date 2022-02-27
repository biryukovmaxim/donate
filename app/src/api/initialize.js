import { web3 } from '@project-serum/anchor'
import { useWorkspace } from '@/composables'
import { DonationReceiver } from '@/models'

// 1. Define the init endpoint.
export const initialize = async () => {
    const { wallet, program } = useWorkspace()

    // 2. Generate a new Keypair for our new tweet account.
    const ownerPda = web3.Keypair.generate()

    // 3. Send a "Initialize" instruction with the right data and the right accounts.
    await program.value.rpc.initialize({
        accounts: {
            donationReceiver: ownerPda.publicKey,
            owner: wallet.value.publicKey,
            systemProgram: web3.SystemProgram.programId,
        },
        signers: [ownerPda]
    })

    const donationReceiverAccount = await program.value.account.donationReceiver.fetch(ownerPda.publicKey)
    return new DonationReceiver(ownerPda, donationReceiverAccount)
}