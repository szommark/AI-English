import { Fragment, type ReactNode } from 'react'
import { Check, X } from 'lucide-react'

/**
 * One line of course text: **bold** (and a stray *single-asterisk* pair, which the AI sometimes
 * writes) shown bold, ==highlight== shown as a marked form.
 */
export function InlineText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*|==[^=]+==|\*[^*\s][^*]*\*)/).map((part, k) => {
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4)
          return (
            <strong key={k} className="font-semibold text-foreground">
              {part.slice(2, -2)}
            </strong>
          )
        if (part.startsWith('==') && part.endsWith('==') && part.length > 4)
          return (
            <mark key={k} className="rounded bg-[var(--teal-accent-soft)] px-1 font-semibold text-foreground">
              {part.slice(2, -2)}
            </mark>
          )
        if (part.startsWith('*') && part.endsWith('*') && part.length > 2)
          return (
            <strong key={k} className="font-semibold text-foreground">
              {part.slice(1, -1)}
            </strong>
          )
        return <Fragment key={k}>{part}</Fragment>
      })}
    </>
  )
}

/** Plain words of a line (no markers), e.g. for reading it aloud. */
export function plainLine(text: string): string {
  return text.replace(/\*\*|==|\*/g, '').trim()
}

type Zone = 'past' | 'now' | 'future' | 'past-now' | 'now-future'
const ZONES: Record<Zone, [number, number]> = { past: [16, 16], now: [50, 50], future: [84, 84], 'past-now': [12, 50], 'now-future': [50, 88] }

/** "TIMELINE: I lived there (past); I have lived here since 2020 (past-now)" as a drawn time line. */
function Timeline({ spec }: { spec: string }) {
  const items = spec
    .split(';')
    .map((p) => p.trim())
    .map((p) => {
      const m = p.match(/^(.*)\((past-now|now-future|past|now|future)\)\s*$/i)
      return m ? { label: m[1].trim(), zone: m[2].toLowerCase() as Zone } : null
    })
    .filter((x): x is { label: string; zone: Zone } => !!x && !!x.label)
  if (items.length === 0) return null
  return (
    <div className="my-1 rounded-xl border border-border bg-card p-3" role="img" aria-label={items.map((i) => `${i.label}: ${i.zone}`).join('; ')}>
      <div className="relative mx-2 h-6">
        <div className="absolute left-0 right-0 top-3 h-0.5 bg-muted-foreground/40" />
        <div className="absolute top-1 h-4 w-0.5 bg-foreground/60" style={{ left: '50%' }} />
        {items.map((it, i) => {
          const [a, b] = ZONES[it.zone]
          return a === b ? (
            <span key={i} className="absolute top-1.5 h-3 w-3 -translate-x-1/2 rounded-full bg-[var(--teal-accent-strong)]" style={{ left: `${a}%` }} />
          ) : (
            <span key={i} className="absolute top-2 h-2 rounded-full bg-[var(--teal-accent)]" style={{ left: `${a}%`, width: `${b - a}%` }} />
          )
        })}
      </div>
      <div className="mx-2 flex justify-between text-[11px] uppercase tracking-wide text-muted-foreground">
        <span>past</span>
        <span>now</span>
        <span>future</span>
      </div>
      <ul className="mt-2 space-y-1 text-sm">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className={`mt-1.5 shrink-0 rounded-full bg-[var(--teal-accent-strong)] ${ZONES[it.zone][0] === ZONES[it.zone][1] ? 'h-2 w-2' : 'h-1.5 w-4'}`} />
            <span>
              <InlineText text={it.label} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

const cells = (line: string) =>
  line
    .trim()
    .replace(/^\||\|$/g, '')
    .split('|')
    .map((c) => c.trim())

/** A Markdown table: the first row is the header; a "---" row is skipped. */
function Table({ lines }: { lines: string[] }) {
  const rows = lines.filter((l) => !/^\|?\s*:?-{2,}/.test(l.trim())).map(cells)
  const [head, ...body] = rows
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse overflow-hidden rounded-lg text-sm">
        <thead>
          <tr>
            {head.map((h, i) => (
              <th key={i} className="border border-border bg-secondary px-2 py-1.5 text-left font-semibold text-foreground">
                <InlineText text={h} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((r, i) => (
            <tr key={i}>
              {head.map((_, j) => (
                <td key={j} className="border border-border bg-card px-2 py-1.5 align-top">
                  <InlineText text={r[j] ?? ''} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** A ✓ or ✗ example line, green or red. */
function MarkedLine({ ok, text }: { ok: boolean; text: string }) {
  return (
    <p
      className={`flex items-start gap-2 rounded-lg px-3 py-1.5 ${ok ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100' : 'bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-100'}`}
    >
      {ok ? <Check className="mt-0.5 h-4 w-4 shrink-0" /> : <X className="mt-0.5 h-4 w-4 shrink-0" />}
      <span className={ok ? '' : 'line-through decoration-red-400/70'}>
        <InlineText text={text} />
      </span>
    </p>
  )
}

const TICK = /^\s*(✓|✔)\s*/
const CROSS = /^\s*(✗|✘|×)\s*/

/**
 * Course text: paragraphs split on blank lines, single line breaks kept, inline marks rendered;
 * in a paragraph, "| … |" table lines, ✓/✗ lines and a "TIMELINE:" line get their own blocks.
 */
export default function RichText({ text, className = '' }: { text: string; className?: string }) {
  const paragraphs = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
  return (
    <div className={`space-y-3 ${className}`}>
      {paragraphs.map((p, i) => (
        <Paragraph key={i} text={p} />
      ))}
    </div>
  )
}

function Paragraph({ text }: { text: string }) {
  // Runs of plain lines stay one <p>; tables, marked lines and time lines break out of it.
  const out: ReactNode[] = []
  const lines = text.split('\n')
  let run: string[] = []
  let table: string[] = []
  const flushRun = () => {
    if (run.length)
      out.push(
        <p key={`p${out.length}`}>
          {run.map((line, j) => (
            <Fragment key={j}>
              {j > 0 && <br />}
              <InlineText text={line} />
            </Fragment>
          ))}
        </p>,
      )
    run = []
  }
  const flushTable = () => {
    if (table.length) out.push(table.length > 1 ? <Table key={`t${out.length}`} lines={table} /> : <p key={`t${out.length}`}>{table[0]}</p>)
    table = []
  }
  for (const line of lines) {
    const t = line.trim()
    if (t.startsWith('|')) {
      flushRun()
      table.push(t)
      continue
    }
    flushTable()
    if (/^TIMELINE:/i.test(t)) {
      flushRun()
      out.push(<Timeline key={`l${out.length}`} spec={t.replace(/^TIMELINE:\s*/i, '')} />)
    } else if (TICK.test(t) || CROSS.test(t)) {
      flushRun()
      out.push(<MarkedLine key={`m${out.length}`} ok={TICK.test(t)} text={t.replace(TICK, '').replace(CROSS, '')} />)
    } else {
      run.push(line)
    }
  }
  flushRun()
  flushTable()
  return out.length === 1 ? <>{out[0]}</> : <div className="space-y-2">{out}</div>
}
