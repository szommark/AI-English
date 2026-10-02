import { useCallback, useEffect, useState, type ReactNode } from 'react'
import PageHeading from '../components/PageHeading'
import AccentToggle from '../components/AccentToggle'
import PracticeSession, { type SessionSummary } from '../components/Vocabulary/PracticeSession'
import DrillSession, { ROUND_LABEL, type DrillSummary } from '../components/Vocabulary/DrillSession'
import DrillSetupPanel, { type DrillChoice } from '../components/Vocabulary/DrillSetupPanel'
import FastPracticeTab from '../components/Vocabulary/FastPracticeTab'
import GamesTab from '../components/Vocabulary/GamesTab'
import ListSrsPanel, { SrsExplainer } from '../components/Vocabulary/ListSrsPanel'
import TestSession, { TestSummaryCard, type TestSummary } from '../components/Vocabulary/TestSession'
import MyWordlistsTab from '../components/Vocabulary/MyWordlistsTab'
import { DEFAULT_WORDLIST_FILTER, type WordlistFilter } from '../components/Vocabulary/WordlistFilters'
import WordlistView from '../components/Vocabulary/WordlistView'
import { KindBadge, LevelBadge, useListTitle } from '../components/Vocabulary/wordlistLabels'
import { getFeature } from '../data/features'
import { localizeFeature, useLanguage } from '../lib/i18n'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis'
import { getAccentPreference, setAccentPreference, type AccentPreference } from '../lib/voiceSelection'
import { DRILL_ROUNDS } from '../lib/vocabPractice'
import { fetchPracticeSession, fetchWordlist, fetchWordlists, startDrill, startTest } from '../lib/vocabPracticeApi'
import {
  COMPILES_PER_DAY,
  hasSrsSession,
  type DrillRun,
  type PracticeCard,
  type PracticeExercise,
  type TestRun,
  type WordlistDetail,
  type WordlistRef,
  type WordlistSummary,
  type WordlistsResponse,
} from '../lib/vocab'

type Tab = 'fast' | 'lists' | 'srs' | 'games'

/** Where a Fast practice run or a review session goes back to: the tabs, or the list it was started from. */
type ReturnTo = 'tabs' | WordlistRef

type View =
  | { name: 'tabs' }
  | { name: 'list'; ref: WordlistRef; initial: WordlistDetail | null; summary?: SessionSummary }
  | { name: 'drill-setup'; detail: WordlistDetail; initialWords: string[] | null; returnTo: ReturnTo }
  | { name: 'drill'; run: DrillRun; detail: WordlistDetail; choice: DrillChoice; returnTo: ReturnTo }
  | { name: 'drill-summary'; summary: DrillSummary; detail: WordlistDetail; choice: DrillChoice; returnTo: ReturnTo }
  | { name: 'review'; cards: PracticeCard[]; list: WordlistSummary; returnTo: ReturnTo }
  | { name: 'test'; run: TestRun; list: WordlistSummary; returnTo: ReturnTo }
  | { name: 'test-summary'; summary: TestSummary; list: WordlistSummary; returnTo: ReturnTo }

const refOf = (list: WordlistSummary): WordlistRef => ({ kind: list.kind, id: list.id })

/** Lists whose review has something to do now come first; otherwise the lists' own order. */
function srsOrder(lists: WordlistSummary[]): WordlistSummary[] {
  const ready = (l: WordlistSummary) => hasSrsSession(l) && l.srs.dueCount + l.srs.newAvailable > 0
  return lists.filter((l) => l.inSrs > 0).sort((a, b) => Number(ready(b)) - Number(ready(a)))
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
 * Student Vocabulary page, route /vocabulary (design §7, decisions 6–7): My wordlists,
 * Fast practice, Spaced repetition and Games tabs. Every list has its own review session.
 */
export default function VocabularyPage() {
  const { t, lang } = useLanguage()
  const listTitle = useListTitle()
  const feature = getFeature('vocabulary')!
  const [tab, setTab] = useState<Tab>('lists')
  /** Shared by the Fast practice and My wordlists tabs, and kept while a list is open. */
  const [listFilter, setListFilter] = useState<WordlistFilter>(DEFAULT_WORDLIST_FILTER)
  /** The last Fast practice run's exercise types: the default for the next run. */
  const [drillExercises, setDrillExercises] = useState<PracticeExercise[]>([...DRILL_ROUNDS])
  const [view, setView] = useState<View>({ name: 'tabs' })
  const [accent, setAccent] = useState<AccentPreference>(() => getAccentPreference())
  const tts = useSpeechSynthesis('female', accent)

  const [wordlists, setWordlists] = useState<WordlistsResponse | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)
  /** A Fast practice or review that failed to start. */
  const [startFailed, setStartFailed] = useState(false)
  const [starting, setStarting] = useState(false)
  /** The last review started from the Spaced repetition tab, shown there. */
  const [reviewSummary, setReviewSummary] = useState<{ title: string; summary: SessionSummary } | null>(null)

  const refresh = useCallback(() => {
    setLoadFailed(false)
    fetchWordlists()
      .then(setWordlists)
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

  /** A test of a list (design §7.1), from the Fast practice tab or the list itself. */
  async function beginTest(list: WordlistSummary, returnTo: ReturnTo) {
    setStarting(true)
    setStartFailed(false)
    try {
      setView({ name: 'test', run: await startTest(refOf(list)), list, returnTo })
    } catch {
      setStartFailed(true)
    } finally {
      setStarting(false)
    }
  }

  /** One list's review session, from the list itself or from the Spaced repetition tab. */
  async function startReview(list: WordlistSummary, returnTo: ReturnTo) {
    setStarting(true)
    setStartFailed(false)
    setReviewSummary(null)
    try {
      const session = await fetchPracticeSession(refOf(list))
      if (session.cards.length > 0) setView({ name: 'review', cards: session.cards, list, returnTo })
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
        <div className="space-y-3">
          <p className="break-words text-sm text-muted-foreground">
            {t('vcListSrsTitle')} · <span className="font-medium text-foreground">{listTitle(view.list)}</span>
          </p>
          <PracticeSession
            cards={view.cards}
            speech={tts}
            onFinish={(summary) => {
              if (view.returnTo === 'tabs') {
                setReviewSummary({ title: listTitle(view.list), summary })
                setView({ name: 'tabs' })
              } else {
                setView({ name: 'list', ref: view.returnTo, initial: null, summary })
              }
              refresh()
            }}
          />
        </div>
      )
      break

    case 'test':
      body = (
        <div className="space-y-3">
          <p className="break-words text-sm text-muted-foreground">
            {t('vcTestTitle')} · <span className="font-medium text-foreground">{listTitle(view.list)}</span>
          </p>
          <TestSession
            key={view.run.testId}
            testId={view.run.testId}
            cards={view.run.cards}
            speech={tts}
            onFinish={(summary) => {
              setView({ name: 'test-summary', summary, list: view.list, returnTo: view.returnTo })
              refresh()
            }}
          />
        </div>
      )
      break

    case 'test-summary':
      body = (
        <div className="space-y-4">
          {startError}
          <TestSummaryCard
            summary={view.summary}
            listTitle={listTitle(view.list)}
            starting={starting}
            onAgain={() => void beginTest(view.list, view.returnTo)}
            onDone={() => goBack(view.returnTo)}
          />
        </div>
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
        <div className="space-y-4">
          {view.summary && <SummaryCard summary={view.summary} />}
          {startError}
          <WordlistView
            key={`${view.ref.kind}-${view.ref.id}`}
            listRef={view.ref}
            initial={view.initial}
            compilesLeft={Math.max(0, COMPILES_PER_DAY - (wordlists?.compiledToday ?? 0))}
            starting={starting}
            onBack={() => setView({ name: 'tabs' })}
            onPractise={(detail) => setView({ name: 'drill-setup', detail, initialWords: null, returnTo: refOf(detail.list) })}
            onTest={(list) => void beginTest(list, refOf(list))}
            onStartReview={(list) => void startReview(list, refOf(list))}
            onChanged={refresh}
          />
        </div>
      )
      break

    case 'tabs': {
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
      const srsLists = wordlists ? srsOrder(wordlists.lists) : []
      body = (
        <>
          <div className="inline-flex flex-wrap rounded-lg bg-secondary p-0.5" role="group">
            {tabButton('lists', t('vcTabLists'))}
            {tabButton('fast', t('vcTabFast'))}
            {tabButton('srs', t('vcTabSrs'))}
            {tabButton('games', t('vcTabGames'))}
          </div>

          {loadFailed && <p className="text-sm text-red-600">{t('vcLoadFailed')}</p>}
          {startError}

          {wordlists === null
            ? !loadFailed && <p className="text-sm text-muted-foreground">{t('loading')}</p>
            : tab === 'fast' && (
                <FastPracticeTab
                  data={wordlists}
                  filter={listFilter}
                  onFilterChange={setListFilter}
                  starting={starting}
                  onPractise={(ref) => void practiseList(ref)}
                  onTest={(ref) => {
                    const list = wordlists.lists.find((l) => l.kind === ref.kind && l.id === ref.id)
                    if (list) void beginTest(list, 'tabs')
                  }}
                />
              )}

          {wordlists !== null && tab === 'lists' && (
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
          )}

          {wordlists !== null && tab === 'games' && <GamesTab data={wordlists} />}

          {wordlists !== null && tab === 'srs' && (
            <div className="space-y-4">
              {reviewSummary && <SummaryCard summary={reviewSummary.summary} listTitle={reviewSummary.title} />}
              {srsLists.length === 0 ? (
                <p className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">{t('vcNoCards')}</p>
              ) : (
                <>
                  <div className="space-y-3 rounded-2xl border border-border bg-card p-5">
                    <div className="space-y-1">
                      <h2 className="text-lg font-semibold text-foreground">{t('vcReviewTitle')}</h2>
                      <p className="text-sm text-muted-foreground">
                        {t('vcReviewHint')} {t('vcSrsListsHint')}
                      </p>
                    </div>
                    <SrsExplainer />
                  </div>
                  <ul className="space-y-3">
                    {srsLists.map((l) => (
                      <li key={`${l.kind}-${l.id}`} className="space-y-3 rounded-2xl border border-border bg-card p-5">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => setView({ name: 'list', ref: refOf(l), initial: null })}
                            className="min-w-0 break-words text-left font-medium text-foreground hover:underline"
                            title={t('vcOpenList')}
                          >
                            {listTitle(l)}
                          </button>
                          <div className="flex shrink-0 items-center gap-2">
                            <LevelBadge level={l.cefrLevel} />
                            <KindBadge kind={l.kind} />
                          </div>
                        </div>
                        <ListSrsPanel list={l} compact starting={starting} onStart={() => void startReview(l, 'tabs')} />
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
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

function SummaryCard({ summary, listTitle }: { summary: SessionSummary; listTitle?: string }) {
  const { t } = useLanguage()
  return (
    <div className="space-y-4 rounded-2xl border border-[var(--teal-accent-border)] bg-[var(--teal-accent-soft)] p-5">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">{t('vcSummaryTitle')}</h2>
        {listTitle && <p className="break-words text-sm text-muted-foreground">{listTitle}</p>}
      </div>
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
