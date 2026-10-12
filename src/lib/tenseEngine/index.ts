// Tense Explorer sentence engine: static, rule-based, offline. See scripts/check-tense-engine.ts.
export {
  CONTINUOUS_TENSES,
  MAX_PHRASE_LENGTH,
  SUBJECTS,
  TENSE_IDS,
  type ParseError,
  type ParsedPhrase,
  type Polarity,
  type Subject,
  type TenseId,
  type VerbForms,
  type VerbWarning,
} from './types.ts'
export { IRREGULAR_VERBS } from './irregulars.ts'
export { inflect } from './inflect.ts'
export { parsePhrase } from './parse.ts'
export { STATIVE_VERBS, assignSubjects, buildSentence, verbWarnings } from './build.ts'
export { RANDOM_PHRASES, randomPhrase } from './phrases.ts'
