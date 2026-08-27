export interface SessionResultEntry {
  itemId: string
  title: string
  titleHu: string
  perceptionScore?: number
  productionScore: number
}

export default function SessionSummary({ results, onDone }: { results: SessionResultEntry[]; onDone: () => void }) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-gradient-to-b from-rose-50 to-white shadow-sm p-6 space-y-5">
      <div>
        <h2 className="font-semibold text-rose-900">Mai gyakorlás kész!</h2>
        <p className="text-sm text-rose-500">Session summary</p>
      </div>

      <ul className="space-y-2">
        {results.map((r) => (
          <li key={r.itemId} className="flex items-center justify-between rounded-lg bg-white border border-rose-100 px-4 py-2.5">
            <div>
              <p className="text-sm font-medium text-slate-700">{r.title}</p>
              <p className="text-xs text-slate-400">{r.titleHu}</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-slate-500">
                Percepció <span className="font-semibold text-slate-700">{r.perceptionScore ?? '—'}</span>
              </span>
              <span className="text-slate-500">
                Kiejtés <span className="font-semibold text-slate-700">{r.productionScore}</span>
              </span>
            </div>
          </li>
        ))}
      </ul>

      <button onClick={onDone} className="rounded-lg bg-rose-600 text-white text-sm font-medium px-4 py-2 hover:bg-rose-700">
        Vissza a listához
      </button>
    </div>
  )
}
