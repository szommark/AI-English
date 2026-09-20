# Vercel billing charges — Step 0 result (2026-09-21)

Goal: find out whether a **Hobby** account returns consumption rows from
`GET /v1/billing/charges` (FOCUS v1.3 JSONL), and which `ServiceName` values map to fast data
transfer, function invocations and active CPU.

## What was tried

Via the Vercel connector available in the development session (not the app's own token):

1. `list_teams` → `{"teams": [], "pagination": {"count": 0}}`. The account is a personal Hobby
   account with no team, so there is no `teamId` to pass.
2. `list_billing_charges` for `2026-09-01T00:00:00Z` → `2026-09-21T00:00:00Z` (personal scope) →
   **404** `{"error":{"code":"costs_not_found","message":"Costs not found"}}`.

## Conclusion

No consumption rows are returned for this Hobby account, so there are no
(`ServiceName`, `ConsumedUnit`) pairs to map. Per the plan, the three Vercel meters
(`vercel.transfer_bytes`, `vercel.invocations`, `vercel.active_cpu_hours`) **stay manual**, and
no `VERCEL_API_TOKEN` / `VERCEL_TEAM_ID` wiring was added.

## Caveat / how to re-test

The check above ran through a connector with its own credentials, not a token created for this
app. To rule out a scope difference, run this once with a real token (never commit it):

```bash
curl -s -H "Authorization: Bearer $VERCEL_API_TOKEN" \
  "https://api.vercel.com/v1/billing/charges?from=2026-09-01T00:00:00.000Z&to=2026-09-21T00:00:00.000Z"
```

If that returns JSONL rows, list the distinct `ServiceName` / `ConsumedUnit` pairs here and the
mapping can be wired in a follow-up.
