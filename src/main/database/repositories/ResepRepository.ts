import { BaseRepository } from './BaseRepository'
import type { Resep, BahanResep } from '../../../renderer/src/stores/resep'

class ResepRepository extends BaseRepository {
  getAll(): Resep[] {
    const reseps = this.db
      .prepare('SELECT * FROM resep ORDER BY nama')
      .all() as any[]
    
    // Fetch bahan for each resep
    for (const resep of reseps) {
      resep.bahan = this.db
        .prepare('SELECT * FROM bahan_resep WHERE resep_id = ?')
        .all(resep.id) as BahanResep[]
    }
    
    return reseps as Resep[]
  }

  findById(id: number): Resep | undefined {
    const resep = this.db
      .prepare('SELECT * FROM resep WHERE id = ?')
      .get(id) as any
    
    if (resep) {
      resep.bahan = this.db
        .prepare('SELECT * FROM bahan_resep WHERE resep_id = ?')
        .all(resep.id) as BahanResep[]
    }
    
    return resep as Resep | undefined
  }

  create(data: Resep) {
    const info = this.db
      .prepare(`
        INSERT INTO resep (nama, deskripsi, porsi, waktuBuat, totalHarga, hargaPerPorsi, overhead, penyusutan, hargaJual, keuntungan, hpp, catatan)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        data.nama,
        data.deskripsi,
        data.porsi,
        data.waktuBuat,
        data.totalHarga,
        data.hargaPerPorsi,
        data.overhead || 0,
        data.penyusutan || 0,
        data.hargaJual || 0,
        data.keuntungan || 0,
        data.hpp || 0,
        data.catatan
      )
    
    const resepId = info.lastInsertRowid as number

    // Insert bahan
    const insertBahan = this.db.prepare(`
      INSERT INTO bahan_resep (resep_id, barang_id, namaBarang, jumlah, satuan, hargaSatuan, subtotal, jenis)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)

    for (const bahan of data.bahan) {
      insertBahan.run(
        resepId,
        bahan.barangId,
        bahan.namaBarang,
        bahan.jumlah,
        bahan.satuan,
        bahan.hargaSatuan,
        bahan.subtotal,
        bahan.jenis || 'bahan'
      )
    }
    
    return this.findById(resepId)
  }

  update(id: number, data: Partial<Resep>) {
    this.db
      .prepare(`
        UPDATE resep
        SET
          nama = ?,
          deskripsi = ?,
          porsi = ?,
          waktuBuat = ?,
          totalHarga = ?,
          hargaPerPorsi = ?,
          overhead = ?,
          penyusutan = ?,
          hargaJual = ?,
          keuntungan = ?,
          hpp = ?,
          catatan = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
      .run(
        data.nama,
        data.deskripsi,
        data.porsi,
        data.waktuBuat,
        data.totalHarga,
        data.hargaPerPorsi,
        data.overhead || 0,
        data.penyusutan || 0,
        data.hargaJual || 0,
        data.keuntungan || 0,
        data.hpp || 0,
        data.catatan,
        id
      )
    
    if (data.bahan) {
      // Delete old bahan and insert new ones
      this.db.prepare('DELETE FROM bahan_resep WHERE resep_id = ?').run(id)
      const insertBahan = this.db.prepare(`
        INSERT INTO bahan_resep (resep_id, barang_id, namaBarang, jumlah, satuan, hargaSatuan, subtotal, jenis)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      for (const bahan of data.bahan) {
        insertBahan.run(
          id,
          bahan.barangId,
          bahan.namaBarang,
          bahan.jumlah,
          bahan.satuan,
          bahan.hargaSatuan,
          bahan.subtotal,
          bahan.jenis || 'bahan'
        )
      }
    }
    
    return this.findById(id)
  }

  delete(id: number) {
    return this.db
      .prepare('DELETE FROM resep WHERE id = ?')
      .run(id)
  }
}

export default new ResepRepository()