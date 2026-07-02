import { defineStore } from 'pinia'
import { getDB } from '../database/MobileDB'

export interface Profil {
  id?: number
  nama: string
  email: string
  noTelp: string
  alamat: string
  kota: string
  provinsi: string
  kodePos: string
  perusahaan?: string
  jabatan?: string
  fotoProfil?: string
  updatedAt?: string
}

interface ProfilState {
  profil: Profil | null
  loading: boolean
  error: string | null
}

const getApi = () => {
  const api = window as any
  return api.api
}

export const useProfilStore = defineStore('profil', {
  state: (): ProfilState => ({
    profil: null,
    loading: false,
    error: null
  }),

  actions: {
    async fetchProfil(userId: number) {
      this.loading = true
      this.error = null
      try {
        const api = getApi()
        if (api?.profil?.getByUserId) {
          const res = await api.profil.getByUserId(userId)
          if (res.success) this.profil = res.data
          else throw new Error(res.message)
        } else {
          const db = getDB()
          const res = await db.query('SELECT * FROM profil WHERE user_id = ?', [userId])
          if (res.values && res.values.length > 0) {
            this.profil = res.values[0] as Profil
          } else {
            this.profil = null
          }
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Error fetching profil'
      } finally {
        this.loading = false
      }
    },

    async updateProfil(userId: number, profil: Partial<Profil>) {
      try {
        const api = getApi()
        let updated: Profil
        
        if (api?.profil?.update) {
          const res = await api.profil.update(userId, profil)
          if (!res.success) throw new Error(res.message)
          updated = res.data
        } else {
          const db = getDB()
          const check = await db.query('SELECT id FROM profil WHERE user_id = ?', [userId])
          const exists = check.values && check.values.length > 0
          
          if (exists) {
            await db.run(`
              UPDATE profil
              SET
                nama = ?,
                email = ?,
                noTelp = ?,
                alamat = ?,
                kota = ?,
                provinsi = ?,
                kodePos = ?,
                perusahaan = ?,
                jabatan = ?,
                fotoProfil = ?,
                updated_at = CURRENT_TIMESTAMP
              WHERE user_id = ?
            `, [
              profil.nama !== undefined ? profil.nama : this.profil?.nama || '',
              profil.email !== undefined ? profil.email : this.profil?.email || '',
              profil.noTelp !== undefined ? profil.noTelp : this.profil?.noTelp || '',
              profil.alamat !== undefined ? profil.alamat : this.profil?.alamat || '',
              profil.kota !== undefined ? profil.kota : this.profil?.kota || '',
              profil.provinsi !== undefined ? profil.provinsi : this.profil?.provinsi || '',
              profil.kodePos !== undefined ? profil.kodePos : this.profil?.kodePos || '',
              profil.perusahaan !== undefined ? profil.perusahaan : this.profil?.perusahaan || '',
              profil.jabatan !== undefined ? profil.jabatan : this.profil?.jabatan || '',
              profil.fotoProfil !== undefined ? profil.fotoProfil : this.profil?.fotoProfil || '',
              userId
            ])
          } else {
            await db.run(`
              INSERT INTO profil (user_id, nama, email, noTelp, alamat, kota, provinsi, kodePos, perusahaan, jabatan, fotoProfil)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              userId,
              profil.nama || '',
              profil.email || '',
              profil.noTelp || '',
              profil.alamat || '',
              profil.kota || '',
              profil.provinsi || '',
              profil.kodePos || '',
              profil.perusahaan || '',
              profil.jabatan || '',
              profil.fotoProfil || ''
            ])
          }
          
          const getUpdated = await db.query('SELECT * FROM profil WHERE user_id = ?', [userId])
          updated = getUpdated.values![0] as Profil
        }
        
        this.profil = updated
        return updated
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Error updating profil'
        throw err
      }
    }
  }
})
