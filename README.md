# AI-English

A spoken English practice tool for Hungarian learners. Standalone product — separate
codebase, repo, and Supabase project from "Több mint angol".

Pick a holiday scenario (checking into a hotel, ordering food, asking for directions,
airport check-in), then either:

- **Rehearsal mode** — see example phrases and a sample script first, then have your own
  live spoken conversation with an AI playing the other role.
- **Test mode** — go straight into the live spoken conversation, no examples shown.

Every session ends with written feedback: strengths, plus specific grammar/vocabulary/
phrasing corrections with original vs. corrected lines.

## Stack

- React + TypeScript + Vite, Tailwind CSS
- Browser-native Web Speech API for STT/TTS (client-side, Chrome recommended)
- Groq (`llama-3.1-8b-instant`, OpenAI-compatible endpoint) for conversation + feedback
  generation, called only from Vercel serverless functions in `/api` — the Groq key is
  never exposed to the client
- Supabase (Postgres + Auth) for auth and session/usage logging
- Deployed on Vercel

## Project structure

```
src/            React app (pages, components, hooks, Supabase client, scenario data)
api/            Vercel serverless functions (Groq calls, cap check) — server-only
api/_lib/       Shared server helpers (not deployed as routes — Vercel ignores `_`-prefixed files)
supabase/       SQL migrations for this app's dedicated Supabase project
```

## Local setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill in the values (see below).
3. To exercise the full app, including `/api` (Groq calls, cap check), run two processes:
   - `npx vercel dev` — serves the serverless functions on `http://localhost:3000`
     (first run will prompt you to link the local folder to a Vercel project)
   - `npm run dev` — the Vite dev server on `http://localhost:5173`, which proxies
     `/api/*` requests to the `vercel dev` instance (see `vite.config.ts`)

   Running `npm run dev` alone still works for UI-only iteration, but `/api` calls will
   404 since Vite doesn't execute serverless functions itself.

### Environment variables

| Variable | Where used | Notes |
|---|---|---|
| `VITE_SUPABASE_URL` | client | This app's dedicated Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | client | Anon/public key — safe to expose, protected by RLS |
| `SUPABASE_URL` | server (`/api`) | Same project URL, read from `process.env` |
| `SUPABASE_SERVICE_ROLE_KEY` | server (`/api`) | Bypasses RLS to verify users and write logs — **never expose to the client** |
| `GROQ_API_KEY` | server (`/api`) | **Never expose to the client** |
| `GEMINI_API_KEY` | server (`/api`) | Powers Tutor Bot (`gemini-3.1-flash-lite`) — **never expose to the client** |

## Supabase schema

`supabase/migrations/20260723120000_init.sql` defines:

- `sessions` — one row per completed rehearsal/test session (scenario, mode, full
  transcript, structured feedback JSON, timestamp), RLS-protected so users can only read
  their own rows. Writes happen only via the service role from `/api`.
- `daily_session_counts` / `increment_daily_session_count(user_id, max)` — the daily
  session cap's storage and enforcement function. **Unused as of the cap removal below**
  (kept in place so the cap can be reinstated by calling the RPC again — see git history
  for `api/chat.ts` and `api/cap-status.ts`).
- `groq_usage_log` — token usage (prompt/completion/total) for every Groq/Gemini call,
  tagged by call type (`chat`, `feedback`, or `tutor_chat`), so real consumption can be
  checked against estimates.

Apply migrations to a Supabase project with the Supabase CLI:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

## Cost controls (Groq/Gemini free tiers)

- The daily session cap is **removed for now** while the user base is small (a handful
  of users) — `api/chat.ts` and `api/cap-status.ts` no longer enforce it. See git
  history for those files to reinstate it.
- Tutor Bot (`api/tutor-chat.ts`) has one soft anti-runaway guard instead of a cap: past
  `turnIndex` 40 it returns a wrap-up reply instead of calling Gemini again — a safety
  net against a stuck client, not a business rule.
- Every Groq/Gemini call retries on rate-limit/overload responses with exponential
  backoff (1s, 2s, 4s).
- Only the system prompt plus the last 3-4 turns are sent per turn; for the fixed
  scenarios, the full transcript is accumulated client-side and sent once, at the end
  of the session, for the feedback call and for persisting to `sessions`.
- Rehearsal mode's example phrases/script are static data (`src/data/scenarios.ts`) —
  no Groq call. Only the live conversation and end-of-session feedback call Groq, in
  both rehearsal and test mode. Tutor Bot calls Gemini instead of Groq and does not
  generate end-of-session feedback in this pass.

## Deploying to Vercel

1. In the Vercel dashboard, **Import Project** from the `szommark/AI-English` GitHub repo.
   Vercel auto-detects the Vite framework.
2. Add the environment variables listed above under Project Settings → Environment
   Variables (for Production, Preview, and Development as needed).
3. Deploy. `vercel.json` adds an SPA rewrite so client-side routes (e.g.
   `/scenario/hotel-checkin/test`) resolve correctly on refresh, while leaving `/api/*`
   routed to the serverless functions.
