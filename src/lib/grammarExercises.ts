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

const NOT_CONTRACTIONS: Record<string, string> = { "won't": 'will not', "can't": 'can not', "shan't": 'shall not' }

/**
 * The words of a normalized answer with contractions written out ("i'm" → "i am", "isn't" →
 * "is not"). "'s" and "'d" stay as their own word, since each stands for two (is/has, had/would).
 */
function answerWords(normalized: string): string[] {
  return normalized
    .replace(/\s+'(?=[a-z])/g, "'") // "She 's cooking": a gap filled with "'s cooking"
    .replace(/\b(won|can|shan)'t\b/g, (m) => NOT_CONTRACTIONS[m])
    .replace(/\bcannot\b/g, 'can not')
    .replace(/n't\b/g, ' not')
    .replace(/'m\b/g, ' am')
    .replace(/'re\b/g, ' are')
    .replace(/'ve\b/g, ' have')
    .replace(/'ll\b/g, ' will')
    .replace(/'(s|d)\b/g, " '$1")
    .split(' ')
    .filter(Boolean)
}

const AMBIGUOUS: Record<string, string[]> = { "'s": ['is', 'has'], "'d": ['had', 'would'] }

function sameWord(a: string, b: string): boolean {
  return a === b || (AMBIGUOUS[a]?.includes(b) ?? false) || (AMBIGUOUS[b]?.includes(a) ?? false)
}

/** Same answer once normalized, with a contraction and its full form counting as the same. */
function sameAnswer(a: string, b: string): boolean {
  const wa = answerWords(normalizeAnswer(a))
  const wb = answerWords(normalizeAnswer(b))
  return wa.length === wb.length && wa.every((w, i) => sameWord(w, wb[i]))
}

export function matchesAnswer(input: string, answers: string[]): boolean {
  return normalizeAnswer(input).length > 0 && answers.some((a) => sameAnswer(input, a))
}

/**
 * A form item's sentence with the gap filled. A fill that starts with the word just before
 * the gap ("she's cooking" after "She") takes its place rather than repeating it.
 */
export function fillGap(sentence: string, fill: string): string {
  const [before, after = ''] = sentence.split(GAP)
  const text = fill.trim()
  const lastWord = before.match(/(\S+)\s*$/)?.[1]
  const firstWord = text.match(/^[^\s'‘’`]+/)?.[0]
  const head = lastWord && firstWord?.toLowerCase() === lastWord.toLowerCase() ? before.slice(0, before.lastIndexOf(lastWord)) : before
  return `${head}${text}${after}`
}

/**
 * A form item's sentence split at the gap, with the cue to show in brackets after it. When
 * the sentence already has a bracket right after the gap ("___ (not / watch) TV"), that one
 * is the cue, so it isn't shown twice.
 */
export function gapParts(sentence: string, cue: string): { before: string; cue: string; after: string } {
  const [before, rest = ''] = sentence.split(GAP)
  const inline = rest.match(/^\s*\(([^)]*)\)/)
  return inline ? { before, cue: inline[1].trim(), after: rest.slice(inline[0].length) } : { before, cue, after: rest }
}

/** Checks a gap fill as the whole sentence, so "'s cooking" after "She" matches "is cooking". */
export function matchesGap(sentence: string, input: string, answers: string[]): boolean {
  return input.trim().length > 0 && matchesAnswer(fillGap(sentence, input), answers.map((a) => fillGap(sentence, a)))
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
