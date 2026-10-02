// Német nyelv, középszintű írásbeli érettségi, 2025. október 20. (K2511), Oktatási Hivatal.
// Transcribed verbatim from the feladatlap and its javítási-értékelési útmutató (answer key,
// conversion tables, listening transcripts). Decorative photos are left out.
import type { ExamPaper } from '../types'
import { choices, DE_CRITERIA_1, DE_CRITERIA_2, DE_LISTENING_INTRO, DE_NOTICES_HU, DE_WRITING_INTRO, rf, words } from './deKozep.ts'
import { questions } from './enKozep.ts'

const markets = [
  { key: '1', text: 'Karmelitermarkt' },
  { key: '2', text: 'Volkertmarkt' },
  { key: '3', text: 'Rochusmarkt' },
  { key: '4', text: 'Naschmarkt' },
  { key: '5', text: 'Viktor-Adler-Markt' },
  { key: '6', text: 'Meiselmarkt' },
  { key: '7', text: 'Kutschkermarkt' },
  { key: '8', text: 'Johann-Nepomuk-Vogl-Markt' },
  { key: '9', text: 'Floridsdorfer Markt' },
]

const without = (...keys: string[]) => markets.filter((m) => !keys.includes(m.key))

const paper: ExamPaper = {
  id: 'erettsegi-de-kozep-2025-oktober',
  type: 'erettsegi',
  language: 'de',
  level: 'kozep',
  sittingLabelHu: '2025. október',
  source: 'Oktatási Hivatal: Német nyelv, középszintű írásbeli vizsga, 2025. október 20. (K2511) — feladatlap és javítási-értékelési útmutató.',
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
            'Sie lesen jetzt ein Interview mit Max Haase. Lesen Sie zuerst die Antworten des Interviews und suchen Sie dann die passende Frage. Achtung! Es gibt eine Frage zu viel. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: '„Influencer sein ist ein Vollzeitjob“' },
            { text: 'Max Haase erreicht mit seinen Reiseberichten 3,9 Millionen Follower bei Instagram.' },
            {
              text: '{{0}} Das war reiner Zufall. Während meines Studiums bin ich nach Australien gereist und habe meine Erlebnisse für meine Familie auf Instagram geteilt. Plötzlich folgten mir immer mehr Menschen. Und weil ich beim Reisen so viel Spaß hatte, habe ich weitergemacht.',
            },
            { text: '{{1}} Ich glaube, mittlerweile sind es 68. Ich hatte früher das Ziel, jedes Land auf der Welt zu bereisen. Das wären etwa 200 Länder.' },
            { text: '{{2}} Das ist eine schwierige Frage. Ich habe Australien sehr gemocht. Vor allem wegen der vielfältigen Natur.' },
            {
              text: '{{3}} Definitiv in Ländern wie Thailand oder Indonesien. Die Menschen dort sind sehr hilfsbereit. Ich habe in Thailand einmal einen Mann nach dem Weg gefragt, weil ich mich verlaufen hatte, und er hat mich durch die halbe Stadt begleitet, damit ich sicher ankomme.',
            },
            { text: '{{4}} Ich bekomme Aufträge von Reisebüros. Außerdem bewerbe ich verschiedene Produkte auf meinem Account.' },
            {
              text: '{{5}} Influencer zu sein, ist ein Vollzeitjob. Ich arbeite manchmal von sechs Uhr morgens bis spät in der Nacht. Neben den Reiseaktivitäten muss ich auch Bilder und Videos bearbeiten, E-Mails beantworten, meinen Followern schreiben und meine Reisen planen.',
            },
            {
              text: '{{6}} Klar. Teilweise probiere ich es schon. Ich reise zum Beispiel oft mit einem Campingbus oder einem Segelboot und versuche, Strom zu sparen. Solche Erfahrungen teile ich auf meinem Account und probiere so, über umweltfreundlichere Reisemöglichkeiten aufzuklären.',
            },
            {
              text: '{{7}} Am Anfang konnte sie sich nichts darunter vorstellen. Gerade meine Oma wusste überhaupt nicht, was ich mache. Seit ich ihr einen eigenen Instagram-Account eingerichtet habe, ist sie aber mein größter Fan.',
            },
          ],
          bankTitle: 'FRAGEN',
          bank: [
            { key: 'A', text: 'Denkst du als Influencer manchmal darüber nach, dass du deinen Einfluss für den Umweltschutz nutzen könntest?' },
            { key: 'B', text: 'In wie vielen Ländern warst du schon?' },
            { key: 'C', text: 'Wie wurdest du Reise-Influencer?' },
            { key: 'D', text: 'Kannst du sagen, wo die Menschen am freundlichsten sind?' },
            { key: 'E', text: 'Viele Leute denken, dass Influencer wenig arbeiten und trotzdem viel Geld verdienen. Was sagst du dazu?' },
            { key: 'F', text: 'Was sagt deine Familie zu deinem Beruf?' },
            { key: 'G', text: 'Was war deine schlimmste Erfahrung?' },
            { key: 'H', text: 'Wie finanzierst du deine Reisen?' },
            { key: 'I', text: 'Wo hat es dir am besten gefallen?' },
          ],
          unusedBankCount: 1,
          examples: choices(0, 'C'),
          items: choices(1, 'B I D H E A F'),
        },
        {
          id: 'I-2',
          label: '2.',
          instructions:
            'Lesen Sie den Text über eine besondere Aktion der Wiener Märkte. Entscheiden Sie, welche Aussage zu welchem Markt passt, und kreuzen Sie diese in der Tabelle an. Achtung! Sie dürfen insgesamt 10-mal ankreuzen. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'Lange Nacht der Wiener Märkte' },
            {
              text: 'Nach dem riesigen Erfolg des Vorjahres mit über 160.000 Besuchern wird es bei der „Langen Nacht der Wiener Märkte“ auch dieses Jahr neben den gewohnten Köstlichkeiten ein buntes Programm für die ganze Familie geben.',
            },
            { text: 'Hier ist ein Auszug aus dem bunten Angebot der teilnehmenden Märkte in ganz Wien:' },
            {
              text: '1. Karmelitermarkt: Von 18 bis 19 Uhr erwartet das Kindertheater Papperlapapp die kleinen Marktgäste zum Mitmachen. Das normale Marktangebot wird um einen Kunsthandwerksmarkt und einen Kinderflohmarkt erweitert.',
            },
            {
              text: '2. Volkertmarkt: Schachspieler sind hier ab 18 Uhr für ein großes Schachturnier* willkommen. Schon ab 17.30 Uhr gibt’s Musik: Das Duo Marie Madame und das Duo Mopet werden mit neuen und alten Wiener Liedern für Unterhaltung sorgen.',
            },
            {
              text: '3. Rochusmarkt: Hier startet um 18 Uhr die Band Coverkillers mit altbekannten Schlagern. Tombola und Verlosung von 21.30 bis 22.30 Uhr. Kinderprogramm ab 17 Uhr.',
            },
            {
              text: '4. Naschmarkt: Auf vier Bühnen bietet der Naschmarkt ein spannendes Programm. Blasmusik ist ebenso dabei wie eine Jazzsession und ein Best of Austria. Außerdem gibt es eine Hüpfburg für Kinder, einen Hunde- und Katzenmarkt und einen Afrika-Markt.',
            },
            {
              text: '5. Viktor-Adler-Markt: Von 17 bis 19 Uhr können sich die kleinen Besucher schminken lassen, bevor um 19 Uhr das große Backgammon- und Schachturnier beginnt. Musikalisch gehört der Markt ab 20.30 Uhr Marija Blagojevic.',
            },
            { text: '6. Meiselmarkt: Eine Kindershow mit Slotini eröffnet um 18 Uhr das bunte Programm, gefolgt vom 1. Wiener Zaubertheater.' },
            { text: '7. Kutschkermarkt: Hier steht alles im Zeichen des Tanzens. Von 17.30 bis 22 Uhr begleiten ausgebildete Trainer die Teilnehmer zur Salsa.' },
            {
              text: '8. Johann-Nepomuk-Vogl-Markt: Ab 15 Uhr ist hier das Schminkparadies für Kinder. Ein Hula-Hoop-Workshop mit Lisa Looping lädt zum Mitmachen. Austro Funk mit der Kaisermühlen Electric Band gibt’s ab 21.30 Uhr.',
            },
            {
              text: '9. Floridsdorfer Markt: Hier gibt es deutschsprachige Dialektlieder ebenso wie Wiener Lieder und Schlagerklassiker. Um 17.30 Uhr tritt das Utopia Theater mit dem lustigen Stück „Bezahlt wird nicht“ auf.',
            },
            { style: 'note', text: '* Schachturnier=Schachwettbewerb' },
            { text: 'Auf diesem Markt ...' },
          ],
          rules: { multiSelectPenalty: true },
          items: [
            { id: '14', type: 'multi-select', stem: 'beginnt ein Kinderprogramm um 18 Uhr.', exampleOption: 'Karmelitermarkt', options: without('1'), answer: ['6'], pick: 1 },
            { id: '11', type: 'multi-select', stem: 'kann man auch Tiere kaufen.', options: markets, answer: ['4'], pick: 1 },
            { id: '15', type: 'multi-select', stem: 'kann man sogar Tanzschritte üben.', options: markets, answer: ['7'], pick: 1 },
            { id: '17', type: 'multi-select', stem: 'gibt es eine humorvolle Theateraufführung.', options: markets, answer: ['9'], pick: 1 },
            { id: '12/16', type: 'multi-select', stem: 'werden für Kinder Gesichtsbemalungen angeboten.', options: markets, answer: ['5', '8'], pick: 2 },
            { id: '8', type: 'multi-select', stem: 'werden die Kinder zum Mitmachen beim Theaterspiel eingeladen.', options: markets, answer: ['1'], pick: 1 },
            { id: '10', type: 'multi-select', stem: 'gibt es auch Gewinnspiele.', options: markets, answer: ['3'], pick: 1 },
            { id: '9/13', type: 'multi-select', stem: 'kann man an einem Brettspielwettbewerb teilnehmen.', options: markets, answer: ['2', '5'], pick: 2 },
          ],
        },
        {
          id: 'I-3',
          label: '3.',
          instructions:
            'Welcher Satz passt in den Text? Tragen Sie den entsprechenden Buchstaben in die Rubrik ein. Achtung! Es gibt einen Buchstaben zu viel. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'Leben im Mehrgenerationenhaus' },
            { text: 'Helena lebt mit ihrer Familie in einem großen Landhof in Nordrhein-Westfalen in einem »Mehrgenerationenhaus«. {{0}}' },
            {
              text: 'Helena erzählt: „Mein Zuhause liegt mitten in einem Naturschutzgebiet, das zu Düsseldorf gehört. Ich wohne aber nicht nur mit meinen Eltern und meinen Geschwistern dort. {{18}} Die älteste Bewohnerin ist über 90. {{19}}',
            },
            {
              text: 'Eingezogen bin ich vor sieben Jahren. Vorher habe ich in der Stadt gewohnt. Meine Schwester Mathilda ist sieben und direkt hier aufgewachsen. {{20}} Neben meinen Geschwistern und mir leben auf dem Landhof noch etwa 20 andere Kinder. Das finde ich gut, weil man so immer jemanden hat, mit dem man was machen kann.',
            },
            {
              text: 'In unserer Anlage wohnen aber nicht nur Familien, sondern auch Paare oder einzelne Leute. Meine kleinen Brüder sind zum Beispiel oft bei einer älteren Frau, die allein lebt und sich um meine Brüder kümmert. {{21}} Ich finde sowieso, dass alle alten Leute hier richtig nett sind. Ein Paar hat meiner Freundin und mir früher immer Limonade gegeben, wenn wir den Müll rausgebracht oder die Fenster geputzt haben. Manchmal passe ich auf Kinder auf. Zum Beispiel auf Leo, er ist ein Jahr alt. {{22}} Dafür habe ich zehn Euro bekommen.',
            },
            {
              text: 'Auf unserem Landhof ist immer was los, vor allem samstags. {{23}} Einmal die Woche kocht jemand für alle. Das ist freiwillig, jedes Mal ist eine andere Person dran. Meistens gibt es Speisen, die man leicht für viele Leute zubereiten kann. {{24}} Damit niemand allein spülen muss, bringen alle ihr eigenes Geschirr mit.',
            },
            {
              text: 'Es gibt viele Aktionen für alle Bewohnerinnen und Bewohner. Im Sommer planen immer ein paar Leute ein Open-Air-Kino auf der Wiese. Und auch vor den Feiertagen machen wir meistens etwas zusammen. {{25}} Alle durften einen Wunsch auf eine Kugel schreiben, und jemand anderes hat ihn dann erfüllt. Das fand ich richtig cool.”',
            },
          ],
          bankTitle: 'SÄTZE',
          bank: [
            { key: 'A', text: 'Außerdem habe ich noch zwei Brüder: Frederik und Lennard.' },
            { key: 'B', text: 'Dann essen alle Bewohnerinnen und Bewohner gemeinsam.' },
            { key: 'C', text: 'Das ist darum sehr hilfreich, weil meine Omas und Opas in anderen Städten wohnen.' },
            { key: 'D', text: 'Der jüngste Bewohner ist noch ein Baby.' },
            { key: 'E', text: 'Deshalb kommen oft Nudeln oder Suppe auf die Teller.' },
            { key: 'F', text: 'Ich habe ihm Bücher vorgelesen und mit ihm gespielt.' },
            { key: 'G', text: 'Dort wohnen junge und alte Menschen zusammen und helfen sich gegenseitig im Alltag.' },
            { key: 'H', text: 'Im vergangenen Jahr haben wir vor Weihnachten eine Wunschaktion gemacht.' },
            { key: 'I', text: 'In unserem Mehrgenerationenhaus hat jede Familie ihre eigene Wohnung.' },
            { key: 'K', text: 'Wir teilen uns das große Gebäude mit etwa 100 anderen Leuten.' },
          ],
          unusedBankCount: 1,
          examples: choices(0, 'G'),
          items: choices(18, 'K D A C F B E H'),
        },
      ],
    },
    {
      id: 'II',
      kind: 'language-use',
      titleHu: 'II. Nyelvhelyesség',
      timeLimitMin: 30,
      // útmutató: feladatpont 0–21 → vizsgapont
      conversion: [0, 1, 2, 3, 3, 4, 5, 6, 7, 8, 9, 9, 10, 11, 12, 13, 14, 15, 15, 16, 17, 18],
      tasks: [
        {
          id: 'II-1',
          label: '1.',
          instructions:
            'Was passt in den Text? Schreiben Sie den entsprechenden Buchstaben in die Rubrik. Achtung! Es gibt sechs Buchstaben zu viel. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: '„Ich will das Busfahren cool machen”' },
            { text: 'Ein Interview mit der Chefin des Hamburger Verkehrsverbunds (HVV) Anna-Theresa Korbutt.' },
            { text: 'Dein SPIEGEL: Hamburg will beim öffentlichen Verkehr ein Vorbild für ganz Europa werden. Wie {{0}} das aussehen?' },
            {
              text: 'Korbutt: Es gibt bei uns jetzt schon gute Lösungen. Wir {{1}} zum Beispiel die weltweit erste fahrerlose, digitale S-Bahn in Hamburg getestet. Die fährt automatisch von A nach B. Bis zum Jahr 2030 sollen außerdem alle Einwohner innerhalb von fünf Minuten ein öffentliches Verkehrsmittel erreichen, also einen Bus, oder {{2}} U- oder S-Bahn. Ab dann sollen auch nur noch Elektro-Busse fahren.',
            },
            { text: 'Dein SPIEGEL: Wird {{3}} in der Zukunft auch Busse ohne Fahrer geben?' },
            {
              text: 'Korbutt: Wann genau es so weit sein wird, wissen wir noch nicht. Aber das wird kommen, {{4}} bin ich überzeugt. Nicht weil ich keine Busfahrerinnen und -fahrer mehr haben möchte. Sondern weil wir jetzt schon Probleme haben, Leute {{5}} finden, die diesen Job machen wollen. Manche Strecken sind allerdings so kompliziert, {{6}} da auch in Zukunft eine Person als Begleitung mitfahren wird.',
            },
            { text: 'Dein SPIEGEL: Wie schafft man es, Autofahrer vom Bus- oder U-Bahn-Fahren zu überzeugen?' },
            {
              text: 'Korbutt: Ich will niemanden zum Busfahren zwingen. Wer gerne 50 Minuten {{7}} seinem Auto im Stau steht, soll das machen. Ich nutze meine Zeit lieber anders. Wenn aber ein regelmäßiger Autofahrer {{8}} dafür entscheidet, doch mal einen Bus zu nehmen, soll er denken: Das ist ja bequem, das nutze ich jetzt öfter. Ich will das Busfahren cool machen.',
            },
          ],
          bank: [
            { key: 'A', text: 'DANN' },
            { key: 'B', text: 'DAS' },
            { key: 'C', text: 'DASS' },
            { key: 'D', text: 'DAVON' },
            { key: 'E', text: 'EIN' },
            { key: 'F', text: 'EINE' },
            { key: 'G', text: 'SOLL' },
            { key: 'H', text: 'ES' },
            { key: 'I', text: 'HABEN' },
            { key: 'K', text: 'MIT' },
            { key: 'L', text: 'SICH' },
            { key: 'M', text: 'SIND' },
            { key: 'N', text: 'VON' },
            { key: 'O', text: 'ZU' },
            { key: 'P', text: 'ZUM' },
          ],
          unusedBankCount: 6,
          examples: choices(0, 'G'),
          items: choices(1, 'I F H D O C K L'),
        },
        {
          id: 'II-2',
          label: '2.',
          instructions:
            'Ergänzen Sie den Text. Schreiben Sie die angegebenen Wörter in der richtigen Form in den Text. Achtung! Schreiben Sie in jede Lücke nur ein Wort. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'Das Leben eines Akrobaten' },
            { text: 'Walter Moshammer lebt in Tirol und ist Zirkusakrobat. Die Schülerzeitung LUX hat ihn zu einem Interview {{0}}.' },
            { text: 'LUX: Hallo, Walter! Warum wolltest du Akrobat werden? Und wie {{9}} man das?' },
            {
              text: 'Walter: Ich bin mit 19 Jahren meinen ersten Salto gesprungen und da habe ich {{10}}: Das ist es! Dieses Gefühl war super! Dann habe ich begonnen, mit anderen Artisten auf der Straße Akrobatik zu {{11}}. Irgendwann bin ich in Amerika gelandet und habe dort mit chinesischen Akrobaten {{12}}.',
            },
            { text: 'LUX: Was fasziniert dich am Zirkus?' },
            {
              text: 'Walter: Der Zirkus ist für mich eine eigene Welt, in die man {{13}} kann. Egal, ob ich die Zelte aufbaue, als Küchenchef oder als Akrobat arbeite: Ich bin beim Zirkus. Das ist eine Familie und die {{14}} zusammen. Das ist ganz wichtig.',
            },
            { text: 'LUX: Wie kann man sich das Leben als Akrobat vorstellen?' },
            {
              text: 'Walter: Da gibt es verschiedene Möglichkeiten. Früher habe ich in einem Zirkus gearbeitet und {{15}} immer unterwegs. Heute trete ich meistens bei Festen ohne Zirkuszelt auf. Das bedeutet, dass ich viel {{16}} und viel probe. Denn wir machen für jede Veranstaltung etwas Besonderes.',
            },
          ],
          examples: words(0, [['einladen', 'eingeladen']]),
          items: words(9, [
            ['werden', 'wird'],
            ['wissen', 'gewusst'],
            ['machen', 'machen'],
            ['trainieren', 'trainiert'],
            ['eintreten', 'eintreten'],
            ['halten', 'hält'],
            ['sein', 'war'],
            ['herumfahren', 'herumfahre'],
          ]),
        },
        {
          id: 'II-3',
          label: '3.',
          instructions:
            'Was passt in den Text? Schreiben Sie den entsprechenden Buchstaben in die Rubrik. Achtung! Es gibt einen Buchstaben zu viel. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'Was machen Gamedesigner?' },
            {
              text: 'Gamedesigner sind wahre Superstars der Spielewelt. „Game Design“ ist Englisch und bedeutet „Spiele-Entwicklung“. Gamedesigner denken sich aus, wie Computerspiele aussehen {{0}}. Das Ergebnis ihrer Arbeit erlebst du, {{17}}. Stellt euch vor, ihr könntet als Pilot bei einem tollen Autorennen mitmachen {{18}} – die Gamedesigner machen das möglich! Sie denken spannende Aufgaben aus, {{19}}. Außerdem entscheiden sie, wie die Spielfiguren aussehen. Dies können menschliche Figuren sein, aber auch schreckliche Monster oder magische Figuren wie Drachen und Elfen.',
            },
            {
              text: 'Die Gamedesigner bauen auch ganze Städte oder atemberaubende Landschaften auf, die ihr im Spiel entdecken könnt. Sie haben die Aufgabe, {{20}}, was ihr in einem Computerspiel sehen könnt.',
            },
            {
              text: 'Manchmal schreiben Gamedesigner sogar lustige Geschichten und Dialoge für das Spiel. Sie erklären euch auch die Spielregeln, damit ihr sofort loslegen könnt.',
            },
            {
              text: 'Gamedesigner sorgen schließlich dafür, {{21}}. Sie möchten, dass ihr euch in euren Lieblingsspielen richtig wohl fühlt und tolle Abenteuer erlebt.',
            },
          ],
          bank: [
            { key: 'A', text: 'alles zu designen' },
            { key: 'B', text: 'dass ihr beim Spielen eine Menge Spaß habt' },
            { key: 'C', text: 'die ihr im Spiel lösen müsst' },
            { key: 'D', text: 'oder auf eine Weltraumexpedition gehen' },
            { key: 'E', text: 'wenn du Computerspiele spielst' },
            { key: 'F', text: 'wie man Gamedesigner wird' },
            { key: 'G', text: 'und wie sie gespielt werden' },
          ],
          unusedBankCount: 1,
          examples: choices(0, 'G'),
          items: choices(17, 'E D C A B'),
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
        storagePath: 'erettsegi-de-kozep-2025-oktober.mp3',
        durationSec: 1800,
        // Task starts: the ~60 s reading pause of each task found by silence detection, minus the length of its announcement (approximate, ±10 s).
        taskMarkers: [
          { taskId: 'III-1', startSec: 76 },
          { taskId: 'III-2', startSec: 732 },
          { taskId: 'III-3', startSec: 1247 },
        ],
      },
      // útmutató: feladatpont 0–20 → vizsgapont
      conversion: [0, 2, 3, 5, 7, 8, 10, 12, 13, 15, 17, 18, 20, 21, 23, 25, 26, 28, 30, 31, 33],
      transcripts: [
        {
          taskId: 'III-1',
          title: 'Kaffeekultur',
          paragraphs: [
            'Kaffee trinkt man in vielen Ländern der Welt. Dabei ist es nicht egal, wie man das Getränk zubereitet und wann und wo die Leute ihren Kaffee trinken. Der italienische Espresso oder das Wiener Kaffeehaus sind Symbole der traditionellen Kaffeekultur in Europa. Aber wie sieht das in anderen Ländern, in anderen Erdteilen aus?',
            '- Südkorea und Japan',
            'Es ist vielleicht für manchen überraschend: Aber in Südkorea hat man oft das Gefühl, dass es alle zwei Meter ein Café gibt, wo man dann auch teilweise in sehr schöner Umgebung einen Kaffee trinken kann. In Japan gibt es nicht so viele, aber sie haben auch dort wirklich schöne Cafés. Zum Beispiel gibt es in Tokio ein tolles Haus des bekannten Architekten Kengo Kuma. Die Leute stehen da tatsächlich täglich Schlange.',
            '- Schweden',
            'Es gibt hier diese kleinen süßen Cafés mit bequemen Sesseln und so, die findet man vor allem in schwedischen Großstädten. Das schwedische Standard-Café ist jetzt nicht so elegant. Aber überall wird wahnsinnig viel Kaffee hier getrunken. Denn die Schweden lieben ihre „Fika“ – die gemütliche Kaffeepause mit Kaffee und meist auch Gebäck. Da gibt es dann eine Vormittagsfika, dann kommt das Mittagessen und danach noch eine Nachmittagsfika. Da trinkt man aber meist auch Filterkaffee, keinen so starken Espresso. In ihren regelmäßigen Kaffeepausen während des Arbeitsalltags und in der Freizeit füllen die Schweden so auch ihre Glücksreserven auf – und das hat Tradition im hohen Norden.',
            '- USA',
            'Die Kaffeekultur ist ja insgesamt in den USA sehr viel besser geworden in den letzten 10-20 Jahren. Früher trank man ja überall und immer noch einen ganz schrecklichen Kaffee. Aber dann haben die Amerikaner verstanden: Es gibt ja nicht nur den Brühkaffee, sondern es gibt eben auch einen Latte Macchiato und alles andere. Und da gab es auf einmal eine bunte Auswahl an verschiedenen Kaffeesorten und Zubereitungen. Und man hat natürlich auch angefangen mit einer heute weltweit bekannten, großen Kaffeehaus-Kette, wo man dann eben auch gemütlich sitzen kann, wo man auch Zeit verbringt, wo man an seinem Laptop arbeiten kann.',
            '- China',
            'Traditionell trinkt man natürlich Tee in China und deswegen gibt es hier auch eher mehr Tee-Häuser als Kaffeehäuser. Zusätzlich zu den Kaffeehaus-Ketten aus Amerika und China, findet man aber auch schon kleine gemütliche Cafés, vor allem in Städten wie Peking oder Shanghai. Besonders in Shanghai kann man wirklich tagelang durch die Stadt spazieren und von einem Café zum nächsten gehen. Dafür ist die Stadt berühmt. Die Cafés bieten dann auch ihren eigenen Kaffee an, backen ihren eigenen Kuchen und legen besonderen Wert darauf, dass es gemütlich ist.',
            '- Brasilien',
            'Brasilien hat als weltweit größter Kaffee-Exporteur natürlich auch eine große Kaffeekultur. Und die kann man im Kaffeehaus „Confeitaria Colombo“ erleben. Das liegt im Zentrum von Rio de Janeiro und wurde bereits im Jahr 1894 eröffnet. Die wunderbaren Innenräume mit den großen Kristallspiegeln an den Wänden sind wirklich beeindruckend. Selbstverständlich erhält man hier auch echten brasilianischen Bohnenkaffee.',
          ],
        },
        {
          taskId: 'III-2',
          title: 'Bibliothek des Jahres',
          paragraphs: [
            'In der Stadtbibliothek Heimsheim gibt es mehr als nur Bücher. Unter anderem für ihr besonders reiches Angebot bekam sie jetzt einen Preis.',
            'Die Bibliothek befindet sich in einem alten Gebäude von 1799, das man 2005 restaurierte.',
            'Natürlich kann man hier, wie in jeder anderen Bücherei, Bücher ausleihen und fast jede Art von Medien. Es ist hier aber auch möglich, faire Lebensmittel zu kaufen, eine Maschine auszuleihen oder den kaputten Toaster reparieren zu lassen. Die Stadtbibliothek in der Kleinstadt mit rund 5.500 Einwohnern ist für viele mehr: ein dritter Ort zwischen zu Hause und Arbeit, wo man sich treffen, wo man sich aufhalten kann. Sie ist zu einem beliebten Treffpunkt geworden, zu einem Haus der Kultur in Heimsheim.',
            'Ein interessantes Zusatzangebot der Stadtbibliothek ist die „Leih-Bar“. Nicht nur ein Buch kann man mit anderen teilen, sondern auch einen Hochdruckreiniger oder sogar eine Popcornmaschine. In einem Regal findet man auch noch viele andere praktische Gegenstände, zum Beispiel Werkzeuge, die man ausleihen kann. So spart man nicht nur Geld, sondern hat zu Hause mehr Platz in Keller und Garage – und das Allerbeste: Man schützt die Umwelt.',
            'In der Bibliothek gibt es aber auch eine „Les-Bar“, in der neue Bücher vorgestellt werden. Und eine Spiel-Bar, um gemeinsam Gesellschaftsspiele zu erleben oder eine Tauschbörse - frei nach dem Motto: „Bevor ich es wegwerfe, bringe ich es mal dahin.“ Gegenstände oder Kleider, die nicht mehr gebraucht werden, werden in ein Regal gelegt. Wer will, kann sich dafür etwas anderes mitnehmen.',
            'Erleben kann man hier zum Beispiel „Bilder-Reisen", das sind Reiseberichte von Privatpersonen. Die Bibliothek bietet auch Führungen für Kindergarten- und Schulkinder. Außerdem organisiert man hier Ausstellungen und Kurse wie z.B. einen Computerkurs zum Thema Internet.',
            'Die kleine Stadtbibliothek in Heimsheim besuchen jährlich rund 27.000 Nutzer. Und natürlich wird die Stadtbibliothek Heimsheim ihr Angebot auch in Zukunft ständig weiter ausbauen.',
          ],
        },
        {
          taskId: 'III-3',
          title: '100 Jahre S-Bahn in Berlin',
          paragraphs: [
            '- Elektromobilität, oft auch E-Mobilität genannt, ist keine neue Erfindung. In Berlin fuhr im Jahr 1881 die allererste elektrische Eisenbahn im öffentlichen Verkehr. Also bereits vor 143 Jahren. Warum die S-Bahn in Berlin erst jetzt ihr 100-jähriges Jubiläum feiert, das kann uns Sven Heinemann verraten. Guten Morgen, Herr Heinemann. Was genau wird eigentlich heute gefeiert? Die Berliner Stadtbahn ist ja schon viel älter als 100 Jahre, oder?',
            '- Wir feiern die Elektrifizierung der Stadt-Schnellbahn, heute bekannt als Berliner S-Bahn. Die ist nämlich am 8. August 1924 elektrisch in Betrieb gegangen.',
            '- Was hat sich damals durch diese Neuerung verbessert?',
            '- Das waren ganz klar die Fahrzeiten. Früher brauchte die alte Bahn 116 Minuten, mit der elektrifizierten Bahn waren es dann 78 Minuten. Und es war natürlich völlig rauchfrei auf einmal, ganz elektrisch, und das war radikal neu.',
            '- Und das Logo, das kennt ja wirklich jeder, das ist dieses große weiße ‚S‘ auf grünem Grund. War es ein Berliner, der das erfunden hat?',
            '- Ja klar, das war der Grafiker Fritz Rosen, der das Logo 1930 gemacht hat. Er hat auch viele bekannte Werbeplakate entworfen.',
            '- Wofür steht das ‚S‘ denn überhaupt? Für „Stadt” oder für „schnell”?',
            '- Vor allem für Schnellbahn, weil man eben schnell durch die Stadt und dann auch in die Vororte, in die Umgebung kommt. Wenn heute die S-Bahn mal nicht fährt, gibt es Chaos, denn ohne diese Bahn geht es nicht. Es ist einfach die schnellste Möglichkeit durch die Stadt zu kommen.',
            '- Gibt es auch Probleme?',
            '- Ich finde, die S-Bahn ist relativ pünktlich, und die Probleme, die wir haben, verursacht nicht die S-Bahn selber, sondern das Infrastruktur-Unternehmen der Deutschen Bahn. Daran muss man noch arbeiten, dann wird sie auch noch pünktlicher.',
            '- Herr Heinemann, danke, dass Sie bei uns waren.',
          ],
        },
      ],
      tasks: [
        {
          id: 'III-1',
          label: '1.',
          instructions:
            'Sie hören einen Text über Kaffeekultur und Cafés in verschiedenen Ländern. Lesen Sie zuerst die Aufgabe. Sie hören dann den Text zweimal. Zuerst hören Sie den ganzen Text ohne Pausen, dann in kürzeren Abschnitten. Entscheiden Sie, welche Aussage richtig (R) und welche falsch (F) ist. Kreuzen Sie die Antwort beim Hören an. (0) ist ein Beispiel für Sie.',
          passage: [{ style: 'title', text: 'Kaffeekultur' }],
          booleanLabels: ['R', 'F'],
          examples: rf(0, ['Der italienische Espresso steht für traditionelle Kaffeekultur.'], 'R'),
          items: rf(
            1,
            [
              'In Südkorea und in Japan findet man ausgesprochen schöne Cafés.',
              'In Schweden trinkt man selten Kaffee.',
              'Filterkaffee ist in Schweden am beliebtesten.',
              'In den USA hat sich die Kaffeekultur nicht geändert.',
              'In China findet man heute schon mehr Kaffeehäuser als Teehäuser.',
              'Shanghai ist berühmt für seine gemütlichen Cafés.',
              'Das Kaffeehaus „Confeitaria Colombo” in Rio ist ganz neu.',
            ],
            'R F R F F R F',
          ),
        },
        {
          id: 'III-2',
          label: '2.',
          instructions:
            'Sie hören einen Text über die Stadtbibliothek in Heimsheim. Lesen Sie zuerst die Aufgabe. Sie hören dann den Text zweimal. Zuerst hören Sie den ganzen Text ohne Pausen, dann in kürzeren Abschnitten. Entscheiden Sie beim Hören, welche Aussage (A, B oder C) richtig ist. Kreuzen Sie die richtige Lösung an. (0) ist ein Beispiel für Sie.',
          passage: [{ style: 'title', text: 'Bibliothek des Jahres' }],
          examples: [
            {
              id: '0',
              type: 'mcq',
              stem: 'Die Stadtbibliothek in Heimsheim findet man in ________.',
              options: [{ key: 'A', text: 'dem Stadtzentrum' }, { key: 'B', text: 'einem alten Gebäude' }, { key: 'C', text: 'einem neuen Haus' }],
              answer: 'B',
            },
          ],
          items: questions(
            8,
            [
              { stem: 'In der Bibliothek kann man nicht nur lesen, sondern auch ________.', options: ['faire Lebensmittel kaufen', 'kochen', 'Maschinen kaufen'] },
              { stem: 'Die Stadtbibliothek ist für die Einwohner ein Ort, wo man ________.', options: ['auch Freunde treffen kann', 'auch Zeitungen kaufen kann', 'eine Tasse Tee trinken kann'] },
              { stem: 'Bei der „Leih-Bar” leihen die Leute ________.', options: ['Kleider', 'Möbel', 'Werkzeuge'] },
              { stem: 'Die „Spiel-Bar” ist für ________.', options: ['Computerspiele', 'Gesellschaftsspiele', 'Tischtennis'] },
              { stem: '„Bilder-Reisen” sind ________.', options: ['private Reiseberichte', 'Reisebücher mit vielen Fotos', 'Reisefilme im Fernsehen'] },
              { stem: 'Die Bibliothek organisiert auch ________.', options: ['Kurse', 'Sportprogramme', 'Tanzabende'] },
              { stem: 'Die Bibliothek hat jährlich ________ Benutzer.', options: ['17000', '7500', '27000'] },
            ],
            'A A C B A A C',
          ),
        },
        {
          id: 'III-3',
          label: '3.',
          instructions:
            'Sie hören jetzt ein Gespräch über die S-Bahn in Berlin. Lesen Sie zuerst die Aufgabe. Sie hören dann den Text zweimal. Zuerst hören Sie den ganzen Text ohne Pausen, dann in kürzeren Abschnitten. Entscheiden Sie beim Hören, worüber gesprochen wird und markieren Sie diese Aussage mit X. Wenn über etwas nicht gesprochen wird, lassen Sie das Kästchen leer. Insgesamt können Sie 6-mal ankreuzen. (0) ist ein Beispiel für Sie.',
          passage: [{ style: 'title', text: '100 Jahre S-Bahn in Berlin' }, { text: 'Hier wird darüber gesprochen,' }],
          rules: { multiSelectPenalty: true },
          items: [
            {
              id: '15-20',
              type: 'multi-select',
              exampleOption: 'welches Jubiläum die S-Bahn in Berlin feiert.',
              options: [
                { key: 'a', text: 'wer die Idee zur Elektrifizierung hatte.' },
                { key: 'b', text: 'wie die S-Bahn den Berlinern am Anfang gefallen hat.' },
                { key: 'c', text: 'wie sich die Fahrzeiten verändert haben.' },
                { key: 'd', text: 'was sich radikal verbessert hat.' },
                { key: 'e', text: 'wer das Logo der S-Bahn erfunden hat.' },
                { key: 'f', text: 'wofür das ’S’ im Logo steht.' },
                { key: 'g', text: 'in welchen Städten es auch noch S-Bahnen gibt.' },
                { key: 'h', text: 'wie viel die Fahrkarten kosten.' },
                { key: 'i', text: 'was passiert, wenn die S-Bahn nicht fährt.' },
                { key: 'j', text: 'wie viele Leute täglich mit der S-Bahn fahren.' },
                { key: 'k', text: 'wie pünktlich die S-Bahn ist.' },
              ],
              answer: ['c', 'd', 'e', 'f', 'i', 'k'],
              pick: 6,
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
          title: '„Fit im Park“ – gemeinsam Sport machen',
          instructions: 'Sie studieren gerade in München und haben auf der offiziellen Stadtportal-Seite ein tolles Programmangebot gefunden:',
          passage: [
            { style: 'title', text: 'Fit im Park' },
            {
              text: '„Am 1. Mai startet das kostenlose Fit-im-Park-Programm des städtischen Freizeitsports mit täglichen Sportangeboten. Bis zum 30. September können sich alle mit Hilfe von Sporttrainern in den Münchner Parks fit halten. Für jeden ist etwas dabei: Volleyball und Basketball im Westpark, Zumba und Meditation im Ostpark. Im Prinz-Eugen-Park kann man sogar an Yoga-Stunden teilnehmen.“',
            },
          ],
          items: [
            {
              id: '1',
              type: 'production',
              prompt: ['Schreiben Sie eine E-Mail an Ihren Freund und laden Sie ihn zu gemeinsamen Sportprogrammen ein. Gehen Sie dabei auf die folgenden Punkte ein:'],
              contentPoints: [
                'Grund des Schreibens.',
                'Warum interessieren Sie sich für diese Freizeitsportangebote?',
                'Machen Sie Ihrem Freund Vorschläge, wann und an welchen Fitness-Programmen Sie gemeinsam teilnehmen könnten.',
              ],
              promptAfter: ['Verwenden Sie für Ihren Text 80-100 Wörter. Die Reihenfolge der Leitpunkte können Sie selbst bestimmen.'],
              minWords: 80,
              maxWords: 100,
              opening: 'Lieber Daniel,',
              register: 'informal-message',
              rubricId: 'erettsegi-kozep-1',
              criteria: DE_CRITERIA_1,
            },
          ],
        },
        {
          id: 'IV-2',
          label: '2.',
          title: 'Eine Schul-AG* wählen',
          instructions: 'Sie lesen im Internet Forumsbeiträge über schulische Arbeitsgemeinschaften. Hier sind einige Auszüge daraus:',
          passage: [
            {
              text: '… Es gibt an unserer Schule sehr viele verschiedene AGs: von Sport über Kunst bis hin zu Naturwissenschaften. Chor-AG, Lego-Roboter-AG, Kreatives-Basteln-AG oder Film-AG.',
            },
            {
              text: '… Ich brauche euren Rat: Wie sollte man eine AG wählen? Sollte man etwas Neues ausprobieren, oder eine AG wählen, die mit den eigenen Hobbys zu tun hat?',
            },
            { text: '… Stellt euch vor, unsere Klasse will eine Schülerfirma gründen! Das ist ein schulisches Projekt und dafür gibt es eine spezielle AG.' },
            {
              style: 'note',
              text: '*In einer Schul-AG können sich Schüler nach dem Unterricht mit ihren Interessen und Hobbys beschäftigen oder auch etwas ganz Neues lernen.',
            },
          ],
          items: [
            {
              id: '2',
              type: 'production',
              prompt: ['Schreiben Sie Ihre Meinung in einem Beitrag zum Thema Schul-AG. Gehen Sie in Ihrem Beitrag auf die folgenden Punkte ein:'],
              contentPoints: [
                'Interessieren Sie sich für kreative oder sportliche Schulprogramme? Warum?',
                'Was für AGs haben Sie schon besucht? Warum?',
                'Wie wählen Sie oder Ihre Mitschüler eine AG in der Schule aus?',
                'Welche neuen AGs würden Sie sich in Ihrer Schule wünschen? Warum?',
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
