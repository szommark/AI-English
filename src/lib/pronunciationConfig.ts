// Single source of truth for the Pronunciation Centre's Azure caps, imported by
// both the client (to cap recording length) and the /api routes (to enforce quota).
// There is no per-user daily limit — the monthly app-wide cap is the only gate,
// protecting the shared Azure free tier across all users combined.
// This is also the timeout for the Azure round trip from the moment the mic is live (speaking
// + Azure's own trailing-silence detection before it finalizes a result, see src/lib/pronunciation.ts),
// not just recording length — 5s was too tight for that plus a slowly, deliberately spoken
// practice sentence and caused spurious deep_check_timeout failures. Raising this doesn't
// weaken the monthly budget guard below: actual billed seconds still come from the real
// recognized duration (see the true-up in api/pronunciation.ts's log action), this only raises the per-attempt
// ceiling on that.
export const DEEP_CHECK_MAX_SECONDS = 12 // per clip, client-side auto-stop
export const MONTHLY_AZURE_SECONDS_CAP = 16200 // 4.5h safety buffer under Azure F0's 5h/month

// Content id the Wordlist practice tab sends in the token/log `scenarioId` slot: wordlist
// words aren't fixed content the server can look up, so this one id stands for all of them.
export const WORDLIST_PRACTICE_CHECK_ID = 'pronunciation-wordlist-practice'

/** Wordlist / Conversation practice: how long the learner gets to repeat a text, by its length. */
export function repeatWindowSeconds(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.min(DEEP_CHECK_MAX_SECONDS, Math.max(3, Math.ceil(2 + words * 0.6)))
}

// Token/log `scenarioId` for the Sound Bank sheet's checks: `sound:<phonemeId>` (src/data/phonemes.ts).
export const SOUND_CHECK_PREFIX = 'sound:'
