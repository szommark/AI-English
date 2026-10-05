// Turn-taking helpers shared by Tutor Bot and the speaking exam's examiner.

// Without headphones, the bot's own TTS audio can leak back into the mic (no echo
// cancellation on the Web Speech API's capture, unlike a WebRTC call). Waiting a beat
// before reopening the mic lets any trailing playback/room reverb settle first.
export const LISTEN_START_DELAY_MS = 500

// Second line of defense against that same leak: if the mic capture is suspiciously
// similar to what the bot itself just said, treat it as echo rather than a real turn.
// Kept conservative (high overlap, longer minimum) — learners often echo back
// words from the bot's own question as part of a natural answer, so this should only catch
// near-verbatim repeats, not just shared vocabulary.
const ECHO_OVERLAP_THRESHOLD = 0.85
const ECHO_MIN_WORDS = 6

function normalizeWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

export function looksLikeEcho(candidate: string, lastAssistantText: string | undefined): boolean {
  if (!lastAssistantText) return false
  const candidateWords = normalizeWords(candidate)
  if (candidateWords.length < ECHO_MIN_WORDS) return false
  const assistantWords = new Set(normalizeWords(lastAssistantText))
  if (assistantWords.size === 0) return false
  const shared = candidateWords.filter((w) => assistantWords.has(w)).length
  return shared / candidateWords.length >= ECHO_OVERLAP_THRESHOLD
}
