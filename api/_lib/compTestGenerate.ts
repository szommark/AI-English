import { supabaseAdmin } from './supabaseAdmin.js'
import { callModel } from './modelRouter.js'
import type { ModelId } from '../../src/lib/models.js'
import { logModelUsage } from './usageLog.js'
import { utcDayStart } from './vocabPractice.js'
import {
  countWords,
  defaultInstructions,
  grammarTitles,
  longestAnswerWords,
  markupToSummary,
  optionKey,
  sanitizeContent,
  targetWords,
  type CompGenerateInput,
  type CompLevel,
  type CompTaskType,
  type CompTestContent,
} from '../../src/lib/compTests.js'

// AI generation for the comprehension test maker (src/lib/compTests.ts): one model call writes
// the text (or audioscript) and every section the teacher asked for. The reply is parsed
// leniently and then validated like a teacher's save; the teacher reviews and edits the result.

export const COMP_TEST_CALL_TYPE = 'comp_test_gen'

export async function compGenerationsToday(userId: string, now = new Date()): Promise<number> {
  const { count, error } = await supabaseAdmin
    .from('groq_usage_log')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('call_type', COMP_TEST_CALL_TYPE)
    .gte('created_at', utcDayStart(now).toISOString())
  if (error) throw error
  return count ?? 0
}

const LEVEL_GUIDE: Record<CompLevel, string> = {
  A1: 'A1: very short, simple sentences; present simple and can; the most common everyday words; concrete, familiar situations; numbers, times, places, people.',
  A2: 'A2: short simple sentences joined with and/but/because; past simple and going to; everyday vocabulary; routine, personal and practical topics.',
  B1: 'B1: clear connected text on familiar topics; a range of tenses; some opinions and reasons; mostly frequent vocabulary with a few less common words explained by context.',
  B2: 'B2: detailed text with an argument or point of view; complex sentences; some idiomatic language; questions may test opinion, attitude and inference.',
  C1: 'C1: long, demanding text with implicit meaning; sophisticated structures and less frequent vocabulary; questions test inference, attitude, purpose and detail.',
  C2: 'C2: complex, nuanced text such as an essay, review or discussion; idiomatic and abstract language; questions test subtle implication and the writer\'s or speakers\' stance.',
}

/** Words a typed answer may have, by level (gap fill and short answers). */
export function answerWordsFor(level: CompLevel): number {
  return level === 'A1' || level === 'A2' ? 1 : level === 'B1' ? 2 : 3
}

function taskRules(type: CompTaskType, count: number, maxWords: number): string {
  switch (type) {
    case 'mcq':
      return `"mcq", exactly ${count} questions: each { "stem", "options": [4 options], "answer": "A"|"B"|"C"|"D" }. One option is clearly right according to the text; the other three are plausible and use words from the text but are wrong. Spread the right answers over A–D.`
    case 'true-false':
      return `"true-false", exactly ${count} statements: each { "statement", "answer": true|false }. About half true. A false statement must be contradicted by the text (not just "not mentioned"); paraphrase, never copy a sentence.`
    case 'gap-fill':
      return `"gap-fill", exactly ${count} gaps: { "summary": a paraphrased summary of the text in which each gap is written as its answer in square brackets, e.g. "She moved to [Leeds] in [2019]." }. Every answer is at most ${maxWords} word(s) copied exactly from the text; alternative accepted answers separated by "|" inside the brackets. Gaps follow the order of the text.`
    case 'matching':
      return `"matching", exactly ${count} items: { "options": [${count + 2} options], "items": [{ "text", "answer": the key of its option, "A", "B", … }] }. For example match people to what they say, paragraphs to headings, or questions to answers; two options are extra and match nothing. Each option is used at most once.`
    case 'short-answer':
      return `"short-answer", exactly ${count} questions: each { "question", "accepted": [the answer of at most ${maxWords} word(s) from the text, plus up to 3 equally correct variants] }. Wh-questions with one clear answer.`
  }
}

export function buildPrompt(input: CompGenerateInput): { systemPrompt: string; user: string } {
  const words = targetWords(input)
  const maxWords = answerWordsFor(input.level)
  const listening = input.skill === 'listening'
  const grammar = grammarTitles(input)
  const vocabulary = input.vocabulary ?? []
  const textRules = listening
    ? input.style === 'dialogue'
      ? `"text": a natural spoken dialogue (an interview or conversation) between two people, about ${words} words. Every line starts with the speaker's first name and a colon ("Anna: …"); new line for every turn. Spoken English: contractions, fillers kept light. No stage directions, no sound effects.`
      : `"text": a natural spoken monologue (a talk, podcast segment, announcement or story) by one speaker, about ${words} words, in paragraphs separated by blank lines. No speaker labels, no stage directions.`
    : `"text": an original reading text (article, blog post, story, email, leaflet — what suits the topic and level), about ${words} words, with a title on the first line and paragraphs separated by blank lines.`

  const systemPrompt = [
    `You write English ${listening ? 'listening' : 'reading'} comprehension tests for language learners, CEFR level ${input.level}.`,
    LEVEL_GUIDE[input.level],
    'The text must be original, factually plausible, and contain enough distinct information for every question. Questions follow the order of the text and never test world knowledge.',
    listening ? 'The questions will be answered while listening: test information that is clearly spoken, never spelling.' : '',
    grammar.length
      ? `Grammar focus (the user message's "grammarFocus"): the text uses these structures often and naturally, several times each, but they must not make it sound like a textbook exercise. The questions stay about meaning: do not test the grammar.`
      : '',
    vocabulary.length
      ? `Vocabulary focus (the user message's "vocabulary"): use as many of these words and phrases as fit the topic naturally, at least half of them, in any grammatical form. Where it fits, make some gap-fill, short-answer or matching answers be these words, so the test checks that the learners understand them.`
      : '',
    'Reply with ONE JSON object and nothing else:',
    `{ "title": a short test title, ${textRules}, "sections": [...] }`,
    'The sections, in this order:',
    ...input.tasks.map((t, i) => `${i + 1}. { "type": ${taskRules(t.type, t.count, maxWords)} }`),
  ]
    .filter(Boolean)
    .join('\n')

  return {
    systemPrompt,
    user: JSON.stringify({
      topic: input.topic,
      level: input.level,
      words,
      ...(grammar.length ? { grammarFocus: grammar } : {}),
      ...(vocabulary.length ? { vocabulary } : {}),
    }),
  }
}

function asAnswerKey(v: unknown, optionCount: number): string {
  if (typeof v === 'number' && Number.isInteger(v)) return optionKey(v >= 1 && v <= optionCount ? v - 1 : v)
  if (typeof v === 'string') {
    const m = v.trim().match(/^\(?([A-Ja-j])\)?(?:\W|$)/)
    if (m) return m[1].toUpperCase()
  }
  return ''
}

function asBool(v: unknown): unknown {
  if (typeof v === 'string') return /^t/i.test(v.trim()) ? true : /^f/i.test(v.trim()) ? false : v
  return v
}

/** Typed answers longer than this are dropped (their shorter variants stay). */
const MAX_TYPED_WORDS = 6

/**
 * The section's word limit: the level's, raised to the longest key answer the model wrote, so a
 * student who writes the key is never over the limit.
 */
function typedLimit(lists: string[][], levelLimit: number): number {
  return Math.min(MAX_TYPED_WORDS, Math.max(levelLimit, longestAnswerWords(lists.map(fitting))))
}

function fitting(answers: string[]): string[] {
  return answers.filter((a) => countWords(a) <= MAX_TYPED_WORDS)
}

const obj = (v: unknown) => (v && typeof v === 'object' ? (v as Record<string, unknown>) : {})
const list = (v: unknown) => (Array.isArray(v) ? v : [])

export interface GeneratedCompTest {
  title: string
  content: CompTestContent
}

/** Parses the model's reply into validated content; throws when it is unusable. */
export function parseGeneratedTest(raw: string, input: CompGenerateInput): GeneratedCompTest {
  const cleaned = raw.trim().replace(/^```(json)?/i, '').replace(/```$/, '').trim()
  const parsed = obj(JSON.parse(cleaned))
  const maxWords = answerWordsFor(input.level)
  const replies = list(parsed.sections).map(obj)

  const sections = input.tasks.map((task, i) => {
    // Matched by type first (models sometimes reorder), else by position.
    const used = replies.find((r) => r.type === task.type && !r.__used) ?? replies[i] ?? {}
    used.__used = true
    const instructions = defaultInstructions(task.type, input.skill, maxWords)
    const items = list(used.items).slice(0, task.count).map(obj)
    switch (task.type) {
      case 'mcq':
        return {
          type: task.type,
          instructions,
          items: items.map((it) => {
            const options = list(it.options).map((o) => String(o ?? '').replace(/^\(?[A-Ea-e][).:]\s+/, ''))
            return { stem: it.stem ?? it.question, options, answer: asAnswerKey(it.answer, options.length) }
          }),
        }
      case 'true-false':
        return { type: task.type, instructions, items: items.map((it) => ({ statement: it.statement ?? it.text, answer: asBool(it.answer) })) }
      case 'gap-fill': {
        const { summary, items: gaps } = markupToSummary(typeof used.summary === 'string' ? used.summary : '')
        const limit = typedLimit(gaps.map((g) => g.accepted), maxWords)
        return { type: task.type, instructions: defaultInstructions(task.type, input.skill, limit), summary, maxWords: limit, items: gaps.map((g) => ({ ...g, accepted: fitting(g.accepted) })) }
      }
      case 'matching': {
        const options = list(used.options).map((o) => String(o ?? '').replace(/^\(?[A-Ja-j][).:]\s+/, ''))
        return { type: task.type, instructions, options, items: items.map((it) => ({ text: it.text ?? it.statement, answer: asAnswerKey(it.answer, options.length) })) }
      }
      case 'short-answer': {
        const answers = items.map((it) => (list(it.accepted).length ? list(it.accepted) : [it.answer]).filter((a): a is string => typeof a === 'string'))
        const limit = typedLimit(answers, maxWords)
        return {
          type: task.type,
          instructions: defaultInstructions(task.type, input.skill, limit),
          maxWords: limit,
          items: items.map((it, k) => ({ question: it.question, accepted: fitting(answers[k]) })),
        }
      }
    }
  })

  const style = input.skill === 'listening' ? input.style : undefined
  const focus = { grammar: grammarTitles(input), vocabulary: input.vocabulary ?? [] }
  const content = sanitizeContent({ text: parsed.text, style, sections, focus }, input.skill)
  const title = typeof parsed.title === 'string' && parsed.title.trim() ? parsed.title.trim().slice(0, 160) : input.topic
  return { title, content }
}

/**
 * Comprehension tests run on GPT-OSS 120B like the exam task maker (a whole test with a long
 * text needs the larger model); Gemini is only the fallback.
 */
const TEST_MODEL: ModelId = 'groq-gpt-oss-120b'
const FALLBACK_MODEL: ModelId = 'gemini-3.1-flash-lite'

/**
 * JSON mode first; when the provider rejects the reply or it doesn't parse or validate, once more
 * without JSON mode and with lighter reasoning; if Groq is down, the fallback model. Every
 * answered call is logged (and counted).
 */
export async function generateCompTest(input: CompGenerateInput, userId: string): Promise<GeneratedCompTest> {
  const { systemPrompt, user } = buildPrompt(input)
  const attempts = [
    { modelId: TEST_MODEL, json: true, maxTokens: 9000, reasoningEffort: 'medium' as const, temperature: 0.7 },
    { modelId: TEST_MODEL, json: false, maxTokens: 9000, reasoningEffort: 'low' as const, temperature: 0.7 },
    { modelId: FALLBACK_MODEL, json: true, maxTokens: 10000, temperature: 0.7 },
  ]
  let lastError: unknown = null
  for (const { modelId, ...options } of attempts) {
    try {
      const result = await callModel(modelId, systemPrompt, [{ role: 'user', content: user }], options)
      await logModelUsage({ userId, scenarioId: 'teacher-tools', callType: COMP_TEST_CALL_TYPE, modelId, usage: result.usage })
      return parseGeneratedTest(result.content, input)
    } catch (err) {
      lastError = err
      console.warn('Comprehension test model call failed', { modelId, json: options.json, error: String(err).slice(0, 300) })
    }
  }
  throw lastError
}
