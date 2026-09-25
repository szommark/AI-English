import { useCallback, useEffect, useState } from 'react'
import PageHeading from '../components/PageHeading'
import AccentToggle from '../components/AccentToggle'
import PracticeSession, { type SessionSummary } from '../components/Vocabulary/PracticeSession'
import ListProgress from '../components/VocabLists/ListProgress'
import MyWordsList from '../components/Vocabulary/MyWordsList'
import { getFeature } from '../data/features'
import { localizeFeature, useLanguage, type Lang } from '../lib/i18n'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis'
import { getAccentPreference, setAccentPreference, type AccentPreference } from '../lib/voiceSelection'
import { fetchMyVocabLists, fetchPracticeSession, fetchVocabOverview } from '../lib/vocabPracticeApi'
import type { PracticeCard, StudentListProgress, VocabOverview } from '../lib/vocab'

type Tab = 'practice' | 'teacher' | 'words'

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

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-secondary px-4 py-3">
      <div className="text-2xl font-semibold tabular-nums text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}

/** Student Vocabulary page, route /vocabulary (design §7, decisions 6–7). */
export default function VocabularyPage() {
  const { t, lang } = useLanguage()
  const feature = getFeature('vocabulary')!
  const [tab, setTab] = useState<Tab>('practice')
  const [accent, setAccent] = useState<AccentPreference>(() => getAccentPreference())
  const tts = useSpeechSynthesis('female', accent)

  const [overview, setOverview] = useState<VocabOverview | null>(null)
  const [lists, setLists] = useState<StudentListProgress[] | null>(null)
  const [error, setError] = useState(false)
  const [cards, setCards] = useState<PracticeCard[] | null>(null)
  const [starting, setStarting] = useState(false)
  const [summary, setSummary] = useState<SessionSummary | null>(null)

  const refresh = useCallback(() => {
    setError(false)
    Promise.all([fetchVocabOverview(), fetchMyVocabLists()])
      .then(([o, l]) => {
        setOverview(o)
        setLists(l)
      })
      .catch(() => setError(true))
  }, [])

  useEffect(refresh, [refresh])

  async function start() {
    setStarting(true)
    setSummary(null)
    try {
      const session = await fetchPracticeSession()
      if (session.cards.length > 0) setCards(session.cards)
      else refresh()
    } catch {
      setError(true)
    } finally {
      setStarting(false)
    }
  }

  function handleFinish(s: SessionSummary) {
    setCards(null)
    setSummary(s)
    refresh()
  }

  function changeAccent(next: AccentPreference) {
    setAccent(next)
    setAccentPreference(next)
  }

  const available = overview ? overview.dueCount + overview.newAvailable : 0
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

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeading title={localizeFeature(lang, feature).title} actions={<AccentToggle accent={accent} onChange={changeAccent} />} />

      {cards ? (
        <PracticeSession cards={cards} speech={tts} onFinish={handleFinish} />
      ) : (
        <>
          <div className="inline-flex rounded-lg bg-secondary p-0.5" role="group">
            {tabButton('practice', t('vcTabPractice'))}
            {tabButton('teacher', t('vcTabFromTeacher'))}
            {tabButton('words', t('vcTabMyWords'))}
          </div>

          {error && <p className="text-sm text-red-600">{t('vcLoadFailed')}</p>}

          {tab === 'practice' &&
            (overview === null ? (
              !error && <p className="text-sm text-muted-foreground">{t('loading')}</p>
            ) : (
              <div className="space-y-4">
                {summary && <SummaryCard summary={summary} />}

                {overview.totalCards === 0 ? (
                  <p className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">{t('vcNoCards')}</p>
                ) : (
                  <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      <Stat label={t('vcDueNow')} value={overview.dueCount} />
                      <Stat label={t('vcNewToday')} value={overview.newAvailable} />
                      <Stat label={t('vcLearnedStat')} value={`${overview.learnedCards} / ${overview.totalCards}`} />
                    </div>
                    {available > 0 ? (
                      <button
                        type="button"
                        onClick={start}
                        disabled={starting}
                        className="w-full rounded-lg bg-[var(--teal-accent)] px-5 py-3 text-sm font-semibold text-primary hover:bg-[var(--teal-accent-strong)] disabled:opacity-40 sm:w-auto"
                      >
                        {starting ? t('vcStarting') : summary ? t('vcPracticeMore') : t('vcStart')}
                      </button>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {t('vcNothingDue')}
                        {overview.nextDue && <> {t('vcNextDue', { when: relativeTime(overview.nextDue, lang) })}</>}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}

          {tab === 'words' && <MyWordsList onChanged={refresh} />}

          {tab === 'teacher' &&
            (lists === null ? (
              !error && <p className="text-sm text-muted-foreground">{t('loading')}</p>
            ) : lists.length === 0 ? (
              <p className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">{t('vcFromTeacherEmpty')}</p>
            ) : (
              <ul className="space-y-3">
                {lists.map((l) => (
                  <li key={l.listId} className="space-y-2 rounded-2xl border border-border bg-card p-5">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="break-words font-medium text-foreground">{l.title}</p>
                        <p className="break-all text-xs text-muted-foreground">{t('vcFromTeacherBy', { email: l.teacherEmail })}</p>
                      </div>
                      {l.cefrLevel && (
                        <span className="shrink-0 rounded-md bg-secondary px-1.5 py-0.5 text-xs font-medium text-secondary-foreground">
                          {l.cefrLevel}
                        </span>
                      )}
                    </div>
                    {l.description && <p className="text-sm text-muted-foreground">{l.description}</p>}
                    <ListProgress progress={l} completedAt={l.completedAt} />
                  </li>
                ))}
              </ul>
            ))}
        </>
      )}
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
