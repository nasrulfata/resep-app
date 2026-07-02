import { defineStore } from 'pinia'
import AuthService from '../services/AuthService'

export interface UserSession {
  id: number
  nama: string
  username: string
  role: 'admin' | 'user'
}

interface AuthState {
  user: UserSession | null
  loading: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    loading: false
  }),

  actions: {
    async login(username: string, password: string) {
      this.loading = true

      try {
        const result = await AuthService.login(username, password)

        if (result.success) {
          this.user = result.data
        }

        return result
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.user = null
    }
  }
})