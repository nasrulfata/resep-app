/// <reference types="vite/client" />
interface Window {
  api: {
    auth: {
      login(username: string, password: string): Promise<any>
    }
  }
}