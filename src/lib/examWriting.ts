// "Complete the sentences" writing tasks store the learner's continuations as one string,
// one line per printed sentence opening, so they score and save like any other writing text.
import type { SentenceStarters } from '../data/exams/types'

export function starterLines(value: string, count: number): string[] {
  const lines = value.split('\n')
  return Array.from({ length: count }, (_, i) => lines[i] ?? '')
}

export function setStarterLine(value: string, count: number, index: number, line: string): string {
  const lines = starterLines(value, count)
  lines[index] = line.replace(/\s*\n\s*/g, ' ')
  return lines.join('\n')
}

/** The full text as it reads on paper: each opening followed by the learner's words. */
export function composeStarterText(starters: SentenceStarters, value: string): string {
  return starterLines(value, starters.starters.length)
    .map((line, i) => `${i + 1}. ${starters.starters[i]} ${line.trim() || '…'}`)
    .join('\n')
}
