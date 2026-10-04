import { supabaseAdmin } from './supabaseAdmin.js'
import { awardXp } from './gamification.js'
import { EXAM_SCORING_PAPERS } from './generated/examScoringPapers.js'
import { paperCompletion, sectionAnswers, sectionAward, type SectionEvent } from './examXpRules.js'
import type { AwardResult } from '../../src/lib/gamification/types.js'

// Exam Prep XP (docs/gamification-design.md §3.4). The browser hands in a section's answers;
// they are re-scored here from the server's copy of the answer keys, so neither the score
// nor the task count is taken from the browser. One XP event per section:
//   exam-prep.<type>_section_complete  10 XP per task done + up to 5 per task by the raw
//                                      score; item_ref '<paper id>/<section id>' — a retake
//                                      earns no score bonus (sitting_effort_only)
//   exam-prep.<type>_paper_complete    +50 once every section of the paper has been handed
//                                      in since the last paper bonus; item_ref '<paper id>',
//                                      performance_score = the paper's raw score share
// All exam types share the weekly cap (weekly_cap_group 'exam'). Two sections handed in at
// the same moment could both see the paper complete; accepted, like the caps (at most one
// extra bonus, and sections are handed in one after another).

export class ExamXpError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

export interface ExamSectionXp {
  xp: AwardResult | null
  paperXp: AwardResult | null
}

export async function awardExamSection(args: {
  userId: string
  paperId: string
  sectionId: string
  answers: unknown
}): Promise<ExamSectionXp> {
  const paper = EXAM_SCORING_PAPERS[args.paperId]
  const section = paper?.sections.find((s) => s.id === args.sectionId)
  if (!paper || !section) throw new ExamXpError(404, 'Not found')

  const award = sectionAward(section, sectionAnswers(section, args.answers))
  if (award.tasksDone === 0) return { xp: null, paperXp: null }

  const sectionType = `exam-prep.${paper.type}_section_complete`
  const paperType = `exam-prep.${paper.type}_paper_complete`
  const xp = await awardXp({
    userId: args.userId,
    activityType: sectionType,
    itemRef: `${paper.id}/${section.id}`,
    language: paper.language,
    performanceScore: award.score,
    units: award.tasksDone,
  })
  // Not recorded (exam XP switched off, or an error that awardXp has logged): no paper check.
  if (!xp) return { xp: null, paperXp: null }

  let paperXp: AwardResult | null = null
  try {
    const latest = await sectionEventsSinceLastPaper(args.userId, paper.id, sectionType, paperType)
    const completion = paperCompletion(paper, latest)
    if (completion.complete) {
      paperXp = await awardXp({
        userId: args.userId,
        activityType: paperType,
        itemRef: paper.id,
        language: paper.language,
        performanceScore: completion.score,
      })
    }
  } catch (err) {
    // The section XP is recorded; the paper bonus is a bonus on top.
    console.error('Failed to check exam paper completion', err)
  }
  return { xp, paperXp }
}

/** Each section's latest event since the paper's last bonus (all of them when there is none). */
async function sectionEventsSinceLastPaper(
  userId: string,
  paperId: string,
  sectionType: string,
  paperType: string,
): Promise<SectionEvent[]> {
  // Paper ids are [a-z0-9-] only, so the pattern has no wildcards of its own; the exact match
  // below drops other papers whose id merely starts the same.
  const { data, error } = await supabaseAdmin
    .from('xp_events')
    .select('activity_type, item_ref, performance_score, created_at')
    .eq('user_id', userId)
    .in('activity_type', [sectionType, paperType])
    .like('item_ref', `${paperId}%`)
    .order('created_at', { ascending: false })
  if (error) throw error

  const rows = (data ?? []) as { activity_type: string; item_ref: string; performance_score: number | string | null }[]
  const latest = new Map<string, SectionEvent>()
  for (const row of rows) {
    if (row.activity_type === paperType) {
      if (row.item_ref === paperId) break // newest first: everything after this is before the last bonus
      continue
    }
    if (!row.item_ref.startsWith(`${paperId}/`)) continue
    const sectionId = row.item_ref.slice(paperId.length + 1)
    if (!latest.has(sectionId)) {
      latest.set(sectionId, {
        sectionId,
        // numeric columns can arrive as strings.
        score: row.performance_score === null ? null : Number(row.performance_score),
      })
    }
  }
  return [...latest.values()]
}
