// Grammar Coach "Past · Present · Future" game. Quick round: nine questions about the learner's own
// life; a good answer drops into its time frame's column together with the question. Story: a
// short role-play told through six questions, answered in character from a fact card, ending in a
// decision, an outcome and a write-up (docs/tense-story-mode-design.md). Either can be played in
// chat (read and type) or orally (listen and speak).
import { useState } from 'react'
import { BookOpen, MessageSquare, Mic, Zap } from 'lucide-react'
import { useLanguage } from '../../../lib/i18n'
import { useSpeechRecognition } from '../../../hooks/useSpeechRecognition'
import { useSpeechSynthesis } from '../../../hooks/useSpeechSynthesis'
import { getAccentPreference, type AccentPreference } from '../../../lib/voiceSelection'
import { awardClientXp } from '../../../lib/gamificationApi'
import { buildRound, roundScore } from '../../../lib/tenseGame'
import { TENSE_GAME_LEVELS, type TenseGameLevel, type TenseGameMode, type TenseGameQuestion } from '../../../data/tenseGameQuestions'
import { TENSE_STORIES, getTenseStory, type TenseStory, type TenseStoryId } from '../../../data/tenseStories'
import QuestionRunner, { placedAnswers, type QuestionResult } from './QuestionRunner'
import TimeColumns, { FRAME_LABEL, frameTotals } from './TimeColumns'
import ModelAnswer from './ModelAnswer'
import FactCard from './FactCard'
import StoryEnding from './StoryEnding'

type GameKind = 'round' | 'story'
type Phase = 'setup' | 'briefing' | 'playing' | 'done'

interface Prefs {
  kind: GameKind
  mode: TenseGameMode
  level: TenseGameLevel
  storyId: TenseStoryId
}

const PREFS_KEY = 'aiEnglish:tenseGame'

function loadPrefs(): Prefs {
  const fallback: Prefs = { kind: 'round', mode: 'chat', level: 'A2', storyId: TENSE_STORIES[0].id }
  try {
    const raw = JSON.parse(window.localStorage.getItem(PREFS_KEY) ?? '{}') as Record<string, unknown>
    return {
      kind: raw.kind === 'story' ? 'story' : 'round',
      mode: raw.mode === 'oral' ? 'oral' : 'chat',
      level: TENSE_GAME_LEVELS.includes(raw.level as TenseGameLevel) ? (raw.level as TenseGameLevel) : fallback.level,
      storyId: getTenseStory(String(raw.storyId))?.id ?? fallback.storyId,
    }
  } catch {
    return fallback
  }
}

function savePrefs(prefs: Prefs) {
  try {
    window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
  } catch {
    // A remembered choice is a convenience only.
  }
}

function readAccent(): AccentPreference {
  try {
    return getAccentPreference()
  } catch {
    return 'gb'
  }
}

const rateFor = (level: TenseGameLevel) => (level === 'A1' || level === 'A2' ? 0.9 : 1)

function OptionCard({
  selected,
  disabled,
  onClick,
  icon: Icon,
  title,
  description,
}: {
  selected: boolean
  disabled?: boolean
  onClick: () => void
  icon: typeof Mic
  title: string
  description: string
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
      className={`flex items-start gap-3 rounded-lg border p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
        selected ? 'border-amber-400 bg-amber-50 ring-1 ring-amber-300' : 'border-slate-200 hover:bg-slate-50'
      }`}
    >
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${selected ? 'text-amber-600' : 'text-slate-400'}`} aria-hidden />
      <span>
        <span className="block text-sm font-semibold text-slate-800">{title}</span>
        <span className="block text-xs text-slate-500">{description}</span>
      </span>
    </button>
  )
}

export default function TenseGame() {
  const { t } = useLanguage()
  const recognition = useSpeechRecognition()
  const [accent] = useState(readAccent)
  const synth = useSpeechSynthesis('female', accent)
  const speak = synth.supported ? synth.speak : undefined
  const [prefs, setPrefs] = useState(loadPrefs)
  const playMode: TenseGameMode = prefs.mode === 'oral' && recognition.supported ? 'oral' : 'chat'
  const story = prefs.kind === 'story' ? getTenseStory(prefs.storyId) : undefined

  const [phase, setPhase] = useState<Phase>('setup')
  const [round, setRound] = useState<TenseGameQuestion[]>([])
  const [roundKey, setRoundKey] = useState(0)
  const [results, setResults] = useState<QuestionResult[]>([])
  const [lastRoundIds, setLastRoundIds] = useState<string[]>([])

  const update = (patch: Partial<Prefs>) => setPrefs((p) => ({ ...p, ...patch }))

  function start() {
    savePrefs(prefs)
    setResults([])
    setRoundKey((k) => k + 1)
    if (story) {
      setPhase('briefing')
      return
    }
    setRound(buildRound(prefs.level, lastRoundIds))
    setPhase('playing')
  }

  function quit() {
    synth.cancel()
    setPhase('setup')
  }

  function finish(finalResults: QuestionResult[]) {
    setResults(finalResults)
    setPhase('done')
    if (!story) {
      setLastRoundIds(round.map((q) => q.id))
      awardClientXp({
        activityType: 'grammar-coach.exercise',
        itemRef: `tense-game/${prefs.level}`,
        performanceScore: roundScore(finalResults.map((r) => r.outcome)),
      })
    }
  }

  if (phase === 'setup') {
    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-5">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-slate-800">{t('tenseGameTitle')}</h2>
          <p className="text-sm text-slate-500">{t('tenseGameIntro')}</p>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t('tenseGamePlayWhat')}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <OptionCard
              selected={prefs.kind === 'round'}
              onClick={() => update({ kind: 'round' })}
              icon={Zap}
              title={t('tenseGameKindRound')}
              description={t('tenseGameKindRoundDesc')}
            />
            <OptionCard
              selected={prefs.kind === 'story'}
              onClick={() => update({ kind: 'story' })}
              icon={BookOpen}
              title={t('tenseGameKindStory')}
              description={t('tenseGameKindStoryDesc')}
            />
          </div>
        </div>

        {prefs.kind === 'round' ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t('tenseGameLevel')}</span>
            {TENSE_GAME_LEVELS.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={prefs.level === option}
                onClick={() => update({ level: option })}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  prefs.level === option ? 'border-amber-400 bg-amber-100 text-amber-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t('tenseGamePickStory')}</p>
            <div className="grid gap-2">
              {TENSE_STORIES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={prefs.storyId === s.id}
                  onClick={() => update({ storyId: s.id })}
                  className={`flex items-start justify-between gap-3 rounded-lg border p-3 text-left transition ${
                    prefs.storyId === s.id ? 'border-amber-400 bg-amber-50 ring-1 ring-amber-300' : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-slate-800">{s.title}</span>
                    <span className="block text-xs text-slate-500">{s.teaser}</span>
                  </span>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">{s.levelLabel}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t('tenseGameAnswerHow')}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <OptionCard
              selected={playMode === 'chat'}
              onClick={() => update({ mode: 'chat' })}
              icon={MessageSquare}
              title={t('tenseGameModeChat')}
              description={t('tenseGameModeChatDesc')}
            />
            <OptionCard
              selected={playMode === 'oral'}
              disabled={!recognition.supported}
              onClick={() => update({ mode: 'oral' })}
              icon={Mic}
              title={t('tenseGameModeOral')}
              description={recognition.supported ? t('tenseGameModeOralDesc') : t('tenseGameOralUnsupported')}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={start}
          className="rounded-lg bg-amber-500 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-amber-600"
        >
          {t('tenseGameStart')}
        </button>
      </div>
    )
  }

  if (story) return renderStory(story)

  if (phase === 'playing') {
    return (
      <QuestionRunner
        key={roundKey}
        questions={round}
        mode={playMode}
        label={prefs.level}
        speechRate={rateFor(prefs.level)}
        speak={speak}
        cancelSpeech={synth.cancel}
        onQuit={quit}
        onFinish={finish}
        finishLabel="tenseGameFinish"
      />
    )
  }

  // Quick round, done.
  const missed = results.filter((r) => r.outcome === 'missed')
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-slate-800">{t('tenseGameDoneTitle')}</h2>
          <p className="text-sm text-slate-600">{t('tenseGameDoneScore', { n: results.length - missed.length, total: results.length })}</p>
        </div>
        {missed.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t('tenseGameMissedList')}</p>
            <ul className="space-y-2">
              {missed.map((m) => (
                <li key={m.question.id} className="rounded-lg border border-slate-200 p-2.5">
                  <p className="text-xs text-slate-500">
                    {t(FRAME_LABEL[m.question.frame])} · {m.question.text}
                  </p>
                  <ModelAnswer text={m.model} onListen={speak ? () => speak(m.model) : undefined} />
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={start}
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-amber-600"
          >
            {t('tenseGamePlayAgain')}
          </button>
          <button
            type="button"
            onClick={() => setPhase('setup')}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            {t('tenseGameChangeSettings')}
          </button>
        </div>
      </div>
      <TimeColumns placed={placedAnswers(results, false)} latestId={null} totals={frameTotals(round)} />
    </div>
  )

  // Story mode: briefing → questions → decision, outcome and write-up. A render function, not a
  // component: a component declared in here would remount (and lose its state) on every render.
  function renderStory(story: TenseStory) {
    if (phase === 'briefing') {
      return (
        <div className="mx-auto max-w-3xl grid gap-5 md:grid-cols-[minmax(0,1fr)_320px] md:items-start">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
              {t('tenseGameKindStory')} · {story.levelLabel}
            </p>
            <h2 className="text-lg font-semibold text-slate-800">{story.title}</h2>
            <p className="text-sm text-slate-600">{story.scene}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => setPhase('playing')}
                className="rounded-lg bg-amber-500 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-amber-600"
              >
                {t('tenseStoryBegin')}
              </button>
              <button
                type="button"
                onClick={quit}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                {t('tenseGameQuit')}
              </button>
            </div>
          </div>
          <FactCard story={story} />
        </div>
      )
    }
    if (phase === 'playing') {
      return (
        <QuestionRunner
          key={roundKey}
          questions={story.questions}
          mode={playMode}
          label={story.title}
          speaker={story.speaker}
          speechRate={rateFor(story.level)}
          storyId={story.id}
          aside={<FactCard story={story} />}
          speak={speak}
          cancelSpeech={synth.cancel}
          onQuit={quit}
          onFinish={finish}
          finishLabel="tenseGameToDecision"
        />
      )
    }
    return (
      <StoryEnding
        key={roundKey}
        story={story}
        results={results}
        mode={playMode}
        speak={speak}
        cancelSpeech={synth.cancel}
        onPlayAgain={start}
        onOtherStory={() => setPhase('setup')}
      />
    )
  }
}
