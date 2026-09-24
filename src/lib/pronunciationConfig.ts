// Single source of truth for the Pronunciation Centre's Azure caps, imported by
// both the client (to cap recording length) and the /api routes (to enforce quota).
// There is no per-user daily limit — the monthly app-wide cap is the only gate,
// protecting the shared Azure free tier across all users combined.
// This is also the wall-clock timeout for the whole Azure round trip (mic connect + speaking
// + Azure's own trailing-silence detection before it finalizes a result, see src/lib/pronunciation.ts),
// not just recording length — 5s was too tight for that plus a slowly, deliberately spoken
// practice sentence and caused spurious deep_check_timeout failures. Raising this doesn't
// weaken the monthly budget guard below: actual billed seconds still come from the real
// recognized duration (see the true-up in api/pronunciation.ts's log action), this only raises the per-attempt
// ceiling on that.
export const DEEP_CHECK_MAX_SECONDS = 12 // per clip, client-side auto-stop
export const MONTHLY_AZURE_SECONDS_CAP = 16200 // 4.5h safety buffer under Azure F0's 5h/month
