import { supabaseAdmin } from './supabaseAdmin.js'
import { callModel } from './modelRouter.js'
import type { ModelId } from '../../src/lib/models.js'
import { logModelUsage } from './usageLog.js'
import { utcDayStart } from './vocabPractice.js'
import { getGrammarItem } from '../../src/data/grammarCurriculum.js'
import { GAP } from '../../src/lib/grammarExercises.js'
import {
  CourseValidationError,
  LISTENING_WORDS,
  READING_WORDS,
  SPEAKING_SECONDS,
  VOCAB_COUNT,
  WRITING_WORDS,
  sanitizeFeedback,
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
  type OpenFeedback,
} from '../../src/lib/courses.js'

// AI generation for mini courses (src/lib/courses.ts): one call writes a unit's outline (can-dos,
// word set, what the text is about), then one call per module writes its steps from that
// outline. Replies are parsed leniently — a broken step is dropped, not the module — and then
// validated like a teacher's save; the teacher reviews and edits everything before publishing.

export const COURSE_CALL_TYPE = 'course_gen'
/** AI feedback on a learner's written or spoken answer (student and teacher preview). */
export const FEEDBACK_CALL_TYPE = 'course_feedback'

export async function courseGenerationsToday(userId: string, now = new Date(), callType: typeof COURSE_CALL_TYPE | typeof FEEDBACK_CALL_TYPE = COURSE_CALL_TYPE): Promise<number> {
  const { count, error } = await supabaseAdmin
    .from('groq_usage_log')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('call_type', callType)
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

/** Added when the teacher picked no grammar points (a unit without a Grammar module may have none). */
const NO_GRAMMAR = 'This unit has no grammar focus: wherever these instructions mention the grammar point(s), leave that part out and use language natural for the level.'

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
  /** The teacher's own text for the unit's first reading or listening module. */
  sourceText?: string
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
    input.sourceText
      ? '  "passageBrief": 1–2 sentences describing the teacher\'s text ("teacherText"): its genre and what it is about,'
      : `  "passageBrief": 2–3 sentences describing the unit's main text (a reading text of about ${READING_WORDS[input.level]} words, or a listening script if the first text module is Listening): its genre (blog post, email, article, story, interview, podcast, conversation…), situation and what happens, so it naturally uses the words and the grammar,`,
    '  "grammarNotes": 1–2 sentences on how the grammar point(s) appear naturally in that text and what learners should notice }',
    'Pick words learners at this level really need for the topic; avoid words they certainly know already. Words already taught in earlier units of the course ("previousUnits") must not be repeated in "words".',
    input.sourceText ? 'The unit is built around the teacher\'s own text ("teacherText"): take the words from it (as they appear in it) wherever you can.' : '',
    input.grammarIds.length ? '' : `${NO_GRAMMAR} Reply "grammarNotes": "".`,
  ]
    .filter(Boolean)
    .join('\n')
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
      ...(input.sourceText ? { teacherText: input.sourceText.slice(0, 4_000) } : {}),
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
  /** First reading/listening module only: the teacher's own text, used as it is. */
  sourceText?: string
}

const STEP_SCHEMA = [
  'Step types (each step is one phone screen; keep every text short):',
  '- { "type": "info", "title", "body" }: something to read — paragraphs separated by blank lines, **bold** for key words; at most 80 words.',
  '- { "type": "choice", "prompt", "options": [2–4 strings], "answer": the index (0-based) of the right option, "explain": one short sentence why }',
  `- { "type": "gap", "sentence": one sentence with exactly one gap written as ${GAP}, "accepted": [the right answer, plus up to 2 equally correct variants], "options": [3–4 words or phrases to choose from, including the answer] (omit "options" for a typed answer), "explain": one short sentence }`,
  '- { "type": "match", "prompt", "pairs": [{ "left", "right" }, …] }: 4–6 pairs; every right item different.',
  '- { "type": "order", "prompt", "answer": one correct sentence of 4–10 words } (the app shuffles its words into tiles).',
  '- { "type": "write", "prompt": the writing task (who to, why, what to include), "minWords", "maxWords", "model": a model answer within the word range, "targets": 3–5 of the unit\'s words to use }',
  '- { "type": "speak", "prompt": what to say (a question, a situation or a long-turn task), "seconds": how long to talk, "model": a model answer, "modelFirst": true to show the model before the learner speaks, "targets": 3–5 of the unit\'s words to use }',
  'Every question has exactly one clearly right answer. Vary which option is right.',
]

function recipe(input: ModuleGenInput): string[] {
  const typed = input.level === 'A1' || input.level === 'A2' ? 'with "options"' : 'about half with "options", half typed'
  const explainIn = LANG_NAME[input.explainLang]
  const [minW, maxW] = WRITING_WORDS[input.level]
  const secs = SPEAKING_SECONDS[input.level]
  const own = !!input.sourceText
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
        own
          ? 'The text is the teacher\'s own ("teacherText"): do NOT write a new one or change it; give it a short "title" if it has none.'
          : `Write the text from "passageBrief"${input.variant === 'second' ? ' but from another angle (another genre, person or situation)' : ''}: about ${READING_WORDS[input.level]} words, with a title, paragraphs separated by blank lines. Use at least half of "words" and the grammar point(s) several times, naturally — it must not read like an exercise.`,
        `Reply with ONE JSON object: { "intro": one sentence, "passage": { "title"${own ? '' : ', "text"'} }, "steps": [...] } with these steps in order (the app shows the text right after your first step, and the learner can open it again on every question):`,
        '1. info: "Before you read" — one prediction question about the title or topic.',
        '2–3. two choice steps on the main idea (gist).',
        '4–7. four choice steps on details, in text order; two of them with options ["True", "False"].',
        `8–9. two gap steps: sentences that summarise part of the text, the answer copied from the text, ${typed}.`,
        'Questions test understanding of the text, never world knowledge.',
      ]
    case 'listening':
      return [
        `This is the ${input.variant === 'second' ? 'second Listening module (Listening 2): a NEW recording on the same topic, different from "firstPassage", recycling the words and grammar' : 'Listening module: the unit\'s main recording'}. The app reads the script aloud with text-to-speech; the learner only hears it (the transcript is shown at the very end).`,
        own
          ? 'The script is the teacher\'s own ("teacherText"): do NOT write a new one or change it; give it a short "title" and say whether it is a "monologue" or a "dialogue".'
          : `Write the script from "passageBrief"${input.variant === 'second' ? ' but from another angle (another speaker, genre or situation)' : ''}: about ${LISTENING_WORDS[input.level]} words of natural spoken English (contractions, light fillers). Either a monologue (talk, podcast segment, voicemail, announcement) in paragraphs, or a dialogue between two people where every line starts with the speaker's first name and a colon ("Anna: …"). No stage directions or sound effects. Use at least half of "words" and the grammar point(s), naturally.`,
        `Reply with ONE JSON object: { "intro": one sentence, "passage": { "title"${own ? '' : ', "text"'}, "style": "monologue" | "dialogue" }, "steps": [...] } with these steps in order (the app plays the recording right after your first step, and the learner can play it again on every question):`,
        '1. info: "Before you listen" — one prediction question about the situation.',
        '2–3. two choice steps on the main idea (who, where, why).',
        '4–6. three choice steps on details that are clearly spoken, in order; two of them with options ["True", "False"].',
        `7–8. two gap steps: sentences about the recording, the answer is a word or two heard in it, ${typed}.`,
        'Questions test what is said, never spelling or world knowledge.',
      ]
    case 'writing':
      if (input.variant === 'free')
        return [
          'This is the free Writing module (after a guided one): the learner writes the full task alone.',
          'Reply with ONE JSON object: { "intro": one sentence, "steps": [...] } with these steps in order:',
          `1. info: "Plan your text" — the situation and 3–4 short planning tips as lines starting with "• " (what to include, how to organise it, a useful phrase or two in **bold**).`,
          `2. write: a real-life task on the unit topic (an email, message, review, post, story…) of ${minW}–${maxW} words ("minWords": ${minW}, "maxWords": ${maxW}), with a model answer and 3–5 "targets" from "words"; it should invite the grammar point(s).`,
        ]
      return [
        `This is the ${input.variant === 'guided' ? 'guided Writing module (a free one follows)' : 'Writing module'}: a model text, practice with its useful language, then the learner writes.`,
        'Reply with ONE JSON object: { "intro": one sentence, "steps": [...] } with these steps in order:',
        `1. info: "Model text" — a short model of the text type (${minW}–${maxW} words) on the unit topic, with 3–5 useful phrases in **bold**.`,
        '2. choice: a question about the model (its purpose, who it is for, or how it is organised).',
        '3–4. two gap steps on the useful phrases from the model, with "options".',
        '5. order: build one of the useful sentences.',
        input.variant === 'guided'
          ? `6. write: a short, controlled version of the same text type (${Math.max(15, Math.round(minW / 2))}–${Math.round(maxW / 2)} words), with a model answer and 3 "targets".`
          : `6. write: a real-life task like the model (${minW}–${maxW} words, "minWords": ${minW}, "maxWords": ${maxW}), with a model answer and 3–5 "targets" from "words"; it should invite the grammar point(s).`,
      ]
    case 'speaking':
      if (input.variant === 'free')
        return [
          'This is the free Speaking module (after a guided one): a role-play or long turn the learner does alone.',
          'Reply with ONE JSON object: { "intro": one sentence, "steps": [...] } with these steps in order:',
          '1. info: "Your task" — the situation and 3–4 short notes on what to cover, as lines starting with "• ", with a useful phrase or two in **bold**.',
          `2. speak: the task (a role-play turn or a long turn on the unit topic), "seconds": ${secs}, a model answer shown after ("modelFirst": false) and 3–5 "targets".`,
        ]
      return [
        `This is the ${input.variant === 'guided' ? 'guided Speaking module (a free one follows)' : 'Speaking module'}: useful phrases, then the learner answers out loud (speech is transcribed).`,
        'Reply with ONE JSON object: { "intro": one sentence, "steps": [...] } with these steps in order:',
        '1. info: "Useful phrases" — 4–6 phrases for the situation in **bold**, each on its own line with a short example.',
        '2. choice: the best thing to say in a short situation (one natural answer, the others wrong or impolite).',
        `3. speak: a short guided answer, "seconds": ${Math.max(20, Math.round(secs / 2))}, with the model shown first ("modelFirst": true) and 3 "targets".`,
        input.variant === 'guided'
          ? `4. speak: a second guided prompt, "seconds": ${Math.max(20, Math.round(secs / 2))}, model shown first ("modelFirst": true).`
          : `4. speak: the main task on the unit topic, "seconds": ${secs}, model shown after ("modelFirst": false) and 3–5 "targets".`,
      ]
    case 'grammar':
      return [
        'This is the Grammar module: guided discovery from the unit\'s main text ("firstPassage"), then practice.',
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
        input.grammarIds.length ? '- three on the grammar point(s) (gap, choice or order),' : '- three on useful phrases and structures from the unit\'s texts (gap, choice or order),',
        '- two choice steps on the unit\'s main text ("firstPassage"),',
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
    input.grammarIds.length ? '' : NO_GRAMMAR,
  ]
    .filter(Boolean)
    .join('\n')
  return {
    systemPrompt,
    user: JSON.stringify({
      level: input.level,
      unitTopic: input.unitTopic,
      grammar: grammarList(input.grammarIds),
      grammarNotes: input.blueprint.grammarNotes,
      words: input.blueprint.words.map((w) => ({ term: w.term, meaning: w.meaning })),
      ...(input.kind === 'reading' || input.kind === 'listening' ? { passageBrief: input.blueprint.passageBrief } : {}),
      ...(input.sourceText ? { teacherText: input.sourceText } : {}),
      ...(input.passage && input.kind !== 'vocabulary' ? { firstPassage: { title: input.passage.title, text: input.passage.text } } : {}),
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
function lenientSteps(raw: unknown, input: ModuleGenInput): CourseStep[] {
  const steps: CourseStep[] = []
  const [minW, maxW] = WRITING_WORDS[input.level]
  const defaultTargets = input.blueprint.words.slice(0, 4).map((w) => w.term)
  for (const s of Array.isArray(raw) ? raw : []) {
    if (!s || typeof s !== 'object') continue
    const step = { ...(s as Record<string, unknown>) }
    if (step.type === 'choice') step.answer = choiceIndex(step.answer, Array.isArray(step.options) ? step.options.length : 0)
    if (step.type === 'gap' && typeof step.sentence === 'string') step.sentence = step.sentence.replace(/_{3,}/, GAP)
    if (step.type === 'write') {
      // Missing or odd limits fall back to the level's range.
      const lo = Number(step.minWords)
      const hi = Number(step.maxWords)
      const ok = Number.isFinite(lo) && Number.isFinite(hi) && lo >= 5 && hi >= lo && hi <= 500
      step.minWords = ok ? lo : minW
      step.maxWords = ok ? hi : maxW
      if (!Array.isArray(step.targets) || !step.targets.length) step.targets = defaultTargets
    }
    if (step.type === 'speak') {
      const sec = Number(step.seconds)
      step.seconds = Number.isFinite(sec) && sec >= 10 && sec <= 300 ? sec : SPEAKING_SECONDS[input.level]
      if (!Array.isArray(step.targets) || !step.targets.length) step.targets = defaultTargets
    }
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

const SPEAKER_LINE = /^[A-Z][\w.'’-]*(?: [A-Z][\w.'’-]*)?:\s/m

export function parseModule(raw: string, input: ModuleGenInput): ModuleContent {
  const parsed = parseJson(raw)
  let steps = lenientSteps(parsed.steps, input)
  if (input.kind === 'unit_check') steps = steps.filter((s) => s.type !== 'info')
  if (input.kind === 'writing' || input.kind === 'speaking') {
    const open = input.kind === 'writing' ? 'write' : 'speak'
    if (!steps.some((s) => s.type === open)) throw new Error(`no usable ${open} step`)
  } else if (steps.filter((s) => s.type !== 'info').length < MIN_QUESTIONS) throw new Error('too few usable steps')

  let passage: ModulePassage | undefined
  if (input.kind === 'reading' || input.kind === 'listening') {
    const p = parsed.passage && typeof parsed.passage === 'object' ? (parsed.passage as Record<string, unknown>) : {}
    const text = input.sourceText ?? (typeof p.text === 'string' ? p.text.trim() : '')
    if (!input.sourceText && text.split(/\s+/).length < 40) throw new Error('text missing or too short')
    const title = typeof p.title === 'string' ? p.title.trim().slice(0, 160) : ''
    if (input.kind === 'reading') passage = { title, text }
    else passage = { title, text, style: p.style === 'dialogue' || (p.style !== 'monologue' && SPEAKER_LINE.test(text)) ? 'dialogue' : 'monologue' }
    // The text (or the recording) comes right after the first (warm-up) step.
    const at = steps[0]?.type === 'info' ? 1 : 0
    steps.splice(at, 0, { id: '', type: input.kind === 'reading' ? 'text' : 'listen' })
    // Listening: the transcript at the very end.
    if (input.kind === 'listening') steps.push({ id: '', type: 'text' })
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

// --- Feedback on written and spoken answers ---------------------------------------------------

export interface FeedbackInput {
  mode: 'write' | 'speak'
  level: CourseLevel
  explainLang: ExplainLang
  prompt: string
  targets: string[]
  grammarIds: string[]
  text: string
  /** write: the word range; speak: the seconds asked for. */
  minWords?: number
  maxWords?: number
  seconds?: number
}

export function buildFeedbackPrompt(input: FeedbackInput): { systemPrompt: string; user: string } {
  const spoken = input.mode === 'speak'
  const systemPrompt = [
    `You are a kind, precise English teacher marking a ${spoken ? 'spoken answer (transcribed automatically by speech recognition)' : 'short written text'} by a learner at CEFR level ${input.level}, a Hungarian speaker studying alone.`,
    spoken ? 'Ignore punctuation, capital letters and obvious speech-recognition slips; judge what was said.' : '',
    'Score 0–10 for this level: task (did they do what the prompt asks, with enough content and length) 0–4, accuracy (grammar, word choice) 0–3, range (uses the target words and the grammar point naturally) 0–3. A good answer for the level gets 7–8; 10 is rare.',
    `Reply with ONE JSON object: { "score": a whole number 0–10, "feedback": 2–4 short sentences to the learner ("you") in ${LANG_NAME[input.explainLang]}: first what was good, then the one or two most useful things to improve, "corrections": up to 4 { "wrong": the learner's exact words, "right": the corrected version } (only real mistakes; [] if none) }`,
  ]
    .filter(Boolean)
    .join('\n')
  return {
    systemPrompt,
    user: JSON.stringify({
      task: input.prompt,
      ...(spoken ? { secondsAskedFor: input.seconds } : { wordRange: [input.minWords, input.maxWords] }),
      targetWords: input.targets,
      grammar: input.grammarIds.map(grammarTitle),
      learnerAnswer: input.text,
    }),
  }
}

export async function evaluateOpenAnswer(input: FeedbackInput, userId: string): Promise<OpenFeedback> {
  const { systemPrompt, user } = buildFeedbackPrompt(input)
  const attempts = [
    { modelId: COURSE_MODEL, json: true, maxTokens: 2500, reasoningEffort: 'low' as const, temperature: 0.3 },
    { modelId: FALLBACK_MODEL, json: true, maxTokens: 2500, temperature: 0.3 },
  ]
  let lastError: unknown = null
  for (const { modelId, ...options } of attempts) {
    try {
      const result = await callModel(modelId, systemPrompt, [{ role: 'user', content: user }], options)
      await logModelUsage({ userId, scenarioId: 'courses', callType: FEEDBACK_CALL_TYPE, modelId, usage: result.usage })
      return sanitizeFeedback(parseJson(result.content))
    } catch (err) {
      lastError = err
      console.warn('Course feedback call failed', { modelId, error: String(err).slice(0, 300) })
    }
  }
  throw lastError
}

