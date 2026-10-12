// Static content for the Grammar Coach Tense Explorer: names, formulas, uses, time words,
// Hungarian-speaker pitfalls, lesson links and compare notes. No JSX (importable by Node).
// Checked by scripts/check-tense-engine.ts.
import type { TenseId } from '../lib/tenseEngine/index.ts'

export interface TenseContent {
  id: TenseId
  frame: 'present' | 'past' | 'future'
  aspect: 'simple' | 'continuous' | 'perfect' | 'perfect-continuous' | 'going-to'
  nameEn: string
  nameHu: string
  formulaEn: string
  usesEn: string[]
  usesHu: string[]
  cuesEn: string[]
  pitfallHu?: string
  pitfallEn?: string
  lessonId?: string
}

const PRESENT_PITFALL_EN =
  "Hungarian has one present tense: 'Dolgozom' can be 'I work' or 'I'm working'. English separates habits from what is happening now."
const PRESENT_PITFALL_HU =
  'A magyarban egy jelen idő van: a „Dolgozom” jelentheti azt, hogy „I work” és azt is, hogy „I\'m working”. Az angol megkülönbözteti a szokást a most zajló cselekvéstől.'

export const TENSE_CONTENT: Record<TenseId, TenseContent> = {
  'present-simple': {
    id: 'present-simple',
    frame: 'present',
    aspect: 'simple',
    nameEn: 'Present simple',
    nameHu: 'Egyszerű jelen',
    formulaEn: 'subject + verb (+s)',
    usesEn: ['Habits and routines', 'Facts and general truths', 'Timetables'],
    usesHu: ['Szokások, rendszeres cselekvések', 'Tények, általános igazságok', 'Menetrendek'],
    cuesEn: ['always', 'usually', 'every day', 'on Mondays'],
    pitfallEn: PRESENT_PITFALL_EN,
    pitfallHu: PRESENT_PITFALL_HU,
    lessonId: 'a1-present-simple',
  },
  'present-continuous': {
    id: 'present-continuous',
    frame: 'present',
    aspect: 'continuous',
    nameEn: 'Present continuous',
    nameHu: 'Folyamatos jelen',
    formulaEn: 'subject + am/is/are + verb-ing',
    usesEn: ['Happening now', 'Temporary situations', 'Fixed future arrangements'],
    usesHu: ['Éppen most zajló cselekvés', 'Ideiglenes helyzetek', 'Megbeszélt jövőbeli tervek'],
    cuesEn: ['now', 'at the moment', 'today', 'this week'],
    pitfallEn: PRESENT_PITFALL_EN,
    pitfallHu: PRESENT_PITFALL_HU,
    lessonId: 'a1-present-continuous',
  },
  'present-perfect': {
    id: 'present-perfect',
    frame: 'present',
    aspect: 'perfect',
    nameEn: 'Present perfect',
    nameHu: 'Befejezett jelen',
    formulaEn: 'subject + have/has + past participle',
    usesEn: [
      'Life experience (no finished time)',
      'Recent events with a result now',
      'States and actions up to now with for/since',
    ],
    usesHu: [
      'Élettapasztalat (lezárt időpont nélkül)',
      'Friss esemény, aminek most is van hatása',
      'Mostanáig tartó állapot (for/since)',
    ],
    cuesEn: ['ever', 'never', 'already', 'yet', 'just', 'for', 'since'],
    pitfallEn:
      "Hungarian uses the past tense (Voltál már Londonban?) or the present tense (Három éve lakom itt); English needs the present perfect: 'I have lived here for three years', not 'I live here for three years'.",
    pitfallHu:
      'A magyar múlt időt (Voltál már Londonban?) vagy jelen időt (Három éve lakom itt) használ; az angolban present perfect kell: „I have lived here for three years”, nem „I live here for three years”.',
    lessonId: 'a2-present-perfect',
  },
  'present-perfect-continuous': {
    id: 'present-perfect-continuous',
    frame: 'present',
    aspect: 'perfect-continuous',
    nameEn: 'Present perfect continuous',
    nameHu: 'Befejezett folyamatos jelen',
    formulaEn: 'subject + have/has + been + verb-ing',
    usesEn: [
      'An activity in progress up to now (duration matters)',
      'A recent activity with visible results',
    ],
    usesHu: [
      'Mostanáig tartó folyamat (az időtartam a fontos)',
      'Nemrég befejezett tevékenység látható nyomokkal',
    ],
    cuesEn: ['for', 'since', 'all day', 'lately', 'how long'],
    pitfallEn: "'Öt éve tanulok angolul' is 'I have been learning English for five years'.",
    pitfallHu: 'Az „Öt éve tanulok angolul” angolul: „I have been learning English for five years”.',
    lessonId: 'b1-present-perfect-continuous',
  },
  'past-simple': {
    id: 'past-simple',
    frame: 'past',
    aspect: 'simple',
    nameEn: 'Past simple',
    nameHu: 'Egyszerű múlt',
    formulaEn: 'subject + past form',
    usesEn: [
      'Finished actions at a definite past time',
      'A series of past events (stories)',
      'Past habits and states',
    ],
    usesHu: [
      'Befejezett cselekvés meghatározott múltbeli időben',
      'Egymást követő múltbeli események (történetmesélés)',
      'Múltbeli szokások, állapotok',
    ],
    cuesEn: ['yesterday', 'last week', 'in 2019', 'ago'],
    pitfallEn:
      'The Hungarian past covers both the past simple and the present perfect. Use the past simple only for a finished time (yesterday, in 2019).',
    pitfallHu:
      'A magyar múlt idő az angol past simple-t és a present perfectet is lefedi. Past simple-t csak lezárt időponthoz használj (yesterday, in 2019).',
    lessonId: 'a2-past-simple-regular',
  },
  'past-continuous': {
    id: 'past-continuous',
    frame: 'past',
    aspect: 'continuous',
    nameEn: 'Past continuous',
    nameHu: 'Folyamatos múlt',
    formulaEn: 'subject + was/were + verb-ing',
    usesEn: [
      'An action in progress at a past moment',
      'Background to a story or an interrupted action',
      'Two actions happening at the same time',
    ],
    usesHu: [
      'Egy múltbeli pillanatban éppen zajló cselekvés',
      'Háttér vagy megszakított cselekvés',
      'Két egyidejű múltbeli cselekvés',
    ],
    cuesEn: ['while', 'when', "at eight o'clock", 'all evening'],
    lessonId: 'a2-past-continuous',
  },
  'past-perfect': {
    id: 'past-perfect',
    frame: 'past',
    aspect: 'perfect',
    nameEn: 'Past perfect',
    nameHu: 'Befejezett múlt',
    formulaEn: 'subject + had + past participle',
    usesEn: ['The earlier of two past events', 'The reason for a past situation'],
    usesHu: ['A két múltbeli esemény közül a korábbi', 'Egy múltbeli helyzet oka'],
    cuesEn: ['by the time', 'before', 'after', 'already'],
    lessonId: 'b1-past-perfect',
  },
  'past-perfect-continuous': {
    id: 'past-perfect-continuous',
    frame: 'past',
    aspect: 'perfect-continuous',
    nameEn: 'Past perfect continuous',
    nameHu: 'Befejezett folyamatos múlt',
    formulaEn: 'subject + had been + verb-ing',
    usesEn: [
      'How long something had been going on before a past moment',
      'The cause of a past situation',
    ],
    usesHu: ['Mennyi ideje tartott valami egy múltbeli pontig', 'Egy múltbeli helyzet oka'],
    cuesEn: ['for', 'since', 'all day', 'before'],
    lessonId: 'b2-narrative-tenses',
  },
  'future-simple': {
    id: 'future-simple',
    frame: 'future',
    aspect: 'simple',
    nameEn: 'Future simple',
    nameHu: 'Egyszerű jövő',
    formulaEn: 'subject + will + verb',
    usesEn: ['Spontaneous decisions', 'Predictions based on opinion', 'Promises, offers, requests'],
    usesHu: ['Pillanatnyi döntések', 'Véleményen alapuló előrejelzések', 'Ígéretek, ajánlatok, kérések'],
    cuesEn: ['tomorrow', 'next week', 'probably', 'I think'],
    pitfallEn:
      "After if/when/as soon as, English uses the present: 'If it rains, we will stay home', not 'If it will rain'.",
    pitfallHu:
      'Az if/when/as soon as után az angol jelen időt használ: „If it rains, we will stay home”, nem „If it will rain”.',
    lessonId: 'a2-will-future',
  },
  'future-continuous': {
    id: 'future-continuous',
    frame: 'future',
    aspect: 'continuous',
    nameEn: 'Future continuous',
    nameHu: 'Folyamatos jövő',
    formulaEn: 'subject + will be + verb-ing',
    usesEn: ['An action in progress at a future moment', 'Polite questions about plans'],
    usesHu: ['Egy jövőbeli pillanatban éppen zajló cselekvés', 'Udvarias kérdés a tervekről'],
    cuesEn: ['this time tomorrow', 'at eight tomorrow'],
    lessonId: 'b2-future-perfect-continuous',
  },
  'future-perfect': {
    id: 'future-perfect',
    frame: 'future',
    aspect: 'perfect',
    nameEn: 'Future perfect',
    nameHu: 'Befejezett jövő',
    formulaEn: 'subject + will have + past participle',
    usesEn: ['An action finished before a future point'],
    usesHu: ['Egy jövőbeli időpontig befejeződő cselekvés'],
    cuesEn: ['by', 'by the time', 'by next Friday'],
    lessonId: 'b2-future-perfect-continuous',
  },
  'future-perfect-continuous': {
    id: 'future-perfect-continuous',
    frame: 'future',
    aspect: 'perfect-continuous',
    nameEn: 'Future perfect continuous',
    nameHu: 'Befejezett folyamatos jövő',
    formulaEn: 'subject + will have been + verb-ing',
    usesEn: [
      'How long something will have been going on by a future point (rare; anniversaries, milestones)',
    ],
    usesHu: ['Mennyi ideje tart majd valami egy jövőbeli időpontig (ritka; évfordulók, mérföldkövek)'],
    cuesEn: ['by next June', 'for ten years by then'],
    lessonId: 'c1-perfect-forms',
  },
  'be-going-to': {
    id: 'be-going-to',
    frame: 'future',
    aspect: 'going-to',
    nameEn: 'Be going to',
    nameHu: 'Be going to',
    formulaEn: 'subject + am/is/are + going to + verb',
    usesEn: ['Plans decided before speaking', 'Predictions based on evidence now'],
    usesHu: ['Előre eldöntött tervek', 'Jelenlegi jelekből következő előrejelzések'],
    cuesEn: ['next week', 'soon', 'tonight'],
    pitfallEn:
      "Hungarian does not separate plans from spontaneous decisions, so learners overuse 'will'. Decided before now: going to. Decided now: will.",
    pitfallHu:
      'A magyar nem különbözteti meg az előre eldöntött tervet a pillanatnyi döntéstől, ezért sokan mindenhol „will”-t használnak. Már korábban eldöntöttük: going to. Most döntünk: will.',
    lessonId: 'a2-be-going-to',
  },
}

export const COMPARE_PAIRS: { a: TenseId; b: TenseId; en: string; hu: string }[] = [
  {
    a: 'present-simple',
    b: 'present-continuous',
    en: 'Simple = habit or fact; continuous = happening now or temporary.',
    hu: 'Egyszerű = szokás, tény; folyamatos = éppen most zajlik vagy ideiglenes.',
  },
  {
    a: 'past-simple',
    b: 'present-perfect',
    en: 'Past simple = a finished time (yesterday); present perfect = linked to now, no finished time.',
    hu: 'Past simple = lezárt időpont (yesterday); present perfect = a mához kötődik, nincs lezárt időpont.',
  },
  {
    a: 'present-perfect',
    b: 'present-perfect-continuous',
    en: 'Simple = result or number; continuous = the activity and its duration.',
    hu: 'Egyszerű = eredmény vagy darabszám; folyamatos = a tevékenység és időtartama.',
  },
  {
    a: 'past-simple',
    b: 'past-continuous',
    en: 'Simple = a completed event; continuous = the activity in progress (often interrupted).',
    hu: 'Egyszerű = befejezett esemény; folyamatos = a folyamatban lévő (gyakran megszakított) cselekvés.',
  },
  {
    a: 'past-simple',
    b: 'past-perfect',
    en: 'Past perfect = the earlier of two past events.',
    hu: 'Past perfect = a két múltbeli esemény közül a korábbi.',
  },
  {
    a: 'future-simple',
    b: 'be-going-to',
    en: 'Going to = decided before speaking or clear evidence now; will = decided now or an opinion.',
    hu: 'Going to = előre eldöntött vagy jelenlegi jelekből következő; will = most döntött vagy vélemény.',
  },
  {
    a: 'future-continuous',
    b: 'future-perfect',
    en: 'Continuous = in progress at that time; perfect = finished by that time.',
    hu: 'Folyamatos = abban az időpontban zajlik; perfect = addigra befejeződik.',
  },
]

/** The contrast note for two tenses, in either order; undefined when there is none. */
export function findComparePair(a: TenseId, b: TenseId) {
  return COMPARE_PAIRS.find((p) => (p.a === a && p.b === b) || (p.a === b && p.b === a))
}
