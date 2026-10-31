import type { Lang } from '../lib/i18n'

/** Where the teacher/school and company panels' button sends its email. */
export const CONTACT_EMAIL = ''

/** A side panel: bold lead line, optional bullet list, paragraphs, then the email button. */
export interface LandingPanelCopy {
  title: string
  lead: string
  list?: string[]
  paragraphs: string[]
  cta: string
}

export interface LearnersCopy {
  title: string
  hero: string
  forYouIntro: string
  forYou: string[]
  youGetIntro: string
  youGet: string[]
  cta: string
  /** Ends the learner section (the site owner's "closing thought"). */
  closing: string
}

/**
 * The signed-out home page (src/components/WelcomePanels.tsx): companies | learners + platform |
 * teachers. Final wording from the site owner: use it verbatim. Learners and teachers are
 * addressed informally (HU tegezés, DE du), companies formally (HU magázás, DE Sie). The repeated
 * "szabadság" in the Hungarian closing line is an intentional pun.
 */
export interface LandingCopy {
  business: LandingPanelCopy
  learners: LearnersCopy
  /** Under the learner panel's button: "Already have an account?" + sign-in link. */
  haveAccount: string
  platform: { title: string; text: string }[]
  teachers: LandingPanelCopy
}

const hu: LandingCopy = {
  business: {
    title: 'Cégeknek',
    lead: 'Ez a platform a cégednek való.',
    paragraphs: [
      'Egy cég hatékony működéséhez elengedhetetlen a megfelelő kommunikáció. Az egyre inkább nemzetközivé váló gazdasági környezetben ez a kommunikáció egyre inkább idegen nyelven kell, hogy folyjon. Költséghatékony és innovatív módon segítünk, hogy Ön és kollégái megbirkózzanak a nemzetközivé váló gazdaság kihívásaival. Azokra a kommunikációs helyzetekre készítjük fel kollégáit, amelyekben valóban helyt kell állniuk: AI beszélgetőpartnerrel gyakorolhatnak, kiejtésüket azonnali visszajelzéssel fejleszthetik, szókincsüket pedig tudatosan építhetik.',
    ],
    cta: 'Kérjen ajánlatot',
  },
  learners: {
    title: 'Nyelvtanulóknak',
    hero: 'Tanulj angolul úgy, ahogy neked a legjobb.',
    forYouIntro: 'Neked készült, ha:',
    forYou: [
      'valóban saját elképzeléseid szerint, újszerűen, a képességeid és a céljaid szerint szeretnél tanulni;',
      'fontos számodra a tanárok nyújtotta támogatás, például az empátia és a rugalmasság;',
      'pontosan olyan angolt szeretnél, ahogyan azt nemzetközileg használják;',
      'és mindeközben szeretnéd az AI-jal támogatott nyelvtanulás előnyeit.',
    ],
    youGetIntro: 'Ezt kapod:',
    youGet: [
      'AI beszélgetőpartnert, akivel bármikor, a saját tempódban gyakorolhatsz;',
      'kiejtésgyakorlást azonnali visszajelzéssel;',
      'szókincsépítőt, amely a céljaidhoz igazodik.',
    ],
    cta: 'Próbáld ki ingyen',
    closing: 'Ne az angolod állja útját a karrierednek, és ne az angolod korlátozza a szabadságodat a szabadságodon.',
  },
  haveAccount: 'Már van fiókod?',
  platform: [
    {
      title: 'A platform',
      text: 'A platform célja, hogy összegyűjtsön és hatékonyan felhasználhatóvá tegyen minden olyan eszközt és módszert, amely elengedhetetlen a 21. században a nyelvtanuláshoz és a kommunikációnk fejlesztéséhez.',
    },
    {
      title: 'Adaptív tanulás',
      text: 'Az adaptív tanulás lehetőséget biztosít arra, hogy egyéni tempóban, a céljainknak leginkább megfelelő tananyagok feldolgozásával haladjunk. Mindezt olyan keretrendszerben tesszük, amelyet mesterséges intelligencia támogat, és amely az emberek egymástól és egymással való tanulását is lehetővé teszi.',
    },
  ],
  teachers: {
    title: 'Nyelviskoláknak, tanároknak',
    lead: 'Ez a platform neked való, ha:',
    list: [
      'szeretnél haladni a korral, és a legújabb módszerekkel tanítani és támogatni a diákjaidat;',
      'szeretnéd, hogy a mesterséges intelligencia ne leváltson, hanem megváltson;',
      'hatékony, automatizált, aszinkron, mesterséges intelligenciával támogatott rendszerekkel szeretnél dolgozni;',
      'keresed a fejlődési lehetőségeket, és szeretnéd tudni, mennyire vagy felkészült a modern oktatás 21. századi kihívásaira;',
      'nyelviskola-vezetőként vagy -tulajdonosként át szeretnéd vezetni az iskoládat a 21. századba.',
    ],
    paragraphs: [
      'Az AI beszélgetőpartner, a kiejtésgyakorlás azonnali visszajelzéssel és a szókincsépítő átvállalja a diákok gyakorlásának egy részét, így az óráidon több idő jut arra, amit csak ember tud nyújtani.',
    ],
    // The copy's "Töltsd ki a felkészültségi tesztet" waits for the readiness quiz; a demo request until then.
    cta: 'Kérj bemutatót',
  },
}

const en: LandingCopy = {
  business: {
    title: 'For companies',
    lead: 'This platform is made for your company.',
    paragraphs: [
      'Effective communication is essential for a company to run well. In an increasingly international business environment, that communication increasingly has to take place in a foreign language. In a cost-effective and innovative way, we help you and your colleagues cope with the challenges of the globalising economy. We prepare your staff for the communication situations in which they truly have to perform: they can practise with an AI conversation partner, improve their pronunciation with instant feedback, and build their vocabulary systematically.',
    ],
    cta: 'Request a quote',
  },
  learners: {
    title: 'For language learners',
    hero: 'Learn English the way that works best for you.',
    forYouIntro: 'Built for you if:',
    forYou: [
      'you truly want to learn in your own way, in a fresh way, according to your abilities and your goals;',
      'the support of teachers matters to you, for example empathy and flexibility;',
      'you want exactly the kind of English that is used internationally;',
      'and you want to enjoy the benefits of AI-supported language learning along the way.',
    ],
    youGetIntro: 'What you get:',
    youGet: [
      'an AI conversation partner you can practise with anytime, at your own pace;',
      'pronunciation practice with instant feedback;',
      'a vocabulary builder that adapts to your goals.',
    ],
    cta: 'Try it for free',
    closing: 'Don’t let your English stand in the way of your career, or limit your freedom, even on holiday.',
  },
  haveAccount: 'Already have an account?',
  platform: [
    {
      title: 'The platform',
      text: 'The platform’s goal is to bring together, and make effectively usable, every tool and method that is essential for language learning and for developing our communication in the 21st century.',
    },
    {
      title: 'Adaptive learning',
      text: 'Adaptive learning makes it possible to progress at your own pace, working through the materials that best fit your goals. All of this happens within a framework supported by artificial intelligence, which also enables people to learn from and with one another.',
    },
  ],
  teachers: {
    title: 'For language schools and teachers',
    lead: 'This platform is for you if:',
    list: [
      'you want to keep up with the times and teach and support your students with the latest methods;',
      'you want AI not to replace you, but to redeem you;',
      'you want to work with efficient, automated, asynchronous, AI-supported systems;',
      'you are looking for opportunities to grow and want to know how prepared you are for the challenges of 21st-century education;',
      'as a language school director or owner, you want to lead your school into the 21st century.',
    ],
    paragraphs: [
      'The AI conversation partner, pronunciation practice with instant feedback and the vocabulary builder take over part of your students’ practice, so your lessons have more time for what only a human can give.',
    ],
    // "Take the readiness quiz" once the quiz exists.
    cta: 'Request a demo',
  },
}

const de: LandingCopy = {
  business: {
    title: 'Für Unternehmen',
    lead: 'Diese Plattform ist für Ihr Unternehmen gemacht.',
    paragraphs: [
      'Für den effizienten Betrieb eines Unternehmens ist gute Kommunikation unverzichtbar. In einem zunehmend internationalen Wirtschaftsumfeld muss diese Kommunikation immer häufiger in einer Fremdsprache stattfinden. Kosteneffizient und innovativ unterstützen wir Sie und Ihre Mitarbeitenden dabei, die Herausforderungen der globalisierten Wirtschaft zu meistern. Wir bereiten Ihre Mitarbeitenden auf genau die Kommunikationssituationen vor, in denen sie sich wirklich bewähren müssen: Sie üben mit einem KI-Gesprächspartner, verbessern ihre Aussprache mit sofortigem Feedback und bauen gezielt ihren Wortschatz aus.',
    ],
    cta: 'Angebot anfordern',
  },
  learners: {
    title: 'Für Sprachlernende',
    hero: 'Lerne Englisch so, wie es für dich am besten ist.',
    forYouIntro: 'Gemacht für dich, wenn:',
    forYou: [
      'du wirklich nach deinen eigenen Vorstellungen, auf neue Art und entsprechend deinen Fähigkeiten und Zielen lernen möchtest;',
      'dir die Unterstützung durch Lehrkräfte wichtig ist, zum Beispiel Einfühlungsvermögen und Flexibilität;',
      'du genau das Englisch lernen möchtest, das international gesprochen wird;',
      'und du dabei die Vorteile KI-gestützten Sprachenlernens nutzen willst.',
    ],
    youGetIntro: 'Das bekommst du:',
    youGet: [
      'einen KI-Gesprächspartner, mit dem du jederzeit in deinem eigenen Tempo üben kannst;',
      'Aussprachetraining mit sofortigem Feedback;',
      'einen Wortschatztrainer, der sich an deinen Zielen orientiert.',
    ],
    cta: 'Jetzt kostenlos testen',
    closing: 'Dein Englisch soll deiner Karriere nicht im Weg stehen und deine Freiheit nicht einschränken, nicht einmal in deiner Freizeit.',
  },
  haveAccount: 'Schon ein Konto?',
  platform: [
    {
      title: 'Die Plattform',
      text: 'Das Ziel der Plattform ist es, alle Werkzeuge und Methoden zu bündeln und wirksam nutzbar zu machen, die im 21. Jahrhundert für das Sprachenlernen und die Weiterentwicklung unserer Kommunikation unverzichtbar sind.',
    },
    {
      title: 'Adaptives Lernen',
      text: 'Adaptives Lernen ermöglicht es, im eigenen Tempo voranzukommen und mit den Lernmaterialien zu arbeiten, die am besten zu unseren Zielen passen. All das geschieht in einem von künstlicher Intelligenz unterstützten Rahmen, der auch das Lernen voneinander und miteinander ermöglicht.',
    },
  ],
  teachers: {
    title: 'Für Sprachschulen und Lehrkräfte',
    lead: 'Diese Plattform ist für dich, wenn:',
    list: [
      'du mit der Zeit gehen und deine Lernenden mit den neuesten Methoden unterrichten und unterstützen möchtest;',
      'du dir wünschst, dass KI dich nicht ersetzt, sondern erlöst;',
      'du mit effizienten, automatisierten, asynchronen, KI-gestützten Systemen arbeiten möchtest;',
      'du nach Entwicklungsmöglichkeiten suchst und wissen willst, wie gut du auf die Herausforderungen moderner Bildung im 21. Jahrhundert vorbereitet bist;',
      'du als Leiter:in oder Inhaber:in einer Sprachschule deine Schule ins 21. Jahrhundert führen möchtest.',
    ],
    paragraphs: [
      'Der KI-Gesprächspartner, das Aussprachetraining mit sofortigem Feedback und der Wortschatztrainer übernehmen einen Teil des Übens deiner Lernenden, sodass in deinem Unterricht mehr Zeit für das bleibt, was nur ein Mensch geben kann.',
    ],
    // "Zum Bereitschaftstest" once the quiz exists.
    cta: 'Demo anfordern',
  },
}

export const landingCopy: Record<Lang, LandingCopy> = { hu, en, de }
