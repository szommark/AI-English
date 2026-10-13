// Story mode for the Grammar Coach time game (docs/tense-story-mode-design.md): a short role-play
// told through six questions in story order. The learner answers in character using a fact card;
// the AI checks the tense and that the answer doesn't contradict the card. A final decision picks
// the ending, and the AI writes the learner's answers up as a short document. Imported by the
// client and by api/_lib/tenseGame.ts (type-only imports keep it loadable from both).
import type { TenseGameLevel, TimeFrame } from './tenseGameQuestions.js'

export type TenseStoryId = 'lost-luggage' | 'hotel-danube' | 'paprika-contract'
export type OutcomeTone = 'good' | 'mixed' | 'bad'

export interface StoryQuestion {
  id: string
  frame: TimeFrame
  text: string
  focus: string
  sample: string
}

export interface StoryOutcome {
  title: string
  text: string
  tone: OutcomeTone
}

export interface StoryOption {
  id: string
  label: string
  detail: string
  /** The ending when this (wrong) option is chosen; the right option uses best / weak. */
  outcome?: string
}

export type StoryDecision =
  | {
      kind: 'choice'
      prompt: string
      options: StoryOption[]
      answerId: string
      /** What a convincing reason mentions; sent to the AI. */
      goodReason: string
      /** Endings for the right option with a convincing / an unconvincing reason. */
      best: string
      weak: string
    }
  | {
      kind: 'open'
      prompt: string
      /** The AI sorts the learner's reply into one of these; each leads to an ending. */
      categories: { id: string; criteria: string; outcome: string }[]
    }

export interface TenseStory {
  id: TenseStoryId
  /** The level the AI judges at; `levelLabel` is what the learner sees. */
  level: TenseGameLevel
  levelLabel: string
  title: string
  teaser: string
  scene: string
  role: string
  /** Who asks the questions, e.g. "Inspector Hart". */
  speaker: string
  facts: string[]
  questions: StoryQuestion[]
  decision: StoryDecision
  outcomes: Record<string, StoryOutcome>
  /** Overrides the decision's ending when the learner contradicted the card in these questions. */
  contradictionOverride?: { questionIds: string[]; outcome: string }
  /** An extra line under the ending when the card was contradicted in this many questions. */
  contradictionNote?: { minCount: number; text: string }
  writeUp: { title: string; instructions: string }
}

type QuestionRow = [frame: TimeFrame, text: string, focus: string, sample: string]

const questions = (storyId: string, rows: QuestionRow[]): StoryQuestion[] =>
  rows.map(([frame, text, focus, sample], i) => ({ id: `${storyId}-${i + 1}`, frame, text, focus, sample }))

export const TENSE_STORIES: TenseStory[] = [
  {
    id: 'lost-luggage',
    level: 'A2',
    levelLabel: 'A2',
    title: 'Lost luggage',
    teaser: 'Your suitcase didn’t arrive in Dublin. Explain everything at the lost-luggage desk.',
    scene: 'You’ve just landed at Dublin Airport. Your suitcase didn’t arrive. You’re at the lost-luggage desk.',
    role: 'a traveller whose suitcase is lost',
    speaker: 'The officer',
    facts: [
      'You flew from Budapest this morning on flight AV 215.',
      'You last saw your suitcase at check-in in Budapest at 6 am.',
      'Your suitcase is big and blue, with a yellow ribbon on the handle.',
      'Inside there are clothes, a camera and a present for your aunt.',
      'You’re staying at your aunt’s house, 14 Green Street, for a week.',
      'On Saturday you’re going to a wedding — your best clothes are in the suitcase!',
    ],
    questions: questions('lost-luggage', [
      ['past', 'Which flight did you come on, and where did you fly from?', 'past simple', 'I came on flight AV 215 from Budapest.'],
      ['past', 'When did you last see your suitcase?', 'past simple', 'I last saw it at check-in in Budapest at 6 am.'],
      ['present', 'What does your suitcase look like?', 'present simple', 'It’s big and blue, and it has a yellow ribbon on the handle.'],
      ['present', 'What’s inside it?', 'present simple (there is / there are)', 'There are clothes, a camera and a present for my aunt.'],
      ['future', 'Where are you going to stay in Dublin?', 'going to / present continuous', 'I’m going to stay at my aunt’s house at 14 Green Street.'],
      ['future', 'When do you need your suitcase? Do you have any plans this week?', 'present continuous / going to', 'I need it before Saturday, because I’m going to a wedding.'],
    ]),
    decision: {
      kind: 'choice',
      prompt: 'We’ve found three blue suitcases. Which one is yours? Tell me how you know.',
      options: [
        { id: 'a', label: 'Suitcase A', detail: 'Big and blue, with a red ribbon on the handle.', outcome: 'wrong-bag' },
        { id: 'b', label: 'Suitcase B', detail: 'Big and blue, with a yellow ribbon on the handle.' },
        { id: 'c', label: 'Suitcase C', detail: 'A small blue backpack.', outcome: 'wrong-bag' },
      ],
      answerId: 'b',
      goodReason: 'It mentions the yellow ribbon, or that the suitcase is big (not a backpack) with a yellow ribbon.',
      best: 'found',
      weak: 'found-weak',
    },
    outcomes: {
      found: { tone: 'good', title: 'Here you are!', text: 'The officer hands you suitcase B. “Enjoy the wedding — and your stay in Dublin!”' },
      'found-weak': {
        tone: 'mixed',
        title: 'Hmm… OK.',
        text: 'The officer gives you suitcase B. “Next time, please check the ribbon or the name tag first.”',
      },
      'wrong-bag': {
        tone: 'bad',
        title: 'Oops — wrong bag!',
        text: 'At your aunt’s house you open the suitcase and find… someone else’s fishing equipment. Back to the airport tomorrow!',
      },
    },
    writeUp: {
      title: 'Lost Luggage Report',
      instructions:
        'A lost-luggage report form. Write one line per field, "Field: value": Passenger flight, Last seen, Description, Contents, Address in Dublin, Needed by, Outcome. Keep each value short.',
    },
  },
  {
    id: 'hotel-danube',
    level: 'B1',
    levelLabel: 'B1',
    title: 'The missing necklace',
    teaser: 'A diamond necklace vanished from Hotel Danube last night. The inspector wants your statement.',
    scene: 'A diamond necklace disappeared from room 12 of Hotel Danube last night. Inspector Hart is asking you questions.',
    role: 'the hotel’s night receptionist, a witness',
    speaker: 'Inspector Hart',
    facts: [
      'You’re the night receptionist. Your shift starts at 10 pm and finishes at 6 am.',
      'At 11:30 last night you were making coffee in the back office when you heard a loud bang upstairs.',
      'You ran to the 2nd floor. The door of room 12 was open. The guests, Mr and Mrs Kovács, had gone to dinner at 9 pm and weren’t back yet.',
      'In the corridor you saw a tall man in a red scarf with a black bag. He ran down the back stairs.',
      'You’ve seen him before: he stayed in room 14 last week and asked a lot of questions about room 12.',
      'Tonight the police are watching the back door.',
    ],
    questions: questions('hotel-danube', [
      ['present', 'What’s your job at the hotel, and when does your shift start?', 'present simple', 'I’m the night receptionist, and my shift starts at 10 pm.'],
      ['past', 'What were you doing when you heard the noise last night?', 'past continuous + past simple', 'I was making coffee in the back office when I heard a loud bang.'],
      ['past', 'Had the guests already left room 12 when you got there? Where were they?', 'past perfect', 'Yes, they had already gone to dinner at 9 pm.'],
      ['past', 'What did you see in the corridor?', 'past simple / past continuous', 'I saw a tall man in a red scarf. He was carrying a black bag.'],
      ['present', 'Have you ever seen this man before?', 'present perfect', 'Yes, I have. He stayed in room 14 last week.'],
      ['future', 'The police are watching the back door tonight. What will you do if the man comes back?', 'first conditional (will)', 'If he comes back, I’ll call the police immediately.'],
    ]),
    decision: {
      kind: 'choice',
      prompt: 'So — who took the necklace? Tell me why you think so.',
      options: [
        { id: 'novak', label: 'Mr Novak', detail: 'Stayed in room 14 last week. Tall. Wears a red scarf.' },
        { id: 'tom', label: 'Tom the waiter', detail: 'Short. Served the Kovács their dinner in the restaurant all evening.', outcome: 'cold-tom' },
        { id: 'kovacs', label: 'Mrs Kovács', detail: 'Her necklace is insured for a lot of money. At dinner from 9 pm.', outcome: 'cold-kovacs' },
      ],
      answerId: 'novak',
      goodReason: 'It uses a clue: the tall man in the red scarf, his stay in room 14 last week, or his questions about room 12.',
      best: 'solved',
      weak: 'solved-weak',
    },
    outcomes: {
      solved: { tone: 'good', title: 'Case solved!', text: 'Mr Novak was arrested at the train station this morning — with the necklace in his black bag.' },
      'solved-weak': {
        tone: 'mixed',
        title: 'Case solved — just.',
        text: 'You were right: it was Mr Novak. But a court needs evidence, not a feeling. Next time, use the clues.',
      },
      'cold-tom': {
        tone: 'bad',
        title: 'The trail goes cold.',
        text: 'Tom couldn’t have done it: he was serving the Kovács their dinner all evening — and he’s short. The thief got away.',
      },
      'cold-kovacs': {
        tone: 'bad',
        title: 'The trail goes cold.',
        text: 'Mrs Kovács was at dinner from 9 pm, and the man in the corridor was tall, in a red scarf. The thief got away.',
      },
    },
    contradictionNote: { minCount: 2, text: '“By the way,” says the inspector, “your story kept changing. I’ll be watching you too.”' },
    writeUp: {
      title: 'Witness Statement',
      instructions:
        'A short formal witness statement in the first person ("I am the night receptionist…"), 80–130 words, in paragraphs, ending with "Signed: Night receptionist, Hotel Danube". Do not invent a name.',
    },
  },
  {
    id: 'paprika-contract',
    level: 'B2',
    levelLabel: 'B1–B2',
    title: 'The paprika contract',
    teaser: 'A German supermarket buyer is in your office. Win the deal — without promising too much.',
    scene: 'You’re the sales manager of Szeged Paprika Ltd. Anna Weber, a buyer from FreshMarkt, a German supermarket chain, is in your office.',
    role: 'the sales manager of Szeged Paprika Ltd',
    speaker: 'Anna Weber',
    facts: [
      'A family company, founded in 1998 by your grandfather; 40 employees; paprika powder and paste.',
      'You’ve been exporting to Austria since 2015.',
      'Last spring a delivery to Vienna arrived two weeks late because of a truck strike. You gave the customer 10% off and changed transport company.',
      'At the moment you’re building a new packing line. It will be ready in March.',
      'You can deliver 2,000 jars a month now, and 5,000 from April. Nothing before 1 February.',
      'Your limit: at most 8% discount, and only for a 12-month contract.',
    ],
    questions: questions('paprika-contract', [
      ['present', 'Tell me about your company. What do you make, and how many people work there?', 'present simple', 'We’re a family company. We make paprika powder and paste, and 40 people work for us.'],
      ['present', 'How long have you been exporting, and where to?', 'present perfect (continuous)', 'We’ve been exporting to Austria since 2015.'],
      ['past', 'I heard about a late delivery to Vienna. What happened, and what did you do?', 'past simple', 'It arrived two weeks late because of a truck strike, so we gave the customer 10% off and changed transport company.'],
      ['present', 'What are you working on at the moment to grow production?', 'present continuous', 'We’re building a new packing line, which will be ready in March.'],
      ['future', 'We need 4,000 jars a month from January. What can you promise?', 'will / can / going to', 'We can’t start before February. We’ll deliver 2,000 jars a month at first, and 5,000 from April.'],
      ['future', 'What discount will you give us if we sign a 12-month contract?', 'first conditional (will)', 'If you sign a 12-month contract, we’ll give you 8% off.'],
    ]),
    decision: {
      kind: 'open',
      prompt: 'Here is our offer: 4,000 jars a month from January, with a 12% discount. Do you accept, refuse or make a counter-offer?',
      categories: [
        {
          id: 'counter-ok',
          criteria: 'A counter-offer that stays within the fact card: delivery starting in February or later, about 2,000 jars a month until April (up to 5,000 from April), and a discount of 8% or less.',
          outcome: 'signed',
        },
        {
          id: 'counter-over',
          criteria: 'A counter-offer that still breaks the card (a January start, more than 2,000 jars before April, or more than 8% off).',
          outcome: 'on-hold',
        },
        { id: 'accept', criteria: 'Accepts the offer as it is.', outcome: 'signed-trouble' },
        { id: 'refuse', criteria: 'Refuses without making a counter-offer.', outcome: 'no-deal' },
      ],
    },
    outcomes: {
      signed: { tone: 'good', title: 'Deal signed!', text: 'Anna smiles. “Realistic numbers — I like that. Let’s shake on it.”' },
      'signed-trouble': {
        tone: 'mixed',
        title: 'Deal signed — but…',
        text: 'You promised what you can’t deliver. In March, Anna emails: “Where are the 4,000 jars you promised for January?”',
      },
      'on-hold': { tone: 'mixed', title: 'Deal on hold.', text: 'Anna closes her folder. “Your numbers don’t add up. Let’s talk again when you’re sure.”' },
      'no-deal': { tone: 'bad', title: 'No deal.', text: '“That’s a pity,” says Anna. “Maybe next year.”' },
    },
    contradictionOverride: { questionIds: ['paprika-contract-5', 'paprika-contract-6'], outcome: 'on-hold' },
    writeUp: {
      title: 'Meeting notes',
      instructions:
        'A short email from Anna Weber to her manager ("Hi Thomas,"), 90–140 words: the company, its history and the Vienna delivery, current production, what was promised, and the result of the meeting. Sign it "Anna".',
    },
  },
]

export function getTenseStory(id: string): TenseStory | undefined {
  return TENSE_STORIES.find((s) => s.id === id)
}

/** The decision's result from the AI (or from the choice alone when it's a wrong one). */
export interface StoryDecisionResult {
  /** choice: the reason was convincing. */
  reasonOk?: boolean
  /** open: the category the reply falls into. */
  categoryId?: string
  /** One or two sentences in the UI language; empty for a wrong choice. */
  feedback: string
}

/** The story's ending from the decision and the questions where the learner contradicted the card. */
export function storyOutcomeId(
  story: TenseStory,
  decision: { choiceId?: string; result: StoryDecisionResult },
  contradictedIds: string[],
): string {
  const override = story.contradictionOverride
  if (override && override.questionIds.some((id) => contradictedIds.includes(id))) return override.outcome
  const d = story.decision
  if (d.kind === 'choice') {
    if (decision.choiceId !== d.answerId) return d.options.find((o) => o.id === decision.choiceId)?.outcome ?? Object.keys(story.outcomes)[0]
    return decision.result.reasonOk ? d.best : d.weak
  }
  return d.categories.find((c) => c.id === decision.result.categoryId)?.outcome ?? d.categories[d.categories.length - 1].outcome
}

export const STORY_TEXT_MAX_LENGTH = 400
export const STORY_WRITEUP_MAX_LENGTH = 1500
