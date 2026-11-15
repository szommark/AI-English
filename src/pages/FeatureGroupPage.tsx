import { Navigate } from 'react-router-dom'
import { getFeature } from '../data/features'
import FeatureTileGrid from '../components/FeatureTileGrid'
import { DecoDivider } from '../components/club/Deco'
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
        <h2 className="font-brand text-4xl sm:text-5xl font-semibold text-[var(--club-green)]">{text.title}</h2>
        <DecoDivider className="mx-auto mt-4 max-w-xs" />
        <p className="mt-4 text-muted-foreground">{text.description}</p>
      </div>

      <FeatureTileGrid ids={group.children} />
    </div>
  )
}
