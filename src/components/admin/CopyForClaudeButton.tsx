import { useState } from 'react'
import { Check, ClipboardCopy } from 'lucide-react'

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Clipboard API blocked (permissions, older browser): fall back to a hidden textarea.
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand('copy')
    area.remove()
    return ok
  }
}

/** Copies a ready-made Claude Code task (src/lib/claudeTask.ts) for a report or an error. */
export default function CopyForClaudeButton({ task }: { task: () => string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle')

  async function copy() {
    const ok = await copyText(task())
    setState(ok ? 'copied' : 'failed')
    setTimeout(() => setState('idle'), 2500)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={copy}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        {state === 'copied' ? (
          <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />
        ) : (
          <ClipboardCopy className="h-4 w-4" aria-hidden="true" />
        )}
        Copy for Claude
      </button>
      <span role="status" className="text-xs text-slate-500">
        {state === 'copied' && 'Copied — paste it into Claude Code.'}
        {state === 'failed' && "Couldn't copy; your browser blocked the clipboard."}
      </span>
    </div>
  )
}
