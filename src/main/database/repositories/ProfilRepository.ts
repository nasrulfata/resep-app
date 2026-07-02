import { BaseRepository } from './BaseRepository'
import type { Profil } from '../../../renderer/src/stores/profil'

class ProfilRepository extends BaseRepository {
  getByUserId(userId: number): Profil | undefined {
    const row = this.db
      .prepare('SELECT * FROM profil WHERE user_id = ?')
      .get(userId) as any
    if (!row) return undefined
    
    return {
      id: row.id,
      nama: row.nama,
      email: row.email,
      noTelp: row.noTelp,
      alamat: row.alamat,
      kota: row.kota,
      provinsi: row.provinsi,
      kodePos: row.kodePos,
      perusahaan: row.perusahaan,
      jabatan: row.jabatan,
      fotoProfil: row.fotoProfil,
      updatedAt: row.updated_at
    }
  }

  upsert(userId: number, data: Partial<Profil>): Profil {
    const existing = this.getByUserId(userId)
    if (existing) {
      this.db
        .prepare(`
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
        `)
        .run(
          data.nama !== undefined ? data.nama : existing.nama,
          data.email !== undefined ? data.email : existing.email,
          data.noTelp !== undefined ? data.noTelp : existing.noTelp,
          data.alamat !== undefined ? data.alamat : existing.alamat,
          data.kota !== undefined ? data.kota : existing.kota,
          data.provinsi !== undefined ? data.provinsi : existing.provinsi,
          data.kodePos !== undefined ? data.kodePos : existing.kodePos,
          data.perusahaan !== undefined ? data.perusahaan : existing.perusahaan,
          data.jabatan !== undefined ? data.jabatan : existing.jabatan,
          data.fotoProfil !== undefined ? data.fotoProfil : existing.fotoProfil,
          userId
        )
    } else {
      this.db
        .prepare(`
          INSERT INTO profil (user_id, nama, email, noTelp, alamat, kota, provinsi, kodePos, perusahaan, jabatan, fotoProfil)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .run(
          userId,
          data.nama || '',
          data.email || '',
          data.noTelp || '',
          data.alamat || '',
          data.kota || '',
          data.provinsi || '',
          data.kodePos || '',
          data.perusahaan || '',
          data.jabatan || '',
          data.fotoProfil || ''
        )
    }
    return this.getByUserId(userId)!
  }
}

export default new ProfilRepository()