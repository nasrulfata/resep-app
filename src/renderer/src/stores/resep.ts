import { defineStore } from 'pinia'
import { getDB } from '../database/MobileDB'

export interface BahanResep {
  barangId: number
  namaBarang: string
  jumlah: number
  satuan: string
  hargaSatuan: number
  subtotal: number
  jenis?: 'bahan' | 'kemasan'
}

export interface Resep {
  id?: number
  nama: string
  deskripsi: string
  porsi: number
  waktuBuat: number // dalam menit
  bahan: BahanResep[]
  totalHarga: number
  hargaPerPorsi: number
  overhead?: number
  penyusutan?: number
  hargaJual?: number
  keuntungan?: number
  hpp?: number
  catatan?: string
  createdAt?: string
  updatedAt?: string
}

interface ResepState {
  items: Resep[]
  loading: boolean
  error: string | null
}

const getApi = () => {
  const api = window as any
  return api.api
}

export const useResepStore = defineStore('resep', {
  state: (): ResepState => ({
    items: [],
    loading: false,
    error: null
  }),

  getters: {
    getResepById: (state) => (id: number) => {
      return state.items.find(r => r.id === id)
    },
    getTotalHarga: (state) => (resepId: number) => {
      const resep = state.items.find(r => r.id === resepId)
      if (!resep) return 0
      return resep.bahan.reduce((total, b) => total + b.subtotal, 0)
    }
  },

  actions: {
    async fetchResep() {
      this.loading = true
      this.error = null
      try {
        const api = getApi()
        if (api?.resep?.getAll) {
          const res = await api.resep.getAll()
          if (res.success) this.items = res.data
          else throw new Error(res.message)
        } else {
          const db = getDB()
          const res = await db.query('SELECT * FROM resep ORDER BY nama')
          const reseps = res.values as Resep[] || []
          
          for (const resep of reseps) {
            const bahanRes = await db.query('SELECT * FROM bahan_resep WHERE resep_id = ?', [resep.id])
            // Map db columns back to frontend model (camelCase)
            resep.bahan = (bahanRes.values as any[] || []).map(b => ({
              barangId: b.barang_id,
              namaBarang: b.namaBarang,
              jumlah: b.jumlah,
              satuan: b.satuan,
              hargaSatuan: b.hargaSatuan,
              subtotal: b.subtotal,
              jenis: b.jenis || 'bahan'
            }))
          }
          this.items = reseps
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Error fetching resep'
      } finally {
        this.loading = false
      }
    },

    async addResep(resep: Resep) {
      try {
        const api = getApi()
        // Calculate totals on frontend
        const totalBahan = resep.bahan
          .filter(b => b.jenis !== 'kemasan')
          .reduce((sum, b) => sum + b.subtotal, 0)
        
        const totalKemasan = resep.bahan
          .filter(b => b.jenis === 'kemasan')
          .reduce((sum, b) => sum + b.subtotal, 0)
        
        resep.overhead = totalBahan * 0.20
        resep.penyusutan = totalBahan * 0.10
        resep.hpp = totalBahan + resep.overhead + resep.penyusutan + totalKemasan
        resep.totalHarga = resep.hpp
        resep.hargaPerPorsi = resep.hpp / resep.porsi

        let newResep: Resep
        
        if (api?.resep?.create) {
          const res = await api.resep.create(resep)
          if (!res.success) throw new Error(res.message)
          newResep = res.data
        } else {
          const db = getDB()
          const res = await db.run(`
            INSERT INTO resep (nama, deskripsi, porsi, waktuBuat, totalHarga, hargaPerPorsi, overhead, penyusutan, hargaJual, keuntungan, hpp, catatan)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            resep.nama,
            resep.deskripsi,
            resep.porsi,
            resep.waktuBuat,
            resep.totalHarga,
            resep.hargaPerPorsi,
            resep.overhead || 0,
            resep.penyusutan || 0,
            resep.hargaJual || 0,
            resep.keuntungan || 0,
            resep.hpp || 0,
            resep.catatan
          ])
          
          const resepId = res.changes?.lastId
          for (const b of resep.bahan) {
            await db.run(`
              INSERT INTO bahan_resep (resep_id, barang_id, namaBarang, jumlah, satuan, hargaSatuan, subtotal, jenis)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [resepId, b.barangId, b.namaBarang, b.jumlah, b.satuan, b.hargaSatuan, b.subtotal, b.jenis || 'bahan'])
          }
          
          newResep = { ...resep, id: resepId }
        }
        
        this.items.push(newResep)
        return newResep
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Error adding resep'
        throw err
      }
    },

    async updateResep(id: number, resep: Partial<Resep>) {
      try {
        const api = getApi()
        const index = this.items.findIndex(r => r.id === id)
        if (index === -1) throw new Error('Resep not found')
        
        const currentBahan = resep.bahan || this.items[index].bahan
        const porsi = resep.porsi || this.items[index].porsi
        
        const totalBahan = currentBahan
          .filter(b => b.jenis !== 'kemasan')
          .reduce((sum, b) => sum + b.subtotal, 0)
        
        const totalKemasan = currentBahan
          .filter(b => b.jenis === 'kemasan')
          .reduce((sum, b) => sum + b.subtotal, 0)
        
        const overhead = totalBahan * 0.20
        const penyusutan = totalBahan * 0.10
        const hpp = totalBahan + overhead + penyusutan + totalKemasan
        const totalHarga = hpp
        const hargaPerPorsi = hpp / porsi
        
        const hargaJual = resep.hargaJual !== undefined ? resep.hargaJual : this.items[index].hargaJual || 0
        const keuntungan = hargaPerPorsi > 0 ? ((hargaJual - hargaPerPorsi) / hargaPerPorsi) * 100 : 0
        
        const resepToUpdate = {
          ...resep,
          totalHarga,
          hargaPerPorsi,
          overhead,
          penyusutan,
          hpp,
          keuntungan
        }

        let updatedResep: Resep
        
        if (api?.resep?.update) {
          const res = await api.resep.update(id, resepToUpdate)
          if (!res.success) throw new Error(res.message)
          updatedResep = res.data
        } else {
          const db = getDB()
          await db.run(`
            UPDATE resep
            SET nama = ?, deskripsi = ?, porsi = ?, waktuBuat = ?, totalHarga = ?, hargaPerPorsi = ?, overhead = ?, penyusutan = ?, hargaJual = ?, keuntungan = ?, hpp = ?, catatan = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `, [
            resepToUpdate.nama !== undefined ? resepToUpdate.nama : this.items[index].nama,
            resepToUpdate.deskripsi !== undefined ? resepToUpdate.deskripsi : this.items[index].deskripsi,
            resepToUpdate.porsi !== undefined ? resepToUpdate.porsi : this.items[index].porsi,
            resepToUpdate.waktuBuat !== undefined ? resepToUpdate.waktuBuat : this.items[index].waktuBuat,
            resepToUpdate.totalHarga,
            resepToUpdate.hargaPerPorsi,
            resepToUpdate.overhead,
            resepToUpdate.penyusutan,
            resepToUpdate.hargaJual !== undefined ? resepToUpdate.hargaJual : this.items[index].hargaJual || 0,
            resepToUpdate.keuntungan !== undefined ? resepToUpdate.keuntungan : this.items[index].keuntungan || 0,
            resepToUpdate.hpp,
            resepToUpdate.catatan !== undefined ? resepToUpdate.catatan : this.items[index].catatan || '',
            id
          ])
          
          if (resepToUpdate.bahan) {
            await db.run('DELETE FROM bahan_resep WHERE resep_id = ?', [id])
            for (const b of resepToUpdate.bahan) {
              await db.run(`
                INSERT INTO bahan_resep (resep_id, barang_id, namaBarang, jumlah, satuan, hargaSatuan, subtotal, jenis)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
              `, [id, b.barangId, b.namaBarang, b.jumlah, b.satuan, b.hargaSatuan, b.subtotal, b.jenis || 'bahan'])
            }
          }
          
          updatedResep = { ...this.items[index], ...resepToUpdate }
        }
        
        this.items[index] = updatedResep
        return updatedResep
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Error updating resep'
        throw err
      }
    },

    async deleteResep(id: number) {
      try {
        const api = getApi()
        if (api?.resep?.delete) {
          const res = await api.resep.delete(id)
          if (!res.success) throw new Error(res.message)
        } else {
          const db = getDB()
          await db.run('DELETE FROM resep WHERE id = ?', [id]) // ON DELETE CASCADE takes care of bahan_resep
        }
        
        const index = this.items.findIndex(r => r.id === id)
        if (index !== -1) this.items.splice(index, 1)
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Error deleting resep'
        throw err
      }
    },

    calculateBahanSubtotal(hargaSatuan: number, jumlah: number): number {
      return hargaSatuan * jumlah
    }
  }
})
