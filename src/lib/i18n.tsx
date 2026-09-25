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
  crumbPronunciation: { hu: 'Kiejtési térkép', en: 'Pronunciation Chart', de: 'Ausspracheübersicht' },
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
  vcTabPractice: { hu: 'Gyakorlás', en: 'Practice', de: 'Üben' },
  vcTabFromTeacher: { hu: 'A tanáromtól', en: 'From my teacher', de: 'Von meiner Lehrkraft' },
  vcDueNow: { hu: 'Esedékes ismétlés', en: 'Reviews due', de: 'Fällige Wiederholungen' },
  vcNewToday: { hu: 'Új szó mára', en: 'New words today', de: 'Neue Wörter heute' },
  vcLearnedStat: { hu: 'Megtanult szó', en: 'Words learned', de: 'Gelernte Wörter' },
  vcStart: { hu: 'Gyakorlás indítása', en: 'Start practice', de: 'Übung starten' },
  vcStarting: { hu: 'Betöltés…', en: 'Loading…', de: 'Wird geladen…' },
  vcNothingDue: {
    hu: 'Most nincs mit gyakorolni — szép munka!',
    en: 'Nothing to practise right now — nice work!',
    de: 'Gerade gibt es nichts zu üben — gut gemacht!',
  },
  vcNextDue: { hu: 'Következő ismétlés {when}.', en: 'Next review {when}.', de: 'Nächste Wiederholung {when}.' },
  vcNoCards: {
    hu: 'Még nincsenek szavaid. A tanárodtól kapott szólisták és az Oktató bottal folytatott beszélgetéseid szavai itt jelennek meg.',
    en: "You have no words yet. Words from your teacher's lists and your Tutor Bot conversations show up here.",
    de: 'Du hast noch keine Wörter. Wörter aus den Listen deiner Lehrkraft und aus deinen Tutor-Bot-Gesprächen erscheinen hier.',
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
  vcFromTeacherEmpty: {
    hu: 'Még nem kaptál szólistát a tanárodtól.',
    en: "Your teacher hasn't assigned you any word lists yet.",
    de: 'Deine Lehrkraft hat dir noch keine Wortlisten zugewiesen.',
  },
  vcFromTeacherBy: { hu: 'Tanár: {email}', en: 'From {email}', de: 'Von {email}' },

  // Tutor Bot words and "My words" (Vocabulary Builder Phase 4)
  vcTabMyWords: { hu: 'Szavaim', en: 'My words', de: 'Meine Wörter' },
  vcFilterAll: { hu: 'Mind', en: 'All', de: 'Alle' },
  vcFilterTeacher: { hu: 'Tanártól', en: 'From my teacher', de: 'Von der Lehrkraft' },
  vcFilterTutor: { hu: 'Beszélgetésből', en: 'From conversations', de: 'Aus Gesprächen' },
  vcFilterEmpty: { hu: 'Itt nincs szó.', en: 'No words here.', de: 'Hier gibt es keine Wörter.' },
  vcStageNew: { hu: 'új', en: 'new', de: 'neu' },
  vcStageLearning: { hu: 'tanulás alatt', en: 'learning', de: 'wird gelernt' },
  vcStageLearned: { hu: 'megtanulva', en: 'learned', de: 'gelernt' },
  vcPausedTag: { hu: 'szüneteltetve', en: 'paused', de: 'pausiert' },
  vcRemoveWord: { hu: 'Eltávolítás', en: 'Remove', de: 'Entfernen' },
  vcPauseWord: { hu: 'Szüneteltetés', en: 'Pause', de: 'Pausieren' },
  vcResumeWord: { hu: 'Folytatás', en: 'Resume', de: 'Fortsetzen' },
  vcConfirmRemove: {
    hu: 'Eltávolítod ezt a szót: „{term}”? Az eddigi gyakorlásod is törlődik.',
    en: 'Remove “{term}”? Your practice history for it is deleted too.',
    de: '„{term}“ entfernen? Dein Übungsverlauf dazu wird ebenfalls gelöscht.',
  },
  vcPauseHint: {
    hu: 'A tanártól kapott szavakat szüneteltetheted, de nem törölheted.',
    en: 'Words from your teacher can be paused, not removed.',
    de: 'Wörter von deiner Lehrkraft kannst du pausieren, aber nicht entfernen.',
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

  // Vocabulary: daily review vs. Full practice (design §7.1)
  vcReviewTitle: { hu: 'Napi ismétlés', en: 'Daily review', de: 'Tägliche Wiederholung' },
  vcReviewHint: {
    hu: 'Az esedékes és az új szavak, egy-egy feladattal. Ez alapján dől el, mikor jön elő újra egy szó.',
    en: 'Words that are due, plus new ones, one exercise each. This decides when each word comes back.',
    de: 'Fällige und neue Wörter, je eine Übung. Danach richtet sich, wann ein Wort wiederkommt.',
  },
  vcDrillTitle: { hu: 'Teljes gyakorlás', en: 'Full practice', de: 'Komplettübung' },
  vcDrillHint: {
    hu: 'Te választod ki a szavakat, és mindegyiken végigmész az összes feladattal: jelentés, felidézés, kiegészítés, hallás utáni értés. Az ismétlések ütemezését nem változtatja meg.',
    en: "Pick any words and go through every exercise with them: meaning, recall, gap-fill and listening. It doesn't change your review schedule.",
    de: 'Wähle beliebige Wörter und mach alle Übungen damit: Bedeutung, Abrufen, Lückentext und Hören. Dein Wiederholungsplan bleibt unverändert.',
  },
  vcDrillChooseWords: { hu: 'Szavak kiválasztása', en: 'Choose words', de: 'Wörter auswählen' },
  vcDrillSetupHint: {
    hu: 'Indulj ki az összes szavadból vagy egy tanári szólistából, majd pipáld be vagy vedd ki a szavakat.',
    en: "Start from all your words or a teacher's list, then tick or untick words to add or remove them.",
    de: 'Beginne mit all deinen Wörtern oder einer Liste deiner Lehrkraft und hake dann Wörter an oder ab.',
  },
  vcDrillSource: { hu: 'Szavak forrása', en: 'Start from', de: 'Ausgangspunkt' },
  vcDrillAllWords: { hu: 'Minden szavam ({n})', en: 'All my words ({n})', de: 'Alle meine Wörter ({n})' },
  vcDrillListOption: { hu: '{title} ({n})', en: '{title} ({n})', de: '{title} ({n})' },
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
  vcDrillChangeWords: { hu: 'Más szavak', en: 'Change words', de: 'Andere Wörter' },
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
