import { Day, fmtRange, toNum, year } from '../lib/dates'
import { Profile, status, Trip } from '../lib/plan'
import { shortName } from '../lib/rules'
import { Share } from '../components/Icons'
import { TabHeader } from '../components/ui'

type Props = { trips: Trip[]; profile: Profile; today: Day; onOpen: (t: Trip) => void; onExport: () => void }

export function Trips({ trips, profile, today, onOpen, onExport }: Props) {
  const t = toNum(today)
  const sorted = [...trips].sort((a, b) => toNum(a.start) - toNum(b.start))
  const now = sorted.find((x) => toNum(x.start) <= t && t <= toNum(x.end))
  const upcoming = sorted.filter((x) => toNum(x.start) > t)
  const past = sorted.filter((x) => toNum(x.end) < t).reverse()
  const years = [...new Set(past.map((p) => year(p.end)))]

  let afterPlain = false
  const cls = () => {
    const c = `section ${afterPlain ? 'after-plain' : ''}`
    return c
  }

  const sections = []
  if (now) {
    const st = status(now, profile, today)
    const value = st.phase === 'in' ? `${st.daysLeft} ${st.daysLeft === 1 ? 'day' : 'days'} left` : st.phase === 'out' ? 'Outside today' : ''
    sections.push(
      <section key="now" style={{ paddingTop: 24 }}>
        <div className="label" style={{ paddingBottom: 6 }}>Now</div>
        <button className="list-row tall band" onClick={() => onOpen(now)}>
          <span className="name">{shortName(now.country)}</span>
          <span className="value purple">{value}</span>
        </button>
      </section>,
    )
    afterPlain = false
  }
  if (upcoming.length) {
    sections.push(
      <section key="up" className={cls()} style={sections.length ? undefined : { paddingTop: 24 }}>
        <div className="label">Upcoming</div>
        <div className="rows">
          {upcoming.map((x) => (
            <button key={x.id} className="list-row tall" onClick={() => onOpen(x)}>
              <span className="name">{shortName(x.country)}</span>
              <span className="value">{fmtRange(x.start, x.end, today)}</span>
            </button>
          ))}
        </div>
      </section>,
    )
    afterPlain = true
  }
  for (const y of years) {
    const list = past.filter((p) => year(p.end) === y)
    sections.push(
      <section key={y} className={cls()} style={sections.length ? undefined : { paddingTop: 24 }}>
        <div className="label">{y}</div>
        <div className="rows">
          {list.map((x) => (
            <button key={x.id} className="list-row tall" onClick={() => onOpen(x)}>
              <span className="name">{shortName(x.country)}</span>
              <span className="value">{fmtRange(x.start, x.end, `${y}-01-01`)}</span>
            </button>
          ))}
        </div>
      </section>,
    )
    afterPlain = true
  }

  return (
    <main className="screen">
      <TabHeader
        title="Trips"
        action={trips.length > 0 && <button className="icon-btn" aria-label="Export trips" onClick={onExport}><Share /></button>}
      />
      {sections.length ? sections : (
        <div className="body muted" style={{ paddingTop: 24, lineHeight: 1.5 }}>Your trips will show here.</div>
      )}
    </main>
  )
}
