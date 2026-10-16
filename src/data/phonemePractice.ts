// Per-sound content for the Sound Bank sheet beyond phonemes.ts: the articulation text in
// English and German (phonemes.ts holds the Hungarian one), a German-speaker note, the IPA sent
// to Azure text-to-speech for the lone-sound clip, and the Pronunciation exercise items
// (anchor word → 3 words → 3 minimal pairs → 1 sentence). Hand-authored, first-pass quality,
// flagged for linguistic review like phonemes.ts and pronunciationCurriculum.ts.
//
// clipIpa uses Azure's en-US IPA phone set (ɹ, ɡ, ɝ, i/u without length marks), not the chart
// labels. minimalPairs list the word with the focus sound first. anchorWord is the short word
// the learner says for the "individual sound" step — Azure can't score a lone sound, so only the
// focus sound inside it is reported.

export interface PhonemePractice {
  clipIpa: string
  descriptionEn: string
  descriptionDe: string
  /** Shown under the symbol when the UI is German — written for German speakers. */
  noteDe: string
  anchorWord: string
  words: [string, string, string]
  minimalPairs: [[string, string], [string, string], [string, string]]
  sentence: string
}

export const phonemePractice: Record<string, PhonemePractice> = {
  'th-voiceless': {
    clipIpa: 'θ',
    descriptionEn:
      'Rest the tip of your tongue lightly between your upper and lower front teeth, so the edges of the teeth just touch it — don\'t bite or press. Blow air through the narrow gap between tongue and teeth: you hear a soft, hissing noise. Your voice is OFF — put a hand on your throat and you should feel no buzzing. Don\'t let the tongue tip jump back behind the teeth, or you will say t or s instead.',
    descriptionDe:
      'Leg die Zungenspitze locker zwischen die oberen und unteren Schneidezähne, sodass die Zahnkanten sie gerade berühren — nicht beißen, nicht pressen. Blas dann Luft durch den schmalen Spalt zwischen Zunge und Zähnen: Es entsteht ein leises, zischendes Reibegeräusch. Die Stimme bleibt AUS — leg die Hand an den Hals, du spürst kein Vibrieren. Zieh die Zungenspitze nicht hinter die Zähne zurück, sonst wird daraus ein s oder t.',
    noteDe: 'Im Deutschen gibt es diesen Laut nicht — er wird oft durch s oder f ersetzt („sink“ statt „think“).',
    anchorWord: 'thin',
    words: ['think', 'bath', 'three'],
    minimalPairs: [['thin', 'tin'], ['think', 'sink'], ['bath', 'bat']],
    sentence: 'I think the three thin threads are worth it.',
  },
  'th-voiced': {
    clipIpa: 'ð',
    descriptionEn:
      'Same tongue position as θ: the tongue tip rests lightly between the front teeth and air flows through the gap. The difference is that your voice is ON — with a hand on your throat you feel a buzz. Don\'t say d or z instead: the tongue tip must not touch the ridge behind the teeth. It appears in very common words (the, this, that), so it is worth making automatic.',
    descriptionDe:
      'Gleiche Zungenstellung wie bei θ: Die Zungenspitze liegt locker zwischen den Schneidezähnen, die Luft strömt durch den Spalt. Der Unterschied: Die Stimme ist AN — mit der Hand am Hals spürst du ein Summen. Sag kein d oder stimmhaftes s: Die Zungenspitze darf den Zahndamm hinter den Zähnen nicht berühren. Der Laut steckt in sehr häufigen Wörtern (the, this, that), deshalb lohnt es sich, ihn zu automatisieren.',
    noteDe: 'Im Deutschen gibt es diesen Laut nicht — er wird oft durch d oder ein stimmhaftes s ersetzt („dis“ statt „this“).',
    anchorWord: 'this',
    words: ['the', 'mother', 'breathe'],
    minimalPairs: [['then', 'den'], ['they', 'day'], ['breathe', 'breeze']],
    sentence: 'They brought their mother with them.',
  },
  ae: {
    clipIpa: 'æ',
    descriptionEn:
      'Drop your jaw much further than for e, and spread your lips slightly as if smiling. The tongue tip rests behind the lower teeth and the front of the tongue is low. The sound lies between e and a, nearer to e. If "had" sounds the same as "head", you haven\'t opened your mouth far enough.',
    descriptionDe:
      'Öffne den Kiefer deutlich weiter als beim deutschen ä/e und zieh die Lippen leicht breit, wie zu einem Lächeln. Die Zungenspitze liegt hinter den unteren Zähnen, der vordere Zungenrücken liegt tief. Der Laut liegt zwischen ä und a, näher am ä, aber offener. Klingt „had“ wie „head“, hast du den Mund noch nicht weit genug geöffnet.',
    noteDe: 'Das Deutsche hat kein eigenes æ — es wird leicht mit dem e/ä verwechselt (head/had, bed/bad).',
    anchorWord: 'cat',
    words: ['bad', 'man', 'happy'],
    minimalPairs: [['had', 'head'], ['bad', 'bed'], ['man', 'men']],
    sentence: 'The black cat sat on Sam\'s hat.',
  },
  schwa: {
    clipIpa: 'ə',
    descriptionEn:
      'Relax your tongue, lips and jaw completely — the mouth is half open and the tongue rests in the middle, in its neutral position. No tension, no rounding. The sound is short and quiet, a neutral vowel. It only occurs in unstressed syllables (a-bout, ba-na-na). Don\'t pronounce the written vowel clearly: in English, unstressed syllables are reduced.',
    descriptionDe:
      'Entspann Zunge, Lippen und Kiefer vollständig — der Mund ist halb offen, die Zunge liegt in der Mitte in Ruhestellung. Keine Spannung, keine Lippenrundung. Der Laut ist kurz und leise, ein neutraler Vokal wie das e in „bitte“. Er kommt nur in unbetonten Silben vor (a-bout, ba-na-na). Sprich den geschriebenen Vokal nicht deutlich aus: Im Englischen werden unbetonte Silben abgeschwächt.',
    noteDe: 'Das Deutsche kennt den Laut (wie in „bitte“), aber Lernende sprechen englische unbetonte Silben oft zu deutlich aus.',
    anchorWord: 'about',
    words: ['sofa', 'banana', 'today'],
    minimalPairs: [['affect', 'effect'], ['accept', 'except'], ['allusion', 'illusion']],
    sentence: 'A banana and a lemon are on the sofa.',
  },
  w: {
    clipIpa: 'w',
    descriptionEn:
      'Round your lips into a small, tight circle, as if about to say "oo", then open them quickly into the next vowel. Your teeth do NOT touch your lower lip — that is the key difference from v. If your teeth touch your lip, you said v. Practise "wine" and "vine" in front of a mirror: for w the lips push forward and round, for v the upper teeth touch the lower lip.',
    descriptionDe:
      'Runde die Lippen zu einem kleinen, engen Kreis, als wolltest du „u“ sagen, und öffne sie dann schnell zum nächsten Vokal. Die Zähne berühren die Unterlippe NICHT — das ist der wichtigste Unterschied zum deutschen w (= v). Berühren die Zähne die Lippe, hast du v gesagt. Übe „wine“ und „vine“ vor dem Spiegel: Beim w schieben sich die Lippen rund nach vorn, beim v berühren die oberen Zähne die Unterlippe.',
    noteDe: 'Das deutsche „w“ ist ein v-Laut — deshalb klingen „wine“ und „vine“ bei deutschen Sprechern oft gleich.',
    anchorWord: 'we',
    words: ['west', 'window', 'quick'],
    minimalPairs: [['wine', 'vine'], ['west', 'vest'], ['wet', 'vet']],
    sentence: 'We went west in the wet winter weather.',
  },
  r: {
    clipIpa: 'ɹ',
    descriptionEn:
      'Pull your tongue back and raise its middle, or curl the tip up slightly — but the tongue must NOT touch the roof of the mouth or the ridge behind the teeth anywhere. The lips round a little. There is no tap or trill: it is one smooth, continuous sound. Start from a neutral "uh" and slowly curl the tongue back until the tip floats freely.',
    descriptionDe:
      'Zieh die Zunge zurück und wölbe ihre Mitte nach oben, oder biege die Spitze leicht nach oben — aber die Zunge darf NIRGENDS den Gaumen oder den Zahndamm berühren. Die Lippen runden sich leicht. Kein Rollen und kein Reiben im Rachen wie beim deutschen r: Es ist ein einziger, weicher, durchgehender Laut. Beginne mit einem neutralen „ö“ und biege die Zunge langsam zurück, bis die Spitze frei schwebt.',
    noteDe: 'Das deutsche r wird hinten im Rachen gebildet (Zäpfchen-r) oder am Wortende zu einem a-Laut — das englische r ist vorn und ohne Berührung.',
    anchorWord: 'red',
    words: ['right', 'road', 'sorry'],
    minimalPairs: [['red', 'led'], ['right', 'light'], ['rock', 'lock']],
    sentence: 'Rose ran right around the red rock.',
  },
  'dark-l': {
    clipIpa: 'ʊl',
    descriptionEn:
      'Put the tip of your tongue on the ridge behind the upper teeth as for a normal l, but AT THE SAME TIME raise the back of the tongue towards the soft palate, as if also saying "oo". The result is a hollower, darker sound. It is used at the end of a syllable (ball, milk, feel), where a bright, clear l sounds foreign. The tongue tip only touches lightly — what matters is lifting the back of the tongue. (The audio clip has a short "oo" before the l, because a dark l is hard to say completely on its own.)',
    descriptionDe:
      'Leg die Zungenspitze wie bei einem normalen l an den Zahndamm, aber heb GLEICHZEITIG den hinteren Zungenrücken zum weichen Gaumen, als würdest du dabei „u“ sagen. Das Ergebnis klingt hohler und dunkler. Dieses l steht am Silbenende (ball, milk, feel), wo das helle deutsche l fremd klingt. Die Zungenspitze berührt nur leicht — entscheidend ist das Anheben des hinteren Zungenrückens. (Im Hörbeispiel steht ein kurzes „u“ vor dem l, weil sich ein dunkles l allein kaum sprechen lässt.)',
    noteDe: 'Das deutsche l ist immer hell; das englische l am Silbenende ist „dunkel“ — der hintere Zungenrücken hebt sich.',
    anchorWord: 'ball',
    words: ['milk', 'feel', 'full'],
    minimalPairs: [['feel', 'fear'], ['ball', 'bar'], ['wall', 'war']],
    sentence: 'Bill will fill the tall bottle with milk.',
  },
  nurse: {
    clipIpa: 'ɝ',
    descriptionEn:
      'The tongue sits in the middle of the mouth, pulled back slightly, with the lips relaxed and unrounded. Make the r-colouring and the vowel at the same time: one continuous, r-coloured sound, not "e" followed by a separate r. Don\'t roll the r.',
    descriptionDe:
      'Die Zunge liegt in der Mundmitte, leicht zurückgezogen, die Lippen sind entspannt und nicht gerundet. Bilde die r-Färbung und den Vokal gleichzeitig: ein einziger, durchgehender, r-gefärbter Laut, nicht „ö“ plus ein eigenes r. Das r nicht rollen und nicht im Rachen reiben.',
    noteDe: 'Klingt ähnlich wie das deutsche „ö“, aber mit englischer r-Färbung — oft wird daraus „ö“ ohne r oder „ör“ mit Rachen-r.',
    anchorWord: 'bird',
    words: ['nurse', 'work', 'early'],
    minimalPairs: [['bird', 'bud'], ['hurt', 'heart'], ['word', 'ward']],
    sentence: 'The nurse heard the first bird early on Thursday.',
  },
  ng: {
    clipIpa: 'ŋ',
    descriptionEn:
      'Press the back of your tongue against the soft palate (the soft back part of the roof of the mouth) to close the mouth. Air and voice leave through the nose. IMPORTANT: don\'t add a g at the end! "Sing" is not "sing-g": release the tongue gently without a separate g. If the tongue tip touches the ridge behind the teeth, that is n — keep the tip down and raise only the back.',
    descriptionDe:
      'Drück den hinteren Zungenrücken gegen den weichen Gaumen, sodass der Mund verschlossen ist. Luft und Stimme gehen durch die Nase — wie das ng in „singen“. WICHTIG: Am Ende kein g anhängen! „Sing“ ist nicht „sing-g“: Lös die Zunge sanft, ohne ein eigenes g zu sprechen. Berührt die Zungenspitze den Zahndamm, ist es ein n — die Spitze bleibt unten, nur der hintere Teil hebt sich.',
    noteDe: 'Das Deutsche hat diesen Laut („singen“), aber am Wortende hängen Lernende oft ein k oder g an („sink“ statt „sing“).',
    anchorWord: 'sing',
    words: ['morning', 'long', 'singer'],
    minimalPairs: [['sing', 'sin'], ['thing', 'thin'], ['wing', 'win']],
    sentence: 'The king was singing a long song this morning.',
  },
  strut: {
    clipIpa: 'ʌ',
    descriptionEn:
      'The mouth is half open, the tongue rests in the middle and slightly back, and the lips are relaxed and unrounded. It is a short sound, close to a short "a" but less open and further back.',
    descriptionDe:
      'Der Mund ist halb offen, die Zunge liegt in der Mitte und etwas hinten, die Lippen sind entspannt und nicht gerundet. Ein kurzer Laut, nah am kurzen deutschen a in „Mann“, aber etwas weniger offen.',
    noteDe: 'Ähnelt dem kurzen deutschen a — wird aber oft zu „o“, weil man sich an der Schreibung (love, son) orientiert.',
    anchorWord: 'cup',
    words: ['love', 'sun', 'money'],
    minimalPairs: [['cup', 'cap'], ['luck', 'lock'], ['hut', 'hot']],
    sentence: 'My brother wants another cup of hot honey.',
  },
  kit: {
    clipIpa: 'ɪ',
    descriptionEn:
      'The tongue is high and at the front but relaxed, not tense — a little lower than for the long iː. The lips are relaxed, not spread. A short, lax sound.',
    descriptionDe:
      'Die Zunge ist hoch und vorn, aber locker, nicht gespannt — etwas tiefer als beim langen iː. Die Lippen sind entspannt, nicht breit gezogen. Ein kurzer, lockerer Laut wie das i in „bitte“.',
    noteDe: 'Entspricht dem kurzen deutschen i („bitte“) — wichtig ist der Unterschied zum langen iː (ship/sheep).',
    anchorWord: 'sit',
    words: ['fish', 'big', 'listen'],
    minimalPairs: [['ship', 'sheep'], ['live', 'leave'], ['bit', 'beat']],
    sentence: 'Jim will sit with his sister in the little kitchen.',
  },
  fleece: {
    clipIpa: 'i',
    descriptionEn:
      'The tongue is high and at the front, held tense, and the lips are spread as in a smile. It is longer than the short ɪ.',
    descriptionDe:
      'Die Zunge ist hoch und vorn und gespannt, die Lippen sind breit gezogen wie beim Lächeln. Länger als das kurze ɪ — wie das deutsche i in „Biene“.',
    noteDe: 'Entspricht dem langen deutschen i („Biene“) — gut halten, damit es sich vom kurzen ɪ unterscheidet.',
    anchorWord: 'see',
    words: ['sheep', 'tea', 'people'],
    minimalPairs: [['sheep', 'ship'], ['leave', 'live'], ['beat', 'bit']],
    sentence: 'We need to keep the green tea for these people.',
  },
  foot: {
    clipIpa: 'ʊ',
    descriptionEn:
      'The tongue is high and at the back but relaxed; the lips are only loosely rounded. A short sound, less tense than the long uː.',
    descriptionDe:
      'Die Zunge ist hinten und hoch, aber locker; die Lippen sind nur leicht gerundet. Ein kurzer Laut wie das u in „Mutter“, weniger gespannt als das lange uː.',
    noteDe: 'Entspricht dem kurzen deutschen u („Mutter“) — nicht mit dem langen uː (pool) verwechseln.',
    anchorWord: 'book',
    words: ['put', 'good', 'could'],
    minimalPairs: [['pull', 'pool'], ['full', 'fool'], ['look', 'Luke']],
    sentence: 'He took a good look at the cook book.',
  },
  goose: {
    clipIpa: 'u',
    descriptionEn:
      'The tongue is high and at the back, tense; the lips are tightly rounded and pushed forward. It is longer than the vowel in "foot".',
    descriptionDe:
      'Die Zunge ist hinten und hoch und gespannt; die Lippen sind eng gerundet und nach vorn geschoben. Länger als der Vokal in „foot“ — wie das u in „gut“.',
    noteDe: 'Entspricht dem langen deutschen u („gut“), braucht aber eine kräftige Lippenrundung.',
    anchorWord: 'food',
    words: ['blue', 'moon', 'school'],
    minimalPairs: [['pool', 'pull'], ['fool', 'full'], ['Luke', 'look']],
    sentence: 'The blue moon rose too soon over the school.',
  },
  thought: {
    clipIpa: 'ɔ',
    descriptionEn:
      'Open the jaw; the back of the tongue is low and the lips are rounded. A deep, round sound between "o" and "ah", usually long.',
    descriptionDe:
      'Öffne den Kiefer, der hintere Zungenrücken liegt tief, die Lippen sind gerundet. Ein tiefer, runder Laut zwischen o und a — offener als das deutsche o in „Sohn“ und meist lang.',
    noteDe: 'Liegt zwischen deutschem o und a — im amerikanischen Englisch fällt er oft mit dem ɑ in „hot“ zusammen.',
    anchorWord: 'saw',
    words: ['talk', 'law', 'water'],
    minimalPairs: [['caught', 'cut'], ['bought', 'boat'], ['law', 'low']],
    sentence: 'Paul saw a small dog walk across the hall.',
  },
  palm: {
    clipIpa: 'ɑ',
    descriptionEn:
      'Open your mouth wide, with the tongue low and at the back and the lips relaxed and unrounded. A long, open "ah" sound, like opening your mouth at the doctor\'s.',
    descriptionDe:
      'Öffne den Mund weit, die Zunge liegt tief und hinten, die Lippen sind entspannt und nicht gerundet. Ein langes, offenes a wie in „Vater“ — wie beim Mundöffnen beim Arzt.',
    noteDe: 'Ähnlich dem langen deutschen a („Vater“) — im amerikanischen Englisch steht er auch in vielen o-Wörtern (hot, stop).',
    anchorWord: 'spa',
    words: ['father', 'hot', 'calm'],
    minimalPairs: [['hot', 'hat'], ['cop', 'cap'], ['lock', 'lack']],
    sentence: 'My father got a lot of hot coffee.',
  },
  goat: {
    clipIpa: 'oʊ',
    descriptionEn:
      'Start with a round, half-open "o", then glide towards "oo" while rounding the lips more and raising the tongue. The sound has two parts: o → u. Learners often say a pure, unchanging "o". Watch in a mirror: by the end of the sound your lips should be more tightly rounded.',
    descriptionDe:
      'Beginne mit einem runden, halboffenen o und gleite dann Richtung u, während sich die Lippen stärker runden und die Zunge sich hebt. Der Laut hat zwei Teile: o → u. Das deutsche o in „so“ bleibt gleich — deshalb sagen Lernende oft nur ein reines o. Beobachte im Spiegel: Am Ende sollen die Lippen enger gerundet sein.',
    noteDe: 'Das deutsche o ist ein reiner, gleichbleibender Vokal — das englische gleitet von o zu u.',
    anchorWord: 'go',
    words: ['boat', 'home', 'phone'],
    minimalPairs: [['coat', 'cot'], ['note', 'not'], ['hope', 'hop']],
    sentence: 'Joe drove home alone on the old road.',
  },
  face: {
    clipIpa: 'eɪ',
    descriptionEn:
      'The tongue starts half-high at the front, as for "e", then glides upward towards "i". Two parts: e → i, with the jaw closing slightly at the end.',
    descriptionDe:
      'Die Zunge beginnt halbhoch und vorn wie beim e und gleitet dann nach oben Richtung i. Zwei Teile: e → i, am Ende schließt sich der Kiefer leicht.',
    noteDe: 'Das deutsche e in „Weg“ bleibt gleich — das englische gleitet zum i; sonst klingt „late“ wie „let“.',
    anchorWord: 'day',
    words: ['rain', 'cake', 'great'],
    minimalPairs: [['late', 'let'], ['pain', 'pen'], ['sale', 'sell']],
    sentence: 'They waited for the train in the rain all day.',
  },
  price: {
    clipIpa: 'aɪ',
    descriptionEn:
      'Start from an open, front-central "a" and glide upward towards "i". Make the beginning longer and the end quick and light.',
    descriptionDe:
      'Beginne mit einem offenen a und gleite nach oben Richtung i — wie das deutsche „ei“ in „mein“. Den Anfang länger, das Ende kurz und leicht.',
    noteDe: 'Entspricht weitgehend dem deutschen „ei/ai“ („mein“) — einer der leichtesten Doppellaute.',
    anchorWord: 'my',
    words: ['time', 'five', 'nice'],
    minimalPairs: [['buy', 'boy'], ['light', 'late'], ['tie', 'toy']],
    sentence: 'I like to ride my white bike at night.',
  },
  mouth: {
    clipIpa: 'aʊ',
    descriptionEn:
      'Start from an open, central "a", then round the lips more and more while the tongue rises towards "oo". The first part is longer and stronger; the second fades quickly.',
    descriptionDe:
      'Beginne mit einem offenen a, dann runden sich die Lippen immer mehr, und die Zunge hebt sich Richtung u — wie das deutsche „au“ in „Haus“. Der erste Teil ist länger und kräftiger, der zweite klingt schnell aus.',
    noteDe: 'Entspricht weitgehend dem deutschen „au“ („Haus“).',
    anchorWord: 'now',
    words: ['house', 'cloud', 'mountain'],
    minimalPairs: [['now', 'no'], ['town', 'tone'], ['loud', 'load']],
    sentence: 'How about a brown house down in the town?',
  },
  choice: {
    clipIpa: 'ɔɪ',
    descriptionEn:
      'Start from an open, back, rounded "o", then the tongue glides up towards "i" and the lips open out. The first vowel is more open than a pure "o".',
    descriptionDe:
      'Beginne mit einem offenen, hinteren, gerundeten o, dann gleitet die Zunge nach oben Richtung i, und die Lippen öffnen sich — wie das deutsche „eu“ in „heute“.',
    noteDe: 'Entspricht weitgehend dem deutschen „eu/äu“ („heute“).',
    anchorWord: 'boy',
    words: ['voice', 'coin', 'enjoy'],
    minimalPairs: [['boy', 'buy'], ['toy', 'tie'], ['oil', 'all']],
    sentence: 'The boy enjoyed the noise of the toy.',
  },
  p: {
    clipIpa: 'p',
    descriptionEn:
      'Close your lips, then open them quickly so a small puff of air (aspiration) escapes. Your voice is off. At the start of a word the puff is strong — hold a sheet of paper in front of your mouth and it should move.',
    descriptionDe:
      'Schließ die Lippen und öffne sie schnell, sodass ein kleiner Luftstoß (Behauchung) entweicht. Stimmlos. Am Wortanfang ist der Luftstoß kräftig — halte ein Blatt Papier vor den Mund, es sollte sich bewegen.',
    noteDe: 'Wie das deutsche p — auch behaucht. Am Wortende nicht mit b verwechseln (cap/cab).',
    anchorWord: 'pen',
    words: ['stop', 'paper', 'happy'],
    minimalPairs: [['pen', 'ben'], ['pear', 'bear'], ['cap', 'cab']],
    sentence: 'Pat put the purple paper in the pocket.',
  },
  b: {
    clipIpa: 'b',
    descriptionEn: 'Close your lips, then open them with your voice on and no puff of air. Same lip position as p, but voiced.',
    descriptionDe: 'Schließ die Lippen und öffne sie mit Stimme, ohne Luftstoß. Gleiche Lippenstellung wie beim p, aber stimmhaft.',
    noteDe: 'Wie das deutsche b — aber am Wortende stimmhaft lassen (cab), nicht zu p verhärten.',
    anchorWord: 'bag',
    words: ['big', 'cab', 'rubber'],
    minimalPairs: [['cab', 'cap'], ['bear', 'pear'], ['rib', 'rip']],
    sentence: 'Bob bought a big blue bag.',
  },
  t: {
    clipIpa: 't',
    descriptionEn:
      'Press the tip of your tongue against the ridge behind the upper teeth, then release it quickly with a small puff of air. Your voice is off. At the start of a word an English t "pops" strongly.',
    descriptionDe:
      'Drück die Zungenspitze an den Zahndamm hinter den oberen Zähnen und lös sie schnell mit einem kleinen Luftstoß. Stimmlos. Am Wortanfang ist das englische t kräftig behaucht.',
    noteDe: 'Wie das deutsche t. Am Wortende nicht mit d verwechseln (bet/bed).',
    anchorWord: 'top',
    words: ['tea', 'cat', 'water'],
    minimalPairs: [['tin', 'thin'], ['bat', 'bath'], ['bet', 'bed']],
    sentence: 'Tom took two tickets to the city.',
  },
  d: {
    clipIpa: 'd',
    descriptionEn: 'Same tongue position as t: the tongue tip touches the ridge behind the teeth, but your voice is on and there is no puff of air.',
    descriptionDe: 'Gleiche Zungenstellung wie beim t: Die Zungenspitze berührt den Zahndamm, aber mit Stimme und ohne Luftstoß.',
    noteDe: 'Wie das deutsche d — aber am Wortende stimmhaft lassen (bed), nicht zu t verhärten.',
    anchorWord: 'day',
    words: ['dog', 'bed', 'ready'],
    minimalPairs: [['bed', 'bet'], ['den', 'then'], ['dough', 'though']],
    sentence: 'David did a good deed today.',
  },
  k: {
    clipIpa: 'k',
    descriptionEn:
      'Press the back of your tongue against the soft palate, then release it quickly with a small puff of air. Voiceless, and strongly aspirated at the start of a word.',
    descriptionDe:
      'Drück den hinteren Zungenrücken an den weichen Gaumen und lös ihn schnell mit einem kleinen Luftstoß. Stimmlos und am Wortanfang kräftig behaucht.',
    noteDe: 'Wie das deutsche k. Am Wortende nicht mit g verwechseln (back/bag).',
    anchorWord: 'key',
    words: ['cat', 'back', 'kitchen'],
    minimalPairs: [['back', 'bag'], ['coat', 'goat'], ['cold', 'gold']],
    sentence: 'Kate keeps the cake in the kitchen.',
  },
  g: {
    clipIpa: 'ɡ',
    descriptionEn: 'Same tongue position as k, but your voice is on and there is no puff of air. A hard g.',
    descriptionDe: 'Gleiche Zungenstellung wie beim k, aber mit Stimme und ohne Luftstoß. Ein hartes g wie in „gut“.',
    noteDe: 'Wie das deutsche g — am Wortende stimmhaft lassen (bag), nicht zu k verhärten.',
    anchorWord: 'go',
    words: ['big', 'garden', 'again'],
    minimalPairs: [['bag', 'back'], ['goat', 'coat'], ['gold', 'cold']],
    sentence: 'Greg got a green bag from the garden.',
  },
  f: {
    clipIpa: 'f',
    descriptionEn: 'Your upper teeth lightly touch your lower lip and air flows through the gap. Voiceless.',
    descriptionDe: 'Die oberen Zähne berühren leicht die Unterlippe, die Luft strömt durch den Spalt. Stimmlos, wie das deutsche f.',
    noteDe: 'Wie das deutsche f.',
    anchorWord: 'fun',
    words: ['fish', 'coffee', 'laugh'],
    minimalPairs: [['fan', 'van'], ['fine', 'vine'], ['few', 'view']],
    sentence: 'Five friends found fresh fish for free.',
  },
  v: {
    clipIpa: 'v',
    descriptionEn:
      'Your upper teeth touch your lower lip and air flows through the gap with your voice on. Note that for an English w the teeth do NOT touch the lip.',
    descriptionDe:
      'Die oberen Zähne berühren die Unterlippe, die Luft strömt mit Stimme durch den Spalt — das ist das deutsche w. Beachte: Beim englischen w berühren die Zähne die Lippe NICHT.',
    noteDe: 'Entspricht dem deutschen w („Wasser“). Schwierig ist nur die Abgrenzung zum englischen w.',
    anchorWord: 'van',
    words: ['very', 'love', 'river'],
    minimalPairs: [['vine', 'wine'], ['vest', 'west'], ['van', 'fan']],
    sentence: 'Vicky drove the van over the river.',
  },
  s: {
    clipIpa: 's',
    descriptionEn: 'The tip of the tongue is close to the ridge behind the teeth, and air flows through a narrow channel. Voiceless.',
    descriptionDe: 'Die Zungenspitze ist nah am Zahndamm, die Luft strömt durch eine schmale Rinne. Stimmlos, wie das ß in „Straße“.',
    noteDe: 'Wie das deutsche stimmlose s („Straße“) — am Wortanfang nicht stimmhaft machen (sue/zoo).',
    anchorWord: 'sun',
    words: ['bus', 'sister', 'class'],
    minimalPairs: [['sink', 'think'], ['sue', 'zoo'], ['bus', 'buzz']],
    sentence: 'Sam sees seven small ships at sea.',
  },
  z: {
    clipIpa: 'z',
    descriptionEn: 'Same tongue position as s, but your voice is on.',
    descriptionDe: 'Gleiche Zungenstellung wie beim s, aber mit Stimme — wie das s in „Sonne“.',
    noteDe: 'Wie das stimmhafte deutsche s („Sonne“) — am Wortende nicht stimmlos werden lassen (buzz, eyes).',
    anchorWord: 'zoo',
    words: ['buzz', 'easy', 'music'],
    minimalPairs: [['zoo', 'sue'], ['buzz', 'bus'], ['prize', 'price']],
    sentence: 'The busy bees buzz at the zoo.',
  },
  sh: {
    clipIpa: 'ʃ',
    descriptionEn: 'The tongue is slightly further back than for s, and the lips round a little and push forward. Voiceless.',
    descriptionDe: 'Die Zunge liegt etwas weiter hinten als beim s, die Lippen runden sich leicht nach vorn. Stimmlos, wie das deutsche „sch“.',
    noteDe: 'Wie das deutsche „sch“.',
    anchorWord: 'she',
    words: ['shoe', 'wash', 'station'],
    minimalPairs: [['ship', 'sip'], ['shoe', 'sue'], ['sheep', 'cheap']],
    sentence: 'She should wash her shoes in the shower.',
  },
  zh: {
    clipIpa: 'ʒ',
    descriptionEn: 'Same tongue position as ʃ, but your voice is on.',
    descriptionDe: 'Gleiche Zungenstellung wie beim ʃ, aber mit Stimme — wie das g in „Garage“.',
    noteDe: 'Klingt wie das g in „Garage“ oder „Genie“ — im Deutschen selten, wird oft zu „sch“.',
    anchorWord: 'vision',
    words: ['measure', 'usual', 'television'],
    minimalPairs: [['vision', 'fission'], ['beige', 'bays'], ['pleasure', 'pressure']],
    sentence: 'It\'s usually a pleasure to watch television.',
  },
  h: {
    clipIpa: 'h',
    descriptionEn: 'With your mouth open, breathe out a little air from the throat without any obstruction. The tongue doesn\'t press anywhere.',
    descriptionDe: 'Bei offenem Mund ein wenig Luft aus dem Hals hauchen, ohne Hindernis. Die Zunge drückt nirgendwohin.',
    noteDe: 'Wie das deutsche h — am Wortanfang nicht weglassen (hat/at).',
    anchorWord: 'hat',
    words: ['house', 'behind', 'happy'],
    minimalPairs: [['hat', 'at'], ['heat', 'eat'], ['hold', 'old']],
    sentence: 'Harry has a huge house on the hill.',
  },
  ch: {
    clipIpa: 'tʃ',
    descriptionEn: 'Start like t (tongue on the ridge behind the teeth), but instead of a clean burst, release the air in the ʃ position.',
    descriptionDe: 'Beginne wie beim t (Zunge am Zahndamm), lös die Luft aber statt mit einem klaren Knall in der ʃ-Stellung — wie das deutsche „tsch“.',
    noteDe: 'Wie das deutsche „tsch“ („Deutsch“).',
    anchorWord: 'chair',
    words: ['watch', 'cheese', 'kitchen'],
    minimalPairs: [['chip', 'ship'], ['cheap', 'sheep'], ['watch', 'wash']],
    sentence: 'Charlie chose cheap cheese for lunch.',
  },
  dzh: {
    clipIpa: 'dʒ',
    descriptionEn: 'Start like d, then release the air in the ʒ position, with your voice on.',
    descriptionDe: 'Beginne wie beim d und lös die Luft dann stimmhaft in der ʒ-Stellung — wie das „dsch“ in „Dschungel“.',
    noteDe: 'Wie das „dsch“ in „Dschungel“ — am Wortende stimmhaft lassen (bridge), nicht zu „tsch“ verhärten.',
    anchorWord: 'joy',
    words: ['jump', 'bridge', 'orange'],
    minimalPairs: [['jeep', 'cheap'], ['ridge', 'rich'], ['joke', 'yolk']],
    sentence: 'Jane and George enjoy orange juice.',
  },
  m: {
    clipIpa: 'm',
    descriptionEn: 'Close your lips; air and voice leave through the nose.',
    descriptionDe: 'Schließ die Lippen; Luft und Stimme gehen durch die Nase. Wie das deutsche m.',
    noteDe: 'Wie das deutsche m.',
    anchorWord: 'man',
    words: ['moon', 'swim', 'summer'],
    minimalPairs: [['map', 'nap'], ['some', 'sun'], ['mice', 'nice']],
    sentence: 'My mum makes many lemon muffins.',
  },
  n: {
    clipIpa: 'n',
    descriptionEn: 'Press the tip of your tongue against the ridge behind the teeth; air and voice leave through the nose.',
    descriptionDe: 'Drück die Zungenspitze an den Zahndamm; Luft und Stimme gehen durch die Nase. Wie das deutsche n.',
    noteDe: 'Wie das deutsche n — nicht mit ŋ verwechseln (sin/sing).',
    anchorWord: 'no',
    words: ['name', 'sun', 'dinner'],
    minimalPairs: [['sin', 'sing'], ['win', 'wing'], ['thin', 'thing']],
    sentence: 'Nine new neighbours came for dinner.',
  },
  l: {
    clipIpa: 'l',
    descriptionEn:
      'The tip of the tongue touches the ridge behind the teeth and air flows along both sides of the tongue. Voiced. At the start of a word or syllable it is a bright, clear l.',
    descriptionDe:
      'Die Zungenspitze berührt den Zahndamm, die Luft strömt an beiden Seiten der Zunge vorbei. Stimmhaft. Am Wort- oder Silbenanfang ist es ein helles l wie im Deutschen.',
    noteDe: 'Am Wort- oder Silbenanfang wie das deutsche l — das dunkle l am Silbenende hat eine eigene Karte.',
    anchorWord: 'light',
    words: ['lamp', 'blue', 'yellow'],
    minimalPairs: [['light', 'right'], ['lock', 'rock'], ['long', 'wrong']],
    sentence: 'Lucy left the yellow lamp on the left.',
  },
  y: {
    clipIpa: 'j',
    descriptionEn: 'The tongue is high and at the front, as for "i", then glides quickly into the next vowel.',
    descriptionDe: 'Die Zunge ist hoch und vorn wie beim i und gleitet dann schnell zum nächsten Vokal. Wie das deutsche j in „ja“.',
    noteDe: 'Wie das deutsche j („ja“) — Achtung: der englische Buchstabe j ist ein anderer Laut (dʒ).',
    anchorWord: 'yes',
    words: ['yellow', 'use', 'young'],
    minimalPairs: [['yes', 'less'], ['yet', 'jet'], ['year', 'ear']],
    sentence: 'Yes, your young friend used the yellow yacht.',
  },
  dress: {
    clipIpa: 'ɛ',
    descriptionEn: 'The jaw is half open and the tongue is half-high at the front — higher and less spread than for æ.',
    descriptionDe: 'Der Kiefer ist halb offen, die Zunge halbhoch und vorn — höher und weniger breit als beim æ. Wie das kurze e in „Bett“.',
    noteDe: 'Wie das kurze deutsche e („Bett“) — der Gegenpol zum offeneren æ.',
    anchorWord: 'bed',
    words: ['ten', 'friend', 'many'],
    minimalPairs: [['head', 'had'], ['bed', 'bad'], ['men', 'man']],
    sentence: 'Ten men said the red pen was best.',
  },
}

export function getPhonemePractice(id: string): PhonemePractice | undefined {
  return phonemePractice[id]
}
