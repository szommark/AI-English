// Zöld Út Nyelvvizsgaközpont (MATE), B2 Economics and management (középfok, gazdasági), sample
// paper 1 — freely downloadable at https://zoldut.uni-mate.hu/mintafeladatsorok. Transcribed
// verbatim from the task sheet and its answer key (whose true/false answers are printed as the
// Hungarian I/H), including the source's own typos ("in ten days’", "the 10 given words" over a
// list of eleven). The writing table is transcribed from the image on the sheet, without its
// footnote letters. Added for the screen: "Text 1/2 ·" in the reading task labels. The speaking
// part is its own paper (nyelvvizsga-en-b2-gazdasagi-szobeli-minta-01 in ../speaking.ts). No
// section times are printed on this paper, so none are set.
import type { ExamPaper, PassageBlock, ShortTextItem } from '../types'

const debtText: PassageBlock[] = [
  { style: 'title', text: '1. It takes a degree of planning to get the cheapest deals' },
  { text: 'Graduates who have just left university this summer face an average debt of £13,500, according to the National Union of Students.' },
  {
    text: 'Those emerging into the world of work in future are likely to face even higher debts, with tuition fees increasing to up to £3,000 a year from September. The burden of mounting interest and starting to repay loans can be a daunting prospect once your degree is awarded.',
  },
  {
    text: 'Even those fortunate enough to find employment will face additional costs, from buying suitable clothes for your chosen career to finding the money for a deposit and advance rent on new accommodation.',
  },
  {
    text: 'Donna Bradshaw from independent financial advisers (IFAs) IFG Group said: "When you get your first pay packet, you might think it is a lot of money, but you will have accommodation, travel, food and other costs.',
  },
  {
    text: '"The worst thing you can do is bury your head in the sand and get carried away by the ’going out after work’ culture. It is a good discipline to sit down and do a budget. Look at what is coming in, what you have to pay out, and see what is left over."',
  },
  {
    text: 'For students graduating with a degree of debt, 86 per cent owe money to the Student Loans Company, 53 per cent owe money to banks, 48 per cent owe money to their credit card companies and 24 per cent owe money to their parents, according to the Barclays Graduate Debt Survey.',
  },
  {
    text: 'Graduates at least benefit from a little breathing space before the Student Loans Company comes calling. You only start repayments in the April after graduation, and only then if you are earning more than £15,000 a year, or the equivalent of £1,250 a month. Repayments will be deducted from your pay packet at nine per cent of any earnings above the £15,000 threshold. So for example a graduate earning £1,500 a month, which is £250 over the repayment threshold, would have to repay nine per cent of £250, or £22, a month.',
  },
  {
    text: 'Going bankrupt will no longer clear your student loans, after the Government closed this loophole in 2004, but any money still owing 25 years after graduation will be written off. While student loans represent the largest chunk of debt for graduates, interest is charged at a low level linked to inflation, currently set at 2.6 per cent. Credit and store card debts, on the other hand, could be mounting up at annual percentage rates from 5.9 per cent up to 30 per cent, depending on the card.',
  },
  {
    text: 'Vivienne Starkey from IFAs Equal Partners advised graduates to prioritise their debts, and pay off the most expensive first. Ms Starkey said: "If you owe some money on credit cards, look around for an interest-free credit card offer. Aim to get your debts on to the lowest rate possible, and then pay them off. Student loans probably charge the lowest rates, so they should be the last to go."',
  },
  {
    text: 'If you cannot clear any credit card debt immediately, you can at least set up a direct debit to cover the minimum payment each month to avoid penalty charges if you forget to pay the bill. One way to ease your debt burden is to take advantage of the interest-free overdrafts on graduate accounts offered by many high street banks.',
  },
  {
    text: 'Most banks will automatically switch your account once you finish your degree, but it is worth looking around to see if you can get a better deal elsewhere. Rather than being tempted by any incentives, such as shopping discounts or mobile phone insurance, check that the account itself provides the facilities you need.',
  },
  { text: 'Ms Starkey said: "Choose an account with online banking, so you can keep track of your spending and stop yourself going into an overdraft that will cost you money."' },
]

const ozoneParagraphs: string[] = [
  'Maria Alvarado can tell whether it’s a green-light day or an orange-light day or, as happens more frequently these days in the Chilean town of Punta Arenas , the world’s most southerly city, a red-light day. Alvarado, 35, works 12-hour shifts in the streets of Punta Arenas keeping track of parked cars. She knows what it means when the sky turns white and the windows and the sea becomes blinding. It means the hole in the Earth’s ozone layer is right overhead: it’s a red-light day.',
  'To the rest of the world, the ominously expanding Antarctic ozone hole was dispatched with the worldwide ban on the use of ozone-depleting substances in 1987. To the 120,000 residents of Punta Arenas, the ozone-hole is a local nightmare. Each spring it still swells to about the size of North America. As variable as the weather, the hole makes sudden visits to the city. For days at a time, the sun’s harsh ultraviolet rays, with no ozone shield to stop them, beat directly down on residents.',
  'A few decades ago sunburns and skin cancer were virtually non-existent in this cloudy, windy region. The expanding ozone hole changed all that. Skin cancer has soared 66 percent in the past seven years. Since UV-related disorders take decades to surface, the true impact may not be known for decades. “It’s like being placed on top of a high mountain without any time to acclimatize.” says the city’s only dermatologist.',
  'In 1998 health department officials devised the “solar stoplight” to give residents warning of intense periods of UV radiation. From September to December they activate actual stoplights in schools and businesses and issue updates to newspapers, television and radio stations. The solar stoplight has four colors: green (normal), yellow (wear a hat and sunglasses), orange (apply sunscreen) and red (stay in the shade “as much as possible”). But the vast majority of residents ignore the color-coded warnings. A recent survey revealed that more than 60 percent of residents have never used sunscreen and only 42 percent even own sunglasses.',
  'To raise awareness, local authorities have organized workshops for people who work outdoors. The health department’s ozone education program tells citizens that they should learn to live with the ozone hole as if “it’s our friend.” “There is nothing else they can do, “ says director Lidia Amarales. More stoplights and education projects are planned, but resources are limited.',
  'Chilean government officials and environmental groups are calling on the international community to dole out funds for monitoring of and research on the ozone’s impact on the region’s people and the ecosystems. “The world definitely owes some of these countries economic relief,“ says Marco Pinzon, coordinator of the UN’s Latin America ozone program. Industrial nations, after all, caused the ozone loss in the first place with their use of refrigerants, aerosol sprays made with CFCs and other ozone-depleting substances. Although worldwide consumption of CFCs has fallen by 80 or 90 percent, the ozone hole won’t begin shrinking for at least another five years and won’t recover fully until 2050, scientists say. It may take longer still, say environmentalists, if the protocol isn’t modified to include new ozone-depleting substances not covered in the treaty, or if the worst-case predictions of global warming are true.',
]

const ozoneText: PassageBlock[] = [
  { style: 'title', text: '2. Under the Hole in the Sky' },
  ...ozoneParagraphs.flatMap((text, i): PassageBlock[] => [{ style: 'label', text: String(i) }, { text }]),
]

/** An answer that may go in any of a group of rows (the key's sources of borrowing, expenses, …). */
function anyOrder(id: string, all: string[], index: number, keywords: string[], maxWords: number): ShortTextItem {
  return {
    id,
    type: 'short-text',
    answer: { accepted: [all[index], ...all.filter((_, i) => i !== index)], match: 'keywords', keywords: [keywords], maxWords },
  }
}

const SOURCES = ['Student Loans Company', 'banks', 'credit card companies', 'parents']
const SOURCE_WORDS = ['loan', 'bank', 'credit', 'card', 'parent', 'famil']
const EXPENSES = ['accommodation', 'travel', 'food']
const EXPENSE_WORDS = ['accommodation', 'rent', 'housing', 'flat', 'travel', 'transport', 'food', 'meal']
const MEASURES = ['solar stoplights', 'education programs']
const MEASURE_WORDS = ['stoplight', 'stop light', 'traffic light', 'education', 'program', 'workshop', 'update', 'newspaper']
const OUTSOURCING = ['outsourcing', 'offshoring']

const paper: ExamPaper = {
  id: 'nyelvvizsga-en-b2-gazdasagi-minta-01',
  type: 'nyelvvizsga',
  language: 'en',
  level: 'B2',
  sittingLabelHu: 'Minta 1.',
  track: 'business',
  source:
    'Zöld Út Nyelvvizsgaközpont (MATE): B2 Economics and management (középfok, gazdasági) mintafeladatsor — feladatsor, megoldókulcs és hanganyag. Ingyenesen letölthető: https://zoldut.uni-mate.hu/mintafeladatsorok',
  sections: [
    {
      id: 'reading',
      kind: 'reading',
      titleHu: 'Olvasott szöveg értése (Reading Comprehension)',
      tasks: [
        {
          id: 'R-1-1',
          label: 'Text 1 · Task 1',
          instructions:
            'Read the text and complete the table with your notes based on the text with no more than 6 words, according to the example (0).',
          passage: [
            ...debtText,
            { style: 'row', label: 'Annual tuition fee from September 2006', text: '{{0}}' },
            { style: 'row', label: 'Main sources of borrowing money for students in Britain', text: '{{1}}' },
            { style: 'row', label: '', text: '{{2}}' },
            { style: 'row', label: '', text: '{{3}}' },
            { style: 'row', label: '', text: '{{4}}' },
            { style: 'row', label: 'Regular expenses after graduation', text: '{{5}}' },
            { style: 'row', label: '', text: '{{6}}' },
            { style: 'row', label: '', text: '{{7}}' },
            { style: 'row', label: 'Interest rate on student loans in 2006', text: '{{8}}' },
            { style: 'row', label: 'The main rule of managing debt after graduation', text: '{{9}}' },
            { style: 'row', label: 'The type of commercial debt which should be paid last', text: '{{10}}' },
          ],
          examples: [{ id: '0', type: 'short-text', answer: { accepted: ['£3,000'], match: 'exact-ci' } }],
          // Graded by key words; `accepted` is the key as printed. 1–4 and 5–7 count in any order.
          items: [
            { ...anyOrder('1', SOURCES, 0, SOURCE_WORDS, 6), reviewNote: 'The key: 1. Student Loans Company, 2. banks, 3. credit card companies, 4. parents — in any order.' },
            anyOrder('2', SOURCES, 1, SOURCE_WORDS, 6),
            anyOrder('3', SOURCES, 2, SOURCE_WORDS, 6),
            anyOrder('4', SOURCES, 3, SOURCE_WORDS, 6),
            { ...anyOrder('5', EXPENSES, 0, EXPENSE_WORDS, 6), reviewNote: 'The key: 5. accommodation, 6. travel, 7. food — in any order.' },
            anyOrder('6', EXPENSES, 1, EXPENSE_WORDS, 6),
            anyOrder('7', EXPENSES, 2, EXPENSE_WORDS, 6),
            { id: '8', type: 'short-text', answer: { accepted: ['2.6%'], match: 'keywords', keywords: [['2.6', '2,6']], maxWords: 6 } },
            { id: '9', type: 'short-text', answer: { accepted: ['Prioritise debts'], match: 'keywords', keywords: [['priorit', 'most expensive']], maxWords: 6 } },
            { id: '10', type: 'short-text', answer: { accepted: ['student loans'], match: 'keywords', keywords: [['student'], ['loan']], maxWords: 6 } },
          ],
        },
        {
          id: 'R-1-2',
          label: 'Text 1 · Task 2',
          instructions:
            'Read the text again and use it to decide if the statements are true (T) or false (F). Write your answers in the table below according to the example (0). Please note that if all your answers are marked as true or as false, your answers will be disqualified.',
          passage: debtText,
          booleanLabels: ['T', 'F'],
          rules: { allSameBooleanIsZero: true },
          examples: [{ id: '0', type: 'boolean', statement: 'Each graduate has at least £13,500 debt on student loan.', answer: false }],
          items: [
            { id: '11', type: 'boolean', statement: 'Online banking is a recommended tool to avoid over-drafts on graduate accounts.', answer: true },
            { id: '12', type: 'boolean', statement: 'Banks are trying to make students stay with them after graduation by offering extra services and discounts.', answer: true },
            { id: '13', type: 'boolean', statement: 'Students have to start paying back their loans straight after graduation.', answer: false },
            { id: '14', type: 'boolean', statement: 'The compulsory instalment on student loans is 9% on the student’s earnings.', answer: false },
            { id: '15', type: 'boolean', statement: 'If you go bankrupt, you do not have to pay back your student loan, according to the measure introduced in 2004.', answer: false },
          ],
        },
        {
          id: 'R-2-1',
          label: 'Text 2 · Task 1',
          instructions:
            'Read the text and match the summaries with the correct paragraphs. Write your answers in the table according to the example (0). There is one extra summary you don’t need to use.',
          passage: [{ style: 'title', text: '2. Under the Hole in the Sky' }, ...ozoneParagraphs.map((text, i): PassageBlock => ({ text, itemId: String(i) }))],
          bankTitle: 'SUMMARIES',
          bank: [
            { key: 'A', text: 'Training for the locals' },
            { key: 'B', text: 'A car park attendant’s observations' },
            { key: 'C', text: 'The responsibility of the developed world' },
            { key: 'D', text: 'The establishment of a warning system' },
            { key: 'E', text: 'Chile’s special geographical situation' },
            { key: 'F', text: 'The health impacts of the ozone hole' },
            { key: 'G', text: 'Consumption of CFCs in Chile' },
          ],
          unusedBankCount: 1,
          examples: [{ id: '0', type: 'choice', answer: 'B' }],
          items: [
            { id: '1', type: 'choice', answer: 'E' },
            { id: '2', type: 'choice', answer: 'F' },
            { id: '3', type: 'choice', answer: 'D' },
            { id: '4', type: 'choice', answer: 'A' },
            { id: '5', type: 'choice', answer: 'C' },
          ],
        },
        {
          id: 'R-2-2',
          label: 'Text 2 · Task 2',
          instructions: 'Read the text and provide short answers to the questions according to the example (0), in no more than 7 words.',
          passage: ozoneText,
          examples: [
            {
              id: '0',
              type: 'short-text',
              prompt: 'Why is it dangerous to go out in Punta Arenas on a red-light day?',
              answer: { accepted: ['the ozone hole is over the city'], match: 'exact-ci' },
            },
          ],
          items: [
            {
              id: '6',
              type: 'short-text',
              prompt: 'What harmful health effect of the radiation can be seen today in Chile?',
              answer: { accepted: ['skin cancer has risen 66%'], match: 'keywords', keywords: [['skin cancer', 'cancer']], maxWords: 7 },
            },
            {
              ...anyOrder('7', MEASURES, 0, MEASURE_WORDS, 7),
              prompt: 'What measures has the health department taken to make residents better-informed? (1)',
              reviewNote: 'The key: 7. solar stoplights, 8. education programs — in either order.',
            },
            { ...anyOrder('8', MEASURES, 1, MEASURE_WORDS, 7), prompt: 'What measures has the health department taken to make residents better-informed? (2)' },
            {
              id: '9',
              type: 'short-text',
              prompt: 'How does the population react to the advice issued by the authorities?',
              answer: { accepted: ['most of them ignore it'], match: 'keywords', keywords: [['ignor', 'don’t', "don't", 'do not', 'disregard']], maxWords: 7 },
            },
            {
              id: '10',
              type: 'short-text',
              prompt: 'What should the developed countries do to help Chile and countries in a similar position?',
              answer: {
                accepted: ['provide money for monitoring and research'],
                match: 'keywords',
                keywords: [['money', 'fund', 'financ', 'econom', 'pay', 'relief']],
                maxWords: 7,
              },
            },
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
          instructions:
            'Study the table, and describe it in about 120-160 words, using the 10 given words or expressions in their right forms. You may include numerical data as well to support your description, which should contain comparisons.',
          table: {
            title: 'ESTIMATED DIRECT AND INDIRECT JOBS IN RENEWABLE ENERGY WORLDWIDE, BY INDUSTRY',
            caption: 'Thousand Jobs. (*CSP= Concentrating Solar Power Technology) Source: www. solar.com, 2014',
            head: ['Technologies', 'Global', 'China', 'EU-27', 'Brazil', 'United States', 'India', 'Germany', 'Spain'],
            rows: [
              ['Biomass', '753', '266', '274', '', '152', '58', '57', '39'],
              ['Biofuels', '1,379', '24', '109', '804', '217', '35', '23', '4'],
              ['Biogas', '266', '90', '71', '', '', '85', '50', '1'],
              ['Geothermal', '180', '', '51', '', '35', '', '14', '0.3'],
              ['Hydropower (Small)', '109', '', '24', '', '8', '12', '7', '2'],
              ['Solar PV', '1,360', '300', '312', '', '90', '112', '88', '12'],
              ['CSP', '53', '', '36', '', '17', '', '2', '34'],
              ['Solar Heating/ Cooling', '892', '800', '32', '', '12', '41', '11', '1'],
              ['Wind Power', '753', '267', '270', '29', '81', '48', '118', '28'],
              ['Total', '5,745', '1,747', '1,179', '833', '611', '391', '378', '120'],
            ],
            numericColumns: [1, 2, 3, 4, 5, 6, 7, 8],
          },
          items: [
            {
              id: '1',
              type: 'production',
              prompt: ['Words and expressions to use:'],
              opening: 'This is a table showing the number of estimated direct and indirect jobs in renewable energy industries, in thousands.',
              contentPoints: ['available', 'column', 'data', 'employ', 'fewest', 'find', 'highest', 'provide', 'row', 'significant', 'table'],
              minWords: 120,
              maxWords: 160,
              register: 'description',
              rubricId: 'nyelvvizsga-b2-gazdasagi-1',
              modelAnswer: [
                'The first column lists the different technologies in the renewable energy industry. The other columns present several European and Asian countries, as well as EU-27 and worldwide data.',
                'In the rows we can find the main renewable energy industries, such as biomass, solar PV or wind power. The last row presents the total number of jobs in these industries.',
                'We can see the biofuel and the solar PV sectors provide the highest number of jobs globally.',
                'It is interesting to note that a significant number of people are employed in the biofuel industry in Brazil, namely over 800,000; while the same number of people work in solar heating/cooling in China.',
                'If we compare the different countries, we can see that the fewest jobs in this industry can be found in Spain. The data presented in the table are available on a website: www.solar.com, 2014.',
                '',
                '144 words',
              ].join('\n'),
            },
          ],
        },
        {
          id: 'W-2',
          label: 'Task 2',
          instructions:
            'You have bought a printer, but you have some problems with the delivery. (Your name and address in this role: Joó György/Györgyi, sole proprietor, 12 Wall Street, Manchester, MR6 7T2)',
          items: [
            {
              id: '2',
              type: 'production',
              prompt: ['Write a letter to the manufacturer, (Celetron System, 15 Tulip Street London SW3 NE2), in 140-160 words.', 'In the letter you should'],
              contentPoints: [
                'complain about: being overcharged',
                'complain about: late delivery',
                'complain about: a missing part (lead)',
                'write about the action you want them to take',
              ],
              minWords: 140,
              maxWords: 160,
              register: 'formal-letter',
              rubricId: 'nyelvvizsga-b2-gazdasagi-2',
              modelAnswer: [
                'Celetron System',
                '15 Tulip Street',
                'London',
                'SW3 NE2',
                '',
                '12 Wall Street',
                'Manchester',
                'MR6 7T2',
                '',
                '20 March 2017',
                '',
                'Dear Sir or Madam,',
                '',
                'I am writing to complain about the delivery service you provided to my company.',
                'On 20 February 2017 we placed an order with your company for an HP Laserjet printer. You offered delivery within a week. However, the item arrived in ten days’, which caused us considerable inconveniences.',
                'Furthermore, we realized that a lead was missing in the package so our technicians could not start installing the printer. This means we currently need to use our old, less efficient machine.',
                'Finally, after checking the invoice we found that the item was overcharged. You had offered a 10% discount for this new model previously, but you charged the full price.',
                'These errors put my firm in a difficult position. Therefore we request you to send us the missing part as soon as possible. In addition, please let us know what compensation you can offer in this situation.',
                '',
                'We look forward to hearing from you.',
                '',
                'Yours faithfully,',
                '',
                'György Joó',
                '',
                'sole proprietor',
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
        storagePath: 'nyelvvizsga-en-b2-gazdasagi-minta-01.mp3',
        durationSec: 893,
        // Text 2 starts with its announcement, right after Text 1's last pause (loudness scan).
        taskMarkers: [
          { taskId: 'L-1', startSec: 0 },
          { taskId: 'L-2', startSec: 415 },
        ],
      },
      tasks: [
        {
          id: 'L-1',
          label: 'Text 1',
          instructions:
            'Listen to the text about the way the selling of bottled water is regulated in the American city of Concord. Based on the text, decide if the statements are true (T) or false (F). Write your answers in the table below, according to the example (0). Please note that if all your answers are marked as true or as false, your answers will be disqualified.',
          booleanLabels: ['T', 'F'],
          rules: { allSameBooleanIsZero: true },
          examples: [{ id: '0', type: 'boolean', statement: 'It is forbidden to sell water in bottles smaller than 1 litre', answer: true }],
          items: [
            { id: '1', type: 'boolean', statement: 'The new law was initiated by the authorities.', answer: false },
            { id: '2', type: 'boolean', statement: 'Jean Hill thinks bottled water is harmful to people’s health.', answer: true },
            { id: '3', type: 'boolean', statement: 'The new law came into force on 1 January.', answer: true },
            { id: '4', type: 'boolean', statement: 'Shops are allowed to sell soft drinks in small bottles.', answer: true },
            { id: '5', type: 'boolean', statement: 'Local shops expect the new law will help their business.', answer: false },
            { id: '6', type: 'boolean', statement: 'Anna Davidson is against the new law.', answer: true },
            { id: '7', type: 'boolean', statement: 'The consumption of bottled water in the U.S. is 50 billion litres per year.', answer: false },
          ],
        },
        {
          id: 'L-2',
          label: 'Text 2',
          instructions:
            'Listen to a part of a lecture about unemployment. Use what you heard to complete the table with your notes of no more than 3 words each, according to the example (0).',
          passage: [
            { style: 'title', text: 'Notes on unemployment' },
            { style: 'bullet', text: '{{0}} discussed in this lecture' },
            { style: 'bullet', text: 'In many ways the most important problem' },
            { style: 'heading', text: 'Unemployment' },
            { style: 'bullet', text: 'Calculated: number of unemployed / number of people on the {{1}}' },
            { style: 'bullet', text: 'Great Depression, 1930s: proportion of unemployed (“idle”): {{2}}' },
            { style: 'bullet', text: '1970s, US: unemployment up together with inflation and {{3}}' },
            { style: 'bullet', text: 'Normal unemployment rate: about {{4}}%' },
            { style: 'heading', text: 'Three kinds of unemployment' },
            { style: 'bullet', text: '1. Frictional type' },
            { style: 'bullet', text: '– Natural part of {{5}}' },
            { style: 'bullet', text: '2. Cyclical type' },
            { style: 'bullet', text: '– When the economy is in {{6}}' },
            { style: 'bullet', text: '– A lot of time spent on trying to solve it' },
            { style: 'bullet', text: '3. {{7}} type' },
            { style: 'bullet', text: '– When {{8}} makes jobs unnecessary' },
            { style: 'bullet', text: '– Autoworker replaced by {{9}}' },
            { style: 'bullet', text: '– Telephone exchange operator replaced by {{10}}' },
            { style: 'bullet', text: '– This type is the most difficult to cure' },
            { style: 'bullet', text: 'Big problems for developed countries: {{11}} and {{12}} of jobs' },
            { style: 'bullet', text: 'Indian well-educated work-forces work for relatively {{13}}' },
          ],
          examples: [{ id: '0', type: 'short-text', answer: { accepted: ['Macroeconomic problem'], match: 'exact-ci' } }],
          items: [
            { id: '1', type: 'short-text', answer: { accepted: ['labour force'], match: 'keywords', keywords: [['labour', 'labor', 'work'], ['force']], maxWords: 3 } },
            { id: '2', type: 'short-text', answer: { accepted: ['1/4', 'a quarter', 'one fourth'], match: 'keywords', keywords: [['1/4', 'quarter', 'fourth', '25']], maxWords: 3 } },
            { id: '3', type: 'short-text', answer: { accepted: ['interest rates'], match: 'keywords', keywords: [['interest']], maxWords: 3 } },
            { id: '4', type: 'short-text', answer: { accepted: ['5 or 6'], match: 'keywords', keywords: [['5', 'five', '6', 'six']], maxWords: 3 } },
            { id: '5', type: 'short-text', answer: { accepted: ['job seeking process'], match: 'keywords', keywords: [['seek', 'search', 'hunt', 'look']], maxWords: 3 } },
            { id: '6', type: 'short-text', answer: { accepted: ['recession'], match: 'keywords', keywords: [['recession']], maxWords: 3 } },
            { id: '7', type: 'short-text', answer: { accepted: ['structural'], match: 'keywords', keywords: [['structur']], maxWords: 3 } },
            { id: '8', type: 'short-text', answer: { accepted: ['change in technology'], match: 'keywords', keywords: [['technolog']], maxWords: 3 } },
            { id: '9', type: 'short-text', answer: { accepted: ['a robot'], match: 'keywords', keywords: [['robot']], maxWords: 3 } },
            { id: '10', type: 'short-text', answer: { accepted: ['worker in India'], match: 'keywords', keywords: [['india']], maxWords: 3 } },
            {
              ...anyOrder('11', OUTSOURCING, 0, ['outsourc', 'offshor', 'off-shor'], 3),
              reviewNote: 'The key: 11. outsourcing, 12. offshoring — in either order.',
            },
            anyOrder('12', OUTSOURCING, 1, ['outsourc', 'offshor', 'off-shor'], 3),
            { id: '13', type: 'short-text', answer: { accepted: ['lower wages'], match: 'keywords', keywords: [['low', 'less', 'cheap'], ['wage', 'salar', 'pay', 'money']], maxWords: 3 } },
          ],
        },
      ],
    },
  ],
}

export default paper
