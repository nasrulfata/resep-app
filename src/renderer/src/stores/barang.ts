import { defineStore } from 'pinia'
import { getDB } from '../database/MobileDB'

export interface Barang {
  id?: number
  nama: string
  harga: number
  satuan: string
  stok: number
  deskripsi?: string
  createdAt?: string
  updatedAt?: string
}

interface BarangState {
  items: Barang[]
  loading: boolean
  error: string | null
}

const getApi = () => {
  const api = window as any
  return api.api
}

export const useBarangStore = defineStore('barang', {
  state: (): BarangState => ({
    items: [],
    loading: false,
    error: null
  }),

  getters: {
    getBarangById: (state) => (id: number) => {
      return state.items.find(b => b.id === id)
    }
  },

  actions: {
    async fetchBarang() {
      this.loading = true
      this.error = null
      try {
        const api = getApi()
        if (api?.barang?.getAll) {
          const res = await api.barang.getAll()
          if (res.success) this.items = res.data
          else throw new Error(res.message)
        } else {
          const db = getDB()
          const res = await db.query('SELECT * FROM barang ORDER BY nama')
          this.items = res.values as Barang[] || []
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Error fetching barang'
      } finally {
        this.loading = false
      }
    },

    async addBarang(barang: Barang) {
      try {
        const api = getApi()
        let newBarang: Barang
        
        if (api?.barang?.create) {
          const res = await api.barang.create(barang)
          if (!res.success) throw new Error(res.message)
          newBarang = res.data
        } else {
          const db = getDB()
          const res = await db.run(`
            INSERT INTO barang (nama, harga, stok, satuan, deskripsi)
            VALUES (?, ?, ?, ?, ?)
          `, [barang.nama, barang.harga, barang.stok, barang.satuan, barang.deskripsi])
          
          const inserted = await db.query('SELECT * FROM barang WHERE id = ?', [res.changes?.lastId])
          newBarang = inserted.values![0] as Barang
        }
        
        this.items.push(newBarang)
        return newBarang
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Error adding barang'
        throw err
      }
    },

    async updateBarang(id: number, barang: Partial<Barang>) {
      try {
        const api = getApi()
        let updatedBarang: Barang
        
        if (api?.barang?.update) {
          const res = await api.barang.update(id, barang)
          if (!res.success) throw new Error(res.message)
          updatedBarang = res.data
        } else {
          const db = getDB()
          await db.run(`
            UPDATE barang
            SET nama = ?, harga = ?, stok = ?, satuan = ?, deskripsi = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `, [barang.nama, barang.harga, barang.stok, barang.satuan, barang.deskripsi, id])
          
          const updated = await db.query('SELECT * FROM barang WHERE id = ?', [id])
          updatedBarang = updated.values![0] as Barang
        }
        
        const index = this.items.findIndex(b => b.id === id)
        if (index !== -1) this.items[index] = updatedBarang
        return updatedBarang
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Error updating barang'
        throw err
      }
    },

    async deleteBarang(id: number) {
      try {
        const api = getApi()
        if (api?.barang?.delete) {
          const res = await api.barang.delete(id)
          if (!res.success) throw new Error(res.message)
        } else {
          const db = getDB()
          await db.run('DELETE FROM barang WHERE id = ?', [id])
        }
        
        const index = this.items.findIndex(b => b.id === id)
        if (index !== -1) this.items.splice(index, 1)
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Error deleting barang'
        throw err
      }
    }
  }
})
