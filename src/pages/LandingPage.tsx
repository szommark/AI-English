import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { features, type Feature } from '../data/features'
import FeatureTile from '../components/FeatureTile'
import { useAuthPrompt } from '../components/AppLayout'
import { useAuth } from '../lib/AuthContext'
import { useLanguage } from '../lib/i18n'
import { fetchVocabOverview } from '../lib/vocabPracticeApi'

export default function LandingPage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const { promptSignIn } = useAuthPrompt()
  const location = useLocation() as { state?: { from?: string } }
  /** Reviews due plus new words available today, for the Vocabulary tile's badge. */
  const [vocabToPractise, setVocabToPractise] = useState(0)

  useEffect(() => {
    if (!user) {
      setVocabToPractise(0)
      return
    }
    let cancelled = false
    fetchVocabOverview()
      .then((o) => !cancelled && setVocabToPractise(o.dueCount + o.newAvailable))
      // A badge is a nicety; the tile works without it.
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [user])

  // A protected route bounced an unauthenticated visitor here — ask them to sign in, then send them back.
  useEffect(() => {
    if (!user && location.state?.from) promptSignIn(location.state.from)
  }, [location.state, user, promptSignIn])

  function handleTileClickFor(feature: Feature) {
    return (e: React.MouseEvent) => {
      if (!user) {
        e.preventDefault()
        promptSignIn(feature.route)
      }
    }
  }

  return (
    <div className="space-y-8 py-4">
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--teal-accent-strong)]">
          {t('landingKicker')}
        </p>
        <h2 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
          {t('landingHeading')}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {features.map((f) => (
          <FeatureTile
            key={f.id}
            feature={f}
            onClick={handleTileClickFor(f)}
            badge={f.id === 'vocabulary' && vocabToPractise > 0 ? t('vcDueBadge', { n: vocabToPractise }) : undefined}
          />
        ))}
      </div>
    </div>
  )
}
