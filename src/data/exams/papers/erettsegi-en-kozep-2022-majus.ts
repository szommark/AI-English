// Angol nyelv, középszintű írásbeli érettségi, 2022. május 5. (2111), Oktatási Hivatal.
// Transcribed verbatim from the feladatlap and its javítási-értékelési útmutató (answer key,
// conversion tables, listening transcripts). Decorative photos are left out.
import type { ExamPaper } from '../types'
import { choices, cloze, enListeningIntro, EN_NOTICES_HU, heard, questions, TFN, tfn, words } from './enKozep.ts'

const bothAB = { key: 'AB', text: 'Both A and B' }

const paper: ExamPaper = {
  id: 'erettsegi-en-kozep-2022-majus',
  type: 'erettsegi',
  language: 'en',
  level: 'kozep',
  sittingLabelHu: '2022. május',
  source: 'Oktatási Hivatal: Angol nyelv, középszintű írásbeli vizsga, 2022. május 5. (2111) — feladatlap és javítási-értékelési útmutató.',
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
            'Read this article about a road incident and the sentences (1-7) following it. Mark a sentence A if it is true according to the article. Mark it B if it is false according to the article. Mark it C if there is not enough information in the text to decide if the sentence is true or not. Write your answers in the white boxes next to the numbers as in the example (0). A = TRUE B = FALSE C = THE TEXT DOES NOT SAY',
          passage: [
            { style: 'title', text: 'FIVE-YEAR-OLD CAUGHT DRIVING PARENTS\' CAR IN UTAH' },
            {
              text: 'Five-year-old Adrian took the family car, and was only caught when police in Utah State stopped him on the freeway. A patrolman saw the car, which was crossing lanes at 50km/h, and made the car stop. He was shocked to discover the child behind the wheel, who said he was on his way to buy a Lamborghini.',
            },
            {
              text: 'The boy told police that he had left home after his mother refused to buy him the luxury car – lower-priced models cost over $180,000 –, which caused an argument. "He decided he\'d take the car and go to a car salesman in California to buy one himself," Utah Highway Patrol said on Twitter, "but he only had 3 dollars in his wallet."',
            },
            {
              text: 'Camera footage posted by the local TV shows the car in traffic before stopping at the police signal. Highway patrol first thought it might be a driver with health problems behind the wheel. In the recording, the officer can then be heard saying "How old are you? You\'re five years old?" when he sees the boy. The boy was sitting at the very edge of the seat to be able to reach the pedals. He was stopped about five minutes\' drive from home.',
            },
            {
              text: 'No-one was hurt in the incident. The boy\'s parents were at work and he was in the care of a relative when he took the car. Police asked parents to make sure car keys are not easily accessible to children.',
            },
          ],
          options: TFN,
          examples: [{ id: '0', type: 'mcq', stem: 'The boy was stopped by the police.', answer: 'A' }],
          items: tfn(
            1,
            [
              'The boy told the policeman he was going to a toy shop.',
              'The boy wanted his mother to buy an expensive car but she said \'no\'.',
              'The boy wanted to get the car as a present for his birthday.',
              'The boy\'s wallet was empty.',
              'A video recording of the incident was made.',
              'The boy was injured in the car.',
              'The boy\'s parents were interviewed by TV reporters.',
            ],
            'B A C B A B C',
          ),
        },
        {
          id: 'I-2',
          label: 'Task 2',
          instructions:
            'Read the following questions and answers about buying products online. Some of the questions have been removed. Your task is to write the letters of the questions (A-K) next to the appropriate numbers (8-14). There are two extra questions that you do not need. Write the letters in the white boxes as in the example (0).',
          passage: [
            { style: 'title', text: 'ONLINE SHOPPING – FREQUENTLY ASKED QUESTIONS' },
            { text: 'Here you\'ll find answers to some of the questions we are asked most frequently. Please contact our customer service with any further questions you have.' },
            { text: '{{0}} We currently accept Visa, MasterCard and American Express. We also accept payment via PayPal.' },
            { text: '{{8}} For standard shipping, you should receive it within 4-5 business days.' },
            { text: '{{9}} We will notify you via email when your order is on the way. You can also track your delivery by clicking here.' },
            { text: '{{10}} Yes, but only within 30 minutes of placing it. You can, however, return any unwanted items to us for a refund once you receive them.' },
            {
              text: '{{11}} Unfortunately, once you\'ve placed your order, we are unable to accept any changes. This means we cannot alter your payment details or the quantity, size or colour of the item you\'ve ordered.',
            },
            { text: '{{12}} Unwanted items can be sent back to us in the original packaging within 35 days of purchase.' },
            {
              text: '{{13}} We are sorry to hear that your order did not arrive in perfect condition. Please contact our customer service team, who will be happy to help with your replacement order or refund.',
            },
            {
              text: '{{14}} While we do our best to ship all orders in one package, there are times when orders will ship from different locations. Please allow a little extra time for the next parcel to arrive.',
            },
          ],
          bankTitle: 'QUESTIONS',
          bank: [
            { key: 'A', text: 'How can I check the status of my order?' },
            { key: 'B', text: 'How much time do I have if I decide to return an item?' },
            { key: 'C', text: 'How can I pay for my order?' },
            { key: 'D', text: 'When will I get my refund?' },
            { key: 'E', text: 'Why did I only receive part of my order?' },
            { key: 'F', text: 'How can I change my order?' },
            { key: 'G', text: 'My order is damaged – what can I do?' },
            { key: 'H', text: 'Are the products available for international delivery?' },
            { key: 'I', text: 'How long will it take for me to get my order?' },
            { key: 'K', text: 'Can I cancel my order?' },
          ],
          unusedBankCount: 2,
          examples: choices(0, 'C'),
          items: choices(8, 'I A K F B G E'),
        },
        {
          id: 'I-3',
          label: 'Task 3',
          instructions:
            'Read this article about public restrooms in Japan. Some parts of sentences have been left out from the text. Your task is to reconstruct the text by filling in the gaps (15-21) from the list (A-K) after the text. Write the letters in the white boxes next to the numbers as in the example (0). Remember that there are two extra letters that you do not need.',
          passage: [
            { style: 'title', text: 'JAPAN TRIES OUT SEE-THROUGH PUBLIC TOILETS' },
            {
              text: 'In recent years, Japan has had many advanced and unusual toilets, {{0}}. Now one area of Tokyo is trying something completely new – public toilets with see-through walls. To be fair, the walls of the new public toilets aren\'t always transparent. They are made of a special “smart glass”. When someone enters the toilet {{15}}, the glass becomes opaque – it clouds over so that no one can see in. When the door is unlocked, {{16}}. The idea of a transparent public toilet may sound unusual, but {{17}}. Without ever entering the restroom, people can now check to see how clean it is, and whether anyone else is using it. The new toilets have been built in two parks in Tokyo, which opened to the public this month. As the restrooms are lit up at night, they help provide light for the part of the parks {{18}}. So far, the public has had mixed reactions to the see-through restrooms. Some people are excited to use them, while {{19}} and could allow them to be seen when they\'re using the toilet. Transparent toilets are just one of several new public toilet designs {{20}} in the coming months as part of the Tokyo Toilet Project. 16 designers and {{21}} to come up with new designs to improve the image of public restrooms in Tokyo. The important part of improving public restrooms isn\'t just about changing styles. It means making sure they are clean and well-lighted as well.',
            },
          ],
          bank: [
            { key: 'A', text: 'the see-through walls solve two problems' },
            { key: 'B', text: 'upgrade public restrooms across the country' },
            { key: 'C', text: 'including some with automatic lids and self-warming seats' },
            { key: 'D', text: 'where they are located' },
            { key: 'E', text: 'the glass clears up again' },
            { key: 'F', text: 'others worry that the walls might not work properly' },
            { key: 'G', text: 'architects have been asked' },
            { key: 'H', text: 'and locks the door' },
            { key: 'I', text: 'privacy is needed from time to time' },
            { key: 'K', text: 'that will be installed across Tokyo' },
          ],
          unusedBankCount: 2,
          examples: choices(0, 'C'),
          items: choices(15, 'H E A D F K G'),
        },
        {
          id: 'I-4',
          label: 'Task 4',
          instructions:
            'Read the following article about award-winning wildlife photos and then read the half sentences that follow the text. Your task is to match the half sentences based on the information in the article. Write the letters (A-K) in the white boxes next to the numbers (22-27) as in the example (0). Remember that there are three extra letters that you will not need.',
          passage: [
            { style: 'title', text: 'THE BEST WILDLIFE PHOTOS OF THE YEAR' },
            {
              text: 'The Natural History Museum in London holds a yearly contest for the Wildlife Photographer of the Year, with over 10 categories. This year\'s contest had 49,000 entries from around the world.',
              itemId: '0',
            },
            { style: 'heading', text: 'Sergey Gorshkov …' },
            {
              text: 'This year\'s grand prize winner was Sergey Gorshkov\'s picture of a Siberian tiger. Siberian tigers are endangered; only about 500 of them live in Russia\'s far east. It took Mr. Gorshkov ten months to get a shot of one of them. It looks like the tiger is hugging the tree, but it\'s actually trying to leave its smell as a way of communicating with other tigers.',
              itemId: '22',
            },
            { style: 'heading', text: 'Jaime Culebras …' },
            {
              text: 'Another endangered animal, a glass frog, was a category prize winner. Jaime Culebras said he had walked for four hours in the Andes mountains in the middle of a rainstorm, before he captured the picture of the frog snacking on a spider.',
              itemId: '23',
            },
            { style: 'heading', text: 'Mogens Trolle …' },
            {
              text: 'Mogens Trolle won the Animal Portraits prize with his picture of a young proboscis monkey, which is sitting calmly, enjoying the sunlight with its eyes closed. Proboscis monkeys look strange because the male\'s nose can eventually grow so big that it hangs over its mouth and may have to be pushed aside to eat. They\'re endangered and only found on Borneo and the islands nearby.',
              itemId: '24',
            },
            { style: 'heading', text: 'The Young Wildlife Photographer of the Year contest …' },
            {
              text: 'There is a separate contest for people under 18, known as the Young Wildlife Photographer of the Year. In this contest, pictures are judged in three separate age groups.',
              itemId: '25',
            },
            { style: 'heading', text: 'Andrés Luis Dominguez Blanco …' },
            {
              text: 'In the 10 and under category, Andrés Luis Dominguez Blanco of Spain won with his picture of a bird called a “stonechat” sitting on a bending plant. He asked his father to drive him to the field, in order to use the car as a hiding place for taking photographs. Andrés managed to take the picture without scaring the bird.',
              itemId: '26',
            },
            { style: 'heading', text: 'Liina Heikkinen …' },
            {
              text: 'Another young winner, Liina Heikkinen had spent a day watching two adult foxes bring food to their cubs. After one parent brought home a goose, the cubs fought over it. Liina took a picture of a young fox eating the goose, while hiding away from his siblings.',
              itemId: '27',
            },
          ],
          bank: [
            { key: 'A', text: 'won a prize for a portrait of an animal with an unusual ‘face’.' },
            { key: 'B', text: 'took a picture of a moment in the life of an animal family.' },
            { key: 'C', text: 'received over 40 thousand entries this year.' },
            { key: 'D', text: 'took a picture of a small endangered animal eating another animal.' },
            { key: 'E', text: 'show wildlife underwater.' },
            { key: 'F', text: 'was helped by another person to be able to take the picture.' },
            { key: 'G', text: 'is held every two years.' },
            { key: 'H', text: 'has three age categories.' },
            { key: 'I', text: 'had been waiting for months to take the award-winning picture.' },
            { key: 'K', text: 'was awarded in three categories.' },
          ],
          unusedBankCount: 3,
          examples: choices(0, 'C'),
          items: choices(22, 'I D A H F B'),
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
            'You are going to read an article about a Guinness World Record holder who builds houses of cards. Some words are missing from the text. Use the words in brackets to form the words that fit in the gaps (1-8). Then write the appropriate form of these words on the lines after the text. There might be cases when you do not have to change the word in brackets. Use only one word for each gap. There is an example (0) at the beginning.',
          passage: [
            { style: 'title', text: 'THE HOUSE OF CARDS CHAMPION' },
            {
              text: 'Bryan Berg is a cardstacking legend from Iowa. He began building card structures with his grandfather when he was about 8 years old. He built his first {{0}}, simple boxlike “houses,” with great {{1}}. But Berg didn\'t give it up and worked hard to make the cards stand much {{2}} and longer. Today he holds the Guinness World Record for the largest playing card structure and the tallest house of cards — reaching the first of these {{3}} while in high school. Since then, he\'s broken each of his {{4}} several times.',
            },
            {
              text: 'As a {{5}} cardstacker, Berg creates card structures around the world. They\'re so strong, they can hold a cement brick, yet he never uses glue — nothing but thousands of regular playing cards. His most {{6}} creations include some really {{7}} structures, such as Cinderella\'s castle from Walt Disney World, New York\'s Empire State Building and the Guggenheim Museum, as well as these {{8}} Washington landmarks: the U.S. Capitol, the Lincoln Memorial and the Washington Monument.',
            },
          ],
          examples: words(0, [['create', 'creation']]),
          items: words(1, [
            ['difficult', 'difficulty'],
            ['good', 'better'],
            ['achieve', 'achievements'],
            ['record', 'records'],
            ['profession', 'professional'],
            ['ordinary', 'extraordinary', 'out-of-the-ordinary', 'inordinary', 'unordinary'],
            ['possible', 'impossible'],
            ['fame', 'famous', 'famed'],
          ]),
        },
        {
          id: 'II-2',
          label: 'Task 2',
          instructions:
            'You are going to read a joke about choosing the right present. Some words are missing from the text. Your task is to choose the most appropriate word from the list (A-M) for each gap (9-16) in the text. Write the letter of the appropriate word in the white box. Each word can be used once. There are three extra words that you do not need to use. There is an example (0) at the beginning.',
          passage: [
            { style: 'title', text: 'A COSTLY PRESENT' },
            { text: 'A rich man walks into a pet store for people with fat wallets. He explains that he\'s looking {{0}} a birthday present for his friend.' },
            {
              text: 'And his friend {{9}} to like birds, so he needs a very talented parrot. The store owner says that he\'s just got some perfect birds and {{10}} the man over to a huge stand with three exotic parrots.',
            },
            {
              text: '“These birds are very special; the first one here on the right speaks three languages, knows a bunch of jokes, loves whisky and Cuban cigars. We\'re selling him for five million dollars. The second one on the left speaks ten languages fluently, is a(n) {{11}} entertainer and loves kids and women. {{12}} it or not, his ancestry goes back all the way to a parrot {{13}} by Queen Elizabeth I, and trust me, these birds know {{14}} to pass an anecdote from generation to generation! This one goes for fifty million dollars. And finally, the third one, here in the middle, is the most special and expensive; we are selling him for a hundred million.”',
            },
            { text: 'Amazed, the guy shouts: “He {{15}} speak at least twenty languages!”' },
            { text: '“You know, this one doesn\'t talk {{16}} all, but those two call him Boss,” the owner explains.' },
          ],
          bank: [
            { key: 'A', text: 'ACCEPTING' },
            { key: 'B', text: 'AS' },
            { key: 'C', text: 'FOR' },
            { key: 'D', text: 'AT' },
            { key: 'E', text: 'BELIEVE' },
            { key: 'F', text: 'COULD' },
            { key: 'G', text: 'CHARMING' },
            { key: 'H', text: 'HAPPENS' },
            { key: 'I', text: 'HOW' },
            { key: 'K', text: 'MUST' },
            { key: 'L', text: 'OWNED' },
            { key: 'M', text: 'TAKES' },
          ],
          unusedBankCount: 3,
          examples: choices(0, 'C'),
          items: choices(9, 'H M G E L I K D'),
        },
        {
          id: 'II-3',
          label: 'Task 3',
          instructions:
            'You are going to read about the history of M&M\'s. Some words are missing from the text. Your task is to write the missing words on the dotted lines (17-25) after the text. Use only one word in each gap. There is an example (0) at the beginning.',
          passage: [
            { style: 'title', text: 'THE UNTOLD TRUTH OF M&M\'S' },
            {
              text: 'With so many colors and flavors to choose from, surely, there\'s {{0}} pack of M&M\'s for everyone. And it\'s pretty safe {{17}} say almost everyone has tried these little candy-coated chocolates at some point in {{18}} lives.',
            },
            {
              text: 'M&M\'s were first introduced in the U.S. {{19}} Forrest E. Mars in Newark, New Jersey in 1941. But the story started earlier. Frank C. Mars had founded a candy business in 1911, and his son, Forrest, took on the job years later. Forrest wasn\'t too fond {{20}} how his father had been running the company, and he had a new candy idea of {{21}} own. So, he found a business partner to make the candy-coated chocolates.',
            },
            {
              text: 'Forrest Mars eventually paired up with Bruce Murrie, and they began making M&M\'s at their new company Mars & Murrie, which has since put Twix, Snickers and lots of other brands on the market.',
            },
            {
              text: 'Original M&M\'s and Peanut M&M\'s were the only two flavors {{22}} quite some time, until Peanut Butter M&M\'s debuted in 1989. Since then, more and more flavors {{23}} followed.',
            },
            {
              text: 'There are only a few brands {{24}} can say they made it to space. M&M\'s is {{25}} of them. According to M&M\'s history, M&Ms were actually the first candy to be chosen to go to space in 1981.',
            },
          ],
          examples: cloze(0, [['a']]),
          items: cloze(17, [['to'], ['their'], ['by'], ['of'], ['his'], ['for'], ['have'], ['that', 'which'], ['one']]),
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
        storagePath: 'erettsegi-en-kozep-2022-majus.mp3',
        durationSec: 1795,
        // Task starts: the ~60 s reading pause of each task found by silence detection, minus the length of its announcement (approximate, ±10 s).
        taskMarkers: [
          { taskId: 'III-1', startSec: 106 },
          { taskId: 'III-2', startSec: 643 },
          { taskId: 'III-3', startSec: 1191 },
        ],
      },
      // útmutató p. 7: feladatpont 0–24 → vizsgapont
      conversion: [0, 1, 3, 4, 6, 7, 8, 10, 11, 12, 14, 15, 17, 18, 19, 21, 22, 23, 25, 26, 28, 29, 30, 32, 33],
      transcripts: [
        {
          taskId: 'III-1',
          title: 'The great white shark',
          paragraphs: [
            'Great white sharks can be found throughout the world\'s oceans, mostly in cool waters close to the coast. They are grey with a white stomach, from where they get their name. On average, they grow to around 4.6m long, but some great whites have been measured at 6m – that\'s half the length of a bus. They have a streamlined shape and powerful tails that propel them through the water at over 60km per hour! This creature has 300 sharp teeth arranged in up to seven rows. Many people think that these beasts are evil man-eaters, but humans aren\'t on the great white\'s menu. So what do they eat? When they\'re young, they feed on fish and rays. But when they\'re older and bigger, they generally eat seals and small whales. Great white sharks have such a strong sense of smell that they can detect a colony of seals two miles away and if there was only one drop of blood in 100 liters of water, a great white would smell it! A great white usually gives birth to two to ten youngsters called “pups“. But she shows no care for her babies – in fact, she may even try to eat them! Great white sharks are on the top of the food chain and aren\'t likely to be killed by other sea creatures. Sadly, however, they are under serious threat by human activity.',
          ],
        },
        {
          taskId: 'III-2',
          title: 'Freia Challis, BMX champion',
          paragraphs: [
            'Like many other British 11-year-olds, Freia is starting secondary school next month. But what makes Freia different, is that she is a world champion BMX rider in her age group.',
            'Freia was unbeatable in the 11-year-old girls\' category at the BMX World Championships this year at Zolder in Belgium, winning all of her heats, her quarter-final and semi-final on her way to the final, where another victory made her the world\'s best in her age group.',
            'However, it hasn\'t always been easy for Freia. This victory helped to put bitter disappointments behind her. She had lost in the final four years ago and had fallen off her bike in the quarter-finals two years ago.',
            'She says she rides a bike every single day but she has just finished primary school, and she is going into secondary, so she doesn\'t know how she is going to handle the homework and biking.',
            'Freia got involved in the sport after watching her older brother. She says she first discovered biking when her brother was about 12 or 13 and she used to train with him riding her little pink bike. Her mum says that Freia most probably started riding a bike with her brother when she was two.',
            'BMX only became part of the Olympics in 2008, the year Freia was born. Her dream is that one day she will bring an Olympic medal home for the United Kingdom. Her BMX coach says that they have been talking about the 2028 Olympics, which is the earliest Freia will be able to ride.',
          ],
        },
        {
          taskId: 'III-3',
          title: 'Interview with Ariana Richards',
          paragraphs: [
            'Reporter: R; A: Ariana',
            'R: In the studio I have Miss Ariana Richards, who played Lex Murphy in Jurassic Park. Thank you very much for accepting my invitation.',
            'A: Thank you for having me.',
            'R: What was your little brother\'s name in the movie? I keep forgetting it.',
            'A: Tim.',
            'R: Oh, yes. After all these years, do you still enjoy talking about your role in Jurassic Park?',
            'A: I have never got tired of talking about Jurassic Park. Out of the 30 or 40 films I have been in, this film really stands out and there is so much to talk about.',
            'R: Your performance in the film is especially brilliant because of the real terror your face and your body expressed. Where did it come from?',
            'A: Actually, the director, Steven Spielberg asked me the same question. When we were filming the scene of the T-rex with the jeep, Steven came over to me once and asked, “Ariana, you reach such a deep level of fear and terror. Where does it come from? Were you scared by a clown when you were three years old? Don\'t tell me, I don\'t want to know!” And then he smiled and walked away.',
            'R: Young actors in Steven Spielberg\'s films are usually very good. Do you know the secret?',
            'A: Steven is very good at choosing actors and I think he chooses actors that bring the kind of natural quality to their roles that he wants to see. Steven allowed me to be absolutely natural and directed me without actually directing me.',
            'R: What about the dinosaurs in the film? Were they actually there or did you have to imagine them?',
            'A: I would say about 80 per cent of the time, the dinosaurs were actually present – and only the rest of the dinosaur scenes were computer generated. The dinosaurs were absolutely life-like, and so I got the chance to actually feel them as if they were real. In fact, when the T-rex was crashing down on the jeep, it really was.',
            'R: Were you excited about dinosaurs before making Jurassic Park?',
            'A: Doing the film was what got me interested in dinosaurs. The famous paleontologist Jack Horner was present on the set much of the time. He was the technical advisor for the film. At the end of the filming he invited me to come out to the dig for dinosaur bones in Montana. And I went, and it was a fantastic experience…I remember walking around the dry hills of Montana with him, and suddenly he pointed at a velociraptor arm that was actually sitting on the ground… and he gave it to me! So I have a velociraptor arm in my collection!',
            'R: Miss Ariana Richards, thank you very much for the interview.',
            'A: You\'re welcome.',
          ],
        },
      ],
      tasks: [
        {
          id: 'III-1',
          label: 'TASK 1',
          instructions:
            'In this section, you will listen to some information about the great white shark. Your task will be to write one word in each of the gaps below using the exact words that you hear in the recording. First, you will have some time to look at the task, and then we will play the whole recording in one piece. Then, you will hear the recording again, but this time we will play the text in shorter sections to give you enough time to write down your answers.',
          examples: heard(0, [['Great white sharks can be found mostly in ________ ________ .', 'cool waters']]),
          items: heard(1, [
            ['They got their name from their ________ ________ .', 'white stomach'],
            ['Some great white sharks can grow up to 6 metres, which is half the ________ of a(n) ________ .', 'length bus'],
            ['They have a streamlined shape and ________ ________ , which make them swim very fast.', 'powerful tails'],
            ['They have 300 ________ ________ arranged in up to seven rows.', 'sharp teeth'],
            ['Besides seals, older and bigger great whites eat ________ ________ .', 'small whales'],
            ['A great white could smell one ________ of ________ in 100 litres of water.', 'drop blood'],
            ['A great white usually ________ ________ to two to ten pups.', 'gives birth'],
            ['Great whites are safe from other sea creatures because they are on the top of the ________ ________ .', 'food chain'],
          ]).map((item) =>
            item.id === '2'
              ? { ...item, answer: { ...item.answer, accepted: ['length / bus'] } }
              : item.id === '6'
                ? { ...item, answer: { ...item.answer, accepted: ['drop / blood'] } }
                : item,
          ),
        },
        {
          id: 'III-2',
          label: 'TASK 2',
          instructions:
            'In this section you will listen to some information about Freia Challis, a young BMX champion. Your task will be to decide whether the following statements are true, false or we do not know because the text does not say, and write the appropriate letter in the boxes on the right. Write A if the statement is true, write B if the statement is false, and write C if the text does not say. First, you will have some time to look at the task, and then we will play the whole recording in one piece. Then, you will hear the recording again, but this time we will play the text in shorter sections to give you enough time to write down your answers. A = TRUE B = FALSE C = THE TEXT DOES NOT SAY',
          options: TFN,
          examples: [{ id: '0', type: 'mcq', stem: 'Freia is from the United States of America.', answer: 'B' }],
          items: tfn(
            9,
            [
              'Freia is very special because she is going to start secondary school at the age of 11.',
              'It was at Zolder in Belgium that Freia first got into the final.',
              'Freia never rides her bike on Sundays.',
              'Freia is sure that biking and doing homework won\'t be a problem.',
              'Freia used to go biking with her older brother.',
              'Freia only has one brother and no sisters.',
              'Freia was born when BMX became part of the Olympics.',
              'Freia\'s BMX coach is sure that Freia will take part in the 2024 Olympics.',
            ],
            'B B B B A C A B',
          ).map((item) => (item.id === '10' ? { ...item, alsoAccept: ['C'] } : item)),
        },
        {
          id: 'III-3',
          label: 'TASK 3',
          instructions:
            'In this section, you will hear an interview with actress Ariana Richards, who played in the 1993 film classic, Jurassic Park. Your task will be to circle the letter(s) of the correct answer(s) in the boxes on the right. Please note that in this task both answers may be correct. However, there is always at least one correct answer. This means you will have to circle one or two letters. First, you will have some time to look at the task, and then we will play the whole recording in one piece. Then, you will hear the recording again, but this time we will play the text in shorter sections to give you enough time to make your decision about the answers.',
          examples: [
            {
              id: '0',
              type: 'mcq',
              stem: 'In Jurassic Park, Ariana played …',
              options: [{ key: 'A', text: 'Lex Murphy.' }, { key: 'B', text: 'Tim\'s sister.' }, bothAB],
              answer: 'AB',
            },
          ],
          items: questions(
            17,
            [
              { stem: 'Ariana …', options: ['still likes to talk about Jurassic Park.', 'says that Jurassic Park was the first film she had been in.'] },
              { stem: 'Ariana was…', options: ['very good at showing fear in the movie.', 'criticised by the director in the T-rex scene.'] },
              { stem: 'Ariana …', options: ['told Spielberg that a clown had frightened her once.', 'didn\'t need to answer Spielberg\'s question.'] },
              { stem: 'Steven Spielberg …', options: ['usually lets his assistants choose actors.', 'didn\'t give many instructions to Ariana.'] },
              { stem: 'In Jurassic Park, … not computer generated.', options: ['80% of the dinosaur scenes were', 'the scene of the T-rex with the jeep was'] },
              {
                stem: 'Ariana says…',
                options: [
                  'she had already become interested in dinosaurs before making the film.',
                  'there was a famous palaeontologist on the set much of the time.',
                ],
              },
              { stem: 'Jack Horner…', options: ['was an advisor for Jurassic Park.', 'invited Ariana to Montana.'] },
              { stem: 'Ariana …', options: ['was the first to discover a velociraptor arm on the ground.', 'has a velociraptor arm in her collection.'] },
            ],
            'A A B B AB B AB B',
          ).map((item) => ({ ...item, options: [...(item.options ?? []), bothAB] })),
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
            'You are at University College London and as public transport is very expensive, you have decided to use an electric scooter to get about town. You have found the following ad on the website of the university:',
          passage: [
            { style: 'title', text: 'RECHARGEABLE FOLDING SCOOTER BLACK' },
            { text: 'ONE CAREFUL OWNER' },
            { text: 'MUST GO URGENTLY' },
            { text: '250W POWERFUL MOTOR DISC BRAKE PORTABLE FOLDING 8.5 INCH WHEEL EASY CONTROL DIGITAL DISPLAY SCREEN' },
            { text: 'Free local pickup.' },
            { text: 'Email Dave dave.menzie@ucl.uk' },
          ],
          items: [
            {
              id: '1',
              type: 'production',
              prompt: ['Write an email of 80-100 words to Dave in which you ask'],
              contentPoints: ['about the price and age of the scooter,', 'about its weight and maximum speed,', 'where and when you can try it.'],
              promptAfter: ['Begin your email like this:'],
              minWords: 80,
              maxWords: 100,
              opening: 'Hi,',
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
          instructions: 'You have received the following email from your Czech friend, Jan:',
          passage: [
            {
              text: 'You know I\'ve been studying Chinese for years, simply out of interest, no plans for a future career as a diplomat or anything. I\'ve been attending a nearby language school which is part of a big and prestigious language school specializing in Oriental languages in Brno. I\'m at Level 3, doing fine so far with good exam results. The lessons are fun with wonderful teachers and a bunch of dedicated (crazy?) guys like myself. I have just received an email from the school to say that the branch in my hometown, Vyškov, is going to be shut down from September, which means that I can\'t continue my studies the same way as up to now. They offered me the choice of either going to Brno, which is a 30-minute journey there and back, for my course or continuing in the form of on-line video lessons. I\'m really upset and can\'t make up my mind! I can see the good and the bad sides of both; however, I\'m worried that whichever I choose it won\'t be the ‘real thing’, if you know what I mean. What do you think?',
            },
          ],
          items: [
            {
              id: '2',
              type: 'production',
              prompt: ['Write an email of 100-120 words to Jan in which you tell him'],
              contentPoints: [
                'whether you or any of your friends have ever had on-line video lessons,',
                'what the main advantage and the main disadvantage of online learning are,',
                'how you like the other option he has been offered,',
                'which one you think he should choose and why.',
              ],
              promptAfter: ['Begin your email like this:'],
              minWords: 100,
              maxWords: 120,
              opening: 'Hello Jan,',
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
