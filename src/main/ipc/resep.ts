import { ipcMain } from 'electron'
import ResepRepository from '../database/repositories/ResepRepository'

export function registerResepIPC() {
  ipcMain.handle('resep:getAll', () => {
    try {
      const data = ResepRepository.getAll()
      return { success: true, data }
    } catch (e: any) {
      return { success: false, message: e.message }
    }
  })

  ipcMain.handle('resep:create', (_, data: any) => {
    try {
      const result = ResepRepository.create(data)
      return { success: true, data: result }
    } catch (e: any) {
      return { success: false, message: e.message }
    }
  })

  ipcMain.handle('resep:update', (_, id: number, data: any) => {
    try {
      const result = ResepRepository.update(id, data)
      return { success: true, data: result }
    } catch (e: any) {
      return { success: false, message: e.message }
    }
  })

  ipcMain.handle('resep:delete', (_, id: number) => {
    try {
      ResepRepository.delete(id)
      return { success: true }
    } catch (e: any) {
      return { success: false, message: e.message }
    }
  })
}
