import { useWorkspace } from '@/composables'

// 1. Define the init endpoint.
export const get_initialized_accounts = async () => {
  const { program } = useWorkspace()
  const initializedAccounts = await program.value.account.donationReceiver.all()
  console.log(initializedAccounts)
  return initializedAccounts
}