// Zöld Út Nyelvvizsgaközpont (MATE), B2 Allgemeinsprache Deutsch (középfok, általános), sample
// paper 1 — freely downloadable at https://zoldut.uni-mate.hu/mintafeladatsorok. Transcribed
// verbatim from the task sheet and its answer key (Lösungsschlüssel), including the source's own
// typos ("Haushalt-Jobbörse", "unfallverichert", "der Schüler" in Ildikó's letter). The speaking
// part is its own paper (nyelvvizsga-de-b2-szobeli-minta-01 in ../speaking.ts). No section times
// are printed on this paper, so none are set.
import type { ExamPaper, PassageBlock, ShortTextItem } from '../types'

const heizenText: PassageBlock[] = [
  { style: 'title', text: 'Heizen ohne Kohle, Öl und Gas: Wie geht das?' },
  {
    text: 'Das Heizen mit Kohle, Öl und Erdgas verursacht rund ein Viertel der globalen Treibhausgasemissionen. Das lässt sich aber ändern: Gebäude lassen sich klimaneutral versorgen und das geht mit erneuerbaren Energien weltweit. Dabei ist es vor allem sinnvoll, die Gebäude fit zu machen, um keine Energie zu verschwenden. Mit guter Dämmung und Belüftungssystemen lassen sich beim Neubau 80 bis 90 Prozent Energie einsparen und bei Altbauten durch die energetische Sanierung 75 bis 80 Prozent.',
  },
  {
    text: 'Der verbleibende Bedarf kann dann aus einem Mix an erneuerbaren Energien gedeckt werden. Als wichtige Quellen sind hierbei die Fernwärme mit erneuerbaren Energien und das Heizen mit Umweltwärme und Wärmepumpe. Der Einsatz von Holz oder Holzpellets ist ebenfalls eine Möglichkeit, den Bedarf an Wärme für einzelne Gebäude zu decken. Für den kompletten Wärmebedarf von Städten und Industrien ist dies jedoch keine sinnvolle Option.',
  },
  {
    text: 'Um bis 2050 klimaneutral zu werden, setzt die Stadt Frankfurt auf verschiedene Technologien. Dazu gehören effiziente Passivhäuser und die energetische Sanierung von Altbauten in der Stadt. Einen Teil der benötigten Wärmeenergie will Frankfurt mit Sonnenkraft auf den Dächern erzeugen, einen anderen Teil sollen Fernwärmeleitungen in die Stadtquartiere bringen. Dort soll Wärme eingespeist werden, die zum Beispiel beim Verbrennen von Müll und Holz entsteht. Außerdem kann Umweltwärme aus dem Boden, dem Grundwasser oder der Luft mit Hilfe von Wärmepumpen genutzt werden.',
  },
  {
    text: 'Wärmepumpen brauchen Strom als Antriebsenergie, die Leistung hängt vor allem von der Wärmequelle ab. Wärmepumpen mit Luft als Wärmequelle erzeugen in den älteren Gebäuden im Durchschnitt aus einer Kilowattstunde Strom rund drei Kilowattstunden Wärme. Und Wärmepumpen mit Grundwasser und Erdreich als Wärmequelle erzeugen im Durchschnitt 3,9 Mal so viel Wärme. Systeme in Neubauten sind effizienter.',
  },
  {
    text: 'Weltweit ersetzen Wärmepumpen inzwischen immer mehr fossile Heizsysteme. 2018 wurden weltweit 18 Millionen Wärmepumpen verkauft. In Europa sind sie bisher vor allem in den skandinavischen Ländern sehr verbreitet und beliebt. Der Strom wird in diesen Ländern schon jetzt vor allem durch klimafreundliche Wind- und Wasserkraft erzeugt. In Schweden verursachen Heizungen mit Wärmepumpe rund 90 Prozent weniger CO2 als Heizungen mit Erdgas.',
  },
  {
    text: 'In der EU und vielen anderen Ländern der Welt wird derzeit noch viel Strom mit Kohle- und Gas erzeugt. Doch Wärmepumpen sind in der Bilanz auch dort klimafreundlicher als eine Heizung mit Erdgas. Wenn der Strom durch den Ausbau Wind- und Solarkraft zunehmend klimafreundlicher wird, wächst der CO2-Einspareffekt bei Heizungen mit Wärmepumpe weiter. Stammt der Antriebsstrom zu 100 Prozent aus erneuerbaren Energien, wird das Heizen mit Wärmepumpen klimaneutral.',
  },
  {
    text: 'Energie- und Gebäudeexperten sind sich einig, dass der Umstieg auf klimaneutrale Heiztechnik in allen Gebäuden und in der Industrie weltweit möglich ist. Allerdings gibt es noch viel Schulungsbedarf. Bei Handwerkern, Architekten und Bauherren fehlt oft das Wissen, wie alles optimal abgestimmt werden kann und man so viel Energie und Geld spart.',
  },
]

/** An answer that may go in any row of its group (the key: "die Reihenfolge ist beliebig", "2 von 3 Antworten"). */
function anyOf(id: string, all: string[], index: number, keywords: string[], maxWords: number, prompt?: string): ShortTextItem {
  return {
    id,
    type: 'short-text',
    ...(prompt ? { prompt } : {}),
    answer: { accepted: [all[index], ...all.filter((_, i) => i !== index)], match: 'keywords', keywords: [keywords], maxWords },
  }
}

const EXTRA_HEAT = ['Umweltwärme', 'Holz / Holzpellets']
const EXTRA_HEAT_WORDS = ['umwelt', 'holz', 'pellet', 'wärmepumpe', 'fernwärme']
const SOURCES = ['aus dem Boden', 'aus der Luft', 'aus dem Grundwasser']
const SOURCE_WORDS = ['boden', 'erd', 'luft', 'grundwasser', 'wasser']
const PORTAL = ['Stellenanzeigen aufgeben', 'Stellengesuche aufgeben', 'in Angeboten suchen']
const PORTAL_WORDS = ['anzeige', 'gesuch', 'angebot', 'such', 'aufgeben', 'inserat']
const COMPUTER = ['E-Mails schreiben', 'Internet aufrufen']
const COMPUTER_WORDS = ['mail', 'internet', 'surfen', 'web']
const DETAILS = ['die Adresse', 'das Geburtsdatum', 'die E-Mail-Adresse']
const DETAIL_WORDS = ['adresse', 'geburt', 'mail', 'anschrift']

const paper: ExamPaper = {
  id: 'nyelvvizsga-de-b2-minta-01',
  type: 'nyelvvizsga',
  language: 'de',
  level: 'B2',
  sittingLabelHu: 'Minta 1.',
  track: 'general',
  source:
    'Zöld Út Nyelvvizsgaközpont (MATE): B2 Allgemeinsprache Deutsch (középfok, általános) mintafeladatsor — feladatsor, megoldókulcs és hanganyag. Ingyenesen letölthető: https://zoldut.uni-mate.hu/mintafeladatsorok',
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
            'Lesen Sie den Artikel und ergänzen Sie den Text mit den unten angegebenen Wörtern. Sie dürfen ein Wort nur einmal verwenden. Achtung! Es gibt zwei Wörter zu viel. Tragen Sie Ihre Lösung in die Tabelle ein. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'Junge Menschen lesen digitaler, dafür deutlich weniger Bücher' },
            {
              text: 'Die gute Nachricht zum Weltalphabetisierungstag lautet: Noch sind wir eine {{0}}. Daran hat auch das Aufkommen der „Neuen Medien“ nichts geändert. Denn wer mitreden möchte, der muss lesen können und auch komplexere Texte verstehen. Das ist den {{1}} Deutschen bewusst, wie eine Umfrage im Auftrag der „Stiftung Lesen“ ergab. Fast 85 Prozent der Erwachsenen in Deutschland halten es für ebenso wichtig oder noch wichtiger als vor 20 Jahren, gut lesen zu können. Menschen unter 30 Jahren lesen vor allem {{2}} und Textnachrichten sowie Internettexte, während bei Menschen über 60 Jahren insbesondere Zeitungen und Zeitschriften hoch im Kurs stehen.',
            },
            {
              text: 'Die gleichbleibende oder größere Bedeutung des Lesens wird jedoch in allen Altersgruppen anerkannt (16-29: 76,4 Prozent, 30-44: 83,8 Prozent, 45-59: 88 Prozent, ab 60: 87 Prozent). Das ist das {{3}} der vom Bundesministerium für Bildung und Forschung und der „Stiftung Lesen” in Auftrag gegebenen repräsentativen Befragung des Institutes für Demoskopie Allensbach anlässlich des Weltalphabetisierungstags.',
            },
            {
              text: 'Wobei gerade der Vergleich zwischen den über 60-Jährigen mit den 16- bis 29-Jährigen {{4}} macht, wie sehr sich vor allem das Trägermedium des Gelesenen verschoben hat. Bevorzugen die Senioren noch immer Zeitungen, Zeitschriften und auch die eigentlich längst aus der Zeit gefallenen Anzeigenblätter, beziehen die jungen Leute ihren Lesestoff zu jeweils über 90 Prozent aus E-Mails, SMS und {{5}}. Sie lesen also das, was die Älteren sich auf Papier zu Gemüte führen, in digitaler Form.',
            },
            {
              text: 'Aber: Sie lesen ein bisschen weniger Bücher. Während sich die Lesegewohnheiten bei Sachbüchern noch {{6}}, lesen zwar 35 Prozent der jungen Leute belletristische Bücher, aber das ist deutlich weniger als die 55 Prozent bei den Älteren.',
            },
            {
              text: 'Das ist der Punkt, an dem nämlich der Zeitfaktor ins Spiel kommt. Zeit kann man nur in die Wahrnehmung von jeweils einem Medium investieren, auch wenn einige Leute glauben, sie seien auch dabei zum Multitasking {{7}}. Aber man kann nicht wirklich ein Buch lesen, während man sich Clips auf Youtube anschaut oder Online-Spiele spielt.',
            },
            {
              text: 'Dennoch sind 22,3 Prozent aller Befragten und 34,1 Prozent der unter 30-Jährigen der Meinung, dass sie durch die {{8}} Medien heute sogar mehr lesen als früher.',
            },
            {
              text: 'Wir beobachten eine Veränderung, keine Krise des Lesens. Deutschland steht aber schon lange vor einer größeren Herausforderung als dem medialen Wandel: Jedes fünfte Kind wird {{9}} nicht ausreichend gefördert oder hat bereits Probleme beim Lesen. Viele dieser fast drei Millionen jungen Menschen unter 18 Jahren sind die funktionalen Analphabeten von morgen.',
            },
            {
              text: 'Und auch das Problem in der Aufnahmefähigkeit des menschlichen Gehirns ist den Lese-Experten vertraut. Wer ständig auf mehreren Kanälen unterwegs ist, kann sich nicht mehr {{10}}. Der begreift auch komplexere Zusammenhänge schwerer. Und tatsächlich steigen die Anforderungen an die Lese- und Medienkompetenz.',
            },
            {
              text: 'Besonders junge Menschen lesen heute {{11}} und andere Dinge, mit einer enormen Bandbreite: von der Kurznachricht bis zum Hypertext. Das erfordert ähnlich komplexe Strategien zur Sinnerfassung {{12}} das vertiefte Lesen, das weiterhin mit dem Kinderbuch beginnt.',
            },
            { text: 'Bücher animieren ja direkt zum Sich-Konzentrieren, zum vertieften Verständnis und zur Stärkung der individuellen Phantasie.' },
            {
              text: 'Aber wie holt man die jungen Menschen ab, wenn sie nicht mit Büchern aufgewachsen sind? Neben Buchgeschenken und Leseclubs {{13}} die Stiftung Lesen deshalb immer mehr digitale Formate. Unter www.einfachvorlesen.de finden Eltern wöchentlich neue Geschichten für Kinder ab 3 {{14}}. Seit diesem Jahr können sich Kinder- und Jugendeinrichtungen in ganz Deutschland für ein media.lab bewerben. Diese erhalten neben Büchern, Spielen und Zeitschriften {{15}} auch digitale Medien und Geräte, mit denen junge Menschen gemeinsam kreativ werden können (www.media-labs.info).',
            },
          ],
          // Printed in four columns; listed here column by column.
          bank: [
            { key: 'anders', text: 'anders' },
            { key: 'ähneln', text: 'ähneln' },
            { key: 'deutlich', text: 'deutlich' },
            { key: 'digitalen', text: 'digitalen' },
            { key: 'E-Mails', text: 'E-Mails' },
            { key: 'entwickelt', text: 'entwickelt' },
            { key: 'Ergebnis', text: 'Ergebnis' },
            { key: 'erklären', text: 'erklären' },
            { key: 'fähig', text: 'fähig' },
            { key: 'Internetangeboten', text: 'Internetangeboten' },
            { key: 'Jahren', text: 'Jahren' },
            { key: 'konzentrieren', text: 'konzentrieren' },
            { key: 'Lesekultur', text: 'Lesekultur' },
            { key: 'meisten', text: 'meisten' },
            { key: 'Nachrichten', text: 'Nachrichten' },
            { key: 'sprachlich', text: 'sprachlich' },
            { key: 'vor allem', text: 'vor allem' },
            { key: 'wie', text: 'wie' },
          ],
          unusedBankCount: 2,
          examples: [{ id: '0', type: 'choice', answer: 'Lesekultur' }],
          items: [
            { id: '1', type: 'choice', answer: 'meisten' },
            { id: '2', type: 'choice', answer: 'E-Mails' },
            { id: '3', type: 'choice', answer: 'Ergebnis' },
            { id: '4', type: 'choice', answer: 'deutlich' },
            { id: '5', type: 'choice', answer: 'Internetangeboten' },
            { id: '6', type: 'choice', answer: 'ähneln' },
            { id: '7', type: 'choice', answer: 'fähig' },
            { id: '8', type: 'choice', answer: 'digitalen' },
            { id: '9', type: 'choice', answer: 'sprachlich' },
            { id: '10', type: 'choice', answer: 'konzentrieren' },
            { id: '11', type: 'choice', answer: 'anders' },
            { id: '12', type: 'choice', answer: 'wie' },
            { id: '13', type: 'choice', answer: 'entwickelt' },
            { id: '14', type: 'choice', answer: 'Jahren' },
            { id: '15', type: 'choice', answer: 'vor allem' },
          ],
        },
        {
          id: 'R-1',
          label: 'Aufgabe 1',
          instructions:
            'Lesen Sie den Artikel „Heizen ohne Kohle, Öl und Gas: Wie geht das?” und entscheiden Sie, ob die Aussagen (1-5) richtig (R) oder falsch (F) sind. Tragen Sie Ihre Lösung in die Tabelle ein. (0) ist ein Beispiel für Sie. Achtung! Wenn in Ihrer Lösung ausschließlich “R” oder “F” stehen, wird die Aufgabe nicht bewertet.',
          passage: heizenText,
          booleanLabels: ['R', 'F'],
          rules: { allSameBooleanIsZero: true },
          examples: [{ id: '0', type: 'boolean', statement: 'Vom Heizen mit Kohle, Öl und Erdgas stammen etwa 25% der globalen CO2-Emissionen.', answer: true }],
          items: [
            { id: '1', type: 'boolean', statement: 'Um die Energieverschwendung zu vermeiden, sollten die Häuser gut gedämmt und belüftet werden.', answer: true },
            { id: '2', type: 'boolean', statement: 'Frankfurt will bis Mitte des Jahrhunderts seinen Energiebedarf durch Wind- und Wasserkraft erzeugten Strom decken.', answer: false },
            { id: '3', type: 'boolean', statement: 'Seit 2018 stieg der Umsatz von Wärmepumpen auf 18 Millionen Stück pro Jahr.', answer: false },
            { id: '4', type: 'boolean', statement: 'Die Heizung mit fossilen Energiequellen wie Erdgas ist für die Umwelt schädlich.', answer: true },
            { id: '5', type: 'boolean', statement: 'Auch die Schulen sollen mit Wärmepumpen versorgt werden.', answer: false },
          ],
        },
        {
          id: 'R-2',
          label: 'Aufgabe 2',
          instructions:
            'Lesen Sie den Text noch einmal, und machen Sie aufgrund der angegebenen Leitpunkte Notizen (max. 4 Wörter). Achtung! Sie dürfen in jede Zeile nur eine Information schreiben. Tragen Sie Ihre Lösung in die Tabelle ein. (0) ist ein Beispiel für Sie.',
          passage: [
            ...heizenText,
            { style: 'row', label: 'Auf diese Weise kann ein Gebäude klimaneutral werden:', text: '{{0}}' },
            { style: 'row', label: 'So kann der Wärmebedarf zusätzlich gedeckt werden:', text: '{{6}}' },
            { style: 'row', label: '', text: '{{7}}' },
            { style: 'row', label: 'Umweltwärme gewinnt man aus:', text: '{{8}}' },
            { style: 'row', label: '', text: '{{9}}' },
            { style: 'row', label: 'Großer Vorteil der Heizung mit Wärmepumpe:', text: '{{10}}' },
          ],
          examples: [{ id: '0', type: 'short-text', answer: { accepted: ['mit erneuerbaren Energien'], match: 'exact-ci' } }],
          // Graded by key words; `accepted` is the key as printed. 6–7 and 8–9 count in any order.
          items: [
            { ...anyOf('6', EXTRA_HEAT, 0, EXTRA_HEAT_WORDS, 4), reviewNote: 'The key: 6. Umweltwärme, 7. Holz / Holzpellets — in either order.' },
            anyOf('7', EXTRA_HEAT, 1, EXTRA_HEAT_WORDS, 4),
            { ...anyOf('8', SOURCES, 0, SOURCE_WORDS, 4), reviewNote: 'The key: 8. aus dem Boden / aus der Luft, 9. aus dem Grundwasser — two of the three, in any order.' },
            anyOf('9', SOURCES, 2, SOURCE_WORDS, 4),
            {
              id: '10',
              type: 'short-text',
              answer: { accepted: ['weniger CO2-Emission', 'klimafreundlicher'], match: 'keywords', keywords: [['co2', 'klima', 'emission', 'umwelt']], maxWords: 4 },
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
            'Eine Ihrer deutschen Freundinnen hat nach ihrem Abitur einen Beitrag über ihre unangenehme Ausbildung an einer reinen Mädchenschule gepostet. Schreiben Sie jetzt zu ihrem Beitrag einen Kommentar.',
          items: [
            {
              id: '1',
              type: 'production',
              prompt: ['Verwenden Sie dafür 100-120 Wörter.', 'In Ihrem Kommentar'],
              contentPoints: [
                'stimmen Sie Ihrer Freundin zu und betonen Sie die Nachteile der gleichgeschlechtlichen Erziehung,',
                'erwähnen Sie auch einige Vorteile,',
                'erläutern Sie Ihre persönliche Meinung.',
              ],
              minWords: 100,
              maxWords: 120,
              register: 'forum-post',
              rubricId: 'nyelvvizsga-de-b2-1',
              modelAnswer: [
                'Heute habe ich den Beitrag einer Freundin gelesen, in dem sie sich über ihre Schule, eine reine Mädchenschule beschwerte.',
                'Zunächst einmal möchte ich sagen, dass ich ihr zustimme, denn eine reine Mädchenschule muss einige Nachteile haben, zum Beispiel kann man einfach nicht lernen, mit Jungen zu sprechen, oder man kann mit den anderen Mädchen mehrmals streiten.',
                'Andererseits kannst du viele gute Freunde finden und hast keine Jungs, die dich schikanieren, und auf diese Weise kannst du Dinge tun, die sonst nicht möglich wären.',
                'Meine persönliche Meinung ist, dass ich gemischte Schulen bevorzuge, weil dort die Geschlechtergleichheit herrscht und man mit Menschen des anderen Geschlechts befreundet sein und zusammenarbeiten kann.',
                '',
                '(109 Wörter)',
              ].join('\n'),
            },
          ],
        },
        {
          id: 'W-2',
          label: 'Aufgabe 2',
          instructions:
            'Sie haben vor, nach dem Abitur in Deutschland zu studieren. Bitten Sie aus diesem Grund Ihren ehemaligen Deutschlehrer aus Österreich, Ihnen ein Empfehlungsschreiben zu geben.',
          items: [
            {
              id: '2',
              type: 'production',
              prompt: ['Verwenden Sie für Ihren Brief 140-160 Wörter', 'Ihr Name in dieser Rolle ist Kovács Ildikó / Imre.', 'Beschreiben Sie in Ihrem Brief,'],
              contentPoints: [
                'wer Sie sind,',
                'in welchen Fächern er Sie unterrichtet hat und mit welchen Ergebnissen,',
                'welche weiteren Erfahrungen Sie seitdem mit der deutschen Sprache gemacht haben.',
                'was Ihre Studien- und Zukunftspläne sind.',
              ],
              minWords: 140,
              maxWords: 160,
              register: 'formal-letter',
              rubricId: 'nyelvvizsga-de-b2-2',
              modelAnswer: [
                'Sehr geehrter Herr Mayer,',
                '',
                'lassen Sie mich Ihnen vorstellen.',
                'Mein Name ist Ildikó Kovács, Sie haben mir in der 6. Klasse deutsche Geschichte und Biologie auf Deutsch beigebracht, und ich bin sehr froh, dass Sie das getan haben, denn es hat mir geholfen, meine Deutschkenntnisse zu verbessern. Sie erinnern sich vielleicht, dass ich der Schüler war, der sich sehr für Nationalparks in Deutschland interessierte und immer die besten Noten hatte.',
                'Derzeit plane ich, in Deutschland an die Universität zu gehen, um Wirtschaftswissenschaften zu studieren, und ich habe eine Anfrage. Ich benötige ein Empfehlungsschreiben eines Gutachters, der später kontaktiert werden kann, um seine Empfehlung zu bestätigen.',
                'Ich wäre Ihnen sehr dankbar, wenn Sie für die Universität eine solche Empfehlung über mich schreiben würden. Sie fragen nach Informationen über die Sprachkenntnisse, Stärken und Persönlichkeit des Schülers, insbesondere in Bezug auf Schularbeiten und andere Schüler.',
                'Ich hoffe, dass Sie meiner Bitte zustimmen und den Brief schreiben können.',
                '',
                'Ich freue mich auf Ihre Antwort.',
                '',
                'Mit freundlichen Grüßen',
                '',
                'Ildikó Kovács',
                '',
                '(158 Wörter)',
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
        storagePath: 'nyelvvizsga-de-b2-minta-01.mp3',
        durationSec: 999,
        // Aufgabe 2 starts with its announcement, right after Aufgabe 1's last pause (loudness scan).
        taskMarkers: [
          { taskId: 'L-1', startSec: 0 },
          { taskId: 'L-2', startSec: 455 },
        ],
      },
      tasks: [
        {
          id: 'L-1',
          label: 'Aufgabe 1',
          instructions:
            'Hören Sie sich die Nachricht über den Klimawandel an, und entscheiden Sie, ob die Aussagen (1-8) richtig (R) oder falsch (F) sind. Tragen Sie Ihre Lösung in die Tabelle ein. (0) ist ein Beispiel für Sie. Achtung! Wenn in Ihrer Lösung ausschließlich “R” oder “F” stehen, wird die Aufgabe nicht bewertet.',
          booleanLabels: ['R', 'F'],
          rules: { allSameBooleanIsZero: true },
          examples: [{ id: '0', type: 'boolean', statement: 'Der Klimawandel bedeutet nicht nur höhere Temperaturen.', answer: true }],
          items: [
            { id: '1', type: 'boolean', statement: 'Die Natur von den Alpen und dem Ural sind im gleichen Maße vom Menschen geprägt.', answer: false },
            { id: '2', type: 'boolean', statement: 'Im Ural können die Veränderungen durch Klimawandel leicht festgestellt werden.', answer: true },
            { id: '3', type: 'boolean', statement: 'Die Grenze der Bäume steigt im Ural jedes Jahr um 4-8 Meter.', answer: false },
            { id: '4', type: 'boolean', statement: 'Die Sommer sind im Ural wärmer geworden.', answer: true },
            { id: '5', type: 'boolean', statement: 'Die Winter sind im Ural wärmer geworden.', answer: true },
            { id: '6', type: 'boolean', statement: 'Die Menge des Schnees hat sich im letzten Jahrhundert wesentlich vergrößert.', answer: true },
            { id: '7', type: 'boolean', statement: 'Die Schneemassen unterstützen das Wachstum der Bäume.', answer: true },
            { id: '8', type: 'boolean', statement: 'Im Winter bleibt das Leben in durchgefrorenen Böden still.', answer: false },
          ],
        },
        {
          id: 'L-2',
          label: 'Aufgabe 2',
          instructions:
            'Hören Sie sich die Sendung von „Deutschlandfunk” an und beantworten Sie die Fragen kurz. (0) ist ein Beispiel für Sie. Achtung! Sie dürfen in jede Zeile nur eine Information schreiben!',
          examples: [
            { id: '0', type: 'short-text', prompt: 'Was versteht man unter der „Minijob-Zentrale”?', answer: { accepted: ['eine Haushaltsjob-Börse im Internet'], match: 'exact-ci' } },
          ],
          // 5–6, 7–8 and 9–11 count in any order.
          items: [
            {
              id: '1',
              type: 'short-text',
              prompt: 'Für wen ist die Haushaltsjob-Börse in erster Linie gedacht?',
              answer: {
                accepted: ['für Familien, die eine Haushaltshilfe suchen', 'für Menschen, die in einem Privathaushalt etwas dazuverdienen wollen'],
                match: 'keywords',
                keywords: [['famili', 'haushaltshilfe', 'privathaushalt', 'dazuverdien', 'menschen']],
              },
            },
            { id: '2', type: 'short-text', prompt: 'Was kostet die Teilnahme an der Haushalt-Jobbörse?', answer: { accepted: ['kostenlos'], match: 'keywords', keywords: [['kostenlos', 'gratis', 'nichts', 'umsonst']] } },
            {
              id: '3',
              type: 'short-text',
              prompt: 'Wo ist es besonders schwierig, eine Haushaltshilfe durch persönliche Empfehlung zu finden?',
              answer: { accepted: ['in Großstädten'], match: 'keywords', keywords: [['großst', 'grossst', 'stadt', 'städt']] },
            },
            {
              id: '4',
              type: 'short-text',
              prompt: 'Wer kann die neue Dienstleistung in Anspruch nehmen?',
              answer: { accepted: ['für Familien', 'Mutter (die sich von der Hausarbeit entlasten wollen)'], match: 'keywords', keywords: [['famili', 'mutter', 'mütter', 'eltern']] },
            },
            {
              ...anyOf('5', PORTAL, 0, PORTAL_WORDS, 8, 'Was können die Privatpersonen nach der Registrierung auf dem Portal machen? (1)'),
              reviewNote: 'The key: 5–6. two of: Stellenanzeigen aufgeben / Stellengesuche aufgeben / in Angeboten suchen.',
            },
            anyOf('6', PORTAL, 1, PORTAL_WORDS, 8, 'Was können die Privatpersonen nach der Registrierung auf dem Portal machen? (2)'),
            {
              ...anyOf('7', COMPUTER, 0, COMPUTER_WORDS, 8, 'Was müssen die Benutzer auf dem Computer tun können, wenn sie das Portal benutzen wollen? (1)'),
              reviewNote: 'The key: 7–8. E-Mails schreiben / Internet aufrufen (die Reihenfolge ist beliebig).',
            },
            anyOf('8', COMPUTER, 1, COMPUTER_WORDS, 8, 'Was müssen die Benutzer auf dem Computer tun können, wenn sie das Portal benutzen wollen? (2)'),
            {
              ...anyOf('9', DETAILS, 0, DETAIL_WORDS, 8, 'Welche persönlichen Angaben verlangt die Minijob-Zentrale von den Benutzern über ihren Namen hinaus? (1)'),
              reviewNote: 'The key: 9–11. die Adresse / das Geburtsdatum / die E-Mail-Adresse (die Reihenfolge ist beliebig).',
            },
            anyOf('10', DETAILS, 1, DETAIL_WORDS, 8, 'Welche persönlichen Angaben verlangt die Minijob-Zentrale von den Benutzern über ihren Namen hinaus? (2)'),
            anyOf('11', DETAILS, 2, DETAIL_WORDS, 8, 'Welche persönlichen Angaben verlangt die Minijob-Zentrale von den Benutzern über ihren Namen hinaus? (3)'),
            {
              id: '12',
              type: 'short-text',
              prompt: 'Welche Vorteile bietet den Arbeitnehmern die Anmeldung bei der Minijob-Zentrale? (ein Beispiel)',
              answer: {
                accepted: ['sie sind unfallverichert', 'sie können Anspruch auf Urlaub haben', 'Lohnfortzahlung', 'Rentenversicherung'],
                match: 'keywords',
                keywords: [['unfall', 'versicher', 'urlaub', 'lohnfortzahlung', 'rente']],
              },
            },
          ],
        },
      ],
    },
  ],
}

export default paper
