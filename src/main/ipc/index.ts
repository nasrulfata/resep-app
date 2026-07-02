import { registerAuthIPC } from './auth'
import { registerBarangIPC } from './barang'
import { registerResepIPC } from './resep'
import { registerProfilIPC } from './profil'
import { registerPenjualanIPC } from './penjualan'

export function registerIPC() {
  registerAuthIPC()
  registerBarangIPC()
  registerResepIPC()
  registerProfilIPC()
  registerPenjualanIPC()
}