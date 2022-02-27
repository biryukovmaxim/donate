<script setup>
import { computed, ref } from "vue"
import { initialize, withdraw as apiWithdraw} from '@/api'
import { useWallet } from 'solana-wallets-vue'

// Permissions.
const { connected,publicKey } = useWallet()
let canInit = ref(true);

const pdaAccountKey = ref('')
const pdaAccount = ref('')
const ownerAccount = ref('')
let canWithdraw1 = ref(true)
const canWithdraw = computed(() => publicKey.value.toString() === ownerAccount.value.toString() && !canInit.value && canWithdraw1)

// Actions.
const init = async () => {
  canInit.value = false
  console.log("start initializing")
  const donationReceiverAccount = await initialize()
  pdaAccountKey.value = donationReceiverAccount.publicKey;
  ownerAccount.value = donationReceiverAccount.owner;
  pdaAccount.value = donationReceiverAccount.pdaAccount;
}
const withdraw = async () => {
  canWithdraw1.value = false
  console.log("start withdraw")
  const balances = await apiWithdraw(pdaAccount.value)
  console.log(balances)
}

</script>

<template>
  <div>
    <h2>Initialize donation receiver acc</h2>
    <hr>
    <router-link to="/">return Home</router-link>
  </div>
  <div v-if="connected" class="px-8 py-4 border-b">
    <div class="flex flex-wrap items-center justify-between -m-2">
      <div>
        <!-- Tweet button. -->
        <button
            class="text-white px-4 py-2 rounded-full font-semibold bg-pink-500" :disabled="! canInit"
            @click="init"
        >
          Initialize
        </button>
      </div>
    </div>
  </div>

  <div v-else class="px-8 py-4 bg-gray-50 text-gray-500 text-center border-b">
    Connect your wallet to start initing account...
  </div>
  <div v-if="pdaAccountKey" class="px-20 py-4 border-b">
    <p>Program Derived Account of Donation Receiver:</p>
    <p>{{ pdaAccountKey }}</p>
    <p></p>
    <p> Donation Receiver Account</p>
    <p>{{ownerAccount}}</p>
  </div>
  <div v-if="connected && canWithdraw" class="px-8 py-4 border-b">
    <div class="flex flex-wrap items-right justify-between -m-2">
      <div>
        <!-- Tweet button. -->
        <button
            class="text-white px-4 py-2 rounded-full font-semibold bg-pink-500" :disabled="! canWithdraw"
            @click="withdraw"
        >
          Withdraw
        </button>
      </div>
    </div>
  </div>

</template>
