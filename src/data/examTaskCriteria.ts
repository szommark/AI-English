// "Listening Task Publication Criteria" (Szombathely Márk, 2026-10-19), written against the
// master prompt listening_exam_generator_prompt_2_4.md. Every criterion is either checked by code
// (src/lib/listeningChecks.ts, `auto`) or judged by a testing teacher in Test mode; the reasons a
// teacher can give for rejecting an item or the whole task come from this list.
//
// source: '2_4' = already in the master prompt; 'new' = proposed by the review (its numbers are
// starting values to calibrate). severity: blocker = do not publish; warning = fix if possible.

import type { ListeningFormat } from '../lib/examTasks.js'

export type CriterionGroup = 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
export type Severity = 'blocker' | 'warning'
/** Whether a reviewer tags the criterion on one item, on the whole task, or both. */
export type CriterionScope = 'item' | 'task' | 'both'

export interface Criterion {
  id: string
  group: CriterionGroup
  severity: Severity
  source: '2_4' | 'new' | 'reviewer'
  formats: ListeningFormat[]
  scope: CriterionScope
  /** Checked automatically (fully or as a heuristic flag). */
  auto: boolean
  label: { en: string; hu: string }
  test: { en: string; hu: string }
}

export const GROUP_LABEL: Record<CriterionGroup, { en: string; hu: string }> = {
  A: { en: 'A. Audioscript: length, load, complexity', hu: 'A. Hangszöveg: hossz, terhelés, összetettség' },
  B: { en: 'B. Spacing and cue placement', hu: 'B. Távolság és jelzőszavak' },
  C: { en: 'C. Item design', hu: 'C. Itemszerkesztés' },
  D: { en: 'D. Item wording vs answer key', hu: 'D. Itemszöveg és megoldókulcs eltérése' },
  E: { en: 'E. Level fit', hu: 'E. Szintnek megfelelés' },
  F: { en: 'F. Fairness and layout', hu: 'F. Méltányosság és formátum' },
}

const BOTH: ListeningFormat[] = ['true-false', 'notes']
const TF: ListeningFormat[] = ['true-false']
const NOTES: ListeningFormat[] = ['notes']

export const CRITERIA: Criterion[] = [
  // A. Audioscript
  {
    id: 'wordCount', group: 'A', severity: 'blocker', source: '2_4', formats: BOTH, scope: 'task', auto: true,
    label: { en: 'Word count in band', hu: 'Szószám a sávban' },
    test: { en: 'T/F 400–450; notes B1 300–350, B2 350–400, C1 450–550', hu: 'I/H 400–450; jegyzet B1 300–350, B2 350–400, C1 450–550' },
  },
  {
    id: 'sourceFacts', group: 'A', severity: 'blocker', source: '2_4', formats: BOTH, scope: 'both', auto: false,
    label: { en: 'Fact not in the source', hu: 'A forrásban nem szereplő tény' },
    test: { en: 'No outside facts in the script', hu: 'A szöveg nem tartalmaz külső tényt' },
  },
  {
    id: 'infoLoad', group: 'A', severity: 'warning', source: 'new', formats: BOTH, scope: 'task', auto: true,
    label: { en: 'Information overload', hu: 'Túl sok információ' },
    test: { en: 'About 30–35 words per item (notes) or 55–60 (T/F); not many more unscored facts than items', hu: 'Kb. 30–35 szó/item (jegyzet) vagy 55–60 (I/H); nem sokkal több nem pontozott tény, mint item' },
  },
  {
    id: 'figures', group: 'A', severity: 'warning', source: 'new', formats: BOTH, scope: 'task', auto: true,
    label: { en: 'Too many figures', hu: 'Túl sok szám' },
    test: { en: 'At most about 6 figures per script, tested or not', hu: 'Legfeljebb kb. 6 szám a szövegben, pontozott vagy sem' },
  },
  {
    id: 'namedEntities', group: 'A', severity: 'warning', source: 'new', formats: BOTH, scope: 'task', auto: true,
    label: { en: 'Too many names', hu: 'Túl sok tulajdonnév' },
    test: { en: 'At most 4 (B1), 6 (B2) or 8 (C1) people, places, organisations', hu: 'Legfeljebb 4 (B1), 6 (B2) vagy 8 (C1) személy, hely, szervezet' },
  },
  {
    id: 'sentenceLength', group: 'A', severity: 'warning', source: 'new', formats: BOTH, scope: 'both', auto: true,
    label: { en: 'Sentences too long or complex', hu: 'Túl hosszú vagy összetett mondatok' },
    test: { en: 'Average 12–15 words (B1), 16–20 (B2), 20–25 (C1); none above about 35', hu: 'Átlag 12–15 szó (B1), 16–20 (B2), 20–25 (C1); egyik sem több kb. 35-nél' },
  },
  {
    id: 'speechRate', group: 'A', severity: 'warning', source: 'new', formats: BOTH, scope: 'task', auto: false,
    label: { en: 'Speech too fast', hu: 'Túl gyors beszéd' },
    test: { en: 'About 120–130 wpm (B1) or 140–150 wpm (B2/C1)', hu: 'Kb. 120–130 szó/perc (B1) vagy 140–150 (B2/C1)' },
  },
  {
    id: 'lookAlike', group: 'A', severity: 'warning', source: 'new', formats: BOTH, scope: 'both', auto: false,
    label: { en: 'Look-alike content nearby', hu: 'Összetéveszthető tartalom egymás mellett' },
    test: { en: 'No stack of similar things (two experts, two sites, two reasons) in one paragraph', hu: 'Nincs egy bekezdésben több hasonló dolog (két szakértő, két helyszín, két ok)' },
  },

  {
    id: 'cleanScript', group: 'A', severity: 'blocker', source: '2_4', formats: BOTH, scope: 'task', auto: true,
    label: { en: 'Recording script not clean', hu: 'A felolvasandó szöveg nem tiszta' },
    test: { en: 'No markers, item numbers or stage directions are read aloud; every word is spoken', hu: 'Nem hangzik el jelölés, itemszám vagy szerzői utasítás; minden szó elhangzik' },
  },

  // B. Spacing and cue placement
  {
    id: 'answerMarked', group: 'B', severity: 'blocker', source: '2_4', formats: BOTH, scope: 'item', auto: true,
    label: { en: 'Answer point not marked in the script', hu: 'A válasz helye nincs jelölve a szövegben' },
    test: { en: 'Every item, the example too, has its marker at the exact words where it is spoken', hu: 'Minden itemnek (a példának is) jelölve van a helye ott, ahol elhangzik' },
  },
  {
    id: 'chronological', group: 'B', severity: 'blocker', source: '2_4', formats: BOTH, scope: 'item', auto: true,
    label: { en: 'Items out of audio order', hu: 'Az itemek sorrendje eltér a hanganyagétól' },
    test: { en: 'Items follow the exact order of the audioscript', hu: 'Az itemek pontosan a hangszöveg sorrendjét követik' },
  },
  {
    id: 'syllableGap', group: 'B', severity: 'blocker', source: '2_4', formats: BOTH, scope: 'item', auto: true,
    label: { en: 'Spacing too short', hu: 'Túl kicsi a távolság' },
    test: { en: 'At least 15 syllables between consecutive answers, including the lead-in before item 0', hu: 'Legalább 15 szótag két egymást követő válasz között, a 0. item előtt is' },
  },
  {
    id: 'callingWord', group: 'B', severity: 'blocker', source: '2_4', formats: NOTES, scope: 'item', auto: true,
    label: { en: 'Calling word missing or too far', hu: 'Hiányzó vagy túl távoli jelzőszó' },
    test: { en: 'A content word in both note and script, at most 3 words from the answer (target 0–1)', hu: 'Tartalmas szó a jegyzetben és a szövegben is, legfeljebb 3 szóra a választól (cél: 0–1)' },
  },
  {
    id: 'cueBeforeAnswer', group: 'B', severity: 'blocker', source: '2_4', formats: BOTH, scope: 'item', auto: true,
    label: { en: 'Answer comes before its cue', hu: 'A válasz a jelzés előtt hangzik el' },
    test: { en: 'The cue is spoken before the answer', hu: 'A jelzés a válasz előtt hangzik el' },
  },
  {
    id: 'finalItem', group: 'B', severity: 'blocker', source: '2_4', formats: NOTES, scope: 'item', auto: true,
    label: { en: 'Final item too hard', hu: 'Túl nehéz az utolsó item' },
    test: { en: 'Explicit, non-numeric, answer not pre-spoken, 15+ syllables of audio after it', hu: 'Egyértelmű, nem szám, a válasz nem hangzik el előbb, utána 15+ szótag szöveg' },
  },
  {
    id: 'numericAnswers', group: 'B', severity: 'blocker', source: '2_4', formats: NOTES, scope: 'both', auto: true,
    label: { en: 'Numeric answers clustered', hu: 'Egymáshoz közeli számválaszok' },
    test: { en: 'Not adjacent; two non-numeric items between; no same-kind figure within about 60 seconds', hu: 'Nem szomszédosak; köztük két nem szám item; 60 mp-en belül nincs hasonló szám' },
  },
  {
    id: 'evenDistribution', group: 'B', severity: 'warning', source: 'new', formats: BOTH, scope: 'task', auto: true,
    label: { en: 'Items unevenly spread', hu: 'Egyenetlen itemeloszlás' },
    test: { en: 'No stretch longer than about 80 words without an item; no cluster in one paragraph', hu: 'Nincs kb. 80 szónál hosszabb rész item nélkül; nincs csomósodás egy bekezdésben' },
  },
  {
    id: 'firstItemEarly', group: 'B', severity: 'warning', source: 'new', formats: BOTH, scope: 'item', auto: true,
    label: { en: 'First item too early', hu: 'Túl korai első item' },
    test: { en: 'Enough lead-in after the example for the candidate to settle', hu: 'Elég bevezető a példa után, hogy a vizsgázó ráhangolódjon' },
  },
  {
    id: 'tfMarkerPoint', group: 'B', severity: 'warning', source: 'new', formats: TF, scope: 'item', auto: false,
    label: { en: 'Needs two separated sentences', hu: 'Két különálló mondat összevetése kell' },
    test: { en: 'Each statement is checkable from one sentence', hu: 'Minden állítás egyetlen mondatból eldönthető' },
  },

  // C. Item design — notes
  {
    id: 'telegraphic', group: 'C', severity: 'blocker', source: '2_4', formats: NOTES, scope: 'item', auto: true,
    label: { en: 'Note not telegraphic', hu: 'Nem távirati stílusú jegyzet' },
    test: { en: 'About 2–6 words before the blank; not a disguised question', hu: 'Kb. 2–6 szó a hiány előtt; nem rejtett kérdés' },
  },
  {
    id: 'extractable', group: 'C', severity: 'blocker', source: '2_4', formats: NOTES, scope: 'item', auto: true,
    label: { en: 'Answer not directly extractable', hu: 'A válasz nem emelhető ki közvetlenül' },
    test: { en: 'No inference or reconstruction needed', hu: 'Nem kell következtetni vagy átfogalmazni' },
  },
  {
    id: 'answerLimits', group: 'C', severity: 'blocker', source: '2_4', formats: NOTES, scope: 'both', auto: true,
    label: { en: 'Numeric, name or repeated-root answer', hu: 'Szám-, név- vagy ismétlődő tövű válasz' },
    test: { en: 'At most 1–2 numeric answers; no proper-noun answers; no duplicate word roots across items', hu: 'Legfeljebb 1–2 számválasz; nincs tulajdonnév; nincs ismétlődő szótő' },
  },
  {
    id: 'wordLimit', group: 'C', severity: 'blocker', source: '2_4', formats: NOTES, scope: 'item', auto: true,
    label: { en: 'Too many words in the answer', hu: 'Túl sok szó a válaszban' },
    test: { en: '1 word at B1; up to 3 at B2/C1; the key respects it', hu: 'B1-en 1 szó; B2/C1-en legfeljebb 3; a kulcs is betartja' },
  },
  {
    id: 'notGeneric', group: 'C', severity: 'warning', source: '2_4', formats: BOTH, scope: 'item', auto: false,
    label: { en: 'Answer generic, not a topic/field word', hu: 'Általános válasz, nem téma-/szakszó' },
    test: { en: 'The answer is specific to this script, not an interchangeable filler phrase', hu: 'A válasz ehhez a szöveghez kötődik, nem bárhová illő töltelék' },
  },
  // C. Item design — true/false
  {
    id: 'singleClause', group: 'C', severity: 'blocker', source: '2_4', formats: TF, scope: 'item', auto: true,
    label: { en: 'Statement has more than one clause', hu: 'Egynél több tagmondat' },
    test: { en: 'One subject plus verb phrase, no subordinate clause (row 0 too)', hu: 'Egy alany és igei rész, nincs alárendelt tagmondat (a 0. sor is)' },
  },
  {
    id: 'figuresAsSpoken', group: 'C', severity: 'blocker', source: '2_4', formats: TF, scope: 'item', auto: true,
    label: { en: 'Figure re-expressed', hu: 'Átfogalmazott szám' },
    test: { en: 'Same unit and form as the audio; no conversion or "roughly double"', hu: 'Ugyanaz a mértékegység és forma, mint a hanganyagban; nincs átváltás' },
  },
  {
    id: 'trapType', group: 'C', severity: 'blocker', source: '2_4', formats: TF, scope: 'item', auto: true,
    label: { en: 'Forbidden trap (direction-flip, "not", double trap)', hu: 'Tiltott csapda (irányfordítás, „not”, dupla csapda)' },
    test: { en: 'No direction-flips, no crude "not", no stacked traps; conjunction traps at most 2 and localized', hu: 'Nincs irányfordítás, „not”-os tagadás, halmozott csapda; legfeljebb 2 lokalizált „both…and” csapda' },
  },
  {
    id: 'balancedKey', group: 'C', severity: 'blocker', source: '2_4', formats: TF, scope: 'task', auto: true,
    label: { en: 'Key lopsided', hu: 'Kiegyensúlyozatlan kulcs' },
    test: {
      en: 'Not all T or all F; T and F differ by at most 1 (4:3 or 3:4, 4:3 preferred); no more than 4 identical answers in a row',
      hu: 'Nem mind I vagy mind H; az I és H száma legfeljebb 1-gyel tér el (4:3 vagy 3:4, inkább 4:3); legfeljebb 4 azonos válasz egymás után',
    },
  },
  {
    id: 'newReferents', group: 'C', severity: 'warning', source: '2_4', formats: TF, scope: 'item', auto: false,
    label: { en: '"the" for a new referent', hu: '„the” új szereplőre' },
    test: { en: '"a" or "one", not "the", for something introduced as new', hu: 'Újként bevezetett dologra „a”/„one”, nem „the”' },
  },
  {
    id: 'statementLength', group: 'C', severity: 'warning', source: 'new', formats: TF, scope: 'item', auto: true,
    label: { en: 'Statement too long or short', hu: 'Túl hosszú vagy rövid állítás' },
    test: { en: 'About 8–14 words per statement', hu: 'Kb. 8–14 szó állításonként' },
  },
  {
    id: 'notVerbatim', group: 'C', severity: 'warning', source: '2_4', formats: TF, scope: 'item', auto: true,
    label: { en: 'Quotes the script word for word', hu: 'Szó szerint idézi a szöveget' },
    test: { en: 'Statements paraphrase; they never repeat audioscript wording', hu: 'Az állítások átfogalmaznak, nem ismétlik a hangszöveget' },
  },
  {
    id: 'independence', group: 'C', severity: 'blocker', source: 'new', formats: BOTH, scope: 'item', auto: false,
    label: { en: 'Item reveals or depends on another', hu: 'Az item elárul egy másikat vagy függ tőle' },
    test: { en: 'The answer to one item neither reveals nor depends on another', hu: 'Egy item válasza sem elárul, sem feltételez másikat' },
  },
  {
    id: 'itemWording', group: 'C', severity: 'blocker', source: 'reviewer', formats: BOTH, scope: 'item', auto: false,
    label: { en: 'Phrasing unclear or ambiguous', hu: 'Homályos vagy kétértelmű megfogalmazás' },
    test: { en: 'The item reads clearly and can only be understood one way', hu: 'Az item világos, és csak egyféleképpen érthető' },
  },

  // D. Wording vs key
  {
    id: 'grammaticalFit', group: 'D', severity: 'blocker', source: 'new', formats: NOTES, scope: 'item', auto: true,
    label: { en: "Answer doesn't fit the blank grammatically", hu: 'A válasz nyelvtanilag nem illik a hiányba' },
    test: { en: 'Fits in part of speech, number and article ("a ___" cannot take a plural)', hu: 'Szófajban, számban, névelőben illik („a ___” után nem lehet többes szám)' },
  },
  {
    id: 'uniqueAnswer', group: 'D', severity: 'blocker', source: 'new', formats: NOTES, scope: 'item', auto: false,
    label: { en: 'More than one answer fits', hu: 'Több válasz is illik' },
    test: { en: 'Only one word or phrase from the script fits the cue within about 60 seconds', hu: 'Kb. 60 mp-en belül csak egy szó vagy kifejezés illik a jelzésre' },
  },
  {
    id: 'cueTypeMatch', group: 'D', severity: 'blocker', source: 'new', formats: NOTES, scope: 'item', auto: false,
    label: { en: 'Note asks for a different kind of answer', hu: 'A jegyzet másfajta választ kér' },
    test: { en: 'The note signals the right category (cause, place, duration, quality)', hu: 'A jegyzet a jó kategóriát jelzi (ok, hely, időtartam, minőség)' },
  },
  {
    id: 'meaningPreserved', group: 'D', severity: 'blocker', source: 'new', formats: BOTH, scope: 'item', auto: false,
    label: { en: 'Paraphrase changes the meaning', hu: 'Az átfogalmazás megváltoztatja a jelentést' },
    test: { en: '"caused by ___" fails if the script only reports a correlation', hu: 'A „caused by ___” hibás, ha a szöveg csak összefüggést említ' },
  },
  {
    id: 'keyEqualsScript', group: 'D', severity: 'blocker', source: 'new', formats: NOTES, scope: 'item', auto: true,
    label: { en: 'Key differs from what is spoken', hu: 'A kulcs eltér az elhangzottól' },
    test: { en: 'Exact form spoken: same inflection, number, hyphenation', hu: 'Pontosan az elhangzott alak: ragozás, szám, kötőjel' },
  },
  {
    id: 'acceptedVariants', group: 'D', severity: 'blocker', source: 'new', formats: NOTES, scope: 'item', auto: false,
    label: { en: 'Missing accepted variants / hard spelling', hu: 'Hiányzó elfogadható változatok / nehéz helyesírás' },
    test: { en: 'Key lists synonyms, UK/US spellings, numerals vs words', hu: 'A kulcs felsorolja a szinonimákat, brit/amerikai írásmódot, számjegy/betű alakot' },
  },
  {
    id: 'tfTruthValue', group: 'D', severity: 'blocker', source: 'new', formats: TF, scope: 'item', auto: false,
    label: { en: 'Partly true / unclear truth value', hu: 'Részben igaz / nem egyértelmű' },
    test: { en: 'Wholly true or wholly false; absolutes only when the script settles them', hu: 'Teljesen igaz vagy teljesen hamis; abszolút szavak csak ha a szöveg eldönti' },
  },
  {
    id: 'fReasonAudible', group: 'D', severity: 'blocker', source: 'new', formats: TF, scope: 'item', auto: false,
    label: { en: 'False only because "not mentioned"', hu: 'Csak azért hamis, mert „nem hangzik el”' },
    test: { en: 'The false element is verifiable in the script', hu: 'A hamis elem a szöveg alapján ellenőrizhető' },
  },
  {
    id: 'exampleRow', group: 'D', severity: 'warning', source: 'new', formats: BOTH, scope: 'item', auto: true,
    label: { en: 'Example row breaks the rules', hu: 'A példasor nem követi a szabályokat' },
    test: { en: 'The example follows the same rules as live items and agrees with the key', hu: 'A példa ugyanazokat a szabályokat követi, és egyezik a kulccsal' },
  },

  // E. Level fit
  {
    id: 'itemCount', group: 'E', severity: 'blocker', source: '2_4', formats: BOTH, scope: 'task', auto: true,
    label: { en: 'Wrong number of items', hu: 'Rossz itemszám' },
    test: { en: 'T/F 7 + example; notes B1 8, B2/C1 13 + example', hu: 'I/H 7 + példa; jegyzet B1 8, B2/C1 13 + példa' },
  },
  {
    id: 'answerVocabulary', group: 'E', severity: 'warning', source: 'new', formats: BOTH, scope: 'item', auto: false,
    label: { en: 'Answer word above the level', hu: 'Szinthez képest nehéz válaszszó' },
    test: { en: 'B1: no rare words or irregular spellings; C1: low-frequency words if spelled regularly', hu: 'B1: nincs ritka szó vagy rendhagyó írásmód; C1: ritka szó, ha szabályos az írása' },
  },
  {
    id: 'topicAccessibility', group: 'E', severity: 'warning', source: 'new', formats: BOTH, scope: 'task', auto: false,
    label: { en: 'Needs specialist knowledge', hu: 'Szakismeretet igényel' },
    test: { en: 'Field vocabulary is defined in the script or can be heard', hu: 'A szakszavak a szövegből érthetők' },
  },
  {
    id: 'difficultyBalance', group: 'E', severity: 'warning', source: 'new', formats: BOTH, scope: 'task', auto: false,
    label: { en: 'Difficulty unbalanced', hu: 'Kiegyensúlyozatlan nehézség' },
    test: { en: 'A mix of easy, medium and hard items; the hardest are not all in the last quarter', hu: 'Könnyű, közepes és nehéz itemek keveréke; a legnehezebbek nem mind a végén' },
  },

  // F. Fairness and layout
  {
    id: 'notGuessable', group: 'F', severity: 'blocker', source: 'new', formats: BOTH, scope: 'item', auto: false,
    label: { en: 'Guessable without listening', hu: 'Hallgatás nélkül kitalálható' },
    test: { en: 'Not answerable from general knowledge or guessing', hu: 'Nem válaszolható meg általános tudásból vagy találgatással' },
  },
  {
    id: 'topicSafety', group: 'F', severity: 'warning', source: 'new', formats: BOTH, scope: 'task', auto: false,
    label: { en: 'Biased, distressing or dated topic', hu: 'Elfogult, megterhelő vagy elavult téma' },
    test: { en: 'No culturally biased, distressing or dated content', hu: 'Nincs kulturálisan elfogult, megterhelő vagy elavult tartalom' },
  },
  {
    id: 'audioClarity', group: 'F', severity: 'warning', source: 'new', formats: BOTH, scope: 'both', auto: false,
    label: { en: 'Audio unclear', hu: 'Nem tiszta hanganyag' },
    test: { en: 'Distinct voices; TTS pronunciation of figures, abbreviations and names checked', hu: 'Elkülönülő hangok; számok, rövidítések, nevek kiejtése ellenőrizve' },
  },
  {
    id: 'instructionWording', group: 'F', severity: 'blocker', source: '2_4', formats: BOTH, scope: 'task', auto: true,
    label: { en: 'Non-standard instruction', hu: 'Nem szabványos utasítás' },
    test: { en: 'Matches the standard sentence, including the T/F disqualification note', hu: 'Megegyezik a szabványos mondattal, az I/H kizárási megjegyzéssel együtt' },
  },
  {
    id: 'environmentRule', group: 'F', severity: 'blocker', source: 'reviewer', formats: NOTES, scope: 'task', auto: true,
    label: { en: 'Environment topic as notes task', hu: 'Környezetvédelmi téma jegyzetfeladatként' },
    test: { en: 'Environment and environmental-protection topics are True/False only', hu: 'Környezeti és környezetvédelmi téma csak Igaz/Hamis lehet' },
  },
]

export const CRITERIA_BY_ID = new Map(CRITERIA.map((c) => [c.id, c]))

/** "Other" — the reviewer explains in the note. */
export const OTHER_REASON = 'other'

/** Reasons a testing teacher can tick when rejecting one item of a task in this format. */
export function itemReasons(format: ListeningFormat): Criterion[] {
  return CRITERIA.filter((c) => c.formats.includes(format) && c.scope !== 'task')
}

/** Reasons for the whole task (script-level problems). */
export function taskReasons(format: ListeningFormat): Criterion[] {
  return CRITERIA.filter((c) => c.formats.includes(format) && c.scope !== 'item')
}

export function validReasonIds(): Set<string> {
  return new Set([...CRITERIA.map((c) => c.id), OTHER_REASON])
}
