import QRCode from 'qrcode'

/**
 * Print downloads for the admin QR codes. The PDF is a single A4 page holding one JPEG
 * (the QR code with its label and link drawn underneath), written by hand so no PDF
 * library is needed. Drawing the text into the image also sidesteps PDF font encoding,
 * which can't show Hungarian ő/ű in the standard fonts.
 */

const QR_PX = 1200

export async function qrJpegDataUrl(link: string): Promise<string> {
  return QRCode.toDataURL(link, { type: 'image/jpeg', width: QR_PX, margin: 2, errorCorrectionLevel: 'M', rendererOpts: { quality: 0.95 } })
}

function fitFont(ctx: CanvasRenderingContext2D, text: string, weight: string, family: string, start: number, maxWidth: number) {
  let size = start
  do {
    ctx.font = `${weight} ${size}px ${family}`
    if (ctx.measureText(text).width <= maxWidth) break
    size -= 2
  } while (size > 24)
}

async function printCard(link: string, label: string): Promise<HTMLCanvasElement> {
  const qr = document.createElement('canvas')
  await QRCode.toCanvas(qr, link, { width: QR_PX, margin: 2, errorCorrectionLevel: 'M' })

  const textArea = 260
  const card = document.createElement('canvas')
  card.width = QR_PX
  card.height = QR_PX + textArea
  const ctx = card.getContext('2d')!
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, card.width, card.height)
  ctx.drawImage(qr, 0, 0)

  const maxWidth = QR_PX - 120
  ctx.fillStyle = '#0f172a'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  fitFont(ctx, label, '600', 'system-ui, Arial, sans-serif', 64, maxWidth)
  ctx.fillText(label, QR_PX / 2, QR_PX + 70)
  ctx.fillStyle = '#475569'
  const shown = link.replace(/^https:\/\//, '')
  fitFont(ctx, shown, '400', 'ui-monospace, Consolas, monospace', 48, maxWidth)
  ctx.fillText(shown, QR_PX / 2, QR_PX + 170)
  return card
}

function canvasJpegBytes(canvas: HTMLCanvasElement): Promise<Uint8Array<ArrayBuffer>> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? blob.arrayBuffer().then((b) => resolve(new Uint8Array(b)), reject) : reject(new Error('JPEG encoding failed'))),
      'image/jpeg',
      0.95,
    )
  })
}

/** Minimal PDF 1.4: one A4 page, one DCT-encoded image centred near the top. */
function jpegPdf(jpeg: Uint8Array<ArrayBuffer>, pxWidth: number, pxHeight: number): Blob {
  const pageW = 595.28
  const pageH = 841.89
  const drawW = 400
  const drawH = (drawW * pxHeight) / pxWidth
  const x = (pageW - drawW) / 2
  const y = pageH - 110 - drawH
  const content = `q ${drawW.toFixed(2)} 0 0 ${drawH.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)} cm /Im0 Do Q`

  const enc = new TextEncoder()
  const parts: Uint8Array<ArrayBuffer>[] = []
  const offsets: number[] = []
  let length = 0
  const push = (chunk: string | Uint8Array<ArrayBuffer>) => {
    const bytes = typeof chunk === 'string' ? enc.encode(chunk) : chunk
    parts.push(bytes)
    length += bytes.length
  }
  const object = (n: number, body: string) => {
    offsets[n] = length
    push(`${n} 0 obj\n${body}\nendobj\n`)
  }

  push('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n')
  object(1, '<< /Type /Catalog /Pages 2 0 R >>')
  object(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>')
  object(3, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`)
  offsets[4] = length
  push(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${pxWidth} /Height ${pxHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`)
  push(jpeg)
  push('\nendstream\nendobj\n')
  object(5, `<< /Length ${content.length} >>\nstream\n${content}\nendstream`)

  const xref = length
  push(`xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}`)
  push(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`)
  return new Blob(parts, { type: 'application/pdf' })
}

export async function qrPdfBlob(link: string, label: string): Promise<Blob> {
  const card = await printCard(link, label)
  return jpegPdf(await canvasJpegBytes(card), card.width, card.height)
}
