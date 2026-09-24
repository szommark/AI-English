import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getUserFromRequest, supabaseAdmin } from './_lib/supabaseAdmin.js'
import { getUserRole } from './_lib/roles.js'
import { enrichTerms } from './_lib/vocabEnrichment.js'
import { CEFR_LEVELS, prepareListItems, prepareListMeta, type PreparedListItem } from './_lib/vocabListInput.js'
import {
  computeListProgress,
  fetchAllPages,
  isComplete,
  loadListTerms,
  loadProgressCards,
  recordCompletions,
  refreshListCompletion,
} from './_lib/vocabListProgress.js'
import { ReviewError, buildSession, loadOverview, recordReview } from './_lib/vocabPractice.js'
import type { CefrLevel } from './_lib/prompts.js'
import {
  LIST_MAX_ITEMS,
  PRACTICE_EXERCISES,
  normalizeTerm,
  type PracticeExercise,
  type MyWord,
  type StudentListProgress,
  type VocabOrigin,
  type VocabAssignResult,
  type VocabCardCounts,
  type VocabList,
  type VocabListDetail,
  type VocabListItemRow,
  type VocabListSummary,
  type VocabListUpdateResult,
  type VocabPos,
  type VocabStudentListProgress,
} from '../src/lib/vocab.js'

// Single Vercel function for the whole Vocabulary Builder surface
// (docs/vocabulary-builder-design.md §9), multiplexed by ?action= to stay under Vercel
// Hobby's 12-serverless-function cap — same pattern as api/connect.ts.
//
// Phase 1: enrich (teachers and admins).
// Phase 2 (teacher-only; everyone else gets 403):
//   GET    lists[&archived=true]        the caller's lists (active by default, or archived)
//   GET    list&id=                     one list: items, assignments, per-student progress
//   POST   list                         create  { title, description?, cefrLevel?, items }
//   PUT    list&id=                     update  (same body; replaces the ordered items)
//   PATCH  list&id=                     archive { archived: boolean } — no hard delete yet
//   POST   assign                       { listId, studentIds } | { listId, allCurrentStudents: true }
//   GET    student-lists&studentId=     this teacher's lists assigned to one connected student
// A list that doesn't exist and one that belongs to another teacher both return the same
// 404, like handleStudentDetail in api/connect.ts.
// Phase 3 (any signed-in user, on their own cards only):
//   GET    overview                     due / new-today counts (also the landing tile badge)
//   GET    session                      the cards for one practice session
//   POST   review                       { cardId, exercise, correct, usedHint, responseMs }
//   GET    my-lists                     teacher lists assigned to the caller, with progress
// Phase 4 (own cards only):
//   GET    cards                        every card in the caller's deck ("My words")
//   POST   remove                       { cardId } — deletes a Tutor Bot / catalog card
//   POST   suspend                      { cardId, suspended } — teacher-origin cards are
//                                        suspended instead of removed, so list progress
//                                        stays honest (design §5.2)

const CEFR_SET = new Set<string>(CEFR_LEVELS)
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

interface EnrichRequestBody {
  terms?: unknown
  cefrHint?: unknown
}

async function handleEnrich(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const role = await getUserRole(userId)
  if (role !== 'teacher' && role !== 'admin') {
    res.status(403).json({ error: 'Forbidden' })
    return
  }

  const body = (req.body ?? {}) as EnrichRequestBody
  if (!Array.isArray(body.terms) || !body.terms.every((t): t is string => typeof t === 'string')) {
    res.status(400).json({ error: 'terms must be an array of strings' })
    return
  }
  const distinctCount = new Set(body.terms.map(normalizeTerm).filter(Boolean)).size
  if (distinctCount === 0) {
    res.status(400).json({ error: 'terms is empty' })
    return
  }
  if (distinctCount > LIST_MAX_ITEMS) {
    res.status(400).json({ error: `At most ${LIST_MAX_ITEMS} distinct terms per request` })
    return
  }
  if (body.cefrHint !== undefined && !(typeof body.cefrHint === 'string' && CEFR_SET.has(body.cefrHint))) {
    res.status(400).json({ error: 'Invalid cefrHint' })
    return
  }

  // 200 even when some or all items failed — each item carries its own status. The list
  // editor calls this in chunks of ENRICH_BATCH_SIZE (one model batch per request), so a
  // request stays well inside the function time limit.
  const items = await enrichTerms(body.terms, {
    userId,
    origin: 'teacher',
    cefrHint: body.cefrHint as CefrLevel | undefined,
  })
  res.status(200).json({ items })
}

// --- Teacher word lists (Phase 2) --------------------------------------------------------

interface ListRow {
  id: string
  teacher_id: string
  title: string
  description: string | null
  cefr_level: CefrLevel | null
  archived_at: string | null
  created_at: string
  updated_at: string
}

interface ItemRow {
  id: string
  term: string
  term_normalized: string
  meaning_hu: string | null
  definition_en: string | null
  example_en: string | null
  pos: VocabPos | null
  cefr_level: CefrLevel | null
}

interface AssignmentRow {
  list_id: string
  student_id: string
  assigned_at: string
  completed_at: string | null
}

interface AssignRpcRow {
  assignments_created: number
  cards_created: number
  cards_upgraded: number
  cards_unchanged: number
}

class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly body: Record<string, unknown>,
  ) {
    super(String(body.error))
  }
}

const notFound = () => new HttpError(404, { error: 'Not found' })

function toList(row: ListRow): VocabList {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    cefrLevel: row.cefr_level,
    archivedAt: row.archived_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

async function requireTeacher(userId: string) {
  if ((await getUserRole(userId)) !== 'teacher') throw new HttpError(403, { error: 'Forbidden' })
}

/** The caller's list, or a 404 that doesn't reveal whether it exists for someone else. */
async function loadOwnedList(listId: unknown, teacherId: string): Promise<ListRow> {
  if (typeof listId !== 'string' || !UUID_RE.test(listId)) throw notFound()
  const { data, error } = await supabaseAdmin
    .from('vocab_lists')
    .select('*')
    .eq('id', listId)
    .eq('teacher_id', teacherId)
    .maybeSingle()
  if (error) throw error
  if (!data) throw notFound()
  return data as ListRow
}

async function activeStudentIds(teacherId: string): Promise<Set<string>> {
  const { data, error } = await supabaseAdmin
    .from('teacher_student_links')
    .select('student_id')
    .eq('teacher_id', teacherId)
    .eq('status', 'active')
  if (error) throw error
  return new Set((data ?? []).map((l) => l.student_id as string))
}

/** A teacher's roster is small at this app's scale — same per-user lookup as api/connect.ts. */
async function emailsFor(studentIds: string[]): Promise<Map<string, string>> {
  const entries = await Promise.all(
    studentIds.map(async (id) => {
      const { data } = await supabaseAdmin.auth.admin.getUserById(id)
      return [id, data.user?.email ?? 'unknown'] as const
    }),
  )
  return new Map(entries)
}

function toCardCounts(row: AssignRpcRow): VocabCardCounts {
  return { cardsCreated: row.cards_created, cardsUpgraded: row.cards_upgraded, cardsUnchanged: row.cards_unchanged }
}

async function runAssign(listId: string, studentIds: string[]): Promise<AssignRpcRow> {
  const { data, error } = await supabaseAdmin.rpc('assign_vocab_list', {
    p_list_id: listId,
    p_student_ids: studentIds,
  })
  if (error) throw error
  const row = (Array.isArray(data) ? data[0] : data) as AssignRpcRow | undefined
  if (!row) throw new Error('assign_vocab_list returned no row')
  return row
}

async function loadListDetail(list: ListRow): Promise<VocabListDetail> {
  const [{ data: itemRows, error: itemsError }, { data: assignmentRows, error: assignmentsError }, active] =
    await Promise.all([
      supabaseAdmin
        .from('vocab_list_items')
        .select('position, vocab_items(id, term, term_normalized, meaning_hu, definition_en, example_en, pos, cefr_level)')
        .eq('list_id', list.id)
        .order('position')
        .order('item_id'),
      supabaseAdmin
        .from('vocab_list_assignments')
        .select('list_id, student_id, assigned_at, completed_at')
        .eq('list_id', list.id)
        .order('assigned_at'),
      activeStudentIds(list.teacher_id),
    ])
  if (itemsError) throw itemsError
  if (assignmentsError) throw assignmentsError

  const items: VocabListItemRow[] = []
  for (const row of (itemRows ?? []) as unknown as { position: number; vocab_items: ItemRow | null }[]) {
    const i = row.vocab_items
    if (!i) continue
    items.push({
      itemId: i.id,
      term: i.term,
      termNormalized: i.term_normalized,
      meaningHu: i.meaning_hu,
      definitionEn: i.definition_en,
      exampleEn: i.example_en,
      pos: i.pos,
      cefrLevel: i.cefr_level,
      position: row.position,
    })
  }

  const assignments = (assignmentRows ?? []) as AssignmentRow[]
  const studentIds = assignments.map((a) => a.student_id)
  const terms = items.map((i) => i.termNormalized)
  const [cards, emails] = await Promise.all([loadProgressCards(studentIds, terms), emailsFor(studentIds)])
  const progress = computeListProgress(terms, studentIds, cards)
  // Catch up any completion a review failed to record (set once, never cleared).
  const catchUp = new Map(
    [...progress].filter(([id, p]) => isComplete(p) && !assignments.find((a) => a.student_id === id)?.completed_at),
  )
  const completedNow = catchUp.size > 0 ? await recordCompletions(list.id, catchUp) : new Map<string, string>()

  return {
    list: toList(list),
    items,
    assignments: assignments.map((a) => ({
      studentId: a.student_id,
      email: emails.get(a.student_id) ?? 'unknown',
      assignedAt: a.assigned_at,
      completedAt: a.completed_at ?? completedNow.get(a.student_id) ?? null,
      connected: active.has(a.student_id),
      ...progress.get(a.student_id)!,
    })),
  }
}

async function handleLists(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'GET') throw new HttpError(405, { error: 'Method not allowed' })
  await requireTeacher(userId)

  const archived = req.query.archived === 'true'
  let query = supabaseAdmin.from('vocab_lists').select('*').eq('teacher_id', userId)
  query = archived ? query.not('archived_at', 'is', null) : query.is('archived_at', null)
  const { data, error } = await query.order('updated_at', { ascending: false })
  if (error) throw error
  const lists = (data ?? []) as ListRow[]
  const listIds = lists.map((l) => l.id)

  const [termsByList, assignments] = await Promise.all([
    loadListTerms(listIds),
    listIds.length === 0
      ? Promise.resolve([] as AssignmentRow[])
      : fetchAllPages<AssignmentRow>((from, to) =>
          supabaseAdmin
            .from('vocab_list_assignments')
            .select('list_id, student_id, assigned_at, completed_at')
            .in('list_id', listIds)
            .order('list_id')
            .order('student_id')
            .range(from, to),
        ),
  ])

  const studentsByList = new Map<string, AssignmentRow[]>(listIds.map((id) => [id, []]))
  for (const a of assignments) studentsByList.get(a.list_id)?.push(a)
  const cards = await loadProgressCards(
    [...new Set(assignments.map((a) => a.student_id))],
    [...termsByList.values()].flat(),
  )

  const summaries: VocabListSummary[] = lists.map((l) => {
    const terms = termsByList.get(l.id) ?? []
    const listAssignments = studentsByList.get(l.id) ?? []
    const progress = computeListProgress(
      terms,
      listAssignments.map((a) => a.student_id),
      cards,
    )
    let learned = 0
    for (const p of progress.values()) learned += p.learned
    return {
      ...toList(l),
      termCount: new Set(terms).size,
      assignedCount: listAssignments.length,
      completedCount: listAssignments.filter((a) => a.completed_at).length,
      learned,
    }
  })

  res.status(200).json({ lists: summaries })
}

/** Upserts the teacher's items and returns their ids in list order. */
async function upsertItems(teacherId: string, items: PreparedListItem[]): Promise<string[]> {
  const { data, error } = await supabaseAdmin.rpc('upsert_teacher_vocab_items', {
    p_teacher_id: teacherId,
    p_items: items,
  })
  if (error) throw error
  const idByTerm = new Map(((data ?? []) as ItemRow[]).map((r) => [r.term_normalized, r.id]))
  return items.map((i) => {
    const id = idByTerm.get(i.term_normalized)
    if (!id) throw new Error(`upsert_teacher_vocab_items returned no row for "${i.term_normalized}"`)
    return id
  })
}

/**
 * Makes vocab_list_items exactly `itemIds`, in order. Upserts positions first and only
 * then removes dropped items, so a failure part-way never leaves the list emptied.
 */
async function replaceListItems(listId: string, itemIds: string[]) {
  const { error } = await supabaseAdmin
    .from('vocab_list_items')
    .upsert(
      itemIds.map((item_id, position) => ({ list_id: listId, item_id, position })),
      { onConflict: 'list_id,item_id' },
    )
  if (error) throw error

  const { error: deleteError } = await supabaseAdmin
    .from('vocab_list_items')
    .delete()
    .eq('list_id', listId)
    .not('item_id', 'in', `(${itemIds.join(',')})`)
  if (deleteError) throw deleteError
}

function parseListBody(body: unknown) {
  const record = (typeof body === 'object' && body !== null ? body : {}) as Record<string, unknown>
  const meta = prepareListMeta(record)
  if (!meta.ok) throw new HttpError(400, { error: meta.error })
  const items = prepareListItems(record.items)
  if (!items.ok) throw new HttpError(400, { error: items.error, terms: items.terms })
  return { meta: meta.value, items: items.value }
}

async function createList(req: VercelRequest, res: VercelResponse, userId: string) {
  const { meta, items } = parseListBody(req.body)

  const { data, error } = await supabaseAdmin
    .from('vocab_lists')
    .insert({ teacher_id: userId, ...meta })
    .select('*')
    .single()
  if (error) throw error
  const list = data as ListRow

  try {
    await replaceListItems(list.id, await upsertItems(userId, items))
  } catch (err) {
    // The list was created a moment ago and has no assignments; don't leave it half-made.
    await supabaseAdmin.from('vocab_lists').delete().eq('id', list.id)
    throw err
  }

  res.status(201).json(await loadListDetail(list))
}

async function updateList(req: VercelRequest, res: VercelResponse, userId: string) {
  const list = await loadOwnedList(req.query.id, userId)
  const { meta, items } = parseListBody(req.body)

  const { data: before, error: beforeError } = await supabaseAdmin
    .from('vocab_list_items')
    .select('item_id')
    .eq('list_id', list.id)
  if (beforeError) throw beforeError
  const previousIds = new Set((before ?? []).map((r) => r.item_id as string))

  const itemIds = await upsertItems(userId, items)
  await replaceListItems(list.id, itemIds)

  const { data: updated, error: updateError } = await supabaseAdmin
    .from('vocab_lists')
    .update({ ...meta, updated_at: new Date().toISOString() })
    .eq('id', list.id)
    .select('*')
    .single()
  if (updateError) throw updateError

  // Added terms get cards for the students the list is assigned to (design §5.1) — only
  // those still connected: a disconnected student keeps their assignment and progress
  // but gets no new cards. Removed terms leave existing cards alone and simply drop out
  // of list progress (computed from the current items).
  let addedTermCards: VocabCardCounts | null = null
  const added = itemIds.some((id) => !previousIds.has(id))
  const { data: assigned, error: assignedError } = await supabaseAdmin
    .from('vocab_list_assignments')
    .select('student_id')
    .eq('list_id', list.id)
  if (assignedError) throw assignedError
  if (added && (assigned ?? []).length > 0) {
    const active = await activeStudentIds(userId)
    const targets = (assigned ?? []).map((a) => a.student_id as string).filter((id) => active.has(id))
    if (targets.length > 0) addedTermCards = toCardCounts(await runAssign(list.id, targets))
  }
  // Removing the last unlearned term can complete an assignment.
  if ((assigned ?? []).length > 0) await refreshListCompletion(list.id)

  const result: VocabListUpdateResult = { ...(await loadListDetail(updated as ListRow)), addedTermCards }
  res.status(200).json(result)
}

async function archiveList(req: VercelRequest, res: VercelResponse, userId: string) {
  const list = await loadOwnedList(req.query.id, userId)
  const archived = (req.body ?? {}).archived
  if (typeof archived !== 'boolean') throw new HttpError(400, { error: 'archived must be a boolean' })

  const { data, error } = await supabaseAdmin
    .from('vocab_lists')
    .update({ archived_at: archived ? new Date().toISOString() : null, updated_at: new Date().toISOString() })
    .eq('id', list.id)
    .select('*')
    .single()
  if (error) throw error
  res.status(200).json({ list: toList(data as ListRow) })
}

async function handleList(req: VercelRequest, res: VercelResponse, userId: string) {
  await requireTeacher(userId)
  switch (req.method) {
    case 'GET':
      res.status(200).json(await loadListDetail(await loadOwnedList(req.query.id, userId)))
      return
    case 'POST':
      await createList(req, res, userId)
      return
    case 'PUT':
      await updateList(req, res, userId)
      return
    case 'PATCH':
      await archiveList(req, res, userId)
      return
    default:
      throw new HttpError(405, { error: 'Method not allowed' })
  }
}

async function handleAssign(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'POST') throw new HttpError(405, { error: 'Method not allowed' })
  await requireTeacher(userId)

  const body = (req.body ?? {}) as { listId?: unknown; studentIds?: unknown; allCurrentStudents?: unknown }
  const list = await loadOwnedList(body.listId, userId)
  if (list.archived_at) throw new HttpError(400, { error: 'Archived lists cannot be assigned' })

  const active = await activeStudentIds(userId)
  let studentIds: string[]
  if (body.allCurrentStudents === true) {
    // A snapshot of the current roster: students who connect later are not added (design §5.1).
    studentIds = [...active]
  } else if (Array.isArray(body.studentIds) && body.studentIds.every((s): s is string => typeof s === 'string')) {
    studentIds = [...new Set(body.studentIds)]
    // Same answer whether a student doesn't exist or just isn't connected to this teacher.
    if (studentIds.some((id) => !active.has(id))) {
      throw new HttpError(400, { error: 'Every student must be connected to you' })
    }
  } else {
    throw new HttpError(400, { error: 'Send studentIds or allCurrentStudents: true' })
  }
  if (studentIds.length === 0) throw new HttpError(400, { error: 'No students to assign' })

  const row = await runAssign(list.id, studentIds)
  // A student who already learned every term elsewhere completes the list immediately.
  await refreshListCompletion(list.id, studentIds)

  const result: VocabAssignResult = {
    studentCount: studentIds.length,
    assignmentsCreated: row.assignments_created,
    ...toCardCounts(row),
  }
  res.status(200).json(result)
}

async function handleStudentLists(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'GET') throw new HttpError(405, { error: 'Method not allowed' })
  await requireTeacher(userId)

  const studentId = req.query.studentId
  if (typeof studentId !== 'string' || !UUID_RE.test(studentId)) throw notFound()
  // Same 404 whether the student doesn't exist or isn't connected (handleStudentDetail).
  if (!(await activeStudentIds(userId)).has(studentId)) throw notFound()

  const { data: listRows, error: listsError } = await supabaseAdmin
    .from('vocab_lists')
    .select('*')
    .eq('teacher_id', userId)
  if (listsError) throw listsError
  const listsById = new Map(((listRows ?? []) as ListRow[]).map((l) => [l.id, l]))
  if (listsById.size === 0) {
    res.status(200).json({ lists: [] })
    return
  }

  const { data: assignmentRows, error } = await supabaseAdmin
    .from('vocab_list_assignments')
    .select('list_id, student_id, assigned_at, completed_at')
    .eq('student_id', studentId)
    .in('list_id', [...listsById.keys()])
    .order('assigned_at', { ascending: false })
  if (error) throw error
  const assignments = (assignmentRows ?? []) as AssignmentRow[]

  const termsByList = await loadListTerms(assignments.map((a) => a.list_id))
  const cards = await loadProgressCards([studentId], [...termsByList.values()].flat())

  const lists: VocabStudentListProgress[] = assignments.map((a) => {
    const l = listsById.get(a.list_id)!
    return {
      listId: l.id,
      title: l.title,
      cefrLevel: l.cefr_level,
      archivedAt: l.archived_at,
      assignedAt: a.assigned_at,
      completedAt: a.completed_at,
      ...computeListProgress(termsByList.get(a.list_id) ?? [], [studentId], cards).get(studentId)!,
    }
  })
  res.status(200).json({ lists })
}

// --- Student practice (Phase 3) ----------------------------------------------------------

async function handleOverview(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'GET') throw new HttpError(405, { error: 'Method not allowed' })
  res.status(200).json(await loadOverview(userId))
}

async function handleSession(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'GET') throw new HttpError(405, { error: 'Method not allowed' })
  res.status(200).json(await buildSession(userId))
}

/** A generous upper bound; anything longer is an abandoned tab, not a response time. */
const MAX_RESPONSE_MS = 10 * 60 * 1000

async function handleReview(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'POST') throw new HttpError(405, { error: 'Method not allowed' })
  const body = (req.body ?? {}) as Record<string, unknown>

  if (typeof body.cardId !== 'string' || !UUID_RE.test(body.cardId)) throw notFound()
  if (!(PRACTICE_EXERCISES as readonly unknown[]).includes(body.exercise)) {
    throw new HttpError(400, { error: 'Invalid exercise' })
  }
  if (typeof body.correct !== 'boolean' || typeof body.usedHint !== 'boolean') {
    throw new HttpError(400, { error: 'correct and usedHint must be booleans' })
  }
  const ms = body.responseMs
  const responseMs = typeof ms === 'number' && Number.isFinite(ms) && ms >= 0 ? Math.min(Math.round(ms), MAX_RESPONSE_MS) : null

  try {
    const result = await recordReview(userId, {
      cardId: body.cardId,
      exercise: body.exercise as PracticeExercise,
      correct: body.correct,
      usedHint: body.usedHint,
      responseMs,
    })
    res.status(200).json(result)
  } catch (err) {
    if (err instanceof ReviewError) throw new HttpError(err.status, { error: err.message })
    throw err
  }
}

async function handleMyLists(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'GET') throw new HttpError(405, { error: 'Method not allowed' })

  const { data, error } = await supabaseAdmin
    .from('vocab_list_assignments')
    .select('list_id, assigned_at, completed_at, vocab_lists(id, teacher_id, title, description, cefr_level)')
    .eq('student_id', userId)
    .order('assigned_at', { ascending: false })
  if (error) throw error
  const rows = (data ?? []) as unknown as (AssignmentRow & {
    vocab_lists: Pick<ListRow, 'id' | 'teacher_id' | 'title' | 'description' | 'cefr_level'> | null
  })[]
  const assignments = rows.filter((r) => r.vocab_lists)

  const listIds = assignments.map((a) => a.list_id)
  const [termsByList, emails] = await Promise.all([
    loadListTerms(listIds),
    emailsFor([...new Set(assignments.map((a) => a.vocab_lists!.teacher_id))]),
  ])
  const cards = await loadProgressCards([userId], [...termsByList.values()].flat())

  const lists: StudentListProgress[] = []
  for (const a of assignments) {
    const l = a.vocab_lists!
    const progress = computeListProgress(termsByList.get(a.list_id) ?? [], [userId], cards)
    let completedAt = a.completed_at
    // Catch up a completion a review failed to record (set once, never cleared).
    if (!completedAt && isComplete(progress.get(userId)!)) {
      completedAt = (await recordCompletions(a.list_id, progress)).get(userId) ?? null
    }
    lists.push({
      listId: l.id,
      title: l.title,
      description: l.description,
      cefrLevel: l.cefr_level,
      teacherEmail: emails.get(l.teacher_id) ?? 'unknown',
      assignedAt: a.assigned_at,
      completedAt,
      ...progress.get(userId)!,
    })
  }
  res.status(200).json({ lists })
}

// --- My words (Phase 4) --------------------------------------------------------------------

interface MyWordRow {
  id: string
  origin: VocabOrigin
  state: number
  first_learned_at: string | null
  suspended: boolean
  context_original: string | null
  context_corrected: string | null
  due: string
  created_at: string
  vocab_items: { term: string; meaning_hu: string | null; example_en: string | null } | null
}

async function handleCards(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'GET') throw new HttpError(405, { error: 'Method not allowed' })

  const rows = await fetchAllPages<MyWordRow>((from, to) =>
    supabaseAdmin
      .from('vocab_cards')
      .select(
        'id, origin, state, first_learned_at, suspended, context_original, context_corrected, due, created_at, vocab_items(term, meaning_hu, example_en)',
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .order('id')
      .range(from, to) as unknown as PromiseLike<{ data: MyWordRow[] | null; error: unknown }>,
  )

  const cards: MyWord[] = rows
    .filter((r) => r.vocab_items)
    .map((r) => ({
      cardId: r.id,
      term: r.vocab_items!.term,
      meaningHu: r.vocab_items!.meaning_hu,
      exampleEn: r.vocab_items!.example_en,
      origin: r.origin,
      stage: r.first_learned_at ? 'learned' : r.state === 0 ? 'new' : 'learning',
      suspended: r.suspended,
      contextOriginal: r.context_original,
      contextCorrected: r.context_corrected,
      due: r.due,
      createdAt: r.created_at,
    }))
  res.status(200).json({ cards })
}

function cardIdFrom(body: Record<string, unknown>): string {
  if (typeof body.cardId !== 'string' || !UUID_RE.test(body.cardId)) throw notFound()
  return body.cardId
}

async function handleRemove(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'POST') throw new HttpError(405, { error: 'Method not allowed' })
  const cardId = cardIdFrom((req.body ?? {}) as Record<string, unknown>)

  const { data: card, error } = await supabaseAdmin
    .from('vocab_cards')
    .select('id, origin')
    .eq('id', cardId)
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  if (!card) throw notFound()
  if (card.origin === 'teacher') {
    throw new HttpError(400, { error: 'Words from a teacher list can be suspended, not removed' })
  }

  // Hard delete; its vocab_reviews rows cascade.
  const { error: deleteError } = await supabaseAdmin.from('vocab_cards').delete().eq('id', cardId).eq('user_id', userId)
  if (deleteError) throw deleteError
  res.status(200).json({ ok: true })
}

async function handleSuspend(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'POST') throw new HttpError(405, { error: 'Method not allowed' })
  const body = (req.body ?? {}) as Record<string, unknown>
  const cardId = cardIdFrom(body)
  if (typeof body.suspended !== 'boolean') throw new HttpError(400, { error: 'suspended must be a boolean' })

  const { data, error } = await supabaseAdmin
    .from('vocab_cards')
    .update({ suspended: body.suspended, updated_at: new Date().toISOString() })
    .eq('id', cardId)
    .eq('user_id', userId)
    .select('id')
  if (error) throw error
  if (!data || data.length === 0) throw notFound()
  res.status(200).json({ suspended: body.suspended })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await getUserFromRequest(req)
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  try {
    switch (req.query.action) {
      case 'enrich':
        await handleEnrich(req, res, user.id)
        return
      case 'lists':
        await handleLists(req, res, user.id)
        return
      case 'list':
        await handleList(req, res, user.id)
        return
      case 'assign':
        await handleAssign(req, res, user.id)
        return
      case 'student-lists':
        await handleStudentLists(req, res, user.id)
        return
      case 'overview':
        await handleOverview(req, res, user.id)
        return
      case 'session':
        await handleSession(req, res, user.id)
        return
      case 'review':
        await handleReview(req, res, user.id)
        return
      case 'my-lists':
        await handleMyLists(req, res, user.id)
        return
      case 'cards':
        await handleCards(req, res, user.id)
        return
      case 'remove':
        await handleRemove(req, res, user.id)
        return
      case 'suspend':
        await handleSuspend(req, res, user.id)
        return
      default:
        res.status(404).json({ error: 'Not found' })
    }
  } catch (err) {
    if (err instanceof HttpError) {
      res.status(err.status).json(err.body)
      return
    }
    console.error('api/vocab failed', { action: req.query.action, error: err })
    res.status(500).json({ error: 'Something went wrong' })
  }
}
