// Answer handling for Grammar Coach written practice, shared by the browser (checking)
// and api/_lib/groq.ts (validating a generated set). Pure functions; the only import is data.
import { IRREGULAR_VERBS } from './tenseEngine/irregulars.js'

/** Items per exercise type in one set. */
export const EXERCISES_PER_TYPE = 5

/** The gap marker in a form exercise's sentence. */
export const GAP = '___'

/** Most words a reported speech gap may hold: the verb form ("would have been working"), never a clause. */
const REPORTED_GAP_MAX_WORDS = 4

const SUBJECT_PRONOUNS = new Set(['i', 'you', 'he', 'she', 'it', 'we', 'they'])

/**
 * A reported speech gap answer that is a whole clause ("he was tired", "if I liked coffee")
 * rather than the part that changes (the verb form, if / whether, a time word): the learner
 * can't work it out from the item.
 */
export function isClauseGap(answer: string): boolean {
  const words = normalizeAnswer(answer).split(' ').filter(Boolean)
  return (
    words.length > REPORTED_GAP_MAX_WORDS ||
    words.some((w) => SUBJECT_PRONOUNS.has(w)) ||
    (['if', 'whether'].includes(words[0]) && words.length > 1)
  )
}

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
    // "She 's cooking": a gap filled with "'s cooking". Only contraction endings: an opening
    // quotation mark ("said, 'I like…") must not glue itself to the word before.
    .replace(/\s+'(?=(?:s|d|m|re|ve|ll)\b)/g, "'")
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

/** A cue without brackets of its own: some generated cues are stored as "(be)", which showed as "((be))". */
export function bareCue(cue: string): string {
  return cue.trim().replace(/^\((.*)\)$/, '$1').trim()
}

/**
 * Whether filling the gap with this answer doubles the word right after it, e.g. "weren't"
 * in "They ___ not happy." or "has to" in "He ___ to study more.".
 */
export function doublesAtGap(sentence: string, answer: string): boolean {
  const [, after = ''] = sentence.split(GAP)
  const fill = answerWords(normalizeAnswer(answer))
  const next = answerWords(normalizeAnswer(after.replace(/^\s*\([^)]*\)/, '')))[0]
  return fill.length > 0 && next !== undefined && fill[fill.length - 1] === next
}

/** "(cue)" anywhere in the text, ignoring case and spacing inside the brackets. */
function bracketOf(text: string, cue: string): RegExpMatchArray | null {
  const words = cue.trim().split(/\s+/).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  return words[0] ? text.match(new RegExp(`\\s*\\(\\s*${words.join('\\s+')}\\s*\\)`, 'i')) : null
}

/**
 * A form item's sentence split at the gap, with the cue to show in brackets after it. When
 * the sentence already has a bracket right after the gap ("___ (not / watch) TV"), that one
 * is the cue; the cue written in brackets elsewhere in the sentence is dropped there. Either
 * way it is shown once.
 */
export function gapParts(sentence: string, storedCue: string): { before: string; cue: string; after: string } {
  const cue = bareCue(storedCue)
  const [before, rest = ''] = sentence.split(GAP)
  const inline = rest.match(/^\s*\(([^)]*)\)/)
  if (inline) return { before, cue: inline[1].trim(), after: rest.slice(inline[0].length) }
  const strip = (part: string) => {
    const dup = bracketOf(part, cue)
    return dup?.index === undefined ? part : part.slice(0, dup.index) + part.slice(dup.index + dup[0].length)
  }
  return { before: strip(before), cue, after: strip(rest) }
}

/** Time and place words that shift in reported speech. */
const DEICTIC_WORDS = new Set(
  'here there this that these those now then today tonight tomorrow yesterday ago before after earlier later next following previous the day night morning week month year'.split(' '),
)

/**
 * A reported speech gap answer made only of time or place words ("there", "the next day"):
 * whether they change depends on where and when the words are reported, which the item can't show.
 */
export function isDeicticGap(answer: string): boolean {
  const words = normalizeAnswer(answer).split(' ').filter(Boolean)
  return words.length > 0 && words.every((w) => DEICTIC_WORDS.has(w))
}

/** Closed-class words: when one is both the cue and the only answer, the bracket is the solution. */
const FUNCTION_CUE_WORDS = new Set(
  (
    "i me my mine myself you your yours yourself he him his himself she her hers herself it its itself we us our ours ourselves they them their theirs themselves " +
    "a an the this that these those some any much many few little no every each all both either neither " +
    "am is are was were be will would shall should can could may might must ought need to not " +
    "in on at by for from with of into onto under over between since ago " +
    "and but or so because although though while if unless when until whether"
  ).split(' '),
)

/** Auxiliaries that are also main verbs ("do my homework", "have a car"): only a give-away in a question. */
const AUX_OR_MAIN_VERBS = new Set(['do', 'does', 'did', 'have', 'has', 'had'])

/**
 * Whether a form item's cue already is its answer, so the learner has nothing to work out:
 * "He is reading ___ book. (his)", "___ you like tea? (do)", "She ___ (must) call her mother."
 * A verb or adjective left in its base form ("They ___ (play) every Sunday." → "play") is a
 * real choice and passes, and so does a cue listing options ("do / does").
 */
export function cueGivesAnswer(sentence: string, cue: string, answers: string[]): boolean {
  const bare = normalizeAnswer(bareCue(cue))
  if (!bare || bare.includes('/') || !answers.every((a) => normalizeAnswer(a) === bare)) return false
  const words = bare.split(' ')
  if (words.every((w) => AUX_OR_MAIN_VERBS.has(w))) return /\?\s*$/.test(sentence)
  return words.every((w) => FUNCTION_CUE_WORDS.has(w) || AUX_OR_MAIN_VERBS.has(w))
}

/** Each possessive determiner with the pronouns that name the same owner again. */
const SAME_OWNER: Record<string, string> = {
  my: 'mine|me',
  your: 'yours|you',
  his: 'his|him',
  her: 'hers|her',
  its: 'its|it',
  our: 'ours|us',
  their: 'theirs|them',
}

/**
 * A rewrite that names the same owner twice — "My book is mine.", "His house belongs to
 * him." — says nothing a learner would ever say, so it can't be a model answer.
 */
export function repeatsOwner(sentence: string): boolean {
  return Object.entries(SAME_OWNER).some(([det, again]) =>
    new RegExp(`\\b${det}\\s+(?:[a-z'-]+\\s+){1,3}(?:is|are|was|were|belongs?\\s+to|belonged\\s+to)\\s+(?:${again})\\b`, 'i').test(sentence),
  )
}

/** Words any rewrite may add without being told: auxiliaries, modals, pronouns, articles, linkers. */
const FREE_WORDS = new Set(
  (
    "a an the am is are was were be been being do does did done have has had having got will would shall should can could may might must ought to not no " +
    "i me my mine you your yours he him his she her hers it its we us our ours they them their theirs myself yourself himself herself itself ourselves themselves " +
    "this that these those there here who whom whose which what where when why how if unless whether than as so and but or because since although though while until then by of for with 's 'd"
  ).split(' '),
)

/** Past and participle forms of common irregular verbs → base form ("eaten" → "eat"). */
const IRREGULAR_BASE: Record<string, string> = Object.fromEntries(
  Object.entries(IRREGULAR_VERBS).flatMap(([base, forms]) => forms.map((f) => [f, base])),
)

/** Rough word root, so "watching", "watched" and "watch" (or "ate" and "eaten") count as one word. */
function root(word: string): string {
  const base = IRREGULAR_BASE[word] ?? word
  const cut = base.replace(/ie[sd]$/, 'y').replace(/(ing|ed|es|s|er|est|ly)$/, '')
  // "doing" → "do", but "is" stays "is".
  return (cut.length >= (/(ing|ed)$/.test(base) ? 2 : 3) ? cut : base).replace(/e$/, '').replace(/([^aeiou])\1$/, '$1')
}

/** Same root, or one a longer form of the other ("remember" → "rememb", "remembered" → "remember"). */
function sameRoot(a: string, b: string): boolean {
  const [short, long] = a.length <= b.length ? [a, b] : [b, a]
  return short === long || (short.length >= 3 && long.startsWith(short))
}

function contentWords(text: string): string[] {
  const plain = normalizeAnswer(text)
    .replace(/[^a-z0-9' ]/g, ' ')
    // Quotation marks around direct speech aren't part of any word; apostrophes inside
    // words (don't, I'm) and contraction endings ('s, 're) are.
    .replace(/(^|\s)'(?!(?:s|d|m|re|ve|ll|t)\b)/g, '$1')
    .replace(/'(?=\s|$)/g, '')
  return answerWords(plain.replace(/\s+/g, ' ').trim())
}

/** The source quotes direct speech: "Tom said, 'I am tired.'" or "'I am tired,' Tom said." */
function quotesDirectSpeech(source: string): boolean {
  return /(^|[,:]\s*)['"‘“]\S/.test(source.trim())
}

/** Reported speech changes time words (tomorrow → the next day): the learner is taught these, so they are no hint. */
const TIME_SHIFT_WORDS = new Set('next following previous day night earlier'.split(' '))

/**
 * Words an answer needs that neither the source sentence nor the cue gives the learner, e.g.
 * "now" when "I watch TV at the moment." expects "I am watching TV now.". Grammar words
 * (FREE_WORDS) and numbers don't count. Neighbouring words come as one phrase ("speak up"),
 * irregular verbs in their base form.
 */
export function missingWords(source: string, cue: string | undefined, answer: string): string[] {
  const words = contentWords(answer)
  const phrases = runs(words, isMissing(source, cue)).map(([start, end]) => words.slice(start, end).map((w) => IRREGULAR_BASE[w] ?? w).join(' '))
  return [...new Set(phrases)]
}

function isMissing(source: string, cue: string | undefined): (word: string) => boolean {
  const given = contentWords(`${source} ${cue ?? ''}`).map(root)
  const reporting = quotesDirectSpeech(source)
  return (w) =>
    !FREE_WORDS.has(w) && !(reporting && TIME_SHIFT_WORDS.has(w)) && !/^\d/.test(w) && !given.some((g) => sameRoot(g, root(w)))
}

/** [start, end) of each run of neighbouring words that pass the test. */
function runs(words: string[], test: (word: string) => boolean): [number, number][] {
  const found: [number, number][] = []
  words.forEach((w, i) => {
    if (!test(w)) return
    const last = found[found.length - 1]
    if (last && last[1] === i) last[1] = i + 1
    else found.push([i, i + 1])
  })
  return found
}

/**
 * The answer with the source's own wording put back, when the answer swapped exactly one
 * phrase of it for a new one in the same place ("at the moment" → "now"); null otherwise.
 */
function keptWording(source: string, cue: string | undefined, answer: string): string | null {
  const src = contentWords(source)
  const ans = contentWords(answer)
  const answerRoots = ans.map(root)
  const missing = runs(ans, isMissing(source, cue))
  const dropped = runs(src, (w) => !answerRoots.some((a) => sameRoot(a, root(w))))
  if (missing.length !== 1 || dropped.length !== 1) return null
  const [[ms, me], [ds, de]] = [missing[0], dropped[0]]
  // Same place: the same word (or the sentence start) right before both.
  if ((ms > 0 ? root(ans[ms - 1]) : '') !== (ds > 0 ? root(src[ds - 1]) : '')) return null
  return [...ans.slice(0, ms), ...src.slice(ds, de), ...ans.slice(me)].join(' ')
}

/**
 * Every answer a transform item accepts: the listed ones, plus each with the source's wording
 * kept where the answer swapped a phrase the task never asked to change, so "I'm watching TV
 * at the moment." counts for "I watch TV at the moment." → "I am watching TV now.".
 */
export function transformAnswers(item: { source: string; cue?: string; answers: string[] }): string[] {
  const withThat = [...item.answers, ...item.answers.flatMap(thatVariants)]
  const listed = [...withThat, ...withThat.flatMap((a) => placeKeptVariant(item.source, a))]
  const kept = listed.map((a) => keptWording(item.source, item.cue, a)).filter((a): a is string => a !== null)
  return [...listed, ...kept]
}

/** "that" right after a reporting verb (and its listener) is the linking word, not "this" shifted. */
const LINKING_THAT = /\b(?:said|says|told|tells|explained|added|replied|answered|promised|admitted)(?:\s+[a-z]+)?\s+$/i

/**
 * Reported speech changes here → there and this → that only when the words are reported
 * somewhere else, which an exercise can't show: when the direct speech has "here", "this" or
 * "these", the answer with them kept counts too ("Jane said she liked this book.").
 */
function placeKeptVariant(source: string, answer: string): string[] {
  if (!quotesDirectSpeech(source)) return []
  const has = (w: string) => new RegExp(`\\b${w}\\b`, 'i').test(source)
  let kept = answer
  if (has('here')) kept = kept.replace(/\bthere\b/gi, 'here')
  if (has('these')) kept = kept.replace(/\bthose\b/gi, 'these')
  if (has('this')) kept = kept.replace(/\bthat\b/gi, (word, offset: number) => (LINKING_THAT.test(kept.slice(0, offset)) ? word : 'this'))
  return kept === answer ? [] : [kept]
}

const SAY_TELL = String.raw`\b(said|says|told (?:me|you|him|her|us|them))`

/** "that" after say / tell + person is optional: "Mark said (that) he had been waiting." */
function thatVariants(answer: string): string[] {
  const without = answer.replace(new RegExp(`${SAY_TELL}\\s+that\\s+(?=(?:i|you|he|she|it|we|they)\\b)`, 'i'), '$1 ')
  const withThat = answer.replace(new RegExp(`${SAY_TELL}\\s+(?=(?:i|you|he|she|it|we|they)\\b)`, 'i'), '$1 that ')
  return [without, withThat].filter((v) => v !== answer)
}

/**
 * The learner ended the sentence with "?" where the answer is a statement, or the other way
 * round: "She asked if I was coming?" is the classic reported question mistake. No final
 * mark at all is not counted.
 */
export function questionMarkMismatch(input: string, answers: string[]): boolean {
  const mark = input.trim().match(/[.!?]$/)?.[0]
  if (!mark || answers.length === 0) return false
  return answers.every((a) => /\?$/.test(a.trim()) !== (mark === '?'))
}

/**
 * The hint to show in brackets after a transform item's source, or undefined for none. It
 * isn't repeated when the source already has it in brackets, and it gains the words the
 * answer needs that the learner couldn't otherwise know (see missingWords), so every listed
 * answer follows from what is on the screen.
 */
export function transformCue(item: { source: string; cue?: string; answers: string[] }): string | undefined {
  const cue = item.cue && bareCue(item.cue)
  const shown = cue && !bracketOf(item.source, cue) ? cue : undefined
  const missing = item.answers
    .map((a) => missingWords(item.source, cue, a))
    .reduce<string[] | null>((best, m) => (best === null || m.length < best.length ? m : best), null)
  const hint = [shown, ...(missing ?? [])].filter(Boolean).join(' / ')
  return hint || undefined
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
