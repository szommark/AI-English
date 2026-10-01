// Integrity check for the Stress Patterns and Connected Speech sessions. Run: npm run check:pronunciation
// Imports the data files directly (not lessons/index.ts, whose .js specifiers Node's type stripping can't resolve).
import { stressPatterns } from '../src/data/pronunciationLessons/stressPatterns.ts'
import { connectedSpeech } from '../src/data/pronunciationLessons/connectedSpeech.ts'
import { getSoundItem } from '../src/data/pronunciationCurriculum.ts'
import { phonemes } from '../src/data/phonemes.ts'
import type { LessonSession, Step } from '../src/data/pronunciationLessons/types.ts'

const errors: string[] = []
const fail = (msg: string) => errors.push(msg)

const sessions: LessonSession[] = [stressPatterns, connectedSpeech]
const kebab = /^[a-z0-9]+(-[a-z0-9]+)*$/

function checkStep(where: string, step: Step) {
  switch (step.type) {
    case 'listen-choose':
      if (step.options.length < 2) fail(`${where}: needs at least 2 options`)
      if (!Number.isInteger(step.correct) || step.correct < 0 || step.correct >= step.options.length) fail(`${where}: correct ${step.correct} out of range`)
      if (new Set(step.options).size !== step.options.length) fail(`${where}: duplicate options`)
      if (!step.promptHu.trim()) fail(`${where}: empty prompt`)
      break
    case 'syllable-tap':
      if (step.syllables.join('').toLowerCase() !== step.target.toLowerCase()) fail(`${where}: syllables "${step.syllables.join('-')}" do not join to "${step.target}"`)
      if (!Number.isInteger(step.stressed) || step.stressed < 0 || step.stressed >= step.syllables.length) fail(`${where}: stressed ${step.stressed} out of range`)
      if (!step.audio.toLowerCase().includes(step.target.toLowerCase())) fail(`${where}: audio does not contain target "${step.target}"`)
      break
    case 'token-select': {
      const slots = step.mode === 'gaps' ? step.tokens.length - 1 : step.tokens.length
      if (step.correct.length === 0) fail(`${where}: no correct answers`)
      for (const i of step.correct) if (!Number.isInteger(i) || i < 0 || i >= slots) fail(`${where}: correct index ${i} out of range (0..${slots - 1})`)
      if (new Set(step.correct).size !== step.correct.length) fail(`${where}: duplicate correct indices`)
      if (step.audio.replace(/[^\w']+/g, ' ').trim().toLowerCase() !== step.tokens.join(' ').replace(/[^\w']+/g, ' ').trim().toLowerCase()) {
        fail(`${where}: tokens do not match the audio sentence`)
      }
      break
    }
    case 'odd-one-out':
      if (![0, 1, 2].includes(step.oddIndex)) fail(`${where}: oddIndex out of range`)
      if (new Set(step.words).size !== 3) fail(`${where}: duplicate words`)
      break
    case 'dictation': {
      const text = step.text.toLowerCase()
      if (step.keyWords.length === 0) fail(`${where}: no keyWords`)
      for (const k of step.keyWords) if (!text.includes(k.toLowerCase())) fail(`${where}: keyWord "${k}" not in the sentence`)
      break
    }
    case 'production':
      if (!step.sentence.trim()) fail(`${where}: empty sentence`)
      break
  }
}

const allUnitIds = new Set<string>()
const funnelIds = new Set<string>()
for (const session of sessions) {
  if (!kebab.test(session.id)) fail(`${session.id}: session id is not kebab-case`)
  if (session.units.length === 0) fail(`${session.id}: no units`)
  for (const unit of session.units) {
    const where = `${session.id}/${unit.id}`
    if (allUnitIds.has(unit.id)) fail(`${where}: duplicate unit id`)
    allUnitIds.add(unit.id)
    if (!kebab.test(unit.id)) fail(`${where}: id is not kebab-case`)
    if (!unit.title.trim() || !unit.titleHu.trim() || !unit.summaryHu.trim()) fail(`${where}: empty title/titleHu/summaryHu`)
    if (unit.theory.length === 0) fail(`${where}: no theory`)
    for (const block of unit.theory) {
      if (!block.bodyHu.trim()) fail(`${where}: empty theory body`)
      const texts = new Set<string>()
      for (const ex of block.examples ?? []) {
        if (texts.has(ex.text)) fail(`${where}: duplicate theory example "${ex.text}"`)
        texts.add(ex.text)
      }
    }
    if (unit.body.kind === 'funnel') {
      funnelIds.add(unit.body.soundItemId)
      if (!getSoundItem(unit.body.soundItemId)) fail(`${where}: funnel item "${unit.body.soundItemId}" is not in pronunciationCurriculum`)
      if (phonemes.some((p) => p.curriculumId === unit.body.soundItemId)) fail(`${where}: funnel item "${unit.body.soundItemId}" already has a Sound Bank tile`)
    } else {
      if (unit.body.steps.length === 0) fail(`${where}: no steps`)
      unit.body.steps.forEach((step, i) => checkStep(`${where} step ${i + 1} (${step.type})`, step))
    }
  }
}
for (const id of allUnitIds) if (getSoundItem(id)) fail(`unit id "${id}" collides with a curriculum item id`)
for (const id of funnelIds) if (allUnitIds.has(id)) fail(`funnel item id "${id}" collides with a unit id`)

if (errors.length > 0) {
  console.error(errors.map((e) => `✗ ${e}`).join('\n'))
  process.exit(1)
}
const unitCount = sessions.reduce((n, s) => n + s.units.length, 0)
const stepCount = sessions.reduce((n, s) => n + s.units.reduce((m, u) => m + (u.body.kind === 'steps' ? u.body.steps.length : 0), 0), 0)
console.log(`Pronunciation lessons OK: ${sessions.length} sessions, ${unitCount} units, ${stepCount} steps.`)
