import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
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
import { useLanguage, type MessageKey } from '../lib/i18n'
import { stopSoundClip } from '../lib/soundClip'
import AccentToggle from '../components/AccentToggle'
import PageHeading from '../components/PageHeading'
import SwipeCardExercise from '../components/Pronunciation/SwipeCardExercise'
import SoundHowToTab from '../components/Pronunciation/SoundHowToTab'
import SoundPronunciationTab from '../components/Pronunciation/SoundPronunciationTab'
import DrillFunnel from '../components/PronunciationSession/DrillFunnel'
import { SheetLookContext, sheet } from '../components/PronunciationSession/DrillCard'

type SheetTab = 'how' | 'listening' | 'pronunciation'

const TAB_LABELS: Record<SheetTab, MessageKey> = {
  how: 'sndArticulation',
  listening: 'sndHearingTab',
  pronunciation: 'sndPronTab',
}

export default function PhonemeDetailPage() {
  const { phonemeId } = useParams<{ phonemeId: string }>()
  // Keyed so following a "practise this sound too" link starts the new sheet fresh.
  return <PhonemeSheet key={phonemeId} phonemeId={phonemeId ?? ''} />
}

/** A sound's sheet: How to make it (the default, ?mode= absent), Listening and Pronunciation tabs. */
function PhonemeSheet({ phonemeId }: { phonemeId: string }) {
  const { lang, t } = useLanguage()
  const phoneme = getPhoneme(phonemeId)
  const practice = getPhonemePractice(phonemeId)
  const soundItem = phoneme?.curriculumId ? getSoundItem(phoneme.curriculumId) : undefined

  const [searchParams, setSearchParams] = useSearchParams()
  const mode = searchParams.get('mode')
  const tab: SheetTab = mode === 'pronunciation' && practice ? 'pronunciation' : mode === 'listening' ? 'listening' : 'how'
  const tabs: SheetTab[] = practice ? ['how', 'listening', 'pronunciation'] : ['how', 'listening']
  const [accent, setAccent] = useState<AccentPreference>(() => getAccentPreference())
  const [completed, setCompleted] = useState(false)
  const [swipeResult, setSwipeResult] = useState<{ score: number; total: number } | null>(null)
  const [attemptKey, setAttemptKey] = useState(0)
  // The Pronunciation tab is always assessed (and modelled) in American English, so the toggle
  // shows and locks on US there without touching the saved preference.
  const pronunciationActive = tab === 'pronunciation'
  const displayedAccent = pronunciationActive ? PRODUCTION_ASSESSMENT_ACCENT : accent

  useEffect(() => () => stopSoundClip(), [])

  function handleAccentChange(next: AccentPreference) {
    setAccent(next)
    setAccentPreference(next)
  }

  function handleTabChange(next: SheetTab) {
    window.speechSynthesis?.cancel()
    stopSoundClip()
    const params = new URLSearchParams(searchParams)
    if (next === 'how') params.delete('mode')
    else params.set('mode', next)
    setSearchParams(params, { replace: true })
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

  const note = lang === 'hu' ? phoneme.hungarianNoteHu : lang === 'de' ? (practice?.noteDe ?? phoneme.hungarianNote) : phoneme.hungarianNote

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeading
        title={`/${phoneme.ipaSymbol}/`}
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

      <div className="inline-flex max-w-full flex-wrap rounded-lg bg-secondary p-0.5" role="group">
        {tabs.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => handleTabChange(value)}
            aria-pressed={tab === value}
            className={`rounded-md px-3 py-1.5 text-sm sm:px-4 ${
              tab === value ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t(TAB_LABELS[value])}
          </button>
        ))}
      </div>

      <SheetLookContext.Provider value={true}>
        {tab === 'how' ? (
          <SoundHowToTab phoneme={phoneme} practice={practice} accent={accent} onNext={() => handleTabChange('listening')} />
        ) : tab === 'pronunciation' && practice ? (
          <SoundPronunciationTab phoneme={phoneme} practice={practice} soundItemId={soundItem?.id} />
        ) : completed ? (
          <div className="grid gap-6 rounded-2xl border border-rose-200 bg-card p-6 shadow-[var(--shadow-card)] sm:p-8 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-8">
            <div className="space-y-4">
              <h2 className="text-sm font-medium text-muted-foreground">{t('sndHearingTab')}</h2>
              <p className="text-3xl font-semibold text-foreground">/{phoneme.ipaSymbol}/</p>
            </div>
            <div className="space-y-4 border-t border-border pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">
              <p className="text-sm font-medium text-foreground">
                {swipeResult ? t('sndHearingDone', { score: swipeResult.score, total: swipeResult.total }) : t('sndHearingDoneFunnel')}
              </p>
              <div className="flex flex-wrap gap-3">
                <button onClick={practiceAgain} className={sheet.secondaryButton}>
                  {t('sndAgain')}
                </button>
                {practice && (
                  <button onClick={() => handleTabChange('pronunciation')} className={sheet.primaryButton}>
                    {t('sndPronTab')} →
                  </button>
                )}
              </div>
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
      </SheetLookContext.Provider>
    </div>
  )
}
