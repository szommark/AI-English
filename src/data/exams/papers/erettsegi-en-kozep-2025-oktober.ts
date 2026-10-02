// Angol nyelv, középszintű írásbeli érettségi, 2025. október 16. (K2511), Oktatási Hivatal.
// Transcribed verbatim from the feladatlap and its javítási-értékelési útmutató (answer key,
// conversion tables, listening transcripts). Decorative photos are left out.
import type { ExamPaper } from '../types'
import { choices, cloze, enListeningIntro, EN_NOTICES_HU, gapMcqs, heard, questions, TFN, tfn, words } from './enKozep.ts'

const paper: ExamPaper = {
  id: 'erettsegi-en-kozep-2025-oktober',
  type: 'erettsegi',
  language: 'en',
  level: 'kozep',
  sittingLabelHu: '2025. október',
  source: 'Oktatási Hivatal: Angol nyelv, középszintű írásbeli vizsga, 2025. október 16. — feladatlap és javítási-értékelési útmutató.',
  noticesHu: EN_NOTICES_HU,
  sections: [
    {
      id: 'I',
      kind: 'reading',
      titleHu: 'I. Olvasott szöveg értése',
      timeLimitMin: 60,
      // útmutató p. 3: feladatpont 0–26 → vizsgapont
      conversion: [0, 1, 3, 4, 5, 6, 8, 9, 10, 11, 13, 14, 15, 17, 18, 19, 20, 22, 23, 24, 25, 27, 28, 29, 30, 32, 33],
      tasks: [
        {
          id: 'I-1',
          label: 'Task 1',
          instructions:
            'Read the following answers from the website of London\'s leading arts academy. The questions have been removed. Your task is to write the letters of the questions (A-K) next to the appropriate numbers (1-6). There are three extra questions that you do not need. Write the letters in the white boxes as in the example (0).',
          passage: [
            { style: 'title', text: 'ARTS COURSES AT CITY ACADEMY' },
            { text: 'Interested in joining a course? We\'ve created a list of our most frequently asked questions.' },
            { text: '{{0}} All of our courses are designed for adults, and we welcome anyone over the age of 18.' },
            { text: '{{1}} Unfortunately, no. We recommend trying one of our taster sessions, which have been designed for those who just want to see whether the course is right for them.' },
            { text: '{{2}} As we do not offer individual classes, participants must sign up for a full course. However, the tuition fee can be divided into two equal parts.' },
            { text: '{{3}} This depends on the type of course. If it is not possible, then we will put you on a waiting list and we\'ll let you know if a place becomes available.' },
            { text: '{{4}} As soon as you are aware that you will have to miss a session, please let Student Services know. We will get in touch with your tutor and pass on any relevant homework for your next class.' },
            { text: '{{5}} In this case we can transfer you to another course providing you give reasonable notice. We want to make sure that you gain the most from your course.' },
            { text: '{{6}} Once a course has begun, we are unable to pay back any of the fee. However, we can offer you a course credit code for the value of the remaining classes, which you can use towards a future booking.' },
          ],
          bankTitle: 'QUESTIONS',
          bank: [
            { key: 'A', text: 'The course that I want to take is sold out. Can you add an extra person?' },
            { key: 'B', text: 'I can no longer attend my course. Can I request a refund?' },
            { key: 'C', text: 'I am a teenager. Can I join a course?' },
            { key: 'D', text: 'Can I join another class once if I miss my session?' },
            { key: 'E', text: 'I can\'t attend a class, what should I do?' },
            { key: 'F', text: 'Will I get a qualification at the end of the course?' },
            { key: 'G', text: 'Can I pay on a class-by-class basis?' },
            { key: 'H', text: 'How do I contact my tutor?' },
            { key: 'I', text: 'What can I do if the level of the course I started is not suitable for me?' },
            { key: 'K', text: 'Can I just watch a normal class to check what it is like before I book?' },
          ],
          unusedBankCount: 3,
          examples: choices(0, 'C'),
          items: choices(1, 'K G A E I B'),
        },
        {
          id: 'I-2',
          label: 'Task 2',
          instructions:
            'Read this article about how nature affects our mental health. Some parts of sentences have been left out from the text. Your task is to reconstruct the text by filling in the gaps (7-15) from the list (A-N) below. Write the letters in the white boxes next to the numbers as in the example (0). Remember that there are three extra letters that you do not need.',
          passage: [
            { style: 'title', text: 'FLOWER POWER' },
            { text: 'If you\'re a stressed-out office worker, one of the simplest things you can do for yourself is to {{0}}.' },
            {
              text: 'A study conducted in Japan found that employees who {{7}} became physiologically calmer, even after just four minutes. Another study, which used an EEG to measure brain activity while participants were looking at roses, {{8}} and creative thinking. Recent research has also shown that when school or university students can see greenery through their classroom windows, they {{9}}. Experiments have demonstrated that looking at plants {{10}} that help us cope with stress better.',
            },
            {
              text: 'Apart from vision, smell is one of the most direct mechanisms by which the natural world can {{11}}. For example, the scent of roses is so calming that it has been shown in experiments to {{12}}: slower, more relaxed and less likely to crash. Just 90 seconds {{13}}. We should not underestimate the medicinal benefits of a woodland walk.',
            },
            {
              text: 'A recently published book, Good Nature, on how nature can improve our health is {{14}}, showing how increasing our contact with plants by even small amounts can make a significant difference. It lists suggestions for measures almost anyone can take, from {{15}} to gardening without gloves and putting plants outside your front door.',
            },
          ],
          bank: [
            { key: 'A', text: 'change our mental state' },
            { key: 'B', text: 'introducing a daily 20-minute nature walk' },
            { key: 'C', text: 'buy some flowers regularly' },
            { key: 'D', text: 'results in physiological changes' },
            { key: 'E', text: 'found that yellow ones were best for increasing productivity' },
            { key: 'F', text: 'waiting for politicians to create more green spaces for us' },
            { key: 'G', text: 'had a vase of pink roses on their desk' },
            { key: 'H', text: 'make people better drivers' },
            { key: 'I', text: 'spent smelling forest air reduces our heart rate' },
            { key: 'K', text: 'filled with practical tips' },
            { key: 'L', text: 'recovered faster when they could see trees' },
            { key: 'M', text: 'perform better and feel less stressed' },
            { key: 'N', text: 'designed to study the impact of nature on their mood' },
          ],
          unusedBankCount: 3,
          examples: choices(0, 'C'),
          items: choices(7, 'G E M D A H I K B'),
        },
        {
          id: 'I-3',
          label: 'Task 3',
          instructions:
            'Read the following reviews about international volunteer programmes and then read the half sentences that follow the text. Your task is to match the half sentences with the names based on the information in the text. Write the letters (A-I) in the white boxes next to the numbers (16-20) as in the example (0). Remember that there are three extra letters that you will not need.',
          passage: [
            { style: 'title', text: '“WE WENT, WE SAW, WE DID IT!”' },
            { text: 'Here are some reviews that young people have written after doing voluntary work all over the world.' },
            { style: 'heading', text: 'Hsina …' },
            {
              text: 'I was very excited to return to Warsaw as a mentor after 10 years. However, this time it was a different experience as now many Polish people spoke English very well. The two-week programme was at a hotel outside of Warsaw, where I met lovely mentees.',
              itemId: '0',
            },
            { style: 'heading', text: 'Skylar …' },
            {
              text: 'I had a once-in-a-lifetime experience volunteering in India! I only signed up for 2 weeks but ended up extending my trip to 4 weeks. I even have plans to come back in the future. I did medical volunteering and was able to distribute medication to locals.',
              itemId: '16',
            },
            { style: 'heading', text: 'Amy …' },
            {
              text: 'I went to South Africa for the animals, but the highlight of my experience were the friends I made during my trip. I worked with so many likeminded people of various backgrounds. The accommodation was definitely basic, but I didn\'t mind this; I found it added to the experience.',
              itemId: '17',
            },
            { style: 'heading', text: 'Kinelam …' },
            {
              text: 'The organizers of the language camp in Germany promised us fun and relaxed work experience. However, this was far from reality. For the seven days at the camp, we worked all day from 9 am to 9 pm. No time or energy to enjoy the facilities of the camp, which was otherwise surprisingly pleasant and well-managed.',
              itemId: '18',
            },
            { style: 'heading', text: 'David …' },
            {
              text: 'Good experience for teaching and being social. The programme takes place in the Turkish countryside, which is great, but do not expect to see lots of places during your stay. Having food and accommodation paid for is a huge up.',
              itemId: '19',
            },
            { style: 'heading', text: 'Alec …' },
            {
              text: 'I spent 3 weeks volunteering at an elephant camp in Thailand. The chance to work with the elephants and interact with the visitors is unforgettable. The staff were helpful and also arranged fun activities outside of work. Unfortunately, I was the only volunteer staying there at the time, so the volunteer house itself was a bit empty.',
              itemId: '20',
            },
          ],
          bank: [
            { key: 'A', text: 'felt stressed by having to work long hours.' },
            { key: 'B', text: 'missed interacting with other volunteers.' },
            { key: 'C', text: 'had already been to the country where s/he volunteered.' },
            { key: 'D', text: 'was disappointed by the living conditions and the service.' },
            { key: 'E', text: 'enjoyed forming connections with fellow workers.' },
            { key: 'F', text: 'stayed longer than s/he had originally planned.' },
            { key: 'G', text: 'had conflicts with his/her host family.' },
            { key: 'H', text: 'does not recommend the programme for people who wish to do sightseeing.' },
            { key: 'I', text: 'has already booked another voluntary programme for next year.' },
          ],
          unusedBankCount: 3,
          examples: choices(0, 'C'),
          items: choices(16, 'F E A H B'),
        },
        {
          id: 'I-4',
          label: 'Task 4',
          instructions:
            'Read this article about how to get things done. Some sentences have been left out from the text. Your task is to reconstruct the text by filling in the gaps (21-26) from the list (A-K) below. Write the letters in the white boxes next to the numbers as in the example (0). Remember that there are three extra letters that you do not need.',
          passage: [
            { style: 'title', text: 'STUDY HACKS AGAINST PROCRASTINATION' },
            { text: 'If you\'ve ever struggled with putting off tasks until the last minute, i.e. procrastinating, here are a few tips to help you drop this habit.' },
            {
              text: 'Try a new spot. {{0}} If yesterday\'s math lesson still isn\'t clicking, go to a coffee shop or sit out in the park while you review your notes. Changing your environment in-between study sessions will boost motivation and stop boredom.',
            },
            {
              text: '{{21}} Whether it\'s a much-needed trip to your favourite café or a chapter of a just-for-fun book, it\'s important to treat yourself for meeting goals and checking things off your to-do list.',
            },
            {
              text: 'Identify time wasters. {{22}} Set a five-minute time limit on the app that distracts you most. Or even put your phone somewhere that\'s out of reach. {{23}}',
            },
            {
              text: 'Break large projects into smaller ones. With each project, decide which steps you need to take to complete the task. {{24}} Remember to create reasonable deadlines for these smaller projects, too, so you aren\'t writing an entire essay the night before the day it\'s due.',
            },
            {
              text: 'Manage your time wisely. Set a timer for 25 minutes and start doing your work. When the timer goes off, take a 5-minute break. {{25}} When your fourth break arrives, take a half-hour break.',
            },
            {
              text: 'Set lots of reminders. If sticky notes work best for you, write down important deadlines on those. {{26}} If you always have your phone with you, set reminders on your phone for each important event.',
            },
          ],
          bank: [
            { key: 'A', text: 'Once you can\'t see it, focusing on what\'s in front of you will be easier.' },
            { key: 'B', text: 'Give yourself a reward after each completed task.' },
            { key: 'C', text: 'Studying becomes tiring when you\'ve been sitting at your desk for hours on end.' },
            { key: 'D', text: 'Then, as much as possible, stick to those routines.' },
            { key: 'E', text: 'Notice what steals your attention while you\'re studying.' },
            { key: 'F', text: 'Put your books, notes, and other essential items in the same place every time.' },
            { key: 'G', text: 'Stress reduces your ability to plan wisely.' },
            { key: 'H', text: 'Repeat this cycle until you hit two full hours.' },
            { key: 'I', text: 'A complicated task becomes much easier to manage in smaller chunks.' },
            { key: 'K', text: 'Place them where you can always see them.' },
          ],
          unusedBankCount: 3,
          examples: choices(0, 'C'),
          items: choices(21, 'B E A I H K'),
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
            'You are going to read an article about extreme tourist destinations. Some words are missing from the text. Use the words in brackets to form the words that fit in the gaps (1-8). Then write the appropriate form of these words on the dotted lines after the text. There might be cases when you do not have to change the word in brackets. Use only one word for each gap. There is an example (0) at the beginning.',
          passage: [
            { style: 'title', text: 'HOW SAFE IS VOLCANO TOURISM?' },
            {
              text: 'Volcano tourism has been increasing since British businessman Thomas Cook took the first group of {{0}} to see Mount Vesuvius in 1841. Today, millions of people travel to places like Iceland, Italy and Hawaii to experience the {{1}} power of volcanoes.',
            },
            {
              text: 'In Iceland, one of the country\'s most {{2}} sites, the Blue Lagoon spa, has recently been evacuated because of volcanic activity in the area, the {{3}} such eruption since December 2023. The spa, which is located just 5km from the small {{4}} town of Grindavík where the eruption took place, is {{5}} by geothermal power thanks to its location in a lava field. Though there are no reported {{6}} associated with this eruption, several people have died at other volcanoes. This has left many people questioning the safety of volcano tourism as a whole. So, is volcano tourism safe?',
            },
            {
              text: 'Luckily for adventure travellers, experts say yes – if you are really {{7}}. "You need to read up about what the rules are, what the local authorities are doing to keep people safe," says Matthew Patrick, a geologist at the Hawaiian Volcano Observatory. Patrick also warns that it\'s best to go with a {{8}} guide to avoid unnecessary risk.',
            },
          ],
          examples: words(0, [['visit', 'visitors']]),
          items: words(1, [
            ['ordinary', 'extraordinary', 'unordinary'],
            ['visit', 'visited'],
            ['five', 'fifth', '5th'],
            ['fish', 'fishing'],
            ['heat', 'heated'],
            ['die', 'deaths'],
            ['care', 'careful'],
            ['rely', 'reliable'],
          ]),
        },
        {
          id: 'II-2',
          label: 'Task 2',
          instructions:
            'You are going to read an article about Jon Bon Jovi\'s charity restaurants. Choose the most appropriate answer from the options (A-D) for each gap (9-16) in the text. Write the letter of the appropriate answer in the white box. There is one example (0) at the beginning.',
          passage: [
            { style: 'title', text: 'THE WAY TO FEEL GOOD IS TO DO GOOD' },
            {
              text: 'Rocker Jon Bon Jovi {{0}} made a career out of filling stadiums with cheering fans, and now he\'s using that popularity – and his money – {{9}} feed the homeless and needy through his JBJ Soul Kitchen restaurants.',
            },
            {
              text: 'Bon Jovi and his wife created the first JBJ Soul Kitchen in 2011 in Red Bank, New Jersey, {{10}} to provide quality meals to anyone in need in the community. Diners are asked to pay a suggested donation that covers their meal and someone {{11}} meal, too. If they can\'t pay, they\'re asked to volunteer. Most of the labor is donated, as is {{12}} of the food.',
            },
            {
              text: '"Hunger doesn\'t look {{13}} what you might imagine," Bon Jovi\'s wife, Dorothea Hurley, tells CBS correspondent Tracy Smith. "It\'s the people at your church. It\'s the kids that go to school with your kids. And I think that was eye-opening for a lot of the people here."',
            },
            {
              text: 'Hurley and Bon Jovi {{14}} since opened another Soul Kitchen restaurant in Toms River, N.J. A third will open on the campus of Rutgers University, {{15}} the couple hope to feed students struggling to {{16}} food.',
            },
          ],
          examples: gapMcqs(0, [['while', 'had', 'has', 'who']], 'C'),
          items: gapMcqs(
            9,
            [
              ['to help', 'how to help', 'for helping', 'that helps'],
              ['why not', 'just because', 'as a way', 'by the aim'],
              ['others\'', 'customer\'s', 'who needs', 'else\'s'],
              ['nearly all', 'several', 'quite much', 'none'],
              ['just', 'as', 'like', 'something'],
              ['have', 'had', 'has', 'ever'],
              ['now', 'where', 'though', 'very much'],
              ['pay', 'order', 'eat out', 'pay for'],
            ],
            'A C D A C A B D',
          ),
        },
        {
          id: 'II-3',
          label: 'Task 3',
          instructions:
            'You are going to read about some problems Artificial Intelligence might cause. Some words are missing from the text. Your task is to write the missing words on the dotted lines (17-25) after the text. Use only one word in each gap. There is an example (0) at the beginning.',
          passage: [
            { style: 'title', text: 'REAL FLAMINGO IMAGE WINS AI AWARD' },
            {
              text: 'AI-generated images {{0}} begun appearing in art and photography contests over the past two years, sometimes fooling judges {{17}} provoking stress and anger among artists. Photographer Miles Astray decided {{18}} was time to express his own view of this. In an AI category at the 1839 Awards\' Color Photography Contest, Astray played a trick, entering a real photo {{19}} a flamingo he took while in the Caribbean.',
            },
            {
              text: 'AI images often show the signs of strange anatomy, like too many teeth or fingers. Similarly, Astray\'s flamingo appeared headless as it bent its neck to scratch itself with {{20}} beak. To Astray\'s surprise, it won both third place and the People\'s Vote Award.',
            },
            {
              text: 'After the winners {{21}} announced, the photographer informed the organization {{22}} runs the contest, and revealed the truth in social media. “I entered this actual photo into the AI category {{23}} prove that human-made art {{24}} not lost its importance, that Mother Nature and her human interpreters can still beat the machine, and that creativity and emotion are more {{25}} just high-tech programming,” Astray wrote.',
            },
            { text: 'Though Astray was later disqualified, the organizers are planning to work with him in the future.' },
          ],
          examples: cloze(0, [['have']]),
          items: cloze(17, [
            ['and', 'while', 'besides', 'or', 'thus', 'hence'],
            ['it'],
            ['of', 'showing', 'depicting', 'featuring'],
            ['its'],
            ['were'],
            ['that', 'which'],
            ['to'],
            ['has'],
            ['than'],
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
        storagePath: 'erettsegi-en-kozep-2025-oktober.mp3',
        durationSec: 1799,
        // Task starts: the ~60 s reading pause of each task found by silence detection, minus the length of its announcement (approximate, ±10 s).
        taskMarkers: [
          { taskId: 'III-1', startSec: 111 },
          { taskId: 'III-2', startSec: 669 },
          { taskId: 'III-3', startSec: 1137 },
        ],
      },
      // útmutató p. 7: feladatpont 0–25 → vizsgapont
      conversion: [0, 1, 3, 4, 5, 7, 8, 9, 11, 12, 13, 15, 16, 17, 18, 20, 21, 22, 24, 25, 26, 28, 29, 30, 32, 33],
      transcripts: [
        {
          taskId: 'III-1',
          title: 'Why people did not smile in old photographs',
          paragraphs: [
            'In modern times, it\'s a natural reaction to say “cheese” when the camera clicks and if we don\'t see someone smiling in a photograph, we might think that they\'re unhappy. But this wasn\'t always the case.',
            'There are some theories about why people didn\'t smile in old photographs. One theory is that in the 19th century, exposure times could take a few minutes or even half an hour, which meant that people had to remain completely still for long periods Because of this, they would choose a comfortable facial expression which was definitely not a smile.',
            'Another theory is that people generally had terrible teeth and they didn\'t want to show them. According to the third theory, before photography, the main mode of preserving a person\'s image was through painting portraits. It was customary for families and individuals in these portraits to wear serious expressions. The reason for this was that wide smiles were considered unsuitable for a portrait because they meant drunkenness or madness. When photography was introduced as a new way of capturing a person\'s likeness, people continued the tradition of not smiling because it was familiar to them.',
            'So, how did we go from serious expressions to saying “Cheese!” for smiles? It goes back to the 1900 Brownie Camera, one of the first cameras that people could afford to buy. As a result, more and more amateur photos were taken, and more and more smiles were captured. People began to prefer the photos that showed them smiling. Photographing smiles slowly made its way into formal photography, and eventually it was culturally acceptable, and even encouraged, to smile in family photos and portraits.',
          ],
        },
        {
          taskId: 'III-2',
          title: 'An accident caused by a cat',
          paragraphs: [
            'While cats always land on their feet, their owners aren\'t always so lucky. The accident happened on the evening of October 23 while Chris Rowley, a 59-year-old professional musician, was home alone with his hairless Egyptian kitten, called Eric Morecambe. Chris was coming down the stairs when his wrinkly kitten, apparently feeling playful, jumped onto his legs. Poor Chris tripped and fell down 14 stairs before arriving at the bottom, where he lay unable to move. Unfortunately, Chris\'s wife Jackie, a children\'s care worker, was working nights and was therefore unable to come to his aid. As a result, Chris had to lie there for 14 long hours without any help. The badly injured man didn\'t realize how serious his injuries were. However, doctors later said he\'d suffered a fractured skull, a broken bone in the neck, two fractures in the spine, nine broken ribs and a bit of blood in his lungs. He couldn\'t get up or do anything. As if that wasn\'t bad enough, his kitten, Eric Morecambe started jumping on his chest, and went on doing so all night.',
            'It wasn\'t until the next morning that Chris\'s wife Jackie arrived and discovered her husband at the bottom of the stairs. She immediately dialled emergency services, who arrived within minutes. Doctors say it will be six to twelve months until Chris is back on his feet again. Despite his terrible condition, Chris is not angry with his kitty saying that Eric Morecambe is loveable and just very young, and his accident is just one of those things, and it could have happened anyway.',
          ],
        },
        {
          taskId: 'III-3',
          title: 'Interview with Harry Kane',
          paragraphs: [
            'R: You are listening to Radio Bridge 102.1. In the studio we have Harry Kane, the football megastar, who plays for Bayern Munich and captains the England National Team. Harry, thanks for being with us.',
            'H: Thanks for inviting me.',
            'R: Your nickname is Hurricane or Tornado, right?',
            'H: No. It\'s just simply ‘H’. It\'s been like that since school – even my parents use it.',
            'R: Do you have a memorable day from your childhood?',
            'H: Oh yes. I was eight years old and was walking in a park with my dad, when he suddenly said, “Well, Harry … Arsenal Football Club don\'t want you any longer.” The reason for this was that I was a bit fat. And since then every time I\'ve played against Arsenal I thought, “Alright, we\'ll see who\'s right and who\'s wrong.”',
            'R: Do you remember your first kiss?',
            'H: Of course I do. My first kiss was with my wife, Katie back when we were at school. I was about 14. It happened just once at a party and although we were always good mates, it wasn\'t until after we left school that we got together properly.',
            'R: Harry, what is the bravest thing you\'ve ever done?',
            'H: Become a dad at a young age. Katie and I had a little girl, Ivy, when I was 24. We always wanted to be young parents. Now Ivy has a sister and two brothers.',
            'R: When was the last time you cried?',
            'H: Probably when England lost to Portugal on penalties in the Euros in 2004. I remember a few tears that day. My wife doesn\'t like the fact that I didn\'t shed tears when our first child was born.',
            'R: How do you imagine your perfect Sunday?',
            'H: Having an early game of golf and then going for a long walk. I love going to the forest for an hour or two. Then I\'d come home and have a barbecue. I don\'t drink so I always have a cup of tea – milk and two sugars – to end the night.',
            'R: And your favourite food?',
            'H: I know it\'s not good for my image but I like the unhealthy stuff like pizza or chips. But it\'s important for me to perform at my best, so I only really do it as a treat after I\'ve had a good game or when I go out with the family for a celebration.',
            'R: Most football players have tattoos. What about you?',
            'H: My dad would never let me. I used to want some when I was younger, but my dad always told me I would regret it when I was older. He said, “Just wait until you are 21 and if you still want one, then you can get it done”. Well, I am 30 now and I don\'t want one.',
            'R: Thank you very much for the interview.',
            'H: My pleasure.',
          ],
        },
      ],
      tasks: [
        {
          id: 'III-1',
          label: 'TASK 1',
          instructions:
            'In this section you will hear some interesting information about why people did not smile in old photographs. Your task is to complete the sentences with one word in each gap, using the exact words you hear in the recording. First, you will have some time to study the task, and then we will play the whole recording in one piece. Then, you will hear the recording again, but this time we will play the text in shorter sections to give you enough time to write down your answers.',
          examples: heard(0, [['When the camera clicks, people say, “________”.', 'cheese']]),
          items: heard(
            1,
            [
              ['If someone isn\'t smiling in a photo, people may think they are ________.', 'unhappy'],
              ['Sometimes people had to remain completely ________ for half an hour.', 'still'],
              ['A smile was definitely not a(n) ________ facial expression.', 'comfortable'],
              ['People didn\'t want to show their horrible ________.', 'teeth'],
              ['In old photos people used to show ________ expressions.', 'serious'],
              ['Besides drunkenness, a wide smile meant ________.', 'madness'],
              ['When photography was introduced, people continued the ________ of not smiling.', 'tradition'],
              ['The Brownie Camera was the first people could ________.', 'afford', 'buy'],
              ['Smiles were encouraged and became culturally ________ even in formal photography.', 'acceptable'],
            ],
            { '4': 'A „tooth” nem fogadható el.' },
          ),
        },
        {
          id: 'III-2',
          label: 'TASK 2',
          instructions:
            'In this section you will hear about an accident which was caused by a cat. Your task will be to decide whether the following statements are true, false or we do not know because the text does not say, and write the appropriate letter in the boxes on the right. Write A if the statement is true, write B if the statement is false, and write C if the text does not say. First, you will have some time to study the task, and then we will play the whole recording in one piece. Then, you will hear the recording again, but this time we will play the text in shorter sections to give you enough time to write down your answers. A = TRUE B = FALSE C = THE TEXT DOES NOT SAY',
          options: TFN,
          examples: [{ id: '0', type: 'mcq', stem: 'Cat owners usually land on their feet.', answer: 'B' }],
          items: tfn(
            10,
            [
              'At the time of the accident Chris Rowley was 59 years old.',
              'This was the first time Eric Morecambe had jumped onto Chris\'s legs.',
              'At the bottom of the stairs Chris stood up once and then fell to the floor.',
              'Chris was lying at the bottom of the stairs for more than half a day.',
              'Chris knew at once that he had suffered very serious injuries.',
              'In the morning Jackie arrived home a bit later than usual.',
              'According to the doctors, it might take a year for Chris to recover.',
              'Because of the accident, Chris never wants to see Eric Morecambe again.',
            ],
            'A C B A B C A B',
          ),
        },
        {
          id: 'III-3',
          label: 'TASK 3',
          instructions:
            'In this section you will listen to an interview with Harry Kane, the famous English professional football player. Your task will be to circle the letter(s) of the correct answer(s) in the boxes on the right. Please note that in this task both answers may be correct. However, there is always at least one correct answer. This means you might have to circle one or two letters. First, you will have some time to study the task, and then we will play the whole recording in one piece. Then, you will hear the recording again, but this time we will play the text in shorter sections to give you enough time to write down your answers.',
          examples: [
            {
              id: '0',
              type: 'mcq',
              stem: 'Harry Kane …',
              options: [
                { key: 'A', text: 'plays for Bayern Munich.' },
                { key: 'B', text: 'captains the England National Team.' },
                { key: 'AB', text: 'Both A and B' },
              ],
              answer: 'AB',
            },
          ],
          items: questions(
            18,
            [
              { stem: 'Harry Kane is …', options: ['proud to be called Hurricane.', 'called H by his parents.'] },
              { stem: 'Harry Kane …', options: ['had to leave Arsenal because he was slightly overweight.', 'has long forgiven Arsenal for throwing him out.'] },
              { stem: 'Harry Kane …', options: ['first kissed Katie at a party.', 'started going out with Katie at the age of 14.'] },
              { stem: 'Harry Kane …', options: ['never wanted to become a father at a young age.', 'has two daughters and two sons.'] },
              { stem: 'Harry Kane cried when …', options: ['Portugal beat England.', 'his first child was born.'] },
              { stem: 'The perfect Sunday for Harry Kane …', options: ['starts with golf in the morning.', 'ends with a cup of tea.'] },
              { stem: 'Harry Kane …', options: ['disagrees that pizza or chips are unhealthy.', 'sometimes eats pizza or chips.'] },
              { stem: 'Harry Kane …', options: ['wanted some tattoos when he was younger.', 'followed his father\'s advice.'] },
            ],
            'B A A B A AB B AB',
          ).map((item) => ({ ...item, options: [...(item.options ?? []), { key: 'AB', text: 'Both A and B' }] })),
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
            'You are in Edinburgh and you have signed up for a full-day hiking tour in the Scottish Highlands. You have received a list of necessary equipment from the organisers and found that there are some items that you haven\'t got. You hope that your Scottish friend, Rob, who is an experienced hiker, can help you:',
          passage: [
            { style: 'heading', text: 'To wear:' },
            { style: 'bullet', text: 'Boots (with ankle support and soles which will grip on rock, grass and mud)' },
            { style: 'bullet', text: 'General trekking trousers (not jeans or cotton material)' },
            { style: 'bullet', text: 'Thermal top' },
            { style: 'bullet', text: 'Fleece top' },
            { style: 'heading', text: 'To carry:' },
            { style: 'bullet', text: 'Rucksack (about 35 litres)' },
            { style: 'bullet', text: 'Waterproof jacket (with hood)' },
            { style: 'bullet', text: 'Waterproof over trousers' },
            { style: 'bullet', text: 'Warm hat' },
            { style: 'bullet', text: 'Gloves or mitts' },
            { style: 'bullet', text: 'Compass' },
            { style: 'bullet', text: 'Map (waterproof or in waterproof case)' },
            { style: 'bullet', text: 'Watch' },
            { style: 'bullet', text: 'Torch (preferably a head torch)' },
            { style: 'bullet', text: 'Whistle' },
            { style: 'bullet', text: 'First Aid Kit (small)' },
            { style: 'bullet', text: 'Mobile phone' },
            { style: 'bullet', text: 'Food and drink' },
          ],
          items: [
            {
              id: '1',
              type: 'production',
              prompt: ['Write an email of 80-100 words to Rob in which you'],
              contentPoints: [
                'tell him why you have signed up for the Highland tour,',
                'ask him if he can lend you 3 items (of your choice) from the list,',
                'offer to go to his place to collect them any time that suits him.',
              ],
              promptAfter: ['Begin your email like this:'],
              minWords: 80,
              maxWords: 100,
              opening: 'Hi Rob,',
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
          instructions: 'You have come across the following post on TeenLine.',
          passage: [
            { text: 'My name is Annabel, and I\'ve found myself in a situation I can\'t seem to deal with on my own.' },
            {
              text: 'I bought some really expensive headphones, which I\'d been saving up for for quite a long time. Since my parents told me they were not something they were willing to buy for me, I had to put aside some money every week for three months to have enough to buy them. Eventually, I did, and I was over the moon, of course, and really felt it was worth it.',
            },
            {
              text: 'Last week, my cousin Patrick asked if he could borrow them for his class trip, where he wanted to listen to music on the train ride. Imagine my outrage and disappointment when instead of phoning, he just texted me that he had lost my brand new headphones. He didn\'t even apologise or tell me how it happened, moreover, he completely ghosted me. He isn\'t answering my texts or returning my calls at all since he told me.',
            },
            { text: 'What shall I do? Don\'t I deserve an explanation, an apology, or a new headset, for that matter? Any advice, anyone?' },
            { text: 'Annabel, 17' },
          ],
          items: [
            {
              id: '2',
              type: 'production',
              prompt: ['Write a comment of 100-120 words to Annabel in which you tell her'],
              contentPoints: [
                'if you\'ve ever been in a similar situation,',
                'what you think of lending your valued possessions to friends or family members,',
                'what you think of Patrick\'s behaviour,',
                'what Annabel should do.',
              ],
              promptAfter: ['Begin your comment like this:'],
              minWords: 100,
              maxWords: 120,
              opening: 'Annabel,',
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
