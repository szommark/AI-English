import type { PronunciationCheckResult, PronunciationPhonemeDetail, PronunciationWordDetail } from './types'

// Azure's en-US IPA phone labels (checked against real results: plain "g", "ɹ", "ɝ"/"ɚ", no
// length marks, and vowel + r sometimes fused into one label such as "ɛɹ") → Sound Bank ids.
const LABEL_TO_ID: Record<string, string> = {
  θ: 'th-voiceless',
  ð: 'th-voiced',
  æ: 'ae',
  ə: 'schwa',
  w: 'w',
  ɹ: 'r',
  r: 'r',
  ɝ: 'nurse',
  ɚ: 'nurse',
  ŋ: 'ng',
  ʌ: 'strut',
  ɪ: 'kit',
  i: 'fleece',
  ʊ: 'foot',
  u: 'goose',
  ɔ: 'thought',
  ɑ: 'palm',
  oʊ: 'goat',
  eɪ: 'face',
  aɪ: 'price',
  aʊ: 'mouth',
  ɔɪ: 'choice',
  p: 'p',
  b: 'b',
  t: 't',
  d: 'd',
  k: 'k',
  g: 'g',
  ɡ: 'g',
  f: 'f',
  v: 'v',
  s: 's',
  z: 'z',
  ʃ: 'sh',
  ʒ: 'zh',
  h: 'h',
  tʃ: 'ch',
  dʒ: 'dzh',
  m: 'm',
  n: 'n',
  l: 'l',
  j: 'y',
  ɛ: 'dress',
  e: 'dress',
}

const LABELS_LONGEST_FIRST = Object.keys(LABEL_TO_ID).sort((a, b) => b.length - a.length)

/** Splits a (possibly fused) Azure label into Sound Bank ids, e.g. "ɛɹ" → dress + r. */
export function phonemeIdsForLabel(label: string): string[] {
  const clean = label.replace(/[ːˈˌ]/g, '')
  const ids: string[] = []
  let i = 0
  while (i < clean.length) {
    const match = LABELS_LONGEST_FIRST.find((l) => clean.startsWith(l, i))
    if (!match) {
      i++
      continue
    }
    ids.push(LABEL_TO_ID[match])
    i += match.length
  }
  return ids
}

const VOWEL_IDS = new Set([
  'ae', 'schwa', 'nurse', 'strut', 'kit', 'fleece', 'foot', 'goose', 'thought', 'palm',
  'goat', 'face', 'price', 'mouth', 'choice', 'dress',
])

/**
 * Sound Bank ids for one phoneme of a word. Azure has a single "l"; one that isn't followed by a
 * vowel (ball, milk) is the dark l, which has its own sheet.
 */
function idsForPhonemeAt(phonemes: PronunciationPhonemeDetail[], index: number): string[] {
  const ids = phonemeIdsForLabel(phonemes[index].phoneme)
  if (!ids.includes('l')) return ids
  const next = phonemes[index + 1]
  const beforeVowel = next ? phonemeIdsForLabel(next.phoneme).some((id) => VOWEL_IDS.has(id)) : false
  return beforeVowel ? ids : ids.map((id) => (id === 'l' ? 'dark-l' : id))
}

/** Score at or above which a sound counts as fine; below it gets recommended for practice. */
export const SOUND_OK_THRESHOLD = 80

export interface FocusSoundResult {
  /** Average accuracy of the focus sound's occurrences, 0–100. */
  score: number
  /** What Azure heard instead, if it heard another sound. */
  heardAs?: string
}

/** The focus sound's result inside a checked word, or null when Azure returned no phoneme for it. */
export function focusSoundResult(word: PronunciationWordDetail | undefined, focusId: string): FocusSoundResult | null {
  const phonemes = word?.phonemes ?? []
  const hits = phonemes.filter((_, i) => idsForPhonemeAt(phonemes, i).includes(focusId))
  if (hits.length === 0) return null
  const heard = hits.find((p) => p.heardAs)
  return {
    score: hits.reduce((sum, p) => sum + p.accuracyScore, 0) / hits.length,
    heardAs: heard?.heardAs,
  }
}

const PRACTISE_TOO_LIMIT = 6

/**
 * The other sounds worth practising after a run: any sound besides the focus one that scored
 * under SOUND_OK_THRESHOLD or was heard as a different sound. The PRACTISE_TOO_LIMIT most-missed.
 */
export function soundsToPractise(results: PronunciationCheckResult[], focusId: string): string[] {
  const misses = new Map<string, number>()
  for (const result of results) {
    for (const word of result.words) {
      const phonemes = word.phonemes ?? []
      phonemes.forEach((p, i) => {
        if (!p.heardAs && p.accuracyScore >= SOUND_OK_THRESHOLD) return
        for (const id of idsForPhonemeAt(phonemes, i)) {
          if (id !== focusId) misses.set(id, (misses.get(id) ?? 0) + 1)
        }
      })
    }
  }
  return [...misses.entries()].sort((a, b) => b[1] - a[1]).slice(0, PRACTISE_TOO_LIMIT).map(([id]) => id)
}
