export type FeatureStatus = 'active' | 'coming-soon'
export type FeatureAccent = 'indigo' | 'violet' | 'amber' | 'emerald' | 'rose'

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
    description: 'Standalone pronunciation practice with detailed accuracy feedback.',
    descriptionHu: 'Önálló kiejtésgyakorlás részletes pontossági visszajelzéssel.',
    icon: 'Mic',
    accent: 'rose',
    status: 'active',
    route: '/pronunciation-session',
  },
]

export function getFeature(id: string): Feature | undefined {
  return features.find((f) => f.id === id)
}
