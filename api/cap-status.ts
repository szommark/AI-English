import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getUserFromRequest, nextUtcMidnight, supabaseAdmin } from './_lib/supabaseAdmin'

const DAILY_LIMIT = 3

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

  const today = new Date().toISOString().slice(0, 10)
  const { data, error } = await supabaseAdmin
    .from('daily_session_counts')
    .select('count')
    .eq('user_id', user.id)
    .eq('day', today)
    .maybeSingle()

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }

  const used = data?.count ?? 0
  const remaining = Math.max(0, DAILY_LIMIT - used)

  res.status(200).json({
    allowed: remaining > 0,
    remaining,
    resetAt: nextUtcMidnight(),
  })
}
