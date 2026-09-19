// Integrity check for the Grammar Coach curriculum. Run: npm run check:grammar
import {
  GRAMMAR_CATEGORIES,
  GRAMMAR_LEVELS,
  GRAMMAR_POINTS,
  getGrammarPoint,
  grammarCurriculum,
} from '../src/data/grammarCurriculum.ts'

const EXPECTED: Record<string, number> = { A1: 16, A2: 21, B1: 26, B2: 31, C1: 19, C2: 10 }
const errors: string[] = []
const fail = (msg: string) => errors.push(msg)

if (GRAMMAR_POINTS.length !== 123) fail(`expected 123 points, found ${GRAMMAR_POINTS.length}`)

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

const used = new Set(GRAMMAR_POINTS.map((p) => p.category))
for (const c of GRAMMAR_CATEGORIES) if (!used.has(c)) fail(`category ${c} is never used`)

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}
console.log(`Grammar curriculum OK: ${GRAMMAR_POINTS.length} points`)
