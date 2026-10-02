// Angol nyelv, középszintű írásbeli érettségi, 2021. május 6. (1912), Oktatási Hivatal.
// Transcribed verbatim from the feladatlap and its javítási-értékelési útmutató (answer key,
// conversion tables, listening transcripts). Decorative photos are left out.
import type { ExamPaper } from '../types'
import { choices, cloze, enListeningIntro, EN_NOTICES_HU, gapMcqs, questions, shortAnswer, TFN, tfn, words } from './enKozep.ts'

const bothAB = { key: 'AB', text: 'Both A and B' }

const paper: ExamPaper = {
  id: 'erettsegi-en-kozep-2021-majus',
  type: 'erettsegi',
  language: 'en',
  level: 'kozep',
  sittingLabelHu: '2021. május',
  source: 'Oktatási Hivatal: Angol nyelv, középszintű írásbeli vizsga, 2021. május 6. (1912) — feladatlap és javítási-értékelési útmutató.',
  noticesHu: EN_NOTICES_HU,
  sections: [
    {
      id: 'I',
      kind: 'reading',
      titleHu: 'I. Olvasott szöveg értése',
      timeLimitMin: 60,
      // útmutató p. 3: feladatpont 0–27 → vizsgapont
      conversion: [0, 1, 2, 4, 5, 6, 7, 9, 10, 11, 12, 13, 15, 16, 17, 18, 20, 21, 22, 23, 24, 26, 27, 28, 29, 31, 32, 33],
      tasks: [
        {
          id: 'I-1',
          label: 'Task 1',
          instructions:
            'In the following interview about a common illness, the questions have been removed. Your task is to match the questions to the paragraphs. Write the letters (A-I) in the white boxes next to the numbers (1-6) as in the example (0). There are two extra questions that you do not need.',
          passage: [
            { style: 'title', text: 'COPING WITH COLDS' },
            { text: 'Despite being a minor illness, a cold can make you feel miserable. Here\'s some information about it.' },
            { text: '{{0}} A cold is in fact an infection which can affect the nose, throat, or sinuses.' },
            {
              text: '{{1}} The cold virus. When it gets through the nose and throat, the body answers with an immune system reaction. Dry air, lack of sleep, stress, or not eating properly can increase one\'s chances of getting the cold virus.',
            },
            {
              text: '{{2}} What people first notice is usually a runny nose or sneezing. You also might feel very tired and have a sore throat, cough, headache, temperature, or muscle aches.',
            },
            {
              text: '{{3}} Well, viruses can stay alive in the air or on surfaces for hours. So, sick people can easily spread the cold to others if they don\'t wash their hands after coughing or sneezing.',
            },
            { text: '{{4}} Although some people may be sick for as long as two weeks, most colds clear up within a week.' },
            { text: '{{5}} Getting plenty of rest and drinking warm liquids like tea or chicken soup can make you feel less miserable.' },
            {
              text: '{{6}} People who catch colds usually don\'t need medical attention. But talk to your GP if your symptoms get worse after 3 days instead of getting better.',
            },
          ],
          bankTitle: 'QUESTIONS',
          bank: [
            { key: 'A', text: 'What are the signs and symptoms of a cold?' },
            { key: 'B', text: 'What\'s the difference between a cold and flu?' },
            { key: 'C', text: 'What exactly is a cold?' },
            { key: 'D', text: 'Can a cold be passed from one person to another?' },
            { key: 'E', text: 'When should I go to the doctor?' },
            { key: 'F', text: 'How long do colds last?' },
            { key: 'G', text: 'Will taking vitamin C help me to prevent colds?' },
            { key: 'H', text: 'What causes colds?' },
            { key: 'I', text: 'What can I do to feel better?' },
          ],
          unusedBankCount: 2,
          examples: choices(0, 'C'),
          items: choices(1, 'H A D F I E'),
        },
        {
          id: 'I-2',
          label: 'Task 2',
          instructions:
            'Read this article about valuable charity gifts and then read the sentences (7-12) following it. Mark a sentence A if it is true according to the article. Mark it B if it is false. Mark it C if there is not enough information in the text to decide if the sentence is true or not. Write your answers in the white boxes next to the numbers as in the example (0). A = TRUE B = FALSE C = THE TEXT DOES NOT SAY',
          passage: [
            { style: 'title', text: 'GOLD COINS FOUND IN A CHARITY KETTLE' },
            {
              text: 'The Salvation Army regularly uses donation kettles to collect money for charity purposes. Not long ago they found five gold coins in their donation kettle at a food store in Mebane, North Carolina — three South African Krugerrand, one American Riverman and one Canadian Maple Leaf. All came in little plastic packages to keep them safe.',
            },
            {
              text: '“We got the Riverman about a week ago, and we got the other four over the last two days,” said the Salvation Army spokesman. The organisation had already received such coins before with the exception of the Riverman.',
            },
            {
              text: 'All the coins were dropped in the kettle by an anonymous donor. The organisation is planning to take the five coins to a shop in High Point to determine their value. “We have a guy that we go to every year. He buys them from us,” the spokesman said. The group will use the money they get for the coins like any other gifts they receive. “I think it\'s amazing to get these coins every year because that is a really large donation,” the spokesman said.',
            },
          ],
          options: TFN,
          examples: [{ id: '0', type: 'mcq', stem: 'The five coins found are all made of gold.', answer: 'A' }],
          items: tfn(
            7,
            [
              'The five coins are all of the same size.',
              'The five coins came within two days.',
              'The five coins were put in the kettle at night.',
              'It was not the first time someone had given the Salvation Army gold coins.',
              'The organisation doesn\'t know who the coins came from.',
              'The Salvation Army is going to give the coins to a museum.',
            ],
            'C B C A A B',
          ),
        },
        {
          id: 'I-3',
          label: 'Task 3',
          instructions:
            'Read the following story about a prize-winning house and read the half sentences that follow the text. Your task is to match the half sentences based on the information in the text. Write the letters (A-K) in the white boxes next to the numbers (13-19) as in the example (0). Remember that there are two extra letters that you will not need.',
          passage: [
            { style: 'title', text: 'BAMBOO HOUSE: CUBO WINS TOP PRIZE' },
            {
              text: 'Earl Forlales, the creator of a house made of bamboo, has won a £50,000 top prize to develop cities for the future. Earl Forlales, 23, a graduate in engineering, was awarded first prize by the Royal Institute of Surveyors for his house, known as Cubo. The Royal Institute decided to give top prize to the house because of its use of low-cost eco-friendly material, and the speed with which it could be constructed. The house could be manufactured in a week, constructed in four hours and costs £60 per square metre.',
            },
            {
              text: 'The competition was aiming to find practical solutions to housing problems that the world\'s cities face. There were more than 1,200 competitors; they were narrowed down to 12 finalists, who were given a mentor from the Royal Institute to help develop their ideas over several months and then finally build their houses.',
            },
            {
              text: 'The competition head judge said: “There is a need for clean and comfortable places to live for future generations. There were many exciting designs among the projects. However, Earl\'s idea stood out for its cheap and simple solution to the world\'s growing accommodation problem.”',
            },
            {
              text: 'The winner, Forlales has already selected a suitable area of land to start building his Cubo houses in Manila, capital of the Philippines, because there are huge pressures on housing in the city. He plans to begin work next year. He said: “Cubo started as an idea while I was spending time at my grandparents\' house – it is great that it will now become a reality.”',
            },
            { text: 'A bamboo house project was chosen', itemId: '0' },
            { text: 'It would take less than a day', itemId: '13' },
            { text: 'Housing problems in cities encouraged the Royal Institute', itemId: '14' },
            { text: 'More than a thousand people decided', itemId: '15' },
            { text: 'The Royal Institute mentors were asked', itemId: '16' },
            { text: 'It took the 12 competitors months', itemId: '17' },
            { text: 'The judges considered the cost of the house in order', itemId: '18' },
            { text: 'After winning the competition Earl Forlales managed', itemId: '19' },
          ],
          bank: [
            { key: 'A', text: 'to choose the winner.' },
            { key: 'B', text: 'to hand in a project and enter the competition.' },
            { key: 'C', text: 'to get the award of £50,000.' },
            { key: 'D', text: 'to make a modern building out of an old one.' },
            { key: 'E', text: 'to build a Cubo house.' },
            { key: 'F', text: 'to find a site for building several Cubo houses.' },
            { key: 'G', text: 'to organise the competition.' },
            { key: 'H', text: 'to work out the details of their projects.' },
            { key: 'I', text: 'to live in an old part of the city.' },
            { key: 'K', text: 'to help the participants in the finals.' },
          ],
          unusedBankCount: 2,
          examples: choices(0, 'C'),
          items: choices(13, 'E G B K H A F'),
        },
        {
          id: 'I-4',
          label: 'Task 4',
          instructions:
            'In this article about some traditional Christmas cakes called mince pies, some parts of sentences have been left out. Your task is to reconstruct the text by filling in the gaps (20-27) from the list (A-L) below. Remember that there are two extra phrases that you will not need. Write the letters in the white boxes next to the numbers as in the example (0).',
          passage: [
            { style: 'title', text: 'WORLD WAR 2 MINCE PIES FOUND UNDER HOTEL FLOORBOARDS' },
            {
              text: 'The little cakes, {{0}} from a mother to her sailor son, were discovered at the Loch Hotel in Douglas on the Isle of Man. They were found during the hotel\'s 1998 renovation {{20}}. The pies are now on display for the first time.',
            },
            {
              text: 'Probably air-tight conditions under the hotel floor helped conserve the cakes for almost 80 years. They were sent to sailor Phil Davis {{21}}, which was signed "love from mum".',
            },
            {
              text: 'Matthew Richardson, the museum\'s curator said {{22}} so the other soldiers couldn\'t find them. "If you\'re in a shared room with five or six other men that you don\'t know, the only way {{23}} is to find a place to hide it," he said.',
            },
            {
              text: 'The sweets were found when the hotel was developed into apartments. The letter found with the box says {{24}} on the island. It gives news of happenings at the sailor\'s home in Birmingham, including details of family and friends enjoying the Christmas holidays together {{25}}. It also reads: "We shall be glad to see you when you get some time off."',
            },
            {
              text: 'Mr Richardson said: "This box of mince pies shows that although wars are international events, they have an effect at a very human level. Here was a young man, possibly away from home for the first time in his life, training to go to a war zone. We can only imagine {{26}} as she posted this box to him."',
            },
            { text: '"We can\'t say for sure {{27}}. Perhaps he was unexpectedly sent to the front and didn\'t have time to take them."' },
          ],
          bank: [
            { key: 'A', text: 'and missing Phil very much' },
            { key: 'B', text: 'that the pies were possibly hidden under the floorboards' },
            { key: 'C', text: 'which were a wartime gift' },
            { key: 'D', text: 'to send back a thank-you note' },
            { key: 'E', text: 'and later given to the local museum' },
            { key: 'F', text: 'why sailor Davis never ate his mince pies' },
            { key: 'G', text: 'without a place to find them' },
            { key: 'H', text: 'what his mother was feeling' },
            { key: 'I', text: 'that sailor Davis was attending a radar training school' },
            { key: 'K', text: 'together with a letter' },
            { key: 'L', text: 'to protect what is yours' },
          ],
          unusedBankCount: 2,
          examples: choices(0, 'C'),
          items: choices(20, 'E|K K B L I A H F'),
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
            'You are going to read an article about new technology in art. Some words are missing from the text. Use the words in brackets to form the words that fit in the gaps (1-8). Then write the appropriate form of these words on the lines after the text. There might be cases when you do not have to change the word in brackets. Use only one word for each gap. There is an example (0) at the beginning.',
          passage: [
            { style: 'title', text: 'RAIN ART' },
            {
              text: 'Most people would laugh if you told them they could go for a nice walk in the {{0}} rain — without getting wet. But that idea has become reality, {{1}} to an amazing show which allows art {{2}} to walk in falling water without getting soaked to the skin.',
            },
            {
              text: 'The art installation, titled the Rain Room, uses a 3D camera system that creates a {{3}} designed path through the heavy rain, {{4}} on the movements of visitors.',
            },
            {
              text: 'Hannes Koch, the {{5}} of the Rain Room told CCTV News: “I think the initial idea didn\'t have much to do with rain; it had to do with how visitors {{6}} it would feel to be inside rain but to be {{7}} from it.”',
            },
            {
              text: 'The Rain Room {{8}} has attracted thousands of visitors to the Barbican Centre in London. A permanent version of the Rain Room has opened at the Yuz Museum in Shanghai.',
            },
          ],
          examples: words(0, [['pour', 'pouring']]),
          items: words(1, [
            ['thank', 'thanks'],
            ['love', 'lovers'],
            ['careful', 'carefully'],
            ['base', 'based'],
            ['design', 'designer'],
            ['image', 'imagine', 'imagined'],
            ['protect', 'protected'],
            ['exhibit', 'exhibition', 'exhibit'],
          ]),
        },
        {
          id: 'II-2',
          label: 'Task 2',
          instructions:
            'You are going to read an article about a new kind of family therapy. Some words are missing from the text. Choose the most appropriate answer from the options (A-D) for each gap (9-16) in the text. Write the letter of the appropriate answer in the white box. There is one example (0) at the beginning.',
          passage: [
            { style: 'title', text: 'YOUR KIDS CAN EAT FREE IF …' },
            {
              text: 'Parents who give up their phones {{0}} dinner will be rewarded with free meals for their kids at a British restaurant chain. In December, Frankie & Benny\'s is running its “no-phone” campaign as they {{9}} to see more families who pay attention to each other at the dinner table.',
            },
            {
              text: '“We looked at various ways we {{10}} encourage people to communicate with each other at the dinner table, and {{11}} that giving families the chance to put down their phones for a {{12}} of hours is a great opportunity to bring them closer to each other,” a Frankie and Benny\'s spokesperson explained.',
            },
            {
              text: 'Psychologist Susan Atkins agrees, saying: “By putting away screens parents {{13}} the message that their children are important to them … Parents are role models in everything that they do, so by talking to their kids {{14}} reading and typing messages they are teaching their kids when and where technology use is appropriate.”',
            },
            {
              text: 'If parents want to use the promotion, they {{15}} put their phones in a special box before the meal begins. After dinner, the phones will {{16}} to them, and their children\'s meals will be free of charge.',
            },
          ],
          examples: gapMcqs(0, [['while', 'under', 'during', 'through']], 'C'),
          items: gapMcqs(
            9,
            [
              ['are like', 'have liked', 'used to like', 'would like'],
              ['make', 'could', 'try', 'needed'],
              ['we\'ve found', 'we\'d find', 'we\'ve founded', 'we might find'],
              ['lots', 'several', 'couple', 'few'],
              ['would get', 'had left', 'have saved', 'are sending'],
              ['and', 'without', 'while', 'instead'],
              ['need', 'had to', 'must', 'may'],
              ['sent back', 'hand', 'be given up', 'be returned'],
            ],
            'D B A C D B C D',
          ),
        },
        {
          id: 'II-3',
          label: 'Task 3',
          instructions:
            'You are going to read an article about a lost wallet. Some words are missing from the text. Your task is to write the missing words on the dotted lines (17-25) after the text. Use only one word in each gap. There is an example (0) at the beginning.',
          passage: [
            { style: 'title', text: 'LOST WALLET RETURNED' },
            {
              text: 'Hunter Shamatt had just arrived in Las Vegas when he realized he had lost {{0}} wallet. It contained $60, a $400 paycheck, his bank card and his identification card. He was very upset, but he didn\'t want to make a big deal of it because it {{17}} his sister\'s wedding weekend. He thought he might have lost it on his Frontier flight from Omaha to Vegas, so he called the airline and reported {{18}} missing. No luck.',
            },
            {
              text: 'After the wedding, a package arrived {{19}} his home. It contained his wallet — completely intact — with a note {{20}} said: “Hunter, I found this on a Frontier flight from Omaha to Vegas – row 12, under seat F. Thought you might want it back. All the {{21}}, Todd.”',
            },
            { text: 'And below that: “P.S. I rounded your cash up to an even $100 so you could celebrate getting your wallet back. Have Fun!!!”' },
            {
              text: 'It took Hunter Shamatt a few minutes to believe {{22}} the note said. He wanted to thank the kind stranger, so he posted a picture {{23}} the note on Facebook with a message asking {{24}} help to find Todd. Within days, he was in contact with the man, identified in local media reports as Todd Brown of Omaha.',
            },
            { text: 'Shamatt wrote Brown a heartfelt thank-you:' },
            {
              text: '“Sir, what you\'ve done for me is unheard of. I {{25}} expected to see my wallet again, let alone with $40 more. Thank you so much, I\'ve got student loans and it makes all the difference.”',
            },
          ],
          examples: cloze(0, [['his']]),
          items: cloze(17, [
            ['was'],
            ['it'],
            ['at'],
            ['that', 'which'],
            ['best'],
            ['what', 'everything', 'anything'],
            ['of', 'showing'],
            ['for'],
            ['never', 'hadn\'t', 'hardly', 'scarcely', 'barely'],
          ]),
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
        storagePath: 'erettsegi-en-kozep-2021-majus.mp3',
        durationSec: 1795,
        // Task starts: the ~60 s reading pause of each task found by silence detection, minus the length of its announcement (approximate, ±10 s).
        taskMarkers: [
          { taskId: 'III-1', startSec: 124 },
          { taskId: 'III-2', startSec: 702 },
          { taskId: 'III-3', startSec: 1251 },
        ],
      },
      // útmutató p. 7: feladatpont 0–25 → vizsgapont
      conversion: [0, 1, 3, 4, 5, 7, 8, 9, 11, 12, 13, 15, 16, 17, 18, 20, 21, 22, 24, 25, 26, 28, 29, 30, 32, 33],
      transcripts: [
        {
          taskId: 'III-1',
          title: 'Monsieur Mangetout',
          paragraphs: [
            'You don\'t get the nickname Monsieur Mangetout, which means “Mr Eat Everything”, without earning it. Michel Lotito was born in Grenoble, France on 15th June 1950. He ate metal, plastic, rubber, glass and other materials throughout his lifetime, and over the course of 40 years, he ate about 9 tons of metal.',
            'In his youth, Lotito suffered from a mental illness in which people eat non-food items such as dirt and plastic. His family first became aware of his ability around the age of 9, when a glass from which he was drinking broke and he began chewing the broken bits. His parents were really frightened, but surprisingly nothing happened to him. Lotito\'s condition was first diagnosed a bit later when he started eating parts of the family television set. Doctors X-rayed his stomach and described his ability to consume 900g of metal per day as unique. But once he started experimenting with more dangerous items like nails, he learned that the incredibly thick wall of his stomach allowed him to eat almost anything. Soon, Lotito turned his condition into a career. By breaking up metal into small pieces and drinking mineral oil while eating, he perfected his technique. For years, the Frenchman ate about one kilo of metal every day. Lotito\'s most famous meal was a Cessna 150 airplane. Eating the plane took him two years, from 1978 to 1980. At the same time, however, he said that bananas and hard-boiled eggs made him sick. A few other incredible non-foods that Lotito consumed during his life include: 6 beds, 7 television sets, 18 bicycles and 15 shopping carts. He died in 2007 of natural causes that had nothing to do with his his eating habits.',
          ],
        },
        {
          taskId: 'III-2',
          title: 'What not to say to Hungarians',
          paragraphs: [
            'Despite the cliché, Hungarians are actually a pretty happy people… except if you say one of these things to them, so be careful …',
            'Mixing up the Hungarian and Italian flags',
            'Both have red, white and green stripes so it\'s easy to confuse, but one is horizontal (Hungary) and the other is vertical (Italy). Saying that Hungarians copied the Italians is not true and mixing them up is a big no-no.',
            'Bucharest instead of Budapest:',
            'If you\'ve accidentally said Hungary\'s capital was BuCHaRest to a Hungarian, you\'ve probably just made the biggest mistake of your life. Of course, they do sound awfully similar and, yes, they are located in the same part of the world, but we can assure you that these are two completely different cities.',
            'Do Hungarians play football?',
            'This is an understandable mistake because Hungarian football has been pretty much nonexistent internationally over the past decades, but Hungarians are extremely proud of their absolutely incredible football history. In fact, Hungary\'s national football team from the 1950s – known as the Golden Team – was the team playing against England in the match called “the game of the century.” It was in this match, in 1953, that Hungary beat England, in England, 6-3.',
            'Questioning how talented Hungarians are',
            'Hungarians love to talk about how many Hungarian inventions there are, how many famous Hungarians there are, how many Olympic medals the country has won (actually 476 medals) at the summer Olympic Games, making Hungary the 8th in the world on the all time medal list and also how many Nobel Prize winners are Hungarian (actually 12).',
            'The most beautiful women in the world are not Hungarian women',
            'What? Um, yes, they are! A sure way to anger a Hungarian is to argue with what many Hungarians consider to be a well-known, unquestionable fact.',
            'Hungarians never smile and they\'re always unhappy',
            'This is something that is a world-wide myth about Hungarians. But, believe me, Hungarians do smile! All you have to do is avoid all the points on this list so as not to make them angry, and you\'ll definitely find Hungarians are actually a pretty happy bunch…',
          ],
        },
        {
          taskId: 'III-3',
          title: 'Luxury yacht tester wanted',
          paragraphs: [
            'Do you want to get paid to live on yachts and test them? Then we have an exciting job opportunity for you!',
            'The website called HushHush.com, a company that sells products to millionaires, is looking to add a new employee to their staff. The company is hiring a “luxury yacht tester”. “We are looking to hire someone whose job is nothing else but to test the quality of yachts and check that they meet our high standards," said Aaron Harpin, the founder of the company.',
            'You\'ll spend one week on a yacht and then write a detailed report of everything you find. You\'ll live, sleep, eat, and shower on a luxury yacht testing anything and everything on the boat, including every bed, door, shower or any electrical equipment – you name it –, everything to make sure that the yacht is up to their standards. All you need to qualify for this position is to be at least 21 years old and own a passport. It\'s also quite important that you should have an extremely flexible timetable as the company might be sending you all over the world to test the next ship at any time. The job advertisement says you\'ll also need to be reliable, hard-working, and have an eye for detail. While you don\'t need any experience with luxury yachts, it will certainly help you get the job.',
            'The lucky applicant will receive $1,300 on completion of the week\'s stay on a yacht and the report being received. The hired employee could potentially be testing up to 50 yachts every year, which means they could earn up to $65,000 a year for their work. Sounds like a pretty good deal to me…',
            'Do you think you\'re a good fit? Apply on HushHush\'s website now, using the form below. All you need to do is give your name, email address and a list of your skills.',
          ],
        },
      ],
      tasks: [
        {
          id: 'III-1',
          label: 'TASK 1',
          instructions:
            'In this section you will hear about a man who had very strange eating habits. Your task will be to circle the letter(s) of the correct answer(s) in the boxes on the right. Please note that in this task both answers may be correct. However, there is always at least one correct answer. That means you might have to circle one or two letters. First, you will have some time to look at the task, and then we will play the whole recording in one piece. Then you will hear the recording again, but this time we will play the text in shorter sections to give you enough time to write down your answers.',
          examples: [
            {
              id: '0',
              type: 'mcq',
              stem: 'Michel Lotito\'s nickname is …',
              options: [{ key: 'A', text: 'Mr Eat Everything.' }, { key: 'B', text: 'Monsieur Mangetout.' }, bothAB],
              answer: 'AB',
            },
          ],
          items: questions(
            1,
            [
              { stem: 'Michel Lotito was born in ...', options: ['Switzerland.', '1950.'] },
              { stem: 'When he was young, Lotito …', options: ['had a mental illness.', 'was always complaining about stomach pains.'] },
              { stem: 'His family discovered his ability when …', options: ['he was about 9 years old.', 'a glass he was drinking from broke.'] },
              { stem: 'His illness was diagnosed by doctors when he started eating …', options: ['parts of a TV set.', 'nails.'] },
              { stem: 'He was able to eat such things because …', options: ['his teeth were extremely strong.', 'the wall of his stomach was very thick.'] },
              { stem: 'Mr Lotito improved his technique by …', options: ['breaking up the metal objects before he ate them.', 'drinking oil while eating them.'] },
              { stem: 'Mr Lotito ate ...', options: ['around one kilo of metal every day for years.', 'a whole airplane in two years.'] },
              { stem: 'During his lifetime, Mr Lotito also …', options: ['enjoyed eating bananas and hard-boiled eggs.', 'ate several beds and bicycles.'] },
              { stem: 'Mr Lotito died …', options: ['in 2007.', 'because of his crazy eating habits.'] },
            ],
            'B A AB A B AB AB B A',
          ).map((item) => ({ ...item, options: [...(item.options ?? []), bothAB] })),
        },
        {
          id: 'III-2',
          label: 'TASK 2',
          instructions:
            'In this section you will hear a list of things that Hungarians are particularly sensitive about according to foreigners. Your task will be to decide whether the following statements are true, false or we do not know because the text does not say, and write the appropriate letter in the boxes on the right. Write A if the statement is true, write B if the statement is false, and write C if the text does not say. First, you will have some time to look at the task, and then we will play the whole recording in one piece. Then you will hear the recording again, but this time we will play the text in shorter sections to give you enough time to write down your answers. A = TRUE B = FALSE C = THE TEXT DOES NOT SAY',
          options: TFN,
          examples: [{ id: '0', type: 'mcq', stem: 'There are certain things that Hungarians don\'t like to hear.', answer: 'A' }],
          items: tfn(
            10,
            [
              'The Italian flag actually served as a model for the Hungarian flag.',
              'There is more than one reason why foreigners tend to mix up Budapest and Bucharest.',
              'Hungarians have every reason to be proud of their football of the past few decades.',
              'Hungary is the 8th most successful nation of all at the summer Olympic Games.',
              'According to international surveys, Hungarian men are considered to be the most handsome men in the world.',
              'Hungarians tend to get angry more easily than people in a lot of other countries.',
              'All foreigners have to do to make Hungarians smile is to avoid hurting their feelings.',
            ],
            'B A B A C C A',
          ),
        },
        {
          id: 'III-3',
          label: 'TASK 3',
          instructions:
            'In this section, you will hear an advertisement for a job you might be interested in. Your task will be to write one word or number in each of the gaps below using the exact words you hear in the recording. First, you will have some time to look at the task, and then we will play the whole recording in one piece. Then you will hear the recording again, but this time we will play the text in shorter sections to give you enough time to write down your answers.',
          examples: [shortAnswer('0', 'People who get the job will be paid for living on and ________ ________ .', 'testing yachts', [['test'], ['yacht']])],
          items: [
            shortAnswer('17', 'The HushHush.com website sells ________ to ________ .', 'products; millionaires', [['product'], ['millionaire']]),
            shortAnswer('18', 'The new employee\'s job is to test the quality of yachts and check that they meet the company\'s ________ ________ .', 'high standards', [['high'], ['standard']]),
            shortAnswer(
              '19',
              'Successful applicants will have to spend a week on the yacht, and then ________ a detailed ________ of everything they find.',
              'write; report',
              [['write'], ['report']],
            ),
            shortAnswer(
              '20',
              'Besides beds, doors and showers, the successful applicant will also have to test any ________ ________ and everything else on the yacht.',
              'electrical equipment',
              [['electric'], ['equipment']],
            ),
            shortAnswer(
              '21',
              'To have a chance to get the job, you must be at least ________ years old, and you must own a ________ .',
              '21/twenty-one; passport',
              [['21', 'twenty'], ['passport']],
            ),
            shortAnswer(
              '22',
              'It is very important that the applicant should have an extremely ________ ________ , as the company might send the tester to a new ship at any time.',
              'flexible timetable',
              [['flexible'], ['timetable']],
            ),
            shortAnswer(
              '23',
              'Ideal applicants should be ________ and ________ besides having an eye for detail.',
              'reliable; hard-working',
              [['reliable'], ['hard']],
            ),
            shortAnswer(
              '24',
              'The company might send the testers to visit ________ yachts every year, so they could earn up to $________ a year.',
              '50/fifty; 65,000/sixty-five thousand',
              [['50', 'fifty'], ['65', 'sixty']],
            ),
            shortAnswer(
              '25',
              'In addition to your name and a list of your skills, you need to give your ________ ________ in the form.',
              'email address',
              [['email', 'e-mail'], ['address']],
            ),
          ],
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
            'You are looking for volunteer work for the summer and you have come across the website angloville.com, which offers various summer jobs for secondary school students in England.',
          passage: [
            { text: 'Are you looking for a fun and meaningful way to spend the summer? Do you speak English well? Are you interested in working with children?' },
            {
              text: 'Angloville organizes camps for children between 10 and 14 from around the world and we are looking for camp counsellors. Join our team and work for us!',
            },
            { style: 'heading', text: 'What is provided:' },
            { style: 'bullet', text: 'Free accommodation' },
            { style: 'bullet', text: 'Full board during your stay' },
            { style: 'bullet', text: 'An opportunity to connect with people from 10+ countries' },
            { text: 'Interested? Send an email to Richard at summercamp@angloville.com.' },
          ],
          items: [
            {
              id: '1',
              type: 'production',
              prompt: ['Write an email of 80-100 words in which you introduce yourself and apply for the job. In your email:'],
              contentPoints: [
                'say who you are and why you are interested in the job,',
                'say why you think you are suitable,',
                'ask about the specific tasks that you would have to do.',
              ],
              promptAfter: ['Begin your email like this:'],
              minWords: 80,
              maxWords: 100,
              opening: 'Dear Richard,',
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
          instructions: 'You have received the following email from your Dutch friend, Max:',
          passage: [
            {
              text: 'Last night when I was going home from a party, a guy about the same age as me approached me and asked me if he could use my phone as his had just died. I hesitated, but not for long, I\'m a trusting person, so sure he could use my phone. He phoned his dad telling him he was on his way home and asking him if he needed anything from the kebab takeout round the corner. After he had finished, he hung up and passed the phone to me. Or, at least, he tried to but my phone slipped from his fingers and landed with a crack on the pavement. The screen of my Huawei Honor 5X splintered into a cobweb that covered the bottom half of the screen. I was shocked! But before I could open my mouth, he mumbled an apology and disappeared into the dark night. What would you have done in my place? Or, more importantly, what should I do now? His dad\'s number is saved in my call history. Do you think it\'s a good idea to phone him? And ask for his son\'s name and number? Or compensation for my phone? I really don\'t know what to do, pls help!',
            },
            { text: 'Max' },
          ],
          items: [
            {
              id: '2',
              type: 'production',
              prompt: ['Write an email of 100-120 words to Max in which you tell him'],
              contentPoints: [
                'if you think it is OK to ask for someone else\'s phone,',
                'if you think Max did the right thing lending his phone to a stranger,',
                'whether contacting the boy\'s father is a good idea,',
                'if there is anything else he could/should do now.',
              ],
              promptAfter: ['Begin like this:'],
              minWords: 100,
              maxWords: 120,
              opening: 'Hi Max,',
              register: 'informal-message',
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
