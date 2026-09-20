import { Navigate, useParams } from 'react-router-dom'
import { getScenario } from '../data/scenarios'
import PracticeSentence from '../components/PracticeSentence'
import { getCategoryForScenario } from '../data/categories'
import { localizeCategory, localizeScenario, useLanguage } from '../lib/i18n'
import { phraseGloss } from '../lib/scenarioGloss'

export default function PronunciationCenterPage() {
  const { scenarioId } = useParams()
  const { lang, t } = useLanguage()
  const scenario = scenarioId ? getScenario(scenarioId) : undefined

  if (!scenario) return <Navigate to="/" replace />

  const categoryMatch = getCategoryForScenario(scenario.id)

  return (
    <div className="max-w-2xl space-y-6">
        <div>
          <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide">
            {categoryMatch && `${localizeCategory(lang, categoryMatch.category)} · `}
            {localizeScenario(lang, scenario)}
          </p>
          <h1 className="text-xl font-semibold text-slate-800">{t('pronCentreTitle')}</h1>
          <p className="text-sm text-slate-500 mt-1">{t('pronCentreIntro')}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          {scenario.rehearsalPhrases.map((p, i) => (
            <PracticeSentence key={i} en={p.en} gloss={phraseGloss(lang, scenario, i)} scenarioId={scenario.id} showDeepCheck />
          ))}
        </div>
    </div>
  )
}
