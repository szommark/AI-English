// Nyelvvizsga speaking exams (szóbeli), keyed by the id of the paper they belong to. The
// learner sits them with an AI examiner (the Tutor Bot interface); see api/tutor.ts
// (?action=exam-turn / exam-assess) for the examiner and the assessment.
//
// Card text is transcribed verbatim from the paper. The examiner's role card and the
// `examinerBrief` are for the AI examiner only — the learner sees them in the review after
// the exam. Images can't be seen by the examiner model, so `image.alt` describes everything
// the learner might mention (including every number on a chart).
//
// No imports: api/ reads this file too (with a `.js` specifier), and Node can't resolve the
// paper files' `.ts` imports there.

export type SpeakingTaskKind = 'interview' | 'role-play' | 'picture' | 'graph'

/**
 * Where a task comes from: printed on the paper (`paper`), only its title is printed and the
 * examiner leads it (`title-only`, e.g. "Professional discussion"), or not on the paper at all
 * but part of the oral exam (`added`, e.g. the introductory conversation).
 */
export type SpeakingTaskSource = 'paper' | 'title-only' | 'added'

export interface SpeakingPoint {
  text: string
  sub?: string[]
}

/** A role card, as printed. */
export interface SpeakingCard {
  /** e.g. `Examinee’s copy`, `THE EXAMINEE’S ROLE` */
  heading?: string
  text: string[]
  points?: SpeakingPoint[]
  /** Printed after the points, e.g. `YOU START`. */
  after?: string[]
}

export interface SpeakingImage {
  /** File name under src/assets/exams/. */
  asset: string
  /** For screen readers and for the AI examiner, which can't see the image. */
  alt: string
}

export interface SpeakingTask {
  /** Unique within the exam. */
  id: string
  /** e.g. `Task 1` */
  label: string
  kind: SpeakingTaskKind
  /** As printed (`Situation 5`, `Professional discussion`), or a plain description where the paper prints none. */
  title: string
  source: SpeakingTaskSource
  /** Printed instructions, verbatim (for added tasks: what the examiner will do). */
  instructions?: string[]
  examineeCard?: SpeakingCard
  image?: SpeakingImage
  /** The examiner's copy. Only the AI examiner sees it during the exam. */
  examinerCard?: SpeakingCard
  /** How the AI examiner runs the task. Not shown to the learner. */
  examinerBrief: string
  /** Roughly how long the task takes in the exam. */
  minutes: number
  /** Safety net: after this many learner turns the examiner closes the task. */
  maxLearnerTurns: number
}

export interface SpeakingExam {
  paperId: string
  /** Same as the paper's catalog track; here too so api/ needn't load the catalog. */
  track: 'general' | 'business'
  /** As printed, e.g. `SPEAKING SKILLS`. */
  title: string
  tasks: SpeakingTask[]
}

/** The AI's assessment criteria, each scored 0–SPEAKING_CRITERION_MAX per task. */
export const SPEAKING_CRITERIA = ['task', 'fluency', 'vocabulary', 'grammar'] as const
export type SpeakingCriterion = (typeof SPEAKING_CRITERIA)[number]
export const SPEAKING_CRITERION_MAX = 5
export const SPEAKING_TASK_MAX = SPEAKING_CRITERIA.length * SPEAKING_CRITERION_MAX

const generalB1: SpeakingExam = {
  paperId: 'nyelvvizsga-en-b1-minta-01',
  track: 'general',
  title: 'SPEAKING SKILLS',
  tasks: [
    {
      id: 'S-1',
      label: 'Task 1',
      kind: 'interview',
      title: 'Introductory conversation',
      source: 'added',
      instructions: ['The examiner asks you a few questions about yourself: your studies or work, your family, your home town, your free time and your plans.'],
      examinerBrief: [
        'Run a short warm-up conversation, as at the start of a B1 oral exam.',
        'Ask one simple personal question at a time about: what the candidate studies or does for a living, their family, where they live, their free time, their plans for the future.',
        'Ask a natural follow-up when an answer is very short. Cover four or five of these areas, then close the task.',
      ].join(' '),
      minutes: 3,
      maxLearnerTurns: 7,
    },
    {
      id: 'S-2',
      label: 'Task 2',
      kind: 'role-play',
      title: 'Situation',
      source: 'paper',
      examineeCard: {
        heading: 'Examinee’s copy',
        text: [
          'Your school receives exchange students from Holland. Your family is putting up a secondary school student and now you are having a friendly chat with him/her.',
        ],
        points: [
          { text: 'Ask him/her about his/her plan after leaving school' },
          { text: 'Tell him/her what your special field of interest is' },
          {
            text: 'Explain to him/her',
            sub: [
              'which foreign university you are going to apply for and why',
              'which subjects you need to have good marks from to get in',
              'which European country you would like to travel most and why',
            ],
          },
        ],
        after: ['YOU START'],
      },
      examinerBrief: [
        'Play the Dutch exchange student (a secondary school student from Holland) who is staying with the candidate’s family. You are chatting in a friendly way at home.',
        'The card says the candidate starts: after setting the scene, wait for them to speak first.',
        'When asked about your plans after school, give a short, concrete answer (for example studying engineering in Delft, or a gap year working first) and ask the candidate about their interests in return.',
        'React naturally to what they tell you, and if they leave out a point on their card (their field of interest, the foreign university and why, the subjects they need good marks in, the European country they would like to visit and why), ask about it as a curious friend would.',
        'Close the task once every point on their card has come up.',
      ].join(' '),
      minutes: 4,
      maxLearnerTurns: 10,
    },
    {
      id: 'S-3',
      label: 'Task 3',
      kind: 'picture',
      title: 'Picture description',
      source: 'paper',
      instructions: ['Describe the picture, after that tell your ideas about the topic connected to the picture.'],
      image: {
        asset: 'nyelvvizsga-en-b1-minta-01-picture.webp',
        alt: [
          'An instruction sheet for a home rapid antigen self-test (a nasal swab test, like a COVID-19 test), drawn in purple and white.',
          'Step 1, “Dispense the buffer solution”: a hand drips liquid from a small bottle into a tube standing in the test box.',
          'Step 2, “Collect the sample”: a swab is put into the nose and turned five times in each nostril (“x 5”).',
          'Step 3, “Unload the swab”: the swab is turned in the tube while the tube is squeezed.',
          'Step 4, “Put the dropper cap”: a cap with a dropper is pushed onto the tube.',
          'Step 5, “Apply in the «S/R» well”: three drops (“x3 drops”) are dropped into the sample well of the test cassette.',
          '“Wait for to get result”, with a stopwatch showing 15 min.',
          '“Interpretation of the result”: one red line at C means negative; red lines at C and T mean positive; no line, or only a line at T, means invalid.',
        ].join(' '),
      },
      examinerBrief: [
        'First ask the candidate to describe the picture. Let them talk; only prompt gently if they stop very early (for example: “What happens after that?”).',
        'Then discuss the topic of the picture: health, illness and testing at home, the coronavirus pandemic and how it changed everyday life, going to the doctor versus looking after yourself.',
        'Ask two or three open questions, one at a time, and react briefly to the answers. Then close the task.',
      ].join(' '),
      minutes: 5,
      maxLearnerTurns: 8,
    },
  ],
}

const businessB1: SpeakingExam = {
  paperId: 'nyelvvizsga-en-b1-gazdasagi-minta-01',
  track: 'business',
  title: 'SPEAKING SKILLS',
  tasks: [
    {
      id: 'S-1',
      label: 'Task 1',
      kind: 'interview',
      title: 'Professional discussion',
      source: 'title-only',
      instructions: ['The examiner asks you about your studies or your work and about everyday topics of economics and management.'],
      examinerBrief: [
        'Lead a professional discussion at B1 level for the economics and management exam.',
        'Ask one question at a time about: what the candidate studies or where they work, a company they know well or would like to work for (what it does, its products or customers), a typical working day, teamwork and communication at work, and everyday business topics such as online shopping, advertising or banking.',
        'Ask a natural follow-up when an answer is very short. Cover four or five areas, then close the task.',
      ].join(' '),
      minutes: 4,
      maxLearnerTurns: 7,
    },
    {
      id: 'S-2',
      label: 'Task 2',
      kind: 'role-play',
      title: 'Situation 5',
      source: 'paper',
      examineeCard: {
        heading: 'THE EXAMINEE’S ROLE',
        text: [
          'You work in a food-processing plant in Hungary. The ingredients are transported from Poland, but the goods are delayed. Call the contact person and complain.',
        ],
        points: [
          { text: 'Explain the problem.' },
          { text: 'Ask about', sub: ['the reason for the delay', 'compensation possibilities'] },
          { text: 'Tell him/her the inconvenience (losing partners, orders, etc.)' },
          { text: 'Agree on new delivery date' },
        ],
      },
      examinerCard: {
        heading: 'THE EXAMINER’S ROLE:',
        text: [
          'You are a contact person of the Polish company supplying food-processing plants with ingredients. A Hungarian partner is calling you to complain about a delay. Listen to the problem.',
        ],
        points: [
          { text: 'Tell him/her the reason for the delay (strike at the company)' },
          { text: 'ensure him/her that the problem will be solved (compensation, etc.)' },
          { text: 'Offer a new delivery date.' },
        ],
      },
      examinerBrief: [
        'This is a phone call. You play the contact person at the Polish supplier, following the examiner’s role card.',
        'After setting the scene, answer the phone with a name you make up for yourself and the company, and let the candidate explain the problem.',
        'Give the reason for the delay only when asked (a strike at your company), apologise, assure them the problem will be solved and offer compensation (for example a discount on this order or free transport next time), and offer a new delivery date (for example next Tuesday).',
        'If the candidate forgets a point on their card (asking about compensation, telling you the inconvenience, agreeing on the date), give them a natural opening to bring it up. Close the task once a new delivery date is agreed.',
      ].join(' '),
      minutes: 4,
      maxLearnerTurns: 10,
    },
    {
      id: 'S-3',
      label: 'Task 3',
      kind: 'graph',
      title: 'Chart description',
      source: 'paper',
      image: {
        asset: 'nyelvvizsga-en-b1-gazdasagi-minta-01-chart.webp',
        alt: [
          'Bar chart: “Proportion of Internet users who shop online by country, 2012 and 2016”, two bars per country (dark blue: 2012, light grey: 2016).',
          'USA 76% → 79%; UK 77% → 79%; France 63% → 69%; Germany 71% → 75%; Italy 19% → 23%; Spain 29% → 33%; Japan 83% → 83%; South Korea 66% → 71%; China 41% → 50%.',
          'Source: IDATE, World Internet Markets, edition July 2012.',
        ].join(' '),
      },
      examinerBrief: [
        'First ask the candidate to describe the chart: what it shows and the most important figures and changes. Let them talk; only prompt gently if they stop very early.',
        'Check their figures against the chart in your own head, but do not correct them.',
        'Then ask two or three open questions, one at a time, about the topic: why online shopping might be more popular in some countries (Japan, the UK) than in others (Italy, Spain), whether and what they buy online, advantages and disadvantages for customers and for shops and companies.',
        'React briefly to the answers, then close the task.',
      ].join(' '),
      minutes: 5,
      maxLearnerTurns: 8,
    },
  ],
}

export const SPEAKING_EXAMS: Record<string, SpeakingExam> = {
  [generalB1.paperId]: generalB1,
  [businessB1.paperId]: businessB1,
}

export function getSpeakingExam(paperId: string): SpeakingExam | undefined {
  return SPEAKING_EXAMS[paperId]
}
