/**
 * Legal texts for /privacy and /impressum, in Hungarian and English. The wording is final and
 * supplied by the operator: edit it here only when the legal text itself changes.
 * German UI falls back to English (see legalDocFor).
 */
import type { Lang } from '../lib/i18n'

export type LegalBlock =
  | { type: 'p'; text: string }
  /** `labelled`: each item reads "Label: value" and the label is shown in bold. */
  | { type: 'ul'; items: string[]; labelled?: boolean }

export interface LegalSection {
  heading: string
  blocks: LegalBlock[]
}

export interface LegalDoc {
  /** Short name for the browser tab. */
  tabTitle: string
  title: string
  intro: LegalBlock[]
  sections: LegalSection[]
  /** Closing line, e.g. the effective date. */
  footnote?: string
}

export type LegalDocId = 'privacy' | 'impressum'
type LegalLang = 'hu' | 'en'

const p = (text: string): LegalBlock => ({ type: 'p', text })
const ul = (items: string[], labelled = false): LegalBlock => ({ type: 'ul', items, labelled })

const impressumHu: LegalDoc = {
  tabTitle: 'Impresszum',
  title: 'Impresszum',
  intro: [
    ul(
      [
        'Cég: Incantation Korlátolt Felelősségű Társaság',
        'Székhely: 9022 Győr, Bisinger József sétány 30. 3. em. 4. ajtó',
        'E-mail: szommark@gmail.com, szombathelyi.mark@tobbmintangol.hu',
        'Cégjegyzékszám: 08-09-037063',
        'Nyilvántartó bíróság: Győri Törvényszék Cégbírósága',
        'Adószám: 32636114-1-08',
        'Közösségi adószám: HU32636114',
        'Adószám státusza: érvényes (hatályos: 2024. 09. 03-tól)',
        'Tárhelyszolgáltató: Websupport Magyarország Kft., H-1119 Budapest, Fehérvári út 97-99., +36 1 700 2323, info@mhosting.hu',
      ],
      true,
    ),
  ],
  sections: [],
}

const impressumEn: LegalDoc = {
  tabTitle: 'Impressum',
  title: 'Impressum',
  intro: [
    ul(
      [
        'Company: Incantation Korlátolt Felelősségű Társaság',
        'Registered address: 9022 Győr, Bisinger József sétány 30. 3. em. 4. ajtó',
        'Email: szommark@gmail.com, szombathelyi.mark@tobbmintangol.hu',
        'Company registration number: 08-09-037063',
        'Registered with: Registry Court of the Győr Regional Court',
        'Tax number: 32636114-1-08',
        'EU VAT number: HU32636114',
        'Tax number status: valid (effective from 2024. 09. 03.)',
        'Hosting provider: Websupport Magyarország Kft., H-1119 Budapest, Fehérvári út 97-99., +36 1 700 2323, info@mhosting.hu',
      ],
      true,
    ),
  ],
  sections: [],
}

const privacyHu: LegalDoc = {
  tabTitle: 'Adatvédelmi tájékoztató',
  title: 'Adatvédelmi (adatkezelési) tájékoztató — avln.hu (AVaLoN)',
  intro: [
    p(
      'Az Incantation Korlátolt Felelősségű Társaság (a továbbiakban: Adatkezelő) az alábbiakban tájékoztatja Önt az avln.hu weboldalon és az AVaLoN adaptív angoltanulási platformon végzett adatkezelési tevékenységéről, az Európai Parlament és a Tanács (EU) 2016/679 rendelete (GDPR), valamint az információs önrendelkezési jogról és az információszabadságról szóló 2011. évi CXII. törvény (Infotv.) alapján.',
    ),
  ],
  sections: [
    {
      heading: '1. Az adatkezelő adatai',
      blocks: [
        ul(
          [
            'Név: Incantation Korlátolt Felelősségű Társaság',
            'Székhely: 9022 Győr, Bisinger József sétány 30. 3. em. 4. ajtó',
            'Adószám / cégjegyzékszám: 32636114-1-08 / 08-09-037063',
            'E-mail: szommark@gmail.com, szombathelyi.mark@tobbmintangol.hu',
            'Telefon: 20/284-7797',
            'Képviselő: Szombathelyi Márk',
          ],
          true,
        ),
      ],
    },
    {
      heading: '2. A kezelt adatok köre',
      blocks: [
        ul(
          [
            'Fiókadatok: e-mail cím, jelszó (kizárólag titkosított, nem visszafejthető formában), felhasználói szerepkör (tanuló vagy tanár), a regisztráció időpontja.',
            'Tanulási adatok: a gyakorlások, feladatok, szókincs- és nyelvtani gyakorlatok, tesztek és vizsgafeladatok eredményei, a hibák és a haladás adatai, a tanulási célok és mérföldkövek, a megszerzett pontok (XP) és jelvények, a becsült nyelvi szint (CEFR), a beállítások (pl. hang, akcentus, nyelv).',
            'Beszélgetések: az AI-tutorral és a szituációs gyakorlatokban Ön által írt vagy kimondott szövegek, valamint az erre adott AI-válaszok.',
            'Kiejtésellenőrzés: ha Ön használja a kiejtésellenőrzést, a hangfelvétel az értékelés idejére a szolgáltatóhoz kerül; az Adatkezelő a hangfelvételt nem tárolja, az értékelés összesített eredményét (pl. pontszám) igen.',
            'Tanár–diák kapcsolat: ha Ön tanári meghívókóddal összekapcsolja a fiókját egy tanárral, a tanár láthatja az Ön haladási és eredményadatait; a tanár által Önnek kiosztott feladatok és tesztek adatai.',
            'Visszajelzések és hibajelentések: az Ön által küldött visszajelzés szövege; a böngészőben fellépő technikai hibák rövid, személyes adatot nem tartalmazó naplója.',
            'Üzemeltetési adatok: a szolgáltatás használatának technikai naplói (pl. kérések száma, AI-használat mértéke), a visszaélések és túlterhelés elleni védelemhez.',
            'Böngészőben tárolt adatok: véletlenszerű böngészőazonosító, a QR-kódos érkezés rövid azonosítója (legfeljebb 30 napig), a megkezdett feladatok ideiglenes állapota és a hangbeállítások (lásd 9. pont).',
          ],
          true,
        ),
        p(
          'Az Adatkezelő nem kér és nem kezel különleges adatokat (pl. egészségi állapot), és kérjük, ilyet a szabad szöveges mezőkben és a beszélgetésekben se adjon meg.',
        ),
      ],
    },
    {
      heading: '3. Az adatkezelés céljai és jogalapja',
      blocks: [
        ul([
          'Fiók létrehozása, bejelentkezés, a platform működtetése és a tanulási funkciók (gyakorlás, haladáskövetés, AI-tutor, kiejtésellenőrzés) nyújtása — GDPR 6. cikk (1) bekezdés b) pont (szerződés teljesítése).',
          'Tanár és tanuló közötti kapcsolat, feladatkiosztás és haladáskövetés — GDPR 6. cikk (1) bekezdés b) pont, és a tanuló által a meghívókód felhasználásával adott hozzájárulás, GDPR 6. cikk (1) bekezdés a) pont; a hozzájárulás a kapcsolat megszüntetésével bármikor visszavonható.',
          'Informatikai biztonság, hibajavítás, visszaélések megelőzése, a szolgáltatás terhelésének és költségeinek követése — GDPR 6. cikk (1) bekezdés f) pont (jogos érdek).',
          'A QR-kódos kampányok hatékonyságának összesített mérése — GDPR 6. cikk (1) bekezdés f) pont (jogos érdek); a mérés személyazonosításra nem alkalmas azonosítót használ.',
          'Számviteli és adózási kötelezettségek teljesítése (fizetős szolgáltatás esetén) — GDPR 6. cikk (1) bekezdés c) pont.',
        ]),
        p(
          'Az Adatkezelő az adatokat marketing, profilalkotás vagy harmadik félnek történő értékesítés céljára nem használja fel és az AI-szolgáltatóknak csak a szolgáltatás nyújtásához szükséges tartalmat továbbítja.',
        ),
      ],
    },
    {
      heading: '4. Az adatkezelés időtartama',
      blocks: [
        ul(
          [
            'Fiók- és tanulási adatok: a fiók törléséig. A fiók törlését az 1. pont szerinti e-mail-címen kérheti; a törléssel a fiókhoz tartozó adatokat is töröljük.',
            'Hibanaplók és üzemeltetési naplók: legfeljebb a cél eléréséhez szükséges ideig, főszabályként néhány hónapig.',
            'QR-kódos érkezés azonosítója: a böngészőben legfeljebb 30 napig.',
            'Számviteli bizonylatok: a jogszabályban előírt ideig (a Számv. tv. szerint 8 évig).',
          ],
          true,
        ),
      ],
    },
    {
      heading: '5. Adatfeldolgozók és címzettek',
      blocks: [
        p(
          'Az adatokhoz kizárólag az Adatkezelő e feladattal megbízott munkatársai, a Önnel összekapcsolt tanár (a 2. pont szerinti körben), valamint az alábbi adatfeldolgozók férhetnek hozzá:',
        ),
        ul([
          'Supabase (adatbázis és hitelesítés) — a fiók-, tanulási és naplóadatok tárolása.',
          'Vercel Inc. (tárhely és szerver oldali funkciók) — az alkalmazás kiszolgálása.',
          'AI-szolgáltatók — a beszélgetések és feladatok feldolgozása: Groq, Google (Gemini), Anthropic, Mistral AI, DeepSeek (az éppen választott modelltől függően).',
          'Microsoft (Azure Speech) — a kiejtésellenőrzés és a szöveg-beszéd átalakítás.',
          'Websupport Magyarország Kft. (H-1119 Budapest, Fehérvári út 97-99., +36 1 700 2323, info@mhosting.hu) — tárhely- és rendszerszolgáltató.',
          'Könyvelési/számlázási szolgáltató és online fizetési rendszer üzemeltetője: nincs megadva.',
        ]),
        p(
          'Adatok továbbítására jogszabályi kötelezettség teljesítése esetén (pl. adóhatóság, egyéb hatóság megkeresésére) kerülhet sor.',
        ),
      ],
    },
    {
      heading: '6. Adattovábbítás az Európai Gazdasági Térségen kívülre',
      blocks: [
        p(
          'A fenti szolgáltatók egy része az EGT-n kívül (különösen az Egyesült Államokban) is kezelhet adatot. Az átadás a GDPR V. fejezete szerinti garanciákkal történik (pl. az Európai Bizottság megfelelőségi határozata, illetve általános szerződési feltételek).',
        ),
      ],
    },
    {
      heading: '7. Az érintettek jogai',
      blocks: [
        p('Ön jogosult:'),
        ul([
          'tájékoztatást kérni a kezelt adatairól,',
          'kérni az adatok helyesbítését, illetve – amennyiben jogszabály másképp nem rendelkezik – törlését,',
          'kérni az adatkezelés korlátozását,',
          'élni az adathordozhatósághoz való jogával,',
          'tiltakozni a jogos érdeken alapuló adatkezelés ellen,',
          'a hozzájárulását bármikor visszavonni (a visszavonás a korábbi adatkezelés jogszerűségét nem érinti).',
        ]),
        p('Kérelmét a fenti elérhetőségeken terjesztheti elő; az Adatkezelő a kérelmet legkésőbb 30 napon belül megválaszolja.'),
      ],
    },
    {
      heading: '8. Kiskorúak',
      blocks: [
        p(
          'A szolgáltatás 16. életévüket betöltött felhasználóknak szól. 16 év alatti személy csak törvényes képviselője hozzájárulásával regisztrálhat.',
        ),
      ],
    },
    {
      heading: '9. Sütik és böngészőben tárolt adatok',
      blocks: [
        p(
          'Az avln.hu nem használ marketing- vagy elemző (analitikai) sütiket, és nem követi Önt harmadik felek oldalain. A böngésző tárolójában (localStorage) kizárólag a működéshez szükséges adatok szerepelnek: a bejelentkezési munkamenet, a véletlenszerű böngészőazonosító, a QR-kódos érkezés rövid azonosítója (legfeljebb 30 nap), a megkezdett feladatok ideiglenes állapota és a hangbeállítások. Ezek törléséhez elegendő a böngésző adatait törölni. Mivel csak a működéshez szükséges tárolást használjuk, külön hozzájárulási sáv megjelenítése nem szükséges.',
        ),
      ],
    },
    {
      heading: '10. Adatbiztonság',
      blocks: [
        p(
          'Az Adatkezelő megfelelő technikai és szervezési intézkedésekkel gondoskodik a kezelt adatok biztonságáról, védi azokat a jogosulatlan hozzáféréssel, megváltoztatással, továbbítással, nyilvánosságra hozatallal, törléssel vagy megsemmisítéssel, valamint véletlen megsemmisüléssel és sérüléssel szemben.',
        ),
      ],
    },
    {
      heading: '11. Jogorvoslat',
      blocks: [
        p(
          'Jogsérelem esetén Ön a Nemzeti Adatvédelmi és Információszabadság Hatósághoz (NAIH, 1055 Budapest, Falk Miksa utca 9–11., www.naih.hu) fordulhat panasszal, illetve jogait bíróság előtt is érvényesítheti.',
        ),
      ],
    },
    {
      heading: '12. A tájékoztató módosítása',
      blocks: [
        p(
          'Az Adatkezelő fenntartja a jogot jelen tájékoztató egyoldalú módosítására; a módosított tájékoztatót a honlapon teszi közzé.',
        ),
      ],
    },
  ],
  footnote: 'Hatályos: 2026. 11. 12.',
}

const privacyEn: LegalDoc = {
  tabTitle: 'Privacy policy',
  title: 'Privacy policy — avln.hu (AVaLoN)',
  intro: [
    p(
      'Incantation Korlátolt Felelősségű Társaság (the "Controller") informs you below about its data processing on the avln.hu website and the AVaLoN adaptive English-learning platform, under Regulation (EU) 2016/679 (GDPR) and Hungarian Act CXII of 2011 on the Right of Informational Self-Determination and on Freedom of Information (Infotv.).',
    ),
  ],
  sections: [
    {
      heading: '1. Controller',
      blocks: [
        ul(
          [
            'Name: Incantation Korlátolt Felelősségű Társaság',
            'Registered address: 9022 Győr, Bisinger József sétány 30. 3. em. 4. ajtó',
            'Tax number / company registration number: 32636114-1-08 / 08-09-037063',
            'Email: szommark@gmail.com, szombathelyi.mark@tobbmintangol.hu',
            'Phone: 20/284-7797',
            'Representative: Szombathelyi Márk',
          ],
          true,
        ),
      ],
    },
    {
      heading: '2. Data we process',
      blocks: [
        ul(
          [
            'Account data: email address, password (stored only in encrypted, non-reversible form), user role (learner or teacher), sign-up date.',
            'Learning data: practice, exercises, vocabulary and grammar activity, test and exam-task results, mistakes and progress, learning goals and milestones, points (XP) and badges, estimated CEFR level, preferences (e.g. voice, accent, language).',
            'Conversations: the text you write or say to the AI tutor and in scenario practice, and the AI replies.',
            'Pronunciation check: if you use it, your voice recording is sent to the service provider for the assessment only; we do not store the recording, but we do store the summary result (e.g. a score).',
            'Teacher–learner link: if you connect your account to a teacher with an invite code, the teacher can see your progress and results; data about tasks and tests the teacher assigns to you.',
            'Feedback and error reports: the text of feedback you send; a short log of technical browser errors that does not contain personal data.',
            'Operational data: technical logs of service use (e.g. request counts, AI usage), for protection against abuse and overload.',
            'Data stored in your browser: a random browser ID, a short QR-arrival ID (up to 30 days), the temporary state of tasks in progress, and voice settings (see section 9).',
          ],
          true,
        ),
        p('We do not ask for or process special-category data (e.g. health data). Please do not enter such data in free-text fields or conversations.'),
      ],
    },
    {
      heading: '3. Purposes and legal bases',
      blocks: [
        ul([
          'Creating your account, signing in, running the platform and providing learning features (practice, progress tracking, AI tutor, pronunciation check) — GDPR Art. 6(1)(b) (performance of a contract).',
          "Teacher–learner link, assigning tasks and tracking progress — Art. 6(1)(b), and the learner's consent given by using the invite code, Art. 6(1)(a); you can withdraw consent at any time by ending the link.",
          'IT security, bug fixing, abuse prevention, monitoring load and costs — Art. 6(1)(f) (legitimate interest).',
          'Aggregate measurement of QR-code campaigns — Art. 6(1)(f) (legitimate interest); the measurement uses an identifier that does not identify you.',
          'Accounting and tax obligations (for paid services) — Art. 6(1)(c).',
        ]),
        p(
          'The Controller does not use data for marketing, profiling or sale to third parties and sends AI providers only the content needed to provide the service.',
        ),
      ],
    },
    {
      heading: '4. Retention',
      blocks: [
        ul(
          [
            'Account and learning data: until you delete your account. You can request deletion at the email address in section 1; account-related data is deleted with it.',
            'Error and operational logs: no longer than needed for their purpose, generally a few months.',
            'QR-arrival ID: in your browser for up to 30 days.',
            'Accounting documents: for the period required by law (8 years under the Hungarian Accounting Act).',
          ],
          true,
        ),
      ],
    },
    {
      heading: '5. Processors and recipients',
      blocks: [
        p(
          "Access is limited to the Controller's authorised staff, the teacher you have linked with (within the scope in section 2) and these processors:",
        ),
        ul([
          'Supabase (database and authentication) — storage of account, learning and log data.',
          'Vercel Inc. (hosting and server-side functions) — serving the application.',
          'AI providers — processing conversations and tasks: Groq, Google (Gemini), Anthropic, Mistral AI, DeepSeek (depending on the model in use).',
          'Microsoft (Azure Speech) — pronunciation assessment and text-to-speech.',
          'Websupport Magyarország Kft. (H-1119 Budapest, Fehérvári út 97-99., +36 1 700 2323, info@mhosting.hu) — hosting and system provider.',
          'Accounting/invoicing provider and online payment system operator: not specified.',
        ]),
        p('Data may be disclosed where required by law (e.g. at the request of the tax authority or another authority).'),
      ],
    },
    {
      heading: '6. Transfers outside the European Economic Area',
      blocks: [
        p(
          'Some of these providers may process data outside the EEA (notably in the United States). Transfers rely on the safeguards in Chapter V GDPR (e.g. an European Commission adequacy decision or standard contractual clauses).',
        ),
      ],
    },
    {
      heading: '7. Your rights',
      blocks: [
        p('You have the right to:'),
        ul([
          'request information about the data we process,',
          'request rectification or, unless the law provides otherwise, erasure,',
          'request restriction of processing,',
          'data portability,',
          'object to processing based on legitimate interest,',
          'withdraw consent at any time (withdrawal does not affect earlier lawful processing).',
        ]),
        p('Send your request using the contact details above; we reply within 30 days at the latest.'),
      ],
    },
    {
      heading: '8. Minors',
      blocks: [
        p('The service is intended for users aged 16 and over. A person under 16 may register only with the consent of their legal representative.'),
      ],
    },
    {
      heading: '9. Cookies and browser storage',
      blocks: [
        p(
          'avln.hu does not use marketing or analytics cookies and does not track you on third-party sites. Browser storage (localStorage) holds only what is needed to operate the service: the sign-in session, a random browser ID, a short QR-arrival ID (up to 30 days), the temporary state of tasks in progress and voice settings. Clearing your browser data removes them. Because we only use storage strictly necessary for the service, no consent banner is required.',
        ),
      ],
    },
    {
      heading: '10. Data security',
      blocks: [
        p(
          'The Controller applies appropriate technical and organisational measures to protect data against unauthorised access, alteration, disclosure, deletion or destruction, and against accidental loss or damage.',
        ),
      ],
    },
    {
      heading: '11. Remedies',
      blocks: [
        p(
          'If you believe your rights have been infringed, you may lodge a complaint with the Hungarian National Authority for Data Protection and Freedom of Information (NAIH, 1055 Budapest, Falk Miksa utca 9–11., www.naih.hu) or go to court.',
        ),
      ],
    },
    {
      heading: '12. Changes to this policy',
      blocks: [p('The Controller may amend this policy; the amended version is published on the website.')],
    },
  ],
  footnote: 'Effective: 2026. 11. 12.',
}

const legalDocs: Record<LegalDocId, Record<LegalLang, LegalDoc>> = {
  privacy: { hu: privacyHu, en: privacyEn },
  impressum: { hu: impressumHu, en: impressumEn },
}

/** The document in the UI language; German has no legal translation, so it shows English. */
export function legalDocFor(id: LegalDocId, lang: Lang): LegalDoc {
  return legalDocs[id][lang === 'hu' ? 'hu' : 'en']
}
