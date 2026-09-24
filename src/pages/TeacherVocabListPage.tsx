import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import PageHeading from '../components/PageHeading'
import AddTermsPanel, { inputClass, type AddWordError } from '../components/VocabLists/AddTermsPanel'
import PreviewTable from '../components/VocabLists/PreviewTable'
import AssignPanel from '../components/VocabLists/AssignPanel'
import ListProgress from '../components/VocabLists/ListProgress'
import { useLanguage } from '../lib/i18n'
import { fetchTeacherRoster, type RosterEntry } from '../lib/teacherApi'
import {
  VocabAccessError,
  VocabValidationError,
  createVocabList,
  enrichVocabTerms,
  fetchVocabList,
  setVocabListArchived,
  updateVocabList,
} from '../lib/vocabListsApi'
import {
  ENRICH_BATCH_SIZE,
  LIST_DESCRIPTION_MAX_LENGTH,
  LIST_MAX_ITEMS,
  LIST_TITLE_MAX_LENGTH,
  normalizeTerm,
  type VocabListDetail,
} from '../lib/vocab'
import {
  addImportedRows,
  applyEnrichment,
  rowsFromDetail,
  saveBlocker,
  termCommitted,
  toListInput,
  type DraftRow,
} from '../lib/vocabDraft'
import type { ImportedRow } from '../lib/vocabImport'
import { GRAMMAR_LEVELS, type CefrLevel } from '../data/grammarCurriculum'

type Meta = { title: string; description: string; cefrLevel: CefrLevel | '' }

const EMPTY_META: Meta = { title: '', description: '', cefrLevel: '' }

function metaFromDetail(d: VocabListDetail): Meta {
  return { title: d.list.title, description: d.list.description ?? '', cefrLevel: d.list.cefrLevel ?? '' }
}

/** Create (/teacher/lists/new) or edit (/teacher/lists/:listId) a word list (design §5.1). */
export default function TeacherVocabListPage() {
  const { listId } = useParams<{ listId: string }>()
  const navigate = useNavigate()
  const { t } = useLanguage()

  const [detail, setDetail] = useState<VocabListDetail | null>(null)
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'notFound' | 'error'>(listId ? 'loading' : 'ready')
  const [meta, setMeta] = useState<Meta>(EMPTY_META)
  const [rows, setRows] = useState<DraftRow[]>([])
  const [savedSnapshot, setSavedSnapshot] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [roster, setRoster] = useState<RosterEntry[] | null>(null)
  const [archiveError, setArchiveError] = useState(false)
  /** The list id whose data is already on screen (set after create, so we don't refetch it). */
  const loadedIdRef = useRef<string | null>(null)

  const applyDetail = useCallback((d: VocabListDetail) => {
    const m = metaFromDetail(d)
    const r = rowsFromDetail(d)
    loadedIdRef.current = d.list.id
    setDetail(d)
    setMeta(m)
    setRows(r)
    setSavedSnapshot(JSON.stringify(toListInput(m, r)))
    setLoadState('ready')
  }, [])

  useEffect(() => {
    // Both routes render this page in the same slot, so React keeps its state when the URL
    // changes: going from a list to /teacher/lists/new must start from a blank editor.
    if (!listId) {
      if (loadedIdRef.current) {
        loadedIdRef.current = null
        setDetail(null)
        setMeta(EMPTY_META)
        setRows([])
        setSavedSnapshot(null)
        setSaveMessage(null)
        setRoster(null)
      }
      return
    }
    if (listId === loadedIdRef.current) return
    let cancelled = false
    setLoadState('loading')
    fetchVocabList(listId)
      .then((d) => !cancelled && applyDetail(d))
      .catch((err) => !cancelled && setLoadState(err instanceof VocabAccessError ? 'notFound' : 'error'))
    return () => {
      cancelled = true
    }
  }, [listId, applyDetail])

  useEffect(() => {
    if (!listId) return
    fetchTeacherRoster()
      .then(setRoster)
      .catch(() => setRoster([]))
  }, [listId])

  // --- Enrichment queue: one ENRICH_BATCH_SIZE chunk at a time, filling rows as it returns.
  const enrichBusy = useRef(false)
  useEffect(() => {
    if (enrichBusy.current) return
    const batch = rows.filter((r) => r.enrich === 'pending').slice(0, ENRICH_BATCH_SIZE)
    if (batch.length === 0) return

    enrichBusy.current = true
    const keys = new Set(batch.map((r) => r.key))
    const requested = new Map(batch.map((r) => [r.key, normalizeTerm(r.term)]))
    setRows((rs) =>
      rs.map((r) => (keys.has(r.key) ? { ...r, enrich: 'loading', enrichedFor: requested.get(r.key)! } : r)),
    )

    enrichVocabTerms(
      batch.map((r) => r.term),
      meta.cefrLevel || null,
    )
      .then((results) => {
        const byTerm = new Map(results.map((x) => [x.termNormalized, x]))
        enrichBusy.current = false
        setRows((rs) =>
          rs.map((r) => (keys.has(r.key) && r.enrich === 'loading' ? applyEnrichment(r, byTerm.get(r.enrichedFor)) : r)),
        )
      })
      .catch((err) => {
        console.error('Word list enrichment failed', err)
        enrichBusy.current = false
        setRows((rs) => rs.map((r) => (keys.has(r.key) && r.enrich === 'loading' ? { ...r, enrich: 'failed' } : r)))
      })
    // meta.cefrLevel is only a hint for the next chunk; changing it shouldn't restart anything.
  }, [rows])

  const snapshot = useMemo(() => JSON.stringify(toListInput(meta, rows)), [meta, rows])
  const dirty = snapshot !== savedSnapshot
  const hasContent = rows.length > 0 || meta.title.trim() !== ''

  useEffect(() => {
    if (!dirty || !hasContent) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty, hasContent])

  function edited() {
    setSaveMessage(null)
    setSaveError(null)
  }

  function addWord(row: ImportedRow): AddWordError | null {
    const norm = normalizeTerm(row.term)
    if (!norm) return 'empty'
    if (rows.some((r) => normalizeTerm(r.term) === norm)) return 'duplicate'
    if (rows.length >= LIST_MAX_ITEMS) return 'full'
    setRows(addImportedRows(rows, [row]).rows)
    edited()
    return null
  }

  function importRows(incoming: ImportedRow[]) {
    const outcome = addImportedRows(rows, incoming)
    setRows(outcome.rows)
    if (outcome.added > 0) edited()
    return outcome
  }

  async function save() {
    setSaving(true)
    setSaveMessage(null)
    setSaveError(null)
    const input = toListInput(meta, rows)
    try {
      if (!listId) {
        const created = await createVocabList(input)
        applyDetail(created)
        setSaveMessage(t('vlSaved'))
        navigate(`/teacher/lists/${created.list.id}`, { replace: true })
      } else {
        const updated = await updateVocabList(listId, input)
        applyDetail(updated)
        const added = updated.addedTermCards?.cardsCreated ?? 0
        setSaveMessage(added > 0 ? t('vlSavedAddedCards', { n: added }) : t('vlSaved'))
      }
    } catch (err) {
      console.error('Failed to save word list', err)
      setSaveError(
        err instanceof VocabValidationError && err.terms.length > 0
          ? `${t('vlSaveFailed')} (${err.terms.join(', ')})`
          : t('vlSaveFailed'),
      )
    } finally {
      setSaving(false)
    }
  }

  async function toggleArchived() {
    if (!detail) return
    const archiving = !detail.list.archivedAt
    if (archiving && !window.confirm(t('vlConfirmArchive'))) return
    setArchiveError(false)
    try {
      const list = await setVocabListArchived(detail.list.id, archiving)
      setDetail({ ...detail, list })
    } catch (err) {
      console.error('Failed to archive word list', err)
      setArchiveError(true)
    }
  }

  async function reload() {
    if (!listId) return
    try {
      applyDetail(await fetchVocabList(listId))
    } catch (err) {
      console.error('Failed to reload word list', err)
    }
  }

  if (loadState === 'loading') {
    return <p className="py-24 text-center text-sm text-muted-foreground">{t('loading')}</p>
  }
  if (loadState === 'notFound' || loadState === 'error') {
    return (
      <div className="max-w-2xl space-y-4">
        <p className="text-sm text-muted-foreground">{loadState === 'notFound' ? t('vlNotFound') : t('vlLoadListFailed')}</p>
        <Link to="/teacher" className="text-sm text-[var(--teal-accent-strong)] hover:underline">
          {t('vlBackToDashboard')}
        </Link>
      </div>
    )
  }

  const blocker = saveBlocker(meta.title, rows)
  const archived = Boolean(detail?.list.archivedAt)

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeading
        title={detail ? detail.list.title : t('vlCrumbNew')}
        subtitle={t('wordLists')}
        actions={
          detail && (
            <button
              type="button"
              onClick={toggleArchived}
              className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-secondary"
            >
              {archived ? t('vlUnarchive') : t('vlArchive')}
            </button>
          )
        }
      />

      {archived && (
        <p className="rounded-2xl border border-border bg-secondary px-4 py-3 text-sm text-secondary-foreground">
          {t('vlArchivedNotice')}
        </p>
      )}
      {archiveError && <p className="text-sm text-red-600">{t('vlArchiveFailed')}</p>}

      <div className="space-y-3 rounded-2xl border border-border bg-card p-5">
        <h2 className="font-medium text-foreground">{t('vlDetails')}</h2>
        <div className="grid gap-3 sm:grid-cols-[1fr_11rem]">
          <label className="space-y-1 text-sm text-muted-foreground">
            <span>{t('vlTitle')}</span>
            <input
              value={meta.title}
              onChange={(e) => {
                setMeta({ ...meta, title: e.target.value })
                edited()
              }}
              placeholder={t('vlTitlePlaceholder')}
              maxLength={LIST_TITLE_MAX_LENGTH}
              className={inputClass}
            />
          </label>
          <label className="space-y-1 text-sm text-muted-foreground">
            <span>{t('vlLevel')}</span>
            <select
              value={meta.cefrLevel}
              onChange={(e) => {
                setMeta({ ...meta, cefrLevel: e.target.value as CefrLevel | '' })
                edited()
              }}
              className={inputClass}
            >
              <option value="">{t('vlLevelNone')}</option>
              {GRAMMAR_LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="block space-y-1 text-sm text-muted-foreground">
          <span>{t('vlDescription')}</span>
          <textarea
            value={meta.description}
            onChange={(e) => {
              setMeta({ ...meta, description: e.target.value })
              edited()
            }}
            rows={2}
            maxLength={LIST_DESCRIPTION_MAX_LENGTH}
            className={inputClass}
          />
        </label>
      </div>

      <AddTermsPanel onAddWord={addWord} onImport={importRows} />

      <PreviewTable
        rows={rows}
        onChange={(key, patch) => {
          setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)))
          edited()
        }}
        onTermCommit={(key) => setRows((rs) => rs.map((r) => (r.key === key ? termCommitted(r) : r)))}
        onRemove={(key) => {
          setRows((rs) => rs.filter((r) => r.key !== key))
          edited()
        }}
      />

      <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center gap-3 border-t border-border bg-background/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border">
        <button
          type="button"
          onClick={save}
          disabled={saving || blocker !== null || !dirty}
          className="rounded-lg bg-[var(--teal-accent)] px-5 py-2 text-sm font-semibold text-primary hover:bg-[var(--teal-accent-strong)] disabled:opacity-40"
        >
          {saving ? t('vlSaving') : t('vlSave')}
        </button>
        {blocker ? (
          <span className="text-sm text-muted-foreground">{t(blocker.key, blocker.vars)}</span>
        ) : saveError ? (
          <span className="text-sm text-red-600">{saveError}</span>
        ) : saveMessage && !dirty ? (
          <span className="text-sm text-emerald-700" role="status">
            {saveMessage}
          </span>
        ) : null}
      </div>

      {detail && !archived && roster && (
        <AssignPanel
          listId={detail.list.id}
          roster={roster}
          assignedIds={new Set(detail.assignments.map((a) => a.studentId))}
          blockedReason={dirty ? t('vlAssignSaveFirst') : null}
          onAssigned={reload}
        />
      )}

      {detail && detail.assignments.length > 0 && (
        <div className="space-y-3 rounded-2xl border border-border bg-card p-5">
          <h2 className="font-medium text-foreground">{t('vlProgressHeading')}</h2>
          <ul className="divide-y divide-border">
            {detail.assignments.map((a) => (
              <li key={a.studentId} className="space-y-1 py-3 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  {a.connected ? (
                    <Link
                      to={`/teacher/students/${a.studentId}`}
                      className="min-w-0 break-all text-sm font-medium text-foreground hover:underline"
                    >
                      {a.email}
                    </Link>
                  ) : (
                    <span className="min-w-0 break-all text-sm font-medium text-muted-foreground">
                      {a.email} ({t('vlDisconnected')})
                    </span>
                  )}
                </div>
                <ListProgress progress={a} completedAt={a.completedAt} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
