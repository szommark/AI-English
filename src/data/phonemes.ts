// Pronunciation Chart phoneme inventory — hand-authored, static content (no LLM generation),
// same spirit as pronunciationCurriculum.ts. General American transcription throughout
// (matches the curriculum's own oʊ/ɜr usage); the UK/US accent toggle changes which TTS
// voice and Azure recognition locale get used, not the chart's IPA labels.
//
// Difficulty tiering (hungarianDifficulty): Critical is the curated "difficult sounds"
// shortlist shown above the chart's divider (th-voiceless, th-voiced, æ, schwa, w, r,
// dark-l, ŋ, oʊ) — kept deliberately short rather than exhaustive. Everything else sits in
// Straightforward below the divider; the 'challenging' tier value is unused but kept in the
// type in case a middle tier returns. The five explicit grounded items (th-sounds, w-vs-v,
// æ-vs-e, schwa) come from the author's dissertation and Nádasdy's "Background to English
// Pronunciation" (2006), same as pronunciationCurriculum.ts. Everything else is a first-pass
// placeholder using well-established Hungarian/English contrastive-phonetics facts (vowel
// length-vs-quality mismatch, absence of dental fricatives, absence of a dark l, etc.) —
// NOT claimed as dissertation findings, and flagged for linguistic review same as the
// curriculum file's own disclaimer.

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

export interface SwipeWord {
  word: string
  /** Does this word actually contain the tile's target sound? */
  isTarget: boolean
}

export interface Articulation {
  /** Short plain-language cue shown even before the Phase 3 animated rig exists. */
  description: string
  /** Longer Hungarian how-to-pronounce instructions, shown in the detail page's "Képzés" section. */
  descriptionHu?: string
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
  /**
   * Word list for the swipe-card exercise (§7's "idea 2") — the standard, lighter-weight
   * exercise for every tile that doesn't have curriculumId funnel content. Only authored
   * for those tiles; curriculumId tiles rely on the funnel instead.
   */
  swipeWords?: SwipeWord[]
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
      descriptionHu: 'Tedd a nyelved hegyét enyhén a felső és az alsó fogsor közé, úgy, hogy a nyelv széle éppen érintse a fogakat. Ne szorítsd, és ne harapd meg. Ezután fújj át levegőt a nyelv és a fogak közötti résen: halk, fújó, "sz"-szerű zaj hallatszik. A hangszalagok NEM rezegnek — tedd a kezed a torkodra, itt nem érezhetsz rezgést. Ne mondj t-t vagy sz-t: a nyelv hegye ne ugorjon vissza a fogmederhez.',
      voicing: 'voiceless',
      manner: 'fricative',
      place: 'dental',
    },
    swipeWords: [
      { word: 'think', isTarget: true },
      { word: 'bath', isTarget: true },
      { word: 'thin', isTarget: true },
      { word: 'sink', isTarget: false },
      { word: 'bat', isTarget: false },
      { word: 'tin', isTarget: false },
    ],
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
      descriptionHu: 'Ugyanaz a nyelvállás, mint a θ-nál: a nyelv hegye enyhén a fogak között van, a levegő a résen áramlik át. A különbség, hogy itt a hangszalagok rezegnek — ha a torkodra teszed a kezed, zümmögést érzel. Ne d-t vagy z-t mondj helyette: a nyelv hegye ne érjen a fogmederhez. Gyakori szavakban fordul elő (the, this, that), ezért érdemes automatizálni.',
      voicing: 'voiced',
      manner: 'fricative',
      place: 'dental',
    },
    swipeWords: [
      { word: 'this', isTarget: true },
      { word: 'then', isTarget: true },
      { word: 'breathe', isTarget: true },
      { word: 'den', isTarget: false },
      { word: 'dare', isTarget: false },
      { word: 'breed', isTarget: false },
    ],
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
      descriptionHu: 'Nyisd ki az állkapcsot jóval szélesebbre, mint a magyar "e"-nél, és húzd oldalra az ajkadat, mintha mosolyognál. A nyelv hegye az alsó fogak mögött pihen, a nyelv eleje alacsonyan van. A hang valahol a magyar "e" és "a" között szól, de közelebb van az "e"-hez, mint az "á"-hoz. Ha a "had" szót ugyanúgy mondod, mint a "head"-et, még nem nyitottad ki eléggé a szádat.',
      tonguePosition: 'low-front',
      lipRounding: 'unrounded',
    },
    swipeWords: [
      { word: 'cat', isTarget: true },
      { word: 'bad', isTarget: true },
      { word: 'had', isTarget: true },
      { word: 'bed', isTarget: false },
      { word: 'head', isTarget: false },
      { word: 'red', isTarget: false },
    ],
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
      descriptionHu: 'Lazítsd el teljesen a nyelvet, az ajkat és az állkapcsot — a száj félig nyitott, a nyelv középen, nyugalmi helyzetben van. Nincs feszítés, nincs kerekített ajak. A hang rövid és halk, egy semleges, "e" és "ö" közötti hang. Csak hangsúlytalan szótagban jelenik meg (a-bout, ba-na-na). Ne ejtsd tisztán a magánhangzót, ahogy a magyarban szoktuk — az angolban a hangsúlytalan szótag "elmosódik".',
      tonguePosition: 'central',
      lipRounding: 'unrounded',
    },
    swipeWords: [
      { word: 'about', isTarget: true },
      { word: 'sofa', isTarget: true },
      { word: 'banana', isTarget: true },
      { word: 'stop', isTarget: false },
      { word: 'cat', isTarget: false },
      { word: 'ten', isTarget: false },
    ],
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
      descriptionHu: 'Kerekítsd az ajkadat szoros kis körré, mintha "u"-t akarnál mondani, majd nyisd ki gyorsan az ajkat a következő magánhangzóhoz. A fogaid NEM érintik az alsó ajkadat — ez a legfontosabb különbség a v-hez képest. Ha a fogad az ajkadhoz ér, v-t mondtál. Gyakorold a "wine" és "vine" szavakat tükör előtt: a w-nél az ajkak előre kerekednek, a v-nél a fogak az alsó ajkat érintik.',
      voicing: 'voiced',
      manner: 'approximant',
      place: 'bilabial',
      lipRounding: 'rounded',
    },
    swipeWords: [
      { word: 'wine', isTarget: true },
      { word: 'west', isTarget: true },
      { word: 'wet', isTarget: true },
      { word: 'vine', isTarget: false },
      { word: 'vest', isTarget: false },
      { word: 'vet', isTarget: false },
    ],
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
      descriptionHu: 'Húzd vissza a nyelvet a szájban, és emeld meg a hátát, vagy hajlítsd fel a hegyét — de a nyelv SEHOL sem érintheti a szájpadlást vagy a fogmedret. Az ajkak enyhén előrekerekednek. A magyar r-nél a nyelv pereg vagy koppan; az angolban egyetlen, folyamatos, "mormoló" hang van, amely egy "ö" színezetére hasonlít. Kezdj egy "ö" hanggal, és lassan tekerd hátra a nyelvedet, amíg a hegye szabadon lebeg.',
      voicing: 'voiced',
      manner: 'approximant',
      place: 'postalveolar',
      lipRounding: 'rounded',
    },
    swipeWords: [
      { word: 'red', isTarget: true },
      { word: 'car', isTarget: true },
      { word: 'road', isTarget: true },
      { word: 'led', isTarget: false },
      { word: 'cow', isTarget: false },
      { word: 'home', isTarget: false },
    ],
    minimalPairs: [
      { a: 'red', b: 'led' },
      { a: 'right', b: 'light' },
      { a: 'fear', b: 'feel' },
    ],
    curriculumId: 'r-sound',
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
    minimalPairs: [
      { a: 'feel', b: 'fear' },
      { a: 'ball', b: 'bar' },
      { a: 'wall', b: 'war' },
    ],
    articulation: {
      description: 'Tongue tip touches the gum ridge like a normal l, but the back of the tongue also rises toward the soft palate.',
      descriptionHu: 'Tedd a nyelv hegyét a fogmederhez, mint a magyar "l"-nél, de EGYSZERRE emeld meg a nyelv hátát is a lágy szájpad felé, mintha közben egy "u" vagy "o" hangot ejtenél. Az eredmény üregesebb, sötétebb hang. Szótag végén (ball, milk, feel) ezt használjuk; a magyar tiszta, világos "l" itt idegenül hangzik. A nyelv hegye csak éppen érint, a lényeg a nyelv hátsó részének megemelése.',
      voicing: 'voiced',
      manner: 'lateral',
      place: 'alveolar',
    },
    swipeWords: [
      { word: 'ball', isTarget: true },
      { word: 'milk', isTarget: true },
      { word: 'feel', isTarget: true },
      { word: 'bar', isTarget: false },
      { word: 'mix', isTarget: false },
      { word: 'feed', isTarget: false },
    ],
    curriculumId: 'dark-l',
  },
  {
    id: 'nurse',
    ipaSymbol: 'ɜr',
    category: 'monophthong',
    hungarianDifficulty: 'straightforward',
    hungarianNote: 'Combines the difficulty of English r with a vowel quality Hungarian doesn’t have — often flattened toward a Hungarian "er".',
    hungarianNoteHu: 'Az angol "r" nehézségét egy olyan magánhangzóval kombinálja, amely a magyarban nem létezik — gyakran magyaros "er"-ré egyszerűsödik.',
    exampleWords: [
      { word: 'bird', highlight: 'ir' },
      { word: 'nurse', highlight: 'ur' },
    ],
    articulation: {
      description: 'Tongue bunched for r while the vowel stays central — one continuous r-colored vowel, not vowel-then-r.',
      descriptionHu: 'A nyelv középen, enyhén hátrahúzva helyezkedik el, az ajkak nyugodtak, nem kerekítettek. Egyszerre képezed az r-színezetet és a magánhangzót: egyetlen folyamatos, r-színezetű hangot kapsz, nem "e" + "r" két külön hangot. Kerüld a magyar "er"-t, és ne pergesd az r-t.',
      tonguePosition: 'central',
      lipRounding: 'unrounded',
    },
    swipeWords: [
      { word: 'bird', isTarget: true },
      { word: 'nurse', isTarget: true },
      { word: 'shirt', isTarget: true },
      { word: 'bed', isTarget: false },
      { word: 'nose', isTarget: false },
      { word: 'shot', isTarget: false },
    ],
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
    minimalPairs: [
      { a: 'sing', b: 'sin' },
      { a: 'thing', b: 'thin' },
      { a: 'sang', b: 'sag' },
      { a: 'long', b: 'log' },
    ],
    articulation: {
      description: 'Back of the tongue against the soft palate, air and voice through the nose, no released g.',
      descriptionHu: 'A nyelv hátsó része a lágy szájpadhoz (a szájpadlás hátsó, puha részéhez) ér, és lezárja a szájat. A levegő és a hang az orron át távozik — mint a magyar "n" a "bank" szóban, de önállóan. FONTOS: a hang végén NE ejts "g"-t! A "sing" nem "sing-g": a nyelvet lazán vidd el a szájpadlástól, anélkül hogy külön g-t robbantanál. Ha a nyelved hegye a fogmederhez ér, az már "n" — a nyelved hegye maradjon lent, és csak a hátsó része emelkedjen.',
      voicing: 'voiced',
      manner: 'nasal',
      place: 'velar',
    },
    swipeWords: [
      { word: 'sing', isTarget: true },
      { word: 'morning', isTarget: true },
      { word: 'ring', isTarget: true },
      { word: 'sin', isTarget: false },
      { word: 'run', isTarget: false },
      { word: 'rim', isTarget: false },
    ],
    curriculumId: 'ng-sound',
  },

  // ---- Challenging (above the line) ----
  {
    id: 'strut',
    ipaSymbol: 'ʌ',
    category: 'monophthong',
    hungarianDifficulty: 'straightforward',
    hungarianNote: 'Sits between Hungarian a and o — no exact match, often replaced with a Hungarian "a".',
    hungarianNoteHu: 'A magyar "a" és "o" közé esik — nincs pontos megfelelője, gyakran magyaros "a"-val helyettesítik.',
    exampleWords: [
      { word: 'cup', highlight: 'u' },
      { word: 'love', highlight: 'o' },
    ],
    articulation: {
      description: 'Mouth half-open, tongue central and slightly back, no lip rounding.',
      descriptionHu: 'A száj félig nyitott, a nyelv középen, kissé hátrébb pihen, az ajkak nyugodtak, nem kerekítettek. Rövid hang, a magyar "a" és "ö" között — közelebb az "a"-hoz, de rövidebb és kevésbé nyitott.',
      tonguePosition: 'central',
      lipRounding: 'unrounded',
    },
    swipeWords: [
      { word: 'cup', isTarget: true },
      { word: 'love', isTarget: true },
      { word: 'sun', isTarget: true },
      { word: 'cap', isTarget: false },
      { word: 'leave', isTarget: false },
      { word: 'sin', isTarget: false },
    ],
  },
  {
    id: 'kit',
    ipaSymbol: 'ɪ',
    category: 'monophthong',
    hungarianDifficulty: 'straightforward',
    hungarianNote: 'Hungarian short i is tenser and closer to English iː — English ɪ is more relaxed and lower, which is easy to miss.',
    hungarianNoteHu: 'A magyar rövid "i" feszesebb és közelebb áll az angol iː-hez — az angol ɪ lazább és nyitottabb, ezt könnyű elvéteni.',
    exampleWords: [
      { word: 'sit', highlight: 'i' },
      { word: 'bit', highlight: 'i' },
    ],
    minimalPairs: [{ a: 'ship', b: 'sheep' }],
    articulation: {
      description: 'Tongue high and front but relaxed — noticeably lower than iː, lips unrounded.',
      descriptionHu: 'A nyelv magasan és elöl van, de lazán, nem feszítve — kicsit lejjebb, mint a hosszú "iː"-nél. Az ajkak nyugodtak, nem húzod szét. Rövid, laza hang: a magyar rövid "i"-hez hasonló, de valamivel nyitottabb.',
      tonguePosition: 'high-front',
      lipRounding: 'unrounded',
    },
    swipeWords: [
      { word: 'sit', isTarget: true },
      { word: 'bit', isTarget: true },
      { word: 'fish', isTarget: true },
      { word: 'seat', isTarget: false },
      { word: 'beat', isTarget: false },
      { word: 'gas', isTarget: false },
    ],
  },
  {
    id: 'fleece',
    ipaSymbol: 'iː',
    category: 'monophthong',
    hungarianDifficulty: 'straightforward',
    hungarianNote: 'Close to Hungarian long í, but English length is often paired with a quality change learners don’t make (ship vs sheep sound alike).',
    hungarianNoteHu: 'Közel áll a magyar hosszú í-hez, de az angol hosszúsághoz gyakran hangszínbeli változás is társul, amit a tanulók nem tesznek meg (ship és sheep egyformán hangzik).',
    exampleWords: [
      { word: 'see', highlight: 'ee' },
      { word: 'sheep', highlight: 'ee' },
    ],
    minimalPairs: [{ a: 'ship', b: 'sheep' }],
    articulation: {
      description: 'Tongue high and front, held tense; lips spread.',
      descriptionHu: 'A nyelv magasan és elöl van, feszesen tartod, az ajkak széthúzva, mosolygós helyzetben. Hosszabb hang, mint a rövid "i" — a magyar hosszú "í"-hez áll közel.',
      tonguePosition: 'high-front',
      lipRounding: 'unrounded',
    },
    swipeWords: [
      { word: 'see', isTarget: true },
      { word: 'sheep', isTarget: true },
      { word: 'tea', isTarget: true },
      { word: 'sit', isTarget: false },
      { word: 'ship', isTarget: false },
      { word: 'ten', isTarget: false },
    ],
  },
  {
    id: 'foot',
    ipaSymbol: 'ʊ',
    category: 'monophthong',
    hungarianDifficulty: 'straightforward',
    hungarianNote: 'No exact Hungarian match — relaxed and lower than Hungarian u, often confused with uː.',
    hungarianNoteHu: 'Nincs pontos magyar megfelelője — lazább és nyitottabb, mint a magyar "u", gyakran összekeverik az uː-val.',
    exampleWords: [
      { word: 'book', highlight: 'oo' },
      { word: 'put', highlight: 'u' },
    ],
    minimalPairs: [{ a: 'pull', b: 'pool' }],
    articulation: {
      description: 'Tongue high and back but relaxed, lips only loosely rounded.',
      descriptionHu: 'A nyelv hátul és magasan van, de lazán; az ajkak csak enyhén kerekítettek. Rövid hang, a magyar rövid "u" és "ö" közötti, kevésbé feszes, mint a hosszú "uː".',
      tonguePosition: 'high-back',
      lipRounding: 'rounded',
    },
    swipeWords: [
      { word: 'book', isTarget: true },
      { word: 'put', isTarget: true },
      { word: 'foot', isTarget: true },
      { word: 'boot', isTarget: false },
      { word: 'pet', isTarget: false },
      { word: 'cup', isTarget: false },
    ],
  },
  {
    id: 'goose',
    ipaSymbol: 'uː',
    category: 'monophthong',
    hungarianDifficulty: 'straightforward',
    hungarianNote: 'Close to Hungarian long ú, but tenser lip-rounding than most learners use.',
    hungarianNoteHu: 'Közel áll a magyar hosszú ú-hoz, de feszesebb ajakkerekítést igényel, mint amit a tanulók általában használnak.',
    exampleWords: [
      { word: 'food', highlight: 'oo' },
      { word: 'blue', highlight: 'ue' },
    ],
    minimalPairs: [{ a: 'pull', b: 'pool' }],
    articulation: {
      description: 'Tongue high and back, tense, lips tightly rounded.',
      descriptionHu: 'A nyelv hátul és magasan van, feszesen; az ajkak szorosan előrekerekítettek, mint amikor a magyar "ú"-t mondod. Hosszabb hang, mint a "foot" magánhangzója.',
      tonguePosition: 'high-back',
      lipRounding: 'rounded',
    },
    swipeWords: [
      { word: 'food', isTarget: true },
      { word: 'blue', isTarget: true },
      { word: 'moon', isTarget: true },
      { word: 'foot', isTarget: false },
      { word: 'blow', isTarget: false },
      { word: 'man', isTarget: false },
    ],
  },
  {
    id: 'thought',
    ipaSymbol: 'ɔː',
    category: 'monophthong',
    hungarianDifficulty: 'straightforward',
    hungarianNote: 'Between Hungarian o and á — no exact match, and in General American this can merge with the ɑː in "hot".',
    hungarianNoteHu: 'A magyar "o" és "á" közé esik — nincs pontos megfelelője, és amerikai angolban gyakran egybeesik a "hot" szóban lévő ɑː hanggal.',
    exampleWords: [
      { word: 'talk', highlight: 'al' },
      { word: 'saw', highlight: 'aw' },
    ],
    articulation: {
      description: 'Jaw drops, back of tongue low, lips rounded.',
      descriptionHu: 'Nyisd ki az állkapcsot, a nyelv háta alacsonyan hátul van, az ajkak kerekítettek. A magyar "á" és "o" közötti, mély, kerek hang — inkább hosszú, mint rövid.',
      tonguePosition: 'low-back',
      lipRounding: 'rounded',
    },
    swipeWords: [
      { word: 'talk', isTarget: true },
      { word: 'saw', isTarget: true },
      { word: 'ball', isTarget: true },
      { word: 'tuck', isTarget: false },
      { word: 'sea', isTarget: false },
      { word: 'bell', isTarget: false },
    ],
  },
  {
    id: 'palm',
    ipaSymbol: 'ɑː',
    category: 'monophthong',
    hungarianDifficulty: 'straightforward',
    hungarianNote: 'Longer and further back than Hungarian á — also covers many "o"-spelled words in American English (hot, stop), which surprises learners expecting a Hungarian "o".',
    hungarianNoteHu: 'Hosszabb és hátrébb képzett, mint a magyar "á" — amerikai angolban sok "o" betűs szóban is ez a hang (hot, stop), ami meglepi a magyar "o"-t váró tanulókat.',
    exampleWords: [
      { word: 'father', highlight: 'a' },
      { word: 'hot', highlight: 'o' },
    ],
    articulation: {
      description: 'Jaw drops fully open, tongue low and back, lips relaxed and unrounded.',
      descriptionHu: 'Nyisd ki teljesen a szádat, a nyelv alacsonyan és hátul van, az ajkak nyugodtak, nem kerekítettek. Hosszú, nyitott "á"-szerű hang, mint amikor az orvosnál kinyitod a szádat.',
      tonguePosition: 'low-back',
      lipRounding: 'unrounded',
    },
    swipeWords: [
      { word: 'father', isTarget: true },
      { word: 'hot', isTarget: true },
      { word: 'stop', isTarget: true },
      { word: 'fat', isTarget: false },
      { word: 'hit', isTarget: false },
      { word: 'step', isTarget: false },
    ],
  },
  {
    id: 'goat',
    ipaSymbol: 'oʊ',
    category: 'diphthong',
    hungarianDifficulty: 'critical',
    hungarianNote: 'Hungarian o is a pure, unchanging vowel — English glides from o toward u, and learners often flatten it into a plain Hungarian "o".',
    hungarianNoteHu: 'A magyar "o" tiszta, változatlan hangzó — az angol o-ból u felé csúszik, és a tanulók gyakran sima magyar "o"-vá laposítják.',
    exampleWords: [
      { word: 'go', highlight: 'o' },
      { word: 'boat', highlight: 'oa' },
    ],
    articulation: {
      description: 'Starts mid-back rounded, glides upward and further rounded toward u.',
      descriptionHu: 'Kezdd egy kerek, félig hátsó "o" hanggal, majd az ajkadat egyre jobban kerekítve, a nyelvet felfelé csúsztatva halad a hang egy "u" felé. A hang két részből áll: o → u. A magyar "o" tiszta és nem változik, ezért a tanulók gyakran csak egy sima "o"-t mondanak. Tükör előtt figyeld: az ajkaknak a hang végére még szorosabban kell összehúzódniuk.',
      tonguePosition: 'mid-back',
      lipRounding: 'rounded',
    },
    swipeWords: [
      { word: 'go', isTarget: true },
      { word: 'boat', isTarget: true },
      { word: 'home', isTarget: true },
      { word: 'gone', isTarget: false },
      { word: 'bat', isTarget: false },
      { word: 'ham', isTarget: false },
    ],
    minimalPairs: [
      { a: 'coat', b: 'cot' },
      { a: 'note', b: 'not' },
      { a: 'hope', b: 'hop' },
    ],
    curriculumId: 'ou-vs-o',
  },
  {
    id: 'face',
    ipaSymbol: 'eɪ',
    category: 'diphthong',
    hungarianDifficulty: 'straightforward',
    hungarianNote: 'Hungarian has no native glide here — learners often say a pure "e" instead of gliding toward i.',
    hungarianNoteHu: 'A magyarban nincs ehhez hasonló csúszóhang — a tanulók gyakran tiszta "e"-t ejtenek i felé csúszás helyett.',
    exampleWords: [
      { word: 'day', highlight: 'ay' },
      { word: 'rain', highlight: 'ai' },
    ],
    articulation: {
      description: 'Starts mid-front, glides upward toward ɪ.',
      descriptionHu: 'A nyelv félig elöl indul (mint az "é"), majd felfelé, az "i" felé csúszik. Két részből álló hang: e → i, a hang végén az állkapocs kissé záródik.',
      tonguePosition: 'mid-front',
      lipRounding: 'unrounded',
    },
    swipeWords: [
      { word: 'day', isTarget: true },
      { word: 'rain', isTarget: true },
      { word: 'cake', isTarget: true },
      { word: 'den', isTarget: false },
      { word: 'run', isTarget: false },
      { word: 'kick', isTarget: false },
    ],
  },
  {
    id: 'price',
    ipaSymbol: 'aɪ',
    category: 'diphthong',
    hungarianDifficulty: 'straightforward',
    hungarianNote: 'Similar to the Hungarian "aj" sequence, so usually learnable, but the glide is often cut short.',
    hungarianNoteHu: 'Hasonlít a magyar "aj" hangkapcsolathoz, ezért általában könnyen megtanulható, de a csúszást gyakran túl röviden ejtik.',
    exampleWords: [
      { word: 'time', highlight: 'i' },
      { word: 'my', highlight: 'y' },
    ],
    articulation: {
      description: 'Starts low-front/central, glides upward toward ɪ.',
      descriptionHu: 'Nyitott, elöl-középső "a" hangról indul, és felfelé csúszik az "i" felé. A hang elejét ejtsd hosszabban, a végét gyorsan, halkan.',
      tonguePosition: 'low-front',
      lipRounding: 'unrounded',
    },
    swipeWords: [
      { word: 'time', isTarget: true },
      { word: 'my', isTarget: true },
      { word: 'five', isTarget: true },
      { word: 'team', isTarget: false },
      { word: 'may', isTarget: false },
      { word: 'fed', isTarget: false },
    ],
  },
  {
    id: 'mouth',
    ipaSymbol: 'aʊ',
    category: 'diphthong',
    hungarianDifficulty: 'straightforward',
    hungarianNote: 'Similar to the Hungarian "au" sequence in loanwords, but English rounds and raises further toward u than most learners expect.',
    hungarianNoteHu: 'Hasonlít a magyar jövevényszavakban előforduló "au" hangkapcsolathoz, de az angolban erősebb ajakkerekítéssel és u felé emelkedéssel jár, mint amit a legtöbb tanuló vár.',
    exampleWords: [
      { word: 'house', highlight: 'ou' },
      { word: 'now', highlight: 'ow' },
    ],
    articulation: {
      description: 'Starts low-central, glides upward and rounds toward u.',
      descriptionHu: 'Nyitott, középső "a"-ról indul, majd az ajkak egyre kerekednek, és a nyelv az "u" felé emelkedik. Az első rész hosszabb és erősebb, a második gyorsan elhal.',
      tonguePosition: 'low-front',
      lipRounding: 'unrounded',
    },
    swipeWords: [
      { word: 'house', isTarget: true },
      { word: 'now', isTarget: true },
      { word: 'cloud', isTarget: true },
      { word: 'heat', isTarget: false },
      { word: 'new', isTarget: false },
      { word: 'cold', isTarget: false },
    ],
  },
  {
    id: 'choice',
    ipaSymbol: 'ɔɪ',
    category: 'diphthong',
    hungarianDifficulty: 'straightforward',
    hungarianNote: 'Rare glide shape for Hungarian speakers — the starting vowel is often replaced with a plain Hungarian "o".',
    hungarianNoteHu: 'Ritka csúszóhang-forma a magyar anyanyelvűek számára — a kezdő magánhangzót gyakran sima magyar "o"-val helyettesítik.',
    exampleWords: [
      { word: 'boy', highlight: 'oy' },
      { word: 'voice', highlight: 'oi' },
    ],
    articulation: {
      description: 'Starts low-back rounded, glides upward toward ɪ.',
      descriptionHu: 'Nyitott, hátsó, kerek "o" hangról indul, majd a nyelv felfelé, az "i" felé csúszik, és az ajkak szétnyílnak. Hasonlít a magyar "oj"-ra, de az első hang nyitottabb.',
      tonguePosition: 'low-back',
      lipRounding: 'rounded',
    },
    swipeWords: [
      { word: 'boy', isTarget: true },
      { word: 'voice', isTarget: true },
      { word: 'coin', isTarget: true },
      { word: 'buy', isTarget: false },
      { word: 'verse', isTarget: false },
      { word: 'con', isTarget: false },
    ],
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
      descriptionHu: 'Zárd össze az ajkakat, majd nyisd fel gyorsan, hogy egy kis levegőlöket (aspiráció) szabaduljon ki. A hangszalagok nem rezegnek. Szó elején a levegőlökés erősebb, mint a magyar p-nél — tarts egy papírlapot a szád elé, és lengenie kell.',
      voicing: 'voiceless',
      manner: 'stop',
      place: 'bilabial',
    },
    swipeWords: [
      { word: 'pen', isTarget: true },
      { word: 'stop', isTarget: true },
      { word: 'cup', isTarget: true },
      { word: 'ten', isTarget: false },
      { word: 'stock', isTarget: false },
      { word: 'cub', isTarget: false },
    ],
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
      descriptionHu: 'Zárd össze az ajkakat, majd nyisd fel a hangszalagok rezgésével, levegőlöket nélkül. Ugyanaz az ajakállás, mint a p-nél, de zöngés.',
      voicing: 'voiced',
      manner: 'stop',
      place: 'bilabial',
    },
    swipeWords: [
      { word: 'bag', isTarget: true },
      { word: 'cab', isTarget: true },
      { word: 'big', isTarget: true },
      { word: 'tag', isTarget: false },
      { word: 'cat', isTarget: false },
      { word: 'pig', isTarget: false },
    ],
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
      descriptionHu: 'A nyelv hegye a fogmederhez (a felső fogak mögötti dombhoz) nyomódik, majd gyorsan elengeded egy kis levegőlökettel. Zöngétlen. Szó elején az angol t erősebben "pattan", mint a magyar.',
      voicing: 'voiceless',
      manner: 'stop',
      place: 'alveolar',
    },
    swipeWords: [
      { word: 'top', isTarget: true },
      { word: 'cat', isTarget: true },
      { word: 'tea', isTarget: true },
      { word: 'cop', isTarget: false },
      { word: 'cap', isTarget: false },
      { word: 'pea', isTarget: false },
    ],
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
      descriptionHu: 'Ugyanaz a nyelvállás, mint a t-nél: a nyelv hegye a fogmederhez ér, de a hangszalagok rezegnek, és nincs levegőlöket.',
      voicing: 'voiced',
      manner: 'stop',
      place: 'alveolar',
    },
    swipeWords: [
      { word: 'dog', isTarget: true },
      { word: 'bed', isTarget: true },
      { word: 'day', isTarget: true },
      { word: 'log', isTarget: false },
      { word: 'bet', isTarget: false },
      { word: 'gay', isTarget: false },
    ],
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
      descriptionHu: 'A nyelv hátsó része a lágy szájpadhoz nyomódik, majd gyorsan elengeded egy kis levegőlökettel. Zöngétlen, szó elején erősebb aspirációval, mint a magyar k.',
      voicing: 'voiceless',
      manner: 'stop',
      place: 'velar',
    },
    swipeWords: [
      { word: 'cat', isTarget: true },
      { word: 'back', isTarget: true },
      { word: 'key', isTarget: true },
      { word: 'bat', isTarget: false },
      { word: 'van', isTarget: false },
      { word: 'tea', isTarget: false },
    ],
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
      descriptionHu: 'Ugyanaz a nyelvállás, mint a k-nál, de a hangszalagok rezegnek, és nincs levegőlöket. Ez egy kemény "g", mint a magyar.',
      voicing: 'voiced',
      manner: 'stop',
      place: 'velar',
    },
    swipeWords: [
      { word: 'go', isTarget: true },
      { word: 'big', isTarget: true },
      { word: 'gate', isTarget: true },
      { word: 'no', isTarget: false },
      { word: 'bid', isTarget: false },
      { word: 'date', isTarget: false },
    ],
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
      descriptionHu: 'A felső fogak enyhén az alsó ajkat érintik, és a levegő átáramlik a résen. Zöngétlen, mint a magyar "f".',
      voicing: 'voiceless',
      manner: 'fricative',
      place: 'labiodental',
    },
    swipeWords: [
      { word: 'fish', isTarget: true },
      { word: 'laugh', isTarget: true },
      { word: 'fun', isTarget: true },
      { word: 'dish', isTarget: false },
      { word: 'love', isTarget: false },
      { word: 'sun', isTarget: false },
    ],
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
      descriptionHu: 'A felső fogak az alsó ajkat érintik, a levegő átáramlik a résen, a hangszalagok rezegnek. Ez a magyar "v" — de figyelj arra, hogy az angol w-nél a fogak NEM érintik az ajkat.',
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
      descriptionHu: 'A nyelv hegye a fogmeder közelében, keskeny résen áramlik át a levegő. Zöngétlen, mint a magyar "sz".',
      voicing: 'voiceless',
      manner: 'fricative',
      place: 'alveolar',
    },
    swipeWords: [
      { word: 'sun', isTarget: true },
      { word: 'bus', isTarget: true },
      { word: 'sea', isTarget: true },
      { word: 'fun', isTarget: false },
      { word: 'bug', isTarget: false },
      { word: 'tea', isTarget: false },
    ],
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
      descriptionHu: 'Ugyanaz a nyelvállás, mint az s-nél, de a hangszalagok rezegnek. Mint a magyar "z".',
      voicing: 'voiced',
      manner: 'fricative',
      place: 'alveolar',
    },
    swipeWords: [
      { word: 'zoo', isTarget: true },
      { word: 'buzz', isTarget: true },
      { word: 'zip', isTarget: true },
      { word: 'too', isTarget: false },
      { word: 'bus', isTarget: false },
      { word: 'sip', isTarget: false },
    ],
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
      descriptionHu: 'A nyelv kissé hátrébb van, mint az s-nél, az ajkak enyhén előrekerekednek. Zöngétlen, mint a magyar "s" ("sál").',
      voicing: 'voiceless',
      manner: 'fricative',
      place: 'postalveolar',
    },
    swipeWords: [
      { word: 'shoe', isTarget: true },
      { word: 'wash', isTarget: true },
      { word: 'shop', isTarget: true },
      { word: 'sue', isTarget: false },
      { word: 'was', isTarget: false },
      { word: 'stop', isTarget: false },
    ],
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
      descriptionHu: 'Ugyanaz a nyelvállás, mint a ʃ-nál, de zöngés. Mint a magyar "zs" ("zseb").',
      voicing: 'voiced',
      manner: 'fricative',
      place: 'postalveolar',
    },
    swipeWords: [
      { word: 'vision', isTarget: true },
      { word: 'measure', isTarget: true },
      { word: 'casual', isTarget: true },
      { word: 'mission', isTarget: false },
      { word: 'pressure', isTarget: false },
      { word: 'national', isTarget: false },
    ],
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
      descriptionHu: 'Nyitott szájjal, akadály nélkül fújj ki egy kis levegőt a torokból. A nyelvet nem kell sehova nyomni.',
      voicing: 'voiceless',
      manner: 'fricative',
      place: 'glottal',
    },
    swipeWords: [
      { word: 'hat', isTarget: true },
      { word: 'house', isTarget: true },
      { word: 'behind', isTarget: true },
      { word: 'at', isTarget: false },
      { word: 'mouse', isTarget: false },
      { word: 'inside', isTarget: false },
    ],
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
      descriptionHu: 'Kezdd úgy, mint a t-t (nyelv a fogmederhez), de a robbanás helyett engedd át a levegőt a ʃ helyzetében. Mint a magyar "cs".',
      voicing: 'voiceless',
      manner: 'affricate',
      place: 'postalveolar',
    },
    swipeWords: [
      { word: 'chair', isTarget: true },
      { word: 'watch', isTarget: true },
      { word: 'chin', isTarget: true },
      { word: 'share', isTarget: false },
      { word: 'wash', isTarget: false },
      { word: 'shin', isTarget: false },
    ],
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
      descriptionHu: 'Kezdd úgy, mint a d-t, majd engedd át a levegőt a ʒ helyzetében, zöngésen. Mint a magyar "dzs".',
      voicing: 'voiced',
      manner: 'affricate',
      place: 'postalveolar',
    },
    swipeWords: [
      { word: 'jump', isTarget: true },
      { word: 'bridge', isTarget: true },
      { word: 'joy', isTarget: true },
      { word: 'dump', isTarget: false },
      { word: 'bring', isTarget: false },
      { word: 'toy', isTarget: false },
    ],
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
      descriptionHu: 'Zárd össze az ajkakat, a levegő és a hang az orron át távozik. Mint a magyar "m".',
      voicing: 'voiced',
      manner: 'nasal',
      place: 'bilabial',
    },
    swipeWords: [
      { word: 'man', isTarget: true },
      { word: 'swim', isTarget: true },
      { word: 'moon', isTarget: true },
      { word: 'van', isTarget: false },
      { word: 'swing', isTarget: false },
      { word: 'noon', isTarget: false },
    ],
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
      descriptionHu: 'A nyelv hegye a fogmederhez nyomódik, a levegő és a hang az orron át távozik. Mint a magyar "n".',
      voicing: 'voiced',
      manner: 'nasal',
      place: 'alveolar',
    },
    swipeWords: [
      { word: 'name', isTarget: true },
      { word: 'sun', isTarget: true },
      { word: 'no', isTarget: true },
      { word: 'fame', isTarget: false },
      { word: 'sub', isTarget: false },
      { word: 'go', isTarget: false },
    ],
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
      descriptionHu: 'A nyelv hegye a fogmederhez ér, a levegő a nyelv két oldalán áramlik. Zöngés. Szó vagy szótag elején ugyanúgy ejtjük, mint a magyar "l"-t.',
      voicing: 'voiced',
      manner: 'lateral',
      place: 'alveolar',
    },
    swipeWords: [
      { word: 'light', isTarget: true },
      { word: 'lamp', isTarget: true },
      { word: 'blue', isTarget: true },
      { word: 'right', isTarget: false },
      { word: 'ramp', isTarget: false },
      { word: 'brew', isTarget: false },
    ],
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
      descriptionHu: 'A nyelv magasan elöl van, mint az "i"-nél, majd gyorsan csúszik a következő magánhangzó felé. Mint a magyar "j".',
      voicing: 'voiced',
      manner: 'approximant',
      place: 'palatal',
    },
    swipeWords: [
      { word: 'yes', isTarget: true },
      { word: 'yellow', isTarget: true },
      { word: 'use', isTarget: true },
      { word: 'less', isTarget: false },
      { word: 'mellow', isTarget: false },
      { word: 'ooze', isTarget: false },
    ],
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
      descriptionHu: 'Az állkapocs félig nyitott, a nyelv félig elöl van — magasabban és kevésbé szétfeszítve, mint az æ-nél. A magyar "e"-hez áll a legközelebb.',
      tonguePosition: 'mid-front',
      lipRounding: 'unrounded',
    },
    curriculumId: 'ae-vs-e',
  },
]

export function getPhoneme(id: string): Phoneme | undefined {
  return phonemes.find((p) => p.id === id)
}

/** First tile linking to this curriculum item — used to route the resurfacing queue's cards back to a detail page. */
export function getPhonemeByCurriculumId(curriculumId: string): Phoneme | undefined {
  return phonemes.find((p) => p.curriculumId === curriculumId)
}

/** Critical tier only — the shortlist of tiles shown above the chart's difficulty divider. */
export const difficultTierPhonemes = phonemes.filter((p) => p.hungarianDifficulty === 'critical')

export const straightforwardPhonemes = phonemes.filter((p) => p.hungarianDifficulty === 'straightforward')
