import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis'
import { MicIcon, SpeakerIcon } from './icons/AudioIcons'
import WordMatchFeedback from './WordMatchFeedback'
import DeepCheckPanel from './DeepCheckPanel'

export default function PracticeSentence({
  en,
  hu,
  scenarioId,
  speakerLabel,
  showDeepCheck = false,
}: {
  en: string
  hu: string
  scenarioId: string
  speakerLabel?: string
  showDeepCheck?: boolean
}) {
  const synth = useSpeechSynthesis()
  const recognition = useSpeechRecognition()

  const handleMicClick = () => {
    if (!recognition.supported) return
    if (recognition.listening) {
      recognition.stop()
    } else {
      recognition.start()
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          {speakerLabel && <p className="text-xs font-medium text-slate-400">{speakerLabel}</p>}
          <p className="text-sm text-slate-700">{en}</p>
          <p className="text-xs text-slate-400 mt-0.5">{hu}</p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => synth.speak(en)}
            aria-label="Meghallgatás"
            className="h-8 w-8 flex items-center justify-center rounded-full text-indigo-600 hover:bg-indigo-50"
          >
            <SpeakerIcon className="h-4 w-4" />
          </button>
          <button
            onClick={handleMicClick}
            aria-label="Felvétel"
            disabled={!recognition.supported}
            className={`h-8 w-8 flex items-center justify-center rounded-full disabled:opacity-30 ${
              recognition.listening ? 'text-red-600 bg-red-50' : 'text-indigo-600 hover:bg-indigo-50'
            }`}
          >
            <MicIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!recognition.supported && (
        <p className="mt-2 text-xs text-amber-600">
          A hangfelismerés nem támogatott ebben a böngészőben. Kérjük, használj Chrome böngészőt.
        </p>
      )}

      {recognition.supported && recognition.transcript && !recognition.listening && (
        <WordMatchFeedback target={en} heard={recognition.transcript} />
      )}

      {showDeepCheck && <DeepCheckPanel scenarioId={scenarioId} targetSentence={en} />}
    </div>
  )
}
