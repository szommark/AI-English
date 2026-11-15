import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { homeTileIds } from '../data/features'
import FeatureTileGrid from '../components/FeatureTileGrid'
import HomeGoalsCard from '../components/Goals/HomeGoalsCard'
import WelcomePanels from '../components/WelcomePanels'
import { DecoDivider } from '../components/club/Deco'
import { useAuthPrompt } from '../components/AppLayout'
import { useAuth } from '../lib/AuthContext'
import { useLanguage } from '../lib/i18n'

export default function LandingPage() {
  const { user, loading } = useAuth()
  const { t } = useLanguage()
  const { promptSignIn } = useAuthPrompt()
  const location = useLocation() as { state?: { from?: string } }

  // A protected route bounced an unauthenticated visitor here — ask them to sign in, then send them back.
  useEffect(() => {
    if (!user && location.state?.from) promptSignIn(location.state.from)
  }, [location.state, user, promptSignIn])

  // Signed-out visitors get the three welcome panels; nothing until the session is known, so a
  // signed-in user doesn't see them flash before the practice tiles.
  if (loading) return null
  if (!user) return <WelcomePanels />

  return (
    <div className="space-y-8 py-4">
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--club-gold-dark)]">
          {t('landingKicker')}
        </p>
        <h2 className="mt-2 font-brand text-4xl sm:text-5xl font-semibold text-[var(--club-green)]">
          {t('landingHeading')}
        </h2>
        <DecoDivider className="mx-auto mt-4 max-w-xs" />
      </div>

      {user && <HomeGoalsCard key={user.id} />}

      <FeatureTileGrid ids={homeTileIds} />
    </div>
  )
}
