import { BaseRepository } from './BaseRepository'
import type { User } from '../types/User'
class UserRepository extends BaseRepository {
  getAll(): Omit<User, 'password'>[] {
  return this.db
    .prepare(
      `
      SELECT
        id,
        nama,
        username,
        role,
        is_active,
        created_at,
        updated_at
      FROM users
      ORDER BY nama
      `
    )
    .all() as Omit<User, 'password'>[]
}
  findByUsername(username: string): User | undefined {
  return this.db
    .prepare(
      `
      SELECT *
      FROM users
      WHERE username = ?
    `
    )
    .get(username) as User | undefined
}

 findById(id: number): User | undefined {
  return this.db
    .prepare(
      `
      SELECT *
      FROM users
      WHERE id = ?
    `
    )
    .get(id) as User | undefined
}

  create(data: {
    nama: string
    username: string
    password: string
    role: string
  }) {
    return this.db
      .prepare(`
        INSERT INTO users
        (
          nama,
          username,
          password,
          role
        )
        VALUES
        (
          ?,
          ?,
          ?,
          ?
        )
      `)
      .run(
        data.nama,
        data.username,
        data.password,
        data.role
      )
  }

  update(
    id: number,
    data: {
      nama: string
      username: string
      role: string
      is_active: number
    }
  ) {
    return this.db
      .prepare(`
        UPDATE users
        SET
          nama = ?,
          username = ?,
          role = ?,
          is_active = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
      .run(
        data.nama,
        data.username,
        data.role,
        data.is_active,
        id
      )
  }

  delete(id: number) {
    return this.db
      .prepare(`
        DELETE FROM users
        WHERE id = ?
      `)
      .run(id)
  }
}


export default new UserRepository()