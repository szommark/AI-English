// Lyrics gap-fill (Teacher Toolkit, docs/teacher-toolkit-design.md): tokenizing pasted
// lyrics, word categories, the rule-based gap picker, gap groups and distractors, and the
// validation of a saved activity. Pure logic shared by the editor and api/teacher-tools.ts,
// so imports here use .js specifiers and nothing touches the DOM.

import { IRREGULAR_VERBS } from './tenseEngine/irregulars.js'

export const LYRICS_MAX_LENGTH = 6000
export const LYRICS_TITLE_MAX_LENGTH = 120
export const LYRICS_ARTIST_MAX_LENGTH = 120
export const LYRICS_URL_MAX_LENGTH = 300
export const LYRICS_NOTE_MAX_LENGTH = 1000
export const LYRICS_WORD_LIST_MAX_LENGTH = 500
export const LYRICS_MAX_GAPS = 150
export const LYRICS_MAX_DISTRACTORS = 4
export const LYRICS_DISTRACTOR_MAX_LENGTH = 40
/** Longest phrase gap: teaching guides keep phrase gaps to three words or fewer. */
export const LYRICS_PHRASE_MAX_WORDS = 3
export const LYRICS_GOAL_MAX_LENGTH = 200
/** AI gap suggestions per teacher per UTC day. */
export const LYRICS_SUGGESTIONS_PER_DAY = 30

// --- Tokenizing ---------------------------------------------------------------------------

export interface LyricsToken {
  text: string
  /** Index among the song's gappable words; null for spaces, punctuation and header lines. */
  word: number | null
}

export interface LyricsLine {
  kind: 'lyric' | 'header' | 'blank'
  tokens: LyricsToken[]
}

export interface LyricsWord {
  text: string
  /** Lower case, curly apostrophes straightened: what answers and categories compare on. */
  norm: string
  line: number
}

export interface LyricsDoc {
  lines: LyricsLine[]
  words: LyricsWord[]
}

// A word: letters/digits, with inner apostrophes (don't, rock'n'roll) and hyphens (well-known).
const WORD_RE = /[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+|-[\p{L}\p{N}]+)*/gu
// [Chorus], (Verse 2), Chorus:, Verse 1 — section labels, never gapped.
const BRACKET_HEADER_RE = /^\s*[[(].*[\])]\s*$/
const NAMED_HEADER_RE = /^\s*(intro|verse|pre-chorus|chorus|bridge|hook|refrain|outro|interlude)\b[\s\d:.x×-]*$/i

export function normalizeWord(text: string): string {
  return text.toLowerCase().replace(/’/g, "'")
}

export function tokenizeLyrics(text: string): LyricsDoc {
  const lines: LyricsLine[] = []
  const words: LyricsWord[] = []
  for (const raw of text.replace(/\r\n?/g, '\n').split('\n')) {
    const lineText = raw.replace(/\s+$/, '')
    if (!lineText.trim()) {
      lines.push({ kind: 'blank', tokens: [] })
      continue
    }
    if (BRACKET_HEADER_RE.test(lineText) || NAMED_HEADER_RE.test(lineText)) {
      lines.push({ kind: 'header', tokens: [{ text: lineText.trim(), word: null }] })
      continue
    }
    const tokens: LyricsToken[] = []
    let last = 0
    for (const m of lineText.matchAll(WORD_RE)) {
      const start = m.index ?? 0
      if (start > last) tokens.push({ text: lineText.slice(last, start), word: null })
      tokens.push({ text: m[0], word: words.length })
      words.push({ text: m[0], norm: normalizeWord(m[0]), line: lines.length })
      last = start + m[0].length
    }
    if (last < lineText.length) tokens.push({ text: lineText.slice(last), word: null })
    lines.push({ kind: 'lyric', tokens })
  }
  return { lines, words }
}

// --- Word categories ----------------------------------------------------------------------

export type GapTarget =
  | 'all'
  | 'content'
  | 'rhymes'
  | 'past'
  | 'ing'
  | 'prepositions'
  | 'determiners'
  | 'auxiliaries'
  | 'pronouns'
  | 'conjunctions'

export const GAP_TARGETS: GapTarget[] = [
  'all',
  'content',
  'rhymes',
  'past',
  'ing',
  'prepositions',
  'determiners',
  'auxiliaries',
  'pronouns',
  'conjunctions',
]

const words = (s: string) => new Set(s.split(/\s+/).filter(Boolean))

const PREPOSITIONS = words(
  'in on at to from with without for of by about into onto over under through across after before behind between beside besides near around along up down off out inside outside upon till until since against among beyond within towards toward underneath above below beneath',
)
const DETERMINERS = words('a an the this that these those some any every each no my your his her its our their')
const AUXILIARIES = words(
  "am is are was were be been being do does did have has had will would shall should can could may might must " +
    "won't don't doesn't didn't can't cannot couldn't wouldn't shouldn't isn't aren't wasn't weren't haven't hasn't hadn't ain't mustn't " +
    'gonna wanna gotta',
)
const PRONOUNS = words(
  "i me you he him she her it we us they them myself yourself himself herself itself ourselves yourselves themselves mine yours hers ours theirs " +
    "i'm you're he's she's it's we're they're i've you've we've they've i'll you'll he'll she'll it'll we'll they'll i'd you'd he'd she'd we'd they'd",
)
const CONJUNCTIONS = words("and but or so because 'cause cause if when while though although unless nor yet whenever wherever")

const FUNCTION_WORDS = new Set([...PREPOSITIONS, ...DETERMINERS, ...AUXILIARIES, ...PRONOUNS, ...CONJUNCTIONS])

// Irregular past and participle forms that differ from the base (put/cut/come don't count).
const IRREGULAR_PAST = new Set<string>()
for (const [base, [past, participle]] of Object.entries(IRREGULAR_VERBS)) {
  for (const form of [past, participle]) if (form !== base) IRREGULAR_PAST.add(form)
}
IRREGULAR_PAST.add('were')
const NOT_PAST_ED = words('bed red need feed seed speed bleed shed bred fed led wed sped weed indeed exceed proceed succeed hundred sacred naked wicked')
const NOT_ING = words(
  'thing things nothing something anything everything king ring rings sing bring spring string wing wings swing sting sling ceiling morning evening during darling ending',
)

function isPastForm(norm: string): boolean {
  if (IRREGULAR_PAST.has(norm)) return true
  return norm.length >= 4 && norm.endsWith('ed') && !NOT_PAST_ED.has(norm)
}

function isIngForm(norm: string): boolean {
  return norm.length >= 5 && norm.endsWith('ing') && !NOT_ING.has(norm)
}

/** The categories one word belongs to, apart from 'rhymes' (which depends on its neighbours). */
export function wordTargets(norm: string): Set<GapTarget> {
  const out = new Set<GapTarget>(['all'])
  if (PREPOSITIONS.has(norm)) out.add('prepositions')
  if (DETERMINERS.has(norm)) out.add('determiners')
  if (AUXILIARIES.has(norm)) out.add('auxiliaries')
  if (PRONOUNS.has(norm)) out.add('pronouns')
  if (CONJUNCTIONS.has(norm)) out.add('conjunctions')
  if (isPastForm(norm)) out.add('past')
  if (isIngForm(norm)) out.add('ing')
  if (!FUNCTION_WORDS.has(norm) && norm.replace(/[^\p{L}]/gu, '').length >= 4) out.add('content')
  return out
}

/** From the last sounded vowel group to the end: night → ight, fire → ir, star/are → ar, high/sky → y. */
function rhymeKey(norm: string): string {
  // Spellings of the same final sound: high, lie, bye → y (sky, my).
  let w = norm.replace(/[^a-z]/g, '').replace(/(igh|ie|ye)$/, 'y')
  if (w.length < 2) return w
  // A final silent e (fire, are, alone) is spelling, not sound.
  if (w.length >= 3 && /[^aeiouy]e$/.test(w)) w = w.slice(0, -1)
  const m = w.match(/[aeiouy]+[^aeiouy]*$/)
  return m ? w.slice(m.index) : w
}

const RHYME_WINDOW_LINES = 4

/** Line-final words that rhyme with another, different line-final word nearby. */
export function rhymingWords(doc: LyricsDoc): Set<number> {
  const finals: { word: number; line: number; norm: string; key: string }[] = []
  doc.lines.forEach((line, lineIndex) => {
    if (line.kind !== 'lyric') return
    for (let i = line.tokens.length - 1; i >= 0; i--) {
      const w = line.tokens[i].word
      if (w === null) continue
      const norm = doc.words[w].norm
      finals.push({ word: w, line: lineIndex, norm, key: rhymeKey(norm) })
      break
    }
  })
  const out = new Set<number>()
  for (let i = 0; i < finals.length; i++) {
    for (let j = i + 1; j < finals.length && finals[j].line - finals[i].line <= RHYME_WINDOW_LINES; j++) {
      const a = finals[i]
      const b = finals[j]
      if (a.norm === b.norm || !a.key) continue
      if (a.key === b.key || (a.norm.length >= 3 && b.norm.length >= 3 && a.norm.slice(-3) === b.norm.slice(-3))) {
        out.add(a.word)
        out.add(b.word)
      }
    }
  }
  return out
}

// --- Rule-based gap picking ---------------------------------------------------------------

export type RepeatRule = 'all' | 'first' | 'none'

export interface AutoPickOptions {
  targets: GapTarget[]
  /** Words always gapped (comma or newline separated), e.g. this week's vocabulary. */
  mustGap: string
  /** Words never gapped, e.g. names. */
  neverGap: string
  amountMode: 'percent' | 'count'
  /** Percent of all the song's words, or a number of gaps. */
  amount: number
  /** The first lyric lines stay complete, as a model for the class. */
  skipLines: number
  /** At least this many words between two gaps. */
  minDistance: number
  onePerLine: boolean
  /** Lines that repeat (the chorus): gap every time, only the first time, or never. */
  repeats: RepeatRule
  /** Always reach the amount: relax the rules above, one by one, when they leave too few words. */
  exact: boolean
  seed: number
}

export const DEFAULT_AUTO_PICK: AutoPickOptions = {
  targets: ['content'],
  mustGap: '',
  neverGap: '',
  amountMode: 'count',
  amount: 15,
  skipLines: 1,
  minDistance: 3,
  onePerLine: false,
  repeats: 'first',
  exact: true,
  seed: 1,
}

/** LyricsTraining-style levels: the share of the song's words that are gapped. */
export const LEVEL_PRESETS = [
  { id: 'beginner', percent: 10 },
  { id: 'intermediate', percent: 25 },
  { id: 'advanced', percent: 50 },
  { id: 'expert', percent: 100 },
] as const

export function parseWordList(text: string): Set<string> {
  return new Set(
    text
      .split(/[,;\n]/)
      .map((w) => normalizeWord(w.trim()))
      .filter(Boolean),
  )
}

/** Deterministic PRNG so the same seed always gives the same gaps. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffled<T>(items: T[], random: () => number): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function lineKey(doc: LyricsDoc, lineIndex: number): string {
  return doc.lines[lineIndex].tokens
    .filter((t) => t.word !== null)
    .map((t) => doc.words[t.word!].norm)
    .join(' ')
}

/** Lyric lines that may hold gaps under the skip and repeat rules. */
function eligibleLines(doc: LyricsDoc, options: AutoPickOptions): Set<number> {
  const counts = new Map<string, number>()
  doc.lines.forEach((line, i) => {
    if (line.kind === 'lyric') counts.set(lineKey(doc, i), (counts.get(lineKey(doc, i)) ?? 0) + 1)
  })
  const seen = new Set<string>()
  const out = new Set<number>()
  let lyricIndex = 0
  doc.lines.forEach((line, i) => {
    if (line.kind !== 'lyric') return
    const key = lineKey(doc, i)
    const repeated = (counts.get(key) ?? 0) > 1
    const firstTime = !seen.has(key)
    seen.add(key)
    const skipped = lyricIndex++ < options.skipLines
    if (skipped) return
    if (repeated && options.repeats === 'none') return
    if (repeated && options.repeats === 'first' && !firstTime) return
    out.add(i)
  })
  return out
}

export function targetGapCount(doc: LyricsDoc, options: Pick<AutoPickOptions, 'amountMode' | 'amount'>): number {
  const raw = options.amountMode === 'percent' ? Math.round((doc.words.length * options.amount) / 100) : options.amount
  return Math.max(0, Math.min(LYRICS_MAX_GAPS, Math.floor(raw)))
}

/** Rules the exact-count picker may relax, in the order it relaxes them. */
export type RelaxedRule = 'spacing' | 'onePerLine' | 'skipLines' | 'repeats' | 'wordTypes'

export interface AutoPickResult {
  gaps: number[]
  /** The number asked for (count, or the percentage resolved against the song). */
  target: number
  /** Rules loosened to reach the target, each listed once. */
  relaxed: RelaxedRule[]
}

/**
 * Relaxation ladder for exact counts, gentlest first: closer gaps, then more lines, then the
 * chorus, then no spacing at all, and only at the end other word types — that one changes
 * what the activity practises. Never-gap words and section labels are never relaxed.
 */
const RELAX_STEPS: { rule: RelaxedRule; apply: (o: AutoPickOptions) => AutoPickOptions }[] = [
  { rule: 'spacing', apply: (o) => ({ ...o, minDistance: Math.min(o.minDistance, 1) }) },
  { rule: 'onePerLine', apply: (o) => ({ ...o, onePerLine: false }) },
  { rule: 'skipLines', apply: (o) => ({ ...o, skipLines: 0 }) },
  { rule: 'repeats', apply: (o) => ({ ...o, repeats: 'all' }) },
  { rule: 'spacing', apply: (o) => ({ ...o, minDistance: 0 }) },
  { rule: 'wordTypes', apply: (o) => ({ ...o, targets: [...new Set<GapTarget>([...o.targets, 'content'])] }) },
  { rule: 'wordTypes', apply: (o) => ({ ...o, targets: ['all'] }) },
]

const sameRules = (a: AutoPickOptions, b: AutoPickOptions) =>
  a.minDistance === b.minDistance &&
  a.onePerLine === b.onePerLine &&
  a.skipLines === b.skipLines &&
  a.repeats === b.repeats &&
  a.targets.length === b.targets.length &&
  a.targets.every((t) => b.targets.includes(t))

/**
 * Picks gaps by rule (see pickOnce). With `exact` on and too few words left by the rules,
 * relaxes them step by step (RELAX_STEPS) until the target is reached or every gappable
 * word is used; the result says which rules were relaxed.
 *
 * With `phraseGaps` on, two picked neighbours would show as one phrase gap, so the picker
 * keeps picks apart and the count asked for is the count the worksheet shows. Phrase gaps
 * stay a deliberate choice (clicking neighbours, AI suggestions).
 */
export function autoPickGaps(doc: LyricsDoc, options: AutoPickOptions, phraseGaps = false): AutoPickResult {
  const target = targetGapCount(doc, options)
  let current = options
  let gaps = pickOnce(doc, current, phraseGaps)
  const relaxed: RelaxedRule[] = []
  if (!options.exact) return { gaps, target, relaxed }
  for (const step of RELAX_STEPS) {
    if (gaps.length >= target) break
    const next = step.apply(current)
    if (sameRules(next, current)) continue
    current = next
    gaps = pickOnce(doc, current, phraseGaps)
    if (!relaxed.includes(step.rule)) relaxed.push(step.rule)
  }
  return { gaps, target, relaxed }
}

/** Words that would join the next word into one phrase gap (same line, only spaces between). */
function joiningWords(doc: LyricsDoc): Set<number> {
  const out = new Set<number>()
  for (const line of doc.lines) {
    const t = line.tokens
    for (let k = 0; k + 2 < t.length; k++) {
      if (t[k].word !== null && t[k + 1].word === null && /^\s+$/.test(t[k + 1].text) && t[k + 2].word !== null) out.add(t[k].word!)
    }
  }
  return out
}

/**
 * One pass under fixed rules: must-gap words first, then a seeded random spread of words
 * in the chosen categories, keeping the minimum distance and the one-per-line rule (and,
 * with `keepApart`, never two picks that would merge into a phrase gap).
 */
function pickOnce(doc: LyricsDoc, options: AutoPickOptions, keepApart: boolean): number[] {
  const lines = eligibleLines(doc, options)
  const never = parseWordList(options.neverGap)
  const must = parseWordList(options.mustGap)
  const targets = new Set(options.targets)
  const rhymes = targets.has('rhymes') ? rhymingWords(doc) : new Set<number>()

  const inScope = (i: number) => lines.has(doc.words[i].line) && !never.has(doc.words[i].norm)
  const matches = (i: number) => {
    if (rhymes.has(i)) return true
    for (const t of wordTargets(doc.words[i].norm)) if (targets.has(t)) return true
    return false
  }

  const chosen: number[] = []
  const chosenSet = new Set<number>()
  const usedLines = new Set<number>()
  const joins = keepApart ? joiningWords(doc) : new Set<number>()
  const fits = (i: number) => {
    if (options.onePerLine && usedLines.has(doc.words[i].line)) return false
    if ((joins.has(i) && chosenSet.has(i + 1)) || (joins.has(i - 1) && chosenSet.has(i - 1))) return false
    return chosen.every((c) => Math.abs(c - i) > options.minDistance)
  }
  const take = (i: number) => {
    chosen.push(i)
    chosenSet.add(i)
    usedLines.add(doc.words[i].line)
  }

  // Must-gap words are the teacher's explicit targets: they ignore the count, not the spacing.
  doc.words.forEach((w, i) => {
    if (must.has(w.norm) && inScope(i) && fits(i) && chosen.length < LYRICS_MAX_GAPS) take(i)
  })

  const limit = Math.max(targetGapCount(doc, options), chosen.length)
  const pool = shuffled(
    doc.words.map((_, i) => i).filter((i) => inScope(i) && !must.has(doc.words[i].norm) && matches(i)),
    mulberry32(options.seed),
  )
  for (const i of pool) {
    if (chosen.length >= limit) break
    if (fits(i)) take(i)
  }
  return chosen.sort((a, b) => a - b)
}

// --- Gap groups ---------------------------------------------------------------------------

export interface GapGroup {
  /** 1-based, in reading order. */
  number: number
  words: number[]
  answer: string
}

/**
 * Gaps in reading order. With phrase gaps on, gapped words that stand next to each other on
 * one line (only spaces between) become one gap of up to LYRICS_PHRASE_MAX_WORDS words.
 */
export function buildGapGroups(doc: LyricsDoc, gaps: number[], phraseGaps: boolean): GapGroup[] {
  const set = new Set(gaps)
  const groups: GapGroup[] = []
  for (const line of doc.lines) {
    let current: number[] | null = null
    let joinable = false
    for (const token of line.tokens) {
      if (token.word === null) {
        joinable = !!current && /^\s+$/.test(token.text)
        if (!joinable) current = null
        continue
      }
      if (!set.has(token.word)) {
        current = null
        continue
      }
      if (phraseGaps && current && joinable && current.length < LYRICS_PHRASE_MAX_WORDS) {
        current.push(token.word)
      } else {
        current = [token.word]
        groups.push({ number: 0, words: current, answer: '' })
      }
      joinable = false
    }
  }
  return groups.map((g, i) => ({
    number: i + 1,
    words: g.words,
    answer: g.words.map((w) => doc.words[w].text).join(' '),
  }))
}

export type LineSegment = { kind: 'text'; text: string; word: number | null } | { kind: 'gap'; group: GapGroup }

/**
 * One lyric line as text runs and gaps: a phrase gap replaces its words and the spaces
 * between them. Every renderer (editor preview, class mode, print) draws from this.
 */
export function lineSegments(line: LyricsLine, groupByWord: Map<number, GapGroup>): LineSegment[] {
  const out: LineSegment[] = []
  const tokens = line.tokens
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    if (token.word === null) {
      const prev = tokens[i - 1]?.word
      const next = tokens[i + 1]?.word
      const inside =
        prev !== null && prev !== undefined && next !== null && next !== undefined && groupByWord.get(prev) !== undefined && groupByWord.get(prev) === groupByWord.get(next)
      if (!inside) out.push({ kind: 'text', text: token.text, word: null })
      continue
    }
    const group = groupByWord.get(token.word)
    if (!group) out.push({ kind: 'text', text: token.text, word: token.word })
    else if (group.words[0] === token.word) out.push({ kind: 'gap', group })
  }
  return out
}

export function groupsByWord(groups: GapGroup[]): Map<number, GapGroup> {
  const map = new Map<number, GapGroup>()
  for (const g of groups) for (const w of g.words) map.set(w, g)
  return map
}

/** Answer check for class mode: case, curly quotes and surrounding punctuation don't matter. */
export function answersMatch(given: string, expected: string): boolean {
  const clean = (s: string) =>
    normalizeWord(s)
      .replace(/[^\p{L}\p{N}' -]/gu, '')
      .replace(/\s+/g, ' ')
      .trim()
  return clean(given) !== '' && clean(given) === clean(expected)
}

// --- Distractors --------------------------------------------------------------------------

// Auxiliaries are confused within their family (were ↔ was/are), not across the whole class.
const SIBLING_SETS = [
  words('am is are was were be been being'),
  words('do does did done'),
  words('have has had having'),
  words('will would shall should can could may might must'),
  words("won't don't doesn't didn't can't couldn't wouldn't shouldn't isn't aren't wasn't weren't haven't hasn't hadn't ain't mustn't"),
  words('gonna wanna gotta'),
  PREPOSITIONS,
  DETERMINERS,
  PRONOUNS,
  CONJUNCTIONS,
]
const BASE_BY_FORM = new Map<string, string>()
for (const [base, [past, participle]] of Object.entries(IRREGULAR_VERBS)) {
  BASE_BY_FORM.set(past, base)
  BASE_BY_FORM.set(participle, base)
}

function matchCase(word: string, model: string): string {
  return model[0] && model[0] === model[0].toUpperCase() && model[0] !== model[0].toLowerCase()
    ? word[0].toUpperCase() + word.slice(1)
    : word
}

/**
 * Best-guess base of a regular -ed / -ing form: stopped → stop, dancing → dance,
 * smiled → smile, waiting → wait, opening → open. Heuristic, so only used for distractors.
 */
function regularBase(norm: string): string | null {
  const stem = norm.endsWith('ing') ? norm.slice(0, -3) : norm.endsWith('ed') ? norm.slice(0, -2) : null
  if (!stem || stem.length < 2) return null
  if (IRREGULAR_VERBS[stem] || stem === 'be') return stem
  if (norm.endsWith('ied')) return `${stem.slice(0, -1)}y`
  if (/([b-df-hj-np-tv-z])\1$/.test(stem) && !/(ll|ss|ff|zz)$/.test(stem)) return stem.slice(0, -1)
  if (stem.length === 2) return `${stem}e`
  if (IRREGULAR_VERBS[`${stem}e`]) return `${stem}e`
  if (/(v|z|c|dg|rg|hang|rang|leng|s)$/.test(stem) && !/ss$/.test(stem)) return `${stem}e`
  if (stem.length <= 4 && /[^aeiou][aeiou][^aeiouwxy]$/.test(stem) && !/(en|er|on)$/.test(stem)) return `${stem}e`
  return stem
}

/** Verb forms a learner might confuse with this one: base, past, participle, -ing. */
function verbForms(norm: string): string[] {
  const base = IRREGULAR_VERBS[norm] ? norm : (BASE_BY_FORM.get(norm) ?? regularBase(norm))
  if (!base) return []
  // One-syllable consonant-vowel-consonant verbs double the consonant: stop → stopped, run → running.
  const doubled = /^[^aeiou]*[aeiou][^aeiouwxy]$/.test(base) ? base + base.slice(-1) : base
  const ing = base.endsWith('e') && base !== 'be' && !base.endsWith('ee') ? `${base.slice(0, -1)}ing` : `${doubled}ing`
  const irregular = IRREGULAR_VERBS[base]
  const consonantY = /[^aeiou]y$/.test(base)
  const past = base.endsWith('e') ? `${base}d` : consonantY ? `${base.slice(0, -1)}ied` : `${doubled}ed`
  const third = /(s|sh|ch|x|z|o)$/.test(base) ? `${base}es` : consonantY ? `${base.slice(0, -1)}ies` : `${base}s`
  const forms = irregular ? [base, irregular[0], irregular[1], ing] : [base, past, ing, third]
  return [...new Set(forms)].filter((f) => f !== norm)
}

/**
 * Suggested wrong options for a multiple-choice gap: siblings from the same word class,
 * other forms of the same verb, or other answers of a similar length. Single-word answers
 * only; phrase gaps get other phrase answers.
 */
export function suggestDistractors(answer: string, otherAnswers: string[], count: number, seed: number): string[] {
  const norm = normalizeWord(answer)
  const random = mulberry32(seed)
  let pool: string[] = []
  const siblings = SIBLING_SETS.find((s) => s.has(norm))
  if (siblings) pool = shuffled([...siblings], random)
  else if (isPastForm(norm) || isIngForm(norm) || BASE_BY_FORM.has(norm) || IRREGULAR_VERBS[norm]) pool = verbForms(norm)
  const similar = shuffled(
    otherAnswers.filter((a) => Math.abs(a.length - answer.length) <= 3),
    random,
  )
  const seen = new Set([norm])
  const out: string[] = []
  for (const candidate of [...pool, ...similar, ...shuffled(otherAnswers, random)]) {
    const c = normalizeWord(candidate)
    if (seen.has(c)) continue
    seen.add(c)
    out.push(matchCase(candidate, answer))
    if (out.length >= count) break
  }
  return out
}

/**
 * The wrong options a multiple-choice gap shows: the teacher's (or AI's) own first, topped
 * up with automatic ones, so a gap never shows fewer than `choiceCount` options.
 */
export function effectiveDistractors(
  group: GapGroup,
  groups: GapGroup[],
  explicit: Record<string, string[]>,
  choiceCount: number,
  seed: number,
): string[] {
  const need = Math.max(0, choiceCount - 1)
  const own = (explicit[String(group.words[0])] ?? []).slice(0, need)
  if (own.length >= need) return own
  const taken = new Set([normalizeWord(group.answer), ...own.map(normalizeWord)])
  const others = groups.filter((g) => g !== group).map((g) => g.answer)
  const auto = suggestDistractors(group.answer, others, need + own.length, seed + group.words[0]).filter(
    (d) => !taken.has(normalizeWord(d)),
  )
  return [...own, ...auto].slice(0, need)
}

// --- Keeping gaps through lyric edits -----------------------------------------------------

/**
 * Maps word indices from an old tokenization to a new one with a longest-common-subsequence
 * alignment of the words, so adding a line at the top doesn't throw every gap away.
 */
export function remapWordIndices(oldWords: LyricsWord[], newWords: LyricsWord[]): Map<number, number> {
  const n = oldWords.length
  const m = newWords.length
  const map = new Map<number, number>()
  if (n === 0 || m === 0 || n * m > 4_000_000) return map
  const dp: Uint16Array[] = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1))
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = oldWords[i].norm === newWords[j].norm ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
    }
  }
  let i = 0
  let j = 0
  while (i < n && j < m) {
    if (oldWords[i].norm === newWords[j].norm) {
      map.set(i, j)
      i++
      j++
    } else if (dp[i + 1][j] >= dp[i][j + 1]) i++
    else j++
  }
  return map
}

// --- The saved activity -------------------------------------------------------------------

export type AnswerMode = 'write' | 'wordBank' | 'choice'
export type HintStyle = 'blank' | 'letters' | 'firstLetter'

export interface WorksheetOptions {
  answerMode: AnswerMode
  hintStyle: HintStyle
  numberGaps: boolean
  phraseGaps: boolean
  bankOrder: 'alphabetical' | 'shuffled'
  /** Extra wrong words for the word bank. */
  bankExtras: string
  /** Options per multiple-choice gap, the answer included. */
  choiceCount: number
  instructions: string
  beforeListening: string
  afterListening: string
  fontSize: 'normal' | 'large'
  answerKey: boolean
  showLink: boolean
}

export const DEFAULT_WORKSHEET: WorksheetOptions = {
  answerMode: 'write',
  hintStyle: 'blank',
  numberGaps: true,
  phraseGaps: true,
  bankOrder: 'alphabetical',
  bankExtras: '',
  choiceCount: 3,
  instructions: '',
  beforeListening: '',
  afterListening: '',
  fontSize: 'normal',
  answerKey: true,
  showLink: true,
}

export interface LyricsActivityContent {
  version: 1
  lyrics: string
  gaps: number[]
  /** Wrong options per multiple-choice gap, keyed by the gap's first word index. */
  distractors: Record<string, string[]>
  auto: AutoPickOptions
  sheet: WorksheetOptions
}

export interface LyricsActivityInput {
  title: string
  artist: string
  videoUrl: string
  content: LyricsActivityContent
}

export interface LyricsActivity extends LyricsActivityInput {
  id: string
  createdAt: string
  updatedAt: string
}

export interface LyricsActivitySummary {
  id: string
  title: string
  artist: string
  gapCount: number
  updatedAt: string
}

export interface LyricsGapSuggestion {
  /** Word indices to gap (several for a multi-word target such as a phrasal verb). */
  words: number[]
  distractors: string[]
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

function text(v: unknown, max: number, field: string): string {
  if (v === undefined || v === null) return ''
  if (typeof v !== 'string') throw new Error(`${field} must be a string`)
  if (v.length > max) throw new Error(`${field} is longer than ${max} characters`)
  return v
}

function oneOf<T extends string>(v: unknown, allowed: readonly T[], fallback: T): T {
  return typeof v === 'string' && (allowed as readonly string[]).includes(v) ? (v as T) : fallback
}

function int(v: unknown, min: number, max: number, fallback: number): number {
  return typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, Math.round(v))) : fallback
}

const bool = (v: unknown, fallback: boolean) => (typeof v === 'boolean' ? v : fallback)

/** A YouTube video id from a watch, share, shorts or embed link, or null. */
export function youTubeId(url: string): string | null {
  const m = url
    .trim()
    .match(/^(?:https?:\/\/)?(?:www\.|m\.|music\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/i)
  return m ? m[1] : null
}

/**
 * Validates and normalizes an activity from the client (throws Error with a message on bad
 * input). Unknown option values fall back to defaults; gaps must point at real words.
 */
export function sanitizeLyricsActivity(raw: unknown): LyricsActivityInput {
  if (!isRecord(raw)) throw new Error('Body must be an object')
  const title = text(raw.title, LYRICS_TITLE_MAX_LENGTH, 'title').trim()
  if (!title) throw new Error('title is required')
  const artist = text(raw.artist, LYRICS_ARTIST_MAX_LENGTH, 'artist').trim()
  const videoUrl = text(raw.videoUrl, LYRICS_URL_MAX_LENGTH, 'videoUrl').trim()
  if (videoUrl && !/^https?:\/\//i.test(videoUrl)) throw new Error('videoUrl must be an http(s) link')

  const c = isRecord(raw.content) ? raw.content : {}
  const lyrics = text(c.lyrics, LYRICS_MAX_LENGTH, 'lyrics')
  const doc = tokenizeLyrics(lyrics)

  if (!Array.isArray(c.gaps ?? [])) throw new Error('gaps must be an array')
  const gaps = [...new Set(((c.gaps ?? []) as unknown[]).filter((g): g is number => Number.isInteger(g)))].sort((a, b) => a - b)
  if (gaps.some((g) => g < 0 || g >= doc.words.length)) throw new Error('gaps point outside the lyrics')
  if (gaps.length > LYRICS_MAX_GAPS) throw new Error(`At most ${LYRICS_MAX_GAPS} gaps`)

  const distractors: Record<string, string[]> = {}
  if (isRecord(c.distractors)) {
    const gapSet = new Set(gaps)
    for (const [key, list] of Object.entries(c.distractors)) {
      if (!gapSet.has(Number(key)) || !Array.isArray(list)) continue
      const clean = list
        .filter((d): d is string => typeof d === 'string')
        .map((d) => d.trim().slice(0, LYRICS_DISTRACTOR_MAX_LENGTH))
        .filter(Boolean)
        .slice(0, LYRICS_MAX_DISTRACTORS)
      if (clean.length) distractors[key] = clean
    }
  }

  const a = isRecord(c.auto) ? c.auto : {}
  const auto: AutoPickOptions = {
    targets: Array.isArray(a.targets)
      ? [...new Set(a.targets.filter((t): t is GapTarget => GAP_TARGETS.includes(t as GapTarget)))]
      : DEFAULT_AUTO_PICK.targets,
    mustGap: text(a.mustGap, LYRICS_WORD_LIST_MAX_LENGTH, 'mustGap'),
    neverGap: text(a.neverGap, LYRICS_WORD_LIST_MAX_LENGTH, 'neverGap'),
    amountMode: oneOf(a.amountMode, ['percent', 'count'] as const, DEFAULT_AUTO_PICK.amountMode),
    amount: int(a.amount, 0, LYRICS_MAX_GAPS, DEFAULT_AUTO_PICK.amount),
    skipLines: int(a.skipLines, 0, 20, DEFAULT_AUTO_PICK.skipLines),
    minDistance: int(a.minDistance, 0, 20, DEFAULT_AUTO_PICK.minDistance),
    onePerLine: bool(a.onePerLine, DEFAULT_AUTO_PICK.onePerLine),
    exact: bool(a.exact, DEFAULT_AUTO_PICK.exact),
    repeats: oneOf(a.repeats, ['all', 'first', 'none'] as const, DEFAULT_AUTO_PICK.repeats),
    seed: int(a.seed, 0, 2 ** 31 - 1, DEFAULT_AUTO_PICK.seed),
  }

  const s = isRecord(c.sheet) ? c.sheet : {}
  const d = DEFAULT_WORKSHEET
  const sheet: WorksheetOptions = {
    answerMode: oneOf(s.answerMode, ['write', 'wordBank', 'choice'] as const, d.answerMode),
    hintStyle: oneOf(s.hintStyle, ['blank', 'letters', 'firstLetter'] as const, d.hintStyle),
    numberGaps: bool(s.numberGaps, d.numberGaps),
    phraseGaps: bool(s.phraseGaps, d.phraseGaps),
    bankOrder: oneOf(s.bankOrder, ['alphabetical', 'shuffled'] as const, d.bankOrder),
    bankExtras: text(s.bankExtras, LYRICS_WORD_LIST_MAX_LENGTH, 'bankExtras'),
    choiceCount: int(s.choiceCount, 2, LYRICS_MAX_DISTRACTORS + 1, d.choiceCount),
    instructions: text(s.instructions, LYRICS_NOTE_MAX_LENGTH, 'instructions'),
    beforeListening: text(s.beforeListening, LYRICS_NOTE_MAX_LENGTH, 'beforeListening'),
    afterListening: text(s.afterListening, LYRICS_NOTE_MAX_LENGTH, 'afterListening'),
    fontSize: oneOf(s.fontSize, ['normal', 'large'] as const, d.fontSize),
    answerKey: bool(s.answerKey, d.answerKey),
    showLink: bool(s.showLink, d.showLink),
  }

  return { title, artist, videoUrl, content: { version: 1, lyrics, gaps, distractors, auto, sheet } }
}

/** The worksheet's default instruction line for each answer mode (worksheets are in English). */
export function defaultInstructions(mode: AnswerMode): string {
  switch (mode) {
    case 'wordBank':
      return 'Listen to the song and fill in the gaps with words from the box.'
    case 'choice':
      return 'Listen to the song and circle the word you hear.'
    default:
      return 'Listen to the song and fill in the missing words.'
  }
}

/** Word bank: the answers (once each) plus the extra words, alphabetical or shuffled. */
export function buildWordBank(groups: GapGroup[], sheet: WorksheetOptions, seed: number): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const w of [...groups.map((g) => g.answer), ...sheet.bankExtras.split(/[,;\n]/).map((x) => x.trim())]) {
    const key = normalizeWord(w)
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(w)
  }
  return sheet.bankOrder === 'alphabetical'
    ? out.sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }))
    : shuffled(out, mulberry32(seed + 7))
}

/** The options shown for a multiple-choice gap: answer plus distractors, in a stable shuffled order. */
export function choiceOptions(group: GapGroup, groups: GapGroup[], explicit: Record<string, string[]>, count: number, seed: number): string[] {
  const options = [group.answer, ...effectiveDistractors(group, groups, explicit, count, seed)]
  return shuffled(options, mulberry32(seed + group.words[0] * 31))
}

/** The gap as printed: a line, one underscore per letter, or the first letter then underscores. */
export function gapHint(answer: string, style: HintStyle): string {
  if (style === 'blank') return '_'.repeat(Math.max(8, Math.min(14, answer.length + 4)))
  return answer
    .split(' ')
    .map((w) =>
      [...w]
        .map((ch, i) => (/[\p{L}\p{N}]/u.test(ch) ? (style === 'firstLetter' && i === 0 ? ch : '_') : ch))
        .join(' '),
    )
    .join('   ')
}
