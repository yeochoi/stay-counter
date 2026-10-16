import { useState } from 'react'
import { Day, fmtRange, toNum, year } from '../lib/dates'
import { Profile, status, Trip } from '../lib/plan'
import { shortName } from '../lib/rules'
import { Export, Plus } from '../components/Icons'
import { Sec } from '../components/ui'

type Filter = 'All' | 'Business' | 'Personal'

export function Trips({ trips, profile, today, onOpen, onExport, onNew }: { trips: Trip[]; profile: Profile; today: Day; onOpen: (t: Trip) => void; onExport: () => void; onNew: () => void }) {
  const [filter, setFilter] = useState<Filter>('All')
  const t = toNum(today)
  const list = [...trips].filter((x) => filter === 'All' || x.type === filter).sort((a, b) => b.start.localeCompare(a.start))
  const now = list.filter((x) => toNum(x.start) <= t && t <= toNum(x.end))
  const upcoming = list.filter((x) => toNum(x.start) > t).reverse()
  const past = list.filter((x) => toNum(x.end) < t)
  const years = [...new Set(past.map((x) => year(x.start)))]
  const all = [...trips].sort((a, b) => a.start.localeCompare(b.start))
  const span = all.length ? [year(all[0].start), year(all[all.length - 1].end)] : []
  const label = !all.length ? 'No trips yet' : `${all.length} ${all.length === 1 ? 'trip' : 'trips'}${span[0] === span[1] ? `, ${span[0]}` : `, ${span[0]} to ${span[1]}`}`

  const row = (x: Trip, chip: React.ReactNode) => (
    <button key={x.id} className="row two" onClick={() => onOpen(x)}>
      <span className="col">
        <span className="t">{shortName(x.country)}</span>
        <span className="sub">{fmtRange(x.start, x.end, today)}{!x.booked ? ' · Planning' : ''}</span>
      </span>
      {chip}
    </button>
  )

  return (
    <>
      <header className="hero" style={{ paddingTop: 'calc(var(--top) + 42px)', paddingBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div className="stack">
            <div className="l">{label}</div>
            <h1 className="hero-title">Trips</h1>
          </div>
          <button className="round" style={{ marginBottom: -9 }} aria-label="Export for tax or HR" onClick={onExport}><Export /></button>
        </div>
      </header>
      <div className="tabs" role="tablist" aria-label="Filter trips">
        {(['All', 'Business', 'Personal'] as Filter[]).map((f) => (
          <button key={f} role="tab" aria-selected={f === filter} className={f === filter ? 'on' : ''} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>
      <main className="content">
        {now.length > 0 && (
          <>
            <Sec>Now</Sec>
            {now.map((x) => {
              const st = status(x, profile, today)
              const sub = st.phase === 'in' ? `${fmtRange(st.leg.start, st.leg.end, today)} · Stay ${st.index + 1} of ${st.legs.length}` : fmtRange(x.start, x.end, today)
              const chip = st.phase === 'in' ? `${st.daysLeft} ${st.daysLeft === 1 ? 'day' : 'days'} left` : st.phase === 'out' ? `Back in ${st.daysToGo} ${st.daysToGo === 1 ? 'day' : 'days'}` : x.type
              return (
                <div key={x.id} className="card current">
                  <button className="row two" onClick={() => onOpen(x)}>
                    <span className="col"><span className="t">{shortName(x.country)}</span><span className="sub">{sub}</span></span>
                    <span className="pill now">{chip}</span>
                  </button>
                </div>
              )
            })}
          </>
        )}
        {upcoming.length > 0 && (
          <>
            <Sec>Upcoming</Sec>
            <div className="card">{upcoming.map((x) => row(x, <span className="pill grey">{x.type}</span>))}</div>
          </>
        )}
        {years.map((y) => (
          <div key={y}>
            <Sec>{y}</Sec>
            <div className="card">{past.filter((x) => year(x.start) === y).map((x) => row(x, <span className="pill grey">{x.type}</span>))}</div>
          </div>
        ))}
        {list.length === 0 && <div className="note" style={{ paddingTop: 24 }}>{trips.length ? `No ${filter.toLowerCase()} trips.` : 'Trips you plan or book show up here.'}</div>}
      </main>
      <button className="fab" aria-label="Plan a stay or add a booked trip" onClick={onNew}><Plus /></button>
    </>
  )
}
