export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

export const GRAMMAR_LEVELS: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

// The first ten mirror the parent-brand Grammar Test taxonomy so the two can be aligned later.
export const GRAMMAR_CATEGORIES = [
  'tense_aspect',
  'conditionals',
  'modals',
  'articles',
  'prepositions',
  'passive_voice',
  'relative_clauses',
  'comparatives',
  'question_formation',
  'reported_speech',
  'basic_structures',
  'pronouns_determiners',
  'nouns_quantifiers',
  'verb_patterns',
  'adverbs_adjectives',
  'phrasal_verbs',
  'linking_cohesion',
  'emphasis_structures',
  'auxiliary_verbs',
  'word_formation',
] as const

export type GrammarCategory = (typeof GRAMMAR_CATEGORIES)[number]

// Maintainer metadata only — never rendered in the UI or sent to the LLM.
export type GrammarSource = 'chart' | 'roadmap' | 'chart+roadmap' | 'added'

export interface GrammarItem {
  id: string
  /** 1-based position within its level (suggested teaching order). */
  order: number
  title: string
  titleHu: string
  category: GrammarCategory
  source: GrammarSource
  /** Hungarian-learner focus for the lesson prompt; never shown in the UI. */
  hint?: string
}

export interface CefrLevelGroup {
  level: CefrLevel
  label: string
  items: GrammarItem[]
}

// Fixed curriculum — same shape pattern as features.ts. Not user-editable; grammar
// content is generated on the fly per (level, item) pair (see grammarCoachApi.ts).
// Integrity is enforced by scripts/check-grammar-points.ts (npm run check:grammar).
export const grammarCurriculum: CefrLevelGroup[] = [
  {
    level: 'A1',
    label: "A1 — Beginner",
    items: [
      { id: "a1-be-verb", order: 1, title: "To be: am, is, are", titleHu: "A létige (to be): am, is, are", category: 'basic_structures', source: 'chart', hint: "Hungarian drops the copula in the 3rd person present (Ő tanár), so learners omit is/are." },
      { id: "a1-subject-pronouns", order: 2, title: "Subject pronouns: I, you, he, she, it, we, they", titleHu: "Személyes névmások alanyesetben", category: 'pronouns_determiners', source: 'chart', hint: "Hungarian is pro-drop (Dolgozom = I work), so learners omit subjects; English also needs dummy it/there." },
      { id: "a1-demonstratives", order: 3, title: "This, that, these, those", titleHu: "Mutató névmások: this, that, these, those", category: 'pronouns_determiners', source: 'added' },
      { id: "a1-possessive-adjectives", order: 4, title: "Possessive adjectives: my, your, his, her…", titleHu: "Melléknévi birtokos névmások: my, your…", category: 'pronouns_determiners', source: 'chart' },
      { id: "a1-plural-nouns", order: 5, title: "Singular and plural nouns", titleHu: "Főnevek egyes és többes száma", category: 'nouns_quantifiers', source: 'chart', hint: "Hungarian nouns stay singular after numerals (három könyv), so learners say 'three book'." },
      { id: "a1-have-got", order: 6, title: "Have got / has got", titleHu: "Have got / has got (birtoklás)", category: 'basic_structures', source: 'added' },
      { id: "a1-imperatives", order: 7, title: "Imperatives: Sit down! Don't be late!", titleHu: "Felszólító mód: Sit down! Don't be late!", category: 'basic_structures', source: 'chart' },
      { id: "a1-can-cant", order: 8, title: "Can and can't: ability and permission", titleHu: "Can / can't: képesség és engedély", category: 'modals', source: 'chart' },
      { id: "a1-present-simple", order: 9, title: "Present simple with do/does", titleHu: "Egyszerű jelen (present simple): do/does", category: 'tense_aspect', source: 'chart', hint: "Watch third-person -s and do-support in negatives and questions." },
      { id: "a1-question-word-order", order: 10, title: "Questions: question words and word order", titleHu: "Kérdőszavak és szórend a kérdésekben", category: 'question_formation', source: 'chart', hint: "Hungarian questions use intonation or question words with no auxiliary, so learners drop do/does." },
      { id: "a1-object-pronouns", order: 11, title: "Object pronouns: me, you, him, her…", titleHu: "Tárgyesetű személyes névmások: me, you, him…", category: 'pronouns_determiners', source: 'chart' },
      { id: "a1-possessive-s", order: 12, title: "Possessive 's and whose", titleHu: "Birtokos 's és a whose", category: 'nouns_quantifiers', source: 'chart', hint: "Hungarian puts the possessive suffix on the possessed noun (Péter könyve), while English marks the possessor with 's." },
      { id: "a1-prepositions-time-place", order: 13, title: "Prepositions of time and place: in, on, at", titleHu: "Idő- és helyhatározó elöljárószók: in, on, at", category: 'prepositions', source: 'chart', hint: "Hungarian uses case suffixes and postpositions (házban, asztalnál), so in/on/at rarely map one-to-one." },
      { id: "a1-there-is-are", order: 14, title: "There is / there are", titleHu: "There is / there are", category: 'basic_structures', source: 'chart' },
      { id: "a1-present-continuous", order: 15, title: "Present continuous", titleHu: "Folyamatos jelen (present continuous)", category: 'tense_aspect', source: 'chart' },
      { id: "a1-past-simple-be", order: 16, title: "Past simple of to be: was and were", titleHu: "A létige múlt ideje: was, were", category: 'tense_aspect', source: 'chart' },
    ],
  },
  {
    level: 'A2',
    label: "A2 — Elementary",
    items: [
      { id: "a2-present-simple-vs-continuous", order: 1, title: "Present simple vs present continuous", titleHu: "Egyszerű és folyamatos jelen összevetése", category: 'tense_aspect', source: 'added', hint: "Hungarian has one present tense for both (Dolgozom = I work / I'm working), so the contrast is new." },
      { id: "a2-adverbs-of-frequency", order: 2, title: "Adverbs of frequency: position", titleHu: "Gyakoriságot jelző határozószók helye: always, usually, never", category: 'adverbs_adjectives', source: 'chart' },
      { id: "a2-possessive-pronouns", order: 3, title: "Possessive pronouns: mine, yours, his, hers…", titleHu: "Főnévi birtokos névmások: mine, yours, his…", category: 'pronouns_determiners', source: 'chart' },
      { id: "a2-past-simple-regular", order: 4, title: "Past simple: regular verbs", titleHu: "Egyszerű múlt: szabályos igék", category: 'tense_aspect', source: 'chart' },
      { id: "a2-past-simple-irregular", order: 5, title: "Past simple: irregular verbs", titleHu: "Egyszerű múlt: rendhagyó igék", category: 'tense_aspect', source: 'chart' },
      { id: "a2-there-was-were", order: 6, title: "There was / there were", titleHu: "There was / there were", category: 'basic_structures', source: 'chart' },
      { id: "a2-countable-uncountable", order: 7, title: "Countable and uncountable nouns: some, any, much, many, a lot of", titleHu: "Megszámlálható és megszámlálhatatlan főnevek: some, any, much, many", category: 'nouns_quantifiers', source: 'chart', hint: "Words like information, advice and news can be pluralised in Hungarian, so learners say 'informations' and 'advices'." },
      { id: "a2-some-any-compounds", order: 8, title: "Something, anything, nothing (and somebody, anywhere…)", titleHu: "Something, anything, nothing és társaik", category: 'pronouns_determiners', source: 'chart' },
      { id: "a2-articles", order: 9, title: "Articles: a/an, the and no article", titleHu: "Névelők: a/an, the és a névelő hiánya", category: 'articles', source: 'chart' },
      { id: "a2-comparatives", order: 10, title: "Comparative adjectives", titleHu: "Melléknévfokozás: középfok", category: 'comparatives', source: 'chart' },
      { id: "a2-superlatives", order: 11, title: "Superlative adjectives", titleHu: "Melléknévfokozás: felsőfok", category: 'comparatives', source: 'chart' },
      { id: "a2-adverbs-of-manner", order: 12, title: "Adverbs of manner: slowly, well, fast", titleHu: "Módhatározószók: slowly, well, fast", category: 'adverbs_adjectives', source: 'chart' },
      { id: "a2-verb-ing-to", order: 13, title: "Verb patterns: like + -ing, want / would like + to", titleHu: "Igei szerkezetek: like + -ing, want / would like + to", category: 'verb_patterns', source: 'chart', hint: "Hungarian has only the infinitive (Szeretek úszni), so -ing forms feel new." },
      { id: "a2-be-going-to", order: 14, title: "Be going to: plans and predictions", titleHu: "Be going to: tervek és előrejelzések", category: 'tense_aspect', source: 'chart' },
      { id: "a2-will-future", order: 15, title: "Will: predictions, decisions and offers", titleHu: "Will: előrejelzések, spontán döntések, ajánlatok", category: 'tense_aspect', source: 'chart' },
      { id: "a2-have-to-must", order: 16, title: "Have to, don't have to, must, mustn't", titleHu: "Have to, don't have to, must, mustn't", category: 'modals', source: 'chart' },
      { id: "a2-should", order: 17, title: "Should and shouldn't: advice", titleHu: "Should / shouldn't: tanács", category: 'modals', source: 'chart' },
      { id: "a2-past-continuous", order: 18, title: "Past continuous", titleHu: "Folyamatos múlt (past continuous)", category: 'tense_aspect', source: 'chart' },
      { id: "a2-present-perfect", order: 19, title: "Present perfect: experience and recent events", titleHu: "Present perfect: tapasztalat és friss események", category: 'tense_aspect', source: 'chart', hint: "Hungarian has no perfect aspect; 'Három éve lakom itt' (present tense) becomes 'I live here for three years' in learner English." },
      { id: "a2-present-perfect-vs-past-simple", order: 20, title: "Present perfect vs past simple: for, since, ago", titleHu: "Present perfect és egyszerű múlt: for, since, ago", category: 'tense_aspect', source: 'chart', hint: "Hungarian uses the past tense where English needs the present perfect (Voltál már Londonban?)." },
      { id: "a2-defining-relative-clauses", order: 21, title: "Defining relative clauses: who, which, that", titleHu: "Meghatározó vonatkozó mellékmondatok: who, which, that", category: 'relative_clauses', source: 'chart' },
    ],
  },
  {
    level: 'B1',
    label: "B1 — Intermediate",
    items: [
      { id: "b1-verb-infinitive-gerund", order: 1, title: "Verb + infinitive or -ing: decide to, enjoy -ing, stop, remember", titleHu: "Ige + főnévi igenév vagy -ing alak: decide to, enjoy -ing, stop, remember", category: 'verb_patterns', source: 'chart' },
      { id: "b1-future-forms", order: 2, title: "Future forms compared: will, going to, present continuous", titleHu: "Jövő idejű szerkezetek összevetése: will, going to, present continuous", category: 'tense_aspect', source: 'chart' },
      { id: "b1-future-time-clauses", order: 3, title: "Future time clauses: when, as soon as, until + present", titleHu: "Jövő idejű időhatározói mellékmondatok: when, as soon as, until", category: 'tense_aspect', source: 'chart' },
      { id: "b1-first-conditional", order: 4, title: "Zero and first conditionals", titleHu: "Nulladik és első típusú feltételes mondatok", category: 'conditionals', source: 'chart', hint: "Hungarian uses future tense in the if-clause (Ha lesz időm…), so learners say 'If I will have time'." },
      { id: "b1-second-conditional", order: 5, title: "Second conditional", titleHu: "Második típusú feltételes mondat", category: 'conditionals', source: 'chart', hint: "Hungarian uses the conditional mood in both clauses (Ha lenne időm, elmennék), so learners say 'If I would have time'." },
      { id: "b1-may-might", order: 6, title: "May and might: possibility", titleHu: "May és might: lehetőség", category: 'modals', source: 'chart' },
      { id: "b1-ability", order: 7, title: "Ability and possibility: can, could, be able to", titleHu: "Képesség és lehetőség: can, could, be able to", category: 'modals', source: 'chart' },
      { id: "b1-obligation-advice", order: 8, title: "Obligation, necessity and advice: must, have to, should, ought to", titleHu: "Kötelezettség, szükségesség, tanács: must, have to, should, ought to", category: 'modals', source: 'chart' },
      { id: "b1-modals-deduction", order: 9, title: "Modals of deduction: must, might, can't", titleHu: "Következtetés módbeli segédigékkel: must, might, can't", category: 'modals', source: 'chart' },
      { id: "b1-past-perfect", order: 10, title: "Past perfect", titleHu: "Befejezett múlt (past perfect)", category: 'tense_aspect', source: 'chart' },
      { id: "b1-past-tenses-contrast", order: 11, title: "Past tenses in contrast: past simple, continuous, perfect", titleHu: "Múlt idők összevetése: past simple, continuous, perfect", category: 'tense_aspect', source: 'chart' },
      { id: "b1-used-to", order: 12, title: "Used to and would; be used to / get used to", titleHu: "Used to és would; be used to / get used to", category: 'tense_aspect', source: 'chart' },
      { id: "b1-present-perfect-continuous", order: 13, title: "Present perfect simple vs continuous", titleHu: "Present perfect simple és continuous összevetése", category: 'tense_aspect', source: 'chart' },
      { id: "b1-stative-verbs", order: 14, title: "Stative (non-action) and dynamic verbs", titleHu: "Állapotot és cselekvést kifejező igék", category: 'tense_aspect', source: 'chart' },
      { id: "b1-passive-simple", order: 15, title: "Passive voice: present simple and past simple", titleHu: "Szenvedő szerkezet: egyszerű jelen és múlt", category: 'passive_voice', source: 'chart', hint: "Hungarian uses the passive far less than English, so learners tend to avoid it." },
      { id: "b1-passive-all-tenses", order: 16, title: "Passive in all tenses", titleHu: "Szenvedő szerkezet minden igeidőben", category: 'passive_voice', source: 'chart' },
      { id: "b1-third-conditional", order: 17, title: "Third conditional", titleHu: "Harmadik típusú feltételes mondat", category: 'conditionals', source: 'chart', hint: "Hungarian uses volna in both clauses (Ha lett volna időm, elmentem volna), so learners say 'If I would have had'." },
      { id: "b1-reported-speech", order: 18, title: "Reported speech: statements, questions, commands", titleHu: "Függő beszéd: kijelentések, kérdések, felszólítások", category: 'reported_speech', source: 'chart', hint: "Hungarian does not shift tenses in reported speech (Azt mondta, hogy fáradt), so backshift is new." },
      { id: "b1-relative-clauses", order: 19, title: "Relative clauses: whose, where, non-defining clauses", titleHu: "Vonatkozó mondatok: whose, where, nem meghatározó mellékmondatok", category: 'relative_clauses', source: 'chart' },
      { id: "b1-question-tags", order: 20, title: "Question tags", titleHu: "Kérdőfarok (question tags)", category: 'question_formation', source: 'chart' },
      { id: "b1-so-neither", order: 21, title: "So do I / Neither do I: agreeing and short responses", titleHu: "So do I / Neither do I: egyetértés, rövid válaszok", category: 'auxiliary_verbs', source: 'chart' },
      { id: "b1-comparisons", order: 22, title: "Comparisons: as… as, less / least, much / a bit + comparative", titleHu: "Összehasonlítás: as… as, less / least, much / a bit + középfok", category: 'comparatives', source: 'chart' },
      { id: "b1-articles", order: 23, title: "Articles: the, a/an and zero article", titleHu: "Névelők: the, a/an és a zéró névelő", category: 'articles', source: 'chart', hint: "Hungarian uses a/az with generic and abstract nouns (Az élet szép), so learners add 'the' where English uses none." },
      { id: "b1-quantifiers", order: 24, title: "Quantifiers: (a) few, (a) little, too, enough", titleHu: "Mennyiségjelzők: (a) few, (a) little, too, enough", category: 'nouns_quantifiers', source: 'added' },
      { id: "b1-phrasal-verbs", order: 25, title: "Phrasal verbs: meaning and word order", titleHu: "Frázisigék: jelentés és szórend", category: 'phrasal_verbs', source: 'chart', hint: "Hungarian preverbs (felkel = get up, kimegy = go out) are a useful analogy, though separation and meaning differ." },
      { id: "b1-linking-basic", order: 26, title: "Linking words: because, so, although, however", titleHu: "Kötőszavak és kapcsolószavak: because, so, although, however", category: 'linking_cohesion', source: 'added' },
    ],
  },
  {
    level: 'B2',
    label: "B2 — Upper-Intermediate",
    items: [
      { id: "b2-narrative-tenses", order: 1, title: "Narrative tenses: past simple, continuous, perfect and perfect continuous", titleHu: "Elbeszélő igeidők (narrative tenses)", category: 'tense_aspect', source: 'chart+roadmap' },
      { id: "b2-continuous-forms", order: 2, title: "Continuous forms: uses and contrasts across tenses", titleHu: "Folyamatos alakok: használat és összevetés", category: 'tense_aspect', source: 'roadmap' },
      { id: "b2-future-perfect-continuous", order: 3, title: "Future perfect and future continuous", titleHu: "Future perfect és future continuous", category: 'tense_aspect', source: 'chart' },
      { id: "b2-other-future-forms", order: 4, title: "Other ways to talk about the future: be about to, be due to, be likely to", titleHu: "A jövő további kifejezési módjai: be about to, be due to, be likely to", category: 'tense_aspect', source: 'roadmap' },
      { id: "b2-future-in-the-past", order: 5, title: "The future in the past: was going to, would, was about to", titleHu: "A múltbeli jövő: was going to, would, was about to", category: 'tense_aspect', source: 'roadmap' },
      { id: "b2-past-modals", order: 6, title: "Past modals: should have, could have, must have, can't have", titleHu: "Múltbeli módbeli szerkezetek: should have, could have, must have, can't have", category: 'modals', source: 'chart+roadmap' },
      { id: "b2-habits-will-would", order: 7, title: "Habits and typical behaviour: will and would", titleHu: "Szokások és jellemző viselkedés: will és would", category: 'modals', source: 'roadmap' },
      { id: "b2-wish-regrets", order: 8, title: "Wish and if only: present, future and past; wish + would", titleHu: "Wish és if only: jelen, jövő és múlt; wish + would", category: 'conditionals', source: 'chart+roadmap', hint: "Hungarian uses the conditional after Bárcsak (Bárcsak lenne időm), so learners say 'I wish I would have time'." },
      { id: "b2-mixed-conditionals", order: 9, title: "Mixed conditionals and alternatives to if: unless, as long as, provided that", titleHu: "Vegyes feltételes mondatok és az if alternatívái: unless, as long as, provided that", category: 'conditionals', source: 'roadmap' },
      { id: "b2-passive-further", order: 10, title: "Further passive constructions: have / get something done, get-passive", titleHu: "További szenvedő szerkezetek: have / get something done, get-passive", category: 'passive_voice', source: 'roadmap' },
      { id: "b2-reporting-verbs", order: 11, title: "Reporting verbs and their patterns: admit, deny, suggest, promise", titleHu: "Közlő igék és szerkezeteik: admit, deny, suggest, promise", category: 'reported_speech', source: 'roadmap' },
      { id: "b2-relative-clauses", order: 12, title: "Relative clauses with prepositions: in which, to whom; defining vs non-defining", titleHu: "Vonatkozó mondatok elöljárószóval: in which, to whom", category: 'relative_clauses', source: 'chart+roadmap' },
      { id: "b2-participle-clauses", order: 13, title: "Participle clauses: -ing and -ed", titleHu: "Igenévi szerkezetek (participle clauses): -ing és -ed", category: 'verb_patterns', source: 'roadmap' },
      { id: "b2-complex-questions", order: 14, title: "Complex and indirect questions: Could you tell me where…?", titleHu: "Összetett és beágyazott kérdések: Could you tell me where…?", category: 'question_formation', source: 'chart+roadmap' },
      { id: "b2-negative-questions", order: 15, title: "Negative questions: Don't you think…? Isn't it…?", titleHu: "Tagadó kérdések: Don't you think…? Isn't it…?", category: 'question_formation', source: 'roadmap' },
      { id: "b2-auxiliary-verbs", order: 16, title: "Auxiliary verbs: emphasis, short answers and ellipsis", titleHu: "Segédigék: nyomatékosítás, rövid válaszok, ellipszis", category: 'auxiliary_verbs', source: 'chart+roadmap' },
      { id: "b2-cleft-sentences", order: 17, title: "Cleft sentences: What I need is…, It was… that…", titleHu: "Kiemelő szerkezetek (cleft sentences): What I need is…, It was… that…", category: 'emphasis_structures', source: 'roadmap' },
      { id: "b2-inversion-not-only", order: 18, title: "Not only… but also, no sooner… than, hardly… when", titleHu: "Inverzió: not only… but also, no sooner… than, hardly… when", category: 'emphasis_structures', source: 'roadmap' },
      { id: "b2-even-hardly", order: 19, title: "Even, hardly, scarcely, barely", titleHu: "Even, hardly, scarcely, barely", category: 'adverbs_adjectives', source: 'roadmap' },
      { id: "b2-double-comparatives", order: 20, title: "Double comparatives: the more… the more, more and more", titleHu: "Kettős középfok: the more… the more, more and more", category: 'comparatives', source: 'chart+roadmap' },
      { id: "b2-complex-comparisons", order: 21, title: "Complex comparisons: twice as… as, nowhere near as… as, by far the…", titleHu: "Összetett összehasonlítások: twice as… as, nowhere near as… as, by far the…", category: 'comparatives', source: 'roadmap' },
      { id: "b2-adjectives-as-nouns", order: 22, title: "Adjectives used as nouns: the rich, the elderly", titleHu: "Melléknevek főnévi használata: the rich, the elderly", category: 'adverbs_adjectives', source: 'chart' },
      { id: "b2-adjective-order", order: 23, title: "Adjective order", titleHu: "Melléknevek sorrendje", category: 'adverbs_adjectives', source: 'chart' },
      { id: "b2-adverbs-position", order: 24, title: "Adverbs and adverbial phrases: position and meaning", titleHu: "Határozószók és határozói kifejezések: helyük és jelentésük", category: 'adverbs_adjectives', source: 'chart+roadmap' },
      { id: "b2-noun-phrases", order: 25, title: "Noun phrases: pre- and post-modification", titleHu: "Főnévi csoportok: elő- és utójelzők", category: 'nouns_quantifiers', source: 'roadmap' },
      { id: "b2-verbs-of-senses", order: 26, title: "Verbs of the senses: see / hear + -ing or infinitive; look, sound, feel + adjective", titleHu: "Az érzékelés igéi: see / hear + -ing vagy infinitive; look, sound, feel + melléknév", category: 'verb_patterns', source: 'chart' },
      { id: "b2-dependent-prepositions", order: 27, title: "Dependent prepositions after verbs, adjectives and nouns", titleHu: "Elöljárószós vonzatok igék, melléknevek és főnevek után", category: 'prepositions', source: 'roadmap', hint: "Hungarian case endings do not map onto English prepositions, so teach these as chunks." },
      { id: "b2-word-patterns", order: 28, title: "Word patterns: expect to, surprised that / by / to", titleHu: "Igék és melléknevek szerkezetei: expect to, surprised that / by / to", category: 'verb_patterns', source: 'roadmap' },
      { id: "b2-prepositional-phrases", order: 29, title: "Prepositional phrases and fixed expressions: by accident, in theory", titleHu: "Elöljárós kifejezések és állandósult szókapcsolatok: by accident, in theory", category: 'prepositions', source: 'roadmap' },
      { id: "b2-linking-words", order: 30, title: "Linking words and phrases: contrast, reason, result, addition", titleHu: "Kötőszavak és kapcsolószavak: ellentét, ok, következmény, hozzáadás", category: 'linking_cohesion', source: 'roadmap' },
      { id: "b2-word-formation", order: 31, title: "Word formation: prefixes, suffixes and compounds", titleHu: "Szóalkotás: előtagok, utótagok, összetett szavak", category: 'word_formation', source: 'roadmap' },
    ],
  },
  {
    level: 'C1',
    label: "C1 — Advanced",
    items: [
      { id: "c1-perfect-forms", order: 1, title: "Perfect forms in depth: present, past and future perfect, simple and continuous", titleHu: "Befejezett alakok mélyebben: present, past és future perfect", category: 'tense_aspect', source: 'roadmap' },
      { id: "c1-continuous-nuance", order: 2, title: "The continuous aspect: nuance and special uses", titleHu: "A folyamatos aspektus árnyalt használata (I was wondering…)", category: 'tense_aspect', source: 'roadmap' },
      { id: "c1-subject-raising", order: 3, title: "Subject raising: seem, appear, happen, be likely / certain to", titleHu: "Alanyemelés (subject raising): seem, appear, be likely to", category: 'verb_patterns', source: 'roadmap' },
      { id: "c1-infinitive-phrases", order: 4, title: "Infinitive phrases: perfect, passive and continuous infinitives", titleHu: "Főnévi igenévi szerkezetek: befejezett, szenvedő és folyamatos alakok", category: 'verb_patterns', source: 'roadmap' },
      { id: "c1-probability", order: 5, title: "Expressing probability: modals, likelihood adjectives and adverbs, be bound to", titleHu: "Valószínűség kifejezése: módbeli segédigék, melléknevek, határozószók", category: 'modals', source: 'roadmap' },
      { id: "c1-will-non-future", order: 6, title: "Non-future uses of will: assumption, typical behaviour, insistence", titleHu: "A will nem jövő idejű használata: feltevés, jellemző viselkedés, ragaszkodás", category: 'modals', source: 'roadmap' },
      { id: "c1-habits-compulsions", order: 7, title: "Describing habits and compulsions: tend to, keep -ing, can't help, be prone to", titleHu: "Szokások és kényszeres viselkedés: tend to, keep -ing, can't help, be prone to", category: 'verb_patterns', source: 'roadmap' },
      { id: "c1-giving-impressions", order: 8, title: "Giving impressions: seem, appear, look / sound as if, come across as", titleHu: "Benyomás kifejezése: seem, appear, look / sound as if, come across as", category: 'verb_patterns', source: 'roadmap' },
      { id: "c1-modifying-adjectives", order: 9, title: "Modifying adjectives: gradable and ungradable, intensifiers and downtoners", titleHu: "Melléknevek módosítása: fokozható és nem fokozható melléknevek", category: 'adverbs_adjectives', source: 'roadmap' },
      { id: "c1-determiners", order: 10, title: "Determiners: each / every, all / whole, either / neither / both, any / no / none", titleHu: "Determinánsok: each / every, all / whole, either / neither / both", category: 'pronouns_determiners', source: 'roadmap' },
      { id: "c1-comparative-structures", order: 11, title: "Comparative structures: advanced patterns and comparative clauses", titleHu: "Összehasonlító szerkezetek haladóknak", category: 'comparatives', source: 'roadmap' },
      { id: "c1-real-conditionals", order: 12, title: "Real conditionals: advanced uses", titleHu: "Valós feltételes mondatok: haladó használat", category: 'conditionals', source: 'roadmap' },
      { id: "c1-unreal-conditionals", order: 13, title: "Unreal conditionals: inversion (Had I known…), if it weren't for, were to", titleHu: "Irreális feltételes mondatok: inverzió (Had I known…), if it weren't for, were to", category: 'conditionals', source: 'roadmap' },
      { id: "c1-hypothetical-language", order: 14, title: "Hypothetical language: would rather, it's time, suppose, as if, if only", titleHu: "Hipotetikus szerkezetek: would rather, it's time, suppose, as if, if only", category: 'conditionals', source: 'roadmap' },
      { id: "c1-passive-in-depth", order: 15, title: "The passive in depth: active vs passive, passive infinitives and gerunds, with modals", titleHu: "A szenvedő szerkezet mélyebben: aktív vagy passzív, szenvedő igenevek, módbeli igékkel", category: 'passive_voice', source: 'roadmap' },
      { id: "c1-passive-reporting", order: 16, title: "Passive reporting structures: it is said that…, he is believed to…", titleHu: "Szenvedő közlő szerkezetek: it is said that…, he is believed to…", category: 'reported_speech', source: 'roadmap' },
      { id: "c1-relative-clauses-advanced", order: 17, title: "Relative clauses: sentence relatives, whoever / whatever", titleHu: "Vonatkozó mondatok haladóknak: mondatra vonatkozó which, whoever / whatever", category: 'relative_clauses', source: 'roadmap' },
      { id: "c1-reduced-relative-clauses", order: 18, title: "Reduced relative clauses and similar structures", titleHu: "Rövidített vonatkozó mondatok és hasonló szerkezetek", category: 'relative_clauses', source: 'roadmap' },
      { id: "c1-participle-clauses", order: 19, title: "Participle clauses: perfect and passive forms, reason, time and condition", titleHu: "Igenévi szerkezetek: befejezett és szenvedő alakok, ok, idő, feltétel", category: 'verb_patterns', source: 'roadmap' },
    ],
  },
  {
    level: 'C2',
    label: "C2 — Proficiency",
    items: [
      { id: "c2-cleft-advanced", order: 1, title: "Cleft sentences: advanced patterns (All I want is…, The reason… is that…)", titleHu: "Kiemelő szerkezetek haladóknak: All I want is…, The reason… is that…", category: 'emphasis_structures', source: 'roadmap' },
      { id: "c2-question-forms", order: 2, title: "Advanced question forms: echo and rhetorical questions", titleHu: "Haladó kérdésformák: visszhangkérdés, retorikai kérdés", category: 'question_formation', source: 'roadmap' },
      { id: "c2-reason-clauses", order: 3, title: "Reason clauses: as, since, seeing that, owing to", titleHu: "Okhatározói mellékmondatok: as, since, seeing that, owing to", category: 'linking_cohesion', source: 'roadmap' },
      { id: "c2-concession-clauses", order: 4, title: "Concession clauses: although, even though, while, much as, however + adjective", titleHu: "Engedmény kifejezése: although, even though, while, much as, however + melléknév", category: 'linking_cohesion', source: 'roadmap' },
      { id: "c2-linking-devices", order: 5, title: "Linking devices: moreover, nevertheless, that said, by contrast", titleHu: "Kapcsolószavak: moreover, nevertheless, that said, by contrast", category: 'linking_cohesion', source: 'roadmap' },
      { id: "c2-emphasis-inversion", order: 6, title: "Emphasis and persuasion: inversion after negative adverbials, fronting, emphatic do", titleHu: "Nyomatékosítás és meggyőzés: inverzió (Never… / Rarely… / Not until…), előrehozás, emphatic do", category: 'emphasis_structures', source: 'roadmap' },
      { id: "c2-emphasising-advice", order: 7, title: "Emphasising advice: had better, if I were you, you'd be well advised to", titleHu: "Tanács nyomatékosítása: had better, if I were you, you'd be well advised to", category: 'modals', source: 'roadmap' },
      { id: "c2-heads-and-tails", order: 8, title: "Heads and tails: spoken emphasis and topic marking", titleHu: "Fej és farok szerkezetek (heads and tails): beszélt nyelvi kiemelés", category: 'emphasis_structures', source: 'roadmap' },
      { id: "c2-subjunctive", order: 9, title: "The subjunctive and formal recommendations: I suggest that he be…", titleHu: "Kötőmód és formális javaslatok: I suggest that he be…", category: 'verb_patterns', source: 'roadmap' },
      { id: "c2-verbless-clauses", order: 10, title: "Verbless clauses: Though tired, she carried on", titleHu: "Ige nélküli mellékmondatok: Though tired, she carried on", category: 'verb_patterns', source: 'roadmap' },
    ],
  },
]

export const GRAMMAR_POINTS: GrammarItem[] = grammarCurriculum.flatMap((g) => g.items)

export function getGrammarItem(itemId: string): { level: CefrLevel; item: GrammarItem } | undefined {
  for (const group of grammarCurriculum) {
    const item = group.items.find((i) => i.id === itemId)
    if (item) return { level: group.level, item }
  }
  return undefined
}

export function getGrammarPoint(itemId: string): GrammarItem | undefined {
  return getGrammarItem(itemId)?.item
}

export function getGrammarPointsByLevel(level: CefrLevel): GrammarItem[] {
  return grammarCurriculum.find((g) => g.level === level)?.items ?? []
}

export function getGrammarPointsByCategory(category: GrammarCategory): GrammarItem[] {
  return GRAMMAR_POINTS.filter((p) => p.category === category)
}
