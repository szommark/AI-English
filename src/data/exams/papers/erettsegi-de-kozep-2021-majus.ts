// Német nyelv, középszintű írásbeli érettségi, 2021. május 7. (2012/2111), Oktatási Hivatal.
// Transcribed verbatim from the feladatlap and its javítási-értékelési útmutató (answer key,
// conversion tables, listening transcripts). Decorative photos are left out.
import type { ExamPaper } from '../types'
import { choices, cloze, DE_CRITERIA_1, DE_CRITERIA_2, DE_LISTENING_INTRO, DE_NOTICES_HU, DE_WRITING_INTRO, gapMcqs, rf } from './deKozep.ts'
import { questions } from './enKozep.ts'

const paper: ExamPaper = {
  id: 'erettsegi-de-kozep-2021-majus',
  type: 'erettsegi',
  language: 'de',
  level: 'kozep',
  sittingLabelHu: '2021. május',
  source: 'Oktatási Hivatal: Német nyelv, középszintű írásbeli vizsga, 2021. május 7. — feladatlap és javítási-értékelési útmutató.',
  noticesHu: DE_NOTICES_HU,
  sections: [
    {
      id: 'I',
      kind: 'reading',
      titleHu: 'I. Olvasott szöveg értése',
      timeLimitMin: 60,
      // útmutató: feladatpont 0–27 → vizsgapont
      conversion: [0, 1, 2, 4, 5, 6, 7, 9, 10, 11, 12, 13, 15, 16, 17, 18, 20, 21, 22, 23, 24, 26, 27, 28, 29, 31, 32, 33],
      tasks: [
        {
          id: 'I-1',
          label: '1.',
          instructions:
            'Sie lesen ein Interview mit einem Lehrer. Lesen Sie zuerst die Interview-Antworten und suchen Sie dann die passende Frage. Schreiben Sie den entsprechenden Buchstaben in die Rubrik. Achtung! Es gibt eine Frage zu viel. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'Interview mit dem eigenen Lehrer' },
            { text: 'Herr Eisele arbeitet als Lehrer. Der Reporter der Schülerzeitung seiner Schule hat mit ihm ein Interview gemacht.' },
            { text: '{{0}} – Gerne Sport, da ich dieses Fach früher schon einmal unterrichtet habe.' },
            { text: '{{1}} – Die eigene Lerngruppe ist einem natürlich am vertrautesten, weil man viel gemeinsam unternimmt, z. B. Klassenfahrten, Ausflüge, Exkursionen...' },
            { text: '{{2}} – Mündlich war ich eher etwas zurückhaltender, die Klassenarbeiten waren aber meist ganz ok.' },
            { text: '{{3}} – In Religion und Französisch. Heute bereue ich es sehr, dass ich mich nicht besser auf Französisch unterhalten kann.' },
            { text: '{{4}} – Ich fahre gerne Mountainbike und gehe im Sommer surfen, also wellenreiten. Im Winter liebe ich es, Tiefschneehänge mit meinem Snowboard runterzufahren.' },
            { text: '{{5}} – Ich würde gerne mal nach Neuseeland fliegen, in Afrika auf Safari gehen oder nach Patagonien reisen.' },
            { text: '{{6}} – Asiatisch! Zum Beispiel Grünes Thaicurry. Aber äthiopische bzw. eritreische Gerichte finde ich auch total lecker.' },
            {
              text: '{{7}} – Da wir selber einen Kater haben, würde ich als Haustier Kater oder Katze sagen. Vor Kurzem war ich im Naturkundemuseum und da haben mich vor allem die Meerestiere fasziniert. Danke für das Interview!',
            },
          ],
          bankTitle: 'FRAGEN',
          bank: [
            { key: 'A', text: 'Haben Sie eine bestimmte Lieblingsklasse?' },
            { key: 'B', text: 'In welchen Fächern waren Sie eher schlechter?' },
            { key: 'C', text: 'Waren Sie gut in der Schule?' },
            { key: 'D', text: 'Was essen Sie gerne?' },
            { key: 'E', text: 'Was ist Ihr Lieblingstier?' },
            { key: 'F', text: 'Was machen Sie so privat am liebsten?' },
            { key: 'G', text: 'Würden Sie gerne noch ein anderes Fach unterrichten?' },
            { key: 'H', text: 'Was wollten Sie damals als Kind gerne werden?' },
            { key: 'I', text: 'Wohin würden Sie gerne mal in den Urlaub fahren?' },
          ],
          unusedBankCount: 1,
          examples: choices(0, 'G'),
          items: choices(1, 'A C B F I D E'),
        },
        {
          id: 'I-2',
          label: '2.',
          instructions:
            'Lesen Sie den Text über das Thema Zucker in Getränken. Notieren Sie die wichtigsten Informationen in Stichworten. Schreiben Sie zu jedem Punkt nur eine Information. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'Zu viel Zucker in Getränken' },
            {
              text: 'Wenn man zu viel Zucker isst, kann man dick und krank werden. Auch zu viel Zucker in Getränken macht krank. Die Organisation Foodwatch hat festgestellt, dass in vielen Getränken in Deutschland zu viel Zucker ist. Das englische Wort ‚Foodwatch‘ bedeutet ‚Lebensmittelkontrolle‘. Die Organisation Foodwatch hat 463 Limonaden, Energiegetränke, Saftschorlen und Eistees untersucht. Nur sechs Getränke davon waren nicht gezuckert. Das süßeste Getränk - ein Energiegetränk - hatte in einer 0,5-Liter-Dose 78 Gramm Zucker. Das sind 26 Stück Würfelzucker.',
            },
            {
              text: 'Die Welt-Gesundheits-Organisation (WHO) empfiehlt, dass ein Mensch höchstens sechs Teelöffel Zucker am Tag essen sollte. Wenn man mehr Zucker zu sich nimmt, schadet man den Zähnen oder man wird zu dick. Eine große Gefahr ist auch die Zuckerkrankheit. Sie wird auch Diabetes genannt, man kann daran sogar sterben.',
            },
            {
              text: 'In Großbritannien gibt es deshalb seit 2018 bereits eine „Zuckersteuer“, damit die Hersteller ihre Produkte weniger süßen. Wie Foodwatch fordert, sollte man auch in Deutschland eine Zuckersteuer einführen. Die Bundesregierung lehnt das jedoch ab. Der Minister für Ernährung meint: Strafsteuern auf Lebensmittel sind der falsche Weg. Die Menschen sollen besser über gesunde Lebensmittel informiert werden. Am besten schon in der Schule.',
            },
          ],
          examples: [
            {
              id: '0',
              type: 'short-text',
              prompt: 'Das enthalten viele Getränke: ________',
              answer: { accepted: ['zu viel Zucker'], match: 'exact-ci' },
            },
          ],
          items: [
            {
              id: '8',
              type: 'short-text',
              prompt: 'Eine Aufgabe der Organisation Foodwatch: ________',
              answer: {
                accepted: ['Lebensmittelkontrolle', 'Lebensmittel/Getränke untersuchen/kontrollieren'],
                match: 'keywords',
                keywords: [['kontroll', 'untersuch']],
              },
            },
            {
              id: '9',
              type: 'short-text',
              prompt: 'Zahl der Getränke ohne extra Zucker: ________',
              answer: { accepted: ['(nur) sechs (Getränke)'], match: 'keywords', keywords: [['sechs', '6']] },
            },
            {
              id: '10',
              type: 'short-text',
              prompt: 'Optimale Zuckermenge täglich: ________',
              answer: { accepted: ['(höchstens) / (nicht mehr als) sechs Teelöffel'], match: 'keywords', keywords: [['sechs', '6']] },
            },
            {
              id: '11',
              type: 'short-text',
              prompt: 'Ziel der britischen „Zuckersteuer“: ________',
              answer: {
                accepted: ['die Hersteller süßen ihre Produkte weniger', 'weniger süße Produkte'],
                match: 'keywords',
                keywords: [['weniger'], ['süß']],
              },
            },
            {
              id: '12',
              type: 'short-text',
              prompt: 'Darüber müssen die Leute mehr wissen: ________',
              answer: { accepted: ['(über) gesunde Lebensmittel'], match: 'keywords', keywords: [['gesund']] },
            },
          ],
        },
        {
          id: 'I-3',
          label: '3.',
          instructions:
            'Lesen Sie den Zeitungsartikel über eine Freundschaft und beantworten Sie kurz die Fragen. Schreiben Sie zu jedem Punkt nur eine Information. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'ABF - die allerbeste Freundin' },
            {
              text: 'Die Freundschaft zur besten Freundin – genannt: die allerbeste Freundin, die ABF – ist immer besonders. Sie ist nämlich für viele Mädchen die erste enge Beziehung außerhalb der eigenen Familie. Beste Freundinnen sind jederzeit füreinander da, sie fühlen sich füreinander verantwortlich und möchten am liebsten alles miteinander teilen. Für immer. Warum sind sie trotzdem so häufig enttäuscht von ihrer ABF? Und was passiert, wenn die Freundschaft zerbricht? Alina erzählt, warum das so ist, und was die allerbeste Freundin niemals tun darf.',
            },
            {
              text: '„Wenn sich meine Eltern streiten, wenn ich eine schlechte Note geschrieben habe oder einfach schlechte Laune habe, dann kann mich niemand so gut beruhigen, wie meine beste Freundin Hannah. Letztes Jahr haben wir uns zufällig auf einer Geburtstagsparty getroffen, viel unterhalten und einander gleich gemocht. Vorher kannten wir uns nur vom Sehen aus der Schule. Seit Anfang des Schuljahres sind Hannah und ich in einer Klasse. Die beste Freundin ist so etwas, wie ein persönlicher Kümmerer. Jeden Morgen vor der Schule schreiben wir uns über WhatsApp und abends sagen wir uns so ‚Gute Nacht‘. Am liebsten gehen wir zusammen bummeln oder schauen Serien. Und klar, reden wir auch über Jungs. Obwohl wir beste Freundinnen sind, streiten wir oft. Meistens deshalb, weil Hannah gern mehr Zeit mit mir verbringen würde. Ich kann aber nicht so oft, weil ich vier Mal die Woche Tanzunterricht habe, dann spiele ich noch Klavier, und für die Schule muss ich auch viel lernen. Wenn ich keine Zeit für sie habe, ist sie sauer. Manchmal trifft sie sich dann mit anderen Leuten. Mir tut das ein bisschen weh, weil ich mich ausgetauscht fühle. Aber dann sprechen wir uns aus, und es ist wieder okay. Vor Hannah hatte ich eine andere beste Freundin. Aber seitdem wir nicht mehr in dieselbe Klasse gehen, haben sich unsere Wege getrennt. Mir ist es nämlich wichtig, dass ich meine beste Freundin täglich sehe. Und dass wir dasselbe Umfeld haben. Sonst versteht sie mich ja gar nicht, wenn ich ein Problem habe. Klar bin ich manchmal ein bisschen traurig, mit meiner alten allerbesten Freundin nicht mehr so viel zu tun zu haben. Aber so ist das Leben halt. Sie hat ja auch eine neue allerbeste Freundin.“',
            },
          ],
          examples: [
            {
              id: '0',
              type: 'short-text',
              prompt: 'Warum ist die allerbeste Freundin für viele Mädchen so besonders?',
              answer: { accepted: ['weil die ABF die erste enge Beziehung (außerhalb der eigenen Familie) ist'], match: 'exact-ci' },
            },
          ],
          items: [
            {
              id: '13',
              type: 'short-text',
              prompt: 'Was ist für beste Freundinnen typisch z. B.?',
              answer: {
                accepted: ['sie sind jederzeit füreinander da', 'sie fühlen sich füreinander verantwortlich', 'sie möchten (am liebsten) alles miteinander teilen'],
                match: 'keywords',
                keywords: [['füreinander', 'miteinander teilen', 'alles teilen']],
              },
            },
            {
              id: '14',
              type: 'short-text',
              prompt: 'Wo fand Alina Hannah gleich sympathisch?',
              answer: { accepted: ['auf einer Geburtstagsparty'], match: 'keywords', keywords: [['geburtstagsparty', 'party']] },
            },
            {
              id: '15',
              type: 'short-text',
              prompt: 'Seit wann sind Alina und Hannah richtige beste Freundinnen?',
              answer: {
                accepted: ['seit Anfang des Schuljahres', 'seit sie in eine Klasse gehen'],
                match: 'keywords',
                keywords: [['anfang des schuljahres', 'schuljahr', 'einer klasse', 'eine klasse', 'gleichen klasse', 'selben klasse']],
              },
            },
            {
              id: '16',
              type: 'short-text',
              prompt: 'Womit verbringen sie gern die gemeinsame Zeit z. B.?',
              answer: {
                accepted: ['(sie) (gehen) bummeln', 'schauen Serien', 'reden über Jungs'],
                match: 'keywords',
                keywords: [['bummel', 'serien', 'jungs']],
              },
            },
            {
              id: '17',
              type: 'short-text',
              prompt: 'Warum streiten sich Alina und Hannah häufig?',
              answer: {
                accepted: ['weil Hannah mehr Zeit mit Alina verbringen möchte', 'weil Alina wenig Zeit für Hannah hat'],
                match: 'keywords',
                keywords: [['mehr zeit', 'wenig zeit', 'keine zeit', 'zeit']],
              },
            },
            {
              id: '18',
              type: 'short-text',
              prompt: 'Was macht Hannah, wenn Alina keine Zeit für sie hat?',
              answer: {
                accepted: ['(Hannah) trifft sich mit anderen Leuten', 'ärgert sich', 'ist sauer'],
                match: 'keywords',
                keywords: [['treffen', 'trifft', 'sauer', 'ärger', 'ärgert']],
              },
            },
            {
              id: '19',
              type: 'short-text',
              prompt: 'Wie lösen die zwei Mädchen ihre Konflikte?',
              answer: {
                accepted: ['die Mädchen sprechen sich aus', 'die Mädchen sprechen miteinander/darüber'],
                match: 'keywords',
                keywords: [['sprechen', 'reden', 'aussprechen']],
              },
            },
            {
              id: '20',
              type: 'short-text',
              prompt: 'Aus welchem Grund trifft sich Alina mit ihrer früheren besten Freundin nicht mehr?',
              answer: {
                accepted: [
                  'weil Alina und ihre frühere beste Freundin nicht mehr in dieselbe Klasse gehen',
                  'ihre Wege haben sich getrennt',
                  'sie haben nicht dasselbe Umfeld',
                ],
                match: 'keywords',
                keywords: [['klasse', 'wege', 'umfeld']],
              },
              reviewNote: 'Az útmutató szerint a „sie haben nicht dasselbe Umfeld” válasz nem elvárt, de elfogadható.',
            },
          ],
        },
        {
          id: 'I-4',
          label: '4.',
          instructions:
            'Was passt in den Text? Schreiben Sie den entsprechenden Buchstaben in die Rubrik. Achtung! Es gibt einen Buchstaben zu viel. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'Warum ist der Abiball so teuer?' },
            {
              text: 'In ganz Deutschland wollen die Abiturienten den Schulabschluss groß feiern. {{0}} Warum ist der Abiball so teuer?',
            },
            {
              text: '35 Euro wird eine Karte für ihren Abiball kosten, „schon echt ein teures Vergnügen“, sagt Jule Meyer. Die 17-Jährige ist Abiturientin am Gymnasium Bad Zwischenahn-Edewecht und organisiert zusammen mit ihrer Freundin Charlotte die Abitur-Abschlussfeier. Die soll in einer großen Festhalle stattfinden, denn alle wollen noch Eltern und Verwandte mitbringen: {{21}} Für die Karten wird ihre Familie insgesamt mehr als 200 Euro bezahlen. Die Gesamtkosten für den Abiball von Jules Jahrgang: rund 20.000 Euro. Vor allem die Halle ist teuer. {{22}} Was im Preis noch nicht enthalten ist: die Versicherung, der Sicherheitsdienst.',
            },
            {
              text: 'Obwohl Jule eigentlich schon gerade im Abistress ist und die ersten Klausuren schreibt, kümmert sie sich um das Ball-Management. Gerade ist sie noch auf der Suche nach einem guten DJ und nach einem Fotografen. Jule ist mit Charlotte verantwortlich dafür, dass es ein schöner Abiball wird. {{23}} Auch für ein Buffet mussten sie sich entscheiden. Das kostet jetzt 23,50 Euro pro Person. In den vergangenen Jahren sind die Preise für das Buffet laut Jule um zwei Euro gestiegen. {{24}}',
            },
            {
              text: 'Jules Jahrgang ist groß, mehr als 120 Schüler machen in diesem Jahr ihr Abitur auf dem Gymnasium. Jeder will noch seine Familie mitbringen. {{25}} Und dann sind auch noch viele Lehrer und die Schüler aus den unteren Jahrgängen dabei. Die jetzige Partyhalle hat mit rund 700 Leuten die größte Kapazität unter den Hallen in der Region. Eine Möglichkeit wäre auch, den Abiball draußen zu feiern. {{26}} Schließlich ist auf das Wetter kein Verlass. Also bleibt nur noch die große, teure Festhalle übrig. Um zu sehen, wie beliebt diese Halle ist, muss man sich nur ansehen, wie eng die Abibälle aufeinander folgen. {{27}} Das heißt auch: Am nächsten Tag hängt dort noch die Dekoration der Vorgänger. Um Kosten zu sparen, hat Jule mit den anderen Abiturienten ausgemacht, dass ihr Jahrgang Teile der Deko übernehmen kann. Im Gegenzug helfen sie den anderen beim Aufbau.',
            },
          ],
          bankTitle: 'SÄTZE',
          bank: [
            { key: 'A', text: 'Allein ihre Miete beträgt über 2.500 Euro.' },
            { key: 'B', text: 'Am Abend vor Jules Abiball werden in der gleichen Halle noch Abiturienten einer anderen Schule feiern.' },
            { key: 'C', text: 'Dafür zahlen sie jedes Jahr Hunderte Euro.' },
            { key: 'D', text: 'Auch Jules Familie wird dabei sein.' },
            { key: 'E', text: 'Deshalb planen sie den Abend genauestens durch.' },
            { key: 'F', text: 'Getränke sind da noch nicht enthalten.' },
            { key: 'G', text: 'Jule meint aber, unter freiem Himmel kann die Veranstaltung nicht stattfinden.' },
            { key: 'H', text: 'So kommen knapp 500 Leute zusammen.' },
            { key: 'I', text: 'Viele Tanzschulen bieten Vorbereitungskurse für den Abiball an.' },
          ],
          unusedBankCount: 1,
          examples: choices(0, 'C'),
          items: choices(21, 'D A E F H G B'),
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
          instructions: 'Was passt in den Text? Unterstreichen Sie das richtige Wort. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'Freiwilligenarbeit im Ausland' },
            {
              text: 'Maike, 18, betreut gerade Kinder in Lettland: „Nach meinem Abitur wollte ich nicht sofort studieren, {{0}} etwas von der Welt sehen. Meine Schwester hatte vergangenes Jahr einen Europäischen Freiwilligendienst absolviert, so kam ich auf die Idee, {{1}} ebenfalls darum zu bewerben. Man hat mir ein Projekt in Lettland vorgeschlagen. Lettland? Ich hatte {{2}} Ahnung von dem Land, von der Sprache, der Kultur, ich dachte aber: Ja, warum eigentlich nicht? Vier Stunden von der Hauptstadt Riga entfernt, in einem kleinen Örtchen mitten {{3}} dem Land, kümmere ich mich nun seit ein paar Monaten {{4}} Kinder und Jugendliche aus der Region, gebe ihnen Englischunterricht oder bastle mit ihnen.',
            },
            {
              text: 'Wenn ich nicht arbeite, {{5}} ich möglichst viel zu reisen, durch die Nachbarstaaten Estland und Litauen, aber auch nach Russland. Eigentlich hatte ich den Plan, nach meiner Rückkehr aus Lettland Deutsch und Anglistik {{6}}, aber nun habe ich ein anderes Ziel: Ich werde in Passau mit European Studies {{7}}. Ich kann mir sehr gut {{8}}, eines Tages in einer EU-Organisation zu arbeiten und mitzuwirken.“',
            },
          ],
          examples: gapMcqs(0, [['aber', 'denn', 'oder', 'sondern']], 'D'),
          items: gapMcqs(
            1,
            [
              ['ich', 'mich', 'mir', 'sich'],
              ['kein', 'keine', 'keinen', 'keins'],
              ['an', 'auf', 'nach', 'von'],
              ['bei', 'mit', 'um', 'von'],
              ['gehe', 'mag', 'versuche', 'will'],
              ['studiere', 'studieren', 'studiert', 'zu studieren'],
              ['begann', 'beginnen', 'begonnen', 'zu beginnen'],
              ['entscheiden', 'planen', 'vorhaben', 'vorstellen'],
            ],
            'B B B C C D B D',
          ),
        },
        {
          id: 'II-2',
          label: '2.',
          instructions:
            'Was passt in den Text? Schreiben Sie in jede Lücke das richtige Wort. Achtung! Ein Wort kann mehrmals vorkommen. (0) ist ein Beispiel für Sie. (am, auf, bei, für, mit, seit, von)',
          passage: [
            { style: 'title', text: 'Ist E-Sport wirklich ein Sport?' },
            {
              text: 'FIFA, League of Legends und Starcraft: {{0}} diesen Games hast du bestimmt schon mal gehört oder vielleicht hast du sie selbst schon gespielt. Diese Spiele sind {{9}} dich ein nettes Hobby in deiner Freizeit. Es gibt aber auch junge Menschen, die diese Spiele professionell über mehrere Stunden {{10}} Tag spielen, entweder an der Konsole oder am Computer. E-Sport ist in den letzten Jahren so stark gewachsen, dass richtige Vereine entstanden sind. Die treten dann in großen Turnieren gegeneinander an. Wenn man erfolgreich ist, kann man mehrere Millionen Euro gewinnen.',
            },
            {
              text: 'Muss man also nur schnell ein paar Knöpfe drücken und ist sofort Millionär? So einfach ist das dann doch nicht. Ähnlich wie {{11}} Leistungssportlern, braucht man auch hier viel Talent und Glück. Nur die wenigsten schaffen es, {{12}} E-Sport Geld zu verdienen. Sie spielen wöchentlich {{13}} vielen verschiedenen Veranstaltungen, wenn sie nicht gerade trainieren. Viel Freizeit bleibt da nicht. Neben diesen Veranstaltungen reisen sie zu zahlreichen Wettbewerben {{14}} der ganzen Welt. Sie sind also ständig unterwegs. Der Druck ist enorm. Man streitet {{15}} Jahren um die Anerkennung von E-Sport als richtige Sportart. Dennoch sehen viele Verbände in E-Sport nichts anderes als eine professionelle Spielerei.',
            },
          ],
          examples: cloze(0, [['Von']]),
          items: cloze(9, [['für'], ['am'], ['bei'], ['mit'], ['auf', 'bei'], ['auf', 'von'], ['seit']]),
        },
        {
          id: 'II-3',
          label: '3.',
          instructions:
            'Was passt in den Text? Schreiben Sie den entsprechenden Buchstaben in die Rubrik. Achtung! Es gibt einen Buchstaben zu viel. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'Unter der Erde arbeiten' },
            {
              text: 'Unter Wien gibt es riesige Kanäle, {{0}}. Die ganzen Kanäle sind insgesamt 2400 Kilometer lang! Oskar ist einer der Kanalarbeiter. „Früher mussten Kanalarbeiter oft durch die stinkenden, dunklen Gänge klettern“, erzählt Oskar. „Doch das hat sich schon längst geändert. Heute haben wir modernste Technik, {{16}}. Es gibt eigene Maschinen und Roboter, die wir unter die Erde schicken. Sie fahren durch die Kanäle {{17}}.“ Während die Roboter unter der Erde unterwegs sind, {{18}}. Sie beobachten alles über eine Kamera und geben dem Roboter Anweisungen. Deswegen müssen sie sich sehr gut mit Technik auskennen.',
            },
            {
              text: 'Kanalarbeiter müssen nur dann unter die Erde, {{19}}, das der Roboter nicht lösen kann. Oder wenn ein Kanal so eng ist, {{20}}. Dann muss Oskar auf einer kleinen Leiter unter die Erde klettern.',
            },
            {
              text: 'Heute wird Oskar zu einem Kanal gerufen, {{21}}. Oskar und seine Kollegen saugen mit einer Art Riesenstaubsauger das dreckige Wasser ab. Nach Reinigungsarbeiten wendet sich Oskar wieder seinem Roboter zu – der muss nämlich gleich wieder tief unter die Straßen der Stadt…',
            },
          ],
          bank: [
            { key: 'A', text: 'aus dem Wasser auf die Straße dringt' },
            { key: 'B', text: 'dann ist das sehr anstrengend' },
            { key: 'C', text: 'die das Abwasser aus der Stadt hinausbringen' },
            { key: 'D', text: 'dass die großen Maschinen nicht hineinpassen' },
            { key: 'E', text: 'die uns hilft' },
            { key: 'F', text: 'stehen Oskar und seine Kollegen oben auf der Straße' },
            { key: 'G', text: 'und reinigen sie' },
            { key: 'H', text: 'wenn es ein Problem gibt' },
          ],
          unusedBankCount: 1,
          examples: choices(0, 'C'),
          items: choices(16, 'E G F H D A'),
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
        storagePath: 'erettsegi-de-kozep-2021-majus.mp3',
        durationSec: 1801,
        // Task starts: the ~60 s reading pause of each task found by silence detection, minus the length of its announcement (approximate, ±10 s).
        taskMarkers: [
          { taskId: 'III-1', startSec: 76 },
          { taskId: 'III-2', startSec: 757 },
          { taskId: 'III-3', startSec: 1346 },
        ],
      },
      // útmutató: feladatpont 0–21 → vizsgapont
      conversion: [0, 2, 3, 5, 6, 8, 9, 11, 13, 14, 16, 17, 19, 20, 22, 24, 25, 27, 28, 30, 31, 33],
      transcripts: [
        {
          taskId: 'III-1',
          title: 'Segelfliegen - die Kunst, mit der Luft zu schwimmen',
          paragraphs: [
            '- Unsere Reporterin Lea Eichhorn ist selbst Segelfliegerin. Sie berichtet über die Welt des Segelfliegens.',
            '- Segelfliegen … das ist für mich die Kunst, mit der Luft zu schwimmen. Beim Start kommt das Flugzeug in wenigen Sekunden von null auf etwa 120 Kilometer pro Stunde. Oben löse ich dann das Seil. Da verbindet mich nichts mehr mit der Erde.',
            '- O, ja. Wie lange kann man da eigentlich oben bleiben?',
            'Na ja, einmal hinaufgezogen kann ein Segelflugzeug Stunden in der Luft verbringen. Wenn das Wetter passt, fliege ich mehrere Stunden.',
            '- Interessant. Segelfliegen – ist das kein einsamer Sport?',
            '- Oh, diese Frage höre ich oft. Du bist ja allein im Cockpit. Segelfliegen klappt aber nur im Team. Alleine komme ich nicht in die Luft. Wenn ich fliege, helfen die anderen Vereinsmitglieder am Boden mit. Am nächsten Tag läuft es andersherum. Für unsere Leidenschaft opfern wir ein ganzes Wochenende.',
            'Dadurch ist es auch viel mehr als nur ein Hobby. Eigentlich ist es eher eine Lebenseinstellung. In der Saison, also von April bis Oktober, verbringe ich jedes freie Wochenende auf dem Flugplatz. Meinen nicht-fliegenden Freunden gefällt das nicht immer.',
            '-Wie, zu Partys kommst du nur im Winter?',
            'Ja, viele verstehen das nicht. Aber beim Fliegen gibt es keine Kompromisse. Entweder ganz oder gar nicht. Du entscheidest dich vor dem Wochenende für oder gegen den Flugplatz. Wenn du da bist, bist du da, und die anderen zählen auf dich. Da schreibst du nicht eine halbe Stunde vor der Verabredung eine WhatsApp-Nachricht: „Sorry, anstrengender Tag, lass uns das verschieben, o.k.?“',
            '- Ist Segelfliegen eigentlich anstrengend?',
            'Bei längeren Flügen bin ich sehr konzentriert. Ich denke kaum an mein Brötchen und die Wasserflasche. Aber Trinken ist beim Fliegen wahnsinnig wichtig, um im Kopf fit zu bleiben. Ich muss immer wieder Thermik suchen. Also warme Aufwinde, in denen ich nach oben kommen kann. Das sind die stressigen, körperlich anstrengenden Momente. Mein Herz klopft noch schneller, meine Hände schwitzen. Meine Muskeln sind angespannt.',
            '- Hast du keine Angst, alleine da oben?',
            '- Nee, hab‘ ich nicht. Obwohl ich normalerweise Höhenangst habe. Wenn ich zum Beispiel auf einen hohen Turm klettere und runtergucke. Beim Fliegen nicht. Mein Flugzeug und ich, wir sind ja Teil der Luft. Ich schwimme mit. Und die Höhe ist fast das Schönste, der Blick von oben. Alles wird klein. Ich sehe: Spielzeugfelder, Spielzeugautos, Spielzeugwindräder. Grundsätzlich finde ich das Fliegen beruhigend. Da oben gelten für mich die gleichen Gesetze wie für die Vögel, die mir ab und zu begegnen. So wie bei meinem Streckenflug vor kurzem. Ich war auf der Suche nach einem Aufwind. Ich dachte: Über den Wald da unten, da geht es bestimmt gut. Ging es aber nicht. Ich sank. Im nächsten Moment sah ich einen Vogel, vielleicht tausend Meter vor mir. Auch wenn Thermik nicht sichtbar ist, sah ich, wie sie den Vogel angehoben hat. Ich flog also auf ihn zu. Kurze Zeit später merkte ich, wie die Luft auch mich hochgehoben hat. Obwohl Worte mein Job sind, kann ich dieses Gefühl wirklich nicht beschreiben. Ich kann es nur zusammenfassen: Ich habe mit der Hilfe eines Vogels die Schwerkraft besiegt. Wenn das jetzt nicht sportlich klingt, dann weiß ich auch nicht weiter.',
          ],
        },
        {
          taskId: 'III-2',
          title: 'Kater Garfield',
          paragraphs: [
            'Garfield!!!! Garfield!!!!',
            'Garfield ist wohl der berühmteste Comic-Kater der Welt. Er ist orange, liebt Lasagne und das süße Nichtstun. Seit über 40 Jahren erscheint der Comicstrip „Garfield“ in Zeitungen auf der ganzen Welt. Noch immer zeichnet der US-amerikanische Erfinder Jim Davis den faulen und gefräßigen Kater selbst. Jetzt ist der Zeichner 75 Jahre alt geworden. Aus dem einfachen Comicstrip wuchs ein Garfield-Imperium: mit Filmen, Fernsehserien, Büchern und Videospielen.',
            'Garfield ist faul, liebt es zu essen, hasst Montage und Diäten. Also der Kater ist ziemlich menschlich – und genau darum ging es dem Erfinder des Comics. Jim Davis hat den Comic-Kater nicht nur nach seinem Großvater James Garfield Davis benannt, sondern ihm auch noch ein paar Eigenschaften seines Opas mitgegeben: meinungsstark und mürrisch, aber mit weichem Herz.',
            'Hinter der Idee zu Garfield steckte übrigens einfache Logik: Davis sah den Erfolg des Snoopy-Erfinders Charles M. Schulz. Und dachte sich: Menschen mögen nicht nur Hunde, sondern auch Katzen. Er selbst wuchs auf einer Farm im US-Bundesstaat Indiana auf, mit insgesamt 25 Katzen.',
            '1978 zeigte sich Garfield erstmals in US-amerikanischen Zeitungen und begann seinen Siegeszug, der ihn später bis ins Guinnessbuch der Rekorde brachte. Kein Comicstrip hat es in so viele Zeitungen und Zeitschriften geschafft wie der orangefarbene Kater mit den großen Füßen. Aus Jim Davis wurde ein reicher Mann: Schon 1981 gründete er eine Firma, um Garfield auf den Markt zu bringen, in Form von Videospielen, Filmen, Garfield-Kalendern und Stofftieren. Die Vermarktung machte so viel Arbeit, dass Jim Davis andere Zeichner brauchte, die ihn beim Comicstrip unterstützen.',
            'Die Ideen und Texte stammen nach wie vor von Jim Davis selbst. Bis heute lebt er in seinem Heimat-Bundesstaat Indiana, ist in zweiter Ehe verheiratet, hat drei Kinder und mehrere Enkel, mit denen er sich einmal pro Woche hinsetzt und zeichnet. Garfield, glaubt er, wird ihn überdauern: „Garfield ist aus zwei Gründen auch nach über 40 Jahren so beliebt. Erstens: Er ist eine Katze und die Leute lieben Katzen. Und zweitens lieben alle Essen und Schlafen. Und das wird auch in 40 Jahren noch so sein.“',
          ],
        },
        {
          taskId: 'III-3',
          title: 'Warum Chinesen heißes Wasser trinken',
          paragraphs: [
            '„Heißes Wasser auf Knopfdruck!“ Zwischen 30 und 95 Grad heiß, abfüllbar in Becher oder Flaschen. In China stehen an allen möglichen und unmöglichen Orten Heißwasserspender herum: In Büros, Behörden, auf der Polizeiwache, an Bahnhöfen und auch in den schicken Schnellzügen der chinesischen Bahn.',
            'Man stellt einfach einen Becher drunter, drückt den Knopf und holt sich Wasser. Hatte man es früher noch mit schweren dampfenden und immerzu tropfenden Kisten aus Metall zu tun, sehen die Heißwasserspender heute meistens aus wie eine moderne Kaffeemaschine mit Digitaldisplay. Manche sprechen sogar.',
            'Als Grund, dass sie immer und überall heißes Wasser trinken, nennen Chinesen gerne die Tradition. Aber natürlich hat das Ganze auch noch medizinische Gründe, erklärt Bin Yang vom Kai-Shu-Zentrum in Shanghai, einem Ärztehaus für traditionelle chinesische Medizin. Isst oder trinkt man Kaltes, ziehen sich die Muskeln des Magens zusammen. Bei warmen Getränken hingegen passiert das nicht. Deswegen sollte man immerzu warmes Wasser trinken. Wenn sich der Magen zusammenzieht, verdaut er nämlich schlechter.',
            'Nicht nur die Heißwasserspender gehören zum chinesischen Alltagsleben dazu, sondern auch die passenden Thermoskannen. Von Bauarbeitern über Verkehrspolizisten bis zu den Managern im Shanghaier Finanzdistrikt Pudong, fast alle laufen mit kleinen Thermoskannen herum, gefüllt mit heißem Wasser, übrigens das ganze Jahr über, also auch im Sommer. Na ja, wir sind eben unterschiedlich.',
          ],
        },
      ],
      tasks: [
        {
          id: 'III-1',
          label: '1.',
          instructions:
            'Sie hören einen Radiobericht über das Segelfliegen. Lesen Sie zuerst die Aufgabe. Sie hören dann den Text zweimal. Zuerst hören Sie den ganzen Text ohne Pausen, dann in kürzeren Abschnitten. Entscheiden Sie beim Hören, welche Aussage richtig (R) und welche falsch (F) ist. Kreuzen Sie die Antwort beim Hören an. (0) ist ein Beispiel für Sie.',
          passage: [{ style: 'title', text: 'Segelfliegen – Die Kunst, mit der Luft zu schwimmen' }],
          booleanLabels: ['R', 'F'],
          examples: rf(0, ['Ein Segelflugzeug kann sogar 120 km/h fliegen.'], 'R'),
          items: rf(
            1,
            [
              'Lea fliegt immer nur eine Stunde.',
              'Für das Segelfliegen braucht man ein Team.',
              'Von April bis Oktober verbringt Lea jeden Tag auf dem Flugplatz.',
              'Lea sagt ihre Verabredungen oft unerwartet ab.',
              'Beim Segelfliegen ist Trinken besonders wichtig.',
              'Warme Aufwinde zu suchen, ist harte Arbeit für Lea.',
              'Lea hat auf hohen Gebäuden immer Angst.',
              'Für Lea ist die Geschwindigkeit das Schönste am Fliegen.',
              'Lea hat einmal mit Hilfe eines Vogels den Aufwind gefunden.',
            ],
            'F R F F R R R F R',
          ),
        },
        {
          id: 'III-2',
          label: '2.',
          instructions:
            'Sie hören einen Text über den Erfinder von Garfield, dem berühmten Comic-Kater. Lesen Sie zuerst die Aufgabe. Sie hören dann den Text zweimal. Zuerst hören Sie den ganzen Text ohne Pausen, dann in kürzeren Abschnitten. Entscheiden Sie beim Hören, welche Aussage (A, B oder C) richtig ist. Kreuzen Sie die einzig richtige Lösung an. (0) ist ein Beispiel für Sie.',
          passage: [{ style: 'title', text: 'Kater Garfield' }],
          examples: [
            {
              id: '0',
              type: 'mcq',
              stem: 'Der US-Amerikaner Jim Davis ________.',
              options: [
                { key: 'A', text: 'feiert seinen 40. Geburtstag' },
                { key: 'B', text: 'ist der Erfinder von Garfield' },
                { key: 'C', text: 'liebt Lasagne' },
              ],
              answer: 'B',
            },
          ],
          items: questions(
            10,
            [
              { stem: 'Garfield ________.', options: ['hasst Menschen', 'ist ein Typ wie sein Erfinder', 'trägt den Namen des Großvaters von Jim Davis'] },
              { stem: 'Jim Davis ________.', options: ['dachte, dass „Garfield“ kein Erfolg wird', 'hatte Hunde nicht gern', 'lebte auf einer Farm, wo es viele Katzen gab'] },
              { stem: 'Garfield ________.', options: ['erschien erstmals in einem Kinderbuch', 'ist der meist verbreitete Comic in Zeitungen geworden', 'kam 1978 ins Guinnessbuch der Rekorde'] },
              { stem: 'Der Erfinder von Garfield ________.', options: ['drehte einen Film über Tiere', 'hat eine Firma, die Garfield-Produkte anbietet', 'verkaufte 1981 seine Firma'] },
              { stem: 'Jim Davis, der erfolgreiche Garfield-Zeichner ________.', options: ['arbeitet heute mit seinen Kindern', 'möchte mit den Geschichten von Garfield aufhören', 'erfindet die Katzengeschichten auch heute selbst'] },
              {
                stem: 'Garfield ist so populär geblieben, denn ________.',
                options: ['auch nach vierzig Jahren hat sich Garfield nicht verändert', 'auch Menschen werden immer gern essen und schlafen wie Garfield', 'Tiergeschichten sind immer beliebt'],
              },
            ],
            'C C B B C B',
          ),
        },
        {
          id: 'III-3',
          label: '3.',
          instructions:
            'Sie hören einen Text über eine chinesische Besonderheit. Lesen Sie zuerst die Aufgabe. Sie hören dann den Text zweimal. Zuerst hören Sie den ganzen Text ohne Pausen, dann in kürzeren Abschnitten. Ergänzen Sie die Sätze beim Hören. Schreiben Sie in jede Lücke nur eine Information. (0) ist ein Beispiel für Sie.',
          passage: [{ style: 'title', text: 'Warum Chinesen heißes Wasser trinken' }],
          examples: [
            {
              id: '0',
              type: 'short-text',
              prompt: 'In China sieht man überall Getränkeautomaten für heißes Wasser, sogenannte Heißwasserspender, sogar beim Fahren in den ________.',
              answer: { accepted: ['Schnellzügen'], match: 'exact-ci' },
            },
          ],
          items: [
            {
              id: '16',
              type: 'short-text',
              prompt: 'Heute sehen die modernen Heißwasserspender aus wie ________.',
              answer: { accepted: ['eine (moderne) Kaffeemaschine (mit Digitaldisplay)'], match: 'keywords', keywords: [['kaffeemaschine']] },
            },
            {
              id: '17',
              type: 'short-text',
              prompt: 'Das Trinken von heißem Wasser hat zwei Gründe: (1) ________',
              answer: { accepted: ['Tradition / traditionelle Gründe', 'medizinische Gründe / Gesundheit'], match: 'keywords', keywords: [['tradition', 'medizin', 'gesundheit']] },
              reviewNote: 'A 17. és 18. itemre adott két helyes válasz sorrendje mindegy.',
            },
            {
              id: '18',
              type: 'short-text',
              prompt: 'Das Trinken von heißem Wasser hat zwei Gründe: (2) ________',
              answer: { accepted: ['medizinische Gründe / Gesundheit', 'Tradition / traditionelle Gründe'], match: 'keywords', keywords: [['tradition', 'medizin', 'gesundheit']] },
              reviewNote: 'A 17. és 18. itemre adott két helyes válasz sorrendje mindegy.',
            },
            {
              id: '19',
              type: 'short-text',
              prompt: 'Bin Yang erklärt, kalte Speisen und Getränke sind schlecht für ________.',
              answer: { accepted: ['die Muskeln des Magens', 'den Magen', 'die Verdauung'], match: 'keywords', keywords: [['magen', 'verdau']] },
              reviewNote: 'Az útmutató szerint a válasz nem elvárt, de elfogadható.',
            },
            {
              id: '20',
              type: 'short-text',
              prompt: 'Zum Leben der Chinesen gehören im Alltag neben den Heißwasserspendern auch die ________.',
              answer: { accepted: ['(passenden) Thermoskannen'], match: 'keywords', keywords: [['thermos']] },
            },
            {
              id: '21',
              type: 'short-text',
              prompt: 'Man trinkt heißes Wasser nicht nur bei kaltem Wetter, sondern auch ________.',
              answer: { accepted: ['das ganze Jahr über', '(auch) im Sommer'], match: 'keywords', keywords: [['sommer', 'ganze jahr', 'ganzen jahr', 'jahr']] },
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
          title: 'Kein langweiliges Wochenende, bitte!',
          instructions:
            'Sie bekommen von Lara, Ihrer deutschen Freundin, eine E-Mail. Sie hat keine Idee, wie sie das Wochenende mit ihren Freunden sinnvoll verbringen kann. Hier ist ein Auszug aus ihrer E-Mail:',
          passage: [
            {
              text: '„Ich und meine Freunde gingen die letzten Monate nur in Fast-Food-Restaurants oder haben draußen gechillt.* Wir gingen öfters auch ins Kino. Aber das alles wird uns viel zu langweilig und uns fällt nichts ein, was wir am Wochenende machen könnten. Was kann man denn als Jugendlicher alles unternehmen?“',
            },
            { style: 'note', text: '*chillen: sich entspannen, faulenzen' },
          ],
          items: [
            {
              id: '1',
              type: 'production',
              prompt: ['Schreiben Sie an Lara eine Antwort und geben Sie ihr Rat. Gehen Sie dabei auf die folgenden Punkte ein:'],
              contentPoints: [
                'Grund Ihres Schreibens.',
                'Was haben Sie mit Ihren Freunden an den Wochenenden gemacht?',
                'Geben Sie Tipps, wie Lara und ihre Freunde ein Wochenende spannender machen können.',
              ],
              promptAfter: ['Die Reihenfolge der Leitpunkte können Sie selbst bestimmen. Verwenden Sie für Ihren Text 80-100 Wörter.'],
              minWords: 80,
              maxWords: 100,
              opening: 'Hallo Lara,',
              register: 'informal-message',
              rubricId: 'erettsegi-kozep-1',
              criteria: DE_CRITERIA_1,
            },
          ],
        },
        {
          id: 'IV-2',
          label: '2.',
          title: '„Rund ums Geld“',
          instructions: 'Im Internet haben Sie einen interessanten Artikel zum Thema Umgang mit Geld gefunden. Hier ist ein Auszug daraus:',
          passage: [
            {
              text: '„Rund ums Geld“ ist ein Rollenspiel, bei dem Schüler viel über den Umgang mit Geld erfahren. Ein neues Handy, schöne Klamotten oder mit Freunden weggehen – es gibt viele Möglichkeiten, sein Erspartes oder Verdientes auszugeben. Oftmals weiß man am Ende des Monats nicht, wo das Geld geblieben ist. Deshalb ist es schon für Schüler wichtig, den Umgang mit Geld zu trainieren und rechtzeitig zu lernen, wie man Einnahmen und Ausgaben planen und kontrollieren kann.',
            },
          ],
          items: [
            {
              id: '2',
              type: 'production',
              prompt: ['Schreiben Sie Ihre Meinung zum Thema in einem Forumsbeitrag. Gehen Sie dabei auf die folgenden Punkte ein:'],
              contentPoints: [
                'Wie finden Sie die Idee, den Umgang mit Geld spielerisch zu üben? Begründen Sie Ihre Meinung!',
                'Können Sie Ihr Geld gut einteilen? Warum (nicht)?',
                'Was und/oder wer beeinflusst Sie beim Geldausgeben?',
                'Wie können Sie (oder Ihre Freunde) Ihr (ihr) Taschengeld aufbessern?',
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
