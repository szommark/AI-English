import { NICKNAME_MAX, NICKNAME_MIN } from '../../src/lib/gamification/constants.js'
import type { ClassRankingEntry, LeaderboardEntry, LeagueKey } from '../../src/lib/gamification/types.js'

// Class comparison and public leaderboard rules as pure functions (no database access):
// nickname checks, leagues and ranking. api/_lib/social.ts does the loading.

/**
 * Words a nickname may not contain, after normalising (lower case, no accents, look-alike
 * digits replaced, letters only). Short on purpose: a first line of defence, with admin
 * nickname resets for anything it misses.
 */
const BLOCKED_WORDS = [
  // Hungarian
  // ('szar' and 'rape' are left out: they sit inside "Szarvas" and "grape".)
  'fasz', 'geci', 'kurva', 'picsa', 'pina', 'buzi', 'anyad', 'bazd', 'baszd', 'basz', 'kurv', 'ribanc', 'cigany', 'zsido',
  // English
  'fuck', 'shit', 'bitch', 'cunt', 'dick', 'cock', 'pussy', 'whore', 'slut', 'nigg', 'porn', 'nazi', 'hitler',
  // Impersonation
  'admin', 'tanar', 'teacher', 'moderator', 'aienglish',
]

const LOOKALIKES: Record<string, string> = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '@': 'a', $: 's' }

/** Lower case, accents removed, look-alike digits mapped to letters, everything else dropped. */
export function normaliseForCheck(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[013457@$]/g, (c) => LOOKALIKES[c] ?? c)
    .replace(/[^a-z]/g, '')
}

const ALLOWED = /^[\p{L}\p{N}][\p{L}\p{N} ._-]*$/u

/**
 * Checks a nickname: length, characters, no blocked words, and nothing taken from the
 * learner's email address (a cheap guard against real names). Returns the trimmed nickname
 * or a Hungarian error for the learner.
 */
export function validateNickname(raw: unknown, email: string | null | undefined): { ok: true; nickname: string } | { ok: false; error: string } {
  const nickname = typeof raw === 'string' ? raw.trim().replace(/\s+/g, ' ') : ''
  if (nickname.length < NICKNAME_MIN || nickname.length > NICKNAME_MAX) {
    return { ok: false, error: `A becenév ${NICKNAME_MIN}–${NICKNAME_MAX} karakter legyen.` }
  }
  if (!ALLOWED.test(nickname)) {
    return { ok: false, error: 'A becenévben csak betű, szám, szóköz, pont, kötőjel és aláhúzás lehet.' }
  }
  const plain = normaliseForCheck(nickname)
  if (BLOCKED_WORDS.some((word) => plain.includes(word))) {
    return { ok: false, error: 'Ezt a becenevet nem használhatod. Válassz másikat.' }
  }
  const emailParts = (email ?? '')
    .split('@')[0]
    .split(/[^\p{L}]+/u)
    .map(normaliseForCheck)
    .filter((part) => part.length >= 3)
  if (emailParts.some((part) => plain.includes(part))) {
    return { ok: false, error: 'A becenév ne tartalmazza a neved vagy az e-mail-címed egy részét.' }
  }
  return { ok: true, nickname }
}

/** The league for a CEFR estimate; no estimate yet counts as alap. */
export function leagueFor(cefr: string | null | undefined): LeagueKey {
  const band = (cefr ?? '').trim().toUpperCase().charAt(0)
  if (band === 'C') return 'felso'
  if (band === 'B') return 'kozep'
  return 'alap'
}

/** Ranks by XP, highest first; equal XP shares a rank (1, 1, 3). Ties keep the input order. */
export function rankByXp<T extends { xp: number }>(rows: T[]): (T & { rank: number })[] {
  const sorted = [...rows].sort((a, b) => b.xp - a.xp)
  let rank = 0
  return sorted.map((row, i) => {
    if (i === 0 || row.xp !== sorted[i - 1].xp) rank = i + 1
    return { ...row, rank }
  })
}

/**
 * One league's public view: the top `top` learners with XP this week, and the learner's
 * own row when they are on the leaderboard but further down (or still at 0 XP).
 */
export function leagueView(
  rows: { userId: string; nickname: string; level: number; xp: number }[],
  meId: string,
  top: number,
): { entries: LeaderboardEntry[]; me: LeaderboardEntry | null; participants: number } {
  // Learners on equal XP are listed alphabetically, so the order doesn't jump between loads.
  const byName = [...rows].sort((a, b) => a.nickname.localeCompare(b.nickname, 'hu'))
  const ranked = rankByXp(byName.filter((r) => r.xp > 0))
  const toEntry = (r: { userId: string; nickname: string; level: number; xp: number; rank: number }): LeaderboardEntry => ({
    rank: r.rank,
    nickname: r.nickname,
    level: r.level,
    xp: r.xp,
    isMe: r.userId === meId,
  })
  const entries = ranked.slice(0, top).map(toEntry)
  let me: LeaderboardEntry | null = null
  if (!entries.some((e) => e.isMe)) {
    const mine = ranked.find((r) => r.userId === meId)
    const zero = rows.find((r) => r.userId === meId && r.xp === 0)
    if (mine) me = toEntry(mine)
    else if (zero) me = { rank: ranked.length + 1, nickname: zero.nickname, level: zero.level, xp: 0, isMe: true }
  }
  return { entries, me, participants: ranked.length }
}

/**
 * A class ranking as one learner sees it: every classmate, nickname when they have one,
 * otherwise numbered "Osztálytárs N" in ranking order. The learner's own row is marked.
 */
export function classView(rows: { studentId: string; nickname: string | null; xp: number }[], meId: string): ClassRankingEntry[] {
  let classmateNo = 0
  return rankByXp(rows).map((r) => {
    const isMe = r.studentId === meId
    const anonymous = !isMe && !r.nickname
    return {
      rank: r.rank,
      xp: r.xp,
      isMe,
      nickname: isMe ? null : r.nickname,
      classmateNo: anonymous ? ++classmateNo : null,
    }
  })
}
