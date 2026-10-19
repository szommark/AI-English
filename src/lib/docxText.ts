// Reads the text of a .docx file in the browser without a library: a minimal zip reader
// (DecompressionStream inflates the entries) and a regex walk over word/document.xml. Bold runs
// come back as **markdown bold** and tables as | pipe | rows |, which is exactly what the
// listening-task-intake skill's files use for answer markers and the T/F table.

const EOCD_SIG = 0x06054b50
const CEN_SIG = 0x02014b50
const LOC_SIG = 0x04034b50

async function inflateRaw(data: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([new Uint8Array(data)]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

/** One entry of a zip file, by name; null when it isn't there. */
export async function readZipEntry(buffer: ArrayBuffer, name: string): Promise<Uint8Array | null> {
  const view = new DataView(buffer)
  const bytes = new Uint8Array(buffer)
  let eocd = -1
  for (let i = buffer.byteLength - 22; i >= Math.max(0, buffer.byteLength - 65_557); i--) {
    if (view.getUint32(i, true) === EOCD_SIG) {
      eocd = i
      break
    }
  }
  if (eocd < 0) throw new Error('Not a zip file')
  const entries = view.getUint16(eocd + 10, true)
  let p = view.getUint32(eocd + 16, true)
  const decoder = new TextDecoder()
  for (let n = 0; n < entries; n++) {
    if (view.getUint32(p, true) !== CEN_SIG) throw new Error('Corrupt zip directory')
    const method = view.getUint16(p + 10, true)
    const compressed = view.getUint32(p + 20, true)
    const nameLen = view.getUint16(p + 28, true)
    const extraLen = view.getUint16(p + 30, true)
    const commentLen = view.getUint16(p + 32, true)
    const local = view.getUint32(p + 42, true)
    const entryName = decoder.decode(bytes.subarray(p + 46, p + 46 + nameLen))
    if (entryName === name) {
      if (view.getUint32(local, true) !== LOC_SIG) throw new Error('Corrupt zip entry')
      const start = local + 30 + view.getUint16(local + 26, true) + view.getUint16(local + 28, true)
      const data = bytes.subarray(start, start + compressed)
      if (method === 0) return data
      if (method === 8) return inflateRaw(data)
      throw new Error(`Unsupported zip compression ${method}`)
    }
    p += 46 + nameLen + extraLen + commentLen
  }
  return null
}

function decodeXml(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_m, d: string) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_m, h: string) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&amp;/g, '&')
}

function runText(run: string): string {
  let out = ''
  for (const m of run.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>|<w:tab\/>|<w:br\/>|<w:t\/>/g)) {
    if (m[0].startsWith('<w:tab')) out += '\t'
    else if (m[0].startsWith('<w:br')) out += '\n'
    else out += decodeXml(m[1] ?? '')
  }
  return out
}

function isBold(run: string): boolean {
  const props = run.match(/<w:rPr>([\s\S]*?)<\/w:rPr>/)?.[1] ?? ''
  return /<w:b\/>|<w:b w:val="(?:1|true|on)"\/>/.test(props)
}

/** A paragraph's text, bold runs wrapped in ** (adjacent bold runs merged). */
export function paragraphMarkdown(paragraphXml: string): string {
  let out = ''
  let open = false
  for (const m of paragraphXml.matchAll(/<w:r(?:\s[^>]*)?>([\s\S]*?)<\/w:r>/g)) {
    const text = runText(m[1])
    if (!text) continue
    const bold = isBold(m[1]) && text.trim() !== ''
    if (bold && !open) {
      // Keep leading spaces outside the bold markers.
      const lead = text.match(/^\s*/)?.[0] ?? ''
      out += `${lead}**${text.slice(lead.length)}`
      open = true
    } else if (!bold && open) {
      out = out.replace(/(\s*)$/, '**$1') + text
      open = false
    } else out += text
  }
  if (open) out = out.replace(/(\s*)$/, '**$1')
  return out.replace(/\*\*(\s*)\*\*/g, '$1')
}

/** document.xml → lines of text: paragraphs as they are, tables as | cell | cell | rows. */
export function documentXmlToText(xml: string): string {
  const body = xml.match(/<w:body>([\s\S]*)<\/w:body>/)?.[1] ?? xml
  const lines: string[] = []
  for (const m of body.matchAll(/<w:tbl>[\s\S]*?<\/w:tbl>|<w:p(?:\s[^>]*)?>[\s\S]*?<\/w:p>/g)) {
    const block = m[0]
    if (block.startsWith('<w:tbl>')) {
      lines.push('')
      for (const row of block.matchAll(/<w:tr(?:\s[^>]*)?>([\s\S]*?)<\/w:tr>/g)) {
        const cells = [...row[1].matchAll(/<w:tc(?:\s[^>]*)?>([\s\S]*?)<\/w:tc>/g)].map((c) =>
          [...c[1].matchAll(/<w:p(?:\s[^>]*)?>[\s\S]*?<\/w:p>/g)]
            .map((p) => paragraphMarkdown(p[0]).trim())
            .filter(Boolean)
            .join(' ')
            .replace(/\|/g, '/'),
        )
        lines.push(`| ${cells.join(' | ')} |`)
      }
      lines.push('')
    } else {
      lines.push(paragraphMarkdown(block))
    }
  }
  return lines.join('\n').replace(/\n{3,}/g, '\n\n')
}

export async function docxToText(file: Blob): Promise<string> {
  const doc = await readZipEntry(await file.arrayBuffer(), 'word/document.xml')
  if (!doc) throw new Error('This file has no Word document inside.')
  return documentXmlToText(new TextDecoder().decode(doc))
}
