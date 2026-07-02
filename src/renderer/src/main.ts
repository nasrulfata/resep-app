import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { initMobileDB } from './database/MobileDB'

const init = async () => {
  // Cek apakah bukan di Electron (berarti di Web/Mobile)
  const api = window as any
  if (!api.api) {
    try {
      await initMobileDB()
      console.log('Mobile DB Initialized')
    } catch (e) {
      console.error('Failed to init mobile db', e)
    }
  }

  const app = createApp(App)

  app.use(createPinia())
  app.use(router)

  app.mount('#app')
}

init()