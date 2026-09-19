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
export const localizeCategory = (lang: Lang, c: Titled) => pick(lang, c, categoryDe[c.id])
export const localizeSubcategory = (lang: Lang, s: Titled) => pick(lang, s, subcategoryDe[s.id])
export const localizeScenario = (lang: Lang, s: Titled) => pick(lang, s, scenarioDe[s.id])
