import { Link } from 'react-router-dom'
import { RotateCcw } from 'lucide-react'
import { getPhonemeByCurriculumId } from '../../data/phonemes'
import { getSoundItem } from '../../data/pronunciationCurriculum'
import type { PronunciationProgressEntry } from '../../lib/pronunciationProgressApi'

const SCORE_THRESHOLD = 85
const MAX_CARDS = 3

function worstScore(entry: PronunciationProgressEntry): number | null {
  const scores = [entry.perceptionScore, entry.productionScore].filter((s): s is number => s != null)
  return scores.length > 0 ? Math.min(...scores) : null
}

/**
 * §7 idea 5 (spaced resurfacing), placed per §8: draws directly on pronunciation_progress's
 * existing lowest-scoring/most-attempted-and-still-wrong signal rather than waiting on
 * mistake_log to accumulate data. Curriculum-item granularity (the six funnel items), since
 * that's what pronunciation_progress tracks — not a per-phoneme queue.
 */
export default function ResurfaceQueue({ progress }: { progress: PronunciationProgressEntry[] }) {
  const candidates = progress
    .filter((p) => p.attempts > 0)
    .map((p) => ({ entry: p, worst: worstScore(p) }))
    .filter((c): c is { entry: PronunciationProgressEntry; worst: number } => c.worst != null && c.worst < SCORE_THRESHOLD)
    .sort((a, b) => a.worst - b.worst)
    .slice(0, MAX_CARDS)

  if (candidates.length === 0) return null

  return (
    <section>
      <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-1.5">
        <RotateCcw className="h-3.5 w-3.5" />
        Érdemes újra gyakorolni
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {candidates.map(({ entry, worst }) => {
          const soundItem = getSoundItem(entry.soundItemId)
          const phoneme = getPhonemeByCurriculumId(entry.soundItemId)
          if (!soundItem || !phoneme) return null
          return (
            <Link
              key={entry.soundItemId}
              to={`/pronunciation/sounds/${phoneme.id}`}
              className="rounded-xl border border-rose-200 bg-rose-50 p-4 hover:border-rose-300 hover:shadow-[var(--shadow-card)] transition-all"
            >
              <p className="font-semibold text-rose-900">{soundItem.title}</p>
              <p className="text-xs text-rose-500">{soundItem.titleHu}</p>
              <p className="mt-2 text-xs text-rose-600">Legjobb pontszám: {worst}</p>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
