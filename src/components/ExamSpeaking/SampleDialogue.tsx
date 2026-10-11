import { useEffect } from 'react'
import { Volume2 } from 'lucide-react'
import type { RehearsalLine } from '../../data/exams/speakingRehearsal'
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis'
import { useLanguage } from '../../lib/i18n'
import LiveCaptions from '../TutorBot/LiveCaptions'
import StateIndicator from '../TutorBot/StateIndicator'
import TutorAvatar, { TUTOR_VOICE_GENDER } from '../TutorBot/TutorAvatar'

/**
 * A rehearsal's sample examiner–candidate exchange, revealed line by line with "Next". The
 * examiner's lines are read aloud as they appear (the learner's are left for them to say).
 */
export default function SampleDialogue({
  lines,
  shown,
  onShownChange,
  language,
}: {
  lines: RehearsalLine[]
  /** How many lines are revealed. */
  shown: number
  onShownChange: (shown: number) => void
  language: string
}) {
  const { t } = useLanguage()
  const synthesis = useSpeechSynthesis(TUTOR_VOICE_GENDER)
  const revealed = lines.slice(0, shown)
  const lastExaminerLine = revealed.filter((l) => l.speaker === 'examiner').at(-1)?.line

  useEffect(() => synthesis.cancel, [synthesis.cancel])

  function next() {
    const line = lines[shown]
    if (!line) return
    if (line.speaker === 'examiner') synthesis.speak(line.line)
    else synthesis.cancel()
    onShownChange(shown + 1)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-16 shrink-0 sm:w-20">
          <TutorAvatar />
        </div>
        <div className="min-w-0 space-y-2">
          <p className="text-sm font-semibold text-foreground">{t('exSpkExaminer')}</p>
          {synthesis.speaking && <StateIndicator state="speaking" />}
        </div>
      </div>

      <div lang={language}>
        <LiveCaptions
          turns={revealed.map((l) => ({ role: l.speaker === 'examiner' ? 'assistant' : 'user', content: l.line }))}
          interimText=""
          aiLabel={t('exSpkExaminer')}
          userLabel={t('exSpkYou')}
          emptyText={t('exSpkSampleStart')}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {shown < lines.length ? (
          <button
            type="button"
            onClick={next}
            className="min-h-11 rounded-xl border border-primary px-5 text-sm font-semibold text-primary hover:bg-muted"
          >
            {t('next')}
          </button>
        ) : (
          <p className="text-sm text-muted-foreground">{t('sampleEnded')}</p>
        )}
        {lastExaminerLine && synthesis.supported && (
          <button
            type="button"
            onClick={() => synthesis.speak(lastExaminerLine)}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-medium text-foreground hover:bg-muted"
          >
            <Volume2 className="h-4 w-4" />
            {t('listenAgain')}
          </button>
        )}
      </div>
    </div>
  )
}
