// Német nyelv, középszintű írásbeli érettségi, 2023. május 12. (2311), Oktatási Hivatal.
// Transcribed verbatim from the feladatlap and its javítási-értékelési útmutató (answer key,
// conversion tables, listening transcripts). Decorative photos are left out.
import type { ExamPaper } from '../types'
import { choices, DE_CRITERIA_1, DE_CRITERIA_2, DE_LISTENING_INTRO, DE_NOTICES_HU, DE_WRITING_INTRO, rf, words } from './deKozep.ts'

const countries = [
  { key: '1', text: 'China' },
  { key: '2', text: 'Indien' },
  { key: '3', text: 'Russland' },
  { key: '4', text: 'Südafrika' },
  { key: '5', text: 'die USA' },
]

const paper: ExamPaper = {
  id: 'erettsegi-de-kozep-2023-majus',
  type: 'erettsegi',
  language: 'de',
  level: 'kozep',
  sittingLabelHu: '2023. május',
  source: 'Oktatási Hivatal: Német nyelv, középszintű írásbeli vizsga, 2023. május 12. (2311) — feladatlap és javítási-értékelési útmutató.',
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
            'Lesen Sie den Text über die sogenannte Nordic-Diät und entscheiden Sie, welche Aussage richtig (R) und welche falsch (F) ist. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'Essen wie in Skandinavien: Die gesündeste Diät der Welt' },
            { text: 'Bei der Nordic Diät 2.0 stehen nur gesunde Lebensmittel auf dem Speiseplan. Alles schmeckt gut, hält fit und macht schlank!' },
            {
              text: 'Gesund zu leben heißt immer auch, sich im eigenen Körper wohlzufühlen. Mit der Nordic Diät 2.0 geht das ganz leicht, denn die Nordic Diät 2.0 ist eigentlich gar keine Diät, wie viele bei diesem Namen bestimmt denken! Bei dieser Ernährung geht es darum, frische Zutaten bewusst zu genießen. Dabei stehen immer in die Jahreszeit gehörende, also saisonale und regionale Lebensmittel im Vordergrund, denn sie bieten viele Vorteile und helfen so beim Abnehmen oder einfach beim Fitbleiben.',
            },
            {
              text: 'Bei der Nordic Diät 2.0 sorgen saisonal ausgewählte Obst- und Gemüsesorten zu jeder Jahreszeit für Geschmack und Vitamine. Heimische Produkte kommen immer frisch auf den Tisch und sind auch deshalb gesund. In den Rezepten für die Nordic Diät 2.0 findet man viele Lebensmittel mit Ballaststoffen. Sie machen lange satt und sind – neben vielen Vitaminen und Mineralstoffen – in Gemüse und Obst reichlich enthalten.',
            },
            {
              text: 'Viele Gemüsesorten liefern zudem Antioxidantien, die vor Krankheiten schützen können. Erbsen, Bohnen oder Linsen enthalten im Gegensatz zu Fleisch keine ungesunden Fette und sind ideale vegetarische Eiweißquellen.',
            },
            {
              text: 'Wissenschaftliche Arbeiten der Universität Kopenhagen zur Nordic Diät haben auch gezeigt, dass sich diese Art der Ernährung positiv auf Blutdruck und Cholesterinspiegel auswirkt. Das kann z. B. Herzerkrankungen vorbeugen. Sogar eine leichte Gewichtsabnahme ist möglich.',
            },
            {
              text: 'Bei der Nordic Diät 2.0 spielen typisch deutsche Lebensmittel wie Kartoffeln, Kohl oder Roggenvollkornbrot und Rapsöl eine wichtige Rolle. Kohl oder Äpfel sind kalorienarm und enthalten viele gute Kohlenhydrate und Ballaststoffe. Mit dieser gesunden Ernährung können Sie sich ohne schlechtes Gewissen satt essen!',
            },
          ],
          booleanLabels: ['R', 'F'],
          examples: rf(0, ['Bei der Nordic Diät stehen leckere Lebensmittel auf dem Speiseplan.'], 'R'),
          items: rf(
            1,
            [
              'Die Nordic Diät ist eine strenge Diät.',
              'Bei der Nordic Diät isst man alles Saisonale.',
              'Regionale Produkte sind gesünder, weil sie frischer sind.',
              'Erbsen, Bohnen und Linsen sind nicht gut für Vegetarier.',
              'Mit der Nordic Diät verliert man schnell viel Gewicht.',
              'Typische deutsche Lebensmittel wie Kartoffeln oder Kohl passen gut zur Nordic Diät.',
            ],
            'F R R F F R',
          ),
        },
        {
          id: 'I-2',
          label: '2.',
          instructions:
            'Lesen Sie den Zeitungsartikel über den Bodensee und beantworten Sie kurz die Fragen. Schreiben Sie zu jedem Punkt nur eine Information. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'Tipps für den Urlaub am Bodensee' },
            {
              text: 'Der Bodensee ist eine der schönsten Urlaubsregionen in Mitteleuropa. Durch das fast schon mediterrane Klima ist er für Erholungssuchende, Naturliebhaber, Sportler und Genießer das ganze Jahr über ein beliebtes Reiseziel. Die unglaublich große Auswahl an Möglichkeiten schenkt den Urlaubern einmalige Erlebnisse.',
            },
            {
              text: 'Lage: Drei Millionen Menschen. Vier Länder. Ein See. Eine Region. Dies ist die Vierländerregion Bodensee. Aber Moment mal - warum eigentlich vier Länder? Geografisch gesehen grenzt der See an Deutschland, Österreich und die Schweiz, nur sie teilen sich die 273 Uferkilometer. Das vierte Land, das Fürstentum Liechtenstein, liegt ein bisschen weiter von hier entfernt. An der Schweizer sowie an der Liechtensteiner Grenze gibt es manchmal Kontrollen. Deshalb sollte man immer einen Personalausweis oder Reisepass bei sich haben. Außerdem sind Autobahnvignetten auf vielen Straßen in der Schweiz und in Österreich Pflicht. Insgesamt sind alle Nachbarländer auch mit dem Schiff, der Bahn oder dem Rad nur einen Tagesausflug entfernt.',
            },
            {
              text: 'Zahlungsmittel: In Deutschland und Österreich wird natürlich in Euro bezahlt, in der Schweiz und im Fürstentum Liechtenstein aber mit Schweizer Franken. In allen vier Ländern kann man natürlich auch mit Kreditkarte zahlen. Aber das gilt nicht für alle kleineren Geschäfte oder Gaststätten. Auch Tickets, zum Beispiel für Schiffe oder Bergbahnen, können manchmal nur bar bezahlt werden. Es schadet also nicht, immer ein wenig Bargeld mitzunehmen.',
            },
            {
              text: 'Datenroaming: In der EU gelten seit Juni 2017 zum Glück einheitliche Roaming-Tarife. Deutschland, Österreich und das Fürstentum Liechtenstein sind mit dabei – hier entstehen Gästen aus der EU also keine zusätzlichen Kosten für das Telefonieren oder Surfen. Eine Ausnahme bildet allerdings die Schweiz. Als Nicht-EU-Land gelten hier andere Bestimmungen! Hier kann das Telefonieren und Surfen schnell teuer werden.',
            },
            {
              text: 'Sprache: Rund um den Bodensee wird Deutsch gesprochen. Allerdings spielen Dialekte eine große Rolle, man kann zum Beispiel Schwäbisch, Bayerisch, Vorarlbergerisch oder Schwyzerdütsch hören. Der Bodensee zieht Millionen Gäste aus aller Welt an, aber auch Besucher ohne Deutschkenntnisse müssen sich hier keine Gedanken machen: Mit den meisten Gastgebern und Dienstleistern kann man sich problemlos auch auf Englisch verständigen.',
            },
            {
              text: 'Klima: Das Klima am Bodensee wird stark von der Temperatur des Sees beeinflusst. Der Sommer ist weniger heiß und die Winter sind nicht so kalt. Im Winter ist die Zahl der Tage, an denen die Lufttemperatur unter 0 Grad sinkt, sehr gering.',
            },
            { style: 'heading', text: 'FRAGEN' },
          ],
          examples: [
            {
              id: '0',
              type: 'short-text',
              prompt: 'Wo liegt die schöne Urlaubsregion „Bodensee“?',
              answer: { accepted: ['in Mitteleuropa'], match: 'exact-ci' },
            },
          ],
          items: [
            {
              id: '7',
              type: 'short-text',
              prompt: 'Was macht den Bodensee bei Besuchern so beliebt?',
              answer: {
                accepted: ['das (fast schon) (mediterrane) Klima', 'die (unglaublich) große Auswahl an Möglichkeiten', 'viele Möglichkeiten', 'Er/Die Region bietet einmalige Erlebnisse.'],
                match: 'keywords',
                keywords: [['klima', 'auswahl', 'möglichkeit', 'erlebnis']],
              },
            },
            {
              id: '8',
              type: 'short-text',
              prompt: 'An wie viele Länder grenzt der See geografisch gesehen?',
              answer: { accepted: ['(an) drei (Länder)', 'Deutschland, Österreich und die Schweiz'], match: 'keywords', keywords: [['drei', '3', 'deutschland']] },
            },
            {
              id: '9',
              type: 'short-text',
              prompt: 'Welche Dokumente sollten die Besucher der Region bei sich haben? z. B.',
              answer: { accepted: ['(einen) Personalausweis', '(einen) Reisepass'], match: 'keywords', keywords: [['personalausweis', 'reisepass']] },
            },
            {
              id: '10',
              type: 'short-text',
              prompt: 'Mit welchen Verkehrsmitteln kann man die Nachbarländer erreichen? ________ oder ________',
              answer: {
                accepted: ['mit dem Auto', 'mit dem Schiff', 'mit der Bahn', 'mit dem Rad'],
                match: 'keywords',
                keywords: [['auto', 'schiff', 'bahn', 'rad']],
              },
              reviewNote: 'Bármelyik két közlekedési eszköz elfogadható, a sorrend mindegy.',
            },
            {
              id: '11',
              type: 'short-text',
              prompt: 'Wo ist es wichtig, Bargeld dabei zu haben?',
              answer: {
                accepted: ['in kleineren Geschäften/Gaststätten', 'beim Ticketkauf (für Schiffe/Bergbahnen)'],
                match: 'keywords',
                keywords: [['geschäft', 'gaststätte', 'ticket', 'schiff', 'bergbahn']],
              },
            },
            {
              id: '12',
              type: 'short-text',
              prompt: 'In welchem Land ist Telefonieren für EU-Bürger teuer?',
              answer: { accepted: ['in der Schweiz'], match: 'keywords', keywords: [['schweiz']] },
            },
            {
              id: '13',
              type: 'short-text',
              prompt: 'Warum brauchen Touristen in der Region keine Deutschkenntnisse?',
              answer: {
                accepted: ['Die meisten (Gastgeber) können Englisch.', 'Man kann sich (problemlos) auf Englisch verständigen.'],
                match: 'keywords',
                keywords: [['englisch']],
              },
            },
            {
              id: '14',
              type: 'short-text',
              prompt: 'Wodurch wird das Klima am Bodensee beeinflusst?',
              answer: { accepted: ['(durch) die Temperatur des Sees', 'durch den See'], match: 'keywords', keywords: [['see']] },
            },
          ],
        },
        {
          id: 'I-3',
          label: '3.',
          instructions:
            'Was passt in den Text? Schreiben Sie den entsprechenden Buchstaben in die Rubrik. Achtung! Es gibt einen Buchstaben zu viel. (0) ist ein Beispiel für sie.',
          passage: [
            { style: 'title', text: 'E-Roller: Falsches Abstellen kann teuer werden' },
            {
              text: 'Sogenannte E-Scooter sind einfache und praktische Fahrzeuge für kurze Wege. Dass die elektrischen Roller sehr beliebt sind, zeigen auch die Zahlen. {{0}} Mit mehr Rollern gibt es jedoch auch mehr Probleme. Falsch abgestellte E-Roller sorgen für Ärger und sind auch ein Sicherheitsrisiko. Gemietete E-Roller werden leider oft falsch geparkt: {{15}} Gerade bei älteren Menschen können solche Roller schnell zu einem Unfall führen. Wenn ein falsch abgestellter Roller umfällt, ist das eventuell auch für die dort parkenden Autos gefährlich.',
            },
            {
              text: 'E-Roller muss man also so abstellen, dass sie nicht umfallen können oder den Verkehr stören. Auf Gehwegen darf man Roller z. B. nur dann abstellen, wenn der Fußweg breit genug ist. {{16}}',
            },
            {
              text: 'Weil die Leute in den letzten Jahren immer mehr E-Roller leihen, sind die Regeln für die Nutzung der Roller jetzt strenger. {{17}} Und Vermieter haben von Montag bis Samstag nur zwei Stunden Zeit, danach müssen sie die nicht korrekt abgestellten E-Roller entfernen. {{18}} Wenn sie es nicht tun, müssen sie die Kosten für das Entfernen zahlen. Mit E-Rollern dürfen die Benutzer im Allgemeinen auf Fahrradwegen und Straßen fahren. {{19}} Aber an manchen Orten ist das Fahren auf Fußwegen erlaubt. Dort muss man dann aber besonders langsam und vorsichtig fahren.',
            },
          ],
          bankTitle: 'SÄTZE',
          bank: [
            { key: 'A', text: 'An Sonn- und Feiertagen haben Vermieter sechs Stunden Zeit dafür.' },
            { key: 'B', text: 'Sie stehen z. B. in der Mitte von Gehwegen oder an Hauseingängen.' },
            { key: 'C', text: 'Im Jahr 2019 wurden davon rund 30.000 Stück in Österreich verkauft.' },
            { key: 'D', text: 'Nutzer müssen 100 Euro Strafe zahlen, wenn sie die Roller außerhalb einer bestimmten Zone parken.' },
            { key: 'E', text: 'Dazu kommen noch die vielen Fahrräder.' },
            { key: 'F', text: 'Das bedeutet normalerweise vier Meter.' },
            { key: 'G', text: 'Verboten ist das Fahren auf Zebrastreifen, Gehwegen sowie in Fußgängerzonen.' },
          ],
          unusedBankCount: 1,
          examples: choices(0, 'C'),
          items: choices(15, 'B F D A G'),
        },
        {
          id: 'I-4',
          label: '4.',
          instructions:
            'Das sind die gemischten Teile eines Textes. Rekonstruieren Sie den Originaltext, indem Sie die Textteile in die richtige Reihenfolge bringen. Schreiben Sie den entsprechenden Buchstaben in die Rubrik. (0) ist ein Beispiel für Sie.',
          passage: [{ style: 'title', text: '„Tennis für Zwei“ – das erste Computerspiel der Welt' }],
          items: [
            {
              id: '20-25',
              type: 'order',
              start: 20,
              first: 'G',
              answer: ['B', 'C', 'A', 'F', 'E', 'D'],
              parts: [
                {
                  key: 'A',
                  text: 'Deshalb dachte sich Higinbotham für die Besucher ein Computerspiel aus, wo man aktiv sein konnte. Das Spiel hatte einen runden Bildschirm, der war ungefähr so groß wie ein Bierdeckel. Unten war über den ganzen Bildschirm ein Strich zu sehen, das war der Tennisplatz. In der Mitte des Striches zeigte ein weiterer Strich nach oben, das Tennisnetz.',
                },
                {
                  key: 'B',
                  text: 'Er hat das Computerspiel entwickelt, weil er wollte, dass alle Menschen Physik spannend finden. Willy Higinbotham war nämlich aufgefallen, dass sich die Besucherinnen und Besucher langweilten, wenn sie am Tag der offenen Tür in das Forschungszentrum kamen, in dem er arbeitete.',
                },
                { key: 'C', text: 'Sie bekamen im Forschungszentrum zwar viel erklärt und konnten sich auch Fotos ansehen, aber sie konnten nichts ausprobieren.' },
                {
                  key: 'D',
                  text: 'Die Menschen standen nämlich stundenlang Schlange, um das Videospiel auszuprobieren. Die anderen ausgestellten Sachen schauten sie sich kaum an. Verkauft wurde „Tennis For Two“ aber nie.',
                },
                {
                  key: 'E',
                  text: 'Dieses erste Videospiel begeisterte die Gäste 1958 am Tag der offenen Tür! Ob seine Kolleginnen und Kollegen das auch so toll fanden, ist nicht sicher.',
                },
                { key: 'F', text: 'Um einen Punkt über das Netz zu schlagen, musste man an einem Rad drehen und auf einen Knopf drücken. Der Punkt war der Tennisball.' },
                {
                  key: 'G',
                  text: 'Das erste Computerspiel wurde in den USA erfunden. Es hieß „Tennis For Two“, auf Deutsch bedeutet das: „Tennis für Zwei“. Erfunden hat es der Physiker Willy Higinbotham.',
                },
              ],
            },
          ],
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
            { style: 'title', text: 'Das bin ich: Musik und Leben retten' },
            {
              text: 'Langeweile mag Moritz gar nicht. Warum soll man sich langweilen, wenn man so viele spannende Dinge machen {{0}}? Cello, Rugby und Ringen hat Moritz bereits ausprobiert. Jetzt spielt der 14-Jährige Schlagzeug. Moritz fühlt {{1}} dabei wie ein Rockstar. Das elektronische Schlagzeug ist kaum hörbar, Moritz hört den Sound nur über seinen Kopfhörer. {{2}} seinen Nachbarn muss er also keine Angst haben. Moritz wohnt in Tirol und besucht seit Herbst die vierte Klasse {{3}} Mittelschule. Bis vor Kurzem hat Moritz auch in einem Chor mitgesungen. Doch vor zwei Jahren veränderte sich seine Stimme, da hat er die Karriere {{4}} Chorsänger aufgegeben. Jetzt hat er mehr Zeit {{5}} sein neues Hobby. Seit ein paar Monaten ist Moritz stolzes Mitglied der freiwilligen Feuerwehr. „Noch bin ich im Training: Aber irgendwann kann ich wirklich Menschenleben retten“, meint Moritz. Beruflich hat der 14-Jährige aber andere Pläne: „Ich kann gut mit Kindern umgehen, {{6}} möchte ich einmal Lehrer werden“, erzählt er. Moritz bewundert seinen Klassenlehrer, {{7}} er „ein witziger und fairer Typ ist“. „{{8}} es in der Klasse einen Konflikt gibt, dann hört er beiden Seiten zu und sucht dann eine Lösung“, lobt Moritz. Gerechtigkeit ist nämlich nie langweilig.',
            },
          ],
          bank: [
            { key: 'A', text: 'ALS' },
            { key: 'B', text: 'AUF' },
            { key: 'C', text: 'DENN' },
            { key: 'D', text: 'DESHALB' },
            { key: 'E', text: 'EINEM' },
            { key: 'F', text: 'EINER' },
            { key: 'G', text: 'KANN' },
            { key: 'H', text: 'FÜR' },
            { key: 'I', text: 'IHN' },
            { key: 'K', text: 'SICH' },
            { key: 'L', text: 'VON' },
            { key: 'M', text: 'VOR' },
            { key: 'N', text: 'WEIL' },
            { key: 'O', text: 'WENN' },
            { key: 'P', text: 'ZUM' },
          ],
          unusedBankCount: 6,
          examples: choices(0, 'G'),
          items: choices(1, 'K M F A H D N O'),
        },
        {
          id: 'II-2',
          label: '2.',
          instructions:
            'Ergänzen Sie den Text. Schreiben Sie die angegebenen Wörter in der richtigen Form in den Text. Achtung! Schreiben Sie in jede Lücke nur ein Wort. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'Süß!' },
            {
              text: 'Wer durch Wiens 17. Bezirk spaziert, riecht es gleich: Es duftet nach Schokolade! Der Geruch kommt von der berühmten Waffelfabrik. Hier {{0}} man köstliche Neapolitaner Schnitten. Der Erfinder der Süßigkeit {{9}} vor 131 Jahren ein kleines Geschäft am Stephansplatz in Wien. Dort {{10}} er Schokoladen und Kaffee. Doch er war nicht zufrieden mit seiner Schokolade. Deshalb baute er das Haus seiner Eltern zu einer Schokoladenfabrik um. Sein Ziel: gute und nicht zu teure Schokolade für alle! So sind die köstlichen Neapolitaner Schnitten {{11}}: zarte Waffel, gefüllt mit Haselnuss-Kakao-Creme. In der Fabrik wird alles selbst hergestellt – von der Schokolade bis zur Waffel. Und hier {{12}} es auch den derzeit größten Waffelofen der Welt! Die Süßigkeit hat von Wien aus die Welt erobert. Heute werden die Neapolitaner Schnitten in über 50 Ländern verkauft. Genauso wie das Rezept ist auch die rosa Verpackung immer gleich {{13}}. In Erinnerung an das erste Geschäft am Stephansplatz ist der Stephansdom zum Markenzeichen für das Produkt {{14}}.',
            },
          ],
          examples: words(0, [['produzieren', 'produziert']]),
          items: words(9, [
            ['haben', 'hatte'],
            ['verkaufen', 'verkaufte'],
            ['entstehen', 'entstanden'],
            ['geben', 'gibt', 'gab'],
            ['bleiben', 'geblieben'],
            ['werden', 'geworden'],
          ]),
        },
        {
          id: 'II-3',
          label: '3.',
          instructions:
            'Was passt in den Text? Schreiben Sie den entsprechenden Buchstaben in die Rubrik. Achtung! Es gibt einen Buchstaben zu viel. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'So ein Stress!' },
            {
              text: 'Hier eine Prüfung, dort ein Test und dazwischen noch ein Referat. Deine Eltern machen Druck wegen der Noten. In der Klasse wirst du ausgeschlossen. Es gibt Streit in der Familie. Das Geld ist überall knapp. Kein Wunder, {{0}} und du nur noch Stress hast. „Jeder Mensch braucht ein bisschen Stress, {{15}}“, erklärt die Ärztin Marguerite Dunitz-Scheer. Denn Stress macht den Körper aktiv und wach. „Zum Beispiel, wenn in der Früh der Wecker klingelt und man aus dem Schlaf gerissen wird, {{16}}. Das ist wichtig, denn so wird man munter“, sagt die Ärztin. Stress kann sogar unser Leben retten. Zum Beispiel, wenn man über den Zebrastreifen geht und plötzlich ein Auto kommt. Dann ist es wichtig, dass die Gefahr Stress auslöst {{17}}. Wann macht Stress krank? Wenn wir zu viel davon haben. Nach der Anstrengung muss sich der Körper entspannen und erholen. Wenn man immer gestresst ist, ist man wie eine Maschine, {{18}}. Wir brauchen also eine Ruhepause, um Kraft zu tanken. Tipps gegen Stress:',
            },
            { style: 'bullet', text: 'Beweg dich! Schon 20 Minuten Laufen oder Ballspielen können dem Körper helfen, {{19}}.' },
            { style: 'bullet', text: 'Mach eine Pause! Zieh dich zwischendurch zurück, hör deine Lieblingsmusik oder leg dich hin {{20}}.' },
            { style: 'bullet', text: 'Keine gute Idee: Wenn du gestresst bist, {{21}}. Die vielen Bilder und Eindrücke können den Stress noch verstärken.' },
          ],
          bank: [
            { key: 'A', text: 'die immer mit voller Kraft arbeitet' },
            { key: 'B', text: 'ist das auch eine Form von Stress' },
            { key: 'C', text: 'dass dir alles zu viel wird' },
            { key: 'D', text: 'solltest du dich nicht vor den Fernseher oder den Computer setzen' },
            { key: 'E', text: 'Stress abzubauen' },
            { key: 'F', text: 'um sich wohl zu fühlen.' },
            { key: 'G', text: 'und schlaf ein bisschen' },
            { key: 'H', text: 'und man sofort zur Seite springt' },
            { key: 'I', text: 'was du bisher geschafft hast.' },
          ],
          unusedBankCount: 1,
          examples: choices(0, 'C'),
          items: choices(15, 'F B H A E G D'),
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
        storagePath: 'erettsegi-de-kozep-2023-majus.mp3',
        durationSec: 1801,
        // Task starts: the ~60 s reading pause of each task found by silence detection, minus the length of its announcement (approximate, ±10 s).
        taskMarkers: [
          { taskId: 'III-1', startSec: 79 },
          { taskId: 'III-2', startSec: 693 },
          { taskId: 'III-3', startSec: 1264 },
        ],
      },
      // útmutató: feladatpont 0–21 → vizsgapont
      conversion: [0, 2, 3, 5, 6, 8, 9, 11, 13, 14, 16, 17, 19, 20, 22, 24, 25, 27, 28, 30, 31, 33],
      transcripts: [
        {
          taskId: 'III-1',
          title: 'Hausaufgaben',
          paragraphs: [
            'In manchen Schulen in Südafrika ist es so, dass es so etwas wie Hausaufgabenklassen nach der Schule gibt. Dort sind dann Lehrkräfte oder irgendwelche Betreuer da, die den Kindern bei den Hausaufgaben helfen können, weil viele Eltern zuhause das eben nicht können. In den Hausaufgabenklassen aber können die Schüler dann einfach mal den Arm heben und um Hilfe fragen, wenn sie selber nicht so genau weiterwissen.',
            'Hausaufgaben sind auf jeden Fall auch in Indien ein extrem leidiges Thema, weil es sehr viele Hausaufgaben gibt. Es gibt manchmal Hilfsorganisationen, die auch Hausaufgabenhilfe anbieten. Wenn indische Kinder auf eine staatliche Schule gehen, ist dort der Schulunterricht kostenlos. Aber für die Hausaufgabenhilfe gilt das im Allgemeinen nicht. Arme Eltern können ihren Kindern aber oft bei den Hausaufgaben auch nicht helfen. Diese Kinder haben es dann schwer.',
            'Das habe ich in Russland noch nicht gesehen, dass sie Geld kostet, diese Hausaufgabenhilfe. Es ist tatsächlich eher so, dass man im Familienkreis jemanden sucht, der sich mit Mathematik auskennt oder mit Biologie oder eben mit Literatur, und der dann das Kind bei der Hand nimmt und ihm hilft. Das gilt aber vor allem für die späteren Schuljahre. Da gehen die Kinder nämlich auf spezialisierte Schulen, wo sie dann so Schwerpunktfächer haben. Und dort sind dann auch Lehrer und Lehrerinnen da, die sehr viel Wert darauf legen, dass die Kinder tatsächlich etwas mitnehmen und deshalb bekommen sie dort sehr viele Hausaufgaben.',
            'Kindergarten Hausaufgaben machen, oft so 15 bis 20 Minuten am Tag. Sie müssen dann das ABC lernen, bis 20 zählen und Ähnliches. Tatsächlich bekommen sie auch ein kleines Heftchen mit, in dem sie dann schreiben, malen, und zeichnen und ich glaube, auch schon kleine Rechenaufgaben erledigen müssen.',
            'Hausaufgaben gibt‘s in China viele. Sehr viele. Der Schulunterricht geht in China ja oft bis nachmittags oder bis in den frühen Abend hinein. Und dann geht\'s zu Hause immer noch weiter nach dem Abendessen. Viele Kinder machen häufig bis Mitternacht noch ihre Hausaufgaben, weil es einfach wirklich sehr viel ist. Und vor wichtigen Prüfungen und Zwischenprüfungen in der Schule wird‘s dann noch extremer, noch viel mehr mit der ganzen Vorbereitung auf die Prüfungen. Also Hausaufgaben in China, das ist wirklich nicht zu vergleichen mit Deutschland.',
            'Was ich auch immer ganz interessant finde, ist, dass man draußen keine Kinder sieht, weil die Kinder ja entweder in der Schule sind, oder sie haben auch häufig noch Musikunterricht und machen dann noch abends bis spät in die Nacht ihre Hausaufgaben. Also Kind sein in China ist, glaube ich, nicht so leicht.',
          ],
        },
        {
          taskId: 'III-2',
          title: 'Einkaufen ohne Warteschlange: Scan & go',
          paragraphs: [
            'Im Globus-Markt in Neustadt an der Weinstraße funktioniert Einkaufen seit einiger Zeit anders als sonst üblich. Globus will das Bezahlen einfacher und für die Kunden schneller machen. Mit einem Handscanner direkt vor den Regalen scannen die Kunden selbst, was sie alles einkaufen. „Nach dem Einkauf geht der Kunde direkt zu einer Zahlstation, bezahlt nur seine Einkäufe und verlässt den Markt, ohne dass er die Einkäufe nochmal auf das Transportband bringen muss, ohne dass er an einer Kasse warten muss. Er kann gleich bezahlen und den Markt verlassen.” Bezahlt wird mit einer Bankkarte, so wie an einer normalen Selbstbedienungskasse, nur eben schneller, weil der Kunde die Artikel bereits im Laden gescannt hat. Und so gibt es auch nur selten Warteschlangen an der Kasse. Denn nach einer Befragung von Kunden halten 58 Prozent Warteschlangen für das größte Ärgernis beim Einkaufen in einem Geschäft. Globus will diesen Kundenwunsch umsetzen, mit seinen neuen Handscannern, die der Kunde am Eingang des Supermarktes findet. Die neue Technik hat nach Aussagen von Globus aber noch weitere Vorteile: „Auf diesem Gerät kann der Kunde dann seinen Einkauf während des Durchgangs durch den Markt selbst erfassen. Er sieht sofort auf dem Display den Artikel, den er gescannt hat, also den gesamten Warenkorb, den Preis des Artikels und den Gesamtpreis des Einkaufs.” Und wenn er etwas falsch gescannt hat oder sich doch für einen anderen Artikel entscheidet, kann er die Sache wieder aus dem Warenkorb löschen. Neue Aufgaben und neue Technik für die Kunden, den meisten gefällt\'s.',
            'Auch der Discounter Penny will das Bezahlen einfacher machen und testet in Köln „Penny Go“. Hier gibt es kein Regal mit Handscannern wie bei Globus, sondern der Kunde benutzt hier sein eigenes Smartphone zum Scannen. „Er braucht unsere App, die er zuerst installieren muss. Dann kauft er ganz normal ein, wie er das gewohnt ist. Mit seinem Smartphone scannt der Kunde beim Rundgang alle Produkte, bevor er sie in seinen Einkaufswagen legt, und macht so seinen Einkauf. Bezahlt wird an einer Penny Go-Kasse ohne Personal. Sobald der Einkauf abgeschlossen ist, wird von der App ein Barcode generiert, der dann an der Kasse eingescannt wird. Bezahlen kann der Kunde nur mit seiner Bankkarte.',
          ],
        },
        {
          taskId: 'III-3',
          title: 'Als die Schwalben mit dem Flugzeug reisten',
          paragraphs: [
            '18. Oktober 1974. Vom Flughafen Frankfurt startet eine Boeing 727 der Lufthansa mit über 2000 Passagieren an Bord in Richtung Genua. Ja, Sie haben richtig gehört. In der Maschine befinden sich tatsächlich mehr als 2000 Passagiere. Die sind allerdings sehr klein und haben Flügel, denn es sind Schwalben. Schwalben sind wunderbare Vögel. Jedes Jahr im Herbst starten sie ihre lange Reise in die Winterquartiere südlich der Sahara, weil ihnen in Deutschland im Winter Nahrung fehlt. Also futtern sie sich normalerweise im Spätsommer noch mal satt und beginnen dann ihren anstrengenden Flug nach Afrika.',
            'Doch im Jahr 1974 wird es besonders früh Winter und tausende Schwalben sterben beim Flug über die Alpen. In dieser Situation starten Tierschützer die größte Hilfsaktion, die es in Deutschland je gegeben hat. Per Flugzeug werden mehr als eine Million Schwalben in den Süden gebracht. Alle helfen damals zusammen. Der Bund für Vogelschutz, Polizei und Feuerwehren, Ministerien, Firmen, Tierheime, dazu tausende von Freiwilligen aus der ganzen Südhälfte der Bundesrepublik. Sie sammeln die Schwalben aus ihren Nestern, füttern sie kräftig, setzen sie in Kartons und bringen sie zu den Sammelstellen an den Flughäfen. Lufthansa, Swissair und sogar die Bundeswehr schaffen Platz im Kofferraum ihrer Maschinen und fliegen die Schwalben in den Süden. Auch von München gehen Rettungsflüge nach Italien, Frankreich oder bis nach Spanien und Portugal. Dort öffnen sich die Transportkisten und die Tiere können ihre Reise nach Afrika schließlich aus eigener Kraft fortsetzen. Hilft man der Natur mit solchen Rettungsaktionen oder schadet das vielleicht sogar? - fragen Kritiker. Es ist wahr, der Mensch beeinflusst die Umwelt schon lange. Aber im Jahr 1974 hat er damit hunderttausenden von Schwalben das Leben gerettet.',
          ],
        },
      ],
      tasks: [
        {
          id: 'III-1',
          label: '1.',
          instructions:
            'Sie hören einen Text über Hausaufgaben. Lesen Sie zuerst die Aufgabe. Sie hören dann den Text zweimal. Zuerst hören Sie den ganzen Text ohne Pausen, dann in kürzeren Abschnitten. Entscheiden Sie beim Hören, welche Aussage zu welchem Land passt und kreuzen Sie an. Achtung! Sie können insgesamt 7-mal ankreuzen. (0) ist ein Beispiel für Sie.',
          passage: [{ style: 'title', text: 'Hausaufgaben' }, { text: 'In diesem Land…' }],
          rules: { multiSelectPenalty: true },
          examples: [{ id: '0', type: 'multi-select', stem: 'gibt es Hausaufgabenklassen nach dem Unterricht.', options: countries, answer: ['4'], pick: 1 }],
          items: [
            { id: '1/2', type: 'multi-select', stem: 'bekommen viele Kinder zu Hause keine Hilfe bei den Hausaufgaben.', options: countries, answer: ['2', '4'], pick: 2 },
            { id: '3', type: 'multi-select', stem: 'hilft jemand in der Familie bei den Hausaufgaben.', options: countries, answer: ['3'], pick: 1 },
            { id: '4', type: 'multi-select', stem: 'bekommen die Schüler in den spezialisierten Schulen sehr viele Hausaufgaben.', options: countries, answer: ['3'], pick: 1 },
            { id: '5', type: 'multi-select', stem: 'gibt es Hausaufgaben schon im Kindergarten.', options: countries, answer: ['5'], pick: 1 },
            { id: '6', type: 'multi-select', stem: 'machen die Kinder oft bis in die späte Nacht ihre Hausaufgaben.', options: countries, answer: ['1'], pick: 1 },
            { id: '7', type: 'multi-select', stem: 'sieht man keine Kinder auf den Straßen.', options: countries, answer: ['1'], pick: 1 },
          ],
        },
        {
          id: 'III-2',
          label: '2.',
          instructions:
            'Sie hören einen Bericht über das Einkaufen der Zukunft. Lesen Sie zuerst die Aufgabe. Sie hören dann die Texte zweimal. Zuerst hören Sie den ganzen Text ohne Pausen, dann in kürzeren Abschnitten. Entscheiden Sie, welche Aussage richtig (R) und welche falsch (F) ist. Kreuzen Sie die Antwort beim Hören an. (0) ist ein Beispiel für Sie.',
          passage: [{ style: 'title', text: 'Einkaufen ohne Warteschlange: Scan & go' }],
          booleanLabels: ['R', 'F'],
          examples: rf(0, ['Im Globus-Markt wurde das Einkaufen einfacher und schneller gemacht.'], 'R'),
          items: rf(
            8,
            [
              'Im Globus-Markt helfen Verkäuferinnen den Kunden beim Scannen.',
              'Im Globus-Markt geht man zu einer Zahlstation, wenn man die gewählte Ware bezahlen möchte.',
              'Im Globus-Markt kann man auch mit Bargeld zahlen.',
              'Im Globus-Markt werden die Waren nicht an der Kasse gescannt.',
              'Im Globus-Markt ärgern sich die Kunden über kaputte Handscanner.',
              'Im Globus-Markt kann der Kunde eine falsch gescannte Ware löschen.',
              'Im Discounter Penny braucht man sein eigenes Smartphone und eine Penny-Karte zum Scannen.',
              'Im Discounter Penny generiert eine App einen Barcode für das Zahlen.',
            ],
            'F R F R F R F R',
          ),
        },
        {
          id: 'III-3',
          label: '3.',
          instructions:
            'Sie hören einen Text über Schwalben. Lesen Sie zuerst die Aufgabe. Sie hören dann den Text zweimal. Zuerst hören Sie den ganzen Text ohne Pausen, dann in kürzeren Abschnitten. Ergänzen Sie die Sätze beim Hören. Schreiben Sie in jede Lücke nur eine Information. (0) ist ein Beispiel für Sie.',
          passage: [{ style: 'title', text: 'Als die Schwalben mit dem Flugzeug reisten' }, { style: 'heading', text: 'Schwalben' }],
          examples: [
            {
              id: '0',
              type: 'short-text',
              prompt: 'An Bord einer Boeing 727 der Lufthansa reisen mehr als ________ Passagiere: Es sind Schwalben.',
              answer: { accepted: ['2000'], match: 'exact-ci' },
            },
          ],
          items: [
            {
              id: '16',
              type: 'short-text',
              prompt: 'Im Jahr 1974 kommt der Winter ________ .',
              answer: { accepted: ['(besonders/sehr) früh'], match: 'keywords', keywords: [['früh']] },
            },
            {
              id: '17',
              type: 'short-text',
              prompt: 'Tierschützer organisieren 1974 ________ in Deutschland.',
              answer: { accepted: ['(die größte)/eine Hilfsaktion'], match: 'keywords', keywords: [['hilfsaktion']] },
            },
            {
              id: '18',
              type: 'short-text',
              prompt: 'Flugzeuge bringen mehr als ________ Schwalben aus Deutschland weg.',
              answer: { accepted: ['eine Million'], match: 'keywords', keywords: [['million']] },
            },
            {
              id: '19',
              type: 'short-text',
              prompt: 'Freiwillige Helfer transportieren die Schwalben zu Sammelstellen an ________ .',
              answer: { accepted: ['(den) Flughäfen'], match: 'keywords', keywords: [['flughäfen', 'flughafen', 'flughaefen']] },
            },
            {
              id: '20',
              type: 'short-text',
              prompt: 'Die Rettungsflüge von München gehen bis nach ________ .',
              answer: { accepted: ['Italien', 'Frankreich', 'Spanien', 'Portugal'], match: 'keywords', keywords: [['italien', 'frankreich', 'spanien', 'portugal']] },
            },
            {
              id: '21',
              type: 'short-text',
              prompt: 'Die Vögel erreichen Afrika zum Schluss ________ .',
              answer: { accepted: ['aus eigener Kraft', 'selbst'], match: 'keywords', keywords: [['eigener kraft', 'selbst']] },
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
          title: 'Ein Urlaub im Schwarzwald',
          instructions: 'Sie planen mit Ihrer Familie einen Urlaub im Schwarzwald. Im Internet haben Sie dazu die folgende Information gefunden:',
          passage: [
            { style: 'title', text: 'Die weltgrößte Kuckucksuhr' },
            {
              text: 'Der deutsche Uhrmacher Josef Dold hatte eine Idee. Er baute eine Kuckucksuhr so groß wie ein kleines Schwarzwaldhäuschen. Im Inneren dieser Uhr baute er ein riesiges handgefertigtes Kuckucksuhrenwerk aus Holz ein. Zu jeder vollen und halben Stunde zeigt sich der Kuckuck!',
            },
            { text: 'Die weltgrößte Kuckucksuhr lädt die Besucher zur Besichtigung in ihr Inneres ein!' },
            { text: 'Kontakt: Jürgen Dold E-Mail: j-dold@t-online.de' },
          ],
          items: [
            {
              id: '1',
              type: 'production',
              prompt: ['Schreiben Sie eine E-Mail an den Ansprechpartner und informieren Sie sich über Einzelheiten. Gehen Sie dabei auf die folgenden Punkte ein:'],
              contentPoints: [
                'Warum schreiben Sie?',
                'Fragen Sie nach Bedingungen für die Besichtigung der Kuckucksuhr (z. B. Kosten, Ermäßigungen, Führungen, Sprache).',
                'Fragen Sie nach weiteren (Programm)angeboten in der Umgebung.',
              ],
              promptAfter: ['Verwenden Sie für Ihren Text 80-100 Wörter. Die Reihenfolge der Leitpunkte können Sie selbst bestimmen.'],
              minWords: 80,
              maxWords: 100,
              opening: 'Sehr geehrter Herr Dold,',
              register: 'formal-email',
              rubricId: 'erettsegi-kozep-1',
              criteria: DE_CRITERIA_1,
            },
          ],
        },
        {
          id: 'IV-2',
          label: '2.',
          title: 'Was macht dich glücklich?',
          instructions: 'In einem Internetforum haben Sie einen interessanten Beitrag über den deutschen „Glücksatlas“ gefunden. Lesen Sie den Auszug:',
          passage: [
            {
              text: 'Glück kann man messen! Der Glücksatlas zeigt, wie zufrieden die Menschen mit ihrem Leben sind, was die Menschen glücklich oder unglücklich macht. … Wie siehst du dein eigenes Leben, was sind deine Wünsche und Ziele? ….Welche Bereiche spielen eine große Rolle für dich: Wohnen, Familie, Freizeit, Arbeit, Gesundheit oder das Einkommen? Was macht dich zufrieden mit deinem Leben?',
            },
          ],
          items: [
            {
              id: '2',
              type: 'production',
              prompt: ['Schreiben Sie Ihre Meinung zum Thema in einem Forumsbeitrag. Gehen Sie dabei auf die folgenden Punkte ein:'],
              contentPoints: [
                'Welche Lebensbereiche sind für Sie sehr wichtig? Warum?',
                'Wann fühlen Sie sich (besonders) zufrieden?',
                'Welche Wünsche haben Sie für Ihre Zukunft?',
                'Was kann man selbst für die eigenen Wünsche und Ziele tun?',
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
