// Automatic checks for a listening task against the publication criteria
// (src/data/examTaskCriteria.ts). Hard counts (word count, item count, syllable gaps, word
// limits) fail outright; language judgements a regex can only guess at (single clause, proper
// nouns, calling words) are flagged for the teacher to confirm. Test mode covers the rest.

import { CRITERIA_BY_ID } from '../data/examTaskCriteria'
import {
  levelSpec,
  looksEnvironmental,
  noteChain,
  standardInstruction,
  type ExamField,
  type ListeningTaskContent,
  type TaskLevel,
} from './examTasks'
import { countWords, isFigure, normWord, parseScript, syllableCount, type MarkerSpan, type ParsedScript } from './listeningScript'

export type FindingStatus = 'fail' | 'warn'

export interface Finding {
  criterionId: string
  status: FindingStatus
  itemId?: string
  detail: { en: string; hu: string }
}

export interface ItemDistance {
  id: string
  marker: MarkerSpan | null
  /** Syllables between the previous answer's end (the script start for the first item) and this answer. */
  gapSyllables: number | null
  gapWords: number | null
}

export interface CheckReport {
  findings: Finding[]
  distances: ItemDistance[]
  script: ParsedScript
  stats: {
    words: number
    sentences: number
    avgSentence: number
    figures: number
    names: string[]
    trueCount?: number
    falseCount?: number
    numericItems?: string[]
  }
  /** Automatic criteria with no finding. */
  passed: string[]
}

const MIN_GAP_SYLLABLES = 15

export const FUNCTION_WORDS = new Set(
  'a an the of to in on at by for with as from into onto about and or but nor is are was were be been being its it their his her this that these those they he she we you i our your my me him them us has have had do does did will would can could should may might must not no so than then there here up out per via its also'.split(' '),
)

const NUMBER_WORDS = new Set(
  'one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty thirty forty fifty sixty seventy eighty ninety hundred thousand million billion half quarter third percent dozen'.split(' '),
)

/** Capitalised, but not people, places or organisations. */
const CALENDAR_WORDS = new Set(
  'january february march april may june july august september october november december monday tuesday wednesday thursday friday saturday sunday mr mrs ms dr professor'.split(' '),
)

function words(text: string): string[] {
  return text.split(/\s+/).map(normWord).filter(Boolean)
}

function isNumeric(answer: string): boolean {
  const w = words(answer)
  return w.some((x) => isFigure(x) || NUMBER_WORDS.has(x))
}

/** Rough stem for "same root" and inflection matching: first 5 letters, or the whole short word. */
/** Common irregular verb forms → base, so "paid" in a note matches "paying" in the script. */
const IRREGULAR: Record<string, string> = {
  paid: 'pay', said: 'say', made: 'make', bought: 'buy', brought: 'bring', thought: 'think', taught: 'teach', caught: 'catch',
  found: 'find', built: 'build', spent: 'spend', sent: 'send', lent: 'lend', kept: 'keep', left: 'leave', felt: 'feel',
  held: 'hold', told: 'tell', sold: 'sell', went: 'go', gone: 'go', came: 'come', gave: 'give', given: 'give', took: 'take',
  taken: 'take', grew: 'grow', grown: 'grow', rose: 'rise', risen: 'rise', fell: 'fall', fallen: 'fall', began: 'begin',
  begun: 'begin', ran: 'run', won: 'win', lost: 'lose', met: 'meet', led: 'lead', saw: 'see', seen: 'see', knew: 'know',
  known: 'know', wrote: 'write', written: 'write', drove: 'drive', driven: 'drive', chose: 'choose', chosen: 'choose',
}

export function stem(w: string): string {
  const base = IRREGULAR[w] ?? w
  const s = base.replace(/(ies|es|s|ed|ing|ly)$/, '')
  return (s.length >= 3 ? s : base).slice(0, 5)
}

function figureKind(w: string): 'percent' | 'year' | 'number' {
  if (w.endsWith('%')) return 'percent'
  if (/^(1[1-9]|20)\d\d$/.test(w)) return 'year'
  return 'number'
}

function sortIds(ids: string[]): string[] {
  return [...ids].sort((a, b) => Number(a) - Number(b))
}

function msg(en: string, hu: string) {
  return { en, hu }
}

export function checkListeningTask(content: ListeningTaskContent, level: TaskLevel, field?: ExamField): CheckReport {
  const spec = levelSpec(level, content.format, field)
  const script = parseScript(content.script)
  const findings: Finding[] = []
  const add = (criterionId: string, status: FindingStatus, detail: { en: string; hu: string }, itemId?: string) => {
    // A blocker criterion's heuristic flag is still only a warning.
    findings.push({ criterionId, status, detail, ...(itemId !== undefined ? { itemId } : {}) })
  }
  const W = script.words
  const isTf = content.format === 'true-false'

  // Items and their markers
  const ids = sortIds(isTf ? (content.statements ?? []).map((s) => s.id) : (content.answers ?? []).map((a) => a.id))
  const live = ids.filter((id) => id !== '0')
  const markerOf = new Map(script.markers.map((m) => [m.id, m]))

  for (const e of script.errors) add('answerMarked', 'fail', msg(e, e))

  // The recording script is read aloud as it stands: no stage directions, notes or item numbers.
  const direction = script.paragraphs.find((p) => /^\s*[([].*[)\]]\s*$/s.test(p.replace(/^[^:\n]{1,30}:\s*/, '')))
  if (direction) add('cleanScript', 'fail', msg(`"${direction.slice(0, 60)}…" would be read aloud: remove stage directions.`, `„${direction.slice(0, 60)}…” is elhangzana: töröld a szerzői utasításokat.`))
  const spokenNumber = script.clean.match(/\(\s*\d{1,2}\s*\)|\*\*/)
  if (spokenNumber) add('cleanScript', 'fail', msg(`"${spokenNumber[0]}" would be read aloud.`, `A(z) „${spokenNumber[0]}” is elhangzana.`))

  // A. Audioscript
  const wordTotal = W.length
  if (wordTotal < spec.wordsMin || wordTotal > spec.wordsMax) {
    add('wordCount', 'fail', msg(`${wordTotal} words; the band is ${spec.wordsMin}–${spec.wordsMax}.`, `${wordTotal} szó; a sáv ${spec.wordsMin}–${spec.wordsMax}.`))
  }
  if (live.length) {
    const perItem = Math.round(wordTotal / live.length)
    const [lo, hi] = isTf ? [55, 66] : [30, 40]
    if (perItem > hi) add('infoLoad', 'warn', msg(`About ${perItem} words per item (target ${lo}–${hi - (isTf ? 6 : 5)}).`, `Kb. ${perItem} szó itemenként (cél ${lo}–${hi - (isTf ? 6 : 5)}).`))
  }
  const figureWords = W.filter((w) => isFigure(w.text))
  // Spelled-out numbers count once per run ("two hundred and fifty").
  let spelledRuns = 0
  W.forEach((w, i) => {
    if (NUMBER_WORDS.has(w.norm) && !['half', 'quarter', 'third'].includes(w.norm) && !(i > 0 && (NUMBER_WORDS.has(W[i - 1].norm) || W[i - 1].norm === 'and'))) spelledRuns++
  })
  const figures = figureWords.length + spelledRuns
  if (figures > 6) add('figures', 'warn', msg(`${figures} figures in the script (aim for 6 or fewer).`, `${figures} szám a szövegben (legfeljebb kb. 6 legyen).`))

  // Names: capitalised words that aren't sentence-initial, runs counted once.
  const names = new Set<string>()
  W.forEach((w, i) => {
    const capital = /^\p{Lu}/u.test(w.text) && !/^[A-Z]{2,5}s?$/.test(w.text) && w.norm !== 'i' && !CALENDAR_WORDS.has(w.norm)
    const initial = i === 0 || W[i - 1].sentence !== w.sentence
    if (!capital || initial) return
    if (i > 0 && /^\p{Lu}/u.test(W[i - 1].text) && W[i - 1].sentence === w.sentence) return
    let name = w.text
    for (let j = i + 1; j < W.length && /^\p{Lu}/u.test(W[j].text) && W[j].sentence === w.sentence; j++) name += ` ${W[j].text}`
    names.add(name)
  })
  if (names.size > spec.maxNames) {
    add('namedEntities', 'warn', msg(`${names.size} names (${[...names].slice(0, 10).join(', ')}); at most ${spec.maxNames} at ${level}.`, `${names.size} név (${[...names].slice(0, 10).join(', ')}); ${level} szinten legfeljebb ${spec.maxNames}.`))
  }

  const sentenceLengths = new Map<number, number>()
  for (const w of W) sentenceLengths.set(w.sentence, (sentenceLengths.get(w.sentence) ?? 0) + 1)
  const lengths = [...sentenceLengths.values()]
  const avgSentence = lengths.length ? Math.round((wordTotal / lengths.length) * 10) / 10 : 0
  const [avgLo, avgHi] = spec.sentenceAvg
  if (avgSentence > avgHi + 2) add('sentenceLength', 'warn', msg(`Average sentence ${avgSentence} words (${avgLo}–${avgHi} at ${level}).`, `Átlagos mondathossz ${avgSentence} szó (${level}: ${avgLo}–${avgHi}).`))
  const longest = Math.max(0, ...lengths)
  if (longest > 35) add('sentenceLength', 'warn', msg(`The longest sentence has ${longest} words (keep under about 35).`, `A leghosszabb mondat ${longest} szó (kb. 35 alatt legyen).`))

  // B. Markers, order, spacing
  const distances: ItemDistance[] = []
  let prevEnd = 0
  let prevStart = -1
  // Spacing is measured along every marked answer, the example's too, even if its row is missing.
  const chain = sortIds([...new Set([...ids, ...script.markers.map((m) => m.id)])])
  for (const id of chain) {
    const m = markerOf.get(id) ?? null
    if (!m) {
      add('answerMarked', 'fail', msg(`Item ${id} has no [[${id}|…]] marker in the script.`, `A(z) ${id}. itemnek nincs [[${id}|…]] jelölése a szövegben.`), id)
      distances.push({ id, marker: null, gapSyllables: null, gapWords: null })
      continue
    }
    if (m.start < prevStart) add('chronological', 'fail', msg(`Item ${id} is spoken before the item above it.`, `A(z) ${id}. item a fölötte lévő előtt hangzik el.`), id)
    const gapWords = Math.max(0, m.start - prevEnd)
    const gapSyllables = W.slice(prevEnd, m.start).reduce((s, w) => s + w.syllables, 0)
    distances.push({ id, marker: m, gapSyllables, gapWords })
    if (gapSyllables < MIN_GAP_SYLLABLES && m.start >= prevEnd) {
      const from = id === chain[0] ?msg('the start of the recording', 'a felvétel eleje') : msg('the previous answer', 'az előző válasz')
      add('syllableGap', 'fail', msg(`${gapSyllables} syllables from ${from.en} (at least ${MIN_GAP_SYLLABLES}).`, `${gapSyllables} szótag ${from.hu} óta (legalább ${MIN_GAP_SYLLABLES}).`), id)
    }
    if (gapWords > 80 && id !== chain[0]) add('evenDistribution', 'warn', msg(`${gapWords} words with no item before item ${id}.`, `${gapWords} szó item nélkül a(z) ${id}. item előtt.`), id)
    prevEnd = Math.max(prevEnd, m.end)
    prevStart = m.start
  }
  const extra = script.markers.filter((m) => !ids.includes(m.id))
  for (const m of extra) add('answerMarked', 'warn', msg(`Marker (${m.id}) has no item.`, `A(z) (${m.id}) jelölés nem tartozik itemhez.`))

  const m0 = markerOf.get('0')
  const m1 = markerOf.get(live[0] ?? '')
  if (m0 && m1 && m1.start - m0.end < 20) {
    add('firstItemEarly', 'warn', msg(`Only ${m1.start - m0.end} words between the example and item ${live[0]}.`, `Csak ${m1.start - m0.end} szó a példa és a(z) ${live[0]}. item között.`), live[0])
  }
  if (!ids.includes('0')) add('exampleRow', 'warn', msg('There is no example row (0).', 'Nincs példasor (0).'))

  // E. Item count
  if (live.length !== spec.items) {
    add('itemCount', 'fail', msg(`${live.length} live items; ${level} ${isTf ? 'true/false' : 'notes'} needs ${spec.items} plus the example.`, `${live.length} item; ${level} ${isTf ? 'igaz/hamis' : 'jegyzet'} feladathoz ${spec.items} + példa kell.`))
  }

  // F. Instruction
  const expected = standardInstruction(content.format, content.topic, level, field)
  // A dialogue may say "Listen to the conversation/interview/discussion" where the standard has "text".
  const normalise = (s: string) =>
    s
      .toLowerCase()
      .replace(/[’']/g, "'")
      .replace(/^listen to the (conversation|interview|discussion|dialogue)\b/, 'listen to the text')
      .replace(/\s+/g, ' ')
      .trim()
  if (normalise(content.instructions) !== normalise(expected)) {
    add('instructionWording', 'fail', msg('The instruction differs from the standard sentence.', 'Az utasítás eltér a szabványos mondattól.'))
  }

  const stats: CheckReport['stats'] = { words: wordTotal, sentences: lengths.length, avgSentence, figures, names: [...names] }

  if (isTf) checkTrueFalse(content, script, add, stats)
  else checkNotes(content, script, spec, markerOf, add, stats)

  const failed = new Set(findings.map((f) => f.criterionId))
  const passed = [...CRITERIA_BY_ID.values()].filter((c) => c.auto && c.formats.includes(content.format) && !failed.has(c.id)).map((c) => c.id)
  return { findings, distances, script, stats, passed }
}

type Add = (criterionId: string, status: FindingStatus, detail: { en: string; hu: string }, itemId?: string) => void

const CLEAR_SUBORDINATORS = /\b(because|although|though|whereas|unless|which|who|whom|whose|whenever|so that|given that|even if|if|when|while|since)\b/i
/** Words that start a clause only sometimes ("before October" is fine, "before it rained" is not). */
const MAYBE_SUBORDINATORS = [
  /\b(after|before|until|once)\s+(?:\w+\s+){0,3}?(is|are|was|were|has|have|had|will|would|can|could|did|does|do|\w+ed)\b/i,
  /\b(said|says|claims?|believes?|thinks?|argues?|reports?|explains?|suggests?|shows?|found|finds|hopes?|warns?|admits?|agrees?|insists?|means?|so)\s+that\b/i,
  /\w\s+(where|whether)\b/i,
]
const UNIT_RE = /^(%|per|percent|cent|months?|weeks?|years?|days?|hours?|minutes?|seconds?|decades?|centuries|century|kilometres?|kilometers?|km|miles?|metres?|meters?|millimetres?|millimeters?|mm|centimetres?|cm|degrees?|tonnes?|tons?|kilograms?|kg|grams?|litres?|liters?|pounds?|euros?|dollars?|forints?)$/
const QUANTITY_PARAPHRASE = /\b(roughly|about|nearly|almost)?\s*(double|twice|triple|half|a third|a quarter|two-thirds|three-quarters)\b/i

/** Opposite pairs (both directions) for spotting direction-flip traps. */
const ANTONYMS = (() => {
  const pairs = `heavy light|heavier lighter|heaviest lightest|costly cheap|costly inexpensive|expensive cheap|expensive inexpensive|
increase decrease|increased decreased|increases decreases|increasing decreasing|rise fall|rises falls|rose fell|risen fallen|
more less|more fewer|higher lower|high low|highest lowest|most least|best worst|better worse|prevent cause|prevented caused|
prevents causes|agree disagree|agreed disagreed|agrees disagrees|support oppose|supported opposed|supports opposes|tighten loosen|
tightened loosened|tightened softened|accept reject|accepted rejected|allow ban|allowed banned|allow forbid|success failure|
successful unsuccessful|gain loss|gained lost|win lose|won lost|start stop|started stopped|open close|opened closed|early late|
earlier later|earliest latest|wet dry|wetter drier|hot cold|warm cool|warmer cooler|positive negative|strong weak|stronger weaker|
large small|larger smaller|largest smallest|big small|bigger smaller|biggest smallest|long short|longer shorter|fast slow|
faster slower|easy difficult|easier harder|safe dangerous|safer riskier|possible impossible|likely unlikely|always never|
include exclude|included excluded|firm soft|firmer softer|grow shrink|grew shrank|growing shrinking|expand shrink|expanded shrank|
rich poor|old new|older newer|older younger|cheaper dearer|popular unpopular|common rare|frequent rare|busiest quietest|
busy quiet|increase cut|raised lowered|raise lower|boost reduce|boosted reduced|improve worsen|improved worsened|benefit harm|
benefits harms|helped hurt|help hurt|before after|above below|inside outside|import export|imported exported|first last|
majority minority|public private|legal illegal|full empty|wealthier poorer|healthy unhealthy|welcome unwelcome`
  const map = new Map<string, Set<string>>()
  for (const pair of pairs.split('|')) {
    const [a, b] = pair.trim().split(' ')
    if (!a || !b) continue
    map.set(a, new Set([...(map.get(a) ?? []), b]))
    map.set(b, new Set([...(map.get(b) ?? []), a]))
  }
  return map
})()

function checkTrueFalse(content: ListeningTaskContent, script: ParsedScript, add: Add, stats: CheckReport['stats']) {
  const rows = content.statements ?? []
  const live = rows.filter((r) => r.id !== '0')
  const t = live.filter((r) => r.answer).length
  const f = live.length - t
  stats.trueCount = t
  stats.falseCount = f
  // Key profile of the official two-option T/F keys in the app (src/data/exams/papers: 11 listening
  // tasks, German érettségi + Zöld Út B1, analysed 2026-10-19): every task is within ±1 (4:3, 3:4,
  // 4:4, 5:4), the keys lean slightly true (42 T : 36 F; 7 of 8 odd-length tasks are 4T:3F), and the
  // longest run of identical answers is 4 (seen once; usually 3 or fewer).
  if (live.length && (t === 0 || f === 0)) add('balancedKey', 'fail', msg('Every live statement has the same answer.', 'Minden állítás válasza ugyanaz.'))
  else if (Math.abs(t - f) > 1 && live.length) {
    add('balancedKey', 'warn', msg(`Key is ${t}T:${f}F; official keys stay within one (4:3 or 3:4).`, `A kulcs ${t}I:${f}H; a hivatalos kulcsoknál legfeljebb 1 az eltérés (4:3 vagy 3:4).`))
  }
  const sequence = live.map((r) => (r.answer ? 'T' : 'F')).join('')
  const longestRun = Math.max(0, ...(sequence.match(/T+|F+/g) ?? []).map((run) => run.length))
  if (longestRun > 4) {
    add('balancedKey', 'warn', msg(`${longestRun} identical answers in a row (${sequence}); official keys have at most 4.`, `${longestRun} azonos válasz egymás után (${sequence}); a hivatalos kulcsokban legfeljebb 4.`))
  }

  const scriptNorm = script.words.map((w) => w.norm)
  const scriptFigures = new Set(script.words.filter((w) => isFigure(w.text)).map((w) => w.norm))
  const scriptJoined = ` ${scriptNorm.join(' ')} `
  let conjunctions = 0

  for (const row of rows) {
    const text = row.text.trim()
    if (!text) {
      add('itemCount', 'fail', msg(`Statement ${row.id} is empty.`, `A(z) ${row.id}. állítás üres.`), row.id)
      continue
    }
    const w = words(text)
    const clear = text.match(CLEAR_SUBORDINATORS)
    if (clear) add('singleClause', 'fail', msg(`"${clear[0]}" starts a second clause.`, `A(z) „${clear[0]}” második tagmondatot vezet be.`), row.id)
    else {
      const maybe = MAYBE_SUBORDINATORS.map((re) => text.match(re)).find(Boolean)
      if (maybe) add('singleClause', 'warn', msg(`Check "${maybe[0]}": is it a second clause?`, `Ellenőrizd: a(z) „${maybe[0]}” új tagmondat?`), row.id)
    }
    if (w.length < 8 || w.length > 14) add('statementLength', 'warn', msg(`${w.length} words (about 8–14).`, `${w.length} szó (kb. 8–14).`), row.id)
    if (/\bnot\b|n['’]t\b/i.test(text)) add('trapType', 'fail', msg('Uses a "not" negation.', '„not” tagadást használ.'), row.id)
    if (/\bboth\b[^.]*\band\b|\bas well as\b|\band also\b/i.test(text)) conjunctions++

    // Figures: same form and unit as spoken.
    const tokens = text.split(/\s+/).map(normWord)
    tokens.forEach((tok, i) => {
      if (!isFigure(tok)) return
      if (row.answer && !scriptFigures.has(tok)) {
        add('figuresAsSpoken', 'fail', msg(`"${tok}" is not said in this form in the script.`, `A(z) „${tok}” nem így hangzik el a szövegben.`), row.id)
      }
      const unit = tokens[i + 1]
      if (unit && UNIT_RE.test(unit) && !scriptJoined.includes(` ${unit} `) && !(unit === '%' || tok.endsWith('%'))) {
        add('figuresAsSpoken', 'fail', msg(`The unit "${unit}" is never used in the script.`, `A(z) „${unit}” mértékegység nem szerepel a szövegben.`), row.id)
      }
    })
    // A false statement using the opposite of a word spoken at its marker is a direction flip.
    const marker = script.markers.find((m) => m.id === row.id)
    if (!row.answer && marker) {
      const sentences = new Set(script.words.slice(marker.start, Math.max(marker.end, marker.start + 1)).map((x) => x.sentence))
      const spoken = new Set(script.words.filter((x) => sentences.has(x.sentence)).map((x) => x.norm))
      for (const word of w) {
        const opposite = [...(ANTONYMS.get(word) ?? [])].find((o) => spoken.has(o))
        if (opposite && !spoken.has(word)) {
          add('trapType', 'warn', msg(`"${word}" reverses "${opposite}" from the script: a direction flip?`, `A(z) „${word}” megfordítja a szöveg „${opposite}” szavát: irányfordítás?`), row.id)
          break
        }
      }
    }

    const para = text.match(QUANTITY_PARAPHRASE)
    if (para && para[2]) add('figuresAsSpoken', 'warn', msg(`"${para[0].trim()}" re-expresses a quantity.`, `A(z) „${para[0].trim()}” átfogalmaz egy mennyiséget.`), row.id)

    // Verbatim: a run of 5+ words shared with the script.
    const run = longestSharedRun(w, scriptNorm)
    if (run.length >= 5) add('notVerbatim', 'warn', msg(`Repeats "${run.join(' ')}" from the script.`, `Szó szerint ismétli: „${run.join(' ')}”.`), row.id)
  }
  if (conjunctions > 2) add('trapType', 'fail', msg(`${conjunctions} "both … and" statements (at most 2).`, `${conjunctions} „both … and” állítás (legfeljebb 2).`))
}

function longestSharedRun(a: string[], b: string[]): string[] {
  let best: string[] = []
  const index = new Map<string, number[]>()
  b.forEach((w, i) => index.set(w, [...(index.get(w) ?? []), i]))
  for (let i = 0; i < a.length; i++) {
    for (const j of index.get(a[i]) ?? []) {
      let k = 0
      while (i + k < a.length && j + k < b.length && a[i + k] === b[j + k]) k++
      if (k > best.length) best = a.slice(i, i + k)
    }
  }
  return best
}

function checkNotes(
  content: ListeningTaskContent,
  script: ParsedScript,
  spec: ReturnType<typeof levelSpec>,
  markerOf: Map<string, MarkerSpan>,
  add: Add,
  stats: CheckReport['stats'],
) {
  const W = script.words
  const answers = [...(content.answers ?? [])].sort((a, b) => Number(a.id) - Number(b.id))
  const lines = content.notes ?? []
  const limit = spec.answerWords ?? 3
  const numericItems: string[] = []
  const roots = new Map<string, string>()
  const live = answers.filter((a) => a.id !== '0')

  if (looksEnvironmental(script.clean)) {
    // The teacher may keep notes completion for an environment topic: a warning, not a blocker.
    add('environmentRule', 'warn', msg('The script looks like an environment topic, usually a True/False task. Keep notes only if it has enough technical, economic or agricultural content.', 'A szöveg környezetvédelmi témájúnak tűnik, ebből általában Igaz/Hamis feladat készül. Jegyzetfeladat akkor maradjon, ha elég benne a műszaki, gazdasági vagy mezőgazdasági tartalom.'))
  }

  for (const a of answers) {
    const accepted = a.accepted.map((v) => v.trim()).filter(Boolean)
    if (accepted.length === 0) {
      add('extractable', 'fail', msg(`Item ${a.id} has no answer in the key.`, `A(z) ${a.id}. itemnek nincs kulcsa.`), a.id)
      continue
    }
    // The form spoken at the marker may be any accepted variant (key "2022 / twenty twenty-two").
    const mk = markerOf.get(a.id)
    const markedWords = mk ? W.slice(mk.start, mk.end).map((w) => w.norm) : []
    const key = accepted.find((v) => indexOfRun(markedWords, words(v)) >= 0) ?? accepted[0]
    const keyWords = words(key)
    for (const v of a.accepted) {
      const n = countWords(v)
      if (n > limit) add('wordLimit', 'fail', msg(`"${v}" has ${n} words (limit ${limit}).`, `A(z) „${v}” ${n} szó (korlát: ${limit}).`), a.id)
    }
    if (isNumeric(key)) numericItems.push(a.id)

    const m = markerOf.get(a.id)
    if (m) {
      const span = W.slice(m.start, m.end).map((w) => w.norm)
      const at = indexOfRun(span, keyWords)
      if (at < 0) {
        const elsewhere = indexOfRun(W.map((w) => w.norm), keyWords)
        const stemmed = span.some((w) => keyWords.some((k) => stem(k) === stem(w)))
        if (elsewhere >= 0) add('keyEqualsScript', 'warn', msg(`"${key}" is spoken, but not inside the item's marker.`, `A(z) „${key}” elhangzik, de nem a jelölt helyen.`), a.id)
        else if (stemmed) add('keyEqualsScript', 'fail', msg(`The script says it in another form than "${key}".`, `A szövegben más alakban hangzik el, mint „${key}”.`), a.id)
        else add('extractable', 'fail', msg(`"${key}" is never spoken; the candidate would have to reconstruct it.`, `A(z) „${key}” nem hangzik el; a vizsgázónak ki kellene találnia.`), a.id)
      }
      // Proper noun: capitalised in the script where it is not sentence-initial.
      const first = at >= 0 ? W[m.start + at] : undefined
      if (first && /^\p{Lu}/u.test(first.text) && m.start + at > 0 && W[m.start + at - 1].sentence === first.sentence && !/^[A-Z]{2,5}s?$/.test(first.text)) {
        add('answerLimits', 'warn', msg(`"${key}" looks like a proper noun.`, `A(z) „${key}” tulajdonnévnek tűnik.`), a.id)
      }
    }
    for (const k of keyWords.filter((x) => !FUNCTION_WORDS.has(x) && !isFigure(x))) {
      const r = stem(k)
      const other = roots.get(r)
      if (other && other !== a.id) add('answerLimits', 'warn', msg(`Shares a word root with item ${other}.`, `Közös szótő a(z) ${other}. itemmel.`), a.id)
      else roots.set(r, a.id)
    }

    // The note line with this gap, under its heading and lead-in line (markup: examTasks.ts).
    const chain = noteChain(lines, a.id)
    const own = chain[chain.length - 1]
    if (!own) {
      add('telegraphic', 'fail', msg(`No note line has the gap {{${a.id}}}.`, `Egyik jegyzetsorban sincs {{${a.id}}} hiány.`), a.id)
      continue
    }
    // "(Give 1 example.)": every example spoken is a right answer, so the key lists them all.
    const asks = chain.map((l) => `${l.label ?? ''} ${l.text}`).join(' ').match(GIVE_RE)
    if (asks && /\b(1|one)\b/i.test(asks[0]) && accepted.length < 2) {
      add('acceptedVariants', 'warn', msg('The note asks for 1 example: list every example spoken in the script as an accepted answer.', 'A jegyzet 1 példát kér: a szövegben elhangzó összes példa kerüljön a kulcsba elfogadott válaszként.'), a.id)
    }
    // Only the words since the previous blank ("…harm to: {{9}}, or to their capacity for: {{10}}");
    // a label-table row reads its label cell, a heading drops its number ("3. {{7}} type").
    const cell = own.kind === 'row' ? `${own.label ?? ''} ${own.text}` : own.text
    const upTo = cell.slice(0, cell.indexOf(`{{${a.id}}}`))
    let before = upTo.slice(upTo.lastIndexOf('}}') + 1).replace(/^[\s},]+/, '').replace(GIVE_RE, ' ')
    if (own.kind === 'heading') before = before.replace(/^\s*\d{1,2}[.)]\s*/, '')
    const beforeWords = before.split(/\s+/).map(normWord).filter(Boolean)
    if (own.kind === 'row') {
      // Labels are descriptive phrases on the real sheets ("type of meat market Smithfield is").
      if (beforeWords.length > 10) add('telegraphic', 'warn', msg(`The label has ${beforeWords.length} words (keep it to about 10).`, `A címke ${beforeWords.length} szó (kb. 10 legyen).`), a.id)
    } else if (own.kind === 'line') {
      if (/\?\s*$/.test(own.text) || beforeWords.length > 9) add('telegraphic', 'fail', msg(`${beforeWords.length} words before the blank, or a question: write a short note.`, `${beforeWords.length} szó a hiány előtt, vagy kérdés: rövid jegyzet kell.`), a.id)
      else if (beforeWords.length > 6) add('telegraphic', 'warn', msg(`${beforeWords.length} words before the blank (about 2–6).`, `${beforeWords.length} szó a hiány előtt (kb. 2–6).`), a.id)
    }
    // A bare blank under a lead-in ("…reject real stores because of: (Give 2 examples.)") takes its cue from the lead-in.
    const parent = chain.length > 1 && chain[chain.length - 2].kind === 'line' ? chain[chain.length - 2] : null
    const cueWords = !hasContentWord(beforeWords) && parent
      ? [...parent.text.replace(/\{\{\d{1,2}\}\}/g, ' ').replace(GIVE_RE, ' ').split(/\s+/).map(normWord).filter(Boolean), ...beforeWords]
      : beforeWords

    // Grammatical fit with the article right before the blank.
    const lastBefore = beforeWords[beforeWords.length - 1]
    if (lastBefore === 'a' && /^[aeiou]/i.test(key)) add('grammaticalFit', 'fail', msg(`"a ___" cannot take "${key}".`, `Az „a ___” után nem állhat „${key}”.`), a.id)
    else if (lastBefore === 'an' && /^[^aeiouh]/i.test(key)) add('grammaticalFit', 'warn', msg(`"an ___" before "${key}"?`, `„an ___” a(z) „${key}” előtt?`), a.id)
    else if ((lastBefore === 'a' || lastBefore === 'an') && keyWords.length === 1 && /[^s]s$/.test(key) && key.length > 3) add('grammaticalFit', 'warn', msg(`"${lastBefore} ___" with a plural-looking "${key}".`, `„${lastBefore} ___” után többes számúnak tűnő „${key}”.`), a.id)

    // Calling word: the nearest content word before the blank, within 3 words, also said near the answer.
    // A heading's or an empty label's blank may take its cue after it ("……… type"): only a warning then.
    if (m && a.id !== '0') checkCallingWord(a.id, cueWords, m, W, add, own.kind !== 'line')
  }

  stats.numericItems = numericItems
  const liveNumeric = numericItems.filter((id) => id !== '0')
  if (liveNumeric.length > (spec.maxNumeric ?? 2)) {
    add('answerLimits', 'fail', msg(`${liveNumeric.length} numeric answers (items ${liveNumeric.join(', ')}); at most ${spec.maxNumeric}.`, `${liveNumeric.length} számválasz (${liveNumeric.join(', ')}); legfeljebb ${spec.maxNumeric}.`))
  }
  const order = live.map((a) => a.id)
  for (let i = 1; i < liveNumeric.length; i++) {
    const gap = order.indexOf(liveNumeric[i]) - order.indexOf(liveNumeric[i - 1]) - 1
    if (gap < 2) add('numericAnswers', 'fail', msg(`Only ${gap} non-numeric item(s) between numeric items ${liveNumeric[i - 1]} and ${liveNumeric[i]}.`, `Csak ${gap} nem szám item a(z) ${liveNumeric[i - 1]}. és ${liveNumeric[i]}. számválasz között.`), liveNumeric[i])
  }
  for (const id of liveNumeric) {
    const m = markerOf.get(id)
    if (!m) continue
    const own = W.slice(m.start, m.end).find((w) => isFigure(w.text))
    if (!own) continue
    const kind = figureKind(own.norm)
    const near = W.slice(Math.max(0, m.start - 150), Math.min(W.length, m.end + 150)).filter(
      (w, k) => isFigure(w.text) && figureKind(w.norm) === kind && w !== own && !(Math.max(0, m.start - 150) + k >= m.start && Math.max(0, m.start - 150) + k < m.end),
    )
    if (near.length) add('numericAnswers', 'warn', msg(`Another ${kind} (${near[0].text}) is spoken within about 60 seconds.`, `Egy másik ${kind === 'percent' ? 'százalék' : kind === 'year' ? 'évszám' : 'szám'} (${near[0].text}) is elhangzik kb. 60 mp-en belül.`), id)
  }

  // Final item rule.
  const last = live[live.length - 1]
  const lm = last && markerOf.get(last.id)
  if (last && lm) {
    const key = last.accepted[0] ?? ''
    if (isNumeric(key)) add('finalItem', 'fail', msg('The final answer is numeric.', 'Az utolsó válasz szám.'), last.id)
    if (countWords(key) > 2) add('finalItem', 'fail', msg('The final answer is longer than 2 words.', 'Az utolsó válasz 2 szónál hosszabb.'), last.id)
    const after = W.slice(lm.end).reduce((s, w) => s + w.syllables, 0)
    if (after < MIN_GAP_SYLLABLES) add('finalItem', 'fail', msg(`Only ${after} syllables of audio after the final answer (at least ${MIN_GAP_SYLLABLES}).`, `Csak ${after} szótag hangzik el az utolsó válasz után (legalább ${MIN_GAP_SYLLABLES}).`), last.id)
    const lead = W.slice(Math.max(0, lm.start - 40), lm.start).map((w) => w.norm)
    if (key && indexOfRun(lead, words(key)) >= 0) add('finalItem', 'fail', msg(`"${key}" is already said just before its cue.`, `A(z) „${key}” már a jelzés előtt elhangzik.`), last.id)
  }
}

/** "(Give 1 example.)" / "(Give 2 examples)" on a note line. */
const GIVE_RE = /\(\s*give\s+(?:\d|one|two|three)\s+examples?\s*\.?\s*\)/i

function hasContentWord(words: string[]): boolean {
  return words.slice(-4).some((w) => !FUNCTION_WORDS.has(w) && !isFigure(w))
}

function checkCallingWord(id: string, beforeWords: string[], m: MarkerSpan, W: ParsedScript['words'], add: Add, lenient = false) {
  const near = beforeWords.slice(-4)
  const content = [...near].reverse().find((w) => !FUNCTION_WORDS.has(w) && !isFigure(w))
  if (!content) {
    add('callingWord', lenient ? 'warn' : 'fail', msg('No content word within 3 words before the blank (articles and prepositions do not count).', 'Nincs tartalmas szó a hiány előtti 3 szóban (névelő, elöljáró nem számít).'), id)
    return
  }
  const target = stem(content)
  const window = (from: number, to: number) => W.slice(Math.max(0, from), Math.max(0, to)).some((w) => stem(w.norm) === target)
  if (window(m.start - 4, m.start) || window(m.start, m.end)) return
  if (window(m.start - 12, m.start)) {
    add('callingWord', 'warn', msg(`"${content}" is said, but more than 3 words before the answer.`, `A(z) „${content}” elhangzik, de 3 szónál távolabb a választól.`), id)
  } else if (window(m.end, m.end + 6)) {
    add('cueBeforeAnswer', 'fail', msg(`"${content}" is only said after the answer.`, `A(z) „${content}” csak a válasz után hangzik el.`), id)
  } else {
    add('callingWord', 'fail', msg(`"${content}" from the note is not said near the answer in the script.`, `A jegyzet „${content}” szava nem hangzik el a válasz közelében.`), id)
  }
}

function indexOfRun(hay: string[], needle: string[]): number {
  if (needle.length === 0) return -1
  outer: for (let i = 0; i + needle.length <= hay.length; i++) {
    for (let k = 0; k < needle.length; k++) if (hay[i + k] !== needle[k]) continue outer
    return i
  }
  return -1
}

export function blockerCount(report: CheckReport): number {
  return report.findings.filter((f) => f.status === 'fail').length
}

/** Syllables in a piece of text (for the distance chart tooltips). */
export function syllablesIn(text: string): number {
  return text.split(/\s+/).filter(Boolean).reduce((s, w) => s + syllableCount(w), 0)
}
