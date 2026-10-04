import { GAMIFICATION_TIMEZONE } from './constants.js'

// Calendar dates (YYYY-MM-DD) in the gamification timezone, shared by the API and the
// frontend so both count challenge days the same way.

const DAY_MS = 24 * 60 * 60 * 1000
const LOCAL_DATE = new Intl.DateTimeFormat('en-CA', {
  timeZone: GAMIFICATION_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/** Today's calendar date in Europe/Budapest, YYYY-MM-DD. */
export function budapestDate(now: Date = new Date()): string {
  return LOCAL_DATE.format(now)
}

export function addDays(date: string, days: number): string {
  return new Date(Date.parse(`${date}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10)
}

/** Whole days from `from` to `to` (both YYYY-MM-DD). */
export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS)
}

/** The Monday after `date` (a Monday gives the following week's Monday). */
export function nextMonday(date: string): string {
  const weekday = new Date(`${date}T00:00:00Z`).getUTCDay() // 0 = Sunday
  return addDays(date, weekday === 0 ? 1 : 8 - weekday)
}
