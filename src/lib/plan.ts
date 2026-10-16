import { addDays, daysInclusive, Day, toNum, fromNum, year } from './dates'
import { entryRule, taxRule } from './rules'

export type Entry =
  | { kind: 'visafree' }
  | { kind: 'visa'; days: number; validUntil: Day; multiple: boolean }

export type Trip = {
  id: string
  country: string
  start: Day
  end: Day
  entry: Entry
  type: 'Business' | 'Personal'
  booked: boolean
  /** Stays the person set to match real flights. Missing means we suggest them. */
  stays?: Stay[]
}

export type Stay = { start: Day; end: Day; edited?: boolean }

export type Profile = {
  passport: string
  passport2?: string
  home: string
}

export type Leg = { start: Day; end: Day; days: number; edited?: boolean }

/** Days allowed per entry for this trip, or undefined when there is no limit we know. */
export function daysPerEntry(trip: Trip, profile: Profile): number | undefined {
  if (trip.entry.kind === 'visa') return trip.entry.days
  return entryRule(profile.passport, trip.country).visaFreeDays
}

/**
 * Split a stay into entries. Each entry lasts at most the allowed days,
 * then you leave for one day and come back the next.
 */
export function legs(trip: Trip, profile: Profile): Leg[] {
  if (trip.stays?.length) return trip.stays.map((s) => ({ ...s, days: daysInclusive(s.start, s.end) }))
  return suggest(trip.start, trip.end, daysPerEntry(trip, profile))
}

/** Suggested stays from start to end, leaving for one day between them. */
export function suggest(start: Day, end: Day, max?: number): Leg[] {
  if (!max || max <= 0) return [{ start, end, days: daysInclusive(start, end) }]
  const out: Leg[] = []
  let cursor = start
  while (toNum(cursor) <= toNum(end) && out.length < 60) {
    let legEnd = addDays(cursor, max - 1)
    if (toNum(legEnd) > toNum(end)) legEnd = end
    out.push({ start: cursor, end: legEnd, days: daysInclusive(cursor, legEnd) })
    cursor = addDays(legEnd, 2)
  }
  return out
}

/**
 * Change one stay to match real flights. Earlier stays stay put.
 * Later stays move to start the day after this one ends, unless you already set them.
 */
export function editStay(trip: Trip, profile: Profile, i: number, start: Day, end: Day): Trip {
  const cur = legs(trip, profile)
  const strip = (l: Leg): Stay => ({ start: l.start, end: l.end, edited: l.edited })
  const head = cur.slice(0, i).map(strip)
  const me: Stay = { start, end, edited: true }
  const tripEnd = toNum(end) > toNum(trip.end) ? end : trip.end
  const later = cur.slice(i + 1)
  let tail: Stay[]
  if (later.length && later[0].edited && toNum(later[0].start) > toNum(end)) tail = later.map(strip)
  else tail = toNum(end) + 1 <= toNum(tripEnd) ? suggest(addDays(end, 1), tripEnd, daysPerEntry(trip, profile)).map(strip) : []
  const stays = [...head, me, ...tail]
  return { ...trip, start: stays[0].start, end: stays[stays.length - 1].end, stays }
}

/** Every day you are inside a country, across all trips. */
export function presence(trips: Trip[], profile: Profile, country: string): Set<number> {
  const s = new Set<number>()
  for (const t of trips) {
    if (t.country !== country) continue
    for (const l of legs(t, profile)) {
      for (let n = toNum(l.start); n <= toNum(l.end); n++) s.add(n)
    }
  }
  return s
}

export type Warning = { id: string; text: string }

/** Warnings for a trip, checked against the rest of the saved trips. */
export function warnings(trip: Trip, others: Trip[], profile: Profile): Warning[] {
  const out: Warning[] = []
  const rule = entryRule(profile.passport, trip.country)
  const long = (d: Day) => fmtLong(d)

  if (trip.entry.kind === 'visafree') {
    if (!rule.visaFreeDays) {
      out.push({ id: 'norule', text: `Check if you need a visa for ${trip.country}` })
    } else if (rule.visaFreeUntil && toNum(trip.end) > toNum(rule.visaFreeUntil)) {
      out.push({ id: 'vfend', text: `Visa free ends ${long(rule.visaFreeUntil)}` })
    }
  } else {
    if (toNum(trip.end) > toNum(trip.entry.validUntil)) {
      out.push({ id: 'visaend', text: `Your visa ends ${long(trip.entry.validUntil)}` })
    }
    if (!trip.entry.multiple && legs(trip, profile).length > 1) {
      out.push({ id: 'single', text: 'Your visa allows one entry only' })
    }
  }

  const hit = taxHit(trip, others, profile)
  if (hit) out.push({ id: 'tax', text: `You hit ${taxRule(trip.country).days} days on ${fmtShort(hit)}` })
  return out
}

/** The first day this trip takes you to the tax limit, if it does. */
export function taxHit(trip: Trip, others: Trip[], profile: Profile): Day | undefined {
  const rule = taxRule(trip.country)
  const all = presence([...others.filter((o) => o.id !== trip.id), trip], profile, trip.country)
  const sorted = [...all].sort((a, b) => a - b)
  const mine = presence([trip], profile, trip.country)
  for (const n of sorted) {
    if (!mine.has(n)) continue
    let count = 0
    if (rule.window === 'calendar') {
      const y = year(fromNum(n))
      for (const m of sorted) if (m <= n && year(fromNum(m)) === y) count++
    } else {
      for (const m of sorted) if (m <= n && m > n - 365) count++
    }
    if (count >= rule.days) return fromNum(n)
  }
  return undefined
}

/** Days in each country over the last 12 months, up to today. */
export function last12Months(trips: Trip[], profile: Profile, today: Day) {
  const from = toNum(today) - 364
  const to = toNum(today)
  const counts = new Map<string, number>()
  const abroad = new Set<number>()
  for (const t of trips) {
    for (const l of legs(t, profile)) {
      for (let n = Math.max(toNum(l.start), from); n <= Math.min(toNum(l.end), to); n++) {
        counts.set(t.country, (counts.get(t.country) ?? 0) + 1)
        abroad.add(n)
      }
    }
  }
  const rows = [...counts.entries()].map(([country, days]) => ({ country, days }))
  const homeDays = 365 - abroad.size
  if (homeDays > 0 && !counts.has(profile.home)) rows.push({ country: profile.home, days: homeDays })
  return rows.sort((a, b) => b.days - a.days)
}

/** Where the trip stands today. */
export function status(trip: Trip, profile: Profile, today: Day) {
  const t = toNum(today)
  const ls = legs(trip, profile)
  const index = ls.findIndex((l) => toNum(l.start) <= t && t <= toNum(l.end))
  if (index >= 0) {
    const leg = ls[index]
    return {
      phase: 'in' as const,
      leg,
      index,
      legs: ls,
      daysLeft: toNum(leg.end) - t,
      dayOf: t - toNum(leg.start) + 1,
    }
  }
  if (t < toNum(trip.start)) return { phase: 'before' as const, legs: ls, daysToGo: toNum(trip.start) - t }
  if (t > toNum(trip.end)) return { phase: 'after' as const, legs: ls }
  // Between two entries, outside the country for a day.
  const next = ls.findIndex((l) => toNum(l.start) > t)
  if (next < 0) return { phase: 'after' as const, legs: ls }
  return { phase: 'out' as const, legs: ls, next, daysToGo: toNum(ls[next].start) - t }
}

const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
function fmtLong(d: Day) {
  const [y, m, dd] = d.split('-').map(Number)
  return `${M[m - 1]} ${dd}, ${y}`
}
function fmtShort(d: Day) {
  const [, m, dd] = d.split('-').map(Number)
  return `${M[m - 1]} ${dd}`
}

export function newId() {
  return Math.random().toString(36).slice(2, 10)
}
