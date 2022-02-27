import { useWorkspace } from '@/composables'
import * as anchor from "@project-serum/anchor"
import { BN, web3 } from "@project-serum/anchor"

// 1. Define the init endpoint.
export const donate = async (lamports, receiver) => {
  const { wallet, program, connection } = useWorkspace()
  const donater = wallet.value.publicKey;
    const [donaterAccount, bump] = await anchor.web3.PublicKey.findProgramAddress(
    // @ts-ignore
    ['donate', donater.toBytes()],
    program.value.programId
  );
  const oldBalance = await connection.getBalance( donaterAccount)
  const donat = new BN(lamports)
  try {
    await program.value.rpc.donate(donat, bump, {
      accounts: {
        donaterAccount: donaterAccount,
        donater: donater,
        receiver: receiver,
        systemProgram: web3.SystemProgram.programId
      },
      signers: [wallet]
    })
  }catch (e) {
    console.log("HERE!!")
    console.log(e)
  }

  const newBalance = await connection.getBalance( donaterAccount)
  console.log({oldBalance, newBalance})
}