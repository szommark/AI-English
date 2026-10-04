// Objective scoring for Exam Prep papers (docs: exam-prep prompt, Phase 1). Pure functions,
// no React. Writing (`production`) items are collected but not scored here.
//
// Deliberately not built on wordMatch.ts: that compares dictation word by word and strips
// punctuation, while the érettségi key says misspelled words are not accepted.
import type { ExamItem, ExamPaper, ExamSection, ExamTask, TextAnswer } from '../data/exams/types.js'

/** A choice key, a typed answer or a text; true/false; or the ticked option keys. */
export type AnswerValue = string | boolean | string[]
export type ExamAnswers = Record<string, AnswerValue>

export const answerKey = (taskId: string, itemId: string) => `${taskId}/${itemId}`

export function normalizeText(s: string): string {
  return s.normalize('NFC').replace(/[‘’`´]/g, "'").replace(/\s+/g, ' ').trim()
}

/** Words the learner wrote: whitespace-separated tokens with at least one letter or digit. */
export function countWords(s: string): number {
  return s
    .split(/\s+/)
    .filter((w) => /[\p{L}\p{N}]/u.test(w)).length
}

export function exceedsMaxWords(answer: TextAnswer, given: string): boolean {
  return answer.maxWords !== undefined && countWords(given) > answer.maxWords
}

export function matchText(answer: TextAnswer, given: string): boolean {
  const g = normalizeText(given)
  if (!g || exceedsMaxWords(answer, g)) return false
  const lower = g.toLocaleLowerCase('de')
  switch (answer.match) {
    case 'exact':
      return answer.accepted.some((a) => normalizeText(a) === g)
    case 'exact-ci':
      return answer.accepted.some((a) => normalizeText(a).toLocaleLowerCase('de') === lower)
    case 'keywords': {
      const groups = answer.keywords ?? []
      return groups.length > 0 && groups.every((group) => group.some((stem) => lower.includes(stem.toLocaleLowerCase('de'))))
    }
  }
}

export function itemMax(item: ExamItem): number {
  if (item.type === 'production') return 0
  if (item.type === 'multi-select') return item.answer.length
  if (item.type === 'order') return item.answer.length
  return 1
}

export interface OptionResult {
  key: string
  text: string
  ticked: boolean
  shouldTick: boolean
}

export interface ItemResult {
  taskId: string
  itemId: string
  type: ExamItem['type']
  points: number
  max: number
  correct: boolean
  answered: boolean
  /** What the learner gave, as display text (empty when unanswered). */
  given: string
  /** The expected answer(s), as display text. */
  expected: string
  /** Short answers over their word limit score 0. */
  overWordLimit?: boolean
  options?: OptionResult[]
}

export type TaskRuleApplied =
  | { kind: 'allSame'; label: string }
  | { kind: 'multiSelectPenalty'; penalty: number }
  | { kind: 'allTicked' }

export interface TaskResult {
  taskId: string
  label: string
  raw: number
  max: number
  items: ItemResult[]
  rule?: TaskRuleApplied
}

export interface SectionResult {
  sectionId: string
  titleHu: string
  kind: ExamSection['kind']
  /** False for writing, which Phase 1 doesn't score. */
  scored: boolean
  raw: number
  max: number
  /** Vizsgapont, when the section has a conversion table. */
  scaled?: number
  scaledMax?: number
  tasks: TaskResult[]
}

export interface PaperResult {
  sections: SectionResult[]
  /** Scored sections only. */
  raw: number
  max: number
  /** Érettségi: vizsgapont of the scored sections; writing counts 1:1 once it is graded. */
  scaled?: number
  /** Érettségi: the written exam's vizsgapont total (117), writing included. */
  scaledMax?: number
  /** Érettségi: the writing section's points (1:1), not yet scored in Phase 1. */
  writingMax?: number
}

function booleanLabel(task: ExamTask, value: boolean): string {
  const [yes, no] = task.booleanLabels ?? ['T', 'F']
  return value ? yes : no
}

function bankText(task: ExamTask, key: string): string {
  const option = task.bank?.find((b) => b.key === key)
  return option && option.text !== key ? `${key}) ${option.text}` : key
}

function asString(v: AnswerValue | undefined): string {
  return typeof v === 'string' ? v : ''
}

function ticks(v: AnswerValue | undefined): string[] {
  return Array.isArray(v) ? v : []
}

export function scoreItem(task: ExamTask, item: ExamItem, answers: ExamAnswers): ItemResult {
  const value = answers[answerKey(task.id, item.id)]
  const base = { taskId: task.id, itemId: item.id, type: item.type, max: itemMax(item) }

  switch (item.type) {
    case 'choice': {
      const given = asString(value)
      const correct = given === item.answer || !!item.alsoAccept?.includes(given)
      return { ...base, points: correct ? 1 : 0, correct, answered: !!given, given: given && bankText(task, given), expected: bankText(task, item.answer) }
    }
    case 'mcq': {
      const given = asString(value)
      const correct = given === item.answer || !!item.alsoAccept?.includes(given)
      const options = item.options ?? task.options ?? []
      const label = (key: string) => {
        const text = options.find((o) => o.key === key)?.text
        return text && text !== key ? `${key}) ${text}` : key
      }
      return { ...base, points: correct ? 1 : 0, correct, answered: !!given, given: given && label(given), expected: label(item.answer) }
    }
    case 'order': {
      const given = Array.isArray(value) ? value : []
      const chain = [item.first, ...item.answer]
      const seq = [item.first, ...given]
      let points = 0
      for (let i = 0; i < chain.length - 1; i++) {
        const [a, b] = [chain[i], chain[i + 1]]
        const linked = seq.some((s, j) => s === a && seq[j + 1] === b)
        const closesText = i === chain.length - 2 && seq[seq.length - 1] === b
        if (linked || closesText) points++
      }
      const answered = given.some(Boolean)
      return {
        ...base,
        points,
        correct: points === base.max,
        answered,
        given: given.filter(Boolean).join(' '),
        expected: item.answer.join(' '),
      }
    }
    case 'boolean': {
      const answered = typeof value === 'boolean'
      const correct = value === item.answer
      return {
        ...base,
        points: correct ? 1 : 0,
        correct,
        answered,
        given: answered ? booleanLabel(task, value as boolean) : '',
        expected: booleanLabel(task, item.answer),
      }
    }
    case 'short-text':
    case 'correction': {
      const given = normalizeText(asString(value))
      const correct = matchText(item.answer, given)
      return {
        ...base,
        points: correct ? 1 : 0,
        correct,
        answered: !!given,
        given,
        expected: item.answer.accepted.join(' / '),
        overWordLimit: !!given && exceedsMaxWords(item.answer, given),
      }
    }
    case 'multi-select': {
      const ticked = ticks(value)
      const options = item.options.map((o) => ({
        key: o.key,
        text: o.text,
        ticked: ticked.includes(o.key),
        shouldTick: item.answer.includes(o.key),
      }))
      const points = options.filter((o) => o.ticked && o.shouldTick).length
      return {
        ...base,
        points,
        correct: points === base.max && ticked.length === item.pick,
        answered: ticked.length > 0,
        given: `${ticked.length}`,
        expected: `${item.pick}`,
        options,
      }
    }
    case 'production': {
      const given = asString(value)
      return { ...base, points: 0, correct: false, answered: given.trim().length > 0, given, expected: item.modelAnswer ?? '' }
    }
  }
}

/** The answered true/false values when they are all the same (two or more answers). */
function allSameBoolean(task: ExamTask, answers: ExamAnswers): boolean | undefined {
  const given = task.items
    .filter((i) => i.type === 'boolean')
    .map((i) => answers[answerKey(task.id, i.id)])
    .filter((v): v is boolean => typeof v === 'boolean')
  if (given.length < 2) return undefined
  return given.every((v) => v === given[0]) ? given[0] : undefined
}

/**
 * The multi-select tick rules, applied over the whole task: a lone multi-select item (érettségi
 * német listening, 6–7 ticks) or a table of them, one per row (matching a statement to texts or
 * persons, 8–10 ticks in all). Ticking every box scores 0; each tick beyond the total scores −1.
 */
export function tickRule(task: ExamTask, answers: ExamAnswers): { kind: 'allTicked' } | { kind: 'tooManyTicks'; ticks: number; pick: number } | undefined {
  let count = 0
  let pick = 0
  let options = 0
  for (const item of task.items) {
    if (item.type !== 'multi-select') continue
    count += ticks(answers[answerKey(task.id, item.id)]).length
    pick += item.pick
    options += item.options.length
  }
  if (options === 0) return undefined
  if (count === options) return { kind: 'allTicked' }
  if (count > pick) return { kind: 'tooManyTicks', ticks: count, pick }
  return undefined
}

/** A task with several multi-select items is a table: its tick limit counts all rows together. */
export function isTickTable(task: ExamTask): boolean {
  return task.items.filter((i) => i.type === 'multi-select').length > 1
}

export function scoreTask(task: ExamTask, answers: ExamAnswers): TaskResult {
  const items = task.items.map((item) => scoreItem(task, item, answers))
  const max = items.reduce((sum, r) => sum + r.max, 0)
  let raw = items.reduce((sum, r) => sum + r.points, 0)
  let rule: TaskRuleApplied | undefined

  if (task.rules?.allSameBooleanIsZero) {
    const same = allSameBoolean(task, answers)
    if (same !== undefined) {
      raw = 0
      rule = { kind: 'allSame', label: booleanLabel(task, same) }
    }
  }

  if (task.rules?.multiSelectPenalty) {
    const hit = tickRule(task, answers)
    if (hit?.kind === 'allTicked') {
      raw = 0
      rule = { kind: 'allTicked' }
    } else if (hit?.kind === 'tooManyTicks') {
      const penalty = hit.ticks - hit.pick
      raw = Math.max(0, raw - penalty)
      rule = { kind: 'multiSelectPenalty', penalty }
    }
  }

  return { taskId: task.id, label: task.label, raw, max, items, rule }
}

export function isScoredSection(section: ExamSection): boolean {
  return section.kind !== 'writing'
}

export function scoreSection(section: ExamSection, answers: ExamAnswers): SectionResult {
  const tasks = section.tasks.map((t) => scoreTask(t, answers))
  const raw = tasks.reduce((sum, t) => sum + t.raw, 0)
  const max = tasks.reduce((sum, t) => sum + t.max, 0)
  const result: SectionResult = {
    sectionId: section.id,
    titleHu: section.titleHu,
    kind: section.kind,
    scored: isScoredSection(section),
    raw,
    max,
    tasks,
  }
  if (section.conversion) {
    result.scaled = section.conversion[Math.min(raw, section.conversion.length - 1)]
    result.scaledMax = section.conversion[max]
  }
  return result
}

/** Printed points of a writing section's tasks (érettségi writing counts 1:1). */
export function writingMaxPoints(section: ExamSection): number {
  return section.tasks
    .flatMap((t) => t.items)
    .reduce((sum, i) => sum + (i.type === 'production' ? (i.criteria ?? []).reduce((s, c) => s + c.points, 0) : 0), 0)
}

export function scorePaper(paper: ExamPaper, answers: ExamAnswers): PaperResult {
  const sections = paper.sections.map((s) => scoreSection(s, answers))
  const scored = sections.filter((s) => s.scored)
  const result: PaperResult = {
    sections,
    raw: scored.reduce((sum, s) => sum + s.raw, 0),
    max: scored.reduce((sum, s) => sum + s.max, 0),
  }
  if (paper.type === 'erettsegi') {
    const writingMax = paper.sections.filter((s) => s.kind === 'writing').reduce((sum, s) => sum + writingMaxPoints(s), 0)
    result.scaled = scored.reduce((sum, s) => sum + (s.scaled ?? 0), 0)
    result.scaledMax = scored.reduce((sum, s) => sum + (s.scaledMax ?? 0), 0) + writingMax
    result.writingMax = writingMax
  }
  return result
}

export type TaskWarning =
  | { kind: 'allSame'; taskLabel: string; label: string }
  | { kind: 'tooManyTicks'; taskLabel: string; ticks: number; pick: number }
  | { kind: 'allTicked'; taskLabel: string }

/** Answers that would trip a task rule — shown before the learner submits. */
export function sectionWarnings(section: ExamSection, answers: ExamAnswers): TaskWarning[] {
  const warnings: TaskWarning[] = []
  for (const task of section.tasks) {
    if (task.rules?.allSameBooleanIsZero) {
      const same = allSameBoolean(task, answers)
      if (same !== undefined) warnings.push({ kind: 'allSame', taskLabel: task.label, label: booleanLabel(task, same) })
    }
    const hit = tickRule(task, answers)
    if (hit?.kind === 'allTicked') warnings.push({ kind: 'allTicked', taskLabel: task.label })
    else if (hit?.kind === 'tooManyTicks') warnings.push({ kind: 'tooManyTicks', taskLabel: task.label, ticks: hit.ticks, pick: hit.pick })
  }
  return warnings
}

function isAnswered(task: ExamTask, item: ExamItem, answers: ExamAnswers): boolean {
  const v = answers[answerKey(task.id, item.id)]
  if (item.type === 'boolean') return typeof v === 'boolean'
  if (item.type === 'multi-select') return ticks(v).length > 0
  if (item.type === 'order') return ticks(v).some(Boolean)
  return typeof v === 'string' && v.trim().length > 0
}

export function unansweredCount(section: ExamSection, answers: ExamAnswers): number {
  return section.tasks.reduce((n, t) => n + t.items.filter((i) => !isAnswered(t, i, answers)).length, 0)
}

