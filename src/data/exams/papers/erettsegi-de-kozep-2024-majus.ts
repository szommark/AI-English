// Német nyelv, középszintű írásbeli érettségi, 2024. május 10. (K2312), Oktatási Hivatal.
// Transcribed verbatim from the feladatlap and its javítási-értékelési útmutató (answer key,
// conversion tables, listening transcripts). Decorative photos are left out.
import type { ExamPaper } from '../types'
import { choices, DE_CRITERIA_1, DE_CRITERIA_2, DE_LISTENING_INTRO, DE_NOTICES_HU, DE_WRITING_INTRO, gapMcqs, rf } from './deKozep.ts'

const apps = [
  { key: '1', text: 'Babbel' },
  { key: '2', text: 'Mondly' },
  { key: '3', text: 'Gymglish' },
  { key: '4', text: 'Lingoda' },
]

const paper: ExamPaper = {
  id: 'erettsegi-de-kozep-2024-majus',
  type: 'erettsegi',
  language: 'de',
  level: 'kozep',
  sittingLabelHu: '2024. május',
  source: 'Oktatási Hivatal: Német nyelv, középszintű írásbeli vizsga, 2024. május 10. (K2312) — feladatlap és javítási-értékelési útmutató.',
  noticesHu: DE_NOTICES_HU,
  sections: [
    {
      id: 'I',
      kind: 'reading',
      titleHu: 'I. Olvasott szöveg értése',
      timeLimitMin: 60,
      // útmutató: feladatpont 0–25 → vizsgapont
      conversion: [0, 1, 3, 4, 5, 7, 8, 9, 11, 12, 13, 15, 16, 17, 18, 20, 21, 22, 24, 25, 26, 28, 29, 30, 32, 33],
      tasks: [
        {
          id: 'I-1',
          label: '1.',
          instructions:
            'Lesen Sie den Text über den deutschen Freizeit- und Wasserpark „Tropical Island“ und entscheiden Sie, welche Aussage richtig (R) und welche falsch (F) ist. Kreuzen Sie die Antwort in der Tabelle an. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'Tropical Island – tropische Temperaturen in Deutschland genießen' },
            {
              text: 'Die kleine „Insel“ liegt nur 50 km südlich von Berlin-Schönefeld entfernt und bietet Spaß für die ganze Familie! In einer ca. 66000 m² großen Halle befindet sich die größte tropische Urlaubswelt Europas. Die Temperaturen liegen hier in jeder Jahreszeit bei 26 Grad. Man fühlt sich wie im Urlaub und möchte sofort zum Strand.',
            },
            {
              text: 'Im Wasserpark finden die Gäste einen 200 m langen Sandstrand in der Wasserwelt „Südsee“. Hier können sie es sich in einem der zahlreichen Liegestühle bequem machen. Oder sie genießen das 28 Grad warme Wasser des großen Schwimmbeckens. Familien mit Kleinkindern finden hier ein spezielles Becken mit zahlreichen Wasserspielen! Die Bali-Lagune bietet eine Wassertemperatur von 32 Grad mit zwei Rutschen und Whirlpools für Spaß und Erholung. Auch ein Wasserfall macht diese Dschungellandschaft perfekt. Die Wasserwelten kann man 24 Stunden am Tag genießen. Wer Lust hat, nachts um 3 Uhr schwimmen zu gehen, kann dies gerne tun.',
            },
            {
              text: 'Eine besondere Aktivität im Tropical Island ist die Fahrt mit einem Korbballon. Er fliegt in einer Höhe von etwa 22 m durch die tropische Erlebniswelt. Von dort oben haben Groß und Klein einen ganz besonderen Ausblick auf die Wasserwelten, den Regenwald und das Tropendorf. Im Ballon ist Platz für eine ganze Familie. Der Basispreis für die 15-minütige Fahrt ist 29 Euro.',
            },
            {
              text: 'Wer mehr karibische Stimmung genießen möchte, sollte die Abendshow „Cuba Tropical“ um 19.00 Uhr besuchen. Diese findet jeden Abend auf der Wayang-Bühne statt und bietet typische lateinamerikanische Tänze sowie akrobatische Highlights. Der Eintritt zur Show (ohne Essen und Getränke) liegt bei 15 Euro für Erwachsene und 10 Euro für Kinder.',
            },
          ],
          booleanLabels: ['R', 'F'],
          examples: rf(0, ['Der Wasserpark „Tropical Island“ liegt in der Nähe von Berlin.'], 'R'),
          items: rf(
            1,
            [
              'In der Halle des Wasserparks ist es ganzjährig ca. 26 Grad Celsius warm.',
              'Es gibt im Wasserpark „Tropical Island“ einen Sandstrand mit Liegestühlen.',
              'Für kleine Kinder gibt es in der Wasserwelt „Südsee” Wasserspiele.',
              'In der Wasserwelt „Bali-Lagune“ sorgt ein Wasserfall für Dschungelatmosphäre.',
              'Der Wasserpark „Tropical Island“ ist bis 3 Uhr in der Nacht geöffnet.',
              'Mit dem Korbballon dürfen nur Erwachsene fahren.',
              'Die Besucher können täglich auch abendliche Tanzshows genießen.',
              'Im Preis für die Abend-Show sind Essen und Getränke inklusive.',
            ],
            'R R R R F F R F',
          ),
        },
        {
          id: 'I-2',
          label: '2.',
          instructions:
            'Sie lesen jetzt ein Interview mit dem deutschen Schauspieler Daniel Brühl. Lesen Sie zuerst die Antworten des Interviews und suchen Sie dann die passende Frage. Achtung! Es gibt eine Frage zu viel. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'Vom Puppentheater zu Good bye, Lenin!' },
            { text: 'Der deutsche Schauspieler Daniel Brühl wurde von Kinderreportern interviewt.' },
            {
              text: '{{0}} Daniel Brühl: Relativ schnell, glaube ich, wollte ich machen, was ich jetzt mache: Schauspieler. Ich habe früher schon immer Aufführungen gemacht, Entweder bin ich selbst aufgetreten oder habe Puppentheater gemacht. Meine Eltern, meine Geschwister sind dabei eingeschlafen, die Geschichten hatten kein Ende!',
            },
            {
              text: '{{9}} „Good bye, Lenin!“ war sicherlich eine Rolle, die ich sehr gern gemacht habe, weil viel zusammengekommen ist. Ich habe mich so in Berlin verliebt, dass ich daraufhin in diese Stadt gezogen bin. Ich habe mich auch mit dem Regisseur extrem gut verstanden und auch mit meiner Filmmutter.',
            },
            { text: '{{10}} Ich bin immer auf der Suche nach Geschichten, die beides haben.' },
            {
              text: '{{11}} Es ist schwer zu sagen. Ich vermisse immer das, was ich nicht so stark miterlebt habe, also in meinem Fall den spanischen Teil. Für den sind meine Gefühle manchmal viel stärker. Z. B. bei einer Fußballweltmeisterschaft oder Europameisterschaft bin ich immer für Spanien. Und mein Lieblingsfußballverein ist der FC Barcelona.',
            },
            {
              text: '{{12}} Ich finde, es ist super, auf unserem Kontinent zu leben, weil man in so kurzen Entfernungen völlig neue Kulturen kennenlernt. Ich finde es toll, dass man sich in den Zug setzen kann, ein paar Stunden fährt und dann z. B. in Frankreich ist, wo alles anders ist als in Deutschland.',
            },
            {
              text: '{{13}} Vor vielen Sachen. Zum Beispiel meine ich immer, dass ich irgendeine Krankheit habe. Also immer wenn ich einmal kurz huste, denke ich schon, ich muss zum Arzt. Und auch viele Menschen auf einmal sind für mich schlimm. Das ist mit der Zeit gekommen.',
            },
            {
              text: '{{14}} Oh Gott, das kann manchmal sehr früh sein. Und das ist richtig unangenehm, weil ich morgens sehr schlecht gelaunt bin. Ganz-ganz lange schlecht gelaunt, bis um 11 Uhr.',
            },
            {
              text: '{{15}} Ja, das kommt auch vor. Wir haben in Transsylvanien gedreht, in Rumänien, ziemlich in der Nähe von Draculas Schloss, da sind ganz tiefe Wälder. Abends konnte man die Wölfe heulen hören! Ein paar Male war so dichter Nebel, dass man nichts mehr sehen konnte. Und das ist natürlich doof, wenn du da drehen willst und Wölfe in der Nähe sind. Da haben wir dann die Dreharbeiten unterbrochen.',
            },
            {
              text: '{{16}} Ja. Ich finde, es sind ganz tolle Tiere, wahnsinnig intelligent und schön. Deshalb hätte ich gerne in Rumänien welche gesehen – aus sicherem Abstand.',
            },
          ],
          bankTitle: 'FRAGEN',
          bank: [
            { key: 'A', text: 'Fühlen Sie sich als Europäer?' },
            { key: 'B', text: 'Mögen Sie Wölfe?' },
            { key: 'C', text: 'Passieren noch Abenteuer beim Filmen?' },
            { key: 'D', text: 'Sie sind zweisprachig aufgewachsen. Fühlen Sie sich eher als Deutscher oder als Spanier oder beides?' },
            { key: 'E', text: 'Spielen Sie lieber in traurigen Filmen oder in Komödien?' },
            { key: 'F', text: 'Wann stehen Sie auf, wenn Sie drehen müssen?' },
            { key: 'G', text: 'Was wollten Sie werden, als Sie Kind waren?' },
            { key: 'H', text: 'Was ist Ihr Lieblingstier?' },
            { key: 'I', text: 'Was war Ihre Lieblingsrolle bis jetzt?' },
            { key: 'K', text: 'Wovor haben Sie am meisten Angst?' },
          ],
          unusedBankCount: 1,
          examples: choices(0, 'G'),
          items: choices(9, 'I E D A K F C B'),
        },
        {
          id: 'I-3',
          label: '3.',
          instructions:
            'Lesen Sie den Text über Apps zum Sprachenlernen. Entscheiden Sie, welche Aussage zu welcher Sprachlern-App passt und kreuzen Sie an. Zu einer App können mehrere Aussagen passen. Achtung! Sie dürfen insgesamt 9-mal ankreuzen. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'Im Test: Die besten Apps zum Sprachenlernen' },
            {
              text: 'Egal, ob Englisch, Französisch oder Chinesisch: Fremdsprachen können euch so manche Tür auf dem Weg ins Berufsleben öffnen. Um eure Kenntnisse zu verbessern, müsst ihr aber nicht unbedingt eine teure Sprachschule besuchen – Smartphone sei Dank! Wir haben einige Sprachlern-Apps für euch getestet.',
            },
            {
              text: '1. Babbel: Von Wissenschaftlern entwickelt. Die wohl bekannteste unter den Sprachlern-Apps ist Babbel: Über eine Million Deutsche nutzen bereits die App aus Berlin. 13 Sprachen stehen zur Auswahl, neben den populärsten Sprachen z. B. auch Indonesisch und Türkisch. Babbel hat einen großen Vorteil: Die Software unterstützt auch das Lernen der richtigen Aussprache. Neue Vokabeln speichert die App im Wiederholmanager, damit du deinen Wortschatz festigen und ausbauen kannst.',
            },
            {
              text: '2. Mondly: Sprachen lernen in einer neuen Dimension. „Mondly bringt Sie schneller dazu, eine Sprache zu erlernen.“ – das verspricht die App auf ihrer Internetseite. Spielerisch kannst du jeden Tag mit neuen Lektionen zum Lese- und Hörverstehen lernen. Auch Sprechübungen gehören dazu, sogar mit einem virtuellen Sprachassistenten, der durch Augmented Reality bei dir zuhause erscheinen kann. Die App ermöglicht dir auch noch eine andere, ganz neue Lerndimension: die virtuelle Realität (VR). Mithilfe einer VR-Brille wird dein Wohnzimmer zum Beispiel zu einem spanischen Restaurant oder einem griechischen Hotel. Du redest mit dem Personal und bekommst sofort eine Reaktion. So entstehen realistische Dialoge und eine authentische Gesprächssituation.',
            },
            {
              text: '3. Gymglish: Business-Englisch mit Fun-Faktor. Gymglish ist alles andere als ein langweiliger Vokabel-Karteikasten. Hier bekommst du auf dein individuelles Sprachniveau angepasste Aufgaben mit aktuellen Inhalten. Witzige Kurzgeschichten mit authentischem kulturellem Bezug helfen dir, in die Sprache einzutauchen. Trotzdem dauert keine Übung länger als 10 Minuten – perfekt für Zwischendurch. Du kannst in kurzen Übungen deine Sprachkenntnisse verbessern und dabei Spaß haben. Das alles bietet die App: Aufgaben an Sprachniveau und Interessen angepasst, Einstufungstest und Zertifikat, Alltagssituationen mit coolen Illustrationen.',
            },
            {
              text: '4. Lingoda: Live-Unterricht. Lingoda bietet ein virtuelles Klassenzimmer. In einer Gruppen- oder Privatstunde stehen Lehrer per Videokonferenz zur Verfügung, die Muttersprachler in der jeweiligen Sprache sind. Termine gibt es rund um die Uhr, du kannst dir einfach einen Wochentag und die passende Uhrzeit aussuchen und dir so deinen eigenen Stundenplan erstellen. Zusätzlich gibt es online noch Lernmaterialien zum Herunterladen.',
            },
            { text: 'Bei dieser App …' },
          ],
          options: apps,
          examples: [{ id: '0', type: 'mcq', stem: 'kann man 13 Sprachen lernen.', answer: '1' }],
          items: [
            { id: '21', type: 'mcq', stem: 'bekommt man Lernstoff, der zum eigenen Wissen passt.', answer: '3' },
            { id: '19', type: 'mcq', stem: 'bekommt man täglich neuen Lernstoff.', answer: '2' },
            { id: '24', type: 'mcq', stem: 'kann man an einem Video-Unterricht mit Lehrern teilnehmen.', answer: '4' },
            { id: '18', type: 'mcq', stem: 'kann man auch die Aussprache üben.', answer: '1' },
            { id: '20', type: 'mcq', stem: 'kann man auch mithilfe der Virtuellen Realität Gesprächssituationen üben.', answer: '2' },
            { id: '17', type: 'mcq', stem: 'kann man auch nicht-europäische Sprachen lernen.', answer: '1' },
            { id: '25', type: 'mcq', stem: 'kann man die Fremdsprache auch gemeinsam mit anderen lernen.', answer: '4' },
            { id: '23', type: 'mcq', stem: 'kann man sich Aufgaben je nach persönlichem Interesse auswählen.', answer: '3' },
            { id: '22', type: 'mcq', stem: 'lernt man Englisch nur mit kurzen Übungsaufgaben.', answer: '3' },
          ],
        },
      ],
    },
    {
      id: 'II',
      kind: 'language-use',
      titleHu: 'II. Nyelvhelyesség',
      timeLimitMin: 30,
      // útmutató: feladatpont 0–23 → vizsgapont
      conversion: [0, 1, 2, 2, 3, 4, 5, 5, 6, 7, 8, 9, 9, 10, 11, 12, 13, 13, 14, 15, 16, 16, 17, 18],
      tasks: [
        {
          id: 'II-1',
          label: '1.',
          instructions: 'Was passt in den Text? Unterstreichen Sie das richtige Wort. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'Führungen {{0}} blinde Menschen' },
            {
              text: 'Museen sollen für alle Menschen {{1}} Orte sein. Die Menschen können dort viele spannende Sachen sehen und viele neue Sachen lernen. Für blinde Menschen sind Museen oft nicht so spannend. {{2}} sie können Bilder, Fotos oder Figuren nicht sehen oder Filme nur hören.',
            },
            {
              text: 'Wie können blinde Menschen im Museum dann etwas lernen? Oder wie können sie sich über {{3}} tollen Fotos freuen? Dafür hat das Museum für Bildende Künste jetzt ein {{4}} Angebot. Dort gibt es „Tandem-Führungen“ für blinde Menschen. Das bedeutet: Ein blinder Mensch und ein sehender Mensch gehen gemeinsam {{5}} das Museum. Der sehende Mensch erzählt dem {{6}} Menschen ganz genau, was auf einem Bild zu sehen ist, wie eine Figur aussieht oder was in einem Film gerade passiert. Und sie sprechen über die Kunstwerke.',
            },
            {
              text: 'Die Führung für blinde Menschen dauert 90 Minuten. Das ist gerade Zeit genug, {{7}} blinde Menschen zwei Bilder auf ihre Art sehen können. Das bedeutet: Der blinde Mensch kann vielleicht Bilder in seinem Kopf sehen. Er kann sich {{8}}, wie das Bild aussieht.',
            },
          ],
          examples: gapMcqs(0, [['an', 'für', 'mit', 'um']], 'B'),
          items: gapMcqs(
            1,
            [
              ['besondere', 'besonderen', 'besonderer', 'besonderes'],
              ['Da', 'Dann', 'Denn', 'Deshalb'],
              ['Ø', 'das', 'den', 'die'],
              ['neu', 'neue', 'neuen', 'neues'],
              ['an', 'durch', 'nach', 'zu'],
              ['blind', 'blinde', 'blindem', 'blinden'],
              ['als', 'damit', 'um', 'wie'],
              ['aufstellen', 'einstellen', 'umstellen', 'vorstellen'],
            ],
            'A C D D B D B D',
          ),
        },
        {
          id: 'II-2',
          label: '2.',
          instructions:
            'Was passt in den Text? Schreiben Sie den entsprechenden Buchstaben in die Rubrik. Achtung! Es gibt sechs Buchstaben zu viel. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'Woher kommt die Schokolade?' },
            { text: 'Magst du Schokolade? Ja? So geht es {{0}} meisten Kindern – und auch vielen Erwachsenen. Doch woher kommt Schokolade eigentlich?' },
            {
              text: 'Schokolade {{9}} aus Kakao gemacht. Die Entdecker {{10}} Kakaos waren die Olmeken, ein Volk aus Mittelamerika. Sie fanden vor über 3000 Jahren {{11}}, wie man aus den Kakaobohnen Kakao herstellt.',
            },
            {
              text: 'Anderen Völkern schmeckte der Kakao ebenfalls. Die Maya und die Azteken verarbeiteten die Bohnen zu einem Pulver. Dann mischten sie das Pulver {{12}} heißem oder kaltem Wasser, denn Kuhmilch kannten sie nicht. Am Schluss würzten sie das Getränk mit Pfeffer, Chili, Vanille oder Honig. Das gab richtig viel Energie! Die Azteken nannten {{13}} Lieblingsgetränk „Xocolatl“. Daher stammt unser Wort „Schokolade“!',
            },
            {
              text: '{{14}} 530 Jahren kosteten auch der Seefahrer Kolumbus und seine Männer das köstliche Getränk der Azteken. Sie nahmen die Kakaobohnen mit {{15}} Spanien. Das neue Getränk war bald in ganz Europa beliebt! Es war aber auch sehr teuer: Nur reiche Leute konnten {{16}} die Trinkschokolade leisten.',
            },
          ],
          bank: [
            { key: 'A', text: 'AUF' },
            { key: 'B', text: 'DEM' },
            { key: 'C', text: 'DEN' },
            { key: 'D', text: 'DES' },
            { key: 'E', text: 'HERAUS' },
            { key: 'F', text: 'IHR' },
            { key: 'G', text: 'IHREN' },
            { key: 'H', text: 'INS' },
            { key: 'I', text: 'MIT' },
            { key: 'K', text: 'NACH' },
            { key: 'L', text: 'SEIN' },
            { key: 'M', text: 'SICH' },
            { key: 'N', text: 'VOR' },
            { key: 'O', text: 'WIRD' },
            { key: 'P', text: 'WÜRDE' },
          ],
          unusedBankCount: 6,
          examples: choices(0, 'C'),
          items: choices(9, 'O D E I F N K M'),
        },
        {
          id: 'II-3',
          label: '3.',
          instructions:
            'Was passt in den Text? Schreiben Sie den entsprechenden Buchstaben in die Rubrik. Achtung! Es gibt einen Buchstaben zu viel. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'TikTok-Star Anna Lena Strigl' },
            { text: 'Wir haben ein Interview mit der sympathischen Tirolerin geführt {{0}}.' },
            { text: 'Wie und wann hat alles begonnen?' },
            {
              text: 'Also begonnen hat eigentlich alles, als ich meine Heimat vor drei Jahren zurückgelassen habe {{17}}. Ich hatte den Traum, dort als Schauspielerin zu arbeiten. Ich bemerkte jedoch schnell, dass eine unbekannte Person in Amerika nicht weit kommt. Deshalb habe ich mich viel mit Social Media beschäftigt und damit begonnen, {{18}}.',
            },
            { text: 'Wie lange brauchst du für ein perfektes TikTok-Video und ist es für dich schwierig, eine neue Idee zu finden?' },
            {
              text: 'Für ein gutes Video braucht es oft schon einen kompletten Tag. Selbstverständlich hängt das davon ab, {{19}}. Lustigerweise ist es für mich ganz einfach, neue Ideen für meine Videos zu finden. Oft liege ich abends im Bett und plötzlich fallen mir tausende Ideen ein, {{20}}.',
            },
            { text: 'Was möchtest du noch erreichen?' },
            { text: 'Ich bin jetzt erstmal froh, {{21}}. In Zukunft kann ich mir gut vorstellen, in der Kommunikationsbranche zu arbeiten.' },
            { text: 'Was machst du gegen Alltagsstress?' },
            {
              text: 'Auch wenn meine Freunde mich oft dafür hassen – ich schalte mein Handy für einen gewissen Zeitraum immer komplett ab {{22}}. Da ich ja ständig in der Online-Welt aktiv bin, {{23}}, das Ganze wegzulegen und einfach mal meine Zeit in der Natur und mit meiner Familie zu genießen.',
            },
          ],
          bank: [
            { key: 'A', text: 'die ich dann tagsüber versuche umzusetzen' },
            { key: 'B', text: 'dass ich im Januar mein Studium in Wirtschaft und Management abschließen konnte' },
            { key: 'C', text: 'meine ersten TikTok-Videos zu drehen' },
            { key: 'D', text: 'tut es auch manchmal gut' },
            { key: 'E', text: 'und einfach ganz allein nach Amerika geflogen bin' },
            { key: 'F', text: 'und lege es weit weg' },
            { key: 'G', text: 'und sie zu ihrem Leben als Social-Media-Star befragt' },
            { key: 'H', text: 'war das ein wunderbares Erlebnis' },
            { key: 'I', text: 'welche Art von Video man machen möchte' },
          ],
          unusedBankCount: 1,
          examples: choices(0, 'G'),
          items: choices(17, 'E C I A B F D'),
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
        storagePath: 'erettsegi-de-kozep-2024-majus.mp3',
        durationSec: 1800,
        // Task starts: the ~60 s reading pause of each task found by silence detection, minus the length of its announcement (approximate, ±10 s).
        taskMarkers: [
          { taskId: 'III-1', startSec: 77 },
          { taskId: 'III-2', startSec: 648 },
          { taskId: 'III-3', startSec: 1286 },
        ],
      },
      // útmutató: feladatpont 0–21 → vizsgapont
      conversion: [0, 2, 3, 5, 6, 8, 9, 11, 13, 14, 16, 17, 19, 20, 22, 24, 25, 27, 28, 30, 31, 33],
      transcripts: [
        {
          taskId: 'III-1',
          title: 'Franziska läuft von Wien nach Istanbul',
          paragraphs: [
            'In vier Monaten acht Länder durchlaufen – angefangen in Österreich, dann durch die Slowakei, Ungarn, Kroatien, Serbien, Rumänien, Bulgarien und Griechenland bis schließlich in die Türkei – 2400 Kilometer sind das. Also ein langer Marsch. Franziska Niehus braucht dafür 115 Tage.',
            'Ein bisschen bekommt man ein Bild über ihre Tour von Österreich bis in die Türkei, denn Franziska stellt viele kleine Videos von ihrer Tour in soziale Medien. Man sieht eine junge Frau mit langen, blonden Haaren voller Energie. Franziska sagt aber auch, dass es öfter Momente gab, wo sie wirklich aufgeben wollte. Sie hat zum Beispiel ihre Mutter angerufen und gesagt, „Mama, ich will nach Hause kommen. Ich schaff‘ das hier nicht.“ Aber ihre Mutter hat gesagt, „Nein, du schaffst das. Du machst weiter. Ich bin stolz auf dich. Wir sehen uns dann in Istanbul.“ Später unterstützt die Mutter ihre Tochter und läuft selbst auch ein paar Tage mit.',
            'Für Franziska ist das eine große Hilfe, denn gerade an den wenigen Tagen mit den kritischsten Momenten ist jemand bei ihr. „In Bulgarien, zum Beispiel, war in den Bergen ziemlich viel Schnee.“ Man konnte kaum weiterlaufen und im Schnee waren sogar Bären-Fußstapfen. Manchmal traf Franziska auch komische Menschen. Da hatte sie richtig Angst. Zum Glück ist aber nichts passiert. Im Gegenteil, Franziska nimmt vor allem Positives von ihrem Weg mit: die Anerkennung, die Neugier von anderen Menschen oder die Hilfe einer Freundin, die extra nach Ungarn fliegt, um ein paar Tage mitzugehen. In solchen Momenten hat Franziska dann gedacht, okay, es ist es wert. „Ich schaffe das und am Ende wird sich das alles lohnen.“ Denn Franziska will mit ihrem Lauf Menschen helfen, die nach der Erdbebenkatastrophe in der Türkei in Not sind. Für sie sammelt Franziska Geld und macht im Internet dafür Werbung. Hier können alle ihren Lauf verfolgen und spenden. Jeweils nach 500 Kilometern schickt sie das bis dahin eingegangene Geld an ein Hilfsprojekt. Zusammengekommen sind schon rund 23.000 Euro und vielleicht wird es noch ein bisschen mehr. „Also auf jeden Fall habe ich geplant, eine Dokumentation darüber fertigzustellen, und schreibe zurzeit auch ein Buch darüber.“ Und das wird nicht das Letzte sein, was ihr einfällt. Schließlich wird Franziska dieses Jahr erst 30.',
          ],
        },
        {
          taskId: 'III-2',
          title: 'Verkehrsampeln mit künstlicher Intelligenz (KI)',
          paragraphs: [
            'Ganz schön viel Verkehr, vor allem morgens! Und man selbst steht bei Rot am Fußgängerüberweg und bekommt viel schlechte Luft ab. Genau das soll anders werden. Normale Ampeln schalten mehr oder weniger immer gleich lang auf Grün oder Rot. Auch wenn da vielleicht gerade gar keine Autos sind und Fußgänger eigentlich über die Straße gehen könnten. In der Stadt Hamm steht jetzt eine Ampel, die mit künstlicher Intelligenz, also mit KI funktioniert. Die KI-Ampel denkt mit. Sie denkt vor allem an die Fußgänger und Radfahrer, damit sie möglichst wenig warten müssen und schnell ein grünes Signal bekommen. An der Kreuzung gibt es mehrere Kameras. Die haben alles im Blick. Wenn zum Beispiel ein Radfahrer noch 70 Meter von der Ampel entfernt ist, kann die KI ausrechnen, wann er etwa an der Ampel ankommen wird. Auch Fußgänger werden automatisch erkannt und müssen nicht mehr zuerst den Knopf drücken, damit die Ampel irgendwann auf Grün schaltet.',
            'Aber warum hat eine Ampel eigentlich die Farben Rot, Gelb und Grün? Rot und Grün sind die beiden Signalfarben, auf die unser Auge am stärksten reagiert und die es am besten unterscheiden kann. Gelb kam bei der Ampel erst später dazu.',
            'Praktischerweise erkennt die KI auch, wie viele Fußgänger an der Ampel stehen. Wenn es sehr viele sind, dann verlängert sie die Grünphase automatisch auf bis zu 40 Sekunden.',
            'Die Ampel in Hamm gehörte zu den ersten Ampeln in Deutschland, bei denen künstliche Intelligenz alles regelt. Die Stadt probiert das System erstmal aus. Ob es für immer da bleiben wird, steht also noch nicht fest. Die Chancen sind aber ganz gut. Die nächste KI-Ampel ist schon geplant. Sie wird vor einer Schule stehen. Dort sind bisher auf einem Zebrastreifen viele Unfälle passiert. Der Zebrastreifen soll nun im Herbst verschwinden und dafür kommt die KI-Ampel. Diese Ampel wird auch anzeigen, wie viele Sekunden es noch rot ist. Außerdem ist eine App nur für Schülerinnen und Schüler geplant. Wenn jemand die App auf dem Handy hat und sich dem Fußgängerüberweg nähert, erkennt das die KI-Ampel und schaltet sofort auf Grün. Die Kosten für die erste KI-Ampel in Hamm lagen bei 80000 Euro. Das Geld kam aus dem Haushalt der Stadt.',
          ],
        },
        {
          taskId: 'III-3',
          title: 'Feldhockey',
          paragraphs: [
            'Wir sind zum Uhlenhorster Hockey-Club gefahren, um den Hockeytrainer Claas Henkel zu interviewen.',
            '- Claas, wie bist du eigentlich zum Hockey gekommen?',
            '- Ich habe, als ich noch ganz klein war, mit meinen Eltern direkt neben dem Hockeyplatz gewohnt, und da sind wir automatisch in Kontakt geraten. Alle meine Freunde und ich haben nach einer Zeit in diesem Klub begonnen, Hockey zu spielen. Wir waren vier oder fünf Jahre alt. Seitdem bin ich beim Hockey. Mit sechzehn habe ich angefangen, unseren Trainern zu helfen, und dann bin ich irgendwie Trainer geworden.',
            '- Was findest du so besonders am Hockey?',
            '- Ich finde schön, dass Hockey erstmal ein Mannschaftssport ist. Dann finde ich noch gut, dass es etwas mit Schläger und Ball ist, weil das echt Spaß macht. Und ich finde noch gut, dass dieser Sport sowohl für Jungen als auch für Mädchen ist. Wir haben nämlich im Hockeyverein Jungs- und Mädchenmannschaften. Das ist auch nicht in allen Sportarten so.',
            '- Was macht deiner Meinung nach Hockey zu einem beliebten Sport?',
            '- Hockeyklubs haben meistens sehr schöne Anlagen und oft spielt da die ganze Familie. Deshalb glaube ich, die meisten mögen Hockey, weil das ein Familiensport ist.',
            '- Wie viele Menschen spielen Hockey?',
            '- In der Welt weiß ich es nicht genau. In Deutschland spielen circa 80.000 Menschen Hockey. In Holland, unserem Nachbarland, einer ganz großen Hockeynation, sind es aber fast 400.000.',
            '- Wen trainierst du?',
            '- Ich trainiere die beiden Top-Mannschaften bei den Erwachsenen, also die beiden Bundesligateams. Und das ist eine ganz schöne, eine anspruchsvolle Arbeit, weil wir gute Spieler und Spielerinnen in den beiden Mannschaften haben, und die haben ziemlich hohe Ansprüche an die Trainer, sie wollen viel erreichen.',
            '- Was hast du schon als Trainer erlebt und welche Erfolge hast du erreicht?',
            '- Oh, erlebt habe ich so viel, dass ich das gar nicht so schnell erzählen kann. Ich habe viele Orte gesehen und viele Menschen kennengelernt. Und erreicht haben wir mit dem Hockey ganz vieles, einige deutsche Meisterschaften mit dem Damenteam hier und auch ein paar Europacup-Titel.',
          ],
        },
      ],
      tasks: [
        {
          id: 'III-1',
          label: '1.',
          instructions:
            'Sie hören einen Text über eine deutsche Reisebloggerin. Lesen Sie zuerst die Aufgabe. Sie hören dann den Text zweimal. Zuerst hören Sie den ganzen Text ohne Pausen, dann in kürzeren Abschnitten. Entscheiden Sie, welche Aussage richtig (R) und welche falsch (F) ist. Kreuzen Sie die Antwort beim Hören an. (0) ist ein Beispiel für Sie.',
          passage: [{ style: 'title', text: 'Franziska läuft von Wien nach Istanbul' }],
          booleanLabels: ['R', 'F'],
          examples: rf(0, ['Franziskas Tour nach Istanbul dauerte mehr als 100 Tage.'], 'R'),
          items: rf(
            1,
            [
              'Franziskas Freund zeigte in den sozialen Netzwerken Videos von ihrem Weg.',
              'Franziska wollte unterwegs manchmal aufgeben.',
              'Franziskas Mutter lief einige Tage mit ihrer Tochter mit.',
              'Auf dem langen Weg ist Franziska nichts Schlimmes passiert.',
              'Viele Freunde begleiteten Franziska in Ungarn.',
              'Franziska sammelte Lebensmittel und Kleidung für türkische Menschen in Not.',
              'Franziska schreibt bereits an einem Buch über ihre Tour.',
            ],
            'F R R R F F R',
          ),
        },
        {
          id: 'III-2',
          label: '2.',
          instructions:
            'Sie hören einen Text über eine neue Verkehrsampel. Lesen Sie zuerst die Aufgabe. Sie hören dann den Text zweimal. Zuerst hören Sie den ganzen Text ohne Pausen, dann in kürzeren Abschnitten. Ergänzen Sie die Sätze beim Hören. Schreiben Sie in jede Lücke nur eine Information. (0) ist ein Beispiel für Sie.',
          passage: [{ style: 'title', text: 'Verkehrsampeln mit künstlicher Intelligenz (KI)' }, { style: 'note', text: '*KI: künstliche Intelligenz' }],
          examples: [
            {
              id: '0',
              type: 'short-text',
              prompt: 'Normale Ampeln schalten gewöhnlich ________ auf Grün oder Rot.',
              answer: { accepted: ['gleich lang'], match: 'exact-ci' },
            },
          ],
          items: [
            {
              id: '8',
              type: 'short-text',
              prompt: 'An der KI*-Ampel in der Stadt Hamm müssen ________ weniger warten.',
              answer: { accepted: ['Fußgänger', 'Radfahrer'], match: 'keywords', keywords: [['fußgänger', 'radfahrer']] },
            },
            {
              id: '9',
              type: 'short-text',
              prompt: 'Die KI-Ampel an der Kreuzung funktioniert mit ________ .',
              answer: { accepted: ['(mehreren) Kameras'], match: 'keywords', keywords: [['kamera']] },
            },
            {
              id: '10',
              type: 'short-text',
              prompt: 'Die Farben Rot und Grün kann man am besten ________ .',
              answer: { accepted: ['unterscheiden', 'erkennen', 'sehen'], match: 'keywords', keywords: [['unterscheid', 'erkenn', 'seh']] },
            },
            {
              id: '11',
              type: 'short-text',
              prompt: 'Wenn sehr viele Fußgänger über die Straße gehen wollen, zeigt die KI-Ampel ________ Sekunden lang Grün.',
              answer: { accepted: ['(bis zu) 40'], match: 'keywords', keywords: [['40']] },
            },
            {
              id: '12',
              type: 'short-text',
              prompt: 'Die nächste KI-Ampel in Hamm wird ________ stehen.',
              answer: { accepted: ['vor einer Schule'], match: 'keywords', keywords: [['schule']] },
            },
            {
              id: '13',
              type: 'short-text',
              prompt: 'Man plant auch eine App nur für ________ .',
              answer: { accepted: ['(Schülerinnen und) Schüler'], match: 'keywords', keywords: [['schüler']] },
            },
            {
              id: '14',
              type: 'short-text',
              prompt: 'Wenn sich jemand dem Fußgängerüberweg nähert und die KI-Ampel die Handy-App erkennt, ________ .',
              answer: { accepted: ['schaltet sie (sofort) auf Grün', 'zeigt sie (sofort) Grün'], match: 'keywords', keywords: [['grün', 'gruen']] },
            },
          ],
        },
        {
          id: 'III-3',
          label: '3.',
          instructions:
            'Sie hören ein Interview mit dem Hockeytrainer Claas Henkel. Lesen Sie zuerst die Aufgabe. Sie hören dann den Text zweimal. Zuerst hören Sie den ganzen Text ohne Pausen, dann in kürzeren Abschnitten. Entscheiden Sie, was in den Aussagen in der linken Spalte falsch ist. Unterstreichen Sie beim Hören diese falschen Informationen. Die falschen Informationen können sowohl einzelne Wörter als auch Satzteile sein. Korrigieren Sie die falschen Informationen und schreiben Sie Ihre Lösung in die rechte Spalte. (01) und (02) sind Beispiele für Sie.',
          passage: [{ style: 'title', text: 'Feldhockey' }],
          examples: [
            {
              id: '01',
              type: 'correction',
              statement: 'Das Interview wurde mit dem Hockeyspieler Claas Henkel gemacht.',
              answer: { accepted: ['Hockeytrainer'], match: 'exact-ci' },
            },
            {
              id: '02',
              type: 'correction',
              statement: 'Claas hat mit seinen Eltern angefangen, Hockey zu spielen.',
              answer: { accepted: ['mit seinen Freunden'], match: 'exact-ci' },
            },
          ],
          items: [
            {
              id: '15',
              type: 'correction',
              statement: 'Claas war sechzehn, als er begonnen hat, Hockey zu spielen.',
              answer: { accepted: ['vier oder fünf', 'den Trainern zu helfen'], match: 'keywords', keywords: [['vier', 'fünf', 'trainer', 'helfen']] },
            },
            {
              id: '16',
              type: 'correction',
              statement: 'Claas wünscht sich, dass es im Hockeyverein sowohl Jungs- als auch Mädchenmannschaften gibt.',
              answer: { accepted: ['findet (es) gut/schön', 'freut sich'], match: 'keywords', keywords: [['find', 'freu', 'gut', 'schön']] },
            },
            {
              id: '17',
              type: 'correction',
              statement: 'Viele mögen Hockey, weil es ein technischer Sport ist.',
              answer: { accepted: ['Familiensport'], match: 'keywords', keywords: [['familie']] },
            },
            {
              id: '18',
              type: 'correction',
              statement: 'In Deutschland spielen circa 400.000 Menschen Hockey.',
              answer: { accepted: ['80.000', 'Holland'], match: 'keywords', keywords: [['80', 'holland']] },
            },
            {
              id: '19',
              type: 'correction',
              statement: 'Claas trainiert Jugendteams.',
              answer: { accepted: ['Erwachsene', 'die Bundesligateams', 'die Top-Mannschaften'], match: 'keywords', keywords: [['erwachsen', 'bundesliga', 'top']] },
            },
            {
              id: '20',
              type: 'correction',
              statement: 'Als Trainer hat Claas viele Techniken kennengelernt.',
              answer: { accepted: ['Menschen', 'Orte'], match: 'keywords', keywords: [['mensch', 'ort']] },
            },
            {
              id: '21',
              type: 'correction',
              statement: 'Claas ist mit dem Herrenteam ein paar Male deutscher Meister geworden.',
              answer: { accepted: ['Damenteam'], match: 'keywords', keywords: [['dame']] },
            },
          ],
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
          title: 'Kochkurs für Jugendliche',
          instructions:
            'Sie studieren in Köln und möchten besser kochen lernen. Sie haben im Internet nach Kochkursen für Jugendliche gesucht und dazu die folgende Anzeige gefunden:',
          passage: [
            { style: 'title', text: 'Teenager am Herd' },
            {
              text: 'Am Herd fühlst du dich schon sicher und das eine oder andere Gericht hast du auch schon einmal auf den Tisch gebracht. Du suchst Inspirationen für etwas Neues und möchtest dich jetzt auch an etwas raffinierteren Rezepten ausprobieren? Wir lernen zusammen ungewöhnliche Zutaten und Gerichte kennen und kochen uns quer durch die Küchen der Welt. Natürlich gibt es alle Rezepte zum Mitnehmen, so dass einer Wiederholung in der heimischen Küche nichts im Weg steht.',
            },
            { text: 'Kontakt: Kinderkochschule Küchenpänz Andrea Smolka E-Mail: andrea@kuechenpaenz.de' },
          ],
          items: [
            {
              id: '1',
              type: 'production',
              prompt: ['Schreiben Sie eine E-Mail an die Veranstalterin und informieren Sie sich über den Kurs. Gehen Sie dabei auf die folgenden Punkte ein:'],
              contentPoints: [
                'Grund des Schreibens.',
                'Fragen Sie nach Bedingungen (z. B. Kosten, Termine der Kurse, Kurstypen).',
                'Schreiben Sie über das eigene Können und Ihre Erfahrungen mit dem Kochen.',
              ],
              promptAfter: ['Die Reihenfolge der Leitpunkte können Sie selbst bestimmen. Verwenden Sie für Ihren Text 80-100 Wörter.'],
              minWords: 80,
              maxWords: 100,
              opening: 'Sehr geehrte Frau Smolka,',
              register: 'formal-email',
              rubricId: 'erettsegi-kozep-1',
              criteria: DE_CRITERIA_1,
            },
          ],
        },
        {
          id: 'IV-2',
          label: '2.',
          title: 'Urlaub mit oder ohne Eltern?',
          instructions: 'Sie haben eine E-Mail von Ihrem deutschen Freund bekommen. Hier sind einige Auszüge daraus:',
          passage: [
            {
              text: 'Unsere Klasse hat einen Workshop zum Thema „Urlaub mit oder ohne Eltern“ durchgeführt. Gerade im Sommer wollen Teenager die Urlaubszeit alleine genießen. Endlich einmal ohne die Eltern in den Urlaub fahren und richtig viel Spaß erleben. Doch nicht immer ist ein Urlaub ohne Erwachsene lustig. Wir haben uns in Gruppen darüber Gedanken gemacht. Was meinst du dazu? Welche Vor- und Nachteile hat Urlaub mit oder ohne Eltern?',
            },
          ],
          items: [
            {
              id: '2',
              type: 'production',
              prompt: ['Antworten Sie Ihrem Freund in einer E-Mail. Gehen Sie dabei auf die folgenden Punkte ein:'],
              contentPoints: [
                'Warum halten Sie das Thema für (nicht) aktuell?',
                'Was sind die Vorteile eines Urlaubs ohne Eltern?',
                'Was macht einen Familienurlaub für Jugendliche attraktiv?',
                'Welche Wünsche haben Sie für Ihren nächsten Sommerurlaub?',
              ],
              promptAfter: ['Die Reihenfolge der Leitpunkte können Sie selbst bestimmen. Verwenden Sie für Ihren Text 100-120 Wörter.'],
              minWords: 100,
              maxWords: 120,
              opening: 'Hallo Jonas,',
              register: 'informal-message',
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
