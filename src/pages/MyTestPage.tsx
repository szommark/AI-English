import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PageHeading from '../components/PageHeading'
import { cardClass, primaryButtonClass } from '../components/TeacherTools/ui'
import TestPaper from '../components/CompTests/TestPaper'
import ResultList from '../components/CompTests/ResultList'
import LimitedAudio from '../components/CompTests/LimitedAudio'
import TestText from '../components/CompTests/TestText'
import { useCompCopy } from '../data/compTestCopy'
import { TeacherToolsError } from '../lib/teacherToolsApi'
import { fetchMyTest, submitMyTest } from '../lib/compTestApi'
import { itemCount, type MyCompTest } from '../lib/compTests'
import type { ExamAnswers } from '../lib/examScoring'

const draftKey = (id: string) => `avalon:comp-test-draft:${id}`

function loadDraft(id: string): ExamAnswers {
  try {
    const raw = localStorage.getItem(draftKey(id))
    const parsed: unknown = raw ? JSON.parse(raw) : null
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as ExamAnswers) : {}
  } catch {
    return {}
  }
}

/**
 * /my-tests/:assignmentId: take an assigned test (answers kept in this browser until handed in),
 * then see the score and every answer against the key, with the text or the audioscript.
 */
export default function MyTestPage() {
  const { c } = useCompCopy()
  const { assignmentId = '' } = useParams()
  const [test, setTest] = useState<MyCompTest | null>(null)
  const [error, setError] = useState<'notFound' | 'failed' | null>(null)
  const [answers, setAnswers] = useState<ExamAnswers>(() => loadDraft(assignmentId))
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(false)

  useEffect(() => {
    fetchMyTest(assignmentId)
      .then(setTest)
      .catch((err) => setError(err instanceof TeacherToolsError && err.status === 404 ? 'notFound' : 'failed'))
  }, [assignmentId])

  useEffect(() => {
    if (!test || test.submittedAt) return
    try {
      localStorage.setItem(draftKey(assignmentId), JSON.stringify(answers))
    } catch {
      // Private mode: answers last for this page only.
    }
  }, [answers, assignmentId, test])

  async function submit() {
    if (!test) return
    const total = itemCount(test.content)
    const given = Object.values(answers).filter((v) => v !== '').length
    if (!window.confirm(given < total ? c('submitConfirmMissing', { n: total - given }) : c('submitConfirm'))) return
    setSubmitting(true)
    setSubmitError(false)
    try {
      const done = await submitMyTest(assignmentId, answers)
      setTest(done)
      try {
        localStorage.removeItem(draftKey(assignmentId))
      } catch {
        // ignore
      }
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      if (err instanceof TeacherToolsError && err.status === 409) {
        setTest(await fetchMyTest(assignmentId).catch(() => test))
      } else setSubmitError(true)
    } finally {
      setSubmitting(false)
    }
  }

  const back = (
    <Link to="/my-tests" className="inline-block text-sm text-muted-foreground hover:underline">
      {c('backToMyTests')}
    </Link>
  )

  if (error) {
    return (
      <div className="max-w-3xl space-y-4">
        {back}
        <p className="text-sm text-red-600">{error === 'notFound' ? c('notFound') : c('loadError')}</p>
      </div>
    )
  }
  if (!test) return <p className="text-sm text-muted-foreground">{c('loading')}</p>

  const subtitle = `${c(`skill_${test.skill}`)} · ${test.level} · ${c('fromTeacher', { email: test.teacherEmail })}`

  if (test.submittedAt && test.result) {
    return (
      <div className="max-w-3xl space-y-5">
        <PageHeading title={test.title} subtitle={subtitle} />
        {back}
        <div className={cardClass}>
          <p className="text-2xl font-semibold text-foreground">{c('scoreLine', { n: test.result.score, max: test.result.max })}</p>
          <p className="text-sm text-muted-foreground">{c('resultHint')}</p>
        </div>
        <ResultList content={test.content} result={test.result} />
        {test.skill === 'listening' && test.audioUrl && <audio controls src={test.audioUrl} className="w-full" />}
        {test.content.text && (
          <details className="rounded-2xl border border-border p-4" open={test.skill === 'reading'}>
            <summary className="min-h-11 cursor-pointer py-2 font-medium text-foreground">{test.skill === 'reading' ? c('theText') : c('theScript')}</summary>
            <div className="pt-2">
              <TestText text={test.content.text} />
            </div>
          </details>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-5">
      <PageHeading title={test.title} subtitle={subtitle} />
      {back}
      {test.skill === 'listening' &&
        (test.audioUrl ? <LimitedAudio url={test.audioUrl} maxPlays={test.maxPlays} storageKey={`avalon:comp-test-plays:${assignmentId}`} /> : <p className="text-sm text-red-600">{c('audioMissing')}</p>)}
      <TestPaper skill={test.skill} content={test.content} answers={answers} onAnswer={(key, v) => setAnswers((a) => ({ ...a, [key]: v }))} />
      {submitError && <p className="text-sm text-red-600">{c('submitError')}</p>}
      <button type="button" disabled={submitting} onClick={() => void submit()} className={primaryButtonClass}>
        {submitting ? c('submitting') : c('submit')}
      </button>
    </div>
  )
}
