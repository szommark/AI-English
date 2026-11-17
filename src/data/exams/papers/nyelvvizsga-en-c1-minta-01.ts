// Zöld Út Nyelvvizsgaközpont (MATE), C1 General English (felsőfok, ÁLT), sample paper 1 — freely
// downloadable at https://zoldut.uni-mate.hu/mintafeladatsorok. Transcribed verbatim from the task
// sheet and its answer key, including the source's own typos ("acquinted", "enterprize"). This
// sample has no speaking part, and no section times are printed on it, so none are set.
import type { ExamPaper, PassageBlock, ShortTextItem } from '../types'

const aviationText: PassageBlock[] = [
  { style: 'title', text: 'Is low-carbon aviation possible?' },
  {
    text: 'Over the course of two weeks, the International Civil Aviation Organization (ICAO) will be struggling with a big question: How can aviation’s CO2 emissions be reduced - even as air travel continues to grow worldwide?',
  },
  {
    text: 'UN-sponsored talks in Montreal, at ICAO’s 39th Assembly this autumn are meant to arrive at a first-ever global agreement to limit and eventually reverse growth in airline CO2 emissions, even as air travel continues to grow briskly over coming years.',
  },
  {
    text: 'The proposed ICAO measure is backed by the US, China, and the United Arab Emirates. Its aim is to limit emissions to 2020 levels after it takes effect in 2021. The deal, dubbed the "global market-based measure" (GMBM), will remain voluntary for the first several years post-adoption. It only becomes mandatory from 2027.',
  },
  {
    text: 'However, European lawmakers and many environmental campaigners worry that the planned deal has already been so watered-down that it may have little effect. The measure would rely heavily on a global carbon offsetting scheme to try and mitigate the effects of burning jet-fuel. Since trees absorb carbon as they grow, the aviation industry paying for tree plantations through a surcharge on airline tickets could, in principle, offset emissions caused by burning jet fuel.',
  },
  {
    text: 'There is also a provision in the agreement for adoption of low-carbon synthetic jet fuels, but at present, offsets are expected to play a much larger part. Critics say that reliance on offsets makes the GMBM’s prospective effectiveness questionable.',
  },
  { style: 'heading', text: 'No aviation in Paris Agreement' },
  {
    text: 'ICAO’s deal is necessary because international aviation was not included in the Paris climate agreement of December 2015. That left a "gaping hole," said WWF climate policy expert Lou Leonard, because aviation already accounts for more than 2 percent of global carbon emissions - and emissions are projected to triple by mid-century under business as usual.',
  },
  {
    text: 'Those 2 percent of global carbon emissions cause nearly 5 percent of manmade global warming, because the combustion of jet fuel takes place at high altitudes, where it has a stronger warming effect than the same substances released at ground level.',
  },
  {
    text: 'Air travel is set to double every 12.5 years. If emissions remain as they are today, "projections say air travel will consume 27 percent of a 1.5 degree Celsius carbon budget by 2050," according to Leonard - and that effectively precludes staying below 1.5 degrees (3.6 degrees Fahrenheit) global average annual surface air temperature warming.',
  },
  { style: 'heading', text: 'How to reduce aviation emissions' },
  {
    text: 'Environmentalists see the measure as a weak, loophole-ridden voluntary agreement, and fear allowing another decade slip by without serious emissions reductions.',
  },
  {
    text: 'Dan Rutherford, aviation program director at the International Council on Clean Transportation, said there are only two basic ways to reduce carbon emissions from aviation: Either by reducing the volume of air travel, or by reducing the "carbon intensity" (carbon dioxide emissions) of aviation. Since nobody expects limits on the growth of aviation, the focus is necessarily on reducing carbon intensity, either by dramatically improving aircraft efficiency, introducing low-carbon synthetic jet fuels, or implementing genuinely effective carbon emissions offset measures - or all three.',
  },
  { style: 'heading', text: 'Room for improvement' },
  {
    text: 'ICAO’s proposed global market-based measure was originally supposed to be mandatory, but negotiating governments recently changed it to a voluntary opt-in approach for the period from 2021 to 2026.',
  },
  {
    text: 'Another recent change to the text will allow member states to opt out of the scheme with just six months’ notice. The International Coalition on Sustainable Aviation - an alliance of several major nongovernmental organizations, or ICSA - is calling for removal of that provision. ICSA is also calling on states to include a clear prohibition of emissions double-counting, and removal of text that seeks to prevent member states from developing their own market-based measures.',
  },
  {
    text: 'So far, politicians have "shown up at meetings" to get positive press for signing vague agreements on emissions goals set far in the future - and that’s not enough, Leonard said.',
  },
  { style: 'note', text: '20 Sept 2016' },
]

/** Items 4–6 ask for the three ways of reducing carbon intensity: any of them counts in any of the rows. */
function carbonIntensity(id: string, first: string): ShortTextItem {
  const all = ['increase efficiency', 'low-carbon synthetic jet fuels', 'effective offset schemes']
  return {
    id,
    type: 'short-text',
    answer: {
      accepted: [first, ...all.filter((a) => a !== first)],
      match: 'keywords',
      keywords: [['efficien', 'synthetic', 'fuel', 'offset']],
    },
  }
}

/** One gap of the reading cloze (no more than 2 words): the key's variants, any case. */
function gap(id: string, ...accepted: string[]): ShortTextItem {
  return { id, type: 'short-text', answer: { accepted, match: 'exact-ci', maxWords: 2 } }
}

const paper: ExamPaper = {
  id: 'nyelvvizsga-en-c1-minta-01',
  type: 'nyelvvizsga',
  language: 'en',
  level: 'C1',
  sittingLabelHu: 'Minta 1.',
  track: 'general',
  source:
    'Zöld Út Nyelvvizsgaközpont (MATE): C1 General English (felsőfok, ÁLT) mintafeladatsor — feladatsor, megoldókulcs és hanganyag. Ingyenesen letölthető: https://zoldut.uni-mate.hu/mintafeladatsorok',
  sections: [
    {
      id: 'reading',
      kind: 'reading',
      titleHu: 'Olvasott szöveg értése (Reading Comprehension)',
      tasks: [
        {
          id: 'R-cloze',
          label: 'Task',
          instructions:
            'Read the text and fill in the gaps with no more than 2 words each. Write your solutions in the table, according to the example (0).',
          passage: [
            { style: 'title', text: 'Curious Kids: Can people colonize Mars?' },
            { style: 'note', text: 'Clara, age 9, Newton, Massachusetts' },
            {
              text: 'In all likelihood, the first Martian will be a person, and the red planet will be {{0}} first extraterrestrial colony.',
            },
            {
              text: 'For now, a robot called the Curiosity Rover – sent to Mars to find out if the planet can sustain small lifeforms {{1}} bacteria – is all alone there. But Curiosity has laid the foundation for the human explorers who will come next.',
            },
            {
              text: 'I’m a professor of astronautics and I {{2}} space travel. Today, space agencies across the planet are working to put the first humans on Mars by the 2030s.',
            },
            { style: 'heading', text: 'How will people get to Mars?' },
            {
              text: 'Engineers {{3}} new rockets to launch an even larger spacecraft than those that have already transported astronauts to the Moon. These new vehicles are designed to be more energy-efficient.',
            },
            {
              text: 'Rockets will enable the crew {{4}} the Earth’s gravitational pull. But the spacecraft will need an in-space propulsion system to blast it onto its interplanetary flight path. The journey to Mars will take between seven and nine months, almost the {{5}} of a school year.',
            },
            {
              text: 'Rocket scientists’ main concern is fuel efficiency. If less fuel is required to make the trip, astronauts have room to pack more {{6}}: food, water, air and other equipment that future human colonies will need on Mars.',
            },
            {
              text: '{{7}} making 10 trips between Earth and Mars for supplies, astronauts will be able to carry the same amount of cargo in just one because of the fuel efficiency of plasma propulsion. This will also cost a lot less because there will be fewer trips.',
            },
            { style: 'heading', text: 'Creating a colony' },
            {
              text: 'When astronauts reach Mars, they will circle around the planet, just as the International Space Station orbits around the Earth.',
            },
            {
              text: 'The crew will {{8}} the surface of Mars in a vehicle known as an entry capsule. Mars’ atmosphere will slow down the capsule.',
            },
            {
              text: 'To land {{9}} and softly, the entry capsule will use an inflatable heat shield, a parachute to generate aerodynamic drag and retrorockets to slow down. It will take less than 10 minutes to reach the Martian surface after entering the planet’s atmosphere.',
            },
            {
              text: 'Once on Mars’ inhospitable surface, the crew will need to live in a pressurized and environmentally {{10}} habitat. This is because Mars has a thin atmosphere, made primarily of carbon dioxide, and a very cold surface {{11}} of -81 degrees Fahrenheit.',
            },
            {
              text: 'Also, unlike Earth, Mars does not have a strong magnetic field, so its surface radiation levels are higher. This radiation is energy from the Sun and other cosmic rays. Levels on Mars are so high that they {{12}} the recommended maximum lifetime dose for astronauts. {{13}} a technology solution is needed to protect future Mars explorers.',
            },
            {
              text: 'One goal of a future human Mars colony is to be able to {{14}} itself. The astronauts will need to set up solar panels and install underground living spaces in order to survive. They’ll harvest underground water and build greenhouses to grow vegetables for food and plants that can {{15}} extreme cold to produce oxygen they can breathe.',
            },
            {
              text: 'As engineers around the world develop technologies for propulsion, landing and life support systems, people are closer than ever to the first human footsteps on Mars. Maybe they’ll be yours.',
            },
            { style: 'note', text: 'September 30, 2019' },
            { style: 'note', text: 'Anita Sengupta, Adjunct Research Associate Professor of Astronautics, University of Southern California' },
          ],
          examples: [gap('0', 'humanity’s', "humanity's")],
          items: [
            gap('1', 'like'),
            gap('2', 'study', 'research', 'specialize in', 'specialise in'),
            gap('3', 'have developed'),
            gap('4', 'to leave'),
            gap('5', 'length', 'duration'),
            gap('6', 'supplies'),
            gap('7', 'instead of'),
            gap('8', 'descend to', 'land on'),
            gap('9', 'safely'),
            gap('10', 'controlled'),
            gap('11', 'temperature'),
            gap('12', 'exceed'),
            gap('13', 'so', 'therefore'),
            gap('14', 'sustain'),
            gap('15', 'survive'),
          ],
        },
        {
          id: 'R-1',
          label: 'Task 1',
          instructions: 'Read the text and complete the table with your short notes, according to the example (0).',
          passage: [
            ...aviationText,
            { style: 'row', label: 'location of the ICAO talks', text: '{{0}}' },
            { style: 'row', label: 'targeted CO2 emission levels by GMBM', text: '{{1}}' },
            { style: 'row', label: 'the reason aviation industry supports planting trees', text: '{{2}}' },
            { style: 'row', label: 'reason why jet fuel combustion is more dangerous than fuel in transport on land', text: '{{3}}' },
            { style: 'row', label: 'possibilities of reducing the carbon-intensity of aviation', text: '{{4}}' },
            { style: 'row', label: '', text: '{{5}}' },
            { style: 'row', label: '', text: '{{6}}' },
          ],
          examples: [{ id: '0', type: 'short-text', answer: { accepted: ['Montreal'], match: 'exact-ci' } }],
          // Graded by key words (every group must match); `accepted` is the key as printed.
          items: [
            { id: '1', type: 'short-text', answer: { accepted: ['limit it to the 2020 level'], match: 'keywords', keywords: [['2020']] } },
            {
              id: '2',
              type: 'short-text',
              answer: {
                accepted: ['trees absorb CO2 as they grow', 'mitigate the effects of the burning jet-fuel'],
                match: 'keywords',
                keywords: [['absorb', 'offset', 'mitigat', 'compensat', 'take in', 'soak']],
              },
            },
            {
              id: '3',
              type: 'short-text',
              answer: { accepted: ['in the high altitudes it has stronger warming effect'], match: 'keywords', keywords: [['altitude', 'high', 'height']] },
            },
            carbonIntensity('4', 'increase efficiency'),
            carbonIntensity('5', 'low-carbon synthetic jet fuels'),
            carbonIntensity('6', 'effective offset schemes'),
          ],
        },
        {
          id: 'R-2',
          label: 'Task 2',
          instructions:
            'Read the text again and use it to decide if the statements are true (T) or false (F). Write your answers in the table below according to the example (0). Please note that if all your answers are marked as true or false, your answers will be disqualified.',
          passage: aviationText,
          booleanLabels: ['T', 'F'],
          rules: { allSameBooleanIsZero: true },
          examples: [{ id: '0', type: 'boolean', statement: 'The proposed measure will reverse CO2 emissions trends of aviation in this decade.', answer: false }],
          items: [
            { id: '7', type: 'boolean', statement: 'Offset schemes are generally considered to be an effective way to reduce emissions.', answer: false },
            { id: '8', type: 'boolean', statement: 'The Paris agreement doesn’t cover all the major emission sources.', answer: true },
            { id: '9', type: 'boolean', statement: 'Environmentalists are worried about the voluntary nature of the provisions even after they take effect.', answer: true },
            { id: '10', type: 'boolean', statement: 'ICSA agrees with the suggestions of the “global market-based measure” proposed by ICAO.', answer: false },
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
            'You have read an article in an English online paper on single sex education (all -girls or all-boys schools). Write a comment of 120-140 words.',
          items: [
            {
              id: '1',
              type: 'production',
              prompt: ['In your writing, describe'],
              contentPoints: ['the Hungarian situation from this perspective', 'the advantages and disadvantages of single-sex education', 'your personal opinion.'],
              minWords: 120,
              maxWords: 140,
              register: 'forum-post',
              rubricId: 'nyelvvizsga-c1-1',
              modelAnswer: [
                'I would like to comment on your article on single-sex education, putting forward my points.',
                'As I see it, in single-sex schools, children can make friends more easily. Moreover, special subjects can be introduced (eg. Sewing for girls, woodwork for boys.)',
                'On the other hand, there’s no point in separating boys and girls because by and large, they need to receive the same education.',
                'In a mixed school, students can get acquinted with a wider range of people. They learn to socialise and co-operate with the opposite sex.',
                'The most common school type in Hungary is the mixed school. There are primary schools (for ages 6-14) and secondary schools, (vocational or grammar) (for ages 14-19).',
                'My opinion on the subject is that the concept of single-sex schools has become obsolete and it’s too conservative for the 21st century.',
              ].join('\n'),
            },
          ],
        },
        {
          id: 'W-2',
          label: 'Task 2',
          instructions: 'You have learnt about an Award for young European Businessmen to be issued by the European Commission.',
          items: [
            {
              id: '2',
              type: 'production',
              prompt: ['Write a letter of application in an email of 180-200 words. Your name in this role is Kiss András/Anna.', 'In your email, describe'],
              contentPoints: [
                'the type of online business you have launched',
                'the challenges you had to tackle in the beginning',
                'your current results and future plans.',
              ],
              minWords: 180,
              maxWords: 200,
              register: 'formal-email',
              rubricId: 'nyelvvizsga-c1-2',
              modelAnswer: [
                'Dear Sir/Madam,',
                '',
                'I am writing to apply for your award for young European Businessman. First of all I’m 21 years old and I have an online business, which I launched in 2015. My business is about making quality games for pcs, androids, IOSs and for consoles.',
                'My biggest problem at the beginning was that I didn’t have enough money to make a gaming company, so I had to give my game to someone, to release it. For over one year I couldn’t find anyone, but then I got lucky and a small enterprize published my game called. „The last war” which is a FPG game.',
                'It was an instant success and then, after two years of hard work. I finally built my own company, which is called „CNI” and now it is known all around the world.',
                'My current results are 51 games that are published, over 3,000 developers. And my future plans are to make 100 more games, having over 10,000 developers, and also to develop my own console, which would be more powerful but cheaper than a PS and an x-box.',
                'I hope I could impress you with the above facts and I will be a strong candidate for the award.',
                '',
                'Yours faithfully, Kiss Anna',
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
        storagePath: 'nyelvvizsga-en-c1-minta-01.mp3',
        durationSec: 1038,
        // Task 2 starts with its announcement, right after Task 1's last pause (loudness scan).
        taskMarkers: [
          { taskId: 'L-1', startSec: 0 },
          { taskId: 'L-2', startSec: 530 },
        ],
      },
      tasks: [
        {
          id: 'L-1',
          label: 'Task 1',
          instructions:
            'Listen to the text about the repairing industry. Based on the text, decide if the statements are true (T) or false (F). Write your answers in the table below, according to the example (0). Please note that if all your answers are marked as true or as false, your answers will be disqualified.',
          booleanLabels: ['T', 'F'],
          rules: { allSameBooleanIsZero: true },
          examples: [
            { id: '0', type: 'boolean', statement: 'In the UK people throw out about the same amount of electrical devices a year as they buy.', answer: true },
          ],
          items: [
            { id: '1', type: 'boolean', statement: 'The events attracted 4000 participants in the UK and some other locations abroad.', answer: true },
            { id: '2', type: 'boolean', statement: '84 tonnes of carbon-dioxide were emitted through the repair of 1494 devices.', answer: false },
            { id: '3', type: 'boolean', statement: 'Collecting data puts pressure on and helps manufacturers to get feedback on how well their products perform.', answer: true },
            { id: '4', type: 'boolean', statement: 'The main objective of the organizers is to make the market of the repairing industry prosper again.', answer: true },
            { id: '5', type: 'boolean', statement: 'Spare parts are widely accessible at a competitive price.', answer: false },
            { id: '6', type: 'boolean', statement: 'The Swedish parliament supports the repairing economy through reducing its tax.', answer: true },
            {
              id: '7',
              type: 'boolean',
              statement: 'After a year, right-to-repair activists in the US reached an agreement with some big companies protecting their individual properties.',
              answer: false,
            },
          ],
        },
        {
          id: 'L-2',
          label: 'Task 2',
          instructions:
            'Listen to the text. Use what you heard to complete the table with your notes of no more than 3 words each, according to the example (0).',
          passage: [
            { style: 'title', text: 'Note taking: smell of old books' },
            { style: 'bullet', text: 'In bookshops {{0}} libraries the smell of old books (example) is comforting' },
            { style: 'bullet', text: 'People’s description: musty, or like {{1}} (give one example)' },
            { style: 'heading', text: 'From where?' },
            { style: 'bullet', text: 'Chemical compounds used in' },
            { style: 'bullet', text: '– paper' },
            { style: 'bullet', text: '– ink' },
            { style: 'bullet', text: '– {{2}}' },
            { style: 'bullet', text: 'Chemicals are in:' },
            { style: 'bullet', text: '– Wood pulp for the paper, containing {{3}}, especially cellulose' },
            { style: 'bullet', text: 'Over time, reacting with:' },
            { style: 'bullet', text: '– light, heat' },
            { style: 'bullet', text: '– {{4}}' },
            { style: 'bullet', text: 'Result: breaking down' },
            { style: 'bullet', text: '– In the process, {{5}} volatile organic compounds (VOCs)' },
            { style: 'bullet', text: '– VOCs {{6}} into the air' },
            { style: 'bullet', text: 'Different VOCs, different smells, such as:' },
            { style: 'bullet', text: '– {{7}}' },
            { style: 'bullet', text: '– Vanilla (due to vanillin)' },
            { style: 'bullet', text: '– Sweet smell (due to ethyl benzene, used in {{8}} plastic)' },
            { style: 'bullet', text: '– Floral aroma (due to alcohol, used in solvents, {{9}}, scents)' },
            { style: 'bullet', text: 'New books, new processes, different VOCs,' },
            { style: 'bullet', text: 'New manufacturing aims:' },
            { style: 'bullet', text: '– To bleach paper' },
            { style: 'bullet', text: '– To make paper {{10}}' },
            { style: 'bullet', text: 'Through VOCs, scientists and historians can study' },
            { style: 'bullet', text: '– the books’ age and {{11}}' },
            { style: 'bullet', text: '– their history: smoke exposure or {{12}}' },
            { style: 'bullet', text: '– which books need to be {{13}} (give one example)' },
          ],
          examples: [{ id: '0', type: 'short-text', answer: { accepted: ['and'], match: 'exact-ci' } }],
          items: [
            { id: '1', type: 'short-text', answer: { accepted: ['coffee', 'freshly cut grass'], match: 'keywords', keywords: [['coffee', 'grass']], maxWords: 3 } },
            { id: '2', type: 'short-text', answer: { accepted: ['bindings'], match: 'keywords', keywords: [['binding']], maxWords: 3 } },
            { id: '3', type: 'short-text', answer: { accepted: ['carbon'], match: 'keywords', keywords: [['carbon']], maxWords: 3 } },
            { id: '4', type: 'short-text', answer: { accepted: ['moisture'], match: 'keywords', keywords: [['moisture', 'humidity']], maxWords: 3 } },
            { id: '5', type: 'short-text', answer: { accepted: ['release'], match: 'keywords', keywords: [['releas']], maxWords: 3 } },
            { id: '6', type: 'short-text', answer: { accepted: ['vapourise', 'enter'], match: 'keywords', keywords: [['vapor', 'vapour', 'enter', 'evaporat']], maxWords: 3 } },
            { id: '7', type: 'short-text', answer: { accepted: ['almond'], match: 'keywords', keywords: [['almond']], maxWords: 3 } },
            { id: '8', type: 'short-text', answer: { accepted: ['manufacturing'], match: 'keywords', keywords: [['manufactur']], maxWords: 3 } },
            { id: '9', type: 'short-text', answer: { accepted: ['flavours'], match: 'keywords', keywords: [['flavour', 'flavor']], maxWords: 3 } },
            { id: '10', type: 'short-text', answer: { accepted: ['water-resistant'], match: 'keywords', keywords: [['water'], ['resist', 'proof']], maxWords: 3 } },
            { id: '11', type: 'short-text', answer: { accepted: ['condition'], match: 'keywords', keywords: [['condition']], maxWords: 3 } },
            { id: '12', type: 'short-text', answer: { accepted: ['water damage'], match: 'keywords', keywords: [['water'], ['damag']], maxWords: 3 } },
            {
              id: '13',
              type: 'short-text',
              answer: { accepted: ['better preserved', 'protected'], match: 'keywords', keywords: [['preserv', 'protect']], maxWords: 3 },
            },
          ],
        },
      ],
    },
  ],
}

export default paper
