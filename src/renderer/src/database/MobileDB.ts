import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import bcrypt from 'bcryptjs';

const sqlite = new SQLiteConnection(CapacitorSQLite);
let db: SQLiteDBConnection | null = null;

const runSeeder = async (database: SQLiteDBConnection) => {
  const result = await database.query('SELECT COUNT(*) AS total FROM users');
  const count = result.values && result.values.length > 0 ? (result.values[0].total ?? result.values[0]['COUNT(*)']) : 0;
  
  if (count > 0) return;

  const adminPassword = bcrypt.hashSync('admin123', 10);
  const userPassword = bcrypt.hashSync('user123', 10);

  await database.run(`
    INSERT INTO users (nama, username, password, role)
    VALUES (?, ?, ?, ?)
  `, ['Administrator', 'admin', adminPassword, 'admin']);

  await database.run(`
    INSERT INTO users (nama, username, password, role)
    VALUES (?, ?, ?, ?)
  `, ['User', 'user', userPassword, 'user']);

  console.log('Mobile DB Seeder selesai');
};

export const initMobileDB = async () => {
  if (Capacitor.getPlatform() === 'web') {
    // Untuk testing di browser (membutuhkan jeep-sqlite di index.html)
    const customElements = window.customElements;
    if (!customElements.get('jeep-sqlite')) {
      const jeepSqlite = document.createElement('script');
      jeepSqlite.type = 'module';
      jeepSqlite.src = 'https://unpkg.com/jeep-sqlite@latest/dist/jeep-sqlite/jeep-sqlite.esm.js';
      document.body.appendChild(jeepSqlite);
      await customElements.whenDefined('jeep-sqlite');
      const jeepEl = document.createElement('jeep-sqlite');
      document.body.appendChild(jeepEl);
      await sqlite.initWebStore();
    }
  }

  try {
    const isConn = await sqlite.checkConnectionsConsistency();
    if (isConn.result && await sqlite.isConnection('resep_db', false)) {
      db = await sqlite.retrieveConnection('resep_db', false);
    } else {
      db = await sqlite.createConnection('resep_db', false, 'no-encryption', 1, false);
    }
    await db.open();

    // Jalankan migrasi jika diperlukan di mobile
    await runMigrations(db);
    await runSeeder(db);
    
    return db;
  } catch (error) {
    console.error('Mobile DB Init Error:', error);
    throw error;
  }
};

const runMigrations = async (database: SQLiteDBConnection) => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nama TEXT NOT NULL,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
  `;
  await database.execute(query);
};

export const getDB = () => {
  if (!db) throw new Error('Database not initialized');
  return db;
};
