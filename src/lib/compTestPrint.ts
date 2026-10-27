import { optionKey, type CompSection, type CompTestInput } from './compTests'

// Printable comprehension test: the student sheet (text or "listen" note, every section with
// blanks to fill in), then, on a new page, the answer key and optionally the audioscript.
// Printed through a new window like the lyrics worksheet (src/lib/lyricsWorksheet.ts). The
// sheet is in English, as the test is.

export interface PrintOptions {
  answerKey: boolean
  /** Listening: print the audioscript after the key. */
  script: boolean
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function paragraphs(text: string): string {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
    .join('')
}

const BLANK = '<span class="blank">______________</span>'

function sectionHtml(s: CompSection, n: number): string {
  const head = `<h2>Task ${n}</h2><p class="instructions">${escapeHtml(s.instructions)}</p>`
  switch (s.type) {
    case 'mcq':
      return `${head}<ol class="items">${s.items
        .map(
          (it) =>
            `<li value="${it.id}"><p>${escapeHtml(it.stem)}</p><ul class="options">${it.options
              .map((o, k) => `<li><span class="box"></span> <b>${optionKey(k)}</b> ${escapeHtml(o)}</li>`)
              .join('')}</ul></li>`,
        )
        .join('')}</ol>`
    case 'true-false':
      return `${head}<table class="tf"><thead><tr><th></th><th></th><th>True</th><th>False</th></tr></thead><tbody>${s.items
        .map((it) => `<tr><td class="num">${it.id}.</td><td>${escapeHtml(it.statement)}</td><td class="tick"></td><td class="tick"></td></tr>`)
        .join('')}</tbody></table>`
    case 'gap-fill':
      return `${head}<div class="summary">${paragraphs(s.summary).replace(/\{\{([^}]+)\}\}/g, (_, id: string) => `<b>(${escapeHtml(id)})</b> ${BLANK}`)}</div>`
    case 'matching':
      return `${head}<div class="bank">${s.options.map((o, k) => `<span><b>${optionKey(k)}</b> ${escapeHtml(o)}</span>`).join('')}</div><ol class="items">${s.items
        .map((it) => `<li value="${it.id}"><span class="answer-box"></span> ${escapeHtml(it.text)}</li>`)
        .join('')}</ol>`
    case 'short-answer':
      return `${head}<ol class="items">${s.items.map((it) => `<li value="${it.id}"><p>${escapeHtml(it.question)}</p><p class="line"></p></li>`).join('')}</ol>`
  }
}

function keyFor(s: CompSection): string[] {
  switch (s.type) {
    case 'mcq':
    case 'matching':
      return s.items.map((it) => `${it.id}. ${it.answer}`)
    case 'true-false':
      return s.items.map((it) => `${it.id}. ${it.answer ? 'True' : 'False'}`)
    case 'gap-fill':
    case 'short-answer':
      return s.items.map((it) => `${it.id}. ${it.accepted.filter((a) => a.trim()).join(' / ')}`)
  }
}

export function buildCompTestHtml(test: Pick<CompTestInput, 'title' | 'skill' | 'level' | 'content'>, options: PrintOptions): string {
  const { content } = test
  const listening = test.skill === 'listening'
  const intro = listening
    ? `<p class="listen">Listen to the recording and do the tasks below.</p>`
    : `<div class="text">${paragraphs(content.text)}</div>`
  const key = options.answerKey
    ? `<section class="key"><h1>Answer key</h1><p class="sub">${escapeHtml(test.title)} · ${test.level}</p>${content.sections
        .map((s, i) => `<h2>Task ${i + 1}</h2><ul class="keylist">${keyFor(s).map((k) => `<li>${escapeHtml(k)}</li>`).join('')}</ul>`)
        .join('')}${listening && options.script ? `<h2>Audioscript</h2><div class="script">${paragraphs(content.text)}</div>` : ''}</section>`
    : listening && options.script
      ? `<section class="key"><h1>Audioscript</h1><div class="script">${paragraphs(content.text)}</div></section>`
      : ''

  return `<!doctype html>
<html><head><meta charset="utf-8"><title>${escapeHtml(test.title)}</title>
<style>
  body { font-family: system-ui, "Segoe UI", Arial, sans-serif; color: #111; margin: 24px; font-size: 14px; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  h2 { font-size: 15px; margin: 20px 0 4px; }
  p { margin: 0 0 8px; line-height: 1.5; }
  .meta { color: #555; font-size: 12px; }
  .name { display: flex; gap: 32px; margin: 10px 0 14px; font-size: 13px; color: #333; }
  .text { border: 1px solid #bbb; border-radius: 6px; padding: 12px 16px; margin: 8px 0 12px; }
  .listen { font-style: italic; }
  .instructions { font-weight: 600; }
  ol.items { padding-left: 22px; }
  ol.items > li { margin-bottom: 10px; break-inside: avoid; }
  ul.options { list-style: none; padding-left: 4px; margin: 4px 0 0; }
  ul.options li { margin: 2px 0; }
  .box { display: inline-block; width: 11px; height: 11px; border: 1.3px solid #111; vertical-align: -1px; }
  .answer-box { display: inline-block; width: 26px; height: 18px; border: 1.3px solid #111; vertical-align: middle; margin-right: 6px; }
  table.tf { border-collapse: collapse; width: 100%; }
  table.tf td, table.tf th { border-bottom: 1px solid #ccc; padding: 6px 4px; text-align: left; vertical-align: top; }
  table.tf th { font-size: 12px; text-align: center; }
  table.tf .num { width: 26px; font-weight: 600; }
  table.tf .tick { width: 54px; border-left: 1px solid #ccc; }
  .summary p { line-height: 2.2; }
  .blank { letter-spacing: 0.5px; }
  .bank { display: flex; flex-wrap: wrap; gap: 6px 22px; border: 1.5px solid #111; border-radius: 6px; padding: 10px 14px; margin: 8px 0 12px; }
  .line { border-bottom: 1px solid #555; height: 22px; margin: 2px 0 0; }
  .key { page-break-before: always; }
  .keylist { columns: 3; list-style: none; padding: 0; }
  .sub { color: #555; font-size: 13px; }
  .script p { font-size: 13px; }
</style></head>
<body>
<h1>${escapeHtml(test.title)}</h1>
<p class="meta">${listening ? 'Listening' : 'Reading'} comprehension · ${test.level}</p>
<div class="name"><span>Name: ______________________</span><span>Date: ____________</span><span>Score: ______ / ${content.sections.reduce((n, s) => n + s.items.length, 0)}</span></div>
${intro}
${content.sections.map((s, i) => sectionHtml(s, i + 1)).join('')}
${key}
</body></html>`
}

/** Opens the print dialog. Returns false if the browser blocked the window. */
export function printCompTest(test: Pick<CompTestInput, 'title' | 'skill' | 'level' | 'content'>, options: PrintOptions): boolean {
  const win = window.open('', '_blank')
  if (!win) return false
  win.document.open()
  win.document.write(buildCompTestHtml(test, options))
  win.document.close()
  win.focus()
  win.setTimeout(() => win.print(), 250)
  return true
}
