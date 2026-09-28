import type { CefrHistoryPoint } from '../../lib/progressTypes'

/** "A2 (3/9/2026) → B1 (5/10/2026)": the CEFR estimates in order, oldest first. */
export default function CefrHistoryLine({ history, locale }: { history: CefrHistoryPoint[]; locale?: string }) {
  return (
    <>
      {history.map((c, i) => (
        <span key={i}>
          {i > 0 && ' → '}
          {c.cefrLevel}
          <span className="text-slate-400"> ({new Date(c.createdAt).toLocaleDateString(locale)})</span>
        </span>
      ))}
    </>
  )
}
