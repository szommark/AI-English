// Pronunciation Chart phoneme inventory — hand-authored, static content (no LLM generation),
// same spirit as pronunciationCurriculum.ts. General American transcription throughout
// (matches the curriculum's own oʊ/ɜr usage); the UK/US accent toggle changes which TTS
// voice and Azure recognition locale get used, not the chart's IPA labels.
//
// Difficulty tiering (hungarianDifficulty) follows the phonetic-sound-chart-design.md
// reconciliation, §4: Critical + Challenging sit above a single divider (no color/size
// differentiation between the two), Straightforward below. The five explicit grounded
// items (th-sounds, w-vs-v, æ-vs-e, schwa) come from the author's dissertation and
// Nádasdy's "Background to English Pronunciation" (2006), same as pronunciationCurriculum.ts.
// Everything else is a first-pass placeholder using well-established Hungarian/English
// contrastive-phonetics facts (vowel length-vs-quality mismatch, absence of dental
// fricatives, absence of a dark l, etc.) — NOT claimed as dissertation findings, and
// flagged for linguistic review same as the curriculum file's own disclaimer.

export type PhonemeCategory = 'consonant' | 'monophthong' | 'diphthong'
export type HungarianDifficulty = 'critical' | 'challenging' | 'straightforward'

export interface ExampleWord {
  word: string
  /** Exact substring of `word` that spells the target sound, for highlighting in the tile/detail view. */
  highlight: string
}

export interface MinimalPair {
  a: string
  b: string
}

export interface Articulation {
  /** Short plain-language cue shown even before the Phase 3 animated rig exists. */
  description: string
  voicing?: 'voiced' | 'voiceless'
  /** Consonants only. */
  manner?: 'stop' | 'fricative' | 'affricate' | 'nasal' | 'approximant' | 'lateral'
  place?: 'bilabial' | 'labiodental' | 'dental' | 'alveolar' | 'postalveolar' | 'palatal' | 'velar' | 'glottal'
  /** Vowels only. */
  tonguePosition?: 'high-front' | 'mid-front' | 'low-front' | 'central' | 'high-back' | 'mid-back' | 'low-back'
  lipRounding?: 'rounded' | 'unrounded'
}

export interface Phoneme {
  id: string
  ipaSymbol: string
  category: PhonemeCategory
  hungarianDifficulty: HungarianDifficulty
  hungarianNote: string
  hungarianNoteHu: string
  exampleWords: ExampleWord[]
  minimalPairs?: MinimalPair[]
  articulation: Articulation
  /** Matches an id in pronunciationCurriculum.ts, when a drill funnel already exists for this sound. */
  curriculumId?: string
}

export const phonemes: Phoneme[] = [
  // ---- Critical (above the line) ----
  {
    id: 'th-voiceless',
    ipaSymbol: 'θ',
    category: 'consonant',
    hungarianDifficulty: 'critical',
    hungarianNote: 'No equivalent sound in Hungarian — usually replaced with t/d or sz/z.',
    hungarianNoteHu: 'A magyarban nincs ilyen hang — általában t/d vagy sz/z hanggal helyettesítjük.',
    exampleWords: [
      { word: 'think', highlight: 'th' },
      { word: 'bath', highlight: 'th' },
    ],
    minimalPairs: [{ a: 'thin', b: 'tin' }, { a: 'think', b: 'sink' }],
    articulation: {
      description: 'Tongue tip between the teeth, push air through with no voicing.',
      voicing: 'voiceless',
      manner: 'fricative',
      place: 'dental',
    },
    curriculumId: 'th-sounds',
  },
  {
    id: 'th-voiced',
    ipaSymbol: 'ð',
    category: 'consonant',
    hungarianDifficulty: 'critical',
    hungarianNote: 'No equivalent sound in Hungarian — usually replaced with d/z.',
    hungarianNoteHu: 'A magyarban nincs ilyen hang — általában d vagy z hanggal helyettesítjük.',
    exampleWords: [
      { word: 'this', highlight: 'th' },
      { word: 'breathe', highlight: 'th' },
    ],
    minimalPairs: [{ a: 'this', b: 'dis' }],
    articulation: {
      description: 'Same tongue position as θ, but with the voice box buzzing.',
      voicing: 'voiced',
      manner: 'fricative',
      place: 'dental',
    },
    curriculumId: 'th-sounds',
  },
  {
    id: 'ae',
    ipaSymbol: 'æ',
    category: 'monophthong',
    hungarianDifficulty: 'critical',
    hungarianNote: 'Hungarian has no separate æ vowel — easily confused with e (head/had).',
    hungarianNoteHu: 'A magyarban nincs önálló "æ" hang — könnyen összekeverjük az "e" hanggal (pl. head/had).',
    exampleWords: [
      { word: 'cat', highlight: 'a' },
      { word: 'bad', highlight: 'a' },
    ],
    minimalPairs: [{ a: 'head', b: 'had' }, { a: 'bed', b: 'bad' }],
    articulation: {
      description: 'Jaw drops low, mouth spread wide — lower and wider than a Hungarian "e".',
      tonguePosition: 'low-front',
      lipRounding: 'unrounded',
    },
    curriculumId: 'ae-vs-e',
  },
  {
    id: 'schwa',
    ipaSymbol: 'ə',
    category: 'monophthong',
    hungarianDifficulty: 'critical',
    hungarianNote: 'Hungarian has no reduced vowel — every syllable is pronounced clearly, which makes unstressed English syllables hard to hear.',
    hungarianNoteHu: 'A magyarban nincs redukált (elmosódott) magánhangzó — minden szótagot tisztán ejtünk, ez nehezíti a hangsúlytalan szótagok felismerését.',
    exampleWords: [
      { word: 'about', highlight: 'a' },
      { word: 'sofa', highlight: 'a' },
    ],
    minimalPairs: [{ a: 'affect', b: 'effect' }],
    articulation: {
      description: 'Tongue and lips relax to the middle of the mouth — the "laziest" vowel, only in unstressed syllables.',
      tonguePosition: 'central',
      lipRounding: 'unrounded',
    },
    curriculumId: 'schwa',
  },
  {
    id: 'w',
    ipaSymbol: 'w',
    category: 'consonant',
    hungarianDifficulty: 'critical',
    hungarianNote: 'Hungarian speakers often merge this with v, pronouncing both as "v".',
    hungarianNoteHu: 'A magyar beszélők gyakran összemossák ezt a két hangot, és mindkettőt "v"-nek ejtik.',
    exampleWords: [
      { word: 'west', highlight: 'w' },
      { word: 'wine', highlight: 'w' },
    ],
    minimalPairs: [{ a: 'wine', b: 'vine' }, { a: 'west', b: 'vest' }],
    articulation: {
      description: 'Round the lips into a tight circle, no contact between teeth and lip — unlike v.',
      voicing: 'voiced',
      manner: 'approximant',
      place: 'bilabial',
    },
    curriculumId: 'w-vs-v',
  },
  {
    id: 'r',
    ipaSymbol: 'r',
    category: 'consonant',
    hungarianDifficulty: 'critical',
    hungarianNote: 'Hungarian r is a short tap or trill made with the tongue tip against the gum ridge; English r has no tongue contact at all, which feels unnatural at first.',
    hungarianNoteHu: 'A magyar "r" pergő hang, a nyelv hozzáér a fogmedret; az angol "r"-nél a nyelv nem ér hozzá semmihez, ami eleinte szokatlan.',
    exampleWords: [
      { word: 'red', highlight: 'r' },
      { word: 'car', highlight: 'r' },
    ],
    articulation: {
      description: 'Curl or bunch the tongue up without touching the roof of the mouth; lips slightly rounded.',
      voicing: 'voiced',
      manner: 'approximant',
      place: 'postalveolar',
    },
  },
  {
    id: 'dark-l',
    ipaSymbol: 'ɫ',
    category: 'consonant',
    hungarianDifficulty: 'critical',
    hungarianNote: 'Hungarian l is always "clear" (bright); English l at the end of a syllable is "dark" — the back of the tongue lifts, giving it a hollow, almost vowel-like quality.',
    hungarianNoteHu: 'A magyar "l" mindig "tiszta" hangzású; az angol szóvégi "l" ún. "sötét l" — a nyelv hátulja megemelkedik, ettől üregesebb, magánhangzó-szerű lesz.',
    exampleWords: [
      { word: 'ball', highlight: 'll' },
      { word: 'milk', highlight: 'l' },
    ],
    minimalPairs: [{ a: 'feel', b: 'feed' }],
    articulation: {
      description: 'Tongue tip touches the gum ridge like a normal l, but the back of the tongue also rises toward the soft palate.',
      voicing: 'voiced',
      manner: 'lateral',
      place: 'alveolar',
    },
  },
  {
    id: 'nurse',
    ipaSymbol: 'ɜr',
    category: 'monophthong',
    hungarianDifficulty: 'critical',
    hungarianNote: 'Combines the difficulty of English r with a vowel quality Hungarian doesn’t have — often flattened toward a Hungarian "er".',
    hungarianNoteHu: 'Az angol "r" nehézségét egy olyan magánhangzóval kombinálja, amely a magyarban nem létezik — gyakran magyaros "er"-ré egyszerűsödik.',
    exampleWords: [
      { word: 'bird', highlight: 'ir' },
      { word: 'nurse', highlight: 'ur' },
    ],
    articulation: {
      description: 'Tongue bunched for r while the vowel stays central — one continuous r-colored vowel, not vowel-then-r.',
      tonguePosition: 'central',
      lipRounding: 'unrounded',
    },
  },
  {
    id: 'ng',
    ipaSymbol: 'ŋ',
    category: 'consonant',
    hungarianDifficulty: 'critical',
    hungarianNote: 'Hungarian only produces this sound automatically before k/g (e.g. "bank"); a word-final ŋ with no following g (as in "sing") is unfamiliar, and learners often add a hard g.',
    hungarianNoteHu: 'A magyarban ez a hang csak k/g előtt jelenik meg automatikusan (pl. "bank"); a szóvégi ŋ g nélkül (pl. "sing") szokatlan, és a tanulók gyakran kemény g-t tesznek utána.',
    exampleWords: [
      { word: 'sing', highlight: 'ng' },
      { word: 'morning', highlight: 'ng' },
    ],
    minimalPairs: [{ a: 'sing', b: 'sin' }],
    articulation: {
      description: 'Back of the tongue against the soft palate, air and voice through the nose, no released g.',
      voicing: 'voiced',
      manner: 'nasal',
      place: 'velar',
    },
  },

  // ---- Challenging (above the line) ----
  {
    id: 'strut',
    ipaSymbol: 'ʌ',
    category: 'monophthong',
    hungarianDifficulty: 'challenging',
    hungarianNote: 'Sits between Hungarian a and o — no exact match, often replaced with a Hungarian "a".',
    hungarianNoteHu: 'A magyar "a" és "o" közé esik — nincs pontos megfelelője, gyakran magyaros "a"-val helyettesítik.',
    exampleWords: [
      { word: 'cup', highlight: 'u' },
      { word: 'love', highlight: 'o' },
    ],
    articulation: {
      description: 'Mouth half-open, tongue central and slightly back, no lip rounding.',
      tonguePosition: 'central',
      lipRounding: 'unrounded',
    },
  },
  {
    id: 'kit',
    ipaSymbol: 'ɪ',
    category: 'monophthong',
    hungarianDifficulty: 'challenging',
    hungarianNote: 'Hungarian short i is tenser and closer to English iː — English ɪ is more relaxed and lower, which is easy to miss.',
    hungarianNoteHu: 'A magyar rövid "i" feszesebb és közelebb áll az angol iː-hez — az angol ɪ lazább és nyitottabb, ezt könnyű elvéteni.',
    exampleWords: [
      { word: 'sit', highlight: 'i' },
      { word: 'bit', highlight: 'i' },
    ],
    minimalPairs: [{ a: 'ship', b: 'sheep' }],
    articulation: {
      description: 'Tongue high and front but relaxed — noticeably lower than iː, lips unrounded.',
      tonguePosition: 'high-front',
      lipRounding: 'unrounded',
    },
  },
  {
    id: 'fleece',
    ipaSymbol: 'iː',
    category: 'monophthong',
    hungarianDifficulty: 'challenging',
    hungarianNote: 'Close to Hungarian long í, but English length is often paired with a quality change learners don’t make (ship vs sheep sound alike).',
    hungarianNoteHu: 'Közel áll a magyar hosszú í-hez, de az angol hosszúsághoz gyakran hangszínbeli változás is társul, amit a tanulók nem tesznek meg (ship és sheep egyformán hangzik).',
    exampleWords: [
      { word: 'see', highlight: 'ee' },
      { word: 'sheep', highlight: 'ee' },
    ],
    minimalPairs: [{ a: 'ship', b: 'sheep' }],
    articulation: {
      description: 'Tongue high and front, held tense; lips spread.',
      tonguePosition: 'high-front',
      lipRounding: 'unrounded',
    },
  },
  {
    id: 'foot',
    ipaSymbol: 'ʊ',
    category: 'monophthong',
    hungarianDifficulty: 'challenging',
    hungarianNote: 'No exact Hungarian match — relaxed and lower than Hungarian u, often confused with uː.',
    hungarianNoteHu: 'Nincs pontos magyar megfelelője — lazább és nyitottabb, mint a magyar "u", gyakran összekeverik az uː-val.',
    exampleWords: [
      { word: 'book', highlight: 'oo' },
      { word: 'put', highlight: 'u' },
    ],
    minimalPairs: [{ a: 'pull', b: 'pool' }],
    articulation: {
      description: 'Tongue high and back but relaxed, lips only loosely rounded.',
      tonguePosition: 'high-back',
      lipRounding: 'rounded',
    },
  },
  {
    id: 'goose',
    ipaSymbol: 'uː',
    category: 'monophthong',
    hungarianDifficulty: 'challenging',
    hungarianNote: 'Close to Hungarian long ú, but tenser lip-rounding than most learners use.',
    hungarianNoteHu: 'Közel áll a magyar hosszú ú-hoz, de feszesebb ajakkerekítést igényel, mint amit a tanulók általában használnak.',
    exampleWords: [
      { word: 'food', highlight: 'oo' },
      { word: 'blue', highlight: 'ue' },
    ],
    minimalPairs: [{ a: 'pull', b: 'pool' }],
    articulation: {
      description: 'Tongue high and back, tense, lips tightly rounded.',
      tonguePosition: 'high-back',
      lipRounding: 'rounded',
    },
  },
  {
    id: 'thought',
    ipaSymbol: 'ɔː',
    category: 'monophthong',
    hungarianDifficulty: 'challenging',
    hungarianNote: 'Between Hungarian o and á — no exact match, and in General American this can merge with the ɑː in "hot".',
    hungarianNoteHu: 'A magyar "o" és "á" közé esik — nincs pontos megfelelője, és amerikai angolban gyakran egybeesik a "hot" szóban lévő ɑː hanggal.',
    exampleWords: [
      { word: 'talk', highlight: 'al' },
      { word: 'saw', highlight: 'aw' },
    ],
    articulation: {
      description: 'Jaw drops, back of tongue low, lips rounded.',
      tonguePosition: 'low-back',
      lipRounding: 'rounded',
    },
  },
  {
    id: 'palm',
    ipaSymbol: 'ɑː',
    category: 'monophthong',
    hungarianDifficulty: 'challenging',
    hungarianNote: 'Longer and further back than Hungarian á — also covers many "o"-spelled words in American English (hot, stop), which surprises learners expecting a Hungarian "o".',
    hungarianNoteHu: 'Hosszabb és hátrébb képzett, mint a magyar "á" — amerikai angolban sok "o" betűs szóban is ez a hang (hot, stop), ami meglepi a magyar "o"-t váró tanulókat.',
    exampleWords: [
      { word: 'father', highlight: 'a' },
      { word: 'hot', highlight: 'o' },
    ],
    articulation: {
      description: 'Jaw drops fully open, tongue low and back, lips relaxed and unrounded.',
      tonguePosition: 'low-back',
      lipRounding: 'unrounded',
    },
  },
  {
    id: 'goat',
    ipaSymbol: 'oʊ',
    category: 'diphthong',
    hungarianDifficulty: 'challenging',
    hungarianNote: 'Hungarian o is a pure, unchanging vowel — English glides from o toward u, and learners often flatten it into a plain Hungarian "o".',
    hungarianNoteHu: 'A magyar "o" tiszta, változatlan hangzó — az angol o-ból u felé csúszik, és a tanulók gyakran sima magyar "o"-vá laposítják.',
    exampleWords: [
      { word: 'go', highlight: 'o' },
      { word: 'boat', highlight: 'oa' },
    ],
    articulation: {
      description: 'Starts mid-back rounded, glides upward and further rounded toward u.',
      tonguePosition: 'mid-back',
      lipRounding: 'rounded',
    },
  },
  {
    id: 'face',
    ipaSymbol: 'eɪ',
    category: 'diphthong',
    hungarianDifficulty: 'challenging',
    hungarianNote: 'Hungarian has no native glide here — learners often say a pure "e" instead of gliding toward i.',
    hungarianNoteHu: 'A magyarban nincs ehhez hasonló csúszóhang — a tanulók gyakran tiszta "e"-t ejtenek i felé csúszás helyett.',
    exampleWords: [
      { word: 'day', highlight: 'ay' },
      { word: 'rain', highlight: 'ai' },
    ],
    articulation: {
      description: 'Starts mid-front, glides upward toward ɪ.',
      tonguePosition: 'mid-front',
      lipRounding: 'unrounded',
    },
  },
  {
    id: 'price',
    ipaSymbol: 'aɪ',
    category: 'diphthong',
    hungarianDifficulty: 'challenging',
    hungarianNote: 'Similar to the Hungarian "aj" sequence, so usually learnable, but the glide is often cut short.',
    hungarianNoteHu: 'Hasonlít a magyar "aj" hangkapcsolathoz, ezért általában könnyen megtanulható, de a csúszást gyakran túl röviden ejtik.',
    exampleWords: [
      { word: 'time', highlight: 'i' },
      { word: 'my', highlight: 'y' },
    ],
    articulation: {
      description: 'Starts low-front/central, glides upward toward ɪ.',
      tonguePosition: 'low-front',
      lipRounding: 'unrounded',
    },
  },
  {
    id: 'mouth',
    ipaSymbol: 'aʊ',
    category: 'diphthong',
    hungarianDifficulty: 'challenging',
    hungarianNote: 'Similar to the Hungarian "au" sequence in loanwords, but English rounds and raises further toward u than most learners expect.',
    hungarianNoteHu: 'Hasonlít a magyar jövevényszavakban előforduló "au" hangkapcsolathoz, de az angolban erősebb ajakkerekítéssel és u felé emelkedéssel jár, mint amit a legtöbb tanuló vár.',
    exampleWords: [
      { word: 'house', highlight: 'ou' },
      { word: 'now', highlight: 'ow' },
    ],
    articulation: {
      description: 'Starts low-central, glides upward and rounds toward u.',
      tonguePosition: 'low-front',
      lipRounding: 'unrounded',
    },
  },
  {
    id: 'choice',
    ipaSymbol: 'ɔɪ',
    category: 'diphthong',
    hungarianDifficulty: 'challenging',
    hungarianNote: 'Rare glide shape for Hungarian speakers — the starting vowel is often replaced with a plain Hungarian "o".',
    hungarianNoteHu: 'Ritka csúszóhang-forma a magyar anyanyelvűek számára — a kezdő magánhangzót gyakran sima magyar "o"-val helyettesítik.',
    exampleWords: [
      { word: 'boy', highlight: 'oy' },
      { word: 'voice', highlight: 'oi' },
    ],
    articulation: {
      description: 'Starts low-back rounded, glides upward toward ɪ.',
      tonguePosition: 'low-back',
      lipRounding: 'rounded',
    },
  },

  // ---- Straightforward (below the line) ----
  {
    id: 'p',
    ipaSymbol: 'p',
    category: 'consonant',
    hungarianDifficulty: 'straightforward',
    hungarianNote: 'Close match to Hungarian p, though English p is more strongly aspirated (a puff of air) at the start of a stressed syllable.',
    hungarianNoteHu: 'Közel áll a magyar "p"-hez, de az angol p hangsúlyos szótag elején erősebb léghullámmal (hehezettel) jár.',
    exampleWords: [
      { word: 'pen', highlight: 'p' },
      { word: 'stop', highlight: 'p' },
    ],
    articulation: {
      description: 'Lips press together, then release with a puff of air, no voicing.',
      voicing: 'voiceless',
      manner: 'stop',
      place: 'bilabial',
    },
  },
  {
    id: 'b',
    ipaSymbol: 'b',
    category: 'consonant',
    hungarianDifficulty: 'straightforward',
    hungarianNote: 'Close match to Hungarian b.',
    hungarianNoteHu: 'Közel áll a magyar "b"-hez.',
    exampleWords: [
      { word: 'bag', highlight: 'b' },
      { word: 'cab', highlight: 'b' },
    ],
    articulation: {
      description: 'Lips press together, release with voicing, no puff of air.',
      voicing: 'voiced',
      manner: 'stop',
      place: 'bilabial',
    },
  },
  {
    id: 't',
    ipaSymbol: 't',
    category: 'consonant',
    hungarianDifficulty: 'straightforward',
    hungarianNote: 'Close match to Hungarian t, though English t is more strongly aspirated at the start of a stressed syllable.',
    hungarianNoteHu: 'Közel áll a magyar "t"-hez, de az angol t hangsúlyos szótag elején erősebb hehezettel jár.',
    exampleWords: [
      { word: 'top', highlight: 't' },
      { word: 'cat', highlight: 't' },
    ],
    articulation: {
      description: 'Tongue tip against the gum ridge, release with a puff of air, no voicing.',
      voicing: 'voiceless',
      manner: 'stop',
      place: 'alveolar',
    },
  },
  {
    id: 'd',
    ipaSymbol: 'd',
    category: 'consonant',
    hungarianDifficulty: 'straightforward',
    hungarianNote: 'Close match to Hungarian d.',
    hungarianNoteHu: 'Közel áll a magyar "d"-hez.',
    exampleWords: [
      { word: 'dog', highlight: 'd' },
      { word: 'bed', highlight: 'd' },
    ],
    articulation: {
      description: 'Tongue tip against the gum ridge, release with voicing.',
      voicing: 'voiced',
      manner: 'stop',
      place: 'alveolar',
    },
  },
  {
    id: 'k',
    ipaSymbol: 'k',
    category: 'consonant',
    hungarianDifficulty: 'straightforward',
    hungarianNote: 'Close match to Hungarian k, though English k is more strongly aspirated at the start of a stressed syllable.',
    hungarianNoteHu: 'Közel áll a magyar "k"-hoz, de az angol k hangsúlyos szótag elején erősebb hehezettel jár.',
    exampleWords: [
      { word: 'cat', highlight: 'c' },
      { word: 'back', highlight: 'ck' },
    ],
    articulation: {
      description: 'Back of tongue against the soft palate, release with a puff of air, no voicing.',
      voicing: 'voiceless',
      manner: 'stop',
      place: 'velar',
    },
  },
  {
    id: 'g',
    ipaSymbol: 'g',
    category: 'consonant',
    hungarianDifficulty: 'straightforward',
    hungarianNote: 'Close match to Hungarian g.',
    hungarianNoteHu: 'Közel áll a magyar "g"-hez.',
    exampleWords: [
      { word: 'go', highlight: 'g' },
      { word: 'big', highlight: 'g' },
    ],
    articulation: {
      description: 'Back of tongue against the soft palate, release with voicing.',
      voicing: 'voiced',
      manner: 'stop',
      place: 'velar',
    },
  },
  {
    id: 'f',
    ipaSymbol: 'f',
    category: 'consonant',
    hungarianDifficulty: 'straightforward',
    hungarianNote: 'Close match to Hungarian f.',
    hungarianNoteHu: 'Közel áll a magyar "f"-hez.',
    exampleWords: [
      { word: 'fish', highlight: 'f' },
      { word: 'laugh', highlight: 'gh' },
    ],
    articulation: {
      description: 'Top teeth touch the bottom lip, push air through, no voicing.',
      voicing: 'voiceless',
      manner: 'fricative',
      place: 'labiodental',
    },
  },
  {
    id: 'v',
    ipaSymbol: 'v',
    category: 'consonant',
    hungarianDifficulty: 'straightforward',
    hungarianNote: 'Close match to Hungarian v — the contrast that needs practice is keeping it separate from w, which Hungarian speakers pull toward v.',
    hungarianNoteHu: 'Közel áll a magyar "v"-hez — a gyakorlást igénylő különbség a w-től való megkülönböztetés, amelyet a magyar beszélők v felé húznak.',
    exampleWords: [
      { word: 'van', highlight: 'v' },
      { word: 'love', highlight: 'v' },
    ],
    minimalPairs: [{ a: 'wine', b: 'vine' }, { a: 'west', b: 'vest' }],
    articulation: {
      description: 'Top teeth touch the bottom lip, push air through with voicing — unlike w, which uses only the lips.',
      voicing: 'voiced',
      manner: 'fricative',
      place: 'labiodental',
    },
    curriculumId: 'w-vs-v',
  },
  {
    id: 's',
    ipaSymbol: 's',
    category: 'consonant',
    hungarianDifficulty: 'straightforward',
    hungarianNote: 'Close match to Hungarian sz.',
    hungarianNoteHu: 'Közel áll a magyar "sz"-hez.',
    exampleWords: [
      { word: 'sun', highlight: 's' },
      { word: 'bus', highlight: 's' },
    ],
    articulation: {
      description: 'Tongue tip near the gum ridge, narrow channel for air, no voicing.',
      voicing: 'voiceless',
      manner: 'fricative',
      place: 'alveolar',
    },
  },
  {
    id: 'z',
    ipaSymbol: 'z',
    category: 'consonant',
    hungarianDifficulty: 'straightforward',
    hungarianNote: 'Close match to Hungarian z.',
    hungarianNoteHu: 'Közel áll a magyar "z"-hez.',
    exampleWords: [
      { word: 'zoo', highlight: 'z' },
      { word: 'buzz', highlight: 'zz' },
    ],
    articulation: {
      description: 'Same tongue position as s, but with voicing.',
      voicing: 'voiced',
      manner: 'fricative',
      place: 'alveolar',
    },
  },
  {
    id: 'sh',
    ipaSymbol: 'ʃ',
    category: 'consonant',
    hungarianDifficulty: 'straightforward',
    hungarianNote: 'Close match to Hungarian s.',
    hungarianNoteHu: 'Közel áll a magyar "s"-hez.',
    exampleWords: [
      { word: 'shoe', highlight: 'sh' },
      { word: 'wash', highlight: 'sh' },
    ],
    articulation: {
      description: 'Tongue slightly further back than s, lips a little rounded, no voicing.',
      voicing: 'voiceless',
      manner: 'fricative',
      place: 'postalveolar',
    },
  },
  {
    id: 'zh',
    ipaSymbol: 'ʒ',
    category: 'consonant',
    hungarianDifficulty: 'straightforward',
    hungarianNote: 'Close match to Hungarian zs — genuinely one of the easier English consonants for Hungarian speakers.',
    hungarianNoteHu: 'Közel áll a magyar "zs"-hez — az angol mássalhangzók közül ez az egyik legkönnyebb a magyar anyanyelvűeknek.',
    exampleWords: [
      { word: 'vision', highlight: 'si' },
      { word: 'measure', highlight: 's' },
    ],
    articulation: {
      description: 'Same tongue position as ʃ, but with voicing.',
      voicing: 'voiced',
      manner: 'fricative',
      place: 'postalveolar',
    },
  },
  {
    id: 'h',
    ipaSymbol: 'h',
    category: 'consonant',
    hungarianDifficulty: 'straightforward',
    hungarianNote: 'Close match to Hungarian h.',
    hungarianNoteHu: 'Közel áll a magyar "h"-hoz.',
    exampleWords: [
      { word: 'hat', highlight: 'h' },
      { word: 'behind', highlight: 'h' },
    ],
    articulation: {
      description: 'Open breath through the vocal folds, no tongue obstruction.',
      voicing: 'voiceless',
      manner: 'fricative',
      place: 'glottal',
    },
  },
  {
    id: 'ch',
    ipaSymbol: 'tʃ',
    category: 'consonant',
    hungarianDifficulty: 'straightforward',
    hungarianNote: 'Close match to Hungarian cs.',
    hungarianNoteHu: 'Közel áll a magyar "cs"-hez.',
    exampleWords: [
      { word: 'chair', highlight: 'ch' },
      { word: 'watch', highlight: 'tch' },
    ],
    articulation: {
      description: 'Starts like t, released as ʃ instead of a clean burst.',
      voicing: 'voiceless',
      manner: 'affricate',
      place: 'postalveolar',
    },
  },
  {
    id: 'dzh',
    ipaSymbol: 'dʒ',
    category: 'consonant',
    hungarianDifficulty: 'straightforward',
    hungarianNote: 'Close match to Hungarian dzs.',
    hungarianNoteHu: 'Közel áll a magyar "dzs"-hez.',
    exampleWords: [
      { word: 'jump', highlight: 'j' },
      { word: 'bridge', highlight: 'dge' },
    ],
    articulation: {
      description: 'Starts like d, released as ʒ instead of a clean burst.',
      voicing: 'voiced',
      manner: 'affricate',
      place: 'postalveolar',
    },
  },
  {
    id: 'm',
    ipaSymbol: 'm',
    category: 'consonant',
    hungarianDifficulty: 'straightforward',
    hungarianNote: 'Close match to Hungarian m.',
    hungarianNoteHu: 'Közel áll a magyar "m"-hez.',
    exampleWords: [
      { word: 'man', highlight: 'm' },
      { word: 'swim', highlight: 'm' },
    ],
    articulation: {
      description: 'Lips together, air and voice through the nose.',
      voicing: 'voiced',
      manner: 'nasal',
      place: 'bilabial',
    },
  },
  {
    id: 'n',
    ipaSymbol: 'n',
    category: 'consonant',
    hungarianDifficulty: 'straightforward',
    hungarianNote: 'Close match to Hungarian n.',
    hungarianNoteHu: 'Közel áll a magyar "n"-hez.',
    exampleWords: [
      { word: 'name', highlight: 'n' },
      { word: 'sun', highlight: 'n' },
    ],
    articulation: {
      description: 'Tongue tip against the gum ridge, air and voice through the nose.',
      voicing: 'voiced',
      manner: 'nasal',
      place: 'alveolar',
    },
  },
  {
    id: 'l',
    ipaSymbol: 'l',
    category: 'consonant',
    hungarianDifficulty: 'straightforward',
    hungarianNote: 'Close match to Hungarian l at the start of a word or syllable — the harder "dark l" variant at the end of a syllable has its own tile.',
    hungarianNoteHu: 'Szó vagy szótag elején közel áll a magyar "l"-hez — a nehezebb, szótagvégi "sötét l" változatnak külön csempéje van.',
    exampleWords: [
      { word: 'light', highlight: 'l' },
      { word: 'lamp', highlight: 'l' },
    ],
    articulation: {
      description: 'Tongue tip against the gum ridge, air flows around the sides, voiced.',
      voicing: 'voiced',
      manner: 'lateral',
      place: 'alveolar',
    },
  },
  {
    id: 'y',
    ipaSymbol: 'j',
    category: 'consonant',
    hungarianDifficulty: 'straightforward',
    hungarianNote: 'Close match to Hungarian j.',
    hungarianNoteHu: 'Közel áll a magyar "j"-hez.',
    exampleWords: [
      { word: 'yes', highlight: 'y' },
      { word: 'yellow', highlight: 'y' },
    ],
    articulation: {
      description: 'Tongue glides from a high-front position into the next vowel.',
      voicing: 'voiced',
      manner: 'approximant',
      place: 'palatal',
    },
  },
  {
    id: 'dress',
    ipaSymbol: 'e',
    category: 'monophthong',
    hungarianDifficulty: 'straightforward',
    hungarianNote: 'Close match to Hungarian e — this is the vowel Hungarian speakers substitute for æ, so it’s the "safe" side of that contrast.',
    hungarianNoteHu: 'Közel áll a magyar "e"-hez — ezt a hangot helyettesítik be a magyar beszélők æ helyett, tehát ez a kontraszt "biztonságos" oldala.',
    exampleWords: [
      { word: 'bed', highlight: 'e' },
      { word: 'ten', highlight: 'e' },
    ],
    minimalPairs: [{ a: 'head', b: 'had' }, { a: 'bed', b: 'bad' }],
    articulation: {
      description: 'Jaw half-open, tongue mid-front — higher and less spread than æ.',
      tonguePosition: 'mid-front',
      lipRounding: 'unrounded',
    },
    curriculumId: 'ae-vs-e',
  },
]

export function getPhoneme(id: string): Phoneme | undefined {
  return phonemes.find((p) => p.id === id)
}

/** Critical + Challenging, in that order — the tiles shown above the chart's difficulty divider. */
export const difficultTierPhonemes = phonemes.filter(
  (p) => p.hungarianDifficulty === 'critical' || p.hungarianDifficulty === 'challenging',
)

export const straightforwardPhonemes = phonemes.filter((p) => p.hungarianDifficulty === 'straightforward')
