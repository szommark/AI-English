// Checking an existing listening task: its recording script usually has no answer markers. This
// places them automatically so the spacing checks and the test-mode excerpts work. Notes answers
// are found word for word; a true/false statement goes to the sentence that shares most of its
// content words, marking the stretch from the first to the last shared word. Items are searched
// in order, each after the previous one. The teacher checks the result in the preview.

import type { ListeningTaskContent } from './examTasks'
import { FUNCTION_WORDS, stem } from './listeningChecks'
import { normWord } from './listeningScript'

const WORD_RE = /[\p{L}\p{N}]+(?:[’'\-‐‑.,/][\p{L}\p{N}]+)*%?/gu

interface Token {
  norm: string
  from: number
  to: number
  sentence: number
}

function tokenize(script: string): Token[] {
  const tokens: Token[] = []
  let sentence = 0
  for (const m of script.matchAll(WORD_RE)) {
    const from = m.index ?? 0
    const to = from + m[0].length
    tokens.push({ norm: normWord(m[0]), from, to, sentence })
    const rest = script.slice(to)
    const end = rest.match(/^\s*["”’)]*\s*[.!?]+/)
    if ((end && !/^\d/.test(rest.slice(end[0].length))) || /^[^\p{L}\p{N}]*\n\s*\n/u.test(rest)) sentence++
  }
  return tokens
}

function contentStems(text: string): string[] {
  return text
    .split(/\s+/)
    .map(normWord)
    .filter((w) => w && (/^\d/.test(w) || (w.length > 2 && !FUNCTION_WORDS.has(w))))
    .map(stem)
}

export interface AutoMarkResult {
  script: string
  placed: string[]
  missing: string[]
}

/** Inserts `[[id|…]]` markers into a script that has none. */
export function autoMarkScript(content: ListeningTaskContent): AutoMarkResult {
  const script = content.script
  const tokens = tokenize(script)
  const spans: { id: string; from: number; to: number }[] = []
  const missing: string[] = []
  let cursor = 0 // token index the next item's search starts at
  // In how many sentences each word stem occurs.
  const sentencesWith = new Map<string, Set<number>>()
  for (const t of tokens) {
    const key = stem(t.norm)
    sentencesWith.set(key, (sentencesWith.get(key) ?? new Set()).add(t.sentence))
  }

  const items =
    content.format === 'true-false'
      ? (content.statements ?? []).map((s) => ({ id: s.id, text: s.text, variants: [s.text] }))
      : (content.answers ?? []).map((a) => ({ id: a.id, text: a.accepted.join(' '), variants: a.accepted.filter((v) => v.trim()) }))

  for (const item of items) {
    if (!item.text.trim()) {
      missing.push(item.id)
      continue
    }
    let hit: { start: number; end: number } | null = null

    if (content.format === 'notes') {
      // Any accepted form may be the spoken one (key "2022 / twenty twenty-two").
      const find = (needle: string[], from: number) => {
        for (let i = from; i + needle.length <= tokens.length; i++) {
          if (needle.every((w, k) => tokens[i + k].norm === w)) return { start: i, end: i + needle.length - 1 }
        }
        return null
      }
      const needles = item.variants.map((v) => v.split(/\s+/).map(normWord).filter(Boolean)).filter((n) => n.length)
      const after = needles.map((n) => find(n, cursor)).filter((h): h is { start: number; end: number } => !!h)
      const anywhere = needles.map((n) => find(n, 0)).filter((h): h is { start: number; end: number } => !!h)
      hit = (after.length ? after : anywhere).sort((a, b) => a.start - b.start)[0] ?? null
    } else {
      const wanted = new Set(contentStems(item.text))
      if (wanted.size === 0) {
        missing.push(item.id)
        continue
      }
      let best: { start: number; end: number; score: number } | null = null
      const firstSentence = tokens[cursor]?.sentence ?? 0
      const lastSentence = tokens.length ? tokens[tokens.length - 1].sentence : 0
      for (let s = firstSentence; s <= lastSentence; s++) {
        const inSentence = tokens.map((t, i) => ({ t, i })).filter(({ t, i }) => t.sentence === s && i >= cursor)
        const matched = inSentence.filter(({ t }) => wanted.has(stem(t.norm)))
        const score = new Set(matched.map(({ t }) => stem(t.norm))).size
        if (score <= (best?.score ?? 0)) continue
        // The span runs over the shared words, minus topic words heard all through the script
        // ("course", "rain") at its edges, which would stretch it to the whole sentence.
        const common = (i: number) => (sentencesWith.get(stem(tokens[i].norm))?.size ?? 0) > 2
        let lo = 0
        let hi = matched.length - 1
        while (lo < hi && common(matched[lo].i)) lo++
        while (hi > lo && common(matched[hi].i)) hi--
        best = { start: matched[lo].i, end: matched[hi].i, score }
      }
      // At least two shared content words (or one, for a very short statement).
      if (best && best.score >= Math.min(2, wanted.size)) hit = { start: best.start, end: best.end }
    }

    if (!hit) {
      missing.push(item.id)
      continue
    }
    spans.push({ id: item.id, from: tokens[hit.start].from, to: tokens[hit.end].to })
    cursor = hit.end + 1
  }

  // Insert from the end so earlier offsets stay valid; skip spans that overlap one already placed.
  let out = script
  const placed: string[] = []
  let limit = Infinity
  for (const s of [...spans].sort((a, b) => b.from - a.from)) {
    if (s.to > limit) {
      missing.push(s.id)
      continue
    }
    out = `${out.slice(0, s.from)}[[${s.id}|${out.slice(s.from, s.to)}]]${out.slice(s.to)}`
    placed.push(s.id)
    limit = s.from
  }
  const order = (ids: string[]) => [...new Set(ids)].sort((a, b) => Number(a) - Number(b))
  return { script: out, placed: order(placed), missing: order(missing) }
}
