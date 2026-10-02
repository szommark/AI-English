// Német nyelv, középszintű írásbeli érettségi, 2022. október 24. (2112), Oktatási Hivatal.
// Transcribed verbatim from the feladatlap and its javítási-értékelési útmutató (answer key,
// conversion tables, listening transcripts). Decorative photos are left out.
import type { ExamPaper } from '../types'
import { choices, DE_CRITERIA_1, DE_CRITERIA_2, DE_LISTENING_INTRO, DE_NOTICES_HU, DE_WRITING_INTRO, gapMcqs, rf } from './deKozep.ts'
import { questions } from './enKozep.ts'

const paper: ExamPaper = {
  id: 'erettsegi-de-kozep-2022-oktober',
  type: 'erettsegi',
  language: 'de',
  level: 'kozep',
  sittingLabelHu: '2022. október',
  source: 'Oktatási Hivatal: Német nyelv, középszintű írásbeli vizsga, 2022. október 24. (2112) — feladatlap és javítási-értékelési útmutató.',
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
            'Sie lesen ein Interview mit Jan aus den Niederlanden. Lesen Sie zuerst die Antworten des Interviews und suchen Sie dann die passende Frage. Schreiben Sie die entsprechenden Buchstaben in die Rubrik. Achtung! Es gibt eine Frage zu viel. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'Ein professioneller Sprachlerner' },
            { text: 'Heute spreche ich mit Jan aus den Niederlanden. Er hat 95 Länder besucht und dabei zehn Sprachen gelernt! Er ist ein professioneller Sprachlerner und Weltenbummler.' },
            { text: '{{0}} Ich habe in den letzten acht Jahren die Welt bereist, ich habe 95 Länder besucht.' },
            { text: '{{1}} Mein Ziel ist es, vor meinem dreißigsten Geburtstag 100 Länder zu besuchen und weitere Fremdsprachen zu lernen.' },
            { text: '{{2}} Ich spreche Kantonesisch, Holländisch, Englisch, Französisch, Deutsch, Mandarin, Portugiesisch, Russisch, Spanisch und Thai.' },
            { text: '{{3}} Ich habe eine niederländische Übersetzungsfirma gegründet, die es mir erlaubt, um die Welt zu reisen und online zu arbeiten.' },
            {
              text: '{{4}} Ich teile meine Tipps zum Sprachenlernen auf meinem YouTube-Kanal zum Thema Sprachenlernen und im Fremdsprachen-Blog Language Boost. Zusätzlich habe ich auch Schnelllern-Sprachkurse entwickelt.',
            },
            { text: '{{5}} Du musst die wichtigsten Wörter und Sätze lernen, um dich zurechtzufinden und zumindest einfache Unterhaltungen führen zu können.' },
            {
              text: '{{6}} Die Wörter, die du kennst, solltest du nutzen. Dich mit Muttersprachlern zu unterhalten, funktioniert gut auf der Straße. Du solltest die Sprache auch weiter aktiv lernen, wenn du im Land bist.',
            },
          ],
          bankTitle: 'FRAGEN',
          bank: [
            { key: 'A', text: 'Kannst du auch anderen mit deinen Lernerfahrungen helfen?' },
            { key: 'B', text: 'Mit wie viel Jahren hast du deine erste Fremdsprache gelernt?' },
            { key: 'C', text: 'Was hast du in den letzten Jahren gemacht?' },
            { key: 'D', text: 'Was machst du, wenn du im Ausland bist, um deine Sprachkenntnisse dort zu erweitern?' },
            { key: 'E', text: 'Was sind deine Pläne für die Zukunft?' },
            { key: 'F', text: 'Welche Sprachen kannst du?' },
            { key: 'G', text: 'Wie finanzierst du deine Reisen?' },
            { key: 'H', text: 'Wie sollte man sich sprachlich auf eine Reise ins Ausland vorbereiten?' },
          ],
          unusedBankCount: 1,
          examples: choices(0, 'C'),
          items: choices(1, 'E F G A H D'),
        },
        {
          id: 'I-2',
          label: '2.',
          instructions:
            'Lesen Sie den Text über Tobias und entscheiden Sie, welcher Satz in welche Lücke passt. Achtung! Es gibt einen Satz zu viel. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'Tobias entdeckt seine Stärken' },
            {
              text: 'Wie findet man heraus, welcher Beruf zu einem passt? Klar ist, um sich entscheiden zu können, muss man Verschiedenes ausprobieren. {{0}} Schon in der dritten Klasse war Tobias der Chef eines kleinen Kiosks. Gemeinsam mit den anderen Kindern seiner Klasse verkaufte er Spielzeugautos, Süßigkeiten und belegte Brötchen. „Die Preise haben wir alle selber gemacht – da muss man gut überlegen“, erzählt er. Schließlich darf die Ware nicht zu teuer sein. {{7}} Auf die Idee, diese Erfahrungen für seine spätere Berufswahl zu nutzen, ist Tobi aber erst mal nicht gekommen. So wie Tobias geht es vielen Jugendlichen: Die Schule ist vorbei, und man steht vor der Entscheidung, den richtigen Beruf auszuwählen. Das ist gar nicht so einfach. {{8}} Bei futOUR lernen die Jugendlichen spielerisch, ihre Stärken zu erkennen. Kann ich gut mit Menschen umgehen, bin ich vorsichtig, hilfsbereit oder kann ich andere motivieren? „Die Schülerinnen und Schüler erleben hier, wie sie in verschiedenen Situationen reagieren.“ erklärt Campleiter Andreas. So kann man konkrete Fähigkeiten erkennen: Während der Eine vielleicht die Koordination übernimmt, ist der Zweite hilfsbereit. {{9}} „Mit dem Geschäft kenne ich mich aus und in Mathe habe ich eine Eins, das macht mir Spaß“, versichert Tobias, während er verschiedene Duschkabinen zeigt. {{10}} Verkäufer zu werden, könnte er sich jetzt gut vorstellen. Zum Abschluss des Camps führen die Jugendlichen ihre Erfahrungen aus den verschiedenen Spielen, Praktika und Workshops zusammen. {{11}} Wie stelle ich mir mein Leben vor? Und wie komme ich dahin? Es ist nicht einfach, die eigenen Stärken und Ziele konkret zu formulieren. Das muss man erst mal lernen. {{12}} Die hier erworbenen Fähigkeiten werden den Jugendlichen später helfen, sich in der Berufswelt zurechtzufinden.',
            },
          ],
          bankTitle: 'SÄTZE',
          bank: [
            { key: 'A', text: 'Da fehlt leider Teamgeist.' },
            { key: 'B', text: 'Ein wenig daran verdienen muss man aber doch.' },
            { key: 'C', text: 'Auch das hat Tobias im futOUR-Camp gelernt.' },
            { key: 'D', text: 'Für einen Tag lernt der Schüler heute den Arbeitsalltag eines Baumarktes kennen.' },
            { key: 'E', text: 'Für Minipraktika und Workshops mussten sich die Jugendlichen deshalb richtig bewerben.' },
            { key: 'F', text: 'Gemeinsam mit den Teamleitern planen sie ihre Zukunft.' },
            { key: 'G', text: 'Und ein Dritter ist mehr der ruhige Typ, der alles zusammenhält.' },
            { key: 'H', text: 'Woher weiß man, was man gut kann und was Spaß macht?' },
          ],
          unusedBankCount: 1,
          examples: choices(0, 'C'),
          items: choices(7, 'B H G D F E'),
        },
        {
          id: 'I-3',
          label: '3.',
          instructions:
            'Lesen Sie den Text über Wohnmöglichkeiten für Studierende. Notieren Sie die wichtigsten Informationen in Stichworten. Schreiben Sie zu jedem Punkt nur eine Information. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'Wohnen während des Studiums' },
            {
              text: 'Für die Miete geben Studierende monatlich den höchsten Betrag ihres Budgets aus. Daher sind preisgünstige Wohnformen, wie die Studentenwohnheime der Studentenwerke*, sehr beliebt. Für Studierende ist ein Platz im Wohnheim eine günstige und beliebte Wohnmöglichkeit. Daher ist die Nachfrage unverändert groß. In Deutschland bieten die Studentenwerke rund 194.000 Wohnplätze an.',
            },
            {
              text: 'Die Wohnraum-Situation für Studierende ist regional sehr unterschiedlich: In den westdeutschen Großstädten und klassischen Universitätsstädten ist sie am kritischsten. Besonders problematisch ist sie jedoch für Studienanfänger/-innen, Studierende mit geringem Einkommen und ausländische Studierende. Sie sind auf einen Platz im Studentenwohnheim angewiesen.',
            },
            {
              text: 'Das Studentenwohnheim ist die preisgünstigste Wohnform außerhalb des Elternhauses und eine beliebte Alternative zu Mietwohnungen. Die durchschnittliche Miete kostet bei den Studentenwerken 246,13 Euro im Monat. Außerdem gibt es an den meisten Standorten Wohnplätze für Behinderte und auch für Studierende mit Kindern werden speziell eingerichtete Wohnungen angeboten.',
            },
            {
              text: 'Neben dem günstigen Mietpreis schätzen die Studierenden vor allem die Nähe zur Universität und Hochschule und die sozialen Kontaktmöglichkeiten. Fast zwei Drittel der deutschen Studierenden bewerten die Wohnungssuche zum Beginn ihres Studiums als schwierig oder sehr schwierig. Ein Viertel von ihnen musste eine weniger günstige Unterkunft wählen, weil sie nichts anderes finden konnten und keine Zeit zur weiteren Suche hatten.',
            },
            {
              text: 'Auch ausländische Studierende, die sogenannten Bildungsausländer brauchen in erster Linie eine günstige Unterbringung. Ihr monatliches Geld liegt durchschnittlich gut 10 Prozent niedriger als bei deutschen Studierenden und viele kommen nur für 1 bis 2 Semester zu einem Studienaufenthalt nach Deutschland. Viele Studentenwerke bieten für diese Gruppe besondere Wohnmöglichkeiten in Gästehäusern und das so genannte Service-Paket für die Integration mit Tutorenprogrammen. Das Angebot ist von Studentenwerk zu Studentenwerk unterschiedlich.',
            },
            { style: 'note', text: '*Studentenwerk: Eine Organisation an Hochschulen, die Studierenden Rat und Hilfe anbietet, bzw. Wohnmöglichkeiten und Jobs vermittelt.' },
          ],
          examples: [
            {
              id: '0',
              type: 'short-text',
              prompt: 'Eine gefragte Wohnmöglichkeit für Studierende:',
              answer: { accepted: ['Studentenwohnheim'], match: 'exact-ci' },
            },
          ],
          items: [
            {
              id: '13',
              type: 'short-text',
              prompt: 'Hier können Studierende ziemlich schwer Wohnraum finden: z. B.',
              answer: { accepted: ['in den westdeutschen Großstädten/klassischen Universitätsstädten'], match: 'keywords', keywords: [['großstädte', 'großstadt', 'universitätsstädte', 'universitätsstadt']] },
            },
            {
              id: '14',
              type: 'short-text',
              prompt: 'Hauptgrund für die Beliebtheit von Studentenwohnheimen:',
              answer: {
                accepted: ['die billigste/(preis)günstigste Wohnform', 'am billigsten', '(sehr) billig/(preis)günstig'],
                match: 'keywords',
                keywords: [['billig', 'günstig']],
              },
            },
            {
              id: '15',
              type: 'short-text',
              prompt: 'Es gibt spezielle Wohnplätze für: (1)',
              answer: { accepted: ['Behinderte', 'Studierende mit Kindern'], match: 'keywords', keywords: [['behinderte', 'kinder']] },
              reviewNote: 'A 15. és 16. itemre adott két helyes válasz sorrendje mindegy.',
            },
            {
              id: '16',
              type: 'short-text',
              prompt: 'Es gibt spezielle Wohnplätze für: (2)',
              answer: { accepted: ['Studierende mit Kindern', 'Behinderte'], match: 'keywords', keywords: [['behinderte', 'kinder']] },
              reviewNote: 'A 15. és 16. itemre adott két helyes válasz sorrendje mindegy.',
            },
            {
              id: '17',
              type: 'short-text',
              prompt: 'Sehr wichtig für Studierende ist bei Wohnheimplätzen z. B. auch:',
              answer: {
                accepted: ['die Nähe zur Universität (und Hochschule)', 'die sozialen Kontaktmöglichkeiten/Kontakte'],
                match: 'keywords',
                keywords: [['nähe', 'naehe', 'kontakt']],
              },
            },
            {
              id: '18',
              type: 'short-text',
              prompt: 'So viele deutsche Studierende finden die Suche nach einer Unterkunft schwer:',
              answer: { accepted: ['(fast) zwei Drittel'], match: 'keywords', keywords: [['zwei drittel', '2/3']] },
            },
            {
              id: '19',
              type: 'short-text',
              prompt: 'Spezielle Wohnmöglichkeit für Bildungsausländer:',
              answer: { accepted: ['(Wohnmöglichkeiten) in Gästehäusern (mit einem Service-Paket)'], match: 'keywords', keywords: [['gästehäus', 'gästehaus', 'gaestehaus']] },
            },
          ],
        },
        {
          id: 'I-4',
          label: '4.',
          instructions:
            'Lesen Sie das Interview über Audionutzung und entscheiden Sie, welche Aussage richtig (R) und welche falsch (F) ist. Kreuzen Sie die Antwort in der Tabelle an. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'Streaming ist in, Radio ist nicht out' },
            { text: 'Was ist der größte Unterschied zwischen jüngeren und älteren Radiohörern?' },
            {
              text: 'Bei den jungen Radio-Zielgruppen muss man eigentlich schon von Audio-Zielgruppen sprechen. Hier spielen Streaming-Dienste eine sehr große Rolle. Junge Nutzer von Musik-Streaming-Diensten verbringen schon mehr Zeit damit als vor dem Radio.',
            },
            { text: 'Trotzdem ist Radio bei Teenagern und Twens in Bayern noch nicht „out“, oder?' },
            {
              text: 'Nein. Der Unterschied zwischen jüngeren und älteren Radiohörern ist hier gar nicht so groß. Der Tagesdurchschnitt bei den 14- bis 29-Jährigen liegt immer noch bei 79 Prozent, bei der Gesamtbevölkerung sind es 82 Prozent. Die kleine Lücke wird durch Streaming-Dienste geschlossen.',
            },
            { text: 'Was empfehlen Sie denen, die mit ihrer Werbung junge Zielgruppen weiterhin über Radio erreichen wollen?' },
            {
              text: 'Werbung morgens schalten! Der Morgen gehört auch bei Jüngeren dem Radio, gestreamt wird eher abends. Außerdem ist der morgens zuerst gehörte Sender in Bayern häufig ein lokales Programm. Was auch damit zu tun hat, dass es in den größeren Städten mindestens ein passendes Radioangebot für jüngere Hörer gibt. Ohne lokales Jugendradio würde das Medium bei Jugendlichen wahrscheinlich nicht auf 183 Minuten Hördauer pro Tag kommen – also auf mehr als drei Stunden.',
            },
            {
              text: 'Sind die besonderen Angebote der bayerischen Radiosender auch der Grund dafür, dass das Radio in Deutschland durchschnittlich weniger Hörer hat als in Bayern?',
            },
            {
              text: 'Das ist so. Junge Zielgruppen hören in Bayern mehr Radio als im Bundesschnitt. Radio Galaxy zum Beispiel erreicht dort, wo der Sender per UKW empfangbar ist, täglich ein Drittel der 14- bis 29-Jährigen.',
            },
            { text: 'Was sollten Radiomacher Ihrer Meinung nach tun, um für junge Zielgruppen attraktiv zu bleiben?' },
            {
              text: 'Die Strategie, die vor vielen Jahren mal „in“ war, dass man möglichst wenig spricht, ganz viel Musik macht und versucht, den Musikgeschmack der Jugend zu treffen, funktioniert nicht mehr. Dazu braucht man heute keinen Radiosender mehr. Jeder kann sich das für ihn ideale Musikprogramm selbst zusammenstellen. Radio für junge Zielgruppen muss mehr bieten als Musik: Die Verpackung muss stimmen und der Sender muss das Lebensgefühl wiedergeben – und das kann nicht nur über Musik funktionieren.',
            },
          ],
          booleanLabels: ['R', 'F'],
          examples: rf(0, ['Jüngere Generationen nehmen Streaming-Dienste öfter in Anspruch.'], 'R'),
          items: rf(
            20,
            [
              'Morgens hört man in Bayern am liebsten ein lokales Radioprogramm.',
              'In Bayerns größeren Ortschaften gibt es auch ein Jugendradio.',
              'Die jüngere Generation streamt 183 Minuten pro Tag.',
              'Besonders in Bayern hören jüngere Menschen oft Radio.',
              'Die Radiosender wollen den Musikgeschmack der Jugendlichen beeinflussen.',
              'Die jüngere Generation schaltet das Radio nur wegen der Musik ein.',
            ],
            'R R F R F F',
          ),
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
            { style: 'title', text: 'Ein glücklicher Mensch' },
            {
              text: 'Der {{0}} Liedermacher Wenzel Beck spricht über Kreativität. Wenzel war schon als Kind musikalisch. Der Liedermacher brachte seine Eltern dazu, {{1}} schon mit drei Jahren ein Schlagzeug zu schenken. Dann eine Gitarre. {{2}} 14 Jahren schrieb er schon seine ersten eigenen Songs. Fliegen ihm seine Lieder einfach zu? Wenzel: „Ich schreibe einfach {{3}} alles, was mich beschäftigt.“ Zum Beispiel in seinen Liedern „Wunderschön“ oder „Wind“.',
            },
            {
              text: 'Wenzel schreibt auf Deutsch. Eigentlich studiert er zurzeit das Fach „{{4}} Mathematik“. Wenzel entdeckt für sich nämlich gern {{5}}. Sein Motto für Kreativität: „Man muss auch einmal Umwege gehen und ein bisschen Blödsinn machen, um sich {{6}}. Meine Schwachsinnigkeiten machen mich aus.“ Damit {{7}} sich Wenzel richtig wohl: „Ich bin einfach ein unverschämt glücklicher Mensch.“',
            },
          ],
          examples: gapMcqs(0, [['junge', 'jungen', 'junger', 'junges']], 'A'),
          items: gapMcqs(
            1,
            [
              ['ihm', 'ihn', 'ihr', 'ihnen'],
              ['Bei', 'In', 'Mit', 'Zu'],
              ['auf', 'über', 'um', 'von'],
              ['Technische', 'Technischen', 'Technischer', 'Technisches'],
              ['Neu', 'Neue', 'Neuen', 'Neues'],
              ['ausprobieren', 'ausprobiert', 'ausprobierte', 'auszuprobieren'],
              ['fühlt', 'geht', 'hat', 'macht'],
            ],
            'A C B A D D A',
          ),
        },
        {
          id: 'II-2',
          label: '2.',
          instructions:
            'Was passt in den Text? Schreiben Sie den entsprechenden Buchstaben in die Rubrik. Achtung! Es gibt sechs Buchstaben zu viel. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'Ein Hund ist allein in Leipzig angekommen' },
            {
              text: 'In Leipzig ist {{0}} Freitag ein Hund allein in einem Zug angekommen. Der Zug ist {{8}} der Stadt Duisburg nach Leipzig gefahren. Und der Zug hat in der Stadt Wittenberg gehalten. Da {{9}} der Hundebesitzer ausgestiegen, weil er eine Zigarette rauchen wollte. Aber der Zug ist ohne den Hundebesitzer weitergefahren. Später {{10}} die Menschen im Zug die Bundespolizei gerufen, weil im Zug noch die Sachen vom Hundebesitzer waren. Die Polizisten sind zum Zug gefahren, und sie haben dort den Hund {{11}} einem Sitz gefunden. Der Hund hatte sehr viel Angst. Deshalb mussten die Polizisten sehr lange mit dem Hund reden, {{12}} der Hund mit den Polizisten mitkommt. Die Polizisten haben den Hund dann zu {{13}} Polizeistation mitgenommen. Der Hundebesitzer ist mit einem anderen Zug nach Leipzig gefahren, und dort hat er dann {{14}} Hund bei dem Polizeirevier* abgeholt. Die Bundespolizei hat gesagt: Der Hundebesitzer und der Hund haben {{15}} sehr gefreut, als sie sich wiedergesehen haben.',
            },
            { style: 'note', text: '*Polizeirevier = Polizeidienststelle' },
          ],
          bank: [
            { key: 'A', text: 'DAMIT' },
            { key: 'B', text: 'DENN' },
            { key: 'C', text: 'AM' },
            { key: 'D', text: 'HABEN' },
            { key: 'E', text: 'HAT' },
            { key: 'F', text: 'IHR' },
            { key: 'G', text: 'IHRER' },
            { key: 'H', text: 'IST' },
            { key: 'I', text: 'SEINEN' },
            { key: 'K', text: 'SEINER' },
            { key: 'L', text: 'SICH' },
            { key: 'M', text: 'SIND' },
            { key: 'N', text: 'ZWISCHEN' },
            { key: 'O', text: 'UNTER' },
            { key: 'P', text: 'VON' },
          ],
          unusedBankCount: 6,
          examples: choices(0, 'C'),
          items: choices(8, 'P H D O A G I L'),
        },
        {
          id: 'II-3',
          label: '3.',
          instructions:
            'Was passt in den Text? Schreiben Sie den entsprechenden Buchstaben in die Rubrik. Achtung! Es gibt einen Buchstaben zu viel. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'Auf zum Mars!' },
            { text: 'Gernot Grömer lebt in Tirol und ist Astronaut.' },
            { text: 'Lux: Hallo, Herr Grömer! Es heißt, Sie sind ein Astronaut, {{0}}. Was bedeutet das?' },
            {
              text: 'GG: Ich bin Analogastronaut. Das heißt, dass ich nicht selbst in den Weltraum fliege, {{16}}. Zusammen mit meinem Team bereite ich eine Reise zum Mars vor. Das ist die größte und komplizierteste Reise, {{17}}!',
            },
            { text: 'Lux: Was fasziniert* Sie an der Raumfahrt?' },
            {
              text: 'GG: Mich fasziniert der Weltraum mit seinen unendlichen Weiten. Da draußen warten Abenteuer auf uns, an die wir jetzt noch gar nicht denken. Ich liebe es, Grenzen zu erkunden. Und ich liebe es, die neueste Technik zu testen. Im Raumanzug in marsähnlichen Wüsten nach Lebensspuren zu suchen, {{18}}!',
            },
            { text: 'Lux: Wie lange dauert es, {{19}}?' },
            {
              text: 'GG: Ungefähr drei Stunden. Ein Raumanzug ist ja wie ein kleines Raumschiff {{20}}. Wir brauchen einige Technikerinnen und Techniker, die uns helfen, in den Anzug hineinzuklettern.',
            },
            { text: 'Lux: Warum interessieren Sie sich besonders für den Mars?' },
            {
              text: 'GG: Der Mars ist der Planet, {{21}}. Er kann uns helfen, herauszufinden, ob es irgendwo im Universum Leben gibt. Und er ist auch nahe genug. Deswegen ist für mich ganz klar: Auf zum Mars!',
            },
            { style: 'note', text: '*faszinieren: auf jemanden einen tiefen Eindruck machen' },
          ],
          bank: [
            { key: 'A', text: 'dass wir Menschen ihn erreichen können' },
            { key: 'B', text: 'der unserer Erde am ähnlichsten ist' },
            { key: 'C', text: 'der die Erde niemals verlassen wird' },
            { key: 'D', text: 'die Menschen je unternommen haben' },
            { key: 'E', text: 'einen Raumanzug anzuziehen' },
            { key: 'F', text: 'ist ziemlich cool' },
            { key: 'G', text: 'sondern hier auf der Erde die Technik dafür teste' },
            { key: 'H', text: 'und wiegt rund 50 Kilogramm' },
          ],
          unusedBankCount: 1,
          examples: choices(0, 'C'),
          items: choices(16, 'G D F E H B'),
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
        storagePath: 'erettsegi-de-kozep-2022-oktober.mp3',
        durationSec: 1802,
        // Task starts: the ~60 s reading pause of each task found by silence detection, minus the length of its announcement (approximate, ±10 s).
        taskMarkers: [
          { taskId: 'III-1', startSec: 79 },
          { taskId: 'III-2', startSec: 595 },
          { taskId: 'III-3', startSec: 1177 },
        ],
      },
      // útmutató: feladatpont 0–21 → vizsgapont
      conversion: [0, 2, 3, 5, 6, 8, 9, 11, 13, 14, 16, 17, 19, 20, 22, 24, 25, 27, 28, 30, 31, 33],
      transcripts: [
        {
          taskId: 'III-1',
          title: 'Hunde als Bademeister',
          paragraphs: [
            'Butch, ein zwei Jahre alter Golden Retriever, liegt am Strand unter einem Sonnenschirm. Butch ist kein normaler Hund, sondern ein Rettungshund mit einer speziellen Ausrüstung. Besitzerin Sara erklärt:',
            '„Unsere Hunde können aus einem Boot springen, aus fliegenden Helikoptern, eigentlich aus allem. Für uns sind sie eine Hilfe wie ein Motor, der uns unterstützt. Sie können gleichzeitig drei Menschen aus dem Wasser ziehen.”',
            'Schon als ganz kleiner Hund wurde Butch zum Wasserrettungshund ausgebildet. Mit fünf Monaten hat er angefangen, als Rettungshund zu arbeiten. Jetzt übt Butch mit seiner Besitzerin eine Rettung.',
            '„Wir schwimmen zu der Person, die in Gefahr ist. Bei ihr angekommen, geben wir ihr eine Rettungsboje mit Griffen und einem Seil daran, an der sie sich festhalten kann. Wir sprechen mit der Person, beruhigen sie, fragen, ob alles okay ist. Und wenn die Person nicht panisch reagiert und sich beruhigt hat, zieht sie der Hund langsam ans Ufer. Bei unserer Übung hat jetzt Tim mitgemacht. Er ist 17 Jahre alt und kommt aus München. Er musste sich nicht an dem Hund festhalten, sondern an so einer Rettungsboje. Man fühlt sich schon so relativ sicher. Tim sagte auch, dass er wirklich das Gefühl hatte, dass der Hund ihn retten kann.“',
            'Für ihre Arbeit bekommen die Rettungsschwimmer und -schwimmerinnen kein Geld. Sie bezahlen auch Futter, Tierarzt und Ausbildung für die Hunde selbst. Sie machen das mit Leidenschaft, Herz, Liebe und freiwillig.',
            '„Unsere Hundeschule wird ausschließlich durch die Mitglieder finanziert. Für die Arbeit im Wasser sind am besten so genannte „Wasserhunde” geeignet, also Labradore oder Golden Retriever. Aber es gibt auch andere Rassen unter den Rettungshunden. Die Rettungshundeschule „Scuola Italiana Cani Salvataggio” gibt es in ganz Italien, von Sardinien bis Südtirol, an 18 Orten. Der Job als Rettungshund am Meer ist übrigens nicht schädlich für Butch. Im Gegenteil. Es ist ein tolles Training für die Tiere. Aber wir schauen, dass sie es nicht übertreiben und zu lange arbeiten.“',
          ],
        },
        {
          taskId: 'III-2',
          title: 'Türkisches Dorf bastelt Adventskränze',
          paragraphs: [
            'Ayshe, eine Frau mit buntem Kopftuch, steht im Garten. Sie zeigt auf eine Pflanze mit roten runden Früchten dran. „Das sind kleine Auberginen. Wir benutzen sie zum Dekorieren.” Alles, was sie für ihre Adventskränze brauchen, wächst hier im und um das Bergdorf hinter der türkischen Stadt Antalya. Angefangen hat alles vor etwa 20 Jahren. Adnan Aksoy, der sich um das Geschäft kümmert, erzählt:',
            '„Eine deutsche Frau hat vor Jahren jemandem im Dorf gezeigt, wie das mit den Kränzen geht. Sie ist hier vorbeigekommen und hat gesehen, was bei uns alles wächst. Sie hat eine Firma gegründet und dann ging es los. Die Dorfleute, die die Sachen geliefert haben, haben mitgemacht und irgendwann haben wir es übernommen.“',
            'Die Deutsche ist schon lange wieder weg. Das Geschäft mit den Adventskränzen ist geblieben und gewachsen. In ihren Häusern und draußen im Freien basteln die Frauen jedes Jahr viele Kränze. Inzwischen verlassen 600 000 Kränze pro Jahr das kleine Bergdorf mit seinen gerade mal 1600 Einwohnern. In einem Lager reichen die Kisten mit den Kränzen bis fast unter die Decke. Adnan Aksoy ist seit elf Jahren im Geschäft. Diese Saison läuft besonders gut, erzählt er.',
            '„Wir waren anfangs wegen Corona ziemlich besorgt, aber aus Europa haben wir jetzt sogar noch mehr Bestellungen. Unsere Produktion ist um 35 Prozent im Vergleich zum Vorjahr angewachsen. Wir verkaufen richtig viel.“',
            'Für die Frauen im Dorf bedeutet das viel Arbeit, aber auch Einkommen, mit dem sie ziemlich zufrieden sind.',
            'Ayshe hat vorher nicht gearbeitet. Ihr Mann wollte das erst nicht, erinnert sie sich. Sie hat nur die Grundschule abgeschlossen. Durch den Job hat sich einiges für sie verändert: Sie hat mehr Selbstbewusstsein. Durch ihre Arbeit hat die Familie mehr Einkommen und sie muss nicht darauf warten, Geld von ihrem Mann zu bekommen. Sie verdient selbst was!',
            'Allein in Adnan Aksoys Firma arbeiten rund 300 Leute aus dem Dorf. Er ist sehr stolz darauf, was sein kleines Dorf da leistet.',
            '„Wir machen die Kränze mit viel Liebe. Wenn unsere Produkte fertig sind, dann sagen wir Bescheid, dass wir einen Export haben. In Holland und Deutschland sind die größten Blumenbörsen. Da werden unsere Produkte verkauft und von da auf ganz Europa verteilt. Ich habe sogar gehört, dass manche mit dem Flugzeug in die USA gebracht werden, also von Deutschland und Holland aus gehen die Sachen in die ganze Welt.“',
          ],
        },
        {
          taskId: 'III-3',
          title: '100 Jahre Radio',
          paragraphs: [
            'Hallo, wie hört ihr gerade zu? Über die App auf dem Tablet oder Smartphone? Oder über das Internet-Radio? Wahrscheinlich aber einfach über das klassische Radio. Und das hat Geburtstag. Das Radio wird heute 100 Jahre alt. Am 22. Dezember 1920 wurde in Deutschland die erste Radiosendung ausgestrahlt.',
            'Damals vor 100 Jahren wurde das Radioprogramm aber noch nicht aufgezeichnet. Alles, was damals gesendet wurde, ging raus in die Welt und dann war es in diesem Moment auch schon wieder weg. Deshalb gibt es keine Originalaufnahmen der ersten Radiosendung und deshalb weiß man auch nicht, wie lange sie gedauert hat. Sie hat wahrscheinlich so begonnen: „Hallo, hallo, hier Königs Wusterhausen auf Welle 2700.“ Königs Wusterhausen ist eine kleine Stadt in der Nähe von Berlin und dort stand die Hauptfunkstelle, also eine Art Radiosender.',
            'Die erste deutsche Radiosendung war ein Weihnachtskonzert, das sogar „live” gespielt wurde von Postbeamten, die auch Hobbymusiker waren. Damals war die Post nämlich für alles zuständig, was mit Medien und Kommunikation zu tun hatte, so eben auch für das Radio. Und deshalb waren Postbeamte auch die ersten Radio-Moderatoren Deutschlands.',
            'Es gab schon Radionachrichten, aber noch keine großen Radiosender und -büros, wo Journalistinnen und Journalisten arbeiteten. Die Nachrichtensprecher haben einfach die aktuellen Berichte aus der Zeitung vorgelesen. Die ersten Liveberichte gab es dann vom Sport, vor allem vom Fußball. Fernsehen gab es ja in der Zeit noch nicht. Es wurde erst später erfunden. Das heißt, dass das Radio damals wahrscheinlich wahnsinnig wichtig war.',
            'Und das Radio und die Radiotechnik wurden sehr schnell immer besser, so dass man auch mehr Spaß hatte zuzuhören. Man konnte die Reporter dann auch wirklich verstehen. Das Radio ist als Medium unglaublich schnell, und das gilt ja bis heute. Die Zeitung musste damals eben erst gedruckt werden, bis man nachlesen konnte, wie das Länderspiel ausgegangen ist, fürs Radio musste man nur das Empfangsgerät einschalten.',
            'Es gab 1954 auch schon Fernseher, aber einen Fernseher hatte damals kaum jemand, weil die noch viel zu teuer waren.',
            'Heute ist das Radio neben Fernsehen, Internet und Zeitung immer noch total modern. Das zeigt auch eine Zahl: Jeden Tag hören 50 Millionen Menschen in Deutschland Radio.',
          ],
        },
      ],
      tasks: [
        {
          id: 'III-1',
          label: '1.',
          instructions:
            'Sie hören einen Text über Rettungshunde. Lesen Sie zuerst die Aufgabe. Sie hören dann den Text zweimal. Zuerst hören Sie den ganzen Text ohne Pausen, dann in kürzeren Abschnitten. Entscheiden Sie beim Hören, worüber gesprochen wird, und markieren Sie die Aussage mit X. Wenn über etwas nicht gesprochen wird, lassen Sie das Kästchen leer. Insgesamt können Sie 7-mal ankreuzen. (0) ist ein Beispiel für Sie.',
          passage: [{ style: 'title', text: 'Hunde als Bademeister' }, { text: 'Hier wird darüber gesprochen,' }],
          rules: { multiSelectPenalty: true },
          items: [
            {
              id: '1-7',
              type: 'multi-select',
              exampleOption: 'warum Butch kein alltäglicher Hund ist.',
              options: [
                { key: 'a', text: 'wie schnell Hunde schwimmen können.' },
                { key: 'b', text: 'wie Hunde ins Wasser kommen können.' },
                { key: 'c', text: 'wann Butch mit der Rettung angefangen hat.' },
                { key: 'd', text: 'wie viele Leute Butch schon gerettet hat.' },
                { key: 'e', text: 'wie oft Hunde die Rettung üben müssen.' },
                { key: 'f', text: 'wie Rettungsschwimmer und Hund Personen retten.' },
                { key: 'g', text: 'wie Tim die Rettungsübung erlebt hat.' },
                { key: 'h', text: 'wie groß eine Rettungsboje ist.' },
                { key: 'i', text: 'wer die Hundeschule finanziert.' },
                { key: 'j', text: 'welche Hunde keine guten Rettungshunde sind.' },
                { key: 'k', text: 'wo man in Italien Rettungshundeschulen findet.' },
                { key: 'l', text: 'ob der Rettungsjob für die Hunde schädlich ist.' },
              ],
              answer: ['b', 'c', 'f', 'g', 'i', 'k', 'l'],
              pick: 7,
            },
          ],
        },
        {
          id: 'III-2',
          label: '2.',
          instructions:
            'Sie hören einen Text über ein türkisches Dorf, wo man Adventskränze herstellt. Lesen Sie zuerst die Aufgabe. Sie hören dann den Text zweimal. Zuerst hören Sie den ganzen Text ohne Pausen, dann in kürzeren Abschnitten. Entscheiden Sie beim Hören, welche Aussage (A, B oder C) richtig ist. Kreuzen Sie die richtige Lösung an. (0) ist ein Beispiel für Sie.',
          passage: [{ style: 'title', text: 'Türkisches Dorf bastelt Adventskränze' }],
          examples: [
            {
              id: '0',
              type: 'mcq',
              stem: 'Das türkische Dorf ________.',
              options: [
                { key: 'A', text: 'ist berühmt für seine Auberginen-Gerichte' },
                { key: 'B', text: 'kauft Dekorationselemente aus Antalya für die Adventskränze' },
                { key: 'C', text: 'stellt seit 20 Jahren Adventskränze her' },
              ],
              answer: 'C',
            },
          ],
          items: questions(
            8,
            [
              { stem: 'Eine deutsche Frau ________.', options: ['hat die Firma gegründet', 'hat eine türkische Firma übernommen', 'hat im Dorf ein Geschäft gekauft'] },
              { stem: 'Die Firma ________.', options: ['hat 1600 Arbeiter', 'produziert auch andere Dekorationen', 'stellt jährlich 600 000 Adventskränze her'] },
              { stem: 'Neue Bestellungen hat die Firma ________.', options: ['mehr als früher', 'so viele wie früher', 'weniger als früher'] },
              { stem: 'Die Frauen, die bei der Firma arbeiten, ________.', options: ['haben einen leichten Job', 'machen einen speziellen Kurs für den Job', 'sind mit ihrem Geld zufrieden'] },
              { stem: 'Der Leiter der Firma, Adnan Aksoy ________.', options: ['braucht mehr Mitarbeiter aus dem Dorf', 'ist stolz auf sein Dorf', 'sammelt Adventskränze'] },
              { stem: 'Die fertigen Produkte liefert man zuerst ________.', options: ['in amerikanische Geschäfte', 'in deutsche Geschäfte', 'zu den größten Blumenbörsen'] },
            ],
            'A C A C B C',
          ),
        },
        {
          id: 'III-3',
          label: '3.',
          instructions:
            'Sie hören einen Text über 100 Jahre Radio in Deutschland. Lesen Sie zuerst die Aufgabe. Sie hören dann den Text zweimal. Zuerst hören Sie den ganzen Text ohne Pausen, dann in kürzeren Abschnitten. Ergänzen Sie die Sätze beim Hören. Schreiben Sie in jede Lücke nur eine Information. (0) ist ein Beispiel für Sie.',
          passage: [{ style: 'title', text: '100 Jahre Radio' }],
          examples: [
            {
              id: '0',
              type: 'short-text',
              prompt: 'Das klassische Radio in Deutschland hatte 2020 einen runden Geburtstag: Es wurde ________ .',
              answer: { accepted: ['100 Jahre alt'], match: 'exact-ci' },
            },
          ],
          items: [
            {
              id: '14',
              type: 'short-text',
              prompt: 'Man sendete damals die Radioprogramme einfach in die Welt, deshalb haben wir ________ der ersten Radiosendung.',
              answer: { accepted: ['keine Originalaufnahme'], match: 'keywords', keywords: [['original'], ['aufnahme']] },
            },
            {
              id: '15',
              type: 'short-text',
              prompt: 'Die Sendeanlage befand sich in Königs Wusterhausen, das ist ________ .',
              answer: { accepted: ['eine kleine Stadt', 'in der Nähe von Berlin'], match: 'keywords', keywords: [['stadt', 'berlin', 'nähe']] },
            },
            {
              id: '16',
              type: 'short-text',
              prompt: 'Die erste deutsche Live-Radiosendung war ________ .',
              answer: { accepted: ['ein (Weihnachts)konzert'], match: 'keywords', keywords: [['konzert']] },
            },
            {
              id: '17',
              type: 'short-text',
              prompt: 'Die ersten ________ im Radio waren auch Mitarbeiter der Post.',
              answer: { accepted: ['(Radio)moderatoren', 'Musiker'], match: 'keywords', keywords: [['moderator', 'musiker']] },
            },
            {
              id: '18',
              type: 'short-text',
              prompt: 'Die Nachrichten las man damals ________ vor.',
              answer: { accepted: ['aus der Zeitung'], match: 'keywords', keywords: [['zeitung']] },
            },
            {
              id: '19',
              type: 'short-text',
              prompt: 'Das Radio war für die Leute in dieser Zeit sehr ________ .',
              answer: { accepted: ['wichtig'], match: 'keywords', keywords: [['wichtig']] },
            },
            {
              id: '20',
              type: 'short-text',
              prompt: 'Als Medium gilt das Radio auch heute noch als extrem ________ .',
              answer: { accepted: ['schnell'], match: 'keywords', keywords: [['schnell']] },
            },
            {
              id: '21',
              type: 'short-text',
              prompt: '1954 gab es schon ________ , die damals noch ziemlich teuer waren.',
              answer: { accepted: ['Fernseher'], match: 'keywords', keywords: [['fernseh']] },
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
          title: 'Alltagshelfer werden',
          instructions: 'Sie studieren in Deutschland und suchen nach einem Nebenjob. Sie finden folgende Anzeige:',
          passage: [
            { text: 'Du bist auf der Suche nach einem attraktiv bezahlten Nebenjob? Du bist freundlich und hast ein Herz für Senioren? Dann bist Du genau richtig bei Careship! Wir suchen passende Betreuer für Senioren und arbeiten so kontinuierlich an der Verbesserung ihrer Lebensqualität. Aufgaben der Alltagshelfer:' },
            { style: 'bullet', text: 'Unterstützung im Haushalt - wie z. B.: Staubwischen, Staubsaugen, gemeinsam kochen' },
            { style: 'bullet', text: 'Begleitung der Senioren im Alltag z. B Arzt- und Einkaufsbegleitung, spazieren gehen' },
            { text: 'Bewirb Dich jetzt auf unserer Homepage unter dem Punkt „Alltagshelfer werden". Wir freuen uns auf Deine Anmeldung!' },
          ],
          items: [
            {
              id: '1',
              type: 'production',
              prompt: ['Schreiben Sie eine E-Mail an die Organisation Careship. Gehen Sie dabei auf die folgenden Punkte ein:'],
              contentPoints: [
                'Stellen Sie sich kurz vor (z. B. Alter, Herkunft, Sprachkenntnisse).',
                'Welche Aufgabe(n) würden bzw. können Sie gerne übernehmen? Warum?',
                'Informieren Sie sich über die Arbeitszeiten und die Bezahlung.',
              ],
              promptAfter: ['Verwenden Sie für Ihren Text 80-100 Wörter. Die Reihenfolge der Leitpunkte können Sie selbst bestimmen.'],
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
          title: 'Welches ist das wichtigste Schulfach?',
          instructions: 'In einem Internetforum zum Thema Schule haben Sie einen interessanten Beitrag gefunden. Hier sind einige Auszüge daraus:',
          passage: [
            {
              text: 'Viele Schüler finden die verschiedenen Unterrichtsfächer in der Schule nicht gleich wichtig. Haben sie wirklich Recht oder irren sie sich? … Wie seht Ihr das? Welche Fächer „braucht“ man, welche braucht man nicht? Was ist wichtig, beziehungsweise welche Fächer haben für euch weniger Bedeutung?',
            },
          ],
          items: [
            {
              id: '2',
              type: 'production',
              prompt: ['Schreiben Sie Ihre Meinung zum Thema in einem Forumsbeitrag. Gehen Sie dabei auf die folgenden Punkte ein:'],
              contentPoints: [
                'Ist dieses Thema Ihrer Meinung nach aktuell? Warum (nicht)?',
                'Welche Schulfächer halten Sie/Ihre Freunde für „nützlich“ oder „unwichtig“? Warum?',
                'Was ist für Sie jetzt das wichtigste Schulfach und warum?',
                'Welche Fächer/Kenntnisse fehlen Ihnen im Schulunterricht und warum?',
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
