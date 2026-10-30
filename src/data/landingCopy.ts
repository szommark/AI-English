import type { Lang } from '../lib/i18n'

/** Where the teacher/school and company panels' "Get in touch" button sends its email. */
export const CONTACT_EMAIL = ''

export interface LandingPanelCopy {
  title: string
  /** Why it is worth registering, shown under the title. */
  summary: string
  cta: string
}

/** The signed-out home page (src/components/WelcomePanels.tsx): companies | learners + platform | teachers. */
export interface LandingCopy {
  business: LandingPanelCopy
  learners: LandingPanelCopy
  /** Under the learner panel's button: "Already have an account?" + sign-in link. */
  haveAccount: string
  platform: { title: string; paragraphs: string[] }
  teachers: LandingPanelCopy
}

// Placeholder wording: the final texts come from the site owner.
const hu: LandingCopy = {
  business: {
    title: 'Cégeknek és vállalkozásoknak',
    summary: '[Ide jön: miért érdemes egy cégnek regisztrálnia — 2–3 mondat.]',
    cta: 'Kapcsolatfelvétel',
  },
  learners: {
    title: 'Nyelvtanulóknak',
    summary: '[Ide jön: miért érdemes nyelvtanulóként regisztrálni — 2–3 mondat.]',
    cta: 'Fiók létrehozása',
  },
  haveAccount: 'Már van fiókod?',
  platform: {
    title: 'A platformról és az adaptív nyelvtanulásról',
    paragraphs: [
      '[Ide jön: rövid bemutatás az AVaLoN platformról.]',
      '[Ide jön: mit jelent az adaptív nyelvtanulás, és hogyan igazodik a tanulóhoz.]',
    ],
  },
  teachers: {
    title: 'Tanároknak és nyelviskoláknak',
    summary: '[Ide jön: miért érdemes tanárként vagy nyelviskolaként regisztrálni — 2–3 mondat.]',
    cta: 'Kapcsolatfelvétel',
  },
}

const en: LandingCopy = {
  business: {
    title: 'For companies and businesses',
    summary: '[Text to come: why a company should register — 2–3 sentences.]',
    cta: 'Get in touch',
  },
  learners: {
    title: 'For language learners',
    summary: '[Text to come: why it is worth registering as a learner — 2–3 sentences.]',
    cta: 'Create account',
  },
  haveAccount: 'Already have an account?',
  platform: {
    title: 'About the platform and adaptive learning',
    paragraphs: [
      '[Text to come: a short introduction to the AVaLoN platform.]',
      '[Text to come: what adaptive language learning means and how it adjusts to the learner.]',
    ],
  },
  teachers: {
    title: 'For teachers and language schools',
    summary: '[Text to come: why it is worth registering as a teacher or language school — 2–3 sentences.]',
    cta: 'Get in touch',
  },
}

/** German falls back to English until a translation is written. */
export const landingCopy: Record<Lang, LandingCopy> = { hu, en, de: en }
