// Zöld Út Nyelvvizsgaközpont (MATE), B1 Allgemeinsprache Deutsch (alapfok, általános), sample
// paper 1 — freely downloadable at https://zoldut.uni-mate.hu/mintafeladatsorok. Transcribed
// verbatim from the task sheet and its answer key (Lösungsschlüssel), including the source's own
// typos ("beshäftigt", "Einkauftaschen", "Adventssontagen"). The speaking part is its own paper
// (nyelvvizsga-de-b1-szobeli-minta-01 in ../speaking.ts). No section times are printed on this
// paper, so none are set.
import type { ExamPaper, PassageBlock, ShortTextItem } from '../types'

const urlaubText: PassageBlock[] = [
  { style: 'title', text: 'Wie Sie Ihren Urlaub ökologisch verträglich gestalten' },
  { style: 'heading', text: 'Anreise:' },
  {
    style: 'bullet',
    text: 'Müssen Sie wirklich 1.000 oder 10.000 Kilometer weit fahren oder fliegen? Muss es die Dominikanische Republik sein oder können Sie sich auch am Wörther See entspannen? Je näher Ihr Urlaubsziel, desto geringer auch Energieverbrauch und Emissionen.',
  },
  {
    style: 'bullet',
    text: 'Eine Woche mit dem Auto durch Neuseeland bringt mehr Stress als Erholung. Faustregel: Flüge unter 700 km sind zu vermeiden, ab 700 km sollten Sie mindestens acht Tage und ab 2.000 km mindestens 15 Tage Aufenthalt einplanen.',
  },
  {
    style: 'bullet',
    text: 'Informieren Sie sich über die Situation vor Ort. Fragen Sie bei exotischen Reisezielen nach: Profitieren die Einheimischen vom Tourismus? Er kann sich schädlich auf andere auswirken, z.B. in Gebieten mit Wasserknappheit.',
  },
  {
    style: 'bullet',
    text: 'Wählen Sie das umweltfreundlichste Verkehrsmittel. Innerhalb Europas ist etwa Zugfahren oft schneller, komfortabler – und nicht unbedingt teurer.',
  },
  { style: 'heading', text: 'Am Urlaubsort:' },
  {
    style: 'bullet',
    text: 'Tragen Sie dazu bei, dass Hotels umweltbewusster werden: Dafür reichen oft kleine Handlungen wie der Verzicht auf täglich frische Handtücher.',
  },
  { style: 'bullet', text: 'Reduzieren Sie Ihren Wasserverbrauch, vor allem im Sommer und in heißen Regionen.' },
  {
    style: 'bullet',
    text: 'Entscheiden Sie sich für Unterkünfte mit einer umweltfreundlichen Bauweise. So tragen Sie dazu bei, den Stromverbrauch durch Klimaanlagen zu reduzieren.',
  },
  { style: 'bullet', text: 'Bevorzugen Sie Frischware aus der regionalen Landwirtschaft statt importierter Kost.' },
  {
    style: 'bullet',
    text: 'Essen Sie keine exotischen Speisen aus gefährdeten Arten (z.B. Schildkröten, Haie). Die regionale Küche ist bestimmt auch ohne sie ein kulinarisches Abenteuer!',
  },
  {
    style: 'bullet',
    text: 'Informieren Sie sich über öffentliche Verkehrsmittel vor Ort. Nicht überall ist man auf das eigene Auto oder einen Leihwagen angewiesen. Oft kommen Sie mit Bus, Zug oder Fähre entspannter ans Ausflugsziel, der Transport von Fahrrädern ist auch problemlos. So lernen Sie auch Land und Leute besser kennen.',
  },
  { style: 'heading', text: 'Aktivitäten:' },
  {
    style: 'bullet',
    text: 'Erleben Sie die Natur. Zum Beispiel durch geführte Wanderungen oder Tierbeobachtungen in Nationalparks, Radtouren oder Kanufahren. Vermeiden Sie dagegen zum Beispiel Mountainbiking und Wandern oder Bootsfahrten in Wasserschutzgebieten.',
  },
  {
    style: 'bullet',
    text: 'Verzichten Sie auf Sportarten, die viel Energie oder Wasser verbrauchen – zum Beispiel Offroadtouren oder Freeclimbing in Schutzgebieten.',
  },
  {
    style: 'bullet',
    text: 'Vermeiden Sie auch im Urlaub Müll und verzichten Sie zum Beispiel, wo möglich, auf Einwegverpackungen. Und: entsorgen Sie bitte Ihren Abfall selbst.',
  },
  { style: 'heading', text: 'Souvenirs:' },
  {
    style: 'bullet',
    text: 'Bedrohte Arten gehören nicht ins Gepäck, nur wenn sie aus einer kontrollierten Nutzung stammen und zertifiziert sind. Viele Muscheln und Schnecken sind nämlich geschützt, Schmuck aus schwarzen Korallen trägt zur Zerstörung von Meereslebensräumen bei.',
  },
  {
    style: 'bullet',
    text: 'Kaufen Sie keine Schnitzereien aus geschützten seltenen Tropenhölzern, nur aus Obstbäumen oder etwa Kokospalmen. Ohne spezielle Genehmigung droht auch hier eine saftige Strafe am Zoll.',
  },
  { style: 'bullet', text: 'Verzichten Sie ganz auf lebende Souvenirs, wie Affen, Vögel oder auch exotische Pflanzen.' },
]

/** One of a pair of rows that both answer the same question ("zwei beliebige Antworten"). */
function anyOf(id: string, prompt: string, all: string[], index: number, keywords: string[], maxWords: number): ShortTextItem {
  return {
    id,
    type: 'short-text',
    prompt,
    answer: { accepted: [all[index], ...all.filter((_, i) => i !== index)], match: 'keywords', keywords: [keywords], maxWords },
  }
}

const TRANSPORT = [
  'man kommt entspannter ans Ausflugsziel',
  'der Transport von Fahrrädern ist problemlos',
  'man lernt auch Land und Leute besser kennen',
]
const TRANSPORT_WORDS = ['entspannt', 'fahrr', 'rad', 'land und leute', 'leute', 'kennen']
const ACTIVITIES = [
  'Mountainbiking',
  'Wandern',
  'Bootsfahrten in Wasserschutzgebieten',
  'Sportarten, die viel Energie verbrauchen',
  'Offroadtouren',
  'Freeclimbing in Schutzgebieten',
]
const ACTIVITY_WORDS = ['mountainbik', 'wander', 'boot', 'offroad', 'freeclimb', 'klettern', 'energie', 'wasser']
const ADVENT_SUNDAY = ['Die ganze Familie kommt zusammen', 'isst Kekse und trinkt Tee', 'zündet die Kerzen an']
const ADVENT_SUNDAY_WORDS = ['famili', 'zusammen', 'kekse', 'tee', 'kerze']
const CALENDARS = ['Bilder', 'Schokolade', 'Lego', 'Bücher']
const CALENDAR_WORDS = ['bild', 'schokolade', 'lego', 'buch', 'bücher']
const MARKET = ['heißen Kinderpunsch oder Glühwein trinken', 'Geschenke kaufen', 'Musik hören']
const MARKET_WORDS = ['punsch', 'glühwein', 'gluhwein', 'trinken', 'geschenk', 'musik']

const paper: ExamPaper = {
  id: 'nyelvvizsga-de-b1-minta-01',
  type: 'nyelvvizsga',
  language: 'de',
  level: 'B1',
  sittingLabelHu: 'Minta 1.',
  track: 'general',
  source:
    'Zöld Út Nyelvvizsgaközpont (MATE): B1 Allgemeinsprache Deutsch (alapfok, általános) mintafeladatsor — feladatsor, megoldókulcs és hanganyag. Ingyenesen letölthető: https://zoldut.uni-mate.hu/mintafeladatsorok',
  sections: [
    {
      id: 'reading',
      kind: 'reading',
      titleHu: 'Olvasott szöveg értése (Leseverstehen)',
      tasks: [
        {
          id: 'R-cloze',
          label: 'Aufgabe',
          instructions:
            'Lesen Sie den Artikel und ergänzen Sie den Text mit den unten angegebenen Wörtern. Sie dürfen ein Wort nur einmal verwenden. Achtung! Es gibt ein Wort zu viel. Tragen Sie Ihre Lösung in die Tabelle ein. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'Hattrick' },
            { style: 'note', text: 'Ausbildung, Meister und Bachelor: Das triale Studium bietet einen Dreifachabschluss' },
            {
              text: 'Wer trial {{0}}, macht neben einer herkömmlichen Berufsausbildung und dem Meister im Handwerk noch einen Bachelor in Betriebswirtschaftslehre. Kurz gesagt: Am Ende des Studiums hat man drei Abschlüsse.',
            },
            {
              text: 'Die Hochschule Niederrhein {{1}} seit dem Wintersemester 2015/16 als erste staatliche Hochschule überhaupt das triale Studium. Private Angebote gab es schon vorher. So bietet die Fachhochschule des Mittelstands (FHM) an den Standorten Köln, Hannover und Berlin den Bachelor im Handwerksmanagement an. Ein Vorteil der staatlichen Hochschule ist, dass es keine Studiengebühren {{2}}. Nur die Kosten der Rückmeldung fallen an.',
            },
            {
              text: 'Das Modell spricht vor allem Abiturienten und Fachabiturienten an, die im Handwerk Karriere machen möchten. Voraussetzung für ein triales Bachelorstudium Handwerksmanagement sind das {{3}} oder Fachabitur sowie ein Ausbildungsvertrag mit einem Betrieb in einem von insgesamt 19 Ausbildungsberufen. Darunter sind so unterschiedliche Berufe wie Augenoptiker, {{4}}, Konditor oder Metallbauer.',
            },
            {
              text: 'Beginn des fünfjährigen Studiums ist jeweils im Wintersemester. Waren es zum Start im Jahr 2015 noch {{5}} Studenten, hat sich die Zahl schon im folgenden Jahr verdoppelt. In den ersten beiden Jahren haben sich noch hauptsächlich Studierende eingeschrieben, die als Kinder von Firmeninhabern das Ziel {{6}}, den elterlichen Betrieb zu übernehmen. Mittlerweile schreiben sich zunehmend Seiteneinsteiger ein, die bereits in einer Lehre sind oder diese absolviert haben. Einige haben {{7}} elterlichen Betrieb im Blick und sind für den zukünftigen Arbeitsplatz noch offen. Dennoch, die Studierenden, die familiär geprägt sind, gehören zur Mehrheit, denn ohne fundierten Kenntnisse ist es mittlerweile unmöglich, selbst {{8}} Betriebe zu führen. Der Frauenanteil im trialen Studium ist höher als in der reinen Handwerksausbildung.',
            },
            {
              text: 'Die Gründe für die Einführung des trialen Studiums {{9}} vielschichtig. Der demografische Wandel wird in näherer Zukunft zu einer weiter sinkenden Schulabgängerzahl führen. Gleichzeitig wird der Akademisierungstrend anhalten und die Berufsausbildung weiter unter Druck setzen. Das Handwerk hat auch Alarm geschlagen, {{10}} es an gut ausgebildetem Personal fehlte. Der Bedarf an gut ausgebildeten Absolventen wird daher bundesweit zunehmen. Der Studiengang „Handwerksmanagement – Betriebswirtschaftslehre” ist mit jedem handwerklichen Ausbildungsberuf {{11}}. Unter der Woche absolvieren die Studierenden ihre praktische Ausbildung im Betrieb, die Vorlesungen finden am Wochenende statt. Die Meisterschule wird idealerweise im 8. und 9. {{12}} in Vollzeit bei der Handwerkskammer Düsseldorf besucht. Wer eine Ausbildung in einem Handwerksberuf abgeschlossen hat und bereits {{13}} einem Betrieb beshäftigt ist, kann sich ebenfalls um einen Studienplatz bewerben. In diesem Fall wird die Ausbildung angerechnet, und der Teilnehmer absolviert ausschließlich den Meister- sowie den Bachelorabschluss.',
            },
            {
              text: 'Die ersten Studierenden werden die HSNR in knapp drei {{14}} verlassen. Und auch wenn die Zahl der Auszubildenden aktuell wieder steigt, dürften die Absolventen freie Auswahl haben. Wer kann {{15}} mit Mitte 20 einen dreifachen Abschluss in der Berufsausbildung vorweisen?',
            },
          ],
          // Printed in four columns; listed here column by column.
          bank: [
            { key: 'Abitur', text: 'Abitur' },
            { key: 'bietet', text: 'bietet' },
            { key: 'gibt', text: 'gibt' },
            { key: 'Friseur', text: 'Friseur' },
            { key: 'haben', text: 'haben' },
            { key: 'in', text: 'in' },
            { key: 'Jahren', text: 'Jahren' },
            { key: 'keinen', text: 'keinen' },
            { key: 'kleine', text: 'kleine' },
            { key: 'kombinierbar', text: 'kombinierbar' },
            { key: 'Semester', text: 'Semester' },
            { key: 'schon', text: 'schon' },
            { key: 'Schule', text: 'Schule' },
            { key: 'studiert', text: 'studiert' },
            { key: 'weil', text: 'weil' },
            { key: 'waren', text: 'waren' },
            { key: 'zehn', text: 'zehn' },
          ],
          unusedBankCount: 1,
          examples: [{ id: '0', type: 'choice', answer: 'studiert' }],
          items: [
            { id: '1', type: 'choice', answer: 'bietet' },
            { id: '2', type: 'choice', answer: 'gibt' },
            { id: '3', type: 'choice', answer: 'Abitur' },
            { id: '4', type: 'choice', answer: 'Friseur' },
            { id: '5', type: 'choice', answer: 'zehn' },
            { id: '6', type: 'choice', answer: 'haben' },
            { id: '7', type: 'choice', answer: 'keinen' },
            { id: '8', type: 'choice', answer: 'kleine' },
            { id: '9', type: 'choice', answer: 'waren' },
            { id: '10', type: 'choice', answer: 'weil' },
            { id: '11', type: 'choice', answer: 'kombinierbar' },
            { id: '12', type: 'choice', answer: 'Semester' },
            { id: '13', type: 'choice', answer: 'in' },
            { id: '14', type: 'choice', answer: 'Jahren' },
            { id: '15', type: 'choice', answer: 'schon' },
          ],
        },
        {
          id: 'R-1',
          label: 'Aufgabe 1',
          instructions:
            'Lesen Sie den Artikel „Wie Sie Ihren Urlaub ökologisch verträglich gestalten” und entscheiden Sie, ob die Aussagen (1-5) richtig (R) oder falsch (F) sind. Tragen Sie Ihre Lösung in die Tabelle ein. (0) ist ein Beispiel für Sie. Achtung! Wenn in Ihrer Lösung ausschließlich “R” oder “F” stehen, wird die Aufgabe nicht bewertet.',
          passage: urlaubText,
          booleanLabels: ['R', 'F'],
          rules: { allSameBooleanIsZero: true },
          examples: [{ id: '0', type: 'boolean', statement: 'Am Wörther See kann man sich gut erholen.', answer: true }],
          items: [
            { id: '1', type: 'boolean', statement: 'Wenn man nicht so weit fährt, kann man viel Energie sparen.', answer: true },
            { id: '2', type: 'boolean', statement: 'Für eine umweltfreundliche Reise in Europa nimmt man den Zug.', answer: true },
            { id: '3', type: 'boolean', statement: 'In Hotels soll man seltener neue Handtücher und die Klimaanlage benutzen.', answer: true },
            { id: '4', type: 'boolean', statement: 'Jeder soll alle exotischen Speisen des Urlaubslandes ausprobieren.', answer: false },
            { id: '5', type: 'boolean', statement: 'Die Touristen dürfen gar keine Korallen und Muscheln mit nach Hause nehmen.', answer: false },
          ],
        },
        {
          id: 'R-2',
          label: 'Aufgabe 2',
          instructions:
            'Lesen Sie den Text noch einmal und beantworten Sie die Fragen kurz (1-8 Wörter). Achtung! Sie dürfen in jede Zeile nur eine Information schreiben. Tragen Sie Ihre Lösung in die Tabelle ein. (0) ist ein Beispiel für Sie.',
          passage: urlaubText,
          examples: [
            {
              id: '0',
              type: 'short-text',
              prompt: 'Wozu gibt der Text Tipps?',
              answer: { accepted: ['wie man seinen Urlaub ökologisch verträglich gestaltet'], match: 'exact-ci' },
            },
          ],
          // Graded by key words (every group must match); `accepted` is the key as printed (cut to the word limit where the key adds notes; see reviewNote).
          // 10–11 and 12–13 each take two of the key's answers, in any order.
          items: [
            {
              id: '6',
              type: 'short-text',
              prompt: 'Wie lange soll der Urlaub dauern, wenn die Unterkunft 700 km entfernt von zu Hause ist?',
              answer: { accepted: ['mindestens 8 Tage'], match: 'keywords', keywords: [['8', 'acht']], maxWords: 8 },
            },
            { id: '7', type: 'short-text', prompt: 'Wann soll man mit dem Wasser sparen?', answer: { accepted: ['im Sommer'], match: 'keywords', keywords: [['sommer']], maxWords: 8 } },
            { id: '8', type: 'short-text', prompt: 'Wo soll man mit dem Wasser sparen?', answer: { accepted: ['in heißen Regionen'], match: 'keywords', keywords: [['heiß', 'heiss', 'warm']], maxWords: 8 } },
            {
              id: '9',
              type: 'short-text',
              prompt: 'Woher sollten die Frischprodukte kommen?',
              answer: { accepted: ['aus der regionalen Landwirtschaft'], match: 'keywords', keywords: [['region', 'lokal', 'örtlich']], maxWords: 8 },
            },
            {
              ...anyOf('10', 'Warum soll man im Zielland die öffentlichen Verkehrsmittel wählen? (1)', TRANSPORT, 0, TRANSPORT_WORDS, 8),
              reviewNote: 'The key: 10–11. two of: man kommt (mit Bus, Zug oder Fähre) entspannter ans Ausflugsziel / der Transport von Fahrrädern ist problemlos / man lernt auch Land und Leute besser kennen.',
            },
            anyOf('11', 'Warum soll man im Zielland die öffentlichen Verkehrsmittel wählen? (2)', TRANSPORT, 1, TRANSPORT_WORDS, 8),
            {
              ...anyOf('12', 'Welche Freizeitaktivitäten sind schädlich für die Natur? (1)', ACTIVITIES, 0, ACTIVITY_WORDS, 8),
              reviewNote:
                'The key: 12–13. two of: Mountainbiking / Wandern / Bootsfahrten in Wasserschutzgebieten / Sportarten, die viel Energie oder Wasser verbrauchen (zum Beispiel Offroadtouren oder Freeclimbing in Schutzgebieten).',
            },
            anyOf('13', 'Welche Freizeitaktivitäten sind schädlich für die Natur? (2)', ACTIVITIES, 1, ACTIVITY_WORDS, 8),
            {
              id: '14',
              type: 'short-text',
              prompt: 'Wie kann man die Menge des Mülls senken?',
              answer: {
                accepted: ['auf Einwegverpackungen verzichten', 'den Abfall selbst entsorgen'],
                match: 'keywords',
                keywords: [['einweg', 'verpackung', 'abfall', 'müll', 'entsorg']],
                maxWords: 8,
              },
            },
            {
              id: '15',
              type: 'short-text',
              prompt: 'Aus welchem Holz dürfen die gekauften Souvenirs hergestellt werden?',
              answer: { accepted: ['Obstbäumen', 'Kokospalmen'], match: 'keywords', keywords: [['obst', 'kokos', 'palme']], maxWords: 8 },
            },
          ],
        },
      ],
    },
    {
      id: 'writing',
      kind: 'writing',
      titleHu: 'Íráskészség (Schreiben)',
      tasks: [
        {
          id: 'W-1',
          label: 'Aufgabe 1',
          instructions:
            'Sie haben sich mit einem der internationalen Studierenden an der Universität Ihrer Heimatstadt angefreundet. Sie laden ihn / sie zum Abendessen zu Ihrer Familie nach Hause ein.',
          items: [
            {
              id: '1',
              type: 'production',
              prompt: ['Geben Sie ihm / ihr per Messenger Anweisungen in 60-80 Wörtern.', 'Gehen Sie auf folgende Punkte ein:'],
              contentPoints: [
                'welches Verkehrsmittel soll er / sie nehmen,',
                'an welcher Haltestelle muss er / sie aussteigen,',
                'welchen Weg nimmt man, wie erkennt man das Haus.',
              ],
              minWords: 60,
              maxWords: 80,
              register: 'informal-message',
              rubricId: 'nyelvvizsga-de-b1-1',
              modelAnswer: [
                'Liebe Petra,',
                'ich bin sehr froh, dass du unsere Einladung zum Abendessen angenommen hast. Wir wohnen im Stadtzentrum von Gödöllő, so kannst du mit der Vorortbahn zu uns kommen. Du musst an der Haltestelle Szabadság tér aussteigen, dieser Platz liegt direkt im Zentrum. Zuerst musst du geradeaus gehen, dann nach der Ampel links abbiegen. Dort wirst du schon unser Haus sehen, es ist ein zehnstöckiges Gebäude. Unsere genaue Adresse ist: Kossuth Lajos utca 45.',
                'Wir freuen uns auf dich.',
                '(77 Wörter)',
              ].join('\n'),
            },
          ],
        },
        {
          id: 'W-2',
          label: 'Aufgabe 2',
          instructions: 'Sie haben vor, Ihren Zivildienst mit ehrenamtlicher Arbeit im Ausland zu verbringen.',
          items: [
            {
              id: '2',
              type: 'production',
              prompt: [
                'Schreiben Sie eine E-Mail an eine Reitschule in Oberstdorf (Deutschland), wo Sie kranken Kindern helfen wollen, indem Sie ihnen das Reiten beibringen. Verwenden Sie für Ihren Brief 120-140 Wörter.',
                'Ihr Name in dieser Rolle ist Nagy Edit / Ervin.',
                'Beschreiben Sie in Ihrem Brief,',
              ],
              contentPoints: [
                'warum Sie sich für die Reitschule entschieden haben',
                'welche relevanten Erfahrungen Sie haben,',
                'welche Hilfe Sie von der Schule erwarten',
                'was Sie selbst finanzieren können',
                'welcher Termin Ihnen passt',
              ],
              minWords: 120,
              maxWords: 140,
              register: 'formal-email',
              rubricId: 'nyelvvizsga-de-b1-2',
              modelAnswer: [
                'Sehr geehrte Damen und Herren,',
                '',
                'über Ihre Reitschule habe ich im Internet gelesen. Ich möchte diesen Sommer meinen Zivildienst ehrenamtlich in Ihrer Reitschule verbringen. Ich habe Ihr Programm gelesen, in dem es darum geht, kranken Kindern das Reiten beizubringen, und ich möchte ihnen wirklich helfen, weil es eine fantastische Sache ist.',
                'Ich kann reiten und verbringe meine Zeit gerne mit Kindern. Letzten Sommer habe ich in einem Kinderlager als Reitlehrer gearbeitet. Dort habe ich mich mit zehn Kindern beschäftigt.',
                'Ich könnte meine Fahrtkosten und die Mahlzeiten finanzieren, aber ich möchte, dass Sie mir eine billigere Unterkunft suchen, wo ich wohnen kann. Ich werde meine Schule im Juni beenden, danach könnte ich den ganzen Sommer bei Ihnen arbeiten.',
                'Vielen Dank für Ihre positive Antwort im voraus.',
                'Mit freundlichen Grüßen',
                'Edit Nagy',
                '(120 Wörter)',
              ].join('\n'),
            },
          ],
        },
      ],
    },
    {
      id: 'listening',
      kind: 'listening',
      titleHu: 'Hallott szöveg értése (Hörverstehen)',
      audio: {
        storagePath: 'nyelvvizsga-de-b1-minta-01.mp3',
        durationSec: 930,
        // Aufgabe 2 starts with its announcement, right after Aufgabe 1's last pause (loudness scan).
        taskMarkers: [
          { taskId: 'L-1', startSec: 0 },
          { taskId: 'L-2', startSec: 412 },
        ],
      },
      tasks: [
        {
          id: 'L-1',
          label: 'Aufgabe 1',
          instructions:
            'Hören Sie sich die Nachricht über die Plastiktüten an, und entscheiden Sie, ob die Aussagen (1-6) richtig (R) oder falsch (F) sind. Tragen Sie Ihre Lösung in die Tabelle ein. (0) ist ein Beispiel für Sie. Achtung! Wenn in Ihrer Lösung ausschließlich “R” oder “F” stehen, wird die Aufgabe nicht bewertet.',
          booleanLabels: ['R', 'F'],
          rules: { allSameBooleanIsZero: true },
          examples: [{ id: '0', type: 'boolean', statement: 'Die Nachrichten handeln von der Benutzung der Plastiktüten in den USA.', answer: true }],
          items: [
            { id: '1', type: 'boolean', statement: 'Eine Plastiktüte kostet in den USA 50 Cent.', answer: false },
            { id: '2', type: 'boolean', statement: 'Viele Amerikaner nehmen zum Einkauf ihre Einkauftaschen mit, weil sie Geld sparen wollen.', answer: false },
            { id: '3', type: 'boolean', statement: 'Die dünnen Plastiktüten verursachen besonders viele Probleme.', answer: true },
            { id: '4', type: 'boolean', statement: 'Man hat sogar im Ozean Plastiktüten entdeckt.', answer: true },
            { id: '5', type: 'boolean', statement: 'Die Plastiktüten wird man in dem ganzen Land verbieten.', answer: false },
            { id: '6', type: 'boolean', statement: 'Der Umweltschutz hat im Thema Plastiktüte die Industrie besiegt.', answer: true },
          ],
        },
        {
          id: 'L-2',
          label: 'Aufgabe 2',
          instructions:
            'Hören Sie sich den Text über die Vorweihnachtszeit an und beantworten Sie die Fragen kurz (max. 8 Wörter). (0) ist ein Beispiel für Sie. Achtung! Sie dürfen in jede Zeile nur eine Information schreiben.',
          examples: [
            { id: '0', type: 'short-text', prompt: 'Worum geht es im Text?', answer: { accepted: ['um Vorweihnachtszeit /Advent'], match: 'exact-ci' } },
          ],
          // 1–2, 4–5 and 7–8 each take two of the key's answers, in any order.
          items: [
            {
              ...anyOf('1', 'Welche Programme hat man an Adventssontagen? (1)', ADVENT_SUNDAY, 0, ADVENT_SUNDAY_WORDS, 8),
              reviewNote: 'The key: 1–2. two of: Die ganze Familie kommt zusammen / isst Kekse und trinkt Tee / zündet die Kerzen an.',
            },
            anyOf('2', 'Welche Programme hat man an Adventssontagen? (2)', ADVENT_SUNDAY, 1, ADVENT_SUNDAY_WORDS, 8),
            {
              id: '3',
              type: 'short-text',
              prompt: 'Was darf man am ersten Dezember machen?',
              answer: { accepted: ['den Adventskalender aufmachen'], match: 'keywords', keywords: [['kalender', 'türchen', 'tür']], maxWords: 8 },
            },
            {
              ...anyOf('4', 'Welche Sorten von Adventskalendern gibt es? (1)', CALENDARS, 0, CALENDAR_WORDS, 8),
              reviewNote: 'The key: 4–5. two of: Bilder / Schokolade / Lego / Bücher.',
            },
            anyOf('5', 'Welche Sorten von Adventskalendern gibt es? (2)', CALENDARS, 1, CALENDAR_WORDS, 8),
            {
              id: '6',
              type: 'short-text',
              prompt: 'Was backen die Deutschen zur Adventszeit?',
              answer: { accepted: ['Kekse (Vanillekipferl)'], match: 'keywords', keywords: [['keks', 'kipferl', 'plätzchen', 'platzchen']], maxWords: 8 },
            },
            {
              ...anyOf('7', 'Was macht man am Weihnachtsmarkt? (1)', MARKET, 0, MARKET_WORDS, 8),
              reviewNote: 'The key: 7–8. two of: heißen Kinderpunsch oder Glühwein trinken / Geschenke kaufen / Musik hören.',
            },
            anyOf('8', 'Was macht man am Weihnachtsmarkt? (2)', MARKET, 1, MARKET_WORDS, 8),
            {
              id: '9',
              type: 'short-text',
              prompt: 'Wie kann man seine Wohnung zu dieser Zeit schöner machen?',
              answer: { accepted: ['die Wohnung schmücken', 'den Weihnachtsbaum schmücken'], match: 'keywords', keywords: [['schmück', 'schmuck', 'dekor']], maxWords: 8 },
            },
          ],
        },
      ],
    },
  ],
}

export default paper
