import { useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, Search, X } from 'lucide-react'
import { grammarCurriculum, type CefrLevel, type GrammarItem } from '../../data/grammarCurriculum'
import { highlightMatches, normalizeSearchText, searchGrammar } from '../../lib/grammarSearch'
import { useLanguage } from '../../lib/i18n'

// Purely illustrative for now — Progress tracking hasn't shipped yet (no grammar_progress
// table), so these dots are a stable-but-fake spread across items, not real learner data.
function illustrativeStatus(itemId: string): 'new' | 'in-progress' | 'mastered' {
  let hash = 0
  for (let i = 0; i < itemId.length; i++) hash = (hash * 31 + itemId.charCodeAt(i)) >>> 0
  return (['new', 'in-progress', 'mastered'] as const)[hash % 3]
}

const statusDotClasses: Record<ReturnType<typeof illustrativeStatus>, string> = {
  new: 'bg-slate-300',
  'in-progress': 'bg-amber-400',
  mastered: 'bg-emerald-500',
}

function Highlighted({ text, query }: { text: string; query: string }) {
  return (
    <>
      {highlightMatches(text, query).map((run, i) =>
        run.match ? (
          <mark key={i} className="rounded-sm bg-amber-200/70 text-inherit">
            {run.text}
          </mark>
        ) : (
          <span key={i}>{run.text}</span>
        ),
      )}
    </>
  )
}

export default function GrammarRail({
  selectedItemId,
  onSelectItem,
}: {
  selectedItemId: string | null
  onSelectItem: (level: CefrLevel, item: GrammarItem) => void
}) {
  const { t } = useLanguage()
  const [expanded, setExpanded] = useState<Set<CefrLevel>>(new Set(['A1']))
  const [query, setQuery] = useState('')

  const isSearching = normalizeSearchText(query) !== ''
  const results = useMemo(() => (isSearching ? searchGrammar(query) : null), [isSearching, query])
  const resultCount = results?.reduce((sum, g) => sum + g.items.length, 0) ?? 0

  // While searching, show only matching levels (all open); otherwise the learner's own accordion.
  const groups = results
    ? results.map((r) => ({ ...grammarCurriculum.find((g) => g.level === r.level)!, items: r.items }))
    : grammarCurriculum

  function toggleLevel(level: CefrLevel) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(level)) next.delete(level)
      else next.add(level)
      return next
    })
  }

  return (
    <nav className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-slate-100 p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setQuery('')
            }}
            placeholder={t('grammarSearchPlaceholder')}
            aria-label={t('grammarSearchLabel')}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-8 pr-8 text-sm text-slate-700 placeholder:text-slate-400 focus:border-amber-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-100 [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label={t('grammarSearchClear')}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        {isSearching && (
          <p className="mt-2 px-1 text-xs text-slate-400" aria-live="polite">
            {resultCount > 0 ? t('grammarSearchResultCount', { n: resultCount }) : t('grammarSearchNoResults', { q: query.trim() })}
          </p>
        )}
      </div>

      {groups.map((group) => {
        const isOpen = isSearching || expanded.has(group.level)
        return (
          <div key={group.level} className="border-b border-slate-100 last:border-b-0">
            <button
              onClick={() => !isSearching && toggleLevel(group.level)}
              className={`w-full flex items-center justify-between gap-2 px-4 py-3 text-sm font-semibold text-slate-700 ${
                isSearching ? 'cursor-default' : 'hover:bg-slate-50'
              }`}
            >
              <span>{group.label}</span>
              {isSearching ? (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">{group.items.length}</span>
              ) : isOpen ? (
                <ChevronDown className="h-4 w-4 text-slate-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-slate-400" />
              )}
            </button>

            {isOpen && (
              <ul className={`pb-2 overflow-y-auto ${isSearching ? '' : 'max-h-96'}`}>
                {group.items.map((item) => {
                  const isSelected = item.id === selectedItemId
                  const status = illustrativeStatus(item.id)
                  // Surface the Hungarian title when that's where the query matched.
                  const showHu =
                    isSearching &&
                    !highlightMatches(item.title, query).some((r) => r.match) &&
                    highlightMatches(item.titleHu, query).some((r) => r.match)
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => onSelectItem(group.level, item)}
                        className={`w-full flex items-center gap-2 px-4 py-2 text-left text-sm transition ${
                          isSelected ? 'bg-amber-50 text-amber-800 font-medium' : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${statusDotClasses[status]}`} />
                        <span className="min-w-0">
                          <span className="block truncate">{isSearching ? <Highlighted text={item.title} query={query} /> : item.title}</span>
                          {showHu && (
                            <span className="block truncate text-xs text-slate-400">
                              <Highlighted text={item.titleHu} query={query} />
                            </span>
                          )}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )
      })}
    </nav>
  )
}
