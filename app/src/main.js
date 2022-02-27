// Routing.
import { createRouter, createWebHashHistory } from 'vue-router'
import routes from './router'
const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

// Create the app.
import { createApp } from 'vue'
import App from './App.vue'
createApp(App).use(router).mount('#app')