import { getDatabase } from '../database'
import Database from 'better-sqlite3'

export abstract class BaseRepository {
  protected db: Database.Database

  constructor() {
    this.db = getDatabase()
  }
}