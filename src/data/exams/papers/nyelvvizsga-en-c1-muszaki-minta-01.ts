// Zöld Út Nyelvvizsgaközpont (MATE), C1 Technical English (felsőfok, műszaki), sample paper 1 —
// freely downloadable at https://zoldut.uni-mate.hu/mintafeladatsorok. Transcribed verbatim from
// the task sheet and its answer key, including the source's own typos ("that off gecko feet",
// "trough"). Two departures from the key, both checked against the recording or the sheet:
// - Listening Text 1 (the same recording and statements as the C1 economics paper): this key
//   marks statements 6 and 8 the other way round from the economics key. The recording says the
//   coal cutback is "thanks to a slowdown in economic growth" and that the US "has seen its coal
//   habit shrink, too", so 6 is false and 8 is true, as in the economics key.
// - Writing Task 1: the key's sample description is of a different table (car makers' fuel
//   economy), so it is left out; the task's own table (African hydropower projects) is
//   transcribed from the image on the sheet.
// (Reading Text 2 Task 2: the key prints every option and sets the right one in bold.)
// Added for the screen: "Text 1/2 ·" in the reading task labels and "First/Second news item:"
// before listening statements 1 and 5. No speaking part; no section times printed.
import type { ExamPaper, PassageBlock, ShortTextItem } from '../types'

const geckoText: PassageBlock[] = [
  { style: 'title', text: '1. Gecko-grip material aims to be the end of glue' },
  {
    text: 'Geckos have long inspired scientists and super-hero fans alike with their ability to scamper up vertical walls and cling to ceilings with a single toe. In recent years, people have attempted to create materials that match those spectacular abilities, in the hope of creating new advanced adhesives, or even car braking systems.',
  },
  {
    text: 'Now US chemists claim to have made one based on nanotubes that is 10 times stickier than some gecko feet. Even more impressively, like a real gecko foot, it can also be easily unstuck with a tug in the right direction.',
  },
  { text: 'Gecko’s superhero toes are covered in microscopic hairs, known as setae, with even smaller branches at the tips, called spatulae.' },
  {
    text: 'These ensure that a gecko’s foot has a large surface area in contact with any surface, maximising the weak but ever-present attraction between adjacent molecules known as the van der Waals force.',
  },
  { style: 'heading', text: 'Glass gripper' },
  {
    text: 'Chemists led by Liming Dai of University of Dayton, Ohio and Zhong Lin Wang of Georgia Institute of Technology, made their artificial setae by growing nested carbon nanotubes on a silicon wafer.',
  },
  {
    text: 'They controlled the growth process to make a forest of vertical nanotube trunks turning into a canopy of tangled ends on top. The curly entangled mess acts like natural spatulae – when pressed against a surface, they have a large contact area and hence a strong hold.',
  },
  {
    text: 'The new material was tested for stickiness on surfaces ranging from Teflon to sandpaper. Attached to a glass surface, a piece of the material 4 millimetres by 4 mm can support over 1600 grams when pulled roughly parallel to the surface.',
  },
  { text: 'That is around 10 times better than some species of gecko and three times better than the best artificial competitor.' },
  {
    text: 'But removing a pad of the material is simple, unlike some rival materials. Pulling it perpendicular to a surface means only the tips of the nanotubes remain in contact with the surface, and the setae will easily loosen their grip, so it can be easily removed from a surface if tugged in the right way. A weight of 160 grams on the tiny sample is enough to do that.',
  },
  { style: 'heading', text: 'New glue?' },
  {
    text: 'Kellar Autumn from the Lewis and Clark College, Oregon, was the first to suggest that the gecko’s stickiness was down to geometry rather than the chemistry of its feet. "The ability of this material to support large shear loads and to detach easily is very encouraging," he told New Scientist.',
  },
  {
    text: 'He points out, though, that although a person can easily stick the material to a surface, it requires much more force to apply than real gecko setae. The same 4 mm by 4 mm piece of the new material needs about 2 kilograms of force to stick, compared to the few grams required by a real gecko or some synthetic rivals.',
  },
  {
    text: 'Liming thinks his material should still be able to replace glue and other forms of adhesion. For example, because nanotubes are excellent conductors, the carbon setae could replace solder in electronics. The material could also be valuable in the vacuum of space, where traditional adhesives dry out quickly, he says. As for superhero suits, Liming says: "We will exploit this possibility, if there is a serious need."',
  },
  {
    text: 'Economics is likely to play a deciding role too – carbon nanotubes are not cheap to produce. But the price has already declined more than a thousand fold over the last few years as fabrication processes have improved. Liming says dropping prices will eventually make it possible to produce his material in rolls rather than one-off sections.',
  },
]

const arcticText: PassageBlock[] = [
  { style: 'title', text: "2. Arctic ice thickness 'plummets'" },
  {
    text: 'The thickness of Arctic sea ice "plummeted" last winter, thinning by as much as 49 centimetres (1.6ft) in some regions, satellite data has revealed.',
  },
  {
    text: 'A study by UK researchers showed that the ice thickness had been fairly constant for the previous five winters. The team from University College London added that the results provided the first definitive proof that the overall volume of Arctic ice was decreasing.',
  },
  { text: 'The findings have been published in the journal Geophysical Research Letters.' },
  {
    text: '"The ice thickness was fairly constant for the five winters before this, but it plummeted in the winter after the 2007 minimum," lead author Katharine Giles told BBC News.',
  },
  {
    text: 'Sea ice in the Arctic shrank to its smallest size on record in September 2007, when it extended across an area of just 4.13 million sq km (1.59 million sq miles), beating the previous record low of 5.32 million sq km, measured in 2005.',
  },
  {
    text: 'The team from the university’s Centre for Polar Observation and Modelling - part of the UK’s National Centre for Earth Observation - found that last winter the ice had thinned by an average of 26cm (0.9ft) below the 2002-2008 winter average.',
  },
  { text: 'Dr Giles added that the data also showed the western Arctic experienced the greatest impact, where the ice thinned by up to 49cm (1.6ft).' },
  {
    text: 'The recent record losses of ice cover in the Arctic has led to suggestions that the region could have reached a "tipping point" but some uncertainty over the causes had remained, explained co-author Seymour Laxon.',
  },
  {
    text: '"The extent can change because the ice can be redistributed, increasing the amount of open water," he told BBC News. "But this does not reduce the overall amount of ice. To determine whether the reduction in sea ice extent is the result of ice being piled up against the coast or whether it is the result of melting, you need to measure the thickness."',
  },
  {
    text: '"I think this is the first time that we can definitively say that the bulk overall volume of ice has decreased," observed Dr Laxon. "So this means melting; it doesn’t mean that the ice has just been pushed up against the coastline."',
  },
  {
    text: 'Dr Giles explained that the measurements gathered by satellite provided a continuous data-set and had a number of advantages over other methods. "Drilling, submarines or aircraft; all of these techniques can be limited by time and space," she said. You can only sample relatively small areas, and you cannot have a continuous time series - it’s a very harsh environment, so field experiments in winter are logistically difficult. We have been using satellite data, which means we get coverage all across the Arctic Ocean (apart from the very centre) and we get it continuously, so we have great coverage both in terms of time and area."',
  },
  { text: 'The measurements were recorded via a radar altimeter onboard the European Space Agency’s (Esa) Envisat satellite.' },
  {
    text: 'The altimeter fires pulses of electromagnetic waves down on to the ice, which reflects them back up to a receiver on the satellite. The time taken for the waves to complete this journey is recorded, and it is a fairly straightforward calculation to work out the height of the ice above sea level. As one tenth of the ice sits above the water, it is then possible to work out the overall volume and thickness of ice in that location.',
  },
  {
    text: 'Dr Laxon said the project’s findings are being used to help climate modellers refine their projections of what is going to happen in the future. "The time when Arctic sea ice is going to disappear is open to a lot of debate," he said. "About five years ago, the average projection for the sea ice disappearing was about 2080. But the ice minimums, and this evidence of melting, suggests that we should favour the models that suggest the sea ice will disappear by 2030-2040, but there is still a lot of uncertainty."',
  },
  {
    text: 'The researchers hope to keep the data series, funded by the EU and the Natural Environmental Research Council (Nerc), running for as long as satellite-based measurements are available.',
  },
]

/** Reading Text 1 items 8–10: the three possible uses, in any order. */
function industrialUse(id: string, first: string): ShortTextItem {
  const all = ['to replace glue', 'to replace solder in electronics', 'to create lasting adhesion in space']
  return {
    id,
    type: 'short-text',
    answer: { accepted: [first, ...all.filter((a) => a !== first)], match: 'keywords', keywords: [['glue', 'adhesive', 'solder', 'weld', 'electronic', 'space', 'vacuum']], maxWords: 6 },
  }
}

/** Reading Text 2 items 2–3: "(2) and (3) data", either order. */
function coverage(id: string, first: string): ShortTextItem {
  const all = ['overall/full coverage', 'continuous']
  return {
    id,
    type: 'short-text',
    answer: { accepted: [first, ...all.filter((a) => a !== first)], match: 'keywords', keywords: [['overall', 'full', 'continu', 'complete', 'whole', 'coverage']], maxWords: 5 },
  }
}

const SHARED_MCQ = (a: string, b: string, c: string) => [
  { key: 'A', text: a },
  { key: 'B', text: b },
  { key: 'C', text: c },
]

const paper: ExamPaper = {
  id: 'nyelvvizsga-en-c1-muszaki-minta-01',
  type: 'nyelvvizsga',
  language: 'en',
  level: 'C1',
  sittingLabelHu: 'Minta 1.',
  track: 'technical',
  source:
    'Zöld Út Nyelvvizsgaközpont (MATE): C1 Technical English (felsőfok, műszaki) mintafeladatsor — feladatsor, megoldókulcs és hanganyag. Ingyenesen letölthető: https://zoldut.uni-mate.hu/mintafeladatsorok',
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
            ...geckoText,
            { style: 'row', label: 'Inspiration for the new material', text: '{{0}}' },
            { style: 'row', label: 'Parts of gecko toes creating adhesion', text: '{{1}}' },
            { style: 'row', label: '', text: '{{2}}' },
            { style: 'row', label: 'Adhesive force used by geckos', text: '{{3}}' },
            { style: 'row', label: 'Materials used to maximize adhesion in the new technology', text: '{{4}}' },
            { style: 'row', label: '', text: '{{5}}' },
            { style: 'row', label: 'Shape of the end of nanotubes', text: '{{6}}' },
            { style: 'row', label: 'Physical disadvantage of the new material', text: '{{7}}' },
            { style: 'row', label: 'Possible industrial uses of the new material', text: '{{8}}' },
            { style: 'row', label: '', text: '{{9}}' },
            { style: 'row', label: '', text: '{{10}}' },
            { style: 'row', label: 'Method of unsticking the new material', text: '{{11}}' },
          ],
          examples: [{ id: '0', type: 'short-text', answer: { accepted: ['gecko'], match: 'exact-ci' } }],
          // Graded by key words (every group must match); `accepted` is the key as printed (cut to the word limit where the key adds notes; see reviewNote).
          // 1–2, 4–5 and 8–10 each count in any order.
          items: [
            {
              id: '1',
              type: 'short-text',
              answer: { accepted: ['setae', 'spatulae'], match: 'keywords', keywords: [['seta', 'spatula', 'hair', 'branch']], maxWords: 6 },
              reviewNote: 'The key: 1. setae, 2. spatulae — in either order.',
            },
            { id: '2', type: 'short-text', answer: { accepted: ['spatulae', 'setae'], match: 'keywords', keywords: [['seta', 'spatula', 'hair', 'branch']], maxWords: 6 } },
            { id: '3', type: 'short-text', answer: { accepted: ['van der Waals force'], match: 'keywords', keywords: [['waals']], maxWords: 6 } },
            {
              id: '4',
              type: 'short-text',
              answer: { accepted: ['carbon (nanotubes)', 'silicon (wafer)'], match: 'keywords', keywords: [['carbon', 'nanotube', 'silicon', 'wafer']], maxWords: 6 },
              reviewNote: 'The key: 4. carbon (nanotubes), 5. silicon (wafer) — in either order.',
            },
            { id: '5', type: 'short-text', answer: { accepted: ['silicon (wafer)', 'carbon (nanotubes)'], match: 'keywords', keywords: [['carbon', 'nanotube', 'silicon', 'wafer']], maxWords: 6 } },
            { id: '6', type: 'short-text', answer: { accepted: ['curly', 'tangled'], match: 'keywords', keywords: [['curl', 'tangl']], maxWords: 6 } },
            {
              id: '7',
              type: 'short-text',
              answer: { accepted: ['it takes bigger force to stick'], match: 'keywords', keywords: [['force', 'kilogram', '2 kg', 'strength', 'effort']], maxWords: 6 },
            },
            { ...industrialUse('8', 'to replace glue'), reviewNote: 'The key: 8. to replace glue, 9. to replace solder (in welding, in electronics), 10. to create lasting adhesion in space — in any order.' },
            industrialUse('9', 'to replace solder in electronics'),
            industrialUse('10', 'to create lasting adhesion in space'),
            {
              id: '11',
              type: 'short-text',
              answer: { accepted: ['pulling it perpendicular to the surface'], match: 'keywords', keywords: [['perpendicular', 'right angle', '90']], maxWords: 6 },
            },
          ],
        },
        {
          id: 'R-1-2',
          label: 'Text 1 · Task 2',
          instructions:
            'Read the text again and use it to decide if the statements are true (T) or false (F). Write your answers in the table below according to the example (0). Please note that if all your answers are marked as true or as false, your answers will be disqualified.',
          passage: geckoText,
          booleanLabels: ['T', 'F'],
          rules: { allSameBooleanIsZero: true },
          examples: [{ id: '0', type: 'boolean', statement: 'The main use of the new material will be to make superhero suits.', answer: false }],
          items: [
            { id: '12', type: 'boolean', statement: 'A 4mm x 4mm piece needs 1600 g force to hold the weight properly.', answer: false },
            { id: '13', type: 'boolean', statement: 'The decreasing price of the nanotubes has already made it economical enough to produce.', answer: false },
            { id: '14', type: 'boolean', statement: 'The current level of adhesion is 10 times as strong as that off gecko feet.', answer: true },
            { id: '15', type: 'boolean', statement: 'The adhesion of the gecko’s feet is due less to its chemical composition than to its geometrical features.', answer: true },
          ],
        },
        {
          id: 'R-2-1',
          label: 'Text 2 · Task 1',
          instructions: 'Read the text again and complete the summary with no more than 5 words each based on the text, according to the example (0).',
          passage: [
            ...arcticText,
            { style: 'heading', text: 'Summary' },
            {
              text: 'The {{0}} on Arctic ice coverage has got a new momentum by using {{1}} equipment from satellites. It is more effective than previous technologies, since it can provide {{2}} and {{3}} data from the Arctic, without {{4}} problems in the wintertime. The data gained shows an {{5}} rate of ice shrinkage, which can be caused either by {{6}} or by {{7}}.',
            },
          ],
          examples: [{ id: '0', type: 'short-text', answer: { accepted: ['research'], match: 'exact-ci' } }],
          items: [
            {
              id: '1',
              type: 'short-text',
              answer: { accepted: ['radar altimeter', 'electromagnetic'], match: 'keywords', keywords: [['radar', 'altimeter', 'electromagnetic']], maxWords: 5 },
            },
            { ...coverage('2', 'overall/full coverage'), reviewNote: 'The key: 2. overall/full coverage, 3. continuous — in either order.' },
            coverage('3', 'continuous'),
            { id: '4', type: 'short-text', answer: { accepted: ['logistic'], match: 'keywords', keywords: [['logistic']], maxWords: 5 } },
            { id: '5', type: 'short-text', answer: { accepted: ['uneven', 'increasing'], match: 'keywords', keywords: [['uneven', 'increas', 'growing', 'accelerat']], maxWords: 5 } },
            {
              id: '6',
              type: 'short-text',
              answer: { accepted: ['ice redistribution', 'ice piling up'], match: 'keywords', keywords: [['redistribut', 'pil', 'pushed', 'coast']], maxWords: 5 },
              reviewNote: 'The key: ice redistribution / ice piling up on the coast.',
            },
            { id: '7', type: 'short-text', answer: { accepted: ['melting'], match: 'keywords', keywords: [['melt']], maxWords: 5 } },
          ],
        },
        {
          id: 'R-2-2',
          label: 'Text 2 · Task 2',
          instructions: 'Read the text and choose the option that best fits the text.',
          passage: arcticText,
          examples: [
            { id: '0', type: 'mcq', stem: 'The project was co-funded by', options: SHARED_MCQ('UCL and Geophysical Research Letters', 'EU and Nerc', 'ESA and the UK'), answer: 'B' },
          ],
          items: [
            { id: '8', type: 'mcq', stem: 'The project aims at finding out about the ice’s', options: SHARED_MCQ('temperature and size', 'thickness and depth', 'extension and thickness'), answer: 'C' },
            { id: '9', type: 'mcq', stem: 'Projections about the disappearance of the ice', options: SHARED_MCQ('are still much debated', 'are easily available', 'are impossible to give'), answer: 'A' },
            {
              id: '10',
              type: 'mcq',
              stem: 'To establish facts considering Arctic ice coverage, the radar altimeter uses',
              options: SHARED_MCQ('straightforward measurements', 'data and calculations', 'data and estimations'),
              answer: 'B',
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
            'Study the table, and describe it in 150-200 words, according to the example (0). The description should include comparisons.The description should end with a conclusion or prediction.',
          table: {
            title:
              'Table 5.4 African Hydropower Projects In Development or Under Construction (Project Name, Owner, Location, Capacity, Expected Commission Year, Run-of-river or Storage)',
            head: ['Project', 'Capacity (MW)', 'Owner', 'Run-of-river or storage', 'Country', 'Expected Year of Commission'],
            rows: [
              ['Cuemba', '8', 'Government of Angola', 'Run-of-river', 'Angola', '2018'],
              ['M’Bridge', '16', 'Government of Angola', 'Run-of-river', 'Angola', '2018'],
              ['Luapasso', '26', 'Escom Mining Energy, Empresa Nacional de Electricidade de Angola', 'Storage', 'Angola', '2016'],
              ['Memve’ele', '200', 'Minister of Power & Water Resource of Cameroon', 'Storage', 'Cameroon', '2016'],
              ['Lom Pangar', '30', 'Government of Cameroon', 'Storage', 'Cameroon', '2017'],
              ['Nachtigal Hydro Power Plant', '420', 'EDF, International Finance Corporation, Rio Tinto Group', 'Storage', 'Cameroon', '2022'],
              ['Makay', '400', 'Government of Cameroon', 'Storage', 'Cameroon', '2020'],
            ],
            numericColumns: [1, 5],
          },
          items: [
            {
              id: '1',
              type: 'production',
              prompt: [],
              opening: 'This is a table, displaying the African hydropower projects in development or under construction.',
              contentPoints: ['comparisons', 'a conclusion or prediction at the end'],
              minWords: 150,
              maxWords: 200,
              register: 'description',
              rubricId: 'nyelvvizsga-c1-muszaki-1',
            },
          ],
        },
        {
          id: 'W-2',
          label: 'Task 2',
          instructions:
            'In the journal Scientific American an article appeared about recent American inventions. You are writing a reader’s letter in 180-200 words, commenting on the Hungarian inventors’ contribution to technical progress.',
          items: [
            {
              id: '2',
              type: 'production',
              prompt: ['Your name in this role: Horváth Eszter/Endre, Miskolc', 'In your letter, include'],
              contentPoints: [
                'reference to famous Hungarian inventors from the past',
                'news about current Hungarian inventors (eg. different medical equipment, software to map consumer buying habits, new building materials, etc.)',
                'comments on the high level of Hungarian technical education',
              ],
              minWords: 180,
              maxWords: 200,
              register: 'formal-letter',
              rubricId: 'nyelvvizsga-c1-muszaki-2',
              modelAnswer: [
                'Dear Editor,',
                '',
                'I have recently read your article on American inventions, which arouse my interest. I come from Hungary, which can also boast of world-famous inventions. In order to contribute to your series, let me present some examples both from the past and recent times.',
                'First of all, I would like to mention János Neumann, who worked as a mathematician and computer scientist. He was a key figure in the development of the digital computer.',
                'In addition, Donát Bánki and János Csonka invented the carborettor for a stationary engine. Kálmán Kandó was known as “the father of the electric train”. Last but not least, the famous Ford T Model was designed by a Hungarian-American inventor, József Galamb.',
                'Hungarians continue to contribute to technical progress. A team of young engineers created Prezi, a cloud based presentation software in 2009. In 2014 a Hungarian engineer patented Litracon, a light transmitting concrete, which is a mix of concrete and optical fibre.',
                'I believe, these developments can be largely attributed to the high standard of technical education in Hungary. The co-operation between companies and universities enables students to participate in projects and competitions, which can result in new inventions.',
                '',
                'I hope, you find my comments a useful contribution to your article.',
                '',
                'Endre Horváth',
                'Miskolc, Hungary',
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
        storagePath: 'nyelvvizsga-en-c1-muszaki-minta-01.mp3',
        durationSec: 1080,
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
          items: [
            { id: '1', type: 'boolean', statement: 'First news item: Aluminum preserves its quality during recycling.', answer: true },
            { id: '2', type: 'boolean', statement: 'It is economically feasible to recycle metals.', answer: true },
            { id: '3', type: 'boolean', statement: 'Recycling plastics currently makes business sense because it is cheaper than producing new.', answer: false },
            { id: '4', type: 'boolean', statement: 'The EPA suggests that instead of recycling, the US should take more than 8 million cars off the road.', answer: false },
            { id: '5', type: 'boolean', statement: 'Second news item: Last year, figures for both coal production and coal imports shrank.', answer: true },
            {
              id: '6',
              type: 'boolean',
              statement: 'Reduced demand for coal is due to faster economic growth.',
              answer: false,
              reviewNote: 'This paper’s key marks it true, but the recording says the cutback is “thanks to a slowdown in economic growth” (the C1 economics key: false).',
            },
            { id: '7', type: 'boolean', statement: 'China is the world’s second biggest polluter, after the US.', answer: false },
            {
              id: '8',
              type: 'boolean',
              statement: 'Both the US and China see a decline in coal consumption.',
              answer: true,
              reviewNote: 'This paper’s key marks it false, but the recording says the US “has seen its coal habit shrink, too” (the C1 economics key: true).',
            },
          ],
        },
        {
          id: 'L-2',
          label: 'Text 2',
          instructions:
            'Listen to the text about the safety issues of transporting crude oil by rail. Use what you heard to complete the table with your notes of no more than 2 words each, according to the example (0).',
          passage: [
            { style: 'title', text: 'Notes on the safety of shipping oil by rail' },
            { style: 'bullet', text: 'Recent safety problems: {{0}}, e.g. in Illinois' },
            { style: 'bullet', text: 'Can technology improve safety?' },
            { style: 'heading', text: '1. Building and maintaining better rail cars' },
            { style: 'bullet', text: 'improve equipment: better {{1}} systems' },
            { style: 'bullet', text: 'improve safety: – better track inspections' },
            { style: 'bullet', text: '– speed {{2}} for oil trains' },
            { style: 'bullet', text: '– choosing routes to avoid population centres' },
            { style: 'bullet', text: '– more defect detectors, based on {{3}} measurements (Give 1 example).' },
            { style: 'heading', text: '2. Research in the following fields' },
            { style: 'bullet', text: 'Improved Tank Car {{4}}' },
            { style: 'bullet', text: 'Track and Infrastructure Inspection, using – {{5}} systems' },
            { style: 'bullet', text: '– {{6}} inspection methods' },
            { style: 'bullet', text: '– radar systems, to detect track defects.' },
            { style: 'bullet', text: 'Automated Condition Monitoring Technologies, such as' },
            { style: 'bullet', text: '– {{7}} temperature sensors to measure overheated wheels/bearings' },
            { style: 'bullet', text: '– acoustic bearing detectors to identify worn roller bearing' },
            { style: 'bullet', text: '– {{8}} systems to detect structural defects, broken appliances' },
            { style: 'bullet', text: '– load impact sensors to identify {{9}}' },
            { style: 'bullet', text: 'Positive Train Control – to {{10}} a train to prevent collision' },
            { style: 'bullet', text: 'In addition, research into improving environmental {{11}}, especially in the case of train-related {{12}}.' },
          ],
          examples: [{ id: '0', type: 'short-text', answer: { accepted: ['derailments'], match: 'exact-ci' } }],
          items: [
            { id: '1', type: 'short-text', answer: { accepted: ['braking'], match: 'keywords', keywords: [['brak']], maxWords: 2 } },
            { id: '2', type: 'short-text', answer: { accepted: ['restrictions'], match: 'keywords', keywords: [['restrict', 'limit']], maxWords: 2 } },
            {
              id: '3',
              type: 'short-text',
              answer: { accepted: ['force', 'temperature', 'sound', 'visual'], match: 'keywords', keywords: [['force', 'temperature', 'sound', 'visual', 'acoustic']], maxWords: 2 },
            },
            { id: '4', type: 'short-text', answer: { accepted: ['design'], match: 'keywords', keywords: [['design']], maxWords: 2 } },
            { id: '5', type: 'short-text', answer: { accepted: ['laser'], match: 'keywords', keywords: [['laser']], maxWords: 2 } },
            { id: '6', type: 'short-text', answer: { accepted: ['ultrasonic'], match: 'keywords', keywords: [['ultrason', 'ultra-son', 'ultra son']], maxWords: 2 } },
            { id: '7', type: 'short-text', answer: { accepted: ['infrared'], match: 'keywords', keywords: [['infrared', 'infra-red', 'infra red']], maxWords: 2 } },
            { id: '8', type: 'short-text', answer: { accepted: ['machine vision'], match: 'keywords', keywords: [['machine'], ['vision']], maxWords: 2 } },
            { id: '9', type: 'short-text', answer: { accepted: ['damaged wheels'], match: 'keywords', keywords: [['damag', 'broken', 'defect'], ['wheel']], maxWords: 2 } },
            { id: '10', type: 'short-text', answer: { accepted: ['slow down', 'stop'], match: 'keywords', keywords: [['slow', 'stop']], maxWords: 2 } },
            { id: '11', type: 'short-text', answer: { accepted: ['cleanup operations', 'cleanup efforts'], match: 'keywords', keywords: [['clean']], maxWords: 2 } },
            { id: '12', type: 'short-text', answer: { accepted: ['oil spills'], match: 'keywords', keywords: [['spill']], maxWords: 2 } },
          ],
        },
      ],
    },
  ],
}

export default paper
