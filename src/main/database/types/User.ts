export interface User {
  id: number
  nama: string
  username: string
  password: string
  role: 'admin' | 'user'
  is_active: number
  created_at: string
  updated_at: string
}