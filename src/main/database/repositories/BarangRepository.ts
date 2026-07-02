import { BaseRepository } from './BaseRepository'
import type { Barang } from '../../../renderer/src/stores/barang'

class BarangRepository extends BaseRepository {
  getAll(): Barang[] {
    return this.db
      .prepare('SELECT * FROM barang ORDER BY nama')
      .all() as Barang[]
  }

  findById(id: number): Barang | undefined {
    return this.db
      .prepare('SELECT * FROM barang WHERE id = ?')
      .get(id) as Barang | undefined
  }

  create(data: Barang) {
    const info = this.db
      .prepare(`
        INSERT INTO barang (nama, harga, stok, satuan, deskripsi)
        VALUES (?, ?, ?, ?, ?)
      `)
      .run(data.nama, data.harga, data.stok, data.satuan, data.deskripsi)
    
    return this.findById(info.lastInsertRowid as number)
  }

  update(id: number, data: Partial<Barang>) {
    // For simplicity, we assume all fields are provided in update
    this.db
      .prepare(`
        UPDATE barang
        SET
          nama = ?,
          harga = ?,
          stok = ?,
          satuan = ?,
          deskripsi = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
      .run(data.nama, data.harga, data.stok, data.satuan, data.deskripsi, id)
    
    return this.findById(id)
  }

  delete(id: number) {
    return this.db
      .prepare('DELETE FROM barang WHERE id = ?')
      .run(id)
  }
}

export default new BarangRepository()