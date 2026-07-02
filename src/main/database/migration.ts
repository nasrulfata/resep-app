import { getDatabase } from './database'

export function runMigration() {
  const db = getDatabase()

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nama TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS profil (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      nama TEXT,
      email TEXT,
      noTelp TEXT,
      alamat TEXT,
      kota TEXT,
      provinsi TEXT,
      kodePos TEXT,
      perusahaan TEXT,
      jabatan TEXT,
      fotoProfil TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS barang (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nama TEXT NOT NULL,
      harga REAL DEFAULT 0,
      stok REAL DEFAULT 0,
      satuan TEXT,
      deskripsi TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS resep (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nama TEXT NOT NULL,
      deskripsi TEXT,
      porsi INTEGER DEFAULT 1,
      waktuBuat INTEGER DEFAULT 0,
      totalHarga REAL DEFAULT 0,
      hargaPerPorsi REAL DEFAULT 0,
      catatan TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS bahan_resep (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      resep_id INTEGER NOT NULL,
      barang_id INTEGER NOT NULL,
      namaBarang TEXT NOT NULL,
      jumlah REAL DEFAULT 0,
      satuan TEXT,
      hargaSatuan REAL DEFAULT 0,
      subtotal REAL DEFAULT 0,
      FOREIGN KEY(resep_id) REFERENCES resep(id) ON DELETE CASCADE,
      FOREIGN KEY(barang_id) REFERENCES barang(id)
    );
  `)

  console.log('Migration selesai')
}