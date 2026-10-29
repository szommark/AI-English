import { Navigate } from 'react-router-dom'
import { getFeature } from '../data/features'
import FeatureTileGrid from '../components/FeatureTileGrid'
import { localizeFeature, useLanguage } from '../lib/i18n'

/** A group tile's page (/language-lab, /skill-development, /live-events): its sub-tiles. */
export default function FeatureGroupPage({ groupId }: { groupId: string }) {
  const { lang } = useLanguage()
  const group = getFeature(groupId)
  if (!group?.children) return <Navigate to="/" replace />
  const text = localizeFeature(lang, group)

  return (
    <div className="space-y-8 py-4">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">{text.title}</h2>
        <p className="mt-3 text-muted-foreground">{text.description}</p>
      </div>

      <FeatureTileGrid ids={group.children} />
    </div>
  )
}
