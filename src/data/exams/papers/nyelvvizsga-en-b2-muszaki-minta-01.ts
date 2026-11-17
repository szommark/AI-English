// Zöld Út Nyelvvizsgaközpont (MATE), B2 Technical English (középfok, műszaki), sample paper 1 —
// freely downloadable at https://zoldut.uni-mate.hu/mintafeladatsorok. Transcribed verbatim from
// the task sheet and its answer key, including the source's own typos ("channeled trough", "the
// product themselves", "the 10 given words" over a list of eleven). The writing table is
// transcribed from the image on the sheet. Added for the screen: "Text 1/2 ·" in the reading
// task labels. The speaking part is its own paper (nyelvvizsga-en-b2-muszaki-szobeli-minta-01 in
// ../speaking.ts). No section times are printed on this paper, so none are set.
import type { ExamPaper, PassageBlock, ShortTextItem } from '../types'

const martelaText: PassageBlock[] = [
  { style: 'title', text: '1. Martela’s new centre' },
  { style: 'note', text: 'The hi-tech glass building epitomises future trends.' },
  {
    text: '“Office work has undergone a radical transformation in the last ten years, placing new demands on office design and furniture,” explains Pekka Martela, Deputy Chairman of the Board of Martela Furniture Company. “Our old facilities could not sufficiently support our teamwork model. Our focus in designing a new building was flexibility and adaptability of the premises, and designing a new building provided us the opportunity to put ourselves in the shoes of our customers”. Ecology and low running costs throughout the life cycle were also considered important.',
  },
  {
    text: 'Architect Mauri Tommila was asked to design the new building. On paper the transparent, spacious glass building he designed perfectly complemented Martela’s values and visions.',
  },
  { style: 'heading', text: 'A social meeting place' },
  {
    text: 'More than ever, offices are also becoming social meeting places. People often work in other ways than merely sitting alone at their workstations or desks. The flow of information internally and increasing interaction with colleagues are now considered vital, and have been taken into account in the floor layout of Martela House.',
  },
  {
    text: '“The design of Martela House is intended to facilitate flexibility and interaction between departments. As a result, an environment is created which enables people to get together for spontaneous meetings. The four rectangular spaces on each floor are ideally suited for open plan offices, each comfortably accommodating 25-30 people. They are large enough to give everyone their own personal space, but small enough for everyone to feel they are very much a part of the same team,” Mauri Tommila explains.',
  },
  {
    text: 'Martela House has double facades made of glass and steel. “Glass materials have developed incredibly in recent years. These days glass buildings are very energy efficient,” the architect says.',
  },
  { style: 'heading', text: 'Solar energy' },
  {
    text: 'Martela House exploits a great deal of solar energy. The sun-heated or cool air between the two sections of double façade is used in the air conditioning and the building is brightened by natural light. These enable savings of up to 10 percent on electricity and on running costs. Natural and artificial light alike are indirectly channeled trough the building via the ceiling. This combination provides the best solution for illuminating the office space and providing light to work by.“ I don’t know of another building in Finland that has the same kind of indirect lighting system,” Mauri Tommila says.',
  },
  {
    text: 'Desk sharing is one of the new methods used in Martela House. Not every employee has his or her own individual workstation. Instead, people have a portable storage trolley containing everything that they need. Whatever else people might need is stored on their laptops. When employees arrive in the morning, they choose a free workstation.',
  },
  { style: 'heading', text: 'A living exhibition' },
  {
    text: 'Martela House also functions as a living exhibition, as the product themselves are on show and in use in a real working environment. The square shaped departments on each floor all are slightly different. Obviously, each department is fitted with Martela furniture, but the range is wide enough to give each department its own particular character. In some department, wood surfaces dominate; in others they are glass and metal.',
  },
  {
    text: '“People like working in Martela House. Employees have given positive feedback and visitors have been very impressed with what they have seen. Hopefully, many people will be able to visit and draw inspiration from the building,” says Pekka Martela.',
  },
]

const biofuelText: PassageBlock[] = [
  { style: 'title', text: '2. Secret report: biofuel caused food crises' },
  {
    text: 'Biofuels have forced global food prices up by 75% far more than previously estimated according to a confidential World Bank report obtained by the Guardian. The damning unpublished assessment is based on the most detailed analysis of the crises so far, carried out by an internationally respected economist at global financial body.',
  },
  {
    text: 'The figure emphatically contradicts the US government’s claims that plant-derived fuels contribute less than 3% to food-price rises. It will add to pressure on governments in Washington and across Europe, which have turned to plant-derived fuels to reduce emissions of greenhouse gases and reduce their dependence on imported oil.',
  },
  {
    text: 'The news comes at a critical point in the world’s negotiations on biofuels policy. Leaders of the G8 industrialised countries meet next week in Hokkaido, Japan, where they will discuss the food crises and come under intense lobbying from campaigners calling for a moratorium on the use of plant-derived fuels.',
  },
  {
    text: 'It will also put pressure on the British government, which is due to release its own report on the impact of biofuels. The Guardian has previously reported that the British study will state that plant fuels have played a “significant” part in pushing up food prices to record levels.',
  },
  {
    text: '“Political leaders seem intent on suppressing and ignoring the strong evidence that biofuels are a major factor in recent food price rises”, said Robert Bailey, policy adviser at Oxfam.” It is the imperative that we have the full picture. While politicians concentrate on keeping industry lobbies happy, people in poor countries cannot afford enough to eat.',
  },
  {
    text: 'Rising food prices have pushed 100m people worldwide below the poverty line, estimates the World Bank, and have sparked riots from Bangladesh to Egypt. Government ministers have described higher food and fuel prices as “the first real economic crises of globalisation”.',
  },
  {
    text: 'Since April, all petrol and diesel in Britain has had to include 2.5% from biofuels. The EU has been considering raising that target to 10% by 2020, but is faced with mounting evidence that that will only push food prices higher.',
  },
  {
    text: 'The report argues that production of biofuels distorted food markets in three main ways. First, it has diverted grain away from food for fuel, with over a third of US corn now used to produce ethanol and about half of vegetable oils in the EU going towards the production of biodiesel. Second, farmers have been encouraged to set land aside for biofuel production. Third, it has sparked financial speculation in grains, driving prices up higher.',
  },
  {
    text: 'Other reviews of the food crisis looked at it over a much longer period, or have not linked these three factors, and so arrived at smaller estimates of the impact from biofuels. But the report author, Don Mitchell, is a senior economist at the Bank and has done a detailed, month-by-month analysis of the surge in food prices, which allows much closer examination of the link between biofuels and food supply.',
  },
  {
    text: 'Supporters of biofuels argue that they are a greener alternative to relying on oil and other fossil fuels, but even that claim has been disputed by some experts, who argue that it does not apply to US production of ethanol from plants.',
  },
]

/** An answer that may go in any row of its group (the key prints them in one order). */
function anyOrder(id: string, all: string[], index: number, keywords: string[], maxWords: number): ShortTextItem {
  return {
    id,
    type: 'short-text',
    answer: { accepted: [all[index], ...all.filter((_, i) => i !== index)], match: 'keywords', keywords: [keywords], maxWords },
  }
}

const DEMANDS = ['flexibility', 'adaptability', 'ecology', 'low running costs']
const DEMAND_WORDS = ['flexib', 'adapt', 'ecolog', 'environment', 'running cost', 'low cost']
const LAYOUT = ['flexibility', 'interaction between departments', 'flow of information']
const LAYOUT_WORDS = ['flexib', 'interaction', 'information', 'communication']
const FACADE = ['air conditioning', 'natural lighting']
const FACADE_WORDS = ['air', 'condition', 'ventilat', 'light', 'bright']
const ADVANTAGES = ['reducing dependence on oil / fossil fuels', 'reduced emission of greenhouse gases', 'environment friendly']
const ADVANTAGE_WORDS = ['oil', 'fossil', 'depend', 'import', 'emission', 'greenhouse', 'environment', 'green']
const EFFECTS = ['diverting food grain for fuel', 'set aside land for biofuel production', 'financial speculation on grains']
const EFFECT_WORDS = ['divert', 'grain', 'land', 'speculat', 'price']

const paper: ExamPaper = {
  id: 'nyelvvizsga-en-b2-muszaki-minta-01',
  type: 'nyelvvizsga',
  language: 'en',
  level: 'B2',
  sittingLabelHu: 'Minta 1.',
  track: 'technical',
  source:
    'Zöld Út Nyelvvizsgaközpont (MATE): B2 Technical English (középfok, műszaki) mintafeladatsor — feladatsor, megoldókulcs és hanganyag. Ingyenesen letölthető: https://zoldut.uni-mate.hu/mintafeladatsorok',
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
            'Read the text and complete the table with your notes based on the text with no more than 5 words, according to the example (0).',
          passage: [
            ...martelaText,
            { style: 'row', label: 'The problem with the old building', text: '{{0}}' },
            { style: 'row', label: 'New demands for designing buildings by changing office work', text: '{{1}}' },
            { style: 'row', label: '', text: '{{2}}' },
            { style: 'row', label: '', text: '{{3}}' },
            { style: 'row', label: '', text: '{{4}}' },
            { style: 'row', label: 'Two main aspects of Martela House when designing the floor layout', text: '{{5}}' },
            { style: 'row', label: '', text: '{{6}}' },
            { style: 'row', label: 'The floor layout consists of', text: '{{7}}' },
            { style: 'row', label: 'The advantage of modern glass buildings', text: '{{8}}' },
            { style: 'row', label: 'The practical use of double facade', text: '{{9}}' },
            { style: 'row', label: '', text: '{{10}}' },
            { style: 'row', label: 'The aim of the exhibition in Martela House', text: '{{11}}' },
            { style: 'row', label: 'Customer satisfaction with Martela House', text: '{{12}}' },
          ],
          examples: [{ id: '0', type: 'short-text', answer: { accepted: ['wasn’t good for teamwork'], match: 'exact-ci' } }],
          // Graded by key words; `accepted` is the key as printed (cut to the word limit where the key adds notes; see reviewNote). 1–4, 5–6 and 9–10 count in any order.
          items: [
            { ...anyOrder('1', DEMANDS, 0, DEMAND_WORDS, 5), reviewNote: 'The key: 1. flexibility, 2. adaptability, 3. ecology, 4. low running costs — in any order.' },
            anyOrder('2', DEMANDS, 1, DEMAND_WORDS, 5),
            anyOrder('3', DEMANDS, 2, DEMAND_WORDS, 5),
            anyOrder('4', DEMANDS, 3, DEMAND_WORDS, 5),
            { ...anyOrder('5', LAYOUT, 0, LAYOUT_WORDS, 5), reviewNote: 'The key: 5. flexibility, 6. interaction / flow of information between departments — in either order.' },
            anyOrder('6', LAYOUT, 1, LAYOUT_WORDS, 5),
            { id: '7', type: 'short-text', answer: { accepted: ['four rectangular spaces'], match: 'keywords', keywords: [['four', '4'], ['rectang', 'space', 'square']], maxWords: 5 } },
            { id: '8', type: 'short-text', answer: { accepted: ['energy efficient'], match: 'keywords', keywords: [['energy']], maxWords: 5 } },
            { ...anyOrder('9', FACADE, 0, FACADE_WORDS, 5), reviewNote: 'The key: 9. air conditioning, 10. natural lighting — in either order.' },
            anyOrder('10', FACADE, 1, FACADE_WORDS, 5),
            { id: '11', type: 'short-text', answer: { accepted: ['products shown in use'], match: 'keywords', keywords: [['product', 'furniture']], maxWords: 5 } },
            { id: '12', type: 'short-text', answer: { accepted: ['very impressed'], match: 'keywords', keywords: [['impress', 'positive', 'satisf']], maxWords: 5 } },
          ],
        },
        {
          id: 'R-1-2',
          label: 'Text 1 · Task 2',
          instructions:
            'Read the text again and use it to decide if the statements are true (T) or false (F). Write your answers in the table below according to the example (0). Please note that if all your answers are marked as true or as false, your answers will be disqualified.',
          passage: martelaText,
          booleanLabels: ['T', 'F'],
          rules: { allSameBooleanIsZero: true },
          examples: [{ id: '0', type: 'boolean', statement: 'Employees of the company have their own workstations.', answer: false }],
          items: [
            { id: '13', type: 'boolean', statement: 'The lighting system of Martela House uses only natural light.', answer: false },
            { id: '14', type: 'boolean', statement: 'All departments are exactly alike.', answer: false },
            { id: '15', type: 'boolean', statement: 'The company believes that their sales will grow by the increasing number of visitors.', answer: true },
          ],
        },
        {
          id: 'R-2-1',
          label: 'Text 2 · Task 1',
          instructions:
            'Read the text and complete the table with your notes based on the text with no more than 6 words, according to the example (0).',
          passage: [
            ...biofuelText,
            { style: 'row', label: 'The organisation behind the report on food crises', text: '{{0}}' },
            { style: 'row', label: 'Advantages of plant-derived fuels', text: '{{1}}' },
            { style: 'row', label: '', text: '{{2}}' },
            { style: 'row', label: 'Effects of biofuel use on food markets', text: '{{3}}' },
            { style: 'row', label: '', text: '{{4}}' },
            { style: 'row', label: '', text: '{{5}}' },
            { style: 'row', label: 'Environmental activists’ demand regarding biofuels', text: '{{6}}' },
          ],
          examples: [{ id: '0', type: 'short-text', answer: { accepted: ['World Bank'], match: 'exact-ci' } }],
          // 1–2 and 3–5 count in any order.
          items: [
            { ...anyOrder('1', ADVANTAGES, 0, ADVANTAGE_WORDS, 6), reviewNote: 'The key: 1. reducing dependence on oil / fossil fuels, 2. reduced emission of greenhouse gases (+environment friendly) — in either order.' },
            anyOrder('2', ADVANTAGES, 1, ADVANTAGE_WORDS, 6),
            {
              ...anyOrder('3', EFFECTS, 0, EFFECT_WORDS, 6),
              reviewNote: 'The key: 3. diverting food grain for fuel, 4. set aside land for biofuel production (+rising food prices), 5. financial speculation on grains — in any order.',
            },
            anyOrder('4', EFFECTS, 1, EFFECT_WORDS, 6),
            anyOrder('5', EFFECTS, 2, EFFECT_WORDS, 6),
            { id: '6', type: 'short-text', answer: { accepted: ['moratorium on their use'], match: 'keywords', keywords: [['moratorium', 'ban', 'stop', 'suspen']], maxWords: 6 } },
          ],
        },
        {
          id: 'R-2-2',
          label: 'Text 2 · Task 2',
          instructions:
            'Read the text again and use it to decide if the statements are true (T) or false (F). Write your answers in the table below according to the example (0). Please note that if all your answers are marked as true or as false, your answers will be disqualified.',
          passage: biofuelText,
          booleanLabels: ['T', 'F'],
          rules: { allSameBooleanIsZero: true },
          examples: [{ id: '0', type: 'boolean', statement: 'The Bank’s analyst conducted his investigations by examining data monthly.', answer: true }],
          items: [
            { id: '7', type: 'boolean', statement: 'The riots in the developing countries can be linked to the rising food prices.', answer: true },
            { id: '8', type: 'boolean', statement: 'The various studies mentioned agree about how much biofuels contribute to the rising food prices.', answer: false },
            { id: '9', type: 'boolean', statement: 'Experts worldwide agree that biofuels are more environment-friendly than fossil fuels.', answer: false },
            { id: '10', type: 'boolean', statement: 'American and European governments alike depend on plant-derived fuels more and more.', answer: true },
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
            'Study the table, and describe it in about 120-160 words, using the 10 given words or expressions in their right forms. You may include numerical data as well to support your description, which should refer to tendencies and contain comparisons.',
          table: {
            title: 'Worldwide Smartphone Sales to End Users by Operating System in 2013 (Thousands of Units)',
            caption: 'Source: Gartner (February 2014)',
            head: ['Operating System', '2013 Units', '2013 Market Share (%)', '2012 Units', '2012 Market Share (%)'],
            rows: [
              ['Android', '758,719.9', '78.4', '451,621.0', '66.4'],
              ['iOS', '150,785.9', '15.6', '130,133.2', '19.1'],
              ['Microsoft', '30,842.9', '3.2', '16,940.7', '2.5'],
              ['BlackBerry', '18,605.9', '1.9', '34,210.3', '5.0'],
              ['Other OS', '8,821.2', '0.9', '47,203.0', '6.9'],
              ['Total', '967,775.8', '100.0', '680,108.2', '100.0'],
            ],
            numericColumns: [1, 2, 3, 4],
          },
          items: [
            {
              id: '1',
              type: 'production',
              prompt: ['Words and expressions to use:'],
              opening: 'The table shows the number of smartphones with different operating systems sold in 2012 and 2013, and the corresponding market shares.',
              contentPoints: ['account for', 'compare', 'competition', 'corresponding', 'equal', 'gain', 'increase', 'popular', 'refer to', 'represent', 'suffer'],
              minWords: 120,
              maxWords: 160,
              register: 'description',
              rubricId: 'nyelvvizsga-b2-muszaki-1',
              modelAnswer: [
                'In the first column the operating systems, such as Android or iOS are represented. The second and the fourth columns refer to units sold in 2013 and 2012, while the third and the fifth columns present the market share. The sales are expressed in thousands of units.',
                'There is a heavy competition in the smartphone market. This table compares the sales of units by operating systems. It can be clearly seen that Android is the most popular operating system. In 2012 it accounted for 66.4% of the market with over 450,000,000 units sold. The market share of this operating system increased to 78%, which is a considerable growth. Between 2012 and 2013 Microsoft could also gain market share.',
                'According to the table, Blackberry suffered a considerable loss in its market share within a year. Its share decreased from 5% to 1.9%.',
              ].join('\n'),
            },
          ],
        },
        {
          id: 'W-2',
          label: 'Task 2',
          instructions:
            'You have bought an amplifier, but you have some problems with the delivery. (Your name and address in this role: Kovács Imre/Ildikó, sole proprietor, 12 Rose Street, Manchester, MR6 7T2)',
          items: [
            {
              id: '2',
              type: 'production',
              prompt: ['Write a letter to the manufacturer, (Celetron System, 15 Bond Street London SW2 NE1), in 140-160 words.', 'In the letter you should'],
              contentPoints: [
                'complain about: being overcharged',
                'complain about: late delivery',
                'complain about: a missing part (lead)',
                'write about the action you want them to take',
              ],
              minWords: 140,
              maxWords: 160,
              register: 'formal-letter',
              rubricId: 'nyelvvizsga-b2-muszaki-2',
              modelAnswer: [
                'Celetron System',
                '15 Bond Street',
                'London',
                'SW2 NE1',
                '',
                '12 Rose Street',
                'Manchester',
                'MR6 7T2',
                '',
                '25 April 2017',
                '',
                'Dear Sir or Madam,',
                '',
                'I am writing to complain about the service you provided to my company.',
                'On 10 April 2017 we placed an order with your company for a Sony amplifier. You offered delivery within a week. However, the item arrived in ten days’, which caused us considerable inconveniences.',
                'Furthermore, we realized that a lead was missing in the package so our technicians could not start installing it. We were supposed to use the amplifier at a company event. Unfortunately, we had to use our old device.',
                'Finally, after checking the invoice we found that the item was overcharged. You had offered a 10% discount for this new model previously, but you charged the full price.',
                'These errors put our firm in a difficult position. Therefore we request to replace the missing part as soon as possible. Please, also inform us what compensation you can offer in this situation.',
                '',
                'We look forward to hearing from you.',
                '',
                'Yours faithfully,',
                '',
                'Imre Kovács',
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
        storagePath: 'nyelvvizsga-en-b2-muszaki-minta-01.mp3',
        durationSec: 938,
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
            'Listen to the text about the lift business. Use what you heard to complete the table with your notes of no more than 3 words each, according to the example (0).',
          passage: [
            { style: 'title', text: 'Notes on the lift business' },
            { style: 'bullet', text: 'Four firms → {{0}} of global market' },
            { style: 'bullet', text: 'Otis (America), Kone (Finland), ThyssenKrupp (Germany), Schindler ({{1}})' },
            { style: 'bullet', text: 'High-rise offices use {{2}}' },
            { style: 'bullet', text: 'This year: worldwide demand for lifts: {{3}}' },
            { style: 'heading', text: 'Maintenance' },
            { style: 'bullet', text: '$2,000-5,000 / year cost of keeping lifts {{4}}' },
            { style: 'bullet', text: 'Profit margin: {{5}}' },
            { style: 'bullet', text: 'More stable revenue than from {{6}}' },
            { style: 'bullet', text: 'Lift companies: ½ of profit from {{7}}' },
            { style: 'bullet', text: 'Newcomers to the market need: network of {{8}}' },
            { style: 'heading', text: 'The lift industry' },
            { style: 'bullet', text: 'Lifts are becoming more {{9}}' },
            { style: 'bullet', text: 'Pricy luxury offers: {{10}} cabins and smarter {{11}}' },
            { style: 'bullet', text: 'Sideline: keycards and {{12}} services' },
            { style: 'bullet', text: 'Remote performance monitoring → fewer costly trips {{13}}' },
          ],
          examples: [{ id: '0', type: 'short-text', answer: { accepted: ['two thirds'], match: 'exact-ci' } }],
          items: [
            { id: '1', type: 'short-text', answer: { accepted: ['Switzerland'], match: 'keywords', keywords: [['switzerland', 'swiss']], maxWords: 3 } },
            { id: '2', type: 'short-text', answer: { accepted: ['escalators'], match: 'keywords', keywords: [['escalator']], maxWords: 3 } },
            { id: '3', type: 'short-text', answer: { accepted: ['700,000'], match: 'keywords', keywords: [['700']], maxWords: 3 } },
            { id: '4', type: 'short-text', answer: { accepted: ['running smoothly'], match: 'keywords', keywords: [['run', 'work', 'smooth']], maxWords: 3 } },
            { id: '5', type: 'short-text', answer: { accepted: ['25-35%'], match: 'keywords', keywords: [['25'], ['35']], maxWords: 3 } },
            { id: '6', type: 'short-text', answer: { accepted: ['installations'], match: 'keywords', keywords: [['install']], maxWords: 3 } },
            { id: '7', type: 'short-text', answer: { accepted: ['services'], match: 'keywords', keywords: [['servic', 'maintenance']], maxWords: 3 } },
            { id: '8', type: 'short-text', answer: { accepted: ['technicians'], match: 'keywords', keywords: [['technician', 'engineer', 'mechanic']], maxWords: 3 } },
            { id: '9', type: 'short-text', answer: { accepted: ['standardised'], match: 'keywords', keywords: [['standardi']], maxWords: 3 } },
            { id: '10', type: 'short-text', answer: { accepted: ['double-decker'], match: 'keywords', keywords: [['double']], maxWords: 3 } },
            { id: '11', type: 'short-text', answer: { accepted: ['control panels'], match: 'keywords', keywords: [['control', 'panel']], maxWords: 3 } },
            { id: '12', type: 'short-text', answer: { accepted: ['consulting services'], match: 'keywords', keywords: [['consult']], maxWords: 3 } },
            { id: '13', type: 'short-text', answer: { accepted: ['inspect'], match: 'keywords', keywords: [['inspect', 'check']], maxWords: 3 } },
          ],
        },
      ],
    },
  ],
}

export default paper
