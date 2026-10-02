// Német nyelv, középszintű írásbeli érettségi, 2024. október 21. (K2419), Oktatási Hivatal.
// Transcribed verbatim from the feladatlap and its javítási-értékelési útmutató (answer key,
// conversion tables, listening transcripts). Decorative photos are left out.
import type { ExamPaper } from '../types'
import { choices, DE_CRITERIA_1, DE_CRITERIA_2, DE_LISTENING_INTRO, DE_NOTICES_HU, DE_WRITING_INTRO, gapMcqs, rf } from './deKozep.ts'

const camps = [
  { key: '1', text: 'Brandenburg' },
  { key: '2', text: 'Thüringen' },
  { key: '3', text: 'Hessen' },
  { key: '4', text: 'Baden-Württemberg' },
]

const people = [
  { key: 'u', text: 'Ulrich' },
  { key: 'd', text: 'Daniela' },
]

const paper: ExamPaper = {
  id: 'erettsegi-de-kozep-2024-oktober',
  type: 'erettsegi',
  language: 'de',
  level: 'kozep',
  sittingLabelHu: '2024. október',
  source: 'Oktatási Hivatal: Német nyelv, középszintű írásbeli vizsga, 2024. október 21. (K2419) — feladatlap és javítási-értékelési útmutató.',
  noticesHu: DE_NOTICES_HU,
  sections: [
    {
      id: 'I',
      kind: 'reading',
      titleHu: 'I. Olvasott szöveg értése',
      timeLimitMin: 60,
      // útmutató: feladatpont 0–26 → vizsgapont
      conversion: [0, 1, 3, 4, 5, 6, 8, 9, 10, 11, 13, 14, 15, 17, 18, 19, 20, 22, 23, 24, 25, 27, 28, 29, 30, 32, 33],
      tasks: [
        {
          id: 'I-1',
          label: '1.',
          instructions:
            'Sie lesen jetzt ein Interview mit dem talentierten Autor Paul Maar. Lesen Sie zuerst die Antworten des Interviews und suchen Sie dann die passende Frage. Achtung! Es gibt eine Frage zu viel. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: '„Als Kind durfte ich nicht lesen“' },
            { text: 'Paul Maar hat mehr als 60 fantasievolle Kinderbücher geschrieben und auch viele erfolgreiche Theaterstücke.' },
            {
              text: '{{0}} Nein. Eigentlich wollte ich Maler werden. Daher habe ich auch an der Kunstakademie in Stuttgart studiert. Zu dieser Zeit habe ich angefangen zu schreiben und dabei gemerkt, dass mir das Schreiben noch mehr Spaß macht als das Malen.',
            },
            { text: '{{1}} Das kann ich so genau gar nicht sagen. Manchmal male ich lieber, manchmal schreibe ich lieber. Denn ich male nicht nur für meine Bücher, sondern auch für mich selbst.' },
            { text: '{{2}} So eine Person als Idol gab es nicht. Ich durfte als Kind auch nicht lesen. Mein Vater war sehr streng. Er hat mir das Lesen verboten. Wenn er mich mit einem Buch fand, wurde er wütend.' },
            { text: '{{3}} Natürlich nicht. Als Kind war ich mehr als brav. Ich wusste genau, dass ich keinen Blödsinn machen darf.' },
            {
              text: '{{4}} Die ersten acht bis zehn Seiten schreibe ich mit der Hand, damit ich in die Geschichte reinkomme, streiche viel durch, beginne wieder neu. Und wenn ich denke, ich bin in der Geschichte drin, tippe ich ein, was ich schon geschrieben habe.',
            },
            {
              text: '{{5}} Das ist eine schwierige Frage. Von den Kinderbüchern gefällt mir „Lippels Traum“ sehr. Ich habe aber auch Bücher für Erwachsene geschrieben. Da schätze ich am meisten „Wie alles kam“.',
            },
            {
              text: '{{6}} Das tue ich bereits. Mein neues Buch heißt „Die Tochter der Zauberin“. Die Zauberin Frau Schmidt zaubert gerne böse Dinge, etwa lange Schlangen vor der Supermarktkasse oder Chaos auf der Autobahn.',
            },
          ],
          bankTitle: 'FRAGEN',
          bank: [
            { key: 'A', text: 'Hatten Sie auch als Kind schon so verrückte Ideen wie Ihre Hauptfiguren?' },
            { key: 'B', text: 'Malen oder schreiben? Was macht Ihnen heutzutage mehr Spaß?' },
            { key: 'C', text: 'Herr Maar, wollten Sie schon immer Autor werden?' },
            { key: 'D', text: 'Schreiben Sie Ihre Texte am Computer?' },
            { key: 'E', text: 'Mögen Sie Verfilmungen?' },
            { key: 'F', text: 'Welches Ihrer Bücher mögen Sie am liebsten?' },
            { key: 'G', text: 'Wer war als Kind Ihr Vorbild?' },
            { key: 'H', text: 'Werden Sie noch weitere Bücher schreiben?' },
          ],
          unusedBankCount: 1,
          examples: choices(0, 'C'),
          items: choices(1, 'B G A D F H'),
        },
        {
          id: 'I-2',
          label: '2.',
          instructions:
            'Lesen Sie den Text über Erfahrungen bei einem Schüleraustausch in Argentinien. Entscheiden Sie, welche Aussage richtig (R) und welche falsch (F) ist. Kreuzen Sie die Antwort in der Tabelle an. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'Abenteuer im Ausland' },
            {
              text: 'Ein Schüleraustausch erweitert den Horizont und kann viel für die Schüler bringen, deshalb wollen immer mehr Jugendliche an einem Schüleraustausch teilnehmen.',
            },
            {
              text: 'Die 16-jährige Jule Back aus Franken war zweieinhalb Monate in Argentinien, nachdem sie zwei Jahre lang Spanisch im Gymnasium gelernt hatte. Ihr Austausch wurde vom Bayerischen Jugendring organisiert. Diese Organisation hatte sie über ihre Spanischlehrerin kennengelernt. Im Spätsommer 2021 flog Jule zu ihrer Austauschpartnerin Luján. „Ich hatte mich vor dem Abflug nicht extra vorbereitet, hatte dann aber im Flugzeug doch ein bisschen Angst, ob mein Spanisch überhaupt reicht“, sagte Jule. Während ihres Aufenthalts konnte sie ihre Aussprache verbessern und ihren Wortschatz erweitern.',
            },
            {
              text: 'Ihre Schule dort war eine Privatschule in Buenos Aires, in der sie an verschiedenen Unterrichtsstunden in den Klassenstufen 7-11 teilgenommen hat. Dort erlebte sie die Unterschiede zu Schulen in Deutschland. „Sie haben keine Abfragen, und das Schüler-Lehrerverhältnis ist enger. Also die Schüler dürfen ihre Lehrer da sogar duzen“, erzählte Jule weiter.',
            },
            {
              text: 'Nach den ersten Schwierigkeiten fand Jule viele Freunde und war in den Pausen immer mit ihnen zusammen. Ihre Austausch-Partnerin, die siebzehnjährige Luján, lebt mit ihrer Mutter und einem Hund in einer Wohnung mit zwei Schlafzimmern, so teilten sich die Mädchen ein Zimmer.',
            },
            {
              text: 'Für die deutsche Schülerin war es am Anfang ungewöhnlich, in einer Millionenstadt zu leben. „Es gab immer Lärm im Hintergrund und viel Kriminalität“, bemerkt die Schülerin. Vor allem der Süden von Buenos Aires, in dem sie war, ist gefährlich. Die Mutter hatte selbst erlebt, wie ihr Handy aus ihrer Hand gestohlen wurde, als sie gerade die Haustür abschließen wollte.',
            },
            {
              text: 'Jule hat viel über Land und Leute gelernt und die wichtigsten Sehenswürdigkeiten in Buenos Aires gesehen. Sie und ihre Gastfamilie flogen auch in den Norden des Landes und sind dort mit Booten an den Wasserfällen, die zu den sieben neuen Naturwundern gehören, vorbeigefahren. Für Jule war das eine tolle Zeit, sie hat sich wirklich als Familienmitglied gefühlt.',
            },
          ],
          booleanLabels: ['R', 'F'],
          examples: rf(0, ['Schüleraustausch-Programme sind unter den Jugendlichen immer beliebter.'], 'R'),
          items: rf(
            7,
            [
              'Den Austausch für Jule Back hat ihr Gymnasium geplant.',
              'Vor der Ankunft machte sich Jule wegen ihrer Sprachkenntnisse Sorgen.',
              'In der Gastschule lernte Jule in unterschiedlichen Klassenstufen.',
              'Die deutsche Schülerin fühlte sich während des Programms sehr einsam.',
              'Jule bekam ein eigenes Zimmer bei der Gastfamilie.',
              'Nach Meinung von Jule ist Buenos Aires sehr laut und nicht sicher.',
              'Mit der Gastfamilie verbrachte Jule auch Zeit außerhalb der Hauptstadt.',
            ],
            'F R R F F R R',
          ),
        },
        {
          id: 'I-3',
          label: '3.',
          instructions:
            'Lesen Sie die Texte über Glamping-Plätze in Deutschland. Kreuzen sie in der Tabelle an, welche Aussage zu welchem Text passt. Achtung! Eine Aussage kann zu mehreren Texten passen. Sie dürfen insgesamt 8-mal ankreuzen. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'Glamping in Deutschland: Urlaub in luxuriösen Zelten' },
            {
              text: 'Urlaub in Luxus-Zelten ist der neueste Urlaubstrend des 21. Jahrhunderts. Er wird auch in Deutschland immer beliebter. Glamping ist eine Mischung aus Camping und Luxusurlaub für alle, die in der Natur bequem urlauben möchten.',
            },
            {
              text: '1. Brandenburg: Hier ist in ländlicher Umgebung eine kleine Glamping-Stadt entstanden. In jedem Zelt findet man ein Doppelbett, einen Esstisch mit Stühlen und eine kleine Küche mit einem Kühlschrank und anderen elektrischen Küchengeräten. In einigen Zelten gibt es außerdem Platz für ein Extra-Bett, sodass nicht nur Paare, sondern auch Familien mit einem Kind gemeinsam Zeit in der Natur verbringen können. Alle Zelte haben eine Art Terrasse mit bequemen Gartenmöbeln, wo man relaxen kann. Kostenloses WLAN sowie ein integriertes privates Badezimmer mit Dusche und Waschbecken sind selbstverständlich in den Zelten. Die Preise für ein Zelt pro Nacht beginnen bei 50 Euro.',
            },
            {
              text: '2. Thüringen: In Thüringen können sowohl Paare als auch Familien einige Tage in einem schick eingerichteten Zelt zusammen verbringen und sich wirklich erholen. Die Glamping-Unterkunft bietet viel Natur und Ruhe. In jedem Zelt warten ein King-Size-Doppelbett und zwei Etagenbetten auf die Urlauber. Die Gäste haben natürlich auch freien Zugang zum Internet. Draußen stehen Dusche und Waschbecken bereit und die Toilettenbenutzung ist in einem Hotel in direkter Nähe möglich. Abends kann man an der Feuerstelle grillen. Die Zelte kosten 75 Euro pro Nacht.',
            },
            {
              text: '3. Hessen: In dem Camping an der Oberweser gibt es Zelte mit entweder zwei oder vier Betten. Die Urlauber haben die Möglichkeit, auch den Grillplatz zu benutzen. In dem Campingdorf wurden ein Schwimmbecken, ein Kinderbecken sowie ein Spielplatz gebaut. Die Umgebung bietet viel Platz zum Radfahren, Wandern und Spazierengehen. Die Preise pro Übernachtung liegen bei 22 Euro für ein Zelt.',
            },
            {
              text: '4. Baden-Württemberg: Hier können Urlauber baden, SUP-Boards ausleihen, Kajak fahren oder einen Spaziergang in der Natur unternehmen. Zum Camping-Gelände gehören ein Bistro und ein Biergarten, wo man verschiedene deutsche Biersorten und lokale Spezialitäten probieren kann. Die Preise hier hängen von der Jahreszeit ab. Dieses Camping-Gelände ist sehr stark ausgebaut, wer nur Ruhe sucht, wird hier nicht so glücklich.',
            },
          ],
          rules: { multiSelectPenalty: true },
          examples: [
            { id: '0', type: 'multi-select', stem: 'Die Zelte hier kann man für maximal drei Personen mieten.', options: camps, answer: ['1'], pick: 1 },
          ],
          items: [
            { id: '14/16', type: 'multi-select', stem: 'In diesem Glamping muss man für die Internetbenutzung nicht extra zahlen.', options: camps, answer: ['1', '2'], pick: 2 },
            { id: '15/17/18', type: 'multi-select', stem: 'Die Übernachtungspreise werden hier pro Zelt angegeben.', options: camps, answer: ['1', '2', '3'], pick: 3 },
            { id: '19/20', type: 'multi-select', stem: 'Dieses Camp bietet die Möglichkeit für verschiedene Sportaktivitäten.', options: camps, answer: ['3', '4'], pick: 2 },
            { id: '21', type: 'multi-select', stem: 'Hier ist es für die Gäste möglich, typisch deutsche Speisen auszuprobieren.', options: camps, answer: ['4'], pick: 1 },
          ],
        },
        {
          id: 'I-4',
          label: '4.',
          instructions:
            'Welcher Satz passt in den Text? Tragen Sie den entsprechenden Buchstaben in die Rubrik ein. Achtung! Es gibt einen Buchstaben zu viel. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'Starke linke Hand' },
            {
              text: 'Einen Apfel schneiden, ein Video anklicken, einen Deckel öffnen: {{0}} Ob man Rechtshänder oder Linkshänder wird, kann man sich bei der Geburt nicht auswählen. {{22}} Etwa ab dem achten Lebensmonat haben die meisten Kinder eine Lieblingshand. Welche Seite man eher benutzt, ist meist im dritten Lebensjahr schon eindeutig.',
            },
            {
              text: 'Ob man später lieber mit der rechten oder linken Hand arbeitet, ist eigentlich egal. {{23}} Zum Beispiel liegt das Besteck beim Essen oft auf der rechten Seite vom Teller. An Fahrkarten-Automaten kann man auf der rechten Seite bezahlen. Wenn Rechtshänder Spielkarten in der Hand halten, sehen sie alle wichtigen Informationen auf der rechten Seite.',
            },
            {
              text: 'All diese Dinge können einem den Alltag als Linkshänder schwerer machen. Um darauf aufmerksam zu machen, gibt es den Linkshändertag. {{24}} Den Aktionstag rief der Amerikaner Dean Campbell 1976 ins Leben.',
            },
            {
              text: 'Einen bedeutenden Vorteil hat man aber als Linkshänder beim Sport. {{25}} Wie auch beim Tennis, wenn der Ball mit der linken Hand über das Netz geschlagen wird. Das ist für den Gegner oft eine ungewöhnliche Situation, die er schwer einschätzen kann.',
            },
            {
              text: 'Wenn man Linkshändern das Leben leichter machen will, sollte man ihnen den Platz auf ihrer linken Seite frei lassen, wenn sie essen, basteln oder schreiben. Sich als Linkshänder auf die rechte Hand umzugewöhnen, ist nicht ratsam. {{26}} Und am Ende ist alles noch viel schwerer. Man ist gut so, wie man ist!',
            },
          ],
          bankTitle: 'SÄTZE',
          bank: [
            { key: 'A', text: 'Allerdings ist die Welt eher auf Rechtshänder eingestellt.' },
            { key: 'B', text: 'Beim Boxen oder Fechten können Sportler ihren Gegner überraschen.' },
            { key: 'C', text: 'Jeder Mensch hat eine Hand, mit der das alles etwas einfacher geht.' },
            { key: 'D', text: 'Das macht nur Chaos im Kopf.' },
            { key: 'E', text: 'Der ist jedes Jahr am 13. August.' },
            { key: 'F', text: 'Linkshänder sind generell kreativer.' },
            { key: 'G', text: 'Man kommt mit dieser Eigenschaft auf die Welt.' },
          ],
          unusedBankCount: 1,
          examples: choices(0, 'C'),
          items: choices(22, 'G A E B D'),
        },
      ],
    },
    {
      id: 'II',
      kind: 'language-use',
      titleHu: 'II. Nyelvhelyesség',
      timeLimitMin: 30,
      // útmutató: feladatpont 0–22 → vizsgapont
      conversion: [0, 1, 2, 2, 3, 4, 5, 6, 7, 7, 8, 9, 10, 11, 11, 12, 13, 14, 15, 16, 16, 17, 18],
      tasks: [
        {
          id: 'II-1',
          label: '1.',
          instructions: 'Was passt in den Text? Unterstreichen Sie das richtige Wort. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'In einer Burg leben' },
            {
              text: 'In Österreich gibt es über tausend Burgen und Schlösser. Manche {{0}} ihnen sind nur noch Ruinen. Andere sehen sehr schön aus. Aber kann man darin wohnen?',
            },
            {
              text: 'Es gibt auch heute noch Familien, {{1}} auf einer Burg wohnen. Ihr Leben ist jedoch nicht mehr so {{2}} im Mittelalter. Wie stellst du dir ein Leben in einer Burg vor? Schön? Ja, das ist es vielleicht. Vergiss aber nicht: So ein {{3}} Gebäude macht auch viel Arbeit. Außerdem braucht man Geld, um eine Burg zu erhalten. Schließlich sind Burgen alte Gebäude – da ist immer etwas kaputt. Deshalb müssen viele Burgherren und Burgherrinnen mit ihrer Burg Geld {{4}}. Dabei haben sie verschiedene Möglichkeiten.',
            },
            {
              text: 'Meistens gibt es rund um die Burg viel Land, das {{5}} Burg gehört. Dort können die Burgherren etwas anpflanzen oder Tiere halten. Viele haben in ihrer Burg {{6}} Museum eingerichtet. Dort bezahlen die Besucher Eintritt und können herausfinden, wie die Menschen früher gelebt haben. Andere Burgen haben Restaurants oder {{7}} kann sie für Veranstaltungen mieten. In besonders schönen Burgen werden sogar Filme gedreht! Manche Burgen wurden auch zu Hotels umgebaut. Wer dort Urlaub macht, kann {{8}} selbst wie ein Burgherr oder eine Burgherrin fühlen.',
            },
            { style: 'note', text: '*Burgruine' },
          ],
          examples: gapMcqs(0, [['aus', 'bei', 'um', 'von']], 'D'),
          items: gapMcqs(
            1,
            [
              ['das', 'denen', 'die', 'wer'],
              ['als', 'dass', 'was', 'wie'],
              ['große', 'großen', 'großer', 'großes'],
              ['brauchen', 'suchen', 'treiben', 'verdienen'],
              ['an die', 'für die', 'mit der', 'zur'],
              ['ein', 'eine', 'einen', 'eines'],
              ['der Mann', 'die Leute', 'er', 'man'],
              ['er', 'man', 'sich', 'sie'],
            ],
            'C D D D D A D C',
          ),
        },
        {
          id: 'II-2',
          label: '2.',
          instructions:
            'Was passt in den Text? Schreiben Sie den entsprechenden Buchstaben in die Rubrik. Achtung! Es gibt sieben Buchstaben zu viel. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'Radfahrprüfung' },
            {
              text: 'Viele Kinder {{0}} vierten Volksschulklassen treten zur freiwilligen Radfahrprüfung an. Wer diese Prüfung schafft, {{9}} bereits mit 10 Jahren allein auf der Straße mit dem Fahrrad fahren.',
            },
            {
              text: 'Doch das ist gar nicht so leicht: Denn immer weniger Kinder können gut Rad fahren. Das sagt jedenfalls Werner Madlencnik. Er ist Chef {{10}} der größten österreichischen Radfahrschule. Und er muss es wissen: Mehr {{11}} 35.000 Kinder gehen bei ihm pro Jahr zur „Radfahrschule“. Er {{12}} Fahrradkurse in allen Bundesländern in Österreichs Schulen.',
            },
            {
              text: '„Manche Kinder können gar nicht Fahrrad fahren“, sagt Werner. Andere wiederum fahren so schlecht, {{13}} sie nicht einhändig – also nur mit einer Hand am Lenker – fahren können. Das muss man aber können, damit man ein Handzeichen fürs Linksabbiegen geben kann. Genauso wichtig ist es, sicher bremsen und geradeaus fahren zu können.',
            },
            {
              text: 'Und warum läuft das nicht so gut? Oft wird zu wenig geübt, oder die Kinder fahren lieber mit {{14}} Roller. Doch wer Roller fahren kann, kann deshalb noch lange nicht Rad fahren.',
            },
            {
              text: 'Werners Tipps: „Man braucht ein leichtes Rad in der richtigen Größe, viel Übung und ganz wichtig: einen Fahrradhelm, {{15}} gefällt.“ Werners Helm ist knallrot.',
            },
          ],
          bank: [
            { key: 'A', text: 'ALS' },
            { key: 'B', text: 'ABER' },
            { key: 'C', text: 'DARF' },
            { key: 'D', text: 'DAS' },
            { key: 'E', text: 'DASS' },
            { key: 'F', text: 'DEM' },
            { key: 'G', text: 'DER' },
            { key: 'H', text: 'DER' },
            { key: 'I', text: 'DIE' },
            { key: 'K', text: 'MACHT' },
            { key: 'L', text: 'VON' },
            { key: 'M', text: 'WAS' },
            { key: 'N', text: 'WIE' },
            { key: 'O', text: 'ZU' },
            { key: 'P', text: 'ZUM' },
          ],
          unusedBankCount: 7,
          examples: choices(0, 'G'),
          items: choices(9, 'C L A K E F H'),
        },
        {
          id: 'II-3',
          label: '3.',
          instructions:
            'Was passt in den Text? Schreiben Sie den entsprechenden Buchstaben in die Rubrik. Achtung! Es gibt einen Buchstaben zu viel. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'Rettung am Berg' },
            {
              text: 'Die Berge sind nicht nur schön, {{0}}. Immer wieder verletzen sich dort Menschen. Dann wird die Bergrettung gerufen. Unser Reporter wollte mehr darüber wissen, {{16}}.',
            },
            { text: '- Hallo, Romana! Was macht man denn bei der Bergrettung?' },
            { text: '- Die Bergrettung hilft Menschen, {{17}}. Zum Beispiel, weil sie den Weg nicht mehr finden {{18}}.' },
            { text: '- Wann bist du zur Bergrettung gekommen?' },
            { text: '- Ich habe mich mit 16 Jahren bei der Bergrettung gemeldet. Bei der ersten Übung habe ich mit Straßenschuhen im Schnee gestanden, weil ich dachte, {{19}}.' },
            { text: '- Bergretter und Bergretterinnen arbeiten freiwillig. Das bedeutet, dass ihr in eurer Freizeit arbeitet, {{20}}. Warum machst du das?' },
            { text: '- Ich mag diese Arbeit sehr gern. Ich kann in den Bergen unterwegs sein {{21}}.' },
            { text: '- Was war dein aufregendster Einsatz?' },
            {
              text: '- Ein junger Mann hat den Abstieg von einem steilen Berg nicht mehr gefunden. Leider hat er uns erst zu spät angerufen. Wir mussten ihn dann im Dunkeln suchen und wieder ins Tal bringen. Deshalb ist es sehr wichtig, {{22}}. Die Notrufnummer der Bergrettung ist 140.',
            },
          ],
          bank: [
            { key: 'A', text: 'dass wir im Winter nur drinnen Übungen machen' },
            { key: 'B', text: 'deshalb hat er die Tiroler Bergretterin Romana Klein zu einem Interview getroffen' },
            { key: 'C', text: 'die am Berg in Not geraten sind' },
            { key: 'D', text: 'die Bergrettung früh genug anzurufen' },
            { key: 'E', text: 'oder weil sie sich beim Wandern oder Skifahren verletzt haben' },
            { key: 'F', text: 'ohne Geld dafür zu bekommen' },
            { key: 'G', text: 'sondern auch gefährlich' },
            { key: 'H', text: 'um sich gut über die Tour zu informieren' },
            { key: 'I', text: 'und dabei anderen Menschen helfen' },
          ],
          unusedBankCount: 1,
          examples: choices(0, 'G'),
          items: choices(16, 'B C E A F I D'),
        },
      ],
    },
    {
      id: 'III',
      kind: 'listening',
      titleHu: 'III. Hallott szöveg értése',
      timeLimitMin: 30,
      intro: DE_LISTENING_INTRO,
      audio: {
        storagePath: 'erettsegi-de-kozep-2024-oktober.mp3',
        durationSec: 1802,
        // Task starts: the ~60 s reading pause of each task found by silence detection, minus the length of its announcement (approximate, ±10 s).
        taskMarkers: [
          { taskId: 'III-1', startSec: 76 },
          { taskId: 'III-2', startSec: 685 },
          { taskId: 'III-3', startSec: 1270 },
        ],
      },
      // útmutató: feladatpont 0–23 → vizsgapont
      conversion: [0, 1, 3, 4, 6, 7, 9, 10, 11, 13, 14, 16, 17, 19, 20, 22, 23, 24, 26, 27, 29, 30, 32, 33],
      transcripts: [
        {
          taskId: 'III-1',
          title: 'Museen für die ganze Familie - Tipps für die Winterferien',
          paragraphs: [
            'Wir haben für Sie jetzt ein paar Museumstipps in Hessen für die Winterferien, die der ganzen Familie gefallen können.',
            'Unser erster Halt führt uns nach Hanau. Hier ist das Hessische Puppen- und Spielzeugmuseum. Leiterin Victoria Asschenfeldt: „Wir haben unglaublich viele Mitmachstationen, wo man die Dinge, die man bei uns in den Vitrinen sieht, auch selber ausprobieren darf. So bekommen die Besucher eine direkte Vorstellung von früheren Zeiten.“',
            'Seit fast 40 Jahren kann man hier die Geschichte der Spielzeuge erleben. Ein Highlight in Hanau: die Antiken-Sammlung – Spielzeug, das über 2000 Jahre alt ist! Das ist eine wirklich große Sammlung mit Stücken aus der griechisch-römischen Zeit, wo man sehen kann, dass Spielen und Spielzeug die Menschheit eigentlich schon immer begleitet haben. Daneben findet man hier auch eine Sammlung von Puppenhäusern, traditionelle japanische Figuren, Eisenbahnen aller Art und vieles mehr. Weiter geht‘s in Fulda. Die Kinder-Akademie dort ist Deutschlands ältestes Kindermuseum. An verschiedenen Stationen bringt man Familien spielerisch Kunst, Kultur, Naturwissenschaft und Technik näher. Das menschliche Herz kann man hier von innen sehen, in einem großen, begehbaren Modell. Und in wechselnden Sonderausstellungen gibt es immer wieder Neues zu erfahren.',
            'Und weiter geht die Reise. Im Vulkaneum dreht sich alles um – logisch – Vulkane. Zu finden ist es im Vogelsberg-Gebirge. „Wir haben uns überlegt, dass wir hier mal eine Ausstellung dazu machen, wie die Landschaft entstanden ist.” – sagt der Geologe Johann Boos. Er führt Besuchergruppen durch die Ausstellung. Das ist anders als in einem klassischen Museum. „Man darf bei uns wirklich alles in die Hand nehmen und fotografieren.“ Besonders toll finden Kinder auch das ‚Magische Buch‘, eine Video- und Toninstallation. „Ja, das ist die letzte Station im Vulkaneum, die zeigt, wie sich die Menschen früher das Phänomen Vulkan erklärt haben.“',
            'Und am Ende darf sich jeder noch einen Vulkanstein mitnehmen als Andenken für Zuhause.',
            'Den letzten Halt machen wir im „Wortreich“ in Bad Hersfeld, eine Wissenswelt rund um Sprache und Kommunikation. Hier erwarten bunte, interaktive Stationen die Besucher und man erfährt auch einiges über Körpersprache und die Kommunikation der Tiere. In einer aktuellen Sonderausstellung kommt dazu noch alles rund um die Sprache der Liebe. Und das ist alles andere als langweilig.',
          ],
        },
        {
          taskId: 'III-2',
          title: 'Statt Schule – verbringe ein Jahr im Ausland',
          paragraphs: [
            'Sprachen lernen, die Welt sehen oder einfach mal rauskommen: Es gibt viele Gründe für ein Jahr im Ausland. Hier erzählt Ulrich, Schüler aus Deutschland, was er vorhat.',
            '„Ich möchte nächstes Jahr im September ins Ausland, nach Kanada, gehen. Ein wichtiger Punkt für meine Entscheidung ist, dass ich in Kanada Französisch und Englisch sprechen kann, und danach mit meinen verbesserten Sprachkenntnissen in das Sprachprofil meiner Schule gehen möchte. Die Pause, die ich dadurch von meiner Schule haben werde, ist aber auch wichtig für mich. Ich muss mich ein Jahr lang nicht besonders auf meine Noten fokussieren, sondern kann mich auf neue Erfahrungen für mein Leben konzentrieren. Darauf freue ich mich am meisten. Auf neue Menschen, internationale Freunde und eine ganz neue Kultur und andere Lebensweisen. Ich frage mich auch, wie es sein wird, wenn das Wetter und die Temperaturen in Kanada so anders sind als in Deutschland. Dort den Winter und den Sommer zu erleben und etwas draußen zu unternehmen, wird bestimmt eine tolle Erfahrung. Ich bin zum Beispiel noch nie Ski gefahren, aber das kann ich ja lernen. Alles in allem denke ich, dass ich wesentlich selbstständiger, selbstbewusster und offener wieder nach Hause kommen werde.“',
            'Daniela war mit 15 im Ausland. Sie lebte bei einer Gastfamilie im Norden Norwegens und musste bei minus 30 Grad Celsius helfen, die Rentiere der Familie zu versorgen. „Das hat mir aber gar nichts ausgemacht. Du triffst neue Leute und kannst neue Freundschaften schließen. Außerdem lernst du eine neue Kultur kennen, die dir vielleicht sogar besonders gut gefällt. Auch eine andere Natur wirst du sehen. Während du in Deutschland vielleicht am Meer wohnst, lebst du dort vielleicht in den Bergen mit viel Schnee.“',
            'Daniela ist später zum Studium wieder nach Norwegen zurückgekehrt, nachdem sie in Hamburg ihr Abitur gemacht hatte.',
            'Man kann viel lernen in der Zeit, in der man von Zuhause weg ist. Diese Erfahrung machen viele. Daniela sagt: „Vor allem die Selbständigkeit wird dadurch gefördert, wenn man alleine in ein anderes Land geht. Aber auch die Sprache spielt eine wichtige Rolle. Man lernt innerhalb weniger Wochen eine neue Sprache, egal ob man Vorkenntnisse hat oder keine.“',
            'Zusammenfassend: es ist wirklich sinnvoll ins Ausland zu gehen. Vielleicht lernt man dort etwas über sich selbst, aber auf jeden Fall hat man meist eine neue Sichtweise kennenlernen dürfen und wahrscheinlich eine Menge Spaß gehabt.',
          ],
        },
        {
          taskId: 'III-3',
          title: 'Baden im Fluss',
          paragraphs: [
            'Die Ruhr ist ein 220 km langer Fluss, der durch Nordrhein-Westfalen fließt. Baden in der Ruhr? – fragt sich jetzt vielleicht mancher. Ja! Die Stadt Bochum hat es möglich gemacht. Hier wurde im Jahr 2022 die erste offizielle Badestelle zum Schwimmen eröffnet.',
            'Das Gute dort in Bochum ist, dass man an mehreren flachen Stellen ganz leicht in den Fluss kommt. Der Badebereich ist mit gelben Bojen begrenzt. Dort ist das Wasser höchstens einen bis zwei Meter tief und die ganze Stelle gilt als nicht gefährlich.',
            'Früher war das Ruhrgebiet die größte Industrieregion Europas. Das hatte große Auswirkungen auf die Qualität des Wassers. Um das Jahr 1900 war es am schlimmsten. Der Fluss war so schmutzig, dass kein Fisch mehr darin schwamm. Heute ist das anders. Die Industrie nutzt den Fluss nur noch an wenigen Stellen für den Transport. Das Wasser ist heute wieder sehr sauber, davon kann man sich am Badestrand in Bochum überzeugen. Allerdings gibt es dort keine Bademeister. Schwimmen geht also immer nur auf eigene Gefahr.',
            'Wer also Lust auf ein Bad im Fluss hat, kann einen Ausflug mit dem Zug zur Badestelle an der Ruhr machen.',
            'Und wie ist es mit dem Baden im Rhein?',
            'Auch am Rhein, am größten Fluss des Bundeslandes Nordrhein-Westfalen, wäre so eine Badestelle im Fluss prima. In Oberkassel am Rhein gab es schon vor über 100 Jahren ein beliebtes Strandbad. Mit Umkleidemöglichkeiten, Bademeistern und einem Restaurant. Die Leute nannten es „Düsseldorfer Lido”. Damals war das Schwimmen im Rhein nicht so gefährlich wie in unserer Zeit. Heute ist das Flussbaden problematisch, denn es gibt im Rhein eine deutlich höhere Wassergeschwindigkeit. Auch fahren hier viel größere Schiffe als zum Beispiel auf der Ruhr.',
          ],
        },
      ],
      tasks: [
        {
          id: 'III-1',
          label: '1.',
          instructions:
            'Sie hören einen Beitrag über Freizeitangebote für Familien. Lesen Sie zuerst die Aufgabe. Sie hören dann den Text zweimal. Zuerst hören Sie den ganzen Text ohne Pausen, dann in kürzeren Abschnitten. Ergänzen Sie die Sätze beim Hören. Schreiben Sie in jede Lücke nur eine Information. (0) ist ein Beispiel für Sie.',
          passage: [{ style: 'title', text: 'Museen für die ganze Familie - Tipps für die Winterferien' }],
          examples: [
            {
              id: '0',
              type: 'short-text',
              prompt: 'Im „Hessischen Puppen- und Spielzeugmuseum“ dürfen die Besucher viele Dinge an Mitmachstationen ________ .',
              answer: { accepted: ['ausprobieren'], match: 'exact-ci' },
            },
          ],
          items: [
            {
              id: '1',
              type: 'short-text',
              prompt: '… gibt es auch antikes Spielzeug, das schon ________ alt ist.',
              answer: { accepted: ['(über) 2000 Jahre'], match: 'keywords', keywords: [['2000']] },
            },
            {
              id: '2',
              type: 'short-text',
              prompt: '… kann man viele Spielsachen von früher wie z. B. ________ sehen.',
              answer: {
                accepted: ['(eine Sammlung von) Puppenhäuser(n)', '(traditionelle) japanische Figuren', 'Eisenbahnen (aller Art)', 'aus der griechisch-römischen Zeit'],
                match: 'keywords',
                keywords: [['puppenhä', 'puppenhaus', 'japanisch', 'eisenbahn', 'griechisch', 'römisch']],
              },
            },
            {
              id: '3',
              type: 'short-text',
              prompt: 'Die „Kinder-Akademie“ in Fulda ist in Deutschland das ________ .',
              answer: { accepted: ['älteste Kindermuseum'], match: 'keywords', keywords: [['älteste', 'aelteste'], ['kindermuseum']] },
            },
            {
              id: '4',
              type: 'short-text',
              prompt: 'Hier können die Kinder an einem großen Modell das ________ kennenlernen.',
              answer: { accepted: ['(menschliche) Herz'], match: 'keywords', keywords: [['herz']] },
            },
            {
              id: '5',
              type: 'short-text',
              prompt: 'Im „Vulkaneum“ im Vogelsberg-Gebirge dürfen Besucher nicht nur alles ansehen, sondern auch ________ .',
              answer: { accepted: ['in die Hand nehmen', 'fotografieren'], match: 'keywords', keywords: [['hand', 'fotografier']] },
            },
            {
              id: '6',
              type: 'short-text',
              prompt: 'Man darf sogar ________ mit nach Hause nehmen.',
              answer: { accepted: ['einen (Vulkan)stein'], match: 'keywords', keywords: [['stein']] },
            },
            {
              id: '7',
              type: 'short-text',
              prompt: 'Das „Wortreich“ in Bad Hersfeld bietet aktuell auch eine Sonderausstellung über ________ .',
              answer: { accepted: ['die Sprache der Liebe'], match: 'keywords', keywords: [['sprache'], ['liebe']] },
            },
          ],
        },
        {
          id: 'III-2',
          label: '2.',
          instructions:
            'Sie hören einen Text über Jugendliche und ihr Auslandsjahr. Lesen Sie zuerst die Aufgabe. Sie hören dann den Text zweimal. Zuerst hören Sie den ganzen Text ohne Pausen, dann in kürzeren Abschnitten. Entscheiden Sie beim Hören, welche Aussage zu welcher Person passt und kreuzen Sie an. Eine Aussage kann zu beiden Personen passen. Achtung! Sie dürfen insgesamt 8-mal ankreuzen. (0) ist ein Beispiel für Sie.',
          passage: [{ style: 'title', text: 'Statt Schule – verbringe ein Jahr im Ausland' }, { text: 'Er/sie …' }],
          rules: { multiSelectPenalty: true },
          examples: [{ id: '0', type: 'multi-select', stem: 'möchte seine/ihre Sprachkenntnisse verbessern.', options: people, answer: ['u'], pick: 1 }],
          items: [
            { id: '8/12', type: 'multi-select', stem: 'mag neue Menschen und Kulturen kennenlernen.', options: people, answer: ['u', 'd'], pick: 2 },
            { id: '10', type: 'multi-select', stem: 'kann im Auslandsjahr Ski fahren erlernen.', options: people, answer: ['u'], pick: 1 },
            { id: '11/13', type: 'multi-select', stem: 'denkt, man wird durch das Auslandsjahr selbstständiger.', options: people, answer: ['u', 'd'], pick: 2 },
            { id: '9', type: 'multi-select', stem: 'findet die verschiedenen Jahreszeiten in dem anderen Land interessant.', options: people, answer: ['u'], pick: 1 },
            { id: '14', type: 'multi-select', stem: 'ist nach dem Abitur wieder in das gleiche Land zurückgegangen.', options: people, answer: ['d'], pick: 1 },
            { id: '15', type: 'multi-select', stem: 'hatte die Möglichkeit, eine ganz neue Sprache zu lernen.', options: people, answer: ['d'], pick: 1 },
          ],
        },
        {
          id: 'III-3',
          label: '3.',
          instructions:
            'Sie hören einen Radiobericht über Badestellen an den Flüssen Ruhr und Rhein. Lesen Sie zuerst die Aufgabe. Sie hören dann den Text zweimal. Zuerst hören Sie den ganzen Text ohne Pausen, dann in kürzeren Abschnitten. Entscheiden Sie, welche Aussage richtig (R) und welche falsch (F) ist. Kreuzen Sie die Antwort beim Hören an. (0) ist ein Beispiel für Sie.',
          passage: [{ style: 'title', text: 'Baden im Fluss' }],
          booleanLabels: ['R', 'F'],
          examples: rf(0, ['Vor 2022 gab es keinen Strand an der Ruhr.'], 'R'),
          items: rf(
            16,
            [
              'Das Wasser im neuen Badebereich in Bochum ist an mehreren Stellen sehr tief.',
              'Die Ruhr fließt durch ein früher sehr bedeutendes Industriegebiet.',
              'Um 1900 gab es viele Fische in der Ruhr.',
              'Das Wasser der Ruhr ist im 21. Jh. besonders schmutzig.',
              'Am neuen Ruhr-Strand gibt es keinen Bademeister.',
              'Die Badestelle an der Ruhr ist mit dem Zug erreichbar.',
              'Schon vor 100 Jahren badete man am Rhein-Strand in Oberkassel.',
              'Das Schwimmen im Rhein ist heutzutage sicherer als im 20. Jahrhundert.',
            ],
            'F R F F R R R F',
          ),
        },
      ],
    },
    {
      id: 'IV',
      kind: 'writing',
      titleHu: 'IV. Íráskészség',
      timeLimitMin: 60,
      intro: DE_WRITING_INTRO,
      tasks: [
        {
          id: 'IV-1',
          label: '1.',
          title: 'Wie kann man seine Zeit am besten einteilen?',
          instructions: 'Sie haben eine E-Mail von Ihrer deutschen Freundin bekommen. Hier sind einige Auszüge daraus:',
          passage: [
            {
              text: '„Jeder Tag hat 24 Stunden. Das ist für alle Menschen gleich. Trotzdem nutzen manche ihre Zeit besser als andere. … Wie kann man seine Zeit im Alltag am besten einplanen und einteilen? Ich glaube, dass bei mir täglich viel Zeit vergeht, ohne dass ich meine Aufgaben gemacht habe. … Ich möchte auch mehr Zeit für Hobbys gewinnen. Hast du Ideen, wie ich mich besser organisieren könnte?“',
            },
          ],
          items: [
            {
              id: '1',
              type: 'production',
              prompt: ['Schreiben Sie eine E-Mail an Ihre Freundin und geben Sie Ratschläge. Gehen Sie dabei auf die folgenden Punkte ein:'],
              contentPoints: [
                'Reagieren Sie auf die Bitte Ihrer Freundin.',
                'Haben Sie genug Zeit in Ihrem Alltag? Warum (nicht)?',
                'Geben Sie Ratschläge, wie man seine Zeit besser nutzen könnte.',
              ],
              promptAfter: ['Die Reihenfolge der Leitpunkte können Sie selbst bestimmen. Verwenden Sie für Ihren Text 80-100 Wörter.'],
              minWords: 80,
              maxWords: 100,
              opening: 'Liebe Petra,',
              register: 'informal-message',
              rubricId: 'erettsegi-kozep-1',
              criteria: DE_CRITERIA_1,
            },
          ],
        },
        {
          id: 'IV-2',
          label: '2.',
          title: '„Tag der Freundschaft“',
          instructions: 'Im Internet haben Sie einen Artikel über den „Tag der Freundschaft“ gefunden. Hier lesen Sie Auszüge aus dem Artikel:',
          passage: [
            {
              text: '„Jede Freundschaft ist etwas Besonderes. Seit 2011 wird immer am 30. Juli der Internationale Tag der Freundschaft gefeiert. Für einige gibt es kleine Geschenke an dem Tag und andere wollen ihren liebsten Freunden einfach mal Danke sagen. … Eine öffentliche Nachricht unter #TagderFreundschaft soll den Freunden zeigen, welche Bedeutung sie haben.“',
            },
          ],
          items: [
            {
              id: '2',
              type: 'production',
              prompt: ['Schreiben Sie Ihre Meinung zum Thema in einem Forumsbeitrag. Gehen Sie dabei auf die folgenden Punkte ein:'],
              contentPoints: [
                'Wie wichtig ist Freundschaft für Sie? Warum?',
                'Was macht einen guten Freund/eine gute Freundin aus?',
                'Wie halten Sie den Kontakt mit Ihren besten Freunden?',
                'Wie würden Sie den Tag der Freundschaft feiern?',
              ],
              promptAfter: ['Die Reihenfolge der Leitpunkte können Sie selbst bestimmen. Verwenden Sie für Ihren Text 100-120 Wörter.'],
              minWords: 100,
              maxWords: 120,
              opening: 'Hallo Leute,',
              register: 'forum-post',
              rubricId: 'erettsegi-kozep-2',
              criteria: DE_CRITERIA_2,
            },
          ],
        },
      ],
    },
  ],
}

export default paper
