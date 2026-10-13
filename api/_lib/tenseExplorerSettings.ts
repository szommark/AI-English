import { supabaseAdmin } from './supabaseAdmin.js'
import {
  combineTenseSettings,
  type TenseExplorerPolicy,
  type TenseExplorerSetting,
} from '../../src/lib/tenseExplorerPolicy.js'
import type { TenseId } from '../../src/lib/tenseEngine/types.js'

// Tense Explorer settings (table tense_explorer_settings): a teacher's class setting
// (student_id null) and per-student overrides. Used by api/teacher-tools.ts (teacher side)
// and api/grammar-lesson.ts (the student's resolved policy).

interface SettingRow {
  id: number
  teacher_id: string
  student_id: string | null
  tenses: TenseId[]
  allow_customize: boolean
  updated_at: string
}

const COLUMNS = 'id, teacher_id, student_id, tenses, allow_customize, updated_at'

function toSetting(row: SettingRow): TenseExplorerSetting {
  return { tenses: row.tenses, allowCustomize: row.allow_customize, updatedAt: row.updated_at }
}

async function findRow(teacherId: string, studentId: string | null): Promise<SettingRow | null> {
  let query = supabaseAdmin.from('tense_explorer_settings').select(COLUMNS).eq('teacher_id', teacherId)
  query = studentId ? query.eq('student_id', studentId) : query.is('student_id', null)
  const { data, error } = await query.maybeSingle()
  if (error) throw error
  return (data as SettingRow | null) ?? null
}

/** Whether the student is actively connected to the teacher. */
export async function isActiveStudent(teacherId: string, studentId: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('teacher_student_links')
    .select('id')
    .eq('teacher_id', teacherId)
    .eq('student_id', studentId)
    .eq('status', 'active')
    .maybeSingle()
  if (error) throw error
  return Boolean(data)
}

export async function getTenseSetting(teacherId: string, studentId: string | null): Promise<TenseExplorerSetting | null> {
  const row = await findRow(teacherId, studentId)
  return row ? toSetting(row) : null
}

export async function saveTenseSetting(
  teacherId: string,
  studentId: string | null,
  input: { tenses: TenseId[]; allowCustomize: boolean },
): Promise<TenseExplorerSetting> {
  const values = { tenses: input.tenses, allow_customize: input.allowCustomize, updated_at: new Date().toISOString() }
  const existing = await findRow(teacherId, studentId)
  const { data, error } = existing
    ? await supabaseAdmin.from('tense_explorer_settings').update(values).eq('id', existing.id).select(COLUMNS).single()
    : await supabaseAdmin
        .from('tense_explorer_settings')
        .insert({ teacher_id: teacherId, student_id: studentId, ...values })
        .select(COLUMNS)
        .single()
  if (error) throw error
  return toSetting(data as SettingRow)
}

export async function deleteTenseSetting(teacherId: string, studentId: string | null): Promise<void> {
  let query = supabaseAdmin.from('tense_explorer_settings').delete().eq('teacher_id', teacherId)
  query = studentId ? query.eq('student_id', studentId) : query.is('student_id', null)
  const { error } = await query
  if (error) throw error
}

/**
 * The policy the explorer applies for a student: for each actively connected teacher, their
 * override for this student, else their class setting; combined by combineTenseSettings.
 */
export async function resolveTensePolicy(studentId: string): Promise<TenseExplorerPolicy | null> {
  const { data: links, error: linksError } = await supabaseAdmin
    .from('teacher_student_links')
    .select('teacher_id')
    .eq('student_id', studentId)
    .eq('status', 'active')
  if (linksError) throw linksError
  const teacherIds = (links ?? []).map((l) => l.teacher_id as string)
  if (teacherIds.length === 0) return null

  const { data, error } = await supabaseAdmin
    .from('tense_explorer_settings')
    .select(COLUMNS)
    .in('teacher_id', teacherIds)
    .or(`student_id.is.null,student_id.eq.${studentId}`)
  if (error) throw error

  const byTeacher = new Map<string, SettingRow>()
  for (const row of (data ?? []) as SettingRow[]) {
    const current = byTeacher.get(row.teacher_id)
    // A per-student override wins over the class setting.
    if (!current || (current.student_id === null && row.student_id !== null)) byTeacher.set(row.teacher_id, row)
  }
  return combineTenseSettings([...byTeacher.values()].map(toSetting))
}
