// Német nyelv, középszintű írásbeli érettségi, 2025. május 9. (K2413), Oktatási Hivatal.
// Transcribed verbatim from the feladatlap and its javítási-értékelési útmutató (answer key,
// conversion tables, listening transcripts). Decorative photos are left out.
import type { ExamPaper } from '../types'

const paper: ExamPaper = {
  id: 'erettsegi-de-kozep-2025-majus',
  type: 'erettsegi',
  language: 'de',
  level: 'kozep',
  sittingLabelHu: '2025. május',
  source: 'Oktatási Hivatal: Német nyelv, középszintű írásbeli vizsga, 2025. május 9. (K2413) — feladatlap és javítási-értékelési útmutató.',
  noticesHu: [
    'Az Olvasott szöveg értése, a Nyelvhelyesség és a Hallott szöveg értése feladatlapokhoz semmilyen segédeszköz nem használható. Az Íráskészség részhez bármilyen nyomtatott szótár használható.',
    'Egy füzeten belül a feladatok megoldási sorrendje tetszőleges.',
    'Az egyes feladatokra nem kaphat többet a feltüntetett pontszámnál.',
  ],
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
            'Sie lesen einen Text über Lerntipps. Lesen Sie zuerst die Abschnitte und suchen Sie dann die passende Überschrift. Achtung! Es gibt eine Überschrift zu viel. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'Wie lernt man eigentlich richtig?' },
            { text: 'Es gibt einige hilfreiche Ratschläge und Lernmethoden, mit denen das Lernen einfacher und effektiver geht.' },
            { style: 'heading', text: 'ABSCHNITTE' },
            {
              text: 'Es bringt nichts, am Tag vor einem Test den kompletten Stoff aufzuarbeiten, deshalb teile dir die Zeit ein. Kurz vor der Arbeit solltest du nur noch wiederholen.',
              itemId: '0',
            },
            {
              text: 'Du solltest bequem sitzen und ausreichend Licht sowie Platz haben. Auch Ruhe ist wichtig. Wenn nebenbei Musik oder der Fernseher läuft, können sich die meisten nicht mehr richtig konzentrieren.',
              itemId: '1',
            },
            {
              text: 'Die wichtigsten Punkte zu einem Thema kannst du dir aufschreiben. Den Zettel kannst du dir immer mal wieder durchlesen - auf dem Weg zur Schule zum Beispiel. Ein Spickzettel hilft beim Lernen und gibt dir Sicherheit. Bei der Testarbeit sollte er aber lieber in der Tasche bleiben.',
              itemId: '2',
            },
            {
              text: 'Nach einer Lernzeit von etwa 45 Minuten solltest du dich ein paar Minuten bewegen, eventuell Musik hören oder auch mal etwas essen. Bei längerem Lernen können die Ruhephasen zwischendurch auch größer sein.',
              itemId: '3',
            },
            {
              text: 'Du solltest das Gelernte immer mal wieder kurz durchlesen und auch ältere Wörter ins Gedächtnis rufen - vor allem diejenigen, die dir Schwierigkeiten machen.',
              itemId: '4',
            },
            {
              text: 'Lernen kann manchmal viel besser klappen, wenn du in einer Gruppe bist. Dabei könnt ihr einander abhören, auf Fehler aufmerksam machen und mit eurem Wissen ergänzen - denn jeder hat andere Stärken und Schwächen.',
              itemId: '5',
            },
            {
              text: 'Fange beim Test mit dem an, was du kannst. So startest du mit einem guten Gefühl. Wenn du etwas nicht weißt, dann bekomme nicht gleich Panik. Du hast dich schließlich intensiv vorbereitet und gibst einfach das wieder, was du gelernt hast.',
              itemId: '6',
            },
            {
              text: 'Nach erledigter Arbeit könntest du dich mit deinem Hobby beschäftigen oder dir eine andere kleine Freude machen. Dann hast du auch schon während des Lernens etwas, auf das du dich freuen kannst.',
              itemId: '7',
            },
            {
              text: 'Verstehst du etwas auf den ersten Blick nicht? Dann ärgere dich nicht darüber, denn so verlierst du nur deine Motivation. Viel wichtiger noch: Es bringt dich beim Lernen nicht weiter.',
              itemId: '8',
            },
          ],
          bankTitle: 'ÜBERSCHRIFTEN',
          bank: [
            { key: 'A', text: 'Lege regelmäßige Pausen ein' },
            { key: 'B', text: 'Lerne mit Freunden' },
            { key: 'C', text: 'Fange rechtzeitig mit dem Lernen an' },
            { key: 'D', text: 'Lerne ruhig und geduldig' },
            { key: 'E', text: 'Mach dir beim Test keinen Stress' },
            { key: 'F', text: 'Mach dir Notizen' },
            { key: 'G', text: 'Nütze auch den frühen Morgen' },
            { key: 'H', text: 'Sorge für die richtige Arbeitsumgebung' },
            { key: 'J', text: 'Tue dir etwas Gutes nach dem Lernen' },
            { key: 'K', text: 'Wiederhole das Gelernte' },
          ],
          unusedBankCount: 1,
          examples: [{ id: '0', type: 'choice', answer: 'C' }],
          items: [
            { id: '1', type: 'choice', answer: 'H' },
            { id: '2', type: 'choice', answer: 'F' },
            { id: '3', type: 'choice', answer: 'A' },
            { id: '4', type: 'choice', answer: 'K' },
            { id: '5', type: 'choice', answer: 'B' },
            { id: '6', type: 'choice', answer: 'E' },
            { id: '7', type: 'choice', answer: 'J' },
            { id: '8', type: 'choice', answer: 'D' },
          ],
        },
        {
          id: 'I-2',
          label: '2.',
          instructions:
            'Lesen Sie den Text über Müllsammeln als Sport und entscheiden Sie, welche Aussage richtig (R) und welche falsch (F) ist. Kreuzen Sie die Antwort in der Tabelle an. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'Müllsammeln als Sport' },
            {
              text: 'Finja, 12, tut regelmäßig etwas für die Sauberkeit in ihrem Wohnort Haan bei Düsseldorf. Jetzt vertreten sie und ihr Team Deutschland bei der Spogomi-Weltmeisterschaft in Japan. In dem Begriff Spogomi stecken die Wörter »Sport« und »gomi«, das heißt »Abfall« auf Japanisch.',
            },
            {
              text: 'Finja erzählt: „Seit 2016 treffen wir – also meine Mama, ihre Freundin Charlotte, ich und andere Leute aus der Nachbarschaft – uns regelmäßig zum Müllsammeln in Haan. Wir nennen das »Dreck-weg-Spaziergang«. Das machen wir immer am letzten Mittwoch im Monat. Da geht es für uns in erster Linie nicht um Sport, sondern um Umweltschutz. Wir gehen eine Stunde lang spazieren. Wir haben Säcke und Handschuhe dabei und sammeln ein, was wir an Müll finden: Zigarettenstummel*, Flaschen, Verpackungen. Aber auch kaputte Gartenstühle oder das Innere eines Spielautomaten waren schon mal mit darunter.',
            },
            {
              text: 'Über die Jahre hat sich der Abfall verändert, den man hier so findet. Als ich kleiner war, haben wir bei unseren Touren besonders viele Glasflaschen gefunden, meistens von alkoholischen Getränken. Heutzutage finden wir mehr Verpackungsmüll, besonders von Fast-Food-Produkten. Ich kann nicht verstehen, dass Leute ihren Abfall in die Umwelt werfen. Natürlich sind auch bei uns in Haan öffentliche Abfallbehälter manchmal so voll, dass man den leeren Cola-Becher nicht mehr hineinbekommt.',
            },
            {
              text: 'Als Charlotte irgendwann von dem Spogomi-Wettbewerb erzählte, hielt ich das gleich für eine super Idee. Denn ich wusste: Wenn wir gewinnen, dürfen wir zur WM nach Japan fahren! Eine Reise nach Japan ist schon lange mein Traum.',
            },
            {
              text: 'Der deutsche Spogomi-Vorwettbewerb fand in Düsseldorf statt. Die Regeln waren leicht verständlich: Drei Leute bilden ein Spogomi-Team. Während des Sammelns darf man sich nie mehr als zehn Meter voneinander entfernen. Man hat eine Stunde Zeit, innerhalb eines bestimmten Gebiets Müll zu sammeln. Es gibt verschiedene Mülltüten: eine durchsichtige für Zigarettenstummel, eine mit blauer Schrift für Restmüll, eine mit roter Schrift für Plastik. Die Müllsorten geben unterschiedliche Punkte: 100 Gramm Zigarettenreste = 300 Punkte, 100 Gramm Restmüll = 10 Punkte, 100 Gramm Plastikmüll = 20 Punkte.',
            },
            {
              text: 'Bei diesem Wettbewerb in Düsseldorf sind um die 20 Teams angetreten. Rund um den Hauptbahnhof war das gemeinsame Sammelgebiet. Charlotte, Mama und ich haben uns richtig angestrengt. Nach 45 Minuten hatten wir schon 12 Mülltüten voll, die waren unglaublich schwer. Die restlichen 15 Minuten haben wir nur noch Zigarettenreste gesammelt, damit wir richtig viele Punkte machen.',
            },
            {
              text: 'Unsere Strategie war erfolgreich. Wir haben mit 5382 Punkten für 43,56 Kilogramm Müll gewonnen. Als das Siegerteam bekannt gegeben wurde, hat Mama einen Freudenschrei von sich gegeben. Ich konnte es auch kaum glauben. Jetzt fliegen wir wirklich nach Japan. Ende November findet die Spogomi-Weltmeisterschaft in der Hauptstadt Tokio statt. Es kommen Teams aus 20 Ländern.“',
            },
            { style: 'note', text: '*Zigarettenstummel: Rest einer gerauchten Zigarette' },
          ],
          booleanLabels: ['R', 'F'],
          examples: [{ id: '0', type: 'boolean', statement: '„Spogomi“ ist ein neuer Sport aus Japan.', answer: true }],
          items: [
            { id: '9', type: 'boolean', statement: 'Finja und ihre Schulfreundinnen sammeln jeden Mittwoch Müll in ihrem Wohnort.', answer: false },
            { id: '10', type: 'boolean', statement: 'Beim „Dreck-weg-Spaziergang“ wird jede Art von Müll gesammelt.', answer: true },
            { id: '11', type: 'boolean', statement: 'Die Leute werfen immer noch das Gleiche weg wie früher.', answer: false },
            { id: '12', type: 'boolean', statement: 'In Haan gibt es keine Probleme mit den öffentlichen Abfallbehältern.', answer: false },
            { id: '13', type: 'boolean', statement: 'Die Idee des Spogomi-Wettbewerbs begeisterte Finja sofort.', answer: true },
            { id: '14', type: 'boolean', statement: 'Finja hatte schon lange den Wunsch, einmal nach Japan zu fahren.', answer: true },
            { id: '15', type: 'boolean', statement: 'Die Spogomi-Regeln sind ziemlich kompliziert.', answer: false },
            { id: '16', type: 'boolean', statement: 'Eine Spogomi-Mannschaft soll während des Müllsammelns nah zusammenbleiben.', answer: true },
            { id: '17', type: 'boolean', statement: 'In Düsseldorf mussten die Spogomi-Teams um den Hauptbahnhof herum Müll sammeln.', answer: true },
            { id: '18', type: 'boolean', statement: 'Finjas Team konnte gewinnen, weil sie fleißig waren und einen guten Plan hatten.', answer: true },
          ],
        },
        {
          id: 'I-3',
          label: '3.',
          instructions:
            'Was passt in den Text? Schreiben Sie den entsprechenden Buchstaben in die Rubrik. Achtung! Es gibt einen Buchstaben zu viel. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'Mit einem Bobby-Car zum Autorennen' },
            {
              text: 'Marcel Paul (31) aus Hessen hat gerade einen Weltrekord aufgestellt: 148,45 Kilometer pro Stunde erreichte er mit seinem Elektromotor-Bobby-Car. {{0}} Diese haben viele Kinder im Garten, im Kinderzimmer oder in der Garage stehen. Marcel hat sein Plastikauto stark verändert.',
            },
            {
              text: 'Marcel studiert Elektrotechnik. {{19}} Marcels Vater hat eine Elektrofirma und so baute der Sohn schon als kleines Kind Modelleisenbahnen um. {{20}} Es folgten ein Skateboard, ein Fahrrad und schließlich das erste Bobby-Car.',
            },
            {
              text: 'Im Internet liest er dann, dass es Weltmeisterschaften im Bobby-Car-Rennen gibt und dass die nächste ein paar Monate später gar nicht so weit von seinem Heimatort stattfindet. {{21}} Er wusste: „Solche Rennen will ich auch fahren.”',
            },
            {
              text: 'Inzwischen stehen bei Marcel zu Hause knapp 60 Bobby-Cars. Warum? „Weil es Spaß macht. Ich rase auf einem Spielzeugauto 20 Zentimeter über dem Boden liegend über die Strecke. Und die Technik, die in so einem Fahrzeug steckt! {{22}} Man überlegt sich, wie man es schneller machen kann.” Für seinen jüngsten Weltrekord hat es etwa ein Jahr gedauert, bis der Rennwagen perfekt war.',
            },
            {
              text: 'Ausdenken, Umbauen und Testfahren sind übrigens nicht die einzigen Aufgaben, die sich Marcel stellen. {{23}} „Ich habe mich um Sponsoren gekümmert. Die Firma, bei der ich arbeite, hat mich unterstützt.”',
            },
            {
              text: 'Auch seinen Renn-Anzug hat er vor vielen Jahren geschenkt bekommen. Es ist eine spezielle Lederbekleidung für Motorradfahrer. {{24}}',
            },
            {
              text: 'Das nächste Projekt ist übrigens gerade in Planung. {{25}} Als Rennfahrer hat Marcel schon viele Titel: Er ist mehrfacher Weltmeister, Europameister und deutscher Meister in unterschiedlichen Disziplinen.',
            },
          ],
          bank: [
            { key: 'A', text: 'Bei Unfällen kann sie Marcel schützen.' },
            { key: 'B', text: 'Das Basteln an einem Bobby-Car ist eine echte Herausforderung.' },
            { key: 'C', text: 'Dieses Fahrzeug ist ganz anders aufgebaut als die normalen Spielautos.' },
            { key: 'D', text: 'Das Wissen aus dem Studium, aber auch Erfahrung als Bastler helfen ihm bei seinen Projekten.' },
            { key: 'E', text: 'Er muss auch darüber nachdenken, wie er sein Hobby finanziert.' },
            { key: 'F', text: 'Man muss auf einem Bobby-Car sehr flach liegen.' },
            { key: 'G', text: 'Marcel fuhr hin und hat ganz viele Fotos gemacht.' },
            { key: 'H', text: 'Marcel will gemeinsam mit anderen Fahrern ein 24-Stunden-Rennen veranstalten.' },
            { key: 'I', text: 'Später war es dann gemeinsam mit Freunden ein Dreirad vom Müll.' },
          ],
          unusedBankCount: 1,
          examples: [{ id: '0', type: 'choice', answer: 'C' }],
          items: [
            { id: '19', type: 'choice', answer: 'D' },
            { id: '20', type: 'choice', answer: 'I' },
            { id: '21', type: 'choice', answer: 'G' },
            { id: '22', type: 'choice', answer: 'B' },
            { id: '23', type: 'choice', answer: 'E' },
            { id: '24', type: 'choice', answer: 'A' },
            { id: '25', type: 'choice', answer: 'H' },
          ],
        },
      ],
    },
    {
      id: 'II',
      kind: 'language-use',
      titleHu: 'II. Nyelvhelyesség',
      timeLimitMin: 30,
      // útmutató p. 6: feladatpont 0–21 → vizsgapont
      conversion: [0, 1, 2, 3, 3, 4, 5, 6, 7, 8, 9, 9, 10, 11, 12, 13, 14, 15, 15, 16, 17, 18],
      tasks: [
        {
          id: 'II-1',
          label: '1.',
          instructions:
            'Was passt in den Text? Schreiben Sie den entsprechenden Buchstaben in die Rubrik. Achtung! Es gibt sechs Buchstaben zu viel. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'Fünf Tipps für weniger Handy-Zeit' },
            {
              text: '„Nur mal kurz gucken“ – und zack, schnell ist eine Stunde vorbei! Das liegt daran, {{0}} soziale Medien süchtig machen können: Wenn wir {{1}} neue, interessante Inhalte anschauen, wollen wir immer mehr davon. Zum Glück gibt es aber Tricks, {{2}} weniger Zeit am Handy zu verbringen.',
            },
            {
              text: '1. Ihr müsst gerade Hausaufgaben erledigen {{3}} euer Zimmer aufräumen? Dabei könnt ihr das Handy bewusst weit weglegen – zum Beispiel in ein anderes Zimmer. So schaut ihr nicht ständig auf das Handy.',
            },
            {
              text: '2. Legt euch selbst ein paar Pausen fest, also handyfreie Zeit. Das gilt auch für unterwegs, zum Beispiel im Bus: Nehmt euch eine Zeitschrift mit oder schaut einfach nur {{4}} dem Fenster.',
            },
            { text: '3. Wenn ihr {{5}} Handy auf Schwarz-Weiß stellt, sieht alles viel langweiliger aus.' },
            {
              text: '4. Jeder kennt‘s: Das Handy gibt einen Laut von sich und sofort schaut man drauf – auch wenn‘s gar nicht so wichtig war. Trotzdem {{6}} unsere Aufmerksamkeit gestört – egal, ob bei den Hausaufgaben oder im Gespräch mit einer Freundin. Stellt deshalb so viele Benachrichtigungen {{7}} möglich ab oder stumm.',
            },
            {
              text: '5. Okay, dieser Tipp klingt nach Großeltern: Holt euch {{8}} analogen Wecker, so greift ihr morgens nicht sofort zum Handy.',
            },
          ],
          bank: [
            { key: 'A', text: 'AUS' },
            { key: 'B', text: 'BEI' },
            { key: 'C', text: 'DASS' },
            { key: 'D', text: 'DEN' },
            { key: 'E', text: 'EINEN' },
            { key: 'F', text: 'EUCH' },
            { key: 'G', text: 'EUER' },
            { key: 'H', text: 'KEIN' },
            { key: 'I', text: 'NACH' },
            { key: 'K', text: 'ODER' },
            { key: 'L', text: 'UM' },
            { key: 'M', text: 'UNS' },
            { key: 'N', text: 'UNSER' },
            { key: 'O', text: 'WIE' },
            { key: 'P', text: 'WIRD' },
          ],
          unusedBankCount: 6,
          examples: [{ id: '0', type: 'choice', answer: 'C' }],
          items: [
            { id: '1', type: 'choice', answer: 'M' },
            { id: '2', type: 'choice', answer: 'L' },
            { id: '3', type: 'choice', answer: 'K' },
            { id: '4', type: 'choice', answer: 'A' },
            { id: '5', type: 'choice', answer: 'G' },
            { id: '6', type: 'choice', answer: 'P' },
            { id: '7', type: 'choice', answer: 'O' },
            { id: '8', type: 'choice', answer: 'E' },
          ],
        },
        {
          id: 'II-2',
          label: '2.',
          instructions:
            'Ergänzen Sie den Text. Schreiben Sie die angegebenen Wörter in der richtigen Form in den Text. Achtung! Schreiben Sie in jede Lücke nur ein Wort. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: '{{0}}-einem-Freund-eine-Karte-Tag' },
            {
              text: 'Der Schick-einem-Freund-eine-Karte-Tag wird immer am 07. Februar {{9}}. An diesem Tag soll man einem Freund eine Karte schicken, um in Kontakt zu {{10}}. Der Tag wurde von einem Grußkartenhersteller {{11}}. Ob es sich um eine gekaufte oder selbst gebastelte Karte handelt, spielt keine Rolle – der Gedanke zählt. Vor allem macht es Sinn, wenn wir an diesem Tag eine Karte an einen Freund schicken, mit dem wir schon längere Zeit keinen Kontakt mehr {{12}}. Aber auch nahestehende Freunde werden sich sicher über eine Überraschung im Briefkasten {{13}}. Endlich mal keine Werbung oder Rechnungen!',
            },
            {
              text: 'Am Schick-einem-Freund-eine-Karte-Tag {{14}} man übrigens auch mehrere Karten an mehrere Freunde verschicken – oder an jene Menschen, die noch zu Freunden werden sollen.',
            },
          ],
          examples: [
            { id: '0', type: 'short-text', baseWord: 'schicken', answer: { accepted: ['Schick'], match: 'exact' } },
          ],
          // D2: case-sensitive — the útmutató does not accept misspelled words.
          items: [
            { id: '9', type: 'short-text', baseWord: 'feiern', answer: { accepted: ['gefeiert'], match: 'exact' } },
            { id: '10', type: 'short-text', baseWord: 'bleiben', answer: { accepted: ['bleiben'], match: 'exact' } },
            { id: '11', type: 'short-text', baseWord: 'erfinden', answer: { accepted: ['erfunden'], match: 'exact' } },
            { id: '12', type: 'short-text', baseWord: 'haben', answer: { accepted: ['haben', 'hatten'], match: 'exact' } },
            { id: '13', type: 'short-text', baseWord: 'freuen', answer: { accepted: ['freuen'], match: 'exact' } },
            { id: '14', type: 'short-text', baseWord: 'können', answer: { accepted: ['kann', 'könnte'], match: 'exact' } },
          ],
        },
        {
          id: 'II-3',
          label: '3.',
          instructions:
            'Was passt in den Text? Schreiben Sie den entsprechenden Buchstaben in die Rubrik. Achtung! Es gibt einen Buchstaben zu viel. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'Spaß oder Geld? – Was ist für dich wichtig bei der Berufswahl?' },
            {
              text: '„Wie viel verdiene ich in welchem Job?”, fragen sich fast alle, die sich mit der Berufswahl beschäftigen. Wer viel Zeit in eine Lehre oder ein Studium investiert, {{0}}, wie man hinterher davon profitiert. Könntest du dir vorstellen, {{15}}, nur weil du dort ganz viel verdienst?',
            },
            {
              text: 'Ist das Gehalt wirklich so entscheidend? Wie wäre ein Beruf für dich, bei dem du ganz viel verdienst, {{16}}? Oder noch schlimmer: In deiner Firma herrscht eine schlechte Stimmung, die Mitarbeiter sind nicht nett zueinander und sehen sich als Konkurrenten. Du fühlst dich dort total unwohl. Da kann man auch die Freizeit und den Urlaub nicht mehr richtig genießen.',
            },
            {
              text: 'Vielleicht kennst du auch Menschen, {{17}}: Eine Steuerberaterin wurde plötzlich Landwirtin. Oder ein Informatiker hat ein eigenes Café eröffnet. Und das nicht, weil sie zu wenig verdient haben, {{18}}. Dafür waren sie sogar bereit, {{19}}. Oft wechseln Menschen auch ihren Beruf, weil sie eine kreativere Aufgabe suchen.',
            },
            {
              text: 'Eines vergessen viele: Wer ständig nur ans Geld denkt, der kommt nicht immer voran. Ob du einmal richtig viel verdienst, {{20}}. Es gibt Menschen, die eine große Karriere machen. Sie verdienen viel Geld, weil sie fleißig sind und eine gute Idee hatten, {{21}}. Das Berufsleben ist manchmal unberechenbar. Doch eines ist sicher: Oft sind gerade jene Menschen erfolgreich, die total von ihrer Arbeit überzeugt sind und Freude daran haben.',
            },
          ],
          bank: [
            { key: 'A', text: 'aber überhaupt keine Freude an deiner Aufgabe hast' },
            { key: 'B', text: 'dich für einen bestimmten Beruf zu entscheiden' },
            { key: 'C', text: 'die ihren Job gewechselt haben' },
            { key: 'D', text: 'die sie teuer verkaufen' },
            { key: 'E', text: 'ist am Ende auch ein bisschen Glückssache' },
            { key: 'F', text: 'mit weniger Geld auszukommen' },
            { key: 'G', text: 'möchte auch wissen' },
            { key: 'H', text: 'sondern weil ihnen die alte Arbeit keine Freude gemacht hat' },
            { key: 'I', text: 'wie wichtig ein Beruf ist' },
          ],
          unusedBankCount: 1,
          examples: [{ id: '0', type: 'choice', answer: 'G' }],
          items: [
            { id: '15', type: 'choice', answer: 'B' },
            { id: '16', type: 'choice', answer: 'A' },
            { id: '17', type: 'choice', answer: 'C' },
            { id: '18', type: 'choice', answer: 'H' },
            { id: '19', type: 'choice', answer: 'F' },
            { id: '20', type: 'choice', answer: 'E' },
            { id: '21', type: 'choice', answer: 'D' },
          ],
        },
      ],
    },
    {
      id: 'III',
      kind: 'listening',
      titleHu: 'III. Hallott szöveg értése',
      timeLimitMin: 30,
      intro: [
        'Guten Tag! Jetzt beginnt die Prüfung zum Hörverstehen.',
        'Die Prüfung besteht aus drei Aufgaben. Sie werden drei Hörtexte hören. Die Aufgaben dazu sind in diesem Heft.',
        '• Jede Aufgabe beginnt und endet mit Musik. Dann hören Sie die Aufgabenstellung.',
        '• Später haben Sie eine Minute Zeit, die Aufgabe zu lesen.',
        '• Danach hören Sie den Text das erste Mal, ohne Pausen.',
        '• Dann haben Sie circa eine Minute Zeit.',
        '• Sie hören dann den Text das zweite Mal, in kürzeren Abschnitten.',
        '• Zuletzt haben Sie noch einmal Zeit, Ihre Lösung zu kontrollieren.',
        'Die Prüfung dauert 30 Minuten. Viel Glück!',
      ],
      audio: {
        storagePath: 'erettsegi-de-kozep-2025-majus.mp3',
        durationSec: 1800,
        // Each task opens with a short announcement and a music sting (found by a loudness
        // scan of the re-encoded file; the ~60 s pauses are the reading/answer minutes).
        taskMarkers: [
          { taskId: 'III-1', startSec: 72 },
          { taskId: 'III-2', startSec: 633 },
          { taskId: 'III-3', startSec: 1141 },
        ],
      },
      // útmutató p. 9: feladatpont 0–20 → vizsgapont
      conversion: [0, 2, 3, 5, 7, 8, 10, 12, 13, 15, 17, 18, 20, 21, 23, 25, 26, 28, 30, 31, 33],
      transcripts: [
        {
          taskId: 'III-1',
          title: 'Berufswunsch Lokführer?',
          paragraphs: [
            'Kein Zug kann ohne Lokführerin oder Lokführer fahren. Immer muss jemand vorn im Führerstand sitzen und den Zug über die Gleise steuern. Aber von diesen Leuten gibt es nicht mehr genug. Seit Jahren haben alle Bahnunternehmen Probleme mit dem Personal. Sehr viele Lokführer gehen jetzt in Rente, sie hören also auf zu arbeiten. Gleichzeitig machen weniger Leute eine Ausbildung zum Lokführer oder zur Lokführerin.',
            'Früher war Lokführer vor allem für Jungs ein Traumberuf. Einen Zug fahren, viel unterwegs sein, irgendwie etwas Besonderes sein. Das fanden viele toll. Heute ist das anders. Und das sind die Gründe:',
            'Die Leute auf der Lok tragen viel mehr Verantwortung als früher. Außer ihnen arbeiten kaum noch Kollegen im Zug und wenn mal etwas passiert, dann sind die Lokführer nahezu allein für bis zu 800 Fahrgäste verantwortlich. Das ist auf Dauer anstrengend.',
            'Gleichzeitig ist der Arbeitstag auf der Lok auch irgendwie langweiliger geworden. In vielen Zügen sitzen die Lokführer vor einem Bildschirm und bedienen ein paar Knöpfe. Das ist gar nicht mehr so viel anders als im Büro. Früher wollten viele aber gerade deshalb auf der Lok arbeiten, weil es eben nicht war wie im Büro.',
            'Und wohl der wichtigste Grund, warum weniger Leute als früher Lokführerin oder Lokführer werden wollen: In diesem Beruf arbeitet man immer zu unterschiedlichen Zeiten. Manchmal fängt man morgens um 4.37 Uhr seinen Dienst an, manchmal erst um 10 Uhr am Abend. Wann genau, das erfährt man oft erst ein paar Tage vorher. Und weil wir auch am Wochenende mit dem Zug fahren wollen, muss natürlich auch dann jemand auf der Lok arbeiten. Mit diesen Arbeitszeiten ist es schwierig, Freunde zu treffen, mit der Familie etwas zu unternehmen oder regelmäßig zum Sport zu gehen. Hinzu kommt, dass die Lokführer bei der Arbeit im Führerstand auf der Lok viel allein sind. Das zusammen ist für viele Grund genug, sich einen anderen Job zu suchen.',
            'Klar ist aktuell, es werden mehr Leute gebraucht, die eine Lokführerausbildung machen, damit die, die jetzt schon da sind, öfter frei haben können. Deshalb machen Bahnunternehmen jetzt viel mehr Werbung dafür, wie toll die Ausbildung als Lokführerin oder Lokführer ist. Nämlich, dass man viel durch die Gegend reist, gut verdienen kann und viele tolle Sonnenaufgänge sieht.',
          ],
        },
        {
          taskId: 'III-2',
          title: 'Bergamotte',
          paragraphs: [
            'Zitrusfrüchte, also Zitronen, Orangen oder Mandarinen, kennt wohl jeder. Sie sind für viele wunderbar erfrischend und erinnern uns in der kalten Jahreszeit an den Sommer. Etwas weniger bekannt, aber in Geschmack und Duft genauso stark, ist die Bergamotte.',
            'Ungefähr so groß wie eine Orange ist sie - grün oder gelb, oft leicht birnenförmig. Die Bergamotte ist eine Schwester von Orange und Zitrone. Bekannt ist sie z. B. als charakteristischer Aromastoff in der Teesorte „Earl Grey“. Auch Konfitüre kann man damit machen und Bonbons aromatisieren. Der größte Anteil der Produktion geht jedoch in die Parfümindustrie. Das Öl der Bergamotte verwendet man in Parfüms, in Deodorants, in Seifen und Zahnpasten.',
            'Man hat die Frucht erstmals Mitte des 17. Jahrhunderts beschrieben. Citrus bergamia lautet ihr botanischer Name. Vermutlich ist sie eine Kreuzung aus der süßen Limette und der Bitter-Orange. Ihr Name stammt von der italienischen Bezeichnung Bergamotta für eine Birnensorte, die man aus der Türkei importierte. Gegen Ende des 17. Jahrhunderts sprang dieser Name wohl wegen des ähnlichen Aussehens auf die Zitrusfrucht über.',
            'Vier Meter hoch wird der Bergamotte-Baum. Seine Blüten sind weiß. Zu sehen und zu riechen sind die Pflanzen vor allem in Italien, in Kalabrien. Dort, an einem etwa 100 km langen Küstenstreifen, ist das Klima für den Anbau ideal. Heiße, lange Sommer, verhältnismäßig viel Regen im Frühjahr und milde Winter. Reif sind die Früchte zwischen November und März. Dann werden sie gelegentlich auch nördlich der Alpen auf dem Früchte- und Gemüsemarkt angeboten. Daran zu riechen ist … mhm … einfach unbeschreiblich! Sie sollten es einmal probieren!',
          ],
        },
        {
          taskId: 'III-3',
          title: 'Black Friday und Kauf-nix-Tag',
          paragraphs: [
            'Black Friday. An diesem Tag scheint alles billiger zu sein als sonst. Händler wollen ihre Kundinnen und Kunden mit Super-Preisen dazu bringen, möglichst viele Sachen zu kaufen. Handys, Klamotten, Spielsachen, Computer, einfach alles.',
            'Der so genannte Black Friday ist in jedem Jahr am vierten Freitag im November und heißt übersetzt Schwarzer Freitag. Aber warum heißt der Tag eigentlich so? Ganz genau weiß man nicht, woher der Name kommt. Die Idee zum Black Friday kommt aus den USA. Zum ersten Mal wurde der Begriff Black Friday wohl schon 1966 in einer Zeitung bekannt gemacht.',
            'In den USA feiern die Menschen immer am 4. Donnerstag im November ein großes Fest: Thanksgiving. An diesem Tag treffen sich viele Familien und der Tag danach ist oft arbeitsfrei, sodass die Leute Zeit haben, shoppen zu gehen. So entstand am Tag nach Thanksgiving der Black Friday. Seit einiger Zeit gibt es den auch in vielen anderen Ländern, wie zum Beispiel auch in Deutschland. An dem Tag werben viele Geschäfte und Shops im Internet mit Rabatten, also günstigeren Preisen als sonst. Oft geht das auch schon in der Woche vor dem Black Friday oder noch früher los. Viele Sachen scheinen billiger zu sein als normalerweise. Leute, die nicht so viel Geld haben, können sich so manche Dinge endlich leisten. Und viele Händler sagen, dass sie an den Tagen um den Black Friday viel Geld verdienen können.',
            'Aber man sollte ein paar Dinge wissen. Am Black Friday ist nicht alles so günstig, wie es scheint. Das sagen auch Fachleute. Manche Läden und Online-Shops machen Dinge nämlich vor diesem Tag unauffällig teurer. Am Black Friday selbst werden die Preise dann wieder niedriger. Wenn man nicht aufpasst, dann kauft man Dinge, die man gar nicht braucht, nur weil sie billiger sind. Außerdem können die Angebote dafür sorgen, dass wir immer mehr Dinge immer billiger haben wollen. Das ist nicht fair für die Leute, die die Dinge herstellen. Und es kann auch schlecht fürs Klima und die Umwelt sein, wenn zu viele Dinge produziert werden. Es ist also nützlich, zu planen, eine Einkaufsliste zu machen und sich dann daran zu halten. Übrigens, man muss beim Black Friday nicht mitmachen. Und wie geht es weiter? Lustigerweise mit dem Kauf-nix-Tag. Der ist einen Tag nach Black Friday. Kritiker von Black Friday rufen dann dazu auf, 24 Stunden lang nichts zu kaufen. Die Menschen sollten lieber darüber nachdenken, wie und was sie kaufen und ob das so Sinn macht. Mit dem Kauf-nix-Tag möchte man auch darauf aufmerksam machen.',
          ],
        },
      ],
      tasks: [
        {
          id: 'III-1',
          label: '1.',
          instructions:
            'Sie hören einen Text über den Beruf Lokführer. Lesen Sie zuerst die Aufgabe. Sie hören dann den Text zweimal. Zuerst hören Sie den ganzen Text ohne Pausen, dann in kürzeren Abschnitten. Entscheiden Sie, welche Aussage richtig (R) oder falsch (F) ist. Kreuzen Sie die Antwort beim Hören an. (0) ist ein Beispiel für Sie.',
          passage: [{ style: 'title', text: 'Berufswunsch Lokführer?' }],
          booleanLabels: ['R', 'F'],
          examples: [
            { id: '0', type: 'boolean', statement: 'In Deutschland gibt es heute nicht mehr genug Lokführer.', answer: true },
          ],
          items: [
            { id: '1', type: 'boolean', statement: 'Lokführer war früher für viele ein Traumberuf.', answer: true },
            { id: '2', type: 'boolean', statement: 'Lokführer haben in unseren Tagen weniger Verantwortung.', answer: false },
            { id: '3', type: 'boolean', statement: 'Für Lokführer ist immer noch jeder Arbeitstag interessant.', answer: false },
            { id: '4', type: 'boolean', statement: 'Einen Zug zu fahren ist jetzt ganz ähnlich wie Büroarbeit.', answer: true },
            { id: '5', type: 'boolean', statement: 'Die Arbeitszeit der Lokführer fängt immer gleich früh an.', answer: false },
            { id: '6', type: 'boolean', statement: 'Die Leute auf der Lok arbeiten viel allein.', answer: true },
            { id: '7', type: 'boolean', statement: 'Es gibt viel Werbung, damit mehr Leute eine Lokführer-Ausbildung machen.', answer: true },
          ],
        },
        {
          id: 'III-2',
          label: '2.',
          instructions:
            'Sie hören einen Text über eine weniger bekannte Frucht. Lesen Sie zuerst die Aufgabe. Zuerst hören Sie den ganzen Text ohne Pausen, dann in kürzeren Abschnitten. Entscheiden Sie, was in den Aussagen falsch ist. Unterstreichen Sie beim Hören diese falschen Informationen in der linken Spalte. Die falschen Informationen können sowohl einzelne Wörter als auch Satzteile sein. Korrigieren Sie die falschen Informationen und schreiben Sie Ihre Lösung in die rechte Spalte. (01) und (02) sind Beispiele für Sie.',
          passage: [{ style: 'title', text: 'Bergamotte' }],
          examples: [
            {
              id: '01',
              type: 'correction',
              statement: 'Bergamotten schmecken und duften weniger intensiv als andere Zitrusfrüchte.',
              answer: { accepted: ['genauso intensiv / stark wie'], match: 'exact-ci' },
            },
            {
              id: '02',
              type: 'correction',
              statement: 'Bergamotten haben die Form von Äpfeln.',
              answer: { accepted: ['Birnen'], match: 'exact-ci' },
            },
          ],
          // Graded on the key word, so "die Mitte" or "im März" count too.
          items: [
            {
              id: '8',
              type: 'correction',
              statement: 'Die Bergamotte ist als charakteristischer Farbstoff bekannt.',
              answer: { accepted: ['Aromastoff'], match: 'keywords', keywords: [['aromastoff']] },
            },
            {
              id: '9',
              type: 'correction',
              statement: 'Man kennt die Frucht seit Ende des 17. Jahrhunderts.',
              answer: { accepted: ['Mitte'], match: 'keywords', keywords: [['mitte']] },
            },
            {
              id: '10',
              type: 'correction',
              statement: 'Der Name der Frucht bezeichnete ursprünglich eine Stadt.',
              answer: { accepted: ['Birne', 'Birnensorte'], match: 'keywords', keywords: [['birne']] },
            },
            {
              id: '11',
              type: 'correction',
              statement: 'Die Blüten des Bergamotte-Baums sind gelb.',
              answer: { accepted: ['weiß'], match: 'keywords', keywords: [['weiß', 'weiss']] },
            },
            {
              id: '12',
              type: 'correction',
              statement: 'Die Bergamotte braucht viel Sonne im Frühjahr.',
              answer: { accepted: ['Regen'], match: 'keywords', keywords: [['regen']] },
            },
            {
              id: '13',
              type: 'correction',
              statement: 'Die Bergamotte wird zwischen November und Dezember reif.',
              answer: { accepted: ['März'], match: 'keywords', keywords: [['märz', 'maerz']] },
            },
          ],
        },
        {
          id: 'III-3',
          label: '3.',
          instructions:
            'Sie hören einen Radiobeitrag über den Black Friday. Lesen Sie zuerst die Aufgabe. Sie hören dann den Text zweimal. Zuerst hören Sie den ganzen Text ohne Pausen, dann in kürzeren Abschnitten. Entscheiden Sie beim Hören, worüber gesprochen wird, und markieren Sie die Aussage mit X. Wenn über etwas nicht gesprochen wird, lassen Sie das Kästchen leer. Insgesamt können Sie 7-mal ankreuzen. (0) ist ein Beispiel für Sie.',
          passage: [
            { style: 'title', text: 'Black Friday und Kauf-nix-Tag' },
            { text: 'Hier wird darüber gesprochen,' },
          ],
          rules: { multiSelectPenalty: true },
          items: [
            {
              id: '14-20',
              type: 'multi-select',
              exampleOption: 'an welchem Tag der Black Friday stattfindet.',
              options: [
                { key: 'a', text: 'wann der Name Black Friday zuerst verwendet wurde.' },
                { key: 'b', text: 'warum die Leute um diese Zeit gern shoppen gehen.' },
                { key: 'c', text: 'welche Produkte die Leute am wenigsten kaufen.' },
                { key: 'd', text: 'wie man am günstigsten einkaufen kann.' },
                { key: 'e', text: 'wann die Geschäfte beginnen die Waren billiger zu verkaufen.' },
                { key: 'f', text: 'was die Händler über den Black Friday sagen.' },
                { key: 'g', text: 'welche Online-Shops die beliebtesten sind.' },
                { key: 'h', text: 'warum man beim Kauf aufpassen muss.' },
                { key: 'i', text: 'wie man unnötige Black-Friday-Käufe vermeiden kann.' },
                { key: 'j', text: 'in welchem Land der Kauf-nix-Tag stattfindet.' },
                { key: 'k', text: 'worauf der Kauf-nix-Tag aufmerksam macht.' },
              ],
              answer: ['a', 'b', 'e', 'f', 'h', 'i', 'k'],
              pick: 7,
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
      intro: [
        'Ehhez a feladatlaphoz bármilyen egynyelvű vagy kétnyelvű nyomtatott szótár használható.',
        'A két feladat megoldási sorrendje tetszőleges.',
      ],
      tasks: [
        {
          id: 'IV-1',
          label: '1.',
          title: 'Sommerjob im Kletterwald',
          instructions: 'Sie suchen nach einem Schülerjob im Sommer. Im Internet haben Sie die folgende Anzeige gefunden.',
          passage: [
            { style: 'title', text: 'Erlebniswald Mainau' },
            {
              text: 'Wir suchen für unseren Mainau-Erlebniswald Saisonkräfte (Schüler/Auszubildende ab 16 Jahre), die Lust auf eine sportliche, verantwortungsvolle und abwechslungsreiche Aufgabe mit Menschen an der frischen Luft haben.',
            },
            { style: 'bullet', text: 'Kletterst du gern? Bist du kommunikativ, zuverlässig und freundlich?' },
            { style: 'bullet', text: 'Hättest du Lust, Besuchergruppen zu betreuen?' },
            { style: 'bullet', text: 'Damit du sicher in deinem neuen Job starten kannst, bieten wir dir die Ausbildung zum Helfer an.' },
            { text: 'Deine Chance für die kommenden Jahre als Nebenjob!' },
            { text: 'Weitere Infos und Anmeldung: office@erlebniswald-mainau.de' },
          ],
          items: [
            {
              id: '1',
              type: 'production',
              prompt: [
                'Schreiben Sie eine E-Mail an die Organisatoren und informieren Sie sich über den Sommerjob. Gehen Sie dabei auf die folgenden Punkte ein:',
              ],
              contentPoints: [
                'Nennen Sie den Grund Ihres Schreibens und stellen Sie sich vor (z. B. Alter, Sprachkenntnisse, Erfahrungen).',
                'Fragen Sie nach den Arbeitsbedingungen (z. B. Bezahlung, Arbeitszeiten).',
                'Informieren Sie sich über die Helferausbildung (z. B. Dauer, Prüfung).',
              ],
              promptAfter: ['Die Reihenfolge der Leitpunkte können Sie selbst bestimmen. Verwenden Sie für Ihren Text 80-100 Wörter.'],
              minWords: 80,
              maxWords: 100,
              opening: 'Sehr geehrte Damen und Herren,',
              register: 'formal-email',
              rubricId: 'erettsegi-kozep-1',
              criteria: [
                { labelHu: 'Tartalom', points: 4 },
                { labelHu: 'Szövegalkotás, hangnem, az olvasóban keltett benyomás', points: 4 },
                { labelHu: 'Szókincs, kifejezésmód', points: 4 },
                { labelHu: 'Nyelvtan, helyesírás', points: 4 },
              ],
            },
          ],
        },
        {
          id: 'IV-2',
          label: '2.',
          title: 'Lesenacht in der Schule',
          instructions:
            'Im Internet haben Sie einen Beitrag über ein schulisches Freizeitprogramm gefunden. Hier lesen Sie Auszüge aus dem Beitrag:',
          passage: [
            {
              text: '„Ich finde, eine Lesenacht ist ein fantastisches Erlebnis während der Schulzeit. Endlich mal nicht nur im Klassenraum sitzen und lernen. Das Schulgebäude bei Nacht zu erleben ist toll! […] Bei unserer Lesenacht haben mehrere Klassen gemeinsam die Nacht in der Schule verbracht. Das gemeinsame Thema war „Fantasybücher“. Jeder hat sein Buch mitgebracht und es den anderen vorgestellt. Einige haben dann auch etwas vorgelesen. Die Zuhörer haben es sich dabei in Schlafsäcken bequem gemacht.“',
            },
          ],
          items: [
            {
              id: '2',
              type: 'production',
              prompt: ['Schreiben Sie in einem Beitrag Ihre Meinung zum Thema. Gehen Sie in Ihrem Text auf die folgenden Punkte ein:'],
              contentPoints: [
                'Wie finden Sie das Programm „Lesenacht“? Begründen Sie Ihre Meinung.',
                'Welches Buch würden Sie gerne in einer „Lesenacht“ weiterempfehlen? Warum?',
                'Wann haben Sie im Allgemeinen Zeit oder Lust zum Lesen?',
                'Welche Nachtprogramme in der Schule würden Ihnen Spaß machen? Warum?',
              ],
              promptAfter: ['Die Reihenfolge der Leitpunkte können Sie selbst bestimmen. Verwenden Sie für Ihren Text 100-120 Wörter.'],
              minWords: 100,
              maxWords: 120,
              opening: 'Hallo Leute,',
              register: 'forum-post',
              rubricId: 'erettsegi-kozep-2',
              criteria: [
                { labelHu: 'Tartalom', points: 5 },
                { labelHu: 'Szövegalkotás, hangnem, az olvasóban keltett benyomás', points: 4 },
                { labelHu: 'Szókincs, kifejezésmód', points: 4 },
                { labelHu: 'Nyelvtan, helyesírás', points: 4 },
              ],
            },
          ],
        },
      ],
    },
  ],
}

export default paper
