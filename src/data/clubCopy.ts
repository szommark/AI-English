import type { Lang } from '../lib/i18n'

/**
 * The on-site English club (/club and the banner on the signed-out home page). Practical
 * details are the site owner's own words (venue, price, theme): keep them verbatim.
 *
 * `edition` keys the sign-up counter (club_signups.club_key, see
 * supabase/migrations/20261110120000_club_signups.sql): a new topic gets a new key, so the
 * count starts again from BASE_PARTICIPANTS.
 */
export const CLUB = {
  edition: 'ettermi-kalandok',
  /** Shown before anyone signs up; each sign-up adds one. */
  baseParticipants: 2,
  /** 8:30, in minutes after midnight: the timeline's first block starts here. */
  startMinutes: 8 * 60 + 30,
}

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
  minutes: number
  title: string
  text: string
  links: ClubLinkId[]
}

export interface ClubCopy {
  kicker: string
  title: string
  firstBadge: string
  intro: string
  themeMonthLabel: string
  themeMonth: string
  nextTopicLabel: string
  nextTopic: string
  whenLabel: string
  when: string
  whereLabel: string
  where: string
  priceLabel: string
  price: string
  participantsLabel: string
  /** {n} = current number of participants. */
  participants: string
  scheduleTitle: string
  scheduleIntro: string
  minutes: string
  linkLabels: Record<ClubLinkId, string>
  blocks: ClubBlock[]
  signUp: string
  signedUp: string
  signUpNote: string
  /** Shown instead of the button while CONTACT_EMAIL is still empty. */
  signUpUnavailable: string
  mailSubject: string
  /** Pre-filled email body. */
  mailBody: string
  /** Home page banner. */
  banner: { kicker: string; cta: string }
}

const hu: ClubCopy = {
  kicker: 'Angol klub',
  title: 'Avalon angol klub',
  firstBadge: 'Az első klub',
  intro:
    'Személyes angol klub kötetlen hangulatban, egy kávé vagy reggeli mellett. Beszélgetünk, gyakorlunk, ismerkedünk, a klub után pedig az Avalon platformon folytathatod, amit elkezdtünk.',
  themeMonthLabel: 'Tematikus hónap',
  themeMonth: 'nyaralás/utazás',
  nextTopicLabel: 'A legközelebbi téma',
  nextTopic: 'éttermi kalandok',
  whenLabel: 'Időpont',
  when: 'Minden reggel 8.30-tól 10-ig',
  whereLabel: 'Helyszín',
  where: 'Pedró pékség, Vágóhíd utca',
  priceLabel: 'Ár',
  price: '2000 Ft + fogyasztás',
  participantsLabel: 'Résztvevők',
  participants: '{n} fő',
  scheduleTitle: 'Egy klubalkalom menete',
  scheduleIntro: 'Minden blokk mellett ott van, melyik Avalon-funkcióval gyakorolhatsz tovább otthon.',
  minutes: 'perc',
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
      minutes: 5,
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
      links: ['vocabulary', 'grammar'],
    },
    {
      minutes: 10,
      title: 'Szituációs gyakorlás párban vagy a csoport előtt',
      text: 'Valós helyzetek eljátszása, például rendelés, panasz vagy ajánlás kérése.',
      links: ['scenarios', 'tutorBot'],
    },
    {
      minutes: 10,
      title: 'Dalszöveges gap fill',
      text: 'Egy témába illő dal hiányzó szavainak kiegészítése hallás után.',
      links: ['lyrics'],
    },
    {
      minutes: 15,
      title: 'Panel a témához illően',
      text: 'Néhány résztvevő a többiek előtt beszélget a témáról, a többiek kérdezhetnek.',
      links: ['speaking'],
    },
    {
      minutes: 20,
      title: 'Szabad networking',
      text: 'Kötetlen beszélgetés angolul, ismerkedés a többi résztvevővel.',
      links: [],
    },
    {
      minutes: 5,
      title: 'Zárás',
      text: 'QR-kód az aznapi szólistához és szituációhoz, hogy a platformon folytathasd.',
      links: ['vocabulary', 'scenarios'],
    },
  ],
  signUp: 'Jelentkezem',
  signedUp: 'Jelentkeztél, köszönjük!',
  signUpNote: 'A gomb megnyitja a leveleződet egy előre kitöltött e-maillel; küldd el, és visszaírunk.',
  signUpUnavailable: 'A jelentkezés hamarosan indul.',
  mailSubject: 'Jelentkezés: Avalon angol klub – éttermi kalandok',
  mailBody: 'Szia!\n\nSzeretnék jelentkezni az Avalon angol klubra (éttermi kalandok).\n\nNevem:\nAngoltudásom szintje:\n\nKöszönöm!',
  banner: { kicker: 'Angol klub', cta: 'Részletek / Jelentkezem' },
}

const en: ClubCopy = {
  kicker: 'English club',
  title: 'Avalon English Club',
  firstBadge: 'Our first club',
  intro:
    'An in-person English club in a relaxed setting, over a coffee or breakfast. We talk, practise and get to know each other, and after the club you can carry on with what we started on the Avalon platform.',
  themeMonthLabel: 'Theme of the month',
  themeMonth: 'holidays/travel',
  nextTopicLabel: 'Next topic',
  nextTopic: 'restaurant adventures',
  whenLabel: 'When',
  when: 'Every morning, 8:30 to 10:00',
  whereLabel: 'Where',
  where: 'Pedró pékség, Vágóhíd utca',
  priceLabel: 'Price',
  price: 'HUF 2,000 + what you order',
  participantsLabel: 'Participants',
  participants: '{n} people',
  scheduleTitle: 'How a club session runs',
  scheduleIntro: 'Next to each block you can see which Avalon feature lets you keep practising at home.',
  minutes: 'min',
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
      minutes: 5,
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
      links: ['vocabulary', 'grammar'],
    },
    {
      minutes: 10,
      title: 'Role-play in pairs or in front of the group',
      text: 'Acting out real situations, such as ordering, complaining or asking for a recommendation.',
      links: ['scenarios', 'tutorBot'],
    },
    {
      minutes: 10,
      title: 'Song lyrics gap fill',
      text: 'Filling in the missing words of a song that fits the topic, by ear.',
      links: ['lyrics'],
    },
    {
      minutes: 15,
      title: 'Panel on the topic',
      text: 'A few participants discuss the topic in front of the others, who can ask questions.',
      links: ['speaking'],
    },
    {
      minutes: 20,
      title: 'Free networking',
      text: 'Relaxed conversation in English and getting to know the other participants.',
      links: [],
    },
    {
      minutes: 5,
      title: 'Wrap-up',
      text: 'A QR code for the day’s word list and scenario, so you can carry on on the platform.',
      links: ['vocabulary', 'scenarios'],
    },
  ],
  signUp: 'Sign me up',
  signedUp: 'You’re signed up, thank you!',
  signUpNote: 'The button opens your email app with a pre-filled message; send it and we’ll get back to you.',
  signUpUnavailable: 'Sign-up opens soon.',
  mailSubject: 'Sign-up: Avalon English Club – restaurant adventures',
  mailBody: 'Hi,\n\nI’d like to sign up for the Avalon English Club (restaurant adventures).\n\nMy name:\nMy English level:\n\nThank you!',
  banner: { kicker: 'English club', cta: 'Details / Sign me up' },
}

const de: ClubCopy = {
  kicker: 'Englischclub',
  title: 'Avalon Englischclub',
  firstBadge: 'Unser erster Club',
  intro:
    'Ein Englischclub vor Ort in entspannter Atmosphäre, bei einem Kaffee oder Frühstück. Wir unterhalten uns, üben und lernen uns kennen, und nach dem Club kannst du auf der Avalon-Plattform weitermachen, wo wir aufgehört haben.',
  themeMonthLabel: 'Themenmonat',
  themeMonth: 'Urlaub/Reisen',
  nextTopicLabel: 'Nächstes Thema',
  nextTopic: 'Abenteuer im Restaurant',
  whenLabel: 'Wann',
  when: 'Jeden Morgen von 8:30 bis 10:00 Uhr',
  whereLabel: 'Wo',
  where: 'Pedró pékség, Vágóhíd utca',
  priceLabel: 'Preis',
  price: '2000 HUF + Verzehr',
  participantsLabel: 'Teilnehmende',
  participants: '{n} Personen',
  scheduleTitle: 'So läuft ein Clubtreffen ab',
  scheduleIntro: 'Neben jedem Block steht, mit welcher Avalon-Funktion du zu Hause weiterüben kannst.',
  minutes: 'Min.',
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
      minutes: 5,
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
      links: ['vocabulary', 'grammar'],
    },
    {
      minutes: 10,
      title: 'Situationen üben in Paaren oder vor der Gruppe',
      text: 'Echte Situationen durchspielen, zum Beispiel bestellen, sich beschweren oder um eine Empfehlung bitten.',
      links: ['scenarios', 'tutorBot'],
    },
    {
      minutes: 10,
      title: 'Lückentext mit Songtext',
      text: 'Die fehlenden Wörter eines passenden Songs nach Gehör ergänzen.',
      links: ['lyrics'],
    },
    {
      minutes: 15,
      title: 'Podiumsgespräch zum Thema',
      text: 'Einige Teilnehmende sprechen vor den anderen über das Thema, die anderen können Fragen stellen.',
      links: ['speaking'],
    },
    {
      minutes: 20,
      title: 'Freies Networking',
      text: 'Ungezwungene Gespräche auf Englisch und Kennenlernen der anderen Teilnehmenden.',
      links: [],
    },
    {
      minutes: 5,
      title: 'Abschluss',
      text: 'Ein QR-Code zur Wortliste und zum Szenario des Tages, damit du auf der Plattform weitermachen kannst.',
      links: ['vocabulary', 'scenarios'],
    },
  ],
  signUp: 'Ich melde mich an',
  signedUp: 'Du bist angemeldet, danke!',
  signUpNote: 'Der Button öffnet dein E-Mail-Programm mit einer vorausgefüllten Nachricht; schick sie ab, und wir melden uns.',
  signUpUnavailable: 'Die Anmeldung startet bald.',
  mailSubject: 'Anmeldung: Avalon Englischclub – Abenteuer im Restaurant',
  mailBody: 'Hallo,\n\nich möchte mich für den Avalon Englischclub (Abenteuer im Restaurant) anmelden.\n\nMein Name:\nMein Englischniveau:\n\nDanke!',
  banner: { kicker: 'Englischclub', cta: 'Details / Anmelden' },
}

export const clubCopy: Record<Lang, ClubCopy> = { hu, en, de }
