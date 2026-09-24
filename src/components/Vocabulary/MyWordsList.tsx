import { useEffect, useState } from 'react'
import { useLanguage, type MessageKey } from '../../lib/i18n'
import { fetchMyWords, removeCard, setCardSuspended } from '../../lib/vocabPracticeApi'
import type { CardStage, MyWord } from '../../lib/vocab'

type Filter = 'all' | 'teacher' | 'tutor'

const STAGE_LABEL: Record<CardStage, MessageKey> = {
  new: 'vcStageNew',
  learning: 'vcStageLearning',
  learned: 'vcStageLearned',
}

const STAGE_CLASS: Record<CardStage, string> = {
  new: 'bg-secondary text-secondary-foreground',
  learning: 'bg-amber-100 text-amber-800',
  learned: 'bg-emerald-100 text-emerald-700',
}

/**
 * "My words" (design §7): every card, filterable by origin. Tutor Bot (and later
 * catalog) words can be removed; words from a teacher list can only be paused, so the
 * teacher's list progress stays honest (§5.2).
 */
export default function MyWordsList({ onChanged }: { onChanged: () => void }) {
  const { t } = useLanguage()
  const [words, setWords] = useState<MyWord[] | null>(null)
  const [filter, setFilter] = useState<Filter>('all')
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<MessageKey | null>(null)

  useEffect(() => {
    fetchMyWords()
      .then(setWords)
      .catch(() => setError('vcLoadFailed'))
  }, [])

  async function act(word: MyWord, action: () => Promise<void>, update: (list: MyWord[]) => MyWord[]) {
    setBusy(word.cardId)
    setError(null)
    try {
      await action()
      setWords((list) => (list ? update(list) : list))
      onChanged()
    } catch (err) {
      console.error('Vocabulary card action failed', err)
      setError('vcActionFailed')
    } finally {
      setBusy(null)
    }
  }

  function remove(word: MyWord) {
    if (!window.confirm(t('vcConfirmRemove', { term: word.term }))) return
    void act(word, () => removeCard(word.cardId), (list) => list.filter((w) => w.cardId !== word.cardId))
  }

  function toggleSuspended(word: MyWord) {
    const suspended = !word.suspended
    void act(
      word,
      () => setCardSuspended(word.cardId, suspended),
      (list) => list.map((w) => (w.cardId === word.cardId ? { ...w, suspended } : w)),
    )
  }

  if (error === 'vcLoadFailed') return <p className="text-sm text-red-600">{t('vcLoadFailed')}</p>
  if (words === null) return <p className="text-sm text-muted-foreground">{t('loading')}</p>
  if (words.length === 0) {
    return <p className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">{t('vcNoCards')}</p>
  }

  const shown = words.filter((w) => filter === 'all' || (filter === 'teacher' ? w.origin === 'teacher' : w.origin !== 'teacher'))
  const filterButton = (value: Filter, label: string) => (
    <button
      type="button"
      onClick={() => setFilter(value)}
      aria-pressed={filter === value}
      className={`rounded-full border px-3 py-1 text-xs ${
        filter === value
          ? 'border-[var(--teal-accent)] bg-[var(--teal-accent-soft)] text-foreground'
          : 'border-border text-muted-foreground hover:bg-secondary'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {filterButton('all', `${t('vcFilterAll')} (${words.length})`)}
        {filterButton('teacher', t('vcFilterTeacher'))}
        {filterButton('tutor', t('vcFilterTutor'))}
      </div>
      {error && <p className="text-sm text-red-600">{t(error)}</p>}
      {filter === 'teacher' && <p className="text-xs text-muted-foreground">{t('vcPauseHint')}</p>}

      {shown.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('vcFilterEmpty')}</p>
      ) : (
        <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
          {shown.map((w) => (
            <li key={w.cardId} className={`space-y-1 px-4 py-3 ${w.suspended ? 'opacity-60' : ''}`}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="break-words font-medium text-foreground">{w.term}</span>
                  <span className="text-muted-foreground">
                    {' — '}
                    {w.meaningHu ?? <em className="text-xs">{t('vcMeaningPending')}</em>}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className={`rounded-md px-1.5 py-0.5 text-xs ${STAGE_CLASS[w.stage]}`}>{t(STAGE_LABEL[w.stage])}</span>
                  {w.suspended && <span className="text-xs text-muted-foreground">{t('vcPausedTag')}</span>}
                  {w.origin === 'teacher' ? (
                    <button
                      type="button"
                      onClick={() => toggleSuspended(w)}
                      disabled={busy === w.cardId}
                      className="rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground hover:bg-secondary disabled:opacity-40"
                    >
                      {w.suspended ? t('vcResumeWord') : t('vcPauseWord')}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => remove(w)}
                      disabled={busy === w.cardId}
                      className="rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground hover:bg-secondary hover:text-red-600 disabled:opacity-40"
                    >
                      {t('vcRemoveWord')}
                    </button>
                  )}
                </div>
              </div>
              {w.contextOriginal && (
                <p className="text-xs text-muted-foreground">
                  {t('vcYouSaid')} <span className="italic">{w.contextOriginal}</span>
                  {w.contextCorrected && (
                    <>
                      {' · '}
                      {t('vcBetter')} <span className="text-foreground">{w.contextCorrected}</span>
                    </>
                  )}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
