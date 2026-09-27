// Integrity check for the Exam Prep papers and catalog. Run: npm run check:exams
// The answer-key fixtures below were read off the rendered answer keys; if a paper file
// disagrees with them, re-read the PDF rather than editing the fixture.
import {
  EXAM_LANGUAGES,
  EXAM_TYPES,
  LEVELS_BY_TYPE,
  examCatalog,
  examPaperLoaders,
  examPapers,
} from '../src/data/exams/catalog.ts'
import { answerKey, matchText, scorePaper, scoreTask, type ExamAnswers } from '../src/lib/examScoring.ts'
import type { ExamItem, ExamPaper, ExamTask } from '../src/data/exams/types.ts'

const errors: string[] = []
const fail = (msg: string) => errors.push(msg)

// --- Catalog ---------------------------------------------------------------------------

const expectedCells = EXAM_TYPES.reduce((n, t) => n + EXAM_LANGUAGES.length * LEVELS_BY_TYPE[t].length, 0)
if (expectedCells !== 10) fail(`catalog: expected 10 cells, the matrix defines ${expectedCells}`)
if (examCatalog.length !== expectedCells) fail(`catalog: ${examCatalog.length} cells, expected ${expectedCells}`)
const cellKeys = new Set(examCatalog.map((c) => `${c.type}/${c.language}/${c.level}`))
if (cellKeys.size !== examCatalog.length) fail('catalog: duplicate cell')
for (const cell of examCatalog) {
  for (const id of cell.paperIds) if (!examPaperLoaders[id]) fail(`catalog: paper ${id} has no loader`)
}
const paperIds = new Set<string>()
for (const meta of examPapers) {
  if (paperIds.has(meta.id)) fail(`catalog: duplicate paper id ${meta.id}`)
  paperIds.add(meta.id)
  if (!examCatalog.some((c) => c.paperIds.includes(meta.id))) fail(`catalog: paper ${meta.id} is in no cell`)
}
for (const id of Object.keys(examPaperLoaders)) if (!paperIds.has(id)) fail(`catalog: loader ${id} has no metadata`)

// --- Structure -------------------------------------------------------------------------

const GAP = /\{\{([^}]+)\}\}/g

function checkTextAnswer(where: string, answer: { accepted: string[]; match: string; keywords?: string[][]; maxWords?: number }) {
  if (answer.accepted.length === 0 || answer.accepted.some((a) => !a.trim())) fail(`${where}: empty accepted answer`)
  if (answer.match === 'keywords') {
    if (!answer.keywords?.length || answer.keywords.some((g) => !g.length || g.some((s) => !s.trim()))) {
      fail(`${where}: keywords match needs non-empty groups`)
    }
  }
}

function checkItem(where: string, task: ExamTask, item: ExamItem, isExample: boolean) {
  switch (item.type) {
    case 'choice':
      if (!item.answer) fail(`${where}: no answer`)
      // The example's word may be left out of the bank (B1 cloze: "yourself").
      else if (!isExample && !task.bank?.some((b) => b.key === item.answer)) fail(`${where}: answer ${item.answer} is not in the bank`)
      break
    case 'boolean':
      if (typeof item.answer !== 'boolean') fail(`${where}: no answer`)
      if (!item.statement.trim()) fail(`${where}: empty statement`)
      break
    case 'short-text':
    case 'correction':
      checkTextAnswer(where, item.answer)
      break
    case 'multi-select': {
      const keys = new Set(item.options.map((o) => o.key))
      if (keys.size !== item.options.length) fail(`${where}: duplicate option keys`)
      if (item.answer.length !== item.pick) fail(`${where}: ${item.answer.length} answers but pick ${item.pick}`)
      for (const a of item.answer) if (!keys.has(a)) fail(`${where}: answer ${a} is not an option`)
      break
    }
    case 'production':
      if (!(item.minWords > 0 && item.maxWords > item.minWords)) fail(`${where}: bad word range`)
      if (!item.contentPoints.length) fail(`${where}: no content points`)
      break
  }
}

function checkTask(paper: ExamPaper, task: ExamTask) {
  const where = `${paper.id} ${task.id}`
  const all = [...(task.examples ?? []), ...task.items]
  const ids = new Set<string>()
  for (const item of all) {
    if (ids.has(item.id)) fail(`${where}: duplicate item id ${item.id}`)
    ids.add(item.id)
  }
  if (!task.items.length) fail(`${where}: no items`)
  if (!task.instructions.trim()) fail(`${where}: no instructions`)
  task.examples?.forEach((e) => checkItem(`${where} example ${e.id}`, task, e, true))
  task.items.forEach((i) => checkItem(`${where} item ${i.id}`, task, i, false))

  // Gaps and stems point at real items, and every inline item has a place in the passage.
  const placed = new Set<string>()
  for (const block of task.passage ?? []) {
    for (const m of block.text.matchAll(GAP)) {
      if (!ids.has(m[1])) fail(`${where}: gap {{${m[1]}}} has no item`)
      if (placed.has(m[1])) fail(`${where}: item ${m[1]} is placed twice`)
      placed.add(m[1])
    }
    if (block.itemId) {
      if (!ids.has(block.itemId)) fail(`${where}: block for unknown item ${block.itemId}`)
      if (placed.has(block.itemId)) fail(`${where}: item ${block.itemId} is placed twice`)
      placed.add(block.itemId)
    }
  }
  for (const item of all) {
    const needsPlace = item.type === 'choice' || (item.type === 'short-text' && !item.prompt)
    if (needsPlace && !placed.has(item.id)) fail(`${where}: item ${item.id} has no gap or block in the passage`)
    if (!needsPlace && placed.has(item.id)) fail(`${where}: ${item.type} item ${item.id} should not be placed in the passage`)
  }

  if (task.bank) {
    const keys = task.bank.map((b) => b.key)
    if (new Set(keys).size !== keys.length) fail(`${where}: duplicate bank keys`)
    const itemAnswers = task.items.filter((i) => i.type === 'choice').map((i) => (i as { answer: string }).answer)
    if (new Set(itemAnswers).size !== itemAnswers.length) fail(`${where}: a bank option is the answer to two items`)
    const used = new Set([...itemAnswers, ...(task.examples ?? []).filter((e) => e.type === 'choice').map((e) => (e as { answer: string }).answer)])
    const unused = keys.filter((k) => !used.has(k)).length
    if (task.unusedBankCount === undefined) fail(`${where}: bank without unusedBankCount`)
    else if (unused !== task.unusedBankCount) fail(`${where}: ${unused} bank options unused, instructions say ${task.unusedBankCount}`)
  }
  const hasBoolean = task.items.some((i) => i.type === 'boolean')
  if (hasBoolean && !task.booleanLabels) fail(`${where}: boolean items without booleanLabels`)
}

function checkPaper(paper: ExamPaper) {
  const meta = examPapers.find((m) => m.id === paper.id)
  if (!meta) return fail(`${paper.id}: no catalog metadata`)
  for (const k of ['type', 'language', 'level', 'sittingLabelHu'] as const) {
    if (meta[k] !== paper[k]) fail(`${paper.id}: ${k} is ${paper[k]} in the paper but ${meta[k]} in the catalog`)
  }
  const sectionIds = new Set<string>()
  const taskIds = new Set<string>()
  for (const section of paper.sections) {
    if (sectionIds.has(section.id)) fail(`${paper.id}: duplicate section ${section.id}`)
    sectionIds.add(section.id)
    for (const task of section.tasks) {
      if (taskIds.has(task.id)) fail(`${paper.id}: duplicate task ${task.id}`)
      taskIds.add(task.id)
      checkTask(paper, task)
    }
    const sectionTaskIds = new Set(section.tasks.map((t) => t.id))
    const max = section.tasks.flatMap((t) => t.items).reduce((n, i) => n + (i.type === 'production' ? 0 : i.type === 'multi-select' ? i.answer.length : 1), 0)
    if (section.conversion) {
      const c = section.conversion
      if (c.length !== max + 1) fail(`${paper.id} ${section.id}: conversion covers 0..${c.length - 1}, raw max is ${max}`)
      if (c[0] !== 0) fail(`${paper.id} ${section.id}: conversion[0] is ${c[0]}`)
      for (let i = 1; i < c.length; i++) if (c[i] < c[i - 1]) fail(`${paper.id} ${section.id}: conversion drops at ${i}`)
    }
    if (section.audio) {
      let prev = -1
      for (const m of section.audio.taskMarkers ?? []) {
        if (!sectionTaskIds.has(m.taskId)) fail(`${paper.id} ${section.id}: marker for unknown task ${m.taskId}`)
        if (m.startSec <= prev || m.startSec >= section.audio.durationSec) fail(`${paper.id} ${section.id}: marker ${m.taskId} out of order or range`)
        prev = m.startSec
      }
    }
    for (const tr of section.transcripts ?? []) {
      if (!sectionTaskIds.has(tr.taskId)) fail(`${paper.id} ${section.id}: transcript for unknown task ${tr.taskId}`)
    }
    if (section.kind === 'listening' && !section.audio) fail(`${paper.id} ${section.id}: listening without audio`)
  }

  // A fully correct paper scores full marks.
  const perfect: ExamAnswers = {}
  for (const task of paper.sections.flatMap((s) => s.tasks)) {
    for (const item of task.items) {
      const key = answerKey(task.id, item.id)
      if (item.type === 'choice') perfect[key] = item.answer
      else if (item.type === 'boolean') perfect[key] = item.answer
      else if (item.type === 'short-text' || item.type === 'correction') perfect[key] = item.answer.accepted[0]
      else if (item.type === 'multi-select') perfect[key] = item.answer
    }
  }
  const result = scorePaper(paper, perfect)
  for (const s of result.sections) {
    if (s.raw !== s.max) fail(`${paper.id} ${s.sectionId}: the key itself scores ${s.raw}/${s.max}`)
    if (s.scaled !== s.scaledMax) fail(`${paper.id} ${s.sectionId}: the key itself scales to ${s.scaled}/${s.scaledMax}`)
  }
}

// --- Answer-key fixtures ---------------------------------------------------------------

function task(paper: ExamPaper, id: string): ExamTask {
  const t = paper.sections.flatMap((s) => s.tasks).find((x) => x.id === id)
  if (!t) throw new Error(`${paper.id}: no task ${id}`)
  return t
}

function expectChoices(paper: ExamPaper, taskId: string, first: number, keys: string | string[]) {
  const t = task(paper, taskId)
  const expected = Array.isArray(keys) ? keys : keys.split(' ')
  expected.forEach((key, i) => {
    const id = String(first + i)
    const item = t.items.find((x) => x.id === id)
    if (item?.type !== 'choice') return fail(`${paper.id} ${taskId}/${id}: not a choice item`)
    if (item.answer !== key) fail(`${paper.id} ${taskId}/${id}: answer ${item.answer}, key says ${key}`)
  })
  if (t.items.length !== expected.length) fail(`${paper.id} ${taskId}: ${t.items.length} items, key has ${expected.length}`)
}

function expectUnused(paper: ExamPaper, taskId: string, unused: string) {
  const t = task(paper, taskId)
  const used = new Set([...(t.examples ?? []), ...t.items].map((i) => (i.type === 'choice' ? i.answer : '')))
  const actual = (t.bank ?? []).filter((b) => !used.has(b.key)).map((b) => b.key).join(' ')
  if (actual !== unused) fail(`${paper.id} ${taskId}: unused ${actual}, key says ${unused}`)
}

function expectBooleans(paper: ExamPaper, taskId: string, first: number, values: string) {
  const t = task(paper, taskId)
  const [yes] = t.booleanLabels ?? ['T', 'F']
  const expected = values.split(' ')
  expected.forEach((v, i) => {
    const id = String(first + i)
    const item = t.items.find((x) => x.id === id)
    if (item?.type !== 'boolean') return fail(`${paper.id} ${taskId}/${id}: not a boolean item`)
    if (item.answer !== (v === yes)) fail(`${paper.id} ${taskId}/${id}: answer ${item.answer}, key says ${v}`)
  })
  if (t.items.length !== expected.length) fail(`${paper.id} ${taskId}: ${t.items.length} items, key has ${expected.length}`)
}

/** Each entry: item id → answers that must be accepted (and optionally ones that must not). */
function expectText(paper: ExamPaper, taskId: string, cases: Record<string, { ok: string[]; wrong?: string[] }>) {
  const t = task(paper, taskId)
  for (const [id, { ok, wrong = [] }] of Object.entries(cases)) {
    const item = t.items.find((x) => x.id === id)
    if (item?.type !== 'short-text' && item?.type !== 'correction') {
      fail(`${paper.id} ${taskId}/${id}: not a text item`)
      continue
    }
    for (const a of ok) if (!matchText(item.answer, a)) fail(`${paper.id} ${taskId}/${id}: "${a}" should be accepted`)
    for (const a of wrong) if (matchText(item.answer, a)) fail(`${paper.id} ${taskId}/${id}: "${a}" should not be accepted`)
  }
  const missing = t.items.filter((i) => !(i.id in cases)).map((i) => i.id)
  if (missing.length) fail(`${paper.id} ${taskId}: no fixture for items ${missing.join(', ')}`)
}

function checkErettsegiDe(p: ExamPaper) {
  expectChoices(p, 'I-1', 1, 'H F A K B E J D')
  expectUnused(p, 'I-1', 'G')
  expectBooleans(p, 'I-2', 9, 'F R F F R R F R R R')
  expectChoices(p, 'I-3', 19, 'D I G B E A H')
  expectUnused(p, 'I-3', 'F')
  expectChoices(p, 'II-1', 1, 'M L K A G P O E')
  expectUnused(p, 'II-1', 'B D F H I N')
  const ii1 = task(p, 'II-1')
  const words: Record<string, string> = { M: 'UNS', L: 'UM', K: 'ODER', A: 'AUS', G: 'EUER', P: 'WIRD', O: 'WIE', E: 'EINEN' }
  for (const [k, w] of Object.entries(words)) {
    if (ii1.bank?.find((b) => b.key === k)?.text !== w) fail(`${p.id} II-1: bank ${k} should be ${w}`)
  }
  expectText(p, 'II-2', {
    '9': { ok: ['gefeiert'], wrong: ['Gefeiert', 'gefeirt'] },
    '10': { ok: ['bleiben'], wrong: ['Bleiben'] },
    '11': { ok: ['erfunden'], wrong: ['erfinden'] },
    '12': { ok: ['haben', 'hatten'], wrong: ['hat'] },
    '13': { ok: ['freuen'], wrong: ['gefreut'] },
    '14': { ok: ['kann', 'könnte'], wrong: ['konnte'] },
  })
  expectChoices(p, 'II-3', 15, 'B A C H F E D')
  expectUnused(p, 'II-3', 'I')
  expectBooleans(p, 'III-1', 1, 'R F F R F R R')
  expectText(p, 'III-2', {
    '8': { ok: ['Aromastoff', 'als Aromastoff'], wrong: ['Farbstoff'] },
    '9': { ok: ['Mitte', 'Mitte des 17. Jahrhunderts'], wrong: ['Ende'] },
    '10': { ok: ['Birne', 'Birnensorte', 'eine Birnensorte'], wrong: ['Stadt'] },
    '11': { ok: ['weiß', 'Weiß'], wrong: ['gelb'] },
    '12': { ok: ['Regen', 'viel Regen'], wrong: ['Sonne'] },
    '13': { ok: ['März', 'November und März'], wrong: ['Dezember'] },
  })

  // III/3: which of the twelve statements are ticked (besides the example).
  const ms = task(p, 'III-3').items[0]
  if (ms?.type !== 'multi-select') fail(`${p.id} III-3: not a multi-select`)
  else {
    const ticked = [
      'wann der Name Black Friday zuerst verwendet wurde',
      'warum die Leute um diese Zeit gern shoppen gehen',
      'wann die Geschäfte beginnen die Waren billiger',
      'was die Händler über den Black Friday sagen',
      'warum man beim Kauf aufpassen muss',
      'wie man unnötige Black-Friday-Käufe vermeiden kann',
      'worauf der Kauf-nix-Tag aufmerksam macht',
    ]
    const notTicked = [
      'welche Produkte die Leute am wenigsten kaufen',
      'wie man am günstigsten einkaufen kann',
      'welche Online-Shops die beliebtesten sind',
      'in welchem Land der Kauf-nix-Tag stattfindet',
    ]
    const keyOf = (prefix: string) => ms.options.find((o) => o.text.startsWith(prefix))?.key
    for (const s of ticked) if (!ms.answer.includes(keyOf(s) ?? '?')) fail(`${p.id} III-3: "${s}" should be ticked`)
    for (const s of notTicked) {
      const k = keyOf(s)
      if (!k) fail(`${p.id} III-3: option "${s}" missing`)
      else if (ms.answer.includes(k)) fail(`${p.id} III-3: "${s}" should not be ticked`)
    }
    if (ms.options.length !== 11 || !ms.exampleOption) fail(`${p.id} III-3: expected 11 options plus the example`)
  }

  const r = scorePaper(p, {})
  const maxima = r.sections.map((s) => `${s.sectionId}:${s.max}/${s.scaledMax ?? '-'}`).join(' ')
  if (maxima !== 'I:25/33 II:21/18 III:20/33 IV:0/-') fail(`${p.id}: section maxima ${maxima}`)
  if (r.scaledMax !== 117 || r.writingMax !== 33) fail(`${p.id}: written total ${r.scaledMax}, writing ${r.writingMax}`)
  const writing = p.sections.find((s) => s.id === 'IV')?.tasks.flatMap((t) => t.items) ?? []
  const openings = writing.map((i) => (i.type === 'production' ? `${i.opening}|${i.minWords}-${i.maxWords}` : ''))
  if (openings.join(' ; ') !== 'Sehr geehrte Damen und Herren,|80-100 ; Hallo Leute,|100-120') fail(`${p.id}: writing tasks ${openings.join(' ; ')}`)
}

function checkB1En(p: ExamPaper) {
  expectChoices(p, 'R-cloze', 1, [
    'occasionally', 'might be', 'can', 'more', 'but', 'rather', 'increase', 'accept',
    'grow', 'easy', 'focus', 'positively', 'for', 'perfection', 'about',
  ])
  expectUnused(p, 'R-cloze', 'must')
  expectText(p, 'R-1', {
    '1': { ok: ['donate to charities', 'donate to food banks', 'donate it to charities', 'give it to food banks'], wrong: ['throw it away'] },
    '2': { ok: ['tax breaks to businesses', 'give tax breaks'], wrong: ['fines'] },
    '3': { ok: ['9.8 million', '9,8 million'], wrong: ['10 million'] },
    '4': { ok: ['banned cars from city streets', 'banned cars'], wrong: ['made a plan'] },
    '5': { ok: ['Delhi', 'Paris'], wrong: ['Barcelona'] },
    '6': { ok: ['face wash soaps', 'body scrubs', 'face washes'], wrong: ['cups'] },
    '7': { ok: ['2016', 'in 2016'], wrong: ['2017'] },
    '8': { ok: ['marine pollution', 'ocean pollution', 'marine health'], wrong: ['air pollution'] },
    '9': { ok: ['5 billion', 'nearly 5 billion', 'five billion'], wrong: ['5 million'] },
    '10': { ok: ['biodegradable', 'biodegradables', 'biodegradable cups'], wrong: ['paper cups', 'they will use biodegradable plastic cups instead'] },
  })
  expectBooleans(p, 'R-2', 11, 'F T T F T')
  expectBooleans(p, 'L-1', 1, 'T T F F T T F')
  expectText(p, 'L-2', {
    '1': { ok: ['Spanish', 'spanish'], wrong: ['English'] },
    '2': { ok: ['18'], wrong: ['8'] },
    '3': { ok: ['University', 'university'], wrong: ['Uni'] },
    '4': { ok: ['lie'], wrong: ['sit'] },
    '5': { ok: ['monotone'], wrong: ['monotonous languages'] },
    '6': { ok: ['non-speech'], wrong: ['music'] },
    '7': { ok: ['activity'], wrong: ['brain'] },
    '8': { ok: ['older'], wrong: ['younger'] },
  })
  for (const id of ['R-2', 'L-1']) if (!task(p, id).rules?.allSameBooleanIsZero) fail(`${p.id} ${id}: allSameBooleanIsZero missing`)
}

// --- Scoring rules ---------------------------------------------------------------------

function checkRules(de: ExamPaper, b1: ExamPaper) {
  const tf = task(b1, 'R-2')
  const allTrue: ExamAnswers = Object.fromEntries(tf.items.map((i) => [answerKey(tf.id, i.id), true]))
  const r1 = scoreTask(tf, allTrue)
  if (r1.raw !== 0 || r1.rule?.kind !== 'allSame') fail('rules: all-T answers should score 0')

  const ms = task(de, 'III-3')
  const item = ms.items[0]
  if (item.type !== 'multi-select') return
  const key = answerKey(ms.id, item.id)
  const right = scoreTask(ms, { [key]: item.answer })
  if (right.raw !== 7) fail(`rules: the correct 7 ticks score ${right.raw}`)
  const wrongOnes = item.options.map((o) => o.key).filter((k) => !item.answer.includes(k))
  const nine = scoreTask(ms, { [key]: [...item.answer, ...wrongOnes.slice(0, 2)] })
  if (nine.raw !== 5) fail(`rules: 7 right + 2 extra ticks should score 5, got ${nine.raw}`)
  const all = scoreTask(ms, { [key]: item.options.map((o) => o.key) })
  if (all.raw !== 0 || all.rule?.kind !== 'allTicked') fail('rules: ticking every box should score 0')
}

// --- Run -------------------------------------------------------------------------------

const papers = new Map<string, ExamPaper>()
for (const [id, load] of Object.entries(examPaperLoaders)) {
  const paper = (await load()).default
  if (paper.id !== id) fail(`loader ${id} returns paper ${paper.id}`)
  papers.set(id, paper)
  checkPaper(paper)
}
const de = papers.get('erettsegi-de-kozep-2025-majus')
const b1 = papers.get('nyelvvizsga-en-b1-minta-01')
if (de) checkErettsegiDe(de)
else fail('érettségi DE közép 2025 május is missing')
if (b1) checkB1En(b1)
else fail('B1 General English minta 1 is missing')
if (de && b1) checkRules(de, b1)

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}
console.log(`Exam papers OK: ${papers.size} papers, ${examCatalog.length} catalog cells`)
