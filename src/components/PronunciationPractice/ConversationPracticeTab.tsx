import { useState } from 'react'
import { categories } from '../../data/categories'
import { getScenario, scenarios } from '../../data/scenarios'
import { localizeCategory, localizeScenario, useLanguage } from '../../lib/i18n'
import type { Scenario } from '../../lib/types'
import ShadowingRunner, { type ShadowItem } from './ShadowingRunner'

const LEARNER_SPEAKER = 'You'

const hasLearnerLines = (s: Scenario) => s.rehearsalScript.some((l) => l.speaker === LEARNER_SPEAKER)

/** The Conversation practice tab of /pronunciation: a scenario's dialogue, the learner repeating their own lines. */
export default function ConversationPracticeTab() {
  const { t, lang } = useLanguage()
  const [scenarioId, setScenarioId] = useState('')
  const scenario = scenarioId ? getScenario(scenarioId) : undefined

  const grouped = categories
    .map((category) => ({
      category,
      scenarios: category.subcategories
        .flatMap((sub) => sub.scenarioIds)
        .map((id) => getScenario(id))
        .filter((s): s is Scenario => Boolean(s && hasLearnerLines(s))),
    }))
    .filter((g) => g.scenarios.length > 0)
  const groupedIds = new Set(grouped.flatMap((g) => g.scenarios.map((s) => s.id)))
  const ungrouped = scenarios.filter((s) => !groupedIds.has(s.id) && hasLearnerLines(s))

  const items: ShadowItem[] = (scenario?.rehearsalScript ?? []).map((line) => {
    const learner = line.speaker === LEARNER_SPEAKER
    return {
      text: line.line,
      gloss: lang === 'hu' ? line.lineHu : null,
      speaker: learner ? t('pronYou') : line.speaker,
      listenOnly: !learner,
    }
  })

  return (
    <div className="max-w-4xl space-y-5">
      <select
        value={scenarioId}
        onChange={(e) => setScenarioId(e.target.value)}
        aria-label={t('pronPickConversation')}
        className="min-w-0 max-w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
      >
        <option value="">{t('pronPickConversation')}</option>
        {grouped.map(({ category, scenarios: list }) => (
          <optgroup key={category.id} label={localizeCategory(lang, category)}>
            {list.map((s) => (
              <option key={s.id} value={s.id}>
                {localizeScenario(lang, s)}
              </option>
            ))}
          </optgroup>
        ))}
        {ungrouped.map((s) => (
          <option key={s.id} value={s.id}>
            {localizeScenario(lang, s)}
          </option>
        ))}
      </select>

      {scenario && (
        <ShadowingRunner
          key={scenario.id}
          items={items}
          checkId={scenario.id}
          partnerGender={scenario.voiceGender}
          modelGender={scenario.voiceGender === 'female' ? 'male' : 'female'}
        />
      )}
    </div>
  )
}
