import { Check } from 'lucide-react'
import { MY_PROGRESS_COPY as C } from '../../data/myProgressCopy'
import { budapestDate, daysBetween } from '../../lib/gamification/dates'
import type { StudentChallenge } from '../../lib/gamification/types'

const DATE = new Intl.DateTimeFormat('hu-HU', { month: 'long', day: 'numeric' })
const formatDate = (d: string) => DATE.format(new Date(`${d}T12:00:00`))

/** What the challenge asks for, in Hungarian. */
export function challengeTargetHu(c: StudentChallenge): string {
  const { target } = c
  const collective = c.kind === 'collective'
  switch (target.type) {
    case 'active_days':
      return C.chTargetDays(target.value, collective)
    case 'xp':
      return C.chTargetXp(target.value)
    case 'word_list': {
      const list = target.listTitle ?? C.chDeletedList
      return collective ? C.chTargetListCollective(target.value, list) : C.chTargetList(list)
    }
    default:
      return C.chTargetActivities(target.value, C.chActivity[target.activity ?? 'any'] ?? C.chActivity.any)
  }
}

/**
 * "Kihívások" on "Az én fejlődésem": the challenges the learner's teachers set them —
 * running and upcoming first, then recently ended. A collective challenge shows the class
 * total and the learner's own part, never other students' progress.
 */
export default function StudentChallenges({ challenges }: { challenges: StudentChallenge[] }) {
  if (challenges.length === 0) return null
  const today = budapestDate()

  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-foreground">{C.chHeading}</h3>
      <ul className="space-y-3">
        {challenges.map((c) => {
          const target = c.target.type === 'word_list' && c.kind === 'individual' ? 1 : c.target.value
          const shown = c.kind === 'collective' ? (c.classTotal ?? 0) : c.myValue
          const percent = Math.min(100, (shown / Math.max(1, target)) * 100)
          const finished = c.status === 'ended' || c.status === 'cancelled'
          return (
            <li key={c.id} className={`rounded-lg border p-4 space-y-2 ${c.completed ? 'border-[var(--teal-accent-border)] bg-[var(--teal-accent-soft)]' : 'border-border'}`}>
              <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">{c.kind === 'collective' ? C.chCollective : C.chIndividual}</p>
                  <p className="text-base font-semibold text-foreground">{c.title}</p>
                </div>
                <p className="shrink-0 text-sm text-muted-foreground">
                  {c.completed ? (
                    <span className="inline-flex items-center gap-1 font-medium text-foreground">
                      <Check className="h-4 w-4" aria-hidden="true" /> {C.chDone}
                    </span>
                  ) : c.status === 'upcoming' ? (
                    C.chStarts(formatDate(c.startsOn))
                  ) : c.status === 'cancelled' ? (
                    C.chCancelled
                  ) : c.status === 'ended' ? (
                    C.chMissed
                  ) : (
                    C.chDaysLeft(daysBetween(today, c.endsOn) + 1)
                  )}
                </p>
              </div>
              {c.description && <p className="text-sm text-foreground">{c.description}</p>}
              <p className="text-sm text-foreground">{challengeTargetHu(c)}</p>
              {c.status !== 'upcoming' && (
                <>
                  <span aria-hidden="true" className="block h-2.5 overflow-hidden rounded-full bg-secondary">
                    <span
                      className={`block h-full rounded-full ${finished && !c.completed ? 'bg-muted-foreground opacity-40' : 'bg-[var(--teal-accent)]'}`}
                      style={{ width: `${percent}%` }}
                    />
                  </span>
                  <p className="text-sm text-muted-foreground">
                    {c.kind === 'collective' ? C.chClass(c.classTotal ?? 0, target, c.myValue) : C.chMine(Math.min(c.myValue, target), target)}
                  </p>
                </>
              )}
              {c.rewardXp > 0 && <p className="text-sm text-muted-foreground">{C.chReward(c.rewardXp)}</p>}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
