import { grammarCurriculum, type CefrLevel, type GrammarCategory, type GrammarItem } from '../data/grammarCurriculum'
import type { Lang } from './i18n'

// Human-readable category names, searchable in every UI language (a Hungarian learner
// may still type the English term they saw in class, so all three are always indexed).
export const grammarCategoryLabels: Record<GrammarCategory, Record<Lang, string>> = {
  tense_aspect: { hu: 'Igeidők', en: 'Tenses', de: 'Zeitformen' },
  conditionals: { hu: 'Feltételes mód', en: 'Conditionals', de: 'Konditionalsätze' },
  modals: { hu: 'Módbeli segédigék', en: 'Modal verbs', de: 'Modalverben' },
  articles: { hu: 'Névelők', en: 'Articles', de: 'Artikel' },
  prepositions: { hu: 'Elöljárószók', en: 'Prepositions', de: 'Präpositionen' },
  passive_voice: { hu: 'Szenvedő szerkezet', en: 'Passive voice', de: 'Passiv' },
  relative_clauses: { hu: 'Vonatkozó mellékmondatok', en: 'Relative clauses', de: 'Relativsätze' },
  comparatives: { hu: 'Fokozás', en: 'Comparatives and superlatives', de: 'Steigerung' },
  question_formation: { hu: 'Kérdésképzés', en: 'Questions', de: 'Fragebildung' },
  reported_speech: { hu: 'Függő beszéd', en: 'Reported speech', de: 'Indirekte Rede' },
  basic_structures: { hu: 'Alapszerkezetek', en: 'Basic structures', de: 'Grundstrukturen' },
  pronouns_determiners: { hu: 'Névmások és determinánsok', en: 'Pronouns and determiners', de: 'Pronomen und Begleiter' },
  nouns_quantifiers: { hu: 'Főnevek és mennyiségjelzők', en: 'Nouns and quantifiers', de: 'Nomen und Mengenangaben' },
  verb_patterns: { hu: 'Igei szerkezetek', en: 'Verb patterns', de: 'Verbmuster' },
  adverbs_adjectives: { hu: 'Határozószók és melléknevek', en: 'Adverbs and adjectives', de: 'Adverbien und Adjektive' },
  phrasal_verbs: { hu: 'Vonzatos igék (phrasal verbs)', en: 'Phrasal verbs', de: 'Phrasal Verbs' },
  linking_cohesion: { hu: 'Kötőszavak', en: 'Linking words', de: 'Bindewörter' },
  emphasis_structures: { hu: 'Nyomatékosítás', en: 'Emphasis', de: 'Hervorhebung' },
  auxiliary_verbs: { hu: 'Segédigék', en: 'Auxiliary verbs', de: 'Hilfsverben' },
  word_formation: { hu: 'Szóképzés', en: 'Word formation', de: 'Wortbildung' },
}

/** Lowercase, accent-free, single-spaced — so "mult ido" finds "múlt idő". */
export function normalizeSearchText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

interface IndexedItem {
  level: CefrLevel
  item: GrammarItem
  title: string
  titleHu: string
  /** Everything a query word may match: titles, category labels, level. */
  haystack: string
}

const index: IndexedItem[] = grammarCurriculum.flatMap((group) =>
  group.items.map((item) => {
    const title = normalizeSearchText(item.title)
    const titleHu = normalizeSearchText(item.titleHu)
    const categories = Object.values(grammarCategoryLabels[item.category]).map(normalizeSearchText)
    return {
      level: group.level,
      item,
      title,
      titleHu,
      haystack: [title, titleHu, ...categories, group.level.toLowerCase()].join(' | '),
    }
  }),
)

function titleScore(title: string, words: string[]): number {
  if (words.every((w) => title.startsWith(w) || title.includes(` ${w}`))) {
    return title.startsWith(words[0]) ? 3 : 2
  }
  return words.every((w) => title.includes(w)) ? 1 : 0
}

export interface GrammarSearchGroup {
  level: CefrLevel
  items: GrammarItem[]
}

/**
 * Filters the curriculum by a free-text query. Every query word must appear somewhere
 * (title in any language, category label or level). Within a level, title matches
 * rank above category-only matches; ties keep the teaching order.
 */
export function searchGrammar(query: string): GrammarSearchGroup[] {
  const words = normalizeSearchText(query).split(' ').filter(Boolean)
  if (words.length === 0) return []

  const byLevel = new Map<CefrLevel, { item: GrammarItem; score: number }[]>()
  for (const entry of index) {
    if (!words.every((w) => entry.haystack.includes(w))) continue
    const score = Math.max(titleScore(entry.title, words), titleScore(entry.titleHu, words))
    const bucket = byLevel.get(entry.level) ?? []
    bucket.push({ item: entry.item, score })
    byLevel.set(entry.level, bucket)
  }

  return grammarCurriculum
    .filter((group) => byLevel.has(group.level))
    .map((group) => ({
      level: group.level,
      items: byLevel
        .get(group.level)!
        .sort((a, b) => b.score - a.score || a.item.order - b.item.order)
        .map((r) => r.item),
    }))
}

/**
 * Splits `text` into plain/highlighted runs for the query words, matching accent-
 * insensitively while returning slices of the original (accented) text.
 */
export function highlightMatches(text: string, query: string): { text: string; match: boolean }[] {
  const words = normalizeSearchText(query).split(' ').filter(Boolean)
  if (words.length === 0) return [{ text, match: false }]

  // Map each normalized char back to its original index (NFD may drop combining marks).
  let normalized = ''
  const origIndex: number[] = []
  for (let i = 0; i < text.length; i++) {
    const n = normalizeSearchText(text[i]) || (/\s/.test(text[i]) ? ' ' : '')
    for (const ch of n) {
      normalized += ch
      origIndex.push(i)
    }
  }

  const marked = new Array<boolean>(text.length).fill(false)
  for (const word of words) {
    let from = normalized.indexOf(word)
    while (from !== -1) {
      for (let k = from; k < from + word.length; k++) marked[origIndex[k]] = true
      from = normalized.indexOf(word, from + word.length)
    }
  }

  const runs: { text: string; match: boolean }[] = []
  for (let i = 0; i < text.length; i++) {
    const last = runs[runs.length - 1]
    if (last && last.match === marked[i]) last.text += text[i]
    else runs.push({ text: text[i], match: marked[i] })
  }
  return runs
}
