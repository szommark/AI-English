import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { getMistakeArea, getMistakeSubtype } from '../../data/mistakeTaxonomy'
import { MY_PROGRESS_COPY as C } from '../../data/myProgressCopy'
import type { AreaOverview, MistakeExample, SubtypeOverview } from '../../lib/progressTypes'

interface Frequency {
  count: number
  previous: number | null
  windowSize: number
  hasHistory: boolean
  hasSessionData: boolean
  totalCount: number
}

/** Areas with any data, most frequent in the recent window first, then by Hungarian label ("Other" last on a tie). */
export function visibleAreas(areas: AreaOverview[]): AreaOverview[] {
  return areas
    .filter((a) => a.totalCount > 0)
    .sort(
      (a, b) =>
        b.sessionsWithArea - a.sessionsWithArea ||
        Number(a.area === 'other') - Number(b.area === 'other') ||
        (getMistakeArea(a.area)?.labelHu ?? a.area).localeCompare(getMistakeArea(b.area)?.labelHu ?? b.area, 'hu'),
    )
}

function Trend({ count, previous }: { count: number; previous: number | null }) {
  if (previous === null) return null
  // Wording carries the meaning; the colour only reinforces it.
  if (count < previous) return <span className="text-emerald-700">↓ {C.trendFewer}</span>
  if (count > previous) return <span className="text-amber-700">↑ {C.trendMore}</span>
  return <span className="text-muted-foreground">= {C.trendSame}</span>
}

function FrequencyText({ f, showTotals }: { f: Frequency; showTotals: boolean }) {
  const legacyOnly = f.windowSize === 0 || (!f.hasSessionData && f.hasHistory)
  return (
    <span className="flex flex-col items-end gap-0.5 text-right text-sm">
      {legacyOnly ? (
        <span className="text-muted-foreground">{C.legacyOnly}</span>
      ) : (
        <>
          <span className="font-medium text-foreground whitespace-nowrap">{C.frequency(f.count, f.windowSize)}</span>
          <span className="text-xs">
            <Trend count={f.count} previous={f.previous} />
          </span>
        </>
      )}
      {showTotals && <span className="text-xs text-muted-foreground whitespace-nowrap">{C.allTime(f.totalCount)}</span>}
    </span>
  )
}

function Example({ example }: { example: MistakeExample }) {
  return (
    <div className="mt-2 rounded-lg bg-secondary px-3 py-2 text-sm space-y-1">
      <p className="text-xs text-muted-foreground">{C.exampleLabel}</p>
      <p className="text-foreground">
        <span aria-hidden="true" className="text-red-600">✗ </span>
        {example.original}
      </p>
      {example.corrected && (
        <p className="text-foreground">
          <span aria-hidden="true" className="text-emerald-600">✓ </span>
          {example.corrected}
        </p>
      )}
      {example.note && <p className="text-muted-foreground">{example.note}</p>}
    </div>
  )
}

function Label({ hu, en, strong }: { hu: string; en: string; strong?: boolean }) {
  return (
    <span className="min-w-0">
      <span className={`block text-base text-foreground ${strong ? 'font-medium' : ''}`}>{hu}</span>
      <span className="block text-sm text-muted-foreground">{en}</span>
    </span>
  )
}

function SubtypeRow({ s, windowSize, showTotals }: { s: SubtypeOverview; windowSize: number; showTotals: boolean }) {
  const subtype = getMistakeSubtype(s.subtype)
  return (
    <li className="py-3">
      <div className="flex items-start justify-between gap-3">
        <Label hu={subtype?.labelHu ?? s.subtype} en={subtype?.labelEn ?? ''} />
        <FrequencyText
          f={{
            count: s.sessionsWithSubtype,
            previous: s.previousSessionsWithSubtype,
            windowSize,
            hasHistory: s.hasHistory,
            hasSessionData: s.hasSessionData,
            totalCount: s.totalCount,
          }}
          showTotals={showTotals}
        />
      </div>
      {s.latestExample && <Example example={s.latestExample} />}
    </li>
  )
}

/**
 * The learner's mistake areas, each expandable into its subtypes with the latest example.
 * Shared by "Az én fejlődésem" and the teacher's student page (`showTotals` adds all-time
 * counts, legacy occurrences included). Renders nothing for an empty list — callers show
 * their own empty state.
 */
export default function MistakeAreaList({ areas, showTotals = false }: { areas: AreaOverview[]; showTotals?: boolean }) {
  const [open, setOpen] = useState<Set<string>>(new Set())
  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <ul className="divide-y divide-border">
      {visibleAreas(areas).map((a) => {
        const area = getMistakeArea(a.area)
        const isOpen = open.has(a.area)
        const panelId = `mistake-area-${a.area}`
        const subtypes = [...a.subtypes].sort((x, y) => y.sessionsWithSubtype - x.sessionsWithSubtype)
        return (
          <li key={a.area}>
            <button
              onClick={() => toggle(a.area)}
              aria-expanded={isOpen}
              aria-controls={panelId}
              className="w-full min-h-14 flex items-center gap-3 py-3 text-left hover:bg-secondary rounded-lg -mx-2 px-2"
            >
              {isOpen ? (
                <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
              ) : (
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
              )}
              <span className="sr-only">{isOpen ? C.hideDetails : C.showDetails}</span>
              <span className="flex flex-1 items-start justify-between gap-3 min-w-0">
                <Label hu={area?.labelHu ?? a.area} en={area?.labelEn ?? ''} strong />
                <FrequencyText
                  f={{
                    count: a.sessionsWithArea,
                    previous: a.previousSessionsWithArea,
                    windowSize: a.windowSize,
                    hasHistory: a.hasHistory,
                    hasSessionData: a.hasSessionData,
                    totalCount: a.totalCount,
                  }}
                  showTotals={showTotals}
                />
              </span>
            </button>
            {isOpen && (
              <ul id={panelId} className="ml-8 mb-2 divide-y divide-border border-l-2 border-border pl-4">
                {subtypes.map((s) => (
                  <SubtypeRow key={s.subtype} s={s} windowSize={a.windowSize} showTotals={showTotals} />
                ))}
              </ul>
            )}
          </li>
        )
      })}
    </ul>
  )
}
