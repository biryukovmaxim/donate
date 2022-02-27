<script setup>
import { WalletMultiButton} from 'solana-wallets-vue'
</script>

<template>
    <aside class="flex flex-col items-center md:items-stretch space-y-2 md:space-y-4">
        <div class="fixed bottom-8 right-8 md:static w-48 md:w-full">
          <wallet-multi-button></wallet-multi-button>
        </div>
    </aside>
</template>
