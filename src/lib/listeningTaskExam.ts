// Test mode shows a listening task exactly as Exam Prep's practice session does: the content is
// turned into an Exam Prep ExamTask and rendered with the same TaskView (T/F buttons, inline
// note gaps with the word limit).

import type { ExamTask as PaperTask, PassageBlock } from '../data/exams/types'
import { levelSpec, noteChain, noteLinePlain, parseNoteLine, type ExamField, type ListeningTaskContent, type TaskLevel } from './examTasks'

export function toPaperTask(content: ListeningTaskContent, level: TaskLevel, field?: ExamField): PaperTask {
  if (content.format === 'true-false') {
    const rows = content.statements ?? []
    return {
      id: 'task',
      label: 'Task',
      instructions: content.instructions,
      booleanLabels: ['T', 'F'],
      rules: { allSameBooleanIsZero: true },
      examples: rows.filter((r) => r.id === '0').map((r) => ({ id: r.id, type: 'boolean', statement: r.text, answer: r.answer })),
      items: rows.filter((r) => r.id !== '0').map((r) => ({ id: r.id, type: 'boolean', statement: r.text, answer: r.answer })),
    }
  }
  const maxWords = levelSpec(level, 'notes', field).answerWords
  const answers = content.answers ?? []
  return {
    id: 'task',
    label: 'Task',
    instructions: content.instructions,
    passage: [
      ...(content.topic ? [{ style: 'title' as const, text: /^notes on/i.test(content.topic) ? content.topic : `Notes on ${content.topic}` }] : []),
      ...(content.notes ?? []).flatMap((raw): PassageBlock[] => {
        const line = parseNoteLine(raw)
        if (!line) return []
        if (line.kind === 'heading') return [{ style: 'heading', text: line.text }]
        // A gap in the label cell would not be an input: such a row is printed as one line.
        if (line.kind === 'row' && !/\{\{/.test(line.label ?? '')) return [{ style: 'row', label: line.label ?? '', text: line.text }]
        return [{ style: 'bullet', depth: line.depth, text: noteLinePlain(line) }]
      }),
    ],
    examples: answers.filter((a) => a.id === '0').map((a) => ({ id: a.id, type: 'short-text', answer: { accepted: a.accepted, match: 'exact-ci' } })),
    items: answers
      .filter((a) => a.id !== '0')
      .map((a) => ({ id: a.id, type: 'short-text', answer: { accepted: a.accepted, match: 'exact-ci', ...(maxWords ? { maxWords } : {}) } })),
  }
}

function normalizeNote(s: string): string {
  return s
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[.,;:!?"“”]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** The tester's answer against the key; null when they gave none. */
export function isCorrect(content: ListeningTaskContent, itemId: string, value: boolean | string | undefined): boolean | null {
  if (value === undefined || value === '') return null
  if (content.format === 'true-false') {
    const row = content.statements?.find((s) => s.id === itemId)
    return row ? row.answer === value : null
  }
  const key = content.answers?.find((a) => a.id === itemId)
  if (!key || typeof value !== 'string') return null
  const v = normalizeNote(value)
  return key.accepted.some((a) => normalizeNote(a) === v)
}

export function keyText(content: ListeningTaskContent, itemId: string): string {
  if (content.format === 'true-false') {
    const row = content.statements?.find((s) => s.id === itemId)
    return row ? (row.answer ? 'T' : 'F') : '—'
  }
  return content.answers?.find((a) => a.id === itemId)?.accepted.filter(Boolean).join(' / ') || '—'
}

/**
 * The item's wording: the statement, or the note line with its gap shown as a blank, after the
 * heading and lead-in line it hangs under ("Pure internet retailers … because of: › ……… (1)").
 */
export function itemText(content: ListeningTaskContent, itemId: string): string {
  if (content.format === 'true-false') return content.statements?.find((s) => s.id === itemId)?.text ?? ''
  const line = noteChain(content.notes ?? [], itemId).map(noteLinePlain).join(' › ')
  return line.replace(/\{\{(\d{1,2})\}\}/g, '……… ($1)')
}
