import QRCode from 'qrcode'
import type { CardRole, RoleCardSet, RoleCardSide } from '../data/roleCards'
import { QR_SITE_URL } from './qrTracking'

/**
 * Prints one situation's role cards on a single A4 page: the Role A card on top, the Role B
 * card below a dashed cut line. Each card carries a QR code that opens the scenario's
 * conversation on avln.hu. The page is written into a hidden iframe and printed from there,
 * so the app's own layout never needs print styles.
 */

export function scenarioConversationLink(scenarioId: string): string {
  return `${QR_SITE_URL}/scenario/${scenarioId}/rehearsal`
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const THEME: Record<CardRole, { ink: string; tint: string }> = {
  A: { ink: '#1f3a6e', tint: '#e8eef9' },
  B: { ink: '#b4232c', tint: '#fbeaea' },
}

function cardHtml(set: RoleCardSet, role: CardRole, qrSvg: string): string {
  const side: RoleCardSide = role === 'A' ? set.a : set.b
  const { ink, tint } = THEME[role]
  const lines = set.lines
    .map(
      (l) => `
        <li class="line${l.role === role ? ' own' : ''}">
          <span class="badge" style="background:${THEME[l.role].ink}">${l.role}</span>
          <span>${esc(l.text)}</span>
        </li>`,
    )
    .join('')
  const phrases = side.phrases.map((p) => `<p class="phrase">“${esc(p)}”</p>`).join('')

  return `
    <section class="card" style="--ink:${ink};--tint:${tint}">
      <div class="role">
        <p class="kicker">${esc(set.set)} · ${set.number} of ${set.total}</p>
        <p class="rolename">ROLE ${role} <span class="name">${esc(side.name)}</span></p>
        <p class="persona">${esc(side.persona)}</p>
        <p class="text">${esc(side.situation)}</p>
        <p class="label">Your goal</p>
        <p class="text">${esc(side.goal)}</p>
        <p class="label">Useful phrases</p>
        ${phrases}
        <div class="qr">
          ${qrSvg}
          <p>Scan to practise<br />this conversation</p>
        </div>
      </div>
      <div class="dialogue">
        <h2><span class="num">${set.number}</span>${esc(set.title)}</h2>
        <p class="style">${esc(set.styleNote)}</p>
        <ol>${lines}</ol>
      </div>
    </section>`
}

const CSS = `
  @page { size: A4 portrait; margin: 12mm; }
  * { box-sizing: border-box; }
  html, body { margin: 0; background: #fff; }
  body { font-family: Inter, 'Segoe UI', Arial, sans-serif; color: #1f2937; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .card { display: grid; grid-template-columns: 31% 69%; border: 0.5mm solid var(--ink); border-radius: 4mm; overflow: hidden; height: 124mm; break-inside: avoid; }
  .role { background: var(--tint); border-right: 0.5mm solid var(--ink); padding: 5mm 4.5mm; display: flex; flex-direction: column; }
  .kicker { margin: 0 0 1.5mm; font-size: 8pt; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink); }
  .rolename { margin: 0; font-family: 'Barlow Condensed', 'Arial Narrow', sans-serif; font-weight: 700; font-size: 30pt; line-height: 1; color: var(--ink); }
  .rolename .name { font-family: Inter, 'Segoe UI', Arial, sans-serif; font-size: 11pt; font-weight: 500; color: #1f2937; }
  .persona { margin: 2mm 0 1.5mm; font-family: 'Barlow Condensed', 'Arial Narrow', sans-serif; font-weight: 700; font-size: 15pt; color: #111827; }
  .text { margin: 0; font-size: 9.5pt; line-height: 1.4; }
  .label { margin: 2.5mm 0 0.5mm; font-size: 8pt; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink); }
  .phrase { margin: 0; font-size: 9.5pt; font-style: italic; line-height: 1.45; }
  .qr { margin-top: auto; display: flex; align-items: center; gap: 2.5mm; padding-top: 3mm; }
  .qr svg { width: 22mm; height: 22mm; background: #fff; padding: 1mm; border-radius: 1mm; flex: none; }
  .qr p { margin: 0; font-size: 7.5pt; line-height: 1.3; color: #4b5563; }
  .dialogue { padding: 5mm 6mm; }
  h2 { margin: 0; display: flex; align-items: center; gap: 2.5mm; font-size: 15pt; font-weight: 700; color: #111827; }
  .num { display: inline-flex; align-items: center; justify-content: center; width: 6.5mm; height: 6.5mm; border: 0.4mm solid var(--ink); border-radius: 50%; font-size: 9pt; color: var(--ink); flex: none; }
  .style { margin: 0.5mm 0 3.5mm 9mm; font-size: 8.5pt; color: #6b7280; }
  ol { list-style: none; margin: 0; padding: 0; }
  .line { display: flex; gap: 2.5mm; align-items: flex-start; margin-bottom: 2.6mm; font-size: 10pt; line-height: 1.45; color: #4b5563; }
  .line.own { color: #111827; font-weight: 700; }
  .badge { flex: none; display: inline-flex; align-items: center; justify-content: center; width: 5mm; height: 5mm; margin-top: 0.3mm; border-radius: 50%; color: #fff; font-size: 7pt; font-weight: 700; }
  .cut { border: 0; border-top: 0.3mm dashed #9ca3af; margin: 6mm -6mm; }
  .footer { margin: 3mm 0 0; font-size: 8pt; color: #6b7280; }
`

function pageHtml(set: RoleCardSet, qrSvg: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${esc(`${set.set} ${set.number} – ${set.title}`)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700&family=Inter:ital,wght@0,400;0,500;0,700;1,400&display=swap" rel="stylesheet" />
<style>${CSS}</style>
</head>
<body>
${cardHtml(set, 'A', qrSvg)}
<hr class="cut" />
${cardHtml(set, 'B', qrSvg)}
<p class="footer">${esc(set.set)} · situation ${set.number} of ${set.total} · cut along the dashed line · Role A and Role B</p>
</body>
</html>`
}

/** Builds the printable page; exported for previews and checks. */
export async function roleCardPageHtml(scenarioId: string, set: RoleCardSet): Promise<string> {
  const qrSvg = await QRCode.toString(scenarioConversationLink(scenarioId), {
    type: 'svg',
    margin: 0,
    errorCorrectionLevel: 'M',
    color: { dark: '#111827', light: '#ffffff' },
  })
  return pageHtml(set, qrSvg)
}

export async function printRoleCards(scenarioId: string, set: RoleCardSet): Promise<void> {
  const html = await roleCardPageHtml(scenarioId, set)

  const frame = document.createElement('iframe')
  frame.setAttribute('aria-hidden', 'true')
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden'
  document.body.appendChild(frame)

  const win = frame.contentWindow
  const doc = frame.contentDocument
  if (!win || !doc) {
    frame.remove()
    throw new Error('Printing is not available in this browser.')
  }
  doc.open()
  doc.write(html)
  doc.close()

  // Wait for the card fonts (capped, so a blocked font server never stops the print).
  await new Promise<void>((resolve) => {
    if (doc.readyState === 'complete') resolve()
    else win.addEventListener('load', () => resolve(), { once: true })
    setTimeout(resolve, 3000)
  })
  await Promise.race([doc.fonts?.ready, new Promise((r) => setTimeout(r, 2500))])

  // "Save as PDF" names the file after the top-level page title.
  const previousTitle = document.title
  document.title = doc.title
  const cleanUp = () => {
    document.title = previousTitle
    frame.remove()
  }
  win.addEventListener('afterprint', () => setTimeout(cleanUp, 0), { once: true })
  setTimeout(() => frame.isConnected && cleanUp(), 120_000)
  win.focus()
  win.print()
}
