import { ipcMain } from 'electron'
import ProfilRepository from '../database/repositories/ProfilRepository'

export function registerProfilIPC() {
  ipcMain.handle('profil:getByUserId', (_, userId: number) => {
    try {
      const data = ProfilRepository.getByUserId(userId)
      return { success: true, data }
    } catch (e: any) {
      return { success: false, message: e.message }
    }
  })

  ipcMain.handle('profil:update', (_, userId: number, data: any) => {
    try {
      const result = ProfilRepository.upsert(userId, data)
      return { success: true, data: result }
    } catch (e: any) {
      return { success: false, message: e.message }
    }
  })
}
