import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getUserFromRequest, supabaseAdmin } from './_lib/supabaseAdmin.js'
import { resolveTensePolicy } from './_lib/tenseExplorerSettings.js'
import { parseGrammarExercisesJson, parseGrammarLessonJson } from './_lib/groq.js'
import { buildGrammarExercisesPrompt, buildGrammarLessonPrompt } from './_lib/prompts.js'
import { callModel } from './_lib/modelRouter.js'
import { logModelUsage, type LlmCallType } from './_lib/usageLog.js'
import { getModelForFeature } from './_lib/modelSettings.js'
import type { ModelId } from '../src/lib/models.js'
import { getGrammarItem, type CefrLevel, type GrammarItem } from '../src/data/grammarCurriculum.js'
import type { GrammarExerciseSet, GrammarLesson, LessonLanguage } from '../src/lib/types.js'

const GENERATION_ATTEMPTS = 2

const LESSON_LANGUAGES: LessonLanguage[] = ['hu', 'en', 'de']

// ?kind= picks what is generated and cached: the narrated board lesson (default) or the
// written practice set. Both share the model, the cache key and the fail-silent retry.
interface ContentKind<T> {
  table: 'grammar_lessons' | 'grammar_exercises'
  callType: LlmCallType
  build: typeof buildGrammarLessonPrompt
  parse: (raw: string, lang: LessonLanguage) => T
}

type KindName = 'lesson' | 'exercises'

const KINDS: { lesson: ContentKind<GrammarLesson>; exercises: ContentKind<GrammarExerciseSet> } = {
  lesson: { table: 'grammar_lessons', callType: 'grammar_lesson', build: buildGrammarLessonPrompt, parse: parseGrammarLessonJson },
  exercises: {
    table: 'grammar_exercises',
    callType: 'grammar_exercises',
    build: buildGrammarExercisesPrompt,
    parse: (raw) => parseGrammarExercisesJson(raw),
  },
}

async function readCached(
  kind: ContentKind<unknown>,
  cefrLevel: string,
  grammarItemId: string,
  modelId: ModelId,
  lang: LessonLanguage,
): Promise<unknown | null> {
  const { data, error } = await supabaseAdmin
    .from(kind.table)
    .select('content')
    .eq('cefr_level', cefrLevel)
    .eq('grammar_item_id', grammarItemId)
    .eq('model_id', modelId)
    .eq('lang', lang)
    .maybeSingle()

  if (error) {
    console.error(`Failed to read cached ${kind.table} row`, error)
    return null
  }
  return data?.content ?? null
}

/** Generates and validates, retrying once; null when both attempts fail. */
async function generate(
  kind: ContentKind<unknown>,
  item: GrammarItem,
  cefrLevel: CefrLevel,
  lang: LessonLanguage,
  modelId: ModelId,
  userId: string,
): Promise<unknown | null> {
  let lastError: unknown = null
  for (let attempt = 0; attempt < GENERATION_ATTEMPTS; attempt++) {
    try {
      const { systemPrompt, messages } = kind.build(item, cefrLevel, lang)
      const result = await callModel(modelId, systemPrompt, messages)
      const content = kind.parse(result.content, lang)
      await logModelUsage({ userId, scenarioId: item.id, callType: kind.callType, modelId, usage: result.usage })
      return content
    } catch (err) {
      lastError = err
    }
  }
  // Fail silently from the learner's perspective (see Grammar Coach brief) — nothing
  // is cached, and the UI just reverts to idle. Only logged here for aggregate visibility.
  console.error(`Grammar ${kind.table} generation failed after retries`, {
    grammarItemId: item.id,
    cefrLevel,
    lang,
    error: lastError,
  })
  return null
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await getUserFromRequest(req)
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  // The Tense Explorer's teacher settings for the caller (null = no teacher has set any).
  if (req.query.action === 'tense-explorer-policy') {
    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Method not allowed' })
      return
    }
    try {
      res.status(200).json({ policy: await resolveTensePolicy(user.id) })
    } catch (err) {
      console.error('Tense Explorer policy lookup failed', err)
      res.status(500).json({ error: 'Something went wrong' })
    }
    return
  }

  const param = (name: string) => (req.method === 'GET' ? req.query[name] : req.body?.[name]) as string | undefined
  const cefrLevel = param('cefrLevel')
  const grammarItemId = param('itemId')

  const curriculumEntry = grammarItemId ? getGrammarItem(grammarItemId) : undefined
  if (!curriculumEntry || curriculumEntry.level !== cefrLevel) {
    res.status(400).json({ error: 'Unknown grammar item' })
    return
  }
  const kindName = (param('kind') ?? 'lesson') as KindName
  if (kindName !== 'lesson' && kindName !== 'exercises') {
    res.status(400).json({ error: 'Unknown kind' })
    return
  }
  const kind: ContentKind<unknown> = KINDS[kindName]
  // The response field matches the kind: { lesson } or { exercises }.
  const field = kindName
  // Content is cached per UI language; Hungarian is the base language.
  const requestedLang = param('lang')
  const lang: LessonLanguage = LESSON_LANGUAGES.includes(requestedLang as LessonLanguage)
    ? (requestedLang as LessonLanguage)
    : 'hu'
  const modelId: ModelId = await getModelForFeature('grammarCoach')
  const { level, item } = curriculumEntry

  if (req.method === 'GET') {
    res.status(200).json({ [field]: await readCached(kind, level, item.id, modelId, lang) })
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const cached = await readCached(kind, level, item.id, modelId, lang)
  if (cached) {
    res.status(200).json({ [field]: cached })
    return
  }

  const content = await generate(kind, item, level, lang, modelId, user.id)
  if (!content) {
    res.status(502).json({ error: 'generation_failed' })
    return
  }

  const { error: insertError } = await supabaseAdmin.from(kind.table).insert({
    cefr_level: level,
    grammar_item_id: item.id,
    model_id: modelId,
    lang,
    content,
  })
  if (insertError) {
    // Someone else may have won the race and cached it first — not a failure worth
    // surfacing to the learner, who already has valid content either way.
    console.error(`Failed to cache ${kind.table} row`, insertError)
  }

  res.status(200).json({ [field]: content })
}
