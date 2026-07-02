import bcrypt from 'bcryptjs'
import { getDatabase } from './database'

export function runSeeder() {
  const db = getDatabase()

  const result = db
    .prepare('SELECT COUNT(*) AS total FROM users')
    .get() as { total: number }

  if (result.total > 0) return

  const adminPassword = bcrypt.hashSync('admin123', 10)
  const userPassword = bcrypt.hashSync('user123', 10)

  const insert = db.prepare(`
    INSERT INTO users
    (nama, username, password, role)
    VALUES (?, ?, ?, ?)
  `)

  insert.run('Administrator', 'admin', adminPassword, 'admin')
  insert.run('User', 'user', userPassword, 'user')

  console.log('Seeder selesai')
}