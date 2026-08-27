export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

export interface GrammarItem {
  id: string
  title: string
  titleHu: string
}

export interface CefrLevelGroup {
  level: CefrLevel
  label: string
  items: GrammarItem[]
}

// Fixed curriculum — same shape pattern as features.ts. Not user-editable; grammar
// content is generated on the fly per (level, item) pair (see grammarCoachApi.ts).
export const grammarCurriculum: CefrLevelGroup[] = [
  {
    level: 'A1',
    label: 'A1 — Beginner',
    items: [
      { id: 'to-be-present', title: "Verb 'to be' (am / is / are)", titleHu: "A 'to be' ige (am / is / are)" },
      { id: 'present-simple', title: 'Present Simple', titleHu: 'Egyszerű jelen idő' },
      { id: 'articles', title: 'Articles: a / an / the', titleHu: 'Névelők: a / an / the' },
      { id: 'plural-nouns', title: 'Plural Nouns', titleHu: 'Főnevek többes száma' },
      { id: 'possessive-s', title: "Possessive 's", titleHu: 'Birtokos szerkezet (\'s)' },
      { id: 'there-is-are', title: 'There is / There are', titleHu: 'There is / There are' },
    ],
  },
  {
    level: 'A2',
    label: 'A2 — Elementary',
    items: [
      { id: 'past-simple', title: 'Past Simple', titleHu: 'Egyszerű múlt idő' },
      { id: 'present-continuous', title: 'Present Continuous', titleHu: 'Folyamatos jelen idő' },
      { id: 'comparatives-superlatives', title: 'Comparatives & Superlatives', titleHu: 'Közép- és felsőfok' },
      { id: 'quantifiers', title: 'Countable & Uncountable Nouns', titleHu: 'Megszámlálható és megszámlálhatatlan főnevek' },
      { id: 'prepositions-time-place', title: 'Prepositions of Time & Place', titleHu: 'Idő- és helyhatározó elöljárószók' },
      { id: 'going-to-future', title: 'Future: going to', titleHu: "Jövő idő: going to" },
    ],
  },
  {
    level: 'B1',
    label: 'B1 — Intermediate',
    items: [
      { id: 'present-perfect-vs-past-simple', title: 'Present Perfect vs Past Simple', titleHu: 'Befejezett jelen vs. egyszerű múlt' },
      { id: 'future-forms', title: 'Future Forms (will / going to / present continuous)', titleHu: 'Jövő idő kifejezésének formái' },
      { id: 'first-conditional', title: 'First Conditional', titleHu: 'Első típusú feltételes mód' },
      { id: 'modals-obligation', title: 'Modal Verbs: must, have to, should', titleHu: 'Módbeli segédigék: must, have to, should' },
      { id: 'relative-clauses', title: 'Relative Clauses', titleHu: 'Vonatkozói mellékmondatok' },
      { id: 'passive-voice-simple', title: 'Passive Voice (simple tenses)', titleHu: 'Szenvedő szerkezet (egyszerű igeidők)' },
    ],
  },
  {
    level: 'B2',
    label: 'B2 — Upper-Intermediate',
    items: [
      { id: 'second-conditional', title: 'Second Conditional', titleHu: 'Második típusú feltételes mód' },
      { id: 'reported-speech', title: 'Reported Speech', titleHu: 'Függő beszéd' },
      { id: 'present-perfect-continuous', title: 'Present Perfect Continuous', titleHu: 'Befejezett folyamatos jelen idő' },
      { id: 'modals-deduction', title: 'Modals of Deduction', titleHu: 'Következtetést kifejező módbeli segédigék' },
      { id: 'passive-voice-all-tenses', title: 'Passive Voice (all tenses)', titleHu: 'Szenvedő szerkezet (minden igeidőben)' },
      { id: 'used-to-would', title: 'used to / would (past habits)', titleHu: 'used to / would (múltbeli szokások)' },
    ],
  },
  {
    level: 'C1',
    label: 'C1 — Advanced',
    items: [
      { id: 'third-conditional', title: 'Third & Mixed Conditionals', titleHu: 'Harmadik típusú és vegyes feltételes mód' },
      { id: 'inversion', title: 'Inversion for Emphasis', titleHu: 'Inverzió a nyomatékosítás érdekében' },
      { id: 'cleft-sentences', title: 'Cleft Sentences', titleHu: 'Kiemelő szerkezetek (cleft sentences)' },
      { id: 'subjunctive', title: 'The Subjunctive Mood', titleHu: 'Kötőmód (subjunctive)' },
      { id: 'advanced-passive', title: 'Advanced Passive Constructions', titleHu: 'Haladó szenvedő szerkezetek' },
      { id: 'nuanced-modals', title: 'Nuanced Modal Verbs', titleHu: 'Módbeli segédigék finom jelentésárnyalatai' },
    ],
  },
  {
    level: 'C2',
    label: 'C2 — Proficiency',
    items: [
      { id: 'ellipsis-substitution', title: 'Ellipsis & Substitution', titleHu: 'Ellipszis és helyettesítés' },
      { id: 'fronting', title: 'Fronting for Emphasis', titleHu: 'Kiemelő mondatrész-előrehozás' },
      { id: 'discourse-markers', title: 'Advanced Discourse Markers', titleHu: 'Haladó szövegkohéziós elemek' },
      { id: 'phrasal-verb-patterns', title: 'Idiomatic Phrasal Verb Patterns', titleHu: 'Idiomatikus szórendi igék mintázatai' },
      { id: 'hypothetical-structures', title: 'Complex Hypothetical Structures', titleHu: 'Összetett feltételezést kifejező szerkezetek' },
      { id: 'nominalization', title: 'Nominalization in Formal Register', titleHu: 'Főnevesítés a formális nyelvhasználatban' },
    ],
  },
]

export function getGrammarItem(itemId: string): { level: CefrLevel; item: GrammarItem } | undefined {
  for (const group of grammarCurriculum) {
    const item = group.items.find((i) => i.id === itemId)
    if (item) return { level: group.level, item }
  }
  return undefined
}
