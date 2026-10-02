// Angol nyelv, középszintű írásbeli érettségi, 2026. május 7. (K2611), Oktatási Hivatal.
// Transcribed verbatim from the feladatlap and its javítási-értékelési útmutató (answer key,
// conversion tables, listening transcripts). Decorative photos are left out.
import type { ExamPaper } from '../types'
import { choices, enListeningIntro, EN_NOTICES_HU, TFN, tfn } from './enKozep.ts'

const paper: ExamPaper = {
  id: 'erettsegi-en-kozep-2026-majus',
  type: 'erettsegi',
  language: 'en',
  level: 'kozep',
  sittingLabelHu: '2026. május',
  source: 'Oktatási Hivatal: Angol nyelv, középszintű írásbeli vizsga, 2026. május 7. (K2611) — feladatlap és javítási-értékelési útmutató.',
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
            'Read the following answers from the website of the National Animal Welfare Trust (NAWT). The questions have been removed. Your task is to write the letters of the questions (A-M) next to the appropriate numbers (1-8). There are three extra questions that you do not need. Write the letters in the white boxes as in the example (0).',
          passage: [
            { style: 'title', text: 'NATIONAL ANIMAL WELFARE TRUST – FREQUENTLY ASKED QUESTIONS' },
            { text: 'Our FAQs answer the most commonly asked questions from adopting a pet to volunteering.' },
            { text: '{{0}} Yes, but in return for your payment you receive a pet that has been vet-checked, vaccinated, and microchipped.' },
            { text: '{{1}} Complete a homefinder form through the website of the centre where the animal is staying. If the pet is still available, we will get in contact with you.' },
            { text: '{{2}} Absolutely! We never stop caring. Whatever question or problem you may have, ask us, and we\'ll do all we can to help you.' },
            { text: '{{3}} Certainly. We\'ll arrange an in-shelter pet-introduction session to see how they get on.' },
            { text: '{{4}} Contact your local centre and answer a selection of questions about your pet. Please note that our centres may have waiting lists so they might not be able to accept your pet immediately.' },
            { text: '{{5}} You are not required to pay if you need us to find a new home for your beloved pet, but we will be grateful for a donation.' },
            { text: '{{6}} Yes, but please note that we cannot accept used wooden items and we can only accept unopened food in the original packaging.' },
            { text: '{{7}} If you are over sixteen, we would love to have you on the team. Check our vacancies page for details.' },
            { text: '{{8}} What we are looking for is a love of animals and we will give you the training you need for the role.' },
          ],
          bankTitle: 'QUESTIONS',
          bank: [
            { key: 'A', text: 'Is there a fee to give up my own pet to NAWT?' },
            { key: 'B', text: 'Is there an age limit for adopting a pet?' },
            { key: 'C', text: 'Is there an adoption fee?' },
            { key: 'D', text: 'What skills and experience do I need for volunteering?' },
            { key: 'E', text: 'I am interested in adopting – what do I need to do?' },
            { key: 'F', text: 'How long does the adoption process take?' },
            { key: 'G', text: 'Will I receive any ongoing support after taking my new pet home?' },
            { key: 'H', text: 'Can I adopt an animal if I already have pets?' },
            { key: 'I', text: 'Do I need an appointment to meet the animal I\'ve chosen for adoption?' },
            { key: 'K', text: 'How old do I have to be to volunteer at a NAWT shelter?' },
            { key: 'L', text: 'If I need to give up my own pet, how do I start the process?' },
            { key: 'M', text: 'If my pet dies, can I donate items like toys, bowls or food?' },
          ],
          unusedBankCount: 3,
          examples: choices(0, 'C'),
          items: choices(1, 'E G H L A M K D'),
        },
        {
          id: 'I-2',
          label: 'Task 2',
          instructions:
            'Read this article about an art exhibition. Some parts of sentences have been left out from the text. Your task is to reconstruct the text by filling in the gaps (9-15) from the list (A-L) below. Write the letters in the white boxes next to the numbers as in the example (0). Remember that there are three extra letters that you do not need.',
          passage: [
            { style: 'title', text: 'MONET AND VENICE' },
            {
              text: 'Claude Monet\'s paintings of Venice are headlining an exhibition for the first time in more than a century. Monet is best {{0}}, and his paintings of Venice are less well known.',
            },
            {
              text: 'In 1908, the French impressionist and his wife, Alice, travelled to Venice on holiday. When they arrived, he told her that the city was “too beautiful” to paint, and {{9}}. Being in his late 60s at the time, he didn\'t want to go in the first place, but his wife {{10}}, and eventually he agreed. He became so {{11}} that he was able to overcome his doubts. They spent two months in Venice, and he painted 37 oil-on-canvas paintings.',
            },
            {
              text: 'While some of the Venice paintings have {{12}}, the Brooklyn Museum\'s new exhibition is the first that takes that group of work as its focus since 1912.',
            },
            {
              text: 'Monet\'s work is celebrated now, and he\'s often {{13}}, but when he was painting, his work wasn\'t as accepted. His style, with its visible brushstrokes, bright colours and soft appearance, is widely {{14}}, but it was radical and often criticised in its time.',
            },
            {
              text: 'The exhibition provides context on how the artworks fit into Monet\'s life and career. “It is well-known that he was a painter of light, but he was also a painter of water throughout his entire career,” Lisa Small, the curator of the exhibition explains. “We wanted to show how Venice, a place where you\'re surrounded by water and buildings are {{15}}, ended up being the perfect Monet theme”.',
            },
          ],
          bank: [
            { key: 'A', text: 'painted scenes from everyday life' },
            { key: 'B', text: 'fascinated by the location\'s light and atmosphere' },
            { key: 'C', text: 'known for his paintings of water lilies' },
            { key: 'D', text: 'represented his artistic anxiety' },
            { key: 'E', text: 'reflected in the water' },
            { key: 'F', text: 'called the leader of the Impressionist movement' },
            { key: 'G', text: 'encouraged him to visit the Italian city with her' },
            { key: 'H', text: 'shown in the final gallery of the exhibition' },
            { key: 'I', text: 'appeared in other shows over the years' },
            { key: 'K', text: 'admired in the art world today' },
            { key: 'L', text: 'added that he was too old to paint such beautiful things' },
          ],
          unusedBankCount: 3,
          examples: choices(0, 'C'),
          items: choices(9, 'L G B I F|K K E'),
        },
        {
          id: 'I-3',
          label: 'Task 3',
          instructions:
            'Read this text about a recent scientific discovery, and then read the statements (16-25) following it. Mark a statement A if it is true according to the article, mark it B if it is false, and mark it C if there isn\'t enough information in the text to decide if it is true or not. Write the letters in the white boxes next to the numbers as in the example (0). A = TRUE B = FALSE C = THE TEXT DOES NOT SAY',
          passage: [
            { style: 'title', text: 'FOOD COLOURING LETS SCIENTISTS SEE THROUGH SKIN' },
            {
              text: 'Using a common yellow food colouring called tartrazine, scientists at Stanford University have created a liquid that allows them to see through the skin of a living mouse.',
            },
            {
              text: 'The scientists mixed tartrazine with water to make a special lotion. When they tested this mixture on thin slices of chicken breast, the chicken turned clear. Next, the researchers repeated the method on the skin of living mice. First, they shaved the mice to get the hair out of the way. Then, they rubbed the liquid on the head of the mice. In a few minutes, the skin became see-through, and the scientists were able to see a mouse\'s brain. When the mixture was rubbed on the skin of a mouse\'s belly, the organs inside, like the liver and bowels, became clearly visible. When the liquid was washed off, the skin returned to normal.',
            },
            {
              text: 'To understand how the new discovery works, think about how light travels through different materials. Skin is made of many different parts, like water, fat, and protein. These different materials scatter the light, making it hard to see through skin. Tartrazine makes the watery parts of the skin more like the other areas. When the light mostly bends the same way, the skin becomes see-through.',
            },
            {
              text: 'The discovery could one day allow doctors to detect medical problems inside the body without needing to do surgery. However, the mixture has only been tested on animals, and more work needs to be done before a similar method can be used on humans.',
            },
          ],
          options: TFN,
          examples: [{ id: '0', type: 'mcq', stem: 'The research was supported by the food company that produces tartrazine.', answer: 'C' }],
          items: tfn(
            16,
            [
              'Tartrazine is normally used in the production of soft drinks.',
              'The liquid mixture was first tested on meat before being applied to mice.',
              'The tartrazine mixture was put under the skin of a mouse with a needle.',
              'In the test, the liquid made both the skin and hair of the mouse turn see-through.',
              'When its skin became see-through, the scientists could see inside the body of the mouse.',
              'The effect of the liquid was temporary and disappeared after the mixture was removed.',
              'When the skin is lit with UV light, the see-through effect lasts longer.',
              'The method works because tartrazine removes water from the skin.',
              'A similar method could help doctors see inside human bodies without cutting them open.',
              'Before starting research on humans, the method will be tested on animals with thicker skin.',
            ],
            'C A B B A A C B A C',
          ),
        },
        {
          id: 'I-4',
          label: 'Task 4',
          instructions:
            'In the following text about a famous British writer, the first sentence of each paragraph has been removed. Your task is to match the sentences to the paragraphs. Write the letters of the sentences (A-I) next to the appropriate numbers (26-30). There are three extra sentences that you do not need. Write the letters in the white boxes as in the example (0).',
          passage: [
            { style: 'title', text: 'FACTS ABOUT ROALD DAHL' },
            { text: '{{0}} Many of them have been turned into films and even musicals, including Charlie and the Chocolate Factory and Matilda.' },
            {
              text: '{{26}} He came up with more than 500 new words and names, such as the Oompa-Loompas and scrumdiddlyumptious from Charlie and the Chocolate Factory. He called his language Gobblefunk.',
            },
            {
              text: '{{27}} He had a cosy old armchair and a specially designed writing board which would sit on his lap. He would also only write his stories using a pencil and yellow paper.',
            },
            {
              text: '{{28}} One of them was the famous chocolate maker, John Cadbury, whose company used to taste-test their chocolate bars at Roald\'s school. Roald used to dream that he would invent a new chocolate bar and win praise from Mr Cadbury.',
            },
            {
              text: '{{29}} As part of his work, he reported secret information that he collected at dinners and cocktail parties in the US. There, he worked alongside James Bond creator Ian Fleming, and later wrote the film storyline for the fifth James Bond movie You Only Live Twice.',
            },
            {
              text: '{{30}} The story was about a bunch of naughty little creatures who would cause all sorts of mechanical problems on aeroplanes. It later became the inspiration behind the popular film The Gremlins, which was produced by Steven Spielberg in 1984.',
            },
          ],
          bank: [
            { key: 'A', text: 'His first story aimed at children was inspired by his time as a pilot.' },
            { key: 'B', text: 'He was buried with some of his favourite things, his HB pencils, a power drill, chocolate, and snooker cues.' },
            { key: 'C', text: 'Roald Dahl, one of Britain\'s most beloved writers, was the author of more than 20 children\'s books.' },
            { key: 'D', text: 'He spent around four hours every day writing stories in his garden shed.' },
            { key: 'E', text: 'His height, 6 foot 6 inches, earned him the nickname, “Lofty”.' },
            { key: 'F', text: 'Roald Dahl was named after the famous Norwegian polar explorer, Roald Amundson.' },
            { key: 'G', text: 'Many of his characters and stories were inspired by places and people around him.' },
            { key: 'H', text: 'Roald Dahl loved to play around with words and invent new ones or meanings.' },
            { key: 'I', text: 'Before he became an author, Roald Dahl was a pilot for the Royal Air Force, and he also became a spy for the British Secret Service.' },
          ],
          unusedBankCount: 3,
          examples: choices(0, 'C'),
          items: choices(26, 'H D G I A'),
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
            'You are going to read an article about a special service dog. Some words are missing from the text. Use the words in brackets to form the words that fit in the gaps (1-8). Then write the appropriate form of these words on the lines after the text. There might be cases when you do not have to change the word in brackets. Use only one word for each gap. There is an example (0) at the beginning.',
          passage: [
            { style: 'title', text: 'HERCULES ON PATROL' },
            {
              text: 'At West Virginia International Yeager Airport, Hercules patrols the mile-long airfield {{0}}. The border collie has an important job: ensuring the safety of passengers and crew by keeping birds and wildlife away from planes. Chris Keyser, the airport\'s wildlife specialist and the dog\'s {{1}}, says preventing a bird from hitting a plane can save {{2}} of lives.',
            },
            {
              text: 'Since 2018, Yeager management has employed the services of border collies to keep the planes safe. Hercules, the chief patrol dog, also spends time inside the terminal, calming {{3}} passengers and receiving affection.',
            },
            {
              text: 'Before his {{4}} at Yeager, Hercules trained for 18 months at Flyaway Geese Center in Charlotte, North Carolina, learning to herd geese and {{5}}, preparing for his vital role in keeping the airport safe.',
            },
            {
              text: 'When Hercules stepped onto Charleston\'s airfield for the first time, “I held my {{6}},” Flyaway Geese manager Rebecca Gibson said. “But boy, he knew {{7}} what to do. It was his place. He\'s done a(n) {{8}} job and has just been a great dog for them. We\'re very proud of him.”',
            },
            {
              text: 'Along the way, Hercules became a local celebrity. He has his own Instagram and TikTok accounts and regularly hosts groups of schoolchildren.',
            },
          ],
          examples: [{ id: '0', type: 'short-text', baseWord: 'day', answer: { accepted: ['daily'], match: 'exact-ci' } }],
          items: [
            { id: '1', type: 'short-text', baseWord: 'own', answer: { accepted: ['owner'], match: 'exact-ci' } },
            { id: '2', type: 'short-text', baseWord: 'lot', answer: { accepted: ['lots'], match: 'exact-ci' } },
            { id: '3', type: 'short-text', baseWord: 'nerve', answer: { accepted: ['nervous', 'unnerved', 'nervy'], match: 'exact-ci' } },
            { id: '4', type: 'short-text', baseWord: 'arrive', answer: { accepted: ['arrival'], match: 'exact-ci' } },
            { id: '5', type: 'short-text', baseWord: 'sheep', answer: { accepted: ['sheep'], match: 'exact-ci' } },
            { id: '6', type: 'short-text', baseWord: 'breathe', answer: { accepted: ['breath'], match: 'exact-ci' } },
            { id: '7', type: 'short-text', baseWord: 'immediate', answer: { accepted: ['immediately'], match: 'exact-ci' } },
            { id: '8', type: 'short-text', baseWord: 'marvel', answer: { accepted: ['marvelous', 'marvellous'], match: 'exact-ci' } },
          ],
        },
        {
          id: 'II-2',
          label: 'Task 2',
          instructions:
            'You are going to read a joke about a frog and an economics student. Some words are missing from the text. Choose the most appropriate answer from the options (A-D) for each gap (9-16) in the text. Write the letter of the appropriate answer in the white box. There is one example (0) at the beginning.',
          passage: [
            { style: 'title', text: 'A MODERN TALE' },
            {
              text: 'An economics graduate student {{0}} a road one day when a frog called out to him and said, “If you kiss me, I\'ll turn into a beautiful princess.” He stopped, picked {{9}} the frog, and put it in his pocket. The frog spoke up again and said, “If you kiss me and turn me back into a beautiful princess, I will stay with you for {{10}} one week.” The graduate student took the frog out of his pocket, smiled at it, and {{11}} it to his pocket.',
            },
            {
              text: 'Desperate, the frog then cried out, “If you kiss me and turn me back into a princess, I\'ll stay with you {{12}} as you want.” Again, the grad student took the frog out, smiled at it, and put it back into his pocket. Finally, the frog asked, “What is the matter? I have {{13}} you I\'m a beautiful princess, that I\'ll be your girlfriend and do anything you want. Why {{14}} you kiss me?” The student said, “Look, I\'m an economist. I have no idea {{15}} it would be like to have a girlfriend. But a talking frog has to be {{16}} its weight in gold.”',
            },
          ],
          examples: [
            {
              id: '0',
              type: 'mcq',
              options: [
                { key: 'A', text: 'did cross' },
                { key: 'B', text: 'has crossed' },
                { key: 'C', text: 'was crossing' },
                { key: 'D', text: 'could cross' },
              ],
              answer: 'C',
            },
          ],
          items: [
            { id: '9', type: 'mcq', options: [{ key: 'A', text: 'on' }, { key: 'B', text: 'out' }, { key: 'C', text: 'up' }, { key: 'D', text: 'over' }], answer: 'C' },
            { id: '10', type: 'mcq', options: [{ key: 'A', text: 'as much' }, { key: 'B', text: 'at least' }, { key: 'C', text: 'over than' }, { key: 'D', text: 'at last' }], answer: 'B' },
            { id: '11', type: 'mcq', options: [{ key: 'A', text: 'removed' }, { key: 'B', text: 'rescued' }, { key: 'C', text: 'returned' }, { key: 'D', text: 'remained' }], answer: 'C' },
            { id: '12', type: 'mcq', options: [{ key: 'A', text: 'so much' }, { key: 'B', text: 'as far' }, { key: 'C', text: 'forever' }, { key: 'D', text: 'as long' }], answer: 'D' },
            { id: '13', type: 'mcq', options: [{ key: 'A', text: 'begged' }, { key: 'B', text: 'said' }, { key: 'C', text: 'explained' }, { key: 'D', text: 'told' }], answer: 'D' },
            { id: '14', type: 'mcq', options: [{ key: 'A', text: 'unable' }, { key: 'B', text: 'won\'t' }, { key: 'C', text: 'refuse' }, { key: 'D', text: 'haven\'t' }], answer: 'B' },
            { id: '15', type: 'mcq', options: [{ key: 'A', text: 'how' }, { key: 'B', text: 'that' }, { key: 'C', text: 'what' }, { key: 'D', text: 'of' }], answer: 'C' },
            { id: '16', type: 'mcq', options: [{ key: 'A', text: 'lose' }, { key: 'B', text: 'worth' }, { key: 'C', text: 'like' }, { key: 'D', text: 'worse' }], answer: 'B' },
          ],
        },
        {
          id: 'II-3',
          label: 'Task 3',
          instructions:
            'You are going to read about an interesting habit of New Zealanders and Australians. Some words are missing from the text. Your task is to write the missing words on the dotted lines (17-25) after the text. Use only one word in each gap. There is an example (0) at the beginning.',
          passage: [
            { style: 'title', text: 'BAREFOOT' },
            { text: 'I had just moved to New Zealand, at age 12, {{0}} a new friend suggested that we go out to the corner store for some candy.' },
            {
              text: 'It wasn\'t a warm day – July or August; {{17}} was around 50 degrees Fahrenheit (10°C) that day in Auckland. However, when I stopped {{18}} put on my shoes, she looked puzzled. Why would I need shoes {{19}} a quick trip down the road?',
            },
            {
              text: 'New Zealanders – and their Australian cousins – like to go barefoot. They\'ll often choose {{20}} go to the gas station, the grocery store and even the pub without shoes.',
            },
            {
              text: 'Seth Kugel, a writer for The New York Times, put it {{21}} this: “People walk around barefoot. On the street. In supermarkets. All over. It\'s not everyone, but it\'s a significant enough minority to be quite surprising and {{22}} bit confusing.” In Perth, at least one elementary school has a “shoes optional” policy, with administrators claiming that going barefoot “helped children strengthen {{23}} feet and body.”',
            },
            {
              text: 'There isn\'t a clear reason {{24}} it\'s so common to go barefoot. Some say it is due to the influence of the two nations\' ancient cultures. Others see it {{25}} evidence of a more casual, down-to-earth culture.',
            },
          ],
          examples: [{ id: '0', type: 'short-text', answer: { accepted: ['when'], match: 'exact-ci' } }],
          items: [
            { id: '17', type: 'short-text', answer: { accepted: ['it'], match: 'exact-ci' } },
            { id: '18', type: 'short-text', answer: { accepted: ['to', 'and'], match: 'exact-ci' } },
            { id: '19', type: 'short-text', answer: { accepted: ['for', 'on', 'during'], match: 'exact-ci' } },
            { id: '20', type: 'short-text', answer: { accepted: ['to'], match: 'exact-ci' } },
            { id: '21', type: 'short-text', answer: { accepted: ['like'], match: 'exact-ci' } },
            { id: '22', type: 'short-text', answer: { accepted: ['a'], match: 'exact-ci' } },
            { id: '23', type: 'short-text', answer: { accepted: ['their', 'the', 'both'], match: 'exact-ci' } },
            { id: '24', type: 'short-text', answer: { accepted: ['why'], match: 'exact-ci' } },
            { id: '25', type: 'short-text', answer: { accepted: ['as', 'like'], match: 'exact-ci' } },
          ],
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
        storagePath: 'erettsegi-en-kozep-2026-majus.mp3',
        durationSec: 1795,
        // Task starts: the ~60 s reading pause of each task found by silence detection, minus the length of its announcement (approximate, ±10 s).
        taskMarkers: [
          { taskId: 'III-1', startSec: 115 },
          { taskId: 'III-2', startSec: 604 },
          { taskId: 'III-3', startSec: 1172 },
        ],
      },
      // útmutató p. 7: feladatpont 0–25 → vizsgapont
      conversion: [0, 1, 3, 4, 5, 7, 8, 9, 11, 12, 13, 15, 16, 17, 18, 20, 21, 22, 24, 25, 26, 28, 29, 30, 32, 33],
      transcripts: [
        {
          taskId: 'III-1',
          title: 'Ronald Reagan\'s joke',
          paragraphs: [
            'Ronald Reagan, the 40th president of the United States, had a great sense of humor. "This reminds me of a story" was a famous line President Reagan used in many of his speeches to lead into a joke. He told the following one at a reception in 1985.',
            'This is a story about an elderly couple who were getting ready for bed one night, and the wife said, "Oh, I am just so hungry for ice cream, and there isn\'t any in the house.\'\' And the husband said, "I\'ll get some.\'\' "Oh,\'\' she said, "you\'re a dear.\'\' And she said, "Vanilla with chocolate sauce.\'\' He said, "Vanilla with chocolate sauce.\'\' She said, "Write it down. Now, you\'ll forget, dear.\'\' He said, "I won\'t forget.\'\' And she said, "And a cherry on top.\'\' And he said, "And a cherry on top.\'\' Well, she said, "Please write it down. I know you\'ll forget.\'\' And he said, "I won\'t forget. Vanilla with chocolate sauce and a cherry on top.\'\' And he went away.',
            'By the time he got back, she was already in bed, and he handed her the paper bag. She opened it and there was a ham sandwich. And she said, "I told you to write it down. You forgot the ketchup.\'\'',
          ],
        },
        {
          taskId: 'III-2',
          title: 'The Angel',
          paragraphs: [
            'Reporter: You are listening to Radio Bridge 102.1. Our phone-in program starts with some heart-warming stories from our listeners. And our first caller is…?',
            'Jane: Jane from Chichester.',
            'Reporter: Hi Jane. What\'s the weather like there?',
            'Jane: There is a strong wind and cold rain.',
            'Reporter: Oh, dear! So, Jane, you have a touching story to tell, don\'t you?',
            'Jane: I certainly do. I\'d call my story \'The Angel\'.',
            'Reporter: Sounds very promising!',
            'Jane: Yeah. I was travelling from the south of England to the north of Scotland to start a new job the next morning. I had taken the night train to London and the journey took about two hours and I only paid £8 because I\'d booked in advance. Anyway, here I was at London Victoria station and I was due to catch an early morning flight from Heathrow. However, the direct bus to the airport was cancelled, and I had to make my own way on a series of night buses. But it was about 2:30am and I had never used London\'s night buses before. I was young and a little scared, standing in the middle of Victoria station trying to check the bus timetable, but there were big black spots on it, so I couldn\'t read it. On top of everything, my phone was dead. Suddenly, a woman came up to me and asked, “Are you all right, love?” And I explained with tears in my eyes that I thought I was going to miss my flight. She looked up my route on her phone, wrote down all the buses and trains I would need to take, including the times. She waited with me the whole time, about twenty minutes; then, when the bus pulled up she paid my fare – in London you can no longer pay bus fares in cash – and I didn\'t have an Oyster card, you know the smart card you can pay with. I got on and looked at her, and she just shrugged and said, “Oh, I\'m not getting the bus, you just looked like you needed someone.” I think about her now and then, and I\'m incredibly grateful to her.',
            'Reporter: Well, your story is heart-warming, indeed. Thank you, Jane. And our next caller is…',
          ],
        },
        {
          taskId: 'III-3',
          title: 'Fatou, the world\'s oldest gorilla in captivity',
          paragraphs: [
            'Fatou is the world\'s oldest gorilla in captivity. In the wild, her species typically lives for 40 to 50 years. Fatou celebrated her 68th birthday in April 2025 and she\'s been living at the Berlin Zoo since 1959. Prior to Fatou, the oldest known gorilla in human care was Colo, who spent her entire life at Columbus Zoo in Ohio, USA. She died in 2017 aged 60.',
            'Fatou\'s life has not only been extremely long but also very eventful, particularly in her early years. She was originally found in Western Africa in 1959 by a French sailor, who sold her for cash to pay back the money he owed to a pub. She was then bought by a French animal trader who sold her to the Berlin Zoo. While Fatou\'s exact birth date is unknown because she was born in the wild, she was most likely two years old when she arrived at the zoo, so she was probably born in 1957.',
            'Fatou\'s birthday on the 11th of April is always a big event attracting many visitors and people from the press. She is presented with a special fruit basket including strawberries, her absolute favourite. Although she would like to eat them every day, Fatou\'s advanced age makes it difficult for her to process the sugar in fruits. Her day-to-day diet consists almost entirely of vegetables, all carefully selected so that she can chew them easily since she has no longer any teeth.',
            'Because of her advanced age, Fatou has her own private area among the gorillas, but, when she chooses, she is still able to play with her younger neighbours: Mpenzi, Bibi, Djambala, Sango and Tilla.',
            'Despite having only one baby, Fatou is a grandmother of two, great-grandmother of 13, great-great-grandmother of 20 and great-great-great-grandmother of three.',
          ],
        },
      ],
      tasks: [
        {
          id: 'III-1',
          label: 'TASK 1',
          instructions:
            'In this section you will listen to one of Ronald Reagan\'s favourite jokes. Your task is to complete the sentences with two words indicated by the gaps, using the exact words you hear in the recording. First, you will have some time to study the task, and then we will play the whole recording in one piece. Then, you will hear the recording again, but this time we will play the text in shorter sections to give you enough time to write down your answers.',
          examples: [
            {
              id: '0',
              type: 'short-text',
              prompt: 'Ronald Reagan was the ________ ________ of the United States.',
              answer: { accepted: ['40th president'], match: 'exact-ci' },
            },
          ],
          items: [
            {
              id: '1',
              type: 'short-text',
              prompt: '“This reminds me of a story” was a(n) ________ ________ President Reagan used in many of his speeches.',
              answer: { accepted: ['famous line'], match: 'keywords', keywords: [['famous'], ['line']], maxWords: 2 },
            },
            {
              id: '2',
              type: 'short-text',
              prompt: 'The story is about a(n) ________ ________ who were getting ready for bed.',
              answer: { accepted: ['elderly couple'], match: 'keywords', keywords: [['elderly'], ['couple']], maxWords: 2 },
            },
            {
              id: '3',
              type: 'short-text',
              prompt: 'The wife said she was ________ ________ ice cream.',
              answer: { accepted: ['hungry for'], match: 'keywords', keywords: [['hungry'], ['for']], maxWords: 2 },
            },
            {
              id: '4',
              type: 'short-text',
              prompt: 'She wanted vanilla with ________ ________.',
              answer: { accepted: ['chocolate sauce'], match: 'keywords', keywords: [['chocolate'], ['sauce']], maxWords: 2 },
            },
            {
              id: '5',
              type: 'short-text',
              prompt: 'She wanted a cherry ________ ________.',
              answer: { accepted: ['on top'], match: 'keywords', keywords: [['on'], ['top']], maxWords: 2 },
            },
            {
              id: '6',
              type: 'short-text',
              prompt: 'She asked him to ________ ________ what she said.',
              answer: { accepted: ['write down'], match: 'keywords', keywords: [['write'], ['down']], maxWords: 2 },
              reviewNote: 'A „write it” megoldás nem fogadható el.',
            },
            {
              id: '7',
              type: 'short-text',
              prompt: 'By the time the husband arrived home, his wife was ________ ________.',
              answer: { accepted: ['in bed'], match: 'keywords', keywords: [['in'], ['bed']], maxWords: 2 },
            },
            {
              id: '8',
              type: 'short-text',
              prompt: 'In the paper bag there was a(n) ________ ________.',
              answer: { accepted: ['ham sandwich'], match: 'keywords', keywords: [['ham'], ['sandwich']], maxWords: 2 },
            },
          ],
        },
        {
          id: 'III-2',
          label: 'TASK 2',
          instructions:
            'In this section you will listen to a story in a phone-in radio programme. Your task will be to write the letter of the correct answer in the boxes on the right. First, you will have some time to study the task, and then we will play the whole recording in one piece. Then you will hear the recording again, but this time we will play the text in shorter sections to give you enough time to write down your answers.',
          examples: [
            {
              id: '0',
              type: 'mcq',
              stem: 'The radio frequency of Radio Bridge is …',
              options: [{ key: 'A', text: '101.2.' }, { key: 'B', text: '102.1.' }, { key: 'C', text: '102.2.' }],
              answer: 'B',
            },
          ],
          items: [
            { id: '9', type: 'mcq', stem: 'Jane said the weather in Chichester was ...', options: [{ key: 'A', text: 'warm and dry.' }, { key: 'B', text: 'not very nice.' }, { key: 'C', text: 'absolutely lovely.' }], answer: 'B' },
            { id: '10', type: 'mcq', stem: 'Jane travelled to Scotland to ...', options: [{ key: 'A', text: 'work there.' }, { key: 'B', text: 'have a holiday.' }, { key: 'C', text: 'visit a relative.' }], answer: 'A' },
            { id: '11', type: 'mcq', stem: 'Jane paid only £8 for the train because ...', options: [{ key: 'A', text: 'she was a student.' }, { key: 'B', text: 'it was a night train.' }, { key: 'C', text: 'she\'d bought the ticket early.' }], answer: 'C' },
            { id: '12', type: 'mcq', stem: 'Jane\'s direct bus to Heathrow ...', options: [{ key: 'A', text: 'was very late.' }, { key: 'B', text: 'had just left.' }, { key: 'C', text: 'didn\'t run.' }], answer: 'C' },
            { id: '13', type: 'mcq', stem: 'Jane couldn\'t read the timetable because ...', options: [{ key: 'A', text: 'it was too dark at the station.' }, { key: 'B', text: 'it was too dirty.' }, { key: 'C', text: 'her phone wasn\'t there.' }], answer: 'B' },
            { id: '14', type: 'mcq', stem: 'The woman …', options: [{ key: 'A', text: 'looked up Jane\'s flight in the timetable.' }, { key: 'B', text: 'told her that she wouldn\'t miss the flight.' }, { key: 'C', text: 'checked how to get to the airport.' }], answer: 'C' },
            { id: '15', type: 'mcq', stem: 'The woman ...', options: [{ key: 'A', text: 'waited with Jane for an hour.' }, { key: 'B', text: 'paid Jane\'s fare.' }, { key: 'C', text: 'drove her to the airport.' }], answer: 'B' },
            { id: '16', type: 'mcq', stem: 'Jane didn\'t have ...', options: [{ key: 'A', text: 'any cash.' }, { key: 'B', text: 'an Oyster card.' }, { key: 'C', text: 'enough money on her card.' }], answer: 'B' },
          ],
        },
        {
          id: 'III-3',
          label: 'TASK 3',
          instructions:
            'In this section you will hear about Fatou, the world\'s oldest gorilla in captivity. Your task will be to decide whether the following statements are true, false or we do not know because the text does not say, and write the appropriate letter in the boxes on the right. Write A if the statement is true, write B if the statement is false, and write C if the text does not say. First, you will have some time to study the task, and then we will play the whole recording in one piece. Then, you will hear the recording again, but this time we will play the text in shorter sections to give you enough time to write down your answers. A = TRUE B = FALSE C = THE TEXT DOES NOT SAY',
          options: TFN,
          examples: [{ id: '0', type: 'mcq', stem: 'In the wild, gorillas typically live for 40-50 years.', answer: 'A' }],
          items: tfn(
            17,
            [
              'When she died, Colo was older than Fatou is now.',
              'The French sailor got more money for Fatou than he owed to the pub.',
              'A French animal trader sold Fatou to the Berlin Zoo.',
              'Fatou was definitely born in 1959.',
              'Only very few people can attend Fatou\'s birthday celebrations.',
              'Normally, Fatou does not get a lot of fruit to eat.',
              'Despite her age, Fatou still has a few teeth.',
              'Fatou usually plays with her neighbours in the morning.',
              'Fatou has many children.',
            ],
            'B C A B B A B C B',
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
          instructions: 'You are a visiting student in Iowa, and you have an appointment with a local dentist, Dr Evans. This would be your second visit, but you have just realized that you won\'t be able to make it.',
          items: [
            {
              id: '1',
              type: 'production',
              prompt: ['Write an email of 80-100 words to Dr Evans in which you'],
              contentPoints: [
                'remind him of who you are and when your original appointment is,',
                'apologize and explain why you can\'t go,',
                'ask for a new appointment, suggesting the days of the week that suit you.',
              ],
              promptAfter: ['Begin your email like this:'],
              minWords: 80,
              maxWords: 100,
              opening: 'Dear Dr Evans,',
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
          instructions:
            'You have an online group with international friends you used to study with in Britain, and you have recently found the following message from Santokh, a boy from India.',
          passage: [
            { text: 'Hi Guys,' },
            {
              text: 'You saw photos of my younger sister, Sriti, from last year, but I bet you wouldn\'t recognize her now.',
            },
            {
              text: 'She is thirteen and has always been well-rounded. Some family members have teased her about this for years, and I don\'t think they realize how much it has hurt her. Now she is getting thinner and thinner, and I\'m very worried. She never seems to eat properly, and I\'ve heard her tell our mother that she has eaten at school or at a friend\'s house when I know it isn\'t true. At mealtimes, she keeps saying that she doesn\'t like this and that, apparently, she no longer likes her once-favourite dishes either. Our parents don\'t notice this because they are too busy with their own problems.',
            },
            {
              text: 'I\'m concerned she may have developed an eating disorder or whatever you call it, but she won\'t talk about it, and I don\'t know what to do.',
            },
            { text: 'Santokh' },
          ],
          items: [
            {
              id: '2',
              type: 'production',
              prompt: ['Write a comment of 100-120 words to Santokh in which you tell him'],
              contentPoints: [
                'if you think his sister is in danger,',
                'if it is an older brother\'s duty to do something in a situation like this,',
                'what you think could be done (at least 2 options),',
                'which of the above options you would personally prefer and why.',
              ],
              promptAfter: ['Begin your comment like this:'],
              minWords: 100,
              maxWords: 120,
              opening: 'Santokh:',
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
