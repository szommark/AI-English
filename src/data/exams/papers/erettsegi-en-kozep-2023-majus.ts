// Angol nyelv, középszintű írásbeli érettségi, 2023. május 11. (2311), Oktatási Hivatal.
// Transcribed verbatim from the feladatlap and its javítási-értékelési útmutató (answer key,
// conversion tables, listening transcripts). Decorative photos are left out.
import type { ExamPaper } from '../types'
import { choices, cloze, enListeningIntro, EN_NOTICES_HU, heard, questions, TFN, tfn, words } from './enKozep.ts'

const paper: ExamPaper = {
  id: 'erettsegi-en-kozep-2023-majus',
  type: 'erettsegi',
  language: 'en',
  level: 'kozep',
  sittingLabelHu: '2023. május',
  source: 'Oktatási Hivatal: Angol nyelv, középszintű írásbeli vizsga, 2023. május 11. (2311) — feladatlap és javítási-értékelési útmutató.',
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
            'Read the following questions and answers from the website of a library. The questions have been removed. Your task is to write the letters of the questions (A-M) next to the appropriate numbers (1-9). There are two extra questions that you do not need. Write the letters in the white boxes as in the example (0).',
          passage: [
            { style: 'title', text: 'CITY LIBRARY FREQUENTLY ASKED QUESTIONS' },
            { text: 'Thank you for being interested in learning more about the City Library. Answers to the most common questions about our services can be found below.' },
            { text: '{{0}} You can apply for one in person at the circulation desk. You must bring a photo I.D. and a document that shows your address.' },
            { text: '{{1}} No, registration is free for local residents. However, people who live outside the city are required to pay if they want to join the library.' },
            { text: '{{2}} Check the dates on the card. You may need to renew your membership. Cards are valid for two years.' },
            { text: '{{3}} You can check out up to 20 items at a time, including books, e-books, magazines, CDs and DVDs.' },
            { text: '{{4}} Yes, but only if they can show your library card at the desk.' },
            { text: '{{5}} The loan period is four weeks. If you would like to keep the items longer, you may renew them in person or online.' },
            { text: '{{6}} Up to two times if no one else is waiting for them.' },
            { text: '{{7}} You will need to pay the replacement cost of the material that you are unable to return in the original condition.' },
            { text: '{{8}} Pencils, paper and a laptop. Bags bigger than A4 size and other items, such as food, drink and pens, must be left in lockers on the ground floor.' },
            { text: '{{9}} Yes, our librarians will place the request for you. However, depending on where it comes from, it can take a week or longer for the item to arrive.' },
          ],
          bankTitle: 'QUESTIONS',
          bank: [
            { key: 'A', text: 'What other services does the library offer besides lending materials?' },
            { key: 'B', text: 'Can someone else pick up my books?' },
            { key: 'C', text: 'How do I get a library card?' },
            { key: 'D', text: 'If the library doesn\'t have a title I\'m looking for, is it possible to order it from another library?' },
            { key: 'E', text: 'Do you charge a fine if the items are not returned in time?' },
            { key: 'F', text: 'What can I do if my library card is not accepted?' },
            { key: 'G', text: 'Is there a membership fee?' },
            { key: 'H', text: 'How many books can I borrow?' },
            { key: 'I', text: 'What can I take into the reading rooms?' },
            { key: 'K', text: 'How long can I keep my borrowed materials?' },
            { key: 'L', text: 'How many times can I renew the items that I borrowed?' },
            { key: 'M', text: 'What happens if I lose or damage the borrowed item?' },
          ],
          unusedBankCount: 2,
          examples: choices(0, 'C'),
          items: choices(1, 'G F H B K L M I D'),
        },
        {
          id: 'I-2',
          label: 'Task 2',
          instructions:
            'Read this article about providing internet service to mountain climbers. Some sentences have been left out from the text. Your task is to reconstruct the text by filling in the gaps (10-15) from the list (A-I) below. Write the letters in the white boxes next to the numbers as in the example (0). Remember that there are two extra letters that you do not need.',
          passage: [
            { style: 'title', text: 'MOUNT KILIMANJARO GETS INTERNET SERVICE' },
            {
              text: 'At 5,895 meters, Mount Kilimanjaro is the highest mountain in Africa. {{0}} It rises out of a large, flat area in Tanzania and Kenya. The mountain is part of Kilimanjaro National Park, which has around 50,000 visitors each year. {{10}} But climbing Africa\'s tallest mountain isn\'t easy. It has snowy glaciers surrounding its peak. {{11}}',
            },
            {
              text: 'The government of Tanzania has recently set up a high-speed internet service on the mountain to make it easier for climbers to reach the top. They\'ll be able to use the internet to check the weather and use navigation tools. {{12}}',
            },
            {
              text: 'The government says safety is the main reason for setting up the internet service on the mountain. {{13}} Having people post selfies on social media as they work their way up the tallest mountain could certainly make the spot even more popular with visitors. Residents in Tanzania, however, are upset that the government is focusing on tourists instead of helping the people who live in the country. {{14}}',
            },
            {
              text: 'Also with tourists in mind, last year the Tanzanian government approved a $72 million project to build a cable car on Mount Kilimanjaro to allow tourists who weren\'t climbers to enjoy the mountain. {{15}} It also bothered people who were worried about how the construction might affect the environment on the mountain. They point out that as a World Heritage site, Mount Kilimanjaro is a place which is important to protect.',
            },
          ],
          bank: [
            { key: 'A', text: 'As an added bonus, the tourist industry may benefit as well.' },
            { key: 'B', text: 'But the plan caused anger among climbers and expedition guides.' },
            { key: 'C', text: 'It\'s also the world\'s tallest mountain that\'s not part of a mountain range.' },
            { key: 'D', text: 'They\'ll also be able to call for help if they need it.' },
            { key: 'E', text: 'Scientists believe global warming is responsible for the loss of ice.' },
            { key: 'F', text: 'They became the first recorded European climbers to reach Kilimanjaro\'s summit in 1889.' },
            { key: 'G', text: 'Roughly one third of the people who try to climb it finally give up.' },
            { key: 'H', text: 'Most of them are trying to climb Mount Kilimanjaro.' },
            { key: 'I', text: 'Only about 83% of the population in Tanzania can get cell phone service where they live.' },
          ],
          unusedBankCount: 2,
          examples: choices(0, 'C'),
          items: choices(10, 'H G D A I B'),
        },
        {
          id: 'I-3',
          label: 'Task 3',
          instructions:
            'Read the following description of escape rooms available for adventurous teams and then read the half sentences that follow the text. Your task is to match the half sentences based on the information in the text. Write the letters (A-I) in the white boxes next to the numbers (16-21) as in the example (0). Remember that there are two extra letters that you will not need.',
          passage: [
            { style: 'title', text: 'CHOOSE YOUR ADVENTURE' },
            { text: 'If you\'re looking for a fun afternoon with friends, book one of our escape rooms. Here are the missions for your team to choose from.' },
            { style: 'heading', text: 'In The Yellow Room …' },
            {
              text: 'The Yellow Room: Spies must be removed from the ministry of wizards where you work. You have one hour to undertake a trial of magic to prove that you are true wizards.',
              itemId: '0',
            },
            { style: 'heading', text: 'In The Pink Room …' },
            {
              text: 'The Pink Room: You find yourselves on a mysterious island, home to strange animals and magical plants. You\'ll need to solve puzzles, unlock portals and find your way back to the real world.',
              itemId: '16',
            },
            { style: 'heading', text: 'In The Green Room …' },
            {
              text: 'The Green Room: Going on holiday overseas, your plane has crashed and now you\'re all stuck on a small island in the Pacific Ocean. With the weather getting worse, you need a place to hide until the rescue team finds you. You have 45 minutes to build a shelter.',
              itemId: '17',
            },
            { style: 'heading', text: 'In The Grey Room …' },
            {
              text: 'The Grey Room: The secret service has been working on locating and removing threats from the city centre. As a team of experts, you must find the last bomb at the top of a tower block and save the city.',
              itemId: '18',
            },
            { style: 'heading', text: 'In The Black Room …' },
            {
              text: 'The Black Room: Enter a mystical cave and navigate your way in the dark to find the magic lamp without being trapped forever. The cave is full of puzzles designed to guard the powerful lamp.',
              itemId: '19',
            },
            { style: 'heading', text: 'In The Blue Room …' },
            {
              text: 'The Blue Room: Step into 1942, when the world is at war. As MI6\'s top agents you\'ve been chosen to discover the location of the enemy\'s superweapons, destroy them and save Britain.',
              itemId: '20',
            },
            { style: 'heading', text: 'In The Red Room …' },
            {
              text: 'The Red Room: The mystery takes place at a research laboratory, where a professor has been killed by one of his colleagues. You and your team are detectives who are invited to solve the case and find the criminal.',
              itemId: '21',
            },
          ],
          bank: [
            { key: 'A', text: 'the story takes place in space.' },
            { key: 'B', text: 'the team has to escape from an imaginary island which is full of mystery.' },
            { key: 'C', text: 'your team must complete challenges to show that you are not spies.' },
            { key: 'D', text: 'the players have to prevent an explosion in a tall building.' },
            { key: 'E', text: 'the story is set in the past.' },
            { key: 'F', text: 'the story starts with an accident.' },
            { key: 'G', text: 'the team must save people from a sinking ship.' },
            { key: 'H', text: 'the team\'s mission is to solve a murder mystery.' },
            { key: 'I', text: 'the team will go underground to search for something.' },
          ],
          unusedBankCount: 2,
          examples: choices(0, 'C'),
          items: choices(16, 'B F D I E H'),
        },
        {
          id: 'I-4',
          label: 'Task 4',
          instructions:
            'Read this article about some scientific research and then read the statements (22-28) following it. Mark a statement A if it is true according to the article, mark it B if it is false, and mark it C if there isn\'t enough information in the text to decide if it is true or not. Write the letters in the white boxes next to the numbers as in the example (0). A = TRUE B = FALSE C = THE TEXT DOES NOT SAY',
          passage: [
            { style: 'title', text: 'SCIENTISTS LEARN THAT DOGS CAN SMELL STRESS' },
            {
              text: 'Scientists ran an experiment which showed that dogs can tell the difference between the smell of a person when they\'re relaxed and when they\'re stressed.',
            },
            {
              text: 'Researchers at Queen\'s University Belfast worked with four dogs and 36 humans. The dogs included in the study were pets, volunteered by their owners. First, researchers taught the dogs to use a special smell-testing device. Then, they collected sweat and breath samples from the human participants under two different conditions: in a non-stressful and a stressful situation. When people were calm, their blood pressure and heart rates were measured and then they were asked to wipe their skin with a clean piece of cloth. Then they had to put the cloth sample in a tube and breathe on it hard three times.',
            },
            {
              text: 'The study team then collected another round of breath and sweat samples a few minutes later, after the people had completed a difficult maths task, counting backward in their heads from 9,000 in units of 17 in front of two researchers for three minutes. The researchers kept telling the people to hurry up. After the task the participants reported feeling stressed, and their blood pressure and heart rate had gone up.',
            },
            { text: 'Then the dogs were given a relaxed and a stressed sample from each person. The dogs correctly identified the stressed sample in 94% of 720 tests.' },
            { text: 'The study provides evidence that dogs can smell stress from breath and sweat. Researchers say the skill could be useful when training therapy dogs.' },
          ],
          options: TFN,
          examples: [{ id: '0', type: 'mcq', stem: 'Four universities took part in the research.', answer: 'B' }],
          items: tfn(
            22,
            [
              'The experiment involved police dogs.',
              'Sweat and breath samples were collected from students.',
              'In the experiment the dogs smelled the participants\' clothes.',
              'The relaxed and stressed samples were taken on the same day.',
              'The stressful task lasted for three minutes.',
              'Each dog was given three samples to choose from.',
              'The study was published in an international journal.',
            ],
            'B C B A A B C',
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
            'You are going to read an article about what flight attendants don\'t like about some passengers\' behavior. Some words are missing from the text. Use the words in brackets to form the words that fit in the gaps (1-9). Then write the appropriate form of these words on the lines after the text. There might be cases when you do not have to change the word in brackets. Use only one word for each gap. There is an example (0) at the beginning.',
          passage: [
            { style: 'title', text: 'MAKE THEM HAPPY' },
            { text: 'We asked flight attendants about the most {{0}} things passengers do on planes.' },
            {
              text: 'As any frequent traveler will tell you, traveling by air can be a rather {{1}} experience, especially as more and more flights are {{2}} or canceled. But it\'s important to remember that {{3}} is a miracle, and those who help you get from point A to point B safely — your flight crew members — deserve the highest respect.',
            },
            {
              text: '"Our job is much more than serving food and drinks. We are safety professionals and are trained to handle {{4}} situations that can occur during a flight," Andy, a current crew member at a major airline, shared with Travel + Leisure.',
            },
            { text: 'So, how can you get treated like a VIP in the air by your cabin crew? It couldn\'t be {{5}}: be nice.' },
            { text: '"If you show me a little respect, I\'ll be more than happy to make your flight as {{6}} as possible," said Andy.' },
            {
              text: 'We carried out a survey to ask flight attendants about what passengers do that crew members find {{7}}. Here are the most offensive actions you should avoid: touching a crew member without their {{8}}, asking for water {{9}} upon boarding, using the bathroom at an inappropriate time, pressing the call bell every two minutes, and last but not least, not saying thank you.',
            },
          ],
          examples: words(0, [['irritate', 'irritating']]),
          items: words(1, [
            ['stress', 'stressful', 'stressed', 'stressing'],
            ['delay', 'delayed'],
            ['fly', 'flying', 'flight'],
            ['emerge', 'emergency', 'emergent', 'emerging'],
            ['simple', 'simpler'],
            ['enjoy', 'enjoyable'],
            ['annoy', 'annoying'],
            ['permit', 'permission'],
            ['immediate', 'immediately'],
          ]),
        },
        {
          id: 'II-2',
          label: 'Task 2',
          instructions:
            'You are going to read an anecdote about Theodore Roosevelt, the 26th president of the U.S. Some words are missing from the text. Your task is to choose the most appropriate word from the list (A-M) for each gap (10-17) in the text. Write the letter of the appropriate word in the white box. Each word can be used once. There are three extra words that you do not need to use. There is an example (0) at the beginning.',
          passage: [
            { style: 'title', text: 'A BUSY JOURNEY' },
            { text: 'The famous biographer David McCullough {{0}} told the following story from the early life of Theodore Roosevelt:' },
            {
              text: 'Once upon a time, in the coldest days of winter, in the Dakota Territory, Theodore Roosevelt took off in a small boat down the Little Missouri River to catch a {{10}} of thieves who had stolen his favorite rowboat.',
            },
            {
              text: 'After {{11}} days on the river, Roosevelt caught up with the thieves. He drew his trusty Winchester rifle, and forced them to {{12}} up the stolen boat. Then he set off in a borrowed horse-drawn wagon to {{13}} the thieves cross-country to prison. They traveled across the snow-covered wilderness to the railway at Dickinson, North Dakota, and Roosevelt walked the whole {{14}}, the entire forty miles. It was an extraordinary {{15}}. But what makes it especially important is that during that time, he {{16}} to read all of Anna Karenina, Leo Tolstoy\'s 900-page novel.',
            },
            { text: 'I often think of this story when I hear people {{17}} they haven\'t time to read.' },
          ],
          bank: [
            { key: 'A', text: 'ACHIEVEMENT' },
            { key: 'B', text: 'COULD' },
            { key: 'C', text: 'ONCE' },
            { key: 'D', text: 'COUPLE' },
            { key: 'E', text: 'DIRECTION' },
            { key: 'F', text: 'GIVE' },
            { key: 'G', text: 'MANAGED' },
            { key: 'H', text: 'SEVERAL' },
            { key: 'I', text: 'SAY' },
            { key: 'K', text: 'TAKE' },
            { key: 'L', text: 'TELL' },
            { key: 'M', text: 'WAY' },
          ],
          unusedBankCount: 3,
          examples: choices(0, 'C'),
          items: choices(10, 'D H F K M A G I'),
        },
        {
          id: 'II-3',
          label: 'Task 3',
          instructions:
            'You are going to read an article about a new Barbie doll inspired by Dr. Jane Goodall, one of the world\'s most famous conservationists. Some words are missing from the text. Your task is to write the missing words on the dotted lines (18-25) after the text. Use only one word in each gap. There is an example (0) at the beginning.',
          passage: [
            { style: 'title', text: 'DR. JANE GOODALL BARBIE DOLL MADE OF RECYCLED PLASTIC' },
            {
              text: 'Barbie is going green with a new doll modeled after Dr. Jane Goodall, which will {{0}} released next Tuesday ahead of World Chimpanzee Day. According {{18}} Mattel company, Goodall\'s Barbie doll is made of 90 percent recycled plastic that otherwise would have ended {{19}} in the ocean.',
            },
            {
              text: 'The 88-year-old researcher tells People Magazine she "couldn\'t be happier" to see herself {{20}} a Barbie doll, something she long hoped for. Goodall says she wants her Barbie {{21}} "inspire little girls" everywhere. "So many people know about Jane because they learn about me at school," she says, "so I think they\'ll {{22}} delighted to be given a Barbie Jane."',
            },
            {
              text: 'Lisa McKnight, Executive Vice President of Barbie and Dolls at Mattel, said in a statement that the company is "excited to introduce" the new doll. "Kids need more role models {{23}} Dr. Jane Goodall because imagining that they can be anything is just the beginning – seeing it {{24}} a huge difference," said McKnight.',
            },
            {
              text: '"We hope this collection and our respect for women in science will inspire girls to learn more about green careers, how they can protect the planet, and act {{25}} stories about the environment in their doll play," she added.',
            },
          ],
          examples: cloze(0, [['be']]),
          items: cloze(18, [
            ['to'],
            ['up'],
            ['as', 'in', 'become', 'becoming', 'inspire'],
            ['to'],
            ['be', 'feel'],
            ['like', 'resembling'],
            ['makes'],
            ['out', 'in', 'their'],
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
        storagePath: 'erettsegi-en-kozep-2023-majus.mp3',
        durationSec: 1795,
        // Task starts: the ~60 s reading pause of each task found by silence detection, minus the length of its announcement (approximate, ±10 s).
        taskMarkers: [
          { taskId: 'III-1', startSec: 106 },
          { taskId: 'III-2', startSec: 609 },
          { taskId: 'III-3', startSec: 1191 },
        ],
      },
      // útmutató p. 7: feladatpont 0–25 → vizsgapont
      conversion: [0, 1, 3, 4, 5, 7, 8, 9, 11, 12, 13, 15, 16, 17, 18, 20, 21, 22, 24, 25, 26, 28, 29, 30, 32, 33],
      transcripts: [
        {
          taskId: 'III-1',
          title: 'A spoonful of sugar',
          paragraphs: [
            'Most medicines taste awful and it is not always easy to take them. Popular film character Mary Poppins sweetly sings that “a spoonful of sugar makes the medicine go down.” This trick of taking medicine with sugar didn\'t start with Mary Poppins. For thousands of years, healers and doctors have used sugar to help patients swallow medicines which had horrible tastes.',
            'However, in the past the sweet stuff had a different role — it was often the main ingredient in healing remedies. People believed that sugar could cure all kinds of health problems. As far back as the first century, Middle Eastern practitioners suggested taking it for kidney problems and poor eyesight. In the 11th century, English monks noted sugar\'s ability to cure stomach problems. Still in the Middle Ages doctors tried treating bubonic plague with medicine that contained sugar. As recently as the 1700s, doctors recommended lemon and sugar for asthma attacks.',
            'Why did people think that sugar was a powerful medicine? Because it was rare. Some historians believe sugar cane originated in Southeast Asia, where farmers grew it as early as 8000 BCE. However, getting sugar out of sugarcane was a difficult process and it only began around 2,500 years ago in India. By the time sugar reached medieval Europe, the sweetener was so expensive that for centuries only the rich could afford it. In 1747, a German chemist, Andreas Marggraf discovered a way to produce sugar from sugar beet, a plant that grows in about three months in colder regions. Over the next 100 years, sugar factories appeared across Europe, driving down the price of sugar. Suddenly, the magic healing power of sugar disappeared.',
          ],
        },
        {
          taskId: 'III-2',
          title: 'Sutton Hoo',
          paragraphs: [
            'R = Reporter',
            'M = Morgan',
            'R: Here in the studio we have Morgan Grant, an archaeologist from Suffolk, East Anglia. Morgan, thanks for being with us.',
            'M: Thanks for having me.',
            'R: What archaeological discovery is Suffolk most famous for?',
            'M: Oh, that would have to be Sutton Hoo for sure.',
            'R: Tell us something about it.',
            'M: A woman called Edith Pretty had several mounds on her land. These mounds looked like small hills. Locals said that they had seen shadowy figures walking among them and that they had also seen a man sitting proudly on a horse on top of the largest one. This aroused Mrs Pretty\'s interest and she decided to find out what these small hills were. So in 1939 she asked a local archaeologist, Basil Brown to excavate the mounds to see if there was anything interesting buried within.',
            'R: And what did he find?',
            'M: Under a larger mound Basil found one of the most important discoveries of the 20th century. A huge wooden ship had been buried under the earth in the 7th century. The wood had long since rotted away, but a clear impression, an absolutely visible mark of its shape was still left in the soil.',
            'R: Very strange! Why would anybody bury a ship?',
            'M: The custom of ship burials was common with people from northern Europe. There are similar Viking remains in Denmark and Sweden.',
            'R: So they found a ship, right?',
            'M: Oh, a lot more. A hut had been built in the middle of the ship. Inside it was a coffin and many priceless treasures. The Anglo-Saxons believed that this was the best way for a powerful person to reach the afterlife when he had died.',
            'R: And who was the powerful person?',
            'M: Now, that is very interesting because there was no sign of a body. Scientists are sure there was a body in the coffin.',
            'R: So we will never know who was buried there. How sad!',
            'M: Actually, many experts today have come to the conclusion that the person buried within the ship must be King Raedwald, the ruler of East Anglia from about 599 to 624.',
            'R: Morgan, what makes Sutton Hoo one of the most important discoveries of the 20th century?',
            'M: Before this excavation, everybody thought that the Anglo-Saxon period was ‘a dark age’ and the people of the time were very primitive. However, the quality and craftsmanship of the objects found in Sutton Hoo show that they were a highly-skilled, well-travelled and cultured society.',
            'R: Morgan, thank you very much for the interview.',
            'M: My pleasure.',
          ],
        },
        {
          taskId: 'III-3',
          title: 'Art Garfunkel and Sandy Greenberg',
          paragraphs: [
            '“Hello Darkness, my old friend…” This is how the famous Simon & Garfunkel song, Sounds of Silence starts. But do you know the amazing story behind the first line?',
            'More than 60 years ago, Art Garfunkel, from New York, started his studies in Columbia University. When he met a student from Buffalo named Sandy Greenberg they immediately started to like each other because both of them loved literature and music. Art and Sandy became roommates and best friends.',
            'Soon after starting college, Sandy started having problems with his eyes. At first, doctors told him it was nothing serious. However, it grew worse. Finally, after seeing a specialist, Sandy received the shocking news that soon he was going to go blind. Sandy was terribly sad and fell into a deep depression. He gave up his dream of becoming a lawyer and moved back to Buffalo. He didn\'t answer any of his friends\' letters or return any phone calls. Then suddenly, to Sandy\'s surprise, Art Garfunkel showed up at the front door. He was not going to allow his best friend to give up on life. Art convinced Sandy to give college another go, and promised that he would be right by his side and be “his eyes”.',
            'Art kept his promise. He organized his life around helping Sandy and went with him everywhere. Art actually started calling himself “Darkness” to show his empathy with his friend. He would say things like, “Darkness is going to read to you now.” And when they met, Sandy always said, “Hello Darkness, my old friend”.',
            'One day, Art was guiding Sandy through crowded Grand Central Station when he suddenly said he had to go and left his friend alone and terrified. Sandy stumbled, bumped into people and fell. After a couple of horrible hours, Sandy finally got on the right subway train. When he got off at 116th street, he bumped into someone who quickly apologized - and Sandy immediately recognized Art Garfunkel\'s voice! It turned out his friend had followed him the whole way home, making sure he was safe and giving him the priceless gift of independence. Sandy later said, “It helped me to live a completely different life, without fear, without doubt. For that I am extremely thankful to my friend.”',
            'Later, Sandy graduated from Columbia University and became an extremely successful businessman. And the song ‘Sounds of Silence’ with its opening line “Hello Darkness, my old friend” became the first #1 hit of the Simon & Garfunkel duo.',
          ],
        },
      ],
      tasks: [
        {
          id: 'III-1',
          label: 'TASK 1',
          instructions:
            'In this section, you will hear some interesting information about sugar. Your task is to complete the sentences with one word or number in each gap, using the exact words you hear. First, you will have some time to study the task, and then we will play the whole recording in one piece. Then you will hear the recording again, but this time we will play the text in shorter sections to give you enough time to write down your answers.',
          examples: heard(0, [['Mary Poppins sings that a(n) ________ of sugar makes the medicine go down.', 'spoonful']]),
          items: heard(1, [
            ['It wasn\'t Mary Poppins who invented the ________ of taking medicines with sugar.', 'trick'],
            ['In the past, sugar used to be the main ________ of some medicines.', 'ingredient'],
            ['Besides kidney problems, Middle Eastern doctors recommended sugar for poor ________ .', 'eyesight'],
            ['In the 11th century, English monks noticed sugar could cure ________ problems.', 'stomach'],
            ['Besides sugar, ________ was recommended for asthma attacks in the 1700s.', 'lemon'],
            ['People thought sugar was a powerful medicine because it was ________ .', 'rare', 'expensive'],
            ['In India, people started getting sugar from sugar cane about ________ years ago.', '2,500', '2500'],
            ['A German ________ discovered how to produce sugar from sugar beet.', 'chemist'],
            ['After Marggraf\'s discovery, lots of sugar ________ appeared in Europe.', 'factories'],
          ]).map((item) =>
            item.id === '3'
              ? { ...item, answer: { accepted: ['eyesight', 'eye sight'], match: 'keywords' as const, keywords: [['eye'], ['sight']], maxWords: 2 }, reviewNote: 'Külön írva is elfogadható (eye sight).' }
              : item,
          ),
        },
        {
          id: 'III-2',
          label: 'TASK 2',
          instructions:
            'In this section, you will hear an interview with an archaeologist about a famous archaeological site called Sutton Hoo. Your task will be to decide whether the following statements are true, false or we do not know because the text does not say, and write the appropriate letter in the boxes on the right. Write A if the statement is true, write B if the statement is false, and write C if the text does not say. First, you will have some time to study the task, and then we will play the whole recording in one piece. Then, you will hear the recording again, but this time we will play the text in shorter sections to give you enough time to write down your answers. A = TRUE B = FALSE C = THE TEXT DOES NOT SAY',
          options: TFN,
          examples: [{ id: '0', type: 'mcq', stem: 'Morgan Grant is from the UK.', answer: 'A' }],
          items: tfn(
            10,
            [
              'A mound is a large hole in the ground.',
              'Only Edith Pretty saw shadowy figures and a man sitting on a horse.',
              'Basil Brown was delighted that Edith Pretty had asked him to start excavating.',
              'Basil Brown found a ship which was buried in the 7th century.',
              'The wooden parts of the ship were in surprisingly good condition.',
              'The custom of burying ships was very common all over Europe at the time.',
              'Basil found a small building, a coffin and a lot of treasures in the ship.',
              'King Raedwald was a very powerful and highly effective ruler.',
              'The importance of Sutton Hoo is that it shows how brave Anglo-Saxons were.',
            ],
            'B B C A B B A C B',
          ),
        },
        {
          id: 'III-3',
          label: 'TASK 3',
          instructions:
            'In this section, you will listen to a story of true friendship. Your task will be to write the letter of the correct answer into the boxes on the right. First, you will have some time to study the task, and then we will play the whole recording in one piece. Then you will hear the recording again, but this time we will play the text in shorter sections to give you enough time to write down your answers.',
          examples: [
            {
              id: '0',
              type: 'mcq',
              stem: '“Hello Darkness, my old friend” is the ________ of a song.',
              options: [{ key: 'A', text: 'first line' }, { key: 'B', text: 'last line.' }, { key: 'C', text: 'title' }],
              answer: 'A',
            },
          ],
          items: questions(
            19,
            [
              { stem: 'Art Garfunkel and Sandy Greenberg ...', options: ['went to the same high school.', 'were both interested in literature.', 'were classmates.'] },
              { stem: 'Sandy …', options: ['didn\'t want to see any doctors.', 'had always been afraid of going blind.', 'was told he was going to lose his vision.'] },
              { stem: 'Sandy ...', options: ['accepted the bad news peacefully.', 'went back to Buffalo to study law.', 'avoided contact with his friends.'] },
              {
                stem: 'Art Garfunkel ...',
                options: ['was the only person Sandy invited.', 'persuaded Sandy to go on with his studies.', 'promised to try and find the best eye-doctor for Sandy.'],
              },
              { stem: '‘Darkness’ became the name of ...', options: ['Art.', 'Sandy.', 'blindness.'] },
              {
                stem: 'One day, Art …',
                options: ['accidentally lost Sandy in a crowded place.', 'left Sandy alone because he had to hurry somewhere.', 'pretended to leave Sandy on his own.'],
              },
              { stem: 'After the incident, Sandy was … for being left alone.', options: ['angry', 'disappointed', 'grateful'] },
            ],
            'B C C B A C C',
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
            'Your English friend, Miranda invited you to stay with her for a day in Cambridge during your stay in Britain. She is offering you the following programmes to choose from:',
          passage: [
            { style: 'bullet', text: 'Visiting Ely Cathedral' },
            { style: 'bullet', text: 'Taking part in a guided tour of Trinity College' },
            { style: 'bullet', text: 'Going to a concert of the choir of King\'s College' },
            { style: 'bullet', text: 'Punting on the River Cam' },
          ],
          items: [
            {
              id: '1',
              type: 'production',
              prompt: ['Write a message of 80-100 words to Miranda in which you thank her for the invitation and'],
              contentPoints: [
                'say which two programmes you would like to take part in,',
                'explain why you have chosen them,',
                'ask what time the programmes of your choice start, and how long they last.',
              ],
              promptAfter: ['Begin your message like this:'],
              minWords: 80,
              maxWords: 100,
              opening: 'Hi Miranda,',
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
          instructions: 'You have come across the following post on a problem page.',
          passage: [
            {
              text: 'My boyfriend and I have been together for almost three months. Everything went fine until last week, when he invited me to meet his parents on his birthday. I had never been to his house before and was really nervous about meeting his parents for the first time. They turned out to be lovely people; kind and generous hosts, and we got along really well, but – and here comes my problem – I have a real issue with their kitchen hygiene and have no idea what I can do about it or how to bring it up, if at all...',
            },
            {
              text: 'Here\'s the thing: they have three cats and treat them almost like children - I have no issue with that by the way, I\'m a cat person myself, but they let them climb all over all the kitchen surfaces while they\'re cooking. I\'ve seen them pet the cats while they\'re cooking, including letting the cats lick their hands and stick their faces in the food, and then carry right on without even washing their hands. There was a lot of cat hair all over the kitchen and the dining table, and the cats were allowed to jump on the table and sniff around during the birthday dinner, as well. I know every family has different rules about pets in their home, but this seems off to me and the things I\'ve mentioned really gross me out.',
            },
            {
              text: 'I have no idea what to do about any of this. For my boyfriend it seemed completely normal, and I don\'t even know how to bring this up. What shall I do?',
            },
            { text: 'Eliza, 17' },
          ],
          items: [
            {
              id: '2',
              type: 'production',
              prompt: ['Write a comment of 100-120 words to Eliza in which you write about'],
              contentPoints: [
                'whether you have ever been in a similar situation,',
                'what you think about pets and hygiene in the household,',
                'how to handle uncomfortable situations in a relationship, and',
                'what she should do in your opinion.',
              ],
              promptAfter: ['Begin your comment like this:'],
              minWords: 100,
              maxWords: 120,
              opening: 'Eliza:',
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
