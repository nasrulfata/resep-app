import { ipcMain } from 'electron'
import bcrypt from 'bcryptjs'
import UserRepository from '../database/repositories/UserRepository'

export function registerAuthIPC() {
  ipcMain.handle('auth:login', async (_, username: string, password: string) => {
    const user = UserRepository.findByUsername(username)

    if (!user) {
      return {
        success: false,
        message: 'Username tidak ditemukan'
      }
    }

    if (user.is_active === 0) {
      return {
        success: false,
        message: 'User tidak aktif'
      }
    }

    const valid = bcrypt.compareSync(password, user.password)

    if (!valid) {
      return {
        success: false,
        message: 'Password salah'
      }
    }

    return {
      success: true,
      data: {
        id: user.id,
        nama: user.nama,
        username: user.username,
        role: user.role
      }
    }
  })
}