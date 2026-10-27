import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Printer, Trash2 } from 'lucide-react'
import PageHeading from '../components/PageHeading'
import { cardClass, hintClass, primaryButtonClass, secondaryButtonClass } from '../components/TeacherTools/ui'
import CreateForm from '../components/CompTests/CreateForm'
import TestEditor, { emptySection } from '../components/CompTests/TestEditor'
import AudioPanel from '../components/CompTests/AudioPanel'
import AssignPanel from '../components/CompTests/AssignPanel'
import TestPaper from '../components/CompTests/TestPaper'
import ResultList from '../components/CompTests/ResultList'
import { useCompCopy } from '../data/compTestCopy'
import { TeacherToolsError } from '../lib/teacherToolsApi'
import { deleteCompTest, fetchCompAudio, fetchCompTest, generateCompTest, saveCompTest } from '../lib/compTestApi'
import { printCompTest } from '../lib/compTestPrint'
import { CompValidationError, sanitizeTestInput, scoreComp, type CompGenerateInput, type CompResult, type CompTest, type CompTestInput } from '../lib/compTests'
import type { ExamAnswers } from '../lib/examScoring'

type Tab = 'edit' | 'preview' | 'assign'

function toInput(test: CompTest): CompTestInput {
  return { skill: test.skill, level: test.level, title: test.title, topic: test.topic, maxPlays: test.maxPlays, content: test.content }
}

/**
 * /teacher/tools/comp-tests/new (generate, or start empty) and /teacher/tools/comp-tests/:testId:
 * edit the text and the sections, try it as a student, print it, assign it and see the results.
 */
export default function CompTestEditorPage() {
  const { c } = useCompCopy()
  const { testId } = useParams()
  const navigate = useNavigate()
  const [test, setTest] = useState<CompTest | null>(null)
  const [draft, setDraft] = useState<CompTestInput | null>(null)
  const [savedJson, setSavedJson] = useState('')
  const [loadError, setLoadError] = useState<'notFound' | 'failed' | null>(null)
  const [tab, setTab] = useState<Tab>('edit')
  const [busy, setBusy] = useState<'generate' | 'save' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [remaining, setRemaining] = useState<number | null>(null)
  const [printOpts, setPrintOpts] = useState({ open: false, answerKey: true, script: false })
  // Preview ("try it as a student").
  const [answers, setAnswers] = useState<ExamAnswers>({})
  const [checked, setChecked] = useState<CompResult | null>(null)
  const [previewAudio, setPreviewAudio] = useState<string | null>(null)

  useEffect(() => {
    setTest(null)
    setDraft(null)
    setLoadError(null)
    setTab('edit')
    if (!testId) return
    fetchCompTest(testId)
      .then((t) => {
        setTest(t)
        setDraft(toInput(t))
        setSavedJson(JSON.stringify(toInput(t)))
      })
      .catch((err) => setLoadError(err instanceof TeacherToolsError && err.status === 404 ? 'notFound' : 'failed'))
  }, [testId])

  const dirty = useMemo(() => !!draft && JSON.stringify(draft) !== savedJson, [draft, savedJson])

  useEffect(() => {
    if (tab !== 'preview' || !test || test.skill !== 'listening') return
    fetchCompAudio(test.id)
      .then((a) => setPreviewAudio(a.url))
      .catch(() => setPreviewAudio(null))
  }, [tab, test])

  async function generate(input: CompGenerateInput) {
    setBusy('generate')
    setError(null)
    try {
      const { test: created, remaining: left } = await generateCompTest(input)
      setRemaining(left)
      navigate(`/teacher/tools/comp-tests/${created.id}`, { replace: true })
    } catch (err) {
      if (err instanceof TeacherToolsError && err.status === 429) setError(c('dailyLimit'))
      else setError(c('generateError'))
    } finally {
      setBusy(null)
    }
  }

  function startEmpty(skill: CompTestInput['skill'], level: CompTestInput['level']) {
    setDraft({
      skill,
      level,
      title: '',
      topic: '',
      maxPlays: 2,
      content: { text: '', ...(skill === 'listening' ? { style: 'monologue' as const } : {}), sections: [emptySection('mcq', skill)] },
    })
    setSavedJson('')
  }

  async function save() {
    if (!draft) return
    setError(null)
    try {
      sanitizeTestInput(draft)
    } catch (err) {
      setError(err instanceof CompValidationError ? c('cantSave', { reason: err.message }) : c('saveError'))
      return
    }
    setBusy('save')
    try {
      const saved = await saveCompTest(draft, test?.id)
      setTest(saved)
      setDraft(toInput(saved))
      setSavedJson(JSON.stringify(toInput(saved)))
      if (!test) navigate(`/teacher/tools/comp-tests/${saved.id}`, { replace: true })
    } catch {
      setError(c('saveError'))
    } finally {
      setBusy(null)
    }
  }

  async function remove() {
    if (!test || !window.confirm(c('deleteConfirm'))) return
    try {
      await deleteCompTest(test.id)
      navigate('/teacher/tools/comp-tests')
    } catch {
      setError(c('saveError'))
    }
  }

  function print() {
    if (!draft) return
    if (!printCompTest(draft, { answerKey: printOpts.answerKey, script: printOpts.script })) setError(c('popupBlocked'))
    setPrintOpts((p) => ({ ...p, open: false }))
  }

  const back = (
    <Link to="/teacher/tools/comp-tests" className="inline-block text-sm text-muted-foreground hover:underline">
      {c('backToList')}
    </Link>
  )

  if (loadError) {
    return (
      <div className="max-w-4xl space-y-4">
        {back}
        <p className="text-sm text-red-600">{loadError === 'notFound' ? c('notFound') : c('loadError')}</p>
      </div>
    )
  }

  if (!draft) {
    if (testId) return <p className="text-sm text-muted-foreground">{c('loading')}</p>
    return (
      <div className="max-w-3xl space-y-6">
        <PageHeading title={c('newTest')} subtitle={c('newSubtitle')} />
        {back}
        <CreateForm busy={busy === 'generate'} error={error} onGenerate={(input) => void generate(input)} onStartEmpty={startEmpty} />
      </div>
    )
  }

  const listening = draft.skill === 'listening'
  const tabs: Tab[] = test ? ['edit', 'preview', 'assign'] : ['edit']

  return (
    <div className="max-w-4xl space-y-5">
      <PageHeading
        title={draft.title || c('untitled')}
        subtitle={`${c(`skill_${draft.skill}`)} · ${draft.level}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {dirty && <span className="text-xs text-amber-700">{c('unsaved')}</span>}
            <button type="button" disabled={!dirty || busy === 'save'} onClick={() => void save()} className={primaryButtonClass}>
              {busy === 'save' ? c('saving') : dirty || !test ? c('save') : c('saved')}
            </button>
            <div className="relative">
              <button type="button" onClick={() => setPrintOpts((p) => ({ ...p, open: !p.open }))} className={`${secondaryButtonClass} inline-flex items-center gap-1.5`} aria-expanded={printOpts.open}>
                <Printer className="h-4 w-4" />
                {c('print')}
              </button>
              {printOpts.open && (
                <div className="absolute right-0 z-20 mt-2 w-64 space-y-2 rounded-xl border border-border bg-card p-3 shadow-lg">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={printOpts.answerKey} onChange={(e) => setPrintOpts((p) => ({ ...p, answerKey: e.target.checked }))} />
                    {c('printKey')}
                  </label>
                  {listening && (
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={printOpts.script} onChange={(e) => setPrintOpts((p) => ({ ...p, script: e.target.checked }))} />
                      {c('printScript')}
                    </label>
                  )}
                  <button type="button" onClick={print} className={`${primaryButtonClass} w-full`}>
                    {c('printNow')}
                  </button>
                </div>
              )}
            </div>
            {test && (
              <button type="button" onClick={() => void remove()} aria-label={c('delete')} className={`${secondaryButtonClass} inline-flex items-center`}>
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        }
      />
      {back}
      {remaining !== null && <p className={hintClass}>{c('remaining', { n: remaining })}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {tabs.length > 1 && (
        <div role="tablist" className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`min-h-11 rounded-full border px-4 text-sm font-medium ${tab === t ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-foreground hover:bg-muted'}`}
            >
              {c(`tab_${t}`)}
            </button>
          ))}
        </div>
      )}

      {tab === 'edit' && (
        <>
          {listening && test && <AudioPanel testId={test.id} version={test.updatedAt} dirty={dirty} />}
          <TestEditor
            value={draft}
            onChange={(next) => {
              setDraft(next)
              setError(null)
            }}
          />
        </>
      )}

      {tab === 'preview' && (
        <div className="space-y-5">
          <p className={hintClass}>{c('previewHint')}</p>
          {listening && (previewAudio ? <audio controls src={previewAudio} className="w-full" /> : <p className={hintClass}>{c('audioNone')}</p>)}
          <TestPaper skill={draft.skill} content={draft.content} answers={answers} onAnswer={(key, v) => setAnswers((a) => ({ ...a, [key]: v }))} />
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => setChecked(scoreComp(draft.content, answers))} className={primaryButtonClass}>
              {c('checkAnswers')}
            </button>
            {(checked || Object.keys(answers).length > 0) && (
              <button
                type="button"
                onClick={() => {
                  setAnswers({})
                  setChecked(null)
                }}
                className={secondaryButtonClass}
              >
                {c('clearAnswers')}
              </button>
            )}
          </div>
          {checked && (
            <div className={cardClass}>
              <p className="text-lg font-semibold text-foreground">{c('scoreLine', { n: checked.score, max: checked.max })}</p>
              <ResultList content={draft.content} result={checked} />
            </div>
          )}
        </div>
      )}

      {tab === 'assign' && test && <AssignPanel testId={test.id} dirty={dirty} />}
    </div>
  )
}
