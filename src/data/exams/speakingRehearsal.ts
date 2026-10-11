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

const REHEARSALS: Record<string, Record<string, SpeakingRehearsal>> = {
  'nyelvvizsga-en-b1-minta-01': generalB1,
  'nyelvvizsga-en-b1-gazdasagi-minta-01': businessB1,
}

export function getSpeakingRehearsal(paperId: string, taskId: string): SpeakingRehearsal | undefined {
  return REHEARSALS[paperId]?.[taskId]
}
