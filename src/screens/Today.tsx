import { Day, fmtRange, fmtWeekday, plural, toNum } from '../lib/dates'
import { last12Months, Profile, status, Trip } from '../lib/plan'
import { shortName, taxRule } from '../lib/rules'
import { Gear, Plane, Plus } from '../components/Icons'
import { Ring, TabHeader } from '../components/ui'

type Props = {
  trips: Trip[]
  profile: Profile
  today: Day
  onNew: (booked: boolean) => void
  onOpen: (t: Trip) => void
  onSettings: () => void
}

export function Today({ trips, profile, today, onNew, onOpen, onSettings }: Props) {
  const t = toNum(today)
  const sorted = [...trips].sort((a, b) => toNum(a.start) - toNum(b.start))
  const active = sorted.find((x) => toNum(x.start) <= t && t <= toNum(x.end))
  const future = sorted.filter((x) => toNum(x.start) > t)
  const hero = active ?? future[0]
  const later = future.filter((x) => x !== hero)
  const counts = last12Months(trips, profile, today)
  const tracked = new Set(hero ? [hero.country] : [])

  const header = (
    <TabHeader
      eyebrow={fmtWeekday(today, today)}
      title="Today"
      action={<button className="icon-btn" aria-label="Settings" onClick={onSettings}><Gear /></button>}
    />
  )

  if (!hero) {
    return (
      <>
        <main className="screen" style={{ display: 'flex', flexDirection: 'column', paddingBottom: 30 }}>
          {header}
          <div className="empty">
            <Plane />
            <div className="title" style={{ paddingTop: 18 }}>{trips.length ? 'No trips coming up' : 'No trips yet'}</div>
            <div className="body muted" style={{ lineHeight: 1.5, paddingTop: 6 }}>
              See how long you can stay and<br />when to leave, before you book.
            </div>
          </div>
          {counts.length > 0 && trips.length > 0 && <Days rows={counts} tracked={tracked} first />}
          <div className="stack" style={{ paddingTop: 24 }}>
            <button className="btn primary" onClick={() => onNew(false)}>Plan a stay</button>
            <button className="btn secondary" onClick={() => onNew(true)}>Add booked trip</button>
          </div>
        </main>
      </>
    )
  }

  const st = status(hero, profile, today)
  const rule = taxRule(hero.country)
  const heroCount = counts.find((c) => c.country === hero.country)?.days ?? 0

  return (
    <>
      <main className="screen">
        {header}

        {st.phase === 'in' ? (
          <>
            <div className="hero">
              <div className="ring">
                <Ring value={st.dayOf} total={st.leg.days} coral={st.daysLeft <= 5} />
                <div className="inside">
                  <div className="num">{st.daysLeft}</div>
                  <div className="unit muted">{st.daysLeft === 1 ? 'day left' : 'days left'}</div>
                </div>
              </div>
              <div className="hero-text">
                <div className="label">Leave {shortName(hero.country)} by</div>
                <div className="title">{fmtWeekday(st.leg.end, today)}</div>
              </div>
            </div>
            {st.legs.length > 1 && (
              <section className="section">
                <div className="label">Your plan</div>
                {st.legs.slice(st.index, st.index + 3).map((l, i, arr) => (
                  <button key={l.start} className="timeline-row" onClick={() => onOpen(hero)}>
                    <div className="timeline-rail" aria-hidden="true">
                      <div className={`seg top ${i === 0 ? 'hide' : ''}`} />
                      <div className={`dot ${i === 0 ? 'now' : ''}`} />
                      <div className={`seg bottom ${i === arr.length - 1 ? 'hide' : ''}`} />
                    </div>
                    <div className="timeline-body">
                      <div className="row-text" style={{ fontWeight: i === 0 ? 600 : 400 }}>{fmtRange(l.start, l.end, today)}</div>
                      <div className={`body ${i === 0 ? 'purple' : 'muted'}`} style={{ fontWeight: i === 0 ? 600 : 400 }}>
                        {i === 0 ? 'Now' : plural(l.days, 'day')}
                      </div>
                    </div>
                  </button>
                ))}
              </section>
            )}
          </>
        ) : (
          <button className="hero" style={{ border: 0, background: 'transparent', padding: '44px 0 0', textAlign: 'left', width: '100%' }} onClick={() => onOpen(hero)}>
            <div className="disc">
              <div className="num">{st.phase === 'before' || st.phase === 'out' ? st.daysToGo : 0}</div>
              <div className="unit">days to go</div>
            </div>
            <div className="hero-text">
              <div className="label">{st.phase === 'out' ? 'Next entry' : 'Next trip'}</div>
              <div className="title">{shortName(hero.country)}</div>
              <div className="body muted">{fmtRange(hero.start, hero.end, today)}</div>
            </div>
          </button>
        )}

        {later.length > 0 && (
          <section className="section">
            <div className="label">Later</div>
            <div className="rows">
              {later.map((x) => (
                <button key={x.id} className="list-row" onClick={() => onOpen(x)}>
                  <span className="name">{shortName(x.country)}</span>
                  <span className="value">{fmtRange(x.start, x.end, today)}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {st.phase === 'in' ? (
          <section className={`section ${st.legs.length > 1 ? '' : 'after-plain'}`}>
            <div className="label">Past 12 months</div>
            <div className="rows">
              <div className="list-row">
                <span className="name">{shortName(hero.country)}</span>
                <span className={`value ${rule.days - heroCount <= 30 ? 'coral' : 'purple'}`}>{heroCount} of {rule.days} days</span>
              </div>
            </div>
          </section>
        ) : (
          <Days rows={counts} tracked={tracked} first={false} afterPlain={later.length > 0} />
        )}
      </main>
      <button className="fab" aria-label="Plan a stay or add a booked trip" onClick={() => onNew(false)}><Plus /></button>
    </>
  )
}

function Days({ rows, tracked, first, afterPlain }: { rows: { country: string; days: number }[]; tracked: Set<string>; first: boolean; afterPlain?: boolean }) {
  if (!rows.length) return null
  return (
    <section className={`section ${afterPlain ? 'after-plain' : ''}`} style={first ? { paddingTop: 0 } : undefined}>
      <div className="label">Past 12 months</div>
      <div className="rows">
        {[...rows].sort((a, b) => Number(tracked.has(b.country)) - Number(tracked.has(a.country)) || b.days - a.days).map((r) => {
          const rule = taxRule(r.country)
          const isTracked = tracked.has(r.country)
          const close = rule.days - r.days <= 30
          return (
            <div key={r.country} className="list-row" style={{ minHeight: 50 }}>
              <span className="name">{shortName(r.country)}</span>
              <span className={`value ${isTracked ? (close ? 'coral' : 'purple') : ''}`}>
                {isTracked ? `${r.days} of ${rule.days}` : plural(r.days, 'day')}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}

