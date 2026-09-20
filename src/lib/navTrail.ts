import { matchPath } from 'react-router-dom'
import { categories, getCategory, getCategoryForScenario } from '../data/categories'
import { getFeature } from '../data/features'
import { getPhoneme } from '../data/phonemes'
import { getScenario } from '../data/scenarios'
import { localizeCategory, localizeFeature, localizeScenario, localizeSubcategory, type Lang, type MessageKey } from './i18n'

export interface Crumb {
  label: string
  /** Omitted for the current page. */
  to?: string
}

type T = (key: MessageKey) => string

/**
 * Single source of truth for the navigation trail shown under the "Back to home" button.
 * Every level of the multi-level sections (Conversational English, Pronunciation) is listed
 * so the user can jump to any ancestor page from anywhere.
 */
export function buildTrail(pathname: string, lang: Lang, t: T): Crumb[] {
  const path = pathname.replace(/\/+$/, '') || '/'
  const at = (pattern: string) => matchPath({ path: pattern, end: true }, path)

  const conversational: Crumb = { label: t('crumbConversational'), to: '/conversational-english' }

  /** Conversational English › category › subcategory, all linked. */
  function scenarioTrail(scenarioId: string): Crumb[] {
    const match = getCategoryForScenario(scenarioId)
    if (!match) return [conversational]
    return [
      conversational,
      { label: localizeCategory(lang, match.category), to: `/conversational-english/${match.category.id}` },
      {
        label: localizeSubcategory(lang, match.subcategory),
        to: `/conversational-english/${match.category.id}/${match.subcategory.id}`,
      },
    ]
  }

  /** Marks the last crumb as the current page. */
  const finish = (crumbs: Crumb[]): Crumb[] =>
    crumbs.map((c, i) => (i === crumbs.length - 1 ? { label: c.label } : c))

  let m

  if (path === '/') return []

  if (at('/conversational-english')) return finish([conversational])

  if ((m = at('/conversational-english/:categoryId'))) {
    const category = categories.find((c) => c.id === m!.params.categoryId)
    return finish(category ? [conversational, { label: localizeCategory(lang, category) }] : [conversational])
  }

  if ((m = at('/conversational-english/:categoryId/:subcategoryId'))) {
    const category = categories.find((c) => c.id === m!.params.categoryId)
    const sub = category?.subcategories.find((s) => s.id === m!.params.subcategoryId)
    if (!category || !sub) return finish([conversational])
    return finish([
      conversational,
      { label: localizeCategory(lang, category), to: `/conversational-english/${category.id}` },
      { label: localizeSubcategory(lang, sub) },
    ])
  }

  if ((m = at('/scenario/:scenarioId/:mode'))) {
    const scenario = getScenario(m.params.scenarioId!)
    if (!scenario) return []
    const base = scenarioTrail(scenario.id)
    const scenarioLabel = localizeScenario(lang, scenario)
    const rehearsal = `/scenario/${scenario.id}/rehearsal`
    switch (m.params.mode) {
      case 'rehearsal':
        return finish([...base, { label: scenarioLabel }])
      case 'pronunciation':
        return finish([...base, { label: scenarioLabel, to: rehearsal }, { label: t('crumbPronunciationCentre') }])
      case 'test':
        return finish([...base, { label: scenarioLabel, to: rehearsal }, { label: t('crumbTest') }])
    }
    return []
  }

  if ((m = at('/coming-soon/:featureId'))) {
    const feature = getFeature(m.params.featureId!)
    if (feature) return finish([{ label: localizeFeature(lang, feature).title }])
    const category = getCategory(m.params.featureId!)
    if (category) return finish([conversational, { label: localizeCategory(lang, category) }])
    return []
  }

  if (at('/tutor-bot')) return finish([{ label: localizeFeatureById('tutor-bot', lang) }])
  if (at('/grammar-coach')) return finish([{ label: localizeFeatureById('grammar-coach', lang) }])

  const pronunciationRoot: Crumb = { label: t('crumbPronunciation'), to: '/pronunciation' }
  if (at('/pronunciation')) return finish([pronunciationRoot])
  if ((m = at('/pronunciation/sounds/:phonemeId'))) {
    const phoneme = getPhoneme(m.params.phonemeId!)
    return finish([pronunciationRoot, { label: phoneme ? `/${phoneme.ipaSymbol}/` : m.params.phonemeId! }])
  }

  if (at('/settings/voice')) return finish([{ label: t('voiceSettings') }])
  if (at('/settings/teacher')) return finish([{ label: t('connectTeacher') }])

  const teacher: Crumb = { label: t('teacherDashboard'), to: '/teacher' }
  if (at('/teacher')) return finish([teacher])
  if (at('/teacher/students/:studentId')) return finish([teacher, { label: t('crumbStudent') }])

  const admin: Crumb = { label: t('admin'), to: '/admin' }
  if (at('/admin')) return finish([admin])
  if (at('/admin/personas')) return finish([admin, { label: t('crumbPersonas') }])
  if (at('/admin/usage')) return finish([admin, { label: t('crumbUsage') }])

  return []
}

function localizeFeatureById(id: string, lang: Lang): string {
  const feature = getFeature(id)
  return feature ? localizeFeature(lang, feature).title : id
}
