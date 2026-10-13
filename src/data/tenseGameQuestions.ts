// Question bank for the Grammar Coach "Past · Present · Future" game. Each question asks about
// one time frame; a good answer in a fitting tense puts the question and the answer into that
// frame's column. `focus` names the tense(s) the question invites (shown as a hint and passed to
// the AI checker, which also accepts any other tense that fits the time); `sample` is a model
// answer shown when the learner misses the question. Imported by the client and by
// api/_lib/tenseGame.ts, so this file has no imports. Checked by `npm run check:tense-game`.

export type TimeFrame = 'past' | 'present' | 'future'
export type TenseGameLevel = 'A1' | 'A2' | 'B1' | 'B2'

export const TIME_FRAMES: TimeFrame[] = ['past', 'present', 'future']
export const TENSE_GAME_LEVELS: TenseGameLevel[] = ['A1', 'A2', 'B1', 'B2']

export interface TenseGameQuestion {
  id: string
  level: TenseGameLevel
  frame: TimeFrame
  text: string
  focus: string
  sample: string
}

type Row = [text: string, focus: string, sample: string]

const BANK: Record<TenseGameLevel, Record<TimeFrame, Row[]>> = {
  A1: {
    past: [
      ['What did you eat for breakfast today?', 'past simple', 'I ate bread and eggs.'],
      ['Where did you go last weekend?', 'past simple', 'I went to my grandmother’s house.'],
      ['What did you do yesterday evening?', 'past simple', 'I watched a film at home.'],
      ['Who did you meet yesterday?', 'past simple', 'I met my friend Anna.'],
      ['What did you buy the last time you went shopping?', 'past simple', 'I bought some fruit and milk.'],
      ['Where were you at eight o’clock this morning?', 'past simple (was / were)', 'I was at home.'],
      ['What was the weather like yesterday?', 'past simple (was / were)', 'It was sunny and warm.'],
      ['What did you watch on TV last night?', 'past simple', 'I watched a football match.'],
    ],
    present: [
      ['What do you usually eat for breakfast?', 'present simple', 'I usually eat toast.'],
      ['Where do you live?', 'present simple', 'I live in Budapest.'],
      ['What do you do in your free time?', 'present simple', 'I play football and read books.'],
      ['What time do you get up on weekdays?', 'present simple', 'I get up at seven o’clock.'],
      ['What is your favourite food?', 'present simple (am / is / are)', 'My favourite food is pizza.'],
      ['How do you get to school or work?', 'present simple', 'I go by bus.'],
      ['What are you wearing today?', 'present continuous', 'I’m wearing jeans and a blue T-shirt.'],
      ['What is your best friend like?', 'present simple (am / is / are)', 'She is funny and kind.'],
    ],
    future: [
      ['What are you going to do this weekend?', 'going to', 'I’m going to play tennis.'],
      ['What are you going to eat for dinner tonight?', 'going to', 'I’m going to eat pasta.'],
      ['Where will you be at six o’clock tomorrow evening?', 'will', 'I will be at home.'],
      ['What are you going to do after this game?', 'going to', 'I’m going to have lunch.'],
      ['Where are you going to go on your next holiday?', 'going to', 'I’m going to go to Lake Balaton.'],
      ['What will the weather be like tomorrow, do you think?', 'will', 'I think it will rain.'],
      ['What are you going to buy the next time you go shopping?', 'going to', 'I’m going to buy bread and cheese.'],
      ['Who will you see tomorrow?', 'will', 'I will see my classmates.'],
    ],
  },
  A2: {
    past: [
      ['What did you do on your last birthday?', 'past simple', 'I had a party with my friends.'],
      ['What were you doing at nine o’clock last night?', 'past continuous', 'I was watching a series.'],
      ['Where did you go on your last holiday, and how did you get there?', 'past simple', 'I went to Croatia by car.'],
      ['What was the last film you saw? Did you like it?', 'past simple', 'I saw a comedy last week and I liked it.'],
      ['What did you want to be when you were a child?', 'past simple', 'I wanted to be a pilot.'],
      ['How did you spend last Sunday?', 'past simple', 'I cleaned the flat and went for a walk.'],
      ['What happened at school or at work yesterday?', 'past simple', 'We had a long meeting.'],
      ['What were you doing when your alarm went off this morning?', 'past continuous', 'I was sleeping.'],
    ],
    present: [
      ['How often do you do sport?', 'present simple', 'I go swimming twice a week.'],
      ['What are you doing these days to improve your English?', 'present continuous', 'I’m reading short stories in English.'],
      ['What does a typical weekday look like for you?', 'present simple', 'I get up early, work all day and cook dinner in the evening.'],
      ['What is your best friend doing at the moment, do you think?', 'present continuous', 'I think she’s working.'],
      ['What kind of music do you like, and why?', 'present simple', 'I like rock because it is energetic.'],
      ['How do you usually celebrate your birthday?', 'present simple', 'I usually have dinner with my family.'],
      ['What do you do when you feel stressed?', 'present simple', 'I listen to music or go for a walk.'],
      ['Which jobs at home do you hate doing?', 'present simple', 'I hate doing the ironing.'],
    ],
    future: [
      ['What are you going to do next weekend?', 'going to', 'I’m going to visit my parents.'],
      ['What are your plans for the summer?', 'going to / present continuous', 'I’m going to travel to Italy.'],
      ['Are you doing anything special tonight?', 'present continuous (arrangement)', 'Yes, I’m meeting some friends for dinner.'],
      ['Where do you think you will live in ten years?', 'will', 'I think I will live in a bigger city.'],
      ['What will you do if it rains this weekend?', 'will (first conditional)', 'If it rains, I will stay at home and read.'],
      ['What time are you going to go to bed tonight?', 'going to', 'I’m going to go to bed at eleven.'],
      ['What are you going to cook for your next family dinner?', 'going to', 'I’m going to make chicken soup.'],
      ['How will you get home today?', 'will', 'I will take the tram.'],
    ],
  },
  B1: {
    past: [
      ['What did you use to do as a child that you don’t do now?', 'used to', 'I used to climb trees.'],
      ['Tell me about a time you got lost. What happened?', 'past simple', 'I got lost in Vienna once, so I asked a police officer for help.'],
      ['What had you already done before you arrived at work or school today?', 'past perfect', 'I had already had breakfast and checked my emails.'],
      ['What were you doing when you heard some important news recently?', 'past continuous + past simple', 'I was driving home when I heard it on the radio.'],
      ['How did you meet your best friend?', 'past simple', 'We met at secondary school because we were in the same class.'],
      ['What was the best present you ever received? Who gave it to you?', 'past simple', 'My parents gave me a bike when I was ten.'],
      ['What did you find most difficult when you started learning English?', 'past simple', 'I found the pronunciation difficult.'],
      ['What was your town like when you were younger?', 'past simple / used to', 'It was quieter and there used to be fewer shops.'],
    ],
    present: [
      ['How long have you lived in your current home?', 'present perfect', 'I have lived here for five years.'],
      ['What are you working on at the moment?', 'present continuous', 'I’m working on a big project for a client.'],
      ['Have you ever been abroad? Where?', 'present perfect', 'Yes, I’ve been to Spain and Greece.'],
      ['What do you like most about where you live?', 'present simple', 'I like the parks and the friendly neighbours.'],
      ['What’s something new you’ve learnt this week?', 'present perfect', 'I’ve learnt how to make bread.'],
      ['What are you reading or watching these days?', 'present continuous', 'I’m watching a crime series.'],
      ['How do you usually prepare for an important exam or meeting?', 'present simple', 'I make notes and practise at home.'],
      ['How many countries have you visited so far?', 'present perfect', 'I have visited six countries so far.'],
    ],
    future: [
      ['What are you doing this weekend?', 'present continuous (arrangement)', 'I’m meeting my cousins on Saturday.'],
      ['What will you do if you have some free time tomorrow?', 'will (first conditional)', 'If I have time, I’ll go to the gym.'],
      ['How do you think your life will be different in five years?', 'will', 'I think I’ll have a better job.'],
      ['What are you going to do when you finish this course?', 'going to', 'I’m going to take a language exam.'],
      ['Do you think people will still use cash in twenty years? Why?', 'will', 'No, I don’t think they will, because everyone will pay by phone.'],
      ['What are you going to change in your life next year?', 'going to', 'I’m going to exercise more.'],
      ['Which country do you think will win the next World Cup?', 'will', 'I think Brazil will win.'],
      ['What are your plans for your next birthday?', 'going to / present continuous', 'I’m having a small party at home.'],
    ],
  },
  B2: {
    past: [
      ['What had you been doing just before you started this game?', 'past perfect continuous', 'I had been working on my laptop.'],
      ['Describe a decision you made that changed your life.', 'past simple', 'I decided to move abroad, which turned out to be a great idea.'],
      ['What would you do on Sunday mornings when you were a child?', 'would (past habit) / used to', 'We would always go to my grandparents’ for lunch.'],
      ['Had you ever studied a foreign language before you started school?', 'past perfect', 'No, I hadn’t. I started learning English at school.'],
      ['What was the most interesting place you had visited before you turned eighteen?', 'past simple / past perfect', 'I had visited Rome, which was amazing.'],
      ['Tell me about a time something went wrong while you were travelling.', 'past continuous + past simple', 'While we were waiting at the airport, our flight was cancelled.'],
      ['How did people keep in touch before mobile phones became common?', 'past simple / used to', 'They wrote letters and used phone boxes.'],
      ['What were you worried about before your last big exam or interview?', 'past simple / past continuous', 'I was worried that I would forget everything.'],
    ],
    present: [
      ['How long have you been learning English?', 'present perfect continuous', 'I’ve been learning English for about eight years.'],
      ['What have you been doing lately to stay healthy?', 'present perfect continuous', 'I’ve been cycling to work.'],
      ['What are the biggest problems your city is facing at the moment?', 'present continuous', 'It’s facing serious traffic problems.'],
      ['What kind of things do you tend to spend too much money on?', 'present simple', 'I tend to spend too much on books.'],
      ['What’s the most useful thing you’ve learnt this year?', 'present perfect', 'I’ve learnt to manage my time better.'],
      ['How is technology changing the way you work or study?', 'present continuous', 'It’s making it easier to work from home.'],
      ['Which skills are employers looking for nowadays?', 'present continuous / present simple', 'They’re looking for people who can work in a team.'],
      ['What is something you’ve always wanted to do but haven’t done yet?', 'present perfect', 'I’ve always wanted to learn to sail.'],
    ],
    future: [
      ['What will you be doing this time tomorrow?', 'future continuous', 'I’ll be sitting in a meeting.'],
      ['What do you hope you will have achieved by the end of this year?', 'future perfect', 'I hope I’ll have passed my B2 exam.'],
      ['How do you think cities will have changed by 2050?', 'future perfect', 'I think most cars will have become electric.'],
      ['What are you going to do differently the next time you travel?', 'going to', 'I’m going to pack less.'],
      ['Will you be working next weekend, or are you free?', 'future continuous', 'I’m free — I won’t be working.'],
      ['How long will you have been studying English by the end of next year?', 'future perfect continuous', 'By then I’ll have been studying it for ten years.'],
      ['What do you think you will be doing in ten years’ time?', 'future continuous', 'I’ll probably be running my own business.'],
      ['What are your plans for the next holiday season?', 'present continuous / going to', 'We’re spending Christmas with my parents.'],
    ],
  },
}

export const TENSE_GAME_QUESTIONS: TenseGameQuestion[] = TENSE_GAME_LEVELS.flatMap((level) =>
  TIME_FRAMES.flatMap((frame) =>
    BANK[level][frame].map(([text, focus, sample], i) => ({
      id: `${level.toLowerCase()}-${frame}-${i + 1}`,
      level,
      frame,
      text,
      focus,
      sample,
    })),
  ),
)

export function getTenseGameQuestion(id: string): TenseGameQuestion | undefined {
  return TENSE_GAME_QUESTIONS.find((q) => q.id === id)
}

// --- Shared with api/_lib/tenseGame.ts ------------------------------------------------------

export type TenseGameMode = 'chat' | 'oral'
export const TENSE_GAME_ANSWER_MAX_LENGTH = 300
/** AI answer checks per learner per UTC day (Groq's free quota is shared by the whole app). */
export const TENSE_GAME_DAILY_CHECKS = 100

/** The AI checker's verdict on one answer. */
export interface TenseGameVerdict {
  ok: boolean
  /** The main tense the learner used, in English (e.g. "past simple"); empty if none. */
  tense: string
  /** One or two short sentences in the UI language. */
  feedback: string
  /** The learner's answer with its mistakes fixed; empty when nothing needed fixing. */
  corrected: string
  /** A short natural answer to the question. */
  model: string
}
