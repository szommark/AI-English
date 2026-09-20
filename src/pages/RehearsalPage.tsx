import { useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { getScenario } from '../data/scenarios'
import { getCategoryForScenario } from '../data/categories'
import ConversationSession from '../components/ConversationSession'
import MouthBubbleLayer from '../components/SpeechBubble/MouthBubbleLayer'
import TranscriptLines from '../components/SpeechBubble/TranscriptLines'
import PracticeSentence from '../components/PracticeSentence'
import { scenarioPhotos } from '../assets/scenarioPhotos'
import { localizeCategory, localizeScenario, useLanguage, withGloss } from '../lib/i18n'
import { lineGloss, phraseGloss } from '../lib/scenarioGloss'

export default function RehearsalPage() {
  const { lang, t } = useLanguage()
  const { scenarioId } = useParams()
  const scenario = scenarioId ? getScenario(scenarioId) : undefined
  const [started, setStarted] = useState(false)
  const [revealedIndex, setRevealedIndex] = useState(0)
  const photoContainerRef = useRef<HTMLDivElement>(null)

  if (!scenario) return <Navigate to="/" replace />

  const categoryMatch = getCategoryForScenario(scenario.id)
  const photo = scenarioPhotos[scenario.id]
  const script = scenario.rehearsalScript
  const revealed = script.slice(0, revealedIndex)
  const revealedCharacterLines = revealed.filter((l) => l.speaker !== 'You')
  const revealedYouLines = revealed.filter((l) => l.speaker === 'You')
  const lastCharacterLine = revealedCharacterLines.at(-1)?.line ?? null
  const allTurns = revealed.map((l) => ({
    role: (l.speaker === 'You' ? 'user' : 'assistant') as 'user' | 'assistant',
    text: l.line,
  }))
  const isEnded = script.length > 0 && revealedIndex >= script.length

  return (
    <div className="max-w-2xl space-y-6">
        {!started ? (
          <>
            <div>
              {categoryMatch && (
                <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide">
                  {withGloss(lang, categoryMatch.category.title, localizeCategory(lang, categoryMatch.category))}
                </p>
              )}
              <h1 className="text-xl font-semibold text-slate-800">
                {withGloss(lang, scenario.title, localizeScenario(lang, scenario))}
              </h1>
              <p className="text-sm text-slate-500 mt-1">{t('rehearsalIntro')}</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
              <h2 className="font-medium text-slate-700">{t('usefulPhrases')}</h2>
              {scenario.rehearsalPhrases.map((p, i) => (
                <PracticeSentence key={i} en={p.en} gloss={phraseGloss(lang, scenario, i)} scenarioId={scenario.id} />
              ))}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
              <h2 className="font-medium text-slate-700">{t('sampleConversation')}</h2>

              {photo && (
                <div ref={photoContainerRef} className="relative mx-auto w-full max-w-xs">
                  <img
                    src={photo}
                    alt={scenario.title}
                    className="block h-auto w-full rounded-2xl shadow-sm"
                  />
                  <MouthBubbleLayer
                    containerRef={photoContainerRef}
                    mouth={scenario.mouth}
                    latestText={lastCharacterLine}
                    messageKey={revealedCharacterLines.length}
                    allTurns={allTurns}
                    isEnded={isEnded}
                  />
                </div>
              )}

              {/* On desktop, "You" lines now appear as bubbles on the photo too. */}
              <div className="md:hidden space-y-2 text-sm">
                {revealedYouLines.map((line, i) => (
                  <p key={i}>
                    <span className="font-medium text-slate-700">{line.speaker}: </span>
                    <span className="text-slate-600">{line.line}</span>
                  </p>
                ))}
              </div>

              {/* z-10 keeps the Next button clickable above the live bubble exchange. */}
              <div className="relative z-10">
                {revealedIndex < script.length ? (
                  <button
                    onClick={() => setRevealedIndex((i) => i + 1)}
                    className="rounded-lg border border-indigo-600 text-indigo-600 text-sm px-4 py-2 hover:bg-indigo-50"
                  >
                    {t('next')}
                  </button>
                ) : (
                  <p className="text-xs text-slate-400">{t('sampleEnded')}</p>
                )}
              </div>

              {/* Desktop: once the sample script ends, bubbles stop and the full transcript shows here instead. */}
              {isEnded && <TranscriptLines turns={allTurns} aiLabel={scenario.aiRole} className="hidden md:block" />}
            </div>

            <button
              onClick={() => setStarted(true)}
              className="relative z-10 w-full rounded-lg bg-indigo-600 text-white py-2.5 text-sm font-medium hover:bg-indigo-700"
            >
              {t('startMyTry')}
            </button>

            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
              <div>
                <h2 className="font-medium text-slate-700">{t('practiceConversation')}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{t('practiceConversationHint')}</p>
              </div>
              {script.map((line, i) => (
                <PracticeSentence
                  key={i}
                  en={line.line}
                  gloss={lineGloss(lang, scenario, i)}
                  scenarioId={scenario.id}
                  speakerLabel={line.speaker}
                />
              ))}
            </div>

            <Link
              to={`/scenario/${scenario.id}/pronunciation`}
              className="block w-full text-center rounded-lg border border-indigo-600 text-indigo-600 text-sm font-medium py-2.5 hover:bg-indigo-50"
            >
              {t('pronCentreLink')}
            </Link>
          </>
        ) : (
          <ConversationSession scenario={scenario} mode="rehearsal" />
        )}
    </div>
  )
}
