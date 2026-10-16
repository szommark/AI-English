/**
 * Grammar Coach narration markup. A lesson explained in Hungarian or German wraps every
 * English word, phrase or sentence of its narration in <en>…</en>, so the player can read
 * those parts with an English voice instead of letting the Hungarian voice pronounce them
 * the Hungarian way. Lessons explained in English carry no tags.
 */

export interface NarrationChunk {
  /** 'en' for an <en>…</en> part, 'native' for the explanation language around it. */
  lang: 'en' | 'native'
  text: string
}

const TAG = /<\s*(\/?)\s*en\s*>/gi

/**
 * Splits narration into language runs. Lenient on purpose: an unclosed <en> runs to the
 * end, a stray </en> is ignored, and whitespace-only runs are dropped.
 */
export function splitNarration(narration: string): NarrationChunk[] {
  const chunks: NarrationChunk[] = []
  let lang: NarrationChunk['lang'] = 'native'
  let last = 0

  const push = (text: string) => {
    const trimmed = text.replace(/\s+/g, ' ').trim()
    if (!trimmed) return
    const prev = chunks[chunks.length - 1]
    if (prev && prev.lang === lang) prev.text = `${prev.text} ${trimmed}`
    else chunks.push({ lang, text: trimmed })
  }

  for (const match of narration.matchAll(TAG)) {
    push(narration.slice(last, match.index))
    last = (match.index ?? 0) + match[0].length
    lang = match[1] ? 'native' : 'en'
  }
  push(narration.slice(last))
  return chunks
}

/** Narration as plain text, tags removed (captions, board text). */
export function stripNarrationTags(text: string): string {
  return text.replace(TAG, '').replace(/[ \t]{2,}/g, ' ').trim()
}

export interface NarrationPiece extends NarrationChunk {
  /** False for punctuation-only pieces (a "." after an English quote): shown, not spoken. */
  speakable: boolean
}

/**
 * Breaks narration into sentence-sized, language-tagged pieces for speechSynthesis:
 * Chrome silently stops an utterance after roughly 15 seconds, and a paused narration
 * restarts from the start of its current piece. Narration explained in English
 * (`allEnglish`) is English throughout, tags or not.
 */
export function narrationPieces(narration: string, allEnglish: boolean): NarrationPiece[] {
  return splitNarration(narration).flatMap((chunk) =>
    chunk.text
      .split(/(?<=[.!?…])\s+/)
      .map((text) => text.trim())
      .filter(Boolean)
      .map((text) => ({
        lang: allEnglish ? 'en' : chunk.lang,
        text,
        speakable: /[\p{L}\p{N}]/u.test(text),
      })),
  )
}
