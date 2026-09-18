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

function stripPunctuationWord(word: string): string {
  return word.toLowerCase().replace(/[.,!?;:"'()]/g, '')
}

/**
 * matchWords plus a tally against a sentence's keyWords list — the words that carry the
 * item's target sound, used for the dictation stage's sound-specific score (e.g. "4/4 th").
 * Strips punctuation on both sides before comparing, since matchWords' display words keep
 * theirs (e.g. "November.") while keyWords don't.
 */
export function scoreDictation(target: string, heard: string, keyWords: string[]) {
  const words = matchWords(target, heard)
  const matchedCount = words.filter((w) => w.matched).length
  const keyWordSet = new Set(keyWords.map(stripPunctuationWord))
  const keyWordMatchedCount = words.filter((w) => w.matched && keyWordSet.has(stripPunctuationWord(w.word))).length
  return { words, matchedCount, keyWordMatchedCount }
}
