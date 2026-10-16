// Entry and tax rules. A small starting set, kept as plain data so it can grow.
// These are general information, not legal or tax advice.

export type CountryRule = {
  /** Days allowed per entry without a visa. Missing means a visa is needed. */
  visaFreeDays?: number
  /** Last day the visa free policy applies, if it has an end date. */
  visaFreeUntil?: string
}

export type TaxRule = {
  days: number
  /** calendar counts Jan 1 to Dec 31, rolling counts any 12 months. */
  window: 'calendar' | 'rolling'
}

export const COUNTRIES = [
  'China',
  'France',
  'Germany',
  'Japan',
  'Netherlands',
  'Singapore',
  'South Korea',
  'Thailand',
  'United Kingdom',
  'United States',
  'Vietnam',
] as const

export const PASSPORTS = ['South Korea', 'Netherlands'] as const

/** Short names used in lists, so rows stay on one line. */
export function shortName(country: string): string {
  if (country === 'South Korea') return 'Korea'
  if (country === 'United Kingdom') return 'UK'
  if (country === 'United States') return 'US'
  return country
}

const BY_PASSPORT: Record<string, Record<string, CountryRule>> = {
  'South Korea': {
    China: { visaFreeDays: 30, visaFreeUntil: '2026-12-31' },
    Japan: { visaFreeDays: 90 },
    Singapore: { visaFreeDays: 90 },
    Thailand: { visaFreeDays: 90 },
    Vietnam: { visaFreeDays: 45 },
    France: { visaFreeDays: 90 },
    Germany: { visaFreeDays: 90 },
    Netherlands: { visaFreeDays: 90 },
    'United Kingdom': { visaFreeDays: 180 },
    'United States': { visaFreeDays: 90 },
  },
  Netherlands: {
    China: { visaFreeDays: 30, visaFreeUntil: '2026-12-31' },
    Japan: { visaFreeDays: 90 },
    'South Korea': { visaFreeDays: 90 },
    Singapore: { visaFreeDays: 90 },
    Thailand: { visaFreeDays: 60 },
    Vietnam: { visaFreeDays: 45 },
    'United Kingdom': { visaFreeDays: 180 },
    'United States': { visaFreeDays: 90 },
  },
}

const TAX: Record<string, TaxRule> = {
  China: { days: 183, window: 'calendar' },
  Japan: { days: 183, window: 'rolling' },
}

export function entryRule(passport: string, country: string): CountryRule {
  return BY_PASSPORT[passport]?.[country] ?? {}
}

export function taxRule(country: string): TaxRule {
  return TAX[country] ?? { days: 183, window: 'rolling' }
}
