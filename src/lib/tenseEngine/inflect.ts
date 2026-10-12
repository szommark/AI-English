// Verb inflection with British spelling: third person -s, past / past participle, -ing form.
import { IRREGULAR_VERBS } from './irregulars.ts'
import type { VerbForms } from './types.ts'

// Multi-syllable verbs whose final consonant doubles (stress on the last syllable).
const DOUBLING_EXCEPTIONS = new Set([
  'begin', 'forget', 'prefer', 'admit', 'permit', 'refer', 'occur', 'regret', 'control', 'submit',
  'commit', 'omit', 'transmit', 'equip', 'incur', 'deter', 'compel', 'expel', 'patrol', 'forbid',
  'upset', 'transfer', 'confer', 'propel',
])

// British -l doubling after an unstressed vowel (travel -> travelling, travelled).
const L_DOUBLING = new Set([
  'travel', 'cancel', 'label', 'model', 'signal', 'level', 'quarrel', 'marvel', 'fuel', 'dial',
  'total', 'channel', 'pedal', 'tunnel', 'shovel',
])

// Verbs in -c take a k before -ed / -ing (panic -> panicking, panicked).
const C_TO_CK = new Set(['panic', 'picnic', 'mimic', 'traffic'])

const VOWELS = 'aeiou'
const isVowel = (ch: string) => VOWELS.includes(ch)

/** One-syllable consonant-vowel-consonant verb (stop, plan, run, quit), excluding w/x/y endings. */
function isShortCvc(verb: string): boolean {
  const v = verb.replace(/qu/g, 'q') // the u in "qu" acts as a consonant (quit -> quitting)
  return /^[^aeiou]*[aeiou][^aeiouwxy]$/.test(v)
}

function doublesFinal(verb: string): boolean {
  return isShortCvc(verb) || DOUBLING_EXCEPTIONS.has(verb) || L_DOUBLING.has(verb)
}

function consonantY(verb: string): boolean {
  return verb.length > 1 && verb.endsWith('y') && !isVowel(verb[verb.length - 2])
}

function thirdPerson(verb: string): string {
  if (verb === 'be') return 'is'
  if (verb === 'have') return 'has'
  if (consonantY(verb)) return verb.slice(0, -1) + 'ies'
  if (/(s|x|z|ch|sh|o)$/.test(verb)) return verb + 'es'
  return verb + 's'
}

function regularPast(verb: string): string {
  if (C_TO_CK.has(verb)) return verb + 'ked'
  if (verb.endsWith('e')) return verb + 'd'
  if (consonantY(verb)) return verb.slice(0, -1) + 'ied'
  if (doublesFinal(verb)) return verb + verb[verb.length - 1] + 'ed'
  return verb + 'ed'
}

function gerund(verb: string): string {
  if (verb === 'be') return 'being'
  if (C_TO_CK.has(verb)) return verb + 'king'
  if (verb.endsWith('ie')) return verb.slice(0, -2) + 'ying'
  // see -> seeing, agree -> agreeing, dye -> dyeing, hoe -> hoeing
  if (/(ee|ye|oe)$/.test(verb)) return verb + 'ing'
  if (verb.endsWith('e') && verb.length > 2) return verb.slice(0, -1) + 'ing'
  if (doublesFinal(verb)) return verb + verb[verb.length - 1] + 'ing'
  return verb + 'ing'
}

export function inflect(verb: string): VerbForms {
  const base = verb.toLowerCase()
  const irregular = IRREGULAR_VERBS[base]
  const past = irregular ? irregular[0] : regularPast(base)
  return {
    base,
    thirdPerson: thirdPerson(base),
    past,
    pastParticiple: irregular ? irregular[1] : past,
    gerund: gerund(base),
  }
}
