// Printable A/B role cards, keyed by scenario id. Each set prints as one A4 page: the Role A
// card on top and the Role B card below a dashed cut line, each with a QR code that opens the
// scenario's conversation (src/lib/roleCardPrint.ts). Texts are the user's own card set
// ("networking-cards.pdf"), kept word for word. In the app the learner plays Role A and the
// AI plays Role B.

export type CardRole = 'A' | 'B'

export interface RoleCardSide {
  /** Character name, e.g. "Alex". */
  name: string
  /** Short persona heading, e.g. "The Newcomer". */
  persona: string
  situation: string
  goal: string
  phrases: string[]
}

export interface RoleCardSet {
  /** Set name shown on the card, e.g. "Networking". */
  set: string
  number: number
  total: number
  title: string
  /** One-line cultural tip under the title. */
  styleNote: string
  a: RoleCardSide
  b: RoleCardSide
  lines: { role: CardRole; text: string }[]
}

export const roleCards: Record<string, RoleCardSet> = {
  'networking-conference-coffee': {
    set: 'Networking',
    number: 1,
    total: 3,
    title: 'Coffee break at a conference',
    styleNote: 'US style: smile, firm handshake, first names, upbeat tone.',
    a: {
      name: 'Alex',
      persona: 'The Newcomer',
      situation: "It's your first conference and you don't know anyone here.",
      goal: 'Start a chat and make one new contact.',
      phrases: ['Mind if I join you?', 'Great to meet you!'],
    },
    b: {
      name: 'Sam',
      persona: 'The Regular',
      situation: 'This is your fifth year here, and you love meeting new people.',
      goal: 'Welcome the newcomer and offer to help.',
      phrases: ['What brings you here?', "Let's keep in touch!"],
    },
    lines: [
      { role: 'A', text: "Hi, I'm Alex. Is this your first time at this conference?" },
      { role: 'B', text: "Hey Alex, I'm Sam! Nope, it's my fifth year. How are you liking it so far?" },
      { role: 'A', text: 'Love it. The keynote was great! So, what do you do, Sam?' },
      { role: 'B', text: 'I run marketing at a software startup. How about you?' },
      { role: 'A', text: "I'm a UX designer. I'd love to meet more people in the startup world." },
      { role: 'B', text: "Come to the mixer tonight! I'll introduce you to a few folks." },
      { role: 'A', text: "That'd be awesome, thanks! Here, let me give you my card." },
    ],
  },
  'networking-elevator-pitch': {
    set: 'Networking',
    number: 2,
    total: 3,
    title: 'The elevator pitch at a mixer',
    styleNote: 'US style: be confident and specific. Back it up with one number.',
    a: {
      name: 'Jordan',
      persona: 'The Job Seeker',
      situation: 'You want a new job in data analytics. You meet a hiring manager.',
      goal: 'Give a short, confident pitch, then ask for a coffee chat.',
      phrases: ["I'm a … who helps …", 'Can I send you my resume?'],
    },
    b: {
      name: 'Taylor',
      persona: 'The Hiring Manager',
      situation: 'You lead an analytics team and came to this mixer to find talent.',
      goal: 'Learn what this person can do and decide the next step.',
      phrases: ['What are you looking for?', 'Send me your resume.'],
    },
    lines: [
      { role: 'B', text: "So, Jordan, what's your story? What do you do?" },
      { role: 'A', text: "I'm a data analyst who helps retailers turn numbers into smart decisions." },
      { role: 'B', text: 'Interesting! What kind of results have you seen?' },
      { role: 'A', text: "Last year I helped a client cut waste by 15%. I'm looking for my next challenge." },
      { role: 'B', text: "We're hiring on our analytics team, actually. Let's keep in touch!" },
      { role: 'A', text: 'Awesome! Would you be open to grabbing coffee next week?' },
      { role: 'B', text: "Sure! Email me and we'll set something up." },
    ],
  },
  'networking-follow-up-coffee': {
    set: 'Networking',
    number: 3,
    total: 3,
    title: 'The follow-up coffee chat',
    styleNote: 'US style: say thanks, keep it short, offer something in return.',
    a: {
      name: 'Riley',
      persona: 'The Career Changer',
      situation: 'You want to switch to product management. You met Morgan last week.',
      goal: 'Get advice and ask for one more introduction.',
      phrases: ['Could I follow up by email?', 'I owe you a coffee!'],
    },
    b: {
      name: 'Morgan',
      persona: 'The Busy Mentor',
      situation: "You're a product manager and agreed to a 20-minute coffee chat.",
      goal: 'Give useful advice and decide how much to help.',
      phrases: ['Keep me posted!', "Don't be a stranger!"],
    },
    lines: [
      { role: 'A', text: "Thanks for taking the time, Morgan! I know you're busy." },
      { role: 'B', text: "Happy to! It was great meeting you at the mixer. What's on your mind?" },
      { role: 'A', text: "I'd love to pick your brain about breaking into product management." },
      { role: 'B', text: 'Sure. Honestly, building a few real projects helps the most.' },
      { role: 'A', text: 'Super helpful. Who else would you recommend I talk to?' },
      { role: 'B', text: "Let me introduce you to Lee. I'll send an email today." },
      { role: 'A', text: 'Thanks! Let me know if I can return the favor.' },
    ],
  },
}

export function getRoleCards(scenarioId: string): RoleCardSet | undefined {
  return roleCards[scenarioId]
}
