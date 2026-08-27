import { pronunciationCurriculum } from '../../data/pronunciationCurriculum'
import type { PronunciationProgressEntry } from '../../lib/pronunciationProgressApi'

function scoreDotClass(score: number | null | undefined): string {
  if (score === null || score === undefined) return 'bg-slate-300'
  if (score >= 80) return 'bg-emerald-500'
  if (score >= 60) return 'bg-amber-400'
  return 'bg-red-400'
}

export default function SoundRail({
  selectedItemId,
  progressByItemId,
  onSelectItem,
}: {
  selectedItemId: string | null
  progressByItemId: Record<string, PronunciationProgressEntry>
  onSelectItem: (itemId: string) => void
}) {
  return (
    <nav className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <ul className="py-2">
        {pronunciationCurriculum.map((item) => {
          const progress = progressByItemId[item.id]
          const isSelected = item.id === selectedItemId
          return (
            <li key={item.id}>
              <button
                onClick={() => onSelectItem(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition ${
                  isSelected ? 'bg-rose-50 text-rose-800 font-medium' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-1 shrink-0" title="Percepció / kiejtés">
                  <span className={`h-1.5 w-1.5 rounded-full ${scoreDotClass(progress?.perceptionScore)}`} />
                  <span className={`h-1.5 w-1.5 rounded-full ${scoreDotClass(progress?.productionScore)}`} />
                </span>
                <span className="truncate">{item.title}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
