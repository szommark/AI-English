// Német nyelv, középszintű írásbeli érettségi, 2021. október 25. (1819), Oktatási Hivatal.
// Transcribed verbatim from the feladatlap and its javítási-értékelési útmutató (answer key,
// conversion tables, listening transcripts). Decorative photos are left out.
import type { ExamPaper } from '../types'
import { choices, cloze, DE_CRITERIA_1, DE_CRITERIA_2, DE_LISTENING_INTRO, DE_NOTICES_HU, DE_WRITING_INTRO, gapMcqs, rf } from './deKozep.ts'

const paper: ExamPaper = {
  id: 'erettsegi-de-kozep-2021-oktober',
  type: 'erettsegi',
  language: 'de',
  level: 'kozep',
  sittingLabelHu: '2021. október',
  source: 'Oktatási Hivatal: Német nyelv, középszintű írásbeli vizsga, 2021. október 25. (1819) — feladatlap és javítási-értékelési útmutató.',
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
            'Lesen Sie den Zeitungsartikel über ein Ballonrennen. Entscheiden Sie, welche Aussage richtig (R) und welche falsch (F) ist. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'Das härteste Ballonrennen der Welt' },
            {
              text: 'In Gladbeck (Nordrhein-Westfalen) ist das härteste Gasballonrennen der Welt gestartet. Der Wettbewerb heißt „Gordon-Bennett-Cup“. Jedes Jahr steigen die Teams verschiedener Länder mit ihren Gasballonen auf, um zu gewinnen. In der Nacht zum Montag war es wieder so weit. Über 20 Gasballone haben sich auf den Weg gemacht.',
            },
            {
              text: 'Jeder Ballonfahrer hat einen Co-Piloten dabei. Sie fliegen nun in mehreren Hundert Metern Höhe. Die Luft dort oben ist eiskalt und dünn, die Teams brauchen deshalb Spezialgeräte zum Atmen. Die Ballone werden über Europa hinweggleiten. Ziel ist es, möglichst weit zu kommen. Man soll tausende Kilometer zurücklegen. Der Rekord aus dem Jahr 2005 liegt bei 3400 Kilometern.',
            },
            {
              text: 'Seit Jahren geben bei dem Ballonrennen zwei Männer den Ton an. Es sind ein Franzose und ein Deutscher. Der Deutsche heißt Wilhelm Eimers und kommt aus dem Ruhrgebiet. Er hat den Gordon-Bennett-Cup schon vier Mal gewonnen. Der Franzose ist Vincent Leys. Er hat den Wettbewerb schon neun Mal gewonnen.',
            },
            {
              text: 'Die Ballonfahrer versuchen in der Luft, den besten Wind zu finden. Ständig bekommen sie Informationen über das Wetter zugespielt. Dann müssen sie schauen, dass sie gut vorankommen. Sie können Ballast abwerfen, wenn sie höher aufsteigen wollen. Ziel ist es bei dem Wettbewerb nicht, die schnellste Zeit hinzulegen. Es gewinnt der, der mehr Strecke macht.',
            },
            { text: 'Im Internet können Fans verfolgen, wo die Männer gerade sind. Es wird die genaue Position und die zurückgelegte Strecke angezeigt.' },
          ],
          booleanLabels: ['R', 'F'],
          examples: rf(0, ['Der „Gordon-Bennett-Cup“ ist ein internationales Gasballonrennen.'], 'R'),
          items: rf(
            1,
            [
              'Ein Ballonteam besteht aus zwei Personen.',
              'Die Luft in der Höhe ist besonders frisch und angenehm.',
              'Ein Franzose hat die meisten Erfolge bei dem Gordon-Bennett-Cup.',
              'Man muss den Ballaststoff verbrennen, damit der Ballon höher fliegt.',
              'Wer am schnellsten zum Ziel kommt, gewinnt.',
              'Fans können im Internet prüfen, wie weit ihr Lieblingsteam geflogen ist.',
            ],
            'R F R F F R',
          ),
        },
        {
          id: 'I-2',
          label: '2.',
          instructions:
            'Lesen Sie den folgenden Text und ergänzen Sie dann in den Sätzen die fehlenden Informationen. Schreiben Sie in jede Lücke nur eine Information. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'Ein Paradies für alle Gartenzwerge' },
            {
              text: 'Bunt ist es im Garten von Juliane Schlögl. Und das nicht nur, wenn die Blumen blühen, sondern fast das ganze Jahr über, weil sich viele lustige Figuren auf dem Rasen tummeln. Die große Leidenschaft von Frau Schlögl sind ihre Gartenzwerge. 70 sind es mittlerweile an der Zahl, die meisten hat sie von Reisen nach Znaim* mitgebracht. „Es gibt so viele schöne Exemplare, dass man gar nicht weiß, welche man kaufen soll“, schwärmt die Expertin. Von Schneewittchen über Charlie Chaplin – hier findet man viele bekannte Gesichter.',
            },
            {
              text: '2005 hat sie angefangen, die Gartenzwerge zu sammeln. Vier Stunden Busfahrt, all die Jahre über, ein sehr zeitintensives Hobby. Dafür ist Frau Schlögl schon lange weit über Oberwarts Grenzen hinaus für ihre schönen Gartenzwerge bekannt. Das Fernsehen hat sich schon mehrere Male gemeldet, um die bunte Gesellschaft zu filmen. Sogar der Fernseh-Moderator, Karl Kanitsch, hat selbst einen Gartenzwerg vorbeigebracht.',
            },
            {
              text: 'Es stellt sich die Frage: Behält man bei so vielen Zwergen den Überblick oder kauft man da schon zweimal den Gleichen? „Wenn man einen sieht, weiß man sofort, ob man den schon hat. Dann kauft man ihn halt nicht“, erklärt die Rentnerin. Im Winter werden sie gut verpackt im Keller gelagert. Von März bis Oktober zieren sie dann wieder den Garten. „Da freuen sie sich schon, wenn sie wieder frische Luft bekommen“, sagt Frau Schlögl lächelnd. Alle drei Jahre muss man die Gartenzwerge neu bemalen, damit sie wieder in vollem Glanz erstrahlen. Und gibt es einen Lieblingszwerg? „Nein, sie sind alle gleich schön.“',
            },
            { style: 'note', text: '*Znaim: Ein Ort in Tschechien.' },
          ],
          examples: [
            {
              id: '0',
              type: 'short-text',
              prompt: 'Eine österreichische Frau hat ein interessantes Hobby: Sie sammelt ________.',
              answer: { accepted: ['Gartenzwerge'], match: 'exact-ci' },
            },
          ],
          items: [
            {
              id: '7',
              type: 'short-text',
              prompt: 'In der Sammlung von Frau Schlögl findet man sogar berühmte Figuren wie z. B. ________.',
              answer: { accepted: ['Schneewittchen', 'Charlie Chaplin'], match: 'keywords', keywords: [['schneewittchen', 'chaplin']] },
              reviewNote: 'Az útmutató szerint egy példa elég, bármelyik elfogadható.',
            },
            {
              id: '8',
              type: 'short-text',
              prompt: 'Frau Schlögl sammelt seit ________ Gartenzwerge.',
              answer: { accepted: ['2005'], match: 'keywords', keywords: [['2005']] },
            },
            {
              id: '9',
              type: 'short-text',
              prompt: 'Zu ihrem Hobby braucht Frau Schlögl sehr viel ________.',
              answer: { accepted: ['Zeit'], match: 'keywords', keywords: [['zeit']] },
            },
            {
              id: '10',
              type: 'short-text',
              prompt: 'Man kann die Sammlung sogar manchmal im ________ sehen.',
              answer: { accepted: ['Fernsehen'], match: 'keywords', keywords: [['fernseh']] },
            },
            {
              id: '11',
              type: 'short-text',
              prompt: 'In Frau Schlögls Sammlung findet man jeden Zwerg nur ________.',
              answer: { accepted: ['einmal'], match: 'keywords', keywords: [['einmal', '1x', '1 mal']] },
            },
            {
              id: '12',
              type: 'short-text',
              prompt: 'Die Gartenzwerge verbringen die kalte Jahreszeit ________.',
              answer: { accepted: ['im Keller'], match: 'keywords', keywords: [['keller']] },
            },
            {
              id: '13',
              type: 'short-text',
              prompt: 'Frau Schlögl ________ die Gartenzwerge immer wieder, damit sie schön bleiben.',
              answer: { accepted: ['bemalt'], match: 'keywords', keywords: [['bemal', 'malt', 'streicht', 'anmal']] },
            },
          ],
        },
        {
          id: 'I-3',
          label: '3.',
          instructions:
            'Sie lesen jetzt ein Interview über das Thema Freundschaft. Lesen Sie zuerst die Antworten des Interviews und suchen Sie dann die passende Frage. Achtung! Es gibt eine Frage zu viel. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'Freundschaften' },
            { text: 'Kirsten (46), Ärztin, verheiratet, Mutter von drei Söhnen:' },
            { text: '{{0}} Mein Freundeskreis besteht aus, na – sagen wir: 40 Menschen.' },
            {
              text: '{{14}} Mit meiner besten Freundin telefoniere ich stundenlang, ab und zu trinken wir Tee zusammen oder kochen. Mit einigen meiner Freunde fahren wir am Wochenende zum Wandern oder machen auch mal eine Städtetour. Am schönsten sind für mich gemeinsame Treffen mit Freundinnen zum Reden, Lachen und Erlebnisse teilen.',
            },
            {
              text: '{{15}} Ein Freund sagt mir auch mal eine Wahrheit, die ich nicht hören möchte, und steht immer zu mir. Ein Freund ist jemand, dem ich vertrauen kann und dem ich auch meine Schwächen zeigen kann. Mit einem Freund kann ich lachen und weinen.',
            },
            {
              text: '{{16}} Mit meiner besten Freundin kann ich mich über alles, wirklich alles unterhalten, ansonsten gibt es für mich für bestimmte Situationen „Experten“-Freunde. Zum Beispiel habe ich eine Freundin, die Lehrerin ist, und mit ihr bespreche ich Schulfragen, die meine Kinder betreffen.',
            },
            {
              text: '{{17}} Ich habe eine Freundin, mit der ich seit der 5. Klasse befreundet bin. Mit ihr treffe ich mich etwa zwei- bis dreimal im Jahr und es ist immer so, als ob wir dazwischen keine Pausen gehabt hätten.',
            },
            {
              text: '{{18}} Wir haben sechs Monate in Amerika gelebt und dort viele nette Menschen kennen gelernt. Mit drei Familien pflegen wir seitdem die Freundschaft trotz Zeitverschiebung und vielen Kilometern, die uns trennen. In Ellensburg wohnt Carin, die ich nun seit 30 Jahren kenne. Wir haben uns nur fünf Mal im Leben getroffen, aber sie ist ein sehr besonderer Mensch in meinem Leben.',
            },
            {
              text: '{{19}} Die Priorität für Freunde ist ganz weit oben, das heißt: Ich nehme mir immer die Zeit für meine Freunde und bemühe mich, meine Freunde nicht aus den Augen zu verlieren. Das wichtigste Hilfsmittel ist das Telefon, aber auch Facebook, E-Mails helfen, um in Verbindung zu bleiben. Ich könnte mir ein Leben ohne meine Freunde nicht vorstellen!',
            },
          ],
          bankTitle: 'FRAGEN',
          bank: [
            { key: 'A', text: 'Hast du Freunde im Ausland?' },
            { key: 'B', text: 'Hast du noch Freunde aus der Kindheit und Schulzeit?' },
            { key: 'C', text: 'Kann man mit Freunden alles besprechen, oder gibt es Themen, die man besser nicht anspricht?' },
            { key: 'D', text: 'Was bedeutet für dich „Freundschaft“?' },
            { key: 'E', text: 'Was machst du gemeinsam mit deinen Freunden?' },
            { key: 'F', text: 'Was machst du, um mit deinen Freunden in Kontakt zu bleiben?' },
            { key: 'G', text: 'Wie groß ist dein Freundeskreis?' },
            { key: 'H', text: 'Wie viele Personen gehören zu deinen guten und wie viele zu den besten Freunden?' },
          ],
          unusedBankCount: 1,
          examples: choices(0, 'G'),
          items: choices(14, 'E D C B A F'),
        },
        {
          id: 'I-4',
          label: '4.',
          instructions:
            'Das sind die gemischten Teile eines Textes. Rekonstruieren Sie den Originaltext und schreiben Sie die entsprechenden Buchstaben in die Rubrik. (0) ist ein Beispiel für Sie.',
          passage: [{ style: 'title', text: 'Der Wunschzettel' }],
          items: [
            {
              id: '20-26',
              type: 'order',
              start: 20,
              first: 'C',
              answer: ['A', 'D', 'F', 'E', 'H', 'G', 'B'],
              parts: [
                {
                  key: 'A',
                  text: 'Im letzten Jahr hat Jan alles, was ihm gefiel, aus dem Spielzeugkatalog ausgeschnitten und auf ein Blatt geklebt. In diesem Jahr will er seinen Wunschzettel malen. Schreiben kann er noch nicht, denn er ist erst fünf Jahre alt.',
                },
                {
                  key: 'B',
                  text: 'Jan reibt sich schon müde die Augen. Mama und Papa geben ihm noch einen Gutenachtkuss und Jan schläft glücklich ein. Man muss ja nicht immer bis Weihnachten mit seinen Wünschen warten.',
                },
                {
                  key: 'C',
                  text: 'Heute ist der fünfte Dezember. Jan sitzt im Schlafanzug am Küchentisch und macht seinen Wunschzettel. Oma hat ihm gesagt: „Wenn du deine Stiefel putzt und deinen Wunschzettel hineinsteckst, dann nimmt der Nikolaus ihn mit und gibt ihn direkt beim Weihnachtsmann ab.“',
                },
                {
                  key: 'D',
                  text: 'Jans Mama kommt zu ihm in die Küche, wäscht sich die Hände und fragt Jan: „Bist du denn nun fertig mit deinem Wunschzettel?“ „Ja, ich bin gerade fertig geworden, schau mal!“',
                },
                {
                  key: 'E',
                  text: 'Mama schaut etwas nachdenklich. „Ich verstehe das immer noch nicht. Was soll denn das bedeuten?“ „Ich wünsche mir, dass ihr mehr Zeit für mich habt, du und Papa“, antwortet Jan.',
                },
                {
                  key: 'F',
                  text: 'Mama setzt sich neben Jan und sieht sich das Bild an. Das Bild ist ganz blau, nur in der Mitte ist eine Uhr zu sehen und am unteren Bildrand stehen zwei Menschen. „Was soll denn das sein?“, fragt Mama. „Wünschst du dir eine Uhr?“ „Nein, Mama“, antwortet Jan. „Das Blaue ist das Meer, die Uhr ist die Zeit und die Menschen auf dem Bild seid ihr, du und Papa.“',
                },
                {
                  key: 'G',
                  text: 'Auch Papa kommt inzwischen leise in Jans Zimmer, er lächelt. „Ja, ihr beiden, ich werde auch versuchen, mehr Zeit für euch zu haben.“ – sagt er und küsst Jan auf die Stirn.',
                },
                {
                  key: 'H',
                  text: 'Mama erzählt Jan von der vielen Arbeit, die sie und Papa erledigen müssen und sie bringt ihn ins Bett. Jan soll nicht traurig sein und es ihnen immer sagen, wenn er das Gefühl hat, niemand hat Zeit für ihn. Mama verspricht, dass sie versuchen wird, ein wenig mehr Zeit für ihn zu haben.',
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
      conversion: [0, 1, 2, 3, 4, 5, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 14, 15, 16, 17, 18],
      tasks: [
        {
          id: 'II-1',
          label: '1.',
          instructions: 'Was passt in den Text? Unterstreichen Sie das richtige Wort! (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'Die Kinderspielstadt Danubius' },
            {
              text: 'Bereits {{0}} zweiten Mal öffnet die Kinderspielstadt Danubius in Siebenbürgen ihre Tore für deutschsprachige Kinder im Alter von 8 {{1}} 12 Jahren. Unter Betreuung leben 100 Kinder aus Rumänien, Deutschland, Ungarn, Serbien und Kroatien eine Woche in {{2}} eigenen Spielstadt. Sie lernen verschiedene Berufe kennen und probieren sich z. B. als Bäcker, Polizisten, Tischler oder Mitarbeiter im Rathaus aus.',
            },
            {
              text: 'Durch den realistischen Charakter der Spielwelt mit {{3}} Geld, mit täglicher Bürgerversammlung und Freizeitangeboten sammeln die Kinder erste Erfahrungen in der Welt der Erwachsenen. Auf spielerische Weise {{4}} sie z. B. Wahlen oder Demokratie kennen lernen.',
            },
            {
              text: 'Die Kinderspielstadt findet im Jugendzentrum Seligstadt statt, das in malerischer Umgebung liegt {{5}} verschiedene Ausflugsmöglichkeiten bietet. Dort wohnen die Kinder auch und werden ganztags betreut. Die Mehrbettzimmer sind {{6}} eingerichtet, es gibt moderne Duschen und Toiletten im Flur. Die Kinder erhalten drei Mahlzeiten pro Tag, {{7}} ist mindestens eine Mahlzeit warm. Das Essen {{8}} täglich frisch aus natürlichen Produkten zubereitet.',
            },
          ],
          examples: gapMcqs(0, [['am', 'beim', 'im', 'zum']], 'D'),
          items: gapMcqs(
            1,
            [
              ['an', 'bis', 'zu', 'zwischen'],
              ['eurer', 'ihrer', 'Ihrer', 'seiner'],
              ['eigenem', 'eigenen', 'eigener', 'eigenes'],
              ['können', 'mögen', 'müssen', 'wollen'],
              ['aber', 'denn', 'oder', 'und'],
              ['praktisch', 'praktische', 'praktischen', 'praktischer'],
              ['daran', 'darin', 'davon', 'dazu'],
              ['werden', 'werdet', 'wird', 'wirst'],
            ],
            'B B A A D A C C',
          ),
        },
        {
          id: 'II-2',
          label: '2.',
          instructions:
            'Was passt in den Text? Schreiben Sie die entsprechenden Buchstaben in die Rubrik. Achtung! Es gibt einen Buchstaben zu viel. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'Sabine Lisicki im Finale von Wimbledon' },
            {
              text: 'Die Berliner Tennisspielerin Sabine Lisicki steht im Finale des Turniers von Wimbledon. Lisicki schlug im Halbfinale die Polin Agnieszka Radwanska. Sie ist die erste deutsche Tennisspielerin seit 1999, {{0}}. Damals hatte Steffi Graf das geschafft.',
            },
            {
              text: 'Nun trifft Lisicki am Samstag auf die Französin Marion Bartoli. Obwohl sie nur auf Platz 24 der Weltrangliste steht, {{9}}. Sie hat auf dem Weg ins Finale aber schon Serena Williams, {{10}}, aus dem Turnier geworfen.',
            },
            {
              text: 'In Wimbledon, einem Stadtteil von London, findet jedes Jahr ein Tennisturnier statt, {{11}}. Es ist das älteste und berühmteste Turnier der Welt. Die Veranstalter legen viel Wert darauf, {{12}}. So müssen die Spielerinnen und Spieler wie früher in alter Kleidung antreten. Auch lange Unterbrechungen wegen Regen gehören zu Wimbledon.',
            },
            {
              text: 'Der deutsche Boris Becker gewann das Turnier dreimal, {{13}}. Bei den Damen konnte sich Steffi Graf sieben Mal über den Titel freuen. Der Sieger und die Siegerin bekommen mehr als 1,8 Millionen Euro.',
            },
          ],
          bank: [
            { key: 'A', text: 'damit sie das Tournier gewinnt' },
            { key: 'B', text: 'dass alles etwas altmodisch bleibt' },
            { key: 'C', text: 'die den Einzug ins Finale geschafft hat' },
            { key: 'D', text: 'die derzeitige Nummer 1' },
            { key: 'E', text: 'gilt sie inzwischen als Favoritin' },
            { key: 'F', text: 'und Michael Stich war einmal Turniersieger' },
            { key: 'G', text: 'wo auf Rasen gespielt wird' },
          ],
          unusedBankCount: 1,
          examples: choices(0, 'C'),
          items: choices(9, 'E D G B F'),
        },
        {
          id: 'II-3',
          label: '3.',
          instructions:
            'Was passt in den Text? Schreiben Sie das richtige Wort in den Text. Achtung! Ein Wort kann mehrmals vorkommen. (0) ist ein Beispiel für Sie. (bis, im, in, mit, von, zu, zwischen)',
          passage: [
            { style: 'title', text: 'Niedliche kleine Nager' },
            {
              text: 'Meerschweinchen gehören {{0}} den beliebtesten Haustieren. Aber Moment mal, warum heißen die Nagetiere Meerschweinchen? Sie leben nicht {{14}} Meer und wie Schweine sehen sie auch nicht aus. Ihr Name hat mit ihrer Herkunft zu tun: Seefahrer brachten sie {{15}} Schiffen – also übers Meer – nach Europa. Ihre Heimat ist eigentlich Südamerika, wo sie von den Inkas wahrscheinlich als Haustiere gehalten wurden. In Südamerika gibt es {{16}} heute noch wild lebende Meerschweinchen. Den zweiten Teil ihres Namens verdanken sie ihrem Quieken*, das sich ein bisschen so anhört wie das „Sprechen“ {{17}} Schweinen.',
            },
            {
              text: 'Meerschweinchen werden {{18}} 20 und 35 Zentimeter groß. Bei der Haltung gibt es einiges zu beachten. Die Nager sind Herdentiere. Deshalb müssen sie mindestens {{19}} zweit oder sogar in Gruppen gehalten werden. Meerschweinchen lieben Tunnel und Häuschen, {{20}} denen sie sich verstecken können. Außerdem sollten sie genügend Platz haben.',
            },
            { style: 'note', text: '*Quieken = für Schweine und Mäuse typischer hoher Ton' },
          ],
          examples: cloze(0, [['zu']]),
          items: cloze(14, [['im'], ['mit', 'in'], ['bis'], ['von'], ['zwischen'], ['zu'], ['in']]),
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
        storagePath: 'erettsegi-de-kozep-2021-oktober.mp3',
        durationSec: 1801,
        // Task starts: the ~60 s reading pause of each task found by silence detection, minus the length of its announcement (approximate, ±10 s).
        taskMarkers: [
          { taskId: 'III-1', startSec: 78 },
          { taskId: 'III-2', startSec: 571 },
          { taskId: 'III-3', startSec: 1099 },
        ],
      },
      conversion: [0, 2, 3, 5, 7, 8, 10, 12, 13, 15, 17, 18, 20, 21, 23, 25, 26, 28, 30, 31, 33],
      transcripts: [
        {
          taskId: 'III-1',
          title: 'Ein Au-pair-Mädchen in Deutschland',
          paragraphs: [
            'Familienalltag mit Au-pair: Weniger Stress im Alltag. Seit 4 Wochen arbeitet und wohnt Daria bei Familie Jagosch in Großhartpenning. Zwei berufstätige Eltern, die auch noch weit pendeln müssen. Für die Betreuung der Kinder setzen immer mehr Mütter und Väter auf ein Au-pair. Bei Familie Jagosch gibt es einen Wochenplan, damit es mit der Aufgabenverteilung klappt. 30 Wochenstunden hilft Daria mit im Haushalt und bei der Kinderbetreuung.',
            'Die meisten Au-pair-Vermittlungen laufen wie bei den Jagoschs über eine Agentur. Die verlangt zwar eine Gebühr, dafür bietet sie Sicherheiten, wenn es Probleme gibt. Voraussetzungen für die Aufnahme eines Au-pairs sind ein eigenes Zimmer für den Gast, etwa 270 Euro Taschengeld im Monat, Freizeitmöglichkeiten und der Zugang zu einem Sprachkurs. Hinzu kommen Versicherungskosten, ein Zuschuss für den Deutschkurs und den öffentlichen Nahverkehr. Unterkunft und Verpflegung sind frei für das Au-pair. Daria kommt aus der Ukraine, das zu den häufigsten Herkunftsländern zählt.',
            'Die bayrische Lebensart hat die 21jährige schon kennengelernt. Nur der Dialekt ist noch eine Herausforderung. Und dann noch die Kindersprache.',
            'Wenn Daria mit Max unterwegs ist, dann muss der große Bruder Ludwig manchmal übersetzen. Viele Au-pairs, die nach Deutschland kommen, würden gerne hier bleiben. Und ganz wichtig: Ein Au-pair ist ein Familienmitglied und keine Hausangestellte.',
          ],
        },
        {
          taskId: 'III-2',
          title: 'Wikipedia ist 15',
          paragraphs: [
            '(Eine Nachricht vom 15. 01. 2016)',
            'Wahrscheinlich haben wir alle schon einmal etwas auf der Internetseite Wikipedia nachgeschaut. In dem Online-Lexikon findet man zu ziemlich jedem Thema oder zu jeder bekannten Person einen Text.',
            'Genau heute vor 15 Jahren startete das Projekt Wikipedia im Land USA. Die erste Version war in Englisch. Doch schon kurz nach dem Start wurde auch eine deutschsprachige Wikipedia-Ausgabe gegründet. Dort findet man zurzeit fast 1,9 Millionen Artikel. Und neben Deutsch und Englisch gibt es noch Wikipedia-Versionen in fast 300 weiteren Sprachen.',
            'Mein Kollege Sebastian Trepper erklärt euch, was der Name Wikipedia bedeutet:',
            'Das Wort „Wikipedia“ hat zwei Bedeutungen. Der erste Wortteil „Wiki“ steht für ein spezielles System für Seiten im Internet. Das Tolle daran ist, dass in einem Wiki jeder die Inhalte auf einer Seite verändern kann. Das ist normalerweise bei Webseiten nicht so einfach möglich. Der restliche Teil des Wortes Wikipedia ist ein Stück des englischen Begriffs für Enzyklopädie. Mit einer Enzyklopädie ist ein Nachschlage-Werk gemeint, in dem sehr viel Wissen steht.',
            'Dadurch dass eigentlich alle Internetnutzer an Wikipedia mitschreiben können, ist das Lexikon immer sehr aktuell. Wenn zum Beispiel bekannte Schauspieler wie gestern Alan Rickman sterben, steht das oft wenige Minuten später bereits bei Wikipedia.',
            'Hin und wieder kommt es auch mal vor, dass Informationen in Wikipedia-Artikeln falsch sind. Die bekannteste Falschmeldung gab es vor ein paar Jahren bei einem deutschen Politiker. Im Jahr 2009 wurde Karl-Theodor zu Guttenberg deutscher Wirtschaftsminister. Und er hat sehr viele Vornamen – zehn insgesamt. Ein Scherzbold hatte zu den zahlreichen Namen noch einen Wilhelm dazu geschrieben. Der Fehler fiel erst nicht auf, so dass auch Zeitungen und Magazine den weiteren Vornamen mit abdruckten. Guttenberg stellte dann aber klar, dass er nicht Wilhelm heißt.',
            'Trotz kleiner Fehler bei Wikipedia gilt die Internetseite als sehr zuverlässig und aktuell. Natürlich recherchieren wir auch für die Klicker-Meldungen ab und zu auf Wikipedia.',
          ],
        },
        {
          taskId: 'III-3',
          title: 'Eine Wohnung mieten',
          paragraphs: [
            'Timo aus Finnland zieht im Herbst nach Deutschland. Er hat mich gefragt, wie man hier eine Wohnung findet. Ich bin ja selber gerade erst umgezogen, daher werde ich versuchen, es zu erklären.',
            'Am einfachsten ist es natürlich über Mundpropaganda. Das heißt, man hört über Freunde oder die Familie, dass irgendwo eine Wohnung frei wird. Aber so funktioniert das eben nicht immer. Also muss man entweder in Tageszeitungen eine Anzeige aufgeben oder die Anzeigen im Immobilienmarkt lesen, also in dem Teil der Zeitung, in dem es um Wohnungen und Häuser geht. Oder man sucht im Internet, die größte Börse ist hier immobilienscout24.de.',
            'In Deutschland misst man die Größe einer Wohnung erstmal in Zimmern. Eine 2-Zimmer-Wohnung heißt also, man hat Küche, Bad und zwei Zimmer. Bei einer 4-Zimmer-Wohnung hat man Küche, Bad und vier Zimmer. Aber Vorsicht: Oft ist die Küche leer. Das bedeutet, es gibt zwar einen Raum für die Küche, aber es gibt dort keine Möbel, keine Geräte. Der Raum ist leer. Man muss also oft noch viel Geld investieren und eine komplette neue Küche kaufen, wenn man eine Wohnung mieten will. Ihr werdet oft die Abkürzung EBK sehen, das bedeutet Einbauküche. Wenn das also bei einer Anzeige dabeisteht, bedeutet das, die Wohnung hat eine Küche.',
            'Die Größe einer Wohnung wird natürlich auch in Quadratmetern gemessen. Wobei es einen Unterschied gibt: Wenn zum Beispiel ein großer Balkon oder eine Terrasse dabei sind, dann werden diese Flächen nicht ganz mitgezählt. Wer also 30 Quadratmeter Terrasse hat, bei dem wird das als 15 Quadratmeter Nutzfläche berechnet. Kompliziert, oder?',
            'Noch zwei wichtige Unterschiede: Kaltmiete und Warmmiete. Bei der Warmmiete ist alles inklusive. Das ist also der Betrag, den man wirklich an den Vermieter zahlen muss. Normalerweise steht in den Anzeigen aber nur die Kaltmiete. Zur Kaltmiete hinzu kommen die so genannten Nebenkosten. Das sind Kosten für die Müllabfuhr, das Wasser, die Heizung, manchmal auch für die Beleuchtung des Hauses oder den Kabelanschluss. Stromkosten und Telefonkosten zahlt man normalerweise direkt an die Strom- oder Telefonkonzerne, das hat mit dem Vermieter nichts zu tun.',
            'Wenn man dann im Internet oder in einer Zeitung eine Wohnung gefunden hat, macht man einen Besichtigungstermin. Manchmal organisiert diese Termine der Vermieter selber. Normalerweise aber übernimmt das ein Makler. Man darf sich also die Wohnung ansehen und Fragen stellen. Oft ist die Konkurrenz groß, vor allem in Städten wie München. Viele Menschen wollen die Wohnung haben, und der Vermieter kann sich für einen Mieter entscheiden. Damit ihm diese Entscheidung leichter fällt, verlangt er meist eine so genannte Selbstauskunft. Das ist ein Blatt Papier, ein Formular, auf dem der potenzielle Mieter Informationen über sich selbst ausfüllt. Welchen Beruf er hat, wie viel Geld er verdient, wo er vorher gewohnt hat, manchmal sogar, ob er ein Instrument spielt oder nicht. Wenn dann alles in Ordnung ist, kann man den Mietvertrag unterschreiben.',
          ],
        },
      ],
      tasks: [
        {
          id: 'III-1',
          label: '1.',
          instructions:
            'Sie hören einen Text über Daria, die bei einer deutschen Familie als Au-pair arbeitet. Lesen Sie zuerst die Aufgabe. Sie hören dann den Text zweimal. Zuerst hören Sie den ganzen Text ohne Pausen, dann in kürzeren Abschnitten. Antworten Sie kurz auf die Fragen. Schreiben Sie zu jedem Punkt nur eine Information. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'Ein Au-pair-Mädchen* in Deutschland' },
            { style: 'note', text: '*Die Arbeit eines Au-pair-Mädchens ist: (im Ausland) auf Kinder aufpassen.' },
          ],
          examples: [
            {
              id: '0',
              type: 'short-text',
              prompt: 'Wie ist das Familienleben mit Au-pair?',
              answer: { accepted: ['weniger stressig'], match: 'exact-ci' },
            },
          ],
          items: [
            {
              id: '1',
              type: 'short-text',
              prompt: 'Seit wann wohnt Daria bei Familie Jagosch im Haus?',
              answer: { accepted: ['seit vier Wochen'], match: 'keywords', keywords: [['vier', '4']] },
            },
            {
              id: '2',
              type: 'short-text',
              prompt: 'Wie lange dauert die Arbeitszeit von Daria als Au-pair?',
              answer: { accepted: ['30 Wochenstunden', '30 Stunden pro Woche'], match: 'keywords', keywords: [['30', 'dreißig']] },
            },
            {
              id: '3',
              type: 'short-text',
              prompt: 'Wie viel Taschengeld bekommen die meisten Au-pairs?',
              answer: { accepted: ['(etwa) 270 Euro (im Monat)'], match: 'keywords', keywords: [['270']] },
            },
            {
              id: '4',
              type: 'short-text',
              prompt: 'Was können die Au-pairs in ihrer Freizeit lernen?',
              answer: { accepted: ['eine Sprache', 'Deutsch'], match: 'keywords', keywords: [['sprache', 'deutsch']] },
            },
            {
              id: '5',
              type: 'short-text',
              prompt: 'Woher kommt das Au-pair-Mädchen Daria?',
              answer: { accepted: ['aus der Ukraine'], match: 'keywords', keywords: [['ukraine']] },
            },
            {
              id: '6',
              type: 'short-text',
              prompt: 'Was findet Daria bei ihrer Arbeit in Deutschland z. B. schwer?',
              answer: { accepted: ['den (bayrischen) Dialekt', 'die Kindersprache'], match: 'keywords', keywords: [['dialekt', 'kindersprache']] },
            },
            {
              id: '7',
              type: 'short-text',
              prompt: 'Wie hilft der ältere Sohn, Ludwig, Daria bei ihrer Au-pair-Arbeit?',
              answer: { accepted: ['Er übersetzt (ihr, was der kleine Max sagt).'], match: 'keywords', keywords: [['übersetz']] },
            },
            {
              id: '8',
              type: 'short-text',
              prompt: 'Was möchten viele Au-pairs in der Zukunft machen?',
              answer: { accepted: ['(hier) in Deutschland bleiben'], match: 'keywords', keywords: [['bleiben']] },
            },
          ],
        },
        {
          id: 'III-2',
          label: '2.',
          instructions:
            'Sie hören eine Radiosendung über das Online-Lexikon Wikipedia. Lesen Sie zuerst die Aufgabe. Sie hören dann den Text zweimal. Zuerst hören Sie den ganzen Text ohne Pausen, dann in kürzeren Abschnitten. Ergänzen Sie die Sätze beim Hören. Schreiben Sie in jede Lücke nur eine Information. (0) ist ein Beispiel für Sie.',
          passage: [{ style: 'title', text: 'Wikipedia ist 15 (Eine Nachricht vom 15. 01. 2016)' }],
          examples: [
            {
              id: '0',
              type: 'short-text',
              prompt: 'Wikipedia, das Online-Lexikon feiert den ________ Geburtstag.',
              answer: { accepted: ['15.'], match: 'exact-ci' },
            },
          ],
          items: [
            {
              id: '9',
              type: 'short-text',
              prompt: 'Das Projekt wurde im Land ________ gestartet.',
              answer: { accepted: ['USA'], match: 'keywords', keywords: [['usa', 'amerika']] },
            },
            {
              id: '10',
              type: 'short-text',
              prompt: 'Wikipedia-Versionen gibt es schon in ________ Sprachen.',
              answer: { accepted: ['(fast) 300'], match: 'keywords', keywords: [['300']] },
            },
            {
              id: '11',
              type: 'short-text',
              prompt: 'Der erste Teil des Wortes „Wikipedia“ bedeutet ein ________ im Internet.',
              answer: { accepted: ['(spezielles) System (für Seiten)'], match: 'keywords', keywords: [['system']] },
            },
            {
              id: '12',
              type: 'short-text',
              prompt: 'Internetbenutzer können auch mitschreiben, deshalb ist Wikipedia immer ________.',
              answer: { accepted: ['(sehr) aktuell'], match: 'keywords', keywords: [['aktuell']] },
            },
            {
              id: '13',
              type: 'short-text',
              prompt: 'Einmal hat Wikipedia ________ von einem deutschen Politiker falsch angegeben.',
              answer: { accepted: ['den (Vor)namen'], match: 'keywords', keywords: [['name']] },
            },
            {
              id: '14',
              type: 'short-text',
              prompt: 'Den Fehler konnte man dann auch ________ wiederfinden.',
              answer: { accepted: ['in Zeitungen', 'in Magazinen'], match: 'keywords', keywords: [['zeitung', 'magazin']] },
            },
          ],
        },
        {
          id: 'III-3',
          label: '3.',
          instructions:
            'Sie hören einen Text, in dem ein Mann darüber spricht, wie man in Deutschland eine Wohnung mieten kann. Lesen Sie zuerst die Aufgabe. Sie hören dann den Text zweimal. Zuerst hören Sie den ganzen Text ohne Pausen, dann in kürzeren Abschnitten. Entscheiden Sie beim Hören, worüber gesprochen wird und markieren Sie diese Aussage mit X. Wenn über etwas nicht gesprochen wird, lassen Sie das Kästchen leer. Insgesamt können Sie 6-mal ankreuzen. (0) ist ein Beispiel für Sie.',
          passage: [{ style: 'title', text: 'Eine Wohnung mieten' }, { text: 'Im Text spricht man davon,' }],
          rules: { multiSelectPenalty: true },
          items: [
            {
              id: '15-20',
              type: 'multi-select',
              exampleOption: 'wie man am einfachsten eine Wohnung in Deutschland findet.',
              options: [
                { key: 'a', text: 'wo man Wohnungsanzeigen finden kann.' },
                { key: 'b', text: 'wie man die Größe einer Wohnung misst.' },
                { key: 'c', text: 'wie groß die Zimmer einer 4-Zimmer-Wohnung sind.' },
                { key: 'd', text: 'warum die Küche oft leer ist.' },
                { key: 'e', text: 'was man unter Warmmiete versteht.' },
                { key: 'f', text: 'welche Nebenkosten man zahlen muss.' },
                { key: 'g', text: 'wer den Termin für die Besichtigung der Wohnung organisiert.' },
                { key: 'h', text: 'warum mehr Leute in den Großstädten Wohnungen suchen.' },
                { key: 'i', text: 'wie sich der Vermieter über den möglichen Mieter informiert.' },
                { key: 'j', text: 'wie viel man für den Mietvertrag bezahlen muss.' },
              ],
              answer: ['a', 'b', 'e', 'f', 'g', 'i'],
              pick: 6,
              reviewNote: 'Az útmutató szerint a „warum die Küche oft leer ist” opciót nem kell megjelölni, bár a szöveg röviden említi.',
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
          title: 'Klassenfahrt nach Österreich',
          instructions: 'Sie wollen mit Ihrer Klasse im Sommer eine Klassenfahrt nach Österreich machen. Sie haben im Internet die folgende Möglichkeit für eine Unterkunft gefunden:',
          passage: [
            { style: 'title', text: 'Jugendgästehaus Reibers' },
            { text: 'Optimales Haus für große Gruppen – ehemaliges Schulgebäude mit Hof und Garten (750m2), Grillplatz, Tischtennisplatz und Zeltplatz.' },
            { text: 'Lage: in einem kleinen Dorf im Waldviertel (Niederösterreich) Adresse: 3844 Reibers 13 Kontakt: Elvira Strommer E-Mail: jhb.reibers@gmx.at' },
          ],
          items: [
            {
              id: '1',
              type: 'production',
              prompt: ['Schreiben Sie im Namen Ihrer Klasse eine E-Mail an die Kontaktperson. Gehen Sie dabei auf die folgenden Punkte ein:'],
              contentPoints: [
                'Grund des Schreibens',
                'Informationen über Ihre Reise (Datum, Anzahl und Alter der Mädchen bzw. Jungen)',
                'Fragen nach Essensmöglichkeiten, den Zimmern und den Preisen.',
              ],
              promptAfter: ['Die Reihenfolge der Leitpunkte können Sie selbst bestimmen. Verwenden Sie für Ihren Text 80-100 Wörter.'],
              minWords: 80,
              maxWords: 100,
              opening: 'Sehr geehrte Frau Strommer,',
              register: 'formal-email',
              rubricId: 'erettsegi-kozep-1',
              criteria: DE_CRITERIA_1,
            },
          ],
        },
        {
          id: 'IV-2',
          label: '2.',
          title: 'Hunde in der Familie',
          instructions: 'Ihr deutscher Freund Martin muss zum Thema „Hunde in der Familie“ einen Aufsatz schreiben. Er bittet Sie um Hilfe und schickt Ihnen die folgenden Meinungen aus einem Internetforum:',
          passage: [
            { style: 'title', text: 'Haustier Hund' },
            {
              text: 'Der beste Freund des Menschen bringt nicht nur eine Menge Spaß und Freude ins Haus, sondern auch einige Probleme (z. B. Erziehung, Rausführung oder Kosten), worüber man sich im Voraus klar sein sollte.',
            },
            { text: 'Man sollte sich niemals einen Hund nur deswegen anschaffen, „weil ein Hund ja irgendwie zur perfekten Familie dazugehört“.' },
          ],
          items: [
            {
              id: '2',
              type: 'production',
              prompt: ['Schreiben Sie Ihrem deutschen Freund eine E-Mail. Gehen Sie dabei auf die folgenden Punkte ein:'],
              contentPoints: [
                'Reagieren Sie auf die Bitte Ihres Freundes.',
                'Haben Sie einen Hund, oder möchten Sie einen haben? Warum (nicht)?',
                'Wo / für wen ist es ideal, einen Hund zu halten? Warum?',
                'Welche anderen Haustiere haben Sie oder möchten Sie gerne halten? Warum?',
              ],
              promptAfter: ['Die Reihenfolge der Leitpunkte können Sie selbst bestimmen. Verwenden Sie für Ihren Text 100–120 Wörter.'],
              minWords: 100,
              maxWords: 120,
              opening: 'Hallo Martin,',
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
