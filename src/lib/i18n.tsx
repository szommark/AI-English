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
