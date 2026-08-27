import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getUserFromRequest, supabaseAdmin } from './_lib/supabaseAdmin.js'
import { parseGrammarLessonJson } from './_lib/groq.js'
import { buildGrammarLessonPrompt } from './_lib/prompts.js'
import { callModel } from './_lib/modelRouter.js'
import { isModelId, type ModelId } from '../src/lib/models.js'
import { getGrammarItem } from '../src/data/grammarCurriculum.js'
import type { GrammarLesson } from '../src/lib/types.js'

const GENERATION_ATTEMPTS = 2

async function readCachedLesson(cefrLevel: string, grammarItemId: string, modelId: ModelId): Promise<GrammarLesson | null> {
  const { data, error } = await supabaseAdmin
    .from('grammar_lessons')
    .select('content')
    .eq('cefr_level', cefrLevel)
    .eq('grammar_item_id', grammarItemId)
    .eq('model_id', modelId)
    .maybeSingle()

  if (error) {
    console.error('Failed to read cached grammar lesson', error)
    return null
  }
  return (data?.content as GrammarLesson | undefined) ?? null
}

async function logUsage(userId: string, grammarItemId: string, usage: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } | null) {
  try {
    const { error } = await supabaseAdmin.from('groq_usage_log').insert({
      user_id: userId,
      scenario_id: grammarItemId,
      call_type: 'grammar_lesson',
      prompt_tokens: usage?.prompt_tokens ?? null,
      completion_tokens: usage?.completion_tokens ?? null,
      total_tokens: usage?.total_tokens ?? null,
    })
    if (error) throw error
  } catch (err) {
    console.error('Failed to log grammar lesson usage', err)
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await getUserFromRequest(req)
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const cefrLevel = (req.method === 'GET' ? req.query.cefrLevel : req.body?.cefrLevel) as string | undefined
  const grammarItemId = (req.method === 'GET' ? req.query.itemId : req.body?.itemId) as string | undefined
  const model = req.method === 'GET' ? req.query.model : req.body?.model

  const curriculumEntry = grammarItemId ? getGrammarItem(grammarItemId) : undefined
  if (!curriculumEntry || curriculumEntry.level !== cefrLevel) {
    res.status(400).json({ error: 'Unknown grammar item' })
    return
  }
  if (!isModelId(model)) {
    res.status(400).json({ error: 'Unknown model' })
    return
  }
  const modelId = model

  if (req.method === 'GET') {
    const lesson = await readCachedLesson(curriculumEntry.level, curriculumEntry.item.id, modelId)
    res.status(200).json({ lesson })
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const cached = await readCachedLesson(curriculumEntry.level, curriculumEntry.item.id, modelId)
  if (cached) {
    res.status(200).json({ lesson: cached })
    return
  }

  let lesson: GrammarLesson | null = null
  let lastError: unknown = null

  for (let attempt = 0; attempt < GENERATION_ATTEMPTS; attempt++) {
    try {
      const { systemPrompt, messages } = buildGrammarLessonPrompt(curriculumEntry.item, curriculumEntry.level)
      const result = await callModel(modelId, systemPrompt, messages)
      lesson = parseGrammarLessonJson(result.content)
      await logUsage(user.id, curriculumEntry.item.id, result.usage)
      break
    } catch (err) {
      lastError = err
    }
  }

  if (!lesson) {
    // Fail silently from the learner's perspective (see Grammar Coach brief) — nothing
    // is cached, and the board just reverts to idle. Only logged here for aggregate visibility.
    console.error('Grammar lesson generation failed after retries', {
      grammarItemId: curriculumEntry.item.id,
      cefrLevel: curriculumEntry.level,
      error: lastError,
    })
    res.status(502).json({ error: 'generation_failed' })
    return
  }

  const { error: insertError } = await supabaseAdmin.from('grammar_lessons').insert({
    cefr_level: curriculumEntry.level,
    grammar_item_id: curriculumEntry.item.id,
    model_id: modelId,
    content: lesson,
  })
  if (insertError) {
    // Someone else may have won the race and cached it first — not a failure worth
    // surfacing to the learner, who already has a valid lesson to play either way.
    console.error('Failed to cache grammar lesson', insertError)
  }

  res.status(200).json({ lesson })
}
