import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getUserFromRequest, supabaseAdmin } from '../_lib/supabaseAdmin.js'
import { getUserRole } from '../_lib/roles.js'

const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

function generateInviteCode(): string {
  const raw = Array.from({ length: 8 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('')
  return `${raw.slice(0, 4)}-${raw.slice(4)}`
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await getUserFromRequest(req)
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const role = await getUserRole(user.id)
  if (role !== 'teacher') {
    res.status(403).json({ error: 'Forbidden' })
    return
  }

  if (req.method === 'GET') {
    const { data: existing, error } = await supabaseAdmin
      .from('teacher_invite_codes')
      .select('code')
      .eq('teacher_id', user.id)
      .maybeSingle()

    if (error) {
      res.status(500).json({ error: 'Failed to load invite code' })
      return
    }

    if (existing) {
      res.status(200).json({ code: existing.code })
      return
    }

    for (let attempt = 0; attempt < 2; attempt++) {
      const code = generateInviteCode()
      const { error: insertError } = await supabaseAdmin
        .from('teacher_invite_codes')
        .insert({ teacher_id: user.id, code })

      if (!insertError) {
        res.status(200).json({ code })
        return
      }
    }

    res.status(500).json({ error: 'Failed to generate invite code' })
    return
  }

  if (req.method === 'POST') {
    // Upsert on teacher_id (the table's primary key) rather than update, so this
    // also works the first time — a teacher who never called GET first still gets
    // a code rather than a silent no-op update matching zero rows.
    for (let attempt = 0; attempt < 2; attempt++) {
      const code = generateInviteCode()
      const { error } = await supabaseAdmin.from('teacher_invite_codes').upsert({
        teacher_id: user.id,
        code,
        use_count: 0,
        created_at: new Date().toISOString(),
      })

      if (!error) {
        res.status(200).json({ code })
        return
      }
    }

    res.status(500).json({ error: 'Failed to regenerate invite code' })
    return
  }

  res.status(405).json({ error: 'Method not allowed' })
}
