// Turns learner input ("to play football") into a verb + the rest of the phrase.
import { MAX_PHRASE_LENGTH, type ParseError, type ParsedPhrase } from './types.ts'

const ENGLISH_PHRASE = /^[A-Za-z' -]+$/

export function parsePhrase(input: string): ParsedPhrase | { error: ParseError } {
  const text = input.trim().replace(/\s+/g, ' ').replace(/^to /i, '')
  if (!text) return { error: 'empty' }
  if (text.length > MAX_PHRASE_LENGTH) return { error: 'too-long' }
  if (!ENGLISH_PHRASE.test(text) || !/[A-Za-z]/.test(text)) return { error: 'not-english' }
  const space = text.indexOf(' ')
  if (space === -1) return { verb: text.toLowerCase(), rest: '' }
  return { verb: text.slice(0, space).toLowerCase(), rest: text.slice(space + 1) }
}
