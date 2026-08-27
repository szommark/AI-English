// Pronunciation Session MVP curriculum — hand-authored, static content (no LLM generation,
// see docs/pronunciation-session-brief.md). Grounded in the author's own dissertation
// (Hungarian learners, classroom minimal-pair + dictation testing) and Nádasdy's
// "Background to English Pronunciation" (2006). Placeholder-quality wording — meant to be
// refined against the thesis's own authentic examples, same spirit as scenarios.ts's own
// "not yet reviewed by a native speaker" disclaimer.
//
// oddOneOutSets always follow "2 words share the non-target sound, 1 has the target sound"
// (oddIndex points at the one with the target sound) — this is a deliberate design choice
// to avoid the thesis-flagged booth/bought/tenth mistake, where the shared trait was
// wrongly assumed to be the final phoneme. Here the shared trait is always the specific
// onset/vowel/stress pattern being tested, unrelated to word length or ending.

export interface MinimalPair {
  words: [string, string]
}

export interface OddOneOutSet {
  words: [string, string, string]
  oddIndex: 0 | 1 | 2
}

export interface PronunciationSoundItem {
  id: string
  title: string
  titleHu: string
  ipa: string
  noteHu: string
  minimalPairs: MinimalPair[]
  oddOneOutSets: OddOneOutSet[]
  dictationSentences: string[]
  productionSentences: string[]
}

export const pronunciationCurriculum: PronunciationSoundItem[] = [
  {
    id: 'th-sounds',
    title: 'Th sounds',
    titleHu: 'A "th" hangok',
    ipa: 'θ / ð',
    noteHu: 'A magyarban nincs ilyen hang — általában t/d vagy sz/z hanggal helyettesítjük.',
    minimalPairs: [
      { words: ['thin', 'tin'] },
      { words: ['think', 'sink'] },
      { words: ['bath', 'bat'] },
    ],
    oddOneOutSets: [
      { words: ['tin', 'ten', 'thin'], oddIndex: 2 },
      { words: ['bat', 'back', 'bath'], oddIndex: 2 },
      { words: ['tank', 'sank', 'thank'], oddIndex: 2 },
    ],
    dictationSentences: ['I think the third thing is true.', 'This is the thirty-third floor.'],
    productionSentences: ['Think about the three thin threads.', 'That thing is worth thirty dollars.'],
  },
  {
    id: 'w-vs-v',
    title: 'W vs V',
    titleHu: 'W és V hangok',
    ipa: 'w / v',
    noteHu: 'A magyar beszélők gyakran összemossák ezt a két hangot, és mindkettőt "v"-nek ejtik.',
    minimalPairs: [
      { words: ['wine', 'vine'] },
      { words: ['west', 'vest'] },
      { words: ['wet', 'vet'] },
    ],
    oddOneOutSets: [
      { words: ['vest', 'van', 'west'], oddIndex: 2 },
      { words: ['vine', 'vet', 'wine'], oddIndex: 2 },
      { words: ['very', 'van', 'wet'], oddIndex: 2 },
    ],
    dictationSentences: ['We visited the village in November.', 'The van went west on Vine Street.'],
    productionSentences: ['Vera waved at the very tall window.', 'We watched the van drive away.'],
  },
  {
    id: 'ae-vs-e',
    title: 'Æ vs E',
    titleHu: 'Æ és E hangok',
    ipa: 'æ / e',
    noteHu: 'A magyarban nincs önálló "æ" hang — könnyen összekeverjük az "e" hanggal (pl. head/had).',
    minimalPairs: [
      { words: ['head', 'had'] },
      { words: ['dead', 'dad'] },
      { words: ['bed', 'bad'] },
    ],
    oddOneOutSets: [
      { words: ['head', 'bed', 'had'], oddIndex: 2 },
      { words: ['dead', 'said', 'dad'], oddIndex: 2 },
      { words: ['bed', 'ten', 'bad'], oddIndex: 2 },
    ],
    dictationSentences: ['The man had a bad accident.', 'Ten men said they were sad.'],
    productionSentences: ['Dad had a bad hat and a red bag.', 'Ann said the man ran back again.'],
  },
  {
    id: 'schwa',
    title: 'Schwa',
    titleHu: 'A "schwa" hang',
    ipa: 'ə',
    noteHu:
      'A magyarban nincs redukált (elmosódott) magánhangzó — minden szótagot tisztán ejtünk, ez nehezíti a hangsúlytalan szótagok felismerését.',
    minimalPairs: [
      { words: ['affect', 'effect'] },
      { words: ['accept', 'except'] },
      { words: ['allusion', 'illusion'] },
    ],
    oddOneOutSets: [
      { words: ['about', 'banana', 'but'], oddIndex: 2 },
      { words: ['sofa', 'above', 'stop'], oddIndex: 2 },
      { words: ['aroma', 'along', 'long'], oddIndex: 2 },
    ],
    dictationSentences: ['About an hour later, we arrived.', 'There was a banana on the table.'],
    productionSentences: ['I asked about the problem again.', 'She was away for about a week.'],
  },
  {
    id: 'word-stress',
    title: 'Word stress placement',
    titleHu: 'Szóhangsúly',
    ipa: 'ˈ (szóhangsúly)',
    noteHu:
      'A magyarban mindig az első szótag hangsúlyos — az angolban viszont a hangsúly szavanként változik, és a hangsúlytalan szótag könnyen "eltűnik" a fülünk számára.',
    minimalPairs: [
      { words: ['about', 'but'] },
      { words: ['along', 'long'] },
      { words: ['again', 'gain'] },
    ],
    oddOneOutSets: [
      { words: ['present', 'object', 'about'], oddIndex: 2 },
      { words: ['table', 'window', 'again'], oddIndex: 2 },
      { words: ['happy', 'city', 'alone'], oddIndex: 2 },
    ],
    dictationSentences: ["It's about eleven o'clock now.", 'She wrote a report about the project.'],
    productionSentences: ['Please tell me about your holiday.', 'What is this present about?'],
  },
  {
    id: 'weak-forms',
    title: 'Weak forms',
    titleHu: 'Gyenge alakok',
    ipa: 'gyenge alakok',
    noteHu:
      'A kötőszók és segédigék (some, are, I...) a folyamatos beszédben legyengülnek — ez teljesen más szónak hangozhat egy magyar fülnek.',
    minimalPairs: [
      { words: ['some', 'send'] },
      { words: ['are', 'of'] },
      { words: ['I', 'a'] },
    ],
    oddOneOutSets: [
      { words: ['send', 'ten', 'some'], oddIndex: 2 },
      { words: ['of', 'off', 'are'], oddIndex: 2 },
      { words: ['a', 'an', 'I'], oddIndex: 2 },
    ],
    dictationSentences: ["There's some milk in the fridge.", 'We are going to the market.'],
    productionSentences: ['I can help you if you want.', 'There are some books for you.'],
  },
]

export function getSoundItem(id: string): PronunciationSoundItem | undefined {
  return pronunciationCurriculum.find((item) => item.id === id)
}
