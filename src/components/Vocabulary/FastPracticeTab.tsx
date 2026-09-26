import { useLanguage } from '../../lib/i18n'
import type { WordlistRef, WordlistsResponse } from '../../lib/vocab'
import WordlistFilters, { applyWordlistFilter, type WordlistFilter } from './WordlistFilters'
import { KindBadge, useListTitle, useTopicLabel } from './wordlistLabels'

/** Fast practice (design §7.1): practise any of the student's lists, with the My wordlists filters. */
export default function FastPracticeTab({
  data,
  filter,
  onFilterChange,
  onPractise,
}: {
  data: WordlistsResponse
  filter: WordlistFilter
  onFilterChange: (next: WordlistFilter) => void
  onPractise: (ref: WordlistRef) => void
}) {
  const { t } = useLanguage()
  const listTitle = useListTitle()
  const topicLabel = useTopicLabel()
  const practisable = data.lists.filter((l) => l.wordCount > 0)
  const shown = applyWordlistFilter(practisable, filter)

  return (
    <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">{t('vcFastTitle')}</h2>
        <p className="text-sm text-muted-foreground">{t('vcFastHint')}</p>
      </div>
      {practisable.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('vcFastNoLists')}</p>
      ) : (
        <>
          <WordlistFilters lists={practisable} filter={filter} onChange={onFilterChange} />
          {shown.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('vcFilterNoLists')}</p>
          ) : (
            <ul className="divide-y divide-border rounded-xl border border-border">
              {shown.map((l) => (
                <li key={`${l.kind}-${l.id}`} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <div className="min-w-0 space-y-0.5">
                    <p className="break-words text-sm font-medium text-foreground">{listTitle(l)}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <KindBadge kind={l.kind} />
                      {l.cefrLevel && (
                        <span className="rounded-md bg-secondary px-1.5 py-0.5 font-medium text-secondary-foreground">{l.cefrLevel}</span>
                      )}
                      {l.kind === 'custom' && l.topic && <span>{topicLabel(l.topic)}</span>}
                      <span>{t('vcWordCount', { n: l.wordCount })}</span>
                      {l.practiceCount > 0 && <span>{t('vcPracticedCount', { n: l.practiceCount })}</span>}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onPractise({ kind: l.kind, id: l.id })}
                    className="shrink-0 rounded-lg bg-[var(--teal-accent)] px-4 py-2 text-sm font-semibold text-primary hover:bg-[var(--teal-accent-strong)]"
                  >
                    {t('vcPractise')}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  )
}
