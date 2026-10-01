// Stress Patterns session — hand-authored, static. Grounded in the author's dissertation
// (§1.4.2 "Word stress pattern", §2.4.3.4 suffix groups, §3.3 dictation errors such as
// about→but, possession→"zesön", fulfilled→"full feel") and Nádasdy's "Background to English
// Pronunciation" (2006). Placeholder-quality wording pending linguistic review, same caveat as
// pronunciationCurriculum.ts and phonemes.ts. Stress positions below hold for both General
// American and British English; words whose stress differs between the two (e.g. magazine,
// afternoon, employee) are deliberately left out so the free TTS voices can't contradict the key.
import type { LessonSession } from './types.js'

export const stressPatterns: LessonSession = {
  id: 'stress-patterns',
  title: 'Stress Patterns',
  titleHu: 'Szóhangsúly',
  descriptionHu:
    'A magyarban a hangsúly mindig az első szótagon van — az angolban szavanként változik. Itt megtanulod hallani és megjósolni.',
  unitNoun: { en: 'Unit', hu: 'Egység' },
  units: [
    {
      id: 'stress-basics',
      title: 'Hungarian vs English stress',
      titleHu: 'Magyar és angol hangsúly',
      summaryHu: 'Hol a hangsúly? Szótagok hallgatása és a hangsúlyminták felismerése.',
      theory: [
        {
          headingHu: 'Mi a különbség?',
          bodyHu:
            'A magyarban a hangsúly mindig a szó első szótagjára esik, ezért ezt automatikusan az angol szavakra is átvisszük. Az angolban a hangsúly szavanként más helyen lehet, és a hangsúlyos szótag hosszabb, hangosabb és magasabb, a hangsúlytalan pedig gyenge, rövid.',
          examples: [
            { text: 'banana', soundsLike: 'ba-NA-na' },
            { text: 'hotel', soundsLike: 'ho-TEL' },
            { text: 'holiday', soundsLike: 'HOL-i-day' },
          ],
        },
        {
          headingHu: 'Miért baj, ha elrontjuk?',
          bodyHu:
            'A rosszul hangsúlyozott szót az angol anyanyelvű sem érti, a mi fülünk pedig a hangsúlyos szótagot a következő szó elejének hallja. Sok szónál van egy hasznos minta: a nemzetiségnevek hangsúlya sokszor nem az első szótagon van.',
          examples: [
            { text: 'Hungarian', soundsLike: 'hun-GAR-i-an' },
            { text: 'Italian', soundsLike: 'i-TAL-ian' },
            { text: 'Chinese', soundsLike: 'chi-NESE' },
          ],
        },
      ],
      body: {
        kind: 'steps',
        steps: [
          { type: 'syllable-tap', audio: 'banana', target: 'banana', syllables: ['ba', 'na', 'na'], stressed: 1, explainHu: 'ba-NA-na: a hangsúly a középső szótagon van, nem az elsőn.' },
          { type: 'syllable-tap', audio: 'hotel', target: 'hotel', syllables: ['ho', 'tel'], stressed: 1, explainHu: 'ho-TEL: a magyar „hotel" első szótagján hangsúly van, az angolban a másodikon.' },
          { type: 'syllable-tap', audio: 'police', target: 'police', syllables: ['po', 'lice'], stressed: 1, explainHu: 'po-LICE: az első szótag gyenge, szinte „p\'lice".' },
          { type: 'syllable-tap', audio: 'computer', target: 'computer', syllables: ['com', 'pu', 'ter'], stressed: 1, explainHu: 'com-PU-ter: a hangsúly a második szótagon.' },
          { type: 'syllable-tap', audio: 'Hungarian', target: 'Hungarian', syllables: ['Hun', 'gar', 'i', 'an'], stressed: 1, explainHu: 'hun-GAR-i-an: még a saját nemzetiségünk neve sem az első szótagon hangsúlyos.' },
          { type: 'syllable-tap', audio: 'Italian', target: 'Italian', syllables: ['I', 'tal', 'ian'], stressed: 1, explainHu: 'i-TAL-ian: a hangsúly a második szótagon.' },
          { type: 'listen-choose', audio: 'holiday', promptHu: 'Hallgasd meg a szót. Melyik hangsúlymintát hallod? (● = hangsúlyos szótag)', options: ['●··', '·●·', '··●'], keepOrder: true, correct: 0, explainHu: 'HOL-i-day: ●··' },
          { type: 'listen-choose', audio: 'umbrella', promptHu: 'Melyik hangsúlymintát hallod? (● = hangsúlyos szótag)', options: ['●··', '·●·', '··●'], keepOrder: true, correct: 1, explainHu: 'um-BREL-la: ·●·' },
          { type: 'listen-choose', audio: 'yesterday', promptHu: 'Melyik hangsúlymintát hallod? (● = hangsúlyos szótag)', options: ['●··', '·●·', '··●'], keepOrder: true, correct: 0, explainHu: 'YES-ter-day: ●··' },
          { type: 'odd-one-out', promptHu: 'Hallgasd meg mindhármat: melyiknek más a hangsúlymintája?', words: ['table', 'window', 'hotel'], oddIndex: 2, explainHu: 'A table és a window az első szótagon hangsúlyos (●·), a hotel a másodikon (·●).' },
          { type: 'odd-one-out', promptHu: 'Hallgasd meg mindhármat: melyiknek más a hangsúlymintája?', words: ['police', 'begin', 'Monday'], oddIndex: 2, explainHu: 'A police és a begin a második szótagon hangsúlyos (·●), a Monday az elsőn (●·).' },
        ],
      },
    },
    {
      id: 'stress-suffixes',
      title: 'Suffixes that fix the stress',
      titleHu: 'Hangsúlyt rögzítő végződések',
      summaryHu: '-tion, -ic, -ity, -ee, -ese: a végződésből megjósolható, hol a hangsúly.',
      theory: [
        {
          headingHu: 'Néhány végződés megmondja, hol a hangsúly',
          bodyHu:
            'Az angol hangsúlyszabályok egésze túl bonyolult, de néhány végződés egyszerűen használható. A -tion, -sion, -ic, -ical, -ity és -ian végződés előtti szótag hangsúlyos. Ugyanabból a szóból ezért más hangsúly lesz, ha végződést kap.',
          examples: [
            { text: 'education', soundsLike: 'ed-u-CA-tion' },
            { text: 'electric', soundsLike: 'e-LEC-tric' },
            { text: 'electricity', soundsLike: 'e-lec-TRI-ci-ty' },
          ],
        },
        {
          headingHu: 'A végződés maga is hangsúlyos',
          bodyHu:
            'A -ee, -eer és -ese végződés saját magán hordozza a hangsúlyt. A -ment, -ness, -ful és -ing nem változtat a hangsúlyon.',
          examples: [
            { text: 'refugee', soundsLike: 'ref-u-GEE' },
            { text: 'volunteer', soundsLike: 'vol-un-TEER' },
            { text: 'enjoyment', soundsLike: 'en-JOY-ment' },
          ],
        },
        {
          headingHu: 'Egy szócsalád, három hangsúly',
          bodyHu: 'Hallgasd meg, hogyan vándorol a hangsúly, ahogy a szó hosszabb lesz.',
          examples: [
            { text: 'photograph', soundsLike: 'PHO-to-graph' },
            { text: 'photography', soundsLike: 'pho-TOG-ra-phy' },
            { text: 'photographic', soundsLike: 'pho-to-GRAPH-ic' },
          ],
        },
      ],
      body: {
        kind: 'steps',
        steps: [
          { type: 'syllable-tap', audio: 'education', target: 'education', syllables: ['ed', 'u', 'ca', 'tion'], stressed: 2, explainHu: '-tion: a hangsúly közvetlenül a végződés előtt van → ed-u-CA-tion.' },
          { type: 'syllable-tap', audio: 'information', target: 'information', syllables: ['in', 'for', 'ma', 'tion'], stressed: 2, explainHu: '-tion: in-for-MA-tion.' },
          { type: 'syllable-tap', audio: 'electric', target: 'electric', syllables: ['e', 'lec', 'tric'], stressed: 1, explainHu: '-ic: e-LEC-tric.' },
          { type: 'syllable-tap', audio: 'electricity', target: 'electricity', syllables: ['e', 'lec', 'tri', 'ci', 'ty'], stressed: 2, explainHu: '-ity: e-lec-TRI-ci-ty. A hangsúly a végződés előtti szótagra ugrott.' },
          { type: 'syllable-tap', audio: 'photograph', target: 'photograph', syllables: ['pho', 'to', 'graph'], stressed: 0, explainHu: 'PHO-to-graph: az alapszónál az első szótag hangsúlyos.' },
          { type: 'syllable-tap', audio: 'photography', target: 'photography', syllables: ['pho', 'tog', 'ra', 'phy'], stressed: 1, explainHu: 'pho-TOG-ra-phy.' },
          { type: 'syllable-tap', audio: 'photographic', target: 'photographic', syllables: ['pho', 'to', 'graph', 'ic'], stressed: 2, explainHu: 'pho-to-GRAPH-ic: -ic előtt.' },
          { type: 'syllable-tap', audio: 'refugee', target: 'refugee', syllables: ['ref', 'u', 'gee'], stressed: 2, explainHu: '-ee: maga a végződés hangsúlyos → ref-u-GEE.' },
          { type: 'syllable-tap', audio: 'volunteer', target: 'volunteer', syllables: ['vol', 'un', 'teer'], stressed: 2, explainHu: '-eer: vol-un-TEER.' },
          { type: 'syllable-tap', audio: 'Chinese', target: 'Chinese', syllables: ['Chi', 'nese'], stressed: 1, explainHu: '-ese: Chi-NESE.' },
          { type: 'syllable-tap', audio: 'enjoyment', target: 'enjoyment', syllables: ['en', 'joy', 'ment'], stressed: 1, explainHu: '-ment nem mozdítja a hangsúlyt: en-JOY → en-JOY-ment.' },
          { type: 'listen-choose', promptHu: 'Hol van a hangsúly a „community" szóban? (-ity végződés)', options: ['COM-mu-ni-ty', 'com-MU-ni-ty', 'com-mu-NI-ty', 'com-mu-ni-TY'], correct: 1, explainHu: 'Az -ity előtt két szótaggal: com-MU-ni-ty.' },
          { type: 'listen-choose', audio: 'nationality', promptHu: 'Hallgasd meg: hol van a hangsúly?', options: ['NA-tion-al-i-ty', 'na-TION-al-i-ty', 'na-tion-AL-i-ty', 'na-tion-al-i-TY'], correct: 2, explainHu: 'na-tion-AL-i-ty: az -ity előtti szótag hangsúlyos.' },
        ],
      },
    },
    {
      id: 'stress-weak-first',
      title: 'Weak first syllables',
      titleHu: 'Gyenge első szótag',
      summaryHu: 'Az „about" miért hangzik „but"-nak? Szavak, amelyeknek az eleje „eltűnik".',
      theory: [
        {
          headingHu: 'Eltűnő szótag',
          bodyHu:
            'Ha egy szó első szótagja hangsúlytalan, az angolban szinte csak egy rövid „semleges" hang (schwa) marad belőle, és az egész szót a hangsúlyos rész uralja. Az osztálytermi mérések során ezért hallották sokan az „about" szót „but"-nak.',
          examples: [
            { text: 'about', soundsLike: "'bout" },
            { text: 'again', soundsLike: "'gain" },
            { text: 'along', soundsLike: "'long" },
          ],
        },
        {
          headingHu: 'Tipikus félrehallások',
          bodyHu: 'Ezeket az ismerős szavakat sokan nem ismerték fel a gyenge első szótag miatt. Ismerős szó, ismeretlen hangalak.',
          examples: [
            { text: 'possession', soundsLike: "p'ZESH-un" },
            { text: 'fulfilled', soundsLike: "ful-FILLD" },
            { text: 'compare', soundsLike: "c'm-PAIR" },
          ],
        },
      ],
      body: { kind: 'funnel', soundItemId: 'word-stress' },
    },
    {
      id: 'stress-shift',
      title: 'Same spelling, different stress',
      titleHu: 'Ugyanaz a szó, más hangsúly',
      summaryHu: 'Főnév és ige: present, record, object, increase.',
      theory: [
        {
          headingHu: 'Főnév az elején, ige a végén',
          bodyHu:
            'Sok kétszótagú szó főnévként az első, igeként a második szótagon hangsúlyos. A hangsúlyváltással a szó hangalakja is megváltozik, és a mondatból derül ki, melyiket hallod.',
          examples: [
            { text: 'a present', soundsLike: 'PRES-ent', audio: 'I bought a present.' },
            { text: 'to present', soundsLike: 'pre-SENT', audio: 'I will present my idea.' },
            { text: 'an increase', soundsLike: 'IN-crease', audio: 'There was an increase in prices.' },
            { text: 'to increase', soundsLike: 'in-CREASE', audio: 'Prices increase every year.' },
          ],
        },
      ],
      // The audio is a whole sentence so the TTS voice can pick the right reading from context.
      body: {
        kind: 'steps',
        steps: [
          { type: 'syllable-tap', audio: 'I bought a present for my mother.', target: 'present', syllables: ['pres', 'ent'], stressed: 0, contextHu: 'I bought a present for my mother.', explainHu: 'Főnév: PRES-ent.' },
          { type: 'syllable-tap', audio: 'Can I present my idea now?', target: 'present', syllables: ['pre', 'sent'], stressed: 1, contextHu: 'Can I present my idea now?', explainHu: 'Ige: pre-SENT.' },
          { type: 'syllable-tap', audio: 'There was a big increase in prices.', target: 'increase', syllables: ['in', 'crease'], stressed: 0, contextHu: 'There was a big increase in prices.', explainHu: 'Főnév: IN-crease.' },
          { type: 'syllable-tap', audio: 'Prices increase every year.', target: 'increase', syllables: ['in', 'crease'], stressed: 1, contextHu: 'Prices increase every year.', explainHu: 'Ige: in-CREASE.' },
          { type: 'syllable-tap', audio: 'What is that strange object?', target: 'object', syllables: ['ob', 'ject'], stressed: 0, contextHu: 'What is that strange object?', explainHu: 'Főnév: OB-ject.' },
          { type: 'syllable-tap', audio: "I don't object to the plan.", target: 'object', syllables: ['ob', 'ject'], stressed: 1, contextHu: "I don't object to the plan.", explainHu: 'Ige: ob-JECT.' },
        ],
      },
    },
  ],
}
