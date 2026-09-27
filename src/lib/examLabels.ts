import type { ExamLanguage, ExamLevel, ExamPaperMeta, ExamType } from '../data/exams/types'
import type { MessageKey } from './i18n'

type T = (key: MessageKey, vars?: Record<string, string | number>) => string

const TYPE_KEY: Record<ExamType, MessageKey> = { erettsegi: 'exTypeErettsegi', nyelvvizsga: 'exTypeNyelvvizsga' }
const TYPE_DESC_KEY: Record<ExamType, MessageKey> = { erettsegi: 'exTypeErettsegiDesc', nyelvvizsga: 'exTypeNyelvvizsgaDesc' }
const LANGUAGE_KEY: Record<ExamLanguage, MessageKey> = { en: 'exLangEn', de: 'exLangDe' }
const LEVEL_KEY: Record<ExamLevel, MessageKey> = {
  kozep: 'exLevelKozep',
  emelt: 'exLevelEmelt',
  B1: 'exLevelB1',
  B2: 'exLevelB2',
  C1: 'exLevelC1',
}

export const examTypeLabel = (t: T, type: ExamType) => t(TYPE_KEY[type])
export const examTypeDescription = (t: T, type: ExamType) => t(TYPE_DESC_KEY[type])
export const examLanguageLabel = (t: T, language: ExamLanguage) => t(LANGUAGE_KEY[language])
export const examLevelLabel = (t: T, level: ExamLevel) => t(LEVEL_KEY[level])

/** e.g. "Érettségi – Német, Középszint · 2025. május". */
export function examPaperLabel(t: T, paper: ExamPaperMeta): string {
  return t('exPaperLabel', {
    type: examTypeLabel(t, paper.type),
    lang: examLanguageLabel(t, paper.language),
    level: examLevelLabel(t, paper.level),
    sitting: paper.sittingLabelHu,
  })
}
