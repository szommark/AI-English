// Checks for the Grammar Coach "Past · Present · Future" game. Run: npm run check:tense-game
import {
  TENSE_GAME_LEVELS,
  TENSE_GAME_QUESTIONS,
  TIME_FRAMES,
  getTenseGameQuestion,
} from '../src/data/tenseGameQuestions.ts'
import { QUESTIONS_PER_FRAME, ROUND_LENGTH, buildRound, roundScore } from '../src/lib/tenseGame.ts'
import { TENSE_STORIES, getTenseStory, storyOutcomeId } from '../src/data/tenseStories.ts'

const errors: string[] = []
const fail = (msg: string) => errors.push(msg)

// The bank: unique ids and questions, every field filled, enough fresh questions for two rounds.
const ids = new Set<string>()
const texts = new Set<string>()
for (const q of TENSE_GAME_QUESTIONS) {
  if (ids.has(q.id)) fail(`duplicate id ${q.id}`)
  ids.add(q.id)
  const key = q.text.toLowerCase()
  if (texts.has(key)) fail(`duplicate question "${q.text}"`)
  texts.add(key)
  if (getTenseGameQuestion(q.id) !== q) fail(`${q.id} is not found by id`)
  if (!/[?.]$/.test(q.text)) fail(`${q.id}: question should end with ? or .`)
  if (!q.focus.trim()) fail(`${q.id}: empty focus`)
  if (!/[.!]$/.test(q.sample)) fail(`${q.id}: sample answer should be a full sentence`)
  if (/'/.test(q.text + q.sample)) fail(`${q.id}: use the typographic apostrophe ’`)
}
for (const level of TENSE_GAME_LEVELS) {
  for (const frame of TIME_FRAMES) {
    const n = TENSE_GAME_QUESTIONS.filter((q) => q.level === level && q.frame === frame).length
    if (n < QUESTIONS_PER_FRAME * 2) fail(`${level} ${frame}: only ${n} questions (need ${QUESTIONS_PER_FRAME * 2} for two fresh rounds)`)
  }
}

// Rounds: right length, three per frame, never the same frame three times running,
// and the next round avoids the previous one's questions.
let seed = 1
const random = () => {
  seed = (seed * 16807) % 2147483647
  return (seed - 1) / 2147483646
}
for (const level of TENSE_GAME_LEVELS) {
  for (let i = 0; i < 200; i++) {
    const round = buildRound(level, [], random)
    if (round.length !== ROUND_LENGTH) fail(`${level}: round of ${round.length}`)
    if (new Set(round.map((q) => q.id)).size !== round.length) fail(`${level}: repeated question in a round`)
    if (round.some((q) => q.level !== level)) fail(`${level}: question from another level`)
    for (const frame of TIME_FRAMES) {
      if (round.filter((q) => q.frame === frame).length !== QUESTIONS_PER_FRAME) fail(`${level}: wrong ${frame} count`)
    }
    if (round.some((q, k) => k >= 2 && q.frame === round[k - 1].frame && q.frame === round[k - 2].frame)) {
      fail(`${level}: same frame three times in a row`)
    }
    const nextRound = buildRound(level, round.map((q) => q.id), random)
    if (nextRound.some((q) => round.includes(q))) fail(`${level}: the next round repeats a question`)
    if (errors.length) break
  }
}

// Stories: six questions, every frame used, decisions and endings wired up, no dead endings.
const storyIds = new Set<string>()
for (const story of TENSE_STORIES) {
  const where = `story ${story.id}`
  if (storyIds.has(story.id)) fail(`${where}: duplicate id`)
  storyIds.add(story.id)
  if (getTenseStory(story.id) !== story) fail(`${where}: not found by id`)
  if (!TENSE_GAME_LEVELS.includes(story.level)) fail(`${where}: unknown level ${story.level}`)
  if (story.questions.length !== 6) fail(`${where}: ${story.questions.length} questions (expected 6)`)
  for (const frame of TIME_FRAMES) if (!story.questions.some((q) => q.frame === frame)) fail(`${where}: no ${frame} question`)
  if (new Set(story.questions.map((q) => q.id)).size !== story.questions.length) fail(`${where}: duplicate question id`)
  if (story.facts.length < 4) fail(`${where}: fact card too short`)
  for (const q of story.questions) {
    if (!/[?.]$/.test(q.text) || !q.focus.trim() || !/[.!]$/.test(q.sample)) fail(`${where}: question ${q.id} incomplete`)
    if (/'/.test(q.text + q.sample)) fail(`${where}: ${q.id} should use ’`)
  }
  if (/'/.test([story.scene, story.teaser, ...story.facts].join(' '))) fail(`${where}: scene/facts should use ’`)

  const used = new Set<string>()
  const d = story.decision
  if (d.kind === 'choice') {
    if (!d.options.some((o) => o.id === d.answerId)) fail(`${where}: answerId is not an option`)
    used.add(d.best).add(d.weak)
    for (const o of d.options) {
      if (o.id === d.answerId) continue
      if (!o.outcome) fail(`${where}: wrong option ${o.id} has no ending`)
      else used.add(o.outcome)
    }
    const noContradictions: string[] = []
    if (storyOutcomeId(story, { choiceId: d.answerId, result: { reasonOk: true, feedback: '' } }, noContradictions) !== d.best) fail(`${where}: best ending`)
    if (storyOutcomeId(story, { choiceId: d.answerId, result: { reasonOk: false, feedback: '' } }, noContradictions) !== d.weak) fail(`${where}: weak ending`)
  } else {
    for (const c of d.categories) used.add(c.outcome)
    for (const c of d.categories) {
      if (storyOutcomeId(story, { result: { categoryId: c.id, feedback: '' } }, []) !== c.outcome) fail(`${where}: category ${c.id} ending`)
    }
  }
  if (story.contradictionOverride) {
    used.add(story.contradictionOverride.outcome)
    for (const id of story.contradictionOverride.questionIds) {
      if (!story.questions.some((q) => q.id === id)) fail(`${where}: override names unknown question ${id}`)
    }
    const best = d.kind === 'choice' ? { choiceId: d.answerId, result: { reasonOk: true, feedback: '' } } : { result: { categoryId: d.categories[0].id, feedback: '' } }
    if (storyOutcomeId(story, best, story.contradictionOverride.questionIds.slice(0, 1)) !== story.contradictionOverride.outcome) fail(`${where}: override`)
  }
  for (const id of used) if (!story.outcomes[id]) fail(`${where}: ending ${id} is not defined`)
  for (const id of Object.keys(story.outcomes)) if (!used.has(id)) fail(`${where}: ending ${id} can never happen`)
}

const close = (a: number, b: number) => Math.abs(a - b) < 1e-9
if (!close(roundScore([]), 0)) fail('empty round should score 0')
if (!close(roundScore(['first-try', 'retry', 'missed', 'first-try']), 2.5 / 4)) fail('roundScore weighting is off')

if (errors.length) {
  console.error(`check:tense-game failed (${errors.length}):\n- ${errors.slice(0, 30).join('\n- ')}`)
  process.exit(1)
}
console.log(`check:tense-game passed: ${TENSE_GAME_QUESTIONS.length} questions, rounds OK, ${TENSE_STORIES.length} stories OK.`)
