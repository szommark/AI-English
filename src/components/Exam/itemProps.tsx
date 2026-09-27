import type { ExamItem, ExamTask } from '../../data/exams/types'
import type { AnswerValue } from '../../lib/examScoring'

export interface ItemProps<I extends ExamItem = ExamItem> {
  task: ExamTask
  item: I
  value: AnswerValue | undefined
  onChange: (value: AnswerValue) => void
  /** Worked examples are shown filled in and read-only. */
  example?: boolean
}

/** Shared look for text inputs and selects: 16px text (no zoom on iOS) and a 44px tap target. */
export const fieldClass =
  'min-h-11 rounded-lg border border-border bg-card px-3 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--teal-accent)] disabled:bg-muted disabled:text-muted-foreground'

/** The printed item number, e.g. "9." or "(01)". */
export function ItemNumber({ id }: { id: string }) {
  return <span className="shrink-0 font-semibold tabular-nums text-muted-foreground">{id}.</span>
}
