import { useState } from 'react'
import { useLanguage, type MessageKey } from '../../lib/i18n'
import type { WordlistKind, WordlistRef, WordlistSummary } from '../../lib/vocab'
import ListProgress from '../VocabLists/ListProgress'
import { KindBadge, useListTitle, useTopicLabel } from './wordlistLabels'

type Filter = 'all' | WordlistKind

const FILTERS: { value: Filter; label: MessageKey }[] = [
  { value: 'all', label: 'vcFilterAll' },
  { value: 'custom', label: 'vcFilterCustom' },
  { value: 'teacher', label: 'vcFilterTeacher' },
  { value: 'conversations', label: 'vcFilterTutor' },
]

/** My wordlists (design §7.2): every list, filterable by where it came from. */
export default function MyWordlistsTab({ lists, onOpen }: { lists: WordlistSummary[]; onOpen: (ref: WordlistRef) => void }) {
  const { t } = useLanguage()
  const listTitle = useListTitle()
  const topicLabel = useTopicLabel()
  const [filter, setFilter] = useState<Filter>('all')

  if (lists.length === 0) {
    return <p className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">{t('vcListsEmpty')}</p>
  }

  const shown = lists.filter((l) => filter === 'all' || l.kind === filter)

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2" role="group">
        {FILTERS.map(({ value, label }) => {
          const n = value === 'all' ? lists.length : lists.filter((l) => l.kind === value).length
          return (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              aria-pressed={filter === value}
              className={`rounded-full border px-3 py-1 text-xs ${
                filter === value
                  ? 'border-[var(--teal-accent)] bg-[var(--teal-accent-soft)] text-foreground'
                  : 'border-border text-muted-foreground hover:bg-secondary'
              }`}
            >
              {t(label)} ({n})
            </button>
          )
        })}
      </div>

      {shown.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('vcFilterEmpty')}</p>
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
                </p>
                {l.teacher && <ListProgress progress={l.teacher.progress} completedAt={l.teacher.completedAt} />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
