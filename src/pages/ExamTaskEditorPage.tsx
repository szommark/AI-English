import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import PageHeading from '../components/PageHeading'
import AudioPanel from '../components/ExamTaskMaker/AudioPanel'
import CheckPanel from '../components/ExamTaskMaker/CheckPanel'
import ChecksPanel from '../components/ExamTaskMaker/ChecksPanel'
import ItemsEditor from '../components/ExamTaskMaker/ItemsEditor'
import ResultsView from '../components/ExamTaskMaker/ResultsView'
import ScriptView from '../components/ExamTaskMaker/ScriptView'
import SharePanel from '../components/ExamTaskMaker/SharePanel'
import StatusChip from '../components/ExamTaskMaker/StatusChip'
import StartPanel, { type LoadedDraft } from '../components/ExamTaskMaker/StartPanel'
import TestRunner from '../components/ExamTaskMaker/TestRunner'
import { cardClass, hintClass, inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from '../components/TeacherTools/ui'
import { pick, useExamTaskCopy } from '../data/examTaskCopy'
import { CRITERIA_BY_ID } from '../data/examTaskCriteria'
import { deleteExamTask, fetchExamTask, publishExamTask, reviseExamTask, saveExamTask, uploadTaskAudio, type ExamTaskDetail } from '../lib/examTaskApi'
import {
  EXAM_FIELDS,
  emptyListeningContent,
  levelSpec,
  standardInstruction,
  TASK_LEVELS,
  type ExamField,
  type ListeningFormat,
  type ListeningTaskContent,
  type TaskLevel,
  type TaskOrigin,
} from '../lib/examTasks'
import { blockerCount, checkListeningTask } from '../lib/listeningChecks'
import { TeacherToolsError } from '../lib/teacherToolsApi'

interface Draft {
  title: string
  sourceRef: string
  origin: TaskOrigin
  level: TaskLevel
  field: ExamField
  content: ListeningTaskContent
}

type Tab = 'create' | 'test' | 'results'

/**
 * /teacher/tools/exam-tasks/new and /:taskId. The owner gets three tabs — Create (generate, upload
 * or paste, edit, automatic checks, recording, testers), Test (take it as a candidate and review
 * it) and Results (everyone's tests). A teacher the task was sent to only gets the test.
 */
export default function ExamTaskEditorPage() {
  const { taskId } = useParams()
  const { c } = useExamTaskCopy()
  const [detail, setDetail] = useState<ExamTaskDetail | null>(null)
  const [failed, setFailed] = useState<'notFound' | 'inRevision' | 'error' | null>(null)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    if (!taskId) return
    let cancelled = false
    fetchExamTask(taskId)
      .then((d) => !cancelled && setDetail(d))
      .catch((err) => {
        if (cancelled) return
        // 409 task_in_revision: a reviewer opening a task its creator put back to draft.
        const code = err instanceof TeacherToolsError ? (err.status === 404 ? 'notFound' : err.code === 'task_in_revision' ? 'inRevision' : 'error') : 'error'
        setFailed(code)
      })
    return () => {
      cancelled = true
    }
  }, [taskId, reload])

  const back = (
    <Link to="/teacher/tools/exam-tasks" className="text-sm text-muted-foreground hover:text-foreground">
      {c('backToList')}
    </Link>
  )

  if (!taskId) return <Editor detail={null} back={back} onReload={() => setReload((n) => n + 1)} />
  if (failed) return <div className="space-y-4">{back}<p className={`text-sm ${failed === 'inRevision' ? 'text-muted-foreground' : 'text-red-600'}`}>{failed === 'notFound' ? c('notFound') : failed === 'inRevision' ? c('inRevision') : c('loadError')}</p></div>
  if (!detail) return <p className="text-sm text-muted-foreground">{c('loading')}</p>

  if (!detail.task.isOwner) {
    return (
      <div className="max-w-4xl space-y-6">
        {back}
        <PageHeading
          title={detail.task.title}
          subtitle={`${detail.task.level} · ${c(detail.task.content.format === 'notes' ? 'format_notes' : 'format_true_false')} · ${c('fromTeacher', { email: detail.task.ownerEmail ?? '' })}`}
        />
        <TestRunner task={detail.task} myReview={detail.myReview} onSaved={(review) => setDetail({ ...detail, myReview: review })} />
      </div>
    )
  }
  return <Editor key={detail.task.id} detail={detail} back={back} onReload={() => setReload((n) => n + 1)} />
}

function Editor({ detail, back, onReload }: { detail: ExamTaskDetail | null; back: React.ReactNode; onReload: () => void }) {
  const { c, lang } = useExamTaskCopy()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const location = useLocation()
  const task = detail?.task ?? null
  // /new?mode=check: checking a task made outside the app (script + task sheet + optional MP3).
  const checkMode = !task && params.get('mode') === 'check'
  const tab: Tab = task ? ((['create', 'test', 'results'] as const).find((t) => t === params.get('tab')) ?? 'create') : 'create'

  const [draft, setDraft] = useState<Draft>(() =>
    task
      ? { title: task.title, sourceRef: task.sourceRef, origin: task.origin, level: task.level, field: task.field, content: task.content }
      : { title: '', sourceRef: '', origin: 'pasted', level: 'B2', field: 'general', content: emptyListeningContent('true-false', 'B2') },
  )
  const [loaded, setLoaded] = useState(!!task)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [fixing, setFixing] = useState(false)
  const [showReplace, setShowReplace] = useState(false)
  // A notice handed over from the page that created the task (e.g. a failed MP3 upload).
  const [notice, setNotice] = useState<string[] | null>(() => {
    const handed = (location.state as { notice?: string } | null)?.notice
    return handed ? [handed] : null
  })
  const [pendingAudio, setPendingAudio] = useState<File | null>(null)
  const [confirmPublish, setConfirmPublish] = useState(false)
  const [publishing, setPublishing] = useState(false)

  const report = useMemo(() => checkListeningTask(draft.content, draft.level, draft.field), [draft.content, draft.level, draft.field])
  const spec = levelSpec(draft.level, draft.content.format, draft.field)

  // Leaving with unsaved edits.
  useEffect(() => {
    if (!dirty) return
    const onBefore = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', onBefore)
    return () => window.removeEventListener('beforeunload', onBefore)
  }, [dirty])

  const update = (patch: Partial<Draft>) => {
    setDraft((d) => ({ ...d, ...patch }))
    setDirty(true)
    setMessage(null)
  }
  const setContent = (content: ListeningTaskContent) => update({ content })

  function onLoad(d: LoadedDraft) {
    const level = d.level ?? draft.level
    update({ title: d.title || draft.title, sourceRef: d.sourceRef || draft.sourceRef, origin: d.origin, level, content: d.content })
    setLoaded(true)
    setShowReplace(false)
    setNotice(d.notice ?? null)
    setPendingAudio(d.audioFile ?? null)
  }

  function setFormat(format: ListeningFormat) {
    if (format === draft.content.format) return
    const fresh = emptyListeningContent(format, draft.level, draft.content.subtype, draft.field)
    setContent({ ...fresh, script: draft.content.script, topic: draft.content.topic, style: draft.content.style, instructions: standardInstruction(format, draft.content.topic, draft.level, draft.field) })
  }

  async function save() {
    if (!draft.title.trim()) {
      setMessage(c('saveFailed', { error: c('taskTitle') }))
      return
    }
    setSaving(true)
    setMessage(null)
    try {
      const saved = await saveExamTask({ examPart: 'listening', level: draft.level, field: draft.field, title: draft.title, origin: draft.origin, sourceRef: draft.sourceRef, content: draft.content }, task?.id)
      setDirty(false)
      setMessage(c('saved'))
      // The recording chosen in the check form goes up once the task exists.
      let audioFailed = false
      if (pendingAudio) {
        setMessage(c('mp3Uploading'))
        try {
          await uploadTaskAudio(saved.id, pendingAudio)
          setPendingAudio(null)
        } catch {
          audioFailed = true
        }
        setMessage(audioFailed ? c('mp3Failed') : c('saved'))
      }
      if (!task) navigate(`/teacher/tools/exam-tasks/${saved.id}`, { replace: true, state: audioFailed ? { notice: c('mp3Failed') } : null })
      else onReload()
    } catch (err) {
      setMessage(c('saveFailed', { error: err instanceof TeacherToolsError ? err.code : c('err_generic') }))
    } finally {
      setSaving(false)
    }
  }

  async function fix(keepScript: boolean, teacherNote: string) {
    setFixing(true)
    setMessage(null)
    try {
      const problems = report.findings.map((f) => {
        const label = CRITERIA_BY_ID.get(f.criterionId)?.label.en ?? f.criterionId
        return `${f.status === 'fail' ? 'BLOCKER' : 'warning'}${f.itemId !== undefined ? ` item ${f.itemId}` : ''} — ${label}: ${f.detail.en}`
      })
      const { draft: revised } = await reviseExamTask({ level: draft.level, field: draft.field, content: draft.content, problems, keepScript, teacherNote })
      update({ content: revised.content })
      setMessage(c('revisedNotice'))
    } catch (err) {
      const code = err instanceof TeacherToolsError ? `err_${err.code}` : 'err_generic'
      setMessage(code === 'err_daily_limit' ? c('err_daily_limit') : c('err_generation_failed'))
    } finally {
      setFixing(false)
    }
  }

  async function publish() {
    if (!task) return
    setPublishing(true)
    setMessage(null)
    try {
      await publishExamTask(task.id)
      setConfirmPublish(false)
      setMessage(c('published'))
      onReload()
    } catch (err) {
      setMessage(err instanceof TeacherToolsError && err.code === 'revision_changed' ? c('err_revision_changed') : c('err_generic'))
    } finally {
      setPublishing(false)
    }
  }

  async function remove() {
    if (!task || !window.confirm(c('deleteConfirm'))) return
    await deleteExamTask(task.id)
    navigate('/teacher/tools/exam-tasks', { replace: true })
  }

  const isTf = draft.content.format === 'true-false'
  const tabs: { id: Tab; label: string }[] = [
    { id: 'create', label: c('tabCreate') },
    { id: 'test', label: c('tabTest') },
    { id: 'results', label: `${c('tabResults')}${detail?.reviews ? ` (${detail.reviews.filter((r) => r.revision === task?.revision).length})` : ''}` },
  ]

  return (
    <div className="max-w-6xl space-y-6">
      {back}
      <PageHeading
        title={task ? task.title : checkMode ? c('checkTitle') : c('crumbNew')}
        subtitle={
          task ? (
            <>
              {`${c('part_listening')} · ${task.level} · ${c(task.content.format === 'notes' ? 'format_notes' : 'format_true_false')} · `}
              <StatusChip task={task} />
            </>
          ) : (
            c('part_listening')
          )
        }
        actions={
          tab === 'create' && (
            <div className="flex flex-wrap items-center gap-3">
              {dirty && <span className="text-xs text-amber-700">{c('unsaved')}</span>}
              {message && <span className="text-sm text-muted-foreground">{message}</span>}
              <button type="button" className={task?.status === 'draft' ? secondaryButtonClass : primaryButtonClass} disabled={saving || !loaded} onClick={save}>
                {saving ? c('saving') : c('save')}
              </button>
              {task?.status === 'draft' && (
                <button type="button" className={primaryButtonClass} disabled={dirty || saving || publishing} title={dirty ? c('saveFirst') : undefined} onClick={() => setConfirmPublish(true)}>
                  {c('publish')}
                </button>
              )}
            </div>
          )
        }
      />

      {tab === 'create' && task?.status === 'draft' && confirmPublish && (
        <div role="dialog" aria-labelledby="publish-title" className={cardClass}>
          <h2 id="publish-title" className="font-semibold text-foreground">
            {c('publishConfirmTitle', { n: task.revision })}
          </h2>
          <p className="text-sm text-foreground">{c('publishConfirmBody')}</p>
          {blockerCount(report) > 0 ? (
            <p className="text-sm font-medium text-rose-700">{c('publishBlockers', { n: blockerCount(report) })}</p>
          ) : (
            <p className="text-sm text-emerald-700">{c('publishNoBlockers')}</p>
          )}
          <div className="flex flex-wrap gap-3">
            <button type="button" className={primaryButtonClass} disabled={publishing || dirty} onClick={publish}>
              {publishing ? c('publishing') : c('publishConfirm')}
            </button>
            <button type="button" className={secondaryButtonClass} disabled={publishing} onClick={() => setConfirmPublish(false)}>
              {c('cancel')}
            </button>
          </div>
        </div>
      )}

      {task && (
        <div role="tablist" className="flex gap-1 border-b border-border">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setParams(t.id === 'create' ? {} : { tab: t.id }, { replace: true })}
              className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${tab === t.id ? 'border-[var(--teal-accent)] text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {tab === 'test' && task && (dirty ? <p className={hintClass}>{c('saveFirst')}</p> : <TestRunner task={task} myReview={detail?.myReview ?? null} onSaved={onReload} />)}
      {tab === 'results' && task && (
        <ResultsView
          task={task}
          reviews={detail?.reviews ?? []}
          editLocked={dirty}
          onSaved={(saved) => {
            // Keep the Create tab in step with the correction.
            setDraft((d) => ({ ...d, content: saved.content }))
            onReload()
          }}
        />
      )}

      {tab === 'create' && (
        <>
          {(!loaded || showReplace) && (
            <>
              <section className={`${cardClass} grid gap-3 sm:grid-cols-3`}>
                <Select label={c('level')} value={draft.level} options={TASK_LEVELS.map((l) => [l, l])} onChange={(v) => update({ level: v as TaskLevel })} />
                <Select
                  label={c('format')}
                  value={draft.content.format}
                  options={[
                    ['true-false', c('format_true_false')],
                    ['notes', c('format_notes')],
                  ]}
                  onChange={(v) => setFormat(v as ListeningFormat)}
                />
                <Select label={c('field')} value={draft.field} options={EXAM_FIELDS.map((f) => [f, c(`field_${f}`)])} onChange={(v) => update({ field: v as ExamField })} />
              </section>
              {checkMode && !loaded ? (
                <CheckPanel level={draft.level} format={draft.content.format} onLoad={onLoad} />
              ) : (
                <StartPanel level={draft.level} format={draft.content.format} field={draft.field} onFormat={setFormat} onLoad={onLoad} replacing={showReplace} />
              )}
            </>
          )}

          {loaded && (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
              <div className="min-w-0 space-y-6">
                {notice && (
                  <div role="status" className="flex items-start justify-between gap-3 rounded-xl bg-muted px-4 py-3 text-sm">
                    <div className="space-y-1">
                      {notice.map((n, i) => (
                        <p key={n} className={i === 0 ? 'text-foreground' : 'text-amber-800'}>
                          {n}
                        </p>
                      ))}
                    </div>
                    <button type="button" className="text-muted-foreground hover:text-foreground" aria-label={c('cancel')} onClick={() => setNotice(null)}>
                      ×
                    </button>
                  </div>
                )}
                {!showReplace && (
                  <button type="button" className={secondaryButtonClass} onClick={() => setShowReplace(true)}>
                    {c('replaceTitle')}
                  </button>
                )}

                <section className={cardClass}>
                  <h2 className="font-semibold text-foreground">{c('details')}</h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className={labelClass}>
                      {c('taskTitle')}
                      <input className={`${inputClass} mt-1`} maxLength={160} value={draft.title} onChange={(e) => update({ title: e.target.value })} />
                    </label>
                    <label className={labelClass}>
                      {c('sourceRef')}
                      <input className={`${inputClass} mt-1`} maxLength={500} value={draft.sourceRef} onChange={(e) => update({ sourceRef: e.target.value })} />
                    </label>
                  </div>
                  {!showReplace && (
                    <div className="grid gap-3 sm:grid-cols-3">
                      <Select label={c('level')} value={draft.level} options={TASK_LEVELS.map((l) => [l, l])} onChange={(v) => update({ level: v as TaskLevel })} />
                      <Select label={c('field')} value={draft.field} options={EXAM_FIELDS.map((f) => [f, c(`field_${f}`)])} onChange={(v) => update({ field: v as ExamField })} />
                      <Select
                        label={c('style')}
                        value={draft.content.style}
                        options={(['monologue', 'dialogue', 'panel'] as const).map((s) => [s, c(`style_${s}`)])}
                        onChange={(v) => setContent({ ...draft.content, style: v as ListeningTaskContent['style'] })}
                      />
                    </div>
                  )}
                  <label className={labelClass}>
                    {isTf ? c('topic_tf') : c('topic_notes')}
                    <input lang="en" className={`${inputClass} mt-1`} value={draft.content.topic} onChange={(e) => setContent({ ...draft.content, topic: e.target.value })} />
                  </label>
                  <label className={labelClass}>
                    {c('instructions')}
                    <textarea lang="en" className={`${inputClass} mt-1 min-h-20`} value={draft.content.instructions} onChange={(e) => setContent({ ...draft.content, instructions: e.target.value })} />
                  </label>
                  <button
                    type="button"
                    className={secondaryButtonClass}
                    onClick={() => setContent({ ...draft.content, instructions: standardInstruction(draft.content.format, draft.content.topic, draft.level, draft.field) })}
                  >
                    {c('useStandard')}
                  </button>
                </section>

                <section className={cardClass}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="font-semibold text-foreground">{c('script')}</h2>
                    <span className={`text-sm ${report.stats.words < spec.wordsMin || report.stats.words > spec.wordsMax ? 'font-semibold text-rose-700' : 'text-muted-foreground'}`}>
                      {c('words', { n: report.stats.words })} · {c('band', { min: spec.wordsMin, max: spec.wordsMax })}
                    </span>
                  </div>
                  <p className={hintClass}>{c('scriptHint')}</p>
                  <textarea
                    lang="en"
                    className={`${inputClass} min-h-72 font-mono text-sm leading-relaxed`}
                    value={draft.content.script}
                    onChange={(e) => setContent({ ...draft.content, script: e.target.value })}
                  />
                  <details open className="rounded-lg border border-border px-3 py-2">
                    <summary className="cursor-pointer text-sm font-medium">{c('preview')}</summary>
                    <div className="mt-2">
                      <ScriptView script={draft.content.script} distances={report.distances} />
                    </div>
                  </details>
                </section>

                <ItemsEditor content={draft.content} onChange={setContent} report={report} />

                <details className={cardClass}>
                  <summary className="cursor-pointer font-semibold text-foreground">{c('authorNotes')}</summary>
                  <textarea
                    className={`${inputClass} min-h-32 text-sm`}
                    value={draft.content.authorNotes ?? ''}
                    onChange={(e) => setContent({ ...draft.content, authorNotes: e.target.value })}
                  />
                </details>

                <p className={hintClass}>{c('revisionNote')}</p>
                {task && (
                  <button type="button" className={`${secondaryButtonClass} text-red-700`} onClick={remove}>
                    {c('deleteTask')}
                  </button>
                )}
              </div>

              <aside className="space-y-6 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:self-start lg:overflow-y-auto">
                <ChecksPanel report={report} format={draft.content.format} onFix={fix} fixing={fixing} />
                <AudioPanel taskId={task?.id ?? null} revision={task?.revision ?? 0} level={draft.level} format={draft.content.format} dirty={dirty} />
                {task && <SharePanel task={task} reviewers={detail?.reviewers ?? []} onShared={onReload} />}
                {report.stats.names.length > 0 && (
                  <p className={hintClass}>
                    {pick({ en: 'Names in the script', hu: 'Nevek a szövegben' }, lang)}: {report.stats.names.join(', ')}
                  </p>
                )}
              </aside>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: [string, string][]; onChange: (v: string) => void }) {
  return (
    <label className={labelClass}>
      {label}
      <select className={`${inputClass} mt-1`} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  )
}
