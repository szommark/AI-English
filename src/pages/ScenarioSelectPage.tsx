import { Navigate, useParams } from 'react-router-dom'
import { scenarios } from '../data/scenarios'
import { categories } from '../data/categories'
import ScenarioCard from '../components/ScenarioCard'
import PageHeading from '../components/PageHeading'
import { localizeSubcategory, useLanguage } from '../lib/i18n'

export default function ScenarioSelectPage() {
  const { lang, t } = useLanguage()
  const { categoryId, subcategoryId } = useParams()

  const category = categories.find((c) => c.id === categoryId)
  const subcategory = category?.subcategories.find((s) => s.id === subcategoryId)

  if (!category || !subcategory) return <Navigate to="/conversational-english" replace />

  const filteredScenarios = scenarios.filter((s) => subcategory.scenarioIds.includes(s.id))

  return (
    <div className="space-y-6">
      <PageHeading title={localizeSubcategory(lang, subcategory)} subtitle={t('pickScenario')} />

      <div className="grid gap-6 sm:grid-cols-2">
        {filteredScenarios.map((s) => (
          <ScenarioCard key={s.id} scenario={s} />
        ))}
      </div>
    </div>
  )
}
