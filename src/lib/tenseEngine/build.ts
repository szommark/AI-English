// Builds positive / question / negative sentences for the 13 explorer tenses.
import { inflect } from './inflect.ts'
import {
  CONTINUOUS_TENSES,
  SUBJECTS,
  TENSE_IDS,
  type ParsedPhrase,
  type Polarity,
  type Subject,
  type TenseId,
  type VerbWarning,
} from './types.ts'

const TIME_CUES: Record<TenseId, string> = {
  'present-simple': 'every day',
  'present-continuous': 'right now',
  'present-perfect': 'this week',
  'present-perfect-continuous': 'for two hours',
  'past-simple': 'yesterday',
  'past-continuous': "at eight o'clock last night",
  'past-perfect': 'by nine o\'clock',
  'past-perfect-continuous': 'for an hour before that',
  'future-simple': 'tomorrow',
  'future-continuous': 'at eight tomorrow',
  'future-perfect': 'by next Friday',
  'future-perfect-continuous': 'by next June',
  'be-going-to': 'next week',
}

const POSSESSIVES: Record<Subject, string> = {
  I: 'my', you: 'your', he: 'his', she: 'her', we: 'our', they: 'their',
}
const REFLEXIVES: Record<Subject, string> = {
  I: 'myself', you: 'yourself', he: 'himself', she: 'herself', we: 'ourselves', they: 'themselves',
}
const POSSESSIVE_TOKENS = new Set(Object.values(POSSESSIVES))
const REFLEXIVE_TOKENS = new Set(Object.values(REFLEXIVES))

export const STATIVE_VERBS = [
  'know', 'like', 'love', 'hate', 'want', 'need', 'prefer', 'believe', 'understand', 'mean',
  'belong', 'own', 'seem', 'cost', 'remember', 'suppose', 'doubt', 'wish', 'matter',
]

const isThirdSingular = (s: Subject) => s === 'he' || s === 'she'
const bePresent = (s: Subject) => (s === 'I' ? 'am' : isThirdSingular(s) ? 'is' : 'are')
const bePast = (s: Subject) => (s === 'I' || isThirdSingular(s) ? 'was' : 'were')
const havePresent = (s: Subject) => (isThirdSingular(s) ? 'has' : 'have')
const doPresent = (s: Subject) => (isThirdSingular(s) ? 'does' : 'do')

/** Adapts my/your/... and myself/yourself/... in the rest of the phrase to the subject. */
function adaptRest(rest: string, subject: Subject): string {
  return rest
    .split(' ')
    .map((token) => {
      if (POSSESSIVE_TOKENS.has(token)) return POSSESSIVES[subject]
      if (REFLEXIVE_TOKENS.has(token)) return REFLEXIVES[subject]
      if (token === 'i') return 'I'
      return token
    })
    .join(' ')
}

/**
 * The verb group: `chain[0]` is the finite auxiliary (inverted in questions, followed by
 * "not" in negatives), the rest of `chain` and `main` follow it. An empty chain means the
 * main verb is finite (simple tenses, positive) and the sentence has no inversion.
 */
function verbGroup(tense: TenseId, polarity: Polarity, verb: string, subject: Subject): { chain: string[]; main: string } {
  const f = inflect(verb)
  const affirmative = polarity === 'affirmative'
  switch (tense) {
    case 'present-simple':
      if (f.base === 'be') return { chain: [bePresent(subject)], main: '' }
      if (affirmative) return { chain: [], main: isThirdSingular(subject) ? f.thirdPerson : f.base }
      return { chain: [doPresent(subject)], main: f.base }
    case 'past-simple':
      if (f.base === 'be') return { chain: [bePast(subject)], main: '' }
      if (affirmative) return { chain: [], main: f.past }
      return { chain: ['did'], main: f.base }
    case 'present-continuous':
      return { chain: [bePresent(subject)], main: f.gerund }
    case 'present-perfect':
      return { chain: [havePresent(subject)], main: f.pastParticiple }
    case 'present-perfect-continuous':
      return { chain: [havePresent(subject), 'been'], main: f.gerund }
    case 'past-continuous':
      return { chain: [bePast(subject)], main: f.gerund }
    case 'past-perfect':
      return { chain: ['had'], main: f.pastParticiple }
    case 'past-perfect-continuous':
      return { chain: ['had', 'been'], main: f.gerund }
    case 'future-simple':
      return { chain: ['will'], main: f.base }
    case 'future-continuous':
      return { chain: ['will', 'be'], main: f.gerund }
    case 'future-perfect':
      return { chain: ['will', 'have'], main: f.pastParticiple }
    case 'future-perfect-continuous':
      return { chain: ['will', 'have', 'been'], main: f.gerund }
    case 'be-going-to':
      return { chain: [bePresent(subject), 'going', 'to'], main: f.base }
  }
}

export function buildSentence(
  tense: TenseId,
  polarity: Polarity,
  phrase: ParsedPhrase,
  subject: Subject,
  opts: { timeCue?: boolean } = {},
): string {
  const { chain, main } = verbGroup(tense, polarity, phrase.verb, subject)
  const [finite, ...after] = chain
  let words: string[]
  if (polarity === 'question') words = [finite, subject, ...after, main]
  else if (polarity === 'negative') words = [subject, finite, 'not', ...after, main]
  else words = [subject, ...chain, main]
  if (phrase.rest) words.push(adaptRest(phrase.rest, subject))
  if (opts.timeCue) words.push(TIME_CUES[tense])
  const text = words.filter(Boolean).join(' ')
  return text.charAt(0).toUpperCase() + text.slice(1) + (polarity === 'question' ? '?' : '.')
}

/**
 * Deterministic subject per box: box i in grid order gets SUBJECTS[(i + seed) % 6], so
 * neighbours never share a subject and the same seed always gives the same result.
 */
export function assignSubjects(seed = 0): Record<TenseId, Subject> {
  const result = {} as Record<TenseId, Subject>
  const n = SUBJECTS.length
  TENSE_IDS.forEach((tense, i) => {
    result[tense] = SUBJECTS[(((i + seed) % n) + n) % n]
  })
  return result
}

export function verbWarnings(tense: TenseId, verb: string): VerbWarning[] {
  if (!CONTINUOUS_TENSES.includes(tense)) return []
  const base = verb.trim().toLowerCase()
  const warnings: VerbWarning[] = []
  if (STATIVE_VERBS.includes(base)) warnings.push('stative-continuous')
  if (base === 'be') warnings.push('be-continuous')
  return warnings
}
