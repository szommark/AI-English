// Imports the Vocabulary word bank into vocab_word_bank (docs/vocabulary-builder-design.md §5.3).
//
//   npm run wordbank:check     build and print the counts, write nothing
//   npm run wordbank:import    upsert into Supabase (needs SUPABASE_URL and
//                              SUPABASE_SERVICE_ROLE_KEY in .env)
//
// Idempotent: rows are upserted on term_normalized, so re-running after a data or
// topic-map change updates level, part of speech and topics. `hidden` is never sent, so
// words hidden in the database stay hidden.
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import { VOCAB_TOPICS } from '../src/lib/vocab.ts'
import { buildWordBank, type TopicMap } from './wordBank.ts'

const DIR = new URL('../data/wordbank/', import.meta.url)
const BATCH_SIZE = 500

const read = (name: string) => readFileSync(new URL(name, DIR), 'utf8')
const build = buildWordBank(
  read('cefrj-vocabulary-profile-1.5.csv'),
  read('octanove-vocabulary-profile-c1c2-1.0.csv'),
  JSON.parse(read('topic-map.json')) as TopicMap,
)

if (build.unknownCategories.length > 0) {
  console.error('topic-map.json neither maps nor lists these categories:', build.unknownCategories)
  process.exit(1)
}

const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const
console.log(`${build.rows.length} words (merged ${build.merged} repeated headwords, skipped ${build.skippedFunctionWords} function words)`)
console.table(
  Object.fromEntries(
    VOCAB_TOPICS.map((topic) => [
      topic,
      Object.fromEntries(levels.map((l) => [l, build.rows.filter((r) => r.cefr_level === l && r.topics.includes(topic)).length])),
    ]),
  ),
)
console.log(
  'per level:',
  Object.fromEntries(levels.map((l) => [l, build.rows.filter((r) => r.cefr_level === l).length])),
  '· with a topic:',
  build.rows.filter((r) => r.topics.length > 0).length,
)

if (process.argv.includes('--dry-run')) process.exit(0)

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (run with --env-file=.env).')
  process.exit(1)
}
const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })

for (let i = 0; i < build.rows.length; i += BATCH_SIZE) {
  const batch = build.rows.slice(i, i + BATCH_SIZE)
  const { error } = await supabase.from('vocab_word_bank').upsert(batch, { onConflict: 'term_normalized' })
  if (error) {
    console.error(`Batch starting at row ${i} failed:`, error)
    process.exit(1)
  }
  console.log(`upserted ${Math.min(i + BATCH_SIZE, build.rows.length)} / ${build.rows.length}`)
}
console.log('Word bank imported.')
