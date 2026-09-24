import { supabase } from './supabase'
import type {
  EnrichResult,
  VocabAssignResult,
  VocabList,
  VocabListDetail,
  VocabListInput,
  VocabListSummary,
  VocabListUpdateResult,
  VocabStudentListProgress,
} from './vocab'
import type { CefrLevel } from '../data/grammarCurriculum'

// Client for the teacher side of /api/vocab (Phase 2: word lists). See api/vocab.ts.

async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/** Thrown for 403/404: the list (or student) doesn't exist or isn't the caller's. */
export class VocabAccessError extends Error {}

/** Thrown for a 400 from the list save; `terms` names the offending terms, if any. */
export class VocabValidationError extends Error {
  constructor(
    message: string,
    readonly terms: string[] = [],
  ) {
    super(message)
  }
}

async function request<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const headers: Record<string, string> = { ...(await authHeader()) }
  if (init.body !== undefined) headers['Content-Type'] = 'application/json'
  const res = await fetch(`/api/vocab?${path}`, {
    method: init.method ?? 'GET',
    headers,
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  })
  if (res.ok) return res.json()

  const body = await res.json().catch(() => ({}))
  if (res.status === 403 || res.status === 404) throw new VocabAccessError(body.error ?? 'Not found')
  if (res.status === 400) throw new VocabValidationError(body.error ?? 'Invalid request', body.terms ?? [])
  throw new Error(body.error ?? `Request failed (${res.status})`)
}

export async function fetchVocabLists(archived = false): Promise<VocabListSummary[]> {
  const body = await request<{ lists: VocabListSummary[] }>(`action=lists${archived ? '&archived=true' : ''}`)
  return body.lists
}

export function fetchVocabList(id: string): Promise<VocabListDetail> {
  return request(`action=list&id=${encodeURIComponent(id)}`)
}

export function createVocabList(input: VocabListInput): Promise<VocabListDetail> {
  return request('action=list', { method: 'POST', body: input })
}

export function updateVocabList(id: string, input: VocabListInput): Promise<VocabListUpdateResult> {
  return request(`action=list&id=${encodeURIComponent(id)}`, { method: 'PUT', body: input })
}

export async function setVocabListArchived(id: string, archived: boolean): Promise<VocabList> {
  const body = await request<{ list: VocabList }>(`action=list&id=${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: { archived },
  })
  return body.list
}

export function assignVocabList(
  listId: string,
  target: { studentIds: string[] } | { allCurrentStudents: true },
): Promise<VocabAssignResult> {
  return request('action=assign', { method: 'POST', body: { listId, ...target } })
}

export async function fetchStudentVocabLists(studentId: string): Promise<VocabStudentListProgress[]> {
  const body = await request<{ lists: VocabStudentListProgress[] }>(
    `action=student-lists&studentId=${encodeURIComponent(studentId)}`,
  )
  return body.lists
}

/** One chunk — the editor calls this ENRICH_BATCH_SIZE terms at a time. */
export async function enrichVocabTerms(terms: string[], cefrHint?: CefrLevel | null): Promise<EnrichResult[]> {
  const body = await request<{ items: EnrichResult[] }>('action=enrich', {
    method: 'POST',
    body: { terms, ...(cefrHint ? { cefrHint } : {}) },
  })
  return body.items
}
