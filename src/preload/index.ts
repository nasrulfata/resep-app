import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  auth: {
    login: (username: string, password: string) =>
      ipcRenderer.invoke('auth:login', username, password)
  },
  barang: {
    getAll: () => ipcRenderer.invoke('barang:getAll'),
    create: (data: any) => ipcRenderer.invoke('barang:create', data),
    update: (id: number, data: any) => ipcRenderer.invoke('barang:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('barang:delete', id)
  },
  resep: {
    getAll: () => ipcRenderer.invoke('resep:getAll'),
    create: (data: any) => ipcRenderer.invoke('resep:create', data),
    update: (id: number, data: any) => ipcRenderer.invoke('resep:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('resep:delete', id)
  },
  profil: {
    getByUserId: (userId: number) => ipcRenderer.invoke('profil:getByUserId', userId),
    update: (userId: number, data: any) => ipcRenderer.invoke('profil:update', userId, data)
  },
  penjualan: {
    getAll: () => ipcRenderer.invoke('penjualan:getAll'),
    create: (data: any) => ipcRenderer.invoke('penjualan:create', data)
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.api = api
}