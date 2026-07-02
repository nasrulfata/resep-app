import { ipcMain } from 'electron'
import BarangRepository from '../database/repositories/BarangRepository'

export function registerBarangIPC() {
  ipcMain.handle('barang:getAll', () => {
    try {
      const data = BarangRepository.getAll()
      return { success: true, data }
    } catch (e: any) {
      return { success: false, message: e.message }
    }
  })

  ipcMain.handle('barang:create', (_, data: any) => {
    try {
      const result = BarangRepository.create(data)
      return { success: true, data: result }
    } catch (e: any) {
      return { success: false, message: e.message }
    }
  })

  ipcMain.handle('barang:update', (_, id: number, data: any) => {
    try {
      const result = BarangRepository.update(id, data)
      return { success: true, data: result }
    } catch (e: any) {
      return { success: false, message: e.message }
    }
  })

  ipcMain.handle('barang:delete', (_, id: number) => {
    try {
      BarangRepository.delete(id)
      return { success: true }
    } catch (e: any) {
      return { success: false, message: e.message }
    }
  })
}
