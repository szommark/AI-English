import { useState, type ClipboardEvent } from 'react'
import BlogContent from './BlogContent'
import { normalizeBlogMarkdown } from '../../lib/blogFormat'
import { htmlToMarkdown, shouldConvertPastedHtml } from '../../lib/blogPaste'

type Mode = 'edit' | 'preview'

// Inserts text at the cursor through the browser's own editing command, so Ctrl+Z still works.
function insertAtCursor(textarea: HTMLTextAreaElement, text: string, onChange: (value: string) => void) {
  textarea.focus()
  if (document.execCommand('insertText', false, text)) return
  const { selectionStart, selectionEnd, value } = textarea
  onChange(value.slice(0, selectionStart) + text + value.slice(selectionEnd))
  requestAnimationFrame(() => textarea.setSelectionRange(selectionStart + text.length, selectionStart + text.length))
}

/**
 * The post body: Markdown with an Edit / Preview switch. Pasting from Word or Google Docs keeps
 * headings, lists, bold, italics and links (converted to Markdown).
 */
export default function BlogContentField({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
}) {
  const [mode, setMode] = useState<Mode>('edit')
  const [pasted, setPasted] = useState(false)

  const onPaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const html = e.clipboardData.getData('text/html')
    const plain = e.clipboardData.getData('text/plain')
    let markdown: string | null = null
    if (shouldConvertPastedHtml(html, plain)) markdown = htmlToMarkdown(html)
    else if (plain.includes('\n')) markdown = normalizeBlogMarkdown(plain)
    if (!markdown || markdown === plain) return

    e.preventDefault()
    insertAtCursor(e.currentTarget, markdown, onChange)
    setPasted(true)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {label}
        </label>
        <div className="inline-flex rounded-md border border-slate-200 p-0.5 text-xs" role="tablist">
          {(['edit', 'preview'] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => setMode(m)}
              className={`rounded px-2.5 py-1 font-medium ${mode === m ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {m === 'edit' ? 'Edit' : 'Preview'}
            </button>
          ))}
        </div>
      </div>
      {mode === 'edit' ? (
        <textarea
          id={id}
          rows={18}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onPaste={onPaste}
        />
      ) : (
        <div className="max-h-[40rem] min-h-[22rem] overflow-y-auto rounded-lg border border-slate-200 bg-white px-5 py-4">
          {value.trim() ? <BlogContent markdown={value} /> : <p className="text-sm text-slate-400">No text yet.</p>}
        </div>
      )}
      <p className="text-xs text-slate-500">
        {pasted
          ? 'Pasted with its formatting. Check it in Preview.'
          : 'Paste from Word or Google Docs: headings, lists, bold and italic are kept. Markdown works too (## heading, **bold**, - list).'}
      </p>
    </div>
  )
}
