import { supabaseAdmin } from './supabaseAdmin.js'

export type UserRole = 'student' | 'teacher' | 'admin'

export async function getUserRole(userId: string): Promise<UserRole> {
  const { data, error } = await supabaseAdmin.from('profiles').select('role').eq('user_id', userId).maybeSingle()

  if (error || !data) return 'student'
  return data.role as UserRole
}
