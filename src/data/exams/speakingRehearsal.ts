// Rehearsal material for the speaking exams' practice mode, keyed by paper id and task id
// (src/data/exams/speaking.ts): useful phrases and a sample examiner–candidate exchange
// that models a good B1 answer, like a Conversational English scenario's rehearsal.
//
// Written for this app (not from the exam paper). The chart figures in the business
// paper's Task 3 sample match the chart's alt text in speaking.ts. The Hungarian glosses
// were drafted by hand and have not yet been reviewed by a native speaker.

export interface RehearsalPhrase {
  en: string
  hu: string
}

export interface RehearsalLine {
  speaker: 'examiner' | 'you'
  line: string
}

export interface SpeakingRehearsal {
  phrases: RehearsalPhrase[]
  sample: RehearsalLine[]
}

const CLOSE = "Thank you, that's the end of this task."

const generalB1: Record<string, SpeakingRehearsal> = {
  'S-1': {
    phrases: [
      { en: "I'm in year eleven at a secondary school in ...", hu: 'Tizenegyedikes vagyok egy ...-i középiskolában.' },
      { en: 'I work as a ... at a small company in ...', hu: '...-ként dolgozom egy kis cégnél ...-ban/-ben.' },
      { en: 'There are four of us in my family: my parents, my younger brother and me.', hu: 'Négyen vagyunk a családban: a szüleim, az öcsém és én.' },
      { en: "I live in a small town near ... It's quiet, but there isn't much to do there.", hu: 'Egy ... melletti kisvárosban élek. Csendes, de nincs sok program.' },
      { en: 'In my free time I like ..., because ...', hu: 'Szabadidőmben szeretek ..., mert ...' },
      { en: "After I finish school, I'm planning to ...", hu: 'Ha befejezem az iskolát, azt tervezem, hogy ...' },
      { en: 'Sorry, could you repeat the question, please?', hu: 'Elnézést, megismételné a kérdést?' },
      { en: "That's a good question. Let me think ...", hu: 'Ez jó kérdés. Hadd gondolkodjak ...' },
    ],
    sample: [
      { speaker: 'examiner', line: "Good morning. Let's start with a few questions about you. Do you work or study?" },
      { speaker: 'you', line: "Good morning. I'm a student. I'm in year eleven at a secondary school in Szeged, and my favourite subjects are biology and English." },
      { speaker: 'examiner', line: 'That sounds interesting. Can you tell me a little about your family?' },
      { speaker: 'you', line: 'Sure. There are four of us: my parents, my younger sister and me. My father is a bus driver and my mother works in a bank. We get on well, and at weekends we often cook together.' },
      { speaker: 'examiner', line: 'What do you like doing in your free time?' },
      { speaker: 'you', line: 'I love playing basketball. I train twice a week with my school team. I also like watching series in English, because it helps my listening.' },
      { speaker: 'examiner', line: 'And what are your plans for the future?' },
      { speaker: 'you', line: "I'd like to study medicine at university. It's difficult to get in, so I'm studying a lot this year. Later I'd like to work as a children's doctor." },
      { speaker: 'examiner', line: CLOSE },
    ],
  },
  'S-2': {
    phrases: [
      { en: 'So, what are you planning to do after you leave school?', hu: 'Szóval, mit tervezel, ha befejezed az iskolát?' },
      { en: "I'm really interested in ..., especially ...", hu: 'Nagyon érdekel a ..., főleg a ...' },
      { en: "I'm going to apply to ... University in ..., because ...", hu: 'A ...-i ... Egyetemre fogok jelentkezni, mert ...' },
      { en: 'To get in, I need good marks in ... and ...', hu: 'Ahhoz, hogy felvegyenek, jó jegyek kellenek ...-ból és ...-ból.' },
      { en: "The country I'd most like to travel to is ..., because ...", hu: 'A legszívesebben ...-ba/-be utaznék, mert ...' },
      { en: 'What about you? Have you ever been to ...?', hu: 'És te? Voltál már ...-ban/-ben?' },
      { en: 'That sounds great!', hu: 'Ez nagyon jól hangzik!' },
    ],
    sample: [
      { speaker: 'examiner', line: "In this task I'm Lotte, the Dutch exchange student who is staying with your family. We're having a friendly chat at home. You start." },
      { speaker: 'you', line: 'Hi Lotte! I hope you like it here. Tell me, what are you planning to do after you leave school?' },
      { speaker: 'examiner', line: 'Thanks, I love it here! After school I want to study engineering in Delft. My dad is an engineer too. What are you interested in?' },
      { speaker: 'you', line: "I'm really interested in computers, especially programming. I'm going to apply to the Technical University of Munich, because it's one of the best universities in Europe for computer science." },
      { speaker: 'examiner', line: 'Wow, Munich! What do you need to get in?' },
      { speaker: 'you', line: 'I need very good marks in maths and physics. My English and German have to be good too, because some of the courses are in German.' },
      { speaker: 'examiner', line: "That's a lot of work! Is there a country you'd really like to travel to?" },
      { speaker: 'you', line: "Yes, I'd most like to go to Norway, because I love nature and I'd like to see the fjords and the northern lights. What about you? Have you ever been to Norway?" },
      { speaker: 'examiner', line: `Not yet, but my brother went there last summer and loved it. ${CLOSE}` },
    ],
  },
  'S-3': {
    phrases: [
      { en: 'The picture shows the instructions for a rapid test you can do at home.', hu: 'A kép egy otthon elvégezhető gyorsteszt használati útmutatóját mutatja.' },
      { en: 'First ..., then ..., after that ..., and finally ...', hu: 'Először ..., aztán ..., utána ..., végül ...' },
      { en: 'You have to turn the swab five times in each nostril.', hu: 'A pálcát mindkét orrlyukban ötször kell megforgatni.' },
      { en: 'You have to wait fifteen minutes for the result.', hu: 'Tizenöt percet kell várni az eredményre.' },
      { en: 'If there is only one line at C, the test is negative.', hu: 'Ha csak a C-nél van egy csík, a teszt negatív.' },
      { en: 'During the pandemic, ...', hu: 'A járvány alatt ...' },
      { en: 'In my opinion, ..., because ...', hu: 'Szerintem ..., mert ...' },
      { en: 'On the one hand ..., on the other hand ...', hu: 'Egyrészt ..., másrészt ...' },
    ],
    sample: [
      { speaker: 'examiner', line: 'Now please look at the picture on your task sheet and describe it.' },
      { speaker: 'you', line: 'The picture shows the instructions for a rapid antigen test that you can do at home, like the COVID tests we used during the pandemic. There are five steps. First, you put a few drops of the liquid into the tube. Then you take the sample with a swab: you put it in your nose and turn it five times in each nostril.' },
      { speaker: 'examiner', line: 'What happens after that?' },
      { speaker: 'you', line: "After that, you put the swab into the tube, turn it and squeeze the tube. Then you put the dropper cap on and drop three drops into the small well on the test. Finally, you wait fifteen minutes. If there is only one line at C, the test is negative. If there are two lines, at C and at T, it's positive." },
      { speaker: 'examiner', line: 'Thank you. Have you ever done a test like this at home?' },
      { speaker: 'you', line: "Yes, a few times during the pandemic, when I had a cold and wanted to be sure that it wasn't COVID. It was easy, but putting the swab in my nose wasn't very pleasant." },
      { speaker: 'examiner', line: 'How did the pandemic change everyday life, in your opinion?' },
      { speaker: 'you', line: "In my opinion, it changed a lot. We had online lessons at home for months, and we couldn't meet our friends. On the other hand, many people learned to work from home, and some companies still let them do it." },
      { speaker: 'examiner', line: CLOSE },
    ],
  },
}

const businessB1: Record<string, SpeakingRehearsal> = {
  'S-1': {
    phrases: [
      { en: 'I work for a ... company as a ...', hu: 'Egy ... cégnél dolgozom ...-ként.' },
      { en: "I'm studying economics at ... University.", hu: 'Közgazdaságtant tanulok a ... Egyetemen.' },
      { en: 'The company makes ..., and its main customers are ...', hu: 'A cég ...-t gyárt, és a fő vevői ...' },
      { en: 'On a typical day, I start at ... and first I ...', hu: 'Egy átlagos napon ...-kor kezdek, és először ...' },
      { en: 'Teamwork is very important in my job, because ...', hu: 'A csapatmunka nagyon fontos a munkámban, mert ...' },
      { en: "I mostly shop online, because it's quicker and often cheaper.", hu: 'Többnyire online vásárolok, mert gyorsabb és gyakran olcsóbb.' },
      { en: 'The main advantage is that ..., but the disadvantage is that ...', hu: 'A fő előnye az, hogy ..., de a hátránya az, hogy ...' },
    ],
    sample: [
      { speaker: 'examiner', line: "Good morning. First I'd like to ask you about your work or your studies. What do you do?" },
      { speaker: 'you', line: "Good morning. I work in the sales department of a company that makes furniture. I've been there for two years, and I'm also studying business management at a college in the evenings." },
      { speaker: 'examiner', line: 'Tell me a bit about the company. What does it sell, and who are its customers?' },
      { speaker: 'you', line: 'It makes office furniture, mainly desks and chairs. Our main customers are big companies and schools, but we also sell to private customers through our online shop.' },
      { speaker: 'examiner', line: 'What is a typical working day like for you?' },
      { speaker: 'you', line: 'I usually start at eight. First I answer emails from customers, then I prepare offers and talk to partners on the phone. In the afternoon we often have a short team meeting.' },
      { speaker: 'examiner', line: 'How important is teamwork in your job?' },
      { speaker: 'you', line: "It's very important. For example, when a big order comes in, I have to work closely with the production and the delivery teams, otherwise the customer won't get the furniture on time." },
      { speaker: 'examiner', line: CLOSE },
    ],
  },
  'S-2': {
    phrases: [
      { en: "Hello, this is ... from ... in Hungary. I'm calling about our order.", hu: 'Jó napot, ... vagyok a magyarországi ...-tól/-től. A rendelésünk ügyében telefonálok.' },
      { en: "The ingredients were supposed to arrive on Monday, but they still haven't arrived.", hu: 'Az alapanyagoknak hétfőn kellett volna megérkezniük, de még mindig nem érkeztek meg.' },
      { en: 'Could you tell me the reason for the delay?', hu: 'Meg tudná mondani, mi a késés oka?' },
      { en: 'This delay is causing us serious problems.', hu: 'Ez a késés komoly gondokat okoz nekünk.' },
      { en: 'We might lose some of our partners and orders.', hu: 'Elveszíthetjük néhány partnerünket és megrendelésünket.' },
      { en: 'What kind of compensation can you offer?', hu: 'Milyen kártérítést tudnak felajánlani?' },
      { en: 'Can you guarantee that the goods will arrive by ...?', hu: 'Garantálni tudja, hogy az áru ...-ig megérkezik?' },
      { en: 'So we agree on ... Thank you for your help.', hu: 'Akkor megegyeztünk: ... Köszönöm a segítségét.' },
    ],
    sample: [
      { speaker: 'examiner', line: "In this task I'm the contact person at the Polish supplier, and you are calling me with a complaint. Hello, PolFood, Marek Nowak speaking." },
      { speaker: 'you', line: "Hello, Mr Nowak. This is Anna Szabó from Hungaria Foods in Hungary. I'm calling about our last order. The ingredients were supposed to arrive last Monday, but they still haven't arrived." },
      { speaker: 'examiner', line: "Oh, I'm very sorry to hear that, Ms Szabó. Let me check your order." },
      { speaker: 'you', line: 'Could you tell me the reason for the delay?' },
      { speaker: 'examiner', line: "Unfortunately, there's a strike at our company this week, so our trucks can't leave the warehouse." },
      { speaker: 'you', line: "I see. But this delay is causing us serious problems. We can't start production, so we might lose some important partners and orders." },
      { speaker: 'examiner', line: 'I completely understand. I can assure you that the problem will be solved very soon.' },
      { speaker: 'you', line: 'What kind of compensation can you offer us?' },
      { speaker: 'examiner', line: 'We can give you a ten per cent discount on this order, and the transport will be free next time.' },
      { speaker: 'you', line: 'That sounds fair. When can you deliver the ingredients?' },
      { speaker: 'examiner', line: 'The strike ends on Friday, so we can deliver next Tuesday morning. Is that all right?' },
      { speaker: 'you', line: 'Yes, next Tuesday morning is fine. So we agree on Tuesday morning and a ten per cent discount. Thank you for your help.' },
      { speaker: 'examiner', line: `You're welcome, and sorry again. ${CLOSE}` },
    ],
  },
  'S-3': {
    phrases: [
      { en: 'The chart shows what percentage of Internet users shopped online in nine countries in 2012 and 2016.', hu: 'A diagram azt mutatja, hogy kilenc országban az internetezők hány százaléka vásárolt online 2012-ben és 2016-ban.' },
      { en: 'The highest figure is in Japan, at 83 per cent.', hu: 'A legmagasabb érték Japáné, 83 százalék.' },
      { en: 'The lowest figure is in Italy: only 19 per cent in 2012.', hu: 'A legalacsonyabb érték Olaszországé: 2012-ben csak 19 százalék.' },
      { en: 'In almost every country the figure went up between 2012 and 2016.', hu: 'Szinte minden országban nőtt az arány 2012 és 2016 között.' },
      { en: 'The biggest increase was in China, from 41 to 50 per cent.', hu: 'A legnagyobb növekedés Kínában volt, 41-ről 50 százalékra.' },
      { en: 'In Japan the figure stayed the same.', hu: 'Japánban az arány nem változott.' },
      { en: 'One reason might be that ...', hu: 'Az egyik ok az lehet, hogy ...' },
      { en: 'For companies, the main advantage is that ...', hu: 'A cégek számára a fő előny az, hogy ...' },
    ],
    sample: [
      { speaker: 'examiner', line: 'Now please look at the chart on your task sheet and describe it.' },
      { speaker: 'you', line: 'The chart shows what percentage of Internet users shopped online in nine countries in 2012 and 2016. In almost every country the figure went up. The highest figure is in Japan, with 83 per cent in both years, so there it stayed the same. The UK and the USA are also high: both reached 79 per cent in 2016.' },
      { speaker: 'examiner', line: 'What else can you see?' },
      { speaker: 'you', line: 'The lowest figures are in Italy and Spain. In Italy only 19 per cent of Internet users shopped online in 2012, and 23 per cent in 2016. The biggest increase was in China, from 41 to 50 per cent.' },
      { speaker: 'examiner', line: 'Why do you think online shopping is more popular in some countries than in others?' },
      { speaker: 'you', line: 'One reason might be that in Japan and the UK people are used to paying by card, and deliveries are fast. In Italy and Spain, maybe people prefer small local shops and markets, and they like to see the products before they buy them.' },
      { speaker: 'examiner', line: 'Do you shop online?' },
      { speaker: 'you', line: "Yes, quite often. I usually buy clothes and books online, because it's quicker and often cheaper. But I buy food in the shop, because I want to choose it myself." },
      { speaker: 'examiner', line: 'And what are the advantages for companies?' },
      { speaker: 'you', line: "For companies, the main advantage is that they can sell to customers all over the country, and they don't need an expensive shop in the city centre. The disadvantage is that many customers send the products back." },
      { speaker: 'examiner', line: CLOSE },
    ],
  },
}

// Szóbeli minta 2.: the Task 3 figures match the chart's alt text in speaking.ts (read off the
// chart, so "about").
const businessB1Speaking02: Record<string, SpeakingRehearsal> = {
  'S-1': {
    phrases: [
      { en: "I'm from ... It's a small town, but I like it because ...", hu: '...-ból/-ből jövök. Kis város, de szeretem, mert ...' },
      { en: 'I work as a ... at a ... company.', hu: '...-ként dolgozom egy ... cégnél.' },
      { en: 'On a normal day I start at ... First I ..., then I ...', hu: 'Egy átlagos napon ...-kor kezdek. Először ..., aztán ...' },
      { en: "I'd prefer to work for a small company, because ...", hu: 'Inkább egy kis cégnél dolgoznék, mert ...' },
      { en: 'I prefer working in a team, because ...', hu: 'Jobban szeretek csapatban dolgozni, mert ...' },
      { en: 'I need English for my job, for example when I write emails to ...', hu: 'A munkámhoz kell az angol, például amikor e-maileket írok ...-nak/-nek.' },
      { en: 'Last year I went to ... for work. I stayed there for ... days.', hu: 'Tavaly ...-ba/-be utaztam munka miatt. ... napig voltam ott.' },
      { en: 'In five years I would like to be a ...', hu: 'Öt év múlva ... szeretnék lenni.' },
    ],
    sample: [
      { speaker: 'examiner', line: 'Good morning. Let’s start with a few questions about you. Where are you from?' },
      { speaker: 'you', line: "Good morning. I'm from Kecskemét. It's not a very big town, but I like it because it's quiet and the centre is really nice." },
      { speaker: 'examiner', line: 'Do you work or study?' },
      { speaker: 'you', line: "I work. I'm an assistant at a car parts company. I answer the phone, write emails and organise meetings for my manager." },
      { speaker: 'examiner', line: 'Do you prefer working alone or in a team?' },
      { speaker: 'you', line: "I prefer working in a team, because we can help each other and it's more fun. But sometimes I need to work alone, when I have a lot of emails." },
      { speaker: 'examiner', line: 'Why are you learning English?' },
      { speaker: 'you', line: "Because I need it for my job. Our company has partners in Germany and England, so I often write emails in English. I'd also like to travel more." },
      { speaker: 'examiner', line: CLOSE },
    ],
  },
  'S-2': {
    phrases: [
      { en: "Good morning. I'd like to rent a car for two days, please.", hu: 'Jó napot. Szeretnék bérelni egy autót két napra.' },
      { en: 'I need a small car with air conditioning.', hu: 'Egy kis autóra van szükségem, légkondicionálással.' },
      { en: 'How much does it cost for two days?', hu: 'Mennyibe kerül két napra?' },
      { en: 'Is insurance in the price? What about petrol?', hu: 'A biztosítás benne van az árban? És a benzin?' },
      { en: 'Can I pay by card?', hu: 'Fizethetek kártyával?' },
      { en: "I'd like to bring it back on Thursday at about six o'clock.", hu: 'Csütörtökön hat óra körül szeretném visszahozni.' },
      { en: "Here's my driving licence.", hu: 'Itt a jogosítványom.' },
      { en: "No, thanks, I don't need a sat nav. I'll use my phone.", hu: 'Nem, köszönöm, nem kell navigáció. A telefonomat használom.' },
    ],
    sample: [
      { speaker: 'examiner', line: "In this task I'm the assistant at the car rental desk. Good morning. Can I help you?" },
      { speaker: 'you', line: "Good morning. I'd like to rent a car for two days, please. I need a small car with air conditioning." },
      { speaker: 'examiner', line: 'Of course. We have a Ford Fiesta with air conditioning.' },
      { speaker: 'you', line: 'Great. How much does it cost for two days?' },
      { speaker: 'examiner', line: "It's forty-five pounds a day, so ninety pounds for two days." },
      { speaker: 'you', line: 'Is insurance in the price? And what about petrol?' },
      { speaker: 'examiner', line: 'Insurance is in the price, but petrol isn’t. The car has a full tank, and you bring it back full.' },
      { speaker: 'you', line: 'OK. Can I pay by card?' },
      { speaker: 'examiner', line: 'Yes, credit or debit card only. We also keep two hundred pounds on the card as a deposit, and you get it back when you return the car. Can I see your driving licence, please?' },
      { speaker: 'you', line: "Yes, here's my driving licence, and here's my passport." },
      { speaker: 'examiner', line: 'Thank you. When do you want to bring the car back?' },
      { speaker: 'you', line: "On Thursday, at about six o'clock in the evening. I'll bring it back here, to the airport." },
      { speaker: 'examiner', line: `Perfect. Here are your keys. The car is in the car park, space 14. Have a good trip! ${CLOSE}` },
    ],
  },
  'S-3': {
    phrases: [
      { en: 'The chart shows the unemployment rate in the USA by education level, from 1992 to 2010.', hu: 'A diagram az USA munkanélküliségi rátáját mutatja iskolai végzettség szerint, 1992 és 2010 között.' },
      { en: 'People without a high school diploma have the highest unemployment.', hu: 'A középiskolai végzettséggel nem rendelkezők körében a legmagasabb a munkanélküliség.' },
      { en: 'People with a university degree have the lowest unemployment.', hu: 'Az egyetemi végzettségűek körében a legalacsonyabb a munkanélküliség.' },
      { en: 'From 1992 to 2000 the numbers went down.', hu: '1992 és 2000 között a számok csökkentek.' },
      { en: 'In 2008 and 2009 unemployment went up very fast in every group.', hu: '2008-ban és 2009-ben minden csoportban nagyon gyorsan nőtt a munkanélküliség.' },
      { en: 'I think this was because of the economic crisis.', hu: 'Szerintem ez a gazdasági válság miatt volt.' },
      { en: 'In my opinion, people with a degree find jobs more easily, because ...', hu: 'Véleményem szerint a diplomások könnyebben találnak munkát, mert ...' },
    ],
    sample: [
      { speaker: 'examiner', line: 'Now please look at the chart on your task sheet and talk about it.' },
      { speaker: 'you', line: 'The chart shows the unemployment rate in the USA by education level, from 1992 to 2010. There are four groups. People without a high school diploma have the highest unemployment, and people with a bachelor’s degree have the lowest. In 1992 it was about 12 per cent for the first group, and only about 3 per cent for people with a degree.' },
      { speaker: 'examiner', line: 'How did the numbers change?' },
      { speaker: 'you', line: 'From 1992 to 2000 unemployment went down in every group. Then it went up a little and went down again. But in 2008 and 2009 it went up very fast. For people without a diploma it went up to about 15 per cent. I think this was because of the economic crisis.' },
      { speaker: 'examiner', line: 'Why do you think people with a university degree find jobs more easily?' },
      { speaker: 'you', line: 'Because they know more and they can do more difficult jobs. Companies also like people with a degree, because they think they can learn quickly.' },
      { speaker: 'examiner', line: 'Do you think you need a university degree to get a good job?' },
      { speaker: 'you', line: "Not always. For example, a good electrician or a cook can earn a lot of money without a degree. But for some jobs, like doctor or lawyer, you need one." },
      { speaker: 'examiner', line: CLOSE },
    ],
  },
}

// Szóbeli minta 3.: the Task 3 figures match the chart's alt text in speaking.ts.
const businessB1Speaking03: Record<string, SpeakingRehearsal> = {
  'S-1': {
    phrases: [
      { en: "I live in ... I like it because it's ... and ...", hu: '...-ban/-ben élek. Szeretem, mert ... és ...' },
      { en: "At the weekend I usually ..., and sometimes I ...", hu: 'Hétvégén általában ..., és néha ...' },
      { en: "I'm an assistant at ... My job is to ...", hu: 'Asszisztens vagyok a ...-nál/-nél. Az a feladatom, hogy ...' },
      { en: 'A good boss listens to people and ...', hu: 'Egy jó főnök meghallgatja az embereket, és ...' },
      { en: "I prefer working in the office, because ...", hu: 'Jobban szeretek az irodában dolgozni, mert ...' },
      { en: 'For me, emails are easier than phone calls, because I have time to think.', hu: 'Nekem az e-mail könnyebb, mint a telefon, mert van időm gondolkodni.' },
      { en: "I'd like to work for ..., because ...", hu: 'A ...-nál/-nél szeretnék dolgozni, mert ...' },
    ],
    sample: [
      { speaker: 'examiner', line: "Good morning. Let's start with a few questions about you. Where do you live?" },
      { speaker: 'you', line: "Good morning. I live in Győr. I like it because it's not too big, and there are lots of nice cafés by the river." },
      { speaker: 'examiner', line: 'What do you do, and what is a normal week like for you?' },
      { speaker: 'you', line: "I'm an assistant at an international company. From Monday to Thursday I work in the office, and on Fridays I work from home. I answer emails, book meetings and help my manager." },
      { speaker: 'examiner', line: 'What makes a good boss, in your opinion?' },
      { speaker: 'you', line: 'I think a good boss listens to people and explains the tasks clearly. My manager is like that, so I enjoy my work.' },
      { speaker: 'examiner', line: 'Which is easier for you in English: phone calls or emails?' },
      { speaker: 'you', line: "Emails are easier for me, because I have time to think and check my words. On the phone, people sometimes speak very fast." },
      { speaker: 'examiner', line: CLOSE },
    ],
  },
  'S-2': {
    phrases: [
      { en: "Good morning. My name is ..., and I'm an assistant at ...", hu: 'Jó napot. ... vagyok, a ... asszisztense.' },
      { en: "My manager asked me to call you. We're organising a party, and we need your help.", hu: 'A főnököm kért meg, hogy hívjam fel önöket. Bulit szervezünk, és szükségünk van a segítségükre.' },
      { en: 'We need a venue, food and drinks, and music.', hu: 'Szükségünk van helyszínre, ételre-italra és zenére.' },
      { en: 'We intend to invite about two hundred guests.', hu: 'Körülbelül kétszáz vendéget szeretnénk meghívni.' },
      { en: "The party will be on Friday, the twelfth of December, in the evening.", hu: 'A buli december 12-én, pénteken este lesz.' },
      { en: "Of course, I'll send you the guest list by email today.", hu: 'Természetesen, még ma elküldöm e-mailben a vendéglistát.' },
      { en: "We'd like a jazz band, if possible.", hu: 'Ha lehet, egy dzsesszzenekart szeretnénk.' },
      { en: "Great, I'll wait for your offer. Thank you for your help.", hu: 'Remek, várom az ajánlatukat. Köszönöm a segítséget.' },
    ],
    sample: [
      { speaker: 'examiner', line: "In this task I work at a PR agency, and you are calling me about a party. Good morning, Bright Events, Kate Miller speaking. How can I help you?" },
      { speaker: 'you', line: "Good morning. My name is Eszter Kovács, and I'm an assistant at Danubia Pharma. My manager asked me to call you, because we're organising a party for our partners and colleagues. We need a venue, food and drinks, and music." },
      { speaker: 'examiner', line: 'Lovely, we can help with all of that. How many guests are you going to invite?' },
      { speaker: 'you', line: 'We intend to invite about two hundred guests.' },
      { speaker: 'examiner', line: 'Two hundred, OK. And when will the party be?' },
      { speaker: 'you', line: "It will be on Friday, the twelfth of December, from seven o'clock in the evening." },
      { speaker: 'examiner', line: 'Good. Could you send me the guest list, please? Then we can prepare the invitations.' },
      { speaker: 'you', line: "Of course. I'll send it to you by email this afternoon." },
      { speaker: 'examiner', line: 'Thank you. And what kind of music would you like?' },
      { speaker: 'you', line: "We'd like a jazz band. My manager loves jazz, and it's good music for talking and eating." },
      { speaker: 'examiner', line: "A jazz band is a great idea. We know a very good one. I'll send you our offer by email by Friday." },
      { speaker: 'you', line: "Great, I'll wait for your offer. Thank you very much for your help. Goodbye." },
      { speaker: 'examiner', line: `Goodbye. ${CLOSE}` },
    ],
  },
  'S-3': {
    phrases: [
      { en: 'The chart shows how companies spend their advertising money on different types of media in 2015 and 2025.', hu: 'A diagram azt mutatja, hogyan költik el a cégek a reklámpénzüket a különböző médiatípusokra 2015-ben és 2025-ben.' },
      { en: 'In 2015 TV had the biggest share, 38 per cent.', hu: '2015-ben a tévé részesedése volt a legnagyobb, 38 százalék.' },
      { en: 'In 2025 the Internet has the biggest share: more than half of the money.', hu: '2025-ben az internet részesedése a legnagyobb: a pénz több mint fele.' },
      { en: 'Internet advertising went up from 25 to 52 per cent, so it almost doubled.', hu: 'Az internetes reklám 25-ről 52 százalékra nőtt, tehát majdnem megduplázódott.' },
      { en: 'Newspapers and magazines fell the most, from 17 to only 6 per cent.', hu: 'Az újságok és magazinok estek vissza a legjobban, 17-ről csak 6 százalékra.' },
      { en: 'All the other types of media went down a little.', hu: 'Az összes többi médiatípus kicsit csökkent.' },
      { en: 'I think the reason is that people spend more time on their phones.', hu: 'Szerintem az az oka, hogy az emberek több időt töltenek a telefonjukon.' },
    ],
    sample: [
      { speaker: 'examiner', line: 'Now please look at the chart on your task sheet and talk about it.' },
      { speaker: 'you', line: 'The chart shows how companies spend their advertising money on different types of media in 2015 and 2025. In 2015 TV had the biggest share, 38 per cent, and the Internet was second with 25 per cent. But in 2025 the Internet has the biggest share: 52 per cent, so more than half of the money.' },
      { speaker: 'examiner', line: 'What else changed?' },
      { speaker: 'you', line: 'All the other types of media went down. TV went down from 38 to 27 per cent. Newspapers and magazines fell the most, from 17 to only 6 per cent. Radio and cinema are very small in both years.' },
      { speaker: 'examiner', line: 'Why do you think companies spend more on Internet advertising today?' },
      { speaker: 'you', line: "I think the reason is that people spend a lot of time on their phones and on social media. Companies can also choose who sees their adverts, for example young people or people in one city, so it's cheaper." },
      { speaker: 'examiner', line: 'Do adverts on social media make you buy things?' },
      { speaker: 'you', line: "Sometimes, yes. Last month I saw an advert for running shoes on Instagram, and I bought them. But usually I find the adverts annoying, and I don't click on them." },
      { speaker: 'examiner', line: CLOSE },
    ],
  },
}

const REHEARSALS: Record<string, Record<string, SpeakingRehearsal>> = {
  'nyelvvizsga-en-b1-szobeli-minta-01': generalB1,
  'nyelvvizsga-en-b1-gazdasagi-szobeli-minta-01': businessB1,
  'nyelvvizsga-en-b1-gazdasagi-szobeli-minta-02': businessB1Speaking02,
  'nyelvvizsga-en-b1-gazdasagi-szobeli-minta-03': businessB1Speaking03,
}

export function getSpeakingRehearsal(paperId: string, taskId: string): SpeakingRehearsal | undefined {
  return REHEARSALS[paperId]?.[taskId]
}
