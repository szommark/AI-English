import { Link } from 'react-router-dom'
import type { Scenario } from '../lib/types'
import { scenarioPhotos } from '../assets/scenarioPhotos'
import PlaceholderTileArt from './PlaceholderTileArt'
import { localizeScenario, useLanguage } from '../lib/i18n'

export default function ScenarioCard({ scenario }: { scenario: Scenario }) {
  const { lang, t } = useLanguage()
  const title = localizeScenario(lang, scenario)
  const photo = scenarioPhotos[scenario.id]

  return (
    <div className="group rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300 hover:shadow-[var(--shadow-card)] hover:-translate-y-1">
      <div className="h-44 overflow-hidden">
        {photo ? (
          <img
            src={photo}
            alt={title}
            className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <PlaceholderTileArt seed={scenario.title} />
        )}
      </div>

      <div className="p-5">
        <h2 className="font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{scenario.description}</p>
        <div className="mt-4 flex gap-2">
          <Link
            to={`/scenario/${scenario.id}/rehearsal`}
            className="flex-1 text-center rounded-lg border border-primary text-primary text-sm py-2 hover:bg-secondary"
          >
            {t('rehearsal')}
          </Link>
          <Link
            to={`/scenario/${scenario.id}/test`}
            className="flex-1 text-center rounded-lg bg-[var(--teal-accent)] text-primary font-semibold text-sm py-2 hover:bg-[var(--teal-accent-strong)]"
          >
            {t('testMode')}
          </Link>
        </div>
      </div>
    </div>
  )
}
