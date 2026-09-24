import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getUserFromRequest } from './_lib/supabaseAdmin.js'
import { getUserRole } from './_lib/roles.js'
import { enrichTerms } from './_lib/vocabEnrichment.js'
import type { CefrLevel } from './_lib/prompts.js'
import { LIST_MAX_ITEMS, normalizeTerm } from '../src/lib/vocab.js'

// Single Vercel function for the whole Vocabulary Builder surface
// (docs/vocabulary-builder-design.md §9), multiplexed by ?action= to stay under Vercel
// Hobby's 12-serverless-function cap — same pattern as api/connect.ts.
//
// Phase 1: enrich. Planned for later phases: lists, list, assign (teacher, Phase 2);
// session, review, cards, remove (student, Phase 3+).

const CEFR_LEVELS = new Set<string>(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])

interface EnrichRequestBody {
  terms?: unknown
  cefrHint?: unknown
}

async function handleEnrich(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const role = await getUserRole(userId)
  if (role !== 'teacher' && role !== 'admin') {
    res.status(403).json({ error: 'Forbidden' })
    return
  }

  const body = (req.body ?? {}) as EnrichRequestBody
  if (!Array.isArray(body.terms) || !body.terms.every((t): t is string => typeof t === 'string')) {
    res.status(400).json({ error: 'terms must be an array of strings' })
    return
  }
  const distinctCount = new Set(body.terms.map(normalizeTerm).filter(Boolean)).size
  if (distinctCount === 0) {
    res.status(400).json({ error: 'terms is empty' })
    return
  }
  if (distinctCount > LIST_MAX_ITEMS) {
    res.status(400).json({ error: `At most ${LIST_MAX_ITEMS} distinct terms per request` })
    return
  }
  if (body.cefrHint !== undefined && !(typeof body.cefrHint === 'string' && CEFR_LEVELS.has(body.cefrHint))) {
    res.status(400).json({ error: 'Invalid cefrHint' })
    return
  }

  // 200 even when some or all items failed — each item carries its own status.
  const items = await enrichTerms(body.terms, {
    userId,
    cefrHint: body.cefrHint as CefrLevel | undefined,
  })
  res.status(200).json({ items })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await getUserFromRequest(req)
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  switch (req.query.action) {
    case 'enrich':
      await handleEnrich(req, res, user.id)
      return
    default:
      res.status(404).json({ error: 'Not found' })
  }
}
