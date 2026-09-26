import { useLanguage } from '../../lib/i18n'
import type { WordlistDetail, WordlistRef, WordlistsResponse } from '../../lib/vocab'
import ListProgress from '../VocabLists/ListProgress'
import CompileListForm from './CompileListForm'
import WordlistFilters, { applyWordlistFilter, type WordlistFilter } from './WordlistFilters'
import { KindBadge, useListTitle, useTopicLabel } from './wordlistLabels'

/** My wordlists (design §7.2): compile a new list, then every list, filtered and sorted. */
export default function MyWordlistsTab({
  data,
  filter,
  onFilterChange,
  onOpen,
  onCompiled,
}: {
  data: WordlistsResponse
  filter: WordlistFilter
  onFilterChange: (next: WordlistFilter) => void
  onOpen: (ref: WordlistRef) => void
  onCompiled: (detail: WordlistDetail) => void
}) {
  const { t } = useLanguage()
  const listTitle = useListTitle()
  const topicLabel = useTopicLabel()
  const { lists } = data
  const shown = applyWordlistFilter(lists, filter)

  return (
    <div className="space-y-4">
      <CompileListForm data={data} onCompiled={onCompiled} />

      {lists.length === 0 ? (
        <p className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">{t('vcListsEmpty')}</p>
      ) : (
        <div className="space-y-3">
          <WordlistFilters lists={lists} filter={filter} onChange={onFilterChange} />

          {shown.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('vcFilterNoLists')}</p>
          ) : (
            <ul className="space-y-3">
              {shown.map((l) => (
                <li key={`${l.kind}-${l.id}`}>
                  <button
                    type="button"
                    onClick={() => onOpen({ kind: l.kind, id: l.id })}
                    className="w-full space-y-2 rounded-2xl border border-border bg-card p-5 text-left hover:border-[var(--teal-accent)]"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="min-w-0 break-words font-medium text-foreground">{listTitle(l)}</p>
                      <div className="flex shrink-0 items-center gap-2">
                        {l.cefrLevel && (
                          <span className="rounded-md bg-secondary px-1.5 py-0.5 text-xs font-medium text-secondary-foreground">
                            {l.cefrLevel}
                          </span>
                        )}
                        <KindBadge kind={l.kind} />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {l.kind === 'teacher' && l.teacher ? `${t('vcFromTeacherBy', { email: l.teacher.email })} · ` : ''}
                      {l.kind === 'custom' && l.topic ? `${topicLabel(l.topic)} · ` : ''}
                      {t('vcWordCount', { n: l.wordCount })}
                      {l.kind === 'custom' && ` · ${t('vcInSrsCount', { n: l.inSrs })}`}
                      {l.practiceCount > 0 && ` · ${t('vcPracticedCount', { n: l.practiceCount })}`}
                    </p>
                    {l.teacher && <ListProgress progress={l.teacher.progress} completedAt={l.teacher.completedAt} />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
