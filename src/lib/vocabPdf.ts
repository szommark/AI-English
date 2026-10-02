// Word list → PDF. There is no PDF library in the bundle: this opens a print-ready page
// in a new window and calls print(), where the browser's "Save as PDF" produces the file.
// That keeps Hungarian accents correct (system fonts) and adds no dependency.

export interface PdfWord {
  term: string
  meaningHu?: string | null
  definitionEn?: string | null
  exampleEn?: string | null
  cefrLevel?: string | null
}

export interface PdfLabels {
  term: string
  meaning: string
  definition: string
  example: string
  level: string
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** The printable document for a list. Columns nobody filled in are left out. */
export function buildWordlistHtml(title: string, words: PdfWord[], labels: PdfLabels, description?: string | null): string {
  const columns = [
    { key: 'term', label: labels.term, show: true },
    { key: 'meaningHu', label: labels.meaning, show: words.some((w) => w.meaningHu) },
    { key: 'definitionEn', label: labels.definition, show: words.some((w) => w.definitionEn) },
    { key: 'exampleEn', label: labels.example, show: words.some((w) => w.exampleEn) },
    { key: 'cefrLevel', label: labels.level, show: words.some((w) => w.cefrLevel) },
  ] as const
  const shown = columns.filter((c) => c.show)

  const head = shown.map((c) => `<th>${escapeHtml(c.label)}</th>`).join('')
  const body = words
    .map(
      (w) =>
        `<tr>${shown
          .map((c) => `<td${c.key === 'term' ? ' class="term"' : ''}>${escapeHtml(w[c.key] ?? '')}</td>`)
          .join('')}</tr>`,
    )
    .join('')

  return `<!doctype html>
<html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title>
<style>
  body { font-family: system-ui, "Segoe UI", Arial, sans-serif; color: #111; margin: 24px; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  p.desc { margin: 0 0 16px; color: #555; font-size: 13px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th, td { text-align: left; vertical-align: top; padding: 6px 8px; border-bottom: 1px solid #ddd; }
  th { border-bottom: 2px solid #111; font-size: 12px; }
  td.term { font-weight: 600; }
  tr { page-break-inside: avoid; }
  thead { display: table-header-group; }
</style></head>
<body><h1>${escapeHtml(title)}</h1>${description ? `<p class="desc">${escapeHtml(description)}</p>` : ''}
<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>
</body></html>`
}

/** Opens the print dialog for the list. Returns false if the browser blocked the window. */
export function printWordlistPdf(title: string, words: PdfWord[], labels: PdfLabels, description?: string | null): boolean {
  const win = window.open('', '_blank')
  if (!win) return false
  win.document.open()
  win.document.write(buildWordlistHtml(title, words, labels, description))
  win.document.close()
  win.focus()
  // Let the new document lay out before the dialog opens.
  win.setTimeout(() => win.print(), 250)
  return true
}
