// Single source of truth for the Azure Deep Check caps, imported by both the
// client (to cap recording length) and the /api routes (to enforce quota).
// Test-phase values — see the implementation plan for why these numbers were chosen.
// Lower DAILY_DEEP_CHECK_LIMIT before inviting non-test users.
export const DAILY_DEEP_CHECK_LIMIT = 10 // per user, per UTC day
export const DEEP_CHECK_MAX_SECONDS = 8 // per clip, client-side auto-stop
export const MONTHLY_AZURE_SECONDS_CAP = 16200 // 4.5h safety buffer under Azure F0's 5h/month
