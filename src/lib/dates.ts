// Dates are plain "YYYY-MM-DD" strings in the traveller's local calendar.
// All math runs on whole days in UTC so time zones never shift a date.

export type Day = string

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function toNum(d: Day): number {
  const [y, m, dd] = d.split('-').map(Number)
  return Date.UTC(y, m - 1, dd) / 86400000
}

export function fromNum(n: number): Day {
  const dt = new Date(n * 86400000)
  const y = dt.getUTCFullYear()
  const m = String(dt.getUTCMonth() + 1).padStart(2, '0')
  const d = String(dt.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function addDays(d: Day, n: number): Day {
  return fromNum(toNum(d) + n)
}

/** Days from a to b, both counted. Nov 1 to Nov 30 is 30. */
export function daysInclusive(a: Day, b: Day): number {
  return toNum(b) - toNum(a) + 1
}

export function diff(a: Day, b: Day): number {
  return toNum(b) - toNum(a)
}

export function todayDay(): Day {
  const t = new Date()
  const y = t.getFullYear()
  const m = String(t.getMonth() + 1).padStart(2, '0')
  const d = String(t.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function parts(d: Day) {
  const [y, m, dd] = d.split('-').map(Number)
  const wd = new Date(toNum(d) * 86400000).getUTCDay()
  return { y, m, d: dd, wd }
}

export function year(d: Day): number {
  return parts(d).y
}

/** Nov 30, or Nov 30, 2027 when not in the current year. */
export function fmtDate(d: Day, today: Day): string {
  const p = parts(d)
  const base = `${MONTHS[p.m - 1]} ${p.d}`
  return p.y === year(today) ? base : `${base}, ${p.y}`
}

/** Nov 30, 2026. Always with the year, for sentences and screen readers. */
export function fmtLong(d: Day): string {
  const p = parts(d)
  return `${MONTHS[p.m - 1]} ${p.d}, ${p.y}`
}

/** Mon, Nov 30. Used only for single dates people act on. */
export function fmtWeekday(d: Day, today: Day): string {
  return `${WEEKDAYS[parts(d).wd]}, ${fmtDate(d, today)}`
}

/**
 * Ranges use a spaced en dash.
 * Nov 1 – 30, Feb 2 – Mar 3, Jan 2 – 31, 2027, Nov 1 – Mar 31, 2027
 */
export function fmtRange(a: Day, b: Day, today: Day): string {
  const pa = parts(a)
  const pb = parts(b)
  const ty = year(today)
  if (pa.y !== pb.y) {
    const startYear = pa.y === ty ? '' : `, ${pa.y}`
    return `${MONTHS[pa.m - 1]} ${pa.d}${startYear} – ${MONTHS[pb.m - 1]} ${pb.d}, ${pb.y}`
  }
  const tail = pa.y === ty ? '' : `, ${pa.y}`
  if (pa.m === pb.m) {
    if (pa.d === pb.d) return `${MONTHS[pa.m - 1]} ${pa.d}${tail}`
    return `${MONTHS[pa.m - 1]} ${pa.d} – ${pb.d}${tail}`
  }
  return `${MONTHS[pa.m - 1]} ${pa.d} – ${MONTHS[pb.m - 1]} ${pb.d}${tail}`
}

export function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 's'}`
}
