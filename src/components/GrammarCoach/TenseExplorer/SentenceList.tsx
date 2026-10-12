import { Volume2 } from 'lucide-react'
import type { MessageKey } from '../../../lib/i18n'
import {
  buildSentence,
  type ParsedPhrase,
  type Polarity,
  type Subject,
  type TenseId,
} from '../../../lib/tenseEngine/index.ts'

const POLARITIES: { polarity: Polarity; label: MessageKey }[] = [
  { polarity: 'affirmative', label: 'tenseAffirmative' },
  { polarity: 'question', label: 'tenseQuestion' },
  { polarity: 'negative', label: 'tenseNegative' },
]

/** Positive / question / negative sentences for one tense, each with an optional listen button. */
export default function SentenceList({
  tense,
  phrase,
  subject,
  timeCue,
  label,
  listenLabel,
  speak,
}: {
  tense: TenseId
  phrase: ParsedPhrase
  subject: Subject
  timeCue: boolean
  label: (key: MessageKey) => string
  listenLabel: string
  speak?: (text: string) => void
}) {
  return (
    <ul className="space-y-1.5">
      {POLARITIES.map(({ polarity, label: key }) => {
        const sentence = buildSentence(tense, polarity, phrase, subject, { timeCue })
        return (
          <li key={polarity} className="flex items-start gap-2">
            <span className="w-[4.5rem] shrink-0 pt-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
              {label(key)}
            </span>
            <span className="min-w-0 flex-1 break-words text-sm text-slate-800">{sentence}</span>
            {speak && (
              <button
                type="button"
                onClick={() => speak(sentence)}
                aria-label={`${listenLabel}: ${sentence}`}
                title={listenLabel}
                className="shrink-0 rounded-md p-1 text-slate-400 transition hover:bg-amber-50 hover:text-amber-600"
              >
                <Volume2 size={14} />
              </button>
            )}
          </li>
        )
      })}
    </ul>
  )
}
