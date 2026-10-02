// Shared pieces of the érettségi angol középszint papers (the booklets print the same
// covers, listening announcement and answer options every sitting).
import type { BankOption, ChoiceItem, ExamItem, McqItem, ShortTextItem } from '../types'

export const EN_NOTICES_HU = [
  'Az utasításokat pontosan kell követni. Csak az utasításban megadott helyre beírt megoldás fogadható el.',
  'Mindig csak egy megoldást szabad beírni.',
  'A betűjelek legyenek jól olvashatóak, az esetleges javítások pedig egyértelműek.',
  'A megadott szószámot nem szabad túllépni. Az összevont alakok egy szónak számítanak (pl. "it\'s" egy szó, "it is" két szó).',
]

/** The booklet's announcement; `second` is how it introduces the second playing (it changed in 2025). */
export const enListeningIntro = (second: 'After another short silent period,' | 'After that,') => [
  'Welcome to the Listening component of the Matura Examination.',
  'The listening material and the instructions are recorded on this CD, and the tasks and instructions are printed in your test booklet.',
  '• There will be three tasks, and every recording will be played twice.',
  '• The tasks will begin with some music, and then you will hear (and you can also read) the instructions to the task.',
  '• This will be followed by a silent period on the CD in order to give you some time to look at the task in your test booklet before hearing the text.',
  '• Then we will play the recording in one piece.',
  `• ${second} we will play the recording for the second time, but now in shorter sections and with breaks between the sections in order to give you enough time to write down your answers.`,
  'Please note that the first item in each task (marked with a tick) is always an example.',
  'The whole test is exactly 30 minutes long.',
  'Good luck!',
]

/** A = TRUE, B = FALSE, C = THE TEXT DOES NOT SAY */
export const TFN: BankOption[] = [
  { key: 'A', text: 'TRUE' },
  { key: 'B', text: 'FALSE' },
  { key: 'C', text: 'THE TEXT DOES NOT SAY' },
]

/** `choices(1, 'E G H')` → bank-choice items 1, 2, 3 (`K|F` = answer K, F also accepted). */
export function choices(first: number, keys: string): ChoiceItem[] {
  return keys.split(' ').map((k, i) => {
    const [answer, ...also] = k.split('|')
    return { id: String(first + i), type: 'choice', answer, ...(also.length ? { alsoAccept: also } : {}) }
  })
}

/** Items answered with the task's shared options (`tfn(16, 'C A B')`) or, for `mcq`, own options. */
export function tfn(first: number, statements: string[], keys: string): McqItem[] {
  return keys.split(' ').map((answer, i) => ({ id: String(first + i), type: 'mcq', stem: statements[i], answer }))
}

/** Options A, B, C… from their texts. */
export function opts(...texts: string[]): BankOption[] {
  return texts.map((text, i) => ({ key: String.fromCharCode(65 + i), text }))
}

/** Inline multiple-choice gaps: `rows` are the option texts of each gap, `keys` the answer letters. */
export function gapMcqs(first: number, rows: string[][], keys: string): McqItem[] {
  return keys.split(' ').map((answer, i) => ({ id: String(first + i), type: 'mcq', options: opts(...rows[i]), answer }))
}

/** Questions with their own options (listening multiple choice). */
export function questions(first: number, rows: { stem: string; options: string[] }[], keys: string): McqItem[] {
  return keys.split(' ').map((answer, i) => ({ id: String(first + i), type: 'mcq', stem: rows[i].stem, options: opts(...rows[i].options), answer }))
}

/** Word formation: `['day', 'daily']` = base word, then every accepted form. */
export function words(first: number, rows: string[][]): ShortTextItem[] {
  return rows.map(([baseWord, ...accepted], i) => ({
    id: String(first + i),
    type: 'short-text',
    baseWord,
    answer: { accepted, match: 'exact-ci' },
  }))
}

/** Open cloze: each row lists the accepted words. */
export function cloze(first: number, rows: string[][]): ShortTextItem[] {
  return rows.map((accepted, i) => ({ id: String(first + i), type: 'short-text', answer: { accepted, match: 'exact-ci' } }))
}

/**
 * Listening gap-fill (the exact words heard): `['sentence with ____', 'answer', 'also']`. A
 * one-word answer is matched exactly; a longer one needs each of its words, within the word limit.
 */
export function heard(first: number, rows: string[][], reviewNotes: Record<string, string> = {}): ShortTextItem[] {
  return rows.map(([prompt, ...accepted], i) => {
    const id = String(first + i)
    const n = accepted[0].split(' ').length
    return {
      id,
      type: 'short-text',
      prompt,
      answer:
        n === 1
          ? { accepted, match: 'exact-ci', maxWords: 1 }
          : { accepted, match: 'keywords', keywords: accepted[0].split(' ').map((w) => [w.toLowerCase()]), maxWords: n },
      ...(reviewNotes[id] ? { reviewNote: reviewNotes[id] } : {}),
    }
  })
}

/** Listening short answers are graded on content: the key's essential words must be in the answer. */
export const shortAnswer = (id: string, prompt: string, shown: string, keywords: string[][]): ShortTextItem => ({
  id,
  type: 'short-text',
  prompt,
  answer: { accepted: [shown], match: 'keywords', keywords },
})

export type { ExamItem }
