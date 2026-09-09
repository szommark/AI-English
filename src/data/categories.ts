import type { FeatureStatus } from './features'
import { scenarioPhotos } from '../assets/scenarioPhotos'

export interface Subcategory {
  id: string
  title: string
  titleHu: string
  /** Falls back to <PlaceholderTileArt /> when omitted. */
  tilePhoto?: string
  scenarioIds: string[]
}

export interface Category {
  id: string
  title: string
  titleHu: string
  tilePhoto?: string
  status: FeatureStatus
  subcategories: Subcategory[]
}

// `titleHu` copy below was machine-drafted and has not yet been reviewed by a native
// speaker — same disclaimer already at the top of scenarios.ts.
export const categories: Category[] = [
  {
    id: 'holiday-english',
    title: 'Holiday English',
    titleHu: 'Nyaralási angol',
    tilePhoto: scenarioPhotos['airport-checkin'],
    status: 'active',
    subcategories: [
      { id: 'restaurant', title: 'Restaurant', titleHu: 'Étterem', tilePhoto: scenarioPhotos['restaurant-order'], scenarioIds: ['restaurant-order'] },
      { id: 'hotel', title: 'Hotel', titleHu: 'Szálloda', tilePhoto: scenarioPhotos['hotel-checkin'], scenarioIds: ['hotel-checkin'] },
      { id: 'airport', title: 'Airport', titleHu: 'Repülőtér', tilePhoto: scenarioPhotos['airport-checkin'], scenarioIds: ['airport-checkin'] },
      { id: 'street', title: 'In the Street', titleHu: 'Az utcán', tilePhoto: scenarioPhotos['asking-directions'], scenarioIds: ['asking-directions'] },
    ],
  },
  { id: 'daily-errands', title: 'Daily Errands & Bureaucracy', titleHu: 'Napi ügyintézés', status: 'coming-soon', subcategories: [] },
  { id: 'healthcare', title: 'Healthcare', titleHu: 'Egészségügy', status: 'coming-soon', subcategories: [] },
  { id: 'housing-living', title: 'Housing & Living', titleHu: 'Lakhatás', status: 'coming-soon', subcategories: [] },
  { id: 'phone-customer-service', title: 'Phone & Customer Service', titleHu: 'Telefonos ügyfélszolgálat', status: 'coming-soon', subcategories: [] },
  { id: 'social-small-talk', title: 'Social & Small Talk', titleHu: 'Társasági beszélgetés', status: 'coming-soon', subcategories: [] },
  { id: 'shopping-complaints', title: 'Shopping & Complaints', titleHu: 'Vásárlás és panaszkezelés', status: 'coming-soon', subcategories: [] },
  { id: 'public-transport', title: 'Public Transport & Transit', titleHu: 'Tömegközlekedés', status: 'coming-soon', subcategories: [] },
  { id: 'family-parenting', title: 'Family & Parenting', titleHu: 'Család és szülőség', status: 'coming-soon', subcategories: [] },
]

export function getCategory(id: string): Category | undefined {
  return categories.find((c) => c.id === id)
}
