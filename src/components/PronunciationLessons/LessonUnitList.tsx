import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { lessonUnitRoute, progressIdOf, type LessonSession } from '../../data/pronunciationLessons'
import type { PronunciationProgressEntry } from '../../lib/pronunciationProgressApi'

/** A Stress Patterns / Connected Speech tab of /pronunciation: the session's units, each linking to its runner. */
export default function LessonUnitList({
  session,
  progress,
}: {
  session: LessonSession
  progress: PronunciationProgressEntry[]
}) {
  return (
    <ol className="max-w-4xl space-y-3">
      {session.units.map((u, i) => {
        const entry = progress.find((p) => p.soundItemId === progressIdOf(u)) ?? null
        return (
          <li key={u.id}>
            <Link
              to={lessonUnitRoute(session.id, u.id)}
              className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-rose-200 hover:shadow-[var(--shadow-card)]"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-100 text-sm font-semibold text-rose-700">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-foreground">{u.title}</span>
                <span className="block text-xs text-rose-500">{u.titleHu}</span>
                <span className="mt-1 block text-sm text-muted-foreground">{u.summaryHu}</span>
              </span>
              <ScoreChips entry={entry} />
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-rose-500" />
            </Link>
          </li>
        )
      })}
    </ol>
  )
}

function ScoreChips({ entry }: { entry: PronunciationProgressEntry | null }) {
  if (!entry || entry.attempts === 0) return null
  return (
    <span className="flex shrink-0 flex-col items-end gap-1 text-[11px] font-medium text-rose-700">
      {entry.perceptionScore !== null && (
        <span className="rounded-full bg-rose-100 px-2 py-0.5">Hallás {Math.round(entry.perceptionScore)}%</span>
      )}
      {entry.productionScore !== null && (
        <span className="rounded-full bg-rose-100 px-2 py-0.5">Kiejtés {Math.round(entry.productionScore)}%</span>
      )}
    </span>
  )
}
