import { useState } from 'react'
import { Day, fmtRange, toNum, year } from '../lib/dates'
import { daysIn, Profile, status, Trip } from '../lib/plan'
import { shortName } from '../lib/rules'
import { Chevron, Export, Plus } from '../components/Icons'
import { Sec, Sheet } from '../components/ui'

const plural = (n: number) => `${n} ${n === 1 ? 'day' : 'days'}`

type Tab = 'Upcoming' | 'Past'
export type ExportKind = 'All' | 'Business' | 'Personal'

export function Trips({ trips, profile, today, onOpen, onExport, onNew }: { trips: Trip[]; profile: Profile; today: Day; onOpen: (t: Trip) => void; onExport: (k: ExportKind) => void; onNew: () => void }) {
  const [tab, setTab] = useState<Tab>('Upcoming')
  const [exporting, setExporting] = useState(false)
  const t = toNum(today)
  const sorted = [...trips].sort((a, b) => b.start.localeCompare(a.start))
  const now = sorted.filter((x) => toNum(x.start) <= t && t <= toNum(x.end))
  const upcoming = sorted.filter((x) => toNum(x.start) > t).reverse()
  const past = sorted.filter((x) => toNum(x.end) < t)
  const years = [...new Set(past.map((x) => year(x.start)))]
  const all = [...trips].sort((a, b) => a.start.localeCompare(b.start))
  const span = all.length ? [year(all[0].start), year(all[all.length - 1].end)] : []
  const label = !all.length ? 'No trips yet' : `${all.length} ${all.length === 1 ? 'trip' : 'trips'}${span[0] === span[1] ? `, ${span[0]}` : `, ${span[0]} to ${span[1]}`}`

  /** One row. A two line list on phones, a table row on laptops. */
  const row = (x: Trip, chip?: React.ReactNode) => {
    const dates = fmtRange(x.start, x.end, today)
    const days = plural(daysIn(x, profile))
    const extra = !x.booked && toNum(x.start) > t ? 'Planning' : ''
    return (
      <button key={x.id} className="row two trip-row" onClick={() => onOpen(x)}>
        <span className="col m-only">
          <span className="t">{shortName(x.country)}</span>
          <span className="sub">{dates} · {days} · {x.type}{extra ? ` · ${extra}` : ''}</span>
        </span>
        <span className="t d-only">{shortName(x.country)}</span>
        <span className="d-only cell">{dates}</span>
        <span className="d-only cell muted">{days}</span>
        <span className="d-only cell muted">{x.type}{extra ? ` · ${extra}` : ''}</span>
        <span className="end">{chip}<Chevron /></span>
      </button>
    )
  }

  return (
    <>
      <header className="hero" style={{ paddingTop: 'calc(var(--top) + 42px)', paddingBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div className="stack">
            <div className="l">{label}</div>
            <h1 className="hero-title">Trips</h1>
          </div>
          <button className="round" style={{ marginBottom: -9 }} aria-label="Export for tax or HR" onClick={() => setExporting(true)}><Export /></button>
        </div>
      </header>
      <div className="tabs" role="tablist" aria-label="Trips">
        {(['Upcoming', 'Past'] as Tab[]).map((f) => (
          <button key={f} role="tab" aria-selected={f === tab} className={f === tab ? 'on' : ''} onClick={() => setTab(f)}>{f}</button>
        ))}
      </div>
      <main className="content trips">
        {tab === 'Upcoming' && (
          <>
            {now.length > 0 && (
              <section>
                <Sec>Now</Sec>
                <div className="card current">
                  {now.map((x) => {
                    const st = status(x, profile, today)
                    const chip = st.phase === 'in' ? `${st.daysLeft} ${st.daysLeft === 1 ? 'day' : 'days'} left` : st.phase === 'out' ? `Back in ${st.daysToGo} ${st.daysToGo === 1 ? 'day' : 'days'}` : ''
                    return row(x, chip ? <span className="pill now">{chip}</span> : undefined)
                  })}
                </div>
              </section>
            )}
            {upcoming.length > 0 && (
              <section>
                <Sec>Upcoming</Sec>
                <div className="card">{upcoming.map((x) => row(x))}</div>
              </section>
            )}
            {now.length + upcoming.length === 0 && <div className="note" style={{ paddingTop: 24 }}>{trips.length ? 'No upcoming trips. Tap + to plan one.' : 'Trips you plan or book show up here.'}</div>}
          </>
        )}
        {tab === 'Past' && (
          <>
            {years.map((y) => (
              <section key={y}>
                <Sec>{y}</Sec>
                <div className="card">{past.filter((x) => year(x.start) === y).map((x) => row(x))}</div>
              </section>
            ))}
            {past.length === 0 && <div className="note" style={{ paddingTop: 24 }}>Trips you finish show up here.</div>}
          </>
        )}
      </main>
      <button className="fab" aria-label="Plan a stay or add a booked trip" onClick={onNew}><Plus /></button>
      {exporting && (
        <Sheet title="Export trips" onClose={() => setExporting(false)}>
          <div className="note" style={{ padding: '8px 4px 12px' }}>A spreadsheet of your trips with dates and days, for tax or HR.</div>
          <div className="card">
            {(['All', 'Business', 'Personal'] as ExportKind[]).map((k) => (
              <button key={k} className="row" onClick={() => { onExport(k); setExporting(false) }}>
                <span className="t">{k === 'All' ? 'All trips' : `${k} trips only`}</span>
                <span className="s">{trips.filter((x) => k === 'All' || x.type === k).length}<Chevron /></span>
              </button>
            ))}
          </div>
        </Sheet>
      )}
    </>
  )
}
