import type { Scenario } from '../lib/types.js'

// Hungarian (`titleHu` / `hu` / `lineHu`) copy below was machine-drafted for the bilingual
// rehearsal screen and has not yet been reviewed by a native speaker.
export const scenarios: Scenario[] = [
  {
    id: 'hotel-checkin',
    title: 'Checking into a hotel',
    titleHu: 'Szállodai bejelentkezés',
    description: 'Arrive at your hotel, confirm your reservation, and ask about the room and facilities.',
    aiRole: 'a hotel receptionist',
    setting: 'the front desk of a hotel, where the user has just arrived to check in',
    systemPrompt:
      "You are a friendly hotel receptionist checking in a guest. Stay in character as the receptionist for a mid-range hotel. Keep every reply short and natural (2-3 sentences), and if the guest seems stuck or unsure what to say, gently ask a simple follow-up question to move the check-in forward.",
    rehearsalPhrases: [
      { en: 'Hi, I have a reservation under the name...', hu: 'Szia, van egy foglalásom ... néven.' },
      { en: 'Could I get a room with a sea view, if possible?', hu: 'Kaphatnék egy tengerre néző szobát, ha lehetséges?' },
      { en: 'What time is breakfast served?', hu: 'Hány órakor van a reggeli?' },
      { en: 'Is there Wi-Fi in the rooms, and what is the password?', hu: 'Van Wi-Fi a szobákban, és mi a jelszó?' },
      { en: 'What time is check-out?', hu: 'Hány órakor kell kijelentkezni?' },
      { en: 'Could you recommend a good place to eat nearby?', hu: 'Tudna ajánlani egy jó éttermet a közelben?' },
    ],
    rehearsalScript: [
      { speaker: 'Receptionist', line: 'Good afternoon, welcome to the Sunview Hotel. Do you have a reservation with us?', lineHu: 'Jó napot kívánok, üdvözöljük a Sunview Hotelben. Van foglalása nálunk?' },
      { speaker: 'You', line: "Yes, I have a reservation under the name Kovács, for three nights.", lineHu: 'Igen, van egy foglalásom Kovács néven, három éjszakára.' },
      { speaker: 'Receptionist', line: "Let me check... yes, here it is. Could I see your ID and a credit card for incidentals?", lineHu: 'Hadd nézzem meg... igen, megvan. Láthatnám a személyi igazolványát és egy bankkártyát az esetleges költségekhez?' },
      { speaker: 'You', line: 'Sure, here you go. Is it possible to get a room with a sea view?', lineHu: 'Persze, tessék. Lehetséges egy tengerre néző szobát kapni?' },
      { speaker: 'Receptionist', line: "Let me see what's available... yes, I can move you to a sea-view room on the fifth floor for a small extra fee. Would that work?", lineHu: 'Hadd nézzem meg, mi elérhető... igen, át tudom tenni egy tengerre néző szobába az ötödik emeleten egy kis felárért. Ez megfelelne?' },
      { speaker: 'You', line: "That sounds great, thank you.", lineHu: 'Ez remekül hangzik, köszönöm.' },
    ],
    // Visually estimated from the photo; refine at /dev/mouth-calibrator if it looks off.
    mouth: { mouthX: 50, mouthY: 30, mouthBoxWidth: 16, mouthBoxHeight: 12 },
  },
  {
    id: 'restaurant-order',
    title: 'Ordering food at a restaurant',
    titleHu: 'Rendelés egy étteremben',
    description: 'Sit down at a restaurant, ask about the menu, and order your meal and drinks.',
    aiRole: 'a waiter at a restaurant',
    setting: 'a restaurant table, where the user has just been seated and given a menu',
    systemPrompt:
      "You are a friendly waiter taking an order at a casual restaurant. Stay in character as the waiter. Keep every reply short and natural (2-3 sentences), and if the customer hesitates, gently suggest a popular dish or ask a simple clarifying question to keep the order moving.",
    rehearsalPhrases: [
      { en: 'Could I see the menu, please?', hu: 'Megnézhetném az étlapot, kérem?' },
      { en: "What do you recommend today?", hu: 'Mit ajánlana ma?' },
      { en: "I'll have the grilled chicken, please.", hu: 'Kérem a grillcsirkét.' },
      { en: 'Could I get that without onions?', hu: 'Kaphatnám hagyma nélkül?' },
      { en: 'Can I get a glass of water as well?', hu: 'Kaphatnék egy pohár vizet is?' },
      { en: 'Could we have the bill, please?', hu: 'Kérhetnénk a számlát?' },
    ],
    rehearsalScript: [
      { speaker: 'Waiter', line: "Hi there, welcome! Can I start you off with something to drink?", lineHu: 'Üdvözlöm! Hozhatok valamit inni, mielőtt kezdenénk?' },
      { speaker: 'You', line: "Yes, could I get a glass of orange juice, please?", lineHu: 'Igen, kaphatnék egy pohár narancslevet?' },
      { speaker: 'Waiter', line: "Of course. Are you ready to order, or do you need a few more minutes?", lineHu: 'Természetesen. Készen áll a rendelésre, vagy szüksége van még pár percre?' },
      { speaker: 'You', line: "I think I'm ready. What do you recommend today?", lineHu: 'Azt hiszem, készen állok. Mit ajánlana ma?' },
      { speaker: 'Waiter', line: "Our grilled salmon is very popular, and the pasta with mushrooms is great too.", lineHu: 'A grillezett lazacunk nagyon népszerű, és a gombás tészta is remek.' },
      { speaker: 'You', line: "I'll have the grilled salmon, please, without the side salad.", lineHu: 'Kérem a grillezett lazacot, saláta köret nélkül.' },
    ],
    // Visually estimated from the photo; refine at /dev/mouth-calibrator if it looks off.
    mouth: { mouthX: 48, mouthY: 23, mouthBoxWidth: 16, mouthBoxHeight: 13 },
  },
  {
    id: 'asking-directions',
    title: 'Asking for directions',
    titleHu: 'Útbaigazítás kérése',
    description: 'Stop a local on the street and ask how to get to a nearby landmark.',
    aiRole: 'a helpful local resident',
    setting: 'a street corner in an unfamiliar city, where the user has stopped a passerby to ask for directions',
    systemPrompt:
      "You are a friendly local resident giving directions to a tourist on the street. Stay in character. Keep every reply short and natural (2-3 sentences), and if the tourist seems confused, gently simplify the directions or ask what landmark they can already see to steer them forward.",
    rehearsalPhrases: [
      { en: 'Excuse me, could you help me? I\'m looking for the train station.', hu: 'Elnézést, tudna segíteni? A vasútállomást keresem.' },
      { en: 'Is it far from here?', hu: 'Messze van innen?' },
      { en: 'Should I turn left or right at the next corner?', hu: 'A következő saroknál balra vagy jobbra forduljak?' },
      { en: 'Is it within walking distance?', hu: 'Sétatávolságra van?' },
      { en: 'Could you point me in the right direction?', hu: 'Meg tudná mutatni a helyes irányt?' },
      { en: 'Thank you so much for your help!', hu: 'Nagyon köszönöm a segítségét!' },
    ],
    rehearsalScript: [
      { speaker: 'You', line: "Excuse me, could you help me? I'm trying to find the central market.", lineHu: 'Elnézést, tudna segíteni? A központi piacot keresem.' },
      { speaker: 'Local', line: "Sure! It's not far. Just go straight down this street for two blocks.", lineHu: 'Persze! Nincs messze. Csak menjen egyenesen ezen az utcán két háztömbnyit.' },
      { speaker: 'You', line: "Okay, straight for two blocks. Then what?", lineHu: 'Rendben, egyenesen két háztömbnyit. Aztán mi legyen?' },
      { speaker: 'Local', line: "Then turn left at the big church, and you'll see the market on your right.", lineHu: 'Aztán forduljon balra a nagy templomnál, és jobbra meglátja a piacot.' },
      { speaker: 'You', line: "Is it within walking distance from here?", lineHu: 'Sétatávolságra van innen?' },
      { speaker: 'Local', line: "Yes, about ten minutes on foot. You can't miss it.", lineHu: 'Igen, körülbelül tíz perc gyalog. Nem lehet eltéveszteni.' },
    ],
    // Visually estimated from the photo; refine at /dev/mouth-calibrator if it looks off.
    mouth: { mouthX: 71, mouthY: 40, mouthBoxWidth: 18, mouthBoxHeight: 15 },
  },
  {
    id: 'airport-checkin',
    title: 'Airport check-in',
    titleHu: 'Repülőtéri bejelentkezés',
    description: 'Check in for your flight at the airline desk and ask about luggage and seating.',
    aiRole: 'an airline check-in agent',
    setting: 'an airline check-in counter at the airport, where the user is checking in for a flight',
    systemPrompt:
      "You are an airline check-in agent helping a passenger check in for their flight. Stay in character. Keep every reply short and natural (2-3 sentences), and if the passenger seems unsure, gently ask a simple clarifying question (like about luggage or seating) to keep the check-in moving.",
    rehearsalPhrases: [
      { en: "Hi, I'd like to check in for my flight to London.", hu: 'Szia, szeretnék bejelentkezni a londoni járatomra.' },
      { en: "Here's my passport and booking reference.", hu: 'Tessék az útlevelem és a foglalási hivatkozásom.' },
      { en: 'How many bags am I allowed to check in?', hu: 'Hány csomagot adhatok fel?' },
      { en: 'Could I get a window seat, please?', hu: 'Kaphatnék ablak melletti ülést?' },
      { en: 'What time does boarding start?', hu: 'Hány órakor kezdődik a beszállás?' },
      { en: 'Which gate should I go to?', hu: 'Melyik kapuhoz menjek?' },
    ],
    rehearsalScript: [
      { speaker: 'Agent', line: "Good morning, may I see your passport and booking reference, please?", lineHu: 'Jó reggelt, láthatnám az útlevelét és a foglalási hivatkozását?' },
      { speaker: 'You', line: "Here you go. I'd like to check one bag as well.", lineHu: 'Tessék. Szeretnék feladni egy csomagot is.' },
      { speaker: 'Agent', line: "No problem, please place it on the scale... that's within the limit. Would you like a window or aisle seat?", lineHu: 'Semmi gond, kérem tegye a mérlegre... ez a limiten belül van. Ablak melletti vagy folyosói ülést szeretne?' },
      { speaker: 'You', line: "A window seat, please, if one is available.", lineHu: 'Ablak melletti ülést kérek, ha van szabad.' },
      { speaker: 'Agent', line: "Yes, I have one near the front. Here is your boarding pass, boarding starts at gate 14.", lineHu: 'Igen, van egy elöl. Itt a beszállókártyája, a beszállás a 14-es kapunál kezdődik.' },
      { speaker: 'You', line: "Great, thank you very much.", lineHu: 'Nagyszerű, nagyon köszönöm.' },
    ],
    // Visually estimated from the photo; refine at /dev/mouth-calibrator if it looks off.
    mouth: { mouthX: 50, mouthY: 31, mouthBoxWidth: 16, mouthBoxHeight: 12 },
  },
]

export function getScenario(id: string): Scenario | undefined {
  return scenarios.find((s) => s.id === id)
}
