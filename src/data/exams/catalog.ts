// The Exam Prep matrix: every exam type × language × level the tile promises, with the
// papers each cell has so far (an empty list shows as "Hamarosan"). Paper content is
// loaded on demand, so the picker and the breadcrumb only need the metadata here.
import type { ExamLanguage, ExamLevel, ExamPaper, ExamPaperMeta, ExamType } from './types'

export interface ExamCell {
  type: ExamType
  language: ExamLanguage
  level: ExamLevel
  paperIds: string[]
}

export const EXAM_TYPES: ExamType[] = ['erettsegi', 'nyelvvizsga']
export const EXAM_LANGUAGES: ExamLanguage[] = ['en', 'de']
export const LEVELS_BY_TYPE: Record<ExamType, ExamLevel[]> = {
  erettsegi: ['kozep', 'emelt'],
  nyelvvizsga: ['B1', 'B2', 'C1'],
}

export const LEVEL_LABEL_HU: Record<ExamLevel, string> = {
  kozep: 'Középszint',
  emelt: 'Emelt szint',
  B1: 'B1 (alapfok)',
  B2: 'B2 (középfok)',
  C1: 'C1 (felsőfok)',
}

export const examPapers: ExamPaperMeta[] = [
  { id: 'erettsegi-de-kozep-2025-majus', type: 'erettsegi', language: 'de', level: 'kozep', sittingLabelHu: '2025. május' },
  { id: 'nyelvvizsga-en-b1-minta-01', type: 'nyelvvizsga', language: 'en', level: 'B1', sittingLabelHu: 'Minta 1.' },
]

const loaders: Record<string, () => Promise<{ default: ExamPaper }>> = {
  'erettsegi-de-kozep-2025-majus': () => import('./papers/erettsegi-de-kozep-2025-majus.ts'),
  'nyelvvizsga-en-b1-minta-01': () => import('./papers/nyelvvizsga-en-b1-minta-01.ts'),
}

export const examCatalog: ExamCell[] = EXAM_TYPES.flatMap((type) =>
  EXAM_LANGUAGES.flatMap((language) =>
    LEVELS_BY_TYPE[type].map((level) => ({
      type,
      language,
      level,
      paperIds: examPapers.filter((p) => p.type === type && p.language === language && p.level === level).map((p) => p.id),
    })),
  ),
)

export function getExamPaperMeta(id: string): ExamPaperMeta | undefined {
  return examPapers.find((p) => p.id === id)
}

export async function loadExamPaper(id: string): Promise<ExamPaper> {
  const load = loaders[id]
  if (!load) throw new Error(`Unknown exam paper ${id}`)
  return (await load()).default
}

/** For the integrity check, which runs outside Vite. */
export const examPaperLoaders = loaders
