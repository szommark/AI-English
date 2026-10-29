// Integrity check for the Grammar Coach curriculum. Run: npm run check:grammar
import {
  GRAMMAR_CATEGORIES,
  GRAMMAR_LEVELS,
  GRAMMAR_POINTS,
  getGrammarPoint,
  grammarCurriculum,
} from '../src/data/grammarCurriculum.ts'
import { MISTAKE_TAXONOMY } from '../src/data/mistakeTaxonomy.ts'

const EXPECTED: Record<string, number> = { A1: 16, A2: 27, B1: 29, B2: 34, C1: 21, C2: 10 }
const errors: string[] = []
const fail = (msg: string) => errors.push(msg)

if (GRAMMAR_POINTS.length !== 137) fail(`expected 137 points, found ${GRAMMAR_POINTS.length}`)

const ids = new Set<string>()
for (const group of grammarCurriculum) {
  if (group.items.length !== EXPECTED[group.level]) {
    fail(`${group.level}: expected ${EXPECTED[group.level]} points, found ${group.items.length}`)
  }
  const titles = new Set<string>()
  group.items.forEach((p, i) => {
    if (ids.has(p.id)) fail(`duplicate id ${p.id}`)
    ids.add(p.id)
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.id)) fail(`${p.id}: id is not kebab-case`)
    if (!p.id.startsWith(`${group.level.toLowerCase()}-`)) fail(`${p.id}: id prefix does not match level ${group.level}`)
    if (p.order !== i + 1) fail(`${p.id}: order ${p.order}, expected ${i + 1}`)
    if (!GRAMMAR_LEVELS.includes(group.level)) fail(`${p.id}: bad level`)
    if (!(GRAMMAR_CATEGORIES as readonly string[]).includes(p.category)) fail(`${p.id}: bad category ${p.category}`)
    if (!p.title.trim() || !p.titleHu.trim()) fail(`${p.id}: empty title/titleHu`)
    if (titles.has(p.title)) fail(`${group.level}: duplicate title "${p.title}"`)
    titles.add(p.title)
    if (p.hint !== undefined && p.hint.length > 160) fail(`${p.id}: hint is ${p.hint.length} chars (max 160)`)
    if (getGrammarPoint(p.id)?.id !== p.id) fail(`${p.id}: getGrammarPoint round-trip failed`)
  })
}

// Tense reviews: numbered 1, 2, 3… in curriculum order, each right after a tense lesson,
// and each mixing every tense of the previous review plus its own focus.
let prevTenses: string[] = []
GRAMMAR_POINTS.forEach((p, i) => {
  const review = p.review
  if (!review) return
  const number = GRAMMAR_POINTS.slice(0, i + 1).filter((q) => q.review).length
  if (review.number !== number) fail(`${p.id}: review number ${review.number}, expected ${number}`)
  if (p.id !== `${p.id.slice(0, 2)}-tense-review-${number}`) fail(`${p.id}: review id should end in tense-review-${number}`)
  if (!p.title.startsWith(`Tense review ${number}: `)) fail(`${p.id}: title should start "Tense review ${number}: "`)
  if (p.category !== 'tense_aspect') fail(`${p.id}: review category must be tense_aspect`)
  const prev = GRAMMAR_POINTS[i - 1]
  if (!prev || prev.review || prev.category !== 'tense_aspect') fail(`${p.id}: must follow a tense lesson`)
  if (review.tenses.length < 2) fail(`${p.id}: a review needs at least two tenses`)
  for (const t of review.focus) if (!review.tenses.includes(t)) fail(`${p.id}: focus "${t}" is not in tenses`)
  for (const t of prevTenses) if (!review.tenses.includes(t)) fail(`${p.id}: drops "${t}" from the previous review`)
  prevTenses = review.tenses
})

const used = new Set(GRAMMAR_POINTS.map((p) => p.category))
for (const c of GRAMMAR_CATEGORIES) if (!used.has(c)) fail(`category ${c} is never used`)

// Every lesson a mistake subtype links to must exist (the learner's "next step" card opens it).
const subtypeIds = new Set<string>()
for (const area of MISTAKE_TAXONOMY) {
  for (const subtype of area.subtypes) {
    if (subtypeIds.has(subtype.id)) fail(`mistake taxonomy: duplicate subtype id ${subtype.id}`)
    subtypeIds.add(subtype.id)
    for (const lessonId of subtype.lessonIds) {
      if (!getGrammarPoint(lessonId)) fail(`mistake taxonomy: ${subtype.id} links to unknown lesson ${lessonId}`)
    }
  }
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}
console.log(`Grammar curriculum OK: ${GRAMMAR_POINTS.length} points`)
