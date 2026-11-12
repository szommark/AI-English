import { Brain, Target } from 'lucide-react'
import { useLanguage } from '../../lib/i18n'
import { ToolTileGrid, type ToolTile } from './TeacherToolsTab'

const COACH_TOOLS: ToolTile[] = [
  { key: 'goals', to: '/teacher/tools/goals', icon: Target, title: 'ttGoalsTitle', desc: 'ttGoalsDesc' },
  // Not built yet: shown as "coming soon" until it gets a page.
  { key: 'mindset', icon: Brain, title: 'lcMindsetTitle', desc: 'lcMindsetDesc' },
]

/** Language Coach (the Coach tab of /teacher): coaching tools for working with a student. Teacher role only. */
export default function LanguageCoachTab() {
  const { t } = useLanguage()

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">{t('lcSubtitle')}</p>
      <ToolTileGrid tiles={COACH_TOOLS} />
    </div>
  )
}
