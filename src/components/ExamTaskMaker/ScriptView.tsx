import type { ReactNode } from 'react'
import type { ItemDistance } from '../../lib/listeningChecks'

const MARKER_RE = /\[\[\s*(\d{1,2})\s*(?:\|([^\]]*))?\]\]/g

function gapLabel(d: ItemDistance | undefined): string {
  return d?.gapSyllables === null || d?.gapSyllables === undefined ? '' : ` · ${d.gapSyllables}`
}

/** Text with `[[n|words]]` markers drawn as numbered highlights (and their syllable gap). */
export function MarkedText({ text, distances, focusId }: { text: string; distances?: ItemDistance[]; focusId?: string }) {
  const parts: ReactNode[] = []
  let last = 0
  for (const m of text.matchAll(MARKER_RE)) {
    if ((m.index ?? 0) > last) parts.push(text.slice(last, m.index))
    const id = m[1]
    const d = distances?.find((x) => x.id === id)
    const short = d?.gapSyllables !== null && d?.gapSyllables !== undefined && d.gapSyllables < 15
    const dim = focusId !== undefined && focusId !== id
    parts.push(
      <mark
        key={`${id}-${m.index}`}
        className={`rounded px-0.5 ${dim ? 'bg-muted text-foreground' : short ? 'bg-rose-100 text-rose-900' : 'bg-amber-100 text-amber-950'}`}
      >
        <sup className={`mr-0.5 font-semibold ${short ? 'text-rose-700' : 'text-amber-800'}`}>
          ({id}){focusId === undefined ? gapLabel(d) : ''}
        </sup>
        {m[2] ?? ''}
      </mark>,
    )
    last = (m.index ?? 0) + m[0].length
  }
  if (last < text.length) parts.push(text.slice(last))
  return <>{parts}</>
}

/** The annotated script, paragraph by paragraph. */
export default function ScriptView({ script, distances }: { script: string; distances?: ItemDistance[] }) {
  const paragraphs = script.split(/\n\s*\n/).filter((p) => p.trim())
  return (
    <div lang="en" className="space-y-3 text-[0.95rem] leading-relaxed text-foreground">
      {paragraphs.map((p, i) => (
        <p key={i} className="whitespace-pre-line">
          <MarkedText text={p.trim()} distances={distances} />
        </p>
      ))}
    </div>
  )
}

/** The sentence holding item `id`'s marker, with the sentence before it for the cue. */
export function markerExcerpt(script: string, id: string): string | null {
  const para = script.split(/\n\s*\n/).find((p) => new RegExp(`\\[\\[\\s*${id}\\s*[|\\]]`).test(p))
  if (!para) return null
  // Split into sentences without breaking inside a marker.
  const sentences: string[] = []
  let buf = ''
  let depth = 0
  for (let i = 0; i < para.length; i++) {
    const ch = para[i]
    if (para.startsWith('[[', i)) depth++
    if (para.startsWith(']]', i)) depth = Math.max(0, depth - 1)
    buf += ch
    if (depth === 0 && /[.!?]/.test(ch) && /\s/.test(para[i + 1] ?? ' ') && !/\d/.test(para[i - 1] ?? '')) {
      sentences.push(buf.trim())
      buf = ''
    }
  }
  if (buf.trim()) sentences.push(buf.trim())
  const at = sentences.findIndex((s) => new RegExp(`\\[\\[\\s*${id}\\s*[|\\]]`).test(s))
  return sentences.slice(Math.max(0, at - 1), at + 1).join(' ')
}
