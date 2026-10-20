// Web sources for the exam task maker's source finder (api/_lib/sourceFinder.ts), shared by the
// API and the creation wizard.

export type SourceProvider = 'govuk' | 'govuk-blog' | 'guardian'

export interface SourceCandidate {
  title: string
  url: string
  /** Department, blog or byline. */
  publisher: string
  /** ISO timestamp. */
  date: string
  provider: SourceProvider
  /** The full text, paragraphs separated by blank lines (the Guardian's bodyText has none). */
  text: string
  wordCount: number
  /** Numbers, percentages and amounts in the text: fine for True/False (they stay as spoken), a concern for notes. */
  figures: number
  /** Field vocabulary as used in the text, grouped by category (empty when the analysis failed). */
  vocabulary: { category: string; terms: string[] }[]
  /** Environment / environmental-protection topic → True/False only (keyword check or the model). */
  environmental: boolean
  formatNote: string
  /** The model's estimate of distinct testable facts. */
  usableFacts: number | null
  /** Too few facts for the items plus a margin, or too little text. */
  thin: boolean
  topicFit: 'good' | 'partial' | 'off' | null
}

export interface SkippedSource {
  title: string
  url: string
  reason: 'fetch_failed' | 'summary_only'
}

export interface SourceSearchResult {
  sources: SourceCandidate[]
  skipped: SkippedSource[]
  /** False when GUARDIAN_API_KEY isn't set (GOV.UK only). */
  guardian: boolean
  /** False when the vocabulary analysis call failed. */
  analysed: boolean
}
