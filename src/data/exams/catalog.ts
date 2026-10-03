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
  { id: 'erettsegi-en-kozep-2025-oktober', type: 'erettsegi', language: 'en', level: 'kozep', sittingLabelHu: '2025. október' },
  { id: 'erettsegi-en-kozep-2026-majus', type: 'erettsegi', language: 'en', level: 'kozep', sittingLabelHu: '2026. május' },
  { id: 'erettsegi-en-kozep-2025-majus', type: 'erettsegi', language: 'en', level: 'kozep', sittingLabelHu: '2025. május' },
  { id: 'erettsegi-en-kozep-2024-oktober', type: 'erettsegi', language: 'en', level: 'kozep', sittingLabelHu: '2024. október' },
  { id: 'erettsegi-en-kozep-2024-majus', type: 'erettsegi', language: 'en', level: 'kozep', sittingLabelHu: '2024. május' },
  { id: 'erettsegi-en-kozep-2023-oktober', type: 'erettsegi', language: 'en', level: 'kozep', sittingLabelHu: '2023. október' },
  { id: 'erettsegi-en-kozep-2023-majus', type: 'erettsegi', language: 'en', level: 'kozep', sittingLabelHu: '2023. május' },
  { id: 'erettsegi-en-kozep-2022-oktober', type: 'erettsegi', language: 'en', level: 'kozep', sittingLabelHu: '2022. október' },
  { id: 'erettsegi-en-kozep-2022-majus', type: 'erettsegi', language: 'en', level: 'kozep', sittingLabelHu: '2022. május' },
  { id: 'erettsegi-en-kozep-2021-oktober', type: 'erettsegi', language: 'en', level: 'kozep', sittingLabelHu: '2021. október' },
  { id: 'erettsegi-en-kozep-2021-majus', type: 'erettsegi', language: 'en', level: 'kozep', sittingLabelHu: '2021. május' },
  { id: 'erettsegi-de-kozep-2026-majus', type: 'erettsegi', language: 'de', level: 'kozep', sittingLabelHu: '2026. május' },
  { id: 'erettsegi-de-kozep-2025-oktober', type: 'erettsegi', language: 'de', level: 'kozep', sittingLabelHu: '2025. október' },
  { id: 'erettsegi-de-kozep-2024-oktober', type: 'erettsegi', language: 'de', level: 'kozep', sittingLabelHu: '2024. október' },
  { id: 'erettsegi-de-kozep-2024-majus', type: 'erettsegi', language: 'de', level: 'kozep', sittingLabelHu: '2024. május' },
  { id: 'erettsegi-de-kozep-2023-oktober', type: 'erettsegi', language: 'de', level: 'kozep', sittingLabelHu: '2023. október' },
  { id: 'erettsegi-de-kozep-2023-majus', type: 'erettsegi', language: 'de', level: 'kozep', sittingLabelHu: '2023. május' },
  { id: 'erettsegi-de-kozep-2022-oktober', type: 'erettsegi', language: 'de', level: 'kozep', sittingLabelHu: '2022. október' },
  { id: 'erettsegi-de-kozep-2022-majus', type: 'erettsegi', language: 'de', level: 'kozep', sittingLabelHu: '2022. május' },
  { id: 'erettsegi-de-kozep-2021-oktober', type: 'erettsegi', language: 'de', level: 'kozep', sittingLabelHu: '2021. október' },
  { id: 'erettsegi-de-kozep-2021-majus', type: 'erettsegi', language: 'de', level: 'kozep', sittingLabelHu: '2021. május' },
  { id: 'nyelvvizsga-en-b1-minta-01', type: 'nyelvvizsga', language: 'en', level: 'B1', sittingLabelHu: 'Minta 1.' },
]

const loaders: Record<string, () => Promise<{ default: ExamPaper }>> = {
  'erettsegi-de-kozep-2025-majus': () => import('./papers/erettsegi-de-kozep-2025-majus.ts'),
  'erettsegi-en-kozep-2025-oktober': () => import('./papers/erettsegi-en-kozep-2025-oktober.ts'),
  'erettsegi-en-kozep-2026-majus': () => import('./papers/erettsegi-en-kozep-2026-majus.ts'),
  'erettsegi-en-kozep-2025-majus': () => import('./papers/erettsegi-en-kozep-2025-majus.ts'),
  'erettsegi-en-kozep-2024-oktober': () => import('./papers/erettsegi-en-kozep-2024-oktober.ts'),
  'erettsegi-en-kozep-2024-majus': () => import('./papers/erettsegi-en-kozep-2024-majus.ts'),
  'erettsegi-en-kozep-2023-oktober': () => import('./papers/erettsegi-en-kozep-2023-oktober.ts'),
  'erettsegi-en-kozep-2023-majus': () => import('./papers/erettsegi-en-kozep-2023-majus.ts'),
  'erettsegi-en-kozep-2022-oktober': () => import('./papers/erettsegi-en-kozep-2022-oktober.ts'),
  'erettsegi-en-kozep-2022-majus': () => import('./papers/erettsegi-en-kozep-2022-majus.ts'),
  'erettsegi-en-kozep-2021-oktober': () => import('./papers/erettsegi-en-kozep-2021-oktober.ts'),
  'erettsegi-en-kozep-2021-majus': () => import('./papers/erettsegi-en-kozep-2021-majus.ts'),
  'erettsegi-de-kozep-2026-majus': () => import('./papers/erettsegi-de-kozep-2026-majus.ts'),
  'erettsegi-de-kozep-2025-oktober': () => import('./papers/erettsegi-de-kozep-2025-oktober.ts'),
  'erettsegi-de-kozep-2024-oktober': () => import('./papers/erettsegi-de-kozep-2024-oktober.ts'),
  'erettsegi-de-kozep-2024-majus': () => import('./papers/erettsegi-de-kozep-2024-majus.ts'),
  'erettsegi-de-kozep-2023-oktober': () => import('./papers/erettsegi-de-kozep-2023-oktober.ts'),
  'erettsegi-de-kozep-2023-majus': () => import('./papers/erettsegi-de-kozep-2023-majus.ts'),
  'erettsegi-de-kozep-2022-oktober': () => import('./papers/erettsegi-de-kozep-2022-oktober.ts'),
  'erettsegi-de-kozep-2022-majus': () => import('./papers/erettsegi-de-kozep-2022-majus.ts'),
  'erettsegi-de-kozep-2021-oktober': () => import('./papers/erettsegi-de-kozep-2021-oktober.ts'),
  'erettsegi-de-kozep-2021-majus': () => import('./papers/erettsegi-de-kozep-2021-majus.ts'),
  'nyelvvizsga-en-b1-minta-01': () => import('./papers/nyelvvizsga-en-b1-minta-01.ts'),
}

/** Sort key: year*100 + month, so 2026 május sorts after 2025 október. Samples without a year sort last. */
function sittingOrder(p: ExamPaperMeta): number {
  const year = Number(p.sittingLabelHu.match(/^([0-9]{4})/)?.[1] ?? 0)
  const month = p.sittingLabelHu.includes('október') ? 10 : p.sittingLabelHu.includes('május') ? 5 : 0
  return year * 100 + month
}

export const examCatalog: ExamCell[] = EXAM_TYPES.flatMap((type) =>
  EXAM_LANGUAGES.flatMap((language) =>
    LEVELS_BY_TYPE[type].map((level) => ({
      type,
      language,
      level,
      paperIds: examPapers
        .filter((p) => p.type === type && p.language === language && p.level === level)
        .sort((a, b) => sittingOrder(b) - sittingOrder(a))
        .map((p) => p.id),
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
