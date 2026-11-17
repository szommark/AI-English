import hotelCheckin from './hotel-checkin.jpg'
import restaurantOrder from './restaurant-order.jpg'
import askingDirections from './asking-directions.jpg'
import airportCheckin from './airport-checkin.jpg'
import postOffice from './post-office.png'
import doctorsVisit from './doctors-visit.png'
import meetingNewPeople from './meeting-new-people.png'
import apartmentViewing from './apartment-viewing.png'
import landlordRepairs from './landlord-repairs.jpg'
import parentTeacherConference from './parent-teacher-conference.jpg'
import clothesShopping from './clothes-shopping.jpg'
import hairdresser from './hairdresser.jpg'
import askingDriver from './asking-driver.jpg'
import networking from './networking.webp'

export const scenarioPhotos: Record<string, string> = {
  'hotel-checkin': hotelCheckin,
  'restaurant-order': restaurantOrder,
  // Restaurant role-play cards reuse the waiter photo (and its mouth calibration).
  'restaurant-booking': restaurantOrder,
  'restaurant-food-problem': restaurantOrder,
  'restaurant-recommendations': restaurantOrder,
  'restaurant-split-bill': restaurantOrder,
  'restaurant-delivery-problem': restaurantOrder,
  'asking-directions': askingDirections,
  'airport-checkin': airportCheckin,
  'post-office': postOffice,
  'doctors-visit': doctorsVisit,
  'meeting-new-people': meetingNewPeople,
  'apartment-viewing': apartmentViewing,
  'landlord-repairs': landlordRepairs,
  'parent-teacher-conference': parentTeacherConference,
  'clothes-shopping': clothesShopping,
  'hairdresser': hairdresser,
  'asking-driver': askingDriver,
  // Networking role-play cards share the conference coffee-break photo.
  'networking-conference-coffee': networking,
  'networking-elevator-pitch': networking,
  'networking-follow-up-coffee': networking,
}
