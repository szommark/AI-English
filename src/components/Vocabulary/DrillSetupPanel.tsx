import { useState } from 'react'
import { useLanguage } from '../../lib/i18n'
import { DRILL_MAX_WORDS, type PracticeExercise, type WordlistDetail } from '../../lib/vocab'
import { DRILL_ROUNDS } from '../../lib/vocabPractice'
import { ROUND_LABEL } from './DrillSession'
import { CardBadge, useListTitle } from './wordlistLabels'

/** What a Fast practice run covers: the words, and the exercise types (in DRILL_ROUNDS order). */
export interface DrillChoice {
  itemIds: string[]
  exercises: PracticeExercise[]
}

/**
 * Fast practice setup (design §7.1): the exercise types and the chosen list's words, all
 * ticked; untick any to leave them out of this run. Learned or not, in spaced repetition
 * or not — all words can go.
 */
export default function DrillSetupPanel({
  detail,
  initialWords,
  initialExercises,
  starting,
  onStart,
  onCancel,
}: {
  detail: WordlistDetail
  /** The previous run's words, when coming back to change them; null ticks every word. */
  initialWords: string[] | null
  initialExercises: PracticeExercise[]
  starting: boolean
  onStart: (choice: DrillChoice) => void
  onCancel: () => void
}) {
  const { t } = useLanguage()
  const listTitle = useListTitle()
  const words = detail.words
  const [selected, setSelected] = useState<Set<string>>(() => {
    const onList = new Set(words.map((w) => w.itemId))
    return new Set(initialWords ? initialWords.filter((id) => onList.has(id)) : onList)
  })
  const [exercises, setExercises] = useState<Set<PracticeExercise>>(() => new Set(initialExercises))
  const [query, setQuery] = useState('')

  const q = query.trim().toLowerCase()
  const visible = words.filter((w) => !q || w.term.toLowerCase().includes(q) || (w.meaningHu ?? '').toLowerCase().includes(q))

  function toggle(itemId: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(itemId)) next.delete(itemId)
      else next.add(itemId)
      return next
    })
  }

  function toggleExercise(exercise: PracticeExercise) {
    setExercises((prev) => {
      const next = new Set(prev)
      if (next.has(exercise)) next.delete(exercise)
      else next.add(exercise)
      return next
    })
  }

  function setVisible(on: boolean) {
    setSelected((prev) => {
      const next = new Set(prev)
      for (const w of visible) {
        if (on) next.add(w.itemId)
        else next.delete(w.itemId)
      }
      return next
    })
  }

  const tooMany = selected.size > DRILL_MAX_WORDS
  const canStart = selected.size > 0 && exercises.size > 0 && !tooMany && !starting
  const linkButton = 'text-xs text-muted-foreground hover:text-foreground hover:underline disabled:opacity-40'

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--teal-accent-strong)]">{t('vcTabFast')}</p>
        <h2 className="break-words text-lg font-semibold text-foreground">{listTitle(detail.list)}</h2>
        <p className="text-sm text-muted-foreground">{t('vcDrillSetupHint')}</p>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-foreground">{t('vcDrillExercises')}</legend>
        <div className="flex flex-wrap gap-2">
          {DRILL_ROUNDS.map((exercise) => (
            <label
              key={exercise}
              className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1 text-xs ${
                exercises.has(exercise)
                  ? 'border-[var(--teal-accent)] bg-[var(--teal-accent-soft)] text-foreground'
                  : 'border-border text-muted-foreground hover:bg-secondary'
              }`}
            >
              <input
                type="checkbox"
                checked={exercises.has(exercise)}
                onChange={() => toggleExercise(exercise)}
                className="h-3.5 w-3.5 accent-[var(--teal-accent)]"
              />
              {t(ROUND_LABEL[exercise])}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('vcDrillSearch')}
            aria-label={t('vcDrillSearch')}
            className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-[var(--teal-accent)] focus:outline-none"
          />
          <button type="button" className={linkButton} onClick={() => setVisible(true)} disabled={visible.length === 0}>
            {t('vcDrillSelectAll')}
          </button>
          <button type="button" className={linkButton} onClick={() => setVisible(false)} disabled={visible.length === 0}>
            {t('vcDrillSelectNone')}
          </button>
        </div>

        <ul className="max-h-80 divide-y divide-border overflow-y-auto rounded-xl border border-border">
          {visible.length === 0 && <li className="px-4 py-3 text-sm text-muted-foreground">{t('vcFilterEmpty')}</li>}
          {visible.map((w) => (
            <li key={w.itemId}>
              <label className="flex cursor-pointer items-start gap-3 px-4 py-2.5 hover:bg-secondary">
                <input
                  type="checkbox"
                  checked={selected.has(w.itemId)}
                  onChange={() => toggle(w.itemId)}
                  className="mt-1 h-4 w-4 shrink-0 accent-[var(--teal-accent)]"
                />
                <span className="min-w-0 flex-1">
                  <span className="block break-words text-sm font-medium text-foreground">{w.term}</span>
                  <span className="block break-words text-xs text-muted-foreground">{w.meaningHu ?? t('vcMeaningPending')}</span>
                </span>
                <span className="flex shrink-0 flex-wrap items-center gap-1">
                  <CardBadge card={w.card} />
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      <p className={`text-sm ${tooMany ? 'text-red-600' : 'text-muted-foreground'}`} role="status">
        {tooMany
          ? t('vcDrillTooMany', { max: DRILL_MAX_WORDS })
          : exercises.size === 0
            ? t('vcDrillNoExercises')
            : t('vcDrillSelected', { n: selected.size })}
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() =>
            onStart({
              itemIds: words.filter((w) => selected.has(w.itemId)).map((w) => w.itemId),
              exercises: DRILL_ROUNDS.filter((e) => exercises.has(e)),
            })
          }
          disabled={!canStart}
          className="rounded-lg bg-[var(--teal-accent)] px-5 py-2.5 text-sm font-semibold text-primary hover:bg-[var(--teal-accent-strong)] disabled:opacity-40"
        >
          {starting ? t('vcStarting') : t('vcDrillStart')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={starting}
          className="rounded-lg border border-border px-4 py-2.5 text-sm text-muted-foreground hover:bg-secondary"
        >
          {t('vcBackToOverview')}
        </button>
      </div>
    </div>
  )
}
