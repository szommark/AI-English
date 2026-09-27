import { useLanguage } from '../../lib/i18n'
import { TEST_SHARE, hasTest, testSize, type WordlistRef, type WordlistsResponse } from '../../lib/vocab'
import { TestScoresLine } from './TestSession'
import WordlistFilters, { applyWordlistFilter, type WordlistFilter } from './WordlistFilters'
import { KindBadge, LevelBadge, useListTitle, useTopicLabel } from './wordlistLabels'

/**
 * Fast practice (design §7.1): practise any of the student's lists, with the My wordlists
 * filters, or take a test of a long one.
 */
export default function FastPracticeTab({
  data,
  filter,
  onFilterChange,
  starting,
  onPractise,
  onTest,
}: {
  data: WordlistsResponse
  filter: WordlistFilter
  onFilterChange: (next: WordlistFilter) => void
  /** A run or a test is being loaded. */
  starting: boolean
  onPractise: (ref: WordlistRef) => void
  onTest: (ref: WordlistRef) => void
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
                <li key={`${l.kind}-${l.id}`} className="flex flex-col gap-2 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                  <div className="min-w-0 space-y-0.5">
                    <p className="break-words text-sm font-medium text-foreground">{listTitle(l)}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <KindBadge kind={l.kind} />
                      <LevelBadge level={l.cefrLevel} />
                      {l.kind === 'custom' && l.topic && <span>{topicLabel(l.topic)}</span>}
                      <span>{t('vcWordCount', { n: l.wordCount })}</span>
                      {l.practiceCount > 0 && <span>{t('vcPracticedCount', { n: l.practiceCount })}</span>}
                      <TestScoresLine tests={l.tests} />
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
                    {hasTest(l) && (
                      <button
                        type="button"
                        onClick={() => onTest({ kind: l.kind, id: l.id })}
                        disabled={starting}
                        title={t('vcTestHint', { share: TEST_SHARE * 100 })}
                        className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground hover:bg-secondary disabled:opacity-40"
                      >
                        {t('vcTestStart', { n: testSize(l.wordCount) })}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onPractise({ kind: l.kind, id: l.id })}
                      disabled={starting}
                      className="rounded-lg bg-[var(--teal-accent)] px-4 py-2 text-sm font-semibold text-primary hover:bg-[var(--teal-accent-strong)] disabled:opacity-40"
                    >
                      {t('vcPractise')}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  )
}
