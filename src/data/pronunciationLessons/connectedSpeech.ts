// Connected Speech session — six layers, easiest to hardest, following the order of the author's
// dissertation §1.4.3 (time-stressed rhythm → weak forms → linking → elision → assimilation) plus
// a mixed layer. Example phrases are the dissertation's own (cup of tea, go out, I see it, just do
// it, next week, good girl, I can buy it, did you / would you / could you) or modelled on them;
// sentences are original, not song lyrics. Placeholder-quality wording pending linguistic review.
//
// Audio is the browser's TTS, which reads carefully and will often NOT produce the reduced form
// itself. So the exercises ask the learner to know/notice the phenomenon (where words join, which
// sound drops, what the fast form is) rather than to discriminate a TTS-rendered reduction, and
// `soundsLike` respellings are shown as text. See docs/pronunciation-sessions-brief.md.
import type { LessonSession } from './types.js'

export const connectedSpeech: LessonSession = {
  id: 'connected-speech',
  title: 'Connected Speech',
  titleHu: 'Összefüggő beszéd',
  descriptionHu:
    'A beszédben a szavak összeolvadnak, megváltoznak, kiesnek. Hat rétegen át megtanulod, mit hallasz valójában.',
  unitNoun: { en: 'Layer', hu: 'Réteg' },
  units: [
    {
      id: 'cs-rhythm',
      title: 'Layer 1 · Rhythm',
      titleHu: '1. réteg · Ritmus',
      summaryHu: 'Az angol hangsúlyidőzített: a hangsúlyos szavak ütemre jönnek, a többi összenyomódik.',
      theory: [
        {
          headingHu: 'Szótagidőzítés és hangsúlyidőzítés',
          bodyHu:
            'A magyarban minden szótag nagyjából egyforma hosszú, ezért a mondat hossza a szótagok számától függ. Az angolban a hangsúlyos szótagok szabályos időközönként követik egymást, és a köztük lévő hangsúlytalan szótagok gyorsan, összenyomva hangzanak el. Ezért kerül a mondat „ritmusa" a tartalmas szavakra.',
          examples: [
            { text: 'Cats chase mice.', soundsLike: 'CATS CHASE MICE' },
            { text: 'The cats are chasing the mice.', soundsLike: 'the CATS are CHAsing the MICE' },
          ],
        },
        {
          headingHu: 'Mi kap hangsúlyt?',
          bodyHu:
            'A tartalmas szavak hangsúlyosak: főnevek, igék, melléknevek, határozószók, tagadás. A szerkezeti szavak (the, to, of, and, can, was) gyengék. A fenti két „cats" mondatban is három ütem van, bár a másodikban több szótag van.',
          examples: [{ text: "I'm going to the shop to buy some eggs.", soundsLike: "I'm GOing to the SHOP to BUY some EGGS" }],
        },
      ],
      body: {
        kind: 'steps',
        steps: [
          { type: 'token-select', mode: 'words', audio: "I'm going to the shop to buy some eggs.", tokens: ["I'm", 'going', 'to', 'the', 'shop', 'to', 'buy', 'some', 'eggs'], correct: [1, 4, 6, 8], promptHu: 'Jelöld meg a hangsúlyos (tartalmas) szavakat.', explainHu: 'going, shop, buy, eggs: négy ütem. A to, the, to, some összenyomódik.' },
          { type: 'token-select', mode: 'words', audio: 'She wants to learn a new language.', tokens: ['She', 'wants', 'to', 'learn', 'a', 'new', 'language'], correct: [1, 3, 5, 6], promptHu: 'Jelöld meg a hangsúlyos szavakat.', explainHu: 'wants, learn, new, language hangsúlyos. A to és az a gyenge.' },
          { type: 'token-select', mode: 'words', audio: 'Can you tell me the way to the station?', tokens: ['Can', 'you', 'tell', 'me', 'the', 'way', 'to', 'the', 'station'], correct: [2, 5, 8], promptHu: 'Jelöld meg a hangsúlyos szavakat.', explainHu: 'tell, way, station: három ütem, bár kilenc szó.' },
          { type: 'listen-choose', audio: 'The cat sat on the mat.', promptHu: 'Hány hangsúlyos ütem van a mondatban? (Ne a szótagokat számold!)', options: ['3', '4', '5', '7'], correct: 0, keepOrder: true, explainHu: 'CAT, SAT, MAT: három ütem.' },
          { type: 'listen-choose', audio: 'Peter wants to buy some bread.', promptHu: 'Hány hangsúlyos ütem van a mondatban?', options: ['3', '4', '5', '7'], correct: 1, keepOrder: true, explainHu: 'PEter, WANTS, BUY, BREAD: négy ütem.' },
        ],
      },
    },
    {
      id: 'cs-weak-forms',
      title: 'Layer 2 · Weak forms',
      titleHu: '2. réteg · Gyenge alakok',
      summaryHu: 'to, the, of, and, can, some: a rövid szavak „más szónak" hangzanak.',
      theory: [
        {
          headingHu: 'A schwa, az angol leggyakoribb hangja',
          bodyHu:
            'A gyakori rövid szavak (segédigék, elöljárószók, névelők) a mondatban nem hangsúlyosak, ezért a teljes magánhangzójuk helyett egy rövid schwa (/ə/) hangot kapnak, vagy teljesen kiesnek. Ez ad az angolnak ritmust, és ezek a szavak okoztak a legtöbb félrehallást: a „some" „send"-nek, az „are" „of"-nak hangzott.',
          examples: [
            { text: 'some milk', soundsLike: 's\'m milk' },
            { text: 'cup of tea', soundsLike: 'cuppa tea' },
            { text: 'fish and chips', soundsLike: "fish 'n' chips" },
            { text: 'I can swim', soundsLike: 'I c\'n swim' },
          ],
        },
        {
          headingHu: 'Mikor „erős" a szó?',
          bodyHu: 'Ha a szó hangsúlyos, vagy a mondat végén áll, az erős alakját halljuk: „Yes, I can!" (teljes) és „I can swim." (gyenge).',
          examples: [
            { text: 'Yes, I can!', soundsLike: 'strong: kan' },
            { text: 'I can swim.', soundsLike: 'weak: k\'n' },
          ],
        },
      ],
      body: { kind: 'funnel', soundItemId: 'weak-forms' },
    },
    {
      id: 'cs-linking',
      title: 'Layer 3 · Linking',
      titleHu: '3. réteg · Kötés',
      summaryHu: 'A szavak között nincs szünet: „cup of tea" → „cupoftea".',
      theory: [
        {
          headingHu: 'Mássalhangzó + magánhangzó',
          bodyHu:
            'Írásban a szavak között szóköz van, beszédben nincs. Ha egy szó mássalhangzóra végződik és a következő magánhangzóval kezdődik, a kettő összekötődik, mintha egy szó lenne.',
          examples: [
            { text: 'cup of tea', soundsLike: 'cu-po-ftea' },
            { text: 'an egg', soundsLike: 'a-negg' },
            { text: 'fried egg', soundsLike: 'frie-degg' },
          ],
        },
        {
          headingHu: 'Magánhangzó + magánhangzó: /w/ és /j/',
          bodyHu:
            'Két magánhangzó között egy kis „csúszóhang" jelenik meg. Kerek, „u"-szerű záródás után /w/ hallatszik, „i"-szerű záródás után /j/.',
          examples: [
            { text: 'go out', soundsLike: 'go-wout' },
            { text: 'two eggs', soundsLike: 'two-weggs' },
            { text: 'I see it', soundsLike: 'I see-yit' },
            { text: 'three eggs', soundsLike: 'three-yeggs' },
          ],
        },
        {
          headingHu: 'Tipikus félrehallások',
          bodyHu: 'Az osztálytermi tesztekben a szóhatárok eltűnése miatt ismerős szavakat sem ismertek fel a tanulók.',
          examples: [
            { text: 'wake up', soundsLike: 'heard as "we cup"' },
            { text: 'way the', soundsLike: 'heard as "weather"' },
            { text: 'find it', soundsLike: 'heard as "fine did"' },
          ],
        },
      ],
      body: {
        kind: 'steps',
        steps: [
          { type: 'token-select', mode: 'gaps', audio: 'Pick up a cup of tea.', tokens: ['Pick', 'up', 'a', 'cup', 'of', 'tea'], correct: [0, 1, 3], promptHu: 'Kattints azokra a szóhatárokra, ahol a két szó összekötődik (mássalhangzó + magánhangzó).', explainHu: 'Pick|up, up|a, cup|of: mássalhangzóra végződő szó + magánhangzóval induló szó.' },
          { type: 'token-select', mode: 'gaps', audio: 'I need an egg and a fried egg.', tokens: ['I', 'need', 'an', 'egg', 'and', 'a', 'fried', 'egg'], correct: [1, 2, 3, 4, 6], promptHu: 'Kattints azokra a szóhatárokra, ahol a szavak összekötődnek.', explainHu: 'need|an, an|egg, egg|and, and|a, fried|egg: mind mássalhangzó + magánhangzó. Az „I|need" és az „a|fried" nem.' },
          { type: 'listen-choose', audio: 'go out', promptHu: 'Milyen csúszóhang van a „go out" két szava között?', options: ['/w/', '/j/'], correct: 0, keepOrder: true, explainHu: 'go-wout: az „o" kerek záródása után /w/.' },
          { type: 'listen-choose', audio: 'I see it', promptHu: 'Milyen csúszóhang van a „see it" két szava között?', options: ['/w/', '/j/'], correct: 1, keepOrder: true, explainHu: 'see-yit: az „i"-szerű záródás után /j/.' },
          { type: 'listen-choose', audio: 'two eggs', promptHu: 'Milyen csúszóhang van a „two eggs" két szava között?', options: ['/w/', '/j/'], correct: 0, keepOrder: true, explainHu: 'two-weggs: /w/.' },
          { type: 'listen-choose', audio: 'three eggs', promptHu: 'Milyen csúszóhang van a „three eggs" két szava között?', options: ['/w/', '/j/'], correct: 1, keepOrder: true, explainHu: 'three-yeggs: /j/.' },
          { type: 'listen-choose', audio: 'How are you?', promptHu: 'Milyen csúszóhang van a „how are" két szava között?', options: ['/w/', '/j/'], correct: 0, keepOrder: true, explainHu: 'how-ware you: az „ow" /aʊ/ kerek záródású, ezért /w/.' },
          { type: 'listen-choose', audio: 'my own', promptHu: 'Milyen csúszóhang van a „my own" két szava között?', options: ['/w/', '/j/'], correct: 1, keepOrder: true, explainHu: 'my-yown: az /aɪ/ „i"-szerű záródása után /j/.' },
        ],
      },
    },
    {
      id: 'cs-elision',
      title: 'Layer 4 · Elision',
      titleHu: '4. réteg · Kiesés',
      summaryHu: 'Három mássalhangzó egymás mellett: a középső (főleg /t/, /d/) eltűnik.',
      theory: [
        {
          headingHu: 'Ami kimarad',
          bodyHu:
            'Gyors beszédben, ha három mássalhangzó követi egymást, a középső gyakran kiesik. Leggyakrabban a /t/ és a /d/ marad ki. Ezért hallatszik a „just do it" úgy, mint „jus\' do it".',
          examples: [
            { text: 'just do it', soundsLike: "jus' do it" },
            { text: 'next week', soundsLike: "nex' week" },
            { text: 'postman', soundsLike: "pos'man" },
            { text: 'old man', soundsLike: "ol' man" },
          ],
        },
        {
          headingHu: 'Nem csak szóhatáron',
          bodyHu: 'A kiesés egyetlen szón belül is előfordul, a szó közepén. Ha a kiesés mellett kötés is van, a kifejezést alig lehet felismerni: az „It\'s easy" a tanulók többségének „this"-nek hallatszott.',
          examples: [
            { text: "It's easy", soundsLike: 'heard as "this"' },
            { text: 'friends and', soundsLike: "frien(d)s 'n'" },
          ],
        },
      ],
      body: {
        kind: 'steps',
        steps: [
          { type: 'listen-choose', audio: 'just do it', promptHu: 'Melyik hang esik ki a „just do it" kifejezésben?', options: ['/t/', '/d/', 'egyik sem'], correct: 0, keepOrder: true, explainHu: 'jus\' do it: a „just" végi /t/ kiesik a /s/ és a /d/ között.' },
          { type: 'listen-choose', audio: 'old man', promptHu: 'Melyik hang esik ki az „old man" kifejezésben?', options: ['/t/', '/d/', 'egyik sem'], correct: 1, keepOrder: true, explainHu: 'ol\' man: az „old" végi /d/ kiesik a /l/ és az /m/ között.' },
          { type: 'listen-choose', audio: 'postman', promptHu: 'Melyik hang esik ki a „postman" szóban?', options: ['/t/', '/d/', 'egyik sem'], correct: 0, keepOrder: true, explainHu: 'pos\'man: a /t/ kiesik a /s/ és az /m/ között.' },
          { type: 'listen-choose', audio: 'last night', promptHu: 'Melyik hang esik ki a „last night" kifejezésben?', options: ['/t/', '/d/', 'egyik sem'], correct: 0, keepOrder: true, explainHu: 'las\' night.' },
          { type: 'listen-choose', audio: 'friends and', promptHu: 'Melyik hang esik ki a „friends and" kifejezésben?', options: ['/t/', '/d/', 'egyik sem'], correct: 1, keepOrder: true, explainHu: 'frien(d)s and: a /d/ kiesik az /n/ és a /z/ között.' },
          { type: 'listen-choose', audio: 'a big dog', promptHu: 'Melyik hang esik ki az „a big dog" kifejezésben?', options: ['/t/', '/d/', 'egyik sem'], correct: 2, keepOrder: true, explainHu: 'Itt nincs három mássalhangzós csoport, ezért nincs kiesés.' },
          { type: 'dictation', text: "I'm going next week.", keyWords: ['going', 'next', 'week'], labelHu: 'kulcsszó' },
          { type: 'dictation', text: 'Just do it now.', keyWords: ['just', 'do', 'it'], labelHu: 'kulcsszó' },
        ],
      },
    },
    {
      id: 'cs-assimilation',
      title: 'Layer 5 · Assimilation',
      titleHu: '5. réteg · Hasonulás',
      summaryHu: '„Good girl" → „goog girl", „did you" → „didja": a hangok egymáshoz igazodnak.',
      theory: [
        {
          headingHu: 'A hang a következőhöz igazodik',
          bodyHu:
            'Gyors beszédben az ajkunk és nyelvünk már a következő hang helyére áll, mielőtt az előzővel végeznénk. Így az előző hang hasonlít a következőre. A /n/ az ajakhangok (/p/, /b/, /m/) előtt /m/ lesz, a /d/ a /g/ és /k/ előtt /g/ lesz, a /t/ az ajakhangok előtt /p/.',
          examples: [
            { text: 'I can buy it', soundsLike: 'I cam buy it' },
            { text: 'ten pounds', soundsLike: 'tem pounds' },
            { text: 'good girl', soundsLike: 'goog girl' },
            { text: 'right back', soundsLike: 'ripe back' },
          ],
        },
        {
          headingHu: 'Összeolvadás: két hang egy harmadikká',
          bodyHu:
            'Ha a szó végén /d/ vagy /t/ áll, és a következő szó /j/-vel („you") kezdődik, a kettő egy új hanggá olvad. A /d/ és a /j/ /dʒ/ („dzs") lesz, a /t/ és a /j/ /tʃ/ („cs"). Ez nagyon gyakori.',
          examples: [
            { text: 'did you', soundsLike: 'didja' },
            { text: 'would you', soundsLike: 'wouldja' },
            { text: 'could you', soundsLike: 'couldja' },
            { text: "don't you", soundsLike: 'dontcha' },
            { text: 'nice to meet you', soundsLike: 'nice to meetcha' },
          ],
        },
      ],
      body: {
        kind: 'steps',
        steps: [
          { type: 'listen-choose', audio: 'I can buy it', promptHu: 'Mivé változik a „can buy" „n" hangja gyors beszédben?', options: ['/m/', '/n/ marad', '/ŋ/'], correct: 0, keepOrder: true, explainHu: 'cam buy: a /b/ ajakhang, ezért az /n/ is ajkakkal képzett /m/ lesz.' },
          { type: 'listen-choose', audio: 'ten pounds', promptHu: 'Mivé változik a „ten pounds" „n" hangja?', options: ['/m/', '/n/ marad', '/ŋ/'], correct: 0, keepOrder: true, explainHu: 'tem pounds: a /p/ előtt /m/.' },
          { type: 'listen-choose', audio: 'good girl', promptHu: 'Mivé változik a „good girl" „d" hangja?', options: ['/g/', '/d/ marad', '/b/'], correct: 0, keepOrder: true, explainHu: 'goog girl: a /g/ előtt a /d/ is a nyelv hátsó részével képzett /g/ lesz.' },
          { type: 'listen-choose', audio: 'right back', promptHu: 'Mivé változik a „right back" „t" hangja?', options: ['/p/', '/t/ marad', '/k/'], correct: 0, keepOrder: true, explainHu: 'ripe back: a /b/ előtt a /t/ ajakhanggá, /p/-vé válik.' },
          { type: 'listen-choose', audio: 'Did you find it?', promptHu: 'Hogyan hangzik a „did you" gyors beszédben?', options: ['„didja" (/dʒ/)', '„did-yoo" (/d/ + /j/)', '„dit-choo"'], correct: 0, explainHu: 'A /d/ és a /j/ összeolvad: /dʒ/, mint a „jam" elején.' },
          { type: 'listen-choose', audio: 'Would you like some tea?', promptHu: 'Hogyan hangzik a „would you" gyors beszédben?', options: ['„wouldja" (/dʒ/)', '„would-yoo" (/d/ + /j/)', '„woot-choo"'], correct: 0, explainHu: 'wouldja: /dʒ/.' },
          { type: 'listen-choose', audio: "Don't you know?", promptHu: 'Hogyan hangzik a „don\'t you" gyors beszédben?', options: ['„dontcha" (/tʃ/)', '„dont-yoo" (/t/ + /j/)', '„donja" (/dʒ/)'], correct: 0, explainHu: 'A /t/ és a /j/ összeolvad: /tʃ/, mint a „church" elején.' },
          { type: 'listen-choose', audio: 'Nice to meet you!', promptHu: 'Hogyan hangzik a „meet you" gyors beszédben?', options: ['„meetcha" (/tʃ/)', '„meet-yoo" (/t/ + /j/)', '„meedja" (/dʒ/)'], correct: 0, explainHu: 'meetcha: /tʃ/.' },
          { type: 'dictation', text: 'Could you help me?', keyWords: ['could', 'you', 'help'], labelHu: 'kulcsszó' },
          { type: 'dictation', text: 'Did you find it?', keyWords: ['did', 'you', 'find', 'it'], labelHu: 'kulcsszó' },
        ],
      },
    },
    {
      id: 'cs-mix',
      title: 'Layer 6 · Putting it together',
      titleHu: '6. réteg · Összerakva',
      summaryHu: 'Minden együtt: melyik jelenséget hallod, és tudod-e te is kimondani.',
      theory: [
        {
          headingHu: 'A valódi beszédben egyszerre több is történik',
          bodyHu:
            'Egy mondatban ritmus, gyenge alakok, kötés, kiesés és hasonulás keveredik. Először azt kérdezd: hol vannak a hangsúlyos szavak? A többi szó gyenge. Aztán nézd a szóhatárokat: mi köt, mi esik ki, mi változik.',
          examples: [
            { text: 'Could you give me a cup of tea?', soundsLike: 'couldja GIVE me a CUPpa TEA' },
            { text: 'Did you find it?', soundsLike: 'didja FIND it' },
          ],
        },
      ],
      body: {
        kind: 'steps',
        steps: [
          { type: 'listen-choose', audio: 'go out', promptHu: 'Melyik jelenség a legjellemzőbb a „go out" kifejezésben?', options: ['Kötés', 'Kiesés', 'Hasonulás', 'Gyenge alak'], correct: 0, keepOrder: true, explainHu: 'Két magánhangzó között /w/ csúszóhang: go-wout.' },
          { type: 'listen-choose', audio: 'next week', promptHu: 'Melyik jelenség a legjellemzőbb a „next week" kifejezésben?', options: ['Kötés', 'Kiesés', 'Hasonulás', 'Gyenge alak'], correct: 1, keepOrder: true, explainHu: 'A /t/ kiesik a mássalhangzócsoportból: nex\' week.' },
          { type: 'listen-choose', audio: 'good girl', promptHu: 'Melyik jelenség a legjellemzőbb a „good girl" kifejezésben?', options: ['Kötés', 'Kiesés', 'Hasonulás', 'Gyenge alak'], correct: 2, keepOrder: true, explainHu: 'A /d/ a /g/ hatására /g/ lesz.' },
          { type: 'listen-choose', audio: 'I can swim', promptHu: 'Melyik jelenség a legjellemzőbb az „I can swim" mondatban a „can" szónál?', options: ['Kötés', 'Kiesés', 'Hasonulás', 'Gyenge alak'], correct: 3, keepOrder: true, explainHu: 'A „can" nem hangsúlyos, ezért schwás gyenge alakban hangzik el.' },
          { type: 'listen-choose', audio: 'Did you see him?', promptHu: 'Melyik jelenség a legjellemzőbb a „did you" kifejezésben?', options: ['Kötés', 'Kiesés', 'Hasonulás', 'Gyenge alak'], correct: 2, keepOrder: true, explainHu: 'A /d/ és a /j/ összeolvad /dʒ/-vé (összeolvadó hasonulás).' },
          { type: 'listen-choose', audio: 'an egg', promptHu: 'Melyik jelenség a legjellemzőbb az „an egg" kifejezésben?', options: ['Kötés', 'Kiesés', 'Hasonulás', 'Gyenge alak'], correct: 0, keepOrder: true, explainHu: 'Mássalhangzó + magánhangzó: a-negg.' },
          { type: 'token-select', mode: 'words', audio: 'Wait for the bus and go to the shop.', tokens: ['Wait', 'for', 'the', 'bus', 'and', 'go', 'to', 'the', 'shop'], correct: [1, 2, 4, 6, 7], promptHu: 'Jelöld meg a gyenge alakban kiejtett szavakat.', explainHu: 'for, the, and, to, the gyenge. A Wait, bus, go, shop hordozza a ritmust.' },
          { type: 'dictation', text: 'Could you tell me about it?', keyWords: ['could', 'you', 'tell', 'about', 'it'], labelHu: 'kulcsszó' },
          { type: 'dictation', text: 'I need a cup of tea.', keyWords: ['need', 'cup', 'of', 'tea'], labelHu: 'kulcsszó' },
          { type: 'production', sentence: 'Could you give me a cup of tea?' },
        ],
      },
    },
  ],
}
