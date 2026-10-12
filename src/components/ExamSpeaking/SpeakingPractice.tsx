import { useCallback, useEffect, useRef, useState } from 'react'
import { Check } from 'lucide-react'
import PageHeading from '../PageHeading'
import PracticeSentence from '../PracticeSentence'
import ExaminerSession from './ExaminerSession'
import SampleDialogue from './SampleDialogue'
import SpeakingResults from './SpeakingResults'
import SpeakingTaskSheet from './SpeakingTaskSheet'
import { Elapsed, PrimaryButton, SecondaryButton, StepPill } from './SpeakingControls'
import type { SpeakingExam } from '../../data/exams/speaking'
import { getSpeakingRehearsal } from '../../data/exams/speakingRehearsal'
import { assessSpeakingExam } from '../../lib/examSpeakingApi'
import {
  loadSpeakingPractice,
  newPracticeRun,
  newSpeakingPractice,
  practiceRunKey,
  saveSpeakingPractice,
  type SpeakingPractice,
  type SpeakingPracticeRun,
  type SpeakingPracticeTab,
} from '../../lib/examSpeakingAttempt'
import { useLanguage } from '../../lib/i18n'
import type { ChatMessage } from '../../lib/types'

const TABS: SpeakingPracticeTab[] = ['rehearsal', 'test']

/**
 * Practice mode of a speaking exam: each task on its own, like a writing-paper section. A
 * task has a rehearsal (useful phrases, a sample exchange read aloud, then the learner's own
 * try with a more helpful examiner) and a test (the task as in the exam). Every finished
 * try gets the AI's estimate for that task alone.
 */
export default function SpeakingPracticeRunner({
  paperId,
  title,
  language,
  exam,
  onExit,
}: {
  paperId: string
  title: string
  language: string
  exam: SpeakingExam
  onExit: () => void
}) {
  const { t, lang } = useLanguage()
  const [practice, setPractice] = useState<SpeakingPractice>(() => loadSpeakingPractice(paperId) ?? newSpeakingPractice(exam.tasks[0].id))
  // The run (key + round) the learner just clicked into: it starts by itself.
  const [autoStart, setAutoStart] = useState<string | null>(null)
  const [assessing, setAssessing] = useState<string | null>(null)
  const [assessError, setAssessError] = useState<Record<string, 'failed' | 'empty'>>({})
  const assessedRef = useRef(new Set<string>())

  useEffect(() => saveSpeakingPractice(paperId, practice), [practice, paperId])

  const task = exam.tasks.find((x) => x.id === practice.taskId) ?? exam.tasks[0]
  const tab = practice.tab
  const key = practiceRunKey(task.id, tab)
  const run = practice.runs[key] ?? newPracticeRun()
  const roundKey = `${key}:${run.round}`
  const rehearsal = getSpeakingRehearsal(paperId, task.id)
  const trying = tab === 'test' || !rehearsal || !!practice.trying[task.id]

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [key])

  const updateRun = useCallback(
    (runKey: string, fn: (r: SpeakingPracticeRun) => SpeakingPracticeRun) =>
      setPractice((p) => ({ ...p, runs: { ...p.runs, [runKey]: fn(p.runs[runKey] ?? newPracticeRun()) } })),
    [],
  )

  async function assess(runKey: string, round: number, taskId: string, messages: ChatMessage[]) {
    const errorKey = `${runKey}:${round}`
    assessedRef.current.add(errorKey)
    if (!messages.some((m) => m.role === 'user')) {
      setAssessError((e) => ({ ...e, [errorKey]: 'empty' }))
      return
    }
    setAssessError((e) => {
      const { [errorKey]: _, ...rest } = e
      return rest
    })
    setAssessing(errorKey)
    try {
      const assessment = await assessSpeakingExam({ paperId, transcripts: { [taskId]: messages }, uiLang: lang, taskIds: [taskId] })
      // Ignore a late answer for a try the learner has already restarted.
      updateRun(runKey, (r) => (r.round === round ? { ...r, assessment } : r))
    } catch (err) {
      console.error('Speaking practice assessment failed', err)
      setAssessError((e) => ({ ...e, [errorKey]: 'failed' }))
    } finally {
      setAssessing((a) => (a === errorKey ? null : a))
    }
  }

  // A finished try is assessed once (also after a reload that lost the answer in flight).
  useEffect(() => {
    if (run.done && !run.assessment && !assessedRef.current.has(roundKey)) assess(key, run.round, task.id, run.messages)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundKey, run.done, run.assessment])

  function openTask(taskId: string, nextTab: SpeakingPracticeTab = tab) {
    setAutoStart(null)
    setPractice((p) => ({ ...p, taskId, tab: nextTab }))
  }

  function startTry() {
    setAutoStart(roundKey)
    setPractice((p) => ({ ...p, trying: { ...p.trying, [task.id]: true } }))
  }

  function tryAgain() {
    const round = run.round + 1
    setAutoStart(`${key}:${round}`)
    updateRun(key, () => newPracticeRun(round))
  }

  function toTest() {
    const testKey = practiceRunKey(task.id, 'test')
    const testRun = practice.runs[testKey] ?? newPracticeRun()
    setAutoStart(testRun.done ? null : `${testKey}:${testRun.round}`)
    setPractice((p) => ({ ...p, tab: 'test' }))
  }

  const index = exam.tasks.indexOf(task)
  const nextTask = exam.tasks[index + 1]
  const error = assessError[roundKey]

  return (
    <div className="space-y-5">
      <PageHeading title={title} subtitle={`${t('exSpeaking')} · ${t('exModePractice')}`} />

      <nav className="flex flex-wrap gap-2" aria-label={t('exSpkSteps')}>
        <StepPill onClick={onExit}>{t('exSpkOverviewTitle')}</StepPill>
        {exam.tasks.map((x) => (
          <StepPill key={x.id} current={x.id === task.id} onClick={() => x.id !== task.id && openTask(x.id)}>
            {practice.runs[practiceRunKey(x.id, 'test')]?.assessment && <Check className="h-4 w-4" aria-label={t('exSubmitted')} />}
            {x.label}
          </StepPill>
        ))}
      </nav>

      <div className="space-y-2">
        <div role="tablist" aria-label={t('exSpkPracticeTabs')} className="inline-flex rounded-xl border border-border bg-card p-1">
          {TABS.map((x) => (
            <button
              key={x}
              type="button"
              role="tab"
              aria-selected={x === tab}
              onClick={() => x !== tab && openTask(task.id, x)}
              className={`min-h-10 rounded-lg px-4 text-sm font-semibold ${x === tab ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'}`}
            >
              {x === 'rehearsal' ? t('rehearsal') : t('testMode')}
            </button>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">{tab === 'rehearsal' ? t('exSpkRehearsalIntro') : t('exSpkTestIntro')}</p>
      </div>

      {trying ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start">
          <SpeakingTaskSheet task={task} language={language} />
          <div className="space-y-4 lg:sticky lg:top-20">
            <div className="space-y-4 rounded-2xl border border-border bg-card p-4 sm:p-5">
              {tab === 'test' && run.startedAt && !run.done && <Elapsed since={run.startedAt} minutes={task.minutes} />}
              <ExaminerSession
                key={roundKey}
                paperId={paperId}
                task={task}
                mode={tab}
                messages={run.messages}
                done={run.done}
                autoStart={autoStart === roundKey}
                onMessages={(messages) => updateRun(key, (r) => ({ ...r, messages, startedAt: r.startedAt ?? Date.now() }))}
                onDone={() => updateRun(key, (r) => ({ ...r, done: true }))}
              />
            </div>
            {tab === 'rehearsal' && rehearsal && (
              <details open className="rounded-2xl border border-border bg-card px-4 py-2 sm:px-5">
                <summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold text-foreground">{t('usefulPhrases')}</summary>
                <ul lang={language} className="space-y-2 pb-3 text-sm">
                  {rehearsal.phrases.map((p) => (
                    <li key={p.en} className="text-foreground">
                      {p.en}
                      {lang === 'hu' && (
                        <span lang="hu" className="block text-xs text-muted-foreground">
                          {p.hu}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
                <div className="pb-3">
                  <button
                    type="button"
                    onClick={() => setPractice((p) => ({ ...p, trying: { ...p.trying, [task.id]: false } }))}
                    className="min-h-11 rounded-xl border border-border bg-card px-4 text-sm font-medium text-foreground hover:bg-muted"
                  >
                    {t('sampleConversation')}
                  </button>
                </div>
              </details>
            )}
          </div>
        </div>
      ) : (
        rehearsal && (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start">
            <div className="lg:sticky lg:top-20">
              <SpeakingTaskSheet task={task} language={language} />
            </div>
            <div className="space-y-4">
              <section className="space-y-3 rounded-2xl border border-border bg-card p-4 sm:p-5">
                <h2 className="font-semibold text-foreground">{t('usefulPhrases')}</h2>
                <div lang={language} className="space-y-2">
                  {rehearsal.phrases.map((p) => (
                    <PracticeSentence key={p.en} en={p.en} gloss={lang === 'hu' ? p.hu : undefined} />
                  ))}
                </div>
              </section>

              <section className="space-y-3 rounded-2xl border border-border bg-card p-4 sm:p-5">
                <h2 className="font-semibold text-foreground">{t('sampleConversation')}</h2>
                <SampleDialogue
                  lines={rehearsal.sample}
                  shown={practice.sampleShown[task.id] ?? 0}
                  onShownChange={(n) => setPractice((p) => ({ ...p, sampleShown: { ...p.sampleShown, [task.id]: n } }))}
                  language={language}
                />
              </section>

              <PrimaryButton onClick={startTry}>{t('startMyTry')}</PrimaryButton>

              <section className="space-y-3 rounded-2xl border border-border bg-card p-4 sm:p-5">
                <div>
                  <h2 className="font-semibold text-foreground">{t('practiceConversation')}</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">{t('practiceConversationHint')}</p>
                </div>
                <div lang={language} className="space-y-2">
                  {rehearsal.sample.map((l, i) => (
                    <PracticeSentence key={i} en={l.line} speakerLabel={l.speaker === 'examiner' ? t('exSpkExaminer') : t('exSpkYou')} />
                  ))}
                </div>
              </section>
            </div>
          </div>
        )
      )}

      {trying && run.done && (
        <section className="space-y-5 border-t border-border pt-6">
          <h2 className="text-xl font-semibold text-foreground">{t('exSpkTaskResult', { task: `${task.label}: ${task.title}` })}</h2>
          {assessing === roundKey && <p className="py-8 text-center text-muted-foreground" role="status">{t('exSpkAssessing')}</p>}
          {error && (
            <div className="space-y-3 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-800" role="alert">
              <p>{error === 'empty' ? t('exSpkPracticeNothingSaid') : t('exSpkAssessFailed')}</p>
              {error === 'failed' && <SecondaryButton onClick={() => assess(key, run.round, task.id, run.messages)}>{t('exRetry')}</SecondaryButton>}
            </div>
          )}
          {run.assessment && (
            <SpeakingResults
              exam={{ ...exam, tasks: [task] }}
              language={language}
              assessment={run.assessment}
              transcripts={{ [task.id]: run.messages }}
            />
          )}
          <div className="flex flex-col gap-2 sm:flex-row">
            {tab === 'rehearsal' ? (
              <PrimaryButton onClick={toTest}>{t('exSpkToTest')}</PrimaryButton>
            ) : nextTask ? (
              <PrimaryButton onClick={() => openTask(nextTask.id, 'rehearsal')}>{t('exSpkNextTask', { task: `${nextTask.label}: ${nextTask.title}` })}</PrimaryButton>
            ) : (
              <PrimaryButton onClick={onExit}>{t('exSpkOverviewTitle')}</PrimaryButton>
            )}
            <SecondaryButton onClick={tryAgain}>{t('exSpkTryAgain')}</SecondaryButton>
          </div>
        </section>
      )}
    </div>
  )
}
