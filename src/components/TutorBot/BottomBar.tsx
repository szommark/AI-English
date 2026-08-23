import { useState, type FormEvent } from 'react'
import { Mic, MicOff, Send, X } from 'lucide-react'

export default function BottomBar({
  muted,
  micDisabled,
  endDisabled,
  textDisabled,
  onToggleMute,
  onEnd,
  onSubmitText,
  onTypingFocusChange,
}: {
  muted: boolean
  micDisabled: boolean
  endDisabled: boolean
  textDisabled: boolean
  onToggleMute: () => void
  onEnd: () => void
  onSubmitText: (text: string) => void
  onTypingFocusChange: (focused: boolean) => void
}) {
  const [text, setText] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    setText('')
    onSubmitText(trimmed)
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2">
      <button
        type="button"
        aria-label={muted ? 'Resume microphone' : 'Mute microphone'}
        onClick={onToggleMute}
        disabled={micDisabled}
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full disabled:opacity-40 ${
          muted ? 'bg-slate-200 text-slate-500' : 'bg-indigo-50 text-indigo-600'
        }`}
      >
        {muted ? <MicOff size={18} /> : <Mic size={18} />}
      </button>

      <button
        type="button"
        aria-label="End session"
        onClick={onEnd}
        disabled={endDisabled}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-40"
      >
        <X size={16} />
      </button>

      <form onSubmit={handleSubmit} className="flex flex-1 items-center gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => onTypingFocusChange(true)}
          onBlur={() => onTypingFocusChange(false)}
          disabled={textDisabled}
          placeholder="Or type instead of speaking…"
          className="flex-1 rounded-full border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none disabled:opacity-40"
        />
        <button
          type="submit"
          aria-label="Send"
          disabled={textDisabled || !text.trim()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white disabled:opacity-40"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  )
}
