import { useLanguage, type MessageKey } from '../../lib/i18n'
import {
  DA_TOP_FREQUENCY_TOPIC,
  MIXED_LEVEL,
  PRACTICE_EXERCISES,
  isDaTopicId,
  isVocabTopicId,
  type CardStage,
  type DaTopicId,
  type ListLevel,
  type TargetLanguage,
  type VocabTopicId,
  type WordCard,
  type WordlistKind,
  type WordlistSummary,
} from '../../lib/vocab'
import { ROUND_LABEL } from './DrillSession'

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
  mastered: 'vcStageMastered',
}

const STAGE_CLASS: Record<CardStage, string> = {
  new: 'bg-secondary text-secondary-foreground',
  learning: 'bg-amber-100 text-amber-800',
  learned: 'bg-emerald-100 text-emerald-700',
  mastered: 'bg-violet-100 text-violet-800',
}

/** A list's title in the UI language: the conversations list has no stored title. */
export function useListTitle(): (list: Pick<WordlistSummary, 'kind' | 'title'>) => string {
  const { t } = useLanguage()
  return (list) => (list.kind === 'conversations' ? t('vcListConversations') : list.title)
}

/**
 * Danish list topics (DA_TOPICS + DA_TOP_FREQUENCY_TOPIC). Shared ids keep the English
 * labels, except "home", which for Danish is the home only (no family: that has its own).
 */
export const DA_TOPIC_LABEL: Record<DaTopicId | typeof DA_TOP_FREQUENCY_TOPIC, MessageKey> = {
  food: 'vcTopicFood',
  travel: 'vcTopicTravel',
  work: 'vcTopicWork',
  family: 'vcTopicFamily',
  numbers: 'vcTopicNumbers',
  shopping: 'vcTopicShopping',
  health: 'vcTopicHealth',
  home: 'vcTopicHomeOnly',
  'free-time': 'vcTopicFreeTime',
  nature: 'vcTopicNature',
  [DA_TOP_FREQUENCY_TOPIC]: 'vcTopicTopFrequency',
}

/** A fixed topic's label in the list's language's topic set, or the student's own topic as typed. */
export function useTopicLabel(): (topic: string, language?: TargetLanguage) => string {
  const { t } = useLanguage()
  return (topic, language = 'en') => {
    if (language === 'da' && (isDaTopicId(topic) || topic === DA_TOP_FREQUENCY_TOPIC)) return t(DA_TOPIC_LABEL[topic])
    return isVocabTopicId(topic) ? t(TOPIC_LABEL[topic]) : topic
  }
}

/** A short pill naming a list's language; nothing for English, the default. */
export function LanguageBadge({ language }: { language: TargetLanguage }) {
  const { t } = useLanguage()
  if (language === 'en') return null
  return (
    <span className="shrink-0 rounded-md border border-red-200 bg-red-50 px-1.5 py-0.5 text-xs font-medium text-red-800">
      {t('vcLanguageDanish')}
    </span>
  )
}

/** A list's level (or "Mixed"), or one word's level. Nothing when there is none. */
export function LevelBadge({ level, subtle = false }: { level: ListLevel | null; subtle?: boolean }) {
  const { t } = useLanguage()
  if (!level) return null
  return (
    <span
      className={`shrink-0 rounded-md px-1.5 py-0.5 text-xs font-medium ${
        subtle ? 'border border-border text-muted-foreground' : 'bg-secondary text-secondary-foreground'
      }`}
    >
      {level === MIXED_LEVEL ? t('vcLevelMixed') : level}
    </span>
  )
}

export function KindBadge({ kind }: { kind: WordlistKind }) {
  const { t } = useLanguage()
  return <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-xs font-medium ${KIND_CLASS[kind]}`}>{t(KIND_LABEL[kind])}</span>
}

/**
 * Where a word stands in spaced repetition: not in it, new / learning / learned (with the
 * exercise it is at), mastered, paused.
 */
export function CardBadge({ card }: { card: WordCard | null }) {
  const { t } = useLanguage()
  if (!card) {
    return <span className="rounded-md border border-dashed border-border px-1.5 py-0.5 text-xs text-muted-foreground">{t('vcNotInSrs')}</span>
  }
  return (
    <>
      <span className={`rounded-md px-1.5 py-0.5 text-xs ${STAGE_CLASS[card.stage]}`}>
        {t(STAGE_LABEL[card.stage])}
        {card.stage !== 'mastered' && ` · ${t(ROUND_LABEL[PRACTICE_EXERCISES[card.ladderStep - 1] ?? 'recognition'])}`}
      </span>
      {card.suspended && <span className="text-xs text-muted-foreground">{t('vcPausedTag')}</span>}
    </>
  )
}
