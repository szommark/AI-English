import type { Scenario } from './types'
import { scenarioTranslationsDe } from '../data/scenarioTranslationsDe'
import type { Lang } from './i18n'

/**
 * The translation shown under a rehearsal phrase / script line: Hungarian is stored on the
 * scenario itself, German comes from a separate index-aligned table, and English learners
 * get no gloss. Returns undefined when there is nothing to show.
 */
export function phraseGloss(lang: Lang, scenario: Scenario, index: number): string | undefined {
  if (lang === 'hu') return scenario.rehearsalPhrases[index]?.hu
  if (lang === 'de') return scenarioTranslationsDe[scenario.id]?.phrases[index]
  return undefined
}

export function lineGloss(lang: Lang, scenario: Scenario, index: number): string | undefined {
  if (lang === 'hu') return scenario.rehearsalScript[index]?.lineHu
  if (lang === 'de') return scenarioTranslationsDe[scenario.id]?.script[index]
  return undefined
}
