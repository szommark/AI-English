import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import PageHeading from '../components/PageHeading'
import CefrHistoryLine from '../components/Progress/CefrHistoryLine'
import MistakeAreaList, { visibleAreas } from '../components/Progress/MistakeAreaList'
import GamificationPanel from '../components/gamification/GamificationPanel'
import { MY_PROGRESS_COPY as C } from '../data/myProgressCopy'
import { getMistakeSubtype } from '../data/mistakeTaxonomy'
import { getGrammarItem } from '../data/grammarCurriculum'
import { fetchMyProgress } from '../lib/myProgressApi'
import { useLanguage } from '../lib/i18n'
import type { MyProgress, NextStep, PronunciationProgressItem } from '../lib/progressTypes'

const BUTTON_PRIMARY =
  'inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-base font-medium text-primary-foreground hover:opacity-90'
const BUTTON_SECONDARY =
  'inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-card px-5 py-2.5 text-base font-medium text-primary hover:bg-secondary'

function Card({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-sm">
      {title && <h2 className="text-lg font-semibold text-foreground">{title}</h2>}
      {children}
    </section>
  )
}

function ProgressHeader({ data }: { data: MyProgress }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card>
        <p className="text-sm text-muted-foreground">{C.cefrHeading}</p>
        {data.cefr.current ? (
          <p className="text-4xl font-semibold tracking-tight text-foreground">{data.cefr.current}</p>
        ) : (
          <>
            <p className="text-xl font-semibold text-foreground">{C.cefrNotYet}</p>
            <p className="text-sm text-muted-foreground">{C.cefrNotYetHint}</p>
          </>
        )}
        {data.cefr.history.length > 1 && (
          <p className="text-sm text-muted-foreground">
            {C.cefrHistoryLabel} <CefrHistoryLine history={data.cefr.history} locale="hu-HU" />
          </p>
        )}
      </Card>
      <Card>
        <p className="text-4xl font-semibold tracking-tight text-foreground">{data.sessions.last30Days}</p>
        <p className="text-base text-foreground">{C.sessionsLast30Label}</p>
        <p className="text-sm text-muted-foreground">{C.sessionsTotal(data.sessions.total)}</p>
      </Card>
    </div>
  )
}

function NextStepCard({ step }: { step: NextStep }) {
  const lesson = step.kind === 'lesson' ? getGrammarItem(step.lessonId) : undefined
  return (
    <section className="rounded-xl border border-[var(--teal-accent-border)] bg-[var(--teal-accent-soft)] p-5 space-y-3">
      <h2 className="text-lg font-semibold text-foreground">{C.nextStepHeading}</h2>
      {step.kind === 'lesson' && lesson ? (
        <>
          <div>
            <p className="text-xl font-semibold text-foreground">{getMistakeSubtype(step.subtype)?.labelHu}</p>
            <p className="text-sm text-muted-foreground">{getMistakeSubtype(step.subtype)?.labelEn}</p>
          </div>
          <p className="text-base text-foreground">{C.nextStepReason(step.sessionsWithSubtype, step.windowSize)}</p>
          <p className="text-base text-foreground">
            {C.nextStepLessonLabel} <span className="font-medium">{lesson.item.titleHu}</span>{' '}
            <span className="text-sm text-muted-foreground">({lesson.level})</span>
          </p>
          <Link to={`/grammar-coach?lesson=${encodeURIComponent(step.lessonId)}`} className={BUTTON_PRIMARY}>
            {C.nextStepLessonButton}
          </Link>
        </>
      ) : (
        <>
          <p className="text-base text-foreground">{C.nextStepTutorText}</p>
          <Link to="/tutor-bot" className={BUTTON_PRIMARY}>
            {C.nextStepTutorButton}
          </Link>
        </>
      )}
    </section>
  )
}

function ScoreBar({ label, score }: { label: string; score: number | null }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-16 shrink-0 text-muted-foreground">{label}</span>
      <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-secondary" aria-hidden="true">
        {score !== null && (
          <span className="block h-full rounded-full bg-[var(--teal-accent)]" style={{ width: `${Math.max(0, Math.min(100, score))}%` }} />
        )}
      </span>
      <span className="w-12 shrink-0 text-right font-medium text-foreground">
        {score !== null ? `${Math.round(score)}%` : <span className="font-normal text-muted-foreground">{C.pronNoScore}</span>}
      </span>
    </div>
  )
}

function PronunciationPanel({ items }: { items: PronunciationProgressItem[] }) {
  return (
    <Card title={C.pronHeading}>
      {items.length === 0 ? (
        <>
          <p className="text-base text-muted-foreground">{C.pronEmpty}</p>
          <Link to="/pronunciation" className={BUTTON_SECONDARY}>
            {C.pronEmptyLink}
          </Link>
        </>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">{C.pronIntro}</p>
          <ul className="divide-y divide-border">
            {items.map((p) => (
              <li key={p.soundItemId} className="py-3 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-lg font-semibold text-foreground">{p.symbol}</p>
                    <p className="text-sm text-muted-foreground">
                      {p.titleHu} · {C.pronAttempts(p.attempts)}
                    </p>
                  </div>
                  {p.route && (
                    <Link to={p.route} className={`${BUTTON_SECONDARY} shrink-0 text-sm px-4`}>
                      {C.pronOpen} →
                    </Link>
                  )}
                </div>
                <ScoreBar label={C.pronPerception} score={p.perceptionScore} />
                <ScoreBar label={C.pronProduction} score={p.productionScore} />
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  )
}

function VocabularyPanel({ counts }: { counts: MyProgress['vocabulary'] }) {
  const stats = [
    { label: C.vocabNew, value: counts.new },
    { label: C.vocabPracticing, value: counts.practicing },
    { label: C.vocabMastered, value: counts.mastered },
  ]
  return (
    <Card title={C.vocabHeading}>
      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg bg-secondary px-3 py-3 text-center">
            <p className="text-2xl font-semibold text-foreground">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
      <Link to="/vocabulary" className={BUTTON_SECONDARY}>
        {C.vocabLink} →
      </Link>
    </Card>
  )
}

function TeacherLine() {
  return <p className="text-sm text-muted-foreground text-center">{C.teacherCanSee}</p>
}

/** "Az én fejlődésem": the learner's progress and their next step. Hungarian-only, like its copy file. */
export default function MyProgressPage() {
  const { t } = useLanguage()
  const [data, setData] = useState<MyProgress | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchMyProgress()
      .then((d) => !cancelled && setData(d))
      .catch(() => !cancelled && setError(true))
    return () => {
      cancelled = true
    }
  }, [])

  const heading = <PageHeading title={C.pageTitle} subtitle={C.pageSubtitle} />

  if (error) {
    return (
      <div className="max-w-3xl space-y-6">
        {heading}
        <p className="text-base text-red-700">{C.loadError}</p>
      </div>
    )
  }
  if (!data) {
    return <div className="flex items-center justify-center py-24 text-slate-400">{t('loading')}</div>
  }

  const areasWithData = visibleAreas(data.areas)
  const vocabTotal = data.vocabulary.new + data.vocabulary.practicing + data.vocabulary.mastered
  const brandNew =
    data.sessions.total === 0 && areasWithData.length === 0 && data.pronunciation.length === 0 && vocabTotal === 0

  if (brandNew) {
    return (
      <div className="max-w-3xl space-y-6">
        {heading}
        <Card title={C.emptyHeading}>
          <p className="text-base text-foreground">{C.emptyText}</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/tutor-bot" className={BUTTON_PRIMARY}>
              {C.emptyTutorButton}
            </Link>
            <Link to="/conversational-english" className={BUTTON_SECONDARY}>
              {C.emptyScenarioButton}
            </Link>
          </div>
        </Card>
        <GamificationPanel />
        {data.hasTeacher && <TeacherLine />}
      </div>
    )
  }

  const windowSize = data.areas[0]?.windowSize ?? 0

  return (
    <div className="max-w-3xl space-y-6">
      {heading}
      <ProgressHeader data={data} />
      <NextStepCard step={data.nextStep} />

      <Card title={C.mistakesHeading}>
        {areasWithData.length === 0 ? (
          <p className="text-base text-muted-foreground">{C.mistakesEmpty}</p>
        ) : (
          <>
            {windowSize > 0 && <p className="text-sm text-muted-foreground">{C.mistakesIntro(windowSize)}</p>}
            <MistakeAreaList areas={data.areas} />
          </>
        )}
      </Card>

      <PronunciationPanel items={data.pronunciation} />
      <VocabularyPanel counts={data.vocabulary} />
      <GamificationPanel />
      {data.hasTeacher && <TeacherLine />}
    </div>
  )
}
