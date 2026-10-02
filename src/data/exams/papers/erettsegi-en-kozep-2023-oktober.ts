// Angol nyelv, középszintű írásbeli érettségi, 2023. október 19. (2212), Oktatási Hivatal.
// Transcribed verbatim from the feladatlap and its javítási-értékelési útmutató (answer key,
// conversion tables, listening transcripts). Decorative photos are left out.
import type { ExamPaper } from '../types'
import { choices, cloze, enListeningIntro, EN_NOTICES_HU, heard, questions, TFN, tfn, words } from './enKozep.ts'

const bothAB = { key: 'AB', text: 'Both A and B' }

const paper: ExamPaper = {
  id: 'erettsegi-en-kozep-2023-oktober',
  type: 'erettsegi',
  language: 'en',
  level: 'kozep',
  sittingLabelHu: '2023. október',
  source: 'Oktatási Hivatal: Angol nyelv, középszintű írásbeli vizsga, 2023. október 19. (2212) — feladatlap és javítási-értékelési útmutató.',
  noticesHu: EN_NOTICES_HU,
  sections: [
    {
      id: 'I',
      kind: 'reading',
      titleHu: 'I. Olvasott szöveg értése',
      timeLimitMin: 60,
      // útmutató p. 3: feladatpont 0–30 → vizsgapont
      conversion: [0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 28, 29, 30, 31, 32, 33],
      tasks: [
        {
          id: 'I-1',
          label: 'Task 1',
          instructions:
            'Read the following questions and answers from the website of a youth hostel chain. The questions have been removed. Your task is to write the letters of the questions (A-M) next to the appropriate numbers (1-9). There are two extra questions that you do not need. Write the letters in the white boxes as in the example (0).',
          passage: [
            { style: 'title', text: 'ASTOR HOSTELS' },
            {
              text: 'Read the frequently asked questions to find out more about staying at our award-winning hostels. However, if you can\'t find what you\'re looking for, send us an e-mail. Our team will always be happy to help you.',
            },
            { text: '{{0}} Yes, you must be between 18 and 40.' },
            { text: '{{1}} 14 nights. However, certain rooms can be booked for longer stays, but these book out quickly so we recommend booking well in advance.' },
            { text: '{{2}} Yes of course, you can use any Visa, Mastercard or Maestro to pay on arrival, or pay in cash if you prefer.' },
            { text: '{{3}} Don\'t worry. Just call or e-mail the hostel with your full name and they will find your booking.' },
            { text: '{{4}} We will do our best, but we cannot guarantee it. We are a hostel, so you are booking beds and not rooms.' },
            { text: '{{5}} A valid government ID in the form of a passport, driving licence or for European citizens an identity card.' },
            { text: '{{6}} Yes, we have a luggage room, which you are welcome to use free of charge on the day of your arrival. On the day of departure, it costs £1.' },
            { text: '{{7}} We serve continental breakfast, which costs just £1.' },
            { text: '{{8}} Padlocks, adaptors, hairdryers and hair straighteners all free of charge.' },
            { text: '{{9}} Safe lockers are available at reception for such items.' },
          ],
          bankTitle: 'QUESTIONS',
          bank: [
            { key: 'A', text: 'What\'s the maximum length I can book at the hostel?' },
            { key: 'B', text: 'Is there somewhere I can store my bags if I arrive early or leave after check-out time?' },
            { key: 'C', text: 'Are there any age restrictions on staying at the hostel?' },
            { key: 'D', text: 'I didn\'t receive a confirmation e-mail, what should I do?' },
            { key: 'E', text: 'What do I need to check in with?' },
            { key: 'F', text: 'What can I borrow from the front desk?' },
            { key: 'G', text: 'What meals do you provide?' },
            { key: 'H', text: 'Where can I store valuables safely?' },
            { key: 'I', text: 'Can I use kitchen facilities and store food?' },
            { key: 'K', text: 'Can I pay with a different card from the one I used to make the booking?' },
            { key: 'L', text: 'How long can I leave my luggage in storage with you?' },
            { key: 'M', text: 'If I book for more than one person, are we sure to be in the same room?' },
          ],
          unusedBankCount: 2,
          examples: choices(0, 'C'),
          items: choices(1, 'A K D M E B G F H'),
        },
        {
          id: 'I-2',
          label: 'Task 2',
          instructions:
            'Read this article about how to handle stress when doing sports. Some parts of sentences have been left out from the text. Your task is to reconstruct the text by filling in the gaps (10-17) from the list (A-L) below. Write the letters in the white boxes next to the numbers as in the example (0). Remember that there are two extra letters that you do not need.',
          passage: [
            { style: 'title', text: 'DEALING WITH STRESS IN SPORTS' },
            { text: 'Sports are a great way to have fun while staying fit. Sports also {{0}} like working as a team, overcoming challenges or {{10}}.' },
            {
              text: 'But it\'s not always easy to keep it together when it feels like winning is everything. Learning to deal with the stress that {{11}} can help you perform your best.',
            },
            {
              text: 'Competing always leads to some stress, which can be good. A little stress even helps the body face a challenge. But too much stress can take the fun out of a sport and {{12}} to perform. Making some changes can help, such as changing your focus from {{13}}.',
            },
            {
              text: 'Anyway, there will always be some stress in sports, so it\'s important to know how to deal with it. Trying different ways during practice helps you to know what will {{14}}. You can try deep breathing or muscle relaxation. Take a deep breath and hold it in for about five seconds, then {{15}}. Repeat five times. Then tense a group of muscles tightly and keep them tense for about five seconds, then release. After {{16}}, move to a different muscle group. Practising mindfulness may also help: {{17}} instead of worrying about the future or the past.',
            },
            {
              text: 'Sports are about staying active, making friends and above all, having fun. By keeping that as the priority, you can learn to handle the stress that is a natural part of competition.',
            },
          ],
          bank: [
            { key: 'A', text: 'make it hard' },
            { key: 'B', text: 'focus on the present' },
            { key: 'C', text: 'teach important life lessons' },
            { key: 'D', text: 'controlling emotions' },
            { key: 'E', text: 'winning to doing your best' },
            { key: 'F', text: 'perform under pressure' },
            { key: 'G', text: 'repeating the exercise five times' },
            { key: 'H', text: 'gives up immediately' },
            { key: 'I', text: 'comes with competing' },
            { key: 'K', text: 'let it out slowly' },
            { key: 'L', text: 'work best during competition' },
          ],
          unusedBankCount: 2,
          examples: choices(0, 'C'),
          items: choices(10, 'D I A E L K G B'),
        },
        {
          id: 'I-3',
          label: 'Task 3',
          instructions:
            'Read this article about innovation at the LEGO Company. Some sentences have been left out from the text. Your task is to reconstruct the text by filling in the gaps (18-22) from the list (A-H) below. Write the letters in the white boxes next to the numbers as in the example (0). Remember that there are two extra letters that you do not need.',
          passage: [
            { style: 'title', text: 'LEGO DEVELOPS ECO-FRIENDLY BRICKS' },
            {
              text: 'The LEGO Group has been working on a way to make LEGO bricks out of recycled plastic. {{0}} The plastic building toys have been around since the 1950s. The bricks click together firmly, allowing users to build things that don\'t fall apart easily. {{18}} LEGO bricks are made from a kind of plastic called ABS. ABS plastic makes the bricks very tough, and gives them great clutch power. {{19}} Since 2015, LEGO has been trying to make their products more earth-friendly. In 2018, it began producing elements from plant-based bioplastic, which is perfect for making smaller, softer pieces such as trees or leaves. {{20}} The company has tested over 250 different ways of creating LEGO bricks from recycled plastic. The goal is to make bricks out of PET plastic, which can be found in bottles. {{21}} Now, the company says they\'ve found a way to make a good 2×4 brick from PET. It is a big challenge to make good bricks from recycled plastic, because PET is softer than ABS. The most important step was finding a way of making PET plastic tougher and giving it better clutch power. {{22}} The recycled bricks will go through many different tests, which will take at least a year before kids will be able to play with them.',
            },
          ],
          bank: [
            { key: 'A', text: 'As a result, it did not meet the company\'s strict safety requirements.' },
            { key: 'B', text: 'A recycled one-litre plastic bottle could make about ten 2×4 LEGO bricks.' },
            { key: 'C', text: 'The company\'s goal is to make all of their main products out of recycled materials by 2030.' },
            { key: 'D', text: 'But sadly, it can\'t be recycled, and it takes an extremely long time to break down.' },
            { key: 'E', text: 'However, it is not suitable for making harder, stronger elements, like bricks.' },
            { key: 'F', text: 'The company calls this quality of the bricks “clutch power”.' },
            { key: 'G', text: 'The next step is to figure out a way to add colour to the bricks – right now they\'re just white.' },
            { key: 'H', text: 'This involves packaging its products in recyclable paper rather than single-use plastic.' },
          ],
          unusedBankCount: 2,
          examples: choices(0, 'C'),
          items: choices(18, 'F D E B G'),
        },
        {
          id: 'I-4',
          label: 'Task 4',
          instructions:
            'Read this article about two successful elderly people and then read the statements (23-30) following it. Mark a statement A if it is true according to the article, mark it B if it is false, and mark it C if there isn\'t enough information in the text to decide if it is true or not. Write the letters in the white boxes next to the numbers as in the example (0). A = TRUE B = FALSE C = THE TEXT DOES NOT SAY',
          passage: [
            { style: 'title', text: 'NEVER TOO OLD: AMAZING SENIORS SET RECORDS' },
            {
              text: 'The inspiring stories of two amazing elderly people are a good reminder that you\'re never too old to do something incredible. Dr Manfred Steiner didn\'t really need another Ph.D. degree. After all, he already had two. He had been a professor of medicine for years. But after Dr Steiner retired from his career in medicine, he realized he finally had time to do something he\'d always wanted to do – study physics. At first, he just took a few classes, but after a while, he finished enough classes to complete a regular college degree. That\'s when he decided to get a Ph.D. It took him a long time, but at age 89, Dr Steiner finally earned his physics Ph.D. He encourages young people who have a dream to “follow that dream. Don\'t give up on it.”',
            },
            {
              text: 'Julia “Hurricane” Hawkins set a new world record by running the 100-meter dash in just over 62 seconds, which was a slightly slower time than she\'d hoped for. If that doesn\'t sound like a record to you, keep in mind that Ms Hawkins is 105 years old. Before this year, there wasn\'t even a category for female runners over the age of 104. They had to create one for Ms Hawkins, so at age 105, she was in a new age category all her own. Running isn\'t Ms Hawkins\' main sport – she was a lifelong cyclist before losing interest in this sport late in life because of a lack of competition. She took up running at 100 and soon set her first world record. Encouraging others to be active is a big part of what keeps Ms Hawkins running. “My message to others,” she says, “is that you have to stay active if you want to be healthy and happy as you age.”',
            },
          ],
          options: TFN,
          examples: [{ id: '0', type: 'mcq', stem: 'Dr Steiner\'s degree in physics is his third Ph.D.', answer: 'A' }],
          items: tfn(
            23,
            [
              'Dr Steiner hadn\'t been interested in physics before he retired.',
              'Dr Steiner\'s regrets studying medicine when he was younger.',
              'When Dr Steiner started taking physics classes, he had no definite plan to get a Ph.D. in the end.',
              'Julia Hawkins wanted to finish the race with a better result.',
              'Ms Hawkins was the only runner in her category.',
              'The senior running competition is held every two years.',
              'Ms Hawkins gave up cycling because she had got injured.',
              'Julia Hawkins did not use to do running when she was young.',
            ],
            'B C A A A C B A',
          ),
        },
      ],
    },
    {
      id: 'II',
      kind: 'language-use',
      titleHu: 'II. Nyelvhelyesség',
      timeLimitMin: 30,
      // útmutató p. 5: feladatpont 0–25 → vizsgapont
      conversion: [0, 1, 1, 2, 3, 4, 4, 5, 6, 6, 7, 8, 9, 9, 10, 11, 12, 12, 13, 14, 14, 15, 16, 17, 17, 18],
      tasks: [
        {
          id: 'II-1',
          label: 'Task 1',
          instructions:
            'You are going to read an article about the diet which was named best diet for the fifth time in a row in January 2022. Some words are missing from the text. Your task is to choose the most appropriate word from the list (A-M) for each gap (1-8) in the text. Write the letter of the appropriate word in the white box. You can use each word only once. There are three extra words that you do not need to use. There is one example (0) at the beginning.',
          passage: [
            { style: 'title', text: 'THE MEDITERRANEAN DIET' },
            { text: 'For the fifth year in a row, the Mediterranean diet {{0}} first in the annual race for best diet.' },
            { text: 'The diet, which is more of an eating style, is the easiest to {{1}} and the best for healthy eating and to prevent various diseases.' },
            {
              text: 'The diet includes simple, plant-based cooking, with the majority of each meal focused on {{2}} and vegetables, whole grains, beans and seeds, with a few nuts. Fats {{3}} than olive oil, such as butter, are rarely eaten, if at all, and sweets are reserved for special occasions. Red meat is {{4}} only in small amounts. Eating fish is encouraged, {{5}} eggs, milk products and poultry (chicken, turkey etc.) are eaten in much smaller portions than {{6}} the traditional Western diet.',
            },
            {
              text: 'Social interactions during {{7}} and exercise are considered very important. Lifestyle changes that are part of the diet {{8}} eating with friends and family, eating favorite foods, as well as taking exercise.',
            },
          ],
          bank: [
            { key: 'A', text: 'DRUNK' },
            { key: 'B', text: 'FOLLOW' },
            { key: 'C', text: 'CAME' },
            { key: 'D', text: 'FRUITS' },
            { key: 'E', text: 'IF' },
            { key: 'F', text: 'IN' },
            { key: 'G', text: 'INCLUDE' },
            { key: 'H', text: 'MAKE' },
            { key: 'I', text: 'MEALS' },
            { key: 'K', text: 'OTHER' },
            { key: 'L', text: 'USED' },
            { key: 'M', text: 'WHILE' },
          ],
          unusedBankCount: 3,
          examples: choices(0, 'C'),
          items: choices(1, 'B D K L M F I G'),
        },
        {
          id: 'II-2',
          label: 'Task 2',
          instructions:
            'You are going to read an article about the history of Arbor Day. Some words are missing from the text. Use the words in brackets to form the words that fit in the gaps (9-16). Then write the appropriate form of these words on the dotted lines after the text. There might be cases when you do not have to change the word in brackets. Use only one word for each gap. There is an example (0) at the beginning.',
          passage: [
            { style: 'title', text: 'ARBOR DAY' },
            { text: 'Arbor Day – which means “tree” day – is a holiday that celebrates trees. It\'s {{0}} held on the last Friday in April in the United States.' },
            {
              text: 'The origins of Arbor Day date back to the early 1870s in Nebraska City. Julius Sterling Morton, a {{9}}, moved to the state with his wife in 1854. They bought 160 acres of treeless land in Nebraska City and planted a wide variety of trees.',
            },
            {
              text: 'Morton also became the editor of the state\'s first newspaper, Nebraska City News, which was a perfect platform for him to spread his {{10}} of trees and to stress their ecological {{11}} to Nebraska.',
            },
            {
              text: 'On January 7, 1872, Morton proposed a day that would encourage all Nebraskans to plant trees in their {{12}}. The first Arbor Day occurred on April 10, 1872. It was a big success: {{13}} 1 million trees were planted.',
            },
            {
              text: 'The tradition began to spread {{14}} and by 1885, Arbor Day had become an official holiday in Nebraska. The date was {{15}} to April 22 to honor Morton\'s birthday and because of its ideal weather for {{16}} trees.',
            },
            { text: 'Within 20 years, the holiday was celebrated in every American state.' },
          ],
          examples: words(0, [['usual', 'usually']]),
          items: words(9, [
            ['journal', 'journalist'],
            ['know', 'knowledge'],
            ['important', 'importance'],
            ['neighbor', 'neighborhood', 'neighborhoods', 'neighbourhood', 'neighbourhoods'],
            ['near', 'nearly', 'near'],
            ['fast', 'fast'],
            ['change', 'changed'],
            ['plant', 'planting'],
          ]),
        },
        {
          id: 'II-3',
          label: 'Task 3',
          instructions:
            'You are going to read an article about what3words, a mapping app that helps you to find, save and share exact locations easily. Some words are missing from the text. Your task is to write the missing words on the dotted lines (17-25) after the text. Use only one word in each gap. There is an example (0) at the beginning.',
          passage: [
            { style: 'title', text: 'FINDING LOCATIONS EASILY' },
            { text: 'Traditional addresses don\'t work. That\'s the argument of London startup what3words, which says we often {{0}} difficulty giving and finding addresses.' },
            {
              text: 'The company\'s answer was to divide the world {{17}} 57 trillion squares and give them each a unique combination of three words, that is, a 3-word address.',
            },
            {
              text: 'The idea came from what3words director Chris Sheldrick, {{18}} former live music organizer. He often got annoyed when he needed to drop off equipment somewhere or tell a band where {{19}} go. Addresses either didn\'t exist, they weren\'t accurate enough, {{20}} they were difficult to communicate.',
            },
            {
              text: 'Sheldrick started using GPS coordinates, but they were difficult to remember or share. Then, {{21}} day, he and a friend found a solution. There was a dictionary on the table, and they wondered how many different words {{22}} would take to build a system using words. The answer is about 40,000, put together in groups of three.',
            },
            {
              text: 'It works {{23}} this: Say you want to meet a friend at the mall, but there are lots of entrances and no easy way to explain {{24}} you are. By using the what3words mapping app, you can mark out the specific entrance, tap on a virtual square and you will get a phrase fixed to that location, like "caramel.kingdom.signature" — a real phrase tied to a location in Hong Kong. The app then lets you open up the address in another mapping provider, {{25}} as Google Maps, which can direct you there.',
            },
          ],
          examples: cloze(0, [['have']]),
          items: cloze(17, [['into'], ['a', 'the'], ['to'], ['or'], ['one'], ['it'], ['like'], ['where'], ['such']]),
        },
      ],
    },
    {
      id: 'III',
      kind: 'listening',
      titleHu: 'III. Hallott szöveg értése',
      timeLimitMin: 30,
      intro: enListeningIntro('After that,'),
      audio: {
        storagePath: 'erettsegi-en-kozep-2023-oktober.mp3',
        durationSec: 1796,
        // Task starts: the ~60 s reading pause of each task found by silence detection, minus the length of its announcement (approximate, ±10 s).
        taskMarkers: [
          { taskId: 'III-1', startSec: 109 },
          { taskId: 'III-2', startSec: 621 },
          { taskId: 'III-3', startSec: 1151 },
        ],
      },
      // útmutató p. 7: feladatpont 0–25 → vizsgapont
      conversion: [0, 1, 3, 4, 5, 7, 8, 9, 11, 12, 13, 15, 16, 17, 18, 20, 21, 22, 24, 25, 26, 28, 29, 30, 32, 33],
      transcripts: [
        {
          taskId: 'III-1',
          title: 'A boat with no captain',
          paragraphs: [
            'A boat with no captain is about to set off across the Atlantic.',
            'The high-tech boat, called the Mayflower Autonomous Ship (MAS), will complete the 5000km journey with no crew. The ship will be controlled by Artificial Intelligence, meaning no humans will be onboard. Its aim is to get important scientific data about the ocean.',
            'The ship gets its name from the Mayflower, a famous historical ship which set sail 400 years ago from the UK to the US.',
            'Measuring in at 15m long, it is made from lightweight aluminum. The ship can skim over the waves at more than 18 kilometers per hour. The ship gets its power from solar-powered batteries, and a back-up diesel generator.',
            'It uses an ‘AI captain’, which is an artificial intelligence system. This uses information from the ship\'s cameras and sensors to look out for any hazards and tell the ship where to go next.',
            'One of the biggest differences between the Mayflower Autonomous Ship and other boats is that there are no bedrooms, bathrooms or a kitchen, because there are no crew on board.',
          ],
        },
        {
          taskId: 'III-2',
          title: 'Adhara Pérez Sánchez',
          paragraphs: [
            '“I want to be an astronaut to change the world.” That is what 8-year-old Adhara Pérez Sánchez hopes to become once she\'s older. She is currently attending Universidad CNCI, a university in Mexico, and is studying systems engineering and mathematics.',
            'According to tests conducted since she was four years old, Adhara was found to have an IQ of 162, her mother Nayeli Sánchez said in a TV interview. It\'s an IQ higher than her superhero: Albert Einstein, her mom said.',
            'She was born in Veracruz, Mexico and recently traveled to Tijuana in Mexico to give a presentation on black holes, an event organized by the Institute of Art and Culture where kids were surprised to hear her speak.',
            '“I\'m surprised because how can a little girl know so much more than an adult? She already has two college careers,” said Karen Alonso, a young girl who attended her presentation.',
            'Adhara has been to NASA\'s Johnson Space Center in Texas and was invited to study astronomy at the University of Arizona. “I have to stay there for three months to learn and get accustomed to hearing and speaking English,” Adhara said.',
            'At the age of three, Adhara was diagnosed with Autism. She is currently in the process of creating a device to help autistic kids. “I\'m making a special bracelet – a band that kids can wear on their wrist – that measures their emotions and then parents will be able to see what emotion their kids have by checking a phone, tablet or computer,” Adhara said.',
            'Her projects don\'t stop there, she is about to publish a book and hopes to work at NASA and travel to Mars.',
            'Her advice to others? “Do not give up, and if you don\'t like where you are, start planning where you want to be,” Adhara said.',
          ],
        },
        {
          taskId: 'III-3',
          title: 'The value of Olympic medals',
          paragraphs: [
            'Have you ever wondered what an Olympic Gold medal is worth?',
            'Well, if the International Olympic Committee still gave solid gold medals to first place finishers, the medals would be very valuable, but actually the 1912 Olympic Games were the last games where they were made from solid gold. After the 1912 Olympic Games, the IOC made the change to silver medals covered in gold. This means that if an Olympian is looking to melt their medal and sell it, the medal will not go for quite as much money.',
            'The design of the medals changes for each games and the gold medals in the Tokyo 2020 Olympics were designed by Japanese designer, Junichi Kawanishi. Each of the gold, silver and bronze medals is 85 millimeters in diameter and they range in thickness from 7.7 mm to 12.1 mm.',
            'The gold medal is in fact made from gold-plated pure silver, with around 6 grams of gold out of a total weight of 556 grams. The silver medal is made from pure silver and weighs around 550 grams, while the bronze medal weighs approximately 450 grams and is in fact made from 95% copper and 5% zinc. At today\'s prices that means the gold medal would be worth around $800 if you melted it down, while the silver would be worth about $450 and the bronze around $5. But, needless to say, there is more to an Olympic medal than just the price of the metal it is made from. If you do win a medal – be it gold, silver or bronze – they\'re pretty much priceless.',
            'Olympians tend to hold on to medals they have won, according to Richard Gladdie, from Baldwin\'s auction house in London. "They very rarely come up for sale," Gladdie told CNN Sport on Friday. However, quite a number of medals have been sold over the years. Mark Wells from the United States, in 2010 sold his medal to a collector for $311,000. One of Jesse Owens\' gold medals from the 1936 Berlin Olympics at auction in 2013 was sold for $1.47 million. This medal is considered one of the most important in Olympics history and is one of the four that Owens, a Black American, won at the 1936 Games. It is an interesting fact that at the 1896 Games – the first modern Olympics – winners were awarded silver medals and those finishing second earned bronze.',
          ],
        },
      ],
      tasks: [
        {
          id: 'III-1',
          label: 'TASK 1',
          instructions:
            'In this section, you will hear some information about a very interesting new ship. Your task is to complete the sentences with one word in each gap, using the exact words you hear. First, you will have some time to study the task, and then we will play the whole recording in one piece. Then you will hear the recording again, but this time we will play the text in shorter sections to give you enough time to write down your answers.',
          examples: heard(0, [['The boat that is about to sail the Atlantic has no ________ .', 'captain']]),
          items: heard(1, [
            ['The boat will complete the 5000km ________ with no crew.', 'journey'],
            ['As it is an autonomous ship, there will be no ________ on board.', 'humans', 'crew', 'captain'],
            ['The aim of the project is to get scientific data about the ________ .', 'ocean'],
            ['The boat was named after a famous ________ ship called Mayflower.', 'historical'],
            ['The ship was made from lightweight ________ .', 'aluminum', 'aluminium'],
            ['The ship gets its power from solar-powered ________ and a generator.', 'batteries'],
            ['The “AI captain” is actually a(n) artificial intelligence ________ .', 'system'],
            ['The “AI captain” uses information from the ship\'s ________ and sensors.', 'cameras'],
            ['This ship is special as there are no bedrooms, ________ or a kitchen on it.', 'bathrooms'],
          ]),
        },
        {
          id: 'III-2',
          label: 'TASK 2',
          instructions:
            'In this section you will listen to a news report about an outstandingly intelligent young lady. Your task will be to circle the letter(s) of the correct answer(s) in the boxes on the right. Please note that in this task both answers may be correct. However, there is always at least one correct answer. This means you might have to circle one or two letters. First, you will have some time to study the task, and then we will play the whole recording in one piece. Then you will hear the recording again, but this time we will play the text in shorter sections to give you enough time to write down your answers.',
          examples: [
            {
              id: '0',
              type: 'mcq',
              stem: 'Adhara Pérez Sánchez …',
              options: [{ key: 'A', text: 'is eight years old.' }, { key: 'B', text: 'wants to be an astronaut.' }, bothAB],
              answer: 'AB',
            },
          ],
          items: questions(
            10,
            [
              { stem: 'Adhara …', options: ['hopes to go on to university once she\'s older.', 'is studying mathematics.'] },
              { stem: 'Adhara has an IQ …', options: ['of 162.', 'that is exactly as high as Albert Einstein\'s was.'] },
              { stem: 'In Tijuana, Mexico, she gave a presentation …', options: ['on black holes.', 'to other children.'] },
              { stem: 'Karen Alonso was …', options: ['surprised at Adhara\'s great knowledge.', 'one of Adhara\'s teachers.'] },
              { stem: 'Adhara …', options: ['was invited to study astronomy at the University of Arizona.', 'speaks absolutely perfect English.'] },
              { stem: 'Adhara …', options: ['was diagnosed with autism when she was younger.', 'is working on a special gadget to help autistic children.'] },
              { stem: 'The wrist-band Adhara is making …', options: ['can read the kids\' emotional state.', 'will be worn by both the kids and their parents.'] },
              { stem: 'Adhara …', options: ['is going to publish a book.', 'hopes to get a job with NASA.'] },
              { stem: 'Adhara\'s advice to other people is that they should …', options: ['never give up their dreams.', 'study as hard as possible.'] },
            ],
            'B A AB A A AB A AB A',
          ).map((item) => ({ ...item, options: [...(item.options ?? []), bothAB] })),
        },
        {
          id: 'III-3',
          label: 'TASK 3',
          instructions:
            'In this section you will hear some interesting background information about Olympic medals. Your task will be to decide whether the following statements are true, false or we do not know because the text does not say, and write the appropriate letter in the boxes on the right. Write A if the statement is true, write B if the statement is false, and write C if the text does not say. First, you will have some time to study the task, and then we will play the whole recording in one piece. Then, you will hear the recording again, but this time we will play the text in shorter sections to give you enough time to write down your answers. A = TRUE B = FALSE C = THE TEXT DOES NOT SAY',
          options: TFN,
          examples: [
            { id: '0', type: 'mcq', stem: 'Even if Olympic gold medals were made from solid gold, they would not be very valuable.', answer: 'B' },
          ],
          items: tfn(
            19,
            [
              'At the 1912 Olympics, winners were given a medal made from pure gold.',
              'The gold medal is the thickest of the three medals.',
              'The silver medal is the only one that is made from one single metal.',
              'The value of the metal the bronze medal is made from is around $5 at the moment.',
              'Olympic medals often come up for sale at auctions.',
              'One of Jesse Owens\' gold medals is the most valuable medal in Olympic history.',
              'No gold medals were awarded at the first modern Olympic Games in 1896.',
            ],
            'A C A A B C A',
          ),
        },
      ],
    },
    {
      id: 'IV',
      kind: 'writing',
      titleHu: 'IV. Íráskészség',
      timeLimitMin: 60,
      intro: [
        'Mindkét feladatot meg kell írni!',
        'Ügyeljen a megadott szószámra! Amennyiben a létrehozott szöveg jelentősen eltér (rövidebb, hosszabb) a megadott szóintervallumtól, az pontlevonással jár.',
      ],
      tasks: [
        {
          id: 'IV-1',
          label: 'Task 1',
          instructions:
            'You are studying in Leeds, England and you share a flat with some other students in a nearby town, Morley. You have decided to buy a second hand bookshelf and you have found the following advertisement on the homepage of the university:',
          passage: [
            { style: 'title', text: 'Pine bookshelf in Morley £25 (Discount for students)' },
            {
              text: 'Handmade, used Pine 2 shelf bookcase on bun feet in good condition. Adjustable shelves. 102cm high x 75cm wide x 27cm deep. Collection is from Morley. Local delivery possible. Contact Miles by email miles.ash@gmail.com',
            },
          ],
          items: [
            {
              id: '1',
              type: 'production',
              prompt: ['Write an email of 80-100 words to Miles in which you introduce yourself and ask about'],
              contentPoints: ['the weight of the bookcase,', 'the discount,', 'the price of local delivery and payment method.'],
              promptAfter: ['Begin your email like this:'],
              minWords: 80,
              maxWords: 100,
              opening: 'Hello Miles,',
              register: 'formal-email',
              rubricId: 'erettsegi-kozep-1',
              criteria: [
                { labelHu: 'A feladat teljesítése és a szöveg hosszúsága', points: 5 },
                { labelHu: 'Szókincs, kifejezésmód', points: 3 },
                { labelHu: 'Nyelvhelyesség, helyesírás', points: 3 },
              ],
            },
          ],
        },
        {
          id: 'IV-2',
          label: 'Task 2',
          instructions: 'You have read the following post on an Internet forum called Pet Forum:',
          passage: [
            {
              text: 'Hi everyone, I\'ve wanted my own dog forever, but I guess haven\'t had the courage to get one yet. My sister\'s friend got a puppy recently and cried every day for the first month because she was so overwhelmed – I guess I\'m scared that would happen to me! I want to make sure I\'m ready. I know they are adorable and all, but all those duties, you know what I\'m talking about. Or maybe a dog is too much of a commitment and I should go for a different pet – a cat maybe (at least I wouldn\'t have to walk them) or a cute little hamster family? A little info about me: I\'m 17, living at home with my family and going to school. I do athletics competitively and go to a theatre group twice a week. Any advice would be very helpful. Thanks!!',
            },
            { text: 'Mark' },
          ],
          items: [
            {
              id: '2',
              type: 'production',
              prompt: ['Write a comment of 100-120 words to Mark\'s post in which you tell him'],
              contentPoints: [
                'if you have (ever had) a pet,',
                'what advantages keeping a pet has,',
                'what sort of pet he should have,',
                'what duties you think a pet-owner has.',
              ],
              promptAfter: ['Begin your comment like this:'],
              minWords: 100,
              maxWords: 120,
              opening: 'Mark,',
              register: 'forum-post',
              rubricId: 'erettsegi-kozep-2',
              criteria: [
                { labelHu: 'A feladat teljesítése, a megadott szempontok követése', points: 6 },
                { labelHu: 'Hangnem, az olvasóban keltett benyomás', points: 2 },
                { labelHu: 'Szövegalkotás', points: 4 },
                { labelHu: 'Szókincs, kifejezésmód', points: 5 },
                { labelHu: 'Nyelvhelyesség, helyesírás', points: 5 },
              ],
            },
          ],
        },
      ],
    },
  ],
}

export default paper
