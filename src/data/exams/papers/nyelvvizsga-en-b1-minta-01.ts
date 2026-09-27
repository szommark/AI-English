// B1 General English (alapfok), sample paper 1. Transcribed verbatim from the task sheet
// and its answer key, including the source's own typos. The speaking pages are left out,
// and no section times are printed on this paper, so none are set (see D3 in the PR).
import type { ExamPaper, PassageBlock } from '../types'

const bansText: PassageBlock[] = [
  { style: 'title', text: '5 Times Countries Banned Harmful Things for Environment protection in 2016' },
  { text: '2016 had a lot of ups and downs. But fortunately, there was progress in the following fields:' },
  { style: 'heading', text: '1. France Banned Supermarket Food Waste' },
  {
    text: 'In a big win for food waste and hunger, France passed a law making it the first country to ban supermarket spoilage. The new law requires supermarkets to donate all unsold food about to go bad to charities and food banks. This adds up to 10 million meals for the hungry in France each year. Italy joined this movement, but instead of punishing stores with fines, the country will now give tax breaks to businesses who donate food to charities instead of letting it sit in dumpsters.',
  },
  { style: 'heading', text: '2. Hamburg Banned Plastic Coffee Pods' },
  {
    text: 'In a win for landfill of Europe, the German city of Hamburg banned those tiny little plastic pods for modern coffee machines. This new law will help make a positive dent for the planet amongst the 9.8 million value packs of pods Keurig sold in 2014.',
  },
  { style: 'heading', text: '3. Barcelona Banned Cars From 60% of City Streets' },
  {
    text: 'Barcelona was sick and tired of city pollution, which is a growing and seriously concerning issue in Delhi, Paris, and other cities. The difference in this Spanish city was that in 2016, Barcelona took action, creating a plan to make the city less polluted and more enjoyable for citizens. As more people move to cities in the future, developers could learn a lesson from 2016 Barcelona.',
  },
  { style: 'heading', text: '4. Morocco Bans Plastic Bags' },
  {
    text: 'Morocco said goodbye to plastic bags in 2016. The ban officially transitioned from a bill to a law on July 1, 2016. Morocco joins Uganda, Somalia, Rwanda, Botswana, Kenya, South Africa, and Ethiopia among African countries who’ve banned plastic bags.',
  },
  { style: 'heading', text: '5. UK Took Steps to Ban Microbeads' },
  {
    text: 'This was a huge win for marine health and oceans across the globe. Microbeads are those teeny tiny dots found in many personal face wash soaps with the sole purpose of exfoliating skin and but also are destroying the planet.',
  },
  {
    text: '"Adding plastic to products like face washes and body scrubs is wholly unnecessary when harmless alternatives can be used,” said a ministry official, in a statement banning the beads.',
  },
  { style: 'heading', text: '5. France Banned Plastic Cutlery, Cups, and Plates' },
  {
    text: 'Picnics in France will change. Starting in 2020, barbeques, picnics, and park adventures will be a little more elegant, and a lot less wasteful. In August, the French government outlined a policy banning plastic utensils. France sips through nearly 5 billion plastic cups each year, but from 2017 on, the country will invest more into biodegradables.',
  },
  { style: 'note', text: 'Dec. 13, 2016' },
]

const paper: ExamPaper = {
  id: 'nyelvvizsga-en-b1-minta-01',
  type: 'nyelvvizsga',
  language: 'en',
  level: 'B1',
  sittingLabelHu: 'Minta 1.',
  source: 'B1 General English (alapfok, ÁLT) mintafeladatsor 1. — feladatsor és megoldókulcs. A kiadó vizsgaközpont megerősítésre vár.',
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
            'Read the text and fill in the gaps with the help of the given words. You should use each word only once. There is one word which you don’t need to use. Write your solutions in the table, according to the example (0).',
          passage: [
            { style: 'title', text: '10 tips for improving your self-esteem' },
            {
              text: 'In a nutshell, self-esteem is your opinion of {{0}} and your abilities. It can be high, low or somewhere in-between. While everyone {{1}} has doubts about themselves, low self-esteem can leave you feeling insecure and unmotivated. You {{2}} able to identify a few things that are affecting your opinion of yourself (maybe you’re being bullied, or you might be feeling lonely), or it could be a mystery. Either way, there are several things you {{3}} do to improve your self-esteem.',
            },
            { style: 'heading', text: '1. Be nice to yourself' },
            {
              text: 'That little voice that criticizes you is {{4}} powerful than you might think. Make an effort to be kind to yourself and, if you do slip up, try to challenge any negative thoughts. A good rule of thumb is to speak to yourself in the same way that you’d speak to your mates. This can be hard at first, {{5}} practise makes perfect. If you want a few pointers, check out our tips for positive self-talk.',
            },
            { style: 'heading', text: '2. You are unique' },
            {
              text: 'Comparing yourself to other people is a sure-fire way to start feeling low. Try to focus on your own goals and achievements, {{6}} than measuring them against someone else’s. Nobody needs that kind of pressure!',
            },
            { style: 'heading', text: '3. Get moving' },
            {
              text: 'Exercise is a great way to {{7}} motivation, practise setting goals and build confidence. Breaking a sweat also cues the body to release endorphins, the feel-good hormones.',
            },
            { style: 'heading', text: '4. Nobody’s perfect' },
            {
              text: 'Always strive to be the best version of yourself, but it’s also important to {{8}} that perfection is an unrealistic goal.',
            },
            { style: 'heading', text: '5. Remember that everyone makes mistakes' },
            {
              text: 'You’ve got to make mistakes in order to learn and {{9}}, so try not to blame yourself if you make a mistake. Everyone’s been there.',
            },
            { style: 'heading', text: '6. Focus on what you can change' },
            {
              text: 'It’s {{10}} to get nervous about all the things that are out of your control, but it won’t achieve much. Instead, try to {{11}} your energy on identifying the things that are within your control and seeing what you can do about them.',
            },
            { style: 'heading', text: '7. Do what makes you happy' },
            {
              text: 'If you spend time doing the things you enjoy, you’re more likely to think {{12}} . Try to schedule in a little you-time every day. Whether that’s time spent reading, cooking or just resting on the couch {{13}} a while, if it makes you happy, make time for it.',
            },
            { style: 'heading', text: '8. Celebrate the small achievements' },
            {
              text: 'You got up on time this morning. Tick. You poached your eggs to {{14}}. Winning. Celebrating the small victories is a great way to build confidence and start feeling better about yourself.',
            },
            { style: 'heading', text: '9. Be friendly' },
            {
              text: 'Being helpful and considerate to other people will certainly boost their mood, but it’ll also make you feel quite good {{15}} yourself.',
            },
            { style: 'heading', text: '10. Surround yourself with a supportive team' },
            {
              text: 'Find people who make you feel good about yourself and avoid those who tend to trigger your negative thinking.',
            },
          ],
          bankTitle: 'The words to use:',
          // Printed in four columns; listed here column by column. The example word
          // "yourself" is used by (0), so it isn't offered for the gaps.
          bank: [
            { key: 'about', text: 'about' },
            { key: 'accept', text: 'accept' },
            { key: 'but', text: 'but' },
            { key: 'can', text: 'can' },
            { key: 'easy', text: 'easy' },
            { key: 'focus', text: 'focus' },
            { key: 'for', text: 'for' },
            { key: 'grow', text: 'grow' },
            { key: 'increase', text: 'increase' },
            { key: 'might be', text: 'might be' },
            { key: 'more', text: 'more' },
            { key: 'must', text: 'must' },
            { key: 'occasionally', text: 'occasionally' },
            { key: 'perfection', text: 'perfection' },
            { key: 'positively', text: 'positively' },
            { key: 'rather', text: 'rather' },
          ],
          unusedBankCount: 1,
          examples: [{ id: '0', type: 'choice', answer: 'yourself' }],
          items: [
            { id: '1', type: 'choice', answer: 'occasionally' },
            { id: '2', type: 'choice', answer: 'might be' },
            { id: '3', type: 'choice', answer: 'can' },
            { id: '4', type: 'choice', answer: 'more' },
            { id: '5', type: 'choice', answer: 'but' },
            { id: '6', type: 'choice', answer: 'rather' },
            { id: '7', type: 'choice', answer: 'increase' },
            { id: '8', type: 'choice', answer: 'accept' },
            { id: '9', type: 'choice', answer: 'grow' },
            { id: '10', type: 'choice', answer: 'easy' },
            { id: '11', type: 'choice', answer: 'focus' },
            { id: '12', type: 'choice', answer: 'positively' },
            { id: '13', type: 'choice', answer: 'for' },
            { id: '14', type: 'choice', answer: 'perfection' },
            { id: '15', type: 'choice', answer: 'about' },
          ],
        },
        {
          id: 'R-1',
          label: 'Task 1',
          instructions:
            'Read the text and provide short answers to the questions according to the example (0), in no more than 5 words.',
          passage: bansText,
          examples: [
            {
              id: '0',
              type: 'short-text',
              prompt: 'Which country banned supermarket spoilage?',
              answer: { accepted: ['France'], match: 'exact-ci' },
            },
          ],
          // Graded by key words (every group must match) so that reasonable phrasings count;
          // `accepted` is the key as printed.
          items: [
            {
              id: '1',
              type: 'short-text',
              prompt: 'What do supermarkets need to do with food waste in France?',
              answer: {
                accepted: ['to donate to charities/food banks'],
                match: 'keywords',
                keywords: [['donat', 'giv'], ['charit', 'food bank', 'foodbank']],
                maxWords: 5,
              },
            },
            {
              id: '2',
              type: 'short-text',
              prompt: 'What rule did Italy introduce?',
              answer: {
                accepted: ['give tax breaks to businesses'],
                match: 'keywords',
                keywords: [['tax'], ['break', 'relief', 'cut', 'reduc', 'benefit', 'incentive']],
                maxWords: 5,
              },
            },
            {
              id: '3',
              type: 'short-text',
              prompt: 'How many coffee pods were sold in 2014?',
              answer: {
                accepted: ['9.8 million'],
                match: 'keywords',
                keywords: [['9.8', '9,8', 'nine point eight'], ['million', 'mill']],
                maxWords: 5,
              },
            },
            {
              id: '4',
              type: 'short-text',
              prompt: 'How did Barcelona reduce city pollution?',
              answer: {
                accepted: ['banned cars from city streets'],
                match: 'keywords',
                keywords: [['ban', 'prohibit', 'forbid', 'forbad', 'no car', 'without car', 'restrict', 'fewer car', 'less car'], ['car', 'vehicle', 'traffic']],
                maxWords: 5,
              },
            },
            {
              id: '5',
              type: 'short-text',
              prompt: 'In which cities is city pollution a problem? (Give 1 example.)',
              answer: { accepted: ['Delhi', 'Paris'], match: 'keywords', keywords: [['delhi', 'paris']], maxWords: 5 },
            },
            {
              id: '6',
              type: 'short-text',
              prompt: 'What products are microbeads used in?',
              answer: {
                accepted: ['face wash soaps/body scrubs'],
                match: 'keywords',
                keywords: [['face wash', 'facewash', 'face-wash', 'soap', 'scrub']],
                maxWords: 5,
              },
            },
            {
              id: '7',
              type: 'short-text',
              prompt: 'When were plastic cups banned in Morocco?',
              answer: { accepted: ['2016'], match: 'keywords', keywords: [['2016']], maxWords: 5 },
            },
            {
              id: '8',
              type: 'short-text',
              prompt: 'What environmental problem does UK want to focus on?',
              answer: {
                accepted: ['marine pollution/ocean pollution'],
                match: 'keywords',
                keywords: [['marine', 'ocean', 'sea']],
                maxWords: 5,
              },
            },
            {
              id: '9',
              type: 'short-text',
              prompt: 'How many plastic cups are used in France annually?',
              answer: {
                accepted: ['5 billion'],
                match: 'keywords',
                keywords: [['5', 'five'], ['billion', 'bn']],
                maxWords: 5,
              },
            },
            {
              id: '10',
              type: 'short-text',
              prompt: 'What is France planning to use instead of plastic cups?',
              answer: { accepted: ['biodegradable'], match: 'keywords', keywords: [['biodegrad']], maxWords: 5 },
            },
          ],
        },
        {
          id: 'R-2',
          label: 'Task 2',
          instructions:
            'Read the text again and use it to decide if the statements are true (T) or false (F). Write your answers in the table below according to the example (0). Please note that if all your answers are marked as true or as false, your answers will be disqualified.',
          passage: bansText,
          booleanLabels: ['T', 'F'],
          rules: { allSameBooleanIsZero: true },
          examples: [
            { id: '0', type: 'boolean', statement: 'There was no progress in reducing food waste in 2016.', answer: false },
          ],
          items: [
            { id: '11', type: 'boolean', statement: 'Hamburg banned the use of plastic coffee cups.', answer: false },
            { id: '12', type: 'boolean', statement: 'Barcelona has already started reducing city pollution.', answer: true },
            { id: '13', type: 'boolean', statement: 'Several African countries banned the use of plastic cups.', answer: true },
            { id: '14', type: 'boolean', statement: 'It is necessary to add plastic to cosmetic products.', answer: false },
            { id: '15', type: 'boolean', statement: 'French people must not use plastic utensils after 2020.', answer: true },
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
            'You have made friends with one of the international students studying at the university of your home town. You are inviting her to your family’s home for dinner.',
          items: [
            {
              id: '1',
              type: 'production',
              prompt: ['Give instructions to her on Messenger in 60-80 words on'],
              contentPoints: ['what transport to take', 'which stop to get off at', 'what route to take, how to recognise the house.'],
              minWords: 60,
              maxWords: 80,
              register: 'informal-message',
              rubricId: 'nyelvvizsga-b1-1',
              modelAnswer: [
                'Dear Lydia,',
                '',
                'Here is how you can find your way to our home, for our dinner invitation.',
                'You can take the suburban train from the train station.',
                'Get off at „Szabadság tér” station in the city centre.',
                'Go straight on along the main street and turn left after the traffic lights. Our block of flats is in Kossuth Lajos u. 45, 2nd floor. Press the bell number 8 and I’ll let you in.',
                'We are looking forward to seeing you.',
              ].join('\n'),
            },
          ],
        },
        {
          id: 'W-2',
          label: 'Task 2',
          instructions: 'You would like to spend your community service doing voluntary work abroad.',
          items: [
            {
              id: '2',
              type: 'production',
              prompt: [
                'Write an email in 120-140 words to a riding school in Bristol where they help sick children by teaching them to ride a horse. Your name in this role is Nagy Edit/Ervin.',
                'In your email, include the following:',
              ],
              contentPoints: [
                'Why you chose the riding school',
                'What relevant experience you have',
                'What help you need from the school',
                'What you can finance yourself',
                'What time would be suitable for you',
              ],
              minWords: 120,
              maxWords: 140,
              register: 'formal-email',
              rubricId: 'nyelvvizsga-b1-2',
              modelAnswer: [
                'Dear Sir/Madam,',
                '',
                'I would like to spend my community service in your riding school in Bristol as a volunteer at this summer.',
                'I read your programme about teaching sick children to ride a horse and I really want to help you, because it is a fantastic cause.',
                'I know how to ride a horse and I like spending my time with children: I used to go to a children camp in the summer to oversee them.',
                'I could finance my travel and the meals but I would like you to find me a place where I could live in the period while I am in Bristol and I work for you. I could spend there my whole summer after I finish my school in the middle of June.',
                'I can’t wait to hear from you.',
                '',
                'Yours faithfully,',
                'Nagy Edit',
                'student',
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
        storagePath: 'nyelvvizsga-en-b1-minta-01.mp3',
        durationSec: 918,
        // Task 1 starts with the recording; Task 2 with a short announcement before its
        // reading pause (found by a loudness scan of the re-encoded file).
        taskMarkers: [
          { taskId: 'L-1', startSec: 0 },
          { taskId: 'L-2', startSec: 438 },
        ],
      },
      tasks: [
        {
          id: 'L-1',
          label: 'Task 1',
          instructions:
            'Listen to the text about the heatwave in Argentina. Based on the text, decide if the statements are true (T) or false (F). Write your answers in the table below, according to the example (0). Please note that if all your answers are marked as true or as false, your answers will be disqualified.',
          booleanLabels: ['T', 'F'],
          rules: { allSameBooleanIsZero: true },
          examples: [
            { id: '0', type: 'boolean', statement: 'Record temperatures in Argentina reached 45 degrees Fahrenheit.', answer: false },
          ],
          items: [
            { id: '1', type: 'boolean', statement: 'In Buenos Aires, electric systems broke down in the heatwave.', answer: true },
            { id: '2', type: 'boolean', statement: 'The Casabal family tried to cool down in their grandmother’s swimming pool.', answer: true },
            { id: '3', type: 'boolean', statement: 'Argentina was the hottest on that day.', answer: false },
            { id: '4', type: 'boolean', statement: 'In the early morning, it was 34 degrees.', answer: false },
            { id: '5', type: 'boolean', statement: 'Leaders gave advice on how to cope with the hottest part of the day.', answer: true },
            { id: '6', type: 'boolean', statement: 'The meteorologist called the heatwave extraordinary.', answer: true },
            { id: '7', type: 'boolean', statement: 'Marta Larusso said the climate is still temperate in the country.', answer: false },
          ],
        },
        {
          id: 'L-2',
          label: 'Task 2',
          instructions:
            'Listen to the text. Use what you heard to complete the table with your notes of 1 word each, according to the example (0).',
          passage: [
            { style: 'title', text: 'Notes on Research on Dogs' },
            { style: 'bullet', text: 'Research: dogs can tell the difference between languages' },
            { style: 'bullet', text: 'Place of research: {{0}}' },
            { style: 'bullet', text: 'Compared story: The Little Prince, in {{1}} and in Hungarian,' },
            { style: 'bullet', text: 'To a group of {{2}} dogs' },
            { style: 'bullet', text: 'Research was carried out in Eötvös Lóránd {{3}}' },
            { style: 'bullet', text: 'Result: non-human brain can distinguish between languages' },
            { style: 'bullet', text: 'Dogs were trained to {{4}} in a brain scanner' },
            { style: 'bullet', text: 'They reacted differently to the languages' },
            { style: 'bullet', text: 'Melodic or {{5}} languages' },
            { style: 'bullet', text: 'They could also differentiate between' },
            { style: 'bullet', text: '– speech and {{6}}' },
            { style: 'bullet', text: '– familiar and unfamiliar languages,' },
            { style: 'bullet', text: 'They produced different {{7}} patterns' },
            { style: 'bullet', text: 'The {{8}} the dogs the better' },
          ],
          examples: [{ id: '0', type: 'short-text', answer: { accepted: ['Hungary'], match: 'exact-ci' } }],
          items: [
            { id: '1', type: 'short-text', answer: { accepted: ['Spanish'], match: 'exact-ci', maxWords: 1 } },
            { id: '2', type: 'short-text', answer: { accepted: ['18', 'eighteen'], match: 'exact-ci', maxWords: 1 } },
            { id: '3', type: 'short-text', answer: { accepted: ['University'], match: 'exact-ci', maxWords: 1 } },
            { id: '4', type: 'short-text', answer: { accepted: ['lie'], match: 'exact-ci', maxWords: 1 } },
            { id: '5', type: 'short-text', answer: { accepted: ['monotone'], match: 'exact-ci', maxWords: 1 } },
            { id: '6', type: 'short-text', answer: { accepted: ['non-speech', 'nonspeech'], match: 'exact-ci', maxWords: 1 } },
            { id: '7', type: 'short-text', answer: { accepted: ['activity'], match: 'exact-ci', maxWords: 1 } },
            { id: '8', type: 'short-text', answer: { accepted: ['older'], match: 'exact-ci', maxWords: 1 } },
          ],
        },
      ],
    },
  ],
}

export default paper
