// The end of a story: the learner's final decision (a choice with a reason, or an open reply),
// the ending it leads to, and the AI's write-up of the learner's answers (a report, a statement,
// meeting notes). The answered columns stay underneath as the storyboard.
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Mic, Square, Volume2 } from 'lucide-react'
import { useLanguage, type MessageKey } from '../../../lib/i18n'
import { useSpeechRecognition } from '../../../hooks/useSpeechRecognition'
import { awardClientXp } from '../../../lib/gamificationApi'
import { judgeStoryDecision, TenseGameCheckFailed, writeStoryUp } from '../../../lib/tenseGameApi'
import { roundScore } from '../../../lib/tenseGame'
import type { TenseGameMode } from '../../../data/tenseGameQuestions'
import {
  STORY_TEXT_MAX_LENGTH,
  storyOutcomeId,
  type OutcomeTone,
  type StoryDecisionResult,
  type TenseStory,
} from '../../../data/tenseStories'
import TimeColumns, { frameTotals } from './TimeColumns'
import { GAME_ERROR_MESSAGE, placedAnswers, type GameError, type QuestionResult } from './QuestionRunner'

const TONE_STYLE: Record<OutcomeTone, string> = {
  good: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  mixed: 'border-amber-200 bg-amber-50 text-amber-900',
  bad: 'border-rose-200 bg-rose-50 text-rose-900',
}

type Stage = 'deciding' | 'judging' | 'ended'

export default function StoryEnding({
  story,
  results,
  mode,
  speak,
  cancelSpeech,
  onPlayAgain,
  onOtherStory,
}: {
  story: TenseStory
  results: QuestionResult[]
  mode: TenseGameMode
  speak?: (text: string, options?: { rate?: number }) => void
  cancelSpeech: () => void
  onPlayAgain: () => void
  onOtherStory: () => void
}) {
  const { lang, t } = useLanguage()
  const recognition = useSpeechRecognition()
  const decision = story.decision
  const [choiceId, setChoiceId] = useState<string | null>(null)
  const [reply, setReply] = useState('')
  const [stage, setStage] = useState<Stage>('deciding')
  const [inputError, setInputError] = useState<MessageKey | null>(null)
  const [error, setError] = useState<GameError | null>(null)
  const [result, setResult] = useState<StoryDecisionResult | null>(null)
  const [outcomeId, setOutcomeId] = useState<string | null>(null)
  const [writeUp, setWriteUp] = useState<string | null>(null)
  const [writeUpState, setWriteUpState] = useState<'loading' | 'failed' | 'done'>('loading')
  const aliveRef = useRef(true)

  const contradictedIds = results.filter((r) => r.contradicted).map((r) => r.question.id)
  const goodAnswers = results.filter((r) => r.outcome !== 'missed').length
  const outcome = outcomeId ? story.outcomes[outcomeId] : null
  const note = story.contradictionNote && contradictedIds.length >= story.contradictionNote.minCount ? story.contradictionNote.text : null
  const decisionText = () => {
    const option = decision.kind === 'choice' ? decision.options.find((o) => o.id === choiceId) : undefined
    return option ? `${option.label}. ${reply.trim()}` : reply.trim()
  }

  useEffect(() => {
    aliveRef.current = true
    if (mode === 'oral') speak?.(decision.prompt)
    return () => {
      aliveRef.current = false
      recognition.stop()
    }
    // Only on mount / unmount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // In oral mode the spoken reason fills the text box (it stays editable).
  useEffect(() => {
    if (recognition.listening && recognition.transcript) setReply(recognition.transcript.slice(0, STORY_TEXT_MAX_LENGTH))
  }, [recognition.listening, recognition.transcript])

  async function requestWriteUp(endingId: string) {
    setWriteUpState('loading')
    try {
      const text = await writeStoryUp({
        storyId: story.id,
        answers: results.map((r) => ({ questionId: r.question.id, answer: r.outcome === 'missed' ? '' : r.corrected || r.answer })),
        decision: decisionText().slice(0, STORY_TEXT_MAX_LENGTH),
        outcomeId: endingId,
      })
      if (!aliveRef.current) return
      setWriteUp(text)
      setWriteUpState('done')
    } catch {
      if (aliveRef.current) setWriteUpState('failed')
    }
  }

  async function decide(e: FormEvent) {
    e.preventDefault()
    if (decision.kind === 'choice' && !choiceId) {
      setInputError('tenseStoryPickOption')
      return
    }
    if (!reply.trim()) {
      setInputError(decision.kind === 'choice' ? 'tenseStoryNeedReason' : 'tenseStoryNeedReply')
      return
    }
    recognition.stop()
    cancelSpeech()
    setInputError(null)
    setError(null)
    setStage('judging')
    try {
      const judged = await judgeStoryDecision({ storyId: story.id, choiceId: choiceId ?? undefined, reply: reply.trim(), lang })
      if (!aliveRef.current) return
      const endingId = storyOutcomeId(story, { choiceId: choiceId ?? undefined, result: judged }, contradictedIds)
      setResult(judged)
      setOutcomeId(endingId)
      setStage('ended')
      const ending = story.outcomes[endingId]
      if (mode === 'oral') speak?.(`${ending.title} ${ending.text}`)
      awardClientXp({
        activityType: 'grammar-coach.exercise',
        itemRef: `tense-story/${story.id}`,
        performanceScore: roundScore(results.map((r) => r.outcome)),
      })
      void requestWriteUp(endingId)
    } catch (err) {
      if (!aliveRef.current) return
      setError(err instanceof TenseGameCheckFailed ? err.reason : 'failed')
      setStage('deciding')
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
          {t('tenseStoryDecisionTitle')} · {story.title}
        </p>
        <div>
          <p className="text-xs font-semibold text-slate-400">{story.speaker}:</p>
          <div className="flex items-start gap-2">
            <p className="min-w-0 flex-1 text-lg font-medium text-slate-800">{decision.prompt}</p>
            {speak && (
              <button
                type="button"
                onClick={() => speak(decision.prompt)}
                aria-label={t('tenseGameListen')}
                title={t('tenseGameListen')}
                className="shrink-0 rounded-full p-1.5 text-indigo-600 hover:bg-indigo-50"
              >
                <Volume2 className="h-4 w-4" aria-hidden />
              </button>
            )}
          </div>
        </div>

        {stage !== 'ended' && (
          <form onSubmit={decide} className="space-y-3">
            {decision.kind === 'choice' && (
              <div className="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label={decision.prompt}>
                {decision.options.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={choiceId === option.id}
                    disabled={stage === 'judging'}
                    onClick={() => {
                      setChoiceId(option.id)
                      setInputError(null)
                    }}
                    className={`rounded-lg border p-3 text-left transition ${
                      choiceId === option.id ? 'border-amber-400 bg-amber-50 ring-1 ring-amber-300' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block text-sm font-semibold text-slate-800">{option.label}</span>
                    <span className="block text-xs text-slate-500">{option.detail}</span>
                  </button>
                ))}
              </div>
            )}
            <textarea
              value={reply}
              onChange={(e) => {
                setReply(e.target.value)
                setInputError(null)
              }}
              maxLength={STORY_TEXT_MAX_LENGTH}
              rows={2}
              disabled={stage === 'judging'}
              placeholder={t(decision.kind === 'choice' ? 'tenseStoryReasonPlaceholder' : 'tenseStoryReplyPlaceholder')}
              aria-label={t(decision.kind === 'choice' ? 'tenseStoryReasonPlaceholder' : 'tenseStoryReplyPlaceholder')}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 disabled:bg-slate-50"
            />
            {inputError && <p className="text-sm text-rose-600">{t(inputError)}</p>}
            {error && (
              <p role="alert" className="text-sm text-rose-600">
                {t(GAME_ERROR_MESSAGE[error])}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2">
              {mode === 'oral' && recognition.supported && (
                <button
                  type="button"
                  onClick={recognition.listening ? recognition.stop : recognition.start}
                  disabled={stage === 'judging'}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-sm transition disabled:opacity-50 ${
                    recognition.listening ? 'bg-rose-500 text-white hover:bg-rose-600' : 'border border-amber-400 text-amber-700 hover:bg-amber-50'
                  }`}
                >
                  {recognition.listening ? <Square className="h-4 w-4" aria-hidden /> : <Mic className="h-4 w-4" aria-hidden />}
                  {recognition.listening ? t('tenseGameStopListening') : t('tenseGameSpeak')}
                </button>
              )}
              <button
                type="submit"
                disabled={stage === 'judging'}
                className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-amber-600 disabled:opacity-50"
              >
                {stage === 'judging' ? t('tenseGameChecking') : t('tenseStoryDecide')}
              </button>
            </div>
          </form>
        )}

        {stage === 'ended' && outcome && (
          <div className="space-y-4">
            <div role="status" className={`rounded-lg border p-4 space-y-1 ${TONE_STYLE[outcome.tone]}`}>
              <p className="text-base font-semibold">{outcome.title}</p>
              <p className="text-sm">{outcome.text}</p>
              {note && <p className="text-sm italic">{note}</p>}
              {result?.feedback && <p className="pt-1 text-xs opacity-80">{result.feedback}</p>}
            </div>
            <p className="text-sm text-slate-600">{t('tenseStoryScore', { n: goodAnswers, total: results.length })}</p>

            <div className="rounded-lg border border-slate-200 bg-[#fffdf3] p-4 shadow-sm space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-800">{story.writeUp.title}</p>
                {writeUp && speak && (
                  <button
                    type="button"
                    onClick={() => speak(writeUp)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    <Volume2 className="h-3.5 w-3.5" aria-hidden />
                    {t('tenseGameListenModel')}
                  </button>
                )}
              </div>
              {writeUpState === 'loading' && <p className="text-sm italic text-slate-400">{t('tenseStoryWriting')}</p>}
              {writeUpState === 'failed' && outcomeId && (
                <div className="flex flex-wrap items-center gap-2 text-sm text-rose-600">
                  {t('tenseStoryWriteUpFailed')}
                  <button type="button" onClick={() => requestWriteUp(outcomeId)} className="font-medium underline">
                    {t('tenseStoryRetry')}
                  </button>
                </div>
              )}
              {writeUp && <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{writeUp}</p>}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onPlayAgain}
                className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-amber-600"
              >
                {t('tenseStoryPlayAgain')}
              </button>
              <button
                type="button"
                onClick={onOtherStory}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                {t('tenseStoryOtherStory')}
              </button>
            </div>
          </div>
        )}
      </div>

      <TimeColumns placed={placedAnswers(results, true)} latestId={null} totals={frameTotals(story.questions)} />
    </div>
  )
}
