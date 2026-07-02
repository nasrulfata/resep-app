import { ipcRenderer } from 'electron'

export const auth = {
  login: (username: string, password: string) => {
    return ipcRenderer.invoke('auth:login', username, password)
  }
}