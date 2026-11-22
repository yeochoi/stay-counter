import { useState } from 'react'
import { Day, fmtRange, toNum, year } from '../lib/dates'
import { bookingNote, daysIn, Profile, Trip } from '../lib/plan'
import { Chevron, Plus } from '../components/Icons'
import { PageHead } from '../components/ui'

type Tab = 'Upcoming' | 'Past'
export type ExportKind = 'All' | 'Business' | 'Personal'

/** Trips. A pill switch with counts, then plain rows on the page, like SaySay sentences. */
export function Trips({ trips, profile, today, onOpen, onNew }: { trips: Trip[]; profile: Profile; today: Day; onOpen: (t: Trip) => void; onNew: () => void }) {
  const [tab, setTab] = useState<Tab>('Upcoming')
  const t = toNum(today)
  const ahead = [...trips].filter((x) => toNum(x.end) >= t).sort((a, b) => a.start.localeCompare(b.start))
  const past = [...trips].filter((x) => toNum(x.end) < t).sort((a, b) => b.start.localeCompare(a.start))
  const years = [...new Set(past.map((x) => year(x.start)))]

  const row = (x: Trip) => {
    const now = toNum(x.start) <= t && t <= toNum(x.end)
    const done = toNum(x.end) < t
    const n = daysIn(x, profile)
    const note = now ? 'now' : done ? '' : bookingNote(x, profile, today).toLowerCase()
    return (
      <button key={x.id} className="list-row" onClick={() => onOpen(x)}>
        {now && <span className="dot" aria-hidden="true" />}
        <span className="col">
          <span className="t">{fmtRange(x.start, x.end, today)}</span>
          <span className="sub">{n} {n === 1 ? 'day' : 'days'}, {x.type}{note ? `, ${note}` : ''}</span>
        </span>
        <Chevron />
      </button>
    )
  }

  return (
    <main className="tv">
      <PageHead title="Trips">
        <button className="add-round" aria-label="Plan a stay or add a booked trip" onClick={onNew}><Plus size={20} /></button>
      </PageHead>
      <div className="tv-body">
        <div className="seg" role="tablist" aria-label="Trips">
          {(['Upcoming', 'Past'] as Tab[]).map((f) => (
            <button key={f} role="tab" aria-selected={f === tab} className={f === tab ? 'on' : ''} onClick={() => setTab(f)}>
              {f} {f === 'Upcoming' ? ahead.length : past.length}
            </button>
          ))}
        </div>
        {tab === 'Upcoming' && (
          <div className="list">
            {ahead.map(row)}
            {ahead.length === 0 && <div className="list-note">{trips.length ? 'No trips ahead. Tap + to plan one.' : 'Trips you plan or book show up here.'}</div>}
          </div>
        )}
        {tab === 'Past' && (
          <>
            {years.map((y) => (
              <section key={y}>
                <h2 className="sec">{y}</h2>
                <div className="list">{past.filter((x) => year(x.start) === y).map(row)}</div>
              </section>
            ))}
            {past.length === 0 && <div className="list-note">Trips you finish show up here.</div>}
          </>
        )}
      </div>
    </main>
  )
}
