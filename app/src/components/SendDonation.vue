<script setup>
import {donate as apiDonate} from "@/api"
// Actions.
const donate = async () => {
  console.log("donating")
  const lamports = parseInt(document.getElementById("donation").value, 10);
  const destination = document.getElementById("destination").value;
  await apiDonate(lamports,destination)
  console.log("donated")
}
</script>

<template>
  <div>
    <h2>donate some1</h2>
    <hr>
    <router-link to="/">return Home</router-link>
  </div>
  <form>
    <div>
      <p>
        <input id="donation" type="number" name="lamports">
      </p>
      <input id="destination" type="text" name="publicKey">
    </div>
    <div>
      <button
          @click="donate"
      >send donate</button>
    </div>
  </form>
</template>

