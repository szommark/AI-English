// Counts the Vercel serverless functions under api/ (Hobby caps a deployment at 12) and
// writes the count for the admin usage page. Underscore-prefixed paths (api/_lib/...) are
// helpers, not functions. Runs as `prebuild`; the output is committed so `vercel dev` works.
import { readdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const apiDir = join(root, 'api')

function countHandlers(dir) {
  let count = 0
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('_') || entry.name.startsWith('.')) continue
    if (entry.isDirectory()) count += countHandlers(join(dir, entry.name))
    else if (/\.(ts|js|mjs|cjs)$/.test(entry.name)) count += 1
  }
  return count
}

const count = countHandlers(apiDir)
writeFileSync(join(apiDir, '_lib', 'generated', 'apiFunctionCount.json'), JSON.stringify({ count }) + '\n')
console.log(`API function count: ${count}`)
