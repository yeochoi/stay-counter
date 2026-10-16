import { useEffect, useState } from 'react'
import { Profile, Trip } from './plan'

export type State = {
  profile?: Profile
  trips: Trip[]
  /** Optional date to preview the app on another day. Empty means today. */
  previewDate?: string
}

const KEY = 'stay-counter-v1'

function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as State
  } catch {
    /* storage can be blocked, start fresh */
  }
  return { trips: [] }
}

export function useStore() {
  const [state, setState] = useState<State>(load)
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* ignore */
    }
  }, [state])
  return [state, setState] as const
}

/** Example trips that match the design, for trying the app. */
export function sampleTrips(): Trip[] {
  const t = (country: string, start: string, end: string, type: Trip['type'], booked = true): Trip => ({
    id: `${country}-${start}`,
    country,
    start,
    end,
    entry: { kind: 'visafree' },
    type,
    booked,
  })
  return [
    t('China', '2026-01-12', '2026-02-10', 'Business'),
    t('China', '2026-03-09', '2026-04-07', 'Business'),
    t('China', '2026-04-27', '2026-05-26', 'Business'),
    t('South Korea', '2026-06-17', '2026-07-01', 'Personal'),
    t('China', '2026-07-06', '2026-07-27', 'Business'),
    t('China', '2026-08-21', '2026-09-19', 'Business'),
    t('Japan', '2026-09-26', '2026-10-02', 'Personal'),
    t('China', '2026-11-01', '2027-03-31', 'Business', false),
    t('Japan', '2027-04-03', '2027-04-10', 'Personal'),
  ]
}
