import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getUserFromRequest, supabaseAdmin } from '../_lib/supabaseAdmin.js'
import { getUserRole } from '../_lib/roles.js'

interface DisconnectRequestBody {
  otherUserId: string
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const user = await getUserFromRequest(req)
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const body = req.body as DisconnectRequestBody
  const otherUserId = body.otherUserId
  if (!otherUserId) {
    res.status(400).json({ error: 'Missing otherUserId' })
    return
  }

  const role = await getUserRole(user.id)
  const matchColumns =
    role === 'teacher'
      ? { teacher_id: user.id, student_id: otherUserId }
      : { student_id: user.id, teacher_id: otherUserId }

  const { data, error } = await supabaseAdmin
    .from('teacher_student_links')
    .update({ status: 'revoked', revoked_at: new Date().toISOString() })
    .match({ ...matchColumns, status: 'active' })
    .select('id')

  if (error) {
    res.status(500).json({ error: 'Failed to disconnect' })
    return
  }

  if (!data || data.length === 0) {
    res.status(404).json({ error: 'No active connection found' })
    return
  }

  res.status(200).json({ ok: true })
}
