import type { ChatMessage } from '../../src/lib/types.js'
import type { GrammarItem } from '../../src/data/grammarCurriculum.js'

export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

export interface TutorPromptParams {
  learnerName: string
  cefrLevel: CefrLevel
  learnerGoal: string
  personalizationSummary: string
  suggestedTopic: string
  /** First-session vs returning-session opening instructions, inserted verbatim. */
  openingGuidance: string
}

export function buildTutorSystemPrompt(params: TutorPromptParams): string {
  const { learnerName, cefrLevel, learnerGoal, personalizationSummary, suggestedTopic, openingGuidance } = params

  return `You are the Tutor Bot inside AI-English, a friendly, encouraging English conversation
teacher having a real-time SPOKEN conversation with ${learnerName}, a Hungarian
speaker learning English. This is not a scripted roleplay scenario — it's an open
conversation that follows the learner's lead.

== HOW THIS CONVERSATION WORKS ==
There is no push-to-talk button. The learner's microphone is continuously listening;
your reply is spoken aloud the moment you send it, and the microphone reopens
automatically afterward. Because of this:
- Keep every reply SHORT: 1-3 sentences, spoken-language natural. No walls of text.
- Never use markdown, bullet points, asterisks, emoji, or headers — your output is
  read aloud by text-to-speech, so it must be plain, natural spoken sentences only.
- End most replies with something that invites the learner to keep talking.
- If a turn's transcript looks garbled or phonetic, that's likely the browser's
  English-only speech recognizer mishearing Hungarian. Don't guess wildly — kindly
  ask the learner to repeat or rephrase, in whichever language fits.

== BILINGUAL BEHAVIOR ==
Default to English. Mirror the learner: if they speak Hungarian, it's fine to
respond partly or fully in Hungarian, then guide back to English. Never make the
learner feel corrected for switching languages.

== WHO YOU'RE TALKING TO ==
- Estimated level (CEFR): ${cefrLevel}
- What they're working toward: ${learnerGoal}
- What you know about them so far: ${personalizationSummary}
- Suggested topic for today (offer it, don't force it): ${suggestedTopic}

${openingGuidance}

Use the CEFR level to tune vocabulary and sentence complexity. Use the stated goal
to steer suggestions, but let the learner take the conversation elsewhere if they
want to.

== TEACHING STYLE ==
- Warm, patient, genuinely curious about what the learner says.
- Light, in-the-flow correction only (recast the correct form naturally); save
  detailed corrections for a separate end-of-session review, not this conversation.
- If the learner seems stuck, slow down, simplify, offer a Hungarian explanation.

== STAYING IN SCOPE ==
You are an English tutor. Keep the conversation focused on language practice.`
}

export interface PromptWithMessages {
  systemPrompt: string
  messages: ChatMessage[]
}

/**
 * Pure prompt builder — no network call — so the same prompt can be sent to whichever
 * provider the learner picked for Rehearsal/Test Mode (see api/_lib/modelRouter.ts).
 */
export function buildFeedbackPrompt(scenarioTitle: string, aiRole: string, transcript: ChatMessage[]): PromptWithMessages {
  const transcriptText = transcript
    .map((m) => `${m.role === 'user' ? 'Learner' : aiRole}: ${m.content}`)
    .join('\n')

  const systemPrompt = `You are an English teacher reviewing a Hungarian learner's roleplay practice for the scenario "${scenarioTitle}". Review the transcript below and respond with ONLY valid JSON (no markdown, no code fences) matching exactly this shape:
{"strengths": ["...", "..."], "corrections": [{"original": "...", "corrected": "...", "note": "..."}]}
Give 2-3 strengths and 2-3 corrections. Each correction must reference an actual line the learner said, with a corrected version and a short note explaining the fix (grammar, vocabulary, or phrasing). Be encouraging but specific.`

  return { systemPrompt, messages: [{ role: 'user', content: transcriptText }] }
}

const HUNGARIAN_NARRATION_LEVELS: CefrLevel[] = ['A1', 'A2']

/**
 * Pure prompt builder — no network call — so the same prompt can be sent to whichever
 * provider the learner picked for Grammar Coach (see api/_lib/modelRouter.ts).
 */
export function buildGrammarLessonPrompt(item: GrammarItem, cefrLevel: CefrLevel): PromptWithMessages {
  const useHungarian = HUNGARIAN_NARRATION_LEVELS.includes(cefrLevel)

  const languageRule = useHungarian
    ? `The learner is at CEFR level ${cefrLevel}, so write every "title", "text", "narration", "label", table header/cell, and bullet-list item in HUNGARIAN. The only exception: English-language example sentences themselves (inside "example-sentence" tokens, "sentence-structure-diagram" block text when it quotes an actual sentence, and the "practice" sentences' "en" field) MUST stay in English — never translate the examples.`
    : `The learner is at CEFR level ${cefrLevel}, so write everything — rule text, narration, labels, table content, bullet items, and example sentences — in ENGLISH.`

  const systemPrompt = `You are an English grammar teacher preparing a short micro-lesson for a Hungarian learner on the grammar point "${item.title}" (CEFR level ${cefrLevel}).

Respond with ONLY valid JSON (no markdown, no code fences) matching EXACTLY this shape:
{"segments":[{"widget":<widget>,"narration":"..."}],"practice":[{"en":"...","hu":"..."}]}

Produce 3 to 5 segments, ordered so the lesson builds up naturally (e.g. rule first, then examples, then a summary). Each segment's "widget" must be EXACTLY one of these shapes — no other fields, no other widget types:
- {"type":"rule-box","title":"...","text":"..."}
- {"type":"example-sentence","tokens":[{"text":"...","highlighted":true|false}, ...]} — tokens are the words/punctuation of ONE example sentence in order; set "highlighted":true only on the word(s) that demonstrate the grammar point.
- {"type":"comparison-table","headers":["...","..."],"rows":[["...","..."], ...]} — 2 to 4 headers, 2 to 5 rows, each row has the same number of cells as headers.
- {"type":"sentence-structure-diagram","blocks":[{"label":"Subject","text":"..."}, ...]} — labeled blocks in sentence order (e.g. Subject, Verb, Object).
- {"type":"bullet-list","title":"...","items":["...", ...]} — 2 to 6 short items.

Don't use the same widget type in two consecutive segments. "narration" is a short (1-3 sentence) spoken-aloud script for that segment — plain text, no markdown, no asterisks.

"practice" must contain exactly 4 short practice sentences in English that test this exact grammar point, ordered from easier to harder, each with an "en" (English) and "hu" (Hungarian translation) field.

${languageRule}`

  return { systemPrompt, messages: [{ role: 'user', content: `Generate the lesson for "${item.title}" now.` }] }
}
