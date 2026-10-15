import type { Lang } from '../lib/i18n'

/** "AVaLoN" in a paragraph is rendered as the brand wordmark (src/pages/MissionPage.tsx). */
export const WORDMARK_TOKEN = 'AVaLoN'

export interface MissionCopy {
  greeting?: string
  paragraphs: string[]
  /** The closing line, shown as the button back to the practice home. */
  closing: string
}

const hu: MissionCopy = {
  greeting: 'Szeretettel köszöntünk!',
  paragraphs: [
    'Hisszük, hogy a tanulás egész életünket végigkísérő élmény. De ha a tanulás csak önmagáról szól, egy buborékba zárkózunk. Egy gép előtt bármit megtanulhatunk, de vajon használni is tudjuk majd a valós életben?',
    'Ezért kínáljuk mindkét világot: pontos, mesterséges intelligenciával támogatott tanulást az AVaLoN platformon, amelyet nyelvtanárunk állított össze, és élvezetes gyakorlást valódi emberekkel itt, a klubban.',
    'Mert azokra a helyzetekre, amelyekre sosem készülhetünk fel előre, csak úgy lehet felkészülni, ha rendszeresen gyakoroljuk őket. Nem azért tanulunk angolul, hogy majd jöjjenek a lehetőségek, hanem hogy legyen miről mesélnünk, és legyen kikkel találkoznunk.',
  ],
  closing: 'Kezdjük!',
}

const en: MissionCopy = {
  paragraphs: [
    'We believe learning stays with us all our lives. But if learning is only about learning, we end up in a bubble. At a computer, we can study almost anything, but will we be able to use it in real life?',
    'That is why we offer the best of both worlds: precise, AI-supported learning on the AVaLoN platform, put together by our own language teacher, and enjoyable practice with real people here in the club.',
    'The situations we can never fully prepare for are the ones we get ready for by practising them regularly. We don’t learn English just to wait for opportunities. We learn it so that we have stories to tell and people to meet.',
  ],
  closing: 'Let’s begin!',
}

/** No German text yet: German readers get the English version. */
export const missionCopy: Record<Lang, MissionCopy> = { hu, en, de: en }
