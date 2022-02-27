import { web3 } from '@project-serum/anchor'
import { useWorkspace } from '@/composables'

// 1. Define the init endpoint.
export const withdraw = async (ownerPda) => {
  const { wallet, program, connection } = useWorkspace()
  const oldBalance = await connection.getBalance( wallet.value.publicKey)

  await program.value.rpc.withdraw({
    accounts: {
      donationReceiverData: ownerPda.publicKey,
      payer: ownerPda.publicKey,
      destination: wallet.value.publicKey,
      systemProgram: web3.SystemProgram.programId,
    },
    signers: [ownerPda]
  })
  const newBalance = await connection.getBalance( wallet.value.publicKey)

  return {
    oldBalance: oldBalance,
    newBalance: newBalance,
  }
}