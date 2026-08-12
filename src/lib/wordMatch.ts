export interface WordMatch {
  word: string
  matched: boolean
}

function normalizeWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[.,!?;:"'()]/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
}

/**
 * Compares the recognized speech against the target sentence word-by-word,
 * positionally. This is a simple proxy for pronunciation, not real scoring —
 * see WordMatchFeedback's disclaimer caption.
 */
export function matchWords(target: string, heard: string): WordMatch[] {
  const targetWords = normalizeWords(target)
  const heardWords = normalizeWords(heard)
  const displayWords = target.trim().split(/\s+/)

  return targetWords.map((word, i) => ({
    word: displayWords[i] ?? word,
    matched: heardWords[i] === word,
  }))
}
