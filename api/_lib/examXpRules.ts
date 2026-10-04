import { EXAM_WRITING_MIN_WORDS_FOR_XP } from '../../src/lib/gamification/constants.js'
import { answerKey, countWords, isScoredSection, scoreSection, type AnswerValue, type ExamAnswers } from '../../src/lib/examScoring.js'
import type { ExamPaper, ExamSection } from '../../src/data/exams/types.js'

// Exam Prep XP rules as pure functions (no database access): what a handed-in section is
// worth, and the paper score behind the paper bonus. api/_lib/examXp.ts does the loading.

const MAX_TEXT_LENGTH = 10_000
const MAX_TICKS = 30
const MAX_TICK_LENGTH = 20

/**
 * The browser's answers, kept only for this section's items and only in the shapes the
 * scorer reads (text, true/false, ticked keys). Anything else is dropped, not trusted.
 */
export function sectionAnswers(section: ExamSection, raw: unknown): ExamAnswers {
  const answers: ExamAnswers = {}
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return answers
  const given = raw as Record<string, unknown>
  for (const task of section.tasks) {
    for (const item of task.items) {
      const key = answerKey(task.id, item.id)
      const v = given[key]
      if (typeof v === 'boolean') answers[key] = v
      else if (typeof v === 'string' && v.length <= MAX_TEXT_LENGTH) answers[key] = v
      else if (
        Array.isArray(v) &&
        v.length <= MAX_TICKS &&
        v.every((t) => typeof t === 'string' && t.length <= MAX_TICK_LENGTH)
      ) {
        answers[key] = v as AnswerValue
      }
    }
  }
  return answers
}

export interface SectionAward {
  /** Tasks the learner did: any item answered, or a writing text of at least the minimum words. */
  tasksDone: number
  /** Raw points share (0–1) for a scored section; null for writing, which isn't graded. */
  score: number | null
  /** The section's raw maximum (0 for writing). */
  max: number
}

export function sectionAward(section: ExamSection, answers: ExamAnswers): SectionAward {
  const result = scoreSection(section, answers)
  let tasksDone = 0
  for (const task of section.tasks) {
    const taskResult = result.tasks.find((t) => t.taskId === task.id)
    const writing = task.items.filter((i) => i.type === 'production')
    const done =
      writing.length > 0
        ? writing.some((i) => {
            const text = answers[answerKey(task.id, i.id)]
            return typeof text === 'string' && countWords(text) >= EXAM_WRITING_MIN_WORDS_FOR_XP
          })
        : !!taskResult?.items.some((i) => i.answered)
    if (done) tasksDone++
  }
  const scored = isScoredSection(section) && result.max > 0
  return { tasksDone, score: scored ? result.raw / result.max : null, max: scored ? result.max : 0 }
}

/** A section's latest XP event since the paper was last completed. */
export interface SectionEvent {
  sectionId: string
  score: number | null
}

/**
 * The paper is complete when every section has an event since the last paper bonus. Its
 * score is the raw points share over the scored sections (each weighted by its maximum);
 * null when nothing is scored.
 */
export function paperCompletion(paper: ExamPaper, latest: SectionEvent[]): { complete: boolean; score: number | null } {
  const bySection = new Map(latest.map((e) => [e.sectionId, e]))
  if (!paper.sections.every((s) => bySection.has(s.id))) return { complete: false, score: null }
  let points = 0
  let max = 0
  for (const section of paper.sections) {
    const sectionMax = isScoredSection(section) ? scoreSection(section, {}).max : 0
    const score = bySection.get(section.id)?.score
    if (sectionMax === 0 || score === null || score === undefined) continue
    points += score * sectionMax
    max += sectionMax
  }
  return { complete: true, score: max > 0 ? points / max : null }
}
