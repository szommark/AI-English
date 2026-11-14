import type { Lang } from '../lib/i18n'

/**
 * The on-site English club (/club and the banner on the signed-out home page). Practical
 * details are the site owner's own words (time, venue, size, the poster's lines): keep them verbatim.
 *
 * Sign-up is account-based, for one Wednesday or a whole semester (September–January,
 * February–June); a Wednesday is full at 16. The rules live in
 * supabase/migrations/20261115120000_club_registrations.sql.
 */

/** Platform features a club block continues on; routes open them (signed-out visitors are asked to sign in). */
export type ClubLinkId = 'pronunciation' | 'vocabulary' | 'grammar' | 'scenarios' | 'tutorBot' | 'speaking' | 'lyrics'

export const CLUB_LINK_ROUTES: Record<ClubLinkId, string | null> = {
  pronunciation: '/pronunciation',
  vocabulary: '/vocabulary',
  grammar: '/grammar-coach',
  scenarios: '/conversational-english',
  tutorBot: '/tutor-bot',
  speaking: '/exams',
  // Teacher Toolkit activity, run by the teacher at the club: nothing for a learner to open.
  lyrics: null,
}

export interface ClubBlock {
  /** The block's length, for planning only: the page doesn't show it. */
  minutes: number
  title: string
  text: string
  links: ClubLinkId[]
}

/** What club_register() answers, plus a network error. */
export type ClubResult = 'ok' | 'full' | 'already' | 'invalid' | 'auth' | 'error'

export interface ClubCopy {
  firstBadge: string
  /** Under the wordmark, as on the poster. */
  subtitle: string
  slogan: string
  /** The poster's ribbon. */
  joinUs: string
  themesLabel: string
  themes: string
  whenLabel: string
  when: string
  whereLabel: string
  where: string
  sizeLabel: string
  size: string
  full: string
  /** A Wednesday without a club (holiday or break). */
  closed: string
  /** The hero button: scrolls to the sign-up section. */
  signUp: string
  signUpTitle: string
  signUpIntro: string
  needAccount: string
  createAccount: string
  /** Mail link for people who don't want an account. */
  noAccount: string
  semestersTitle: string
  /** {n} = 1 (September–January) or 2 (February–June). */
  semesterName: string
  /** {n} = Wednesdays left in the semester. */
  sessionsLeft: string
  joinSemester: string
  sessionsTitle: string
  joinSession: string
  registered: string
  registeredSemester: string
  cancel: string
  semesterFull: string
  loading: string
  results: Record<ClubResult, string>
  scheduleTitle: string
  scheduleIntro: string
  linkLabels: Record<ClubLinkId, string>
  blocks: ClubBlock[]
  mailSubject: string
  /** Pre-filled email body (sign-up without an account). */
  mailBody: string
  /** Home page banner. */
  banner: { cta: string }
}

const hu: ClubCopy = {
  firstBadge: 'Az első klub',
  subtitle: 'Angol társalgási klub',
  slogan: 'English is a tool. The goal is to connect.',
  joinUs: 'Join us!',
  themesLabel: 'Tematikus alkalmak',
  themes: 'Minden alkalom egy téma köré épül',
  whenLabel: 'Időpont',
  when: 'Minden szerdán 8.30-kor',
  whereLabel: 'Helyszín',
  where: 'Pedró pékség, Vágóhíd utca',
  sizeLabel: 'Létszám',
  size: 'kb. 12 fő',
  full: 'Megtelt',
  closed: 'Szünet',
  signUp: 'Jelentkezem',
  signUpTitle: 'Jelentkezés',
  signUpIntro: 'Jelentkezhetsz egy-egy alkalomra vagy egy egész félévre. Az első félév szeptembertől januárig, a második februártól júniusig tart.',
  needAccount: 'A jelentkezéshez ingyenes Avalon-fiók kell.',
  createAccount: 'Ingyenes regisztráció',
  noAccount: 'Fiók nélkül jelentkeznél? Írj nekünk e-mailt.',
  semestersTitle: 'Félévre',
  semesterName: '{n}. félév',
  sessionsLeft: 'még {n} alkalom',
  joinSemester: 'Jelentkezem a félévre',
  sessionsTitle: 'Alkalomra',
  joinSession: 'Jelentkezem',
  registered: 'Jelentkeztél',
  registeredSemester: 'Félévre jelentkeztél',
  cancel: 'Lemondás',
  semesterFull: 'Valamelyik alkalom már megtelt',
  loading: 'Betöltés…',
  results: {
    ok: 'Köszönjük, jelentkeztél!',
    full: 'Sajnos ez már megtelt.',
    already: 'Erre már jelentkeztél.',
    invalid: 'Erre az időpontra nem lehet jelentkezni.',
    auth: 'A jelentkezéshez jelentkezz be.',
    error: 'Valami hiba történt, próbáld újra.',
  },
  scheduleTitle: 'Egy klubalkalom menete',
  scheduleIntro: 'Minden blokk mellett ott van, melyik Avalon-funkcióval gyakorolhatsz tovább otthon.',
  linkLabels: {
    pronunciation: 'Kiejtés és shadowing',
    vocabulary: 'Szólisták és szókártyák',
    grammar: 'Grammar Coach',
    scenarios: 'Beszélgetős szituációk',
    tutorBot: 'Tutor Bot',
    speaking: 'Szóbeli vizsga gyakorlás',
    lyrics: 'Dalszöveges gap fill',
  },
  blocks: [
    {
      minutes: 10,
      title: 'Az Avalon platform és a klub bemutatása',
      text: 'Röviden arról, hogyan épül fel a klub, és hogyan segít a platform a két alkalom között.',
      links: [],
    },
    {
      minutes: 15,
      title: 'Bemelegítés, kiejtés és páros bemutatkozások',
      text: 'Ráhangolódás a témára, néhány kulcsszó kiejtése, majd párban bemutatkozunk egymásnak.',
      links: ['pronunciation'],
    },
    {
      minutes: 10,
      title: 'Témafeldolgozás párban vagy kiscsoportban',
      text: 'A téma szókincse és a hozzá illő nyelvtan közös feldolgozása.',
      links: ['vocabulary'],
    },
    {
      minutes: 10,
      title: 'Szituációs gyakorlás párban vagy a csoport előtt',
      text: 'Valós helyzetek eljátszása, például rendelés, panasz vagy ajánlás kérése.',
      links: ['scenarios', 'tutorBot'],
    },
    {
      minutes: 15,
      title: 'Panel a témához illően',
      text: 'Néhány résztvevő a többiek előtt beszélget a témáról, a többiek kérdezhetnek.',
      links: ['speaking'],
    },
    {
      minutes: 10,
      title: 'Dalszöveges gap fill',
      text: 'Egy témába illő dal hiányzó szavainak kiegészítése hallás után.',
      links: ['lyrics'],
    },
    {
      minutes: 20,
      title: 'Szabad networking',
      text: 'Kötetlen beszélgetés angolul, ismerkedés a többi résztvevővel.',
      links: [],
    },
    {
      minutes: 10,
      title: 'Zárás',
      text: 'QR-kód az aznapi szólistához és szituációhoz, hogy a platformon folytathasd.',
      links: ['vocabulary', 'scenarios'],
    },
  ],
  mailSubject: 'Jelentkezés: Avalon angol klub',
  mailBody: 'Szia!\n\nSzeretnék jelentkezni az Avalon angol klubra.\n\nNevem:\nAngoltudásom szintje:\n\nKöszönöm!',
  banner: { cta: 'Részletek / Jelentkezem' },
}

const en: ClubCopy = {
  firstBadge: 'Our first club',
  subtitle: 'English conversation club',
  slogan: 'English is a tool. The goal is to connect.',
  joinUs: 'Join us!',
  themesLabel: 'Themed sessions',
  themes: 'Every session is built around a topic',
  whenLabel: 'When',
  when: 'Every Wednesday 8.30',
  whereLabel: 'Where',
  where: 'Pedró pékség, Vágóhíd utca',
  sizeLabel: 'Group size',
  size: 'about 12 people',
  full: 'Full',
  closed: 'No club',
  signUp: 'Sign me up',
  signUpTitle: 'Sign-up',
  signUpIntro: 'You can sign up for a single session or for a whole semester. The first semester runs from September to January, the second from February to June.',
  needAccount: 'To sign up you need a free Avalon account.',
  createAccount: 'Create a free account',
  noAccount: 'Rather sign up without an account? Email us.',
  semestersTitle: 'For a semester',
  semesterName: 'Semester {n}',
  sessionsLeft: '{n} sessions left',
  joinSemester: 'Sign me up for the semester',
  sessionsTitle: 'For a session',
  joinSession: 'Sign me up',
  registered: 'You’re signed up',
  registeredSemester: 'Signed up for the semester',
  cancel: 'Cancel',
  semesterFull: 'One of the sessions is already full',
  loading: 'Loading…',
  results: {
    ok: 'Thank you, you’re signed up!',
    full: 'Sorry, this is already full.',
    already: 'You’re already signed up for this.',
    invalid: 'You can’t sign up for this date.',
    auth: 'Please sign in to sign up.',
    error: 'Something went wrong, please try again.',
  },
  scheduleTitle: 'How a club session runs',
  scheduleIntro: 'Next to each block you can see which Avalon feature lets you keep practising at home.',
  linkLabels: {
    pronunciation: 'Pronunciation and shadowing',
    vocabulary: 'Word lists and flashcards',
    grammar: 'Grammar Coach',
    scenarios: 'Conversation scenarios',
    tutorBot: 'Tutor Bot',
    speaking: 'Speaking exam practice',
    lyrics: 'Song lyrics gap fill',
  },
  blocks: [
    {
      minutes: 10,
      title: 'Introducing the Avalon platform and the club',
      text: 'A short look at how the club works and how the platform helps between sessions.',
      links: [],
    },
    {
      minutes: 15,
      title: 'Warm-up, pronunciation and introductions in pairs',
      text: 'Tuning in to the topic, pronouncing a few key words, then introducing ourselves to each other in pairs.',
      links: ['pronunciation'],
    },
    {
      minutes: 10,
      title: 'Working on the topic in pairs or small groups',
      text: 'The topic’s vocabulary and the grammar that goes with it, worked through together.',
      links: ['vocabulary'],
    },
    {
      minutes: 10,
      title: 'Role-play in pairs or in front of the group',
      text: 'Acting out real situations, such as ordering, complaining or asking for a recommendation.',
      links: ['scenarios', 'tutorBot'],
    },
    {
      minutes: 15,
      title: 'Panel on the topic',
      text: 'A few participants discuss the topic in front of the others, who can ask questions.',
      links: ['speaking'],
    },
    {
      minutes: 10,
      title: 'Song lyrics gap fill',
      text: 'Filling in the missing words of a song that fits the topic, by ear.',
      links: ['lyrics'],
    },
    {
      minutes: 20,
      title: 'Free networking',
      text: 'Relaxed conversation in English and getting to know the other participants.',
      links: [],
    },
    {
      minutes: 10,
      title: 'Wrap-up',
      text: 'A QR code for the day’s word list and scenario, so you can carry on on the platform.',
      links: ['vocabulary', 'scenarios'],
    },
  ],
  mailSubject: 'Sign-up: Avalon English Club',
  mailBody: 'Hi,\n\nI’d like to sign up for the Avalon English Club.\n\nMy name:\nMy English level:\n\nThank you!',
  banner: { cta: 'Details / Sign me up' },
}

const de: ClubCopy = {
  firstBadge: 'Unser erster Club',
  subtitle: 'Englischer Konversationsclub',
  slogan: 'English is a tool. The goal is to connect.',
  joinUs: 'Join us!',
  themesLabel: 'Thematische Treffen',
  themes: 'Jedes Treffen dreht sich um ein Thema',
  whenLabel: 'Wann',
  when: 'Jeden Mittwoch um 8.30 Uhr',
  whereLabel: 'Wo',
  where: 'Pedró pékség, Vágóhíd utca',
  sizeLabel: 'Gruppengröße',
  size: 'ca. 12 Personen',
  full: 'Ausgebucht',
  closed: 'Kein Treffen',
  signUp: 'Ich melde mich an',
  signUpTitle: 'Anmeldung',
  signUpIntro: 'Du kannst dich für ein einzelnes Treffen oder für ein ganzes Semester anmelden. Das erste Semester geht von September bis Januar, das zweite von Februar bis Juni.',
  needAccount: 'Für die Anmeldung brauchst du ein kostenloses Avalon-Konto.',
  createAccount: 'Kostenlos registrieren',
  noAccount: 'Lieber ohne Konto anmelden? Schreib uns eine E-Mail.',
  semestersTitle: 'Für ein Semester',
  semesterName: '{n}. Semester',
  sessionsLeft: 'noch {n} Treffen',
  joinSemester: 'Für das Semester anmelden',
  sessionsTitle: 'Für ein Treffen',
  joinSession: 'Anmelden',
  registered: 'Du bist angemeldet',
  registeredSemester: 'Für das Semester angemeldet',
  cancel: 'Absagen',
  semesterFull: 'Eines der Treffen ist schon ausgebucht',
  loading: 'Wird geladen…',
  results: {
    ok: 'Danke, du bist angemeldet!',
    full: 'Leider schon ausgebucht.',
    already: 'Dafür bist du schon angemeldet.',
    invalid: 'Für diesen Termin ist keine Anmeldung möglich.',
    auth: 'Bitte melde dich an, um dich einzutragen.',
    error: 'Etwas ist schiefgelaufen, bitte versuch es noch einmal.',
  },
  scheduleTitle: 'So läuft ein Clubtreffen ab',
  scheduleIntro: 'Neben jedem Block steht, mit welcher Avalon-Funktion du zu Hause weiterüben kannst.',
  linkLabels: {
    pronunciation: 'Aussprache und Shadowing',
    vocabulary: 'Wortlisten und Karteikarten',
    grammar: 'Grammar Coach',
    scenarios: 'Gesprächsszenarien',
    tutorBot: 'Tutor Bot',
    speaking: 'Mündliche Prüfung üben',
    lyrics: 'Lückentext mit Songtext',
  },
  blocks: [
    {
      minutes: 10,
      title: 'Vorstellung der Avalon-Plattform und des Clubs',
      text: 'Kurz dazu, wie der Club abläuft und wie die Plattform zwischen den Treffen hilft.',
      links: [],
    },
    {
      minutes: 15,
      title: 'Aufwärmen, Aussprache und Vorstellung in Paaren',
      text: 'Einstimmung auf das Thema, Aussprache einiger Schlüsselwörter, dann stellen wir uns einander in Paaren vor.',
      links: ['pronunciation'],
    },
    {
      minutes: 10,
      title: 'Themenarbeit in Paaren oder Kleingruppen',
      text: 'Der Wortschatz des Themas und die passende Grammatik, gemeinsam erarbeitet.',
      links: ['vocabulary'],
    },
    {
      minutes: 10,
      title: 'Situationen üben in Paaren oder vor der Gruppe',
      text: 'Echte Situationen durchspielen, zum Beispiel bestellen, sich beschweren oder um eine Empfehlung bitten.',
      links: ['scenarios', 'tutorBot'],
    },
    {
      minutes: 15,
      title: 'Podiumsgespräch zum Thema',
      text: 'Einige Teilnehmende sprechen vor den anderen über das Thema, die anderen können Fragen stellen.',
      links: ['speaking'],
    },
    {
      minutes: 10,
      title: 'Lückentext mit Songtext',
      text: 'Die fehlenden Wörter eines passenden Songs nach Gehör ergänzen.',
      links: ['lyrics'],
    },
    {
      minutes: 20,
      title: 'Freies Networking',
      text: 'Ungezwungene Gespräche auf Englisch und Kennenlernen der anderen Teilnehmenden.',
      links: [],
    },
    {
      minutes: 10,
      title: 'Abschluss',
      text: 'Ein QR-Code zur Wortliste und zum Szenario des Tages, damit du auf der Plattform weitermachen kannst.',
      links: ['vocabulary', 'scenarios'],
    },
  ],
  mailSubject: 'Anmeldung: Avalon Englischclub',
  mailBody: 'Hallo,\n\nich möchte mich für den Avalon Englischclub anmelden.\n\nMein Name:\nMein Englischniveau:\n\nDanke!',
  banner: { cta: 'Details / Anmelden' },
}

export const clubCopy: Record<Lang, ClubCopy> = { hu, en, de }
