// Mistake taxonomy for Hungarian learners: area → subtype, two levels. Single source of
// truth for the ids, the Hungarian/English labels shown on "Az én fejlődésem" and the
// teacher's student page, the descriptions + examples the feedback model classifies
// against, and the Grammar Coach lessons each subtype links to.
//
// The ids are also listed in the `mistake_events` check constraints
// (supabase/migrations/20261002120000_mistake_events.sql) — adding, renaming or removing
// an id here needs a migration that changes those constraints too.
//
// Deliberately import-free: it's read by the frontend, by api/ (Vercel) and by
// scripts/relabel-mistake-log.ts (plain Node), which resolve imports differently.
// `lessonIds` must exist in grammarCurriculum.ts — npm run check:grammar verifies it.

export interface MistakeSubtype {
  id: string
  labelHu: string
  labelEn: string
  /** One line for the classification prompt (English, never shown in the UI). */
  description: string
  /** Learner → correct, for the classification prompt. */
  example: string
  /** Grammar Coach lesson ids, easiest first. Empty where no lesson fits yet. */
  lessonIds: string[]
}

export interface MistakeArea {
  id: string
  labelHu: string
  labelEn: string
  subtypes: MistakeSubtype[]
}

/** Display order of the areas; subtypes keep their order within each area. */
export const MISTAKE_TAXONOMY: MistakeArea[] = [
  {
    id: 'verbs_tenses',
    labelHu: 'Igék és igeidők',
    labelEn: 'Verbs & tenses',
    subtypes: [
      {
        id: 'missing_be',
        labelHu: 'A létige hiánya',
        labelEn: 'Missing be',
        description: 'am/is/are (or was/were) left out, as Hungarian drops the copula',
        example: '"He teacher." → "He is a teacher."',
        lessonIds: ['a1-be-verb'],
      },
      {
        id: 'past_forms',
        labelHu: 'Múlt idejű alakok',
        labelEn: 'Past forms',
        description: 'wrong past-tense form: regularised irregulars, past after did/didn\'t, wrong was/were',
        example: '"I goed" / "didn\'t went" → "went" / "didn\'t go"',
        lessonIds: ['a1-past-simple-be', 'a2-past-simple-regular', 'a2-past-simple-irregular'],
      },
      {
        id: 'perfect_vs_past',
        labelHu: 'Present perfect vs. egyszerű múlt',
        labelEn: 'Present perfect vs past',
        description: 'present perfect and past simple confused, incl. present tense with since/for',
        example: '"I live here since 2010." → "I\'ve lived here since 2010."',
        lessonIds: ['a2-present-perfect', 'a2-present-perfect-vs-past-simple'],
      },
      {
        id: 'simple_vs_continuous',
        labelHu: 'Egyszerű vs. folyamatos jelen',
        labelEn: 'Simple vs continuous',
        description: 'present simple and present continuous confused',
        example: '"I am working here every day." → "I work here every day."',
        lessonIds: ['a2-present-simple-vs-continuous', 'a1-present-continuous'],
      },
      {
        id: 'future_forms',
        labelHu: 'Jövő idő',
        labelEn: 'Future forms',
        description: 'present simple used for a plan or prediction, or will / going to / present continuous mixed up',
        example: '"Tomorrow I visit my son." (a plan) → "I\'m visiting / going to visit my son."',
        lessonIds: ['a2-be-going-to', 'a2-will-future'],
      },
      {
        id: 'third_person_s',
        labelHu: 'E/3 -s végződés',
        labelEn: 'Third-person -s',
        description: 'missing (or extra) -s on a present simple verb after he/she/it',
        example: '"She work in a bank." → "She works in a bank."',
        lessonIds: ['a1-present-simple'],
      },
    ],
  },
  {
    id: 'questions_negatives',
    labelHu: 'Kérdés és tagadás',
    labelEn: 'Questions & negatives',
    subtypes: [
      {
        id: 'do_support',
        labelHu: 'Do/does/did használata',
        labelEn: 'Do-support',
        description: 'do/does/did missing or wrong in a question or negative',
        example: '"Where you work?" / "I not like it." → "Where do you work?" / "I don\'t like it."',
        lessonIds: ['a1-present-simple', 'a1-question-word-order'],
      },
      {
        id: 'question_word_order',
        labelHu: 'Kérdő szórend',
        labelEn: 'Question word order',
        description: 'subject and auxiliary in the wrong order in a question',
        example: '"Where is working your wife?" → "Where does your wife work?"',
        lessonIds: ['a1-question-word-order'],
      },
    ],
  },
  {
    id: 'nouns_articles',
    labelHu: 'Főnevek és névelők',
    labelEn: 'Nouns & articles',
    subtypes: [
      {
        id: 'articles',
        labelHu: 'Névelők',
        labelEn: 'Articles',
        description: 'a/an/the missing, extra or the wrong one',
        example: '"I am teacher." / "The life is beautiful." → "I am a teacher." / "Life is beautiful."',
        lessonIds: ['a2-articles'],
      },
      {
        id: 'plural_countable',
        labelHu: 'Többes szám, megszámlálhatóság',
        labelEn: 'Plurals & countability',
        description: 'missing plural after a number or quantity, or an uncountable noun made plural',
        example: '"three apple" / "informations" → "three apples" / "information"',
        lessonIds: ['a1-plural-nouns', 'a2-countable-uncountable'],
      },
    ],
  },
  {
    id: 'pronouns',
    labelHu: 'Névmások',
    labelEn: 'Pronouns',
    subtypes: [
      {
        id: 'he_she',
        labelHu: 'He/she keverése',
        labelEn: 'He/she mix-up',
        description: 'he/she or him/her used for the wrong gender (Hungarian "ő" has no gender)',
        example: '"My wife, he is a nurse." → "My wife, she is a nurse."',
        lessonIds: ['a1-subject-pronouns', 'a1-object-pronouns'],
      },
      {
        id: 'his_her',
        labelHu: 'His/her keverése',
        labelEn: 'His/her mix-up',
        description: 'his/her used for the wrong gender',
        example: '"My husband and her brother" (meaning his) → "My husband and his brother"',
        lessonIds: ['a1-possessive-adjectives'],
      },
      {
        id: 'missing_subject',
        labelHu: 'Hiányzó alany (it/there)',
        labelEn: 'Missing subject',
        description: 'subject left out, especially dummy it / there',
        example: '"Is raining." / "Is a problem." → "It\'s raining." / "There is a problem."',
        lessonIds: ['a1-subject-pronouns', 'a1-there-is-are'],
      },
    ],
  },
  {
    id: 'prepositions',
    labelHu: 'Elöljárószók',
    labelEn: 'Prepositions',
    subtypes: [
      {
        id: 'prep_time_place',
        labelHu: 'Idő és hely (in/on/at)',
        labelEn: 'Time & place',
        description: 'wrong preposition of time or place (in/on/at and similar)',
        example: '"on the morning" / "in the bus stop" → "in the morning" / "at the bus stop"',
        lessonIds: ['a1-prepositions-time-place'],
      },
      {
        id: 'dependent_prep',
        labelHu: 'Vonzatos elöljárószók',
        labelEn: 'Dependent prepositions',
        description: 'wrong preposition after a verb, adjective or noun',
        example: '"interested for" / "depends from" → "interested in" / "depends on"',
        lessonIds: [],
      },
    ],
  },
  {
    id: 'word_order',
    labelHu: 'Szórend',
    labelEn: 'Word order',
    subtypes: [
      {
        id: 'sentence_order',
        labelHu: 'Mondat szórendje',
        labelEn: 'Sentence order',
        description: 'subject-verb-object order broken in a statement',
        example: '"English I speak well." → "I speak English well."',
        lessonIds: [],
      },
      {
        id: 'adverb_position',
        labelHu: 'Határozószó helye',
        labelEn: 'Adverb position',
        description: 'adverb in the wrong place, such as between the verb and its object',
        example: '"I go always by bus." / "I like very much football." → "I always go by bus." / "I like football very much."',
        lessonIds: ['a2-adverbs-of-frequency'],
      },
    ],
  },
  {
    id: 'vocabulary',
    labelHu: 'Szókincs',
    labelEn: 'Vocabulary',
    subtypes: [
      {
        id: 'wrong_word',
        labelHu: 'Rossz szó, hamis barát',
        labelEn: 'Wrong word, false friend',
        description: 'wrong word for the meaning, including Hungarian false friends',
        example: '"He is very sympathetic." (= szimpatikus) → "He is very likeable."',
        lessonIds: [],
      },
      {
        id: 'collocation',
        labelHu: 'Szókapcsolat',
        labelEn: 'Collocation',
        description: 'words that don\'t go together in English',
        example: '"make a photo" / "do a mistake" → "take a photo" / "make a mistake"',
        lessonIds: [],
      },
    ],
  },
  {
    id: 'other',
    labelHu: 'Egyéb',
    labelEn: 'Other',
    subtypes: [
      {
        id: 'other',
        labelHu: 'Egyéb',
        labelEn: 'Other',
        description: 'anything that fits nowhere else',
        example: '',
        lessonIds: [],
      },
    ],
  },
]

export const OTHER_SUBTYPE = 'other'

const SUBTYPE_TO_AREA = new Map<string, MistakeArea>()
const SUBTYPES = new Map<string, MistakeSubtype>()
for (const area of MISTAKE_TAXONOMY) {
  for (const subtype of area.subtypes) {
    SUBTYPE_TO_AREA.set(subtype.id, area)
    SUBTYPES.set(subtype.id, subtype)
  }
}

export const MISTAKE_AREA_IDS: string[] = MISTAKE_TAXONOMY.map((a) => a.id)
export const MISTAKE_SUBTYPE_IDS: string[] = [...SUBTYPES.keys()]

export function isValidSubtype(s: unknown): s is string {
  return typeof s === 'string' && SUBTYPES.has(s)
}

/** The area a subtype belongs to — 'other' for anything unknown. */
export function areaForSubtype(subtype: string): string {
  return SUBTYPE_TO_AREA.get(subtype)?.id ?? 'other'
}

export function getMistakeSubtype(id: string): MistakeSubtype | undefined {
  return SUBTYPES.get(id)
}

export function getMistakeArea(id: string): MistakeArea | undefined {
  return MISTAKE_TAXONOMY.find((a) => a.id === id)
}

/**
 * The taxonomy as a tree for a classification prompt: one line per subtype (id, what it
 * covers, an example) under its area. Shared by the end-of-session feedback prompt and
 * scripts/relabel-mistake-log.ts so both classify against exactly the same text.
 */
export function buildTaxonomyPromptBlock(): string {
  return MISTAKE_TAXONOMY.map((area) => {
    const lines = area.subtypes.map((s) => {
      const example = s.example ? ` e.g. ${s.example}` : ''
      return `  - ${s.id}: ${s.description}.${example}`
    })
    return `${area.labelEn}:\n${lines.join('\n')}`
  }).join('\n')
}
