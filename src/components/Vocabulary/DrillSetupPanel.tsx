import { useMemo, useState } from 'react'
import { useLanguage } from '../../lib/i18n'
import { DRILL_MAX_WORDS, type DrillSetup } from '../../lib/vocab'

const ALL = 'all'

export interface DrillSelection {
  cardIds: string[]
  /** The teacher list the selection started from, if any. */
  listId: string | null
}

/**
 * Full practice setup (design §7.1): start from all words or one teacher list, then add
 * or remove single words before starting.
 */
export default function DrillSetupPanel({
  setup,
  initial,
  starting,
  onStart,
  onCancel,
}: {
  setup: DrillSetup
  /** The previous run's selection, when coming back to change it. */
  initial: DrillSelection | null
  starting: boolean
  onStart: (selection: DrillSelection) => void
  onCancel: () => void
}) {
  const { t } = useLanguage()
  // The previous selection, minus what has gone since (a paused word, an unassigned list).
  const [source, setSource] = useState<string>(() =>
    initial?.listId && setup.lists.some((l) => l.listId === initial.listId) ? initial.listId : ALL,
  )
  const [selected, setSelected] = useState<Set<string>>(() => {
    if (!initial) return new Set(cardIdsFor(setup, ALL))
    const active = new Set(setup.words.map((w) => w.cardId))
    return new Set(initial.cardIds.filter((id) => active.has(id)))
  })
  // Selected words first, then the rest; fixed until the source changes, so ticking a
  // box never moves a row out from under the pointer.
  const [order, setOrder] = useState<string[]>(() => orderFor(setup, selected))
  const [query, setQuery] = useState('')

  const byId = useMemo(() => new Map(setup.words.map((w) => [w.cardId, w])), [setup])
  const q = query.trim().toLowerCase()
  const visible = order
    .map((id) => byId.get(id)!)
    .filter((w) => w && (!q || w.term.toLowerCase().includes(q) || (w.meaningHu ?? '').toLowerCase().includes(q)))

  function pickSource(next: string) {
    const ids = new Set(cardIdsFor(setup, next))
    setSource(next)
    setSelected(ids)
    setOrder(orderFor(setup, ids))
  }

  function toggle(cardId: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(cardId)) next.delete(cardId)
      else next.add(cardId)
      return next
    })
  }

  function setVisible(on: boolean) {
    setSelected((prev) => {
      const next = new Set(prev)
      for (const w of visible) {
        if (on) next.add(w.cardId)
        else next.delete(w.cardId)
      }
      return next
    })
  }

  const tooMany = selected.size > DRILL_MAX_WORDS
  const canStart = selected.size > 0 && !tooMany && !starting

  function start() {
    // In display order, so the run's first round follows the list the student sees.
    const cardIds = order.filter((id) => selected.has(id))
    onStart({ cardIds, listId: source === ALL ? null : source })
  }

  const linkButton = 'text-xs text-muted-foreground hover:text-foreground hover:underline disabled:opacity-40'

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">{t('vcDrillTitle')}</h2>
        <p className="text-sm text-muted-foreground">{t('vcDrillSetupHint')}</p>
      </div>

      <label className="block space-y-1">
        <span className="text-sm font-medium text-foreground">{t('vcDrillSource')}</span>
        <select
          value={source}
          onChange={(e) => pickSource(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-[var(--teal-accent)] focus:outline-none"
        >
          <option value={ALL}>{t('vcDrillAllWords', { n: setup.words.length })}</option>
          {setup.lists.map((l) => (
            <option key={l.listId} value={l.listId}>
              {t('vcDrillListOption', { title: l.title, n: l.cardIds.length })}
            </option>
          ))}
        </select>
      </label>

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
            <li key={w.cardId}>
              <label className="flex cursor-pointer items-start gap-3 px-4 py-2.5 hover:bg-secondary">
                <input
                  type="checkbox"
                  checked={selected.has(w.cardId)}
                  onChange={() => toggle(w.cardId)}
                  className="mt-1 h-4 w-4 shrink-0 accent-[var(--teal-accent)]"
                />
                <span className="min-w-0">
                  <span className="block break-words text-sm font-medium text-foreground">{w.term}</span>
                  <span className="block break-words text-xs text-muted-foreground">{w.meaningHu ?? t('vcMeaningPending')}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      <p className={`text-sm ${tooMany ? 'text-red-600' : 'text-muted-foreground'}`} role="status">
        {tooMany ? t('vcDrillTooMany', { max: DRILL_MAX_WORDS }) : t('vcDrillSelected', { n: selected.size })}
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={start}
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

function cardIdsFor(setup: DrillSetup, source: string): string[] {
  if (source === ALL) return setup.words.map((w) => w.cardId)
  return setup.lists.find((l) => l.listId === source)?.cardIds ?? []
}

/** Selected words first, then the rest, each A–Z (setup.words is already sorted). */
function orderFor(setup: DrillSetup, selected: Set<string>): string[] {
  const ids = setup.words.map((w) => w.cardId)
  return [...ids.filter((id) => selected.has(id)), ...ids.filter((id) => !selected.has(id))]
}
