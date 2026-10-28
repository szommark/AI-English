import type { GrammarExerciseSet, GrammarLesson } from '../../lib/types'
import { useLanguage } from '../../lib/i18n'
import PracticeCheck from './PracticeCheck'
import WrittenPractice from './WrittenPractice'

export type PracticeMode = 'speaking' | 'written'

function PrepareButton({ busy, label, onClick }: { busy: boolean; label: string; onClick: () => void }) {
  const { t } = useLanguage()
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-amber-600 disabled:cursor-wait disabled:opacity-60"
    >
      {busy ? t('preparing') : label}
    </button>
  )
}

/**
 * "Your turn": the paper index card taped under the board, open as soon as a grammar point
 * is picked — the lesson doesn't have to be played first. Speaking uses the lesson's
 * practice sentences; Writing is a separately generated exercise set. Either is generated
 * on request when it isn't cached yet.
 */
export default function PracticePanel({
  mode,
  onModeChange,
  lesson,
  isLessonLoading,
  onPrepareLesson,
  exercises,
  isExercisesLoading,
  onPrepareExercises,
  onWrittenComplete,
  flagSource,
}: {
  mode: PracticeMode
  onModeChange: (mode: PracticeMode) => void
  lesson: GrammarLesson | null
  isLessonLoading: boolean
  onPrepareLesson: () => void
  exercises: GrammarExerciseSet | null
  isExercisesLoading: boolean
  onPrepareExercises: () => void
  onWrittenComplete: (score: number) => void
  /** Names the exercise set in item flags (see WrittenPractice). */
  flagSource: string
}) {
  const { t } = useLanguage()

  return (
    <div className="relative pt-3">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-16 rotate-[-3deg] bg-amber-100/80 border border-amber-200/70 shadow-sm" />
      <div className="rounded-lg border border-slate-200 bg-[#fffdf3] shadow-md p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">{t('yourTurn')}</p>
          <div role="tablist" className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm">
            {(['speaking', 'written'] as const).map((option) => (
              <button
                key={option}
                role="tab"
                aria-selected={mode === option}
                onClick={() => onModeChange(option)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                  mode === option ? 'bg-amber-100 text-amber-700' : 'text-slate-400 hover:bg-slate-50'
                }`}
              >
                {t(option === 'speaking' ? 'practiceSpeaking' : 'practiceWritten')}
              </button>
            ))}
          </div>
        </div>

        {/* Both stay mounted so switching tabs keeps the learner's answers. */}
        <div role="tabpanel" hidden={mode !== 'speaking'}>
          {lesson ? (
            <PracticeCheck practice={lesson.practice} />
          ) : (
            <div className="space-y-3 text-center">
              <p className="text-sm text-slate-500">{t('speakingNeedsLesson')}</p>
              <PrepareButton busy={isLessonLoading} label={t('prepareSentences')} onClick={onPrepareLesson} />
            </div>
          )}
        </div>

        <div role="tabpanel" hidden={mode !== 'written'}>
          {exercises ? (
            <WrittenPractice set={exercises} onComplete={onWrittenComplete} flagSource={flagSource} />
          ) : (
            <div className="space-y-3 text-center">
              <p className="text-sm text-slate-500">{isExercisesLoading ? t('preparingExercises') : t('writtenIntro')}</p>
              <PrepareButton busy={isExercisesLoading} label={t('startWritten')} onClick={onPrepareExercises} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
