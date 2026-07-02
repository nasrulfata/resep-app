import { defineStore } from 'pinia'
import { getDB } from '../database/MobileDB'

export interface Penjualan {
  id?: number
  resepId: number
  namaResep: string
  jumlah: number
  hargaJual: number
  totalHarga: number
  hpp: number
  totalHpp: number
  keuntungan: number
  tanggal?: string
}

interface PenjualanState {
  items: Penjualan[]
  loading: boolean
  error: string | null
}

const getApi = () => {
  const api = window as any
  return api.api
}

export const usePenjualanStore = defineStore('penjualan', {
  state: (): PenjualanState => ({
    items: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchPenjualan() {
      this.loading = true
      this.error = null
      try {
        const api = getApi()
        if (api?.penjualan?.getAll) {
          const res = await api.penjualan.getAll()
          if (res.success) this.items = res.data
          else throw new Error(res.message)
        } else {
          const db = getDB()
          const res = await db.query('SELECT * FROM penjualan ORDER BY tanggal DESC')
          
          this.items = (res.values as any[] || []).map(r => ({
            id: r.id,
            resepId: r.resep_id,
            namaResep: r.nama_resep,
            jumlah: r.jumlah,
            hargaJual: r.harga_jual,
            totalHarga: r.total_harga,
            hpp: r.hpp,
            totalHpp: r.total_hpp,
            keuntungan: r.keuntungan,
            tanggal: r.tanggal
          }))
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Error fetching penjualan'
      } finally {
        this.loading = false
      }
    },

    async addPenjualan(penjualan: Penjualan) {
      try {
        const api = getApi()
        let newPenjualan: Penjualan
        
        if (api?.penjualan?.create) {
          const res = await api.penjualan.create(penjualan)
          if (!res.success) throw new Error(res.message)
          newPenjualan = res.data
        } else {
          const db = getDB()
          const res = await db.run(`
            INSERT INTO penjualan (resep_id, nama_resep, jumlah, harga_jual, total_harga, hpp, total_hpp, keuntungan)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            penjualan.resepId,
            penjualan.namaResep,
            penjualan.jumlah,
            penjualan.hargaJual,
            penjualan.totalHarga,
            penjualan.hpp,
            penjualan.totalHpp,
            penjualan.keuntungan
          ])
          
          const inserted = await db.query('SELECT * FROM penjualan WHERE id = ?', [res.changes?.lastId])
          const r = inserted.values![0]
          
          newPenjualan = {
            id: r.id,
            resepId: r.resep_id,
            namaResep: r.nama_resep,
            jumlah: r.jumlah,
            hargaJual: r.harga_jual,
            totalHarga: r.total_harga,
            hpp: r.hpp,
            totalHpp: r.total_hpp,
            keuntungan: r.keuntungan,
            tanggal: r.tanggal
          }
        }
        
        this.items.unshift(newPenjualan)
        return newPenjualan
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Error adding penjualan'
        throw err
      }
    }
  }
})
