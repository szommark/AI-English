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
    // Schwa only exists in unstressed syllables, so a true single-phoneme minimal pair
    // (all else equal) would require same-spelling stress-shift homographs (e.g. "content"
    // the noun vs "content" the adjective), which the two-button forced-choice UI can't show
    // distinctly. affect/effect, accept/except and allusion/illusion (the previous set) were
    // rejected as near-homophones even in careful speech — the contrast is too subtle to
    // fairly test. Using distinct-spelling stress-shift word pairs instead, where the same
    // root's stressed vowel becomes schwa (or vice versa) — a standard ESL teaching example.
    minimalPairs: [
      { words: ['desert', 'dessert'] },
      { words: ['human', 'humane'] },
      { words: ['personal', 'personnel'] },
    ],
    // Previous sets had this backwards: 'about'/'banana' (grouped as the shared "non-target")
    // in fact both contain schwa, while 'but'/'long' (marked as the odd one with the target
    // sound) don't reduce at all. Rebuilt so the two "shared" words are simple, fully-stressed
    // monosyllables with no reduced vowel, and the odd one out is a multisyllabic word whose
    // unstressed syllable is unambiguously schwa.
    oddOneOutSets: [
      { words: ['cup', 'bag', 'about'], oddIndex: 2 },
      { words: ['sun', 'red', 'sofa'], oddIndex: 2 },
      { words: ['top', 'big', 'banana'], oddIndex: 2 },
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
  // ---- Hard sounds for Hungarian speakers (previously phase 2): r, dark l, oʊ, ŋ ----
  // These four pools are deliberately larger than the ROUNDS a drill draws (DrillFunnel picks a
  // random subset), so repeat visits don't replay the same three words. R and dark L are each
  // other's contrast (fear/feel, ball/bar) plus the onset r/l pairs; oʊ contrasts with short o
  // (coat/cot); ŋ contrasts with n (sing/sin) and with g (sang/sag).
  {
    id: 'r-sound',
    title: 'English R',
    titleHu: 'Az angol "r" hang',
    ipa: 'r',
    noteHu:
      'A magyar r pergő vagy kopogó hang, az angol r-nél viszont a nyelv semmihez sem ér hozzá. A tanulók gyakran magyar r-t mondanak, vagy l-nek hallják.',
    dictationLabel: 'r',
    minimalPairs: [
      { words: ['red', 'led'] },
      { words: ['right', 'light'] },
      { words: ['rock', 'lock'] },
      { words: ['road', 'load'] },
      { words: ['fear', 'feel'] },
    ],
    oddOneOutSets: [
      { words: ['led', 'lid', 'red'], oddIndex: 2 },
      { words: ['lock', 'lap', 'rock'], oddIndex: 2 },
      { words: ['light', 'lane', 'right'], oddIndex: 2 },
      { words: ['load', 'lamp', 'road'], oddIndex: 2 },
    ],
    dictationSentences: [
      { text: 'The red rose grew right by the road.', keyWords: ['red', 'rose', 'right', 'road'] },
      { text: 'Rita ran around the rocky river.', keyWords: ['Rita', 'ran', 'around', 'rocky', 'river'] },
    ],
    productionSentences: ['Rita read a red book right away.', 'The rabbit ran across the road.'],
  },
  {
    id: 'dark-l',
    title: 'Dark L',
    titleHu: 'A "sötét l" hang',
    ipa: 'ɫ',
    noteHu:
      'A magyar l mindig tiszta, világos hangzású. Az angol szótagvégi l "sötét": a nyelv hátulja megemelkedik, a hang üregesebb, magánhangzó-szerű lesz.',
    dictationLabel: 'sötét l',
    minimalPairs: [
      { words: ['feel', 'fear'] },
      { words: ['ball', 'bar'] },
      { words: ['wall', 'war'] },
      { words: ['pool', 'poor'] },
      { words: ['bowl', 'bore'] },
    ],
    oddOneOutSets: [
      { words: ['bar', 'bat', 'ball'], oddIndex: 2 },
      { words: ['fear', 'feed', 'feel'], oddIndex: 2 },
      { words: ['war', 'wax', 'wall'], oddIndex: 2 },
      { words: ['tea', 'ten', 'tell'], oddIndex: 2 },
    ],
    dictationSentences: [
      { text: 'The milk fell off the wall.', keyWords: ['milk', 'fell', 'wall'] },
      { text: 'We feel well after a cold meal.', keyWords: ['feel', 'well', 'cold', 'meal'] },
    ],
    productionSentences: ['The tall child fell off the old wall.', 'Bill will sell the small bell.'],
  },
  {
    id: 'ou-vs-o',
    title: 'OU vs O',
    titleHu: 'Az "oʊ" és az "o" hang',
    ipa: 'oʊ / ɒ',
    noteHu:
      'A magyar o tiszta, változatlan hang. Az angol oʊ két részből áll: o-val indul, és u felé csúszik. A tanulók ezt sima o-nak mondják, így a coat és a cot egyformán hangzik.',
    dictationLabel: 'oʊ',
    minimalPairs: [
      { words: ['coat', 'cot'] },
      { words: ['note', 'not'] },
      { words: ['hope', 'hop'] },
      { words: ['road', 'rod'] },
      { words: ['post', 'pot'] },
    ],
    oddOneOutSets: [
      { words: ['cot', 'cop', 'coat'], oddIndex: 2 },
      { words: ['not', 'hot', 'note'], oddIndex: 2 },
      { words: ['hop', 'top', 'hope'], oddIndex: 2 },
      { words: ['rod', 'nod', 'road'], oddIndex: 2 },
    ],
    dictationSentences: [
      { text: 'Joe wrote a note on the coat.', keyWords: ['Joe', 'wrote', 'note', 'coat'] },
      { text: 'I hope we go home slowly.', keyWords: ['hope', 'go', 'home', 'slowly'] },
    ],
    productionSentences: ['Joe hopes to go home alone.', 'Oh no, the boat won\'t go slow.'],
  },
  {
    id: 'ng-sound',
    title: 'NG sound',
    titleHu: 'Az "ng" (ŋ) hang',
    ipa: 'ŋ',
    noteHu:
      'A magyarban az ŋ csak k/g előtt jelenik meg (pl. "bank"). Az angol szóvégi ng-ben nincs külön g: a tanulók vagy n-t mondanak (sin), vagy kemény g-t tesznek a végére (sing-g).',
    dictationLabel: 'ng',
    minimalPairs: [
      { words: ['sing', 'sin'] },
      { words: ['thing', 'thin'] },
      { words: ['wing', 'win'] },
      { words: ['sang', 'sag'] },
      { words: ['long', 'log'] },
      { words: ['hung', 'hug'] },
    ],
    oddOneOutSets: [
      { words: ['ran', 'man', 'rang'], oddIndex: 2 },
      { words: ['sag', 'log', 'song'], oddIndex: 2 },
      { words: ['ban', 'tan', 'bang'], oddIndex: 2 },
      { words: ['rug', 'bag', 'hung'], oddIndex: 2 },
    ],
    dictationSentences: [
      { text: 'I am singing a long song this morning.', keyWords: ['singing', 'long', 'song', 'morning'] },
      { text: 'The young king was bringing a ring.', keyWords: ['young', 'king', 'bringing', 'ring'] },
    ],
    productionSentences: ['The king is singing a long song.', 'Everything is going wrong this morning.'],
  },
]

export function getSoundItem(id: string): PronunciationSoundItem | undefined {
  return pronunciationCurriculum.find((item) => item.id === id)
}
