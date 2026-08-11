// Single source of truth for the Pronunciation Centre's Azure caps, imported by
// both the client (to cap recording length) and the /api routes (to enforce quota).
// There is no per-user daily limit — the monthly app-wide cap is the only gate,
// protecting the shared Azure free tier across all users combined.
export const DEEP_CHECK_MAX_SECONDS = 5 // per clip, client-side auto-stop
export const MONTHLY_AZURE_SECONDS_CAP = 16200 // 4.5h safety buffer under Azure F0's 5h/month
