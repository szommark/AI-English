import type { DataTable } from '../../data/exams/types'

/** A data table printed with a task, scrollable sideways on narrow screens. */
export default function DataTableView({ table }: { table: DataTable }) {
  const numeric = new Set(table.numericColumns ?? [])
  return (
    <figure className="space-y-2">
      {table.title && <figcaption className="text-base font-semibold text-foreground">{table.title}</figcaption>}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[32rem] border-collapse text-sm">
          {table.caption && <caption className="bg-muted px-3 py-2 text-left font-semibold text-foreground">{table.caption}</caption>}
          <thead>
            <tr className="bg-muted">
              {table.head.map((h, i) => (
                <th key={i} scope="col" className={`border-t border-border px-3 py-2 font-semibold text-foreground ${numeric.has(i) ? 'text-right' : 'text-left'}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, r) => (
              <tr key={r} className="border-t border-border">
                {row.map((cell, i) =>
                  i === 0 ? (
                    <th key={i} scope="row" className="px-3 py-1.5 text-left font-normal text-foreground">
                      {cell}
                    </th>
                  ) : (
                    <td key={i} className={`px-3 py-1.5 tabular-nums text-foreground ${numeric.has(i) ? 'text-right' : ''}`}>
                      {cell}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  )
}
