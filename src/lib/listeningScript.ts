// The annotated listening audioscript (src/lib/examTasks.ts): `[[3|words]]` marks where item 3's
// answer is spoken. This module turns it into words with syllable counts, so the checks can
// measure the 2_4 spacing rules (15 syllables between answers, 3 words to the calling word…).

export interface ScriptWord {
  text: string
  /** Lower case, apostrophes straightened, edge punctuation removed. */
  norm: string
  syllables: number
  paragraph: number
  sentence: number
  /** Set when the word is inside an item's marker. */
  markerId?: string
}

export interface MarkerSpan {
  id: string
  text: string
  /** Word index of the first word in the marker. */
  start: number
  /** Word index after the last word (start === end for an empty marker). */
  end: number
}

export interface ParsedScript {
  words: ScriptWord[]
  markers: MarkerSpan[]
  /** The recording script: no markers, no speaker labels changed. Paragraphs joined by blank lines. */
  clean: string
  paragraphs: string[]
  sentenceCount: number
  /** Problems with the markup itself (unclosed or repeated markers). */
  errors: string[]
}

const MARKER_RE = /\[\[\s*(\d{1,2})\s*(?:\|([^\]]*))?\]\]/g
const WORD_RE = /[\p{L}\p{N}]+(?:[’'\-‐‑.,/][\p{L}\p{N}]+)*%?/gu
/** "Interviewer:" / "Dr Lee:" at the start of a line — not spoken. */
const SPEAKER_RE = /^((?:[A-Z][\w.'’-]*\s?){1,3}):\s+/

export function normWord(w: string): string {
  return w.toLowerCase().replace(/’/g, "'").replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}%]+$/gu, '')
}

/** Removes the markers, keeping their words. */
export function cleanScript(script: string): string {
  return script.replace(MARKER_RE, (_m, _id, text: string | undefined) => text ?? '').replace(/[ \t]{2,}/g, ' ')
}

export function parseScript(script: string): ParsedScript {
  const errors: string[] = []
  const words: ScriptWord[] = []
  const markers: MarkerSpan[] = []
  const seen = new Set<string>()
  const paragraphs = script
    .replace(/\r\n?/g, '\n')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
  let sentence = 0

  paragraphs.forEach((para, pIndex) => {
    for (const line of para.split('\n')) {
      const body = line.replace(SPEAKER_RE, '')
      // The clean line, with each marker's character range in it.
      let clean = ''
      let last = 0
      const ranges: { id: string; text: string; from: number; to: number }[] = []
      for (const m of body.matchAll(MARKER_RE)) {
        clean += body.slice(last, m.index)
        const text = m[2] ?? ''
        ranges.push({ id: m[1], text: text.trim(), from: clean.length, to: clean.length + text.length })
        clean += text
        last = (m.index ?? 0) + m[0].length
      }
      clean += body.slice(last)

      const lineStart = words.length
      const spans = new Map<string, { start: number; end: number }>()
      for (const m of clean.matchAll(WORD_RE)) {
        const text = m[0]
        const at = m.index ?? 0
        const range = ranges.find((r) => at >= r.from && at < r.to)
        if (range) {
          const span = spans.get(range.id) ?? { start: words.length, end: words.length }
          span.end = words.length + 1
          spans.set(range.id, span)
        }
        words.push({
          text,
          norm: normWord(text),
          syllables: syllableCount(text),
          paragraph: pIndex,
          sentence,
          ...(range ? { markerId: range.id } : {}),
        })
        // A sentence ends after this word when the next non-space character is . ! or ? (not a decimal point).
        const rest = clean.slice(at + text.length)
        const after = rest.match(/^\s*["”’)]*\s*[.!?]+/)
        if (after && !/^\d/.test(rest.slice(after[0].length))) sentence++
      }
      for (const r of ranges) {
        if (seen.has(r.id)) {
          errors.push(`Marker (${r.id}) appears twice`)
          continue
        }
        seen.add(r.id)
        // An empty marker is a point: it sits before the next word.
        const span = spans.get(r.id) ?? (() => {
          const next = [...clean.matchAll(WORD_RE)].findIndex((m) => (m.index ?? 0) >= r.from)
          const i = next < 0 ? words.length : lineStart + next
          return { start: i, end: i }
        })()
        markers.push({ id: r.id, text: r.text, start: span.start, end: span.end })
      }
    }
    // A paragraph always ends a sentence.
    if (words.length && words[words.length - 1].sentence === sentence) sentence++
  })

  if (/\[\[(?![^\]]*\]\])/.test(script)) errors.push('A marker is not closed with ]]')
  const clean = paragraphs.map((p) => cleanScript(p)).join('\n\n')
  return { words, markers, clean, paragraphs: clean.split('\n\n'), sentenceCount: sentence, errors }
}

// --- Syllables -----------------------------------------------------------------------------

const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen']
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']

function under1000(n: number): string[] {
  const out: string[] = []
  if (n >= 100) {
    out.push(ONES[Math.floor(n / 100)], 'hundred')
    n %= 100
    if (n) out.push('and')
  }
  if (n >= 20) {
    out.push(TENS[Math.floor(n / 10)])
    if (n % 10) out.push(ONES[n % 10])
  } else if (n > 0 || out.length === 0) out.push(ONES[n])
  return out
}

/** How a figure is read aloud, in words (years as "twenty twenty-six"). */
export function numberWords(raw: string): string[] {
  const percent = raw.endsWith('%')
  const s = raw.replace(/%$/, '').replace(/,(?=\d{3}\b)/g, '')
  const out: string[] = []
  const [intPart, decPart] = s.split('.')
  const n = Number(intPart)
  if (!Number.isFinite(n)) return [raw]
  if (!decPart && !percent && intPart.length === 4 && n >= 1100 && n <= 2099 && n % 1000 >= 10) {
    // A year: 1994 → nineteen ninety-four; 2026 → twenty twenty-six.
    out.push(...under1000(Math.floor(n / 100)), ...(n % 100 < 10 ? ['oh', ONES[n % 100]] : under1000(n % 100)))
  } else {
    const units: [number, string][] = [
      [1e9, 'billion'],
      [1e6, 'million'],
      [1e3, 'thousand'],
    ]
    let rest = n
    for (const [size, name] of units) {
      if (rest >= size) {
        out.push(...under1000(Math.floor(rest / size)), name)
        rest %= size
      }
    }
    if (rest || out.length === 0) out.push(...under1000(rest))
  }
  if (decPart) out.push('point', ...decPart.split('').map((d) => ONES[Number(d)] ?? d))
  if (percent) out.push('per', 'cent')
  return out
}

function wordSyllables(w: string): number {
  let s = w.toLowerCase().replace(/[^a-z]/g, '')
  if (!s) return 0
  if (s.length <= 3) return 1
  s = s.replace(/(?:[^laeiouy]es|[^laeiouy]ed|[^laeiouy]e)$/, (m) => m[0]).replace(/^y/, '')
  const groups = s.match(/[aeiouy]{1,2}/g)
  let n = groups ? groups.length : 1
  // "-le" after a consonant is its own syllable (table, little).
  if (/[^aeiouy]le$/.test(w.toLowerCase())) n++
  return Math.max(1, n)
}

/** Heuristic syllable count of one script word, figures read out in full. */
export function syllableCount(word: string): number {
  const w = word.replace(/’/g, "'")
  if (/^\d/.test(w)) return numberWords(w).reduce((sum, x) => sum + wordSyllables(x), 0)
  // Acronyms are spelled out: one syllable per letter, three for W.
  if (/^[A-Z]{2,5}s?$/.test(w)) return [...w.replace(/s$/, '')].reduce((sum, c) => sum + (c === 'W' ? 3 : 1), 0)
  return w
    .split(/[-‐‑/]/)
    .filter(Boolean)
    .reduce((sum, part) => sum + wordSyllables(part.replace(/'(s|re|ve|ll|d|t|m)$/i, (m) => (m === "'t" ? 't' : ''))), 0)
}

export function countWords(text: string): number {
  return (text.match(WORD_RE) ?? []).length
}

export function isFigure(word: string): boolean {
  return /^\d/.test(word)
}
