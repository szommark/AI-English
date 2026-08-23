import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getUserFromRequest, nextUtcMidnight } from './_lib/supabaseAdmin.js'

// Daily session cap intentionally removed while the user base is small (see git
// history for this file — `git log -p -- api/cap-status.ts` — to reinstate the
// daily_session_counts query this endpoint used to run). The endpoint is kept
// alive, always reporting "allowed", since the frontend still calls it.

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const user = await getUserFromRequest(req)
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  res.status(200).json({
    allowed: true,
    remaining: 999,
    resetAt: nextUtcMidnight(),
  })
}
