import type { ChatMessage, LessonLanguage } from '../../src/lib/types.js'
import {
  SPEAKING_CRITERIA,
  SPEAKING_CRITERION_MAX,
  SPEAKING_TASK_MAX,
  type SpeakingCard,
  type SpeakingExam,
  type SpeakingTask,
  sittingTasks,
} from '../../src/data/exams/speaking.js'
import type { SpeakingAssessment, SpeakingSessionMode, SpeakingTaskAssessment } from '../../src/lib/examSpeakingTypes.js'
import { isValidSubtype, OTHER_SUBTYPE } from '../../src/data/mistakeTaxonomy.js'

// Prompts and parsing for the speaking exams (api/tutor.ts ?action=exam-turn and
// ?action=exam-assess). The examiner runs one task at a time from the server's copy of the
// task (src/data/exams/speaking.ts) — the browser only sends ids and the conversation.

/** The examiner appends this to the turn that closes a task; stripped before the reply is spoken. */
export const TASK_DONE_MARKER = '[[TASK_DONE]]'

const TRACK_NAME = { general: 'General English', business: 'Economics and management (business English)' } as const

const LANGUAGE_NAME: Record<LessonLanguage, string> = { hu: 'Hungarian', en: 'English', de: 'German' }

/** What the exam is, for the examiner's and the assessor's prompts. */
function examDescription(exam: SpeakingExam): string {
  return exam.board === 'erettsegi'
    ? `the oral part of the Hungarian school-leaving exam (érettségi) in ${LANGUAGE_NAME[exam.language]}, intermediate level (középszint, about B1)`
    : `a Hungarian state-accredited ${LANGUAGE_NAME[exam.language]} language exam (Zöld Út Nyelvvizsgaközpont), level B1, ${TRACK_NAME[exam.track ?? 'general']}`
}

/** The examiner's closing line, also the fallback when the model's closing turn comes back empty. */
export function closingLine(exam: SpeakingExam): string {
  return exam.language === 'de' ? 'Danke schön, damit ist diese Aufgabe beendet.' : "Thank you, that's the end of this task."
}

export const KICKOFF_MESSAGE: ChatMessage = {
  role: 'user',
  content: '(The candidate is ready for this task. Begin it, following the system prompt.)',
}

function cardText(card: SpeakingCard): string {
  const lines = [...(card.heading ? [card.heading] : []), ...card.text]
  if (card.box?.length) lines.push('[Printed box]', ...card.box.map((l) => `  ${l}`))
  if (card.lead) lines.push(card.lead)
  for (const [i, p] of (card.points ?? []).entries()) {
    lines.push(`${card.numbered ? `${i + 1}.` : '-'} ${p.text}`)
    for (const s of p.sub ?? []) lines.push(`  - ${s}`)
  }
  lines.push(...(card.after ?? []))
  return lines.join('\n')
}

function openingGuidance(exam: SpeakingExam, task: SpeakingTask, mode: SpeakingSessionMode): string {
  const first = exam.tasks[0]?.id === task.id
  const taskCount = sittingTasks(exam).length
  const intro = mode !== 'exam'
    ? `The candidate is practising ${task.label} on its own: greet them briefly, say in one sentence that you are starting ${task.label}${task.examineeCard || task.image ? ' and point them to their task sheet on the screen' : ''}.`
    : first
    ? 'This is the very beginning of the oral exam: greet the candidate warmly, say in one sentence that you are the examiner (no name needed) and that the exam has ' +
      `${taskCount} tasks, then start ${task.label}.`
    : `Say in one short sentence that you are moving on to ${task.label}${task.examineeCard || task.image ? ' and point the candidate to their task sheet on the screen' : ''}.`
  switch (task.kind) {
    case 'interview':
      return `${intro} Then ask your first question.`
    case 'role-play': {
      const youStart = task.examineeCard?.after?.some((l) => /you start/i.test(l))
      return youStart
        ? `${intro} Set the scene in one sentence (who you are playing), tell the candidate they start, and then stop — wait for them.`
        : `${intro} Set the scene in one sentence (who you are playing), then begin the role-play in role.`
    }
    case 'picture':
      return `${intro} Then ask the candidate to describe the picture.`
    case 'graph':
      return `${intro} Then ask the candidate to describe the chart.`
    case 'presentation':
      return `${intro} Name the topic the candidate chose ("${task.title}") and ask them to begin their talk.`
  }
}

export function buildExaminerSystemPrompt(args: {
  exam: SpeakingExam
  task: SpeakingTask
  isOpening: boolean
  closeNow: boolean
  mode?: SpeakingSessionMode
}): string {
  const { exam, task } = args
  const mode = args.mode ?? 'exam'
  const language = LANGUAGE_NAME[exam.language]
  const german = exam.language === 'de'
  const sheet: string[] = []
  if (task.instructions?.length) sheet.push(`Instructions: ${task.instructions.join(' ')}`)
  if (task.examineeCard) sheet.push(`Role card:\n${cardText(task.examineeCard)}`)
  if (task.image) sheet.push(`Image (you can't see it; this is what it shows): ${task.image.alt}`)

  return [
    `You are the oral examiner of ${examDescription(exam)}. The candidate is a Hungarian learner. You are running ${task.label} of ${sittingTasks(exam).length}: "${task.title}".`,
    'This is a spoken exam: your words are read aloud by text-to-speech, and the candidate\'s turns come from speech recognition, so ignore small recognition glitches and missing punctuation.',
    '',
    '== HOW TO SPEAK ==',
    `- Speak only ${language}. Use clear, natural B1-level ${language}. Keep every turn short: one to three sentences, and ask only one question at a time.`,
    ...(german ? ['- Address the candidate formally with "Sie" (in a role-play too, unless your role card says otherwise). Standard German; in an Austrian setting a greeting such as "Grüß Gott" is fine.'] : []),
    `- Do not correct the candidate, teach, translate or comment on their ${language}, and never give scores or feedback. React briefly and naturally, like a friendly examiner (or, in a role-play, like the person you are playing).`,
    '- Plain spoken text only: no markdown, lists, emojis, stage directions or text in brackets.',
    `- Stay on this task. If the candidate speaks Hungarian, asks for help or goes silent, encourage them in ${language} to try in their own words, or rephrase your question more simply.`,
    ...(mode === 'rehearsal'
      ? [
          `- This is a rehearsal: the candidate has just studied useful phrases and a sample answer for this task. Be extra patient. If they get stuck or ask for help, give one short hint in ${language} — for example the beginning of a sentence they could use, or a simpler question — and let them go on. Still do not correct their ${language} or give feedback.`,
        ]
      : []),
    `- When the task is complete, say one short closing sentence (for example "${closingLine(exam)}") and put ${TASK_DONE_MARKER} at the very end of that turn. Use the marker only in that closing turn.`,
    '',
    "== THE CANDIDATE'S TASK SHEET ==",
    sheet.length ? sheet.join('\n\n') : '(Nothing is printed for this task: you lead it.)',
    ...(task.examinerCard ? ['', "== YOUR ROLE CARD (the examiner's copy; the candidate can't see it) ==", cardText(task.examinerCard)] : []),
    '',
    '== HOW TO RUN THIS TASK ==',
    task.examinerBrief,
    `It should take about ${task.minutes} minutes.`,
    ...(args.isOpening ? ['', '== NOW ==', openingGuidance(exam, task, mode)] : []),
    ...(args.closeNow
      ? ['', '== NOW ==', `The time for this task is up. Reply briefly to the candidate's last turn, close the task with one short sentence and end with ${TASK_DONE_MARKER}.`]
      : []),
  ].join('\n')
}

/** Strips the done marker (and any markdown the model slips in) from an examiner turn. */
export function parseExaminerReply(raw: string): { reply: string; taskDone: boolean } {
  const taskDone = raw.includes(TASK_DONE_MARKER) || /\[\[\s*task[_ ]done\s*\]\]/i.test(raw)
  const reply = raw
    .replace(/\[\[\s*task[_ ]done\s*\]\]/gi, '')
    .replace(/[*_#`]+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return { reply, taskDone }
}

/** Keeps only well-formed turns, capped so a client can't send an unbounded prompt. */
export function sanitizeHistory(raw: unknown, maxMessages = 40, maxChars = 2000): ChatMessage[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((m): m is ChatMessage => !!m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m) => ({ role: m.role, content: m.content.slice(0, maxChars) }))
    .slice(-maxMessages)
}

export function learnerTurns(history: ChatMessage[]): number {
  return history.filter((m) => m.role === 'user').length
}

export function buildAssessmentPrompt(args: {
  exam: SpeakingExam
  transcripts: Record<string, ChatMessage[]>
  uiLang: LessonLanguage
}): { systemPrompt: string; messages: ChatMessage[] } {
  const { exam } = args
  const feedbackLanguage = LANGUAGE_NAME[args.uiLang]
  const taskBlocks = exam.tasks.map((task) => {
    const turns = args.transcripts[task.id] ?? []
    const transcript = turns.length
      ? turns.map((m) => `${m.role === 'user' ? 'Candidate' : 'Examiner'}: ${m.content}`).join('\n')
      : '(not attempted)'
    const sheet = [
      ...(task.instructions ?? []),
      ...(task.examineeCard ? [cardText(task.examineeCard)] : []),
      ...(task.image ? [`Image: ${task.image.alt}`] : []),
    ].join('\n')
    return `### ${task.id} — ${task.label}: ${task.title} (${task.kind})\nTask sheet:\n${sheet || '(led by the examiner)'}\nTranscript:\n${transcript}`
  })

  const criteria = [
    '"task": task achievement — did the candidate do what the task asked (every point of a role card, and answers to the examiner’s extra questions, a full description and opinions for a picture or chart, all four guiding points of a topic talk covered in detail, on their own and coherently, relevant and developed answers in a conversation)? For a chart, are the figures right? Needing many help questions lowers this score.',
    '"fluency": fluency and interaction — length and flow of turns, keeping the conversation going, reacting to the examiner.',
    '"vocabulary": range and appropriacy of vocabulary for the topic and the situation.',
    '"grammar": grammatical accuracy and range.',
  ]

  const systemPrompt = [
    `You are an experienced oral examiner assessing a Hungarian candidate's performance in ${examDescription(exam)}. The candidate spoke to an AI examiner; the transcripts come from speech recognition, so do not judge spelling, punctuation or capital letters, and you cannot judge pronunciation.`,
    `Score every task on four criteria, each an integer from 0 to ${SPEAKING_CRITERION_MAX}, against the B1 standard (${SPEAKING_CRITERION_MAX} = a confident B1 performance or better, 3 = adequate B1, 1 = well below B1, 0 = nothing assessable). A task that was not attempted scores 0 on every criterion.`,
    ...criteria.map((c) => `- ${c}`),
    'Respond with ONLY valid JSON (no markdown, no code fences) in exactly this shape:',
    '{"tasks": [{"taskId": "S-1", "scores": {"task": 3, "fluency": 3, "vocabulary": 3, "grammar": 3}, "comment": "..."}], "summary": "...", "strengths": ["...", "..."], "corrections": [{"original": "...", "corrected": "...", "note": "...", "subtype": "other"}]}',
    `- "tasks": one entry per task, in order, with these ids: ${exam.tasks.map((t) => t.id).join(', ')}. "comment": two or three sentences on that task — what went well and what to improve.`,
    '- "summary": two sentences on the whole performance.',
    '- "strengths": two or three specific strengths.',
    `- "corrections": three to five of the candidate's own sentences that had mistakes: "original" quoted from the transcript, "corrected" the natural B1 version, "note" a short explanation. "subtype": always "other".`,
    `Write "comment", "summary", "strengths" and "note" in ${feedbackLanguage}; keep "original" and "corrected" in ${LANGUAGE_NAME[exam.language]}. Be encouraging but honest and specific.`,
  ].join('\n')

  return { systemPrompt, messages: [{ role: 'user', content: taskBlocks.join('\n\n') }] }
}

function clampScore(v: unknown): number {
  const n = typeof v === 'number' ? v : Number(v)
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(SPEAKING_CRITERION_MAX, Math.round(n)))
}

function text(v: unknown, max = 1200): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : ''
}

/**
 * Validates the model's assessment against the exam: one entry per task in exam order,
 * scores clamped, and a task without a single learner turn scored 0 whatever the model said.
 */
export function parseAssessment(raw: string, exam: SpeakingExam, transcripts: Record<string, ChatMessage[]>): SpeakingAssessment {
  const cleaned = raw.trim().replace(/^```(json)?/i, '').replace(/```$/, '').trim()
  const parsed = JSON.parse(cleaned) as Record<string, unknown>
  const rawTasks = Array.isArray(parsed.tasks) ? (parsed.tasks as Record<string, unknown>[]) : []

  const tasks: SpeakingTaskAssessment[] = exam.tasks.map((task, i) => {
    const entry = rawTasks.find((t) => t?.taskId === task.id) ?? rawTasks[i] ?? {}
    const attempted = learnerTurns(transcripts[task.id] ?? []) > 0
    const rawScores = (entry.scores ?? {}) as Record<string, unknown>
    const scores = Object.fromEntries(SPEAKING_CRITERIA.map((c) => [c, attempted ? clampScore(rawScores[c]) : 0])) as SpeakingTaskAssessment['scores']
    const total = SPEAKING_CRITERIA.reduce((sum, c) => sum + scores[c], 0)
    return { taskId: task.id, attempted, scores, total, max: SPEAKING_TASK_MAX, comment: text(entry.comment) }
  })

  const corrections = Array.isArray(parsed.corrections) ? (parsed.corrections as Record<string, unknown>[]) : []
  return {
    tasks,
    total: tasks.reduce((sum, t) => sum + t.total, 0),
    max: tasks.length * SPEAKING_TASK_MAX,
    summary: text(parsed.summary),
    strengths: (Array.isArray(parsed.strengths) ? parsed.strengths : []).map((s) => text(s, 400)).filter(Boolean).slice(0, 5),
    corrections: corrections
      .map((c) => ({
        original: text(c?.original, 400),
        corrected: text(c?.corrected, 400),
        note: text(c?.note, 400),
        subtype: isValidSubtype(c?.subtype) ? c.subtype : OTHER_SUBTYPE,
      }))
      .filter((c) => c.original && c.corrected)
      .slice(0, 6),
  }
}
