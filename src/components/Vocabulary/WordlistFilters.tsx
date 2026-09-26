import { useLanguage, type MessageKey } from '../../lib/i18n'
import { GRAMMAR_LEVELS as CEFR_LEVELS, type CefrLevel } from '../../data/grammarCurriculum'
import type { WordlistKind, WordlistSummary } from '../../lib/vocab'
import { useTopicLabel } from './wordlistLabels'

// The list filters shared by the Fast practice and My wordlists tabs (design §7.1–§7.2):
// source chips, then level, topic and sort dropdowns in one row. The level and topic
// dropdowns offer All, Mixed (lists without one), then only the values the lists have,
// each with how many lists it would show.

export type ListSort = 'newest' | 'popular' | 'longest'

// Can't clash with a level or a topic: the student's own topics are free text, but these
// aren't likely ones.
const ALL = ':all'
const MIXED = ':mixed'

/** Topics offered in the dropdown: the most recently used ones. */
const MAX_TOPIC_OPTIONS = 10

export interface WordlistFilter {
  source: typeof ALL | WordlistKind
  /** MIXED: lists without a level (conversations, some teacher lists). */
  level: typeof ALL | typeof MIXED | CefrLevel
  /** A VOCAB_TOPICS id or a student's own topic; MIXED: lists without one (all but custom). */
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

const matchesSource = (list: WordlistSummary, source: WordlistFilter['source']) => source === ALL || list.kind === source

function matchesLevel(list: WordlistSummary, level: WordlistFilter['level']): boolean {
  return level === ALL || (level === MIXED ? list.cefrLevel === null : list.cefrLevel === level)
}

function matchesTopic(list: WordlistSummary, topic: string): boolean {
  return topic === ALL || (topic === MIXED ? list.topic === null : list.topic === topic)
}

function matchesAttributes(list: WordlistSummary, filter: WordlistFilter): boolean {
  return matchesLevel(list, filter.level) && matchesTopic(list, filter.topic)
}

/** The lists the filter lets through, in its sort order. */
export function applyWordlistFilter(lists: WordlistSummary[], filter: WordlistFilter): WordlistSummary[] {
  return lists
    .filter((l) => matchesSource(l, filter.source) && matchesAttributes(l, filter))
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

  // Each option's count follows the source and the other dropdown.
  const levelCount = (level: WordlistFilter['level']) =>
    lists.filter((l) => matchesSource(l, filter.source) && matchesTopic(l, filter.topic) && matchesLevel(l, level)).length
  const topicCount = (topic: string) =>
    lists.filter((l) => matchesSource(l, filter.source) && matchesLevel(l, filter.level) && matchesTopic(l, topic)).length

  // The chosen value stays on offer even once its last list is gone, so the select never goes blank.
  const levels = CEFR_LEVELS.filter((level) => filter.level === level || lists.some((l) => l.cefrLevel === level))
  const hasMixedLevel = filter.level === MIXED || lists.some((l) => l.cefrLevel === null)

  const lastUsed = new Map<string, string>()
  for (const l of lists) {
    if (l.topic && l.createdAt > (lastUsed.get(l.topic) ?? '')) lastUsed.set(l.topic, l.createdAt)
  }
  const topics = [...lastUsed.keys()].sort((a, b) => lastUsed.get(b)!.localeCompare(lastUsed.get(a)!)).slice(0, MAX_TOPIC_OPTIONS)
  if (filter.topic !== ALL && filter.topic !== MIXED && !topics.includes(filter.topic)) topics.push(filter.topic)
  const hasMixedTopic = filter.topic === MIXED || lists.some((l) => l.topic === null)

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
          <option value={ALL}>
            {t('vcFilterLevelAll')} ({levelCount(ALL)})
          </option>
          {hasMixedLevel && (
            <option value={MIXED}>
              {t('vcFilterLevelMixed')} ({levelCount(MIXED)})
            </option>
          )}
          {levels.map((l) => (
            <option key={l} value={l}>
              {l} ({levelCount(l)})
            </option>
          ))}
        </select>
        <select value={filter.topic} onChange={(e) => set({ topic: e.target.value })} aria-label={t('vcCompileTopic')} className={selectClass}>
          <option value={ALL}>
            {t('vcFilterTopicAll')} ({topicCount(ALL)})
          </option>
          {hasMixedTopic && (
            <option value={MIXED}>
              {t('vcFilterTopicMixed')} ({topicCount(MIXED)})
            </option>
          )}
          {topics.map((topic) => (
            <option key={topic} value={topic}>
              {topicLabel(topic)} ({topicCount(topic)})
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
