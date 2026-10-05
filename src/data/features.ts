export type FeatureStatus = 'active' | 'coming-soon'
export type FeatureAccent = 'indigo' | 'violet' | 'amber' | 'emerald' | 'rose' | 'teal' | 'sky' | 'fuchsia'

export interface Feature {
  id: string
  title: string
  titleHu: string
  description: string
  descriptionHu: string
  icon: string
  accent: FeatureAccent
  status: FeatureStatus
  route: string
}

export const features: Feature[] = [
  {
    id: 'conversational-english',
    title: 'Conversational English',
    titleHu: 'Társalgási angol',
    description: 'Practice real spoken situations — hotels, restaurants, directions, and more.',
    descriptionHu: 'Gyakorolj valós élethelyzeteket — szállodák, éttermek, útbaigazítás és más.',
    icon: 'Plane',
    accent: 'indigo',
    status: 'active',
    route: '/conversational-english',
  },
  {
    id: 'tutor-bot',
    title: 'Tutor Bot',
    titleHu: 'Oktató bot',
    description: 'Free-form conversation with a personal AI tutor that remembers your progress.',
    descriptionHu: 'Szabad beszélgetés egy személyes AI oktatóval, aki emlékszik a fejlődésedre.',
    icon: 'Bot',
    accent: 'violet',
    status: 'active',
    route: '/tutor-bot',
  },
  {
    id: 'grammar-coach',
    title: 'Grammar Coach',
    titleHu: 'Nyelvtani segítő',
    description: 'Clear explanations and practice for the grammar points you struggle with.',
    descriptionHu: 'Érthető magyarázatok és gyakorlás azokhoz a nyelvtani pontokhoz, amikkel nehezen boldogulsz.',
    icon: 'BookOpen',
    accent: 'amber',
    status: 'active',
    route: '/grammar-coach',
  },
  {
    id: 'business-english',
    title: 'Business English',
    titleHu: 'Üzleti angol',
    description: 'Meetings, emails, and workplace conversations for professional English.',
    descriptionHu: 'Meetingek, emailek és munkahelyi beszélgetések üzleti angolul.',
    icon: 'Briefcase',
    accent: 'emerald',
    status: 'coming-soon',
    route: '/coming-soon/business-english',
  },
  {
    id: 'pronunciation-session',
    title: 'Pronunciation Session',
    titleHu: 'Kiejtés gyakorlás',
    description: 'Sound Bank, Stress Patterns and Connected Speech: pronunciation practice with detailed accuracy feedback.',
    descriptionHu: 'Sound Bank, Stress Patterns és Connected Speech: kiejtésgyakorlás részletes pontossági visszajelzéssel.',
    icon: 'Mic',
    accent: 'rose',
    status: 'active',
    route: '/pronunciation',
  },
  {
    id: 'vocabulary',
    title: 'Vocabulary',
    titleHu: 'Szótanuló',
    description: 'Short daily practice with words from your teacher and your Tutor Bot conversations.',
    descriptionHu: 'Rövid napi gyakorlás a tanárodtól és az Oktató bottal folytatott beszélgetéseidből származó szavakkal.',
    icon: 'Languages',
    accent: 'teal',
    status: 'active',
    route: '/vocabulary',
  },
  {
    id: 'exam-prep',
    title: 'Exam Prep',
    titleHu: 'Érettségi és nyelvvizsga',
    description: 'Written papers for intermediate and advanced English/German érettségi; written and speaking B1, B2 and C1 English/German language exams.',
    descriptionHu: 'Írásbeli feladatsorok közép- és emelt szintű angol/német érettségire; írásbeli és szóbeli B1, B2 és C1 szintű angol/német nyelvvizsga.',
    icon: 'GraduationCap',
    accent: 'sky',
    status: 'active',
    route: '/exams',
  },
  {
    id: 'live-events',
    title: 'Live Online Events',
    titleHu: 'Élő online események',
    description: 'Live online sessions and group events with a teacher.',
    descriptionHu: 'Élő online foglalkozások és közös programok tanárral.',
    icon: 'Radio',
    accent: 'fuchsia',
    status: 'coming-soon',
    route: '/coming-soon/live-events',
  },
]

export function getFeature(id: string): Feature | undefined {
  return features.find((f) => f.id === id)
}
