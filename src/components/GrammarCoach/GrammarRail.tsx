import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { grammarCurriculum, type CefrLevel, type GrammarItem } from '../../data/grammarCurriculum'

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

export default function GrammarRail({
  selectedItemId,
  onSelectItem,
}: {
  selectedItemId: string | null
  onSelectItem: (level: CefrLevel, item: GrammarItem) => void
}) {
  const [expanded, setExpanded] = useState<Set<CefrLevel>>(new Set(['A1']))

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
      {grammarCurriculum.map((group) => {
        const isOpen = expanded.has(group.level)
        return (
          <div key={group.level} className="border-b border-slate-100 last:border-b-0">
            <button
              onClick={() => toggleLevel(group.level)}
              className="w-full flex items-center justify-between gap-2 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <span>{group.label}</span>
              {isOpen ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
            </button>

            {isOpen && (
              <ul className="pb-2">
                {group.items.map((item) => {
                  const isSelected = item.id === selectedItemId
                  const status = illustrativeStatus(item.id)
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => onSelectItem(group.level, item)}
                        className={`w-full flex items-center gap-2 px-4 py-2 text-left text-sm transition ${
                          isSelected ? 'bg-amber-50 text-amber-800 font-medium' : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${statusDotClasses[status]}`} />
                        <span className="truncate">{item.title}</span>
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
