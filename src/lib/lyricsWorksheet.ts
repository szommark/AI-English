// Lyrics gap-fill → printable worksheet (and answer key). Like vocabPdf.ts: a print-ready
// page in a new window, where the browser's "Save as PDF" makes the file — no PDF library.
// The worksheet itself is in English whatever the UI language: it is handed to the class.

import {
  buildGapGroups,
  buildWordBank,
  choiceOptions,
  defaultInstructions,
  gapHint,
  groupsByWord,
  lineSegments,
  tokenizeLyrics,
  type GapGroup,
  type LyricsActivityInput,
} from './lyricsGapFill'

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const paragraphs = (s: string) =>
  s
    .split(/\n{2,}/)
    .map((p) => `<p>${escapeHtml(p.trim()).replace(/\n/g, '<br>')}</p>`)
    .join('')

export function buildLyricsWorksheetHtml(activity: LyricsActivityInput): string {
  const { content } = activity
  const { sheet } = content
  const doc = tokenizeLyrics(content.lyrics)
  const groups = buildGapGroups(doc, content.gaps, sheet.phraseGaps)
  const byWord = groupsByWord(groups)
  const seed = content.auto.seed

  const label = (g: GapGroup) => (sheet.numberGaps ? `<sup>${g.number}</sup>` : '')
  const gapHtml = (g: GapGroup) => {
    if (sheet.answerMode === 'choice') {
      const options = choiceOptions(g, groups, content.distractors, sheet.choiceCount, seed)
      return `<span class="gap">${label(g)}<span class="choice">${options.map(escapeHtml).join(' / ')}</span></span>`
    }
    return `<span class="gap">${label(g)}<span class="blank">${escapeHtml(gapHint(g.answer, sheet.hintStyle))}</span></span>`
  }

  const lyricsHtml = doc.lines
    .map((line) => {
      if (line.kind === 'blank') return '<div class="stanza-break"></div>'
      if (line.kind === 'header') return `<div class="section">${escapeHtml(line.tokens[0].text)}</div>`
      const html = lineSegments(line, byWord)
        .map((s) => (s.kind === 'gap' ? gapHtml(s.group) : escapeHtml(s.text)))
        .join('')
      return `<div class="line">${html}</div>`
    })
    .join('')

  const title = activity.artist ? `${activity.title} — ${activity.artist}` : activity.title
  const instructions = sheet.instructions.trim() || defaultInstructions(sheet.answerMode)
  const bank =
    sheet.answerMode === 'wordBank' && groups.length
      ? `<div class="bank">${buildWordBank(groups, sheet, seed).map((w) => `<span>${escapeHtml(w)}</span>`).join('')}</div>`
      : ''
  const link = sheet.showLink && activity.videoUrl ? `<p class="link">Listen: ${escapeHtml(activity.videoUrl)}</p>` : ''
  const before = sheet.beforeListening.trim() ? `<h2>Before you listen</h2>${paragraphs(sheet.beforeListening)}` : ''
  const after = sheet.afterListening.trim() ? `<h2>After you listen</h2>${paragraphs(sheet.afterListening)}` : ''
  const key =
    sheet.answerKey && groups.length
      ? `<section class="key"><h1>Answer key</h1><p class="sub">${escapeHtml(title)}</p><ol>${groups
          .map((g) => `<li>${escapeHtml(g.answer)}</li>`)
          .join('')}</ol></section>`
      : ''
  const size = sheet.fontSize === 'large' ? 17 : 14

  return `<!doctype html>
<html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title>
<style>
  body { font-family: system-ui, "Segoe UI", Arial, sans-serif; color: #111; margin: 24px; font-size: ${size}px; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  h2 { font-size: 15px; margin: 18px 0 6px; }
  p { margin: 0 0 8px; line-height: 1.5; }
  .name { display: flex; gap: 32px; margin: 10px 0 14px; font-size: 13px; color: #333; }
  .link { font-size: 12px; color: #555; word-break: break-all; }
  .instructions { font-weight: 600; margin-top: 14px; }
  .bank { display: flex; flex-wrap: wrap; gap: 6px 18px; border: 1.5px solid #111; border-radius: 6px; padding: 10px 14px; margin: 8px 0 16px; }
  .lyrics { margin-top: 10px; }
  .line { line-height: 2.1; }
  .section { font-style: italic; font-weight: 600; color: #444; margin-top: 6px; }
  .stanza-break { height: 12px; }
  .gap { white-space: nowrap; }
  .gap sup { font-size: 10px; font-weight: 700; margin-right: 2px; }
  .blank { letter-spacing: 0.5px; }
  .choice { border: 1px solid #555; border-radius: 4px; padding: 1px 6px; font-size: 0.92em; }
  .source { margin-top: 20px; font-size: 11px; color: #666; }
  .key { page-break-before: always; }
  .key ol { columns: 3; font-size: 14px; }
  .sub { color: #555; font-size: 13px; }
</style></head>
<body>
<h1>${escapeHtml(title)}</h1>
<div class="name"><span>Name: ______________________</span><span>Date: ____________</span></div>
${link}${before}
<p class="instructions">${escapeHtml(instructions)}</p>
${bank}
<div class="lyrics">${lyricsHtml}</div>
${after}
<p class="source">Song: ${escapeHtml(title)}. Lyrics used for classroom teaching only.</p>
${key}
</body></html>`
}

/** Opens the print dialog. Returns false if the browser blocked the window. */
export function printLyricsWorksheet(activity: LyricsActivityInput): boolean {
  const win = window.open('', '_blank')
  if (!win) return false
  win.document.open()
  win.document.write(buildLyricsWorksheetHtml(activity))
  win.document.close()
  win.focus()
  win.setTimeout(() => win.print(), 250)
  return true
}
