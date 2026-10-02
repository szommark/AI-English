// Német nyelv, középszintű írásbeli érettségi, 2023. október 24. (2211), Oktatási Hivatal.
// Transcribed verbatim from the feladatlap and its javítási-értékelési útmutató (answer key,
// conversion tables, listening transcripts). Decorative photos are left out.
import type { ExamPaper } from '../types'
import { choices, cloze, DE_CRITERIA_1, DE_CRITERIA_2, DE_LISTENING_INTRO, DE_NOTICES_HU, DE_WRITING_INTRO, gapMcqs, rf } from './deKozep.ts'

const countries = [
  { key: '1', text: 'Spanien' },
  { key: '2', text: 'Indien' },
  { key: '3', text: 'Südafrika' },
  { key: '4', text: 'China' },
  { key: '5', text: 'Südamerika' },
]

const paper: ExamPaper = {
  id: 'erettsegi-de-kozep-2023-oktober',
  type: 'erettsegi',
  language: 'de',
  level: 'kozep',
  sittingLabelHu: '2023. október',
  source: 'Oktatási Hivatal: Német nyelv, középszintű írásbeli vizsga, 2023. október 24. (2211) — feladatlap és javítási-értékelési útmutató.',
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
            'Lesen Sie den Text über Morgenroutine in der Wohngemeinschaft und ordnen Sie den Abschnitten die richtige Überschrift zu. Achtung! Es gibt einen Titel zu viel. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'Morgenroutine in der WG' },
            {
              text: '{{0}} Morgens frisch und fit in den Uni-Tag starten: Das ist mit ein paar Tipps zur richtigen Körperpflege und für ein gesundes Frühstück kein Problem. Wir verraten, wie die optimale Morgenroutine in deiner WG aussehen könnte.',
            },
            {
              text: '{{1}} Wer abends rechtzeitig ins Bett geht, kommt morgens auch gut aus dem Bett. Nun gehört eine feste Zubett- und Aufstehroutine nicht unbedingt zum Studentenleben dazu. Partys, lustige Abende mit Freunden sind eher Standard. Aber solange das nicht die Regel ist, ist das kein Problem.',
            },
            {
              text: '{{2}} Das erste, was du machst, wenn du aufwachst, ist etwas trinken. Gleich nach dem Aufstehen, ganz in Ruhe. Der Körper braucht morgens Flüssigkeit. Danach geht es je nach Vorliebe erst mal ins Bad zum Fertigmachen oder in die Küche zum Frühstücken.',
            },
            {
              text: '{{3}} Nach dem Frühstück oder auch davor geht es ins Badezimmer. Morgens zu duschen bringt den Vorteil mit sich, dass man dadurch schneller wach und fit wird. Besonders effektiv sind Wechselduschen. Wichtig ist nur, dass du am Ende mit dem kalten Wasser aufhörst. Du kannst dir deine Lieblingsmusik anmachen und, na klar, auch mitsingen.',
            },
            {
              text: '{{4}} Für viele ist eine schicke Frisur wichtig. Ob du die Haare an der Luft trocknest oder föhnst, ist Geschmackssache. Wenn du im Anschluss gleich außer Haus musst, solltest du sie föhnen. Mit nassen Haaren bei Wind und Wetter nach draußen zu gehen, ist alles andere als gesund.',
            },
            {
              text: '{{5}} Zur Morgenroutine gehört es auch, sein Bett zu machen. Gerade in der WG, wo das eigene Zimmer gleichzeitig Schlaf-, Wohn- und Arbeitszimmer ist, ist ein ordentliches Bett wichtig. Das Zimmer sieht aufgeräumter aus und man legt sich abends lieber wieder hinein.',
            },
            {
              text: '{{6}} Morgens muss es meistens etwas schneller gehen, da sollte man nicht auf die Idee kommen, eine plötzlich andere Garderobe zusammenzustellen. Experimente kann man mal in einer ruhigen Minute ausprobieren.',
            },
            {
              text: '{{7}} Morgens mögen die meisten erst mal einen starken Kaffee. Dagegen spricht auch überhaupt nichts, wichtig ist nur, zum Kaffee noch ein Glas Wasser zu trinken. Zum Frühstück solltest du nicht nur ein einfaches Weizenbrötchen oder Toastbrot essen. Besser sind Haferflocken oder ein leckeres Vollkornmüsli mit Nüssen und frischem Obst.',
            },
          ],
          bankTitle: 'TITEL',
          bank: [
            { key: 'A', text: 'Die Wasserflasche soll auf deinem Nachttisch stehen' },
            { key: 'B', text: 'Genügend Schlaf für einen guten Morgen' },
            { key: 'C', text: 'Gute Laune unter der Dusche' },
            { key: 'D', text: 'Keine Erkältung riskieren' },
            { key: 'E', text: 'Keine Zeit für etwas ganz Neues' },
            { key: 'F', text: 'Richtig frühstücken' },
            { key: 'G', text: 'So gelingt der Start in den Tag' },
            { key: 'H', text: 'So ist es nicht nur abends angenehmer' },
            { key: 'I', text: 'Vor dem Anziehen den Wetterbericht hören' },
          ],
          unusedBankCount: 1,
          examples: choices(0, 'G'),
          items: choices(1, 'B A C D H E F'),
        },
        {
          id: 'I-2',
          label: '2.',
          instructions:
            'Lesen Sie den Text darüber, was die besten Ziele für eine Abireise sind und entscheiden Sie, welche Aussage richtig (R) und welche falsch (F) ist. Kreuzen Sie die Antwort in der Tabelle an. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'Abschlussfahrt – aber wohin?' },
            { text: 'Was sind die besten Ziele für eine Abireise? Party, Shopping, Strand, Kultur oder Natur?' },
            {
              text: 'Bevor man nach dem Abi in alle Richtungen geht, plant man noch einmal gemeinsam wegzufahren. Doch gerade das Wichtigste fehlt noch: das Reiseziel für eine individuelle Abifahrt! Dabei helfen professionelle Angebote.',
            },
            {
              text: 'Eine Party-Reise mit durchtanzten Disco-Nächten? Dann ist die Unterbringung eigentlich vollkommen egal, man ist ja ständig unterwegs: abends in Clubs, Discos oder Bars und tagsüber am Hotelpool oder Strand.',
            },
            {
              text: 'Wenn man nach den Prüfungen einfach nur relaxen möchte, wäre ein entspannter Strandurlaub genau das Richtige. Natürlich kann man dafür nach Mallorca fliegen oder an die Costa Brava fahren, nur soll man dann nach kleineren, ruhigeren Orten schauen. Viel entspannter wird der Urlaub noch dazu, wenn man anstatt eines Hotels einen oder mehrere Bungalows bucht. Der einzige Nachteil: Man muss selber kochen.',
            },
            {
              text: 'Es geht aber noch entspannter als am Strand: in der Natur. Nicht im Hotel oder in Bungalows, sondern Urlaub im Zelt. Entweder auf dem Campingplatz oder in der freien Natur. Wildes Camping ist in vielen Ländern (beispielsweise in Frankreich) erst einmal verboten. In Finnland, Norwegen oder Schweden darf man an jedem Ort sein Zelt aufstellen. Dort muss man nur Rücksicht auf die Natur nehmen.',
            },
            {
              text: 'Wenn Strand und Natur zu langweilig sind, wählt man vor allem europäische Metropolen als Reiseziel. Dort kann man nicht nur ein Kulturprogramm machen, sondern auch shoppen. Egal ob es die Ramblas in Barcelona, das Museumsviertel in Amsterdam oder der Wenzelsplatz in Prag ist, dort gibt es für jeden etwas.',
            },
            {
              text: 'Wenn es einen nicht stört, im Mehrbettzimmer zu übernachten, kann man in Jugendherbergen ziemlich günstig übernachten. Dort ist es zwar turbulent und laut, dafür trifft man aber Jugendliche aus aller Welt.',
            },
            {
              text: 'Keine Lust oder Zeit, die Reise selber zu planen? Dann können das Profis machen. Wenn man einfach nur wegfahren und so gar nichts organisieren will, nutzt man einen der zahlreichen professionellen Reiseanbieter für Abschlussreisen. Man soll dabei aber nicht nur die Preise, sondern auch die Dauer, Unterbringung und Verpflegung vergleichen!',
            },
          ],
          booleanLabels: ['R', 'F'],
          examples: rf(0, ['Die Abiturienten planen ihre gemeinsame Abireise bereits vor den Abiturprüfungen.'], 'R'),
          items: rf(
            8,
            [
              'Bei einer Party-Reise spielt die Unterbringung keine wichtige Rolle.',
              'Der Strandurlaub in Bungalows ist viel ruhiger als in einem Hotel.',
              'Es ist nur in Frankreich verboten, in der Natur zu zelten.',
              'In europäische Großstädte reist man nur wegen der kulturellen Angebote.',
              'Jugendherbergen haben den Vorteil, dass sie billiger sind und auch Gesellschaft bieten.',
              'Es gibt sehr wenige Reisebüros, die Abschlussfahrten organisieren.',
            ],
            'R R F F R F',
          ),
        },
        {
          id: 'I-3',
          label: '3.',
          instructions:
            'Was passt in den Text? Schreiben Sie den entsprechenden Buchstaben in die Rubrik. Achtung! Es gibt einen Buchstaben zu viel. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'Affentag' },
            {
              text: 'Der „Monkey Day“ ist ein außergewöhnlicher Aktionstag mit einer bemerkenswerten Erfolgsgeschichte. Entstanden ist er aus der Idee von zwei Kunststudenten an der Michigan State University. {{0}}',
            },
            {
              text: 'Im Jahr 2000 schrieb der Student Casey Sorrow aus Spaß „Monkey Day“ in den Kalender seines Freundes Eric Millikan. Das Datum für den „Affentag“ war der 14. Dezember. {{14}}',
            },
            {
              text: 'Viele Zoos, Nationalparks und Organisationen nutzen diesen Tag für besondere Aktionen. Zelebriert wird der Tag mit Sonderausstellungen und Fotoserien. {{15}} Im Lahore Zoo in Pakistan waren z. B. 2014 über 100 Kinder mit Affenmasken unterwegs. Auf Partys und im Radio werden am Affentag Songs mit passenden Themen gespielt. Vielerorts feiert man zu Filmen wie „Planet der Affen.” {{16}}',
            },
            {
              text: 'Andere Veranstaltungen sollen die Leute auf wichtige Fragen oder auf Probleme im Leben der Affen aufmerksam machen und den Tieren helfen. {{17}} In Oregon hat man z. B. mit dem Verkauf von Gemälden der Schimpansen Jackson und Kimie ein Tierheim für Schimpansen unterstützt.',
            },
            {
              text: 'Eric Millikan verschickt zum Affentag gerne selbstgemalte Grußkarten. Zu den Empfängern gehörte auch die Schimpansenforscherin Jane Goodall. {{18}} Außerdem verspricht der Künstler Eric Milliken jedem eine Grußkarte, der ihm eine zusendet.',
            },
            { text: 'Die Kunsthandlung Biddle Gallery in Detroit feierte den Affentag im Jahr 2008 humorvoll: {{19}} Ein toller Monkey Day!' },
          ],
          bankTitle: 'SÄTZE',
          bank: [
            { key: 'A', text: 'Es gibt aber auch spaßige Aktionen.' },
            { key: 'B', text: 'Eine frühere King-Kong-Verfilmung wurde ebenfalls am Affentag veröffentlicht.' },
            { key: 'C', text: 'Beide sind heute bekannte Künstler.' },
            { key: 'D', text: 'Dieser Tag ist bis heute ein Aktionstag rund um die Welt.' },
            { key: 'E', text: 'Jeder Käufer eines Kunstwerks bekam eine Banane als Extra dazu.' },
            { key: 'F', text: 'Mit den Aktionen der Hilfsorganisationen möchte man Geld für gute Zwecke sammeln.' },
            { key: 'G', text: 'Sogar die berühmte Gorilladame Koko, die eine Art Zeichensprache beherrschte, bekam von Millikan eine Karte.' },
            { key: 'H', text: 'Zwei Tage vor dem Affentag finden verschiedene Vorprogramme statt.' },
          ],
          unusedBankCount: 1,
          examples: choices(0, 'C'),
          items: choices(14, 'D A B F G E'),
        },
        {
          id: 'I-4',
          label: '4.',
          instructions:
            'Lesen Sie den Zeitungsartikel über einen beliebten Schülerjob und beantworten Sie kurz die Fragen. Schreiben Sie zu jedem Punkt nur eine Information. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'Ein beliebter Schülerjob: Apps testen' },
            {
              text: 'Täglich werden neue Apps für Smartphones und Tablets entwickelt. Bevor man diese dann herunterladen kann, werden sie getestet. Es muss zum Beispiel sichergestellt werden, dass die Benutzerführung leicht und verständlich ist. Sehr wichtig ist natürlich auch, dass die Apps auf allen Geräten laufen. Für diesen Job werden immer wieder Mitarbeiter gesucht.',
            },
            {
              text: 'Zum Testen bekommst du in der Regel eine Probeversion der App. Diese musst du dann nach den Instruktionen des Entwicklers testen. Den Job kannst du in dessen Büroräumen erledigen oder auch von zu Hause aus. Gefundene Fehler oder Verbesserungsvorschläge müssen dann schriftlich und mit Screenshots dokumentiert werden.',
            },
            {
              text: 'Als App-Tester musst du auf jeden Fall fit auf deinem Gerät sein. Und hierbei ist es nicht unbedingt wichtig, das neueste Smartphone oder Tablet zu haben. Natürlich solltest du schon viele Apps genutzt haben und auch gerne neue ausprobieren. Darüber hinaus ist eine gewisse Kreativität wichtig. Es gibt einige Jobs, für die bis zu 10 Euro pro Stunde bezahlt werden. Das Mindestalter liegt hier bei 16 Jahren. Wenn dich ein Job als App-Tester interessiert, registrier dich einfach!',
            },
            { style: 'heading', text: 'FRAGEN' },
          ],
          examples: [
            {
              id: '0',
              type: 'short-text',
              prompt: 'Warum muss man Apps testen?',
              answer: { accepted: ['um Fehler zu minimieren'], match: 'exact-ci' },
            },
          ],
          items: [
            {
              id: '20',
              type: 'short-text',
              prompt: 'Was soll man kontrollieren, wenn man eine App testet? (1. Information)',
              answer: {
                accepted: ['die Benutzerführung / ob die Benutzung leicht/verständlich ist', 'ob die Apps auf allen Geräten laufen'],
                match: 'keywords',
                keywords: [['benutzer', 'verständlich', 'leicht', 'gerät', 'laufen']],
              },
              reviewNote: 'A 20. és 21. itemre adott két helyes válasz sorrendje mindegy.',
            },
            {
              id: '21',
              type: 'short-text',
              prompt: 'Was soll man kontrollieren, wenn man eine App testet? (2. Information)',
              answer: {
                accepted: ['ob die Apps auf allen Geräten laufen', 'die Benutzerführung / ob die Benutzung leicht/verständlich ist'],
                match: 'keywords',
                keywords: [['benutzer', 'verständlich', 'leicht', 'gerät', 'laufen']],
              },
              reviewNote: 'A 20. és 21. itemre adott két helyes válasz sorrendje mindegy.',
            },
            {
              id: '22',
              type: 'short-text',
              prompt: 'Wo kann man den Job machen? z. B.',
              answer: { accepted: ['in den Büroräumen (des Entwicklers)', 'zu Hause'], match: 'keywords', keywords: [['büro', 'hause']] },
            },
            {
              id: '23',
              type: 'short-text',
              prompt: 'Was soll man tun, wenn man Fehler findet?',
              answer: { accepted: ['(man muss die Fehler/sie) (schriftlich/mit Screenshots) dokumentieren'], match: 'keywords', keywords: [['dokument', 'screenshot', 'schriftlich']] },
            },
            {
              id: '24',
              type: 'short-text',
              prompt: 'Wie ist der ideale App-Tester? z. B.',
              answer: {
                accepted: ['fit auf seinem Gerät', 'kreativ', 'hat viele Apps genutzt', 'möchte viele Apps ausprobieren'],
                match: 'keywords',
                keywords: [['fit', 'kreativ', 'apps', 'ausprobier']],
              },
            },
            {
              id: '25',
              type: 'short-text',
              prompt: 'Wie alt soll man sein, um diese Arbeit machen zu können?',
              answer: { accepted: ['(mindestens) 16 (Jahre)'], match: 'keywords', keywords: [['16']] },
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
      // útmutató: feladatpont 0–20 → vizsgapont
      conversion: [0, 1, 2, 3, 4, 5, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 14, 15, 16, 17, 18],
      tasks: [
        {
          id: 'II-1',
          label: '1.',
          instructions: 'Was passt in den Text? Unterstreichen Sie das richtige Wort. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'Kleine Stadt {{0}} Rädern: der Zirkus' },
            { text: 'TOPIC hat Zirkusmacher Louis Knie zum Interview getroffen.' },
            {
              text: 'TOPIC: Was ist das Schöne am Leben auf Wanderschaft? Louis Knie: Wir sehen sehr viel von der Welt und lernen viele Menschen kennen. Gleichzeitig ist {{1}} „kleine Stadt auf Rädern“ wie eine große Familie. Wir sind 60 Menschen, davon sind 15 noch Kinder. Und 60 Tiere!',
            },
            {
              text: 'TOPIC: Wie war das als Kind? Sind Sie {{2}} Schule gegangen? Louis Knie: Wir hatten immer zwei „{{3}} Klassenzimmer“ mit dabei und haben genauso viel gelernt wie „normale“ Kinder. Nur die Turnstunden sind {{4}}, weil wir ja ohnehin immer trainiert haben.',
            },
            {
              text: 'TOPIC: Wie kann man sich ein Jahr im Zirkus Knie vorstellen? Gibt es auch eine Phase, in der Sie pausieren und nicht reisen? Louis Knie: Wir reisen von Frühling bis Herbst von Ort zu Ort mit unserer Zirkusshow. Im Winter machen wir in Rapperswil {{5}} Schweiz drei bis vier Monate Pause. Da lernen die Kinder dann im Ort.',
            },
            {
              text: 'TOPIC: Und was machen Sie in dieser Zeit? Louis Knie: Für mich gibt es keine Pause. Weil ich mit Tieren arbeite, {{6}} ich jeden Tag trainieren. Und wenn ich im Winter die neue Show plane, schaue ich mir abends dutzende Videos an, die mir Künstler zusenden.',
            },
            {
              text: 'TOPIC: Wünschen Sie sich manchmal ein „{{7}}“ Leben? Louis Knie: Nein. Ich liebe meinen Beruf und meine Zirkusfamilie. Ich brauche keine Adresse, {{8}} glücklich zu sein.',
            },
          ],
          examples: gapMcqs(0, [['an', 'auf', 'in', 'über']], 'B'),
          items: gapMcqs(
            1,
            [
              ['uns', 'unser', 'unsere', 'unserer'],
              ['an', 'in der', 'zu', 'zur'],
              ['fahrende', 'fahrendem', 'fahrenden', 'fahrendes'],
              ['aufgefallen', 'ausgefallen', 'eingefallen', 'gefallen'],
              ['in', 'in dem', 'in den', 'in der'],
              ['darf', 'kann', 'muss', 'mag'],
              ['normale', 'normalen', 'normaler', 'normales'],
              ['damit', 'dass', 'denn', 'um'],
            ],
            'C D A B D C D D',
          ),
        },
        {
          id: 'II-2',
          label: '2.',
          instructions:
            'Schreiben Sie die angegebenen Wörter in der richtigen Form in den Text. Achtung! Schreiben Sie in jede Lücke nur ein Wort. (0) ist ein Beispiel für Sie. (der/die/das – ein/eine)',
          passage: [
            { style: 'title', text: 'Chinesisch lernen – Interview mit Miri, {{0}} Assistentin in der Unternehmensberatung' },
            {
              text: 'yaez: Wie bist du auf die Idee gekommen, Chinesisch zu lernen? Miri: {{9}} Freund hat die Sprache schon vor mir gelernt und ich habe ihm immer geholfen, die Schriftzeichen hinzubekommen, da ich gern zeichne. Das hat mein Interesse geweckt.',
            },
            {
              text: 'yaez: Wie unterscheidet sich Chinesisch von anderen Sprachen? Miri: Der Aufbau {{10}} Sprache ist ganz anders. Beispielsweise benutzt man im Chinesischen keine Artikel, man muss die Verben auch nicht konjugieren.',
            },
            { text: 'yaez: Was interessiert dich am Sprachenlernen besonders? Miri: Ich finde Sprachen an sich interessant, aber auch die Kultur {{11}} Landes.' },
            {
              text: 'yaez: Gibt es {{12}} Erlebnis, das du mit der Sprache verbindest? Miri: Ich war eine Zeit lang als Lehrerin bei {{13}} Gastfamilie in China. Der Sohn war vier Jahre alt und manchmal habe ich mit ihm statt Englisch Chinesisch geredet. Die Momente, in {{14}} der Kleine mich verstanden hat, waren einfach genial!',
            },
          ],
          examples: cloze(0, [['einer']]),
          items: cloze(9, [['Ein'], ['der'], ['des', 'eines'], ['ein'], ['einer'], ['denen']]),
        },
        {
          id: 'II-3',
          label: '3.',
          instructions:
            'Was passt in den Text? Schreiben Sie den entsprechenden Buchstaben in die Rubrik. Achtung! Es gibt einen Buchstaben zu viel. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'Wincent Weiss hat in Rekordzeit die deutschen Charts erobert' },
            {
              text: 'Du hast erst mit 17 angefangen zu singen und Gitarre zu spielen. Hättest du mit diesem schnellen Erfolg gerechnet?',
            },
            {
              text: 'Wincent Weiss: Das ist immer eine lustige Frage. Man kann nie damit rechnen, dass Songs, {{0}}, erfolgreich werden. Das ist schon cool und es ist eine tolle Erfahrung, {{15}}.',
            },
            { text: 'Was war der bisher schönste und größte Moment in deinem Leben?' },
            { text: 'Wincent Weiss: Ich wollte eigentlich immer Einzelkind bleiben. Doch als ich elf Jahre alt war, {{16}}. Das war für mich der schönste Moment bisher in meinem Leben.' },
            { text: 'Deine kleine Schwester bedeutet dir viel, du hast ihr sogar einen Song geschrieben…' },
            { text: 'Wincent Weiss: Familie ist für mich das Allerwichtigste. Das ist das, {{17}}. Ich versuche deshalb, so oft es geht, {{18}}.' },
            { text: 'In dem Song „Frische Luft“ singst du davon, deine Jacke zu nehmen und einfach loszurennen. Wohin würdest du jetzt rennen, {{19}}?' },
            {
              text: 'Wincent Weiss: Wenn ich jetzt die Möglichkeit hätte? Ach, ich finde es eigentlich gerade ganz schön. Die Sonne scheint…Ich will aber auch immer reisen und so viel von der Welt kennenlernen, {{20}}.',
            },
            { text: 'Wer ist dein größtes Vorbild?' },
            { text: 'Wincent Weiss: Meine Mutti ist für mich eines der größten Vorbilder. Sie hat meine Schwester und mich komplett alleine großgezogen.' },
          ],
          bank: [
            { key: 'A', text: 'als man will' },
            { key: 'B', text: 'bekam ich eine kleine Schwester' },
            { key: 'C', text: 'die man rausbringt' },
            { key: 'D', text: 'die ich machen kann.' },
            { key: 'E', text: 'meine Schwester und meine Mutti zu besuchen' },
            { key: 'F', text: 'was im Leben immer bleibt' },
            { key: 'G', text: 'wenn alles andere egal wäre' },
            { key: 'H', text: 'wie es nur geht' },
          ],
          unusedBankCount: 1,
          examples: choices(0, 'C'),
          items: choices(15, 'D B F E G H'),
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
        storagePath: 'erettsegi-de-kozep-2023-oktober.mp3',
        durationSec: 1801,
        // Task starts: the ~60 s reading pause of each task found by silence detection, minus the length of its announcement (approximate, ±10 s).
        taskMarkers: [
          { taskId: 'III-1', startSec: 79 },
          { taskId: 'III-2', startSec: 638 },
          { taskId: 'III-3', startSec: 1221 },
        ],
      },
      // útmutató: feladatpont 0–20 → vizsgapont
      conversion: [0, 2, 3, 5, 7, 8, 10, 12, 13, 15, 17, 18, 20, 21, 23, 25, 26, 28, 30, 31, 33],
      transcripts: [
        {
          taskId: 'III-1',
          title: 'Vornamen',
          paragraphs: [
            'Heute geht es um Namen. Wie aber wählen Eltern einen Vornamen für ihr Kind? Welche Gemeinsamkeiten und Unterschiede gibt es dabei in verschiedenen Kulturen auf der Welt?',
            'Spanien',
            '„Es ist ja ein Klischee, dass in Spanien so gut wie alle Männer José, Juan und Pedro heißen und die Frauen Maria und Carmen. Das Verrückte ist: Dieses Klischee stimmt. Maria ist wirklich der am meisten verwendete Frauenname in Spanien. Ich habe vor Kurzem erst gelesen, dass in Spanien etwa 6,5 Millionen Marias leben. Und ja, der Wunsch von Eltern, einen ungewöhnlichen Namen zu vergeben, den gibt es in Spanien nicht so.',
            'Indien',
            '„Es gibt in Indien sehr, sehr schöne Namen. Das Bemerkenswerte hier in Indien ist eigentlich, dass man erst Wochen nach der Geburt überhaupt einen Vornamen erhält. Das liegt daran, dass man zu einem Hindu-Gottesmann gehen muss, wenn man das Kind bekommen hat. Und der schaut sich erst einmal die Sternenkonstellation an, und aufgrund dessen bekommt man dann den Hinweis, mit welchem Buchstaben der Vorname anfangen muss.',
            'Südafrika',
            '„In Südafrika finde ich das total spannend mit den Vornamen, weil die Menschen quasi mit zwei Namen geboren werden. Die haben einen afrikanischen Namen und gleichzeitig einen englischen. Und der englische ist ganz oft sehr lustig. Also das, was die Eltern irgendwie gerade gedacht haben, als sie das Baby gesehen haben. Da gibt’s nämlich viele, die heißen dann: Handsome, also Hübscher oder Pretty, die Schöne.',
            'China',
            '„In China ist es so, dass das mit den Namen eigentlich relativ kompliziert ist. Vielen Eltern geht es eher darum, dass ihr Kind einen Namen hat, den eben nicht alle anderen haben. Bei Jungennamen sind das häufig Schriftzeichen, die auch eine gewisse Bedeutung haben. Ich sag‘ mal so was wie: Kräftiger Baum oder Außergewöhnlich.',
            'Südamerika',
            '„Bei den Vornamen in Südamerika gibt es ganz klare Trends. Ein Trend ist natürlich immer, dass man die Namen von großen Fußballstars übernimmt. Es gibt bestimmte Modenamen speziell in Argentinien, Namen wie Facundo und Lautaro. Das sind typische Vornamen, wo auch jeder in anderen Ländern Südamerikas weiß: Oh, das muss ein Argentinier sein. In Kolumbien, in Venezuela und in Peru sind englische Namen unheimlich modern und trendig. Das Problem bei dieser Namenswahl ist: Die Leute können oft gar nicht richtig Englisch. Ich habe allen Ernstes Personalausweise gesehen, auf denen der anscheinend englische Name Usnavy auftaucht. Und was ist Usnavy? Das haben die Eltern auf amerikanischen Kriegsschiffen gesehen: „US Navy”. Und da wurden dann Kinder danach benannt.“',
          ],
        },
        {
          taskId: 'III-2',
          title: 'Fußballgeschichte in Deutschland',
          paragraphs: [
            'Die Anfänge des Fußballs in Deutschland liegen unter anderem hier: an einem Gymnasium in Braunschweig. Der norddeutsche Sportlehrer Konrad Koch bringt als einer der Ersten den Fußball aus England nach Deutschland, und er veröffentlicht die ersten deutschen Fußballregeln. Damals ähneln sie noch dem Rugby. Doch beliebt ist der Sport noch nicht sofort. Am Anfang waren viele dagegen, sie kritisierten den Sport als „englische Krankheit“.',
            'Dennoch, der Sport wird immer populärer. Ein früher Höhepunkt des jungen Fußballs findet im Norden statt, 1903 findet in Hamburg die erste deutsche Meisterschaft statt. Wo heute ein Industriegebiet ist, gab es damals einen der ersten großen Fußballplätze, eine Wiese in Altona. Im Endspiel standen sich Mannschaften aus Leipzig und Prag gegenüber.',
            'Der DFC Prag war damals ein deutscher Fußballklub, in dem Kaufleute und Studenten spielten. Und die hatten den Abend vor dem Spiel offenbar in den Hamburger Kneipen verbracht. Dadurch spielten sie wohl in der zweiten Spielhälfte besonders schwach. Für die Leipziger war das die Chance. Ihre Mannschaft schreibt Geschichte.',
            'Die Meisterschaft im Norden ist ein Signal. Durchschnittlich etwa 43.000 Menschen kamen in den 1920er Jahren schon zu den wichtigen Spielen. Fußball wird zum großen Sonntagsvergnügen. Langsam werden auch die Regeln immer präziser. Doch mit dem Interesse steigen die Erwartungen. Lange gibt es im Sportverband DFB einen Streit: Sollen die Sportler Amateure bleiben oder endlich Profifußballer werden?',
            'Für ein intensives Training fehlt den Jungs damals allerdings oft die Zeit. Schließlich müssen sie nebenbei noch ihren Lebensunterhalt verdienen. Aber der Fußball verändert sich. Schon Mitte der 1920er Jahre können begabte Spieler zusätzlich zu ihrem Einkommen noch den Durchschnittslohn eines Arbeiters verdienen. Guter Fußball zahlt sich aus.',
            'Doch während der Fußball der Männer immer beliebter wird, gibt es im Frauenfußball keinen Fortschritt. 1955 wird Frauenfußball vom DFB sogar verboten. Erst ab 1970 dürfen auch Frauen wieder Fußball spielen.',
            'Heute ist Fußball vor allem ein großes Geschäft. Aber Geld und Titel sind nicht alles, auch das zeigt der Blick in die Fußballhistorie. Im Jahr 1922 zum Beispiel gab es keinen deutschen Meister, weil die Hamburger Mannschaft nach zweimal 0:0 in den Endspielen den zugesprochenen Siegertitel nicht will.',
            'Innerhalb von fast 150 Jahren wird Fußball zum Volkssport Nummer Eins. In Deutschland hat der Sport seine Anfänge im Norden. Emotionen, Skandale, sportliche Höchstleistungen: Fußball fasziniert bis heute.',
          ],
        },
        {
          taskId: 'III-3',
          title: 'Friedrich Fröbel: der Erfinder des Kindergartens',
          paragraphs: [
            'Friedrich Fröbel hat den Kindergarten erfunden und er meinte es wörtlich.',
            '„Kinder sind wie Blumen“ – Wie in einem Garten sollten sie umgeben von der Natur erzogen werden – meinte der Thüringer Pädagoge Friedrich Fröbel. Jeder seiner Kindergärten sollte einen kleinen Garten haben und jedes Kind dort ein kleines Stück Land, auf dem es etwas pflanzen kann. So wie das Kind die Pflanze pflegt, pflegt der Kindergärtner, die Pädagogin, das Kind.',
            'Fröbel wollte im Kindergarten nicht nur Kinder betreuen, sondern sie auch fördern. Für Fröbel war Spielen ein Mittel zur Erziehung und Bildung. Ganz im Gegensatz zu vielen Mitmenschen im 19. Jahrhundert hielt er Spielen für eine wichtige Beschäftigung. Er war einer der ersten, der die Bedeutung des Spielens erkannte. Fröbel entwickelte sogar Spielzeug. Das waren zum Beispiel verschiedene Formen aus Holz, wie Kugeln oder Würfel. Wenn Kinder Formen auseinandernehmen, verstehen sie, wie die Welt aufgebaut ist. Das Denken, Fühlen und Erkennen der Kinder war für Fröbel von großer Bedeutung, genauso wie ihre Phantasie und Kreativität.',
            'Aber nicht nur den Kindern wollte der Pädagoge helfen. Fröbel gab auch Kurse für Mütter und Väter, wie sie ihre Kinder erziehen und anleiten können. Im Jahr 1840 eröffnete Friedrich Fröbel in Blankenburg in Thüringen dann den ersten Kindergarten. Entstanden war er aus Spielkreisen, die Fröbel für Mütter und ihre Kinder organisiert hatte. Bis dahin hat es zu Beginn der Industrialisierung nur Tagesheime für Kinder gegeben. Die Arbeiterinnen und Arbeiter in den Fabriken konnten ihre Kinder dort abgeben. Sie bekamen Essen und wurden sauber gehalten, mussten sich aber selbst beschäftigen.',
            'In der Revolutionszeit von 1848 interessierten sich immer mehr Leute für Fröbels Gedanken. Innerhalb von wenigen Jahren wurden an vielen Orten Kindergärten eröffnet. Doch nach der Revolution verbot das damalige Preußen Fröbels Kindergärten, weil diese Art der öffentlichen Kindererziehung zu wenig streng erschien.',
            '1860 erlaubte man die Kindergärten wieder und Fröbels Idee verbreitete sich erfolgreich, vor allem in den USA. Bis heute gilt Fröbel als Vater des Kindergartens, sein Geburtstag am 21. April wird sogar in Großbritannien und den USA als »National Kindergarten Day« gefeiert.',
          ],
        },
      ],
      tasks: [
        {
          id: 'III-1',
          label: '1.',
          instructions:
            'Sie hören einen Text über Vornamen in verschiedenen Ländern. Lesen Sie zuerst die Aufgabe. Sie hören dann den Text zweimal. Zuerst hören Sie den ganzen Text ohne Pausen, dann in kürzeren Abschnitten. Entscheiden Sie beim Hören, welche Aussage zu welchem Land passt und kreuzen Sie an. Achtung! Eine Aussage kann zu mehreren Ländern passen. Sie können insgesamt 7-mal ankreuzen. (0) ist ein Beispiel für Sie.',
          passage: [{ style: 'title', text: 'Vornamen' }, { text: 'In diesem Land…' }],
          rules: { multiSelectPenalty: true },
          examples: [{ id: '0', type: 'multi-select', stem: '… ist „Maria“ der häufigste Frauenname.', options: countries, answer: ['1'], pick: 1 }],
          items: [
            { id: '6', type: 'multi-select', stem: '… bekommen Jungen oft Namen von bekannten Fußballspielern.', options: countries, answer: ['5'], pick: 1 },
            { id: '2', type: 'multi-select', stem: '… bekommt das Kind erst lange nach der Geburt seinen Vornamen.', options: countries, answer: ['2'], pick: 1 },
            { id: '5', type: 'multi-select', stem: '… erhält das Kind einen Namen, den andere nicht haben.', options: countries, answer: ['4'], pick: 1 },
            { id: '1', type: 'multi-select', stem: '… gibt man keine ungewöhnlichen Namen.', options: countries, answer: ['1'], pick: 1 },
            { id: '3', type: 'multi-select', stem: '… „helfen die Sterne“ bei der Namenswahl.', options: countries, answer: ['2'], pick: 1 },
            { id: '4/7', type: 'multi-select', stem: '… sind englische Namen in Mode.', options: countries, answer: ['3', '5'], pick: 2 },
          ],
        },
        {
          id: 'III-2',
          label: '2.',
          instructions:
            'Sie hören einen Text über die Geschichte des Fußballs in Deutschland. Lesen Sie zuerst die Aufgabe. Sie hören dann den Text zweimal. Zuerst hören Sie den ganzen Text ohne Pausen, dann in kürzeren Abschnitten. Entscheiden Sie, welche Aussage richtig (R) oder falsch (F) ist. Kreuzen Sie die Antwort beim Hören an. (0) ist ein Beispiel für Sie.',
          passage: [{ style: 'title', text: 'Fußballgeschichte in Deutschland' }],
          booleanLabels: ['R', 'F'],
          examples: rf(0, ['Ein deutscher Sportlehrer brachte den Fußball aus England nach Deutschland.'], 'R'),
          items: rf(
            8,
            [
              'Fußball wurde schnell beliebt.',
              'Die erste deutsche Meisterschaft fand 1903 statt.',
              'Im Klub „DFC Prag” spielten Kaufleute und Studenten.',
              'Fußball war in den 1920er Jahren ein typisches Samstagsprogramm.',
              'In den 1920er Jahren verdienten begabte Spieler mit Fußball Geld.',
              'Frauenfußball war immer sehr populär.',
              'Der deutsche Fußball begann im Norden des Landes.',
            ],
            'F R R F R F R',
          ),
        },
        {
          id: 'III-3',
          label: '3.',
          instructions:
            'Sie hören einen Text über Friedrich Fröbel, den Erfinder des Kindergartens. Lesen Sie zuerst die Aufgabe. Sie hören dann den Text zweimal. Zuerst hören Sie den ganzen Text ohne Pausen, dann in kürzeren Abschnitten. Ergänzen Sie die Sätze beim Hören. Schreiben Sie in jede Lücke nur eine Information. (0) ist ein Beispiel für Sie.',
          passage: [{ style: 'title', text: 'Friedrich Fröbel: der Erfinder des Kindergartens' }],
          examples: [
            {
              id: '0',
              type: 'short-text',
              prompt: 'Der Pädagoge Friedrich Fröbel meinte, jeder Kindergarten soll ________ haben.',
              answer: { accepted: ['einen Garten'], match: 'exact-ci' },
            },
          ],
          items: [
            {
              id: '15',
              type: 'short-text',
              prompt: 'Zur Förderung der Kinder hielt Fröbel ________ für sehr wichtig.',
              answer: { accepted: ['(das) Spiel', '(das) Spielen', 'spielen'], match: 'keywords', keywords: [['spiel']] },
            },
            {
              id: '16',
              type: 'short-text',
              prompt: 'Fröbel entwickelte selbst ________ aus Holz.',
              answer: { accepted: ['Spielzeug(e)', '(verschiedene) Formen', 'Kugeln', 'Würfel'], match: 'keywords', keywords: [['spielzeug', 'form', 'kugel', 'würfel']] },
            },
            {
              id: '17',
              type: 'short-text',
              prompt: 'Der Pädagoge hielt auch Lernkurse für ________ und ________ .',
              answer: { accepted: ['Mütter und Väter'], match: 'keywords', keywords: [['mütter', 'mutter'], ['väter', 'vater']] },
            },
            {
              id: '18',
              type: 'short-text',
              prompt: 'Der erste Kindergarten wurde im Jahre ________ in Blankenburg (Thüringen) eröffnet.',
              answer: { accepted: ['1840'], match: 'exact-ci' },
            },
            {
              id: '19',
              type: 'short-text',
              prompt: 'Damals wurden in den Tagesheimen die Kinder von ________ tagsüber abgegeben.',
              answer: { accepted: ['(Arbeiterinnen und) Arbeitern (der Fabriken)', 'Fabrikarbeiter/-innen'], match: 'keywords', keywords: [['arbeiter']] },
            },
            {
              id: '20',
              type: 'short-text',
              prompt: 'Fröbels Kindergärten wurden nach 1860 auch im Ausland populär, besonders in ________ .',
              answer: { accepted: ['den USA'], match: 'keywords', keywords: [['usa', 'amerika']] },
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
          title: 'Online-Museumsbesuch',
          instructions: 'Sie möchten mit Ihrer Deutschlerngruppe einen virtuellen Museumsrundgang machen. Im Internet haben Sie dazu die folgende Anzeige gefunden:',
          passage: [
            { style: 'title', text: 'Online-Museumsbesuch' },
            {
              text: 'Buchen Sie mit Ihrer Schulklasse eine Online-Schülerführung im Römisch-Germanischen Museum der Stadt Köln und starten Sie gemeinsam mit einem Führer oder einer Führerin direkt aus dem Klassenzimmer! Buchbare Angebote:',
            },
            { style: 'bullet', text: 'Das römische Köln ─ die Geschichte der Stadt Köln.' },
            { style: 'bullet', text: 'Freude beim Essen: Tischkultur bei den Römern' },
            { style: 'bullet', text: 'Kölns schönstes Mosaik: Das Dionysosmosaik' },
            { text: 'Was haben wir mit den Römer/-innen in Köln gemeinsam, was unterscheidet uns? Hier finden Sie es heraus!' },
            { text: 'Buchungsservice: service.museumsdienst@stadt-koeln.de' },
          ],
          items: [
            {
              id: '1',
              type: 'production',
              prompt: ['Schreiben Sie eine E-Mail an das Museum in Köln und informieren Sie sich über die virtuellen Rundgänge. Gehen Sie dabei auf die folgenden Punkte ein:'],
              contentPoints: ['Warum schreiben Sie?', 'Welches Angebot wählen Sie? Begründen Sie Ihre Wahl.', 'Fragen Sie nach Bedingungen (z. B. Termin, Kosten, Dauer)'],
              promptAfter: ['Die Reihenfolge der Leitpunkte können Sie selbst bestimmen. Verwenden Sie für Ihren Text 80-100 Wörter.'],
              minWords: 80,
              maxWords: 100,
              opening: 'Sehr geehrte Damen und Herren,',
              register: 'formal-email',
              rubricId: 'erettsegi-kozep-1',
              criteria: DE_CRITERIA_1,
            },
          ],
        },
        {
          id: 'IV-2',
          label: '2.',
          instructions: 'Sie haben eine E-Mail von Ihrer deutschen Freundin bekommen. Hier sind einige Auszüge daraus:',
          passage: [
            {
              text: 'Unsere Klasse hatte ein Projekt zum Thema „Die Stadt für Morgen – Wie wollen wir leben?“ durchgeführt. Denn immer mehr Menschen weltweit leben in Städten. Wir haben uns in Gruppen Gedanken gemacht, wie zukünftige Städte aussehen müssten, wie der Alltag in der Stadt der Zukunft sein sollte. Was meinst du dazu? Was braucht die Stadt der Zukunft?',
            },
          ],
          items: [
            {
              id: '2',
              type: 'production',
              prompt: ['Antworten Sie Ihrer Freundin in einer E-Mail. Gehen Sie dabei auf die folgenden Punkte ein:'],
              contentPoints: [
                'Was mögen Sie an Ihrem jetzigen Wohnort?',
                'Welche Probleme des (Groß)stadtlebens sind Ihnen bekannt?',
                'Was wünschen Sie sich von einer modernen Stadt z. B.?',
                'Wo werden Sie wahrscheinlich in 15 Jahren leben? Warum?',
              ],
              promptAfter: ['Die Reihenfolge der Leitpunkte können Sie selbst bestimmen. Verwenden Sie für Ihren Text 100-120 Wörter.'],
              minWords: 100,
              maxWords: 120,
              opening: 'Hallo Tanja,',
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
