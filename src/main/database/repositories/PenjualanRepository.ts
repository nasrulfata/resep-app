import { BaseRepository } from './BaseRepository'

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

class PenjualanRepository extends BaseRepository {
  getAll(): Penjualan[] {
    const rows = this.db
      .prepare('SELECT * FROM penjualan ORDER BY tanggal DESC')
      .all() as any[]
    
    return rows.map(r => ({
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

  create(data: Penjualan): Penjualan {
    const info = this.db
      .prepare(`
        INSERT INTO penjualan (resep_id, nama_resep, jumlah, harga_jual, total_harga, hpp, total_hpp, keuntungan)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        data.resepId,
        data.namaResep,
        data.jumlah,
        data.hargaJual,
        data.totalHarga,
        data.hpp,
        data.totalHpp,
        data.keuntungan
      )
    
    const id = info.lastInsertRowid as number
    const r = this.db
      .prepare('SELECT * FROM penjualan WHERE id = ?')
      .get(id) as any
      
    return {
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
}

export default new PenjualanRepository()
