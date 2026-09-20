import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getUserFromRequest, supabaseAdmin } from './_lib/supabaseAdmin.js'
import { parseGrammarLessonJson } from './_lib/groq.js'
import { buildGrammarLessonPrompt } from './_lib/prompts.js'
import { callModel } from './_lib/modelRouter.js'
import { logModelUsage } from './_lib/usageLog.js'
import { getModelForFeature } from './_lib/modelSettings.js'
import type { ModelId } from '../src/lib/models.js'
import { getGrammarItem } from '../src/data/grammarCurriculum.js'
import type { GrammarLesson, LessonLanguage } from '../src/lib/types.js'

const GENERATION_ATTEMPTS = 2

const LESSON_LANGUAGES: LessonLanguage[] = ['hu', 'en', 'de']

async function readCachedLesson(
  cefrLevel: string,
  grammarItemId: string,
  modelId: ModelId,
  lang: LessonLanguage,
): Promise<GrammarLesson | null> {
  const { data, error } = await supabaseAdmin
    .from('grammar_lessons')
    .select('content')
    .eq('cefr_level', cefrLevel)
    .eq('grammar_item_id', grammarItemId)
    .eq('model_id', modelId)
    .eq('lang', lang)
    .maybeSingle()

  if (error) {
    console.error('Failed to read cached grammar lesson', error)
    return null
  }
  return (data?.content as GrammarLesson | undefined) ?? null
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await getUserFromRequest(req)
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const cefrLevel = (req.method === 'GET' ? req.query.cefrLevel : req.body?.cefrLevel) as string | undefined
  const grammarItemId = (req.method === 'GET' ? req.query.itemId : req.body?.itemId) as string | undefined

  const curriculumEntry = grammarItemId ? getGrammarItem(grammarItemId) : undefined
  if (!curriculumEntry || curriculumEntry.level !== cefrLevel) {
    res.status(400).json({ error: 'Unknown grammar item' })
    return
  }
  // Lessons are cached per UI language; Hungarian is the base language.
  const requestedLang = (req.method === 'GET' ? req.query.lang : req.body?.lang) as string | undefined
  const lang: LessonLanguage = LESSON_LANGUAGES.includes(requestedLang as LessonLanguage)
    ? (requestedLang as LessonLanguage)
    : 'hu'
  const modelId: ModelId = await getModelForFeature('grammarCoach')

  if (req.method === 'GET') {
    const lesson = await readCachedLesson(curriculumEntry.level, curriculumEntry.item.id, modelId, lang)
    res.status(200).json({ lesson })
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const cached = await readCachedLesson(curriculumEntry.level, curriculumEntry.item.id, modelId, lang)
  if (cached) {
    res.status(200).json({ lesson: cached })
    return
  }

  let lesson: GrammarLesson | null = null
  let lastError: unknown = null

  for (let attempt = 0; attempt < GENERATION_ATTEMPTS; attempt++) {
    try {
      const { systemPrompt, messages } = buildGrammarLessonPrompt(curriculumEntry.item, curriculumEntry.level, lang)
      const result = await callModel(modelId, systemPrompt, messages)
      lesson = parseGrammarLessonJson(result.content, lang)
      await logModelUsage({
        userId: user.id,
        scenarioId: curriculumEntry.item.id,
        callType: 'grammar_lesson',
        modelId,
        usage: result.usage,
      })
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
      lang,
      error: lastError,
    })
    res.status(502).json({ error: 'generation_failed' })
    return
  }

  const { error: insertError } = await supabaseAdmin.from('grammar_lessons').insert({
    cefr_level: curriculumEntry.level,
    grammar_item_id: curriculumEntry.item.id,
    model_id: modelId,
    lang,
    content: lesson,
  })
  if (insertError) {
    // Someone else may have won the race and cached it first — not a failure worth
    // surfacing to the learner, who already has a valid lesson to play either way.
    console.error('Failed to cache grammar lesson', insertError)
  }

  res.status(200).json({ lesson })
}
