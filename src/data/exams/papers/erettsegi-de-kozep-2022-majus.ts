// Német nyelv, középszintű írásbeli érettségi, 2022. május 6. (2119), Oktatási Hivatal.
// Transcribed verbatim from the feladatlap and its javítási-értékelési útmutató (answer key,
// conversion tables, listening transcripts). Decorative photos are left out.
import type { ExamPaper } from '../types'
import { choices, cloze, DE_CRITERIA_1, DE_CRITERIA_2, DE_LISTENING_INTRO, DE_NOTICES_HU, DE_WRITING_INTRO, gapMcqs, rf } from './deKozep.ts'

const cities = [
  { key: '1', text: 'Madrid (Spanien)' },
  { key: '2', text: 'Singapur' },
  { key: '3', text: 'Kairo (Ägypten)' },
  { key: '4', text: 'Mexiko-Stadt (Mexiko)' },
  { key: '5', text: 'Stockholm (Schweden)' },
]

const paper: ExamPaper = {
  id: 'erettsegi-de-kozep-2022-majus',
  type: 'erettsegi',
  language: 'de',
  level: 'kozep',
  sittingLabelHu: '2022. május',
  source: 'Oktatási Hivatal: Német nyelv, középszintű írásbeli vizsga, 2022. május 6. (2119) — feladatlap és javítási-értékelési útmutató.',
  noticesHu: DE_NOTICES_HU,
  sections: [
    {
      id: 'I',
      kind: 'reading',
      titleHu: 'I. Olvasott szöveg értése',
      timeLimitMin: 60,
      conversion: [0, 1, 3, 4, 5, 7, 8, 9, 11, 12, 13, 15, 16, 17, 18, 20, 21, 22, 24, 25, 26, 28, 29, 30, 32, 33],
      tasks: [
        {
          id: 'I-1',
          label: '1.',
          instructions:
            'Sie lesen ein Interview über Sport. Lesen Sie zuerst die Antworten des Interviews und suchen Sie dann die passende Frage. Schreiben Sie den entsprechenden Buchstaben in die Rubrik. Achtung! Es gibt eine Frage zu viel. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'Sportarten für Teenager' },
            { text: 'Welche Sportarten sind am besten für Teenager? Dazu haben wir den Sportjournalisten Stefan H. befragt.' },
            {
              text: '{{0}} Sport hält nicht nur fit und schlank, sondern macht – wenn es der richtige ist – auch noch eine Menge Spaß. Ein weiterer Pluspunkt liegt neben der Bewegung darin, dass gerade Vereinssport das Sozialverhalten und den Teamgeist fördern kann.',
            },
            { text: '{{1}} Welche Sportarten für Teenager geeignet sind, hängt natürlich von der jeweiligen Person ab und davon, was sie mag.' },
            {
              text: '{{2}} Draußen an der frischen Luft können Teenager zahlreiche Sportarten sowohl allein als auch in der Gruppe betreiben. Beim Mountainbiking kann man richtig Energie loswerden. Für Fahrradfans gibt es in einigen Städten auch Vereine, in denen man gemeinsam radeln kann.',
            },
            {
              text: '{{3}} Beliebt ist bei der jüngeren Generation auch Skateboarding oder Inline-Skaten. Gerade bei diesen beiden Sportarten kann man sich sehr gut auch allein, an einem langweilen Nachmittag oder an Wochenenden betätigen. In vielen Städten gibt es auch Skateparks.',
            },
            { text: '{{4}} Der Klassiker unter den Sportarten für Teenager ist, vor allem bei den Jungen, der Fußball.' },
            {
              text: '{{5}} Für alle Altersklassen, also auch für Teenager, gibt es den passenden Verein. Daher kann man auch noch im Teenageralter gut mit dem Fußballsport beginnen. Hier wird besonders der Teamgeist unter den Spielern gefördert.',
            },
            { text: '{{6}} Weil man dort immer auch noch andere Mitglieder hat, mit denen man sich austauschen kann. Auch freundschaftliche Kontakte kann man hier knüpfen.' },
            {
              text: '{{7}} Geeignet sind alle Sportarten, die vor allem einen guten Teamgeist verlangen, um erfolgreich mit den Mitspielern spielen zu können. Als Vereinssport bieten sich Sportarten wie Tischtennis, Volleyball, Handball oder Basketball an. Doch auch bei Sportarten wie Schwimmen oder Leichtathletik, bei denen man sich eher auf die eigene Leistung konzentriert, kommen die sozialen Beziehungen nicht zu kurz.',
            },
            {
              text: '{{8}} Wer es eine Nummer härter mag, kann es auch mit verschiedenen Kampfsportarten versuchen. Sowohl für Mädchen als auch für Jungen eignet sich der Kampfsport sehr gut und hat gleich noch den Nebeneffekt, dass man sich selbst verteidigen kann und eine gewisse Muskelkraft aufbaut.',
            },
            {
              text: '{{9}} Natürlich gibt es viele Sportarten, bei denen ein wenig Erfahrung oder ein früher Beginn besser sind. Dennoch ist es niemals zu spät, in einen Verein einzutreten. Vielleicht auch nur, um ein wenig Spaß zu haben und Kontakte zu knüpfen. Oder, um einfach rundum gesund und fit zu bleiben. Wichtig ist, dass sich die Jugendlichen für etwas entscheiden, was ihnen auch wirklich Spaß macht.',
            },
          ],
          bankTitle: 'FRAGEN',
          bank: [
            { key: 'A', text: 'Was halten Sie von Kampfsport als Sportart für Teenager?' },
            { key: 'B', text: 'Kann man auch im Teenageralter noch mit jeder Sportart beginnen?' },
            { key: 'C', text: 'Warum ist es besser, in einem Verein Sport zu treiben?' },
            { key: 'D', text: 'Was würden Sie jemandem empfehlen, der lieber allein Sport macht?' },
            { key: 'E', text: 'Welche Sportaktivitäten sind gut für Bewegung im Freien?' },
            { key: 'F', text: 'Für welche Sportart haben sich Jugendliche schon immer besonders begeistert?' },
            { key: 'G', text: 'Warum sollten Jugendliche Sport treiben?' },
            { key: 'H', text: 'Wie finden Sie Leistungssport?' },
            { key: 'J', text: 'Welche anderen Sportarten fördern die sozialen Kontakte ebenfalls?' },
            { key: 'K', text: 'Wie sollten sich Jugendliche eine Sportart wählen?' },
            { key: 'L', text: 'Wo und wann kann man mit Fußball anfangen?' },
          ],
          unusedBankCount: 1,
          examples: choices(0, 'G'),
          items: choices(1, 'K E D F L C J A B'),
        },
        {
          id: 'I-2',
          label: '2.',
          instructions:
            'Lesen Sie den Text über zwei junge Influencerinnen und entscheiden Sie, welche Aussage richtig (R) und welche falsch (F) ist. Kreuzen Sie die Antwort in der Tabelle an. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'Junge Influencerinnen: Vom Spaß zum Beruf?' },
            {
              text: 'Bilder, Videos und Texte auf Instagram und Youtube sehen meist nach Spaß aus. Aber Leute, die so etwas häufig posten und zahlreiche Fans in den sozialen Netzwerken haben, brauchen bald immer mehr Zeit dafür. Das gilt auch für Emilia und Coco.',
            },
            {
              text: 'Als Emilia ihre Instagram-Seite gestartet hat, ist die Zahl ihrer Follower* schnell gestiegen. In ihren Videos tanzt sie, präsentiert sich in neuen Klamotten, stellt ihren Alltag vor. Ihr folgen über 70.000 Abonnenten auf Instagram – und damit gehört sie zu den sogenannten Power-Influencerinnen. Zu ihnen gehört auch die 13-jährige Coco. Sie hat auf TikTok angefangen. Auf Instagram hat sie aktuell über 130.000 Follower. Worum es in ihrem Account geht, erzählt sie selbst: „Ich möchte den Leuten etwas Positives geben. Ich will ihnen sagen, dass sie positiv durchs Leben gehen sollen.“',
            },
            {
              text: 'Emilia und Coco sind im Laufe der Zeit schon Profis geworden. Unterstützt werden beide Mädchen von ihren Müttern. Die Mädchen haben ziemlich schnell gelernt, sich regelmäßig zu den richtigen Uhrzeiten zu melden.',
            },
            {
              text: 'Emilia begrüßt ihre Followerinnen und Follower morgens vor der Schule immer mit dem gleichen Satz: „Guten Morgen, meine Lieben, ich hoffe, ihr habt alle gut geschlafen...“. Über den Tag verteilt macht sie immer wieder Instagram-Storys, manchmal auch in den Pausen in der Schule, die letzte abends vor dem Schlafengehen.',
            },
            {
              text: 'Coco ist fleißig und sehr gut in der Schule. Für ihre Hobbys Tanz- und Tennistraining benötigt sie viel Zeit. Und nebenbei postet sie ihre Storys und Bilder. Einfach mal aussetzen eher keine Option für sie. „Eine Woche Pause auf Instagram wäre für mich zu lang. Die Fans mögen es nicht, wenn man nicht so aktiv ist“, sagt sie. Gerade Urlaube sind für eine Insta-Pause der Mädchen nicht geeignet. Denn Reisen bieten die besten neuen Bilder für interessante Beiträge.',
            },
            {
              text: 'Emilia und Coco sehen die Rolle als Influencerin nicht als Berufsziel. Sie wollen Rechtsanwältin oder Ärztin werden. Nur auf Social-Media zu setzen, bedeutet für sie zu viel Risiko. Emilia findet: „Es kann immer von heute auf morgen vorbei sein.“ Darin unterscheiden sich die Mädchen von vielen ihrer Bewunderer. Denn mit der eigenen Persönlichkeit und Werbung über Social-Media Geld verdienen - viele Kinder und Jugendliche finden heute: Genau das wär‘ mein Traum.',
            },
            { style: 'note', text: '*Follower = eine Person, die regelmäßig bestimmte Nachrichten in sozialen Medien erhält' },
          ],
          booleanLabels: ['R', 'F'],
          examples: rf(0, ['Die meisten Leute denken, dass es leicht ist, Posts zu erstellen.'], 'R'),
          items: rf(
            10,
            [
              'In den sozialen Netzwerken aktiv zu sein, kostet sehr viel Zeit.',
              'Coco hat mehr als 70 000 Follower.',
              'Coco hat zuerst auf TikTok gepostet.',
              'Die Familien finden die Tätigkeit der Mädchen nicht gut.',
              'Man kann im Voraus nicht wissen, wann die Mädchen etwas posten.',
              'Emilia beschäftigt sich mit ihren Storys auch in der Schule.',
              'Die beiden Mädchen posten während ihres Urlaubs nichts.',
              'Coco und Emilia finden den Hauptberuf Influencerin unsicher.',
            ],
            'R F R F F R F R',
          ).map((item) =>
            item.id === '11'
              ? { ...item, reviewNote: 'Az útmutató szerint a 11. itemnél a helyes, richtig (R) válasz is 1 pontot ér (Coco tényleg 130 000 követővel rendelkezik).' }
              : item,
          ),
        },
        {
          id: 'I-3',
          label: '3.',
          instructions:
            'Was passt in den Text? Schreiben Sie den entsprechenden Buchstaben in die Rubrik. Achtung! Es gibt einen Buchstaben zu viel. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'Hilfetelefon: Die Nummer gegen Kummer*' },
            {
              text: 'Rund 20.000 Menschen wählen jeden Monat bei kleinen und großen Problemen die „Nummer gegen Kummer“. Kinder, Jugendliche und auch Eltern {{0}} Kostenlos. Anonym. Und sehr hilfreich. „Hallo, hier ist das Elterntelefon!“, {{18}} – und wartet. Eine Sekunde, zwei Sekunden, drei, dann hört sie, wie jemand tief Luft holt. „Ich habe ein Problem!“, sagt eine Frau am anderen Ende. Ihren Namen muss sie nicht nennen, {{19}}. Ihr Problem ist, dass sie sich nur noch mit ihrem Sohn streitet, {{20}}, und er nur noch schlechte Noten nach Hause bringt. Viele Eltern, die anrufen, sind wegen ihrer Arbeit überfordert. Es melden sich auch Menschen, die nicht mit anderen über ihre Probleme sprechen können, weil es ihnen peinlich ist. Angst, Hilflosigkeit und Verunsicherung sind die häufigsten Gründe, {{21}}. Rund 3.900 geschulte Mitarbeiter helfen am Telefon. Nicht nur Pädagogen, sondern auch Hausfrauen und Studenten sind insgesamt 900.000 Stunden im Jahr ehrenamtlich tätig. Und auch noch Schüler, {{22}}. Methoden, um zu helfen, lernt jeder Berater in einer Schulung: Wie man aktiv zuhört, sich als Person zurücknimmt und jemanden mit Worten tröstet. Jede Beratung ist so individuell wie das Problem, {{23}}. Doch eins haben alle Anrufer gemeinsam: Sie werden informiert, beraten und entlastet. Denn gerade das verständnisvolle Zuhören ist sehr hilfreich. Und warum steigt die Zahl der Anrufer seit Jahren kontinuierlich? Weil das ein großes, gesellschaftliches Problem ist, dass die Menschen nicht mehr miteinander sprechen können, denn {{24}}, übers Handy und per Internet. Deshalb ist es wichtig, dass mit diesem Angebot Kinder und Jugendliche die Möglichkeit haben, {{25}}. Die meisten Anrufer können schon im Laufe des Gesprächs ihr Problem klären. Manche bekommen auch einen Ansprechpartner genannt, an den sie sich wenden können.',
            },
            { style: 'note', text: '*der Kummer = Schwierigkeit, Sorge, Schmerz' },
          ],
          bankTitle: 'ANTWORTEN',
          bank: [
            { key: 'A', text: 'die hier samstags andere Jugendliche beraten' },
            { key: 'B', text: 'er spielt auch keine Rolle' },
            { key: 'C', text: 'erhalten hier Beratung' },
            { key: 'D', text: 'heute kommunizieren Leute anders miteinander' },
            { key: 'E', text: 'sagt eine ruhige Stimme' },
            { key: 'F', text: 'über ihre Probleme zu sprechen' },
            { key: 'G', text: 'um das es geht' },
            { key: 'H', text: 'welche Themen Jugendliche am meisten beschäftigen' },
            { key: 'J', text: 'warum Eltern die „Nummer gegen Kummer“ anrufen' },
            { key: 'K', text: 'weil er nichts für die Schule tut' },
          ],
          unusedBankCount: 1,
          examples: choices(0, 'C'),
          items: choices(18, 'E B K J A G D F'),
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
          instructions:
            'Schreiben Sie die angegebenen Wörter in der richtigen Form in den Text. Achtung! Schreiben Sie in jede Lücke nur ein Wort. (0) ist ein Beispiel für Sie. (der/die/das – ein/eine)',
          passage: [
            { style: 'title', text: 'Statt Augsburg in Paris angekommen' },
            {
              text: '{{0}} Mann aus Merching ist etwas Lustiges passiert. Er war auf der Buchmesse in Frankfurt. Nach {{1}} Besuch dort wollte er heim nach Augsburg. Aber er ist in Paris angekommen. Wie ist {{2}} passiert? Nach der Buchmesse setzte er sich in {{3}} Flixbus. (Flixbus heißt ein Fernbus-Unternehmen, seine Busse fahren überall in Europa, und die Fahrkarten sind billig.) Der Bus fuhr von Frankfurt nach Kaiserslautern. Von da aus ging es mit {{4}} anderen Bus nach Augsburg. Herr Quillmann musste also in Kaiserslautern umsteigen. Das war um 12 Uhr in {{5}} Nacht.',
            },
            {
              text: 'Aber: Herr Quillmann ist eingeschlafen. Er hatte eine anstrengende Arbeitswoche. Und war sehr müde. Er ist im Bus sitzen geblieben. Nicht mal {{6}} Klingeln von seinem Handy-Wecker hat er gehört. Erst als junge Männer vor ihm laut waren, ist er aufgewacht. Da war es schon nach 6 Uhr morgens. Er war kurz vor Paris.',
            },
            {
              text: 'Erst hat er sich erschrocken. Dann fand er seine Situation aber sehr lustig. Er hat {{7}} Beste daraus gemacht und hat in Paris gefrühstückt. Danach kümmerte er sich um seine Heimreise nach Augsburg. Er ist mit dem ICE zurückgefahren.',
            },
          ],
          examples: cloze(0, [['Einem']]),
          items: cloze(1, [['dem'], ['das'], ['einen'], ['einem'], ['der'], ['das'], ['das']]),
        },
        {
          id: 'II-2',
          label: '2.',
          instructions: 'Was passt in den Text? Unterstreichen Sie das richtige Wort. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'Kann ein Roboterhund ein Flugzeug ziehen?' },
            {
              text: 'Es gibt schon {{0}} Roboter mit besonderen Eigenschaften. Manche können fliegen, schwimmen oder tauchen. Sie sind entweder besonders klein, leicht {{8}} biegsam. Ein besonders starker Roboter ist HyQReal, ein vierbeiniger Roboterhund. Der Roboter ist etwas {{9}} als einen Meter, fast einen Meter hoch und wiegt 130 Kilogramm. Der Roboter HyQReal {{10}} von vier Elektromotoren angetrieben. An jedem Bein ist ein Motor, {{11}} von einer Batterie versorgt wird. Am Ende der Beine ist ein besonderes Gummistück befestigt, {{12}} der Roboter gut auf dem Boden stehen kann. Die italienischen Forscher haben HyQReal für Katastropheneinsätze und die Landwirtschaft entwickelt. Der Roboter soll besonders {{13}} Gegenstände transportieren.',
            },
            {
              text: 'In einem Versuch wurde getestet, wie stark der Roboterhund ist. Die Forscher spannten an einem Seil ein Flugzeug an den Roboter. HyQReal {{14}} den Test und zog das dreißigmal schwerere Flugzeug zehn Meter hinter sich her!',
            },
          ],
          examples: gapMcqs(0, [['viel', 'viele', 'vielen', 'vieler']], 'B'),
          items: gapMcqs(
            8,
            [
              ['oder', 'sondern', 'sowohl', 'weder'],
              ['lang', 'langer', 'länger', 'längster'],
              ['hat', 'kann', 'soll', 'wird'],
              ['das', 'den', 'der', 'die'],
              ['damit', 'denn', 'weil', 'wenn'],
              ['schwer', 'schwere', 'schweren', 'schwerer'],
              ['bestand', 'entstand', 'stand', 'verstand'],
            ],
            'A C D C A B A',
          ),
        },
        {
          id: 'II-3',
          label: '3.',
          instructions:
            'Was passt in den Text? Schreiben Sie die entsprechenden Buchstaben in die Rubrik. Achtung! Es gibt einen Buchstaben zu viel. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'Hilfe zu Hause' },
            {
              text: 'Die alte Frau liegt noch im Bett, ist aber schon wach. Sie hat auf Milo gewartet, {{0}}. Milo ist Pflegeassistent. Er hilft Menschen, {{15}} und deswegen Pflege brauchen. „Früher war ich in einem Krankenhaus angestellt“, erzählt er. „Jetzt arbeite ich bei der Hauspflege {{16}}.“ Milos Tag beginnt um halb sieben mit seinem ersten Hausbesuch.',
            },
            {
              text: 'Der junge Mann hilft Frau Widmann aus dem Bett {{17}}. Anschließend richtet er das Frühstück her und bereitet die Medikamente für den Tag vor. Während Frau Widmann frühstückt, {{18}}. „Es gibt immer etwas zu tun“, meint Milo. „Manchmal begleite ich meine Patientinnen und Patienten auch zum Einkaufen oder mache mit ihnen kleine Übungen, damit sie fit bleiben.“',
            },
            {
              text: 'Milo hat eine Schule für Gesundheits- und Krankenpflege besucht. Dort hat er alles gelernt, {{19}}. Es ist auch wichtig, {{20}}. „Mein Beruf ist ziemlich anstrengend“, meint Milo, „aber er hat auch viele schöne Seiten.“',
            },
          ],
          bank: [
            { key: 'A', text: 'dann geht er zu seinem nächsten Hauspatienten' },
            { key: 'B', text: 'die alt oder krank sind' },
            { key: 'C', text: 'denn er kommt fast jeden Morgen zu ihr' },
            { key: 'D', text: 'schaltet er die Waschmaschine ein' },
            { key: 'E', text: 'und betreue Menschen zu Hause' },
            { key: 'F', text: 'und geht mit ihr ins Bad' },
            { key: 'G', text: 'viel Geduld zu haben und körperlich fit zu sein' },
            { key: 'H', text: 'was er für seinen Beruf braucht' },
          ],
          unusedBankCount: 1,
          examples: choices(0, 'C'),
          items: choices(15, 'B E F D H G'),
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
        storagePath: 'erettsegi-de-kozep-2022-majus.mp3',
        durationSec: 1802,
        // Task starts: the ~60 s reading pause of each task found by silence detection, minus the length of its announcement (approximate, ±10 s).
        taskMarkers: [
          { taskId: 'III-1', startSec: 75 },
          { taskId: 'III-2', startSec: 683 },
          { taskId: 'III-3', startSec: 1266 },
        ],
      },
      conversion: [0, 2, 3, 5, 7, 8, 10, 12, 13, 15, 17, 18, 20, 21, 23, 25, 26, 28, 30, 31, 33],
      transcripts: [
        {
          taskId: 'III-1',
          title: 'Chinesen lieben den deutschen Influencer',
          paragraphs: [
            'Video-Geschichten übers Essen machten ihn in China berühmt. Der 30-jährige Thomas Gerksen alias „Afu“ kommt im Reich der Mitte auf ein paar Millionen Follower. Der einflussreiche Mittler zwischen deutscher und chinesischer Kultur lebt mit seiner Frau in Shanghai. Seine Video-Clips haben Thomas in China berühmt gemacht. Nicht unter dessen deutschem Namen allerdings, sondern unter „Afu“. Das ist der chinesische Spitzname des 30-Jährigen.',
            'Die rund zehnminütigen Video-Geschichten von Afu handeln von seinem Leben in Shanghai, vom Zusammenleben mit seiner chinesischen Frau und mit seinen Schwiegereltern und ganz viel geht’s ums Essen. „Essen ist wahnsinnig wichtig in China, egal ob in der Familie, beim Daten oder bei geschäftlichen Treffen – das Essen spielt eine wichtige Rolle hier. Und auch ich liebe die chinesische Küche. Deswegen geht es in unseren Videos häufig darum. Und die Leute schauen sich das auch sehr gerne an.“',
            'Egal, ob Afu im Norden Chinas unterwegs ist und scharfe Fischsuppe probiert oder ob er in seiner Heimatstadt Gummersbach östlich von Köln in einem stinknormalen deutschen Supermarkt einkaufen geht: Er und seine Frau machen daraus launige Videos – und seine Fans in China lieben diesen Einblick ins deutsche Leben, diese Einblicke in die Denkweise der Deutschen.',
            '„Ich interessiere mich für Deutschland, war aber nie dort“, sagt die Mitte-30-jährige Gong Chen aus der chinesischen Stadt Hohhot, „für mich ist es interessant, durch ihn und seine Videos einen Einblick zu bekommen in die deutsche Seele und in die Denkweise der Deutschen. Ich lerne so sehr viel über das Land.“',
            'Bei Facebook und Youtube hat Afu rund 400.000 Follower. Auf chinesischen Video-Seiten sind es nochmal fast 20-mal so viele. „In China gibt es insgesamt 20 Plattformen. Wir haben zusammengenommen sieben Millionen Follower. Hört sich nach einer Menge an, ist aber für chinesische Verhältnisse nur so mittelmäßig.“',
            'Zu Afus Erfolgsrezepten gehört auch, dass er über sich selbst lachen kann. Über seine – wie er selbst sagt – „Buddha-mäßige“ Figur etwa, über seine weiße Haut, auf die Chinesinnen so stehen.',
            'Verschiedene Szenen aus seinem Leben in China hat Afu auch in einem Buch verarbeitet. Der inzwischen kommerziell sehr erfolgreiche Video-Blogger erzählt darin sein Leben. „Das ist das, was mir am meisten Spaß macht. Ich hoffe, dass ich auch in zehn Jahren noch Videos mache und vielleicht noch ein zweites Buch schreiben kann. Das sind die Dinge, die ich am liebsten tun möchte.“',
          ],
        },
        {
          taskId: 'III-2',
          title: 'Stadtrundfahrt',
          paragraphs: [
            'Korrespondenten berichten über Stadtrundfahrten:',
            'In Madrid fahren rote Doppeldeckerbusse quer durch die Stadt. Die sieht man wirklich alle zwei, drei Minuten. Viele Touristenbusse fahren mit offenem Verdeck. Und wenn Urlauber oben sitzen, dann sind sie oft falsch gekleidet. Denn in Madrid wird es gern mal 38 bis 40 Grad Celsius. Wer da nicht seinen Kopf schützt, der kommt mit hochrotem Kopf wieder. Von einem Freund gehört, der als Reiseführer arbeitet, habe ich jetzt gehört, dass die Chinesen aktuell sehr gern kommen, weil sie die spanische Küche so mögen. Weil diese Küche sehr viel Fleisch beinhaltet und Reis – Paella zum Beispiel.',
            'Singapur ist ein beliebter Zwischenstopp. Hier gibt es bei Bussen dieses „Hop-on/Hop off“-Modell. Die meisten Touristen in Singapur tragen Hosen, an denen man die Beine abmachen kann. Und meistens schwitzen sie ganz fürchterlich, weil sie machen etwas, was kein Singaporer macht: Sie gehen mittags raus. Das macht man einfach nicht, nur die Touristen.',
            'In Kairo gibt es natürlich das Highlight ‚Pyramiden‘. Touristen, die sich die Pyramiden ansehen, werden mit Bussen dort hingefahren. Auch große ägyptische Reisegruppen fahren hin, um ihr Land kennenzulernen. Auch die Ägypter kommen grundsätzlich im Reisebus. In Kairo ist der Kulturtourismus nicht so richtig verbreitet. Wenn Kulturtouristen kommen, dann fliegen die nach Luxor.',
            'In Mexiko-Stadt gibt es unglaublich viele Touristenbusse. Die sind rot, das sind Doppeldeckerbusse. Sie fahren durch die engen Gassen. Und dann gibt es Touren in Mexiko-Stadt, die Mezcal-Touren, die sind besonders beliebt. Mezcal (Meskal) ist das Nationalgetränk, ein Schnaps, der aus dem Fruchtfleisch verschiedener Agavenarten gemacht wird. Dann können die Touristen schön einen Schnaps nach dem anderen ausprobieren. Da steigt dann auch die Stimmung.',
            'In Stockholm sind die meisten Touristen im Sommer da. Aber im Sommer sind keine Stockholmer mehr in Stockholm. Der Sommer ist etwas Heiliges und den verbringt man im Wald und am See, aber nicht in der großen Stadt. Es gibt einen Spruch in Schweden, der heißt: Wahre Freunde besuchen dich im Winter. Schweden ist für alle Leute dieses wunderbare Land, wo die Sonne nicht untergeht. Der Himmel ist blau, das Wasser warm. Alles voller Schiffe und netter Menschen. Das stimmt. Aber das stimmt nur 100 Tage im Jahr. Und die anderen Tage ist es so, als ob man im Kühlschrank lebt, und die Lampe ist kaputt.',
          ],
        },
        {
          taskId: 'III-3',
          title: '„Stunde der Wintervögel“',
          paragraphs: [
            '…Vogelgesang mitten in der Stadt und dann auch noch im Winter? Und welche Vögel fliegen da rum? Die häufigsten Vogelarten sollte man schon kennen, wenn man bei der sogenannten „Stunde der Wintervögel” mitmachen will. Aber ansonsten ist es ganz einfach: eine Stunde im Park, im Garten oder auf dem Balkon sitzen und die Vögel zählen. Die Aktion hat der Naturschutzbund Deutschland, kurz: NABU, gemeinsam mit einer Gruppe Vogelfreunde in Berlin gestartet. Aber nicht nur in Berlin, in ganz Deutschland hat der NABU für dieses Wochenende Vogelfreunde dazu aufgerufen, eine Stunde lang die Vögel in ihrer Umgebung zu zählen. Das hilft Vogelschutzexperten wie Lars Lachmann vom NABU bei ihrer Arbeit.',
            '„Die Daten der „Stunde der Wintervögel“ sind sehr wertvoll für uns, weil wir einen Einblick in die Vogelwelt in Deutschlands Gärten erhalten und innerhalb von zwei Tagen sagen können, wie es den Vögeln in Deutschland geht. Das wichtigste für uns ist die Zahl der beobachteten Vögel, und diese Zahl können wir vergleichen und dann herausfinden, welche Vogelart zunimmt und welche abnimmt.”',
            'Wenn man dieses Jahr aber erst mal nicht ganz so viele Vögel beobachten kann, ist das nicht gleich ein Grund zur Sorge. Denn der Winter war bisher sehr mild. Ohne Schnee und Eis finden Vögel auch im Wald ausreichend Futter und kommen seltener in unsere Gärten und Parks. Die warmen Temperaturen locken aber auch Vögel an, die man sonst im Winter eher selten sieht. Der Vogel, der bei der Aktion „Stunde der Wintervögel“ vor einem Jahr am häufigsten beobachtet wurde, war übrigens der Spatz. Damals haben laut NABU fast 140 000 Menschen mitgemacht. Für alle, die in diesem Jahr mitmachen wollen, hat Herr Lachmann noch ein paar Tipps:',
            '„Warten Sie ab, bis Sie eine Stunde ohne Regen an diesem Wochenende haben. Setzen Sie sich einfach in den Garten, es ist ja warm genug dafür. Wenn es doch kalt ist, kann man genauso gut aus dem Fenster rausgucken. Machen Sie sich keine Sorgen, wenn sie mal einen Vogel nicht erkennen können. Das ist ganz normal. Wenn Sie dann gezählt haben, melden Sie die Daten.“',
          ],
        },
      ],
      tasks: [
        {
          id: 'III-1',
          label: '1.',
          instructions:
            'Sie hören einen Text über einen deutschen Influencer. Lesen Sie zuerst die Aufgabe. Sie hören dann den Text zweimal. Zuerst hören Sie den ganzen Text ohne Pausen, dann in kürzeren Abschnitten. Notieren Sie kurz die Informationen. Schreiben Sie in jede Lücke nur eine Information. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'Chinesen lieben den deutschen Influencer' },
            { style: 'note', text: '*Follower = eine Person, die regelmäßig bestimmte Nachrichten in sozialen Medien erhält' },
          ],
          examples: [
            {
              id: '0',
              type: 'short-text',
              prompt: 'Afus richtiger Name: ________',
              answer: { accepted: ['Thomas Gerksen'], match: 'exact-ci' },
            },
          ],
          items: [
            {
              id: '1',
              type: 'short-text',
              prompt: 'Wohnort mit seiner Frau: ________',
              answer: { accepted: ['Shanghai', 'China'], match: 'keywords', keywords: [['shanghai', 'china']] },
            },
            {
              id: '2',
              type: 'short-text',
              prompt: 'Themen seiner Videogeschichten z. B.: (1) ________',
              answer: {
                accepted: ['sein Leben (in Shanghai)', 'Zusammenleben mit seiner chinesischen Frau / mit seinen Schwiegereltern', '(das) Essen / chinesische Küche'],
                match: 'keywords',
                keywords: [['leben', 'zusammenleben', 'frau', 'schwiegereltern', 'essen', 'küche']],
              },
              reviewNote: 'A 2. és 3. itemre adott két helyes válasz sorrendje mindegy.',
            },
            {
              id: '3',
              type: 'short-text',
              prompt: 'Themen seiner Videogeschichten z. B.: (2) ________',
              answer: {
                accepted: ['sein Leben (in Shanghai)', 'Zusammenleben mit seiner chinesischen Frau / mit seinen Schwiegereltern', '(das) Essen / chinesische Küche'],
                match: 'keywords',
                keywords: [['leben', 'zusammenleben', 'frau', 'schwiegereltern', 'essen', 'küche']],
              },
              reviewNote: 'A 2. és 3. itemre adott két helyes válasz sorrendje mindegy.',
            },
            {
              id: '4',
              type: 'short-text',
              prompt: 'Chinesische Fans können das über Deutschland lernen, z. B.: ________',
              answer: {
                accepted: ['das deutsche Leben', '(das Denken /) die Denkweise der Deutschen', 'die deutsche Seele'],
                match: 'keywords',
                keywords: [['leben', 'denken', 'denkweise', 'seele']],
              },
            },
            {
              id: '5',
              type: 'short-text',
              prompt: 'Zahl seiner Follower* bei Facebook und Youtube: ________',
              answer: { accepted: ['(rund) 400.000', '400 000'], match: 'keywords', keywords: [['400']] },
            },
            {
              id: '6',
              type: 'short-text',
              prompt: 'Ein Grund für Afus Erfolge, z. B.: ________',
              answer: {
                accepted: ['er kann über sich selbst lachen', 'seine Figur / weiße Haut (gefällt den Chinesinnen)'],
                match: 'keywords',
                keywords: [['lachen', 'figur', 'haut', 'buddha']],
              },
            },
            {
              id: '7',
              type: 'short-text',
              prompt: 'Pläne für die nächsten 10 Jahre: (1) ________',
              answer: { accepted: ['(weitere) Videos machen', '(noch ein) (zweites) Buch schreiben'], match: 'keywords', keywords: [['video', 'buch']] },
              reviewNote: 'A 7. és 8. itemre adott két helyes válasz sorrendje mindegy.',
            },
            {
              id: '8',
              type: 'short-text',
              prompt: 'Pläne für die nächsten 10 Jahre: (2) ________',
              answer: { accepted: ['(noch ein) (zweites) Buch schreiben', '(weitere) Videos machen'], match: 'keywords', keywords: [['video', 'buch']] },
              reviewNote: 'A 7. és 8. itemre adott két helyes válasz sorrendje mindegy.',
            },
          ],
        },
        {
          id: 'III-2',
          label: '2.',
          instructions:
            'Sie hören einen Text über Touristen in verschiedenen Städten. Lesen Sie zuerst die Aufgabe. Sie hören dann den Text zweimal. Zuerst hören Sie den ganzen Text ohne Pausen, dann in kürzeren Abschnitten. Entscheiden Sie beim Hören, welche Aussage zu welchem Land passt und kreuzen Sie an. Achtung! Eine Aussage kann zu mehreren Ländern passen. Sie dürfen insgesamt 6-mal ankreuzen. (0) ist ein Beispiel für Sie.',
          passage: [{ style: 'title', text: 'Stadtrundfahrt' }, { text: 'Hier…' }],
          rules: { multiSelectPenalty: true },
          examples: [{ id: '0', type: 'multi-select', stem: '… fahren die Touristen mit roten Doppeldeckerbussen.', options: cities, answer: ['1'], pick: 1 }],
          items: [
            { id: '9', type: 'multi-select', stem: '… sieht man viele chinesische Touristen, die wegen der Nationalküche kommen.', options: cities, answer: ['1'], pick: 1 },
            { id: '10', type: 'multi-select', stem: '… gehen die Stadtbewohner mittags nicht raus.', options: cities, answer: ['2'], pick: 1 },
            { id: '11', type: 'multi-select', stem: '… gibt es viele Besucher, die ihr eigenes Land kennenlernen wollen.', options: cities, answer: ['3'], pick: 1 },
            { id: '12', type: 'multi-select', stem: '… fahren die Touristen mit roten Doppeldeckerbussen.', options: cities, answer: ['4'], pick: 1 },
            { id: '13', type: 'multi-select', stem: '… probieren die Touristen gerne das Nationalgetränk aus.', options: cities, answer: ['4'], pick: 1 },
            { id: '14', type: 'multi-select', stem: '… verbringen die Einwohner den Sommer fern von der Stadt, in der Natur.', options: cities, answer: ['5'], pick: 1 },
          ],
        },
        {
          id: 'III-3',
          label: '3.',
          instructions:
            'Sie hören einen Text über eine Aktion des Naturschutzbundes Deutschland. Lesen Sie zuerst die Aufgabe. Sie hören dann den Text zweimal. Zuerst hören Sie den ganzen Text ohne Pausen, dann in kürzeren Abschnitten. Entscheiden Sie, welche Aussage richtig (R) oder falsch (F) ist. Kreuzen Sie die Antwort beim Hören an. (0) ist ein Beispiel für Sie.',
          passage: [{ style: 'title', text: '„Stunde der Wintervögel“' }],
          booleanLabels: ['R', 'F'],
          examples: rf(0, ['Bei der Naturschutzaktion werden Wintervögel gezählt.'], 'R'),
          items: rf(
            15,
            [
              'Die „Stunde der Wintervögel“ findet am Wochenende nur in Berlin statt.',
              'Mit der Aktion bekommt man Informationen, ob sich die Tierzahlen bei den Vogelarten verändern.',
              'Es bedeutet nichts Gutes, wenn man nur wenige Vögel sieht.',
              'Wenn der Winter wärmer ist, gibt es mehr Vögel in den städtischen Gärten und Parks.',
              'An der Aktion im vorigen Jahr haben 140 000 Leute teilgenommen.',
              'Bei Regen sollte man die Vögel nicht zählen.',
            ],
            'F R F F R R',
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
          title: 'Bei einem Problem Rat geben: Das perfekte Profilbild',
          instructions: 'Sie bekommen von Lisa, Ihrer deutschen Freundin, eine E-Mail. Hier ist ein Auszug:',
          passage: [
            {
              text: '„Ich bin mit meinen Profilbildern nicht zufrieden! … Schon oft habe ich probiert, gute Profilbilder zu machen. … Ich habe meistens Selfies oder Fotos mit Freunden, aber das wird schon langsam langweilig. … Hast Du Ideen für lustige, extravagante und schöne Profilbilder?“',
            },
          ],
          items: [
            {
              id: '1',
              type: 'production',
              prompt: ['Schreiben Sie eine E-Mail an Lisa und geben Sie ihr Rat. Gehen Sie dabei auf die folgenden Punkte ein:'],
              contentPoints: [
                'Reagieren Sie auf die Frage Ihrer Freundin.',
                'Für wie wichtig halten Sie Profilbilder in sozialen Netzwerken? Warum?',
                'Geben Sie Tipps, wie oder wo man interessante Profilbilder machen kann.',
              ],
              promptAfter: ['Die Reihenfolge der Leitpunkte können Sie selbst bestimmen. Verwenden Sie für Ihren Text 80-100 Wörter.'],
              minWords: 80,
              maxWords: 100,
              opening: 'Liebe Lisa,',
              register: 'informal-message',
              rubricId: 'erettsegi-kozep-1',
              criteria: DE_CRITERIA_1,
            },
          ],
        },
        {
          id: 'IV-2',
          label: '2.',
          title: 'Ferien in einem Lerncamp*',
          instructions: 'In einem Internetforum zum Thema Lernen haben Sie einen interessanten Beitrag gefunden. Hier sind einige Auszüge daraus:',
          passage: [
            {
              text: '„Noch nie war lernen so lustig! … Ich bin jetzt in einem Lerncamp, in einem Ferienlager, wo ich meine Sprachkenntnisse verbessern kann. Täglich haben wir ein buntes Programm mit Lerntipps, praktischen Übungen und Funsport. … Dieses Lern-Feriencamp ist der perfekte Mix: Nach einem halben Tag Lernen haben wir viele Rahmenprogramme: Disco, Lagerfeuer, Kinoabend, Nachtexpedition und Shows. ... Gibt es auch bei euch solche Lerncamps?”',
            },
            { style: 'note', text: '* Camp = Lager, Ferienlager' },
          ],
          items: [
            {
              id: '2',
              type: 'production',
              prompt: ['Schreiben Sie Ihre Meinung zum Thema in einem Forumsbeitrag. Gehen Sie dabei auf die folgenden Punkte ein:'],
              contentPoints: [
                'Ist dieses Thema Ihrer Meinung nach aktuell bzw. interessant? Warum (nicht)?',
                'Warum sind Feriencamps beliebt?',
                'Welche Erfahrungen haben Sie mit Camps?',
                'Würden Sie bei einem Lerncamp mitmachen? Warum (nicht)?',
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
