import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { categoryDe, featureDe, scenarioDe, subcategoryDe } from '../data/germanTitles'

/** Hungarian is the base language; English and German are selectable. */
export type Lang = 'hu' | 'en' | 'de'

export const LANGUAGES: { value: Lang; label: string; name: string }[] = [
  { value: 'hu', label: 'HU', name: 'Magyar' },
  { value: 'en', label: 'EN', name: 'English' },
  { value: 'de', label: 'DE', name: 'Deutsch' },
]

const STORAGE_KEY = 'ai-english:ui-lang'

const messages = {
  backHome: { hu: '← Vissza a főoldalra', en: '← Back to home', de: '← Zurück zur Startseite' },
  breadcrumbLabel: { hu: 'Navigációs útvonal', en: 'Breadcrumb', de: 'Navigationspfad' },
  signIn: { hu: 'Bejelentkezés', en: 'Sign in', de: 'Anmelden' },
  signOut: { hu: 'Kijelentkezés', en: 'Sign out', de: 'Abmelden' },
  voiceSettings: { hu: 'Hangbeállítások', en: 'Voice settings', de: 'Stimmeinstellungen' },
  // The page itself is Hungarian-only (src/data/myProgressCopy.ts); this is just its header link.
  myProgress: { hu: 'Az én fejlődésem', en: 'My progress', de: 'Mein Fortschritt' },
  connectTeacher: { hu: 'Kapcsolódás tanárhoz', en: 'Connect to teacher', de: 'Mit Lehrer verbinden' },
  teacherDashboard: { hu: 'Tanári felület', en: 'Teacher Dashboard', de: 'Lehrer-Übersicht' },
  admin: { hu: 'Admin', en: 'Admin', de: 'Admin' },
  language: { hu: 'Nyelv', en: 'Language', de: 'Sprache' },
  loading: { hu: 'Betöltés…', en: 'Loading…', de: 'Wird geladen…' },

  landingKicker: { hu: 'Gyakorlás', en: 'Practice', de: 'Üben' },
  landingHeading: {
    hu: 'Válaszd ki, hogyan szeretnél ma gyakorolni',
    en: "Choose how you'd like to practice today",
    de: 'Wähle, wie du heute üben möchtest',
  },

  crumbConversational: { hu: 'Társalgási angol', en: 'Conversational English', de: 'Konversationsenglisch' },
  crumbPronunciation: { hu: 'Kiejtés', en: 'Pronunciation', de: 'Aussprache' },
  // The three Pronunciation sessions keep their English names in every language.
  crumbSoundBank: { hu: 'Sound Bank', en: 'Sound Bank', de: 'Sound Bank' },
  crumbStressPatterns: { hu: 'Stress Patterns', en: 'Stress Patterns', de: 'Stress Patterns' },
  crumbConnectedSpeech: { hu: 'Connected Speech', en: 'Connected Speech', de: 'Connected Speech' },
  crumbPronunciationCentre: { hu: 'Kiejtésközpont', en: 'Pronunciation Centre', de: 'Aussprachezentrum' },
  crumbRehearsal: { hu: 'Gyakorlás', en: 'Rehearsal', de: 'Probe' },
  crumbTest: { hu: 'Teszt mód', en: 'Test mode', de: 'Testmodus' },
  crumbStudent: { hu: 'Diák', en: 'Student', de: 'Schüler' },
  crumbPersonas: { hu: 'Tutor Bot személyiségek', en: 'Tutor Bot personas', de: 'Tutor-Bot-Personas' },
  crumbUsage: { hu: 'API-használat', en: 'API usage', de: 'API-Nutzung' },
  comingSoonTitle: { hu: 'Fejlesztés alatt', en: 'Under construction', de: 'In Entwicklung' },
  comingSoonBody: {
    hu: 'Ezen a funkción még dolgozunk — nézz vissza hamarosan!',
    en: "We're still working on this feature — check back soon!",
    de: 'An dieser Funktion arbeiten wir noch — schau bald wieder vorbei!',
  },
  comingSoon: { hu: 'Hamarosan', en: 'Coming soon', de: 'Demnächst' },

  pickCategory: { hu: 'válassz egy kategóriát', en: 'choose a category', de: 'wähle eine Kategorie' },
  pickSubcategory: { hu: 'válassz egy alkategóriát', en: 'choose a subcategory', de: 'wähle eine Unterkategorie' },
  pickScenario: { hu: 'válassz egy szituációt', en: 'choose a situation', de: 'wähle eine Situation' },
  sessionsLeft: {
    hu: 'Ma még {n} gyakorlás maradt.',
    en: '{n} practice session(s) left today.',
    de: 'Heute noch {n} Übungseinheit(en) übrig.',
  },
  rehearsal: { hu: 'Gyakorlás', en: 'Rehearsal', de: 'Probe' },
  testMode: { hu: 'Teszt mód', en: 'Test mode', de: 'Testmodus' },

  grammarSubtitle: {
    hu: 'Válassz egy nyelvtani témát',
    en: 'Pick a grammar topic',
    de: 'Wähle ein Grammatikthema',
  },
  pronunciationHubSubtitle: {
    hu: 'Válassz egy gyakorlatot: hangok, hangsúly vagy összefüggő beszéd',
    en: 'Choose a session: sounds, stress or connected speech',
    de: 'Wähle eine Einheit: Laute, Betonung oder zusammenhängendes Sprechen',
  },
  pronunciationSubtitle: {
    hu: 'Vidd az egeret egy hangra a meghallgatáshoz',
    en: 'Hover over a sound to hear it',
    de: 'Fahre über einen Laut, um ihn zu hören',
  },
  voiceTitle: { hu: 'Hangbeállítások', en: 'Voice settings', de: 'Stimmeinstellungen' },
  connectTitle: { hu: 'Kapcsolódás tanárhoz', en: 'Connect to a teacher', de: 'Mit einem Lehrer verbinden' },
  adminOverviewTitle: { hu: 'Admin áttekintés', en: 'Admin Overview', de: 'Admin-Übersicht' },
  personasTitle: { hu: 'Tutor Bot személyiségek', en: 'Tutor Bot Personas', de: 'Tutor-Bot-Personas' },
  rehearsalIntro: {
    hu: 'Nézd át ezeket a hasznos kifejezéseket és egy minta beszélgetést, majd kezdd el, amikor készen állsz. Utána saját, élő beszélgetést folytatsz a szereplővel. A hangszóró gombbal meghallgathatod a mondatot, a mikrofon gombbal elmondhatod és azonnali visszajelzést kapsz.',
    en: 'Look through these useful phrases and a sample conversation, then start when you are ready. After that you will have your own live conversation with the character. Use the speaker button to hear a sentence and the microphone button to say it and get instant feedback.',
    de: 'Sieh dir diese nützlichen Ausdrücke und ein Beispielgespräch an und fang an, wenn du bereit bist. Danach führst du ein eigenes Live-Gespräch mit der Figur. Mit dem Lautsprecher-Button kannst du dir einen Satz anhören, mit dem Mikrofon-Button sprichst du ihn nach und erhältst sofort Feedback.',
  },
  usefulPhrases: { hu: 'Hasznos kifejezések', en: 'Useful phrases', de: 'Nützliche Ausdrücke' },
  sampleConversation: { hu: 'Minta beszélgetés', en: 'Sample conversation', de: 'Beispielgespräch' },
  next: { hu: 'Következő', en: 'Next', de: 'Weiter' },
  sampleEnded: { hu: 'Vége a minta beszélgetésnek.', en: 'End of the sample conversation.', de: 'Ende des Beispielgesprächs.' },
  startMyTry: { hu: 'Kezdem a saját próbámat', en: 'Start my own try', de: 'Ich starte meinen eigenen Versuch' },
  practiceConversation: { hu: 'Gyakorold a beszélgetést', en: 'Practice the conversation', de: 'Übe das Gespräch' },
  practiceConversationHint: {
    hu: 'Minden sort meghallgathatsz és elmondhatsz, akár a szereplő, akár a saját mondataidat.',
    en: 'You can listen to and say every line, whether it is the character\'s or your own.',
    de: 'Du kannst jede Zeile anhören und nachsprechen, egal ob von der Figur oder deine eigene.',
  },
  pronCentreLink: {
    hu: 'Kiejtésközpont — valódi kiejtéselemzés',
    en: 'Pronunciation Centre — real pronunciation analysis',
    de: 'Aussprachezentrum — echte Ausspracheanalyse',
  },
  pronCentreTitle: { hu: 'Kiejtésközpont', en: 'Pronunciation Centre', de: 'Aussprachezentrum' },
  pronCentreIntro: {
    hu: 'Hallgasd meg a mondatot a hangszóró gombbal, majd nyomd meg a Kiejtésellenőrzés gombot, és mondd el hangosan. Valódi, Azure-alapú kiejtéselemzést kapsz pontossági, folyékonysági és teljességi pontszámmal.',
    en: 'Listen to the sentence with the speaker button, then press the pronunciation check button and say it aloud. You get a real Azure-based pronunciation analysis with accuracy, fluency and completeness scores.',
    de: 'Höre dir den Satz mit dem Lautsprecher-Button an, drücke dann den Button für die Ausspracheprüfung und sprich ihn laut nach. Du erhältst eine echte Azure-basierte Ausspracheanalyse mit Bewertungen für Genauigkeit, Flüssigkeit und Vollständigkeit.',
  },
  listen: { hu: 'Meghallgatás', en: 'Listen', de: 'Anhören' },
  record: { hu: 'Felvétel', en: 'Record', de: 'Aufnehmen' },
  speechUnsupported: {
    hu: 'A hangfelismerés nem támogatott ebben a böngészőben. Kérjük, használj Chrome böngészőt.',
    en: 'Speech recognition is not supported in this browser. Please use Chrome.',
    de: 'Die Spracherkennung wird in diesem Browser nicht unterstützt. Bitte verwende Chrome.',
  },
  deepCheckPreparing: { hu: 'Előkészítés...', en: 'Preparing...', de: 'Wird vorbereitet...' },
  deepCheckRecording: {
    hu: 'Beszélj most... (max. {n} mp)',
    en: 'Speak now... (max. {n} s)',
    de: 'Sprich jetzt... (max. {n} Sek.)',
  },
  deepCheckIdle: { hu: 'Kiejtésellenőrzés', en: 'Pronunciation check', de: 'Ausspracheprüfung' },
  deepCheckUnavailable: {
    hu: 'A kiejtésellenőrzés most nem elérhető. Próbáld újra kicsit később. ({detail})',
    en: 'The pronunciation check is unavailable right now. Please try again a little later. ({detail})',
    de: 'Die Ausspracheprüfung ist derzeit nicht verfügbar. Bitte versuche es später noch einmal. ({detail})',
  },
  heardLabel: { hu: 'Amit hallottunk:', en: 'What we heard:', de: 'Das haben wir gehört:' },
  wordMatchNote: {
    hu: 'Ez szóalapú visszajelzés, nem valódi kiejtéselemzés.',
    en: 'This is word-match feedback, not real pronunciation scoring.',
    de: 'Dies ist ein wortbasiertes Feedback, keine echte Ausspracheanalyse.',
  },
  yourTurn: { hu: 'Most te jössz', en: 'Your turn', de: 'Du bist dran' },
  tryAnother: { hu: 'Próbálj egy másikat →', en: 'Try another →', de: 'Noch einen versuchen →' },
  pressPlay: { hu: 'Nyomd meg a lejátszást', en: 'Press play to begin', de: 'Drücke Play, um zu beginnen' },
  writingLesson: {
    hu: 'Az óra felkerül a táblára…',
    en: 'Writing the lesson on the board…',
    de: 'Die Lektion wird an die Tafel geschrieben…',
  },
  pickGrammarPoint: {
    hu: 'Válassz egy nyelvtani témát a listából a kezdéshez.',
    en: 'Pick a grammar point from the list to get started.',
    de: 'Wähle ein Grammatikthema aus der Liste, um zu beginnen.',
  },
  grammarSearchPlaceholder: {
    hu: 'Keresés a nyelvtani témák között…',
    en: 'Search grammar topics…',
    de: 'Grammatikthemen durchsuchen…',
  },
  grammarSearchLabel: { hu: 'Nyelvtani témák keresése', en: 'Search grammar topics', de: 'Grammatikthemen suchen' },
  grammarSearchClear: { hu: 'Keresés törlése', en: 'Clear search', de: 'Suche löschen' },
  grammarSearchNoResults: {
    hu: 'Nincs találat erre: „{q}”',
    en: 'No grammar topic matches “{q}”',
    de: 'Kein Grammatikthema passt zu „{q}“',
  },
  grammarSearchResultCount: {
    hu: '{n} találat',
    en: '{n} result(s)',
    de: '{n} Treffer',
  },
  tutorPersonas: { hu: 'Tutor Bot személyiségek', en: 'Tutor Bot personas', de: 'Tutor-Bot-Personas' },

  // Teacher word lists (Vocabulary Builder Phase 2)
  wordLists: { hu: 'Szólisták', en: 'Word lists', de: 'Wortlisten' },
  vlNewList: { hu: 'Új lista', en: 'New list', de: 'Neue Liste' },
  vlActive: { hu: 'Aktív', en: 'Active', de: 'Aktiv' },
  vlArchived: { hu: 'Archivált', en: 'Archived', de: 'Archiviert' },
  vlArchivedTag: { hu: 'archivált', en: 'archived', de: 'archiviert' },
  vlNoLists: {
    hu: 'Még nincs szólistád. Hozd létre az elsőt!',
    en: 'You have no word lists yet. Create your first one!',
    de: 'Du hast noch keine Wortlisten. Erstelle deine erste!',
  },
  vlNoArchived: { hu: 'Nincs archivált lista.', en: 'No archived lists.', de: 'Keine archivierten Listen.' },
  vlLoadFailed: {
    hu: 'Nem sikerült betölteni a szólistákat.',
    en: "Couldn't load your word lists.",
    de: 'Die Wortlisten konnten nicht geladen werden.',
  },
  vlWordCount: { hu: '{n} szó', en: '{n} word(s)', de: '{n} Begriff(e)' },
  vlStudentCount: { hu: '{n} diák', en: '{n} student(s)', de: '{n} Schüler' },
  vlNotAssigned: { hu: 'Még nincs kiosztva', en: 'Not assigned yet', de: 'Noch nicht zugewiesen' },
  vlLearnedSummary: {
    hu: 'Megtanulva: {learned} / {total}',
    en: 'Learned: {learned} / {total}',
    de: 'Gelernt: {learned} / {total}',
  },
  vlCompletedSummary: {
    hu: 'Befejezte: {done} / {n} diák',
    en: 'Completed by {done} / {n} students',
    de: 'Abgeschlossen: {done} / {n} Schüler',
  },
  vlCrumbNew: { hu: 'Új szólista', en: 'New word list', de: 'Neue Wortliste' },
  vlCrumbList: { hu: 'Szólista', en: 'Word list', de: 'Wortliste' },
  vlDetails: { hu: 'Lista adatai', en: 'List details', de: 'Listendetails' },
  vlTitle: { hu: 'Cím', en: 'Title', de: 'Titel' },
  vlTitlePlaceholder: { hu: 'pl. Utazás – 3. lecke', en: 'e.g. Travel – lesson 3', de: 'z. B. Reisen – Lektion 3' },
  vlDescription: { hu: 'Leírás (nem kötelező)', en: 'Description (optional)', de: 'Beschreibung (optional)' },
  vlLevel: { hu: 'Szint', en: 'Level', de: 'Niveau' },
  vlLevelNone: { hu: 'Nincs megadva', en: 'Not set', de: 'Nicht festgelegt' },
  vlAddTerms: { hu: 'Szavak hozzáadása', en: 'Add words', de: 'Begriffe hinzufügen' },
  vlModeWord: { hu: 'Szó hozzáadása', en: 'Add word', de: 'Wort hinzufügen' },
  vlModePaste: { hu: 'Lista beillesztése', en: 'Paste a list', de: 'Liste einfügen' },
  vlModeUpload: { hu: 'CSV / Excel feltöltése', en: 'Upload CSV / Excel', de: 'CSV / Excel hochladen' },
  vlTerm: { hu: 'Angol szó vagy kifejezés', en: 'English word or phrase', de: 'Englisches Wort oder Ausdruck' },
  vlMeaning: { hu: 'Magyar jelentés', en: 'Hungarian meaning', de: 'Ungarische Bedeutung' },
  vlMeaningOptional: {
    hu: 'Magyar jelentés (nem kötelező)',
    en: 'Hungarian meaning (optional)',
    de: 'Ungarische Bedeutung (optional)',
  },
  vlExample: { hu: 'Példamondat', en: 'Example sentence', de: 'Beispielsatz' },
  vlExampleOptional: { hu: 'Példamondat (nem kötelező)', en: 'Example sentence (optional)', de: 'Beispielsatz (optional)' },
  vlAdd: { hu: 'Hozzáadás', en: 'Add', de: 'Hinzufügen' },
  vlErrEmptyTerm: { hu: 'Írj be egy szót.', en: 'Enter a word.', de: 'Gib ein Wort ein.' },
  vlErrDuplicate: {
    hu: 'Ez a szó már szerepel a listán.',
    en: 'This word is already in the list.',
    de: 'Dieser Begriff steht schon in der Liste.',
  },
  vlErrFull: {
    hu: 'A lista megtelt (legfeljebb {max} szó).',
    en: 'The list is full (at most {max} words).',
    de: 'Die Liste ist voll (höchstens {max} Begriffe).',
  },
  vlPasteHint: {
    hu: 'Soronként egy szó. Pontosvesszővel elválasztva a magyar jelentést és egy példamondatot is megadhatod: szó ; jelentés ; példamondat',
    en: 'One word per line. You can add the Hungarian meaning and an example sentence, separated by semicolons: word ; meaning ; example',
    de: 'Ein Begriff pro Zeile. Durch Semikolons getrennt kannst du die ungarische Bedeutung und einen Beispielsatz angeben: Begriff ; Bedeutung ; Beispielsatz',
  },
  vlPastePlaceholder: {
    hu: 'book a table ; asztalt foglal\nreceipt\nluggage ; poggyász ; My luggage is too heavy.',
    en: 'book a table ; asztalt foglal\nreceipt\nluggage ; poggyász ; My luggage is too heavy.',
    de: 'book a table ; asztalt foglal\nreceipt\nluggage ; poggyász ; My luggage is too heavy.',
  },
  vlPasteAdd: { hu: 'Hozzáadás a listához', en: 'Add to list', de: 'Zur Liste hinzufügen' },
  vlUploadHint: {
    hu: 'CSV vagy Excel (XLSX, XLS) fájl. Első oszlop: az angol szó; második (nem kötelező): a magyar jelentés; harmadik (nem kötelező): példamondat. Fejlécsor is lehet.',
    en: 'A CSV or Excel (XLSX, XLS) file. First column: the English word; second (optional): the Hungarian meaning; third (optional): an example sentence. A header row is fine.',
    de: 'Eine CSV- oder Excel-Datei (XLSX, XLS). Erste Spalte: der englische Begriff; zweite (optional): die ungarische Bedeutung; dritte (optional): ein Beispielsatz. Eine Kopfzeile ist erlaubt.',
  },
  vlUploadChoose: { hu: 'Fájl kiválasztása', en: 'Choose a file', de: 'Datei auswählen' },
  vlUploadReading: { hu: 'Fájl beolvasása…', en: 'Reading the file…', de: 'Datei wird gelesen…' },
  vlUploadFailed: {
    hu: 'Nem sikerült beolvasni a fájlt. Csak CSV, XLSX és XLS fájlt lehet feltölteni.',
    en: "Couldn't read the file. Only CSV, XLSX and XLS files are supported.",
    de: 'Die Datei konnte nicht gelesen werden. Nur CSV-, XLSX- und XLS-Dateien werden unterstützt.',
  },
  vlImportAdded: { hu: '{n} szó hozzáadva', en: '{n} word(s) added', de: '{n} Begriff(e) hinzugefügt' },
  vlImportDuplicates: { hu: '{n} ismétlődő kihagyva', en: '{n} duplicate(s) skipped', de: '{n} Duplikat(e) übersprungen' },
  vlImportOverLimit: {
    hu: '{n} kihagyva, mert a lista megtelt',
    en: '{n} skipped because the list is full',
    de: '{n} übersprungen, weil die Liste voll ist',
  },
  vlImportNone: { hu: 'Nem találtunk szót.', en: 'No words found.', de: 'Keine Begriffe gefunden.' },
  vlWords: { hu: 'Szavak', en: 'Words', de: 'Begriffe' },
  vlCount: { hu: '{n} / {max} szó', en: '{n} / {max} words', de: '{n} / {max} Begriffe' },
  vlEmptyPreview: {
    hu: 'Még nincs szó a listán — adj hozzá fent.',
    en: 'No words yet — add some above.',
    de: 'Noch keine Begriffe — füge oben welche hinzu.',
  },
  vlPreviewHint: {
    hu: 'Az üres mezőket automatikusan kitöltjük. Minden cella szerkeszthető.',
    en: 'Blank fields are filled in automatically. You can edit every cell.',
    de: 'Leere Felder werden automatisch ausgefüllt. Jede Zelle ist bearbeitbar.',
  },
  vlFilling: { hu: 'Kitöltés…', en: 'Filling in…', de: 'Wird ausgefüllt…' },
  vlNeedsMeaning: { hu: 'Hiányzik a jelentés', en: 'Needs a meaning', de: 'Bedeutung fehlt' },
  vlRowDuplicate: { hu: 'Ismétlődő szó', en: 'Duplicate word', de: 'Doppelter Begriff' },
  vlRemove: { hu: 'Eltávolítás', en: 'Remove', de: 'Entfernen' },
  vlSave: { hu: 'Mentés', en: 'Save', de: 'Speichern' },
  vlSaving: { hu: 'Mentés…', en: 'Saving…', de: 'Wird gespeichert…' },
  vlSaved: { hu: 'Mentve.', en: 'Saved.', de: 'Gespeichert.' },
  vlSavedAddedCards: {
    hu: 'Mentve · {n} új kártya a kiosztott diákoknak',
    en: 'Saved · {n} new card(s) for assigned students',
    de: 'Gespeichert · {n} neue Karte(n) für zugewiesene Schüler',
  },
  vlSaveFailed: {
    hu: 'Nem sikerült menteni. Próbáld újra.',
    en: "Couldn't save. Please try again.",
    de: 'Speichern fehlgeschlagen. Bitte versuche es erneut.',
  },
  vlBlockTitle: { hu: 'Adj címet a listának.', en: 'Give the list a title.', de: 'Gib der Liste einen Titel.' },
  vlBlockEmpty: { hu: 'Adj hozzá legalább egy szót.', en: 'Add at least one word.', de: 'Füge mindestens einen Begriff hinzu.' },
  vlBlockFilling: {
    hu: 'Várd meg, amíg a kitöltés befejeződik.',
    en: 'Wait until the fill-in finishes.',
    de: 'Warte, bis das Ausfüllen abgeschlossen ist.',
  },
  vlBlockMeanings: {
    hu: 'Még {n} szónak nincs magyar jelentése.',
    en: '{n} word(s) still need a Hungarian meaning.',
    de: '{n} Begriff(e) brauchen noch eine ungarische Bedeutung.',
  },
  vlBlockDuplicates: {
    hu: 'Két sorban ugyanaz a szó szerepel.',
    en: 'Two rows have the same word.',
    de: 'Zwei Zeilen enthalten denselben Begriff.',
  },
  vlBlockEmptyTerm: { hu: 'Egy sorból hiányzik a szó.', en: 'A row has no word.', de: 'In einer Zeile fehlt der Begriff.' },
  vlBlockTooMany: {
    hu: 'Legfeljebb {max} szó lehet a listán.',
    en: 'A list can have at most {max} words.',
    de: 'Eine Liste kann höchstens {max} Begriffe haben.',
  },
  vlArchive: { hu: 'Archiválás', en: 'Archive', de: 'Archivieren' },
  vlUnarchive: { hu: 'Visszaállítás', en: 'Restore', de: 'Wiederherstellen' },
  vlConfirmArchive: {
    hu: 'Archiválod a listát? A diákok megtartják a kártyáikat, és a haladás is megmarad.',
    en: 'Archive this list? Students keep their cards and their progress is kept.',
    de: 'Liste archivieren? Die Schüler behalten ihre Karten, und der Fortschritt bleibt erhalten.',
  },
  vlArchivedNotice: {
    hu: 'Ez a lista archivált. A diákok megtartják a kártyáikat, de amíg vissza nem állítod, nem osztható ki.',
    en: "This list is archived. Students keep their cards, but it can't be assigned until you restore it.",
    de: 'Diese Liste ist archiviert. Die Schüler behalten ihre Karten, aber sie kann erst nach dem Wiederherstellen zugewiesen werden.',
  },
  vlArchiveFailed: {
    hu: 'Nem sikerült módosítani a listát.',
    en: "Couldn't update the list.",
    de: 'Die Liste konnte nicht geändert werden.',
  },
  vlAssignHeading: { hu: 'Kiosztás diákoknak', en: 'Assign to students', de: 'Schülern zuweisen' },
  vlAssign: { hu: 'Kiosztás', en: 'Assign', de: 'Zuweisen' },
  vlAssigning: { hu: 'Kiosztás…', en: 'Assigning…', de: 'Wird zugewiesen…' },
  vlAssignAll: { hu: 'Minden jelenlegi diák ({n})', en: 'All current students ({n})', de: 'Alle aktuellen Schüler ({n})' },
  vlAssignLaterNote: {
    hu: 'A később csatlakozó diákok nem kapják meg automatikusan.',
    en: "Students who connect later won't get it automatically.",
    de: 'Später verbundene Schüler erhalten sie nicht automatisch.',
  },
  vlAlreadyAssigned: { hu: 'már kiosztva', en: 'already assigned', de: 'bereits zugewiesen' },
  vlNoStudents: {
    hu: 'Még nincs kapcsolódó diákod.',
    en: 'You have no connected students yet.',
    de: 'Du hast noch keine verbundenen Schüler.',
  },
  vlAssignSaveFirst: { hu: 'Előbb mentsd a változtatásokat.', en: 'Save your changes first.', de: 'Speichere zuerst deine Änderungen.' },
  vlAssignResult: {
    hu: 'Kiosztva {n} diáknak · {created} új kártya · {upgraded} frissítve',
    en: 'Assigned to {n} student(s) · {created} new card(s) · {upgraded} upgraded',
    de: '{n} Schüler(n) zugewiesen · {created} neue Karte(n) · {upgraded} aktualisiert',
  },
  vlAssignFailed: {
    hu: 'Nem sikerült kiosztani a listát.',
    en: "Couldn't assign the list.",
    de: 'Die Liste konnte nicht zugewiesen werden.',
  },
  vlProgressHeading: { hu: 'Haladás', en: 'Progress', de: 'Fortschritt' },
  vlProgressLearned: { hu: '{learned} / {total} megtanulva', en: '{learned} / {total} learned', de: '{learned} / {total} gelernt' },
  vlProgressStarted: { hu: '{n} elkezdve', en: '{n} started', de: '{n} begonnen' },
  vlCompleted: { hu: 'Befejezve', en: 'Completed', de: 'Abgeschlossen' },
  vlDisconnected: { hu: 'már nincs kapcsolatban', en: 'disconnected', de: 'nicht mehr verbunden' },
  vlNotFound: { hu: 'Ez a lista nem található.', en: 'This list could not be found.', de: 'Diese Liste wurde nicht gefunden.' },
  vlLoadListFailed: {
    hu: 'Nem sikerült betölteni a listát.',
    en: "Couldn't load the list.",
    de: 'Die Liste konnte nicht geladen werden.',
  },
  vlBackToDashboard: {
    hu: '← Vissza a tanári felületre',
    en: '← Back to the dashboard',
    de: '← Zurück zur Lehrer-Übersicht',
  },
  vlStudentNone: {
    hu: 'Ennek a diáknak még nem osztottál ki szólistát.',
    en: "You haven't assigned any word lists to this student yet.",
    de: 'Du hast diesem Schüler noch keine Wortlisten zugewiesen.',
  },

  // Student vocabulary practice (Vocabulary Builder Phase 3)
  vcDueBadge: { hu: '{n} esedékes', en: '{n} due', de: '{n} fällig' },
  vcStart: { hu: 'Gyakorlás indítása', en: 'Start practice', de: 'Übung starten' },
  vcStarting: { hu: 'Betöltés…', en: 'Loading…', de: 'Wird geladen…' },
  vcNothingDue: {
    hu: 'Most nincs mit gyakorolni — szép munka!',
    en: 'Nothing to practise right now — nice work!',
    de: 'Gerade gibt es nichts zu üben — gut gemacht!',
  },
  vcNoCards: {
    hu: 'Még nincs szó az ismétlésben. A tanári listák és az Oktató bottal folytatott beszélgetések szavai automatikusan ide kerülnek; a saját listáidat a Szólistáim fülön adhatod hozzá.',
    en: "No words in spaced repetition yet. Words from your teacher's lists and Tutor Bot conversations land here automatically; add your own lists from My wordlists.",
    de: 'Noch keine Wörter in der Wiederholung. Wörter aus Listen deiner Lehrkraft und aus Tutor-Bot-Gesprächen kommen automatisch hierher; eigene Listen fügst du unter Meine Wortlisten hinzu.',
  },
  vcLoadFailed: {
    hu: 'Nem sikerült betölteni a szavaidat. Próbáld újra.',
    en: "Couldn't load your words. Please try again.",
    de: 'Deine Wörter konnten nicht geladen werden. Bitte versuche es erneut.',
  },
  vcNewTag: { hu: 'új szó', en: 'new word', de: 'neues Wort' },
  vcExRecognition: { hu: 'Mit jelent?', en: 'What does it mean?', de: 'Was bedeutet das?' },
  vcExRecall: { hu: 'Hogy mondod angolul?', en: 'How do you say it in English?', de: 'Wie sagt man das auf Englisch?' },
  vcExContext: { hu: 'Egészítsd ki a mondatot.', en: 'Complete the sentence.', de: 'Ergänze den Satz.' },
  vcExListening: {
    hu: 'Hallgasd meg, és írd be a hiányzó szót.',
    en: 'Listen and type the missing word.',
    de: 'Hör zu und schreib das fehlende Wort.',
  },
  vcExListeningTerm: {
    hu: 'Hallgasd meg, és írd be, amit hallasz.',
    en: 'Listen and type what you hear.',
    de: 'Hör zu und schreib, was du hörst.',
  },
  vcPlay: { hu: 'Lejátszás', en: 'Play', de: 'Abspielen' },
  vcPlaySlow: { hu: 'Lassan', en: 'Slowly', de: 'Langsam' },
  vcAnswerPlaceholder: { hu: 'Írd be angolul…', en: 'Type it in English…', de: 'Auf Englisch eingeben…' },
  vcCheck: { hu: 'Ellenőrzés', en: 'Check', de: 'Prüfen' },
  vcHint: { hu: 'Segítség', en: 'Hint', de: 'Tipp' },
  vcDontKnow: { hu: 'Nem tudom', en: "I don't know", de: 'Weiß ich nicht' },
  vcTryAgain: { hu: 'Nem egészen — próbáld még egyszer.', en: 'Not quite — try once more.', de: 'Nicht ganz — versuch es noch einmal.' },
  vcCorrect: { hu: 'Helyes!', en: 'Correct!', de: 'Richtig!' },
  vcTypo: { hu: 'Majdnem — figyelj a helyesírásra:', en: 'Almost — watch the spelling:', de: 'Fast — achte auf die Schreibung:' },
  vcWrong: { hu: 'A helyes válasz:', en: 'The right answer:', de: 'Die richtige Antwort:' },
  vcSaveFailed: {
    hu: 'Ezt a választ nem sikerült elmenteni.',
    en: "This answer couldn't be saved.",
    de: 'Diese Antwort konnte nicht gespeichert werden.',
  },
  vcEndSession: { hu: 'Befejezem', en: 'End session', de: 'Sitzung beenden' },
  vcSummaryTitle: { hu: 'Kész!', en: 'Done!', de: 'Fertig!' },
  vcSummaryReviewed: { hu: 'Gyakorolt szó', en: 'Words practised', de: 'Geübte Wörter' },
  vcSummaryCorrect: { hu: 'Helyes válasz', en: 'Correct answers', de: 'Richtige Antworten' },
  vcSummaryNew: { hu: 'Új szó', en: 'New words', de: 'Neue Wörter' },
  vcSummaryLearned: { hu: 'Megtanulva', en: 'Learned', de: 'Gelernt' },
  vcListCompleted: {
    hu: 'Teljesítetted ezt a szólistát: „{title}”',
    en: 'You completed the word list “{title}”',
    de: 'Du hast die Wortliste „{title}“ abgeschlossen',
  },
  vcSaveFailures: {
    hu: '{n} választ nem sikerült elmenteni; ezek a szavak később újra előkerülnek.',
    en: "{n} answer(s) couldn't be saved; those words will come up again.",
    de: '{n} Antwort(en) konnten nicht gespeichert werden; diese Wörter kommen später wieder.',
  },
  vcPracticeMore: { hu: 'Még gyakorolok', en: 'Practise more', de: 'Weiter üben' },
  vcBackToOverview: { hu: 'Vissza', en: 'Back', de: 'Zurück' },
  vcFromTeacherBy: { hu: 'Tanár: {email}', en: 'From {email}', de: 'Von {email}' },

  // Tutor Bot words and "My words" (Vocabulary Builder Phase 4)
  vcFilterAll: { hu: 'Mind', en: 'All', de: 'Alle' },
  vcFilterTeacher: { hu: 'Tanártól', en: 'From my teacher', de: 'Von der Lehrkraft' },
  vcFilterTutor: { hu: 'Beszélgetésből', en: 'From conversations', de: 'Aus Gesprächen' },
  vcFilterEmpty: { hu: 'Itt nincs szó.', en: 'No words here.', de: 'Hier gibt es keine Wörter.' },
  vcStageNew: { hu: 'új', en: 'new', de: 'neu' },
  vcStageLearning: { hu: 'tanulás alatt', en: 'learning', de: 'wird gelernt' },
  vcStageLearned: { hu: 'megtanulva', en: 'learned', de: 'gelernt' },
  vcStageMastered: { hu: 'elsajátítva', en: 'mastered', de: 'gemeistert' },
  vcPausedTag: { hu: 'szüneteltetve', en: 'paused', de: 'pausiert' },
  vcRemoveWord: { hu: 'Eltávolítás', en: 'Remove', de: 'Entfernen' },
  vcPauseWord: { hu: 'Szüneteltetés', en: 'Pause', de: 'Pausieren' },
  vcResumeWord: { hu: 'Folytatás', en: 'Resume', de: 'Fortsetzen' },
  vcConfirmRemove: {
    hu: 'Eltávolítod ezt a szót: „{term}”? Az eddigi gyakorlásod is törlődik.',
    en: 'Remove “{term}”? Your practice history for it is deleted too.',
    de: '„{term}“ entfernen? Dein Übungsverlauf dazu wird ebenfalls gelöscht.',
  },
  vcMeaningPending: { hu: 'a jelentés hamarosan elkészül', en: 'meaning on its way', de: 'Bedeutung folgt' },
  vcActionFailed: {
    hu: 'Nem sikerült. Próbáld újra.',
    en: "That didn't work. Please try again.",
    de: 'Das hat nicht geklappt. Bitte versuche es erneut.',
  },
  vcYouSaid: { hu: 'Te:', en: 'You said:', de: 'Du:' },
  vcBetter: { hu: 'Jobban:', en: 'Better:', de: 'Besser:' },
  vcAddedTitle: { hu: 'Új szavak a Szótanulóban', en: 'Added to your words', de: 'Zu deinen Wörtern hinzugefügt' },
  vcAddedHint: {
    hu: 'Ezeket a beszélgetésből gyűjtöttük; a Szótanulóban gyakorolhatod őket.',
    en: 'Picked from this conversation — practise them in Vocabulary.',
    de: 'Aus diesem Gespräch gesammelt — übe sie im Vokabeltrainer.',
  },
  vcUndo: { hu: 'Visszavonás', en: 'Undo', de: 'Rückgängig' },
  vcUndone: { hu: 'eltávolítva', en: 'removed', de: 'entfernt' },
  vcOpenVocabulary: { hu: 'Szótanuló megnyitása →', en: 'Open Vocabulary →', de: 'Vokabeltrainer öffnen →' },
  vcReasonSwitched: { hu: 'magyarul mondtad', en: 'you said it in Hungarian', de: 'du hast es auf Ungarisch gesagt' },
  vcReasonAsked: { hu: 'rákérdeztél', en: 'you asked for it', de: 'du hast danach gefragt' },
  vcReasonLacked: { hu: 'nem jutott eszedbe', en: 'you were looking for it', de: 'es hat dir gefehlt' },

  // Vocabulary: spaced-repetition review and Fast practice runs (design §7, §7.1)
  vcReviewTitle: { hu: 'Napi ismétlés', en: 'Daily review', de: 'Tägliche Wiederholung' },
  vcReviewHint: {
    hu: 'Az esedékes és az új szavak, egy-egy feladattal. Ez alapján dől el, mikor jön elő újra egy szó.',
    en: 'Words that are due, plus new ones, one exercise each. This decides when each word comes back.',
    de: 'Fällige und neue Wörter, je eine Übung. Danach richtet sich, wann ein Wort wiederkommt.',
  },
  vcDrillSetupHint: {
    hu: 'Minden feladattípus és minden szó ki van jelölve; vedd ki, amelyiket most nem szeretnéd gyakorolni.',
    en: "Every exercise and every word is ticked; untick any you don't want in this run.",
    de: 'Alle Übungen und alle Wörter sind ausgewählt; nimm heraus, was du diesmal nicht üben willst.',
  },
  vcDrillExercises: { hu: 'Feladattípusok', en: 'Exercises', de: 'Übungen' },
  vcDrillNoExercises: {
    hu: 'Válassz legalább egy feladattípust.',
    en: 'Choose at least one exercise.',
    de: 'Wähle mindestens eine Übung.',
  },
  vcDrillSearch: { hu: 'Keresés…', en: 'Search…', de: 'Suchen…' },
  vcDrillSelectAll: { hu: 'Mind kijelölése', en: 'Select all', de: 'Alle auswählen' },
  vcDrillSelectNone: { hu: 'Kijelölés törlése', en: 'Select none', de: 'Keine auswählen' },
  vcDrillSelected: { hu: '{n} szó kiválasztva', en: '{n} word(s) selected', de: '{n} Wort/Wörter ausgewählt' },
  vcDrillTooMany: {
    hu: 'Egyszerre legfeljebb {max} szót gyakorolhatsz — vegyél ki néhányat.',
    en: 'At most {max} words in one run — remove a few.',
    de: 'Höchstens {max} Wörter auf einmal — entferne ein paar.',
  },
  vcDrillStart: { hu: 'Indítás', en: 'Start', de: 'Starten' },
  vcDrillFailed: {
    hu: 'Nem sikerült elindítani a gyakorlást. Próbáld újra.',
    en: "Couldn't start the practice. Please try again.",
    de: 'Die Übung konnte nicht gestartet werden. Bitte versuche es erneut.',
  },
  vcRoundOf: { hu: '{n}. kör / {total}', en: 'Round {n} of {total}', de: 'Runde {n} von {total}' },
  vcRoundRecognition: { hu: 'Jelentés', en: 'Meaning', de: 'Bedeutung' },
  vcRoundRecall: { hu: 'Felidézés', en: 'Recall', de: 'Abrufen' },
  vcRoundContext: { hu: 'Kiegészítés', en: 'Gap-fill', de: 'Lückentext' },
  vcRoundListening: { hu: 'Hallás utáni értés', en: 'Listening', de: 'Hören' },
  vcDrillSummaryWords: {
    hu: 'Gyakorolt szavak: {n}. Az ismétlések ütemezése nem változott.',
    en: 'Words practised: {n}. Your review schedule is unchanged.',
    de: 'Geübte Wörter: {n}. Dein Wiederholungsplan ist unverändert.',
  },
  vcDrillSaveFailures: {
    hu: '{n} választ nem sikerült elmenteni.',
    en: "{n} answer(s) couldn't be saved.",
    de: '{n} Antwort(en) konnten nicht gespeichert werden.',
  },
  vcDrillAgain: { hu: 'Újra ezekkel a szavakkal', en: 'Again with these words', de: 'Nochmal mit diesen Wörtern' },
  vcDrillChangeWords: { hu: 'Más szavak vagy feladatok', en: 'Change words or exercises', de: 'Wörter oder Übungen ändern' },

  // Vocabulary: Fast practice and My wordlists (design §7.1–§7.2)
  vcTabFast: { hu: 'Gyors gyakorlás', en: 'Fast practice', de: 'Schnellübung' },
  vcTabLists: { hu: 'Szólistáim', en: 'My wordlists', de: 'Meine Wortlisten' },
  vcTabSrs: { hu: 'Ismétlés', en: 'Spaced repetition', de: 'Wiederholung' },
  vcFastTitle: { hu: 'Gyakorolj egy listát', en: 'Practise a list', de: 'Eine Liste üben' },
  vcFastHint: {
    hu: 'Bármelyik listádat végigveheted az összes feladattal, bármikor — akkor is, ha már megtanultad. Az ismétlések ütemezését nem változtatja meg.',
    en: "Go through every exercise with any of your lists, any time — learned or not. It doesn't change your review schedule.",
    de: 'Übe jede deiner Listen mit allen Übungen, jederzeit — gelernt oder nicht. Dein Wiederholungsplan bleibt unverändert.',
  },
  vcFastNoLists: {
    hu: 'Még nincs listád. A Szólistáim fülön állíthatsz össze egyet.',
    en: "You don't have any lists yet. Compile one on the My wordlists tab.",
    de: 'Du hast noch keine Listen. Stelle eine im Tab Meine Wortlisten zusammen.',
  },
  vcPractise: { hu: 'Gyakorlás', en: 'Practise', de: 'Üben' },
  vcWordCount: { hu: '{n} szó', en: '{n} word(s)', de: '{n} Wort/Wörter' },
  vcCompileTitle: { hu: 'Új lista összeállítása', en: 'Compile a new list', de: 'Neue Liste zusammenstellen' },
  vcCompileTopic: { hu: 'Téma', en: 'Topic', de: 'Thema' },
  vcCompileLevel: { hu: 'Szint', en: 'Level', de: 'Niveau' },
  vcCompileCount: { hu: 'Szavak száma', en: 'Number of words', de: 'Anzahl der Wörter' },
  vcCompile: { hu: 'Összeállítás', en: 'Compile list', de: 'Liste erstellen' },
  vcCompiling: { hu: 'Összeállítás…', en: 'Compiling…', de: 'Wird erstellt…' },
  vcCompilesLeft: {
    hu: 'Mára még {n} új lista maradt (napi {max}).',
    en: '{n} of {max} new lists left today.',
    de: 'Heute noch {n} von {max} neuen Listen.',
  },
  vcCompileLimit: {
    hu: 'Mára elérted a napi {n} új listát. Holnap újra összeállíthatsz.',
    en: "You've reached today's limit of {n} new lists. You can compile more tomorrow.",
    de: 'Du hast das Tageslimit von {n} neuen Listen erreicht. Morgen kannst du wieder welche erstellen.',
  },
  vcCompileFailed: {
    hu: 'Nem sikerült összeállítani a listát. Próbáld újra.',
    en: "Couldn't compile the list. Please try again.",
    de: 'Die Liste konnte nicht erstellt werden. Bitte versuche es erneut.',
  },
  vcTopicTravel: { hu: 'Utazás', en: 'Travel', de: 'Reisen' },
  vcTopicFood: { hu: 'Étel és ital', en: 'Food & drink', de: 'Essen & Trinken' },
  vcTopicWork: { hu: 'Munka', en: 'Work', de: 'Arbeit' },
  vcTopicShopping: { hu: 'Vásárlás', en: 'Shopping', de: 'Einkaufen' },
  vcTopicHealth: { hu: 'Egészség', en: 'Health', de: 'Gesundheit' },
  vcTopicHome: { hu: 'Otthon és család', en: 'Home & family', de: 'Zuhause & Familie' },
  vcTopicFreeTime: { hu: 'Szabadidő', en: 'Free time', de: 'Freizeit' },
  vcTopicEducation: { hu: 'Oktatás', en: 'Education', de: 'Bildung' },
  vcTopicNature: { hu: 'Természet és időjárás', en: 'Nature & weather', de: 'Natur & Wetter' },
  vcTopicPeople: { hu: 'Érzések és emberek', en: 'Feelings & people', de: 'Gefühle & Menschen' },
  vcTopicOther: { hu: 'Saját téma…', en: 'Your own topic…', de: 'Eigenes Thema…' },
  vcTopicOtherPlaceholder: {
    hu: 'Pl. focimeccs, állásinterjú',
    en: 'e.g. football match, job interview',
    de: 'z. B. Fußballspiel, Vorstellungsgespräch',
  },
  vcListsEmpty: {
    hu: 'Még nincs szólistád. Állítsd össze az elsőt fent!',
    en: 'No word lists yet. Compile your first one above!',
    de: 'Noch keine Wortlisten. Stelle oben deine erste zusammen!',
  },
  vcFilterCustom: { hu: 'Saját', en: 'Made by me', de: 'Eigene' },
  vcKindCustom: { hu: 'saját', en: 'mine', de: 'eigene' },
  vcKindTeacher: { hu: 'tanártól', en: 'from teacher', de: 'von Lehrkraft' },
  vcKindConversations: { hu: 'beszélgetésből', en: 'from conversations', de: 'aus Gesprächen' },
  vcListConversations: { hu: 'Beszélgetésekből', en: 'From conversations', de: 'Aus Gesprächen' },
  vcInSrsCount: { hu: '{n} az ismétlésben', en: '{n} in spaced repetition', de: '{n} in der Wiederholung' },
  vcNotInSrs: { hu: 'nincs az ismétlésben', en: 'not in review', de: 'nicht in Wiederholung' },

  // Vocabulary: list filters, compact compile form, pipeline
  vcLevelOption: { hu: '{level} szint', en: 'Level {level}', de: 'Niveau {level}' },
  vcFilterLevelAll: { hu: 'Minden szint', en: 'All levels', de: 'Alle Niveaus' },
  vcFilterTopicAll: { hu: 'Minden téma', en: 'All topics', de: 'Alle Themen' },
  vcFilterLevelMixed: { hu: 'Vegyes szint', en: 'Mixed level', de: 'Gemischtes Niveau' },
  vcFilterTopicMixed: { hu: 'Vegyes témák', en: 'Mixed topics', de: 'Gemischte Themen' },
  vcSortLabel: { hu: 'Rendezés', en: 'Sort', de: 'Sortierung' },
  vcSortNewest: { hu: 'Legújabb elöl', en: 'Newest first', de: 'Neueste zuerst' },
  vcSortPopular: { hu: 'Legtöbbet gyakorolt', en: 'Most practised', de: 'Am meisten geübt' },
  vcSortLongest: { hu: 'Leghosszabb elöl', en: 'Longest first', de: 'Längste zuerst' },
  vcFilterNoLists: {
    hu: 'Nincs a szűrésnek megfelelő lista.',
    en: 'No lists match these filters.',
    de: 'Keine Liste passt zu diesen Filtern.',
  },
  vcPracticedCount: { hu: '{n}× gyakorolva', en: 'practised {n}×', de: '{n}× geübt' },
  vcPipelineTitle: { hu: 'Hol tartanak a szavaid', en: 'Where your words are', de: 'Wo deine Wörter stehen' },
  vcPipeNotInSrs: { hu: 'Nincs az ismétlésben', en: 'Not in review', de: 'Nicht in Wiederholung' },
  vcPipeNew: { hu: 'Új', en: 'New', de: 'Neu' },
  vcPipeLearning: { hu: 'Tanulás alatt', en: 'Learning', de: 'Wird gelernt' },
  vcPipeLearned: { hu: 'Megtanulva', en: 'Learned', de: 'Gelernt' },
  vcPipePaused: { hu: 'Szüneteltetve: {n}', en: 'Paused: {n}', de: 'Pausiert: {n}' },
  vcPipeMastered: { hu: 'Elsajátítva', en: 'Mastered', de: 'Gemeistert' },
  vcPipeByStage: { hu: 'Szakasz szerint', en: 'By stage', de: 'Nach Stufe' },
  vcPipeByExercise: {
    hu: 'Feladat szerint (az ismétlésben lévő szavak)',
    en: 'By exercise (words in review)',
    de: 'Nach Übung (Wörter in der Wiederholung)',
  },
  vcReviewAgain: { hu: 'Újra ismétlem', en: 'Review again', de: 'Wieder üben' },

  // Vocabulary: "How does it work?" on the Spaced repetition tab (design §6)
  vcSrsHowTitle: { hu: 'Hogyan működik az ismétlés?', en: 'How spaced repetition works', de: 'Wie funktioniert die Wiederholung?' },
  vcSrsHowGaps: {
    hu: 'Minden szó akkor kerül elő újra, amikor épp elfelejtenéd. Ha jól válaszolsz, egyre hosszabb a szünet: néhány perc, aztán egy nap, majd napok, hetek, hónapok. Ha hibázol, hamarosan újra jön.',
    en: "Every word comes back just before you'd forget it. When you answer correctly, the gap grows: a few minutes, then a day, then days, weeks and months. When you get it wrong, it comes back soon.",
    de: 'Jedes Wort kommt wieder, kurz bevor du es vergessen würdest. Antwortest du richtig, wird die Pause länger: ein paar Minuten, dann ein Tag, dann Tage, Wochen und Monate. Antwortest du falsch, kommt es bald wieder.',
  },
  vcSrsHowLadder: {
    hu: 'Minden szó négy feladaton halad végig: jelentés → felidézés → kiegészítés → hallás utáni értés. Jó válasznál egy lépéssel feljebb lép, hibánál egy lépéssel vissza.',
    en: 'Each word climbs through four exercises: meaning → recall → gap-fill → listening. A right answer moves it one step up and a wrong one moves it one step down.',
    de: 'Jedes Wort durchläuft vier Übungen: Bedeutung → Abrufen → Lückentext → Hören. Eine richtige Antwort bringt es eine Stufe höher, eine falsche eine Stufe zurück.',
  },
  vcSrsHowHint: {
    hu: 'Ha segítséggel vagy második próbálkozásra találod el, kevésbé nő a szünet.',
    en: 'If you needed a hint or a second try, the gap grows less.',
    de: 'Brauchst du einen Hinweis oder einen zweiten Versuch, wächst die Pause weniger.',
  },
  vcSrsHowSession: {
    hu: 'Minden listának saját ismétlése van: a lista esedékes szavait hozza (egyszerre legfeljebb {max}-et), plusz naponta legfeljebb {newPerDay} új szót a listáról. A jelentés-feladat válaszlehetőségei is a listából jönnek, ezért kell legalább {min} szó a listán.',
    en: "Each list has its own review session: the list's words that are due (up to {max} at a time), plus up to {newPerDay} new words from it a day. The meaning exercise takes its options from the list too, so a list needs at least {min} words.",
    de: 'Jede Liste hat ihre eigene Wiederholung: die fälligen Wörter der Liste (höchstens {max} auf einmal) und bis zu {newPerDay} neue Wörter daraus pro Tag. Auch die Antwortmöglichkeiten der Bedeutungsübung kommen aus der Liste, deshalb braucht eine Liste mindestens {min} Wörter.',
  },
  vcSrsHowStages: { hu: 'A szakaszok:', en: 'The stages:', de: 'Die Stufen:' },
  vcSrsStageNotInSrs: {
    hu: 'benne van a listáidban, de még nem adtad hozzá.',
    en: 'in your lists, but not added yet.',
    de: 'in deinen Listen, aber noch nicht hinzugefügt.',
  },
  vcSrsStageNew: { hu: 'hozzáadtad, de még nem gyakoroltad.', en: 'added, but not practised yet.', de: 'hinzugefügt, aber noch nicht geübt.' },
  vcSrsStageLearning: {
    hu: 'az első, rövid ismétléseknél tart.',
    en: 'still in its first, short repeats.',
    de: 'noch in den ersten, kurzen Wiederholungen.',
  },
  vcSrsStageLearned: {
    hu: 'már napok vagy hosszabb idő után jön elő. Akkor is megtanult marad, ha később egyszer elrontod.',
    en: 'it now comes back after days or longer. It stays learned even if you miss it later.',
    de: 'kommt jetzt erst nach Tagen oder länger wieder. Es bleibt gelernt, auch wenn du es später einmal falsch beantwortest.',
  },
  vcSrsStageMastered: {
    hu: 'a következő szünet már legalább egy év lenne (hibátlanul kb. 6 ismétlés, hibákkal több), ezért nem jön elő többé. A listájában az „Újra ismétlem” gombbal visszateheted.',
    en: 'its next gap would be a year or more (about 6 reviews if you always get it right, more with mistakes), so it stops coming back. Put it back from its list with “Review again”.',
    de: 'die nächste Pause wäre ein Jahr oder länger (etwa 6 Wiederholungen, wenn du immer richtig antwortest, mit Fehlern mehr), deshalb kommt es nicht mehr. In seiner Liste holst du es mit „Wieder üben“ zurück.',
  },
  vcSrsHowSources: {
    hu: 'A tanári listák és a beszélgetések szavai maguktól bekerülnek, a saját listáidat a Szólistáim fülön adhatod hozzá. Ha egy szó több listán is szerepel, egy ütemezése van: bármelyik listában gyakorlod, mindkettőben előrelép. A szüneteltetett szavak nem jönnek elő, és a Gyors gyakorlás nem változtat az ütemezésen.',
    en: "Words from your teacher's lists and from conversations are added automatically. You add your own lists from My wordlists. A word on more than one list has one schedule, so practising it in either list counts for both. Paused words don't come up, and Fast practice doesn't change this schedule.",
    de: 'Wörter aus den Listen deiner Lehrkraft und aus Gesprächen kommen automatisch dazu; eigene Listen fügst du unter Meine Wortlisten hinzu. Steht ein Wort auf mehreren Listen, hat es einen gemeinsamen Plan: Übst du es in einer Liste, zählt das für alle. Pausierte Wörter kommen nicht, und die Schnellübung ändert diesen Plan nicht.',
  },
  vcNextRepNow: {
    hu: 'Következő ismétlés: most ({n} esedékes)',
    en: 'Next repetition: now ({n} due)',
    de: 'Nächste Wiederholung: jetzt ({n} fällig)',
  },
  vcNextRepAt: { hu: 'Következő ismétlés: {when}', en: 'Next repetition: {when}', de: 'Nächste Wiederholung: {when}' },
  vcNewTodayCount: { hu: 'Mára {n} új szó', en: '{n} new word(s) today', de: '{n} neue(s) Wort/Wörter heute' },
  vcBackToLists: { hu: 'Vissza', en: 'Back', de: 'Zurück' },
  vcListTitle: { hu: 'Lista neve', en: 'List name', de: 'Listenname' },
  vcSave: { hu: 'Mentés', en: 'Save', de: 'Speichern' },
  vcCancel: { hu: 'Mégse', en: 'Cancel', de: 'Abbrechen' },
  vcSaving: { hu: 'Mentés…', en: 'Saving…', de: 'Wird gespeichert…' },
  vcFastPractise: { hu: 'Gyors gyakorlás', en: 'Fast practice', de: 'Schnell üben' },
  vcAddToSrs: {
    hu: '{n} szó hozzáadása az ismétléshez',
    en: 'Add {n} word(s) to spaced repetition',
    de: '{n} Wort/Wörter zur Wiederholung hinzufügen',
  },
  vcAllInSrs: {
    hu: 'Minden szó az ismétlésben van',
    en: 'All words are in spaced repetition',
    de: 'Alle Wörter sind in der Wiederholung',
  },
  vcAddedToSrs: {
    hu: '{n} szó bekerült az ismétlésbe.',
    en: '{n} word(s) added to spaced repetition.',
    de: '{n} Wort/Wörter zur Wiederholung hinzugefügt.',
  },
  vcRename: { hu: 'Átnevezés', en: 'Rename', de: 'Umbenennen' },
  vcDeleteList: { hu: 'Lista törlése', en: 'Delete list', de: 'Liste löschen' },
  vcConfirmDeleteList: {
    hu: 'Törlöd ezt a listát: „{title}”? Az ismétlésben lévő szavai ott maradnak.',
    en: 'Delete "{title}"? Its words that are in spaced repetition stay there.',
    de: '„{title}“ löschen? Wörter, die in der Wiederholung sind, bleiben dort.',
  },
  vcTeacherListSrsNote: {
    hu: 'A tanári listák szavai automatikusan bekerülnek az ismétlésbe.',
    en: "Words from your teacher's lists are in spaced repetition automatically.",
    de: 'Wörter aus Listen deiner Lehrkraft sind automatisch in der Wiederholung.',
  },
  vcConversationsSrsNote: {
    hu: 'Az Oktató bottal folytatott beszélgetések szavai automatikusan bekerülnek az ismétlésbe.',
    en: 'Words from your Tutor Bot conversations are in spaced repetition automatically.',
    de: 'Wörter aus deinen Tutor-Bot-Gesprächen sind automatisch in der Wiederholung.',
  },
  vcRemoveFromList: { hu: 'Levétel a listáról', en: 'Remove from list', de: 'Von der Liste nehmen' },
  vcListNoWords: {
    hu: 'Ezen a listán nincs szó.',
    en: 'There are no words on this list.',
    de: 'Auf dieser Liste sind keine Wörter.',
  },
  vcAddWord: { hu: 'Hozzáadás', en: 'Add', de: 'Hinzufügen' },
  vcClose: { hu: 'Bezárás', en: 'Close', de: 'Schließen' },

  // Vocabulary: spaced repetition per list, mixed-level lists, adding words to a list
  vcLevelMixed: { hu: 'Vegyes', en: 'Mixed', de: 'Gemischt' },
  vcLevelMixedOption: { hu: 'Vegyes szint ({levels})', en: 'Mixed level ({levels})', de: 'Gemischtes Niveau ({levels})' },
  vcListSrsTitle: { hu: 'Ismétlés', en: 'Spaced repetition', de: 'Wiederholung' },
  vcSrsListsHint: {
    hu: 'Minden listának saját ismétlése van: a szavak listánként jönnek elő, nem keverve.',
    en: 'Each list has its own review: words come up list by list, never mixed.',
    de: 'Jede Liste hat ihre eigene Wiederholung: Die Wörter kommen Liste für Liste, nie gemischt.',
  },
  vcStartListReview: { hu: 'Ismétlés indítása', en: 'Start spaced repetition', de: 'Wiederholung starten' },
  vcOpenList: { hu: 'Lista megnyitása', en: 'Open list', de: 'Liste öffnen' },
  vcSrsMinWords: {
    hu: 'Az ismétléshez legalább {n} szó kell a listán.',
    en: 'A list needs at least {n} words for spaced repetition.',
    de: 'Für die Wiederholung braucht eine Liste mindestens {n} Wörter.',
  },
  vcAddWords: { hu: 'Szavak hozzáadása', en: 'Add words', de: 'Wörter hinzufügen' },
  vcAddTypedTitle: { hu: 'Saját szavak', en: 'Type your own', de: 'Eigene Wörter' },
  vcAddWordsPlaceholder: {
    hu: 'Angol szavak vagy kifejezések, vesszővel vagy új sorban elválasztva…',
    en: 'English words or phrases, separated by commas or new lines…',
    de: 'Englische Wörter oder Ausdrücke, durch Kommas oder Zeilenumbrüche getrennt…',
  },
  vcAddFromBankTitle: { hu: 'Még több szó a témához', en: 'More words for this topic', de: 'Mehr Wörter zum Thema' },
  vcAddFromBankHint: {
    hu: 'A lista témájához és szintjéhez válogatva, olyan szó nélkül, ami már megvan. Egy összeállításnak számít a mai keretből (még {n} maradt, napi {max}).',
    en: "Picked for the list's topic and level, never a word you already have. Counts as one of today's compiles ({n} of {max} left).",
    de: 'Passend zu Thema und Niveau der Liste, nie ein Wort, das du schon hast. Zählt als eine der heutigen Zusammenstellungen (noch {n} von {max}).',
  },
  vcAddFromBankButton: { hu: '{n} szó hozzáadása', en: 'Add {n} word(s)', de: '{n} Wort/Wörter hinzufügen' },
  vcWordsAdded: { hu: '{n} szó felkerült a listára.', en: '{n} word(s) added to the list.', de: '{n} Wort/Wörter zur Liste hinzugefügt.' },
  vcWordsSkipped: { hu: 'Már a listán volt: {terms}', en: 'Already on the list: {terms}', de: 'Stand schon auf der Liste: {terms}' },
  vcAllWordsExist: {
    hu: 'Ezek a szavak már mind a listán vannak.',
    en: 'These words are all on the list already.',
    de: 'Diese Wörter stehen alle schon auf der Liste.',
  },
  vcTooManyWords: {
    hu: 'Egyszerre legfeljebb {n} szót adhatsz hozzá.',
    en: 'You can add at most {n} words at a time.',
    de: 'Du kannst höchstens {n} Wörter auf einmal hinzufügen.',
  },

  // Vocabulary: Fast practice tests (design §7.1)
  vcTestStart: { hu: 'Teszt ({n} szó)', en: 'Test ({n} words)', de: 'Test ({n} Wörter)' },
  vcTestHint: {
    hu: 'A lista szavainak {share}%-a véletlenszerűen, „Hogy mondod angolul?” feladattal. Nincs segítség, egy próbálkozás, az elírás is hibának számít.',
    en: 'A random {share}% of the list, as "How do you say it in English?". No hints, one try, and a typo counts as wrong.',
    de: 'Zufällige {share} % der Liste, als „Wie sagt man das auf Englisch?“. Keine Hinweise, ein Versuch, ein Tippfehler zählt als falsch.',
  },
  vcTestRules: {
    hu: 'Teszt · nincs segítség, egy próbálkozás, az elírás hiba',
    en: 'Test · no hints, one try, a typo is wrong',
    de: 'Test · keine Hinweise, ein Versuch, Tippfehler sind falsch',
  },
  vcTestTypo: {
    hu: 'Majdnem — de a teszten az elírás hibának számít. A helyes válasz:',
    en: 'Almost — but in a test a typo counts as wrong. The right answer:',
    de: 'Fast — aber im Test zählt ein Tippfehler als falsch. Die richtige Antwort:',
  },
  vcTestConfirmEnd: {
    hu: 'Befejezed a tesztet? A még hátralévő szavak hibának számítanak.',
    en: "End the test? The words you haven't answered count as wrong.",
    de: 'Test beenden? Nicht beantwortete Wörter zählen als falsch.',
  },
  vcTestSeeScore: { hu: 'Eredmény', en: 'See my score', de: 'Ergebnis' },
  vcTestTitle: { hu: 'Teszt', en: 'Test', de: 'Test' },
  vcTestResultTitle: { hu: 'Teszt eredménye', en: 'Test result', de: 'Testergebnis' },
  vcTestCorrectOf: { hu: '{correct} / {total} helyes', en: '{correct} of {total} correct', de: '{correct} von {total} richtig' },
  vcTestMissed: { hu: 'Ezeket érdemes átnézni:', en: 'Worth another look:', de: 'Diese lohnen einen zweiten Blick:' },
  vcTestAgain: { hu: 'Új teszt', en: 'New test', de: 'Neuer Test' },
  vcTestSaveFailed: {
    hu: 'Az eredményt nem sikerült elmenteni.',
    en: "The score couldn't be saved.",
    de: 'Das Ergebnis konnte nicht gespeichert werden.',
  },
  vcTestScores: { hu: 'Teszt: legutóbb {last}% · legjobb {best}%', en: 'Test: last {last}% · best {best}%', de: 'Test: zuletzt {last} % · bestes {best} %' },
  vcWordBankCredit: {
    hu: 'A szólisták a CEFR-J Wordlist 1.5 (összeállította: Tono Jukio, Tokiói Idegennyelvi Egyetem) és az Octanove Vocabulary Profile C1/C2 szavaiból válogatnak.',
    en: 'Word lists draw on the CEFR-J Wordlist Version 1.5 (compiled by Yukio Tono, Tokyo University of Foreign Studies) and the Octanove Vocabulary Profile C1/C2.',
    de: 'Die Wortlisten stützen sich auf die CEFR-J Wordlist Version 1.5 (zusammengestellt von Yukio Tono, Tokyo University of Foreign Studies) und das Octanove Vocabulary Profile C1/C2.',
  },

  // Exam Prep
  exSubtitle: {
    hu: 'Válaszd ki a vizsgát, a nyelvet és a szintet',
    en: 'Choose the exam, the language and the level',
    de: 'Wähle Prüfung, Sprache und Niveau',
  },
  exTypeErettsegi: { hu: 'Érettségi', en: 'Érettségi (school-leaving exam)', de: 'Érettségi (Abitur)' },
  exTypeErettsegiDesc: {
    hu: 'Közép- és emelt szintű írásbeli feladatsorok',
    en: 'Written papers at intermediate and advanced level',
    de: 'Schriftliche Prüfungen auf mittlerem und erhöhtem Niveau',
  },
  exTypeNyelvvizsga: { hu: 'Nyelvvizsga', en: 'Language exam', de: 'Sprachprüfung' },
  exTypeNyelvvizsgaDesc: {
    hu: 'B1, B2 és C1 szintű írásbeli feladatsorok',
    en: 'Written papers at B1, B2 and C1 level',
    de: 'Schriftliche Prüfungen auf B1-, B2- und C1-Niveau',
  },
  exLangEn: { hu: 'Angol', en: 'English', de: 'Englisch' },
  exLangDe: { hu: 'Német', en: 'German', de: 'Deutsch' },
  exLevelKozep: { hu: 'Középszint', en: 'Intermediate level', de: 'Mittleres Niveau' },
  exLevelEmelt: { hu: 'Emelt szint', en: 'Advanced level', de: 'Erhöhtes Niveau' },
  exLevelB1: { hu: 'B1 (alapfok)', en: 'B1 (basic)', de: 'B1 (Grundstufe)' },
  exLevelB2: { hu: 'B2 (középfok)', en: 'B2 (intermediate)', de: 'B2 (Mittelstufe)' },
  exLevelC1: { hu: 'C1 (felsőfok)', en: 'C1 (advanced)', de: 'C1 (Oberstufe)' },
  exPaperLabel: { hu: '{type} – {lang}, {level} · {sitting}', en: '{type} – {lang}, {level} · {sitting}', de: '{type} – {lang}, {level} · {sitting}' },
  exStart: { hu: 'Kezdés', en: 'Start', de: 'Starten' },
  exNoPaperYet: { hu: 'Még nincs feladatsor', en: 'No paper yet', de: 'Noch keine Prüfung' },
  exLoadFailed: {
    hu: 'A feladatsort nem sikerült betölteni.',
    en: "The paper couldn't be loaded.",
    de: 'Die Prüfung konnte nicht geladen werden.',
  },
  exRetry: { hu: 'Újra', en: 'Try again', de: 'Erneut versuchen' },
  exSections: { hu: 'A feladatsor részei', en: 'Sections', de: 'Prüfungsteile' },
  exMinutes: { hu: '{n} perc', en: '{n} min', de: '{n} Min.' },
  exUntimed: { hu: 'nincs időkorlát', en: 'untimed', de: 'ohne Zeitlimit' },
  exWithAudio: { hu: 'hanganyaggal', en: 'with audio', de: 'mit Hörtext' },
  exNotices: { hu: 'A vizsgán', en: 'In the exam', de: 'In der Prüfung' },
  exSource: { hu: 'Forrás', en: 'Source', de: 'Quelle' },
  exModeExam: { hu: 'Vizsga mód', en: 'Exam mode', de: 'Prüfungsmodus' },
  exModeExamDesc: {
    hu: 'Időre, a részek sorrendjében. Beadás után nem lehet visszalépni. A hanganyag egyszer, megállítás nélkül szól.',
    en: "Timed, section by section. You can't go back to a submitted section. The recording plays once, without pausing.",
    de: 'Mit Zeitlimit, Teil für Teil. Abgegebene Teile kannst du nicht mehr öffnen. Der Hörtext läuft einmal ohne Pause.',
  },
  exModePractice: { hu: 'Gyakorló mód', en: 'Practice mode', de: 'Übungsmodus' },
  exModePracticeDesc: {
    hu: 'Időkorlát nélkül, szabadon válthatsz a részek között. A hanganyagot megállíthatod, és feladatonként ugorhatsz benne.',
    en: 'Untimed; move freely between sections. You can pause the recording and jump to each task.',
    de: 'Ohne Zeitlimit; wechsle frei zwischen den Teilen. Du kannst den Hörtext anhalten und zu jeder Aufgabe springen.',
  },
  exUntimedPaperNote: {
    hu: 'Ehhez a feladatsorhoz nincs megadva időkeret, ezért vizsga módban sincs időkorlát.',
    en: 'No section times are printed on this paper, so exam mode is untimed too.',
    de: 'Für diese Prüfung sind keine Zeiten angegeben, daher gibt es auch im Prüfungsmodus kein Zeitlimit.',
  },
  exWritingPhaseNote: {
    hu: 'Az íráskészség feladatait megírhatod, de még nem pontozzuk őket — az AI értékelés hamarosan érkezik.',
    en: "You can write the writing tasks, but they aren't scored yet — AI feedback is coming soon.",
    de: 'Du kannst die Schreibaufgaben lösen, sie werden aber noch nicht bewertet — KI-Feedback kommt bald.',
  },
  exBegin: { hu: 'Indítás', en: 'Begin', de: 'Beginnen' },
  exContinue: { hu: 'Folytatás', en: 'Continue', de: 'Fortsetzen' },
  exStartOver: { hu: 'Újrakezdés', en: 'Start over', de: 'Neu beginnen' },
  exSavedProgress: {
    hu: 'Van egy félbehagyott megoldásod ebben a módban.',
    en: 'You have an unfinished attempt in this mode.',
    de: 'Du hast in diesem Modus einen unfertigen Versuch.',
  },
  exExample: { hu: 'Példa', en: 'Example', de: 'Beispiel' },
  exChoose: { hu: 'Válassz…', en: 'Choose…', de: 'Wählen…' },
  exTypeHere: { hu: 'Írd ide…', en: 'Type here…', de: 'Hier schreiben…' },
  exMaxWords: { hu: 'legfeljebb {n} szó', en: 'at most {n} word(s)', de: 'höchstens {n} Wort/Wörter' },
  exTicked: { hu: '{n} / {max} bejelölve', en: '{n} of {max} ticked', de: '{n} von {max} angekreuzt' },
  exWordCount: { hu: '{n} szó', en: '{n} words', de: '{n} Wörter' },
  exWordTarget: { hu: 'cél: {min}–{max} szó', en: 'target: {min}–{max} words', de: 'Ziel: {min}–{max} Wörter' },
  exOpeningNote: {
    hu: 'A megszólítás adott, és nem számít bele a szószámba.',
    en: "The greeting is given and doesn't count towards the word count.",
    de: 'Die Anrede ist vorgegeben und zählt nicht zur Wortzahl.',
  },
  exCriteria: { hu: 'Értékelési szempontok', en: 'Scoring criteria', de: 'Bewertungskriterien' },
  exPointsShort: { hu: '{n} pont', en: '{n} pts', de: '{n} P.' },
  exSubmitSection: { hu: 'Rész beadása', en: 'Submit section', de: 'Teil abgeben' },
  exBeforeSubmit: { hu: 'Beadás előtt', en: 'Before you submit', de: 'Vor der Abgabe' },
  exTaskNumber: { hu: '{n}. feladat', en: 'Task {n}', de: 'Aufgabe {n}' },
  exWarnAllSame: {
    hu: '{task}: minden válaszod „{label}”. Ha minden válasz azonos, a feladat 0 pontot ér.',
    en: '{task}: every answer is “{label}”. If all answers are the same, the task scores 0.',
    de: '{task}: Alle Antworten sind „{label}“. Sind alle Antworten gleich, gibt es 0 Punkte.',
  },
  exWarnTooMany: {
    hu: '{task}: {n} jelölést tettél, de csak {max} megengedett. Minden fölösleges jelölés −1 pont.',
    en: '{task}: you ticked {n} boxes but only {max} are allowed. Each extra tick costs 1 point.',
    de: '{task}: Du hast {n} Kreuze gesetzt, erlaubt sind {max}. Jedes zusätzliche Kreuz kostet 1 Punkt.',
  },
  exWarnAllTicked: {
    hu: '{task}: minden négyzetet bejelöltél — ilyenkor a feladat 0 pontot ér.',
    en: '{task}: you ticked every box — the task then scores 0.',
    de: '{task}: Du hast alle Kästchen angekreuzt — dann gibt es 0 Punkte.',
  },
  exWarnUnanswered: { hu: '{n} kérdés megválaszolatlan.', en: '{n} question(s) unanswered.', de: '{n} Frage(n) unbeantwortet.' },
  exSubmitAnyway: { hu: 'Beadom így', en: 'Submit anyway', de: 'Trotzdem abgeben' },
  exKeepWorking: { hu: 'Vissza a feladatokhoz', en: 'Keep working', de: 'Weiterarbeiten' },
  exTimeLeft: { hu: 'Hátralévő idő: {time}', en: 'Time left: {time}', de: 'Verbleibende Zeit: {time}' },
  exOneMinute: {
    hu: 'Még 1 perc van hátra — utána a rész automatikusan beadódik.',
    en: 'One minute left — the section is then submitted automatically.',
    de: 'Noch 1 Minute — danach wird der Teil automatisch abgegeben.',
  },
  exTimeUp: { hu: 'Lejárt az idő, a részt beadtuk.', en: 'Time is up; the section was submitted.', de: 'Die Zeit ist um; der Teil wurde abgegeben.' },
  exRecordingEnded: {
    hu: 'Véget ért a felvétel, a részt beadtuk.',
    en: 'The recording has ended; the section was submitted.',
    de: 'Der Hörtext ist zu Ende; der Teil wurde abgegeben.',
  },
  exAudioLoading: { hu: 'Hanganyag betöltése…', en: 'Loading the recording…', de: 'Hörtext wird geladen…' },
  exAudioError: {
    hu: 'A hanganyagot nem sikerült betölteni.',
    en: "The recording couldn't be loaded.",
    de: 'Der Hörtext konnte nicht geladen werden.',
  },
  exAudioStart: { hu: 'Hanganyag indítása', en: 'Start the recording', de: 'Hörtext starten' },
  exAudioResume: { hu: 'Hanganyag folytatása', en: 'Resume the recording', de: 'Hörtext fortsetzen' },
  exAudioExamNote: {
    hu: 'Vizsga módban a felvétel egyszer szól végig: indítás után nem lehet megállítani vagy visszatekerni. A felvétel tartalmazza a feladatok elolvasására és a válaszadásra szánt szüneteket is.',
    en: "In exam mode the recording plays through once: after you start it you can't pause or rewind. It includes the pauses for reading the tasks and answering.",
    de: 'Im Prüfungsmodus läuft der Hörtext einmal durch: Nach dem Start kannst du nicht anhalten oder zurückspulen. Die Pausen zum Lesen und Antworten sind enthalten.',
  },
  exAudioEndsSection: {
    hu: 'A rész a felvétel végén automatikusan beadódik.',
    en: 'The section is submitted automatically when the recording ends.',
    de: 'Der Teil wird am Ende des Hörtexts automatisch abgegeben.',
  },
  exAudioPlaying: { hu: 'Lejátszás…', en: 'Playing…', de: 'Wird abgespielt…' },
  exAudioEnded: { hu: 'A felvétel véget ért.', en: 'The recording has ended.', de: 'Der Hörtext ist zu Ende.' },
  exJumpTo: { hu: 'Ugrás a feladatra:', en: 'Jump to task:', de: 'Zur Aufgabe springen:' },
  exResults: { hu: 'Eredmény', en: 'Results', de: 'Ergebnis' },
  exYourAnswer: { hu: 'Válaszod', en: 'Your answer', de: 'Deine Antwort' },
  exCorrectAnswer: { hu: 'Helyes válasz', en: 'Correct answer', de: 'Richtige Antwort' },
  exNoAnswer: { hu: '(nincs válasz)', en: '(no answer)', de: '(keine Antwort)' },
  exOverWordLimit: { hu: 'túl hosszú', en: 'too long', de: 'zu lang' },
  exRuleAllSame: {
    hu: 'Minden válasz „{label}” volt, ezért a feladat 0 pont.',
    en: 'Every answer was “{label}”, so the task scores 0.',
    de: 'Alle Antworten waren „{label}“, daher 0 Punkte.',
  },
  exRulePenalty: { hu: 'Fölösleges jelölések: −{n} pont.', en: 'Extra ticks: −{n} point(s).', de: 'Zusätzliche Kreuze: −{n} Punkt(e).' },
  exRuleAllTicked: {
    hu: 'Minden négyzet be volt jelölve, ezért a feladat 0 pont.',
    en: 'Every box was ticked, so the task scores 0.',
    de: 'Alle Kästchen waren angekreuzt, daher 0 Punkte.',
  },
  exShouldTick: { hu: 'jelölendő', en: 'should be ticked', de: 'ankreuzen' },
  exShouldNotTick: { hu: 'nem jelölendő', en: 'should not be ticked', de: 'nicht ankreuzen' },
  exTranscript: { hu: 'A hangzó szöveg átirata', en: 'Transcript of the recording', de: 'Transkript des Hörtexts' },
  exTaskPoints: { hu: '{n} / {max} pont', en: '{n} / {max} points', de: '{n} / {max} Punkte' },
  exRawPoints: { hu: 'Feladatpont', en: 'Task points', de: 'Aufgabenpunkte' },
  exPoints: { hu: 'Pontszám', en: 'Points', de: 'Punkte' },
  exSubmitFinal: {
    hu: 'Beadás után a rész válaszai már nem módosíthatók.',
    en: "Once submitted, this section's answers can't be changed.",
    de: 'Nach der Abgabe können die Antworten dieses Teils nicht mehr geändert werden.',
  },
  exScaledPoints: { hu: 'Vizsgapont', en: 'Exam points', de: 'Prüfungspunkte' },
  exPercent: { hu: '{n}%', en: '{n}%', de: '{n} %' },
  exYourText: { hu: 'A szöveged', en: 'Your text', de: 'Dein Text' },
  exModelAnswer: {
    hu: 'A megoldókulcs mintamegoldása',
    en: "The answer key's sample answer",
    de: 'Musterlösung aus dem Lösungsschlüssel',
  },
  exAiComing: {
    hu: 'Az AI értékelés hamarosan érkezik — ezt a részt addig nem pontozzuk.',
    en: "AI feedback is coming soon — until then this section isn't scored.",
    de: 'KI-Feedback kommt bald — bis dahin wird dieser Teil nicht bewertet.',
  },
  exNextSection: { hu: 'Következő rész', en: 'Next section', de: 'Nächster Teil' },
  exToSummary: { hu: 'Összesítés', en: 'Summary', de: 'Zusammenfassung' },
  exBackToSection: { hu: 'Vissza a részhez', en: 'Back to the section', de: 'Zurück zum Teil' },
  exSubmitted: { hu: 'beadva', en: 'submitted', de: 'abgegeben' },
  exSummaryTitle: { hu: 'Összesítés', en: 'Summary', de: 'Zusammenfassung' },
  exWrittenTotal: { hu: 'Írásbeli vizsgapont', en: 'Written exam points', de: 'Punkte der schriftlichen Prüfung' },
  exWritingExcludedErettsegi: {
    hu: 'Az Íráskészség ({n} vizsgapont) még nincs benne: az AI értékelés hamarosan érkezik.',
    en: "Writing ({n} exam points) isn't included yet: AI feedback is coming soon.",
    de: 'Das Schreiben ({n} Prüfungspunkte) ist noch nicht enthalten: KI-Feedback kommt bald.',
  },
  exNoGrade: {
    hu: 'Érdemjegyet nem számolunk, mert a szóbeli vizsga nem része a gyakorlásnak.',
    en: "No grade is calculated, because the oral exam isn't part of this practice.",
    de: 'Eine Note wird nicht berechnet, da die mündliche Prüfung nicht dazugehört.',
  },
  exWritingExcluded: {
    hu: 'Az íráskészség még nincs benne az összesítésben: az AI értékelés hamarosan érkezik.',
    en: "Writing isn't included in the summary yet: AI feedback is coming soon.",
    de: 'Das Schreiben ist noch nicht in der Zusammenfassung enthalten: KI-Feedback kommt bald.',
  },
  exNoPassClaim: {
    hu: 'Gyakorló eredmény, nem a vizsgaközpont hivatalos értékelése.',
    en: "A practice result, not the exam board's official assessment.",
    de: 'Ein Übungsergebnis, keine offizielle Bewertung der Prüfungsstelle.',
  },
  exNotScored: { hu: 'nincs pontozva', en: 'not scored', de: 'nicht bewertet' },
  exShowDetails: { hu: 'Részletek', en: 'Details', de: 'Details' },
  exBackToExams: { hu: 'Vissza a feladatsorokhoz', en: 'Back to the papers', de: 'Zurück zu den Prüfungen' },
  exPassageAgain: { hu: 'A szöveg (ugyanaz, mint az előző feladatnál)', en: 'The text (same as the previous task)', de: 'Der Text (wie in der vorigen Aufgabe)' },
  exLeaveConfirm: {
    hu: 'Kilépsz? A válaszaidat ebben a böngészőlapban megőrizzük.',
    en: 'Leave? Your answers are kept in this browser tab.',
    de: 'Verlassen? Deine Antworten bleiben in diesem Browser-Tab erhalten.',
  },
} as const satisfies Record<string, Record<Lang, string>>

export type MessageKey = keyof typeof messages

interface LanguageContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: MessageKey, vars?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

function readStoredLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'hu' || stored === 'en' || stored === 'de') return stored
  } catch {
    // Storage may be unavailable (private mode); fall through to the base language.
  }
  return 'hu'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readStoredLang)

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Ignore — the choice simply won't persist.
    }
  }, [])

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      setLang,
      t: (key, vars) => {
        let text: string = messages[key][lang]
        if (vars) for (const [k, v] of Object.entries(vars)) text = text.replace(`{${k}}`, String(v))
        return text
      },
    }),
    [lang, setLang],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}

// --- Localised titles for data records -------------------------------------------------

interface Titled {
  id: string
  title: string
  titleHu: string
}

function pick(lang: Lang, item: Titled, de: string | undefined): string {
  if (lang === 'hu') return item.titleHu
  if (lang === 'de') return de ?? item.title
  return item.title
}

export function localizeFeature(
  lang: Lang,
  f: Titled & { description: string; descriptionHu: string },
): { title: string; description: string } {
  const de = featureDe[f.id]
  return {
    title: pick(lang, f, de?.title),
    description: lang === 'hu' ? f.descriptionHu : lang === 'de' ? (de?.description ?? f.description) : f.description,
  }
}
/** "English title (localized)" for Hungarian/German, plain English for English. */
export function withGloss(lang: Lang, english: string, localized: string): string {
  return lang === 'en' || localized === english ? english : `${english} (${localized})`
}

export const localizeCategory = (lang: Lang, c: Titled) => pick(lang, c, categoryDe[c.id])
export const localizeSubcategory = (lang: Lang, s: Titled) => pick(lang, s, subcategoryDe[s.id])
export const localizeScenario = (lang: Lang, s: Titled) => pick(lang, s, scenarioDe[s.id])
