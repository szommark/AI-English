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
  {
    id: 'daily-errands',
    title: 'Daily Errands & Bureaucracy',
    titleHu: 'Napi ügyintézés',
    tilePhoto: scenarioPhotos['post-office'],
    status: 'active',
    subcategories: [
      { id: 'post-office', title: 'Post Office', titleHu: 'Posta', tilePhoto: scenarioPhotos['post-office'], scenarioIds: ['post-office'] },
      { id: 'pharmacy', title: 'Pharmacy', titleHu: 'Gyógyszertár', scenarioIds: ['pharmacy'] },
      { id: 'bank', title: 'Bank', titleHu: 'Bank', scenarioIds: ['bank'] },
      { id: 'government-paperwork', title: 'Government/Paperwork', titleHu: 'Hivatali ügyintézés', scenarioIds: ['government-paperwork'] },
    ],
  },
  {
    id: 'healthcare',
    title: 'Healthcare',
    titleHu: 'Egészségügy',
    status: 'active',
    subcategories: [
      { id: 'doctors-visit', title: "Doctor's Visit", titleHu: 'Orvosi vizit', scenarioIds: ['doctors-visit'] },
      { id: 'booking-appointment', title: 'Booking an Appointment', titleHu: 'Időpontfoglalás', scenarioIds: ['booking-appointment'] },
      { id: 'emergency-call', title: 'Emergency Call', titleHu: 'Segélyhívás', scenarioIds: ['emergency-call'] },
      { id: 'urgent-care', title: 'Urgent Care', titleHu: 'Sürgősségi ellátás', scenarioIds: ['urgent-care'] },
    ],
  },
  {
    id: 'housing-living',
    title: 'Housing & Living',
    titleHu: 'Lakhatás',
    status: 'active',
    subcategories: [
      { id: 'apartment-viewing', title: 'Apartment Viewing', titleHu: 'Lakásnézés', scenarioIds: ['apartment-viewing'] },
      { id: 'landlord-repairs', title: 'Landlord/Repairs', titleHu: 'Bérbeadó és javítások', scenarioIds: ['landlord-repairs'] },
      { id: 'utilities-setup', title: 'Utilities Setup', titleHu: 'Közművek beindítása', scenarioIds: ['utilities-setup'] },
      { id: 'neighbors', title: 'Neighbors', titleHu: 'Szomszédok', scenarioIds: ['neighbors'] },
    ],
  },
  {
    id: 'phone-customer-service',
    title: 'Phone & Customer Service',
    titleHu: 'Telefonos ügyfélszolgálat',
    status: 'active',
    subcategories: [
      { id: 'booking-cancelling', title: 'Booking/Cancelling', titleHu: 'Foglalás/Lemondás', scenarioIds: ['booking-cancelling'] },
      { id: 'complaint-call', title: 'Complaint Call', titleHu: 'Panaszbejelentés', scenarioIds: ['complaint-call'] },
      { id: 'tech-support', title: 'Tech Support', titleHu: 'Műszaki ügyfélszolgálat', scenarioIds: ['tech-support'] },
      { id: 'delivery-courier', title: 'Delivery/Courier', titleHu: 'Futárszolgálat', scenarioIds: ['delivery-courier'] },
    ],
  },
  {
    id: 'social-small-talk',
    title: 'Social & Small Talk',
    titleHu: 'Társasági beszélgetés',
    status: 'active',
    subcategories: [
      { id: 'meeting-new-people', title: 'Meeting New People', titleHu: 'Új emberek megismerése', scenarioIds: ['meeting-new-people'] },
      { id: 'making-plans', title: 'Making Plans', titleHu: 'Program egyeztetése', scenarioIds: ['making-plans'] },
      { id: 'party-chitchat', title: 'Party Chit-chat', titleHu: 'Csevegés bulikban', scenarioIds: ['party-chitchat'] },
      { id: 'weather-news', title: 'Weather/News', titleHu: 'Időjárás és hírek', scenarioIds: ['weather-news'] },
    ],
  },
  {
    id: 'shopping-complaints',
    title: 'Shopping & Complaints',
    titleHu: 'Vásárlás és panaszkezelés',
    status: 'active',
    subcategories: [
      { id: 'clothes-shopping', title: 'Clothes Shopping', titleHu: 'Ruhavásárlás', scenarioIds: ['clothes-shopping'] },
      { id: 'returns', title: 'Returns', titleHu: 'Termék visszavitele', scenarioIds: ['returns'] },
      { id: 'hairdresser', title: 'Hairdresser', titleHu: 'Fodrász', scenarioIds: ['hairdresser'] },
      { id: 'product-problem', title: 'Product Problem', titleHu: 'Termékhiba', scenarioIds: ['product-problem'] },
    ],
  },
  {
    id: 'public-transport',
    title: 'Public Transport & Transit',
    titleHu: 'Tömegközlekedés',
    status: 'active',
    subcategories: [
      { id: 'buying-ticket', title: 'Buying a Ticket', titleHu: 'Jegyvásárlás', scenarioIds: ['buying-ticket'] },
      { id: 'asking-driver', title: 'Asking the Driver', titleHu: 'Kérdés a sofőrtől', scenarioIds: ['asking-driver'] },
      { id: 'delays', title: 'Delays', titleHu: 'Késések', scenarioIds: ['delays'] },
      { id: 'taxi-rideshare', title: 'Taxi/Rideshare', titleHu: 'Taxi és applikációs fuvar', scenarioIds: ['taxi-rideshare'] },
    ],
  },
  {
    id: 'family-parenting',
    title: 'Family & Parenting',
    titleHu: 'Család és szülőség',
    status: 'active',
    subcategories: [
      { id: 'parent-teacher-conference', title: 'Parent-Teacher Conference', titleHu: 'Szülői értekezlet', scenarioIds: ['parent-teacher-conference'] },
      { id: 'playdates', title: 'Playdates', titleHu: 'Játszódélutánok', scenarioIds: ['playdates'] },
      { id: 'family-gathering', title: 'Family Gathering', titleHu: 'Családi összejövetel', scenarioIds: ['family-gathering'] },
      { id: 'childcare', title: 'Childcare', titleHu: 'Gyermekfelügyelet', scenarioIds: ['childcare'] },
    ],
  },
]

export function getCategory(id: string): Category | undefined {
  return categories.find((c) => c.id === id)
}

/** Finds the category+subcategory a given scenario id lives under, if any. */
export function getCategoryForScenario(
  scenarioId: string
): { category: Category; subcategory: Subcategory } | undefined {
  for (const category of categories) {
    const subcategory = category.subcategories.find((s) => s.scenarioIds.includes(scenarioId))
    if (subcategory) return { category, subcategory }
  }
  return undefined
}
