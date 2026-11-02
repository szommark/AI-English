import { BookOpen, ClipboardCheck, GraduationCap, MessagesSquare, type LucideIcon } from 'lucide-react'
import type { MessageKey, useLanguage } from '../../lib/i18n'
import type { GoalSkill, GoalStatus, GoalType, LearnerGoal } from '../../lib/goals'
import type { ScenarioMode, TaskKind } from '../../lib/goalPlans'
import { GoalRequestError } from '../../lib/goalsApi'

export const GOAL_TYPE_LABEL: Record<GoalType, MessageKey> = {
  exam: 'glTypeExam',
  work: 'glTypeWork',
  life: 'glTypeLife',
  skill: 'glTypeSkill',
  confidence: 'glTypeConfidence',
  learning: 'glTypeLearning',
}

export const GOAL_SKILL_LABEL: Record<GoalSkill, MessageKey> = {
  listening: 'glSkillListening',
  reading: 'glSkillReading',
  speaking: 'glSkillSpeaking',
  writing: 'glSkillWriting',
  pronunciation: 'glSkillPronunciation',
  vocabulary: 'glSkillVocabulary',
  grammar: 'glSkillGrammar',
}

export const GOAL_STATUS_LABEL: Record<GoalStatus, MessageKey> = {
  pending: 'glStatusPending',
  active: 'glStatusActive',
  achieved: 'glStatusAchieved',
  dropped: 'glStatusDropped',
}

export const GOAL_STATUS_CLASS: Record<GoalStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  active: 'bg-[var(--teal-accent-soft)] text-[var(--teal-accent-strong)]',
  achieved: 'bg-emerald-100 text-emerald-800',
  dropped: 'bg-secondary text-muted-foreground',
}

export const TASK_KIND_LABEL: Record<TaskKind, MessageKey> = {
  course: 'gpKindCourse',
  scenario: 'gpKindScenario',
  word_list: 'gpKindWordList',
  comp_test: 'gpKindCompTest',
}

export const TASK_KIND_ICON: Record<TaskKind, LucideIcon> = {
  course: GraduationCap,
  scenario: MessagesSquare,
  word_list: BookOpen,
  comp_test: ClipboardCheck,
}

export const SCENARIO_MODE_LABEL: Record<ScenarioMode, MessageKey> = {
  test: 'gpModeTest',
  practice: 'gpModePractice',
  any: 'gpModeAny',
}

/** "Start 4 → now 6 / 10" on the goal's one scale, named after the skill on a skill goal. */
export function realityLine(t: ReturnType<typeof useLanguage>['t'], goal: Pick<LearnerGoal, 'skill'>, start: number, now: number): string {
  const values = { start, now }
  if (goal.skill) return t(start === now ? 'glSkillStartOnly' : 'glSkillStartNow', { ...values, skill: t(GOAL_SKILL_LABEL[goal.skill]) })
  return t(start === now ? 'glStartOnly' : 'glStartNow', values)
}

/** The message for a failed goal request. */
export function goalErrorKey(err: unknown): MessageKey {
  if (err instanceof GoalRequestError) {
    if (err.code === 'goalRequired') return 'glErrGoalRequired'
    if (err.code === 'content') return 'gpErrContent'
    if (err.code === 'milestone') return 'gpErrMilestone'
  }
  return 'glSaveError'
}
