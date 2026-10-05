// Zöld Út Nyelvvizsgaközpont (MATE), B1 Economics and management (alapfok, gazdasági), sample
// paper 1. Transcribed verbatim from the task sheet and its answer key, including the source's
// own typos ("May 9,2206", "including a having a meal", the example sentence's 2009 under a
// 2014 table). Added for the screen: the article numbers (1)–(3) of the alternative-energy
// news (the matching task refers to them; the sheet only implies them by position) and the
// question numbers of that task. The speaking part is in ../speaking.ts. No section times are
// printed on this paper, so none are set.
import type { ExamPaper, PassageBlock, ShortTextItem } from '../types'

const degreeText: PassageBlock[] = [
  { style: 'title', text: '1. Cost of gaining a degree reaches £33,500' },
  {
    text: "Students starting university this year expect to pay £33,512 for a three-year degree course, a rise of almost £5,000 on last year's projected figure, a survey says today.",
  },
  { text: 'Most of the rise is due to the increase in tuition fees of up to £3,000 a year from next month.' },
  {
    text: "The survey by NatWest Student Money Matters found that students expected to graduate in 2009 with £14,779 of debt, an increase of £1,099 on last year's projected figure for 2008.",
  },
  {
    text: 'However, while graduate debt continues to rise, NatWest said there were signs that students were preparing to cut back on some of their social pleasures.',
  },
  {
    text: 'The survey found that undergraduates expected to spend more than they did now on almost every aspect of their life, including eating out, alcohol and buying clothes and on other items such as rent and books.',
  },
  { text: 'The only exception was cigarettes, indicating that students may be becoming more health conscious.' },
  { text: 'Students now spend an average weekly sum of £13.17 on cigarettes, but they expect the amount to drop to £12.56.' },
  {
    text: 'The survey also found that the amount students expected to spend over the next three years on day-to-day items was less than the predictions they made last year.',
  },
  {
    text: 'In 2005 they forecast spending £176.72 per week over the next three years. This year they have cut the figure to £158.75, a saving of £17.97 a week.',
  },
  {
    text: 'Mark Worthington, from NatWest, said that undergraduates were "clearly much more informed about the financial realities of university than in previous years".',
  },
  {
    text: 'He said: "Despite the expected cost of university rising by 17 per cent on 2005, students expect that by cutting back on spending they will graduate with only eight per cent more debt."',
  },
  {
    text: 'The survey found more students were doing part-time jobs to pay for their university life. A huge proportion (87 per cent) of this year\'s intake believed they would have to take a part-time job.',
  },
  {
    text: 'Forty-six per cent of students rely on income from term time work to get by, working an average of 14 hours a week. Students supplement their income by an average of £71.32 a week.',
  },
  {
    text: "Two thirds of parents pay for their children's university education. Twenty-eight per cent give regular amounts. Twenty-six per cent receive money from their parents when they need it, eight per cent receive a lump sum at the beginning of each term and four per cent receive a one-off amount when they start university.",
  },
  {
    text: "Despite worries about the higher costs, 79 per cent of this year's intake believed that going to university would help them with their future prospects and 53 per cent wanted to train for a specific career such as medicine or law.",
  },
]

const energyText: PassageBlock[] = [
  { style: 'title', text: '2. Short news on alternative energy' },
  { style: 'heading', text: '(1) Colorado Fuel Cell Center Celebrates Its Grand Opening on May 9,2206' },
  {
    text: 'WHAT: New Research Center to Boost Colorado Fuel Cell Industry. Attend the Grand Opening and learn from fuel cell experts and researchers about their projects in portable and transportation applications, working with renewable fuels, and efficiency projects.',
  },
  {
    text: "WHO: The Governor's Office of Energy Management and Conservation (OEMC) along with its partners, the Gas Technology Institute, the Colorado School of Mines, and the U.S. Department of Energy's National Renewable Energy Laboratory.",
  },
  {
    text: 'WHY: Fuel cells combine hydrogen and oxygen to create electricity; the only byproduct is water vapor. It is a clean, efficient energy technology. With the rising costs of fuel and the uncertainty of its foreign sources, fuel cell technologies may have a vital role in our energy independence.',
  },
  { text: 'WHERE: The CFCC is located at 1310 Maple Street, in Golden, Colorado, on the Colorado School of Mines Campus.' },
  { style: 'heading', text: '(2) Tesco turns on charm' },
  {
    text: 'THE chief executive of Tesco, Sir Terry Leahy, will this week announce plans to transform the supermarket chain into a “better neighbour”.',
  },
  { text: 'The scheme will be set out in a speech to the Work Foundation, a business think tank, on Wednesday.' },
  { text: 'Tesco’s proposals are said to focus on three core areas: the environment, health and local communities.' },
  {
    text: 'The plan will include numerous small initiatives, such as improving lorry suspensions to make delivery trucks quieter and more energy efficient, through to more ambitious projects that include getting 2m people active before the 2012 London Olympics.',
  },
  { text: 'Leahy first revealed that Tesco was working on a “community plan” last month when he announced a 17% leap in profits, to a record £2.2 billion.' },
  {
    text: 'Tesco also said it was proposing a £100m environmental fund to research and develop the use of wind, solar and geothermal power in Tesco stores and distribution centres.',
  },
  { style: 'heading', text: '(3) DuPont Shows Off Alternative Fuel Research' },
  {
    text: '(AP) WILMINGTON, Del. DuPont officials got a chance to show off the company’s research into alternative fuels today to a Bush administration official visiting Delaware to promote the president’s energy proposals.',
  },
  {
    text: 'Karen Harbert, from the US Department of Energy, began her visit with a stop at DuPont’s Experimental Station, where researchers are working on turning corn plants into ethanol.',
  },
  {
    text: 'DuPont is leading a consortium of three members that received a four-year, 19 million dollar grant from the energy department for research leading to “biorefinery” technology capable of producing cellulosic ethanol.',
  },
  { text: 'Unlike traditional ethanol, which is made from corn kernels, cellulosic ethanol is made from the whole corn plant: cob, stalk and silk.' },
  {
    text: 'DuPont officials have a good understanding of the combination of enzymes and microorganisms needed to break down the cellulose in the corn plant and convert it into sugars that can be fermented and distilled into ethanol. But they’ll need to figure out how to make the technology commercially feasible.',
  },
]

const ARTICLES = [
  { key: '1', text: '1 – Colorado Fuel Cell Center' },
  { key: '2', text: '2 – Tesco turns on charm' },
  { key: '3', text: '3 – DuPont Shows Off Alternative Fuel Research' },
]

/** One row of the matching table: which article(s) answer the question. */
function matchRow(id: string, stem: string, answer: string[]) {
  return { id, type: 'multi-select' as const, stem, options: ARTICLES, answer, pick: answer.length }
}

/** Reading Task 1: a row whose number is the gap ("…… = what it refers to"). */
function numberRow(id: string, refersTo: string, accepted: string[], keywords: string[][]): ShortTextItem {
  return { id, type: 'short-text', prompt: `…… = ${refersTo}`, answer: { accepted, match: 'keywords', keywords, maxWords: 3 } }
}

/** Reading Task 1: a row whose description is the gap ("number = ……"). The key's own notes run past 3 words, so no limit is set. */
function referRow(id: string, number: string, accepted: string, keywords: string[][]): ShortTextItem {
  return { id, type: 'short-text', prompt: `${number} = ……`, answer: { accepted: [accepted], match: 'keywords', keywords } }
}

const paper: ExamPaper = {
  id: 'nyelvvizsga-en-b1-gazdasagi-minta-01',
  type: 'nyelvvizsga',
  language: 'en',
  level: 'B1',
  sittingLabelHu: 'Minta 1.',
  track: 'business',
  source:
    'Zöld Út Nyelvvizsgaközpont (MATE): B1 Economics and management (alapfok, gazdasági) mintafeladatsor — feladatsor, megoldókulcs és hanganyag. Ingyenesen letölthető: https://zoldut.uni-mate.hu/mintafeladatsorok',
  sections: [
    {
      id: 'reading',
      kind: 'reading',
      titleHu: 'Olvasott szöveg értése (Reading Comprehension)',
      tasks: [
        {
          id: 'R-1',
          label: 'Task 1',
          instructions:
            'Read the text and complete the table with your notes based on the text with no more than 3 words, according to the example (0).',
          passage: degreeText,
          examples: [
            {
              id: '0',
              type: 'short-text',
              prompt: '14 = ……',
              answer: { accepted: ['students’ average number of hours’ work/week'], match: 'exact-ci' },
            },
          ],
          // NUMBERS = WHAT THEY REFER TO, one row per item; key words so that reasonable notes count.
          items: [
            numberRow('1', 'students’ current spending /week on cigarettes', ['£13.17'], [['13.17', '13,17']]),
            numberRow('2', 'maximum amount of growth of the tuition fee this year', ['£3,000'], [['3,000', '3000', '3 000', '3.000']]),
            referRow('3', '£33,512', 'cost of a 3-year degree course', [['cost', 'pay', 'price', 'expens', 'spend'], ['degree', 'course', 'universit', 'stud', '3 year', '3-year', 'three']]),
            referRow('4', '17', 'expected percent growth of university costs in 2005', [['cost', 'price', 'expens'], ['grow', 'rise', 'rising', 'increase', 'more', '%', 'percent', 'per cent']]),
            numberRow('5', 'proportion of parents financing their children’s studies', ['2/3'], [['2/3', 'two third', 'two-third', '66', '67']]),
            referRow('6', '£14,779', 'expected debt on graduation in 2009', [['debt', 'owe', 'loan']]),
            referRow('7', '£5,000', 'rise of total cost of gaining a degree this year', [['rise', 'increase', 'grow', 'more', 'higher'], ['cost', 'degree', 'price', 'pay']]),
            numberRow('8', '% of students expect to take up part-time jobs', ['87'], [['87']]),
            numberRow('9', 'expected saving on weekly costs', ['£17.97'], [['17.97', '17,97']]),
            {
              id: '10',
              type: 'short-text',
              prompt: '…… = % of students getting money from relatives before each semester',
              // Exact: a key-word "8" would also match 18 or 87.
              answer: { accepted: ['8', '8%', '8 %', '8 per cent', '8 percent', 'eight', 'eight per cent', 'eight percent'], match: 'exact-ci', maxWords: 3 },
            },
          ],
        },
        {
          id: 'R-2',
          label: 'Task 2',
          instructions:
            'Read the text again and use it to decide if the statements are true (T) or false (F). Write your answers in the table below according to the example (0). Please note that if all your answers are marked as true or as false, your answers will be disqualified.',
          passage: degreeText,
          booleanLabels: ['T', 'F'],
          rules: { allSameBooleanIsZero: true },
          examples: [{ id: '0', type: 'boolean', statement: 'The survey on student finances was conducted by NatWest.', answer: true }],
          items: [
            { id: '11', type: 'boolean', statement: 'The majority of students are optimistic about their future careers.', answer: true },
            { id: '12', type: 'boolean', statement: 'Students have started to think more realistically about costs of studying.', answer: true },
            { id: '13', type: 'boolean', statement: 'The only exception where they did not want to cut costs was cigarettes.', answer: false },
            { id: '14', type: 'boolean', statement: 'Students usually combine money from their parents with part-time earnings.', answer: true },
            { id: '15', type: 'boolean', statement: '79% of students worry about the increasing costs of their university studies.', answer: true },
          ],
        },
        {
          id: 'R-3',
          label: 'Task 3',
          instructions:
            'Read the text again and pair the projects in the table to the given questions, according to the example (0). There are 15 correct answers, excluding the examples.',
          passage: energyText,
          // 15 ticks in all; ticking beyond them costs a point each, ticking every box scores 0.
          rules: { multiSelectPenalty: true },
          examples: [matchRow('0', 'Which article contains an invitation?', ['1'])],
          items: [
            matchRow('1', 'Which article is about an event?', ['1', '2', '3']),
            matchRow('2', 'Which article involves a research institute?', ['1', '3']),
            matchRow('3', 'Which article names several alternative energy sources?', ['2']),
            matchRow('4', 'Which article is about creating alternative energy from gases?', ['1']),
            matchRow('5', 'Which article describes the technology of making a liquid energy source?', ['3']),
            matchRow('6', 'Which article mentions the sum to be spent on environmental research?', ['2', '3']),
            matchRow('7', 'Which article describes co-operation between various organisations?', ['1', '3']),
            matchRow('8', 'Which article compares the production of two kinds of alternative energy source?', ['3']),
            matchRow('9', 'Which article mentions a problem or problems to be solved?', ['2', '3']),
          ],
        },
      ],
    },
    {
      id: 'writing',
      kind: 'writing',
      titleHu: 'Íráskészség (Writing Skills)',
      tasks: [
        {
          id: 'W-1',
          label: 'Task 1',
          instructions: 'Study the table and use the provided information to complete the sentences using 50-80 words, according to the example (0).',
          table: {
            title: 'The performance of India’s top 500 companies in 2014 (in million rupees)',
            caption: 'Export revenue and growth of export-oriented sectors',
            head: ['', 'Exports (Rs mn)', 'y-o-y change (%)', 'Export contribution to sector’s revenue (%)'],
            rows: [
              ['Oil - Refining and marketing', '1,258,432', '11.5', '16.7'],
              ['Software and ITeS', '562,082', '23.6', '85.1'],
              ['Pharmaceuticals', '224,175', '16.7', '43.0'],
              ['Iron and steel', '186,435', '25.2', '13.9'],
              ['Engineering / capital goods', '174,600', '76.2', '16.7'],
              ['Gems and jewellery', '172,642', '15.1', '68.7'],
              ['Non-ferrous metals', '145,273', '(20.5)', '31.8'],
              ['Power equipment', '104,114', '47.9', '31.8'],
              ['Textiles', '94,254', '9.5', '31.4'],
            ],
            numericColumns: [1, 2, 3],
          },
          items: [
            {
              id: '1',
              type: 'production',
              prompt: [],
              contentPoints: [],
              sentenceStarters: {
                example: 'The table shows data from 2009 on the performance of India’s top 500 companies.',
                starters: [
                  'In the rows we can see the various',
                  'In the first column the values of the exports',
                  'The second column',
                  'The third column',
                  'The biggest volume of exports',
                  'The second largest export share is due to the',
                  'This sector accounts for the largest',
                  'The pharmaceutical sector has also',
                  'The following four categories reach',
                  'Companies belonging to the final two categories',
                ],
              },
              minWords: 50,
              maxWords: 80,
              register: 'description',
              rubricId: 'nyelvvizsga-b1-gazdasagi-1',
              modelAnswer: [
                '1. In the rows we can see the various export-oriented sectors in India, such as oil refining and marketing or pharmaceuticals.',
                '2. In the first column the values of the exports are given in million rupees.',
                '3. The second column shows the year-on-year change in percent.',
                '4. The third column represents the export contribution to sector’s revenue.',
                '5. The biggest value of exports can be seen in oil refining and marketing, namely 1,258,432 million rupees.',
                '6. The second largest export share is due to the revenues of software and IT sector.',
                '7. The gems and jewellery sector accounts for 68.7% of export contribution.',
                '8. The pharmaceutical sector also has a large export contribution with 43%.',
                '9. The following four categories reach more than 100,000 million rupees in export revenue.',
                '10. Companies belonging to the final two categories operate in the power equipment and the textiles sectors.',
              ].join('\n'),
            },
          ],
        },
        {
          id: 'W-2',
          label: 'Task 2',
          instructions:
            'You work for the HR management department of a company in England. (Celetron System, 15 Tulip Street London SW3 NE2). Last week a group of 20 colleagues took part in a team-building training, including a having a meal in a restaurant in Broadstone.',
          items: [
            {
              id: '2',
              type: 'production',
              prompt: [
                'Write a letter to the the manager of the restaurant (Devon Restaurant, 2 Rose Street, Broadstone SW 5LE9 England), in 120-140 words, in which you would like to make a complaint. Your name in this role: Budai Béla/Bella.',
                'In your letter you should',
              ],
              contentPoints: [
                'complain about: slow service',
                'complain about: rude waiters',
                'complain about: low quality food',
                'complain about: overcharged bill',
                'write about the action you want them to take',
              ],
              minWords: 120,
              maxWords: 140,
              register: 'formal-letter',
              rubricId: 'nyelvvizsga-b1-gazdasagi-2',
              modelAnswer: [
                'Devon Restaurant',
                '2 Rose Street',
                'Broadstone',
                'SW 5LE9',
                'England',
                '',
                'Celetron System',
                '15 Tulip Street',
                'London',
                'SW3 NE2',
                '',
                '20 March 2017',
                '',
                'Dear Sir or Madam,',
                '',
                'I am writing to complain about the service we received in your restaurant last week.',
                'Our company organized a team-building training session for a group of 20 colleagues, which also included lunch in your restaurant on 15 November.',
                'First of all, we have to mention your slow service, which caused us problems, since we could join the afternoon session of the training later.',
                'Secondly, we were also dissatisfied with the waiters’ attitude. They were rude, impatient and not helpful at all when we complained about the cold dishes they served.',
                'Finally, when we settled the bill, we realized that you charged higher prices compared to the ones listed in the menu. Your staff could not deal with this problem, either.',
                'Since all these problems caused us considerable inconveniences, we would appreciate if you could look into this matter and could offer some kind of compensation.',
                'We look forward to hearing from you.',
                '',
                'Yours faithfully,',
                '',
                'Bella Budai',
                'HR assistant',
              ].join('\n'),
            },
          ],
        },
      ],
    },
    {
      id: 'listening',
      kind: 'listening',
      titleHu: 'Hallott szöveg értése (Listening Comprehension)',
      audio: {
        storagePath: 'nyelvvizsga-en-b1-gazdasagi-minta-01.mp3',
        durationSec: 915,
        // Each text is played twice with 60-second pauses; Task 2 starts with a short
        // announcement before its reading pause (found by a silence scan of the 64 kbps file).
        taskMarkers: [
          { taskId: 'L-1', startSec: 0 },
          { taskId: 'L-2', startSec: 397 },
        ],
      },
      tasks: [
        {
          id: 'L-1',
          label: 'Task 1',
          instructions:
            'Listen to the text about the green habits of Seattle’s inhabitants. Based on the text, decide if the statements are true (T) or false (F). Write your answers in the table below, according to the example (0). Please note that if all your answers are marked as true or as false, your answers will be disqualified.',
          booleanLabels: ['T', 'F'],
          rules: { allSameBooleanIsZero: true },
          examples: [{ id: '0', type: 'boolean', statement: 'According to the speaker, in the US people care about their environment.', answer: true }],
          items: [
            { id: '1', type: 'boolean', statement: 'In Seattle, rubbish is collected selectively.', answer: true },
            { id: '2', type: 'boolean', statement: 'In Seattle, eco-friendly buildings and services are widely advertised.', answer: true },
            { id: '3', type: 'boolean', statement: 'In Seattle, green roofs are very common.', answer: false },
            { id: '4', type: 'boolean', statement: 'In Seattle, there aren’t a lot of hybrid cars yet.', answer: false },
            { id: '5', type: 'boolean', statement: 'In Seattle, hybrid cars run partly on gasoline and partly on battery.', answer: true },
          ],
        },
        {
          id: 'L-2',
          label: 'Task 2',
          instructions:
            'Listen to the text about internet-based jobs and provide short answers to the questions. Write your answers in the table below according to the example (0) in no more than 5 words (0).',
          examples: [
            {
              id: '0',
              type: 'short-text',
              prompt: 'What kind of special credit can you finance from your earnings? (Example)',
              answer: { accepted: ['mortgage'], match: 'exact-ci' },
            },
          ],
          // Questions 2–3 and 7–8 each ask for two answers; either answer counts in either box.
          items: [
            {
              id: '1',
              type: 'short-text',
              prompt: 'What forms of jobs can be internet-based?',
              answer: { accepted: ['part-time / full time'], match: 'keywords', keywords: [['part', 'full']], maxWords: 5 },
            },
            {
              id: '2',
              type: 'short-text',
              prompt: 'Whom do websites of hand-made goods match with each other? (1)',
              answer: { accepted: ['artist (producing hand-made goods)', 'customer (who is interested)'], match: 'keywords', keywords: [['artist', 'maker', 'producer', 'craftsm', 'artisan', 'seller', 'customer', 'buyer', 'client']], maxWords: 5 },
              reviewNote: 'The key: 2. artist (producing hand-made goods), 3. customer (who is interested) — in either order.',
            },
            {
              id: '3',
              type: 'short-text',
              prompt: 'Whom do websites of hand-made goods match with each other? (2)',
              answer: { accepted: ['customer (who is interested)', 'artist (producing hand-made goods)'], match: 'keywords', keywords: [['artist', 'maker', 'producer', 'craftsm', 'artisan', 'seller', 'customer', 'buyer', 'client']], maxWords: 5 },
            },
            {
              id: '4',
              type: 'short-text',
              prompt: 'What crafts are mentioned? Give an example.',
              answer: { accepted: ['knitting', 'crochet', 'painting', 'sculpting'], match: 'keywords', keywords: [['knit', 'crochet', 'paint', 'sculpt']], maxWords: 5 },
            },
            {
              id: '5',
              type: 'short-text',
              prompt: 'What hand-made goods can be sold on the internet? Give an example.',
              answer: { accepted: ['woodwork', 'iron work', 'glass work', 'anything original'], match: 'keywords', keywords: [['wood', 'iron', 'glass', 'original']], maxWords: 5 },
            },
            {
              id: '6',
              type: 'short-text',
              prompt: 'What projects should you start when thinking about creating hand-made goods?',
              answer: { accepted: ['what you are good at', 'what you are passionate about'], match: 'keywords', keywords: [['good at', 'passion', 'love', 'enjoy', 'talent']], maxWords: 5 },
            },
            {
              id: '7',
              type: 'short-text',
              prompt: 'What costs should you be reimbursed for when selling hand-made goods? (1)',
              answer: { accepted: ['cost of material', 'time'], match: 'keywords', keywords: [['material', 'time']], maxWords: 5 },
              reviewNote: 'The key: 7, 8. cost of material + time — in either order.',
            },
            {
              id: '8',
              type: 'short-text',
              prompt: 'What costs should you be reimbursed for when selling hand-made goods? (2)',
              answer: { accepted: ['time', 'cost of material'], match: 'keywords', keywords: [['material', 'time']], maxWords: 5 },
            },
            {
              id: '9',
              type: 'short-text',
              prompt: 'What websites do domain-name flippers look for and buy?',
              answer: { accepted: ['unused / neglected'], match: 'keywords', keywords: [['unused', 'neglect', 'not used', 'abandon']], maxWords: 5 },
            },
            {
              id: '10',
              type: 'short-text',
              prompt: 'How many dollars was birdcage.com sold for to a bird cage vendor?',
              answer: { accepted: ['173,000'], match: 'keywords', keywords: [['173']], maxWords: 5 },
            },
          ],
        },
      ],
    },
  ],
}

export default paper
