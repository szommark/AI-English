import { useLanguage, type MessageKey } from '../../lib/i18n'
import { GRAMMAR_LEVELS as CEFR_LEVELS, type CefrLevel } from '../../data/grammarCurriculum'
import { VOCAB_TOPICS, isVocabTopicId, type WordlistKind, type WordlistSummary } from '../../lib/vocab'
import { useTopicLabel } from './wordlistLabels'

// The list filters shared by the Fast practice and My wordlists tabs (design §7.1–§7.2):
// source chips, then level, topic and sort dropdowns in one row.

export type ListSort = 'newest' | 'popular' | 'longest'

const ALL = 'all'

export interface WordlistFilter {
  source: typeof ALL | WordlistKind
  level: typeof ALL | CefrLevel
  /** A VOCAB_TOPICS id or a student's own topic; only custom lists have one. */
  topic: string
  sort: ListSort
}

export const DEFAULT_WORDLIST_FILTER: WordlistFilter = { source: ALL, level: ALL, topic: ALL, sort: 'newest' }

const SOURCES: { value: WordlistFilter['source']; label: MessageKey }[] = [
  { value: ALL, label: 'vcFilterAll' },
  { value: 'custom', label: 'vcFilterCustom' },
  { value: 'teacher', label: 'vcFilterTeacher' },
  { value: 'conversations', label: 'vcFilterTutor' },
]

const SORTS: { value: ListSort; label: MessageKey }[] = [
  { value: 'newest', label: 'vcSortNewest' },
  { value: 'popular', label: 'vcSortPopular' },
  { value: 'longest', label: 'vcSortLongest' },
]

const newestFirst = (a: WordlistSummary, b: WordlistSummary) => b.createdAt.localeCompare(a.createdAt)

const COMPARE: Record<ListSort, (a: WordlistSummary, b: WordlistSummary) => number> = {
  newest: newestFirst,
  popular: (a, b) => b.practiceCount - a.practiceCount || newestFirst(a, b),
  longest: (a, b) => b.wordCount - a.wordCount || newestFirst(a, b),
}

function matchesAttributes(list: WordlistSummary, filter: WordlistFilter): boolean {
  return (filter.level === ALL || list.cefrLevel === filter.level) && (filter.topic === ALL || list.topic === filter.topic)
}

/** The lists the filter lets through, in its sort order. */
export function applyWordlistFilter(lists: WordlistSummary[], filter: WordlistFilter): WordlistSummary[] {
  return lists
    .filter((l) => (filter.source === ALL || l.kind === filter.source) && matchesAttributes(l, filter))
    .sort(COMPARE[filter.sort])
}

const selectClass =
  'rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-foreground focus:border-[var(--teal-accent)] focus:outline-none'

export default function WordlistFilters({
  lists,
  filter,
  onChange,
}: {
  lists: WordlistSummary[]
  filter: WordlistFilter
  onChange: (next: WordlistFilter) => void
}) {
  const { t } = useLanguage()
  const topicLabel = useTopicLabel()
  const set = (patch: Partial<WordlistFilter>) => onChange({ ...filter, ...patch })

  // The fixed topics, then the student's own ones (and the chosen one, even if its list is gone).
  const ownTopics = [
    ...new Set([...lists.flatMap((l) => (l.topic && !isVocabTopicId(l.topic) ? [l.topic] : [])), filter.topic]),
  ]
    .filter((topic) => topic !== ALL && !isVocabTopicId(topic))
    .sort((a, b) => a.localeCompare(b))

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2" role="group">
        {SOURCES.map(({ value, label }) => {
          // Counts follow the level and topic filters, so a chip never promises lists it won't show.
          const n = lists.filter((l) => (value === ALL || l.kind === value) && matchesAttributes(l, filter)).length
          return (
            <button
              key={value}
              type="button"
              onClick={() => set({ source: value })}
              aria-pressed={filter.source === value}
              className={`rounded-full border px-3 py-1 text-xs ${
                filter.source === value
                  ? 'border-[var(--teal-accent)] bg-[var(--teal-accent-soft)] text-foreground'
                  : 'border-border text-muted-foreground hover:bg-secondary'
              }`}
            >
              {t(label)} ({n})
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          value={filter.level}
          onChange={(e) => set({ level: e.target.value as WordlistFilter['level'] })}
          aria-label={t('vcCompileLevel')}
          className={selectClass}
        >
          <option value={ALL}>{t('vcFilterLevelAll')}</option>
          {CEFR_LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        <select value={filter.topic} onChange={(e) => set({ topic: e.target.value })} aria-label={t('vcCompileTopic')} className={selectClass}>
          <option value={ALL}>{t('vcFilterTopicAll')}</option>
          {[...VOCAB_TOPICS, ...ownTopics].map((topic) => (
            <option key={topic} value={topic}>
              {topicLabel(topic)}
            </option>
          ))}
        </select>
        <select
          value={filter.sort}
          onChange={(e) => set({ sort: e.target.value as ListSort })}
          aria-label={t('vcSortLabel')}
          className={selectClass}
        >
          {SORTS.map(({ value, label }) => (
            <option key={value} value={value}>
              {t(label)}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
