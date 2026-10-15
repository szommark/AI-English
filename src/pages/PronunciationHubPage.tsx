import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getFeature } from '../data/features'
import { connectedSpeech } from '../data/pronunciationLessons/connectedSpeech'
import { stressPatterns } from '../data/pronunciationLessons/stressPatterns'
import { fetchPronunciationProgress, type PronunciationProgressEntry } from '../lib/pronunciationProgressApi'
import { localizeFeature, useLanguage, type MessageKey } from '../lib/i18n'
import {
  getAccentPreference,
  setAccentPreference,
  PRODUCTION_ACCENT_NOTE_HU,
  PRODUCTION_ASSESSMENT_ACCENT,
  type AccentPreference,
} from '../lib/voiceSelection'
import AccentToggle from '../components/AccentToggle'
import PageHeading from '../components/PageHeading'
import ResurfaceQueue from '../components/Pronunciation/ResurfaceQueue'
import SoundBankTab from '../components/Pronunciation/SoundBankTab'
import LessonUnitList from '../components/PronunciationLessons/LessonUnitList'
import WordlistPracticeTab from '../components/PronunciationPractice/WordlistPracticeTab'
import ConversationPracticeTab from '../components/PronunciationPractice/ConversationPracticeTab'

const pronunciationFeature = getFeature('pronunciation-session')!

type HubTab = 'sound-bank' | 'stress-patterns' | 'connected-speech' | 'wordlists' | 'conversations'

const TABS: { tab: HubTab; label: MessageKey }[] = [
  { tab: 'sound-bank', label: 'pronTabSoundBank' },
  { tab: 'stress-patterns', label: 'pronTabStress' },
  { tab: 'connected-speech', label: 'pronTabConnected' },
  { tab: 'wordlists', label: 'pronTabWordlists' },
  { tab: 'conversations', label: 'pronTabConversations' },
]

/** Wordlist and Conversation practice are Azure-scored throughout, so they play and assess in American English. */
const PRACTICE_TABS: HubTab[] = ['wordlists', 'conversations']

const isHubTab = (value: string | null): value is HubTab => TABS.some((t) => t.tab === value)

/**
 * /pronunciation: the sessions as tabs (?tab=, Sound Bank by default). A Stress Patterns or
 * Connected Speech unit itself still opens on its own page, /pronunciation/<session>/<unit>.
 */
export default function PronunciationHubPage() {
  const { lang, t } = useLanguage()
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const tab: HubTab = isHubTab(tabParam) ? tabParam : 'sound-bank'

  const [progress, setProgress] = useState<PronunciationProgressEntry[]>([])
  const [accent, setAccent] = useState<AccentPreference>(() => getAccentPreference())
  const practiceTab = PRACTICE_TABS.includes(tab)

  useEffect(() => {
    fetchPronunciationProgress().then(setProgress)
  }, [])

  function handleTabChange(next: HubTab) {
    if (next === tab) return
    window.speechSynthesis?.cancel()
    const params = new URLSearchParams(searchParams)
    if (next === 'sound-bank') params.delete('tab')
    else params.set('tab', next)
    setSearchParams(params)
  }

  function handleAccentChange(next: AccentPreference) {
    setAccent(next)
    setAccentPreference(next)
  }

  const description =
    tab === 'sound-bank'
      ? t('pronunciationSubtitle')
      : tab === 'stress-patterns'
        ? stressPatterns.descriptionHu
        : tab === 'connected-speech'
          ? connectedSpeech.descriptionHu
          : tab === 'wordlists'
            ? t('pronWordlistsIntro')
            : t('pronConversationsIntro')

  return (
    <div className="space-y-6">
      <PageHeading
        title={localizeFeature(lang, pronunciationFeature).title}
        subtitle={t('pronunciationHubSubtitle')}
        actions={
          <div className="flex flex-col items-end gap-1">
            <AccentToggle
              accent={practiceTab ? PRODUCTION_ASSESSMENT_ACCENT : accent}
              onChange={handleAccentChange}
              disabled={practiceTab}
            />
            {practiceTab && (
              <p className="max-w-[16rem] text-right text-xs text-muted-foreground">{PRODUCTION_ACCENT_NOTE_HU}</p>
            )}
          </div>
        }
      />

      <div className="space-y-2">
        <div className="inline-flex max-w-full flex-wrap rounded-lg bg-secondary p-0.5" role="group">
          {TABS.map(({ tab: value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => handleTabChange(value)}
              aria-pressed={tab === value}
              className={`rounded-md px-3 py-1.5 text-sm sm:px-4 ${
                tab === value ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t(label)}
            </button>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {!practiceTab && <ResurfaceQueue progress={progress} />}

      {tab === 'sound-bank' && <SoundBankTab accent={accent} />}
      {tab === 'stress-patterns' && <LessonUnitList session={stressPatterns} progress={progress} />}
      {tab === 'connected-speech' && <LessonUnitList session={connectedSpeech} progress={progress} />}
      {tab === 'wordlists' && <WordlistPracticeTab />}
      {tab === 'conversations' && <ConversationPracticeTab />}
    </div>
  )
}
