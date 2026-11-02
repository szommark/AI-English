import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeading from '../components/PageHeading'
import { visibleAreas } from '../components/Progress/MistakeAreaList'
import {
  BUTTON_PRIMARY,
  BUTTON_SECONDARY,
  CoursesPanel,
  GrammarPanel,
  MistakesPanel,
  ProgressCard,
  ProgressHeader,
  PronunciationPanel,
  VocabularyPanel,
} from '../components/Progress/ProgressPanels'
import GamificationPanel, { GamificationSummaryCard, useGamificationOverview } from '../components/gamification/GamificationPanel'
import { pickTitle, useMyProgressCopy } from '../data/myProgressCopy'
import { getMistakeSubtype, mistakeLabel } from '../data/mistakeTaxonomy'
import { getGrammarItem } from '../data/grammarCurriculum'
import { fetchMyProgress } from '../lib/myProgressApi'
import { useLanguage } from '../lib/i18n'
import type { MyProgress, NextStep } from '../lib/progressTypes'

function NextStepCard({ step }: { step: NextStep }) {
  const C = useMyProgressCopy()
  const { lang } = useLanguage()
  const lesson = step.kind === 'lesson' ? getGrammarItem(step.lessonId) : undefined
  const subtype = step.kind === 'lesson' ? getMistakeSubtype(step.subtype) : undefined
  return (
    <section className="rounded-xl border border-[var(--teal-accent-border)] bg-[var(--teal-accent-soft)] p-5 space-y-3">
      <h2 className="text-lg font-semibold text-foreground">{C.nextStepHeading}</h2>
      {step.kind === 'lesson' && lesson ? (
        <>
          {subtype && <p className="text-xl font-semibold text-foreground">{mistakeLabel(subtype, lang)}</p>}
          <p className="text-base text-foreground">{C.nextStepReason(step.sessionsWithSubtype, step.windowSize)}</p>
          <p className="text-base text-foreground">
            {C.nextStepLessonLabel} <span className="font-medium">{pickTitle(lang, lesson.item)}</span>{' '}
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

function TeacherLine() {
  const C = useMyProgressCopy()
  return <p className="text-sm text-muted-foreground text-center">{C.teacherCanSee}</p>
}

/**
 * "Az én fejlődésem": the learner's progress and their next step, in the UI language. Same
 * sections and format as the teacher's student page (src/pages/StudentProgressPage.tsx),
 * points and badges first.
 */
export default function MyProgressPage() {
  const C = useMyProgressCopy()
  const { t } = useLanguage()
  const [data, setData] = useState<MyProgress | null>(null)
  const [error, setError] = useState(false)
  const gamification = useGamificationOverview()

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

  const vocabTotal = data.vocabulary.new + data.vocabulary.practicing + data.vocabulary.mastered
  const { fastPractice, tests, ownLists, gameCounts } = data.vocabActivity
  const brandNew =
    data.sessions.total === 0 &&
    visibleAreas(data.areas).length === 0 &&
    data.pronunciation.length === 0 &&
    vocabTotal === 0 &&
    fastPractice.length + tests.length + ownLists.length + gameCounts.started === 0 &&
    data.grammar.written.counts.started + data.grammar.timeGame.counts.started === 0 &&
    data.courses.length === 0

  if (brandNew) {
    return (
      <div className="max-w-3xl space-y-6">
        {heading}
        <GamificationSummaryCard {...gamification} />
        <ProgressCard title={C.emptyHeading}>
          <p className="text-base text-foreground">{C.emptyText}</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/tutor-bot" className={BUTTON_PRIMARY}>
              {C.emptyTutorButton}
            </Link>
            <Link to="/conversational-english" className={BUTTON_SECONDARY}>
              {C.emptyScenarioButton}
            </Link>
          </div>
        </ProgressCard>
        <GamificationPanel data={gamification.data} />
        {data.hasTeacher && <TeacherLine />}
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-6">
      {heading}
      <GamificationSummaryCard {...gamification} />
      <ProgressHeader
        cefrCurrent={data.cefr.current}
        history={data.cefr.history}
        last30Days={data.sessions.last30Days}
        total={data.sessions.total}
      />
      <NextStepCard step={data.nextStep} />
      <MistakesPanel areas={data.areas} mix={data.mistakeMix} />
      <PronunciationPanel items={data.pronunciation} />
      <VocabularyPanel counts={data.vocabulary} activity={data.vocabActivity} />
      <GrammarPanel grammar={data.grammar} />
      <CoursesPanel courses={data.courses} />
      <GamificationPanel data={gamification.data} />
      {data.hasTeacher && <TeacherLine />}
    </div>
  )
}
