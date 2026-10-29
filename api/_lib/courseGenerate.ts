import { supabaseAdmin } from './supabaseAdmin.js'
import { callModel } from './modelRouter.js'
import type { ModelId } from '../../src/lib/models.js'
import { logModelUsage } from './usageLog.js'
import { utcDayStart } from './vocabPractice.js'
import { getGrammarItem } from '../../src/data/grammarCurriculum.js'
import { GAP } from '../../src/lib/grammarExercises.js'
import {
  CourseValidationError,
  READING_WORDS,
  VOCAB_COUNT,
  grammarTitle,
  normalizeSteps,
  sanitizeBlueprint,
  sanitizeModuleContent,
  type CourseBlueprint,
  type CourseLevel,
  type CourseStep,
  type ExplainLang,
  type ModuleContent,
  type ModuleKind,
  type ModulePassage,
  type ModuleVariant,
} from '../../src/lib/courses.js'

// AI generation for mini courses (src/lib/courses.ts): one call writes a unit's outline (can-dos,
// word set, what the text is about), then one call per module writes its steps from that
// outline. Replies are parsed leniently — a broken step is dropped, not the module — and then
// validated like a teacher's save; the teacher reviews and edits everything before publishing.

export const COURSE_CALL_TYPE = 'course_gen'

export async function courseGenerationsToday(userId: string, now = new Date()): Promise<number> {
  const { count, error } = await supabaseAdmin
    .from('groq_usage_log')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('call_type', COURSE_CALL_TYPE)
    .gte('created_at', utcDayStart(now).toISOString())
  if (error) throw error
  return count ?? 0
}

const LEVEL_GUIDE: Record<CourseLevel, string> = {
  A1: 'A1: very short, simple sentences; present simple, can, there is/are; the most common everyday words; concrete, familiar situations.',
  A2: 'A2: short simple sentences joined with and/but/because; past simple, going to, comparatives; everyday vocabulary; routine, personal and practical topics.',
  B1: 'B1: clear connected text on familiar topics; a range of tenses; opinions with reasons; mostly frequent vocabulary with a few less common words clear from context.',
  B2: 'B2: detailed text with a point of view; complex sentences; some idiomatic language; abstract as well as concrete topics.',
  C1: 'C1: long, demanding text with implicit meaning; sophisticated structures and less frequent vocabulary; nuance and register.',
  C2: 'C2: complex, nuanced text; idiomatic and abstract language; subtle implication and stance.',
}

const LANG_NAME: Record<ExplainLang, string> = { hu: 'Hungarian', en: 'English', de: 'German' }

/** The unit's grammar points for the prompt, with the curriculum's Hungarian-learner hint. */
function grammarList(ids: string[]): { title: string; hint?: string }[] {
  return ids.map((id) => {
    const item = getGrammarItem(id)?.item
    return { title: grammarTitle(id), ...(item?.hint ? { hint: item.hint } : {}) }
  })
}

// --- Unit outline ---------------------------------------------------------------------------

export interface BlueprintInput {
  level: CourseLevel
  courseTopic: string
  unitTopic: string
  grammarIds: string[]
  kinds: ModuleKind[]
  notes: string
  /** Earlier units of the course: their words and grammar are recycled, not re-taught. */
  previous: { topic: string; words: string[]; grammar: string[] }[]
}

export interface GeneratedBlueprint {
  title: string
  blueprint: CourseBlueprint
}

export function buildBlueprintPrompt(input: BlueprintInput): { systemPrompt: string; user: string } {
  const systemPrompt = [
    `You plan one unit of a modern English coursebook for adult and teenage learners at CEFR level ${input.level}. The learners study alone on a phone, about 10 minutes at a time.`,
    LEVEL_GUIDE[input.level],
    'The unit has these modules, in this order (the user message\'s "modules"); later, each module is written from your plan.',
    'Reply with ONE JSON object and nothing else:',
    '{ "title": a short, friendly unit title (2–5 words),',
    '  "canDos": 2–3 short learner goals starting "I can …", achievable by the end of this unit,',
    `  "words": exactly ${VOCAB_COUNT[input.level]} useful words or short phrases for the unit topic at this level: each { "term", "pos" (noun, verb, adjective, adverb, phrase…), "meaning": a short learner-friendly English definition (no translation), "example": one natural example sentence using the term },`,
    `  "passageBrief": 2–3 sentences describing the unit's main reading text (about ${READING_WORDS[input.level]} words): its genre (blog post, email, article, story, interview, review…), situation and what happens, so it naturally uses the words and the grammar,`,
    '  "grammarNotes": 1–2 sentences on how the grammar point(s) appear naturally in that text and what learners should notice }',
    'Pick words learners at this level really need for the topic; avoid words they certainly know already. Words already taught in earlier units of the course ("previousUnits") must not be repeated in "words".',
  ].join('\n')
  return {
    systemPrompt,
    user: JSON.stringify({
      level: input.level,
      courseTopic: input.courseTopic || input.unitTopic,
      unitTopic: input.unitTopic,
      grammar: grammarList(input.grammarIds),
      modules: input.kinds,
      ...(input.notes ? { teacherNotes: input.notes } : {}),
      ...(input.previous.length ? { previousUnits: input.previous } : {}),
    }),
  }
}

export function parseBlueprint(raw: string): GeneratedBlueprint {
  const parsed = parseJson(raw)
  const title = typeof parsed.title === 'string' && parsed.title.trim() ? parsed.title.trim().slice(0, 160) : ''
  return { title, blueprint: sanitizeBlueprint(parsed) }
}

// --- Modules --------------------------------------------------------------------------------

export interface ModuleGenInput {
  kind: ModuleKind
  variant: ModuleVariant | null
  level: CourseLevel
  explainLang: ExplainLang
  unitTopic: string
  grammarIds: string[]
  blueprint: CourseBlueprint
  /** The unit's first reading text (grammar and unit check refer back to it; Reading 2 must differ). */
  passage: ModulePassage | null
  /** Earlier units' words, recycled in this unit's check. */
  previousWords: string[]
}

const STEP_SCHEMA = [
  'Step types (each step is one phone screen; keep every text short):',
  '- { "type": "info", "title", "body" }: something to read — paragraphs separated by blank lines, **bold** for key words; at most 80 words.',
  '- { "type": "choice", "prompt", "options": [2–4 strings], "answer": the index (0-based) of the right option, "explain": one short sentence why }',
  `- { "type": "gap", "sentence": one sentence with exactly one gap written as ${GAP}, "accepted": [the right answer, plus up to 2 equally correct variants], "options": [3–4 words or phrases to choose from, including the answer] (omit "options" for a typed answer), "explain": one short sentence }`,
  '- { "type": "match", "prompt", "pairs": [{ "left", "right" }, …] }: 4–6 pairs; every right item different.',
  '- { "type": "order", "prompt", "answer": one correct sentence of 4–10 words } (the app shuffles its words into tiles).',
  'Every question has exactly one clearly right answer. Vary which option is right.',
]

function recipe(input: ModuleGenInput): string[] {
  const typed = input.level === 'A1' || input.level === 'A2' ? 'with "options"' : 'about half with "options", half typed'
  const explainIn = LANG_NAME[input.explainLang]
  switch (input.kind) {
    case 'vocabulary':
      return [
        'This is the Vocabulary module: the learner meets the unit\'s words (the app shows the word cards right after your first step) and practises them.',
        'Reply with ONE JSON object: { "intro": one sentence telling the learner what they will do, "steps": [...] } with these steps in order:',
        '1. info: "Warm-up" — one or two questions to think about the topic, personal and easy.',
        '2. match: the first half of the words (term → meaning).',
        '3. match: the other half of the words (term → meaning).',
        '4–8. five gap steps: new sentences (not the examples) that need one of the words, each with "options" from the word list.',
        '9–10. two choice steps: "Which word …?" or a short situation where one word fits best.',
        'Use only words from "words".',
      ]
    case 'reading':
      return [
        `This is the ${input.variant === 'second' ? 'second Reading module (Reading 2): a NEW text on the same topic, different from "firstPassage", recycling the words and grammar' : 'Reading module: the unit\'s main text'}.`,
        `Write the text from "passageBrief"${input.variant === 'second' ? ' but from another angle (another genre, person or situation)' : ''}: about ${READING_WORDS[input.level]} words, with a title, paragraphs separated by blank lines. Use at least half of "words" and the grammar point(s) several times, naturally — it must not read like an exercise.`,
        'Reply with ONE JSON object: { "intro": one sentence, "passage": { "title", "text" }, "steps": [...] } with these steps in order (the app shows the text right after your first step, and the learner can open it again on every question):',
        '1. info: "Before you read" — one prediction question about the title or topic.',
        '2–3. two choice steps on the main idea (gist).',
        '4–7. four choice steps on details, in text order; two of them with options ["True", "False"].',
        `8–9. two gap steps: sentences that summarise part of the text, the answer copied from the text, ${typed}.`,
        'Questions test understanding of the text, never world knowledge.',
      ]
    case 'grammar':
      return [
        'This is the Grammar module: guided discovery from the unit\'s reading text ("firstPassage"), then practice.',
        'Reply with ONE JSON object: { "intro": one sentence, "steps": [...] } with these steps in order:',
        '1. choice: "Find it in the text" — which of 3–4 sentences (one quoted from the text) uses the target structure.',
        `2. info: "Grammar box" — written in ${explainIn}: the form (pattern) and the use in 2–4 short lines, then 2–3 English example sentences in **bold**; aimed at Hungarian learners (mention the typical mistake if there is one).`,
        `3–5. three gap steps practising the form, ${typed}; "explain" in ${explainIn}.`,
        `6–7. two choice steps: pick the correct sentence or form; "explain" in ${explainIn}.`,
        '8–9. two order steps: build a sentence with the structure.',
        'Use the unit topic and words in the sentences. Only the grammar box and "explain" texts are in ' + explainIn + '; everything else is in English.',
      ]
    case 'unit_check':
      return [
        'This is the Unit check, the last module: a short mixed quiz on the whole unit. No info steps.',
        'Reply with ONE JSON object: { "intro": one sentence, "steps": [...] } with 9 question steps, mixed:',
        '- three on the unit\'s words (gap with options, choice or match),',
        '- three on the grammar point(s) (gap, choice or order),',
        '- two choice steps on the reading text ("firstPassage"),',
        input.previousWords.length
          ? '- one gap or choice step recycling a word from an earlier unit ("previousWords").'
          : '- one more step on the words.',
        'Every item must be new (not copied from the earlier modules\' exercises).',
      ]
    default:
      throw new CourseValidationError(`${input.kind} modules can't be generated yet`)
  }
}

export function buildModulePrompt(input: ModuleGenInput): { systemPrompt: string; user: string } {
  const systemPrompt = [
    `You write one module of a modern English coursebook unit for learners at CEFR level ${input.level}, studying alone on a phone.`,
    LEVEL_GUIDE[input.level],
    ...recipe(input),
    ...STEP_SCHEMA,
  ].join('\n')
  return {
    systemPrompt,
    user: JSON.stringify({
      level: input.level,
      unitTopic: input.unitTopic,
      grammar: grammarList(input.grammarIds),
      grammarNotes: input.blueprint.grammarNotes,
      words: input.blueprint.words.map((w) => ({ term: w.term, meaning: w.meaning })),
      ...(input.kind === 'reading' ? { passageBrief: input.blueprint.passageBrief } : {}),
      ...(input.passage && input.kind !== 'vocabulary' ? { firstPassage: input.passage } : {}),
      ...(input.kind === 'unit_check' && input.previousWords.length ? { previousWords: input.previousWords.slice(0, 30) } : {}),
    }),
  }
}

function parseJson(raw: string): Record<string, unknown> {
  const cleaned = raw.trim().replace(/^```(json)?/i, '').replace(/```$/, '').trim()
  const parsed = JSON.parse(cleaned) as unknown
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('reply is not an object')
  return parsed as Record<string, unknown>
}

/** Models write answers as letters or 1-based numbers now and then. */
function choiceIndex(v: unknown, count: number): unknown {
  if (typeof v === 'string') {
    const t = v.trim()
    if (/^[A-Da-d]$/.test(t)) return t.toUpperCase().charCodeAt(0) - 65
    if (/^\d+$/.test(t)) return Number(t)
  }
  if (typeof v === 'number' && v === count) return v - 1
  return v
}

/** Every step that validates on its own, in order (a broken one is dropped). */
function lenientSteps(raw: unknown): CourseStep[] {
  const steps: CourseStep[] = []
  for (const s of Array.isArray(raw) ? raw : []) {
    if (!s || typeof s !== 'object') continue
    const step = { ...(s as Record<string, unknown>) }
    if (step.type === 'choice') step.answer = choiceIndex(step.answer, Array.isArray(step.options) ? step.options.length : 0)
    if (step.type === 'gap' && typeof step.sentence === 'string') step.sentence = step.sentence.replace(/_{3,}/, GAP)
    try {
      steps.push(sanitizeModuleContent({ steps: [step] }).steps[0])
    } catch {
      // dropped
    }
  }
  return steps
}

/** The minimum of question steps a generated module must keep to be usable. */
const MIN_QUESTIONS = 4

export function parseModule(raw: string, input: ModuleGenInput): ModuleContent {
  const parsed = parseJson(raw)
  let steps = lenientSteps(parsed.steps)
  if (input.kind === 'unit_check') steps = steps.filter((s) => s.type !== 'info')
  if (steps.filter((s) => s.type !== 'info').length < MIN_QUESTIONS) throw new Error('too few usable steps')

  let passage: ModulePassage | undefined
  if (input.kind === 'reading') {
    const p = parsed.passage && typeof parsed.passage === 'object' ? (parsed.passage as Record<string, unknown>) : {}
    const text = typeof p.text === 'string' ? p.text.trim() : ''
    if (text.split(/\s+/).length < 40) throw new Error('reading text missing or too short')
    passage = { title: typeof p.title === 'string' ? p.title.trim().slice(0, 160) : '', text }
    // The text comes right after the first (warm-up) step.
    const at = steps[0]?.type === 'info' ? 1 : 0
    steps.splice(at, 0, { id: '', type: 'text' })
  } else if (input.passage && input.kind !== 'vocabulary') {
    passage = input.passage
  }
  if (input.kind === 'vocabulary') {
    const at = steps[0]?.type === 'info' ? 1 : 0
    steps.splice(at, 0, { id: '', type: 'words', words: input.blueprint.words })
  }

  const intro = typeof parsed.intro === 'string' ? parsed.intro.trim().slice(0, 300) : ''
  return sanitizeModuleContent({ intro, ...(passage ? { passage } : {}), steps: normalizeSteps(steps) })
}

// --- Model calls ----------------------------------------------------------------------------

/** Like the comprehension tests: GPT-OSS 120B with JSON mode, Gemini as the fallback. */
const COURSE_MODEL: ModelId = 'groq-gpt-oss-120b'
const FALLBACK_MODEL: ModelId = 'gemini-3.1-flash-lite'

async function generate<T>(systemPrompt: string, user: string, userId: string, parse: (raw: string) => T): Promise<T> {
  const attempts = [
    { modelId: COURSE_MODEL, json: true, maxTokens: 8000, reasoningEffort: 'medium' as const, temperature: 0.7 },
    { modelId: COURSE_MODEL, json: false, maxTokens: 8000, reasoningEffort: 'low' as const, temperature: 0.7 },
    { modelId: FALLBACK_MODEL, json: true, maxTokens: 9000, temperature: 0.7 },
  ]
  let lastError: unknown = null
  for (const { modelId, ...options } of attempts) {
    try {
      const result = await callModel(modelId, systemPrompt, [{ role: 'user', content: user }], options)
      await logModelUsage({ userId, scenarioId: 'teacher-tools', callType: COURSE_CALL_TYPE, modelId, usage: result.usage })
      return parse(result.content)
    } catch (err) {
      lastError = err
      console.warn('Course model call failed', { modelId, json: options.json, error: String(err).slice(0, 300) })
    }
  }
  throw lastError
}

export function generateBlueprint(input: BlueprintInput, userId: string): Promise<GeneratedBlueprint> {
  const { systemPrompt, user } = buildBlueprintPrompt(input)
  return generate(systemPrompt, user, userId, parseBlueprint)
}

export function generateModule(input: ModuleGenInput, userId: string): Promise<ModuleContent> {
  const { systemPrompt, user } = buildModulePrompt(input)
  return generate(systemPrompt, user, userId, (raw) => parseModule(raw, input))
}

