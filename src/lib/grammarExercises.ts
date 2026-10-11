// Answer handling for Grammar Coach written practice, shared by the browser (checking)
// and api/_lib/groq.ts (validating a generated set). Pure functions, no imports.

/** Items per exercise type in one set. */
export const EXERCISES_PER_TYPE = 5

/** The gap marker in a form exercise's sentence. */
export const GAP = '___'

/**
 * Comparable form of an answer: case, curly apostrophes, commas, spacing and the final
 * punctuation mark don't count.
 */
export function normalizeAnswer(text: string): string {
  return text
    .toLowerCase()
    .replace(/[‘’`]/g, "'")
    .replace(/,/g, ' ')
    .replace(/[.!?]+\s*$/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function matchesAnswer(input: string, answers: string[]): boolean {
  const normalized = normalizeAnswer(input)
  return normalized.length > 0 && answers.some((a) => normalizeAnswer(a) === normalized)
}

/** The final punctuation mark of a sentence ("." if it has none). */
export function finalPunctuation(sentence: string): string {
  return sentence.trim().match(/[.!?]$/)?.[0] ?? '.'
}

/**
 * Word tiles of a sentence in their correct order: no commas or final punctuation, and the
 * first word lower-cased (unless it's "I" or a contraction of it) so capitals give nothing away.
 */
export function sentenceTiles(sentence: string): string[] {
  const body = sentence.trim().replace(/[.!?]+$/, '').replace(/,/g, ' ').trim()
  const words = body ? body.split(/\s+/) : []
  return words.map((word, i) => {
    const w = word.replace(/[‘’`]/g, "'")
    if (i > 0 || /^I($|')/.test(w)) return w
    return w.charAt(0).toLowerCase() + w.slice(1)
  })
}

/** The learner's tile sentence, written out properly (capital first letter, final mark). */
export function joinTiles(tiles: string[], punctuation: string): string {
  const text = tiles.join(' ')
  return text ? text.charAt(0).toUpperCase() + text.slice(1) + punctuation : ''
}

/** Same multiset of words (ignoring case) — an alternative word order must use exactly the answer's words. */
export function sameWords(a: string, b: string): boolean {
  const key = (s: string) => normalizeAnswer(s).split(' ').sort().join(' ')
  return key(a) === key(b)
}
