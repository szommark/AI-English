import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import PageHeading from '../components/PageHeading'
import AccentToggle from '../components/AccentToggle'
import PracticeSession, { type SessionSummary } from '../components/Vocabulary/PracticeSession'
import DrillSession, { ROUND_LABEL, type DrillSummary } from '../components/Vocabulary/DrillSession'
import DrillSetupPanel, { type DrillChoice } from '../components/Vocabulary/DrillSetupPanel'
import FastPracticeTab from '../components/Vocabulary/FastPracticeTab'
import MyWordlistsTab from '../components/Vocabulary/MyWordlistsTab'
import { DEFAULT_WORDLIST_FILTER, type WordlistFilter } from '../components/Vocabulary/WordlistFilters'
import WordlistView from '../components/Vocabulary/WordlistView'
import { useListTitle } from '../components/Vocabulary/wordlistLabels'
import { getFeature } from '../data/features'
import { localizeFeature, useLanguage, type Lang, type MessageKey } from '../lib/i18n'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis'
import { getAccentPreference, setAccentPreference, type AccentPreference } from '../lib/voiceSelection'
import { DRILL_ROUNDS } from '../lib/vocabPractice'
import { fetchPracticeSession, fetchVocabOverview, fetchWordlist, fetchWordlists, startDrill } from '../lib/vocabPracticeApi'
import {
  COMPILES_PER_DAY,
  type DrillRun,
  type PracticeCard,
  type PracticeExercise,
  type VocabOverview,
  type WordlistDetail,
  type WordlistRef,
  type WordlistsResponse,
} from '../lib/vocab'

type Tab = 'fast' | 'lists' | 'srs'

/** Where a Fast practice run goes back to: the tabs, or the list it was started from. */
type ReturnTo = 'tabs' | WordlistRef

type View =
  | { name: 'tabs' }
  | { name: 'list'; ref: WordlistRef; initial: WordlistDetail | null }
  | { name: 'drill-setup'; detail: WordlistDetail; initialWords: string[] | null; returnTo: ReturnTo }
  | { name: 'drill'; run: DrillRun; detail: WordlistDetail; choice: DrillChoice; returnTo: ReturnTo }
  | { name: 'drill-summary'; summary: DrillSummary; detail: WordlistDetail; choice: DrillChoice; returnTo: ReturnTo }
  | { name: 'review'; cards: PracticeCard[] }

/** "in 3 hours", "tomorrow" … in the UI language. */
function relativeTime(iso: string, lang: Lang): string {
  const diffMs = new Date(iso).getTime() - Date.now()
  const fmt = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' })
  const minutes = Math.round(diffMs / 60_000)
  if (Math.abs(minutes) < 60) return fmt.format(Math.max(1, minutes), 'minute')
  const hours = Math.round(minutes / 60)
  if (Math.abs(hours) < 24) return fmt.format(hours, 'hour')
  return fmt.format(Math.round(hours / 24), 'day')
}

/** Where the student's words are (design §6.2): not in review → new → learning → learned. */
function Pipeline({ stages, notInSrs }: { stages: VocabOverview['stages']; notInSrs: number }) {
  const { t } = useLanguage()
  const steps: { label: MessageKey; n: number; className: string }[] = [
    { label: 'vcPipeNotInSrs', n: notInSrs, className: 'border border-dashed border-border text-muted-foreground' },
    { label: 'vcPipeNew', n: stages.new, className: 'bg-secondary text-secondary-foreground' },
    { label: 'vcPipeLearning', n: stages.learning, className: 'bg-amber-100 text-amber-800' },
    { label: 'vcPipeLearned', n: stages.learned, className: 'bg-emerald-100 text-emerald-700' },
  ]
  return (
    <ol className="grid grid-cols-2 gap-2 sm:flex sm:items-stretch">
      {steps.map((step, i) => (
        <li key={step.label} className="flex items-center gap-1 sm:flex-1">
          {i > 0 && <ChevronRight className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:block" aria-hidden />}
          <div className={`h-full flex-1 rounded-xl px-3 py-2.5 ${step.className}`}>
            <div className="text-2xl font-semibold tabular-nums">{step.n}</div>
            <div className="text-xs">{t(step.label)}</div>
          </div>
        </li>
      ))}
    </ol>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-secondary px-4 py-3">
      <div className="text-2xl font-semibold tabular-nums text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}

/**
 * Student Vocabulary page, route /vocabulary (design §7, decisions 6–7): Fast practice,
 * My wordlists, Fast practice and Spaced repetition tabs.
 */
export default function VocabularyPage() {
  const { t, lang } = useLanguage()
  const feature = getFeature('vocabulary')!
  const [tab, setTab] = useState<Tab>('lists')
  /** Shared by the Fast practice and My wordlists tabs, and kept while a list is open. */
  const [listFilter, setListFilter] = useState<WordlistFilter>(DEFAULT_WORDLIST_FILTER)
  /** The last Fast practice run's exercise types: the default for the next run. */
  const [drillExercises, setDrillExercises] = useState<PracticeExercise[]>([...DRILL_ROUNDS])
  const [view, setView] = useState<View>({ name: 'tabs' })
  const [accent, setAccent] = useState<AccentPreference>(() => getAccentPreference())
  const tts = useSpeechSynthesis('female', accent)

  const [overview, setOverview] = useState<VocabOverview | null>(null)
  const [wordlists, setWordlists] = useState<WordlistsResponse | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)
  /** A Fast practice or review that failed to start. */
  const [startFailed, setStartFailed] = useState(false)
  const [starting, setStarting] = useState(false)
  const [reviewSummary, setReviewSummary] = useState<SessionSummary | null>(null)

  const refresh = useCallback(() => {
    setLoadFailed(false)
    Promise.all([fetchVocabOverview(), fetchWordlists()])
      .then(([o, w]) => {
        setOverview(o)
        setWordlists(w)
      })
      .catch(() => setLoadFailed(true))
  }, [])

  useEffect(refresh, [refresh])
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [view.name])

  function goBack(returnTo: ReturnTo) {
    setStartFailed(false)
    setView(returnTo === 'tabs' ? { name: 'tabs' } : { name: 'list', ref: returnTo, initial: null })
  }

  /** From the Fast practice tab: load the list, then let the student untick words and exercises. */
  async function practiseList(ref: WordlistRef) {
    setStarting(true)
    setStartFailed(false)
    try {
      setView({ name: 'drill-setup', detail: await fetchWordlist(ref), initialWords: null, returnTo: 'tabs' })
    } catch {
      setStartFailed(true)
    } finally {
      setStarting(false)
    }
  }

  async function beginDrill(detail: WordlistDetail, choice: DrillChoice, returnTo: ReturnTo) {
    setStarting(true)
    setStartFailed(false)
    setDrillExercises(choice.exercises)
    try {
      const run = await startDrill({ kind: detail.list.kind, id: detail.list.id }, choice.itemIds)
      setView({ name: 'drill', run, detail, choice, returnTo })
    } catch {
      setStartFailed(true)
    } finally {
      setStarting(false)
    }
  }

  async function startReview() {
    setStarting(true)
    setStartFailed(false)
    setReviewSummary(null)
    try {
      const session = await fetchPracticeSession()
      if (session.cards.length > 0) setView({ name: 'review', cards: session.cards })
      else refresh()
    } catch {
      setStartFailed(true)
    } finally {
      setStarting(false)
    }
  }

  function changeAccent(next: AccentPreference) {
    setAccent(next)
    setAccentPreference(next)
  }

  const startError = startFailed && <p className="text-sm text-red-600">{t('vcDrillFailed')}</p>

  let body: ReactNode
  switch (view.name) {
    case 'review':
      body = (
        <PracticeSession
          cards={view.cards}
          speech={tts}
          onFinish={(s) => {
            setReviewSummary(s)
            setView({ name: 'tabs' })
            refresh()
          }}
        />
      )
      break

    case 'drill':
      body = (
        <DrillSession
          key={view.run.runId}
          runId={view.run.runId}
          cards={view.run.cards}
          exercises={view.choice.exercises}
          speech={tts}
          onFinish={(summary) => {
            setView({ ...view, name: 'drill-summary', summary })
            refresh()
          }}
        />
      )
      break

    case 'drill-summary':
      body = (
        <div className="space-y-4">
          {startError}
          <DrillSummaryCard
            summary={view.summary}
            detail={view.detail}
            starting={starting}
            onAgain={() => void beginDrill(view.detail, view.choice, view.returnTo)}
            onChangeWords={() =>
              setView({ name: 'drill-setup', detail: view.detail, initialWords: view.choice.itemIds, returnTo: view.returnTo })
            }
            onDone={() => goBack(view.returnTo)}
          />
        </div>
      )
      break

    case 'drill-setup':
      body = (
        <div className="space-y-4">
          {startError}
          <DrillSetupPanel
            detail={view.detail}
            initialWords={view.initialWords}
            initialExercises={drillExercises}
            starting={starting}
            onStart={(choice) => void beginDrill(view.detail, choice, view.returnTo)}
            onCancel={() => goBack(view.returnTo)}
          />
        </div>
      )
      break

    case 'list':
      body = (
        <WordlistView
          key={`${view.ref.kind}-${view.ref.id}`}
          listRef={view.ref}
          initial={view.initial}
          compilesLeft={Math.max(0, COMPILES_PER_DAY - (wordlists?.compiledToday ?? 0))}
          onBack={() => setView({ name: 'tabs' })}
          onPractise={(detail) =>
            setView({ name: 'drill-setup', detail, initialWords: null, returnTo: { kind: detail.list.kind, id: detail.list.id } })
          }
          onChanged={refresh}
        />
      )
      break

    case 'tabs': {
      const notInSrs = wordlists?.notInSrs ?? 0
      const tabButton = (value: Tab, label: string) => (
        <button
          type="button"
          onClick={() => setTab(value)}
          aria-pressed={tab === value}
          className={`rounded-md px-3 py-1.5 text-sm sm:px-4 ${
            tab === value ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {label}
        </button>
      )
      body = (
        <>
          <div className="inline-flex flex-wrap rounded-lg bg-secondary p-0.5" role="group">
            {tabButton('lists', t('vcTabLists'))}
            {tabButton('fast', t('vcTabFast'))}
            {tabButton('srs', t('vcTabSrs'))}
          </div>

          {loadFailed && <p className="text-sm text-red-600">{t('vcLoadFailed')}</p>}
          {startError}

          {tab === 'fast' &&
            (wordlists === null ? (
              !loadFailed && <p className="text-sm text-muted-foreground">{t('loading')}</p>
            ) : (
              <FastPracticeTab
                data={wordlists}
                filter={listFilter}
                onFilterChange={setListFilter}
                onPractise={(ref) => void practiseList(ref)}
              />
            ))}

          {tab === 'lists' &&
            (wordlists === null ? (
              !loadFailed && <p className="text-sm text-muted-foreground">{t('loading')}</p>
            ) : (
              <MyWordlistsTab
                data={wordlists}
                filter={listFilter}
                onFilterChange={setListFilter}
                onOpen={(ref) => setView({ name: 'list', ref, initial: null })}
                onCompiled={(detail) => {
                  refresh()
                  setView({ name: 'list', ref: { kind: 'custom', id: detail.list.id }, initial: detail })
                }}
              />
            ))}

          {tab === 'srs' &&
            (overview === null ? (
              !loadFailed && <p className="text-sm text-muted-foreground">{t('loading')}</p>
            ) : (
              <div className="space-y-4">
                {reviewSummary && <SummaryCard summary={reviewSummary} />}
                {overview.totalCards + overview.stages.paused + notInSrs === 0 ? (
                  <p className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">{t('vcNoCards')}</p>
                ) : (
                  <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
                    <div className="space-y-1">
                      <h2 className="text-lg font-semibold text-foreground">{t('vcReviewTitle')}</h2>
                      <p className="text-sm text-muted-foreground">{t('vcReviewHint')}</p>
                    </div>
                    <Pipeline stages={overview.stages} notInSrs={notInSrs} />
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      {overview.dueCount > 0 ? (
                        <span className="font-medium text-foreground">{t('vcNextRepNow', { n: overview.dueCount })}</span>
                      ) : (
                        overview.nextDue && <span>{t('vcNextRepAt', { when: relativeTime(overview.nextDue, lang) })}</span>
                      )}
                      {overview.newAvailable > 0 && <span>{t('vcNewTodayCount', { n: overview.newAvailable })}</span>}
                      {overview.stages.paused > 0 && <span>{t('vcPipePaused', { n: overview.stages.paused })}</span>}
                    </div>
                    {overview.totalCards === 0 ? (
                      <p className="text-sm text-muted-foreground">{t('vcNoCards')}</p>
                    ) : overview.dueCount + overview.newAvailable > 0 ? (
                      <button
                        type="button"
                        onClick={() => void startReview()}
                        disabled={starting}
                        className="w-full rounded-lg bg-[var(--teal-accent)] px-5 py-3 text-sm font-semibold text-primary hover:bg-[var(--teal-accent-strong)] disabled:opacity-40 sm:w-auto"
                      >
                        {starting ? t('vcStarting') : reviewSummary ? t('vcPracticeMore') : t('vcStart')}
                      </button>
                    ) : (
                      <p className="text-sm text-muted-foreground">{t('vcNothingDue')}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
        </>
      )
      break
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeading title={localizeFeature(lang, feature).title} actions={<AccentToggle accent={accent} onChange={changeAccent} />} />
      {body}
    </div>
  )
}

function SummaryCard({ summary }: { summary: SessionSummary }) {
  const { t } = useLanguage()
  return (
    <div className="space-y-4 rounded-2xl border border-[var(--teal-accent-border)] bg-[var(--teal-accent-soft)] p-5">
      <h2 className="text-lg font-semibold text-foreground">{t('vcSummaryTitle')}</h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        <Stat label={t('vcSummaryReviewed')} value={summary.reviewed} />
        <Stat label={t('vcSummaryCorrect')} value={summary.correct} />
        <Stat label={t('vcSummaryNew')} value={summary.newStarted} />
        <Stat label={t('vcSummaryLearned')} value={summary.learned} />
      </div>
      {summary.completedLists.map((title) => (
        <p key={title} className="text-sm font-medium text-foreground">
          🎉 {t('vcListCompleted', { title })}
        </p>
      ))}
      {summary.saveFailures > 0 && <p className="text-sm text-red-600">{t('vcSaveFailures', { n: summary.saveFailures })}</p>}
    </div>
  )
}

function DrillSummaryCard({
  summary,
  detail,
  starting,
  onAgain,
  onChangeWords,
  onDone,
}: {
  summary: DrillSummary
  detail: WordlistDetail
  starting: boolean
  onAgain: () => void
  onChangeWords: () => void
  onDone: () => void
}) {
  const { t } = useLanguage()
  const listTitle = useListTitle()
  return (
    <div className="space-y-4 rounded-2xl border border-[var(--teal-accent-border)] bg-[var(--teal-accent-soft)] p-5">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">{t('vcSummaryTitle')}</h2>
        <p className="break-words text-sm text-muted-foreground">
          {listTitle(detail.list)} · {t('vcDrillSummaryWords', { n: summary.words })}
        </p>
      </div>
      {summary.rounds.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          {summary.rounds.map((r) => (
            <Stat key={r.exercise} label={t(ROUND_LABEL[r.exercise])} value={`${r.correct} / ${r.total}`} />
          ))}
        </div>
      )}
      {summary.saveFailures > 0 && <p className="text-sm text-red-600">{t('vcDrillSaveFailures', { n: summary.saveFailures })}</p>}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onAgain}
          disabled={starting}
          className="rounded-lg bg-[var(--teal-accent)] px-5 py-2.5 text-sm font-semibold text-primary hover:bg-[var(--teal-accent-strong)] disabled:opacity-40"
        >
          {starting ? t('vcStarting') : t('vcDrillAgain')}
        </button>
        <button
          type="button"
          onClick={onChangeWords}
          disabled={starting}
          className="rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground hover:bg-secondary"
        >
          {t('vcDrillChangeWords')}
        </button>
        <button
          type="button"
          onClick={onDone}
          disabled={starting}
          className="rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground hover:bg-secondary"
        >
          {t('vcClose')}
        </button>
      </div>
    </div>
  )
}
