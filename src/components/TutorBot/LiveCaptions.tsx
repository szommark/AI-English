import { useEffect, useRef, useState } from 'react'
import type { ChatMessage } from '../../lib/types'

export default function LiveCaptions({ turns, interimText }: { turns: ChatMessage[]; interimText: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)

  useEffect(() => {
    if (!autoScroll) return
    const el = containerRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [turns, interimText, autoScroll])

  function handleScroll() {
    const el = containerRef.current
    if (!el) return
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 24
    setAutoScroll(atBottom)
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-slate-200 bg-white p-3 text-sm"
    >
      {turns.length === 0 && !interimText && (
        <p className="text-slate-400">Tap "Start talking" and say hello.</p>
      )}
      {turns.map((m, i) => (
        <p key={i} className="text-slate-700">
          <span className={`font-medium ${m.role === 'user' ? 'text-indigo-600' : 'text-violet-600'}`}>
            {m.role === 'user' ? 'You: ' : 'Tutor: '}
          </span>
          {m.content}
        </p>
      ))}
      {interimText && (
        <p className="italic text-slate-400">
          <span className="font-medium text-indigo-600">You: </span>
          {interimText}
        </p>
      )}
    </div>
  )
}
