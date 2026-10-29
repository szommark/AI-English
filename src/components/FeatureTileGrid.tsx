import { useEffect, useState } from 'react'
import { getFeature, getParentGroup, type Feature } from '../data/features'
import FeatureTile from './FeatureTile'
import { useAuthPrompt } from './AppLayout'
import { useAuth } from '../lib/AuthContext'
import { useLanguage } from '../lib/i18n'
import { fetchVocabOverview } from '../lib/vocabPracticeApi'

/**
 * A grid of feature tiles (the home page and each group page). Signed-out visitors are asked
 * to sign in instead of following a tile; group tiles stay open so they can look around.
 */
export default function FeatureTileGrid({ ids }: { ids: string[] }) {
  const { user } = useAuth()
  const { t } = useLanguage()
  const { promptSignIn } = useAuthPrompt()
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

  function handleTileClickFor(feature: Feature) {
    return (e: React.MouseEvent) => {
      if (!user && !feature.children) {
        e.preventDefault()
        promptSignIn(feature.route)
      }
    }
  }

  // The badge shows on the Vocabulary tile and on the group tile that holds it.
  const vocabBadgeIds = ['vocabulary', getParentGroup('vocabulary')?.id]
  const tiles = ids.map(getFeature).filter((f): f is Feature => !!f)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
      {tiles.map((f) => (
        <FeatureTile
          key={f.id}
          feature={f}
          onClick={handleTileClickFor(f)}
          badge={vocabBadgeIds.includes(f.id) && vocabToPractise > 0 ? t('vcDueBadge', { n: vocabToPractise }) : undefined}
        />
      ))}
    </div>
  )
}
