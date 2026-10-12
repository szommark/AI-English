// Checks for the Tense Explorer sentence engine and content. Run: npm run check:tenses
import {
  IRREGULAR_VERBS,
  MAX_PHRASE_LENGTH,
  RANDOM_PHRASES,
  SUBJECTS,
  TENSE_IDS,
  assignSubjects,
  buildSentence,
  inflect,
  parsePhrase,
  randomPhrase,
  verbWarnings,
  type ParsedPhrase,
  type Polarity,
  type Subject,
  type TenseId,
  type VerbForms,
} from '../src/lib/tenseEngine/index.ts'
import { COMPARE_PAIRS, TENSE_CONTENT, findComparePair } from '../src/data/tenseExplorerContent.ts'
import { getGrammarItem } from '../src/data/grammarCurriculum.ts'

const errors: string[] = []
const fail = (msg: string) => errors.push(msg)

function phrase(input: string): ParsedPhrase {
  const parsed = parsePhrase(input)
  if ('error' in parsed) throw new Error(`"${input}" did not parse: ${parsed.error}`)
  return parsed
}

function expectSentence(
  tense: TenseId,
  polarity: Polarity,
  input: string,
  subject: Subject,
  expected: string,
  timeCue = false,
) {
  const got = buildSentence(tense, polarity, phrase(input), subject, { timeCue })
  if (got !== expected) fail(`${tense}/${polarity}/${subject} "${input}": expected "${expected}", got "${got}"`)
}

// Positive / question / negative in one call.
function expectAll(tense: TenseId, input: string, subject: Subject, [aff, q, neg]: [string, string, string]) {
  expectSentence(tense, 'affirmative', input, subject, aff)
  expectSentence(tense, 'question', input, subject, q)
  expectSentence(tense, 'negative', input, subject, neg)
}

// --- she + "play football", all 13 tenses x 3 polarities ---
const SHE_PLAY_FOOTBALL: Record<TenseId, [string, string, string]> = {
  'present-simple': ['She plays football.', 'Does she play football?', 'She does not play football.'],
  'present-continuous': ['She is playing football.', 'Is she playing football?', 'She is not playing football.'],
  'present-perfect': ['She has played football.', 'Has she played football?', 'She has not played football.'],
  'present-perfect-continuous': ['She has been playing football.', 'Has she been playing football?', 'She has not been playing football.'],
  'past-simple': ['She played football.', 'Did she play football?', 'She did not play football.'],
  'past-continuous': ['She was playing football.', 'Was she playing football?', 'She was not playing football.'],
  'past-perfect': ['She had played football.', 'Had she played football?', 'She had not played football.'],
  'past-perfect-continuous': ['She had been playing football.', 'Had she been playing football?', 'She had not been playing football.'],
  'future-simple': ['She will play football.', 'Will she play football?', 'She will not play football.'],
  'future-continuous': ['She will be playing football.', 'Will she be playing football?', 'She will not be playing football.'],
  'future-perfect': ['She will have played football.', 'Will she have played football?', 'She will not have played football.'],
  'future-perfect-continuous': ['She will have been playing football.', 'Will she have been playing football?', 'She will not have been playing football.'],
  'be-going-to': ['She is going to play football.', 'Is she going to play football?', 'She is not going to play football.'],
}
for (const tense of TENSE_IDS) expectAll(tense, 'play football', 'she', SHE_PLAY_FOOTBALL[tense])

// --- every subject with "play football" ---
const SUBJECT_CASES: Record<Subject, { simple: [string, string, string]; continuous: [string, string, string]; past: [string, string, string] }> = {
  I: {
    simple: ['I play football.', 'Do I play football?', 'I do not play football.'],
    continuous: ['I am playing football.', 'Am I playing football?', 'I am not playing football.'],
    past: ['I played football.', 'Did I play football?', 'I did not play football.'],
  },
  you: {
    simple: ['You play football.', 'Do you play football?', 'You do not play football.'],
    continuous: ['You are playing football.', 'Are you playing football?', 'You are not playing football.'],
    past: ['You played football.', 'Did you play football?', 'You did not play football.'],
  },
  he: {
    simple: ['He plays football.', 'Does he play football?', 'He does not play football.'],
    continuous: ['He is playing football.', 'Is he playing football?', 'He is not playing football.'],
    past: ['He played football.', 'Did he play football?', 'He did not play football.'],
  },
  she: {
    simple: ['She plays football.', 'Does she play football?', 'She does not play football.'],
    continuous: ['She is playing football.', 'Is she playing football?', 'She is not playing football.'],
    past: ['She played football.', 'Did she play football?', 'She did not play football.'],
  },
  we: {
    simple: ['We play football.', 'Do we play football?', 'We do not play football.'],
    continuous: ['We are playing football.', 'Are we playing football?', 'We are not playing football.'],
    past: ['We played football.', 'Did we play football?', 'We did not play football.'],
  },
  they: {
    simple: ['They play football.', 'Do they play football?', 'They do not play football.'],
    continuous: ['They are playing football.', 'Are they playing football?', 'They are not playing football.'],
    past: ['They played football.', 'Did they play football?', 'They did not play football.'],
  },
}
for (const subject of SUBJECTS) {
  const c = SUBJECT_CASES[subject]
  expectAll('present-simple', 'play football', subject, c.simple)
  expectAll('present-continuous', 'play football', subject, c.continuous)
  expectAll('past-simple', 'play football', subject, c.past)
}
expectSentence('past-continuous', 'affirmative', 'play football', 'I', 'I was playing football.')
expectSentence('past-continuous', 'affirmative', 'play football', 'we', 'We were playing football.')
expectSentence('present-perfect', 'question', 'play football', 'they', 'Have they played football?')
expectSentence('be-going-to', 'question', 'play football', 'I', 'Am I going to play football?')

// --- inflection ---
const INFLECT: Record<string, Partial<VerbForms>> = {
  go: { thirdPerson: 'goes', past: 'went', pastParticiple: 'gone', gerund: 'going' },
  study: { thirdPerson: 'studies', past: 'studied', pastParticiple: 'studied', gerund: 'studying' },
  watch: { thirdPerson: 'watches', past: 'watched' },
  stop: { past: 'stopped', pastParticiple: 'stopped', gerund: 'stopping' },
  plan: { past: 'planned', gerund: 'planning' },
  run: { past: 'ran', pastParticiple: 'run', gerund: 'running' },
  begin: { past: 'began', pastParticiple: 'begun', gerund: 'beginning' },
  visit: { past: 'visited', gerund: 'visiting' },
  open: { past: 'opened', gerund: 'opening' },
  listen: { past: 'listened', gerund: 'listening' },
  offer: { past: 'offered', gerund: 'offering' },
  prefer: { past: 'preferred', gerund: 'preferring' },
  travel: { past: 'travelled', pastParticiple: 'travelled', gerund: 'travelling' },
  cancel: { past: 'cancelled', gerund: 'cancelling' },
  lie: { gerund: 'lying' },
  make: { gerund: 'making', past: 'made' },
  see: { gerund: 'seeing', past: 'saw', pastParticiple: 'seen' },
  be: { gerund: 'being', pastParticiple: 'been' },
  play: { past: 'played', thirdPerson: 'plays', gerund: 'playing' },
  write: { past: 'wrote', pastParticiple: 'written', gerund: 'writing' },
  forget: { past: 'forgot', pastParticiple: 'forgotten', gerund: 'forgetting' },
  get: { past: 'got', pastParticiple: 'got', gerund: 'getting' },
  quit: { gerund: 'quitting' },
  fix: { past: 'fixed', thirdPerson: 'fixes', gerund: 'fixing' },
  have: { thirdPerson: 'has', past: 'had', pastParticiple: 'had' },
  do: { thirdPerson: 'does', past: 'did', pastParticiple: 'done' },
  try: { thirdPerson: 'tries', past: 'tried', gerund: 'trying' },
  agree: { past: 'agreed', gerund: 'agreeing' },
}
for (const [verb, expected] of Object.entries(INFLECT)) {
  const forms = inflect(verb)
  for (const [key, value] of Object.entries(expected)) {
    const got = forms[key as keyof VerbForms]
    if (got !== value) fail(`inflect(${verb}).${key}: expected "${value}", got "${got}"`)
  }
}
if (Object.keys(IRREGULAR_VERBS).length < 120) fail(`only ${Object.keys(IRREGULAR_VERBS).length} irregular verbs (need >= 120)`)

// --- be / have / do as main verbs ---
expectAll('present-simple', 'be happy', 'he', ['He is happy.', 'Is he happy?', 'He is not happy.'])
expectSentence('past-simple', 'affirmative', 'be happy', 'he', 'He was happy.')
expectSentence('past-simple', 'question', 'be happy', 'they', 'Were they happy?')
expectSentence('future-simple', 'affirmative', 'be happy', 'he', 'He will be happy.')
expectSentence('present-perfect', 'affirmative', 'be happy', 'he', 'He has been happy.')
expectSentence('be-going-to', 'affirmative', 'be happy', 'I', 'I am going to be happy.')

expectAll('present-simple', 'have lunch', 'she', ['She has lunch.', 'Does she have lunch?', 'She does not have lunch.'])
expectSentence('present-continuous', 'affirmative', 'have lunch', 'she', 'She is having lunch.')
expectSentence('past-simple', 'affirmative', 'have lunch', 'she', 'She had lunch.')

expectSentence('present-simple', 'affirmative', 'do homework', 'she', 'She does homework.')
expectSentence('present-simple', 'question', 'do homework', 'she', 'Does she do homework?')
expectSentence('past-simple', 'affirmative', 'do homework', 'she', 'She did homework.')
expectSentence('present-perfect', 'affirmative', 'do homework', 'she', 'She has done homework.')

expectSentence('present-simple', 'affirmative', 'go to school', 'I', 'I go to school.')
expectSentence('present-continuous', 'affirmative', 'go to school', 'I', 'I am going to school.')
expectSentence('present-perfect', 'affirmative', 'go to school', 'I', 'I have gone to school.')
expectSentence('present-simple', 'affirmative', 'go to school', 'he', 'He goes to school.')

// --- possessives / reflexives ---
expectSentence('present-simple', 'affirmative', 'wash my hands', 'he', 'He washes his hands.')
expectSentence('present-simple', 'affirmative', 'wash my hands', 'she', 'She washes her hands.')
expectSentence('present-simple', 'affirmative', 'wash my hands', 'I', 'I wash my hands.')
expectSentence('present-simple', 'affirmative', 'wash my hands', 'they', 'They wash their hands.')
expectSentence('past-simple', 'affirmative', 'hurt myself', 'we', 'We hurt ourselves.')
expectSentence('past-simple', 'affirmative', 'hurt myself', 'you', 'You hurt yourself.')

// --- time cues ---
expectSentence('present-simple', 'affirmative', 'play football', 'she', 'She plays football every day.', true)
expectSentence('present-simple', 'question', 'play football', 'she', 'Does she play football every day?', true)
expectSentence('present-simple', 'negative', 'play football', 'she', 'She does not play football every day.', true)
expectSentence('past-simple', 'affirmative', 'play football', 'she', 'She played football yesterday.', true)
expectSentence('be-going-to', 'negative', 'play football', 'she', 'She is not going to play football next week.', true)

// --- parsing ---
const travel = parsePhrase('to travel')
if ('error' in travel || travel.verb !== 'travel' || travel.rest !== '') fail(`parsePhrase("to travel"): ${JSON.stringify(travel)}`)
const getUp = parsePhrase('  get   up  ')
if ('error' in getUp || getUp.verb !== 'get' || getUp.rest !== 'up') fail(`parsePhrase("  get   up  "): ${JSON.stringify(getUp)}`)
const expectError = (input: string, error: string) => {
  const got = parsePhrase(input)
  if (!('error' in got) || got.error !== error) fail(`parsePhrase(${JSON.stringify(input)}): expected ${error}, got ${JSON.stringify(got)}`)
}
expectError('', 'empty')
expectError('   ', 'empty')
expectError('játszik', 'not-english')
expectError('play football!', 'not-english')
expectError('a'.repeat(MAX_PHRASE_LENGTH + 1), 'too-long')
const kept = parsePhrase('Play Football')
if ('error' in kept || kept.verb !== 'play' || kept.rest !== 'Football') fail(`parsePhrase("Play Football"): ${JSON.stringify(kept)}`)

// --- warnings ---
if (!verbWarnings('present-continuous', 'know').includes('stative-continuous')) fail('know + present-continuous: missing stative-continuous')
if (!verbWarnings('future-perfect-continuous', 'like').includes('stative-continuous')) fail('like + future-perfect-continuous: missing stative-continuous')
if (verbWarnings('present-simple', 'know').length !== 0) fail('know + present-simple: expected no warnings')
if (verbWarnings('present-perfect', 'know').length !== 0) fail('know + present-perfect: expected no warnings')
if (!verbWarnings('present-continuous', 'be').includes('be-continuous')) fail('be + present-continuous: missing be-continuous')
if (verbWarnings('present-continuous', 'play').length !== 0) fail('play + present-continuous: expected no warnings')

// --- subject assignment ---
const s0 = assignSubjects(0)
const s1 = assignSubjects(1)
if (JSON.stringify(s0) !== JSON.stringify(assignSubjects(0))) fail('assignSubjects(0) is not deterministic')
for (const tense of TENSE_IDS) if (!s0[tense]) fail(`assignSubjects(0): no subject for ${tense}`)
if (Object.keys(s0).length !== TENSE_IDS.length) fail(`assignSubjects(0): ${Object.keys(s0).length} entries`)
for (const subject of SUBJECTS) if (!Object.values(s0).includes(subject)) fail(`assignSubjects(0): ${subject} never used`)
TENSE_IDS.forEach((tense, i) => {
  if (i > 0 && s0[tense] === s0[TENSE_IDS[i - 1]]) fail(`assignSubjects(0): ${TENSE_IDS[i - 1]} and ${tense} share ${s0[tense]}`)
  if (s0[tense] === s1[tense]) fail(`assignSubjects(1): ${tense} did not change`)
})

// --- random phrases ---
if (RANDOM_PHRASES.length < 60) fail(`RANDOM_PHRASES has ${RANDOM_PHRASES.length} entries (need >= 60)`)
if (new Set(RANDOM_PHRASES).size !== RANDOM_PHRASES.length) fail('RANDOM_PHRASES has duplicates')
for (const p of RANDOM_PHRASES) {
  const parsed = parsePhrase(p)
  if ('error' in parsed) fail(`RANDOM_PHRASES: "${p}" does not parse (${parsed.error})`)
}
if (randomPhrase('x') === 'x') fail("randomPhrase('x') returned 'x'")
for (let i = 0; i < 200; i++) {
  const first = RANDOM_PHRASES[0]
  if (randomPhrase(first) === first) {
    fail('randomPhrase(exclude) returned the excluded phrase')
    break
  }
}

// --- explorer content ---
for (const tense of TENSE_IDS) {
  const c = TENSE_CONTENT[tense]
  if (!c) {
    fail(`TENSE_CONTENT: missing ${tense}`)
    continue
  }
  if (c.id !== tense) fail(`TENSE_CONTENT[${tense}].id is ${c.id}`)
  const expectedId = c.aspect === 'going-to' ? 'be-going-to' : `${c.frame}-${c.aspect}`
  if (expectedId !== tense) fail(`${tense}: frame/aspect ${c.frame}/${c.aspect} do not match the id`)
  if (!c.nameEn.trim() || !c.nameHu.trim() || !c.formulaEn.trim()) fail(`${tense}: empty name or formula`)
  if (c.usesEn.length < 1 || c.usesEn.length > 3) fail(`${tense}: ${c.usesEn.length} English uses (want 1-3)`)
  if (c.usesEn.length !== c.usesHu.length) fail(`${tense}: ${c.usesEn.length} English uses but ${c.usesHu.length} Hungarian`)
  if (c.cuesEn.length === 0) fail(`${tense}: no time words`)
  if (!!c.pitfallEn !== !!c.pitfallHu) fail(`${tense}: pitfall only in one language`)
  if (c.lessonId && !getGrammarItem(c.lessonId)) fail(`${tense}: lessonId ${c.lessonId} does not exist`)
}
if (Object.keys(TENSE_CONTENT).length !== TENSE_IDS.length) fail(`TENSE_CONTENT has ${Object.keys(TENSE_CONTENT).length} entries`)
const pairKeys = new Set<string>()
for (const p of COMPARE_PAIRS) {
  if (!TENSE_IDS.includes(p.a) || !TENSE_IDS.includes(p.b) || p.a === p.b) fail(`COMPARE_PAIRS: bad pair ${p.a} / ${p.b}`)
  const key = [p.a, p.b].sort().join('|')
  if (pairKeys.has(key)) fail(`COMPARE_PAIRS: duplicate pair ${key}`)
  pairKeys.add(key)
  if (!p.en.trim() || !p.hu.trim()) fail(`COMPARE_PAIRS: ${key} has an empty note`)
}
if (findComparePair('present-perfect', 'past-simple')?.a !== 'past-simple') fail('findComparePair does not match in reverse order')
if (findComparePair('present-simple', 'future-perfect')) fail('findComparePair found a pair that does not exist')

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}
console.log(`Tense engine OK: ${TENSE_IDS.length} tenses, ${COMPARE_PAIRS.length} compare pairs, ${Object.keys(IRREGULAR_VERBS).length} irregular verbs, ${RANDOM_PHRASES.length} random phrases`)
