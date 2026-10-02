// Német nyelv, középszintű írásbeli érettségi, 2026. május 8. (K2611), Oktatási Hivatal.
// Transcribed verbatim from the feladatlap and its javítási-értékelési útmutató (answer key,
// conversion tables, listening transcripts). Decorative photos are left out.
import type { ExamPaper } from '../types'
import { choices, DE_CRITERIA_1, DE_CRITERIA_2, DE_LISTENING_INTRO, DE_NOTICES_HU, DE_WRITING_INTRO, gapMcqs, rf } from './deKozep.ts'

const paper: ExamPaper = {
  id: 'erettsegi-de-kozep-2026-majus',
  type: 'erettsegi',
  language: 'de',
  level: 'kozep',
  sittingLabelHu: '2026. május',
  source: 'Oktatási Hivatal: Német nyelv, középszintű írásbeli vizsga, 2026. május 8. (K2611) — feladatlap és javítási-értékelési útmutató.',
  noticesHu: DE_NOTICES_HU,
  sections: [
    {
      id: 'I',
      kind: 'reading',
      titleHu: 'I. Olvasott szöveg értése',
      timeLimitMin: 60,
      // útmutató p. 4: feladatpont 0–25 → vizsgapont
      conversion: [0, 1, 3, 4, 5, 7, 8, 9, 11, 12, 13, 15, 16, 17, 18, 20, 21, 22, 24, 25, 26, 28, 29, 30, 32, 33],
      tasks: [
        {
          id: 'I-1',
          label: '1.',
          instructions:
            'Sie lesen jetzt ein Interview mit Klara Bühl. Lesen Sie zuerst die Antworten des Interviews (A-L) und suchen Sie dann die passende Frage (1-9). Achtung! Es gibt eine Frage zu viel. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: '»Sportler. Mensch. Klara.«' },
            { text: 'Klara Bühl spielt in der deutschen Fußballnationalmannschaft.' },
            { text: '{{0}} Bühl: Für mich heißt das: Ich bin Sportlerin, aber auch Sportlerinnen bleiben Menschen. Wir machen Fehler und brauchen eine Balance zwischen Fußball und normalem Leben.' },
            { text: '{{1}} Bühl: Da kann ich mich schwer entscheiden. Aber in den Spielen bereite ich öfter vor, als dass ich selbst treffe. Vielleicht ist mir das doch lieber.' },
            { text: '{{2}} Bühl: Wir müssen erst mal in der Gruppenphase gut spielen. Wichtig ist, das erste Spiel zu gewinnen.' },
            { text: '{{3}} Bühl: Ja. Was auf dem Fußballplatz passiert, bleibt auf dem Fußballplatz. Nach dem Spiel muss man das Unangenehme vergessen. Wir können uns gut über private Themen unterhalten.' },
            { text: '{{4}} Bühl: Sie freuen sich sehr! Diese Geschenke sind besonders, weil sie Zeit und Liebe kosten.' },
            { text: '{{5}} Bühl: Nein, die Zuschauer motivieren mich! Sie geben mir Energie. Je mehr Leute kommen, desto besser.' },
            { text: '{{6}} Bühl: Ich habe das akzeptiert. Als Profifußballerin kann ich von meinem Sport leben.' },
            { text: '{{7}} Bühl: Ich würde gern öfter in großen Stadien spielen und hoffe, dass unsere Spiele öfter im Fernsehen übertragen werden.' },
            { text: '{{8}} Bühl: Ein gutes Buch und meinen Lieblingshoodie, also einen warmen Kapuzenpullover.' },
            { text: '{{9}} Bühl: Manchmal kommt es vor, dass ich nicht an Fußball denken will, dann ziehe ich mir ein eigenes Kleidungsstück an. Das hilft mir beim Entspannen.' },
          ],
          bankTitle: 'FRAGEN',
          bank: [
            { key: 'A', text: 'Der Fußball der Frauen wird immer populärer. Bist du nervöser, wenn viele Fans da sind?' },
            { key: 'B', text: 'Du schenkst deinen Mitspielerinnen immer wieder selbstgemachte Sachen, etwa kleine Tierfiguren. Wie finden sie sie?' },
            { key: 'C', text: 'Was bedeutet dein Motto: »Sportler. Mensch. Klara.«?' },
            { key: 'D', text: 'Fußballerinnen verdienen viel weniger Geld als Fußballer. Stört dich das?' },
            { key: 'E', text: 'In der Nationalmannschaft triffst du auf Spielerinnen, die in der Bundesliga deine härtesten Konkurrentinnen sind. Versteht ihr euch trotzdem?' },
            { key: 'F', text: 'Warum brauchst du einen eigenen Pullover?' },
            { key: 'G', text: 'Was sind eure Ziele bei der kommenden Europameisterschaft?' },
            { key: 'H', text: 'Was magst du lieber: ein Tor vorbereiten oder ein Tor schießen?' },
            { key: 'J', text: 'Was nimmst du zur Europameisterschaft mit?' },
            { key: 'K', text: 'Was wünschst du dir noch für den Frauenfußballsport?' },
            { key: 'L', text: 'Wie kamst du auf die Idee, Fußballspielerin zu werden?' },
          ],
          unusedBankCount: 1,
          examples: choices(0, 'C'),
          items: choices(1, 'H G E B A D K J F'),
        },
        {
          id: 'I-2',
          label: '2.',
          instructions:
            'Lesen Sie den Text über den Zauberer Jan Logemann und entscheiden Sie, welche Aussage richtig (R) und welche falsch (F) ist. Kreuzen Sie die Antwort in der Tabelle an. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'So arbeitet ein Zauberer*' },
            {
              text: 'Der Zauberer Jan Logemann arbeitet mit Karten. Er hat schon als Kind mit ersten Zaubertricks angefangen und gemeinsam mit seinem Bruder und einem Freund kleine Shows organisiert. Erst für seine Familie, dann bei unterschiedlichen Schulfesten oder Vereinsfeiern.',
            },
            {
              text: 'Er erzählt: „Eigentlich war mein Plan, Kinderarzt zu werden, ich habe Medizin studiert. Zaubern war mein Hobby. Die meisten Zauberkünstler fangen mit dem Hobby an, wenn sie klein sind. Irgendjemand zeigt ihnen einen Trick oder schenkt ihnen einen Zauberkasten zu Weihnachten, und dann geht’s los.” Neben dem Studium stand Logemann regelmäßig als Zauberkünstler auf der Bühne. Im Jahr 2013 gewann er dann die Weltmeisterschaft in der Kartentrick-Zauberei. So wurde die Zauberei zu seinem Beruf.',
            },
            {
              text: 'Jan ist selbstständiger Zauberer. Das bedeutet, dass er nicht bei einer Firma fest angestellt ist, sondern seinen Arbeitsalltag selbst organisiert. Dazu gehören verschiedene Tätigkeiten: Er tritt in verschiedenen Theatern auf, aber oft wird er auch für besondere Feiern gebucht: Hochzeiten, Geburtstage oder Firmenfeste.',
            },
            {
              text: 'Jans Zaubershow findet heute in einem kleinen Theater in Hamburg statt. Er begrüßt zunächst fröhlich das Publikum. Er startet mit einem Witz und bringt die Gäste zum Lachen, mit einer Art Aufwärmübung, bei der alle mitmachen müssen. Jans Spezialität sind Tricks, die er direkt vor den Gästen aufführt. Keine große Bühne und keine Illusionen, sondern absolute Nähe. Da muss er superschnell und fingerfertig sein, das Publikum immer wieder überraschen und die Blicke der Menschen so leiten, dass sie einfach nicht verstehen, was da vor ihren Augen passiert. Nach einer knappen Stunde gibt es eine Pause. »Ich habe schon einmal eine Show von Jan gesehen«, erzählt eine Besucherin. »Ich hatte gehofft, dass ich beim zweiten Mal ein paar Tricks durchschaue, aber das klappt einfach nicht.« Während die erwachsenen Gäste im Theater etwas essen und trinken, übt Jan in der Pausenzeit mit den Kindern einen kleinen Trick ein. Der wird den Erwachsenen im zweiten Teil der Zaubershow gemeinsam präsentiert. Die kleinen Zuschauerinnen und Zuschauer verlassen das Theater, allen ist ein Lächeln ins Gesicht geschrieben. Und ganz häufig hört man den Satz: Wie macht er das bloß …?',
            },
            { style: 'note', text: '*Ein Zauberer oder Zauberkünstler zeigt Tricks und Illusionen.' },
          ],
          booleanLabels: ['R', 'F'],
          examples: rf(0, ['Jan Logemann ist auch in der Kindheit mit Zaubertricks aufgetreten.'], 'R'),
          items: rf(
            10,
            [
              'Jan hatte immer vor, Zauberer zu werden.',
              'Jan gelang ein großer Sieg als Kartenzauberkünstler.',
              'Heutzutage ist Jan als Zauberer bei einem Theater angestellt.',
              'Die Zaubershow im Hamburger Theater fängt mit etwas Spaß an.',
              'Die Zuschauer der Show können die Zaubertricks ganz nah zur Bühne beobachten.',
              'Jans Publikum kann am Ende der Shows alle Tricks durchschauen.',
              'In der Showpause beschäftigt sich Jan mit den Kindern aus dem Publikum.',
            ],
            'F R F R R F R',
          ),
        },
        {
          id: 'I-3',
          label: '3.',
          instructions:
            'Welcher Teilsatz passt in den Text? Tragen Sie den entsprechenden Buchstaben (A-L) in die Rubrik (17-25) ein. Achtung! Es gibt einen Buchstaben zu viel. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'Taschengeld in Deutschland' },
            {
              text: 'Etwas mehr als die Hälfte aller Kinder in Deutschland bekommt regelmäßig Taschengeld. Das bedeutet rund drei Milliarden Euro, {{0}}, die die Kinder und die Jugendlichen hierzulande ausgeben können. Durchschnittlich bekommen sie 17,93 Euro im Monat. Kleinere Kinder starten mit wenigen Euro, {{17}}. In den meisten Familien ist das Taschengeld dem Alter angepasst. Zehnjährige bekommen in der Regel zwischen 10 und 20 Euro monatlich, manche 13-Jährige schon rund 30 Euro. Viele bekommen auch {{18}} oder Festen wie Ostern oder Weihnachten.',
            },
            {
              text: 'Regelmäßiges Taschengeld war nicht immer üblich, {{19}} begannen einige Eltern in Deutschland, ihren Kindern wöchentlich Geld zu geben. Damals bekamen aber nicht alle Kinder Taschengeld – und wenn, dann oft nur wenige Pfennige (heute Cent), denn {{20}} und mit ihren Ausgaben umzugehen. Sparbücher und Sparkonten für Kinder wurden erstmals besonders beliebt. Eltern eröffneten für das Kind bei einer Bank ein Konto, {{21}}. Für welche Produkte die Kinder ihr Geld ausgeben, {{22}}. Es gibt aber einige Trends: Sieben von zehn kaufen sich am liebsten Süßigkeiten. Außerdem lesen viele gern, die Hälfte aller Kinder kauft sich von ihrem Geld {{23}}. Mädchen geben etwas mehr Geld für Kleidung, Bücher oder Kosmetik und Körperpflege aus, während Jungs mehr Geld für Spielekonsolen und Spiele, Sammelfiguren und Sammelkarten ausgeben. Mit eigenem Taschengeld lernt man bei jedem Einkauf, was Sachen kosten, wie schnell man sein Geld los ist und wie lange es dauert, bis man auf etwas gespart hat. Man macht Fehler {{24}}, dass man sein Geld für das Falsche ausgegeben hat – und lernt daraus. Im Schulunterricht kommt es in der Regel nicht vor, {{25}}. Diese Fähigkeit sollte man also am besten im echten Leben üben.',
            },
          ],
          bankTitle: 'SÄTZE',
          bank: [
            { key: 'A', text: 'auf das sie regelmäßig Geld eingezahlt haben' },
            { key: 'B', text: 'erst vor etwa 65 Jahren' },
            { key: 'C', text: 'Geldgeschenke zu Geburtstagen' },
            { key: 'D', text: 'ist so unterschiedlich wie die Kinder selbst' },
            { key: 'E', text: 'Kinder sind wichtig für die Wirtschaft' },
            { key: 'F', text: 'sie sollten lernen, zu sparen und zu rechnen' },
            { key: 'G', text: 'so groß ist die Geldsumme' },
            { key: 'H', text: 'und dann wird es schnell mehr' },
            { key: 'J', text: 'und man ärgert sich' },
            { key: 'K', text: 'wie man mit Geld umgeht' },
            { key: 'L', text: 'Zeitschriften und Comics' },
          ],
          unusedBankCount: 1,
          examples: choices(0, 'G'),
          items: choices(17, 'H C B F A D L J K'),
        },
      ],
    },
    {
      id: 'II',
      kind: 'language-use',
      titleHu: 'II. Nyelvhelyesség',
      timeLimitMin: 30,
      // útmutató p. 6: feladatpont 0–20 → vizsgapont
      conversion: [0, 1, 2, 3, 4, 5, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 14, 15, 16, 17, 18],
      tasks: [
        {
          id: 'II-1',
          label: '1.',
          instructions: 'Was passt in den Text? Unterstreichen Sie das richtige Wort. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'Das größte Puzzle der Welt' },
            { text: 'In einem Hotel in Italien {{0}} das größte Puzzle der Welt zusammengebaut: Es hat 60.000 Teile!' },
            {
              text: 'Dieses Puzzle hat nicht auf dem Spielteppich oder auf dem Wohnzimmertisch Platz, {{1}} es ist 2,62 Meter hoch, also so hoch wie dein Zimmer, und 9,68 Meter lang. Das ist etwa so lang wie ein Lkw. Das Zusammenbauen dauert ziemlich lange – und {{2}} braucht man Geduld.',
            },
            {
              text: 'Der Mann, der so viel Geduld hat, heißt Mariusz Ślizewski, ist 33 Jahre alt und {{3}} aus Polen. Das Puzzle hat er schon im Oktober 2023 gekauft und von Dezember 2023 bis Juni 2024 zusammengebaut. Einer italienischen Zeitung hat er erzählt, {{4}} er unter der Woche jeden Tag etwa drei Stunden daran gebaut hat, am Wochenende sogar bis zu sieben Stunden täglich.',
            },
            {
              text: 'Dann hat Mariusz das Puzzle in {{5}} eigenen Auto zu dem Hotel im Norden von Italien gebracht. Dafür musste er aber dreimal fahren. Im Hotel hat er das Puzzle dann ungefähr vier Monate lang montiert.',
            },
            {
              text: 'Das riesengroße Puzzle {{6}} eigentlich aus 60 Puzzles mit jeweils 1000 Teilen. Das Besondere ist, dass man diese Einzelpuzzles zusammenbauen {{7}}. Und was stellt das Puzzle dar? Eine Weltkarte und mehr als 1000 berühmte Bauwerke von allen Kontinenten.',
            },
          ],
          examples: gapMcqs(0, [['werde', 'werden', 'wurde', 'würde']], 'C'),
          items: gapMcqs(
            1,
            [
              ['da', 'dann', 'denn', 'deshalb'],
              ['daran', 'dafür', 'damit', 'davon'],
              ['geboren', 'geht', 'kommt', 'wohnt'],
              ['dass', 'ob', 'weil', 'wenn'],
              ['deinem', 'ihrem', 'Ihrem', 'seinem'],
              ['besteht', 'braucht', 'hat', 'steht'],
              ['durfte', 'konnte', 'mochte', 'wollte'],
            ],
            'C B C A D A B',
          ),
        },
        {
          id: 'II-2',
          label: '2.',
          instructions:
            'Was passt in den Text? Schreiben Sie den entsprechenden Buchstaben (A-P) in die Rubrik (8-14). Achtung! Es gibt sieben Buchstaben zu viel. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: '1301 verschiedene Sorten* Eis' },
            {
              text: 'Stell dir vor, du bist in einem Eissalon und kannst aus mehr {{0}} tausend Sorten dein Lieblingseis aussuchen! So viele Eissorten hat Celal Karaarslan nämlich hergestellt und {{8}} einen Weltrekord aufgestellt.',
            },
            {
              text: 'Celal Karaarslan ist ein Eismacher {{9}} Salzburg in Österreich. Er liebt Eis so sehr, dass er sehr viele verschiedene Sorten kreiert hat – genau 1301 Stück. Das sind so viele, dass man fast vier Jahre lang jeden Tag ein anderes Eis probieren {{10}}!',
            },
            {
              text: 'Um so viele Eissorten zu machen, hat Celal Karaarslan sechs Jahre lang an den Rezepten gearbeitet. Er hat sehr kreative Zutaten benutzt. {{11}} du schon mal Eis mit Koriander, Ingwer oder sogar Paprika probiert? Vielleicht nicht, aber genau solche ungewöhnlichen Sorten hat er gemacht. Auch Spinateis gehört {{12}}.',
            },
            {
              text: 'Karaarslan hat den Weltrekord aber nicht in Salzburg, sondern in {{13}} Türkei aufgestellt. Dort hat er nämlich noch zwei weitere Eissalons. Es hat 18 Tage gedauert, um alle Sorten herzustellen und anzubieten. Mit den vielen Sorten hat er bewiesen, dass {{14}} mit Fantasie und Ausdauer Eis ganz besonders machen kann.',
            },
            { style: 'note', text: '* Sorte: Art, Geschmacksrichtung wie Schokolade, Vanille, Pistazien' },
          ],
          bank: [
            { key: 'A', text: 'AN' },
            { key: 'B', text: 'AUS' },
            { key: 'C', text: 'ALS' },
            { key: 'D', text: 'DAMIT' },
            { key: 'E', text: 'DAVON' },
            { key: 'F', text: 'DAZU' },
            { key: 'G', text: 'DER' },
            { key: 'H', text: 'DIE' },
            { key: 'I', text: 'HABEN' },
            { key: 'K', text: 'HAST' },
            { key: 'L', text: 'KÖNNEN' },
            { key: 'M', text: 'KÖNNTE' },
            { key: 'N', text: 'MAN' },
            { key: 'O', text: 'MUSSTE' },
            { key: 'P', text: 'SIE' },
          ],
          unusedBankCount: 7,
          examples: choices(0, 'C'),
          items: choices(8, 'D B M K F G N'),
        },
        {
          id: 'II-3',
          label: '3.',
          instructions:
            'Was passt in den Text? Schreiben Sie den entsprechenden Buchstaben (A-H) in die Rubrik (15-20). Achtung! Es gibt einen Buchstaben zu viel. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'Interview mit Tennisspieler Jan-Lennard Struff' },
            { text: 'Jan-Lennard Struff gehört zu Deutschlands besten Tennisspielern. Wir haben mit ihm beim Weissenhof-Turnier in Stuttgart gesprochen.' },
            { text: 'Reporter: Was ist der wertvollste Pokal*, {{0}}?' },
            { text: 'Jan-Lennard Struff: Ich habe noch nicht so viele Pokale geholt. Mit 21 Jahren wurde ich deutscher Meister. Das war ganz schön.' },
            { text: 'Reporter: Welches Spiel in deiner Karriere hat dir am meisten Spaß gemacht?' },
            { text: 'Struff: Das coolste Spiel, {{15}}, war gegen Borna Ćorić. Das war bei French Open 2019 in Paris. Es waren so viele Zuschauer da, die Stimmung war super.' },
            { text: 'Reporter: Wie fühlst du dich, {{16}}?' },
            { text: 'Struff: Leider passiert einem das beim Tennis sehr oft – ich ärgere mich dann meistens. Aber ich weiß, {{17}}.' },
            { text: 'Reporter: Wie motivierst du dich, {{18}}, nachdem du verloren hast?' },
            {
              text: 'Struff: Das fällt manchmal ein bisschen schwer, vor allem wenn ich knapp verloren oder ich nicht gut gespielt habe. Aber ich bin sehr motiviert. Ich will immer auf den Platz zurückkommen {{19}}.',
            },
            { text: 'Reporter: Hattest du in deiner Kindheit einen Lieblingsspieler?' },
            {
              text: 'Struff: Pete Sampras. Er war aktiver Tennisspieler, als ich noch sehr jung war. Und {{20}}, professionell Tennis zu spielen, hatte er leider schon aufgehört.',
            },
            { style: 'note', text: '*ein Pokal' },
          ],
          bank: [
            { key: 'A', text: 'als ich dann anfing' },
            { key: 'B', text: 'auch dann weiter Tennis zu spielen' },
            { key: 'C', text: 'den du bisher gewonnen hast' },
            { key: 'D', text: 'das ich je gespielt habe' },
            { key: 'E', text: 'dass ich etwas daraus lernen kann' },
            { key: 'F', text: 'und es besser machen' },
            { key: 'G', text: 'sehr stolz ist' },
            { key: 'H', text: 'wenn du ein Match verlierst' },
          ],
          unusedBankCount: 1,
          examples: choices(0, 'C'),
          items: choices(15, 'D H E B F A'),
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
        storagePath: 'erettsegi-de-kozep-2026-majus.mp3',
        durationSec: 1800,
        // Task starts: the ~60 s reading pause of each task found by silence detection, minus the length of its announcement (approximate, ±10 s).
        taskMarkers: [
          { taskId: 'III-1', startSec: 70 },
          { taskId: 'III-2', startSec: 613 },
          { taskId: 'III-3', startSec: 1212 },
        ],
      },
      // útmutató p. 9: feladatpont 0–20 → vizsgapont
      conversion: [0, 2, 3, 5, 7, 8, 10, 12, 13, 15, 17, 18, 20, 21, 23, 25, 26, 28, 30, 31, 33],
      transcripts: [
        {
          taskId: 'III-1',
          title: 'Kürbis',
          paragraphs: [
            'Kürbis ist ein beliebtes Gemüse im Herbst. Viele Menschen freuen sich auf die Zeit, wenn die Kürbisse reif sind. Man kann sie als Dekoration benutzen, zum Beispiel für Halloween oder auch essen. Sie sind lecker und gesund. Kürbis kommt ursprünglich aus Südamerika, aber heute findet man ihn überall auf der Welt. Es gibt mehr als 800 verschiedene Arten. Einige sind orange und rund, wie z. B. der Hokkaido-Kürbis. Andere sind gelb und birnenförmig, wieder andere sind braun. Sie wachsen auch in Deutschland gut, seit 2005 sind die Anbauflächen dreimal größer geworden. Die meisten Kürbisse wachsen in Bayern und in Nordrhein-Westfalen.',
            'Viele Kürbissorten sind zwischen September bis Oktober reif. Einige sind aber auch schon Mitte August „fertig“, je nach Sorte und Standort. Woran erkennt man, dass ein Kürbis reif ist? Wichtig ist seine Farbe. Wenn das Gemüse keine grünen Stellen mehr hat, kann es ohne Probleme gegessen werden. Je kräftiger die Farbe, desto besser der Geschmack.',
            'Bei richtiger Lagerung kann man Winterkürbisse bis zu acht Monate lang halten: Dafür soll man das Gemüse nicht waschen und der Lagerort sollte zehn bis 15 Grad Celsius haben. Um zu prüfen, ob ein Kürbis noch gut ist, soll man ein Stück des rohen Kürbisfleisches probieren. Wenn es bitter schmeckt, soll man das Gemüse nicht mehr als Lebensmittel verwenden.',
            'Kürbis ist ein gesundes Gemüse, es hat wenig Energie, das bedeutet, es hat nicht viele Kalorien. Kürbis besteht zu 90 % aus Wasser, außerdem enthält er viele Vitamine, die wichtig für unseren Körper sind.',
            'Kürbisse sind sehr beliebt. Man kann sie kochen, braten oder backen, mit diesem Gemüse geht eigentlich alles – von der Suppe bis zum Kuchen. Köche lieben sie auch, denn sie können damit viele leckere Gerichte zubereiten.',
          ],
        },
        {
          taskId: 'III-2',
          title: '„Segeln ist mein Leben“',
          paragraphs: [
            'Heute erzählt uns Sanni Beucke, die Weltklasse-Seglerin, über ihren nächsten Wettbewerb.',
            '- Die Regatta Vendée Globe führt 45.000 Kilometer nonstop um die Welt. Warum willst du dabei mitmachen?',
            '- Es ist sehr hart, so lange allein zu sein. Die Regatta dauert Monate. Das ist die größte Herausforderung in dieser Sportart.',
            '- Die Regatta findet alle vier Jahre statt. Was musst du vorbereiten, damit es mit deiner Teilnahme 2028 klappt?',
            '- Vor allem brauche ich Geld, denn es ist wahnsinnig teuer. Es dauert Jahre, finanzielle Unterstützer zu suchen, die mir helfen, das viele Millionen Euro teure Boot kaufen zu können.',
            '- Erklär doch mal für alle, die nicht segeln: Was ist Einhand-Segeln?',
            '- Es bedeutet, dass man allein an Bord ist, also solo segelt. Man darf aber beide Hände benutzen, – nicht nur eine.',
            '- Wie sieht dein Trainingsalltag aus, wenn du dich auf eine Einhand-Regatta wie die Vendée Globe vorbereitest?',
            '- Ich mache Krafttraining, Ausdauersport und natürlich Segel-Trainings. Bei einem Segel-Training bin ich etwa eine halbe Woche auf dem Wasser. Wenn ich wiederkomme, bin ich total müde und kaputt. Und dann mache ich den Rest der Woche nur Büroarbeit und schlafe richtig viel.',
            '- Und wie bereitet man sich mental auf solch ein Rennen vor?',
            '- Ich probiere, vor einem Rennen ganz viel Spaß zu haben, eine Menge mit meinen Freunden zu unternehmen, zu essen, worauf ich Lust habe.',
            '- Was motiviert dich in schwierigen Momenten auf See, wenn du ganz allein bist?',
            '- Die kleinsten Kleinigkeiten können mich freuen und mir Kraft geben: Wenn ich nach Tagen plötzlich einen Vogel am Himmel entdecke. Wenn mich ein Delfin im Wasser begleitet. Wenn ich es einfach schaffe, mir etwas Warmes zu essen zu machen. Und natürlich die Sonnenauf- und -untergänge.',
            '- Wir treffen uns heute an der Alster in Hamburg. Eigentlich lebst du in der Bretagne in Frankreich. Warum bist du dorthin gezogen?',
            '- In der Bretagne gibt es perfekte Segelbedingungen. Es ist eine sehr abwechslungsreiche Küste, es gibt wechselnde Strömungen und viele verschiedene Winde. Segelnde aus der ganzen Welt leben dort. Ich fühle mich wohl unter so vielen Gleichgesinnten.',
            '- Welches Wetter magst du lieber: eine stürmische Wolkenfront oder einen blauen Sommerhimmel?',
            '- Zum Badengehen und Sonnen natürlich den Sommerhimmel. Aber ich bin auch immer gerne schnell am Ziel, dafür sind die Wolken mit kräftigem Wind besser.',
            '- Beschreib mal in drei Wörtern, wie du dich draußen auf dem Wasser bei guten Segelbedingungen fühlst.',
            '- Ui, ich schaffe vier: »Einfach wie ich selbst.«',
          ],
        },
        {
          taskId: 'III-3',
          title: 'Kinder wählen das beste Buch',
          paragraphs: [
            'Eine Jury entscheidet meistens darüber, wer einen Preis bekommt und wer nicht. Bei dem Wort Jury denkt man an wichtige Persönlichkeiten und in der Regel an Erwachsene. In Hamburg-Wilhelmsburg aber sind Kinder die Jury: Alle Grundschülerinnen und Grundschüler aus diesem Hamburger Stadtteil können mitmachen und jedes Jahr entscheiden, wer den Kinderbuchpreis bekommt. Für den Preis sind zehn Bücher vorgeschlagen.',
            'In den vergangenen Wochen haben die Kinder aus den zweiten und dritten Klassen die Bücher in der Schule gelesen. Jedes Kind hat mindestens drei Bücher gelesen.',
            'Auf Zetteln schreiben die Kinder dann auf, welche Bücher ihnen am besten gefallen haben und warum. Sie geben den Büchern auch Sterne von eins bis fünf. Die zehn Bücher, die zur Auswahl stehen, hat Projektleiterin Maren Töbermann vorher mit einer Erwachsenenjury ausgewählt. Und dabei hat man auf eine möglichst bunte Auswahl geachtet.',
            'Was für Bücher den Kindern der Jury gefallen, ist natürlich ganz unterschiedlich. Ein Kind sagt zum Beispiel: „Ich mag Bücher, wo es Action und sowas gibt.“',
            'Lehrerin Leonie Delfs spricht in der Schulstunde nochmal mit den Kindern über die Bücher. Manche der Kinder, sagt sie, haben schon ganz viel Lust am Lesen mitgebracht. Die anderen konnten die Lehrerinnen durch das Projekt zum Lesen motivieren. „Wir haben die Kinder aus den zweiten und dritten Klassen teilweise auch in Kleingruppen lesen lassen, dadurch bekamen manche Kinder mehr Lust.“',
            'Der Autor oder die Autorin des Gewinnerbuches bekommt im Herbst einen Wanderpokal, dazu ein Preisgeld von 1.000 Euro. Für die Kinderjurys gibt es jedes Jahr Buchpreise, die sich die Kinder noch vor den Sommerferien in der Bücherhalle abholen können. Und dazu das gute Gefühl, dass sie selbst darüber bestimmen konnten, wer den Kinderbuchpreis bekommt. Es macht die Kinder stolz, dass sie über das Gewinnerbuch entscheiden können und nicht die Erwachsenen.',
          ],
        },
      ],
      tasks: [
        {
          id: 'III-1',
          label: '1.',
          instructions:
            'Sie hören einen Text über ein beliebtes Gemüse. Lesen Sie zuerst die Aufgabe. Sie hören dann den Text zweimal. Zuerst hören Sie den ganzen Text ohne Pausen, dann in kürzeren Abschnitten. Ergänzen Sie die Sätze beim Hören. Schreiben Sie in jede Lücke nur eine Information. (0) ist ein Beispiel für Sie.',
          passage: [{ style: 'title', text: 'Kürbis' }],
          examples: [
            {
              id: '0',
              type: 'short-text',
              prompt: 'Kürbisse kann man nicht nur essen, sie können auch schöne Dekorationen für ________ sein.',
              answer: { accepted: ['Halloween'], match: 'exact-ci' },
            },
          ],
          items: [
            { id: '1', type: 'short-text', prompt: 'Kürbis stammt aus ________ .', answer: { accepted: ['Südamerika'], match: 'keywords', keywords: [['südamerika', 'suedamerika']] } },
            {
              id: '2',
              type: 'short-text',
              prompt: 'Kürbisse werden meistens zwischen ________ und ________ reif.',
              answer: { accepted: ['September und Oktober'], match: 'keywords', keywords: [['september'], ['oktober']] },
            },
            { id: '3', type: 'short-text', prompt: 'An der ________ kann man erkennen, ob ein Kürbis reif ist.', answer: { accepted: ['Farbe'], match: 'keywords', keywords: [['farbe']] } },
            {
              id: '4',
              type: 'short-text',
              prompt: 'Winterkürbisse kann man monatelang halten, wenn man sie nicht ________ .',
              answer: { accepted: ['wäscht'], match: 'keywords', keywords: [['wäsch', 'wasch']] },
            },
            {
              id: '5',
              type: 'short-text',
              prompt: 'Wenn das Gemüse einen ________ Geschmack hat, soll man es lieber nicht essen.',
              answer: { accepted: ['bitteren'], match: 'keywords', keywords: [['bitter']] },
            },
            {
              id: '6',
              type: 'short-text',
              prompt: 'Das Gemüse Kürbis ist arm an ________ .',
              answer: { accepted: ['Kalorien', 'Energie'], match: 'keywords', keywords: [['kalorie', 'energie']] },
            },
            {
              id: '7',
              type: 'short-text',
              prompt: 'Aus Kürbis kann man Gerichte, wie z. B. ________ zubereiten.',
              answer: { accepted: ['Suppe', 'Kuchen'], match: 'keywords', keywords: [['suppe', 'kuchen']] },
            },
          ],
        },
        {
          id: 'III-2',
          label: '2.',
          instructions:
            'Sie hören ein Interview mit einer Weltklasse-Seglerin. Lesen Sie zuerst die Aufgabe. Sie hören dann den Text zweimal. Zuerst hören Sie den ganzen Text ohne Pausen, dann in kürzeren Abschnitten. Entscheiden Sie beim Hören, worüber gesprochen wird, und markieren Sie die Aussage mit X. Wenn über etwas nicht gesprochen wird, lassen Sie das Kästchen leer. Insgesamt können Sie 6-mal ankreuzen. (0) ist ein Beispiel für Sie.',
          passage: [{ style: 'title', text: '„Segeln ist mein Leben“' }, { text: 'Im Interview wird darüber gesprochen,' }, { style: 'note', text: '*Regatta = Bootsrennen, Bootswettkampf' }],
          rules: { multiSelectPenalty: true },
          items: [
            {
              id: '8-13',
              type: 'multi-select',
              exampleOption: 'warum Sanni an der Regatta* um die Welt teilnimmt.',
              options: [
                { key: 'a', text: 'in welchem Monat die Regatta beginnt.' },
                { key: 'b', text: 'wie oft die Regatta organisiert wird.' },
                { key: 'c', text: 'wie viele Teilnehmer nächstes Mal an der Regatta starten werden.' },
                { key: 'd', text: 'wie Sanni ihr Boot finanzieren kann.' },
                { key: 'e', text: 'was Einhand-Segeln bedeutet.' },
                { key: 'f', text: 'wie Sanni für die Einhand-Regatta trainiert.' },
                { key: 'g', text: 'bei welcher Firma Sanni arbeitet.' },
                { key: 'h', text: 'wie oft Sanni auf dem Boot schläft.' },
                { key: 'i', text: 'wie oft Sanni schwierige Momenten auf See erlebt hat.' },
                { key: 'j', text: 'wie Sanni mit dem Alleinsein auf dem Boot umgeht.' },
                { key: 'k', text: 'in welchem Land Sanni lebt.' },
                { key: 'l', text: 'bei welchem Wetter man nicht segeln darf.' },
              ],
              answer: ['b', 'd', 'e', 'f', 'j', 'k'],
              pick: 6,
            },
          ],
        },
        {
          id: 'III-3',
          label: '3.',
          instructions:
            'Sie hören einen Bericht über einen Kinderbuchpreis, wo Kinder den Sieger wählen. Lesen Sie zuerst die Aufgabe. Sie hören dann den Text zweimal. Zuerst hören Sie den ganzen Text ohne Pausen, dann in kürzeren Abschnitten. Entscheiden Sie, welche Aussage richtig (R) und welche falsch (F) ist. Kreuzen Sie die Antwort beim Hören an. (0) ist ein Beispiel für Sie.',
          passage: [{ style: 'title', text: 'Kinder wählen das beste Buch' }],
          booleanLabels: ['R', 'F'],
          examples: rf(0, ['Die Mitglieder der Kinderbuchpreis-Jury sind Grundschüler aus einem Hamburger Stadtteil.'], 'R'),
          items: rf(
            14,
            [
              'Jedes Kind muss vor der Entscheidung wenigstens fünf von den Büchern lesen.',
              'Die jungen Leser geben den Büchern, die ihnen gefallen haben, Sterne.',
              'Eine Erwachsenenjury hat die zehn Bücher ausgesucht, die am Wettbewerb teilnehmen.',
              'Die Mitglieder der Kinderjury haben als Leser unterschiedliche Interessen.',
              'Mit dem Projekt konnte man erreichen, dass manche Kinder mehr lesen.',
              'Die Kinderjury bekommt Geldpreis.',
              'Die Kinder finden es schwierig, den Sieger selbst auszuwählen.',
            ],
            'F R R R R F F',
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
          title: 'Hausarbeit planen',
          instructions: 'Sie haben eine E-Mail von Ihrer deutschen Freundin bekommen. Hier sind einige Auszüge daraus:',
          passage: [
            {
              text: '… Ich ziehe für mein Studium in eine andere Stadt und werde dort für mich eine kleine Wohnung mieten. … Ich musste bisher nur wenig Hausarbeit machen und habe ein bisschen Angst vor den vielen Aufgaben im Haushalt. … Ich würde mich über Tipps von dir freuen.',
            },
          ],
          items: [
            {
              id: '1',
              type: 'production',
              prompt: ['Schreiben Sie eine E-Mail an Ihre Freundin und geben Sie ihr Ratschläge. Gehen Sie dabei auf die folgenden Punkte ein:'],
              contentPoints: ['Grund des Schreibens.', 'Was machen Sie oft im Haushalt? Warum?', 'Wie kann man Hausarbeit leichter und schneller machen? Geben Sie Tipps.'],
              promptAfter: ['Die Reihenfolge der Leitpunkte können Sie selbst bestimmen. Verwenden Sie für Ihren Text 80-100 Wörter.'],
              minWords: 80,
              maxWords: 100,
              opening: 'Liebe Mia,',
              register: 'informal-message',
              rubricId: 'erettsegi-kozep-1',
              criteria: DE_CRITERIA_1,
            },
          ],
        },
        {
          id: 'IV-2',
          label: '2.',
          title: 'Mein Lieblingswetter',
          instructions: 'Im Internet haben Sie einen Forumsbeitrag über das Lieblingswetter gefunden. Hier lesen Sie Auszüge daraus:',
          passage: [
            { text: 'Hi! Was ist euer Lieblingswetter?' },
            {
              text: 'Meins ist sonniges Wetter, wo keine einzige Wolke ist. Ich liebe einfach das tiefe Blau des Himmels, es wirkt beruhigend. … Als Kind hatte ich große Angst vor Stürmen und bin erst wieder rausgekommen, wenn es vorbei war.',
            },
            { text: 'Ich liebe es total, wenn es schneit. Ich bin dann so aufgeregt, wie ein kleines Kind wieder. Winter ist auch meine Lieblingsjahreszeit.' },
            {
              text: 'Ich liebe so 20-23 Grad Celsius, meist sonnig bis teilweise bewölkt, mit einem leichten Wind, der die Blätter in den Bäumen bewegt. Ich mag das Geräusch.',
            },
          ],
          items: [
            {
              id: '2',
              type: 'production',
              prompt: ['Schreiben Sie Ihre Meinung zum Thema in einem Forumsbeitrag. Gehen Sie dabei auf die folgenden Punkte ein:'],
              contentPoints: [
                'Welches Wetter mögen Sie besonders? Warum?',
                'Was machen Sie gern, wenn das Wetter gut ist?',
                'Wie beeinflusst das Wetter Ihre Stimmung?',
                'Was sind Ihre Lieblingsbeschäftigungen, wenn das Wetter ungemütlich ist?',
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
