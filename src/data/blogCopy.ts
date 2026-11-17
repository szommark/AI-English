import type { Lang } from '../lib/i18n'

/** Interface text of the public blog (/blog, /blog/:slug, the Blog link in the signed-out top menu). */
export interface BlogCopy {
  nav: string
  kicker: string
  title: string
  intro: string
  readMore: string
  /** On a card whose post is read on tobbmintangol.hu. */
  externalNote: string
  back: string
  notFound: string
  loadError: string
  empty: string
  /** Shown above a post whose text exists only in Hungarian, when the UI is in English or German. */
  onlyHungarian: string
}

export const blogCopy: Record<Lang, BlogCopy> = {
  hu: {
    nav: 'Blog',
    kicker: 'Blog',
    title: 'Gondolatok nyelvről, tanulásról, közösségről',
    intro: 'Írások a nyelvtanulásról, a coachingról és az angol klubról.',
    readMore: 'Tovább olvasom',
    externalNote: 'tobbmintangol.hu',
    back: 'Vissza a bloghoz',
    notFound: 'Ezt a bejegyzést nem találjuk.',
    loadError: 'A blog most nem töltődött be. Próbáld újra később.',
    empty: 'Még nincs bejegyzés.',
    onlyHungarian: 'Ez a bejegyzés csak magyarul olvasható.',
  },
  en: {
    nav: 'Blog',
    kicker: 'Blog',
    title: 'Thoughts on language, learning and community',
    intro: 'Writing on language learning, coaching and the English club.',
    readMore: 'Read more',
    externalNote: 'tobbmintangol.hu',
    back: 'Back to the blog',
    notFound: "We can't find this post.",
    loadError: "The blog didn't load. Please try again later.",
    empty: 'No posts yet.',
    onlyHungarian: 'This post is available in Hungarian only.',
  },
  de: {
    nav: 'Blog',
    kicker: 'Blog',
    title: 'Gedanken über Sprache, Lernen und Gemeinschaft',
    intro: 'Texte über das Sprachenlernen, Coaching und den Englischclub.',
    readMore: 'Weiterlesen',
    externalNote: 'tobbmintangol.hu',
    back: 'Zurück zum Blog',
    notFound: 'Diesen Beitrag finden wir nicht.',
    loadError: 'Der Blog konnte nicht geladen werden. Bitte versuche es später erneut.',
    empty: 'Noch keine Beiträge.',
    onlyHungarian: 'Dieser Beitrag ist nur auf Ungarisch verfügbar.',
  },
}

const DATE_LOCALES: Record<Lang, string> = { hu: 'hu-HU', en: 'en-GB', de: 'de-DE' }

export function formatPostDate(iso: string, lang: Lang): string {
  return new Date(iso).toLocaleDateString(DATE_LOCALES[lang], { year: 'numeric', month: 'long', day: 'numeric' })
}
