import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Loader2, Mic, Volume2 } from 'lucide-react'
import { getPhoneme } from '../data/phonemes'
import { getPhonemePractice } from '../data/phonemePractice'
import { getSoundItem } from '../data/pronunciationCurriculum'
import {
  getAccentPreference,
  setAccentPreference,
  PRODUCTION_ACCENT_NOTE_HU,
  PRODUCTION_ASSESSMENT_ACCENT,
  type AccentPreference,
} from '../lib/voiceSelection'
import { useLanguage } from '../lib/i18n'
import { playSoundClip, stopSoundClip } from '../lib/soundClip'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis'
import AccentToggle from '../components/AccentToggle'
import PageHeading from '../components/PageHeading'
import { HighlightedWord } from '../components/Pronunciation/PhonemeTile'
import SwipeCardExercise from '../components/Pronunciation/SwipeCardExercise'
import SoundPronunciationTab from '../components/Pronunciation/SoundPronunciationTab'
import { useSoundCheck } from '../components/Pronunciation/useSoundCheck'
import DrillFunnel from '../components/PronunciationSession/DrillFunnel'

type SheetTab = 'hearing' | 'pronunciation'

export default function PhonemeDetailPage() {
  const { phonemeId } = useParams<{ phonemeId: string }>()
  // Keyed so following a "practise this sound too" link starts the new sheet fresh.
  return <PhonemeSheet key={phonemeId} phonemeId={phonemeId ?? ''} />
}

function PhonemeSheet({ phonemeId }: { phonemeId: string }) {
  const { lang, t } = useLanguage()
  const phoneme = getPhoneme(phonemeId)
  const practice = getPhonemePractice(phonemeId)
  const soundItem = phoneme?.curriculumId ? getSoundItem(phoneme.curriculumId) : undefined

  const [searchParams, setSearchParams] = useSearchParams()
  const tab: SheetTab = searchParams.get('mode') === 'pronunciation' && practice ? 'pronunciation' : 'hearing'
  const [accent, setAccent] = useState<AccentPreference>(() => getAccentPreference())
  const [completed, setCompleted] = useState(false)
  const [swipeResult, setSwipeResult] = useState<{ score: number; total: number } | null>(null)
  const [attemptKey, setAttemptKey] = useState(0)
  const [clipState, setClipState] = useState<'idle' | 'loading' | 'playing' | 'error'>('idle')
  // The Pronunciation tab is always assessed (and modelled) in American English, so the toggle
  // shows and locks on US there without touching the saved preference.
  const pronunciationActive = tab === 'pronunciation'
  const displayedAccent = pronunciationActive ? PRODUCTION_ASSESSMENT_ACCENT : accent
  const synth = useSpeechSynthesis('female', displayedAccent)
  const soundCheck = useSoundCheck(phonemeId, phoneme?.ipaSymbol ?? '', practice?.anchorWord ?? '')

  useEffect(() => () => stopSoundClip(), [])

  function handleAccentChange(next: AccentPreference) {
    setAccent(next)
    setAccentPreference(next)
  }

  function handleTabChange(next: SheetTab) {
    window.speechSynthesis?.cancel()
    stopSoundClip()
    const params = new URLSearchParams(searchParams)
    if (next === 'hearing') params.delete('mode')
    else params.set('mode', next)
    setSearchParams(params, { replace: true })
  }

  async function playSound() {
    setClipState('loading')
    try {
      await playSoundClip(phonemeId, () => setClipState('playing'))
      setClipState('idle')
    } catch (err) {
      console.error('Sound clip failed:', err)
      setClipState('error')
    }
  }

  function handleSwipeComplete(score: number, total: number) {
    setSwipeResult({ score, total })
    setCompleted(true)
  }

  function practiceAgain() {
    setCompleted(false)
    setSwipeResult(null)
    setAttemptKey((k) => k + 1)
  }

  if (!phoneme) {
    return (
      <div className="max-w-2xl py-6 space-y-4">
        <p className="text-sm text-muted-foreground">{t('sndNotFound')}</p>
        <Link to="/pronunciation?tab=sound-bank" className="text-sm text-primary hover:underline">
          {t('sndBack')}
        </Link>
      </div>
    )
  }

  const articulation =
    lang === 'hu'
      ? (phoneme.articulation.descriptionHu ?? phoneme.articulation.description)
      : lang === 'de'
        ? (practice?.descriptionDe ?? phoneme.articulation.description)
        : (practice?.descriptionEn ?? phoneme.articulation.description)
  const note = lang === 'hu' ? phoneme.hungarianNoteHu : lang === 'de' ? (practice?.noteDe ?? phoneme.hungarianNote) : phoneme.hungarianNote
  const iconButton =
    'flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground hover:bg-secondary disabled:opacity-50'

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeading
        title={
          <span className="inline-flex items-center gap-3">
            /{phoneme.ipaSymbol}/
            {practice && (
              <span className="inline-flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={playSound}
                  disabled={clipState === 'loading' || clipState === 'playing'}
                  aria-label={t('sndPlaySound')}
                  title={t('sndPlaySound')}
                  className={iconButton}
                >
                  {clipState === 'loading' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Volume2 className={`h-4 w-4 ${clipState === 'playing' ? 'text-rose-600' : ''}`} />
                  )}
                </button>
                <button
                  type="button"
                  onClick={soundCheck.run}
                  disabled={soundCheck.busy}
                  aria-label={t('sndCheckSound')}
                  title={t('sndCheckSound')}
                  className={iconButton}
                >
                  <Mic className={`h-4 w-4 ${soundCheck.busy ? 'text-rose-600' : ''}`} />
                </button>
              </span>
            )}
          </span>
        }
        subtitle={note}
        actions={
          <div className="flex flex-col items-end gap-1">
            <AccentToggle accent={displayedAccent} onChange={handleAccentChange} disabled={pronunciationActive} />
            {pronunciationActive && (
              <p className="max-w-[16rem] text-right text-xs text-muted-foreground">{PRODUCTION_ACCENT_NOTE_HU}</p>
            )}
          </div>
        }
      />

      {clipState === 'error' && <p className="text-sm text-red-600">{t('sndClipError')}</p>}
      {soundCheck.panel}

      <div className="space-y-6">
        <section className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div>
            <h2 className="text-sm font-medium text-foreground mb-1">{t('sndArticulation')}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{articulation}</p>
          </div>

          <div>
            <h2 className="text-sm font-medium text-foreground mb-2">{t('sndExampleWords')}</h2>
            <ul className="flex flex-wrap gap-2">
              {phoneme.exampleWords.map((ex) => (
                <li key={ex.word}>
                  <button
                    onClick={() => synth.speak(ex.word)}
                    aria-label={t('sndPlayWord', { word: ex.word })}
                    className="group inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-1.5 text-sm text-foreground hover:border-rose-200"
                  >
                    <HighlightedWord word={ex.word} highlight={ex.highlight} />
                    <Volume2 className="h-3.5 w-3.5 text-muted-foreground group-hover:text-rose-600" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {phoneme.minimalPairs && phoneme.minimalPairs.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-foreground mb-2">{t('sndMinimalPairs')}</h2>
              <ul className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                {phoneme.minimalPairs.map((pair) => (
                  <li key={`${pair.a}-${pair.b}`} className="rounded-lg bg-secondary px-3 py-1.5">
                    {pair.a} / {pair.b}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {practice && (
          <div className="inline-flex max-w-full flex-wrap rounded-lg bg-secondary p-0.5" role="group">
            {(['hearing', 'pronunciation'] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => handleTabChange(value)}
                aria-pressed={tab === value}
                className={`rounded-md px-3 py-1.5 text-sm sm:px-4 ${
                  tab === value ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t(value === 'hearing' ? 'sndHearingTab' : 'sndPronTab')}
              </button>
            ))}
          </div>
        )}

        {tab === 'pronunciation' && practice ? (
          <SoundPronunciationTab phoneme={phoneme} practice={practice} soundItemId={soundItem?.id} />
        ) : completed ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center space-y-3">
            <p className="text-sm font-medium text-rose-700">
              {swipeResult ? t('sndHearingDone', { score: swipeResult.score, total: swipeResult.total }) : t('sndHearingDoneFunnel')}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={practiceAgain}
                className="rounded-lg border border-rose-300 text-rose-700 text-sm font-medium px-4 py-2 hover:bg-rose-100"
              >
                {t('sndAgain')}
              </button>
              {practice && (
                <button
                  onClick={() => handleTabChange('pronunciation')}
                  className="rounded-lg bg-rose-600 text-white text-sm font-medium px-4 py-2 hover:bg-rose-700"
                >
                  {t('sndPronTab')} →
                </button>
              )}
            </div>
          </div>
        ) : soundItem ? (
          <DrillFunnel
            key={attemptKey}
            soundItem={soundItem}
            phoneme={phoneme}
            accent={accent}
            hasPriorAttempt={false}
            listeningOnly
            onItemComplete={() => setCompleted(true)}
          />
        ) : phoneme.swipeWords && phoneme.swipeWords.length > 0 ? (
          <SwipeCardExercise key={attemptKey} phoneme={phoneme} accent={accent} onComplete={handleSwipeComplete} />
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-card p-6 text-center">
            <p className="text-sm text-muted-foreground">{t('sndNoExercise')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
