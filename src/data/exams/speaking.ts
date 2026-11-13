// Speaking exams (szóbeli), keyed by the id of the paper they belong to: the nyelvvizsga
// papers' speaking parts, and the speaking-only érettségi sample sets. The learner sits them
// with an AI examiner (the Tutor Bot interface); see api/tutor.ts (?action=exam-turn /
// exam-assess) for the examiner and the assessment.
//
// Card text is transcribed verbatim from the paper. The examiner's role card and the
// `examinerBrief` are for the AI examiner only — the learner sees them in the review after
// the exam. Images can't be seen by the examiner model, so `image.alt` describes everything
// the learner might mention (including every number on a chart).
//
// No imports: api/ reads this file too (with a `.js` specifier), and Node can't resolve the
// paper files' `.ts` imports there.

/**
 * `presentation`: a topic talk with guiding points (érettségi "Themenvortrag"), where the
 * examiner only steps in with help questions.
 */
export type SpeakingTaskKind = 'interview' | 'role-play' | 'picture' | 'graph' | 'presentation'

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
  /** A boxed advert or notice printed on the card (e.g. a hotel ad), line by line. */
  box?: string[]
  /** Printed between the box and the points, e.g. `Rufen Sie an und`. */
  lead?: string
  /** The points are printed as a numbered list (1., 2., …). */
  numbered?: boolean
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
  /**
   * The candidate picks one task of each choice group (e.g. one of the two topics of the
   * érettségi Aufgabe 3). Tasks of a group share their label and sit next to each other.
   */
  choiceGroup?: string
}

export type SpeakingLanguage = 'en' | 'de'

/** Who sets the exam: the Zöld Út language exam centre, or the Hungarian school-leaving exam. */
export type SpeakingBoard = 'zold-ut' | 'erettsegi'

export interface SpeakingExam {
  paperId: string
  /** What the examiner speaks and the candidate answers in (the paper's language). */
  language: SpeakingLanguage
  board: SpeakingBoard
  /** Nyelvvizsga: same as the paper's catalog track; here too so api/ needn't load the catalog. */
  track?: 'general' | 'business'
  /** As printed, e.g. `SPEAKING SKILLS`. */
  title: string
  tasks: SpeakingTask[]
}

/** The tasks of one choice group, in order. */
export function choiceGroupTasks(exam: SpeakingExam, group: string): SpeakingTask[] {
  return exam.tasks.filter((t) => t.choiceGroup === group)
}

/**
 * The tasks one sitting runs: every task outside a choice group, and from each group the
 * chosen task — or, until the candidate has chosen, the group's first task as a stand-in.
 */
export function sittingTasks(exam: SpeakingExam, choices: Record<string, string> = {}): SpeakingTask[] {
  return exam.tasks.filter((t) => {
    if (!t.choiceGroup) return true
    const chosen = choices[t.choiceGroup]
    const group = choiceGroupTasks(exam, t.choiceGroup)
    return chosen && group.some((x) => x.id === chosen) ? t.id === chosen : t.id === group[0].id
  })
}

/** The exam as one sitting runs it (see sittingTasks). */
export function sittingExam(exam: SpeakingExam, choices: Record<string, string> = {}): SpeakingExam {
  return { ...exam, tasks: sittingTasks(exam, choices) }
}

/** The AI's assessment criteria, each scored 0–SPEAKING_CRITERION_MAX per task. */
export const SPEAKING_CRITERIA = ['task', 'fluency', 'vocabulary', 'grammar'] as const
export type SpeakingCriterion = (typeof SPEAKING_CRITERIA)[number]
export const SPEAKING_CRITERION_MAX = 5
export const SPEAKING_TASK_MAX = SPEAKING_CRITERIA.length * SPEAKING_CRITERION_MAX

const generalB1: SpeakingExam = {
  paperId: 'nyelvvizsga-en-b1-minta-01',
  language: 'en',
  board: 'zold-ut',
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
  language: 'en',
  board: 'zold-ut',
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

// --- Érettségi német, középszint: szóbeli mintafeladatok A–E ------------------------------
// Source: Oktatási Hivatal, "Mintafeladatok a középszintű szóbeli vizsgához" (német), sets
// „A”–„E”, with the examiner's copies (Vizsgáztatói példány). Each set prints two tasks:
// I. a phone role play that the examiner starts, and II. a topic talk with four guiding
// points (Leitpunkte), where the candidate picks one of two topics. Aufgabe 1, the
// introductory conversation, is not on the paper: it is added like the nyelvvizsga
// speaking exams' warm-up.

const DE_ROLE_PLAY_AFTER = 'Sie haben ca. 3 Minuten Zeit, alles zu klären. Ihr Gesprächspartner ist die Prüferin / der Prüfer. Der Prüfer fängt an.'

function deIntro(avoid: string): SpeakingTask {
  return {
    id: 'S-1',
    label: 'Aufgabe 1',
    kind: 'interview',
    title: 'Einführendes Gespräch',
    source: 'added',
    instructions: [
      'Die Prüferin / der Prüfer stellt Ihnen einige Fragen zu Ihrer Person: zu Ihrer Schule, Ihrer Familie, Ihrem Wohnort, Ihrer Freizeit und Ihren Plänen.',
    ],
    examinerBrief: [
      'Run a short warm-up conversation in German, as at the start of the oral érettségi. Address the candidate formally with "Sie".',
      'Ask one simple personal question at a time about: their school and favourite subjects, their family, where they live, their free time and hobbies, and their plans after the érettségi.',
      `Ask a natural follow-up when an answer is very short. Stay away from the topics of the later tasks (${avoid}).`,
      'Cover four or five of these areas, then close the task.',
    ].join(' '),
    minutes: 3,
    maxLearnerTurns: 7,
  }
}

function deRolePlay(args: { title: string; examineeCard: SpeakingCard; examinerCard: SpeakingCard; brief: string[] }): SpeakingTask {
  return {
    id: 'S-2',
    label: 'Aufgabe 2',
    kind: 'role-play',
    title: args.title,
    source: 'paper',
    examineeCard: { heading: 'Kandidatenblatt', ...args.examineeCard, after: [DE_ROLE_PLAY_AFTER] },
    examinerCard: args.examinerCard,
    examinerBrief: [
      ...args.brief,
      'The card says the examiner starts: open the role-play in role at once (pick up the phone), after one sentence that sets the scene.',
      'Give each piece of information from your card only when the candidate asks for it or it fits naturally. You must ask at least three of your Zusatzfragen, one at a time, woven naturally into the call.',
      'If the candidate forgets a point on their card, give them a natural opening to bring it up. Close the task once every point on their card has been dealt with.',
    ].join(' '),
    minutes: 3,
    maxLearnerTurns: 10,
  }
}

const DE_TOPIC_BRIEF = [
  'This is the candidate’s independent topic talk (önálló témakifejtés): they should talk on their own for about five minutes and cover the four guiding points (Leitpunkte), in any order.',
  'After the opening, let them talk. Their talk reaches you in pieces, because speech recognition splits it at pauses: while they are clearly still going, reply with only a very short neutral prompt in German such as "Ja, erzählen Sie bitte weiter." or "Mhm, und weiter?" — no new questions and no opinions of your own.',
  'When they stop, or a guiding point is still missing, ask ONE help question from your card (the questions under that point’s number) and let them answer.',
  'Close the task once all four points have come up, or after about three help questions.',
].join(' ')

function deTopic(args: { choice: 1 | 2; title: string; points: string[]; help: SpeakingPoint[] }): SpeakingTask {
  return {
    id: `S-3-${args.choice}`,
    label: 'Aufgabe 3',
    kind: 'presentation',
    title: args.title,
    source: 'paper',
    choiceGroup: 'S-3',
    examineeCard: {
      heading: 'Kandidatenblatt',
      text: ['Sprechen Sie ausführlich über das folgende Thema:', args.title, 'Gehen Sie in Ihrem Vortrag auf die folgenden Punkte ein:'],
      numbered: true,
      points: args.points.map((text) => ({ text })),
      after: ['Die Reihenfolge der Leitpunkte können Sie selbst bestimmen.', 'Für Ihren Vortrag haben Sie ca. 5 Minuten Zeit.'],
    },
    examinerCard: {
      heading: 'Vizsgáztatói példány',
      text: ['Wenn der Kandidat Hilfe braucht, können Sie ihm mit den folgenden Fragen helfen:'],
      points: args.help,
    },
    examinerBrief: DE_TOPIC_BRIEF,
    minutes: 5,
    maxLearnerTurns: 10,
  }
}

function deErettsegiSet(paperId: string, tasks: SpeakingTask[]): SpeakingExam {
  const topics = tasks.filter((t) => t.choiceGroup).map((t) => t.title)
  const rolePlay = tasks.find((t) => t.kind === 'role-play')
  return {
    paperId,
    language: 'de',
    board: 'erettsegi',
    title: 'Mündliche Prüfung',
    tasks: [deIntro([rolePlay?.title, ...topics].filter(Boolean).join('; ')), ...tasks],
  }
}

const deSetA = deErettsegiSet('erettsegi-de-kozep-szobeli-minta-a', [
  deRolePlay({
    title: 'Rollenspiel: Zimmer in Österreich reservieren',
    examineeCard: {
      text: [
        'Sie möchten mit ihren Freunden im Sommer eine Woche in Österreich verbringen. In einem österreichischen Informationsheft haben Sie folgende Anzeige gefunden:',
      ],
      box: [
        'Restaurant-Pension Hausmann',
        'Schneebergstraße 2',
        'Puchberg am Schneeberg',
        'Tel. 02636/2231',
        'Beliebte Restaurant-Pension in der Ortsmitte von Puchberg. Ausgangspunkt sehenswerter Ausflugsziele. „Nostalgiefahrt” mit der Zahnradbahn. Vorzügliche österreichische Küche. Gediegene Gästeräume, Aufenthaltsraum, Gartenterrasse, Komfortzimmer mit Dusche/WC, Sat-TV, teilweise Balkon, Appartement mit Wohn-Schlafzimmer.',
      ],
      lead: 'Rufen Sie an und',
      points: [
        { text: 'sagen Sie, warum Sie anrufen,' },
        { text: 'informieren Sie sich über den Zimmerpreis und den Weg zur Pension,' },
        { text: 'reservieren Sie zwei Zweibettzimmer mit Balkon.' },
      ],
    },
    examinerCard: {
      heading: 'Vizsgáztatói példány',
      text: [
        'Ein Schüler / eine Schülerin aus Ungarn möchte sich über die Pension informieren und Zimmer bestellen. Als Pensionsbesitzer geben Sie Auskunft. Sie müssen mindestens 3 der Zusatzfragen stellen. Sie beginnen das Gespräch.',
      ],
      points: [
        {
          text: 'Informationen:',
          sub: [
            'die Zimmer kosten 25 Euro / Person / Tag; der Weg ist ausgeschildert',
            'die Pension steht am Rande des Kurparks, 5 Minuten vom Bahnhof',
            'Es gibt in diesem Zeitraum nur ein Zweibettzimmer mit Balkon.',
          ],
        },
        {
          text: 'Zusatzfragen:',
          sub: [
            'Wann möchten Sie kommen?',
            'Wie kommen Sie nach Puchberg?',
            'Wie lange möchten Sie bleiben?',
            'In diesem Zeitraum haben wir zwei Zweibettzimmer ohne Balkon und (nur) eins mit Balkon. Welches Zimmer nehmen Sie?',
            'Wollen Sie Vollpension, Halbpension oder nur Frühstück?',
            'Wenn Sie wünschen, kann ich Ihnen eine Informationsbroschüre über die Ferienregion zuschicken.',
            'Wie kann man Sie erreichen? (Telefon, E-Mail, Fax)',
          ],
        },
      ],
    },
    brief: [
      'This is a phone call. You play the owner of the Restaurant-Pension Hausmann in Puchberg am Schneeberg (Austria), following your role card; a Hungarian student calls to ask about the guesthouse and book rooms.',
      'Answer the phone as the guesthouse (for example "Pension Hausmann, Grüß Gott! Was kann ich für Sie tun?").',
      'When they ask for two double rooms with a balcony, explain that in that period there is only one with a balcony (and two without), and let them decide.',
    ],
  }),
  deTopic({
    choice: 1,
    title: 'Haustiere',
    points: [
      'Haben oder hatten Sie ein Haustier oder möchten Sie eins haben?',
      'Können Sie dieses Tier beschreiben?',
      'Wie muss man ein Haustier pflegen?',
      'Warum halten viele Menschen Haustiere?',
    ],
    help: [
      { text: '1.', sub: ['Mögen Sie Tiere? Welche?', 'Hatten Sie früher ein Tier?', 'Warum können Sie kein Tier haben?'] },
      { text: '2.', sub: ['Wie sieht Ihr/das Tier aus?', 'Was kann Ihr/das Tier?', 'Was ist charakteristisch für Ihr/das Tier?'] },
      { text: '3.', sub: ['Was frisst Ihr/das Tier?', 'Wie viel Platz braucht Ihr/das Tier?', 'Wie können Sie Ihr/das Tier sauber halten?'] },
      { text: '4.', sub: ['Kennen Sie Menschen, die ein Haustier haben?', 'Was bietet ein Tier dem Menschen?', 'Wie können Tiere dem Menschen helfen?'] },
    ],
  }),
  deTopic({
    choice: 2,
    title: 'Welche Rolle spielt das Fernsehen in Ihrem Leben?',
    points: [
      'Wie viel Zeit verbringen Sie an einem Tag vor dem Fernseher?',
      'Was für Sendungen sehen Sie sich gerne an? Was mögen Sie nicht?',
      'Wie wählen Sie sich die Sendungen aus?',
      'Wie würden Sie sich Ihr Leben ohne das Fernsehen vorstellen?',
    ],
    help: [
      {
        text: '1.',
        sub: [
          'Wie viel Zeit sehen Sie an einem Tag / in einer Woche fern?',
          'Wann sehen Sie fern?',
          'Sehen Sie jeden Tag fern? Wie lange?',
          'Verbringen Sie am Wochenende mehr Zeit vor dem Fernseher als während der Woche?',
        ],
      },
      {
        text: '2.',
        sub: [
          'Welche Sendung gefällt Ihnen am besten? Warum?',
          'Wofür interessieren Sie sich: für Sport / Nachrichten / Filme / Dokumentarfilme / Serien / Talkshows /…/ ?',
          'Wie denken Sie über Krimis / Horrorfilme / reality shows?',
        ],
      },
      {
        text: '3.',
        sub: [
          'Welche Sendung haben Sie zuletzt gesehen? Warum haben Sie eben diese Sendung ausgewählt?',
          'Informieren Sie sich über die Sendungen in einer TV-Zeitschrift?',
          'Empfehlen Ihnen Ihre Freunde / Eltern interessante Sendungen?',
          'Haben Sie spezielle Interessengebiete, z.B. Sport, Natur?',
        ],
      },
      {
        text: '4.',
        sub: [
          'Was würden Sie machen, wenn Sie keinen Fernseher hätten?',
          'Was machen Sie, wenn Sie nicht fernsehen?',
          'Haben Sie schon eine Woche ohne Fernsehen verbracht? Vielleicht im Urlaub? Wie war das?',
        ],
      },
    ],
  }),
])

const deSetB = deErettsegiSet('erettsegi-de-kozep-szobeli-minta-b', [
  deRolePlay({
    title: 'Rollenspiel: Einen Schrank abholen',
    examineeCard: {
      text: [
        'Sie studieren in Deutschland und möchten Ihr Zimmer billig einrichten. Sie brauchen vor allem einen Schrank. In einer Zeitung finden Sie folgende Anzeigen:',
      ],
      box: [
        'Zu verschenken',
        'Aquarium m. Zubeh. Tel. 0170/5325789',
        'Eckcouch u. Wohnzimmerschrank Tel. 07131/280400',
        'Reißbrett (Zeichenbrett) Tel. HN 559715',
      ],
      lead: 'In der zweiten Anzeige wird ein Schrank angeboten. Rufen Sie an und',
      points: [
        { text: 'sagen Sie, warum Sie anrufen,' },
        { text: 'informieren Sie sich über den Schrank (Grösse /Farbe/ Material),' },
        { text: 'fragen Sie nach der Adresse und dem möglichen Abholtermin.' },
      ],
    },
    examinerCard: {
      heading: 'Vizsgáztatói példány',
      text: [
        'Sie haben eine Anzeige aufgegeben, in der Sie eine Eckcouch und einen Schrank anbieten. Ein Student/eine Studentin ruft Sie an, und möchte sich über die Schränke informieren. Geben Sie Auskunft. Sie müssen mindestens 3 der Zusatzfragen stellen. Sie beginnen das Gespräch.',
      ],
      points: [
        {
          text: 'Informationen:',
          sub: [
            'Name des Besitzers: Klein',
            'Wohnzimmerschrank: 200x80x60cm, hellbraun, Holz (Kiefer), 2 Türen',
            'Adresse: Blumenstraße 2',
            'Abholtermin: werktags – nach 17 Uhr; am Wochenende – zwischen 15-17 Uhr',
          ],
        },
        {
          text: 'Zusatzfragen:',
          sub: [
            'Wann könnten Sie den Schrank abholen?',
            'Ich diktiere meine Adresse. Haben Sie etwas zum Schreiben da?',
            'Der Schrank ist ziemlich groß. Wie wollen Sie ihn abholen? (auseinanderbauen / Kleintransporter mieten)',
            'Kann Ihnen jemand beim Tragen helfen? Da mein Arm gebrochen ist, werde ich Ihnen bestimmt nicht helfen können.',
            'Brauchen Sie vielleicht auch eine Couch? Ich habe nämlich auch noch eine Eckcouch zu verschenken.',
          ],
        },
      ],
    },
    brief: [
      'This is a phone call. You play Herr/Frau Klein, who has advertised a corner couch and a living-room cupboard to give away for free; a student calls about the cupboard.',
      'Answer the phone with your name (for example "Klein, guten Tag!").',
    ],
  }),
  deTopic({
    choice: 1,
    title: 'Schüler und Mode',
    points: [
      'Was tragen Sie am liebsten in der Schule und in Ihrer Freizeit?',
      'Was würden Sie nie anziehen?',
      'Was tragen die Jugendlichen heute?',
      'Finden Sie Mode und Klamotten wichtig? Warum?',
    ],
    help: [
      { text: '1.', sub: ['Ziehen Sie sich für die Schule modisch an?', 'Was tragen Sie zu Hause?', 'Was tragen Sie, wenn Sie ausgehen?'] },
      {
        text: '2.',
        sub: [
          'Was tragen Sie nie, z.B. Röcke, Blusen, Anzüge?',
          'Wer kauft für Sie die Kleidungsstücke?',
          'Gefallen Ihnen immer die Kleidungsstücke, die Sie geschenkt bekommen?',
        ],
      },
      { text: '3.', sub: ['Was tragen Ihre Mitschüler?', 'Was ist heutzutage modisch / in?', 'Was ist typisch für die Jugendmode?'] },
      {
        text: '4.',
        sub: [
          'Soll sich jeder modisch kleiden?',
          'Überlegen Sie morgens lange, was Sie sich anziehen?',
          'Sind für Sie Marken-Klamotten / teure Klamotten wichtig?',
        ],
      },
    ],
  }),
  deTopic({
    choice: 2,
    title: 'Computer',
    points: [
      'Haben Sie Computertechnik gelernt?',
      'Wo, wie oft und wie lange sitzen Sie am Computer?',
      'Wozu kann man den Computer benutzen?',
      'Halten Sie es für wichtig, in der Schule Computertechnik zu lernen?',
    ],
    help: [
      {
        text: '1.',
        sub: [
          'Haben Sie auch schon in der Grundschule Computertechnik gelernt?',
          'Wo kann man außerhalb der Schule Computertechnik lernen?',
          'Wer kann einem die Computerkenntnisse beibringen?',
        ],
      },
      {
        text: '2.',
        sub: [
          'Seit wann haben Sie zu Hause einen PC?',
          'Gibt es Möglichkeiten in der Schule, außerhalb des Unterrichts in den Computerraum zu gehen?',
          'Wie viel Zeit verbringen Sie täglich am Computer?',
        ],
      },
      {
        text: '3.',
        sub: [
          'Mögen Sie Spielprogramme? Haben Sie welche?',
          'Warum benutzen Sie gern das Internet?',
          'Welche Hausaufgaben machen Sie mit Hilfe des Computers?',
        ],
      },
      {
        text: '4.',
        sub: [
          'Warum ist es einfacher die Computerkenntnisse in der Schule zu erwerben?',
          'Kann man diese Kenntnisse auch als Erwachsener erlernen?',
          'Warum ist es leichter, mit Computerkenntnissen eine Arbeit zu finden?',
        ],
      },
    ],
  }),
])

const deSetC = deErettsegiSet('erettsegi-de-kozep-szobeli-minta-c', [
  deRolePlay({
    title: 'Rollenspiel: Ferienjob beim Arbeitsamt',
    examineeCard: {
      text: [
        'Sie möchten im Sommer in Deutschland arbeiten. Im Arbeitsamt haben Sie folgendes Informationsblatt über Teilzeitjobs bekommen:',
      ],
      box: [
        'Stand: 08. 07. 2003',
        'FIRMEN – AUFGABE (täglich 6 Std., 75 Euro/Woche)',
        'Bayer – Im Lager Medikamentenlieferungen abladen und sortieren.',
        'Deutsche Bahn – In Eisenbahnwaggons sauber machen.',
        'Kaisers – Regale nachfüllen.',
        'Vodafone – Gebrauchsanweisungen ins Ungarische übersetzen.',
      ],
      lead: 'Zu Hause haben Sie sich überlegt, was Sie gerne machen würden. Am nächsten Tag rufen Sie beim Arbeitsamt an und Sie sprechen mit einem/einer Angestellten. Sagen Sie',
      points: [{ text: 'warum Sie anrufen,' }, { text: 'welche Arbeiten Ihnen gefallen,' }, { text: 'und entscheiden Sie sich für eine der Arbeitsstellen.' }],
    },
    examinerCard: {
      heading: 'Vizsgáztatói példány',
      text: [
        'Sie arbeiten beim Arbeitsamt. Ein Ungar / eine Ungarin ruft bei Ihnen an und möchte einen Teilzeitjob. Sein / ihr Informationsblatt ist aber von gestern. Informieren Sie ihn / sie über den neuesten Stand und helfen Sie ihm /ihr, eine Arbeit auszuwählen. Sie müssen mindestens 3 der Zusatzfragen stellen. Sie beginnen das Gespräch.',
      ],
      points: [
        {
          text: 'Informationen: Stand: 09. 07. 2003 — FIRMEN – AUFGABE (täglich 6 Std., 75 Euro/Woche)',
          sub: [
            'Bayer – Im Lager Medikamentenlieferungen abladen und sortieren.',
            'Deutsche Bahn – In Eisenbahnwaggons sauber machen.',
            'Kaisers – Regale nachfüllen. (weg)',
            'Vodafone – Gebrauchsanweisungen ins Ungarische übersetzen.',
            'Nestlé – Als Postbote zwischen Zentrale und Filiale arbeiten. (neu)',
          ],
        },
        {
          text: 'Zusatzfragen:',
          sub: [
            'Woher kommen Sie?',
            'Wie lange möchten Sie arbeiten?',
            'Haben Sie schon gearbeitet? Was haben Sie gemacht?',
            'Wann haben Sie dieses Informationsblatt bekommen?',
            'Welche Erfahrungen haben Sie in diesem Arbeitsbereich?',
            'Wann könnten Sie vorbeikommen, um die Formalitäten zu erledigen?',
          ],
        },
      ],
    },
    brief: [
      'This is a phone call. You work at the German job centre (Arbeitsamt); a Hungarian calls about a summer part-time job.',
      'Answer the phone as the job centre (for example "Arbeitsamt, guten Tag, Sie sprechen mit Frau/Herrn ... Was kann ich für Sie tun?").',
      'The candidate’s list is from yesterday: tell them the job at Kaisers is gone and there is a new one at Nestlé (as a messenger between head office and branch), and help them choose one job.',
    ],
  }),
  deTopic({
    choice: 1,
    title: 'Welche Rolle spielt der Sport in Ihrem Leben?',
    points: [
      'Welche Sportarten treiben Sie?',
      'Welche Sportmöglichkeiten gibt es in Ihrer Schule?',
      'Welche Sportmöglichkeiten gibt es in Ungarn im Sommer und im Winter?',
      'Welche Rolle spielt der Sport im Leben der Jugendlichen?',
    ],
    help: [
      {
        text: '1.',
        sub: ['Treiben Sie Sport in einem Verein oder in der Schule?', 'Wie oft in der Woche haben Sie Training?', 'Wo trainieren Sie? Im Freien oder in einer Sporthalle?'],
      },
      { text: '2.', sub: ['Gibt es in Ihrer Schule eine Turnhalle?', 'Gibt es bei Ihnen auch Sportplätze?', 'Hat die Schule ein Schwimmbecken?'] },
      {
        text: '3.',
        sub: [
          'Ist das Klima von Ungarn für den Wintersport / Sommersport gut geeignet? Warum?',
          'Welche Wintersportarten kennen Sie?',
          'Welche Sportarten kann man nur im Sommer treiben?',
        ],
      },
      {
        text: '4.',
        sub: [
          'Legen die Jugendlichen heutzutage viel Wert auf ihre Kondition?',
          'Bewegen sich die Jugendlichen Ihrer Meinung nach genug?',
          'In welchem Alter sollte man mit Sport anfangen?',
        ],
      },
    ],
  }),
  deTopic({
    choice: 2,
    title: 'Meine Erfahrungen beim Lernen von Fremdsprachen',
    points: [
      'Welche Fremdsprachen haben Sie bisher gelernt? Wo und wie lange haben Sie diese Fremdsprachen gelernt?',
      'Haben Sie am Sprachenlernen Spaß gehabt? Warum (nicht)?',
      'Wo und wann haben Sie diese Fremdsprachen außerhalb der Sprachstunden benutzt?',
      'Warum ist es heutzutage wichtig, Fremdsprachen zu sprechen?',
    ],
    help: [
      {
        text: '1.',
        sub: [
          'Welche Fremdsprachen haben Sie in der Grundschule und im Gymnasium / in der Fachmittelschule gelernt?',
          'Wie viele Deutsch-/ Englisch- / ...stunden hatten Sie in der Grundschule / im Gymnasium / in der Fachmittelschule?',
          'Seit wann lernen Sie Deutsch / Englisch / ... ?',
          'Hatten Sie Privatstunden oder haben Sie einen Sprachkurs besucht?',
        ],
      },
      {
        text: '2.',
        sub: [
          'Finden Sie es leicht, eine Fremdsprache zu lernen?',
          'Was haben Sie am Sprachenlernen leicht/schwer gefunden: Wörter lernen / Grammatik / Lesen / Schreiben / Sprechen / Kassetten hören ?',
          'Waren die Sprachstunden in der Schule anders als die anderen Stunden? Warum?',
          'Interessieren Sie sich für die Kultur anderer Völker?',
        ],
      },
      {
        text: '3.',
        sub: [
          'Waren Sie schon im Ausland / in Deutschland / in England / in ...?',
          'Haben / Hatten Sie Brieffreunde?',
          'Hören Sie gerne deutsche /englische / ... Musik ?',
          'Haben Sie Kabelfernsehen?',
          'Haben Sie schon eine deutsche / englische / ... Zeitung gelesen?',
        ],
      },
      {
        text: '4.',
        sub: [
          'Wie können Sie Ihre Sprachkenntnisse im Alltag benutzen?',
          'Bei welchen Berufen ist es wichtig, Fremdsprachen zu sprechen?',
          'Möchten Sie später kürzere oder längere Zeit im Ausland leben/arbeiten?',
          'Bei welchen Freizeitbeschäftigungen ist es ein Vorteil, wenn man Fremdsprachen spricht (beim Fernsehen / Surfen im Internet / Musik hören / Reisen)?',
        ],
      },
    ],
  }),
])

const deSetD = deErettsegiSet('erettsegi-de-kozep-szobeli-minta-d', [
  deRolePlay({
    title: 'Rollenspiel: Sprachkurs in Berlin',
    examineeCard: {
      text: [
        'Sie möchten in den Sommerferien an einem Sprachkurs des Goethe-Institutes in Berlin teilnehmen. In dem Magazin „Willkommen” haben Sie folgende Anzeige gefunden.',
      ],
      box: [
        'Jugendkurs (16-18 Jahre)',
        'dreiwöchiger Sommerkurs',
        'im Internat in Berlin-Wannsee',
        '72 Unterrichtseinheiten à 45 Minuten',
        'Betreuung rund um die Uhr',
        'Kultur- und Freizeitangebot',
        'Weitere Informationen:',
        'Tel.: +49 (0) 30/259 06-3',
      ],
      lead: 'Rufen Sie an und',
      points: [
        { text: 'sagen Sie, warum sie anrufen,' },
        { text: 'informieren Sie sich über den Zeitpunkt und die Kosten (z.B. Kurs, Unterkunft, Mahlzeit)' },
        { text: 'und über den Unterricht (Stundenzahl pro Tag bzw. pro Woche).' },
      ],
    },
    examinerCard: {
      heading: 'Vizsgáztatói példány',
      text: [
        'Ein Schüler / eine Schülerin aus Ungarn möchte an dem Jugendkurs des Goethe-Institutes in Berlin teilnehmen. Als Mitarbeiter des Institutes geben Sie Informationen. Sie müssen mindestens 3 der Zusatzfragen stellen. Sie beginnen das Gespräch.',
      ],
      points: [
        {
          text: 'Informationen:',
          sub: [
            'Der Jugendkurs fängt am 1. August an.',
            'Der Jugendkurs kostet 1700 €, Unterkunft und Mahlzeit sind inbegriffen.',
            'Man hat jeden Tag 8 Stunden Unterricht, Samstag und Sonntag sind frei.',
          ],
        },
        {
          text: 'Zusatzfragen:',
          sub: [
            'Wie alt sind Sie?',
            'Seit wann lernen Sie Deutsch?',
            'Mit wie viel Personen wollen Sie das Zimmer teilen? (Einbettzimmer, Zweibettzimmer, Dreibettzimmer)',
            'An welchen Wochenendprogrammen würden Sie gern teilnehmen? (Ausflüge, Museen, Ausstellungen, Sportveranstaltungen, Stadtbesichtigungen)',
            'Wie kann man Sie erreichen? (Telefon, E-Mail, Fax)',
          ],
        },
      ],
    },
    brief: [
      'This is a phone call. You work at the Goethe-Institut in Berlin; a Hungarian secondary school student calls about the three-week summer youth course in Berlin-Wannsee.',
      'Answer the phone as the institute (for example "Goethe-Institut Berlin, guten Tag! Was kann ich für Sie tun?").',
    ],
  }),
  deTopic({
    choice: 1,
    title: 'Vier Jahreszeiten',
    points: [
      'Wie ist das Wetter in den verschiedenen Jahreszeiten?',
      'Was kann man in den verschiedenen Jahreszeiten machen?',
      'Welche Jahreszeit/en haben Sie am liebsten? Warum?',
      'Welche Jahreszeit/en mögen Sie nicht? Warum?',
    ],
    help: [
      { text: '1.', sub: ['Wann ist es am wärmsten / am kältesten?', 'Wann regnet es / schneit es / scheint die Sonne am meisten?', 'Wann ist das Wetter sehr wechselhaft?'] },
      {
        text: '2.',
        sub: [
          'Wann kann man viel Zeit im Freien / in der Natur verbringen?',
          'Was kann man machen, wenn es regnet / es schneit?',
          'Wann kann man baden / Ausflüge machen / Schi fahren?',
        ],
      },
      {
        text: '3. + 4.',
        sub: [
          'Ist es Ihnen wichtig, wie das Wetter ist? Warum?',
          'Wie ist die Natur in dieser Jahreszeit?',
          'Welches Obst und Gemüse gibt es in dieser Jahreszeit?',
          'Wie verbringen Sie in dieser Jahreszeit Ihre Freizeit?',
          'Welche Hobbys haben Sie? In welcher Jahreszeit können Sie diese Freizeitbeschäftigungen ausüben?',
          'Sind Sie (in dieser Jahreszeit) gerne draußen in der Natur? Warum?',
          'Was trägt man dann?',
        ],
      },
    ],
  }),
  deTopic({
    choice: 2,
    title: 'Mein Wohnort',
    points: ['Wo liegt Ihr Wohnort und wie ist er?', 'Was kann man dort machen?', 'Wie ist die Umgebung, die Landschaft?', 'Warum mögen Sie Ihren Wohnort (nicht)?'],
    help: [
      { text: '1.', sub: ['In welchem Teil des Landes leben Sie?', 'Gibt es mehr Einfamilienhäuser als Hochhäuser?', 'Welches Gebäude ist am schönsten?'] },
      {
        text: '2.',
        sub: ['Welche Sportmöglichkeiten gibt es in Ihrem Wohnort?', 'Was für Kulturprogramme gibt es in Ihrem Wohnort?', 'Wo können sich die Jugendlichen treffen?'],
      },
      { text: '3.', sub: ['Liegt Ihr Wohnort in den Bergen / auf der Ebene?', 'Gibt es Wälder in der Nähe?', 'Gibt es Flüsse oder Seen in der Nähe?'] },
      { text: '4.', sub: ['Welche Vorteile bzw. Nachteile hat Ihr Wohnort?', 'Wie sind die Menschen?', 'Warum wollen Sie hier bleiben / nicht hier bleiben?'] },
    ],
  }),
])

const deSetE = deErettsegiSet('erettsegi-de-kozep-szobeli-minta-e', [
  deRolePlay({
    title: 'Rollenspiel: Beim Zahnarzt anrufen',
    examineeCard: {
      text: [
        'Sie sind einen Monat lang in Wien und haben jetzt starke Zahnschmerzen. Sie brauchen dringend Hilfe. Rufen Sie die folgende Arztpraxis an und besprechen Sie Ihr Problem mit der Sprechstundenhilfe:',
      ],
      box: ['Zahnarztpraxis Meyer', 'am Westbahnhof', 'Tel.: 555 666'],
      lead: 'Rufen Sie an und',
      points: [{ text: 'sagen Sie, warum Sie anrufen,' }, { text: 'fragen Sie nach den möglichen Terminen' }, { text: 'und nach den Kosten.' }],
    },
    examinerCard: {
      heading: 'Vizsgáztatói példány',
      text: [
        'Ein/e Schüler/in aus Ungarn braucht zahnärztliche Hilfe. Als Sprechstundenhilfe geben Sie Informationen und Sie müssen mindestens 3 der Zusatzfragen stellen. Sie beginnen das Gespräch.',
      ],
      points: [
        {
          text: 'Informationen:',
          sub: [
            'Sprechstunden: montags, mittwochs, freitags: von 16.00-19.00 Uhr; dienstags und donnerstags: von 09.00-12.00 Uhr',
            'Die Behandlung ist für versicherte Patienten kostenlos, sonst muss man dafür bezahlen. Erst nach der Untersuchung kann man über die weiteren Kosten Information geben.',
          ],
        },
        {
          text: 'Zusatzfragen:',
          sub: ['Wann möchten Sie kommen?', 'Seit wann haben Sie Zahnschmerzen?', 'Tut Ihnen der Zahn sehr weh?', 'Haben Sie Schmerztabletten?', 'Sind Sie versichert?'],
        },
      ],
    },
    brief: [
      'This is a phone call. You are the receptionist (Sprechstundenhilfe) at the Zahnarztpraxis Meyer am Westbahnhof in Vienna; a Hungarian student who is in Vienna for a month calls with a bad toothache.',
      'Answer the phone as the practice (for example "Zahnarztpraxis Meyer, Grüß Gott! Was kann ich für Sie tun?").',
      'Agree on a concrete appointment within the surgery hours on your card.',
    ],
  }),
  deTopic({
    choice: 1,
    title: 'Freizeit',
    points: [
      'Wie viel Freizeit haben Sie (werktags – am Wochenende)?',
      'Wie verbringen Sie Ihre Freizeit?',
      'Warum ist Freizeit für Sie wichtig?',
      'Warum ist Geld bei der Freizeitgestaltung (nicht) wichtig?',
    ],
    help: [
      {
        text: '1.',
        sub: ['Wann haben Sie in der Woche Zeit für sich?', 'Wann können Sie das machen, was Sie wollen?', 'Haben Sie am Wochenende mehr Freizeit als während der Woche?'],
      },
      {
        text: '2.',
        sub: ['Was machen Sie in Ihrer Freizeit?', 'Haben Sie Hobbys? Welche?', 'Was machen Sie am Wochenende?', 'Was machen Sie, wenn Sie sich ausruhen wollen?'],
      },
      { text: '3.', sub: ['Wie würden Sie sich fühlen, wenn Sie keine Freizeit hätten?', 'Brauchen Sie mehr Freizeit als Sie haben? Warum?'] },
      {
        text: '4.',
        sub: [
          'Was machen Sie am Wochenende, wenn Sie kein Geld haben?',
          'Was würden Sie in Ihrer Freizeit machen, wenn Sie viel Geld hätten?',
          'Brauchen Sie für Ihre Hobbys Geld?',
        ],
      },
    ],
  }),
  deTopic({
    choice: 2,
    title: 'Taschengeld',
    points: [
      'Wie ist es in Ihrer Familie mit dem Taschengeld?',
      'Wofür geben Sie Geld aus?',
      'Wie viel Geld braucht man als Schüler?',
      'Warum ist das Taschengeld (nicht) wichtig?',
    ],
    help: [
      { text: '1.', sub: ['Bekommen Sie regelmäßig Taschengeld?', 'Wie viel Taschengeld bekommen Sie?', 'Von wem bekommen Sie Geld?'] },
      {
        text: '2.',
        sub: [
          'Was kaufen Sie für Ihr Taschengeld?',
          'Kaufen Sie Zeitungen / CDs / Kleidungsstücke / Kinokarten ?',
          'Bekommen Sie von Ihren Eltern Geld, wenn Sie am Wochenende ausgehen / ins Kino gehen / ins Theater gehen / Urlaub machen?',
        ],
      },
      {
        text: '3.',
        sub: ['Was meinen Sie: Bekommen Sie genug Taschengeld?', 'Wie viel Taschengeld bekommen Ihre Freunde / Bekannten?', 'Wofür geben die Schüler im Allgemeinen Geld aus?'],
      },
      {
        text: '4.',
        sub: [
          'Warum ist es (nicht) gut, regelmäßig Taschengeld zu bekommen?',
          'Was kann man mit Hilfe des Taschengeldes lernen?',
          'Werden Sie Ihren Kindern Taschengeld geben? Warum?',
        ],
      },
    ],
  }),
])

export const SPEAKING_EXAMS: Record<string, SpeakingExam> = {
  [generalB1.paperId]: generalB1,
  [businessB1.paperId]: businessB1,
  [deSetA.paperId]: deSetA,
  [deSetB.paperId]: deSetB,
  [deSetC.paperId]: deSetC,
  [deSetD.paperId]: deSetD,
  [deSetE.paperId]: deSetE,
}

export function getSpeakingExam(paperId: string): SpeakingExam | undefined {
  return SPEAKING_EXAMS[paperId]
}
