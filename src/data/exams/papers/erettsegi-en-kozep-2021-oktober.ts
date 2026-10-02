// Angol nyelv, középszintű írásbeli érettségi, 2021. október 21. (2119), Oktatási Hivatal.
// Transcribed verbatim from the feladatlap and its javítási-értékelési útmutató (answer key,
// conversion tables, listening transcripts). Decorative photos are left out.
import type { ExamPaper } from '../types'
import { choices, cloze, enListeningIntro, EN_NOTICES_HU, questions, shortAnswer, TFN, tfn, words } from './enKozep.ts'

const bothAB = { key: 'AB', text: 'Both A and B' }

const paper: ExamPaper = {
  id: 'erettsegi-en-kozep-2021-oktober',
  type: 'erettsegi',
  language: 'en',
  level: 'kozep',
  sittingLabelHu: '2021. október',
  source: 'Oktatási Hivatal: Angol nyelv, középszintű írásbeli vizsga, 2021. október 21. (2119) — feladatlap és javítási-értékelési útmutató.',
  noticesHu: EN_NOTICES_HU,
  sections: [
    {
      id: 'I',
      kind: 'reading',
      titleHu: 'I. Olvasott szöveg értése',
      timeLimitMin: 60,
      // útmutató p. 3: feladatpont 0–27 → vizsgapont
      conversion: [0, 1, 2, 4, 5, 6, 7, 9, 10, 11, 12, 13, 15, 16, 17, 18, 20, 22, 23, 24, 26, 27, 28, 29, 30, 31, 32, 33],
      tasks: [
        {
          id: 'I-1',
          label: 'Task 1',
          instructions:
            'In the following text about online gaming, the headings have been removed. Your task is to match the headings to the paragraphs. Write the letters of the headings (A-K) next to the appropriate numbers (1-7). There are two extra headings that you do not need. Write the letters in the white boxes as in the example (0).',
          passage: [
            { style: 'title', text: 'TOP TIPS FOR GAMING' },
            {
              text: 'Whether it is done via mobile devices or using games consoles, gaming is one of the top activities enjoyed by young people online. Here are our tips to play safely:',
            },
            { text: '{{0}} It is important to find out information on age ratings. Look out for the icon on the game that shows what age classification it has been given.' },
            { text: '{{1}} Don\'t share identifying details like your full name, mobile phone number or address. Sharing this type of information could put you at great risk.' },
            {
              text: '{{2}} To avoid being hacked, pick a strong password. Make sure you include a combination of letters, numbers and symbols. Treat your password like your toothbrush: you shouldn\'t share it with anyone else.',
            },
            {
              text: '{{3}} Online friends are still strangers even if you have been talking to them for a long time and meeting someone you have only been in touch with online can be dangerous.',
            },
            {
              text: '{{4}} Make sure you know what tools are available if someone is being aggressive in a game. Learn how to block, mute, delete and report on the games and consoles you use.',
            },
            {
              text: '{{5}} Games have been designed to be fun and exciting and to keep us coming back for more. But remember, for healthy gameplay, it\'s important to stop for at least five minutes every hour.',
            },
            {
              text: '{{6}} You may be asked to pay for items in the game or to upgrade to the next level. The amount may seem small, but you can run up a large bill before you even realise it. We suggest blocking in-app purchases.',
            },
            { text: '{{7}} Don\'t break the law by downloading non-copyrighted games or cheat programmes to skip to a higher level.' },
          ],
          bankTitle: 'HEADINGS',
          bank: [
            { key: 'A', text: 'Say no to meeting in person.' },
            { key: 'B', text: 'Stay legal.' },
            { key: 'C', text: 'Check if you are old enough to play.' },
            { key: 'D', text: 'Protect your account.' },
            { key: 'E', text: 'Avoid unwanted charges.' },
            { key: 'F', text: 'Take regular breaks.' },
            { key: 'G', text: 'Avoid online interactions.' },
            { key: 'H', text: 'Keep personal information safe.' },
            { key: 'I', text: 'Know what to do if other players are ruining the game.' },
            { key: 'K', text: 'Notice and control your emotions during the game.' },
          ],
          unusedBankCount: 2,
          examples: choices(0, 'C'),
          items: choices(1, 'H D A I F E B'),
        },
        {
          id: 'I-2',
          label: 'Task 2',
          instructions:
            'Read this article about an unusual job advertisement. Some parts of sentences have been left out from the text. Your task is to reconstruct the text by filling in the gaps (8-14) from the list (A-K) below. Write the letters in the white boxes next to the numbers as in the example (0). Remember that there are two extra letters that you do not need.',
          passage: [
            { style: 'title', text: 'DISNEY PRINCESS FOR A NANNY?' },
            {
              text: 'If you\'re tired of your office job and want a creative challenge, you might want to consider this new position. A married couple are looking for someone to take care of their six-year-old twin girls {{0}}, but there\'s a catch – you have to do it dressed as a Disney princess. The parents posted an advert on Childcare, {{8}} exactly what they are looking for.',
            },
            {
              text: 'You\'ll need to dress and play {{9}}, whether that\'s Anna from Frozen, Snow White, Rapunzel or Cinderella. The chosen nanny will be asked to arrange Disney-related activities, such as arts and crafts, baking and singing, as well as {{10}}, including picking the girls up from school, cooking dinner and putting them to bed {{11}}.',
            },
            {
              text: 'According to the couple, the twin girls {{12}} and their parents believe this is the best way to communicate some important values to them. The pair admit that it\'s an unusual request, but want to use Disney princesses to teach the twins about “things like kindness, empathy, bravery and ambition.” According to the couple, the right person will “have a passion for all things Disney” and will be able to {{13}} with their girls.',
            },
            {
              text: 'The right candidate will take home £40,000 a year, {{14}}. The Disney costumes will also be paid for by the parents, and 25 days\' holiday is on the table.',
            },
            { text: 'So now is the time to ask yourself the question: Do you have what it takes to be a part-time Disney princess?' },
          ],
          bank: [
            { key: 'A', text: 'always wear a wig, as well' },
            { key: 'B', text: 'if the parents have to work late' },
            { key: 'C', text: 'in a part-time nanny role' },
            { key: 'D', text: 'share that love of those characters' },
            { key: 'E', text: 'where they describe in detail' },
            { key: 'F', text: 'are crazy about Disney princesses' },
            { key: 'G', text: 'working just four days a week' },
            { key: 'H', text: 'a new character every month' },
            { key: 'I', text: 'looking after them when they are sick' },
            { key: 'K', text: 'perform regular nanny duties' },
          ],
          unusedBankCount: 2,
          examples: choices(0, 'C'),
          items: choices(8, 'E H K B F D G'),
        },
        {
          id: 'I-3',
          label: 'Task 3',
          instructions:
            'Read the following article about an incident on a plane and then read the half sentences that follow the text. Your task is to match the half sentences based on the information in the article. Write the letters (A-I) in the white boxes next to the numbers (15-20) as in the example (0). Remember that there are two extra letters that you will not need.',
          passage: [
            { style: 'title', text: 'CANADIAN MAN KICKED OFF WESTJET FLIGHT FOR BEING ASLEEP BEFORE TAKE-OFF' },
            {
              text: 'Mr Bennett, his wife and their son were taking a WestJet flight from Toronto to Cuba on 13 October. Mr Bennet hadn\'t slept well the night before, so before the flight he took a sleeping pill which he had been given by his doctor. He fell asleep immediately after boarding the plane. The trouble began when a flight attendant couldn\'t wake him up as the plane was preparing to take off. He became worried that there was something medically wrong with the passenger. WestJet requires all passengers to be awake during take-off for safety reasons.',
            },
            {
              text: 'Mr Bennet\'s wife, whose first language is not English, couldn\'t tell the crew why he needed a rest. She was eventually able to wake her husband up, who explained he had taken medication. However, the cabin crew wanted him to get off the plane.',
            },
            {
              text: 'Paramedics were called, removed him from the plane, checked him and said he was medically fit to fly. Bennett also got an email from his doctor saying he was healthy enough to fly. However, they were not allowed back on the flight.',
            },
            {
              text: 'The family, who had booked an all-inclusive vacation in Cuba, were told by WestJet they could take the next flight the following week.',
            },
            {
              text: 'The Bennets didn\'t want to miss a week of the family vacation, so instead of waiting for another WestJet flight, they paid more than $2,000 to buy a plane ticket from another airline. They had to cut their vacation short by two days.',
            },
            { text: 'The family would like to receive compensation from the airline.' },
            { text: 'The Bennets …', itemId: '0' },
            { text: 'Mrs Bennet …', itemId: '15' },
            { text: 'Paramedics …', itemId: '16' },
            { text: 'A flight attendant …', itemId: '17' },
            { style: 'heading', text: 'Mr Bennet\'s doctor …' },
            { text: 'Mr Bennet\'s doctor …', itemId: '18' },
            { text: 'The crew on the plane …', itemId: '19' },
            { text: 'The airline …', itemId: '20' },
          ],
          bank: [
            { key: 'A', text: 'gave Mr Bennet sleeping pills.' },
            { key: 'B', text: 'apologised for the incident.' },
            { key: 'C', text: 'missed part of the vacation.' },
            { key: 'D', text: 'was unable to wake up Mr Bennet before take-off.' },
            { key: 'E', text: 'didn\'t speak English well enough to explain the situation.' },
            { key: 'F', text: 'paid some money as compensation.' },
            { key: 'G', text: 'decided that Mr Bennet should get off the plane.' },
            { key: 'H', text: 'offered another flight a week later.' },
            { key: 'I', text: 'examined Mr Bennet and said that he was able to fly.' },
          ],
          unusedBankCount: 2,
          examples: choices(0, 'C'),
          items: choices(15, 'E I D A G H'),
        },
        {
          id: 'I-4',
          label: 'Task 4',
          instructions:
            'Read this article about a strange work of land art in Australia and then read the statements (21-27) following it. Mark a sentence A if it is true according to the article. Mark it B if it is false. Mark it C if there isn\'t enough information in the text to decide if the sentence is true or not. Write the letters in the white boxes next to the numbers as in the example (0). A = TRUE B = FALSE C = THE TEXT DOES NOT SAY',
          passage: [
            { style: 'title', text: 'MARREE MAN' },
            {
              text: 'Since a pilot first noticed Marree Man in South Australia in 1998, the mysterious work of land art has attracted international attention. Marree Man is so large it is best viewed from high above. The artwork represents a hunter with what looks like a stick or boomerang in his hand. Its length is 3.5 kilometers (2.2 miles) from top to bottom.',
            },
            {
              text: 'For many years, Marree Man, named after a nearby town, was a well-known feature in satellite images of the area, but the wind and the rain destroyed many of the lines. By 2013, they were hardly visible in natural-color images.',
            },
            {
              text: 'In August 2016, local business owners, who were worried about the loss of what had become a tourist attraction, decided to restore the fading lines. They used machines to redraw Marree Man, which took them five days.',
            },
            {
              text: 'The restoration team thinks the updated work of art will last longer than the original because they designed it to trap water and planted trees along the lines. Over time, they hope plants will turn the lines green.',
            },
            {
              text: 'Who created the huge work of art, and why, remains unknown, although a cash reward has been announced for information about it. Some people believe that it was probably an artist living in Alice Springs who created Marree Man; others think that maybe the creator was an American.',
            },
          ],
          options: TFN,
          examples: [{ id: '0', type: 'mcq', stem: 'It was a pilot who discovered the large geoglyph.', answer: 'A' }],
          items: tfn(
            21,
            [
              'The pilot was checking geographical data when he saw the huge image.',
              'Marree Man was discovered in the early 21st century.',
              'The artwork was named Marree Man immediately after its discovery.',
              'The lines of the image had completely disappeared by 2013.',
              'The restoration work lasted more than a week.',
              'The restoration team wants plants to grow along the lines.',
              'The creator of Marree Man has not been named yet.',
            ],
            'C B C B B A A',
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
            'You are going to read an article about how a school in Derbyshire, England, is trying to get parents to talk to their children more. Some words are missing from the text. Your task is to choose the most appropriate word from the list (A-M) for each gap (1-8) in the text. Write the letter of the appropriate word in the white box. You can use each word only once. There are three extra words that you do not need to use. There is one example (0) at the beginning.',
          passage: [
            { style: 'title', text: 'SMILES VS MOBILES' },
            {
              text: 'A school has asked parents to put {{0}} their phones and communicate with their children at the end of the day. The signs {{1}} at the entrances to Redwood Primary School in Derby advise adults to "greet your child with a smile, not a mobile." The school said it wanted parents and children to talk and {{2}} more to each other at home. They have mostly received a positive response from parents.',
            },
            {
              text: 'Teachers Rachel Kirk and Sarah Chaffe produced signs for {{3}} of the school\'s three gates. "{{4}} we\'ve been trying to do is help parents be more effective {{5}} they\'re chatting with their children at home," said Ms Kirk. "The signs are just to {{6}} parents how important it is to greet their children and encourage them to get into a conversation about all the fun things they have {{7}} that day."',
            },
            {
              text: 'However, Kerri Hilton, who has two children at the school, said: "Parents {{8}} be told to pay attention to their children. I always ask my kids about their day at school."',
            },
          ],
          bank: [
            { key: 'A', text: 'DONE' },
            { key: 'B', text: 'EACH' },
            { key: 'C', text: 'DOWN' },
            { key: 'D', text: 'EITHER' },
            { key: 'E', text: 'LISTEN' },
            { key: 'F', text: 'PLACED' },
            { key: 'G', text: 'REMIND' },
            { key: 'H', text: 'SHOULDN\'T' },
            { key: 'I', text: 'THAT' },
            { key: 'K', text: 'WHAT' },
            { key: 'L', text: 'WHEN' },
            { key: 'M', text: 'WON\'T' },
          ],
          unusedBankCount: 3,
          examples: choices(0, 'C'),
          items: choices(1, 'F E B K L G A H'),
        },
        {
          id: 'II-2',
          label: 'Task 2',
          instructions:
            'You are going to read an article about the origins of the @ sign. Some words are missing from the text. Use the words in brackets to form the words that fit in the gaps (9-17). Then write the appropriate form of these words on the dotted lines after the text. There might be cases when you do not have to change the word in brackets. Use only one word for each gap. There is an example (0) at the beginning.',
          passage: [
            { style: 'title', text: 'A WELL-KNOWN SIGN' },
            {
              text: 'In Dutch the @ sign is called a “monkey tail”, in {{0}} a “maggot”, in Danish an “elephant\'s trunk”, and in {{9}} a “snail”. Appearing everywhere now in emails, the @ sign has history.',
            },
            {
              text: 'The first {{10}} use was in The Mannasses Chronicle in 1345, where an @ sign is the first letter in the word ‘Amen’. By the 16th century, in southern {{11}} documents of trade, the sign represented amphora, a storage jar {{12}} since Roman times. By the 18th century it was called ‘commercial A’ and meant ‘at the rate of’ (eg.: 10 hats @ 1 shilling = 10 shillings).',
            },
            { text: 'It didn\'t make it onto the earliest typewriters but was included by 1889, when it became a standard character. By 1963 @ was included in the new {{13}} recognised character set.' },
            {
              text: 'In 1971 computer {{14}} Ray Tomlinson was at work on Arpanet, the prototype of the internet. He added some of his own code to an {{15}} programme and sent a message from one computer to {{16}} – the first email. Ray needed a character to separate the message\'s recipient from the computer it would arrive at, and {{17}} down at his teletype keyboard, he chose the @ symbol and changed the world forever.',
            },
          ],
          examples: words(0, [['Hungary', 'Hungarian']]),
          items: words(9, [
            ['Wales', 'Welsh'],
            ['record', 'recorded'],
            ['Europe', 'European'],
            ['use', 'used'],
            ['international', 'internationally'],
            ['programme', 'programmer', 'programer'],
            ['exist', 'existing', 'existent'],
            ['other', 'another'],
            ['look', 'looking'],
          ]),
        },
        {
          id: 'II-3',
          label: 'Task 3',
          instructions:
            'You are going to read an article about the history of ice cream. Some words are missing from the text. Your task is to write the missing words on the dotted lines (18-25) after the text. Use only one word in each gap. There is an example (0) at the beginning.',
          passage: [
            { style: 'title', text: 'ICE-CREAM' },
            {
              text: 'A kind of ice-cream was invented in China about 200 BC {{0}} a milk and rice mixture was frozen by packing it into snow. It is believed that Roman emperors sent slaves to mountain tops to bring back fresh snow, {{18}} was then flavoured and served as an early form of ice-cream.',
            },
            {
              text: 'The explorer, Marco Polo (1254-1324), is believed to have seen ice-cream being made during his trip to China and introduced {{19}} to Italy. The King of England, Charles I, offered his chef £500 a year to {{20}} his ice-cream recipe a secret from the rest of England.',
            },
            {
              text: 'Ice Cream Sundaes were invented when it became illegal {{21}} sell ice-cream sodas on a Sunday in the American town of Evanston during the late 19th century. To get around the problem, some ice-cream sellers replaced the soda {{22}} syrup and called the dessert an "Ice Cream Sunday". They changed the final "y" for an "e" to avoid upsetting religious leaders.',
            },
            {
              text: 'Probably a Syrian man {{23}} Ernest E Hamwi invented the ice-cream cone in 1904. During the St Louis World\'s Fair in the United States, his waffle booth stood {{24}} to an ice-cream seller who ran short {{25}} dishes. As a favour, Hamwi rolled a waffle to hold his ice-cream and the cone was born.',
            },
          ],
          examples: cloze(0, [['when']]),
          items: cloze(18, [['which'], ['it'], ['keep'], ['to'], ['with'], ['called', 'named'], ['next', 'close', 'near'], ['of', 'on']]),
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
        storagePath: 'erettsegi-en-kozep-2021-oktober.mp3',
        durationSec: 1795,
        // Task starts: the ~60 s reading pause of each task found by silence detection, minus the length of its announcement (approximate, ±10 s).
        taskMarkers: [
          { taskId: 'III-1', startSec: 127 },
          { taskId: 'III-2', startSec: 637 },
          { taskId: 'III-3', startSec: 1156 },
        ],
      },
      // útmutató p. 7: feladatpont 0–25 → vizsgapont
      conversion: [0, 1, 3, 4, 5, 7, 8, 9, 11, 12, 13, 15, 16, 17, 18, 20, 21, 22, 24, 25, 26, 28, 29, 30, 32, 33],
      transcripts: [
        {
          taskId: 'III-1',
          title: 'The monk and the two travellers',
          paragraphs: [
            'One day a traveller was walking along a road on his journey from one village to another. As he walked he noticed a monk working in the fields beside the road. The monk said "Good day" to the traveller, and the traveller nodded to the monk. The traveller then turned to the monk and said, "Excuse me, do you mind if I ask you a question?"',
            '"Not at all," replied the monk.',
            '"I am travelling from the village in the mountains to the village in the valley and I was wondering if you knew what it is like in the village in the valley?"',
            '"Tell me," said the monk, "What was your experience of the village in the mountains?"',
            '"Dreadful," replied the traveller, "to be honest I am glad to be away from there. I found the people most unwelcoming. When I first arrived I was greeted coldly. I was never made to feel part of the village no matter how hard I tried. The villagers keep very much to themselves, they don\'t treat strangers kindly at all. So tell me, what can I expect in the village in the valley?"',
            '"I am sorry to tell you," said the monk, "but I think your experience will be much the same there."',
            'The traveller hung his head unhappily and walked on.',
            'A while later another traveller was journeying down the same road and he also came upon the monk.',
            '"I\'m going to the village in the valley," said the second traveller, "Do you know what it is like?"',
            '"I do," replied the monk "But first tell me - where have you come from?"',
            '"I\'ve come from the village in the mountains."',
            '"And how was that?"',
            '"It was a wonderful experience. I would have stayed if I could, but I must travel on. I felt as though I was a member of the family in the village. The old people gave me much advice, the children laughed and joked with me and people were generally kind and generous. I am sad to have left there. It will always hold special memories for me. And what of the village in the valley?" he asked again.',
            '"I think you will find it much the same," replied the monk, "Good day to you."',
            '"Good day and thank you," the traveller replied, smiled, and journeyed on.',
          ],
        },
        {
          taskId: 'III-2',
          title: 'The lottery ticket',
          paragraphs: [
            'A 39-year-old woman admitted that she had lied. She claimed that she bought the latest winning lottery ticket in Massachusetts, but then lost it. The ticket was worth $18 million after all deductions. Jean Fenn was charged with grand larceny. A conviction could put her in prison for up to seven years.',
            'The real winner of the ticket, Kevin Hayes, 66, presented it a week ago to the store where he had bought it. That store will receive one percent of the prize, or $180,000. The owner of the store, Mark Abrams, 56, was overjoyed. "Last year we had a storm that blew half our roof off. It cost $25,000 to put a new roof on."',
            'Hayes said he was reminded to check his numbers when he heard that a woman had lost her winning ticket. He and his wife had been camping in the mountains when the winning ticket was drawn.',
            '"But I feel sorry for this woman," said Hayes. "She only did this out of desperation. In fact, I\'m going to help her out financially after she gets out of prison. It\'s a shame that this wealthy country has so many poor people. So, I\'m going to donate a lot of this money to different charities. What do I need $18 million for?"',
            'The checks to Hayes and Abrams should arrive within two weeks, according to a lottery spokesman. The spokesman mentioned that lottery players should remember that the odds of winning the lottery are only about one in forty million. Even so, most people think that SOMEONE has to win, and it might as well be them.',
          ],
        },
        {
          taskId: 'III-3',
          title: 'A couple in heaven',
          paragraphs: [
            'An elderly couple, married for sixty years, took a rare vacation. They were not wealthy but were in pretty good health, perhaps because the wife had insisted on a strict diet of healthy foods, no alcohol, no smoking, and lots of gym exercise for most of their lives. Sadly, their plane crashed, and they both died.',
            'They entered heaven, where St Peter took them into a waiting Cadillac limousine. Driving through beautiful countryside, they finally stopped at an extremely large and elegant house and walked inside. It was furnished in gold and silk, with very expensive furniture and wonderful paintings on the walls. There was a fantastic kitchen and the luxurious sitting room was full of delicious food and drink – there was a Jacuzzi and even a waterfall in the huge bathroom. There were beautiful designer clothes hanging in the walk-in wardrobes, and there was a giant HD LED. TV on the wall. When they sat down on the comfortable couch, St Peter said, "Welcome to heaven. This will be your home now."',
            'Absolutely amazed, the old man quietly asked Peter how much all this was going to cost. "Nothing," Peter replied, "this is your heavenly reward."',
            'The old man looked out of the window and saw a superb championship golf course next to the Olympic-sized, heated swimming pool.',
            '"Wow… but how much will I have to pay for the golf club membership?" he asked suspiciously.',
            '"This is heaven," St Peter replied, "You can play for free whenever you wish."',
            'Next, they went to the golf course clubhouse and saw the first-class lunch, with every imaginable food and drink laid out before them. Seeing that the old man wanted to ask another question, St Peter said, "Don\'t ask, this is heaven, it is all free for you to enjoy."',
            'The old man looked around, glanced nervously at his wife, and asked: "Well, dear Peter, where are all the low fat and low cholesterol foods, and the decaffeinated tea?"',
            '"This is heaven. You can eat and drink whatever and as much as you like, and you will never get fat or sick," St Peter replied.',
            '"You mean I don\'t even need to go to the gym?" the old man asked.',
            '"Not unless you want to," St Peter replied.',
            '"And I don\'t ever have to test my sugar or my blood pressure or..."',
            '"No, no, never again. All you do here is enjoy yourself."',
            'The old man looked at his wife with anger, "You and your stupid diets and all those terribly boring workouts. We could have arrived here ten years ago!"',
          ],
        },
      ],
      tasks: [
        {
          id: 'III-1',
          label: 'TASK 1',
          instructions:
            'In this section you will hear a philosophical story about the importance of attitudes. Your task will be to decide whether the following statements are true, false or we do not know because the text does not say, and write the appropriate letter in the boxes on the right. Write A if the statement is true, write B if the statement is false, and write C if the text does not say. First, you will have some time to look at the task, and then we will play the whole recording in one piece. Then, you will hear the recording again, but this time we will play the text in shorter sections to give you enough time to write down your answers. A = TRUE B = FALSE C = THE TEXT DOES NOT SAY',
          options: TFN,
          examples: [{ id: '0', type: 'mcq', stem: 'The two villages were quite a long way from each other.', answer: 'C' }],
          items: tfn(
            1,
            [
              'The traveller asked the monk what it was like in the village in the mountains.',
              'The monk asked the traveller to repeat his question.',
              'The monk told the traveller that he should expect something similar in the next village, too.',
              'The traveller arrived in the village shortly after talking to the monk.',
              'The second traveller asked the monk what life was like in the village he was going to.',
              'The monk used to live in the village the second traveller was coming from.',
              'The second traveller said that the people in the mountain village were extremely nice and good-hearted.',
              'The monk told the second traveller that the people in the next village were rather unwelcoming.',
            ],
            'B B A C A C A B',
          ),
        },
        {
          id: 'III-2',
          label: 'TASK 2',
          instructions:
            'In this section, you will hear a story about a woman who tried to cheat the lottery. Your task will be to give short answers to the questions below by continuing the sentences we have begun for you. First, you will have some time to look at the task, and then we will play the whole recording in one piece. Then, you will hear the recording again, but this time we will play the text in shorter sections to give you enough time to write down your answers.',
          examples: [shortAnswer('0', 'What did the woman admit? She admitted that she ________', 'had lied', [['lied']])],
          items: [
            shortAnswer('9', 'What did she say had happened to her winning lottery ticket? She said that she ________', 'had lost it/the/her ticket', [['lost']]),
            shortAnswer('10', 'How long a prison sentence could she get for what she did? She could be put in prison for up to ________', 'seven/7 years', [['seven', '7'], ['year']]),
            shortAnswer('11', 'Where did Mr Hayes buy the winning lottery ticket? He bought the ticket in a(n) ________', 'store/shop', [['store', 'shop']]),
            shortAnswer(
              '12',
              'How much will Mr Abrams get from the $18 million? He will get ________',
              'one/1 percent/% (of the prize/of it) // $180,000/180,000 dollars',
              [['one', '1', '180,000', '180000'], ['percent', '%', 'dollar', '180,000', '180000']],
            ),
            shortAnswer('13', 'What cost Mr Abrams $25,000 last year? It was a(n) ________', '(new) roof', [['roof']]),
            shortAnswer('14', 'Where were Mr and Mrs Hayes when the winning ticket was drawn? They were camping ________', 'in the mountains', [['mountain']]),
            shortAnswer(
              '15',
              'What is Mr Hayes planning to do to the woman after she comes out of prison? He is going to ________',
              'help her (out financially) // support her // give her (some) money',
              [['help', 'support', 'give', 'money', 'financ']],
            ),
            shortAnswer('16', 'What is Mr Hayes going to donate a lot of money to? To ________', '(different) charities // charity', [['charit']]),
            shortAnswer(
              '17',
              'What are the odds of winning the lottery according to the lottery spokesman? Only one in ________',
              'forty/40 million/40,000,000/40m',
              [['forty', '40'], ['million', '000,000', '40m']],
            ),
          ],
        },
        {
          id: 'III-3',
          label: 'TASK 3',
          instructions:
            'In this section you will hear a joke about the health and fitness craze that is so fashionable today. Your task will be to circle the letter(s) of the correct answer(s) in the boxes on the right. Please note that in this task both answers may be correct. However, there is always at least one correct answer. This means you might have to circle one or two letters. First, you will have some time to look at the task, and then we will play the whole recording in one piece. Then, you will hear the recording again, but this time we will play the text in shorter sections to give you enough time to write down your answers.',
          examples: [
            {
              id: '0',
              type: 'mcq',
              stem: 'The elderly couple …',
              options: [{ key: 'A', text: 'had been married for sixty years.' }, { key: 'B', text: 'were on holiday.' }, bothAB],
              answer: 'AB',
            },
          ],
          items: questions(
            18,
            [
              { stem: 'The couple were ...', options: ['not very rich.', 'sick and rather unfit.'] },
              { stem: 'When the couple entered heaven, St Peter …', options: ['told them how sorry he was to see them there.', 'led them into a waiting car.'] },
              { stem: 'The large house they were taken to had a …', options: ['lot of food and drink in its sitting room.', 'waterfall in its garden.'] },
              { stem: 'The old man asked St Peter how much ... was going to cost.', options: ['their new home', 'the use of the golf course'] },
              { stem: 'The old man asked St Peter …', options: ['how much they had to pay for the lunch.', 'whether there was any low fat food for them.'] },
              { stem: 'St Peter told them that they would never get … in heaven.', options: ['fat', 'ill'] },
              { stem: 'St Peter told them that they could ... if they wanted to.', options: ['go to the gym', 'test their sugar or blood pressure every day'] },
              { stem: 'The old man was …', options: ['angry with his wife about all the dieting and workout.', 'sorry that they hadn\'t entered heaven earlier.'] },
            ],
            'A B A AB B AB A AB',
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
            'You are spending a semester at Reykjavik University, Iceland, as part of your studies, and you have found the following advertisement:',
          passage: [
            { style: 'title', text: 'Reykjavik Roasters looking for Café/Kitchen hand, All Rounder' },
            { text: 'We are expanding and looking for part-time staff to join the team. Several jobs available with minimum 2-month contracts. Students welcome.' },
            { text: 'You must be available 4 days a week, including weekends, do either morning or afternoon shifs or both, have fluent English and good communication skills.' },
            { text: 'You must be enthusiastic, energetic, reliable, willing to learn and able to work in a fast-pace environment.' },
            {
              text: 'We offer a friendly and supportive atmosphere, training in making sandwiches, toasts, omelettes or complete French and English breakfasts, and if you are interested in training as a barista, our coffee experts are there to tutor you for free.',
            },
            { text: 'Send applications and inquiries to Jonas at roasters.rvk@gmail.com.' },
          ],
          items: [
            {
              id: '1',
              type: 'production',
              prompt: ['Write an email of 80-100 words to Jonas in which you'],
              contentPoints: [
                'introduce yourself and apply for the job,',
                'say what you would like to do and learn there,',
                'ask about the beginning and length of shifts.',
              ],
              promptAfter: ['Begin your email like this:'],
              minWords: 80,
              maxWords: 100,
              opening: 'Dear Jonas,',
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
          instructions: 'You have read the following post on an Internet forum called MyProblems.com.',
          passage: [
            {
              text: 'I\'ve been playing the piano for 6 years, and I\'ve got really tired of it by now. I used to like it as a child when I started playing at 10, but nowadays I don\'t really feel like practising – you know how it is, there\'s always something more important to do, like homework, or hanging out with friends. I\'m thinking about quitting, but I\'m afraid I\'d be sorry if I really did.',
            },
            {
              text: 'My piano teacher is really nice, she\'s trying to convince me not to quit, telling me all the time that I\'m talented, and when I\'m there at the music school, I always feel she\'s right and I promise myself that I will practise more. I do like playing after all.',
            },
            {
              text: 'I talked to my Dad about it, which was a big mistake, though. He won\'t hear of me quitting and he says playing a musical instrument should be part of someone\'s life and that I should pass my exams and stop whining about it.',
            },
            { text: 'I really don\'t know what to do.' },
            { text: 'Mia, 16' },
          ],
          items: [
            {
              id: '2',
              type: 'production',
              prompt: ['Write a comment of 100-120 words to Mia\'s post in which you tell her'],
              contentPoints: [
                'whether you think learning to play a musical instrument is important and why (not),',
                'what you think about her father\'s attitude,',
                'if you\'ve ever had a similar dilemma about quitting an activity and what you did about it,',
                'what you think she should do.',
              ],
              promptAfter: ['Begin your comment like this:'],
              minWords: 100,
              maxWords: 120,
              opening: 'Mia,',
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
