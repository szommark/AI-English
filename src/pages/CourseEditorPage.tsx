import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowDown, ArrowUp, Eye, Headphones, Loader2, Pencil, Plus, RefreshCw, Sparkles, Trash2 } from 'lucide-react'
import PageHeading from '../components/PageHeading'
import ModulePlayer from '../components/Courses/ModulePlayer'
import ModuleEditor from '../components/Courses/ModuleEditor'
import CourseAssignPanel from '../components/Courses/CourseAssignPanel'
import CourseFixesPanel from '../components/Courses/CourseFixesPanel'
import UnitForm, { EMPTY_UNIT, toUnitInput, unitFormReady, type UnitFormValue } from '../components/Courses/UnitForm'
import { KIND_ICONS } from '../components/Courses/kindMeta'
import { cardClass, hintClass, inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from '../components/TeacherTools/ui'
import { useCourseCopy } from '../data/courseCopy'
import { getGrammarItem } from '../data/grammarCurriculum'
import { TeacherToolsError } from '../lib/teacherToolsApi'
import {
  addUnit,
  deleteCourse,
  deleteUnit,
  fetchCourse,
  generateModuleContent,
  generateUnitOutline,
  previewFeedback,
  previewRoleplay,
  recordModuleAudio,
  saveCourseFields,
  saveModule,
  setCourseStatus,
  updateUnit,
} from '../lib/courseApi'
import { EXPLAIN_LANGS, MAX_UNITS_PER_COURSE, scoreModule, unitReady, type Course, type CourseModule, type CourseUnit, type ExplainLang } from '../lib/courses'

/** What the AI is writing right now: a unit's outline or one module. */
type GenTarget = { kind: 'outline'; unitId: string } | { kind: 'module'; moduleId: string }

/**
 * /teacher/tools/courses/:courseId: the course's units as tabs; per unit its outline and modules,
 * written by AI (one call each, in order) and edited, previewed or rewritten one by one. Publish
 * the course, publish units added later, and assign it to students.
 */
export default function CourseEditorPage() {
  const { courseId = '' } = useParams()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const { c, kind, lang } = useCourseCopy()
  const [course, setCourse] = useState<Course | null>(null)
  const [loadError, setLoadError] = useState<'load' | 'missing' | null>(null)
  const [unitId, setUnitId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [newUnit, setNewUnit] = useState<UnitFormValue>(EMPTY_UNIT)
  const [editing, setEditing] = useState<string | null>(null)
  const [preview, setPreview] = useState<{ module: CourseModule; run: number } | null>(null)
  const [gen, setGen] = useState<GenTarget | null>(null)
  const [failed, setFailed] = useState<string | null>(null)
  const [remaining, setRemaining] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [details, setDetails] = useState<{ title: string; topic: string; explainLang: ExplainLang } | null>(null)
  const autoStarted = useRef(false)

  const apply = useCallback((next: Course) => {
    setCourse(next)
    setUnitId((cur) => (cur && next.units.some((u) => u.id === cur) ? cur : (next.units[0]?.id ?? null)))
  }, [])

  useEffect(() => {
    fetchCourse(courseId)
      .then(apply)
      .catch((err) => setLoadError(err instanceof TeacherToolsError && err.status === 404 ? 'missing' : 'load'))
  }, [courseId, apply])

  const failMessage = (err: unknown) => (err instanceof TeacherToolsError && err.code === 'daily_limit' ? c('dailyLimit') : c('generateError'))

  /** Writes whatever the unit is missing: the outline, then each empty module in order. */
  const writeUnit = useCallback(
    async (start: Course, id: string) => {
      setFailed(null)
      setError(null)
      let current = start
      const unit = () => current.units.find((u) => u.id === id) as CourseUnit
      try {
        if (!unit().blueprint) {
          setGen({ kind: 'outline', unitId: id })
          const r = await generateUnitOutline(id)
          current = r.course
          setRemaining(r.remaining)
          apply(current)
        }
        for (const m of unit().modules) {
          if (m.content) continue
          setGen({ kind: 'module', moduleId: m.id })
          try {
            const r = await generateModuleContent(m.id)
            current = r.course
            setRemaining(r.remaining)
            apply(current)
          } catch (err) {
            setFailed(m.id)
            throw err
          }
        }
      } catch (err) {
        setError(failMessage(err))
      } finally {
        setGen(null)
      }
    },
    // failMessage only reads the copy.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [apply],
  )

  // Straight after "Create": write the first unit.
  useEffect(() => {
    if (!course || autoStarted.current || params.get('generate') !== '1') return
    autoStarted.current = true
    setParams({}, { replace: true })
    const first = course.units[0]
    if (first && !unitReady(first)) void writeUnit(course, first.id)
  }, [course, params, setParams, writeUnit])

  if (loadError) return <p className="text-sm text-red-600">{loadError === 'missing' ? c('courseMissing') : c('loadError')}</p>
  if (!course) return <p className="text-sm text-muted-foreground">{c('loading')}</p>

  const unit = course.units.find((u) => u.id === unitId) ?? course.units[0]
  const allReady = course.units.every(unitReady)
  const working = gen !== null
  const grammarTitle = (id: string) => {
    const item = getGrammarItem(id)?.item
    return item ? (lang === 'hu' ? item.titleHu : item.title) : id
  }

  async function run(action: () => Promise<Course>, errorKey: 'saveError' | 'publishError' | 'recordError' = 'saveError') {
    setBusy(true)
    setError(null)
    try {
      apply(await action())
    } catch (err) {
      setError(err instanceof TeacherToolsError && err.code === 'not_ready' ? c('notReady') : c(errorKey))
    } finally {
      setBusy(false)
    }
  }

  async function rewriteModule(m: CourseModule) {
    if (m.content && !window.confirm(c('rewriteConfirm'))) return
    setGen({ kind: 'module', moduleId: m.id })
    setFailed(null)
    setError(null)
    try {
      const r = await generateModuleContent(m.id)
      setRemaining(r.remaining)
      apply(r.course)
    } catch (err) {
      setFailed(m.id)
      setError(err instanceof TeacherToolsError && err.code === 'reading_first' ? c('readingFirst') : failMessage(err))
    } finally {
      setGen(null)
    }
  }

  async function rewriteOutline(u: CourseUnit) {
    if (!window.confirm(c('rewriteOutlineConfirm'))) return
    setGen({ kind: 'outline', unitId: u.id })
    setError(null)
    try {
      const r = await generateUnitOutline(u.id)
      setRemaining(r.remaining)
      apply(r.course)
    } catch (err) {
      setError(failMessage(err))
    } finally {
      setGen(null)
    }
  }

  async function createUnit() {
    if (!course) return
    setBusy(true)
    setError(null)
    try {
      const next = await addUnit(course.id, toUnitInput(newUnit))
      const created = next.units[next.units.length - 1]
      apply(next)
      setUnitId(created.id)
      setAdding(false)
      setNewUnit(EMPTY_UNIT)
      setBusy(false)
      void writeUnit(next, created.id)
    } catch {
      setError(c('createError'))
      setBusy(false)
    }
  }

  async function removeCourse() {
    if (!course || !window.confirm(c('deleteCourseConfirm'))) return
    try {
      await deleteCourse(course.id)
      navigate('/teacher/tools/courses')
    } catch {
      setError(c('saveError'))
    }
  }

  const moduleStatus = (m: CourseModule) => {
    if (gen?.kind === 'module' && gen.moduleId === m.id) return { text: c('writing'), cls: 'text-[var(--teal-accent-strong)]' }
    if (failed === m.id) return { text: c('failed'), cls: 'text-red-600' }
    if (m.content && !m.audioReady) return { text: c('needsRecording'), cls: 'text-amber-700' }
    if (m.content) return { text: c('stepCount', { n: m.content.steps.length }), cls: 'text-muted-foreground' }
    return { text: c('notWritten'), cls: 'text-muted-foreground' }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeading
        title={course.title}
        subtitle={`${course.level} · ${c('unitCount', { n: course.units.length })} · ${c(`status_${course.status}`)}`}
        actions={
          course.status === 'published' ? (
            <button type="button" className={secondaryButtonClass} disabled={busy || working} onClick={() => window.confirm(c('unpublishConfirm')) && void run(() => setCourseStatus(course.id, 'draft'), 'publishError')}>
              {c('unpublish')}
            </button>
          ) : (
            <button type="button" className={primaryButtonClass} disabled={busy || working || !allReady} title={allReady ? undefined : c('notReady')} onClick={() => void run(() => setCourseStatus(course.id, 'published'), 'publishError')}>
              {c('publish')}
            </button>
          )
        }
      />
      <Link to="/teacher/tools/courses" className="inline-block text-sm text-muted-foreground hover:underline">
        {c('backToList')}
      </Link>
      {course.status === 'draft' && <p className={hintClass}>{allReady ? c('draftHint') : c('notReady')}</p>}

      {/* Course details */}
      <section className={cardClass}>
        {details ? (
          <div className="space-y-3">
            <label className="block space-y-1">
              <span className={labelClass}>{c('courseTitle')}</span>
              <input className={inputClass} value={details.title} onChange={(e) => setDetails({ ...details, title: e.target.value })} />
            </label>
            <label className="block space-y-1">
              <span className={labelClass}>{c('courseTopic')}</span>
              <input className={inputClass} value={details.topic} onChange={(e) => setDetails({ ...details, topic: e.target.value })} />
            </label>
            <label className="block space-y-1">
              <span className={labelClass}>{c('explainLang')}</span>
              <select className={inputClass} value={details.explainLang} onChange={(e) => setDetails({ ...details, explainLang: e.target.value as ExplainLang })}>
                {EXPLAIN_LANGS.map((l) => (
                  <option key={l} value={l}>
                    {c(`lang_${l}`)}
                  </option>
                ))}
              </select>
              <span className={hintClass}>{c('explainLangChangeHint')}</span>
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                className={primaryButtonClass}
                disabled={busy || !details.title.trim()}
                onClick={() => void run(() => saveCourseFields(course.id, details)).then(() => setDetails(null))}
              >
                {c('save')}
              </button>
              <button type="button" className={secondaryButtonClass} onClick={() => setDetails(null)}>
                {c('cancel')}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="min-w-0 flex-1 text-muted-foreground">
              {course.topic && <>{course.topic} · </>}
              {c('explainIn', { lang: c(`lang_${course.explainLang}`) })}
            </span>
            <button type="button" className={secondaryButtonClass} onClick={() => setDetails({ title: course.title, topic: course.topic, explainLang: course.explainLang })}>
              {c('editDetails')}
            </button>
            <button type="button" className={`${secondaryButtonClass} text-red-600`} onClick={() => void removeCourse()}>
              {c('deleteCourse')}
            </button>
          </div>
        )}
      </section>

      {/* Unit tabs */}
      <div className="flex flex-wrap gap-2" role="tablist">
        {course.units.map((u) => (
          <button
            key={u.id}
            type="button"
            role="tab"
            aria-selected={!adding && u.id === unit?.id}
            onClick={() => {
              setAdding(false)
              setUnitId(u.id)
              setEditing(null)
            }}
            className={`rounded-lg border-2 px-3 py-1.5 text-sm ${!adding && u.id === unit?.id ? 'border-[var(--teal-accent)] bg-[var(--teal-accent-soft)] font-medium' : 'border-border bg-card'}`}
          >
            {c('unitN', { n: u.position })}
            {u.status === 'draft' && course.status === 'published' && <span className="ml-1 text-xs text-muted-foreground">({c('status_draft')})</span>}
          </button>
        ))}
        {course.units.length < MAX_UNITS_PER_COURSE && (
          <button
            type="button"
            disabled={working}
            onClick={() => setAdding(true)}
            className={`inline-flex items-center gap-1 rounded-lg border-2 border-dashed px-3 py-1.5 text-sm disabled:opacity-50 ${adding ? 'border-[var(--teal-accent)]' : 'border-border'}`}
          >
            <Plus className="h-4 w-4" />
            {c('addUnit')}
          </button>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {remaining !== null && <p className={hintClass}>{c('remaining', { n: remaining })}</p>}

      {adding ? (
        <section className={cardClass}>
          <h2 className="font-semibold text-foreground">{c('unitN', { n: course.units.length + 1 })}</h2>
          <p className={hintClass}>{c('addUnitHint', { level: course.level })}</p>
          <UnitForm level={course.level} value={newUnit} onChange={setNewUnit} />
          <div className="flex gap-2">
            <button type="button" className={primaryButtonClass} disabled={busy || !unitFormReady(newUnit)} onClick={() => void createUnit()}>
              {c('createUnitAndWrite')}
            </button>
            <button type="button" className={secondaryButtonClass} onClick={() => setAdding(false)}>
              {c('cancel')}
            </button>
          </div>
        </section>
      ) : (
        unit && (
          <UnitPanel
            key={unit.id}
            course={course}
            unit={unit}
            gen={gen}
            busy={busy}
            grammarTitle={grammarTitle}
            moduleStatus={moduleStatus}
            editing={editing}
            setEditing={setEditing}
            onWriteMissing={() => void writeUnit(course, unit.id)}
            onRewriteOutline={() => void rewriteOutline(unit)}
            onRewriteModule={(m) => void rewriteModule(m)}
            onRecord={(m) => void run(() => recordModuleAudio(m.id), 'recordError')}
            onPreview={(m) => setPreview({ module: m, run: 0 })}
            onSaveModule={async (m, content) => apply(await saveModule(m.id, { content }))}
            onUnit={(patch) => void run(() => updateUnit(unit.id, patch), patch.status ? 'publishError' : 'saveError')}
            onDelete={() => window.confirm(c('deleteUnitConfirm')) && void run(() => deleteUnit(unit.id))}
            kind={kind}
          />
        )
      )}

      <CourseFixesPanel courseId={course.id} onCourse={apply} />

      <CourseAssignPanel courseId={course.id} published={course.status === 'published'} />

      {preview && preview.module.content && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-background px-4" role="dialog" aria-modal="true" aria-label={c('preview')}>
          <p className="mx-auto max-w-xl pt-3 text-center text-xs font-semibold uppercase tracking-wide text-[var(--teal-accent-strong)]">{c('previewBanner')}</p>
          <ModulePlayer
            key={preview.run}
            title={preview.module.title}
            content={preview.module.content}
            seed={preview.module.id}
            audioUrl={preview.module.audioUrl}
            onEvaluate={(stepId, text) => previewFeedback(preview.module.id, stepId, text)}
            onRoleplayTurn={(stepId, history) => previewRoleplay(preview.module.id, stepId, history)}
            onFinish={async (answers) => scoreModule(preview.module.content as NonNullable<CourseModule['content']>, answers)}
            onExit={() => setPreview(null)}
            resultActions={() => (
              <>
                <button type="button" className="rounded-xl bg-[var(--teal-accent)] px-5 py-3 font-semibold text-primary" onClick={() => setPreview({ ...preview, run: preview.run + 1 })}>
                  {c('restart')}
                </button>
                <button type="button" className="rounded-xl border border-border px-5 py-3 font-semibold text-foreground" onClick={() => setPreview(null)}>
                  {c('closePreview')}
                </button>
              </>
            )}
          />
        </div>
      )}
    </div>
  )
}

function UnitPanel(props: {
  course: Course
  unit: CourseUnit
  gen: GenTarget | null
  busy: boolean
  grammarTitle: (id: string) => string
  moduleStatus: (m: CourseModule) => { text: string; cls: string }
  editing: string | null
  setEditing: (id: string | null) => void
  onWriteMissing: () => void
  onRewriteOutline: () => void
  onRewriteModule: (m: CourseModule) => void
  onRecord: (m: CourseModule) => void
  onPreview: (m: CourseModule) => void
  onSaveModule: (m: CourseModule, content: NonNullable<CourseModule['content']>) => Promise<void>
  onUnit: (patch: Partial<Pick<CourseUnit, 'title' | 'canDos' | 'status'>> & { move?: 'up' | 'down' }) => void
  onDelete: () => void
  kind: (k: CourseModule['kind']) => string
}) {
  const { course, unit, gen, busy, editing, setEditing } = props
  const { c } = useCourseCopy()
  const [title, setTitle] = useState(unit.title)
  const [canDos, setCanDos] = useState(unit.canDos.join('\n'))
  useEffect(() => {
    setTitle(unit.title)
    setCanDos(unit.canDos.join('\n'))
  }, [unit.title, unit.canDos])

  const working = gen !== null
  const outlineRunning = gen?.kind === 'outline' && gen.unitId === unit.id
  const missing = !unit.blueprint || unit.modules.some((m) => !m.content)
  const ready = unitReady(unit)
  const minutes = unit.modules.reduce((s, m) => s + m.estMinutes, 0)
  const lastIndex = props.course.units.length - 1

  return (
    <section className="space-y-4">
      <div className={cardClass}>
        <div className="flex flex-wrap items-start gap-2">
          <div className="min-w-0 flex-1 space-y-1">
            <input
              className={`${inputClass} text-lg font-semibold`}
              value={title}
              aria-label={c('unitTitle')}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => title.trim() && title.trim() !== unit.title && props.onUnit({ title: title.trim() })}
            />
            <p className={hintClass}>
              {unit.topic} · {c(`template_${unit.template}`)} · {c('minutes', { n: minutes })}
            </p>
            <p className="text-sm text-foreground">
              <span className="text-muted-foreground">{c('grammar')}:</span> {unit.grammarIds.length ? unit.grammarIds.map(props.grammarTitle).join(' · ') : '—'}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button type="button" aria-label={c('moveUnitUp')} title={c('moveUnitUp')} disabled={busy || working || unit.position === 1} onClick={() => props.onUnit({ move: 'up' })} className="rounded-lg p-2 hover:bg-secondary disabled:opacity-30">
              <ArrowUp className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label={c('moveUnitDown')}
              title={c('moveUnitDown')}
              disabled={busy || working || unit.position - 1 === lastIndex}
              onClick={() => props.onUnit({ move: 'down' })}
              className="rounded-lg p-2 hover:bg-secondary disabled:opacity-30"
            >
              <ArrowDown className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label={c('deleteUnit')}
              title={c('deleteUnit')}
              disabled={busy || working || course.units.length <= 1}
              onClick={props.onDelete}
              className="rounded-lg p-2 text-red-600 hover:bg-secondary disabled:opacity-30"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {course.status === 'published' && (
          <div className="flex flex-wrap items-center gap-2 rounded-lg bg-secondary/60 px-3 py-2 text-sm">
            <span className="flex-1">{unit.status === 'published' ? c('unitLive') : c('unitDraftHint')}</span>
            {unit.status === 'draft' ? (
              <button type="button" className={primaryButtonClass} disabled={busy || working || !ready} onClick={() => props.onUnit({ status: 'published' })}>
                {c('publishUnit')}
              </button>
            ) : (
              <button type="button" className={secondaryButtonClass} disabled={busy || working} onClick={() => window.confirm(c('unpublishUnitConfirm')) && props.onUnit({ status: 'draft' })}>
                {c('unpublishUnit')}
              </button>
            )}
          </div>
        )}

        {missing && (
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-dashed border-[var(--teal-accent-border)] p-3">
            <Sparkles className="h-5 w-5 text-[var(--teal-accent-strong)]" />
            <span className="flex-1 text-sm text-foreground">{working ? (outlineRunning ? c('writingOutline') : c('writingModules')) : c('missingHint')}</span>
            <button type="button" className={`${primaryButtonClass} inline-flex items-center gap-1.5`} disabled={working || busy} onClick={props.onWriteMissing}>
              {working && <Loader2 className="h-4 w-4 animate-spin" />}
              {c('writeMissing')}
            </button>
          </div>
        )}
      </div>

      {unit.blueprint && (
        <div className={cardClass}>
          <div className="flex items-center gap-2">
            <h3 className="flex-1 font-semibold text-foreground">{c('outline')}</h3>
            <button type="button" className={`${secondaryButtonClass} inline-flex items-center gap-1`} disabled={working || busy} onClick={props.onRewriteOutline}>
              <RefreshCw className="h-3.5 w-3.5" />
              {c('rewriteOutline')}
            </button>
          </div>
          <label className="block space-y-1">
            <span className={labelClass}>{c('canDoHeading')}</span>
            <textarea
              className={`${inputClass} min-h-[4.5rem] text-sm`}
              value={canDos}
              onChange={(e) => setCanDos(e.target.value)}
              onBlur={() => canDos !== unit.canDos.join('\n') && props.onUnit({ canDos: canDos.split('\n') })}
            />
            <span className={hintClass}>{c('canDoEditHint')}</span>
          </label>
          <div>
            <p className={labelClass}>{c('wordSet', { n: unit.blueprint.words.length })}</p>
            <p className="mt-1 text-sm text-muted-foreground">{unit.blueprint.words.map((w) => w.term).join(' · ')}</p>
          </div>
          {unit.blueprint.reusedAudio && (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{c('reusedRecording')}:</span> {unit.blueprint.reusedAudio.title}
            </p>
          )}
          {unit.blueprint.passageBrief && (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{c('textBrief')}:</span> {unit.blueprint.passageBrief}
            </p>
          )}
        </div>
      )}

      <ol className="space-y-2">
        {unit.modules.map((m) => {
          const Icon = KIND_ICONS[m.kind]
          const status = props.moduleStatus(m)
          const writing = gen?.kind === 'module' && gen.moduleId === m.id
          return (
            <li key={m.id} className="space-y-2 rounded-xl border border-border bg-card p-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--teal-accent-soft)] text-[var(--teal-accent-strong)]">
                  {writing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Icon className="h-5 w-5" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-foreground">
                    {m.position}. {m.title}
                  </span>
                  <span className={`block text-xs ${status.cls}`}>
                    {props.kind(m.kind)} · {c('minutes', { n: m.estMinutes })} · {status.text}
                  </span>
                </span>
                <span className="flex flex-wrap gap-1.5">
                  {m.content && !m.audioReady && (
                    <button type="button" className={`${primaryButtonClass} inline-flex items-center gap-1`} disabled={working || busy} onClick={() => props.onRecord(m)}>
                      <Headphones className="h-3.5 w-3.5" />
                      {c('makeRecording')}
                    </button>
                  )}
                  {m.content && (
                    <>
                      <button type="button" className={`${secondaryButtonClass} inline-flex items-center gap-1`} onClick={() => props.onPreview(m)}>
                        <Eye className="h-3.5 w-3.5" />
                        {c('preview')}
                      </button>
                      <button type="button" className={`${secondaryButtonClass} inline-flex items-center gap-1`} disabled={working} onClick={() => setEditing(editing === m.id ? null : m.id)}>
                        <Pencil className="h-3.5 w-3.5" />
                        {c('edit')}
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    className={`${secondaryButtonClass} inline-flex items-center gap-1`}
                    disabled={working || busy || !unit.blueprint}
                    onClick={() => props.onRewriteModule(m)}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    {m.content ? c('rewrite') : c('write')}
                  </button>
                </span>
              </div>
              {editing === m.id && m.content && (
                <ModuleEditor
                  content={m.content}
                  onCancel={() => setEditing(null)}
                  onSave={async (content) => {
                    await props.onSaveModule(m, content)
                    setEditing(null)
                  }}
                />
              )}
            </li>
          )
        })}
      </ol>
    </section>
  )
}
