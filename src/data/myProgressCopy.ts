// Every Hungarian string on "Az én fejlődésem" (/my-progress) and in the shared mistake-area
// list the teacher's student page reuses — kept in one place for review. English meaning in
// the comment next to each. Mistake area/subtype labels live in mistakeTaxonomy.ts.

export const MY_PROGRESS_COPY = {
  pageTitle: 'Az én fejlődésem', // My progress
  pageSubtitle: 'Hol tartasz most, és mi legyen a következő lépés.', // Where you are now, and what your next step should be.
  loadError: 'Nem sikerült betölteni az adataidat. Próbáld újra egy kicsit később.', // Couldn't load your data. Try again a bit later.

  // Progress header
  cefrHeading: 'Becsült szinted', // Your estimated level
  cefrNotYet: 'Még nincs becslés', // No estimate yet
  cefrNotYetHint: 'Néhány beszélgetés után itt jelenik meg.', // It appears here after a few conversations.
  cefrHistoryLabel: 'Korábbi becslések:', // Earlier estimates:
  sessionsLast30Label: 'gyakorlás az elmúlt 30 napban', // practice sessions in the last 30 days (shown under the big number)
  sessionsTotal: (n: number) => `összesen ${n}`, // N in total

  // Next step card
  nextStepHeading: 'Javasolt következő lépés', // Suggested next step
  nextStepReason: (n: number, m: number) => `Az utolsó ${m} gyakorlásodból ${n} alkalommal előjött.`, // Came up in N of your last M sessions.
  nextStepLessonLabel: 'Nyelvtani lecke:', // Grammar lesson:
  nextStepLessonButton: 'Lecke megnyitása', // Open the lesson
  nextStepTutorText:
    'Beszélgess egyet az Oktató bottal! Minden beszélgetés után pontosabban látjuk, min érdemes dolgoznod.', // Have a chat with the Tutor Bot ("Oktató bot" in the app's Hungarian UI)! After every conversation we see more clearly what's worth working on.
  nextStepTutorButton: 'Beszélgetés indítása', // Start a conversation

  // Mistake areas
  mistakesHeading: 'Hibatípusok', // Mistake types
  mistakesIntro: (m: number) => `Az utolsó ${m} gyakorlásod alapján: hány alkalommal jött elő.`, // Based on your last M sessions: in how many it came up.
  mistakesEmpty: 'Még nincs rögzített hibád. Ez a rész az első beszélgetéseid után töltődik fel.', // No mistakes recorded yet. This fills up after your first conversations.
  frequency: (n: number, m: number) => `${n} / ${m} alkalomból`, // in N of M sessions
  legacyOnly: 'korábbi adatok', // earlier data (from before per-session tracking)
  trendFewer: 'kevesebb, mint előtte', // fewer than before (good)
  trendMore: 'több, mint előtte', // more than before
  trendSame: 'ugyanannyi, mint előtte', // same as before
  allTime: (n: number) => `összesen ${n}`, // N in total (teacher view only)
  showDetails: 'Részletek megjelenítése', // Show details (screen-reader label)
  hideDetails: 'Részletek elrejtése', // Hide details (screen-reader label)
  exampleLabel: 'Legutóbbi példa:', // Latest example:

  // Pronunciation
  pronHeading: 'Kiejtés', // Pronunciation
  pronIntro: 'A gyakorolt hangok legutóbbi eredményei.', // Latest results for the sounds you've practised.
  pronPerception: 'Hallás', // Perception (hearing the sound)
  pronProduction: 'Kiejtés', // Production (saying it)
  pronAttempts: (n: number) => `${n} gyakorlás`, // N practice rounds
  pronOpen: 'Gyakorlás', // Practise (link to the sound's page)
  pronNoScore: 'még nincs', // not yet (no score)
  pronEmpty: 'Még nem gyakoroltál kiejtést.', // You haven't practised pronunciation yet.
  pronEmptyLink: 'Kiejtés megnyitása', // Open Pronunciation

  // Vocabulary
  vocabHeading: 'Szókincs', // Vocabulary
  vocabNew: 'Új', // New
  vocabPracticing: 'Tanulás alatt', // Practising
  vocabMastered: 'Elsajátítva', // Mastered
  vocabLink: 'Szókincsfejlesztő megnyitása', // Open the Vocabulary Builder

  // Gamification panel: level, XP by area, week history, badge wall
  gamHeading: 'Pontok, szintek és jelvények', // Points, levels and badges
  gamLevel: (n: number) => `Szint ${n}`, // Level N (same wording as the header chip)
  gamTotalXp: (n: number) => `${n} XP összesen`, // N XP in total
  gamToNext: (into: number, next: number) => `${into} / ${next} XP a következő szintig`, // X / Y XP to the next level
  gamBySectionHeading: 'XP területenként', // XP by area
  gamBySectionEmpty: 'Még nincs XP. Az első befejezett gyakorlat után itt jelenik meg.', // No XP yet. It appears here after your first finished activity.
  gamWeeksHeading: 'Heti célod az elmúlt hetekben', // Your weekly goal in recent weeks
  gamWeeksEmpty: 'Az első gyakorlásod hetétől itt látod, hogyan alakul a heti célod.', // From the week of your first practice, you'll see your weekly goal here.
  gamWeekLabel: (date: string, active: number, goal: number, state: 'met' | 'missed' | 'open') =>
    `${date} kezdetű hét: ${active} / ${goal} nap, ${state === 'met' ? 'teljesítve' : state === 'open' ? 'folyamatban' : 'nem teljesült'}`, // Week starting DATE: A / G days, met / in progress / not met (screen-reader label)
  gamWeekMetLegend: 'teljesített hét', // week with the goal met (legend)
  gamWeekOpenLegend: 'ez a hét', // this week (legend)
  gamBadgesHeading: 'Jelvények', // Badges
  gamBadgesCount: (earned: number, total: number) => `${earned} / ${total} megszerezve`, // E / T earned
  gamBadgesHint: 'Válassz ki egy jelvényt a részletekhez.', // Pick a badge for details.
  gamBadgeHiddenName: 'Rejtett jelvény', // Hidden badge
  gamBadgeHiddenText: 'Akkor derül ki, mi ez, amikor megszerzed.', // You'll find out what it is when you earn it.
  gamBadgeEarnedOn: (date: string) => `Megszerezve: ${date}`, // Earned: DATE
  gamBadgeHowTo: 'Így szerezheted meg:', // How to earn it:
  gamListen: 'Meghallgatás', // Listen (play-button label)
  gamBonusesHeading: 'Tanári jutalmak', // Teacher bonuses (bonus XP from the learner's teacher, with the reason)
  gamBonusAmount: (n: number) => `+${n} XP`, // +N XP

  // Class challenges (set by the learner's teacher)
  chHeading: 'Kihívások', // Challenges
  chCollective: 'Közös kihívás', // Shared (whole-class) challenge
  chIndividual: 'Egyéni kihívás', // Personal challenge
  chActivity: {
    any: 'gyakorlat', // activities (any)
    'conversational-english': 'élethelyzet (Társalgási angol)', // scenario (Conversational English)
    'tutor-bot': 'beszélgetés az Oktató bottal', // Tutor Bot conversation
    'grammar-coach': 'nyelvtani lecke', // grammar lesson
    'pronunciation-session': 'kiejtésgyakorlat', // pronunciation drill
    'vocabulary.fast_practice': 'gyors gyakorlás a Szótanulóban', // Fast practice round (Vocabulary)
    'vocabulary.game': 'szójáték', // word game
    'vocabulary.own_list': 'saját szólista', // own word list created
  } as Record<string, string>,
  chTargetDays: (n: number, collective: boolean) => (collective ? `${n} gyakorlásos nap együtt` : `${n} nap gyakorlás`), // N practice days together / N practice days
  chTargetActivities: (n: number, what: string) => `${n} × ${what}`, // N × <activity>
  chTargetXp: (n: number) => `${n} XP gyűjtése`, // Earn N XP
  chTargetList: (list: string) => `A(z) „${list}” szólista megtanulása`, // Learn the "<list>" word list
  chTargetListCollective: (n: number, list: string) => `${n} diák tanulja meg a(z) „${list}” szólistát`, // N students learn the "<list>" word list
  chDeletedList: 'törölt szólista', // deleted word list
  chMine: (value: number, target: number) => `${value} / ${target}`, // your progress
  chClass: (total: number, target: number, mine: number) => `Az osztály: ${total} / ${target} · a te részed: ${mine}`, // Class: T / N · your part: M
  chDaysLeft: (n: number) => (n <= 1 ? 'Ma az utolsó nap' : `Még ${n} nap`), // Last day today / N days left
  chStarts: (date: string) => `Indul: ${date}`, // Starts: DATE
  chDone: 'Teljesítve', // Completed
  chMissed: 'Lejárt', // Ended (not completed)
  chCancelled: 'A tanárod lezárta', // Your teacher ended it
  chReward: (n: number) => `Jutalom: +${n} XP`, // Reward: +N XP
  gamLoadError: 'A pontjaidat most nem sikerült betölteni.', // Couldn't load your points right now.

  // Transparency line (only with an active teacher connection)
  teacherCanSee: 'A tanárod is látja az ezen az oldalon lévő adatokat.', // Your teacher can also see the data on this page.

  // Brand-new learner (no sessions, no data)
  emptyHeading: 'Itt fogod látni, hogyan fejlődsz', // This is where you'll see how you're progressing
  emptyText:
    'Beszélgess az Oktató bottal, vagy gyakorolj egy élethelyzetet a Társalgási angol részben. Utána itt látod majd, miben fejlődsz, és min érdemes dolgoznod.', // Chat with the Tutor Bot or practise a real-life situation in Conversational English. Afterwards you'll see here what you're improving at and what's worth working on.
  emptyTutorButton: 'Beszélgetés az Oktató bottal', // Chat with the Tutor Bot
  emptyScenarioButton: 'Társalgási angol', // Conversational English (the scenario section's Hungarian name)
} as const
