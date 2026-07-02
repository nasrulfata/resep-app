import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Capacitor } from '@capacitor/core'
import { App as CapApp } from '@capacitor/app'

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

  // Register hardware back button listener for Android/Capacitor
  if (Capacitor.isNativePlatform()) {
    CapApp.addListener('backButton', ({ canGoBack }) => {
      // Check if there is an active modal in the DOM and close it first
      const modalCloseBtn = document.querySelector('.modal .close-btn') as HTMLElement
      const sidebarOverlay = document.querySelector('.sidebar-overlay') as HTMLElement
      
      if (modalCloseBtn) {
        modalCloseBtn.click()
      } else if (sidebarOverlay && window.getComputedStyle(sidebarOverlay).display !== 'none') {
        const sidebarCloseBtn = document.querySelector('.logo .close-btn') as HTMLElement
        if (sidebarCloseBtn) sidebarCloseBtn.click()
      } else {
        const path = router.currentRoute.value.path
        if (path === '/dashboard' || path === '/login') {
          CapApp.exitApp()
        } else if (canGoBack) {
          router.back()
        } else {
          CapApp.exitApp()
        }
      }
    })
  }
}

init()