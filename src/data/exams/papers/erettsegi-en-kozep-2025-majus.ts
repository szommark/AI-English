// Angol nyelv, középszintű írásbeli érettségi, 2025. május 8. (K2512), Oktatási Hivatal.
// Transcribed verbatim from the feladatlap and its javítási-értékelési útmutató (answer key,
// conversion tables, listening transcripts). Decorative photos are left out.
import type { ExamPaper } from '../types'
import { choices, cloze, enListeningIntro, EN_NOTICES_HU, gapMcqs, heard, questions, TFN, tfn, words } from './enKozep.ts'

const bothAB = { key: 'AB', text: 'Both A and B' }

const paper: ExamPaper = {
  id: 'erettsegi-en-kozep-2025-majus',
  type: 'erettsegi',
  language: 'en',
  level: 'kozep',
  sittingLabelHu: '2025. május',
  source: 'Oktatási Hivatal: Angol nyelv, középszintű írásbeli vizsga, 2025. május 8. (K2512) — feladatlap és javítási-értékelési útmutató.',
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
            'Read the following answers from the website of a driving school. The questions have been removed. Your task is to write the letters of the questions (A-M) next to the appropriate numbers (1-8). There are three extra questions that you do not need. Write the letters in the white boxes as in the example (0).',
          passage: [
            { text: 'Here are answers to common questions we get.' },
            { text: '{{0}} Yes, you must be at least 17 years old to start learning to drive a car.' },
            { text: '{{1}} On average, one needs between 20 and 40 hours of professional instruction to become test ready, but every learner is different. Some may need more, while others may need fewer lessons.' },
            { text: '{{2}} It is possible but it depends on your instructor. Certain driving instructors only teach in their own cars, which are fitted with dual controls: a set of extra pedals on the passenger\'s side, allowing the instructor to assist in emergencies.' },
            { text: '{{3}} Driving lessons during the daytime are the best choice because more instructors are available and there\'s better visibility than in the evenings.' },
            { text: '{{4}} Yes, as long as the requested location is within our working area, and provided this is arranged with your instructor well before your lesson.' },
            { text: '{{5}} It\'s recommended to take at least one or two lessons per week to maintain progress and remember information.' },
            { text: '{{6}} Certainly. You can view our instructors\' profiles on our website including a short bio about them and a picture of the car you\'ll learn to drive in.' },
            { text: '{{7}} Take note of the examiner\'s feedback and discuss it with your instructor. Focus on practising the areas where you need to improve before retaking the test.' },
            { text: '{{8}} They are signs that must be displayed on the front and back of a vehicle when a learner driver is behind the wheel. They indicate that the driver is still learning.' },
          ],
          bankTitle: 'QUESTIONS',
          bank: [
            { key: 'A', text: 'What if I need to cancel my lesson?' },
            { key: 'B', text: 'What should I do if I fail my driving test?' },
            { key: 'C', text: 'Are there any age restrictions for learning to drive?' },
            { key: 'D', text: 'What\'s the best time of day to take my lessons?' },
            { key: 'E', text: 'Can I change my driving test appointment?' },
            { key: 'F', text: 'How many lessons will it take for me to learn to drive?' },
            { key: 'G', text: 'Can I be picked up and dropped off anywhere?' },
            { key: 'H', text: 'Can I learn to drive in my own car?' },
            { key: 'I', text: 'How can I book a driving test?' },
            { key: 'K', text: 'What are L-plates?' },
            { key: 'L', text: 'Can I choose my instructor?' },
            { key: 'M', text: 'How often should I take driving lessons?' },
          ],
          unusedBankCount: 3,
          examples: choices(0, 'C'),
          items: choices(1, 'F H D G M L B K'),
        },
        {
          id: 'I-2',
          label: 'Task 2',
          instructions:
            'Read this article about feeding pets at Christmas. Some parts of sentences have been left out from the text. Your task is to reconstruct the text by filling in the gaps (9-16) from the list (A-L) below. Write the letters in the white boxes next to the numbers as in the example (0). Remember that there are two extra letters that you do not need.',
          passage: [
            {
              text: 'Many popular foods that people eat at Christmas are unsafe for dogs and shouldn\'t {{0}}. Cats and dogs have different digestive systems to us humans. Things we can digest, they might struggle to, so we need to be careful to {{9}}. So, what should be avoided and how can you make the holiday season special for your pets?',
            },
            {
              text: 'Chocolate contains theobromine, which is toxic to cats and dogs and causes stomach pain, vomiting, or heart problems. Dark chocolate {{10}} and is regarded as more toxic. Chocolate also contains caffeine, which causes pets to become restless and {{11}}.',
            },
            {
              text: 'Mince pies might be one of the most common festive treats, but they contain raisins, which are highly toxic to dogs. Your dog may develop severe symptoms soon after eating them. It\'s not known what effect they have on cats, but vets {{12}}.',
            },
            { text: 'Raw garlic and onions can {{13}} if they eat them in large quantities. Best to keep these on your plate so you don\'t cause any upset tummies.' },
            {
              text: 'If you\'re having turkey or chicken for dinner this Christmas, chances are there\'ll be some bones around. Don\'t give these to your pets though! Cooked bones aren\'t suitable for your cat or dog as they can {{14}}, which might cause damage to their insides.',
            },
            {
              text: 'Experts suggest that rather than always looking for foodie treats, you should {{15}}. They recommend a nice new toy or a lovely long walk. If you want to have some surprises, just {{16}} in leftover boxes and let them sniff them out!',
            },
          ],
          bank: [
            { key: 'A', text: 'contains higher doses' },
            { key: 'B', text: 'advise keeping these out of their reach' },
            { key: 'C', text: 'be fed to them' },
            { key: 'D', text: 'be given any alcohol' },
            { key: 'E', text: 'hide your dog\'s usual biscuits' },
            { key: 'F', text: 'be taken to the vet immediately' },
            { key: 'G', text: 'break into sharp pieces' },
            { key: 'H', text: 'get your dog an active present' },
            { key: 'I', text: 'have difficulty breathing' },
            { key: 'K', text: 'cause stomach problems for your pets' },
            { key: 'L', text: 'avoid giving them certain things' },
          ],
          unusedBankCount: 2,
          examples: choices(0, 'C'),
          items: choices(9, 'L A I B K G H E'),
        },
        {
          id: 'I-3',
          label: 'Task 3',
          instructions:
            'In the following text about challenges you may have when starting university, the first sentence of each paragraph has been removed. Your task is to match the sentences to the paragraphs. Write the letters of the sentences (A-K) next to the appropriate numbers (17-23). There are two extra sentences that you do not need. Write the letters in the white boxes as in the example (0).',
          passage: [
            { text: '{{0}} It\'s scary being away from home in a new place with people you don\'t know well yet. Or maybe your course is super challenging. These tips can help you look after your mental health.' },
            { text: '{{17}} It\'s important not to struggle in silence. Opening up can be difficult but remember you\'re not alone. Schedule regular chats with family or friends back home.' },
            { text: '{{18}} Most universities have helplines and counselling services. Search on the website to find out what is available at your university.' },
            { text: '{{19}} Even if you don\'t need a doctor right now, it\'s a good idea to contact one so you can get help when you need it.' },
            { text: '{{20}} This is especially important when everything is changing. Try to sleep enough, eat a balanced diet, and exercise when you can. These small things make a big difference to your mental health.' },
            { text: '{{21}} Take breaks away from your desk, when you do something fun. Uni is about enjoying yourself as well as studying.' },
            { text: '{{22}} If writing is your thing, keeping a diary will be helpful to track how you\'re feeling.' },
            { text: '{{23}} It\'s normal to find it hard to socialize at first but keep trying. Try setting up fun activities with your housemates like game nights or watching a show together. You could also join a society to meet people.' },
          ],
          bank: [
            { key: 'A', text: 'Create a budget.' },
            { key: 'B', text: 'Register at the nearest surgery.' },
            { key: 'C', text: 'When you\'re starting uni, looking after yourself can be tough.' },
            { key: 'D', text: 'Stick to a basic routine.' },
            { key: 'E', text: 'Find a balance between study and life.' },
            { key: 'F', text: 'Try to make new friends.' },
            { key: 'G', text: 'Plan activities that don\'t involve spending money.' },
            { key: 'H', text: 'Reflect on your emotions.' },
            { key: 'I', text: 'Find out what support your uni offers.' },
            { key: 'K', text: 'Talk to someone you know well and trust.' },
          ],
          unusedBankCount: 2,
          examples: choices(0, 'C'),
          items: choices(17, 'K I B D E H F'),
        },
        {
          id: 'I-4',
          label: 'Task 4',
          instructions:
            'Read this article about a Guinness world record and then read the statements (24-30) following it. Mark a statement A if it is true according to the article, mark it B if it is false, and mark it C if there isn\'t enough information in the text to decide if it is true or not. Write the letters in the white boxes next to the numbers as in the example (0). A = TRUE B = FALSE C = THE TEXT DOES NOT SAY',
          passage: [
            {
              text: 'When Marjorie Fiterman and Bernie Littman met in their 90s, they had already lived long, full lives and neither of them thought they\'d fall in love or end up married again. But last May, the two became the world\'s oldest married couple, with a combined age of over 202 years.',
            },
            {
              text: 'Ms. Fiterman is 102 years old, and Mr. Littman is 100. He was an engineer, and she was a teacher. Each of them had spent more than 60 years in their first marriages, but after their partners died, they both moved to the same retirement home in Philadelphia. They met at a costume party and quickly became friends because they had several things in common. They both liked acting in plays at the retirement home, enjoyed sharing meals together and they\'d both attended the University of Pennsylvania at the same time, though they didn\'t meet each other then.',
            },
            {
              text: 'Mr. Littman will always have an easy way to remember when they had their first date – it was the same day that one of his great-granddaughters was born. His family was happy that he\'d found someone he fell in love with. Although the couple dated for nine years, the family never thought that the two might want to get married.',
            },
            {
              text: 'The wedding ceremony took place at the retirement home where they live. Three generations of Mr. Littman\'s family were there with the couple: his children, grandchildren and great-grandchildren. On the day they got married, the couple\'s ages added up to 202 years and 271 days. That broke the Guinness world record for the oldest couple to get married.',
            },
            { text: 'They say their secret is that they keep each other young.' },
          ],
          options: TFN,
          examples: [{ id: '0', type: 'mcq', stem: 'Mr. Littman\'s first marriage ended with a divorce.', answer: 'B' }],
          items: tfn(
            24,
            [
              'Ms. Fiterman and Mr. Littman had lived in different states before they moved to the retirement home in Philadelphia.',
              'Ms. Fiterman and Mr. Littman remembered being in touch during their university years.',
              'The couple had their first date outside the retirement home.',
              'Mr. Littman\'s family were pleased to find out about the old man\'s relationship.',
              'Mr. Littman\'s decision to get married surprised his family.',
              'Mr. Littman had more children than Ms. Fiterman.',
              'The couple were awarded the Guinness world record because Mr. Littman was the oldest man ever to get married.',
            ],
            'C B C A A C B',
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
            'You are going to read an article about some traditions of celebrating the New Year in different parts of the world. Some words are missing from the text. Use the words in brackets to form the words that fit in the gaps (1-9). Then write the appropriate form of these words on the dotted lines after the text. There might be cases when you do not have to change the word in brackets. Use only one word for each gap. There is an example (0) at the beginning.',
          passage: [
            { style: 'title', text: 'NEW YEAR\'S EVE TRADITIONS' },
            {
              text: 'To end things on a {{0}} absurd (and rather unsafe) note, we have Johannesburg, South Africa, where locals celebrate the new year by {{1}} old household items (furniture, gadgets, glass etc.) out the window. As you\'d expect, this tradition results in several serious {{2}} each year, but the local government is working to ensure that New Year\'s Eve celebrations are safe – even if the age-old {{3}}, ‘Watch out below!’ still echoes through the streets.',
            },
            {
              text: 'The following tradition is for {{4}} of travelling. Many Latin Americans head to the streets with their suitcases in hand as soon as the new year begins. According to this tradition, those who take their suitcases for a walk at midnight will be {{5}} with trips, vacations, and adventures in the coming 12 months. Some people believe that the longer the walk, the {{6}} they\'ll travel.',
            },
            {
              text: 'For some people in Siberia, a {{7}} New-Year\'s-Eve party isn\'t enough; they need the thrill and chill. To celebrate the {{8}} of a new year, some people participate in the annual ‘jump into a {{9}} lake and plant a Christmas tree at the bottom’ tradition. The divers then pass the champagne and dance around the tree before coming back up to the surface.',
            },
          ],
          examples: words(0, [['slight', 'slightly']]),
          items: words(1, [
            ['throw', 'throwing'],
            ['injure', 'injuries'],
            ['warn', 'warning'],
            ['love', 'lovers'],
            ['reward', 'rewarded'],
            ['far', 'farther', 'further'],
            ['type', 'typical'],
            ['begin', 'beginning'],
            ['freeze', 'frozen', 'freezing'],
          ]),
        },
        {
          id: 'II-2',
          label: 'Task 2',
          instructions:
            'You are going to read an article about what some scientists consider to be the best way to take notes. Some words are missing from the text. Choose the most appropriate answer from the options (A-D) for each gap (10-16) in the text. Write the letter of the appropriate answer in the white box. There is an example (0) at the beginning.',
          passage: [
            { style: 'title', text: 'HOW TO TAKE NOTES' },
            {
              text: 'These days {{0}} people can type faster than they can write by hand, particularly {{10}} they\'ve grown up using laptops. This is an extremely useful skill and allows you to take notes quickly and easily, {{11}} must certainly be a good thing.',
            },
            {
              text: 'Maybe not. In an experiment, university students were given TED talks to watch and were told to take notes. Half were given laptops and half took notes with a pen and paper. The students using a keyboard were more likely to type the lecturers\' words word by word, while the students writing more slowly by hand had no {{12}} to concentrate on the information to allow them to summarise.',
            },
            {
              text: 'Afterwards, the students were tested on the content of the lecture. When it came to remembering facts, it didn\'t matter which method of note-taking they used, but when {{13}} asked to explain the concepts covered in the lecture, the students who took notes by hand did better.',
            },
            {
              text: 'When the students {{14}} allowed to revise from their notes before being tested a week later, the pen-and-paper group still did better. The reason {{15}} when using a pen and paper, you process the information more deeply {{16}} you can\'t possibly write it all down. So it helps you to both understand it and remember it later on.',
            },
          ],
          examples: gapMcqs(0, [['plenty', 'lot of', 'many', 'few']], 'C'),
          items: gapMcqs(
            10,
            [
              ['that', 'if', 'then', 'how'],
              ['which', 'it', 'what', 'that'],
              ['more chance', 'difficulty in', 'possibility', 'choice but'],
              ['it was', 'the teacher', '-', 'all of them'],
              ['had', 'were', 'would be', 'have been'],
              ['why is', 'for that', 'is that', 'for which'],
              ['while', 'because', 'however,', 'in case'],
            ],
            'B A D C B C B',
          ),
        },
        {
          id: 'II-3',
          label: 'Task 3',
          instructions:
            'You are going to read an article about a refreshing way of commuting to work. Some words are missing from the text. Your task is to write the missing words on the dotted lines (17-25) after the text. Use only one word in each gap. There is an example (0) at the beginning.',
          passage: [
            { style: 'title', text: 'SUMMER RIVER COMMUTING IN SWITZERLAND' },
            {
              text: 'During the hot summer months in at {{0}} two Swiss cities – Basel and Bern – workers commute to or from their jobs via river. And no, not in a boat. Depending {{17}} where you live and where you work along the river, you can choose to either go to work with the flow {{18}} go home with the flow.',
            },
            {
              text: 'The commuters have foldable dry bags – often shaped {{19}} a fish – into which they put their clothes and even work items, and where they keep their towels and swimsuits {{20}} the day. They change into their swimming gear at an easy entrance zone, jump into the river, and swim {{21}} their bag floating behind them to the most convenient exit point for their final destination. There are small cabins set up as dressing rooms and a {{22}} showers and toilets along the route.',
            },
            {
              text: 'While {{23}} usually looks peaceful, the Rhein is a large, powerful river, so you {{24}} feel comfortable in the water before giving it a go. As {{25}} as you\'re a competent swimmer, you should feel safe.',
            },
          ],
          examples: cloze(0, [['least']]),
          items: cloze(17, [
            ['on'],
            ['or'],
            ['like'],
            ['during', 'for', 'over', 'through', 'throughout'],
            ['with'],
            ['few', 'dozen'],
            ['it'],
            ['must', 'should'],
            ['long', 'soon'],
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
        storagePath: 'erettsegi-en-kozep-2025-majus.mp3',
        durationSec: 1799,
        // Task starts: the ~60 s reading pause of each task found by silence detection, minus the length of its announcement (approximate, ±10 s).
        taskMarkers: [
          { taskId: 'III-1', startSec: 111 },
          { taskId: 'III-2', startSec: 588 },
          { taskId: 'III-3', startSec: 1105 },
        ],
      },
      // útmutató p. 7: feladatpont 0–25 → vizsgapont
      conversion: [0, 1, 3, 4, 5, 7, 8, 9, 11, 12, 13, 15, 16, 17, 18, 20, 21, 22, 24, 25, 26, 28, 29, 30, 32, 33],
      transcripts: [
        {
          taskId: 'III-1',
          title: 'The retiree-greeter',
          paragraphs: [
            '67-year old Charles was a retired soldier. He was also a new employee at the local supermarket, a so-called retiree-greeter, whose job was to wait at the front door of the store and greet all shoppers who entered. He really enjoyed his new job, but there was one big problem: he had to get up extremely early in the morning, at 5 o\'clock, because his day shift started at 6:30, and he just couldn\'t seem to get to work on time. Every day he was 5, 10, 15 minutes late.',
            'But in many important respects, Charles was an outstandingly good worker, really kind and tidy, intelligent, good-looking and obviously demonstrating the store\'s customer friendly policies. One day, when he was late again, the boss decided to call him into his office for a talk.',
            '"Charles, I like your work ethic and professionalism, you really do a great job when you finally get here, but your being late so often is quite annoying and irritating."',
            '"Yes sir, I know, and I am working on it."',
            '"Well, good, you are a team player. That\'s what I like to hear.”',
            '“Yes sir, I understand your concern, and I\'ll try harder.”',
            'A bit surprised, the manager went on to comment,',
            '“It\'s odd though, you coming in late. I know you\'re retired from the Armed Forces. What did they say to you there if you showed up in the morning so late and so often?"',
            'The old man looked down at the floor, chuckled, and said with a polite smile on his face,',
            '"Well, quite honestly, they usually just saluted and said: ‘Good morning General, can I get your coffee, sir?’"',
          ],
        },
        {
          taskId: 'III-2',
          title: 'The Porsche',
          paragraphs: [
            'A 17-year-old boy, who worked part-time at a fast food restaurant, drove up to park in front of the house in a beautiful Porsche.',
            'Naturally, his parents knew that there was no way he earned enough with his after-school job to buy such a car.',
            '“Where did you get that car?” his mom and dad screamed in shock.',
            '“I bought it today,” replied the teen calmly.',
            '“With what money young man?” his mom demanded. “We know how much a Porsche costs and you cannot afford it!”',
            '“Well, it\'s used and I got a good deal,” said the boy, “This one cost me 20 dollars.”',
            '“Who on earth would sell a car like that for 20 dollars?!”',
            '“The woman up the street,” the boy replied. “I don\'t know her name – she\'s just moved in. She ordered a pizza and when I delivered it to her, she asked me if I wanted to buy a Porsche for 20 dollars.”',
            'The boy\'s dad and mom hurried over to their new neighbor\'s house, ready to demand an explanation. Curiously, their new neighbor was calmly planting flowers in her front yard.',
            '“I\'m the father of the kid you just sold a sports car to for $20,” the dad said. “I simply don\'t understand how that is possible!”',
            '“Well,” the woman said, not looking up from her garden. “This morning I got a phone call from my husband. I thought he was on a business trip in Florida, but he has run off to Hawaii with his secretary and doesn\'t intend to come back.”',
            '“What on earth does that have to do with selling our son a Porsche for $20?”, the boy\'s mom asked, completely confused.',
            'The new neighbor paused for a minute and then, with a big smile on her face, she said: “Well, my husband asked me to sell his new Porsche and send him the money. So I did.”',
          ],
        },
        {
          taskId: 'III-3',
          title: 'Mr Jones and his old student',
          paragraphs: [
            'A young man meets an elderly man on the underground and he goes up to him:',
            '“Do you remember me, Mr Jones?”',
            '“Sorry, young man, but I don\'t.”',
            '“Well, my name is Redgrave, Peter Redgrave, and I was a student of yours exactly 20 years ago.”',
            '“Really? I\'m sorry Peter, but I\'m sure you know how it is. I\'ve had thousands of students and you were my student such a long time ago. But tell me: What do you do, what do you do in life?”',
            '“Well, I became a teacher.”',
            '“Ah, how good, like me?”',
            '“Well, yes. In fact, I became a teacher because you inspired me to be like you. ”',
            '“Oh, how interesting! And at what time did you decide to become a teacher?”',
            '“It\'s a long story, you know. Actually, it all happened back then when I was your student.”',
            '“Really? And what\'s the story?”',
            '“Well, one day a friend of mine, also a student, came to school with a nice new watch, and I decided I wanted it, so … well, I stole it, I took it out of his pocket. And shortly after, my friend noticed that his watch was missing and immediately complained to our teacher, who happened to be you. And then you addressed the class saying, ‘This student\'s watch was stolen during classes today. Whoever stole it, please return it.’ But I kept quiet and didn\'t give it back because I didn\'t want to.”',
            '“What happened then?”',
            '“You closed the door and told us all to stand up and form a circle. You told us you were going to search our pockets one by one until the watch was found. However, you told us to close our eyes, because you would only look for the guy\'s watch if we all had our eyes closed. Then you went from pocket to pocket, and when you went through my pockets, you found the watch and took it. You kept searching everyone\'s pockets, and when you were done you said ‘you can open your eyes now. We have the watch.’”',
            '“And what did I do then?”',
            '“Well, you didn\'t tell on me and you never mentioned the episode. You never said who stole the watch either. That day you saved my dignity forever. It was the most shameful day of my life. But it was also the day I decided not to become a thief, a bad person. But I received your message clearly. Do you remember this episode, Mr Jones?”',
            '“Yes, I do remember the situation with the stolen watch which I was looking for in everyone\'s pocket. But I didn\'t remember you, because I also closed my eyes while looking.”',
            '“Well, Mr. Jones, now you know why I decided to become a teacher later. You were a lifesaver and I can\'t thank you enough for your kindness and understanding.”',
          ],
        },
      ],
      tasks: [
        {
          id: 'III-1',
          label: 'TASK 1',
          instructions:
            'In this section you will hear a funny story about an elderly man who was the employee of a supermarket. Your task is to complete the sentences with one word in each gap, using the exact words you hear in the recording. First, you will have some time to study the task, and then we will play the whole recording in one piece. Then, you will hear the recording again, but this time we will play the text in shorter sections to give you enough time to write down your answers.',
          examples: heard(0, [['Before his retirement, Charles served as a ________ .', 'soldier']]),
          items: heard(1, [
            ['Charles\'s job at the supermarket was to stand at the front door and ________ the shoppers who went into the store.', 'greet'],
            ['His day shift started at 6:30, so he had to get up ________ early in the morning.', 'extremely'],
            ['Charles was at least 5 minutes ________ for work every day.', 'late'],
            ['Charles was an outstandingly good worker in many other ________ respects.', 'important'],
            ['With his kindness, tidiness and intelligence, Charles clearly demonstrated the store\'s ________ friendly policies.', 'customer'],
            ['His boss told Charles that he liked his ________ ethic and professionalism a lot.', 'work'],
            ['Charles told his boss that he understood his worries, and promised to try ________ .', 'harder'],
            ['His boss asked Charles what they had said back in the Armed ________ when he didn\'t arrive for service on time.', 'Forces', 'forces'],
            ['He said that they had just saluted and asked if he wanted a cup of coffee, because he was a(n) ________ in the army.', 'general', 'General'],
          ]),
        },
        {
          id: 'III-2',
          label: 'TASK 2',
          instructions:
            'In this section you will hear a funny story about a young man who bought a Porsche. Your task will be to circle the letter(s) of the correct answer(s) in the boxes on the right. Please note that in this task both answers may be correct. However, there is always at least one correct answer. This means you might have to circle one or two letters. First, you will have some time to study the task, and then we will play the whole recording in one piece. Then, you will hear the recording again, but this time we will play the text in shorter sections to give you enough time to write down your answers.',
          examples: [
            {
              id: '0',
              type: 'mcq',
              stem: 'The boy in this story …',
              options: [{ key: 'A', text: 'was 17 years old.' }, { key: 'B', text: 'worked at a restaurant.' }, bothAB],
              answer: 'AB',
            },
          ],
          items: questions(
            10,
            [
              { stem: 'The boy …', options: ['parked a Porsche in front of his home.', 'had always wanted to buy such a car.'] },
              { stem: 'His parents …', options: ['were very happy to see the Porsche.', 'asked him where he got the car.'] },
              { stem: 'The boy\'s parents knew very well …', options: ['how expensive such a car was.', 'he didn\'t have enough money to buy a Porsche.'] },
              { stem: 'The boy explained to his parents that the car was …', options: ['more than 20 years old.', 'actually very cheap.'] },
              { stem: 'He told them that he got the offer to buy the car …', options: ['from a woman who lived nearby.', 'when he was delivering a pizza.'] },
              { stem: 'The boy\'s parents wanted an explanation, so they …', options: ['phoned the woman.', 'went over to the woman\'s house.'] },
              { stem: 'Their new neighbour told them that her husband was …', options: ['from Florida.', 'away in Hawaii.'] },
              { stem: 'The woman told them that her husband wanted her to …', options: ['sell the car.', 'charge $20 for the car.'] },
            ],
            'A B AB B AB B B A',
          ).map((item) => ({ ...item, options: [...(item.options ?? []), bothAB] })),
        },
        {
          id: 'III-3',
          label: 'TASK 3',
          instructions:
            'In this section you will hear a conversation between two men. Your task will be to decide whether the following statements are true, false or we do not know because the text does not say, and write the appropriate letter in the boxes on the right. Write A if the statement is true, write B if the statement is false, and write C if the text does not say. First, you will have some time to study the task, and then we will play the whole recording in one piece. Then, you will hear the recording again, but this time we will play the text in shorter sections to give you enough time to write down your answers. A = TRUE B = FALSE C = THE TEXT DOES NOT SAY',
          options: TFN,
          examples: [{ id: '0', type: 'mcq', stem: 'Mr Jones is a pensioner.', answer: 'C' }],
          items: tfn(
            18,
            [
              'After a few moments Mr Jones recognised his old student.',
              'Peter decided to become a teacher because he wanted to be like Mr Jones.',
              'Peter stole the watch from his friend\'s bag.',
              'The watch Peter stole from his friend was extremely expensive.',
              'Mr Jones asked the students to stand up and form a circle.',
              'Mr Jones searched the pockets of all the students, but he couldn\'t find the watch.',
              'Peter decided to return the watch to its rightful owner.',
              'Mr Jones had no idea that Peter was the one who had stolen the watch.',
            ],
            'B A B C A B B A',
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
            'As a visiting student in Sunningdale England, you took part in an optional online course on English literature and you had to write an essay on Charlotte Brontë\'s Jane Eyre. Your English teacher at school, Carol Bennett lent you an old edition of the book with her handwritten notes in it. The term finished two weeks ago and you were packing for holiday when you found the book on your desk and realised that you had forgotten to return it to Ms Bennett.',
          items: [
            {
              id: '1',
              type: 'production',
              prompt: ['Write an email of 80-100 words to Ms Bennett in which you'],
              contentPoints: [
                'say thank you for the book and say how her notes were helpful,',
                'apologise for the delay,',
                'offer two ways of returning the book.',
              ],
              promptAfter: ['Begin your email like this:'],
              minWords: 80,
              maxWords: 100,
              opening: 'Dear Ms Bennett,',
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
          instructions: 'You received the following email from your American friend, Cynthia:',
          passage: [
            {
              text: 'My boyfriend Tim\'s mother is very fussy about food and before every holiday she spends long days planning, shopping for and preparing the festive meal, particularly Thanksgiving dinner! This one being the third Thanksgiving Tim and I will spend together, they probably thought that I could be regarded as a family member so I was invited for the family dinner.',
            },
            {
              text: 'As I\'m not particularly interested in cooking (understatement), Tim and I never talked about the details of these family meals, so imagine my horror last week, when he told me that according to a family tradition, his mother would ask all the females in the family (btw why the females??? in my family my father is the best cook) to send “samples” of the desserts they plan to bring to the celebration so that she can test if they are good enough to make it to the “festive menu”. His mother hoped that I would also take the challenge, he added with a smile.',
            },
            {
              text: 'As you know very well, I\'ve never prepared a dessert more complicated than a fruit salad but that has never been a problem (not with Tim either) and I don\'t feel like making an effort to give a false impression. On the contrary: the more I think about it the more surreal this so-called family tradition seems to me and I\'d like to back out somehow. But how? Any ideas???',
            },
          ],
          items: [
            {
              id: '2',
              type: 'production',
              prompt: ['Write an email of 100-120 words to Cynthia in which you tell her'],
              contentPoints: [
                'what you think of the family tradition of testing dessert-samples,',
                'the fact that Cynthia is not very good at cooking,',
                'her feelings about the situation,',
                'what she should do now.',
              ],
              promptAfter: ['Begin your email like this:'],
              minWords: 100,
              maxWords: 120,
              opening: 'Hi Cyn,',
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
