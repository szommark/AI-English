import { useLanguage, type MessageKey } from '../../lib/i18n'
import { isVocabTopicId, type CardStage, type VocabTopicId, type WordCard, type WordlistKind, type WordlistSummary } from '../../lib/vocab'

// Labels shared by the Fast practice and My wordlists tabs (design §7.1–§7.2).

export const TOPIC_LABEL: Record<VocabTopicId, MessageKey> = {
  travel: 'vcTopicTravel',
  food: 'vcTopicFood',
  work: 'vcTopicWork',
  shopping: 'vcTopicShopping',
  health: 'vcTopicHealth',
  home: 'vcTopicHome',
  'free-time': 'vcTopicFreeTime',
  education: 'vcTopicEducation',
  nature: 'vcTopicNature',
  people: 'vcTopicPeople',
}

const KIND_LABEL: Record<WordlistKind, MessageKey> = {
  custom: 'vcKindCustom',
  teacher: 'vcKindTeacher',
  conversations: 'vcKindConversations',
}

const KIND_CLASS: Record<WordlistKind, string> = {
  custom: 'bg-[var(--teal-accent-soft)] text-[var(--teal-accent-strong)]',
  teacher: 'bg-secondary text-secondary-foreground',
  conversations: 'bg-amber-100 text-amber-800',
}

const STAGE_LABEL: Record<CardStage, MessageKey> = {
  new: 'vcStageNew',
  learning: 'vcStageLearning',
  learned: 'vcStageLearned',
}

const STAGE_CLASS: Record<CardStage, string> = {
  new: 'bg-secondary text-secondary-foreground',
  learning: 'bg-amber-100 text-amber-800',
  learned: 'bg-emerald-100 text-emerald-700',
}

/** A list's title in the UI language: the conversations list has no stored title. */
export function useListTitle(): (list: Pick<WordlistSummary, 'kind' | 'title'>) => string {
  const { t } = useLanguage()
  return (list) => (list.kind === 'conversations' ? t('vcListConversations') : list.title)
}

/** A fixed topic's label, or the student's own topic as typed. */
export function useTopicLabel(): (topic: string) => string {
  const { t } = useLanguage()
  return (topic) => (isVocabTopicId(topic) ? t(TOPIC_LABEL[topic]) : topic)
}

export function KindBadge({ kind }: { kind: WordlistKind }) {
  const { t } = useLanguage()
  return <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-xs font-medium ${KIND_CLASS[kind]}`}>{t(KIND_LABEL[kind])}</span>
}

/** Where a word stands in spaced repetition: not in it, new / learning / learned, paused. */
export function CardBadge({ card }: { card: WordCard | null }) {
  const { t } = useLanguage()
  if (!card) {
    return <span className="rounded-md border border-dashed border-border px-1.5 py-0.5 text-xs text-muted-foreground">{t('vcNotInSrs')}</span>
  }
  return (
    <>
      <span className={`rounded-md px-1.5 py-0.5 text-xs ${STAGE_CLASS[card.stage]}`}>{t(STAGE_LABEL[card.stage])}</span>
      {card.suspended && <span className="text-xs text-muted-foreground">{t('vcPausedTag')}</span>}
    </>
  )
}
