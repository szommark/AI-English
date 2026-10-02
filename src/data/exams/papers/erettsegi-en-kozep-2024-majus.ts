// Angol nyelv, középszintű írásbeli érettségi, 2024. május 9. (K2412), Oktatási Hivatal.
// Transcribed verbatim from the feladatlap and its javítási-értékelési útmutató (answer key,
// conversion tables, listening transcripts). Decorative photos are left out.
import type { ExamPaper } from '../types'
import { choices, cloze, enListeningIntro, EN_NOTICES_HU, heard, questions, TFN, tfn, words } from './enKozep.ts'

const bothAB = { key: 'AB', text: 'Both A and B' }

const paper: ExamPaper = {
  id: 'erettsegi-en-kozep-2024-majus',
  type: 'erettsegi',
  language: 'en',
  level: 'kozep',
  sittingLabelHu: '2024. május',
  source: 'Oktatási Hivatal: Angol nyelv, középszintű írásbeli vizsga, 2024. május 9. (K2412) — feladatlap és javítási-értékelési útmutató.',
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
            'Read the following questions and answers from the website of a tourist attraction in Edinburgh. The questions have been removed. Your task is to write the letters of the questions (A-M) next to the appropriate numbers (1-8). There are three extra questions that you do not need. Write the letters in the white boxes as in the example (0).',
          passage: [
            { style: 'title', text: 'FAQS ABOUT YOUR VISIT TO CAMERA OBSCURA AND WORLD OF ILLUSIONS' },
            { text: 'Welcome to Edinburgh\'s oldest visitor attraction, delighting visitors since 1853. Here\'s everything you need to know before you visit.' },
            { text: '{{0}} Most people get around all our attractions in about one hour and 45 minutes, but you may spend as long as you like enjoying the illusions.' },
            { text: '{{1}} Yes, if we have spaces available, you can purchase tickets on the day at our front desk. However, we would recommend booking in advance to avoid disappointment.' },
            { text: '{{2}} There\'s something for everyone, from babies to grandparents. Even hard-to-impress teenagers love Camera Obscura.' },
            { text: '{{3}} We have a storage area for big items like suitcases and backpacks. Please note that items can only be stored for the duration of your visit at Camera Obscura.' },
            { text: '{{4}} Our 17th-century building is listed by Historic Environment Scotland, so for the time being, we are a stairs-only attraction.' },
            { text: '{{5}} We don\'t have an on-site café, but your ticket gets you money off at several nearby cafés and restaurants.' },
            { text: '{{6}} Yes. We pride ourselves on being a pet-friendly attraction and offer all our furry friends a treat of a biscuit on arrival.' },
            { text: '{{7}} Yes. You will be able to connect with the access code that you get at the admissions desk on your arrival.' },
            { text: '{{8}} Yes. Photography is allowed everywhere except in the Camera Obscura chamber. Please share your photos with us by tagging us on social media.' },
          ],
          bankTitle: 'QUESTIONS',
          bank: [
            { key: 'A', text: 'Is there a place to eat in the building?' },
            { key: 'B', text: 'Are dogs welcome?' },
            { key: 'C', text: 'How long does a visit take?' },
            { key: 'D', text: 'What\'s the best time to visit?' },
            { key: 'E', text: 'May I take pictures in the building?' },
            { key: 'F', text: 'Can I buy a ticket on arrival?' },
            { key: 'G', text: 'Can I bring my own food or drinks?' },
            { key: 'H', text: 'Is there a lift?' },
            { key: 'I', text: 'Where can I leave my luggage during my visit?' },
            { key: 'K', text: 'Can I book tickets online?' },
            { key: 'L', text: 'Do you have free WiFi?' },
            { key: 'M', text: 'What ages are the attractions suitable for?' },
          ],
          unusedBankCount: 3,
          examples: choices(0, 'C'),
          items: choices(1, 'F M I H A B L E'),
        },
        {
          id: 'I-2',
          label: 'Task 2',
          instructions:
            'Read this article about traditions related to Christmas. Some parts of sentences have been left out from the text. Your task is to reconstruct the text by filling in the gaps (9-16) from the list (A-L) below. Write the letters in the white boxes next to the numbers as in the example (0). Remember that there are two extra letters that you do not need.',
          passage: [
            { style: 'title', text: 'WHEN SHOULD YOU TAKE DOWN YOUR CHRISTMAS DECORATIONS?' },
            { text: 'Some of the trickiest questions about Christmas are about the decorations. When do you {{0}} and when do you remove them?' },
            {
              text: 'Lots of people {{9}} if it\'s too early to put their decorations up and come January, even more start wondering when they have to {{10}}. It\'s important to point out, though, that there aren\'t any definite rules about Christmas decorations.',
            },
            {
              text: 'Some people love to put them up right after Halloween, and if shops {{11}}, you start thinking it\'s time to have them up at home. However, others argue that having your decorations up too early can mean you {{12}} Christmas comes along. But in any case, it\'s up to you and your family to {{13}}.',
            },
            {
              text: 'A little bit more strict is the tradition about taking decorations down — but even this can be a bit confusing. One of the most famous traditions is that of Twelfth Night and the idea that it is bad luck to {{14}} past Twelfth Night. Twelfth Night is a Christian festival that takes place on the last night of the Twelve Days of Christmas, marking the coming of the feast of Epiphany when Christians celebrate the visit of the Three Wise Men.',
            },
            {
              text: 'There is no definite date for Twelfth Night and different religious traditions {{15}}. Some believe it comes twelve days after Christmas Day, so on 5 January, while others {{16}} on 26 December, which puts Twelfth Night on 6 January.',
            },
          ],
          bank: [
            { key: 'A', text: 'get tired of them by the time' },
            { key: 'B', text: 'start wondering in November' },
            { key: 'C', text: 'put them up' },
            { key: 'D', text: 'follow different times for it' },
            { key: 'E', text: 'say the counting should begin' },
            { key: 'F', text: 'bring good luck' },
            { key: 'G', text: 'are selling Christmas goods' },
            { key: 'H', text: 'leave your Christmas decorations up' },
            { key: 'I', text: 'take them down' },
            { key: 'K', text: 'do what you enjoy best' },
            { key: 'L', text: 'are becoming the classic symbols of Christmas' },
          ],
          unusedBankCount: 2,
          examples: choices(0, 'C'),
          items: choices(9, 'B I G A K H D E'),
        },
        {
          id: 'I-3',
          label: 'Task 3',
          instructions:
            'Read the following description of zoos and safari parks in Britain and then read the half sentences that follow the text. Your task is to match the half sentences based on the information in the text. Write the letters (A-I) in the white boxes next to the numbers (17-21) as in the example (0). Remember that there are three extra letters that you will not need.',
          passage: [
            { style: 'title', text: 'THE UK\'S BEST ZOOS' },
            { text: 'A day out at the zoo is always fun and there\'s definitely something to keep all the family happy. This guide may help you decide where to go next.' },
            { style: 'heading', text: 'Whipsnade Zoo …' },
            {
              text: 'Whipsnade Zoo is the largest zoo in the UK. You can drive to different sections of the zoo and park there, which is a good option if you\'re with little kids. Whipsnade\'s main draws include its elephants, bears and rhinos. It also has an aquarium and an indoor play area for rainier days.',
              itemId: '0',
            },
            { style: 'heading', text: 'Port Lympne …' },
            {
              text: 'Port Lympne is one of the best safari parks in the UK. It\'s not just a wildlife reserve but you can also stay overnight in one of their themed hotels and yurts. But the biggest draw here must be the cabins overlooking the different animals. It\'s not cheap but it\'s very popular.',
              itemId: '17',
            },
            { style: 'heading', text: 'Colchester Zoo …' },
            {
              text: 'Colchester Zoo is the UK\'s largest private zoo, where entrance fees and purchases go towards the upkeep of the zoo and its charity. There\'s always lots happening and there are opportunities for kids to hand feed the goats, sheep and rainbow lorikeets.',
              itemId: '18',
            },
            { style: 'heading', text: 'Paignton Zoo …' },
            {
              text: 'Paignton Zoo is one of the top zoos in the UK if you\'re looking for flora and fauna as it is the UK\'s first combined botanical and zoological garden. Besides a number of great animal experiences, you can see a collection of trees and flowers from all over the world.',
              itemId: '19',
            },
            { style: 'heading', text: 'Shaldon Wildlife Trust …' },
            {
              text: 'Shaldon Wildlife Trust does lots of conservation work on behalf of endangered species. You\'ll find lemurs, cotton-top tamarins and meerkats, as well as armadillos. However, it is a tiny zoo, which measures just one acre, so you\'ll be able to get around it in half a day.',
              itemId: '20',
            },
            { style: 'heading', text: 'Chester Zoo …' },
            {
              text: 'Chester Zoo was the first zoo in the UK to successfully breed Asian elephants in captivity. It has a huge team of scientists, vets and zookeepers working on its breeding programmes and caring for the animals who live there. Chester Zoo has 21,000 animals across 500 different species, which makes it the biggest zoo in the UK in terms of animal count.',
              itemId: '21',
            },
          ],
          bank: [
            { key: 'A', text: 'features animals which are used to cold climates.' },
            { key: 'B', text: 'is not paid for by the government.' },
            { key: 'C', text: 'is a park that you can explore by car.' },
            { key: 'D', text: 'has more animals than any other zoo in the UK.' },
            { key: 'E', text: 'has the biggest insect house in the UK.' },
            { key: 'F', text: 'is a place to visit if you have limited time.' },
            { key: 'G', text: 'has an app for visitors to find their way around.' },
            { key: 'H', text: 'offers accommodation to its visitors.' },
            { key: 'I', text: 'is a place where you can study plants as well as animals.' },
          ],
          unusedBankCount: 3,
          examples: choices(0, 'C'),
          items: choices(17, 'H B I F D'),
        },
        {
          id: 'I-4',
          label: 'Task 4',
          instructions:
            'Read this article about what young people can do if they are upset by the news. Some sentences have been left out from the text. Your task is to reconstruct the text by filling in the gaps (22-27) from the list (A-I) below. Write the letters in the white boxes next to the numbers as in the example (0). Remember that there are two extra letters that you do not need.',
          passage: [
            { style: 'title', text: 'ADVICE IF YOU\'RE UPSET BY THE NEWS' },
            {
              text: 'Sometimes things that happen in the world can make us sad, anxious or confused. It\'s important to know that it is perfectly normal to have those feelings. {{0}} Adults get sad and confused too, so there is nothing wrong with feeling like this.',
            },
            {
              text: '{{22}} For example, watch your favourite film, take your dog for a walk or chat with a friend. Also, try to balance the news you read. Have you read a sad story? {{23}}',
            },
            {
              text: 'Is being worried making it more difficult to fall asleep? {{24}} Before you go to bed, try to think about things that make you happy, so your head is full of positive thoughts. Reading a good book in bed will help to settle your thoughts. If you have a bad dream, try drawing it. {{25}}',
            },
            {
              text: 'People are spending a lot of time talking about sad events in the news. {{26}} It is very unlikely that such events will affect you or your family. It is important that if you are feeling upset about them, you shouldn\'t keep what\'s troubling you to yourself. {{27}} That can help you to understand what is upsetting you, and help those feelings of sadness, anger or confusion to go away.',
            },
          ],
          bank: [
            { key: 'A', text: 'Instead, talk to an adult about the issue in the news that is worrying you.' },
            { key: 'B', text: 'Surround yourself with nice things by your bed, so they are the last things you see before you sleep.' },
            { key: 'C', text: 'You won\'t be the only one who feels that way.' },
            { key: 'D', text: 'This will help you to confront and fight your fear.' },
            { key: 'E', text: 'Doing things that make you happy can help you to feel better.' },
            { key: 'F', text: 'These are major signs that the news report may not be real.' },
            { key: 'G', text: 'It can be a simple act like writing cards for natural-disaster victims.' },
            { key: 'H', text: 'However, upsetting things are on the news because they are rare and do not happen very often.' },
            { key: 'I', text: 'Then try and read a happy one after it.' },
          ],
          unusedBankCount: 2,
          examples: choices(0, 'C'),
          items: choices(22, 'E I B D H A'),
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
            'You are going to read an article about a festival organised in Hope, Arkansas every August. Some words are missing from the text. Your task is to choose the most appropriate word from the list (A-M) for each gap (1-8) in the text. Write the letter of the appropriate word in the white box. You can use each word only once. There are three extra words that you do not need to use. There is one example (0) at the beginning.',
          passage: [
            { style: 'title', text: 'HOPE WATERMELON FESTIVAL' },
            {
              text: 'Best {{0}} as the birthplace of U.S. President Bill Clinton, Hope, Arkansas, is also "Home of the World\'s Largest Watermelons" and hosts the only watermelon festival featuring giant watermelons.',
            },
            {
              text: 'Hope watermelon growers have been {{1}} to grow the biggest since the 1920s. In 1925, Hugh Laseter created a sensation with a(n) {{2}} 136-pounder (≈62 kg) that was exhibited for a few days. The 1928 champion was almost 145 pounds. Ivan Bright and his son Lloyd {{3}} the first 200-pound (≈91 kg) melon in 1979; seeds from it were sold for $8 {{4}}. In 1985, Lloyd Bright\'s 10-year-old son Jason grew a 260-pound (≈118 kg) watermelon {{5}} was recorded in the 1992 Guinness Book of World Records. These melons are huge {{6}} to the quality of the soil and an early greenhouse start.',
            },
            {
              text: 'The Hope Watermelon Festival {{7}} in 1926, ended with hard times, was restarted in 1977, and has been {{8}} annually ever since with about 50,000 visitors. There has been nationwide press coverage because of the enormous melons.',
            },
          ],
          bank: [
            { key: 'A', text: 'ACCORDING' },
            { key: 'B', text: 'COMPETING' },
            { key: 'C', text: 'KNOWN' },
            { key: 'D', text: 'DUE' },
            { key: 'E', text: 'EACH' },
            { key: 'F', text: 'EVERY' },
            { key: 'G', text: 'HELD' },
            { key: 'H', text: 'PRODUCED' },
            { key: 'I', text: 'RECORD' },
            { key: 'K', text: 'STARTED' },
            { key: 'L', text: 'THAT' },
            { key: 'M', text: 'WHAT' },
          ],
          unusedBankCount: 3,
          examples: choices(0, 'C'),
          items: choices(1, 'B I H E L D K G'),
        },
        {
          id: 'II-2',
          label: 'Task 2',
          instructions:
            'You are going to read an article about Oulu, Finland, where people more often use their bicycles during winter than anywhere else in the world. Some words are missing from the text. Your task is to write the missing words on the dotted lines (9-16) after the text. Use only one word in each gap. There is an example (0) at the beginning.',
          passage: [
            { style: 'title', text: 'THE WINTER CYCLING CAPITAL OF THE WORLD' },
            { text: 'Oulu is covered in snow for five months of the year and temperatures {{0}} drop as low as -30ºC, with just four hours of daylight.' },
            {
              text: 'Despite these harsh conditions, 12% of winter journeys are made by bicycle in Oulu. At first sight, the beautiful wintry surroundings look like they have something to {{9}} with it. But without proper cycling infrastructure, the attraction wouldn\'t be enough.',
            },
            {
              text: 'The city encourages cycling {{10}} clearing the paths every day during winter. One of {{11}} most effective changes is also one of the simplest: clear the cycle paths first and then the roads. Three to four centimetres of fresh snow is no issue for cars, but it might be a problem for cyclists and prevent elderly people from going outside {{12}} all. The cleared cycle paths also provide access around the city for people {{13}} use mobility scooters.',
            },
            {
              text: 'One key challenge for winter cycling is safety. The paths {{14}} well-lit during the dark winter months, and there are 320 underpasses so that children, {{15}} particular, don\'t have to cross roads.',
            },
            { text: 'The mental and physical health benefits are another reason for the city\'s cycling encouragement. It wants to {{16}} sure that all citizens are able to go outside during the winter months.' },
          ],
          examples: cloze(0, [['can']]),
          items: cloze(9, [
            ['do'],
            ['by'],
            ['the', 'their', 'its'],
            ['at', 'after', 'above'],
            ['who', 'that', 'to'],
            ['are', 'get'],
            ['in'],
            ['make', 'be'],
          ]),
        },
        {
          id: 'II-3',
          label: 'Task 3',
          instructions:
            'You are going to read an article about a 17th century shopping list which was found in the attic of a country home in England. Some words are missing from the text. Use the words in brackets to form the words that fit in the gaps (17-25). Then write the appropriate form of these words on the dotted lines after the text. There might be cases when you do not have to change the word in brackets. Use only one word for each gap. There is an example (0) at the beginning.',
          passage: [
            { style: 'title', text: 'SEVENTEENTH-CENTURY SHOPPING LIST' },
            {
              text: 'Spoons, a {{0}} pan and codfish – these items were on a shopping list written 400 years ago, which was {{17}} discovered in the attic at Knole, a historic country home in Kent, England.',
            },
            {
              text: 'The archaeology team at Knole discovered the 1633 note during a multi-million-dollar project to restore the house. The team also found two other 17th century letters {{18}}.',
            },
            {
              text: 'Robert Draper wrote the shopping list to Mr. Bilby. The note was {{19}} written, suggesting that Draper was a high-ranking servant. Draper asked Mr. Bilby to send the items to Copt Hall, an estate in Essex.',
            },
            {
              text: 'How did this domestic letter get {{20}} in an attic at Knole, which is 36 miles away from Copt Hall? Copt Hall and Knole were united when Frances Cranfield married Richard Sackville in 1637. Frances\'s father was the {{21}} of Copt Hall; Sackville had inherited Knole, his family\'s home. Household records show that domestic items – {{22}} various papers – were moved from Copt Hall to Knole at the time of the wedding.',
            },
            {
              text: 'Cranfield inherited a number of expensive {{23}} and furniture from her father. Draper\'s letter certainly was not among the {{24}} items that Cranfield brought to the {{25}}, but for modern-day historians, it is exceptionally important.',
            },
          ],
          examples: words(0, [['fry', 'frying']]),
          items: words(17, [
            ['recent', 'recently'],
            ['near', 'nearby'],
            ['beauty', 'beautifully'],
            ['hide', 'hidden'],
            ['own', 'owner'],
            ['include', 'including'],
            ['paint', 'paintings'],
            ['value', 'valuable', 'valued', 'invaluable'],
            ['marry', 'marriage'],
          ]),
        },
      ],
    },
    {
      id: 'III',
      kind: 'listening',
      titleHu: 'III. Hallott szöveg értése',
      timeLimitMin: 30,
      intro: enListeningIntro('After another short silent period,'),
      audio: {
        storagePath: 'erettsegi-en-kozep-2024-majus.mp3',
        durationSec: 1796,
        // Task starts: the ~60 s reading pause of each task found by silence detection, minus the length of its announcement (approximate, ±10 s).
        taskMarkers: [
          { taskId: 'III-1', startSec: 121 },
          { taskId: 'III-2', startSec: 718 },
          { taskId: 'III-3', startSec: 1207 },
        ],
      },
      // útmutató p. 7: feladatpont 0–25 → vizsgapont
      conversion: [0, 1, 3, 4, 5, 7, 8, 9, 11, 12, 13, 15, 16, 17, 18, 20, 21, 22, 24, 25, 26, 28, 29, 30, 32, 33],
      transcripts: [
        {
          taskId: 'III-1',
          title: 'Margaret McCollum and the Tube announcement',
          paragraphs: [
            'In this world, where finding true love has become difficult, there are some people who still find strength and comfort in holding on to the memories of their loved ones even after they are long gone. In London, there\'s a woman, Dr. Margaret McCollum, a retired general practitioner, who goes to an underground station every day and sits on the platform just to listen to the announcement recorded by her late husband, Oswald Laurence. Oswald, an actor, was responsible for recording the announcements for the London Underground\'s Northern Line. Oswald sadly passed away in 2007. The loss devastated Margaret.',
            'In an attempt to ease the pain of her husband\'s passing, she began visiting the Embankment station – the station closest to where she lives – each day to hear Oswald\'s voice as the tube arrived at the station. She would remain on the platform for a while and sit on a bench waiting to hear the recording that became one of London\'s iconic ‘Mind the Gap’ phrases, which is said as the train pulls up to the station, warning customers to be careful of the gap between the train and the platform. The announcement dates from 1969, when London Underground first started to tell passengers to ‘Mind the Gap’.',
            'But in 2013, when a new, modern digital system was introduced all around the London Underground, Oswald\'s voice was replaced by an empty electronic recording of ‘Mind the Gap’. Filled with sadness, Margaret asked the transport authority to give her a copy of the recording of his voice so that she could continue listening to her husband\'s voice at home. London Transport decided to give her the recording on a cassette. But, after hearing the hearttouching story of Oswald Laurence\'s widow, the company made a truly wonderful gesture: they decided to restore the original ‘Mind the Gap’ announcement by Oswald Laurence at one single station: the Embankment stop of the Northern Line, where all passengers can listen to Oswald Laurence\'s voice again even today. What\'s more, for every train entering the station, Oswald\'s message is played three times, which must be particularly moving for Margaret, and might perhaps make people believe that eternal love does really exist.',
          ],
        },
        {
          taskId: 'III-2',
          title: 'Margaret Mead and the first sign of civilization',
          paragraphs: [
            'Margaret Mead was a popular cultural anthropologist who brought public attention to the field by making her work understandable for most people. Famous for her trademark long black coat and walking stick, Mead shaped anthropology with her non-traditional research methods and she appeared frequently as an author and speaker in the mass media during the 1960s and the 1970s. Among other universities, she taught at Columbia University, where she was a professor of Sociology and Anthropology until her death in 1978.',
            'A few years before her death she was asked by one of her students what she considered the first sign of civilization in a culture. The student expected Mead to talk about a clay pot and a fish hook or a similar object or tool. But no, Mead said that the first sign of civilization in an ancient culture was a human bone that had been broken and then healed.',
            'Mead explained that in the animal kingdom, if you break your leg, you don\'t have any chance to survive. You cannot run from danger, get to the river for a drink or hunt food. You are meat for other wild beasts. No animal can stay alive with a broken leg long enough for the bone to heal. A broken bone, she explained, that has healed is proof that someone has taken time to stay with the person who has fallen, has carried the injured person to safety and has helped the person with their needs and problems until they recovered. “Helping someone through difficulty is where civilization starts. We are at our best when we serve others. So, let\'s be civilized,” said Mead.',
          ],
        },
        {
          taskId: 'III-3',
          title: 'Interview with Donald Gorske',
          paragraphs: [
            'J = Julie (Reporter)',
            'D = Donald',
            'J: Here in the studio we have Mr. Donald Gorske of Wisconsin, who has just been awarded by Guinness World Records as the record holder for the most Big Macs eaten. Good evening, Donald.',
            'D: Hi and thanks for having me Julie.',
            'J: Would you tell us, Donald, what exactly this new record really means?',
            'D: Well, it means that I\'ve managed to surpass the 30,000 mark with a total of 32,340 Big Macs I have eaten so far. At my high point, in my thirties, I was consuming up to nine Big Macs a day.',
            'J: Good gracious, Donald, you must be joking! How long has it taken for you to eat more than 32,000 Big Macs?',
            'D: Believe it or not, Julie, I\'ve been eating Big Macs every day for the past 50 years. May 17, 1972 was the day I got my first car. I drove to the restaurant and ordered my first three Big Macs, went out in the car and ate them, and I decided right then and there I would be eating them for the rest of my life.',
            'J: And how do you keep track of how many Big Macs you\'ve eaten?',
            'D: Well, for one thing, I save the cartons, and another thing is that I save all the receipts.',
            'J: My, oh, my … Do you drive there every day to have your daily portion?',
            'D: Well, ever since my retirement I have kept the number of Big Macs I eat at just two a day. And no, actually I live quite a few miles away from the closest restaurant, so since my retirement I\'ve been buying my weekly supply in a single trip to save money on gas.',
            'J: Health gurus keep telling us that junk food…',
            'D: Please, don\'t call my favorite sandwich that – it\'s anything but ‘junk’, believe me.',
            'J: OK, sorry… So they keep telling us that fast food is not exactly good for your health. But in light of this, you are in surprisingly good shape – you\'re not even fat!',
            'D: Yes, I\'ve heard all that stuff, but my blood sugar and cholesterol are quite low and my doctor tells me I haven\'t developed any high cholesterol-related illnesses because I eat just Big Mac and, although I like other stuff as well, I don\'t accompany it with other forms of fast food. I also skip the French fries and, in addition, I take a six-mile walk around my neighborhood every day.',
            'J: So, fast food obviously plays a very important role in your life.',
            'D: That\'s true. Big Mac is such an integral part of my life, so much that, while many take pictures of their child\'s first steps, I have family photos of my children with their first Big Macs. I will be eating the sandwich until my death, and I won\'t stop until my wife has to put them in a blender for me to drink.',
            'J: Thanks a lot, Donald, and I wish lots of success in keeping your record for many many years to come.',
            'D: You bet.',
          ],
        },
      ],
      tasks: [
        {
          id: 'III-1',
          label: 'TASK 1',
          instructions:
            'In this section, you will hear the heart-warming true story of a woman who visits an underground station every day. Your task will be to circle the letter(s) of the correct answer(s) in the boxes on the right. Please note that in this task both answers may be correct. However, there is always at least one correct answer. This means you might have to circle one or two letters. First, you will have some time to study the task, and then we will play the whole recording in one piece. Then, you will hear the recording again, but this time we will play the text in shorter sections to give you enough time to write down your answers.',
          examples: [
            {
              id: '0',
              type: 'mcq',
              stem: 'Margaret McCollum is a …',
              options: [{ key: 'A', text: 'retired doctor.' }, { key: 'B', text: 'widow.' }, bothAB],
              answer: 'AB',
            },
          ],
          items: questions(
            1,
            [
              { stem: 'Oswald Laurence was Margaret McCollum\'s …', options: ['husband.', 'favourite actor.'] },
              { stem: 'Oswald Laurence …', options: ['recorded announcements for London Underground.', 'died in 2007.'] },
              { stem: 'Margaret McCollum …', options: ['lives somewhere near the Embankment station.', 'takes the tube at the Embankment station every day.'] },
              { stem: 'The ‘Mind the Gap’ announcement …', options: ['warns passengers that a train is leaving the station.', 'was introduced in 1969.'] },
              { stem: 'In 2013, London Underground …', options: ['introduced a new digital announcement system.', 'stopped warning passengers of the gap.'] },
              { stem: 'Margaret asked London Underground to …', options: ['continue playing Oswald Laurence\'s ‘Mind the Gap’ announcement.', 'give her a copy of Oswald Laurence\'s recording.'] },
              {
                stem: 'The original ‘Mind the Gap’ announcement by Oswald Laurence …',
                options: [
                  'can only be heard at the Embankment stop of the Northern Line.',
                  'is played three times every time a train enters the Embankment station.',
                ],
              },
            ],
            'A AB A B A B AB',
          ).map((item) => ({ ...item, options: [...(item.options ?? []), bothAB] })),
        },
        {
          id: 'III-2',
          label: 'TASK 2',
          instructions:
            'In this section, you will hear an interesting story about an anthropologist. Your task is to complete the sentences with one word in each gap, using the exact words you hear. First, you will have some time to study the task, and then we will play the whole recording in one piece. Then, you will hear the recording again, but this time we will play the text in shorter sections to give you enough time to write down your answers.',
          examples: heard(0, [['Margaret Mead was popular because she made her work ________ for most people.', 'understandable']]),
          items: heard(8, [
            ['She had a strong influence on anthropology with her non-traditional ________ methods.', 'research'],
            ['Margaret Mead frequently appeared in the mass media as a(n) ________ and speaker during the 1960s and the 1970s.', 'author'],
            ['She was a professor of ________ and Anthropology at Columbia University.', 'Sociology', 'sociology'],
            ['A university student asked her what she considered to be the first sign of civilization in a(n) ________ .', 'culture'],
            ['The student thought that Mead would talk about some kind of object or ________ .', 'tool'],
            ['What Margaret Mead considered to be the first sign of civilization, was actually a(n) ________ bone that had been broken and then healed.', 'human'],
            ['She said that if an animal broke a leg, it meant that it didn\'t have any ________ to survive.', 'chance'],
            ['In her opinion, a broken leg that has healed proves that there was someone who took care of the injured person until they ________ .', 'recovered', 'healed'],
            ['According to Mead, we are at our best when we ________ others.', 'serve', 'help'],
          ]),
        },
        {
          id: 'III-3',
          label: 'TASK 3',
          instructions:
            'In this section, you will hear an interview with a Guinness World Record holder. Your task will be to decide whether the following statements are true, false or we do not know because the text does not say, and write the appropriate letter in the boxes on the right. Write A if the statement is true, write B if the statement is false, and write C if the text does not say. First, you will have some time to study the task, and then we will play the whole recording in one piece. Then, you will hear the recording again, but this time we will play the text in shorter sections to give you enough time to write down your answers. A = TRUE B = FALSE C = THE TEXT DOES NOT SAY',
          options: TFN,
          examples: [{ id: '0', type: 'mcq', stem: 'Donald Gorske has been a Guinness World Record holder for years.', answer: 'B' }],
          items: tfn(
            17,
            [
              'Donald has always wanted to be a Guinness World Record holder.',
              'There was a time when he ate up to thirty Big Macs a day.',
              'Donald ate his first Big Mac on the day he got his first car.',
              'He still has the receipts for all the Big Macs he has ever eaten.',
              'When Donald was still active, he used to work near a fast-food restaurant.',
              'Now that he is retired, he only eats two Big Macs a week.',
              'He drives to the restaurant just once a week to buy his weekly supply of Big Macs.',
              'Donald\'s cholesterol level is high.',
              'He says that he will continue having Big Macs until the end of his life.',
            ],
            'C B A A C B A B A',
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
            'You spent a long weekend in Prague with a friend and stayed in a B&B. On arriving home you realised that you had left your e-book reader in the room. Here\'s a photo you took of your room:',
          items: [
            {
              id: '1',
              type: 'production',
              prompt: ['Write an email of 80-100 words to the landlady, Ms Novak, in which you'],
              contentPoints: [
                'tell her what the problem is, apologise, and ask for her help,',
                'give her two ideas about where in the room you might have left the reader,',
                'ask her to send it to you by post and offer to pay for it.',
              ],
              promptAfter: ['Begin like this:'],
              minWords: 80,
              maxWords: 100,
              opening: 'Dear Ms Novak,',
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
          instructions: 'You received the following email from your 18-year-old Polish friend, Pavel:',
          passage: [
            {
              text: 'You know how opinionated my mum is; she holds strong opinions about everything and there is no way to make her change her mind. The other day she started criticising my 16-year-old cousin, who dyed her hair strawberry blond. No doubt it meant, she said, that she was seeking attention, or maybe she had mental issues. and a psychologist should be called in before something even more terrible happens.',
            },
            {
              text: 'You know my girlfriend Dorota. She\'s a quiet, withdrawn girl, always shy in the company of new people. So I was a bit worried when my mum decided that it was time the family got to know her and that she should be invited to the family celebration of my birthday next weekend. I told Dorota about it and although she looked a bit nervous, I managed to convince her that it would be a relaxed family lunch, nothing to worry about.',
            },
            {
              text: 'I think you\'ll understand why I was completely shocked when I met her yesterday, and saw that she had dyed her hair blue!!! She explained that she had decided to change something about her appearance to spice things up and now that she had eventually taken the step she felt fantastic, like a new person. If it wasn\'t for my mother, who she\'ll meet in a week\'s time, I would agree that it\'s just a fun thing to do, a harmless way to look different, BUT…, I really don\'t want to imagine the moment when I introduce her to my mum. What do you think? Is there anything I could do to prevent a catastrophe?',
            },
          ],
          items: [
            {
              id: '2',
              type: 'production',
              prompt: ['Write an email of 100-120 words to Pavel in which you tell him what you think'],
              contentPoints: ['of teenagers dying their hair,', 'of his mother\'s opinion,', 'of Dorota\'s explanation,', 'he could do in this situation.'],
              promptAfter: ['Begin your email like this:'],
              minWords: 100,
              maxWords: 120,
              opening: 'Hi,',
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
