// Zöld Út Nyelvvizsgaközpont (MATE), C1 Economics and management (felsőfok, gazdasági), sample
// paper 1 — freely downloadable at https://zoldut.uni-mate.hu/mintafeladatsorok. Transcribed
// verbatim from the task sheet and its answer key, including the source's own typos ("Brasil",
// "3,6"). The answer key's sample report is cut off after "Results of the participation" in the
// source and is kept as printed. Added for the screen: "Text 1/2 ·" in the task labels (both
// texts number their tasks 1 and 2), and "First/Second news item:" before listening statements 1
// and 5, where the sheet prints them as headings. This sample has no speaking part, and no
// section times are printed on it, so none are set.
import type { ExamPaper, PassageBlock, ShortTextItem } from '../types'

const relationshipsText: PassageBlock[] = [
  { style: 'title', text: '1. Develop Effective Work Relationships' },
  {
    text: 'You can submarine your career and work relationships by the actions you take and the behaviors you exhibit at work. No matter your education, your experience, or your title, if you can’t play well with others, you will never accomplish your work mission.',
  },
  {
    text: 'How important are effective work relationships? Effective work relationships form the basis for promotion, pay increases, goal accomplishment, and job satisfaction.',
  },
  {
    text: 'The Gallup organization studied indicators of work satisfaction. They found that whether you have a best friend at work was one of the twelve key questions that predicted job satisfaction.',
  },
  { text: 'A supervisor in a several hundred person company quickly earned a reputation for not playing well with others.' },
  { text: 'He collected data and used the data to find fault, place blame, and make other employees look bad. He enjoyed identifying problems but rarely suggested solutions.' },
  {
    text: 'He bugged his supervisor weekly for a bigger title and more money so he could tell other employees what to do. When he announced he was job hunting, not a single employee suggested that the company take action to convince him to stay. He had burned his bridges.',
  },
  { text: 'These are the top seven ways you can play well with others at work. They form the basis for effective work relationships.' },
  {
    text: 'Bring suggested solutions with the problems to the meeting table. Some employees spend an inordinate amount of time identifying problems. In my opinion, that’s the easy part. Thoughtful solutions are the challenge that will earn respect and admiration from coworkers and bosses.',
  },
  {
    text: 'Don’t ever play the blame game. You alienate coworkers, supervisors, and reporting staff. Yes, you may need to identify who was involved in a problem. You may even ask the Deming question: what about the work system caused the employee to fail? But, not my fault and publicly identifying and blaming others for failures will earn enemies. These enemies will, in turn, help you to fail. You do need allies at work.',
  },
  {
    text: 'Your verbal and nonverbal communication matters. If you talk down to another employee, use sarcasm, or sound nasty, the other employee hears you. We are all radar machines that constantly scope out our environment.',
  },
  {
    text: 'Never blind side a coworker, boss, or reporting staff person. If the first time a coworker hears about a problem is in a staff meeting or from an email sent to his supervisor, you have blind sided the coworker. Always discuss problems, first, with the people directly involved who "own" the work system. Also called lynching or ambushing your coworkers, you will never build effective work alliances unless your coworkers trust you. And, without alliances, you never accomplish the most important goals.',
  },
  {
    text: 'Keep your commitments. In an organization, work is interconnected. If you fail to meet deadlines and commitments, you affect the work of other employees. Always keep commitments, and if you can’t, make sure all affected employees know what happened. Provide a new due date and make every possible effort to honor the new deadline.',
  },
  {
    text: 'Share credit for accomplishments, ideas, and contributions. How often do you accomplish a goal or complete a project with no help from others? If you are a manager, how many of the great ideas you promote were contributed by staff members? Take the time, and expend the energy, to thank, reward, recognize and specify contributions of the people who help you succeed. This is a no-fail approach to building effective work relationships.',
  },
  {
    text: 'Help other employees find their greatness. Every employee in your organization has talents, skills, and experience. If you can help fellow employees harness their best abilities, you benefit the organization immeasurably. The growth of individual employees benefits the whole. Compliment, recognize, praise, and notice contributions. You don’t have to be a manager to help create a positive, motivating environment for employees. In this environment, employees do find and contribute their greatness.',
  },
  {
    text: 'If you regularly carry out these seven actions, you will play well with others and develop effective work relationships. Coworkers will value you as a colleague. Bosses will believe you play on the right team. You’ll accomplish your work goals, and you may even experience fun, recognition, and personal motivation. Work can’t get any better than that.',
  },
]

const pollutionParagraphs: string[] = [
  'It is loud enough to disturb a family’s television watching. But the problem, as defined, contains its own remedy. Aeroplanes too loud above your house? Well, then: TURN UP THE VOLUME ON THE TELEVISION SET. There are less bizarre ways to solve the problem of aeroplane noise, an annoyance rapidly evolving into a menace. But do not look to the FAA or the aviation industry to help. Quality of life is not their department. Not for people in the air, and certainly not for those on the ground.',
  'Crowded airports, crowded and overbooked planes, delayed flights, lousy service, awful food. Terrible. But most articles are talking about people in the air or in the airports, and not about the vastly greater numbers on the ground who are brutalised as the planes pass overhead. The solution to squalid air travel that experts propose is analogous to the fix (turn up the volume) when loud planes interrupt your television watching. All will be well if you build more runways, more airports, if you schedule more flights, and fling more profit-making, noise-making metal into the air.',
  'We are the people who fly, who use Federal Express and all the other businesses that need planes and airports in order to do their work. Millions of jobs depend on aviation. The general public requires the convenience of air travel (though it is often inconvenient), and we are still, for the most part, passive and stoical about the price paid by everyone in noise and other forms of pollution. Most people regard noise - plane noise, truck noise, city noise, siren noise, car alarm noise, and so on - as a fact of life, at least until it becomes continuous and intolerable, which, for many people, it already has. Or until it dawns on people, those living around airports, that they are paying an unacceptable price in stress, lost sleep, impaired hearing, inability to concentrate, in their children’s ability to learn and in the generally degraded quality of life that results when the mind is tormented by these intrusions.',
  'The expansionist logic of airlines and airports assumes that the air around and above us has an infinitely absorptive capacity and can tolerate any pollution. We used to think that about rivers. It isn’t true, in either case. Industries that pollute rivers have been forced to change, to clean up. The people who worry about pollution from planes (noise pollution, trails of fuel waste raining down) are no longer Luddite crackpots.',
  'The lone eagle, soaring without boundaries in the purity of the upper air, symbolising absolute freedom. The aviation industry, with a sort of corrupt nostalgia, still uses rhetoric about "the freedom to fly." But Lindbergh ultimately became profoundly disgusted with the industry that he had pioneered. He ended life regarding air travel as mere squalor and aviation in general as one of the world’s serious environmental problems.',
  'Not long ago, a "noise consultant" named Mark Johnson, working for Landrum & Brown, addressed a planning meeting for the expansion of the Albany, N.Y., airport. He wagged his eyebrows and declared: "We’re not saying that people who complain about noise are out of their minds. Let’s just say it’s a sociological problem." As more and more people are driven out of their minds by noise, Johnson will find that it has become a political problem as well, and therefore an industry problem. Eventually, the FAA will be forced to abandon its disgracefully intimate collusion with the aviation industry.',
]

const pollutionText: PassageBlock[] = [
  { style: 'title', text: '2. Airline Pollution: The Sky Has Its Limits' },
  { text: 'The Federal Aviation Agency has defined noise pollution.' },
  ...pollutionParagraphs.map((text): PassageBlock => ({ text })),
]

/** The three groups of people for whom air traffic has become inconvenient (6–8, any order). */
function inconvenient(id: string, first: string): ShortTextItem {
  const all = ['people in the air', 'people at the airport', 'people living around the airport']
  return {
    id,
    type: 'short-text',
    answer: {
      accepted: [first, ...all.filter((a) => a !== first)],
      match: 'keywords',
      keywords: [['air', 'airport', 'passenger', 'ground', 'around', 'near', 'resident', 'living', 'fly']],
      maxWords: 5,
    },
  }
}

/** Listening Text 2 items 1–2: any two of the costs of real stores. */
function storeCost(id: string, first: string): ShortTextItem {
  const all = ['rents', 'payrolls', 'security cameras']
  return {
    id,
    type: 'short-text',
    answer: { accepted: [first, ...all.filter((a) => a !== first)], match: 'keywords', keywords: [['rent', 'payroll', 'wage', 'salar', 'staff', 'security', 'camera']], maxWords: 3 },
  }
}

const paper: ExamPaper = {
  id: 'nyelvvizsga-en-c1-gazdasagi-minta-01',
  type: 'nyelvvizsga',
  language: 'en',
  level: 'C1',
  sittingLabelHu: 'Minta 1.',
  track: 'business',
  source:
    'Zöld Út Nyelvvizsgaközpont (MATE): C1 Economics and management (felsőfok, gazdasági) mintafeladatsor — feladatsor, megoldókulcs és hanganyag. Ingyenesen letölthető: https://zoldut.uni-mate.hu/mintafeladatsorok',
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
            ...relationshipsText,
            { style: 'row', label: 'Suggest solutions', text: '{{0}}' },
            { style: 'row', label: 'Blaming others', text: '{{1}}' },
            { style: 'row', label: '', text: '{{2}}' },
            { style: 'row', label: 'Give credit for contributions', text: '{{3}}' },
            { style: 'row', label: 'Discussing problems first', text: '{{4}}' },
            { style: 'row', label: 'Deadlines not met', text: '{{5}}' },
            { style: 'row', label: 'Help others to discover their strength', text: '{{6}}' },
          ],
          examples: [{ id: '0', type: 'short-text', answer: { accepted: ['You will earn respect and admiration'], match: 'exact-ci' } }],
          // Graded by key words (every group must match); `accepted` is the key as printed.
          // Items 1–2 (the two consequences of blaming others) count in either order.
          items: [
            {
              id: '1',
              type: 'short-text',
              answer: { accepted: ['You will earn enemies', 'alienate people'], match: 'keywords', keywords: [['enem', 'alienat']], maxWords: 6 },
              reviewNote: 'The key: 1. You will earn enemies / 2. alienate people — in either order.',
            },
            {
              id: '2',
              type: 'short-text',
              answer: { accepted: ['alienate people', 'You will earn enemies'], match: 'keywords', keywords: [['enem', 'alienat']], maxWords: 6 },
            },
            {
              id: '3',
              type: 'short-text',
              answer: { accepted: ['build effective work relationships'], match: 'keywords', keywords: [['relationship']], maxWords: 6 },
            },
            { id: '4', type: 'short-text', answer: { accepted: ['Build alliances'], match: 'keywords', keywords: [['allian', 'allies', 'trust']], maxWords: 6 } },
            {
              id: '5',
              type: 'short-text',
              answer: { accepted: ['you affect the work of others'], match: 'keywords', keywords: [['affect', 'influenc', 'impact', 'harm', 'hurt'], ['work', 'other', 'employee', 'colleague']], maxWords: 6 },
            },
            {
              id: '6',
              type: 'short-text',
              answer: { accepted: ['whole organisation benefits'], match: 'keywords', keywords: [['organi', 'whole', 'company'], ['benefit', 'gain', 'profit']], maxWords: 6 },
            },
          ],
        },
        {
          id: 'R-1-2',
          label: 'Text 1 · Task 2',
          instructions:
            'Read the text again and use it to decide if the statements are true (T) or false (F). Write your answers in the table below according to the example (0). Please note that if all your answers are marked as true or as false, your answers will be disqualified.',
          passage: relationshipsText,
          booleanLabels: ['T', 'F'],
          rules: { allSameBooleanIsZero: true },
          examples: [{ id: '0', type: 'boolean', statement: 'If you keep all the advice given in the article, you will be a valuable team member.', answer: false }],
          items: [
            { id: '7', type: 'boolean', statement: 'Your education or title does not matter if you intend to develop work relationships.', answer: true },
            { id: '8', type: 'boolean', statement: 'Effective work relationships influence your job satisfaction.', answer: true },
            { id: '9', type: 'boolean', statement: 'Effective work relationships can be developed if you reward people.', answer: true },
            { id: '10', type: 'boolean', statement: 'The supervisor was dismissed because he did not play well with others.', answer: false },
            { id: '11', type: 'boolean', statement: 'The supervisor did not have a boss.', answer: false },
            { id: '12', type: 'boolean', statement: 'If your coworkers trust you, you will be able to accomplish your goals.', answer: true },
            { id: '13', type: 'boolean', statement: 'If you identify who was involved in a problem you will earn enemies.', answer: false },
            { id: '14', type: 'boolean', statement: 'Only the managers can motivate the employees.', answer: false },
            { id: '15', type: 'boolean', statement: 'Having a best friend at work influences job satisfaction.', answer: true },
          ],
        },
        {
          id: 'R-2-1',
          label: 'Text 2 · Task 1',
          instructions:
            'Read the article and match the sentences with the correct paragraphs. Write your answers in the table according to the example (0). There is one extra heading you don’t need to use.',
          passage: [
            { style: 'title', text: '2. Airline Pollution: The Sky Has Its Limits' },
            ...pollutionParagraphs.map((text, i): PassageBlock => ({ text, itemId: String(i) })),
          ],
          bank: [
            { key: 'A', text: 'The Federal Aviation Agency has defined noise pollution' },
            { key: 'B', text: 'Aviation’s pioneer, Lindbergh, embodied the romantic attraction of flight.' },
            { key: 'C', text: 'Most forums see only one side of the problem.' },
            { key: 'D', text: 'Only a great culture could present its people with a dilemma like that.' },
            { key: 'E', text: 'The industry is there to cater to our needs.' },
            { key: 'F', text: 'The problems posed by flying are still being overlooked, but will manifest themselves in following years.' },
            { key: 'G', text: 'Environmentalists say the concept of how the atmosphere is viewed is wrong.' },
          ],
          unusedBankCount: 1,
          examples: [{ id: '0', type: 'choice', answer: 'A' }],
          items: [
            { id: '1', type: 'choice', answer: 'C' },
            { id: '2', type: 'choice', answer: 'E' },
            { id: '3', type: 'choice', answer: 'G' },
            { id: '4', type: 'choice', answer: 'B' },
            { id: '5', type: 'choice', answer: 'F' },
          ],
        },
        {
          id: 'R-2-2',
          label: 'Text 2 · Task 2',
          instructions:
            'Read the text again and complete the sentences based on the text using no more than 5 words, according to the example (0).',
          passage: [
            ...pollutionText,
            { style: 'row', label: 'Charles Lindbergh finally regarded aviation as …', text: '{{0}}' },
            { style: 'row', label: 'Air traffic has become inconvenient for .....', text: '{{6}}' },
            { style: 'row', label: '', text: '{{7}}' },
            { style: 'row', label: '', text: '{{8}}' },
            { style: 'row', label: 'Some consider the atmosphere to be like water, because .....', text: '{{9}}' },
            { style: 'row', label: '', text: '{{10}}' },
          ],
          examples: [{ id: '0', type: 'short-text', answer: { accepted: ['a serious environmental problem'], match: 'exact-ci' } }],
          // 6–8 and 9–10 each count in any order.
          items: [
            { ...inconvenient('6', 'people in the air'), reviewNote: 'The key: 6. people in the air, 7. people at the airport, 8. people living around the airport — in any order.' },
            inconvenient('7', 'people at the airport'),
            inconvenient('8', 'people living around the airport'),
            {
              id: '9',
              type: 'short-text',
              answer: {
                accepted: ['of an infinite absorbing capacity', 'it can tolerate any pollution'],
                match: 'keywords',
                keywords: [['absorb', 'tolerat', 'infinit', 'pollution']],
                maxWords: 5,
              },
              reviewNote: 'The key: 9. of an infinite absorbing capacity, 10. it can tolerate any pollution — in either order.',
            },
            {
              id: '10',
              type: 'short-text',
              answer: {
                accepted: ['it can tolerate any pollution', 'of an infinite absorbing capacity'],
                match: 'keywords',
                keywords: [['absorb', 'tolerat', 'infinit', 'pollution']],
                maxWords: 5,
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
            'Study the table, and describe it in 150-200 words, according to the example (0). The description should include tendencies and comparisons.The description should end with a conclusion or prediction.',
          table: {
            title: 'Consumption of the main dairy products in the BRICS countries in 2014',
            head: ['', 'population (million)', 'liquid milk (kg/inhabitant)', 'butter (kg/inhabitant)', 'cheese (kg/inhabitant)'],
            rows: [
              ['Brasil', '199', '59.9', '0.4', '3,6'],
              ['India', '1260', '41.3', '3.6', '0'],
              ['Russia', '143', '37.3', '2.8', '6.6'],
              ['South Africa', '52', '23.8', '0.3', '1.5'],
              ['China', '1350', '19.9', '0.1', '0.1'],
            ],
            numericColumns: [1, 2, 3, 4],
          },
          items: [
            {
              id: '1',
              type: 'production',
              prompt: [],
              opening: 'This is a table displaying the consumption of the main dairy products in the BRICS countries in 2014.',
              contentPoints: ['tendencies and comparisons', 'a conclusion or prediction at the end'],
              minWords: 150,
              maxWords: 200,
              register: 'description',
              rubricId: 'nyelvvizsga-c1-gazdasagi-1',
              modelAnswer: [
                'BRICS is an abbreviation referring to the initials of the five countries listed in the first column. Based on the second column we can compare the population of the countries given in millions.',
                'The next three columns present the consumption values of three main dairy products, such as liquid milk, butter and cheese. The values are expressed in kg/inhabitant.',
                'It can be clearly seen that the consumption of liquid milk is significantly higher compared to that of the other two dairy products in each country. Of the five examined countries Brazil has the highest liquid milk consumption with 59.9 kg/inhabitant, while this value is the lowest in China with 19.9 kg/inhabitant.',
                'Butter and cheese consumption values are relatively low in these countries. The only exception is Russia, where cheese consumption is 6.6 kg/inhabitant. The other values range from 0.1 and 3.6 kg/inhabitant. It is interesting to note that – according to this table – cheese is not consumed at all in India.',
                'To sum up, we can say that in the given countries, which are located in different continents, liquid milk can be considered the dominant dairy product people consume.',
              ].join('\n'),
            },
          ],
        },
        {
          id: 'W-2',
          label: 'Task 2',
          instructions: 'You work for the PR Department of an international company based in Hungary.',
          items: [
            {
              id: '2',
              type: 'production',
              prompt: [
                'You have to write a report in 180-200 words for the English manager of the department, Anthony Turner, about the London Trade Fair in which the company took part as an exhibitor last week. Your name in this role: Koós Beáta/Béla.',
                'In your report write about',
              ],
              contentPoints: [
                'facilities in the fair (location, stalls, equipment, decoration)',
                'organisation (booking, hostesses, signposting)',
                'results of participation / recommendations',
              ],
              minWords: 180,
              maxWords: 200,
              register: 'report',
              rubricId: 'nyelvvizsga-c1-gazdasagi-2',
              modelAnswer: [
                'TO: Anthony Turner, PR Department',
                'FROM: Beáta Koós',
                'SUBJECT: London Trade Fair',
                'DATE: 20 March 2017',
                '',
                'Introduction',
                'As a manager of the PR Department I was requested to compile a report on our participation at the London Trade Fair as an exhibitor. In this document I summarize our experiences from the following perspectives: facilities at the fair, organization and the results of our participation.',
                'Background',
                'The event was held at ExCel (Exhibition Center London) from 10-15 March. Our company was represented by the Hungarian managers of the PR and the Sales and Marketing departments, as well as three assistants.',
                'Summary of the facilities and organization',
                '- The venue of the event was the well-known ExCel, which is easy to access. Upon arriving the organizers provided us with a stand which met all the requirements we had specified in a contract beforehand. The stand was equipped with laptops, projectors and we had enough space to present our promotional material.',
                '- We were completely satisfied with the organization, as well. The registration process was simple and fast, the hostesses were helpful and the signposting was clear.',
                'Results of the participation',
                'Participating in trade fairs like this one is essential for the development of the company. We had the opportunity to make useful contacts and received an overview of the current issues of our sector.',
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
        storagePath: 'nyelvvizsga-en-c1-gazdasagi-minta-01.mp3',
        durationSec: 1063,
        // Text 2 starts with its announcement, right after Text 1's last pause (loudness scan).
        taskMarkers: [
          { taskId: 'L-1', startSec: 0 },
          { taskId: 'L-2', startSec: 527 },
        ],
      },
      tasks: [
        {
          id: 'L-1',
          label: 'Text 1',
          instructions:
            'Listen to two news items about environment protection. Based on the text, decide if the statements are true (T) or false (F). Write your answers in the table below, according to the example (0). Please note that if all your answers are marked as true or as false, your test will be disqualified.',
          booleanLabels: ['T', 'F'],
          rules: { allSameBooleanIsZero: true },
          examples: [{ id: '0', type: 'boolean', statement: 'Example: conveyor belts carry the trash for sorting in Brooklyn’s recycling depot.', answer: true }],
          // The key numbers the second news item's statements 1–4 again; here they are 5–8, as on the task sheet.
          items: [
            { id: '1', type: 'boolean', statement: 'First news item: Aluminum preserves its quality during recycling.', answer: true },
            { id: '2', type: 'boolean', statement: 'It is economically feasible to recycle metals.', answer: true },
            { id: '3', type: 'boolean', statement: 'Recycling plastics currently makes business sense because it is cheaper than producing new.', answer: false },
            { id: '4', type: 'boolean', statement: 'The EPA suggests that instead of recycling, the US should take more than 8 million cars off the road.', answer: false },
            { id: '5', type: 'boolean', statement: 'Second news item: Last year, figures for both coal production and coal imports shrank.', answer: true },
            { id: '6', type: 'boolean', statement: 'Reduced demand for coal is due to faster economic growth.', answer: false },
            { id: '7', type: 'boolean', statement: 'China is the world’s second biggest polluter, after the US.', answer: false },
            { id: '8', type: 'boolean', statement: 'Both the US and China see a decline in coal consumption.', answer: true },
          ],
        },
        {
          id: 'L-2',
          label: 'Text 2',
          instructions:
            'Listen to the text about traditional and online forms of trade. Use what you heard to complete the table with your notes of no more than 3 words each, according to the example (0).',
          passage: [
            { style: 'title', text: 'Notes on Online Retailers' },
            { style: 'bullet', text: '“Multichannel” retailing: shopping by {{0}}' },
            { style: 'heading', text: 'Pure internet retailers reject real stores because of: (Give 2 examples.)' },
            { style: 'bullet', text: '{{1}}' },
            { style: 'bullet', text: '{{2}}' },
            { style: 'heading', text: 'Retailers that shed their online purity' },
            { style: 'bullet', text: 'Screwfix company’s main customers: {{3}} (Give 1 example.)' },
            { style: 'bullet', text: 'Bonobos, the clothes shop opened {{4}}' },
            { style: 'bullet', text: 'Amazon set up lockers in {{5}}' },
            { style: 'heading', text: 'Wares in showrooms or online' },
            { style: 'bullet', text: 'Online retailers destroyed Borders, which is a {{6}}' },
            { style: 'bullet', text: 'Qualities that can be checked only in reality: (Give 1 example.) {{7}}' },
            { style: 'bullet', text: 'Product that buyers prefer to touch: {{8}}' },
            { style: 'heading', text: 'Online retailers’ variable costs:' },
            { style: 'bullet', text: 'No {{9}} to lure customers → Google-based ads' },
            { style: 'bullet', text: 'Delivery, particularly of {{10}}' },
            { style: 'bullet', text: '¼ of clothes bought online are {{11}}' },
            { style: 'heading', text: '“Click and collect” system' },
            { style: 'bullet', text: 'Ordering online, picking up at {{12}}' },
          ],
          examples: [{ id: '0', type: 'short-text', answer: { accepted: ['smartphones, tablets, laptops'], match: 'exact-ci' } }],
          items: [
            { ...storeCost('1', 'rents'), reviewNote: 'The key: 1–2. (any of) rents / payrolls / security cameras.' },
            storeCost('2', 'payrolls'),
            { id: '3', type: 'short-text', answer: { accepted: ['plumbers', 'electricians'], match: 'keywords', keywords: [['plumber', 'electrician']], maxWords: 3 } },
            { id: '4', type: 'short-text', answer: { accepted: ['Guideshops'], match: 'keywords', keywords: [['guide']], maxWords: 3 } },
            { id: '5', type: 'short-text', answer: { accepted: ['shopping malls'], match: 'keywords', keywords: [['mall']], maxWords: 3 } },
            { id: '6', type: 'short-text', answer: { accepted: ['bookstore'], match: 'keywords', keywords: [['book']], maxWords: 3 } },
            {
              id: '7',
              type: 'short-text',
              answer: { accepted: ['shoe’s fit', 'apple’s crispness'], match: 'keywords', keywords: [['shoe', 'fit', 'apple', 'crisp']], maxWords: 3 },
            },
            { id: '8', type: 'short-text', answer: { accepted: ['car seats', 'baby equipment'], match: 'keywords', keywords: [['car seat', 'baby']], maxWords: 3 } },
            { id: '9', type: 'short-text', answer: { accepted: ['storefronts'], match: 'keywords', keywords: [['storefront', 'store front', 'shopfront', 'shop front']], maxWords: 3 } },
            { id: '10', type: 'short-text', answer: { accepted: ['bulky goods'], match: 'keywords', keywords: [['bulk', 'large', 'big']], maxWords: 3 } },
            { id: '11', type: 'short-text', answer: { accepted: ['returned'], match: 'keywords', keywords: [['return', 'sent back']], maxWords: 3 } },
            { id: '12', type: 'short-text', answer: { accepted: ['convenient outlet'], match: 'keywords', keywords: [['outlet', 'store', 'shop']], maxWords: 3 } },
          ],
        },
      ],
    },
  ],
}

export default paper
