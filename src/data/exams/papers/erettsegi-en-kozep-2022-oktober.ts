// Angol nyelv, középszintű írásbeli érettségi, 2022. október 20. (2211), Oktatási Hivatal.
// Transcribed verbatim from the feladatlap and its javítási-értékelési útmutató (answer key,
// conversion tables, listening transcripts). Decorative photos are left out.
import type { ExamPaper } from '../types'
import { choices, cloze, enListeningIntro, EN_NOTICES_HU, gapMcqs, heard, questions, TFN, tfn, words } from './enKozep.ts'

const paper: ExamPaper = {
  id: 'erettsegi-en-kozep-2022-oktober',
  type: 'erettsegi',
  language: 'en',
  level: 'kozep',
  sittingLabelHu: '2022. október',
  source: 'Oktatási Hivatal: Angol nyelv, középszintű írásbeli vizsga, 2022. október 20. (2211) — feladatlap és javítási-értékelési útmutató.',
  noticesHu: EN_NOTICES_HU,
  sections: [
    {
      id: 'I',
      kind: 'reading',
      titleHu: 'I. Olvasott szöveg értése',
      timeLimitMin: 60,
      // útmutató p. 3: feladatpont 0–28 → vizsgapont
      conversion: [0, 1, 2, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 17, 18, 19, 20, 21, 22, 24, 25, 26, 27, 28, 29, 31, 32, 33],
      tasks: [
        {
          id: 'I-1',
          label: 'Task 1',
          instructions:
            'Read the following collection of frequently asked questions and answers from the website of a language school. All of the questions have been removed. Your task is to write the letters of the questions (A-K) next to the appropriate numbers (1-7). There are two extra questions that you do not need. Write the letters in the white boxes as in the example (0).',
          passage: [
            { style: 'title', text: 'FAQS LANGUAGE COURSES UK' },
            { text: 'Cannot find the information you are looking for? Email info@languagecoursesuk.co.uk for a response within 24 hours.' },
            { text: '{{0}} Our evening courses are for adults of all ages and for all levels from beginners upwards. For most courses, the average age range will be mid-20s to mid-40s.' },
            { text: '{{1}} Our maximum class size is 12 students per class for face-to-face courses. If the course takes place online, the maximum class size is 10.' },
            { text: '{{2}} If you are unsure where to start or progress to, take our online placement test.' },
            { text: '{{3}} The earlier the better. If we don\'t receive enough bookings for a course, we will regrettably have to cancel it.' },
            { text: '{{4}} Yes, if there is space in the classes, we can take bookings for students to join the class a week later, although there will be no discount on the price.' },
            { text: '{{5}} No, the entire amount must be paid by card at time of booking.' },
            { text: '{{6}} No, our coursebook CDs are designed to be used in class and with a teacher; they are not designed for self-study.' },
            { text: '{{7}} Although we can\'t guarantee that your teacher will be available, we\'ll do our best to assign them to your next level.' },
          ],
          bankTitle: 'QUESTIONS',
          bank: [
            { key: 'A', text: 'Will I get a copy of the listening materials that are used in the class?' },
            { key: 'B', text: 'Can I pay a deposit and then pay the rest of the fee later?' },
            { key: 'C', text: 'What is the profile of the students on the courses?' },
            { key: 'D', text: 'What is the minimum number of students?' },
            { key: 'E', text: 'How do I know what level I am?' },
            { key: 'F', text: 'If I like my teacher and classmates, can I continue with them next term?' },
            { key: 'G', text: 'Am I allowed a discount if I book two courses?' },
            { key: 'H', text: 'How big are the classes?' },
            { key: 'I', text: 'Can I join a class in the second week?' },
            { key: 'K', text: 'How soon should I enrol?' },
          ],
          unusedBankCount: 2,
          examples: choices(0, 'C'),
          items: choices(1, 'H E K I B A F'),
        },
        {
          id: 'I-2',
          label: 'Task 2',
          instructions:
            'In the following text about volunteering, the headings have been removed. Your task is to match the headings to the paragraphs. Write the letters of the headings (A-H) next to the appropriate numbers (8-12). There are two extra headings that you do not need. Write the letters in the white boxes as in the example (0).',
          passage: [
            { style: 'title', text: 'VOLUNTEERING' },
            {
              text: 'Volunteering is an opportunity to change lives, including your own. If you\'d like to support a cause but can\'t afford to donate money, you can donate your time instead. So how do you go about it?',
            },
            {
              text: '{{0}} When volunteering, you can pick what really interests you and who or what is most deserving of your time. Here are some ideas to get you started:',
            },
            {
              text: '{{8}} Become a camp counsellor, or volunteer for an after-school sports program. Provide homework help in a specific subject or become a reading partner for students who struggle with reading.',
            },
            {
              text: '{{9}} Serve Christmas dinner to the homeless, volunteer at your local food bank, or distribute toys to kids. Local charities also may be able to use your help then.',
            },
            {
              text: '{{10}} Most shelters depend on volunteers to keep the cats and dogs happy and well exercised. And when you\'re walking rescued dogs, you get a workout too.',
            },
            {
              text: '{{11}} Join a conservation group and count wildlife or plants. Take part in a local park clean-up day. You don\'t have to be an outdoors type — you could help out in a park office or education centre as well.',
            },
            {
              text: '{{12}} Lots of us are close to people who have a medical problem. It can feel good to donate your time to an organization that raises money for research, delivers meals, or offers other help to people with an illness.',
            },
            { text: 'Volunteering gives you a place to be where you can have a good time, keep busy and make the world a better place.' },
          ],
          bankTitle: 'HEADINGS',
          bank: [
            { key: 'A', text: 'Find what fits your timetable' },
            { key: 'B', text: 'Look after abandoned pets' },
            { key: 'C', text: 'Find what\'s best for you' },
            { key: 'D', text: 'Support a health-related cause' },
            { key: 'E', text: 'Help the environment' },
            { key: 'F', text: 'Help and see the world' },
            { key: 'G', text: 'Help during the holiday season' },
            { key: 'H', text: 'Help kids learn and grow' },
          ],
          unusedBankCount: 2,
          examples: choices(0, 'C'),
          items: choices(8, 'H G B E D'),
        },
        {
          id: 'I-3',
          label: 'Task 3',
          instructions:
            'Read this article about a meteorite that landed in a Canadian home and then read the statements (13-19) following it. Mark a statement A if it is true according to the article, mark it B if it is false, and mark it C if there isn\'t enough information in the text to decide if it is true or not. Write the letters in the white boxes next to the numbers as in the example (0). A = TRUE B = FALSE C = THE TEXT DOES NOT SAY',
          passage: [
            { style: 'title', text: 'METEORITE CRASH-LANDED IN A CANADIAN WOMAN\'S BED WHILE SHE SLEPT' },
            {
              text: 'When Ruth Hamilton woke up on October 3 to the sound of her dog barking, followed shortly by an explosion and drywall pieces falling on her face, she was afraid there was a burglar in the house. But instead, she noticed a dark grey rock behind her pillows that matched the size of the hole in her ceiling.',
            },
            {
              text: 'The police officer who visited Ms Hamilton\'s home first suspected that a nearby building site might be responsible for the damage. But the construction workers made the officer think of another explanation. They had heard a loud noise and seen an explosion in the sky just before Ms Hamilton reported the incident. “The police officer came back in and said: ‘Well, I think you have a meteorite in your bed,’” says Ms Hamilton.',
            },
            {
              text: 'Ms Hamilton shared the space-rock, which weighs about 1.3 kilograms, with researchers at the University of Western Ontario, which has a collection of meteorites, so they can study it further. "It\'s certainly a meteorite," says meteor physicist Peter Brown, member of the research team. "Everything about the story pointed to a meteorite fall, and the fact that the bright fireball had occurred basically right at the same time made it a pretty obvious case."',
            },
            {
              text: 'The researchers are asking local residents for videos that may have captured the fall of the fireball. They can use video to reconstruct the path that the meteorite followed from the asteroid belt to Earth.',
            },
            {
              text: 'Ms Hamilton considers herself lucky to be unharmed. “I didn\'t get hurt,” she says. “I didn\'t even get a scratch. So, all I had to do is have a shower and mop the floor.”',
            },
            {
              text: 'Because the meteorite landed on Ms Hamilton\'s property, it belongs to her, and she plans to keep it as a souvenir of the unusual night. Her grandchildren also think it\'s pretty cool.',
            },
          ],
          options: TFN,
          examples: [{ id: '0', type: 'mcq', stem: 'Ruth Hamilton was woken up by pieces of wall falling on her bed.', answer: 'B' }],
          items: tfn(
            13,
            [
              'The incident happened shortly after midnight.',
              'Ruth Hamilton\'s home had been broken into before.',
              'The construction workers did not notice anything strange.',
              'Researchers are sure that the rock is a meteorite.',
              'Residents will be paid a small sum of money for sharing videos that capture the fireball.',
              'Ms Hamilton did not get injured when the space-rock hit her home.',
              'Ms Hamilton has given the meteorite to her grandchildren as a souvenir.',
            ],
            'C C B A C A B',
          ),
        },
        {
          id: 'I-4',
          label: 'Task 4',
          instructions:
            'Read this article about a library delivery service. Some parts of sentences have been left out from the text. Your task is to reconstruct the text by filling in the gaps (20-28) from the list (A-M) below. Write the letters in the white boxes next to the numbers as in the example (0). Remember that there are two extra letters that you do not need.',
          passage: [
            { style: 'title', text: 'DRONE DELIVERS BOOKS TO KIDS' },
            {
              text: 'Kids in the Montgomery County school district had a special way of getting books to read when the pandemic started: the books were {{0}}. A drone is a small remote-controlled aircraft, like a toy-sized plane or helicopter.',
            },
            {
              text: 'Kelly Passek is a librarian at a local school. When schools closed because of the Covid-19 pandemic, she wanted to make sure students in her school district would still {{20}}.',
            },
            {
              text: 'A company called Wing Aviation uses drones to {{21}} from restaurants and stores in Ms Passek\'s town. She had used the drone service to have things delivered to her own home, and she thought it could {{22}}.',
            },
            {
              text: 'The people at Wing agreed and the company began making deliveries. Students who {{23}} could fill out a Google form to request a specific book, or ask Ms Passek to choose one for them.',
            },
            { text: 'Ms Passek received the requests, then got the books from the library, {{24}}, and took them to Wing\'s shipping centre.' },
            {
              text: 'Wing {{25}}, which flew to the delivery location, lowered the book on a cable, and released it when it was close to the ground.',
            },
            {
              text: 'The first book sent out this way – and maybe the first library book ever to be delivered by drone – was All Quiet on the Western Front, by Erich Maria Remarque. It was {{26}} in the district.',
            },
            {
              text: 'The drones have a wingspan of about one metre, and weigh about 4.5 kilograms. They can carry packages that weigh up to 1.3 kilograms, so students were {{27}}.',
            },
            { text: 'Students have now {{28}}, but many are hoping to use the drone service in the future.' },
          ],
          bank: [
            { key: 'A', text: 'have access to books' },
            { key: 'B', text: 'work for delivering books to students, too' },
            { key: 'C', text: 'delivered to their homes by drones' },
            { key: 'D', text: 'required summer reading for a 14-year-old student' },
            { key: 'E', text: 'used school buses to deliver reading material to kids' },
            { key: 'F', text: 'loaded each book onto a drone' },
            { key: 'G', text: 'deliver food and other items' },
            { key: 'H', text: 'lived in the delivery zone' },
            { key: 'I', text: 'allowed to request more than one book' },
            { key: 'K', text: 'put them in a special package' },
            { key: 'L', text: 'find a satisfied customer' },
            { key: 'M', text: 'returned to in-person classes' },
          ],
          unusedBankCount: 2,
          examples: choices(0, 'C'),
          items: choices(20, 'A G B H K F D I M'),
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
            'You are going to read an article about a new way of gardening. Some words are missing from the text. Use the words in brackets to form the words that fit in the gaps (1-8). Then write the appropriate form of these words on the lines after the text. There might be cases when you do not have to change the word in brackets. Use only one word for each gap. There is an example (0) at the beginning.',
          passage: [
            { style: 'title', text: 'RENT A GOAT' },
            {
              text: 'It\'s hard to keep your backyard tidy and {{0}} without harming the Earth. Just consider the tools. Lawn mowers use fossil fuels, adding to the {{1}} of the atmosphere every time you push them across the grass.',
            },
            {
              text: 'That\'s why many are trying out a more {{2}} form of lawn care and management: goats. According to Forbes, goat rentals are becoming a(n) {{3}} service for homeowners and farmers who want to get their land under control.',
            },
            {
              text: 'Goat rental businesses function very simply. Customers call in with the {{4}} of their land — the size, the landscape, and any other important features. Then the goat rental service makes a(n) {{5}}. Once the price is settled, the two parties agree on a(n) {{6}} date of service. On that day, the goats arrive. They graze the grass until the evening, then leave, and possibly return the next morning if the size of the job makes it necessary. When their work is done, customers are left with a freshly manicured lawn, achieved without burning any fossil fuel.',
            },
            {
              text: 'These {{7}} businesses can send 100 or more goats at a time. Goats offer obvious {{8}} benefits, since they replace both mowers and chemical insect killers.',
            },
          ],
          examples: words(0, [['health', 'healthy']]),
          items: words(1, [
            ['pollute', 'pollution'],
            ['nature', 'natural'],
            ['fashion', 'fashionable', 'in-fashion'],
            ['describe', 'description'],
            ['offer', 'offer'],
            ['suit', 'suitable'],
            ['create', 'creative'],
            ['environment', 'environmental'],
          ]),
        },
        {
          id: 'II-2',
          label: 'Task 2',
          instructions:
            'You are going to read an article about the mystery of the Hanging Gardens of Babylon. Some words are missing from the text. Choose the most appropriate answer from the options (A-D) for each gap (9-16) in the text. Write the letter of the appropriate answer in the white box. There is one example (0) at the beginning.',
          passage: [
            { style: 'title', text: 'THE HANGING GARDENS OF BABYLON' },
            {
              text: 'Ancient writers describe a fantastic series {{0}} gardens constructed at the ancient city of Babylon in modern-day Iraq. It\'s not clear when these gardens {{9}} built, but some writers were {{10}} impressed that they called them a “wonder of the world”. Around 250 B.C., Philo of Byzantium wrote that the Hanging Gardens had “plants grown at a height above ground level, and the roots are planted in an upper terrace rather {{11}} in the earth.”',
            },
            {
              text: 'So {{12}}, archaeologists who have excavated Babylon have been unable to find the remains of the garden. This {{13}} left archaeologists with a question: {{14}} the hanging gardens really exist? In 2013, a researcher at the University of Oxford proposed that the gardens were actually located at the Assyrian city of Nineveh. Over the {{15}} two decades, both Babylon and Nineveh have suffered damage from wars, and it seems {{16}} that this mystery will ever be solved.',
            },
          ],
          examples: gapMcqs(0, [['with', 'in', 'of', 'about']], 'C'),
          items: gapMcqs(
            9,
            [
              ['might be', 'were', 'had', 'have been'],
              ['as', 'very', 'so', 'much'],
              ['then', 'there', 'than', 'that'],
              ['far', 'much', 'many', 'that'],
              ['has', 'had', 'never', 'was'],
              ['How', 'Must', 'Would', 'Did'],
              ['passed', 'past', 'several', 'late'],
              ['certain', 'unlikely', 'likely', 'certainly'],
            ],
            'B C C A A D B B',
          ),
        },
        {
          id: 'II-3',
          label: 'Task 3',
          instructions:
            'You are going to read about a journalist\'s experiences in the Bahamas. Some words are missing from the text. Your task is to write the missing words on the dotted lines (17-25) after the text. Use only one word in each gap. There is an example (0) at the beginning.',
          passage: [
            { style: 'title', text: 'WHERE PIGS SWIM FREE' },
            { text: 'For more than 30 years, I have photographed animals. It is important to me to portray animals as having their {{0}} thoughts and personalities.' },
            {
              text: 'I heard about the swimming pigs from an Englishwoman, who told me that she was 300 feet offshore in the Bahamas when a pig smelled her pizza and swam out to ask {{17}} a bite.',
            },
            {
              text: 'The pigs live on Big Major Cay, a tiny, uninhabited island with thick forests. About a dozen pigs live here, and {{18}} are different stories about how that happened. Some say the pigs swam to the island after a shipwreck; {{19}} say sailors left them here, planning to come back and eat them. Recently, they\'ve become celebrities. The comedian Amy Schumer posted a photograph on Instagram {{20}} showed her and her buddies hanging {{21}} with one of the pigs on the island.',
            },
            {
              text: 'On the island, the pigs are very tolerant of tourists. They expect {{22}} be fed. When I was there in February, a lot of people brought salad and bread. My guide, Dreko, said the pigs prefer anything {{23}} salad, as they already have that on the island, but being pigs, they ate it all.',
            },
            {
              text: 'All in {{24}}, it was more interesting to watch the people. They want this exciting pig experience and can become unbelievably and noisily happy, {{25}} spite of the fact that they probably ate bacon and eggs for breakfast.',
            },
          ],
          examples: cloze(0, [['own']]),
          items: cloze(17, [
            ['for'],
            ['there', 'here'],
            ['others', 'some', 'many'],
            ['that', 'which'],
            ['out', 'around'],
            ['to'],
            ['to', 'over', 'but'],
            ['all'],
            ['in'],
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
        storagePath: 'erettsegi-en-kozep-2022-oktober.mp3',
        durationSec: 1795,
        // Task starts: the ~60 s reading pause of each task found by silence detection, minus the length of its announcement (approximate, ±10 s).
        taskMarkers: [
          { taskId: 'III-1', startSec: 109 },
          { taskId: 'III-2', startSec: 663 },
          { taskId: 'III-3', startSec: 1195 },
        ],
      },
      // útmutató p. 7: feladatpont 0–25 → vizsgapont
      conversion: [0, 1, 3, 4, 5, 7, 8, 9, 11, 12, 13, 15, 16, 17, 18, 20, 21, 22, 24, 25, 26, 28, 29, 30, 32, 33],
      transcripts: [
        {
          taskId: 'III-1',
          title: 'Mária Telkes',
          paragraphs: [
            'Mária Telkes was a Hungarian-American scientist and inventor who worked on solar energy technologies and she is best known for designing the first solar-powered heating system for houses. That is why her nickname was “the Sun Queen”.',
            'Mária Telkes was born in Hungary in 1900. She attended elementary and high school in Budapest. She then studied physical chemistry at the University of Budapest, where she earned a bachelor\'s degree in 1920. A doctoral degree and a teaching position at the school followed in 1924.',
            'Telkes decided to move to the United States after visiting a relative in Cleveland, Ohio. In 1925 she accepted a position as a scientist for the Cleveland Clinic Foundation. There she worked with a surgeon to create a device that recorded brain waves.',
            'Telkes became a U.S. citizen in 1937. That same year she became a research engineer at Westinghouse Electric. There she developed instruments that converted heat into electrical energy. She began her research into solar energy in 1939.',
            'During World War II, Telkes created one of her most important inventions—a device that used solar power to make seawater drinkable. The system was carried aboard lifeboats and saved the lives of many sailors and airmen.',
            'In 1948, Telkes helped design Dover Sun House, the world\'s first modern home heated with solar energy. The system worked with the sunlight passing through glass windows, which would heat the air inside the glass. This heated air then passed through a metal sheet into another air space. From there, fans moved the air to a storage compartment filled with salt, which heated the house as it cooled. She continued to develop solar-energy applications until the end of her career.',
            'Telkes retired in 1977. She received many awards and honors, including the first Society of Women Engineers Achievement Award. Mária Telkes died in Budapest in 1995.',
          ],
        },
        {
          taskId: 'III-2',
          title: 'Interview with a street musician',
          paragraphs: [
            'R: Here in the studio we have Stefano Rosa, a street musician from Italy. Stefano, thanks for being with us.',
            'S: Thanks for having me.',
            'R: What were your reasons for choosing the street as your stage?',
            'S: I used to play in clubs and cafés but the people there didn\'t give a damn about what I was doing. And I had to satisfy the owner\'s taste and I rarely earned the money I asked for. Playing on the street means freedom. No one is telling me what do. I decide when, where and what to play and if I feel like it, I will play the same song again.',
            'R: Who inspired you to become a musician?',
            'S: I grew up in a family of musicians. My mother taught music at school for years and my brother is a professional pianist. I started to listen to music when I was about 13 years old and I immediately fell in love with rock music.',
            'R: How long have you been making music on the street and what instruments do you play?',
            'S: I\'ve been giving performances for five years now. I prefer to consider myself a guitarist first of all. I started singing just because I had to if I wanted to attract audiences.',
            'R: Do you usually perform alone or together with other musicians?',
            'S: I often play alone. I shared the street also with some friends occasionally but I sincerely prefer to play alone because I have my own way to perform.',
            'R: How much time do you spend performing on the street?',
            'S: I usually play twice a week for a total of six hours.',
            'R: What was the most wonderful interaction you\'ve had as a street musician?',
            'S: I remember a couple of British girls in Piazza Duomo in Milan who started dancing and throwing colourful paper hearts all around me. It was very touching.',
            'R: Perhaps you already saw this question coming! What was the most uncomfortable experience you\'ve had as a street musician?',
            'S: A drunk dude in Pisa kept moving the microphone away from my mouth because he said that I was stealing his area. Actually, I find episodes like this very funny and I don\'t ever get annoyed.',
            'R: Stefano, thanks for your interview.',
            'S: My pleasure.',
          ],
        },
        {
          taskId: 'III-3',
          title: 'Ewa Wiśnierska',
          paragraphs: [
            'Ewa Wiśnierska is a Polish-German paraglider who won the Paragliding World Cup on several occasions. However, this is not what she is most famous for.',
            'On the 14th of February, 2007, Ewa was part of a group of 200 paragliders who were practising in New South Wales, Australia for the world championship. Although weather reports had predicted violent thunderstorms, Ewa decided to fly. She wasn\'t afraid because the sun was shining brightly and there were no clouds in the sky. She checked that her GPS and her radio were functioning well and she started to fly. Her team mates were following her in a van on the ground and communicating with her over the radio.',
            'No sooner had Ewa started to fly than she saw two enormous storm clouds in front of her. In no time, she found herself between them. There were flashes of lightning around her. She quickly realized she was in the middle of a thunderstorm. The forces of nature suddenly moved her from an altitude of 2,500 m to 6,900 m. At that height, she didn\'t know what was happening around her anymore because she had lost consciousness. However, her GPS recorded that she even went as high as 9,940 m. She was much higher than Mount Everest! She was at a height where aeroplanes fly! Ewa was low on oxygen and the temperature was -40 degrees. She was dressed warmly for her flight but no one can be prepared for such freezing cold temperature. Her body and her paraglider were completely covered in ice. This extra weight made Ewa free fall from the sky. What happened next was an unbelievable miracle. Her paraglider opened up on its own, the wings came out and stopped her free fall. She finally landed about 60 km of her starting position.',
            'Thanks to her electronic devices, Ewa was able to contact with her team mates and tell them where she was. However, she was so weak that she couldn\'t move her hands, legs or body. Luckily, her team mates arrived just in time to get Ewa out of her icy clothes and the paraglider and covered her in blankets. They soon arrived at the hospital where she was properly treated. Apart from some mild frostbites and minor bruises on her hands and legs, she suffered no other injuries.',
            'Ewa got well surprisingly quickly. After only six days she was back up gliding through the skies. Australia\'s most experienced paraglider said that Ewa\'s survival was like winning the lottery ten times in a row.',
          ],
        },
      ],
      tasks: [
        {
          id: 'III-1',
          label: 'TASK 1',
          instructions:
            'In this section, you will hear about the life of a famous scientist. Your task is to complete the sentences with one word or number in each gap, using the exact words you hear. First, you will have some time to study the task, and then we will play the whole recording in one piece. Then you will hear the recording again, but this time we will play the text in shorter sections to give you enough time to write down your answers.',
          examples: heard(0, [['Mária Telkes was a Hungarian-American scientist and ________ .', 'inventor']]),
          items: heard(1, [
            ['Her nickname was “the Sun ________ ”.', 'Queen', 'queen'],
            ['At the University of Budapest she studied physical ________ .', 'chemistry'],
            ['She started teaching in the year ________ .', '1924'],
            ['Her device at the Cleveland Clinic Foundation recorded ________ waves.', 'brain'],
            ['In 1937 she became a(n) ________ engineer at Westinghouse Electric.', 'research'],
            ['At Westinghouse Electric, she converted ________ into electrical energy.', 'heat'],
            ['Her invention saved the lives of many ________ and airmen.', 'sailors'],
            ['In Dover Sun House, the storage compartment was filled with ________ .', 'salt'],
            ['It was in 1977 that Mária Telkes ________ .', 'retired'],
          ]),
        },
        {
          id: 'III-2',
          label: 'TASK 2',
          instructions:
            'In this section you will hear a radio interview with a street musician. Your task will be to decide whether the following statements are true, false or we do not know because the text does not say, and write the appropriate letter in the boxes on the right. Write A if the statement is true, write B if the statement is false, and write C if the text does not say. First, you will have some time to study the task, and then we will play the whole recording in one piece. Then, you will hear the recording again, but this time we will play the text in shorter sections to give you enough time to write down your answers. A = TRUE B = FALSE C = THE TEXT DOES NOT SAY',
          options: TFN,
          examples: [{ id: '0', type: 'mcq', stem: 'Stefano Rosa is an Italian street musician.', answer: 'A' }],
          items: tfn(
            10,
            [
              'Stefano was satisfied with the money he earned in clubs and cafés.',
              'Stefano never plays the same song twice.',
              'Stefano\'s mother taught music to her own children too.',
              'Stefano has been listening to rock music since he was a very small child.',
              'Stefano thinks he is a guitarist rather than a singer.',
              'Stefano prefers performing with other musicians to playing on his own.',
              'Stefano never plays on Sundays.',
              'The British girls in Piazza Duomo in Milan were very pretty.',
              'A drunk guy in Pisa stole Stefano\'s microphone.',
            ],
            'B B C B A B C C B',
          ),
        },
        {
          id: 'III-3',
          label: 'TASK 3',
          instructions:
            'In this section you will listen to a true survival story. Your task will be to write the letter of the correct answer into the boxes on the right. First, you will have some time to study the task, and then we will play the whole recording in one piece. Then you will hear the recording again, but this time we will play the text in shorter sections to give you enough time to write down your answers.',
          examples: [
            {
              id: '0',
              type: 'mcq',
              stem: 'Ewa Wiśnierska is a(n)…',
              options: [{ key: 'A', text: 'artist.' }, { key: 'B', text: 'sportsperson.' }, { key: 'C', text: 'scientist.' }],
              answer: 'B',
            },
          ],
          items: questions(
            19,
            [
              { stem: 'Ewa was practising...', options: ['on her own.', 'in Australia.', 'for the European championship.'] },
              { stem: 'Ewa wasn\'t afraid thanks to …', options: ['the promising weather forecast.', 'the clear skies.', 'her previous experience.'] },
              { stem: 'Ewa...', options: ['lost control of her paraglider.', 'decided to fly as high as she could.', 'checked her GPS at 6,900 metres.'] },
              { stem: 'Ewa was…', options: ['flying nearly as high as Mount Everest.', 'almost hit by an aeroplane.', 'wearing warm clothing.'] },
              { stem: 'Ewa...', options: ['and her paraglider got totally icy.', 'managed to open her paraglider.', 'landed very close to where she had started.'] },
              { stem: 'Ewa was able to…', options: ['tell her team mates her position.', 'take off her icy clothes.', 'cover herself in warm blankets.'] },
              { stem: 'Ewa didn\'t …', options: ['need to be taken to hospital.', 'have any injuries at all.', 'wait long to continue paragliding.'] },
            ],
            'B B A C A A C',
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
          instructions: 'You have found the following advertisement on a site called Language Exchange:',
          passage: [
            { style: 'bullet', text: 'Name: James' },
            { style: 'bullet', text: 'Age: 19' },
            { style: 'bullet', text: 'Languages: Hungarian-English' },
            { style: 'bullet', text: 'City, State or Province: Santa Rosa, California' },
            { style: 'bullet', text: 'Country: US' },
            { style: 'bullet', text: 'Lessons: Conversation online' },
            { style: 'heading', text: 'Description' },
            {
              text: 'Hello, I have been interested in Hungary for some years and also took language lessons a couple of years ago. Now I plan to apply for a teaching assistant job in a Hungarian language school and I have decided to dedicate this year to refreshing my speaking skills. Unfortunately, I have no-one here to practise with, so I\'m looking for a native speaker of Hungarian who would be happy to have a chat with me online as many times a week as they can afford. In return, every second occasion we can switch to English so you can improve your colloquial conversational skills too. Reply below if interested.',
            },
          ],
          items: [
            {
              id: '1',
              type: 'production',
              prompt: ['Write a reply of 80-100 words to James in which you'],
              contentPoints: [
                'say why you find his idea inspiring,',
                'say how many times and hours a week you are free for online chatting,',
                'ask him about his level of Hungarian and tell him about your level of English.',
              ],
              promptAfter: ['Begin your reply like this:'],
              minWords: 80,
              maxWords: 100,
              opening: 'Hi James,',
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
          instructions: 'You received the following email from your British friend, Jasmin, who is studying in Durham:',
          passage: [
            {
              text: 'I found a wonderful ad on the internet two weeks ago; someone was looking for a responsible, caring person to walk his dog for him once a day for an hour while he was at work. That\'s me, I thought, so I phoned him straight away. It turned out that the dog was an adult Rotweiler, Hansi, a rescue dog, and the guy, Phil, offered me £15 per hour (normally it\'s £8-10). I felt very lucky.',
            },
            {
              text: 'Before the first walk I had a hasty word with Phil, who gave me the key to the back door and that was it. Hansi was also very friendly and seemed to like me immediately.',
            },
            {
              text: 'The first walk, however, proved to be a disaster. After greeting me enthusiastically, Hansi stopped at the first grassy spot 150 m from the house and refused to move any further. I did everything I could, including begging him, but nothing worked. When I eventually gave up, he was absolutely delighted to be back home and licked my face affectionately.',
            },
            {
              text: 'The situation hasn\'t improved ever since, although Hansi and I have become best friends. And anyway, if Hansi is happy with these super short walks and Phil is happy knowing that his dog is in good hands (and he certainly is), why should I bother? But I felt such a cheat when I found my weekly payment (£75!!!) on my bank account at the end of the first week.',
            },
            { text: 'What do you think? Am I right to feel bad about it? What shall I do?' },
          ],
          items: [
            {
              id: '2',
              type: 'production',
              prompt: ['Write an email of 100-120 words to Jasmin in which you tell her'],
              contentPoints: [
                'whether you think she is really cheating,',
                'what she could do to improve the situation with the dog,',
                'whether she should discuss the problem with the dog\'s owner,',
                'who else she could turn to for help.',
              ],
              promptAfter: ['Begin your email like this:'],
              minWords: 100,
              maxWords: 120,
              opening: 'Hi Jasmin,',
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
