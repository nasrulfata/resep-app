import { ipcMain } from 'electron'
import PenjualanRepository, { Penjualan } from '../database/repositories/PenjualanRepository'

export function registerPenjualanIPC() {
  ipcMain.handle('penjualan:getAll', () => {
    try {
      const data = PenjualanRepository.getAll()
      return { success: true, data }
    } catch (e: any) {
      return { success: false, message: e.message }
    }
  })

  ipcMain.handle('penjualan:create', (_, data: Penjualan) => {
    try {
      const result = PenjualanRepository.create(data)
      return { success: true, data: result }
    } catch (e: any) {
      return { success: false, message: e.message }
    }
  })
}
