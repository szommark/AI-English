import type { Scenario } from '../lib/types.js'

export const scenarios: Scenario[] = [
  {
    id: 'hotel-checkin',
    title: 'Checking into a hotel',
    description: 'Arrive at your hotel, confirm your reservation, and ask about the room and facilities.',
    aiRole: 'a hotel receptionist',
    setting: 'the front desk of a hotel, where the user has just arrived to check in',
    systemPrompt:
      "You are a friendly hotel receptionist checking in a guest. Stay in character as the receptionist for a mid-range hotel. Keep every reply short and natural (2-3 sentences), and if the guest seems stuck or unsure what to say, gently ask a simple follow-up question to move the check-in forward.",
    rehearsalPhrases: [
      'Hi, I have a reservation under the name...',
      'Could I get a room with a sea view, if possible?',
      'What time is breakfast served?',
      'Is there Wi-Fi in the rooms, and what is the password?',
      'What time is check-out?',
      'Could you recommend a good place to eat nearby?',
    ],
    rehearsalScript: [
      { speaker: 'Receptionist', line: 'Good afternoon, welcome to the Sunview Hotel. Do you have a reservation with us?' },
      { speaker: 'You', line: "Yes, I have a reservation under the name Kovács, for three nights." },
      { speaker: 'Receptionist', line: "Let me check... yes, here it is. Could I see your ID and a credit card for incidentals?" },
      { speaker: 'You', line: 'Sure, here you go. Is it possible to get a room with a sea view?' },
      { speaker: 'Receptionist', line: "Let me see what's available... yes, I can move you to a sea-view room on the fifth floor for a small extra fee. Would that work?" },
      { speaker: 'You', line: "That sounds great, thank you." },
    ],
  },
  {
    id: 'restaurant-order',
    title: 'Ordering food at a restaurant',
    description: 'Sit down at a restaurant, ask about the menu, and order your meal and drinks.',
    aiRole: 'a waiter at a restaurant',
    setting: 'a restaurant table, where the user has just been seated and given a menu',
    systemPrompt:
      "You are a friendly waiter taking an order at a casual restaurant. Stay in character as the waiter. Keep every reply short and natural (2-3 sentences), and if the customer hesitates, gently suggest a popular dish or ask a simple clarifying question to keep the order moving.",
    rehearsalPhrases: [
      'Could I see the menu, please?',
      "What do you recommend today?",
      "I'll have the grilled chicken, please.",
      'Could I get that without onions?',
      'Can I get a glass of water as well?',
      'Could we have the bill, please?',
    ],
    rehearsalScript: [
      { speaker: 'Waiter', line: "Hi there, welcome! Can I start you off with something to drink?" },
      { speaker: 'You', line: "Yes, could I get a glass of orange juice, please?" },
      { speaker: 'Waiter', line: "Of course. Are you ready to order, or do you need a few more minutes?" },
      { speaker: 'You', line: "I think I'm ready. What do you recommend today?" },
      { speaker: 'Waiter', line: "Our grilled salmon is very popular, and the pasta with mushrooms is great too." },
      { speaker: 'You', line: "I'll have the grilled salmon, please, without the side salad." },
    ],
  },
  {
    id: 'asking-directions',
    title: 'Asking for directions',
    description: 'Stop a local on the street and ask how to get to a nearby landmark.',
    aiRole: 'a helpful local resident',
    setting: 'a street corner in an unfamiliar city, where the user has stopped a passerby to ask for directions',
    systemPrompt:
      "You are a friendly local resident giving directions to a tourist on the street. Stay in character. Keep every reply short and natural (2-3 sentences), and if the tourist seems confused, gently simplify the directions or ask what landmark they can already see to steer them forward.",
    rehearsalPhrases: [
      'Excuse me, could you help me? I\'m looking for the train station.',
      'Is it far from here?',
      'Should I turn left or right at the next corner?',
      'Is it within walking distance?',
      'Could you point me in the right direction?',
      'Thank you so much for your help!',
    ],
    rehearsalScript: [
      { speaker: 'You', line: "Excuse me, could you help me? I'm trying to find the central market." },
      { speaker: 'Local', line: "Sure! It's not far. Just go straight down this street for two blocks." },
      { speaker: 'You', line: "Okay, straight for two blocks. Then what?" },
      { speaker: 'Local', line: "Then turn left at the big church, and you'll see the market on your right." },
      { speaker: 'You', line: "Is it within walking distance from here?" },
      { speaker: 'Local', line: "Yes, about ten minutes on foot. You can't miss it." },
    ],
  },
  {
    id: 'airport-checkin',
    title: 'Airport check-in',
    description: 'Check in for your flight at the airline desk and ask about luggage and seating.',
    aiRole: 'an airline check-in agent',
    setting: 'an airline check-in counter at the airport, where the user is checking in for a flight',
    systemPrompt:
      "You are an airline check-in agent helping a passenger check in for their flight. Stay in character. Keep every reply short and natural (2-3 sentences), and if the passenger seems unsure, gently ask a simple clarifying question (like about luggage or seating) to keep the check-in moving.",
    rehearsalPhrases: [
      "Hi, I'd like to check in for my flight to London.",
      "Here's my passport and booking reference.",
      'How many bags am I allowed to check in?',
      'Could I get a window seat, please?',
      'What time does boarding start?',
      'Which gate should I go to?',
    ],
    rehearsalScript: [
      { speaker: 'Agent', line: "Good morning, may I see your passport and booking reference, please?" },
      { speaker: 'You', line: "Here you go. I'd like to check one bag as well." },
      { speaker: 'Agent', line: "No problem, please place it on the scale... that's within the limit. Would you like a window or aisle seat?" },
      { speaker: 'You', line: "A window seat, please, if one is available." },
      { speaker: 'Agent', line: "Yes, I have one near the front. Here is your boarding pass, boarding starts at gate 14." },
      { speaker: 'You', line: "Great, thank you very much." },
    ],
  },
]

export function getScenario(id: string): Scenario | undefined {
  return scenarios.find((s) => s.id === id)
}
