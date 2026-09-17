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
//
// dictationSentences.keyWords are the sentence's own words that carry the target sound —
// hand-picked per sentence (same placeholder-quality caveat as the rest of this file), used
// to score the dictation stage's sound-specific tally (e.g. "4/4 th") separately from the
// overall word count.

export interface MinimalPair {
  words: [string, string]
}

export interface OddOneOutSet {
  words: [string, string, string]
  oddIndex: 0 | 1 | 2
}

export interface DictationSentence {
  text: string
  keyWords: string[]
}

export interface PronunciationSoundItem {
  id: string
  title: string
  titleHu: string
  ipa: string
  noteHu: string
  /** Short label for the dictation stage's sound-specific score, e.g. "th", "w/v". */
  dictationLabel: string
  minimalPairs: MinimalPair[]
  oddOneOutSets: OddOneOutSet[]
  dictationSentences: DictationSentence[]
  productionSentences: string[]
}

export const pronunciationCurriculum: PronunciationSoundItem[] = [
  {
    id: 'th-sounds',
    title: 'Th sounds',
    titleHu: 'A "th" hangok',
    ipa: 'θ / ð',
    noteHu: 'A magyarban nincs ilyen hang — általában t/d vagy sz/z hanggal helyettesítjük.',
    dictationLabel: 'th',
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
    dictationSentences: [
      { text: 'I think the third thing is true.', keyWords: ['think', 'the', 'third', 'thing'] },
      { text: 'This is the thirty-third floor.', keyWords: ['This', 'the', 'thirty-third'] },
    ],
    productionSentences: ['Think about the three thin threads.', 'That thing is worth thirty dollars.'],
  },
  {
    id: 'w-vs-v',
    title: 'W vs V',
    titleHu: 'W és V hangok',
    ipa: 'w / v',
    noteHu: 'A magyar beszélők gyakran összemossák ezt a két hangot, és mindkettőt "v"-nek ejtik.',
    dictationLabel: 'w/v',
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
    dictationSentences: [
      { text: 'We visited the village in November.', keyWords: ['We', 'visited', 'village', 'November'] },
      { text: 'The van went west on Vine Street.', keyWords: ['van', 'went', 'west', 'Vine'] },
    ],
    productionSentences: ['Vera waved at the very tall window.', 'We watched the van drive away.'],
  },
  {
    id: 'ae-vs-e',
    title: 'Æ vs E',
    titleHu: 'Æ és E hangok',
    ipa: 'æ / e',
    noteHu: 'A magyarban nincs önálló "æ" hang — könnyen összekeverjük az "e" hanggal (pl. head/had).',
    dictationLabel: 'æ/e',
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
    dictationSentences: [
      { text: 'The man had a bad accident.', keyWords: ['man', 'had', 'bad', 'accident'] },
      { text: 'Ten men said they were sad.', keyWords: ['Ten', 'men', 'said', 'sad'] },
    ],
    productionSentences: ['Dad had a bad hat and a red bag.', 'Ann said the man ran back again.'],
  },
  {
    id: 'schwa',
    title: 'Schwa',
    titleHu: 'A "schwa" hang',
    ipa: 'ə',
    noteHu:
      'A magyarban nincs redukált (elmosódott) magánhangzó — minden szótagot tisztán ejtünk, ez nehezíti a hangsúlytalan szótagok felismerését.',
    dictationLabel: 'ə',
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
    dictationSentences: [
      { text: 'About an hour later, we arrived.', keyWords: ['About', 'an', 'arrived'] },
      { text: 'There was a banana on the table.', keyWords: ['a', 'banana', 'the', 'table'] },
    ],
    productionSentences: ['I asked about the problem again.', 'She was away for about a week.'],
  },
  {
    id: 'word-stress',
    title: 'Word stress placement',
    titleHu: 'Szóhangsúly',
    ipa: 'ˈ (szóhangsúly)',
    noteHu:
      'A magyarban mindig az első szótag hangsúlyos — az angolban viszont a hangsúly szavanként változik, és a hangsúlytalan szótag könnyen "eltűnik" a fülünk számára.',
    dictationLabel: 'hangsúly',
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
    dictationSentences: [
      { text: "It's about eleven o'clock now.", keyWords: ['about', 'eleven', "o'clock"] },
      { text: 'She wrote a report about the project.', keyWords: ['report', 'about', 'project'] },
    ],
    productionSentences: ['Please tell me about your holiday.', 'What is this present about?'],
  },
  {
    id: 'weak-forms',
    title: 'Weak forms',
    titleHu: 'Gyenge alakok',
    ipa: 'gyenge alakok',
    noteHu:
      'A kötőszók és segédigék (some, are, I...) a folyamatos beszédben legyengülnek — ez teljesen más szónak hangozhat egy magyar fülnek.',
    dictationLabel: 'gyenge alak',
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
    dictationSentences: [
      { text: "There's some milk in the fridge.", keyWords: ['some', 'the'] },
      { text: 'We are going to the market.', keyWords: ['are', 'to', 'the'] },
    ],
    productionSentences: ['I can help you if you want.', 'There are some books for you.'],
  },
]

export function getSoundItem(id: string): PronunciationSoundItem | undefined {
  return pronunciationCurriculum.find((item) => item.id === id)
}
