import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis'
import { getScenario } from '../data/scenarios'
import type { VoiceGender } from '../lib/types'
import { MicIcon, SpeakerIcon } from './icons/AudioIcons'
import WordMatchFeedback from './WordMatchFeedback'
import DeepCheckPanel from './DeepCheckPanel'
import { useLanguage } from '../lib/i18n'

export default function PracticeSentence({
  en,
  gloss,
  scenarioId,
  voiceGender,
  speakerLabel,
  showDeepCheck = false,
}: {
  en: string
  /** Translation into the UI language; omitted (e.g. for English) when there is none to show. */
  gloss?: string
  scenarioId?: string
  voiceGender?: VoiceGender
  speakerLabel?: string
  showDeepCheck?: boolean
}) {
  const { t } = useLanguage()
  const synth = useSpeechSynthesis(voiceGender ?? (scenarioId ? getScenario(scenarioId)?.voiceGender : undefined))
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
          {gloss && <p className="text-xs text-slate-400 mt-0.5">{gloss}</p>}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => synth.speak(en)}
            aria-label={t('listen')}
            className="h-8 w-8 flex items-center justify-center rounded-full text-indigo-600 hover:bg-indigo-50"
          >
            <SpeakerIcon className="h-4 w-4" />
          </button>
          <button
            onClick={handleMicClick}
            aria-label={t('record')}
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
          {t('speechUnsupported')}
        </p>
      )}

      {recognition.supported && recognition.transcript && !recognition.listening && (
        <WordMatchFeedback target={en} heard={recognition.transcript} />
      )}

      {showDeepCheck && scenarioId && <DeepCheckPanel scenarioId={scenarioId} targetSentence={en} />}
    </div>
  )
}
