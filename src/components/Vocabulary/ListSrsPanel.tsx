import { ChevronRight } from 'lucide-react'
import { useLanguage, type Lang, type MessageKey } from '../../lib/i18n'
import {
  MAX_REVIEWS_PER_SESSION,
  NEW_CARDS_PER_DAY,
  PRACTICE_EXERCISES,
  SRS_MIN_WORDS,
  hasSrsSession,
  type ListSrs,
  type WordlistSummary,
} from '../../lib/vocab'
import { ROUND_LABEL } from './DrillSession'

// One list's spaced repetition (design §6.2, §7): where its words are, what is due, and
// the button that starts its own review session. Shown in the list view and, compact, on
// the Spaced repetition tab.

/** "in 3 hours", "tomorrow" … in the UI language. */
function relativeTime(iso: string, lang: Lang): string {
  const diffMs = new Date(iso).getTime() - Date.now()
  const fmt = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' })
  const minutes = Math.round(diffMs / 60_000)
  if (Math.abs(minutes) < 60) return fmt.format(Math.max(1, minutes), 'minute')
  const hours = Math.round(minutes / 60)
  if (Math.abs(hours) < 24) return fmt.format(hours, 'hour')
  return fmt.format(Math.round(hours / 24), 'day')
}

interface PipelineStep {
  label: MessageKey
  n: number
  className: string
}

/** One row of boxes with arrows between them, under a small caption. */
function Pipeline({ caption, steps }: { caption: MessageKey; steps: PipelineStep[] }) {
  const { t } = useLanguage()
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">{t(caption)}</p>
      <ol className="grid grid-cols-2 gap-2 sm:flex sm:items-stretch">
        {steps.map((step, i) => (
          <li key={step.label} className="flex items-center gap-1 sm:flex-1">
            {i > 0 && <ChevronRight className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:block" aria-hidden />}
            <div className={`h-full flex-1 rounded-xl px-3 py-2.5 ${step.className}`}>
              <div className="text-2xl font-semibold tabular-nums">{step.n}</div>
              <div className="text-xs">{t(step.label)}</div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

/** Where the list's words are: (not in review →) new → learning → learned → mastered. */
function stageSteps(stages: ListSrs['stages'], notInSrs: number | null): PipelineStep[] {
  return [
    ...(notInSrs === null
      ? []
      : [{ label: 'vcPipeNotInSrs' as const, n: notInSrs, className: 'border border-dashed border-border text-muted-foreground' }]),
    { label: 'vcPipeNew', n: stages.new, className: 'bg-secondary text-secondary-foreground' },
    { label: 'vcPipeLearning', n: stages.learning, className: 'bg-amber-100 text-amber-800' },
    { label: 'vcPipeLearned', n: stages.learned, className: 'bg-emerald-100 text-emerald-700' },
    { label: 'vcPipeMastered', n: stages.mastered, className: 'bg-violet-100 text-violet-800' },
  ]
}

/** The list's words in review by the exercise they are at (design §7): meaning → recall → gap-fill → listening. */
function exerciseSteps(exercises: ListSrs['exercises']): PipelineStep[] {
  return PRACTICE_EXERCISES.map((e) => ({
    label: ROUND_LABEL[e],
    n: exercises[e],
    className: 'bg-[var(--teal-accent-soft)] text-foreground',
  }))
}

/** "How does it work?": the scheduling rules in plain words, closed by default. */
export function SrsExplainer() {
  const { t } = useLanguage()
  const stages: { label: MessageKey; text: MessageKey }[] = [
    { label: 'vcPipeNotInSrs', text: 'vcSrsStageNotInSrs' },
    { label: 'vcPipeNew', text: 'vcSrsStageNew' },
    { label: 'vcPipeLearning', text: 'vcSrsStageLearning' },
    { label: 'vcPipeLearned', text: 'vcSrsStageLearned' },
    { label: 'vcPipeMastered', text: 'vcSrsStageMastered' },
  ]
  return (
    <details className="group rounded-xl border border-border px-4 py-2.5 text-sm">
      <summary className="cursor-pointer font-medium text-foreground marker:text-muted-foreground">{t('vcSrsHowTitle')}</summary>
      <ul className="mt-2 list-disc space-y-1.5 pl-5 text-muted-foreground">
        <li>{t('vcSrsHowGaps')}</li>
        <li>{t('vcSrsHowLadder')}</li>
        <li>{t('vcSrsHowHint')}</li>
        <li>{t('vcSrsHowSession', { max: MAX_REVIEWS_PER_SESSION, newPerDay: NEW_CARDS_PER_DAY, min: SRS_MIN_WORDS })}</li>
        <li>
          {t('vcSrsHowStages')}
          <ul className="mt-1 list-[circle] space-y-1 pl-5">
            {stages.map((s) => (
              <li key={s.label}>
                <span className="font-medium text-foreground">{t(s.label)}:</span> {t(s.text)}
              </li>
            ))}
          </ul>
        </li>
        <li>{t('vcSrsHowSources')}</li>
      </ul>
    </details>
  )
}

export default function ListSrsPanel({
  list,
  compact = false,
  starting,
  onStart,
}: {
  list: WordlistSummary
  /** The Spaced repetition tab: the stage pipeline only. */
  compact?: boolean
  starting: boolean
  onStart: () => void
}) {
  const { t, lang } = useLanguage()
  const { srs } = list
  const practisable = srs.dueCount + srs.newAvailable
  const session = hasSrsSession(list)

  return (
    <div className="space-y-3">
      <Pipeline caption="vcPipeByStage" steps={stageSteps(srs.stages, list.kind === 'custom' ? list.wordCount - list.inSrs : null)} />
      {!compact && <Pipeline caption="vcPipeByExercise" steps={exerciseSteps(srs.exercises)} />}
      {/* Without a session (too few words) nothing here comes up, so due / new counts would mislead. */}
      {session && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {srs.dueCount > 0 ? (
            <span className="font-medium text-foreground">{t('vcNextRepNow', { n: srs.dueCount })}</span>
          ) : (
            srs.nextDue && <span>{t('vcNextRepAt', { when: relativeTime(srs.nextDue, lang) })}</span>
          )}
          {srs.newAvailable > 0 && <span>{t('vcNewTodayCount', { n: srs.newAvailable })}</span>}
          {srs.stages.paused > 0 && <span>{t('vcPipePaused', { n: srs.stages.paused })}</span>}
        </div>
      )}
      {!session ? (
        list.wordCount < SRS_MIN_WORDS && <p className="text-sm text-muted-foreground">{t('vcSrsMinWords', { n: SRS_MIN_WORDS })}</p>
      ) : practisable > 0 ? (
        <button
          type="button"
          onClick={onStart}
          disabled={starting}
          className="w-full rounded-lg bg-[var(--teal-accent)] px-5 py-3 text-sm font-semibold text-primary hover:bg-[var(--teal-accent-strong)] disabled:opacity-40 sm:w-auto"
        >
          {starting ? t('vcStarting') : t('vcStartListReview')}
        </button>
      ) : (
        <p className="text-sm text-muted-foreground">{t('vcNothingDue')}</p>
      )}
    </div>
  )
}
