// "en or et?" (Vocabulary › Games, Danish lists only): a list's nouns one by one, and the
// learner picks the article. Pure logic, so the component only renders. Nothing is saved:
// no practice log, no XP (gamification is unchanged by Danish).
import { DA_ARTICLES, type DaArticle, type WordlistWord } from './vocab'
import { shuffle, type Rng } from './vocabGrid'

/** Nouns asked in one game (fewer when the list has fewer). */
export const ARTICLE_GAME_ROUNDS = 10
/** The fewest nouns a list needs for the game. */
export const ARTICLE_GAME_MIN_WORDS = 3

export interface ArticleRound {
  id: string
  term: string
  article: DaArticle
  meaningHu: string | null
}

/** The list's nouns with a known article, each once. */
export function articleGameWords(words: readonly WordlistWord[]): ArticleRound[] {
  const seen = new Set<string>()
  const out: ArticleRound[] = []
  for (const w of words) {
    if (w.targetLanguage !== 'da' || !w.article || !(DA_ARTICLES as readonly string[]).includes(w.article)) continue
    if (seen.has(w.term)) continue
    seen.add(w.term)
    out.push({ id: w.itemId, term: w.term, article: w.article, meaningHu: w.meaningHu })
  }
  return out
}

/** One game: up to ARTICLE_GAME_ROUNDS nouns in random order, or null below ARTICLE_GAME_MIN_WORDS. */
export function articleGame(words: readonly WordlistWord[], rng: Rng = Math.random): ArticleRound[] | null {
  const nouns = articleGameWords(words)
  if (nouns.length < ARTICLE_GAME_MIN_WORDS) return null
  return shuffle(nouns, rng).slice(0, ARTICLE_GAME_ROUNDS)
}
