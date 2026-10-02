// Angol nyelv, középszintű írásbeli érettségi, 2024. október 17. (K2419), Oktatási Hivatal.
// Transcribed verbatim from the feladatlap and its javítási-értékelési útmutató (answer key,
// conversion tables, listening transcripts). Decorative photos are left out.
import type { ExamPaper } from '../types'
import { choices, cloze, enListeningIntro, EN_NOTICES_HU, heard, questions, TFN, tfn, words } from './enKozep.ts'

const bothAB = { key: 'AB', text: 'Both A and B' }

const paper: ExamPaper = {
  id: 'erettsegi-en-kozep-2024-oktober',
  type: 'erettsegi',
  language: 'en',
  level: 'kozep',
  sittingLabelHu: '2024. október',
  source: 'Oktatási Hivatal: Angol nyelv, középszintű írásbeli vizsga, 2024. október 17. (K2419) — feladatlap és javítási-értékelési útmutató.',
  noticesHu: EN_NOTICES_HU,
  sections: [
    {
      id: 'I',
      kind: 'reading',
      titleHu: 'I. Olvasott szöveg értése',
      timeLimitMin: 60,
      // útmutató p. 3: feladatpont 0–29 → vizsgapont
      conversion: [0, 1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 24, 25, 26, 27, 28, 30, 31, 32, 33],
      tasks: [
        {
          id: 'I-1',
          label: 'Task 1',
          instructions:
            'Read the following questions and answers from a website. The questions have been removed. Your task is to write the letters of the questions (A-K) next to the appropriate numbers (1-7). There are two extra questions that you do not need. Write the letters in the white boxes as in the example (0).',
          passage: [
            { style: 'title', text: 'VILLAGE GYM FREQUENTLY ASKED QUESTIONS' },
            { text: 'Get answers to the most common questions about membership, classes and services at Village Gym.' },
            { text: '{{0}} We offer a great selection of membership options to suit all preferences and pockets, including Peak and Off-Peak memberships.' },
            { text: '{{1}} If you\'re keen to save a few pounds, an Off-Peak membership is a great way to keep your costs to a minimum. Off-Peak memberships are ideal for those who prefer to enjoy the gym when it\'s a little quieter.' },
            { text: '{{2}} Yes. We offer a single-entry pass for visitors who want to drop in and work out for one day only.' },
            { text: '{{3}} We have a timetable packed with a variety of combat, step, cardio, cycle and yoga-based workouts.' },
            { text: '{{4}} Sure, if you like. Though please use our powerful cleaning products to clean it before class to ensure it\'s super safe.' },
            { text: '{{5}} There\'s no need to make a booking; however, once maximum capacity is reached, new attendees will be asked to wait.' },
            { text: '{{6}} Loose-fitting, comfortable clothing is best for exercising, e.g., T-shirts, leggings and shorts. And most classes require some form of athletic shoes.' },
            { text: '{{7}} There are lockers, showers, toilets and dryers for your swimwear. Female changing rooms have hairdryers and hair straighteners.' },
          ],
          bankTitle: 'QUESTIONS',
          bank: [
            { key: 'A', text: 'Can I bring my own yoga mat?' },
            { key: 'B', text: 'How can I cancel my membership?' },
            { key: 'C', text: 'How much does it cost to join Village Gym?' },
            { key: 'D', text: 'How can I reduce my membership fee?' },
            { key: 'E', text: 'What changing facilities do you have?' },
            { key: 'F', text: 'What should I wear in the gym?' },
            { key: 'G', text: 'Can I buy a day ticket?' },
            { key: 'H', text: 'What classes do you have?' },
            { key: 'I', text: 'Do I need to reserve my place?' },
            { key: 'K', text: 'Do you have a lost and found?' },
          ],
          unusedBankCount: 2,
          examples: choices(0, 'C'),
          items: choices(1, 'D G H A I F E'),
        },
        {
          id: 'I-2',
          label: 'Task 2',
          instructions:
            'Read this article about a new law in France. Some parts of sentences have been left out from the text. Your task is to reconstruct the text by filling in the gaps (8-15) from the list (A-L) below. Write the letters in the white boxes next to the numbers as in the example (0). Remember that there are two extra letters that you do not need.',
          passage: [
            { style: 'title', text: 'FRANCE BANS THROWAWAY FAST-FOOD CONTAINERS' },
            {
              text: 'Large fast-food chains in France will no longer be able to give eat-in customers their food in throwaway boxes and {{0}}. Under the new law, restaurants that can seat 20 people or more will have to provide reusable plates, {{8}}.',
            },
            {
              text: 'The new system has recently been introduced with the aim of reducing the amount of {{9}}. This isn\'t the first regulation like this in the country. Last year, a ban on single-use plastic packaging for more than {{10}} came into effect.',
            },
            {
              text: 'It\'s reported that around six billion meals are served in 30,000 fast food restaurants in France, which generates {{11}}. Under the new anti-waste law, restaurants and cafes will have to serve eat-in burgers and sandwiches wrapped in paper instead of boxes. Every other food item, like nuggets, cakes, or ice creams will have to be handed over on {{12}} and cups, which will be washed and used again.',
            },
            {
              text: 'Restaurants had nearly three years to prepare – but critics say the law will put pressure on the food business that still does not have the {{13}} for reusable plates and containers.',
            },
            {
              text: 'There are also environmental concerns that restaurants will replace paper with {{14}} instead of glass or ceramic dishes that last years. Hard plastic isn\'t strong enough for several washes over time and environmental groups are concerned that it will be thrown away after a few washes.',
            },
            { text: 'But as the ban only applies to people eating in, takeaway customers will continue to receive their {{15}}.' },
            { text: 'Zero Waste France and other environmental groups have asked customers to stay away from places where the new law is not being followed.' },
          ],
          bank: [
            { key: 'A', text: 'food in single-use takeaway boxes as usual' },
            { key: 'B', text: 'plates or in reusable bowls' },
            { key: 'C', text: 'single-use forks to eat with' },
            { key: 'D', text: 'cups and forks for customers instead' },
            { key: 'E', text: 'energy and water used for washing them' },
            { key: 'F', text: '180,000 tonnes of waste every year' },
            { key: 'G', text: '30 types of fruits and vegetables' },
            { key: 'H', text: 'waste produced in France' },
            { key: 'I', text: 'washable hard plastic to contain food' },
            { key: 'K', text: 'cleaning facilities or storage space' },
            { key: 'L', text: 'posters to remind them to return their trays' },
          ],
          unusedBankCount: 2,
          examples: choices(0, 'C'),
          items: choices(8, 'D H G F B K I A'),
        },
        {
          id: 'I-3',
          label: 'Task 3',
          instructions:
            'Read this article about exam stress. Some sentences have been left out from the text. Your task is to reconstruct the text by filling in the gaps (16-20) from the list (A-H) below. Write the letters in the white boxes next to the numbers as in the example (0). Remember that there are two extra letters that you do not need.',
          passage: [
            { style: 'title', text: 'DEALING WITH EXAM STRESS' },
            {
              text: 'Exams can feel like a lot of pressure. You might be putting pressure on yourself because you need certain grades for a course or job. Or your parents or teachers might be putting pressure on you. {{0}}',
            },
            {
              text: 'When we feel anxious, we can start thinking things like ‘I can\'t do this’ and ‘I\'m going to fail’. {{16}} For example, reminding yourself of a successful exam will help you feel more confident about an upcoming one. Visualizing a positive experience will also help you manage your nerves. {{17}} Picturing yourself doing well has been found more effective at reducing anxiety than telling yourself you will do well.',
            },
            {
              text: 'It is important to focus on yourself. {{18}} This is stressful and increases the fear of failure. On the other hand, focusing on yourself and what you can control will increase confidence.',
            },
            {
              text: 'A little exam stress may be helpful because it can make you work harder. {{19}} Stress might be affecting you if you\'re struggling to sleep, getting headaches or feeling unwell a lot. Another sign might be not eating because of how you\'re feeling.',
            },
            {
              text: 'Exam stress affects everyone differently, but if you\'re worried, you don\'t have to cope alone. {{20}} Talking about how you\'re feeling, however, can reduce the pressure and help you to feel more in control.',
            },
            { text: 'And don\'t forget that getting a good night\'s sleep will help you achieve the right mindset before a big event.' },
          ],
          bank: [
            { key: 'A', text: 'Competing with your friends can help to keep you motivated.' },
            { key: 'B', text: 'It can be difficult but try to replace these with positive thoughts.' },
            { key: 'C', text: 'No matter where the pressure is coming from, there are ways to help you cope.' },
            { key: 'D', text: 'But too much of it may have a negative effect on you and make it hard to cope.' },
            { key: 'E', text: 'Imagination works better than words.' },
            { key: 'F', text: 'When you compare yourself to others, your confidence depends on people around you, and is not within your control.' },
            { key: 'G', text: 'Plan when you\'re going to start and finish your revision, so you know when to stop.' },
            { key: 'H', text: 'Bottling up stress and trying to deal with it on your own can often make it worse.' },
          ],
          unusedBankCount: 2,
          examples: choices(0, 'C'),
          items: choices(16, 'B E F D H'),
        },
        {
          id: 'I-4',
          label: 'Task 4',
          instructions:
            'Read this article about two valuable notebooks and then read the statements (21-29) following it. Mark a statement A if it is true according to the article, mark it B if it is false, and mark it C if there isn\'t enough information in the text to decide if it is true or not. Write the letters in the white boxes next to the numbers as in the example (0). A = TRUE B = FALSE C = THE TEXT DOES NOT SAY',
          passage: [
            { style: 'title', text: 'MISSING DARWIN NOTEBOOKS RETURNED AFTER 20 YEARS' },
            {
              text: 'Twenty years ago, two notebooks, written by 19th-century scientist Charles Darwin, mysteriously disappeared from the Cambridge University Library. The stolen notebooks, which had been missing for over 20 years, have finally been secretly returned.',
            },
            {
              text: 'Darwin recorded his observations in a series of notebooks and labelled them with letters of the alphabet. The Cambridge University Library had several of his notebooks in its Darwin collection.',
            },
            {
              text: 'The two missing notebooks were kept in a small blue box, and were last seen in 2000, when they were taken out to be photographed. In 2001, the librarians found that the box and the priceless notebooks were missing. Luckily, the library had taken pictures of the notebooks\' pages, so the information wasn\'t completely lost.',
            },
            {
              text: 'At first, the library staff thought the box had been put back in the wrong place, so they made a huge effort to find it. They searched through the 10 million items in the library, which took several years.',
            },
            {
              text: 'Finally, in 2020 Jessica Gardner, the university\'s director of library services officially reported the missing notebooks as stolen. The police were notified, and the notebooks were listed in the database of stolen artworks.',
            },
            {
              text: 'Now, a long time after they were reported as stolen, the manuscripts were mysteriously returned. A bright pink gift bag appeared in a public area just outside Dr Gardner\'s office. Inside was a plain brown envelope simply addressed "Librarian, Happy Easter, X". After the police had examined the package, library workers were able to open it. The envelope contained the blue box with both notebooks inside. They carefully studied the notebooks and were pleased to learn that they were not damaged.',
            },
            {
              text: 'Dr Gardner said she was "delighted" and relieved to have them back. Cambridgeshire Police said they would continue their investigation and asked the public to come forward with any information.',
            },
          ],
          options: TFN,
          examples: [{ id: '0', type: 'mcq', stem: 'Darwin offered his notebooks to the Cambridge University Library before he died.', answer: 'C' }],
          items: tfn(
            21,
            [
              'The missing notebooks were the same size and colour.',
              'It was not discovered immediately that the notebooks were missing.',
              'The police were informed two years after the notebooks had been stolen.',
              'The mysterious package with the notebooks was sent to Dr Gardner\'s home address.',
              'The package was opened at the police station.',
              'The notebooks were in their original box.',
              'There weren\'t any missing pages in either of the notebooks.',
              'The handwritten message on the envelope is being examined by experts.',
              'The police have closed the case as unsolved.',
            ],
            'C A B B C A A C B',
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
            'You are going to read some advice about what you should and should not do if you receive an invitation to an event in Britain. Some words are missing from the text. Your task is to choose the most appropriate word from the list (A-M) for each gap (1-9) in the text. Write the letter of the appropriate word in the white box. You can use each word only once. There are two extra words that you do not need to use. There is one example (0) at the beginning.',
          passage: [
            { style: 'title', text: 'HOW TO BE A POLITE GUEST' },
            { text: 'In Britain, people make great {{0}} to arrive on time. It is often considered impolite to arrive even a few minutes late.' },
            {
              text: 'If you are invited to someone\'s house for dinner at half past seven, they will expect you to be there exactly at 7.30. An invitation {{1}} state "7.30 for 8", in which case you {{2}} arrive no later than 7.50.',
            },
            {
              text: 'If you receive a written invitation to an event that says "RSVP", you should reply to {{3}} the person who sent the invitation know whether or not you plan to {{4}}.',
            },
            {
              text: 'Never accept an invitation {{5}} you really plan to go. You may refuse by saying, "Thank you for inviting me, but I will not be able to come." If, after {{6}}, you are unable to go, be sure to tell those expecting you as far in {{7}} as possible that you will not be there.',
            },
            {
              text: '{{8}} it is not necessarily expected that you give a gift – e.g. flowers or chocolate – to your host, it is considered polite to {{9}} so, especially if you have been invited for a meal.',
            },
          ],
          bank: [
            { key: 'A', text: 'ACCEPTING' },
            { key: 'B', text: 'ADVANCE' },
            { key: 'C', text: 'EFFORTS' },
            { key: 'D', text: 'ALTHOUGH' },
            { key: 'E', text: 'ATTEND' },
            { key: 'F', text: 'DO' },
            { key: 'G', text: 'INVITING' },
            { key: 'H', text: 'LET' },
            { key: 'I', text: 'MIGHT' },
            { key: 'K', text: 'NEED' },
            { key: 'L', text: 'SHOULD' },
            { key: 'M', text: 'UNLESS' },
          ],
          unusedBankCount: 2,
          examples: choices(0, 'C'),
          items: choices(1, 'I L H E M A B D F'),
        },
        {
          id: 'II-2',
          label: 'Task 2',
          instructions:
            'You are going to read an article about popular events called Frost Fairs that were held on the frozen River Thames in London during very cold winters. Some words are missing from the text. Your task is to write the missing words on the dotted lines (10-18) after the text. Use only one word in each gap. There is an example (0) at the beginning.',
          passage: [
            { style: 'title', text: 'THE THAMES FROST FAIRS' },
            {
              text: 'Between 1600 and 1814, it was {{0}} uncommon for the River Thames to freeze over for up to two months. One reason {{10}} this was that Britain was locked in what is now known {{11}} the ‘Little Ice Age’.',
            },
            {
              text: 'Although these extreme winters often brought famine and death, local Londoners decided to make {{12}} most of it and set up the Thames Frost Fairs. In fact, between 1607 and 1814 there were a total of seven major fairs, as {{13}} as several smaller ones.',
            },
            {
              text: 'The first recorded frost fair was during the winter of 1607/1608. During December the ice had been hard enough {{14}} allow people to walk on it, but it was not until January when {{15}} became so thick that people started setting up camp on it. There were football pitches, bowling matches, fruit-sellers, shoemakers, barbers… even a pub or two. To {{16}} the shopkeepers warm, there were even fires within their tents!',
            },
            {
              text: 'By the 1800\'s the climate had started to warm and the last ever London Frost Fair {{17}} place in January 1814. Although only lasting for five days, this was {{18}} of the largest fairs on record. Thousands of people turned up every day, and there was every possible form of entertainment.',
            },
          ],
          examples: cloze(0, [['not']]),
          items: cloze(10, [['for', 'behind'], ['as'], ['the'], ['well'], ['to'], ['it'], ['keep'], ['took'], ['one']]),
        },
        {
          id: 'II-3',
          label: 'Task 3',
          instructions:
            'You are going to read an article about how the way people measure time has changed. Some words are missing from the text. Use the words in brackets to form the words that fit in the gaps (19-25). Then write the appropriate form of these words on the dotted lines after the text. There might be cases when you do not have to change the word in brackets. Use only one word for each gap. There is an example (0) at the beginning.',
          passage: [
            { style: 'title', text: 'MEASURING TIME' },
            {
              text: 'The Sumerians were the first to measure time by {{0}} their day into 12 units. They used water clocks to keep time. Later on, the {{19}} also divided the day into 12 equal units. As they used the rising and setting of the sun, the units varied in {{20}} according to the season, helping them adjust their lifestyles to the changing needs of the agricultural calendar.',
            },
            {
              text: 'Due to the need for greater accuracy, more accurate devices – {{21}} sundials, candle clocks and mechanical clocks – had been developed by the 17th century.',
            },
            {
              text: 'As railroads spread across the United States, people began to think about regulating time to international standards. In the early 1800s, every city in the US had its own time zone – there were a surprising 300 local sun-times in {{22}}. Since running trains to a {{23}} timetable with this system was impossible, national time zones were introduced in the US in 1883. The international 24-hour time-zone system, which serves as a time reference for the world, was established the {{24}} year with the adoption of Greenwich Meridian Time.',
            },
            {
              text: 'Clocks became more accurate with the {{25}} of quartz clocks in the 1920s, and later the amazingly sensitive atomic clocks.',
            },
          ],
          examples: words(0, [['divide', 'dividing']]),
          items: words(19, [
            ['Egypt', 'Egyptians'],
            ['long', 'length'],
            ['include', 'including'],
            ['use', 'use'],
            ['rely', 'reliable'],
            ['follow', 'following'],
            ['develop', 'development', 'developing'],
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
        storagePath: 'erettsegi-en-kozep-2024-oktober.mp3',
        durationSec: 1796,
        // Task starts: the ~60 s reading pause of each task found by silence detection, minus the length of its announcement (approximate, ±10 s).
        taskMarkers: [
          { taskId: 'III-1', startSec: 106 },
          { taskId: 'III-2', startSec: 708 },
          { taskId: 'III-3', startSec: 1257 },
        ],
      },
      // útmutató p. 7: feladatpont 0–25 → vizsgapont
      conversion: [0, 1, 3, 4, 5, 7, 8, 9, 11, 12, 13, 15, 16, 17, 18, 20, 21, 22, 24, 25, 26, 28, 29, 30, 32, 33],
      transcripts: [
        {
          taskId: 'III-1',
          title: 'George Edward Thomas',
          paragraphs: [
            'This is a story about a man born with a serious physical disability, but against the odds lived a life fuller than most.',
            'George Edward Thomas was born on the 10th of June 1850 in Moorfields, London. His father, Richard, was a tea dealer and traveller who was originally from Wales. He married George\'s mother, Ann Lewis, in London in 1847.',
            'George was born with no hands or arms and he learned to do everything with his feet. He was the eldest of six boys in the family, a family which lived in various parts of London over the years.',
            'In 1872 he married Sarah Ann Endersby after courting her for two years. According to a document, he had "no difficulty placing the ring on her finger with his toes." They were happily married for 21 years and George had perfectly healthy children with her. Sarah died after a long illness in 1893.',
            'George had a little stationery and tobacco shop in Old Kent Road. It was said "There is hardly anything this extraordinary man cannot do with his feet. He will raise his hat politely to a lady, he can shave as cleanly as an expert barber, he can pick up a pin from the floor or lift a heavy hammer, and he is an excellent carpenter, being able to use a screwdriver with the greatest of ease. In addition, he is a bit of a musician, and can play the trumpet and accordion."',
            'George took full advantage of his disability, joining Tom Norman, the well-known showman\'s circus on tour of Europe by giving public exhibitions. Mr Norman was well-known for taking so called \'freaks\', people with an unusual physical abnormality, on tour. He gave Thomas the name \'John Chambers, The Armless Carpenter\'.',
            'In 1897 he married Elizabeth Shannon, in Glasgow, Scotland. They would live together in Old Kent Road. In total George had 14 children. He died in 1929, aged 78.',
          ],
        },
        {
          taskId: 'III-2',
          title: 'Franz Kafka and the lost doll',
          paragraphs: [
            'At 40, Franz Kafka (1883–1924), who never married and had no children, was walking through a park one day in Berlin when he met a girl who was crying because she had lost her favourite doll. She and Kafka searched for the doll unsuccessfully. Kafka told her to meet him there the next day and they would continue looking for the doll.',
            'The next day, when they had not yet found the doll, Kafka gave the girl a letter "written" by the doll saying "please don\'t cry. I took a trip to see the world. I will write to you about my adventures."',
            'Thus began a story which continued until the end of Kafka\'s life. During their meetings, Kafka read the letters of the doll carefully written with adventures and conversations that the girl found marvelous.',
            'Finally, Kafka brought back the doll – well, he actually bought one – that had "returned" to Berlin. "It doesn\'t look like my doll at all," said the girl.',
            'Kafka handed her another letter in which the doll wrote: "my travels have changed me." The little girl hugged the new doll and took it home with her.',
            'A year later Kafka died. Many years later, the now-adult girl found a letter inside the doll. In the tiny letter signed by Kafka it was written: "Everything you love will probably be lost, but in the end, love will return in another way."',
          ],
        },
        {
          taskId: 'III-3',
          title: 'The Canadian lottery winners',
          paragraphs: [
            '…Our next news story is about an elderly Canadian couple who have become beloved stars after winning more than 11 million dollars on the lottery – and then quietly giving almost all of it away.',
            'Violet, a housewife, 72, and Allen Large, 75, a former truck driver, live in a modest home in Lower Truro, Nova Scotia. They collected the jackpot in July. We asked the couple how they had come to this amazing decision.',
            'Why did you decide to give away the money you had won, Mr. Large?',
            'Well, we believed that we already had everything we needed, and we thought it would be wonderful to distribute the cash among charities.',
            'Haven\'t you kept any of the jackpot? It\'s a very large sum of money.',
            'Well, we decided to keep only about 200,000 dollars in case of a "rainy day" – should anything truly terrible happen to us, you know.',
            'How did you decide about who and what kind of charity would get the money?',
            'Well, we drew up a list of worthy causes, starting with our family, of course, and then adding hospitals, fire services, churches, cemeteries and charity groups. Then we simply sent off checks to them in the mail.',
            'But it\'s still not clear why you have given most of the jackpot away. Can you explain your decision, Mrs. Large?',
            'Well, you know, we believe that money cannot buy happiness. I\'ve been battling cancer, and chemotherapy treatment has caused my hair to fall out. But I still feel lucky as it did not make me feel sick, and look, I\'m still alive!',
            'How did people react to your generosity?',
            'As news of it started to come out, we were first celebrated only in our village, but now that our faces have appeared on television screens across the country and on the front pages of the national newspapers, we\'ve become real celebrities! But we are not used to all this attention. We are just plain, old country folk.',
          ],
        },
      ],
      tasks: [
        {
          id: 'III-1',
          label: 'TASK 1',
          instructions:
            'In this section, you will hear the interesting story of an extraordinary man. Your task is to complete the sentences with one word in each gap, using the exact words you hear in the recording. First, you will have some time to study the task, and then we will play the whole recording in one piece. Then you will hear the recording again, but this time we will play the text in shorter sections to give you enough time to write down your answers.',
          examples: heard(0, [['The man in the story was born with a serious physical ________ .', 'disability']]),
          items: heard(1, [
            ['Richard Thomas was a tea dealer and ________ from Wales.', 'traveller', 'traveler', 'originally'],
            ['The Thomas family lived in ________ parts of London over the years.', 'various'],
            ['George was so skillful that he easily placed the ring on the ________ of his bride with his toes.', 'finger'],
            ['George was the owner of a stationary and tobacco ________ in London.', 'shop'],
            ['He was said to be able to pick up a pin from the ________ with his feet.', 'floor'],
            ['In addition to the accordion, George could also play the ________ .', 'trumpet'],
            ['With Tom Norman\'s circus he went on tour in Europe, giving public ________ .', 'exhibitions'],
            ['All in all, George Thomas had 14 ________ .', 'children'],
          ]),
        },
        {
          id: 'III-2',
          label: 'TASK 2',
          instructions:
            'In this section you will listen to an anecdote about Franz Kafka, the famous writer. Your task will be to circle the letter(s) of the correct answer(s) in the boxes on the right. Please note that in this task both answers may be correct. However, there is always at least one correct answer. This means you might have to circle one or two letters. First, you will have some time to study the task, and then we will play the whole recording in one piece. Then you will hear the recording again, but this time we will play the text in shorter sections to give you enough time to write down your answers.',
          examples: [
            {
              id: '0',
              type: 'mcq',
              stem: 'Franz Kafka was born in …',
              options: [{ key: 'A', text: '1883.' }, { key: 'B', text: 'Berlin.' }, bothAB],
              answer: 'A',
            },
          ],
          items: questions(
            9,
            [
              { stem: 'The little girl in the park was crying because she ...', options: ['couldn\'t find her toy.', 'was lost in the park.'] },
              { stem: 'Kafka …', options: ['joined in the search.', 'told her to come back the following day.'] },
              { stem: 'The next day Kafka ...', options: ['gave a letter to the little girl.', 'found the doll in the park.'] },
              { stem: 'As time went by, the little girl …', options: ['carefully read every new letter.', 'greatly enjoyed the new stories.'] },
              { stem: 'The doll Kafka gave the little girl ...', options: ['had been bought by him.', 'looked quite different from her doll.'] },
              { stem: 'The little girl …', options: ['was sure that Kafka had written the letter.', 'happily took the doll home.'] },
              { stem: 'When the girl was much older, …', options: ['Kafka sent her another letter about the doll.', 'she found another letter in the doll.'] },
              { stem: 'In his last letter, Kafka said that in time …', options: ['the things we love tend to get lost.', 'love always returns somehow.'] },
            ],
            'A AB A B AB B B AB',
          ).map((item) => ({ ...item, options: [...(item.options ?? []), bothAB] })),
        },
        {
          id: 'III-3',
          label: 'TASK 3',
          instructions:
            'In this section you will hear about two Canadian lottery winners who have given most of their winnings away. Your task will be to decide whether the following statements are true, false or we do not know because the text does not say, and write the appropriate letter in the boxes on the right. Write A if the statement is true, write B if the statement is false, and write C if the text does not say. First, you will have some time to study the task, and then we will play the whole recording in one piece. Then, you will hear the recording again, but this time we will play the text in shorter sections to give you enough time to write down your answers. A = TRUE B = FALSE C = THE TEXT DOES NOT SAY',
          options: TFN,
          examples: [{ id: '0', type: 'mcq', stem: 'The couple have given away all of the 11 million dollars they won.', answer: 'B' }],
          items: tfn(
            17,
            [
              'The Larges have been living in Lower Truro, Nova Scotia all their lives.',
              'They gave the money away because they didn\'t need more than what they already had.',
              'By a "rainy day" Mr. Large means an extremely unfortunate event in their life.',
              'Their children fully supported them in their decision about the money.',
              'They asked the members of their family to deliver the money to the chosen charities.',
              'Mrs. Large believes that money can actually bring happiness.',
              'Mrs. Large considers herself lucky because she doesn\'t feel unwell.',
              'The couple became national celebrities immediately after they\'d won the jackpot.',
              'The Larges consider themselves very ordinary people.',
            ],
            'C A A C B B A B A',
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
          instructions: 'You are staying in the UK and you have received the following invitation from your old friend, Sam:',
          passage: [
            { style: 'title', text: 'LOOK, WHO\'S TURNING THE BIG 100!' },
            {
              text: 'I would like to invite you to my great-grandma\'s 100th birthday celebration. You have always been a special friend of mine and also my great-grandma\'s favourite; and because this is a very special moment for her and for our whole family, I\'d really like you to be there to make this occasion all the more memorable.',
            },
            { text: 'The celebration will be taking place at the Red Lion Pub in Ascot at 12.00 p.m. on July 1st, and it will be followed by an informal lunch at the same premises.' },
            {
              text: 'If you need to know more about the event, you can always get in touch by phone or by email, I will be waiting to hear from you. Your presence at this celebration really means a lot to me and to all my family and I am looking forward to meeting you on this special day.',
            },
            { text: 'Hope to see you soon.' },
            { text: 'Best, Sam' },
          ],
          items: [
            {
              id: '1',
              type: 'production',
              prompt: ['Write an email of 80-100 words to Sam in which you'],
              contentPoints: ['accept the invitation,', 'ask about the dress code,', 'ask about the present you should bring.'],
              promptAfter: ['Begin your email like this:'],
              minWords: 80,
              maxWords: 100,
              opening: 'Hi Sam,',
              register: 'informal-message',
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
          instructions: 'You have come across the following post on the problem page askaway.com:',
          passage: [
            {
              text: 'Hi guys, I\'m in my first year at uni and the exam period is coming up. One of my courses requires an online exam and I\'ve been talking to a few of my classmates and found out that basically no one is planning to study much for it. On the contrary, they are planning to use anything and everything available (notes, parents, the internet) in order to pass. One of my friends even said, “Why bother to study if you can get good grades by cheating and everybody cheats on online exams anyway?”',
            },
            {
              text: 'Which got me thinking. I do like this subject, and I was planning on studying for the exam, however ridiculous that might sound. The teacher was really nice and fair, and I would feel bad if I wasn\'t honest. My first idea was to talk to her about this, but then I realised that wouldn\'t be too nice to the others.',
            },
            { text: 'Plus, if everybody cheats, it will result in a much higher average performance, putting anyone who doesn\'t cheat at a disadvantage.' },
            { text: 'What do you think?' },
            { text: 'Alyssa, 19' },
          ],
          items: [
            {
              id: '2',
              type: 'production',
              prompt: ['Write a comment of 100-120 words to Alyssa in which you tell her'],
              contentPoints: [
                'whether you have ever taken an online test or exam,',
                'what you think about cheating at an online test or exam,',
                'whether she should talk to her teacher about the situation, and',
                'what you would do if you were in her shoes.',
              ],
              promptAfter: ['Start your comment like this:'],
              minWords: 100,
              maxWords: 120,
              opening: 'Alyssa,',
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
