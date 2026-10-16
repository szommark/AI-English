import { useMemo } from 'react'
import type { Phoneme } from '../../data/phonemes'
import type { PhonemePractice } from '../../data/phonemePractice'
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis'
import { useLanguage } from '../../lib/i18n'
import { focusSoundResult } from '../../lib/phonemeLabels'
import { SOUND_CHECK_PREFIX } from '../../lib/pronunciationConfig'
import { recordPronunciationAttempt } from '../../lib/pronunciationProgressApi'
import { playSoundClip } from '../../lib/soundClip'
import type { PronunciationCheckResult } from '../../lib/types'
import { PRODUCTION_ASSESSMENT_ACCENT } from '../../lib/voiceSelection'
import ShadowingRunner, { type ShadowItem } from '../PronunciationPractice/ShadowingRunner'
import { HighlightedWord } from './PhonemeTile'
import { FocusSoundResultView, PractiseTooLinks, WordResultsView } from './SoundResults'

/**
 * The sheet's Pronunciation exercises, in the Wordlist practice format (play → beep → repeat → result):
 * the sound itself (said in the anchor word, only the focus sound scored), 3 words, 3 minimal pairs,
 * then the sentence. Assessed and modelled in en-US, like every Azure check.
 */
export default function SoundPronunciationTab({
  phoneme,
  practice,
  soundItemId,
}: {
  phoneme: Phoneme
  practice: PhonemePractice
  /** The drill-funnel item this sound belongs to, if any: gets the production score and the sentence's XP. */
  soundItemId?: string
}) {
  const { t } = useLanguage()
  const tts = useSpeechSynthesis('female', PRODUCTION_ASSESSMENT_ACCENT)
  const highlight = phoneme.exampleWords[0]?.highlight ?? ''

  const { items, anchorItem } = useMemo(() => {
    const speakWord = (text: string) =>
      new Promise<void>((resolve) => {
        const fallback = setTimeout(resolve, text.length * 90 + 3000)
        tts.speak(text, {
          rate: 0.9,
          onEnd: () => {
            clearTimeout(fallback)
            resolve()
          },
        })
      })
    const anchor: ShadowItem = {
      text: practice.anchorWord,
      speaker: t('sndStepSound'),
      display: (
        <span>
          /{phoneme.ipaSymbol}/{' '}
          <span className="font-normal text-muted-foreground">
            · <HighlightedWord word={practice.anchorWord} highlight={highlight} />
          </span>
        </span>
      ),
      play: async () => {
        await playSoundClip(phoneme.id).catch((err) => console.error('Sound clip failed:', err))
        await speakWord(practice.anchorWord)
      },
    }
    const list: ShadowItem[] = [
      anchor,
      ...practice.words.map((word) => ({ text: word, speaker: t('sndStepWords') })),
      ...practice.minimalPairs.map(([a, b]) => ({ text: `${a}, ${b}`, display: `${a} – ${b}`, speaker: t('sndStepPairs') })),
      // The drill item's id makes the sentence count as its Deep Check (XP), as the old production stage did.
      { text: practice.sentence, speaker: t('sndStepSentence'), checkId: soundItemId },
    ]
    return { items: list, anchorItem: anchor }
    // tts.speak is stable per accent; t changes with the UI language.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phoneme, practice, soundItemId, t])

  function renderResult(item: ShadowItem, result: PronunciationCheckResult) {
    return item === anchorItem ? (
      <FocusSoundResultView result={result} focusId={phoneme.id} />
    ) : (
      <WordResultsView result={result} targetText={item.text} />
    )
  }

  function scoreOf(item: ShadowItem, result: PronunciationCheckResult) {
    if (item !== anchorItem) return result.scores.pronunciation
    const focus = focusSoundResult(result.words[0], phoneme.id)
    return focus ? (focus.heardAs ? 0 : focus.score) : result.scores.pronunciation
  }

  function handleFinished(results: PronunciationCheckResult[]) {
    if (!soundItemId || results.length === 0) return
    const productionScore = Math.round(results.reduce((sum, r, i) => sum + scoreOf(items[i], r), 0) / results.length)
    recordPronunciationAttempt(soundItemId, { productionScore }).catch((err) =>
      console.error('Failed to record pronunciation progress', err),
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t('sndPronIntro')}</p>
      <ShadowingRunner
        items={items}
        checkId={`${SOUND_CHECK_PREFIX}${phoneme.id}`}
        renderResult={renderResult}
        scoreOf={scoreOf}
        onFinished={handleFinished}
        renderFinished={(results) => <PractiseTooLinks results={results} focusId={phoneme.id} />}
      />
    </div>
  )
}
