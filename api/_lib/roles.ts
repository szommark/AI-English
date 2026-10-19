import { supabaseAdmin } from './supabaseAdmin.js'

export type UserRole = 'student' | 'teacher' | 'admin'

/** Admins also have every teacher feature (Teacher Dashboard, Teacher Toolkit, students). */
export function hasTeacherAccess(role: UserRole): boolean {
  return role === 'teacher' || role === 'admin'
}

export async function getUserRole(userId: string): Promise<UserRole> {
  const { data, error } = await supabaseAdmin.from('profiles').select('role').eq('user_id', userId).maybeSingle()

  if (error || !data) return 'student'
  return data.role as UserRole
}
