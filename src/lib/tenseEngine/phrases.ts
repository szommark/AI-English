// Curated verbs and phrases for the explorer's "Random verb" button.

export const RANDOM_PHRASES: string[] = [
  // single verbs, regular and irregular
  'walk', 'write', 'buy', 'swim', 'travel', 'study', 'dance', 'sleep', 'run', 'stop',
  'begin', 'drive', 'wait', 'listen', 'work', 'eat', 'speak', 'fly', 'win', 'try',
  // short phrases with objects
  'play football', 'write an email', 'wait for the bus', 'learn English', 'cook dinner',
  'read a book', 'watch TV', 'drink coffee', 'visit my grandparents', 'take a photo',
  'buy a new car', 'clean the kitchen', 'make a cake', 'drive to work', 'go to school',
  'do homework', 'have lunch', 'open the window', 'call a friend', 'plan a holiday',
  'paint the fence', 'study for the exam', 'ride a bike', 'meet the team', 'tell a story',
  'sing a song', 'build a house', 'catch the train', 'find a job', 'forget the keys',
  'send a message', 'feed the cat',
  // phrasal verbs
  'get up', 'look after the baby', 'turn off the lights',
  // phrases with "my" (adapted to the subject)
  'wash my hands', 'brush my teeth', 'tidy my room',
  // stative verbs (trigger the "not normally continuous" note)
  'know the answer', 'like chocolate', 'want a new phone', 'need help', 'understand the problem',
  'believe the story', 'love music', 'own a dog',
]

export function randomPhrase(exclude?: string): string {
  const pool = RANDOM_PHRASES.filter((p) => p !== exclude)
  return pool[Math.floor(Math.random() * pool.length)]
}
