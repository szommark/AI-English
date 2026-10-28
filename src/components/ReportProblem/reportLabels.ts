import type { MessageKey } from '../../lib/i18n'
import type { ContentFlagReason, FeedbackKind, FeedbackStatus, MyFeedbackReport } from '../../lib/feedback'

export const KIND_LABEL: Record<FeedbackKind, MessageKey> = {
  bug: 'reportKindBug',
  display: 'reportKindDisplay',
  content: 'reportKindContent',
  idea: 'reportKindIdea',
}

export const FLAG_REASON_LABEL: Record<ContentFlagReason, MessageKey> = {
  answer_rejected: 'flagReasonAnswerRejected',
  wrong_key: 'flagReasonWrongKey',
  faulty_logic: 'flagReasonFaultyLogic',
  unclear: 'flagReasonUnclear',
  typo: 'flagReasonTypo',
  other: 'flagReasonOther',
}

/** How a report's status reads to the person who sent it. */
export function myStatusLabel(r: Pick<MyFeedbackReport, 'status' | 'kind'>): MessageKey {
  switch (r.status) {
    case 'new':
      return 'mrStatusNew'
    case 'seen':
      return 'mrStatusSeen'
    case 'in_progress':
      return 'mrStatusInProgress'
    case 'fixed':
      return r.kind === 'idea' ? 'mrStatusIdeaDone' : 'mrStatusFixed'
    case 'wont_fix':
      return 'mrStatusWontFix'
  }
}

export const MY_STATUS_STYLE: Record<FeedbackStatus, string> = {
  new: 'border-border bg-secondary text-muted-foreground',
  seen: 'border-border bg-secondary text-muted-foreground',
  in_progress: 'border-amber-200 bg-amber-50 text-amber-800',
  fixed: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  wont_fix: 'border-border bg-secondary text-muted-foreground',
}

/** Headline of the one-time notice: a closing status wins over a reply. */
export function noticeTitle(r: Pick<MyFeedbackReport, 'status' | 'kind'>): MessageKey {
  if (r.status === 'fixed') return r.kind === 'idea' ? 'fnIdeaDoneTitle' : 'fnFixedTitle'
  if (r.status === 'wont_fix') return 'fnClosedTitle'
  return 'fnReplyTitle'
}
