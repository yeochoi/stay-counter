import { Day, fmtRange, fmtWeekday, toNum } from '../lib/dates'
import { daysIn, Profile, status, taxCounts, Trip, warnings } from '../lib/plan'
import { shortName } from '../lib/rules'
import { Chevron, Gear, Plane, Plus } from '../components/Icons'
import { Ring, Sec } from '../components/ui'
import { StayTimeline } from '../components/StayTimeline'

type Props = {
  trips: Trip[]
  profile: Profile
  today: Day
  onNew: (booked: boolean) => void
  onOpen: (t: Trip) => void
  onEditStay: (t: Trip, i: number) => void
  onSettings: () => void
}

export function Today({ trips, profile, today, onNew, onOpen, onEditStay, onSettings }: Props) {
  const t = toNum(today)
  const sorted = [...trips].sort((a, b) => a.start.localeCompare(b.start))
  const current = sorted.find((x) => toNum(x.start) <= t && t <= toNum(x.end))
  const upcoming = sorted.filter((x) => toNum(x.start) > t)
  const main = current ?? upcoming[0]
  const later = upcoming.filter((x) => x !== main)

  const top = (
    <div className="hero-top">
      <div className="hero-date trim">{fmtWeekday(today, today)}</div>
      <button className="round" aria-label="Settings" onClick={onSettings}><Gear /></button>
    </div>
  )

  if (!trips.length) {
    return (
      <>
        <header className="hero">{top}</header>
        <div className="empty">
          <div className="mid">
            <div className="icon"><Plane /></div>
            <h2>No trips yet</h2>
            <p>See how long you can stay and<br />when to leave, before you book.</p>
          </div>
          <div className="empty-actions">
            <button className="btn primary" onClick={() => onNew(false)}>Plan a stay</button>
            <button className="btn soft" onClick={() => onNew(true)}>Add booked trip</button>
          </div>
        </div>
      </>
    )
  }

  let hero
  let stays = null
  if (main) {
    const st = status(main, profile, today)
    const ls = st.legs
    const country = shortName(main.country)
    if (st.phase === 'in') {
      hero = (
        <>
          <button className="hero-main" onClick={() => onEditStay(main, st.index)}>
            <Ring n={st.daysLeft} unit={st.daysLeft === 1 ? 'day left' : 'days left'} of={st.leg.days} value={st.dayOf} />
            <div className="stack">
              <div className="l">Leave {country} by</div>
              <div className="a">{fmtWeekday(st.leg.end, today)}</div>
            </div>
          </button>
        </>
      )
    } else if (st.phase === 'out') {
      const next = ls[st.next]
      hero = (
        <button className="hero-main" onClick={() => onEditStay(main, st.next)}>
          <Ring n={st.daysToGo} unit={st.daysToGo === 1 ? 'day to go' : 'days to go'} />
          <div className="stack">
            <div className="l">Back in {country}</div>
            <div className="a">{fmtWeekday(next.start, today)}</div>
          </div>
        </button>
      )
    } else {
      const days = toNum(main.start) - t
      hero = (
        <>
          <button className="hero-main" onClick={() => onOpen(main)}>
            <Ring n={days} unit={days === 1 ? 'day to go' : 'days to go'} />
            <div className="stack">
              <div className="l">Next trip</div>
              <div className="a">{country}</div>
              <div className="l">{fmtRange(main.start, main.end, today)}</div>
            </div>
          </button>
          <div className="chips">
            <span>{daysIn(main, profile)} days</span>
            <span>{main.type}</span>
            <span>{main.entry.kind === 'visafree' ? 'Visa free' : 'Visa'}</span>
            {!main.booked && <span>Planning</span>}
          </div>
        </>
      )
    }
    if (current && ls.length > 1) {
      const anySuggested = ls.some((l) => !l.edited && toNum(l.start) > toNum(today))
      stays = (
        <section>
          <Sec>{shortName(main.country)} trip</Sec>
          <StayTimeline
            trip={main}
            profile={profile}
            today={today}
            onStay={(i) => onEditStay(main, i)}
            foot={(() => {
              const n = warnings(main, trips.filter((x) => x.id !== main.id), profile).length
              return (
                <button className="row trip-foot" onClick={() => onOpen(main)}>
                  <span className="body-text">Trip details</span>
                  <span className="s">{n > 0 && <span className="bad-note">{n} to check</span>}<Chevron /></span>
                </button>
              )
            })()}
          />
          {anySuggested && <div className="note">Tap a stay to match your flights.</div>}
        </section>
      )
    }
  } else {
    hero = (
      <div className="hero-main">
        <div className="stack">
          <div className="l">Next trip</div>
          <div className="a">None yet</div>
          <div className="l">Tap + to plan your next stay</div>
        </div>
      </div>
    )
  }

  const counts = taxCounts(trips, profile, today)
  return (
    <>
      <header className="hero">
        <h1 className="sr-only">Today</h1>
        {top}
        {hero}
      </header>
      <main className="content today">
        {stays}
        {later.length > 0 && (
          <section>
            <Sec>Upcoming</Sec>
            <div className="card">
              {later.map((x) => (
                <button key={x.id} className="row" onClick={() => onOpen(x)}>
                  <span className="t">{shortName(x.country)}</span>
                  <span className="s">{fmtRange(x.start, x.end, today)}<Chevron /></span>
                </button>
              ))}
            </div>
          </section>
        )}
        <section className="past">
          <Sec>Tax days</Sec>
          <div className="card" style={{ padding: '0 16px' }}>
            {counts.length === 0 && <div className="row" style={{ padding: 0 }}><span className="k">No days abroad yet</span></div>}
            {counts.map((c) => {
              const close = c.days / c.limit >= 0.85
              const when = c.window === 'calendar' ? `In ${today.slice(0, 4)}` : 'Past 12 months'
              return (
                <div key={c.country} className="row" style={{ padding: '14px 0', display: 'block' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                    <span className="col"><span className="t">{shortName(c.country)}</span><span className="sub">{when}</span></span>
                    {close ? <span className="pill coral">{c.days} of {c.limit} days</span> : <span className="s">{c.days >= 60 ? `${c.days} of ${c.limit} days` : `${c.days} ${c.days === 1 ? 'day' : 'days'}`}</span>}
                  </div>
                  {c.days >= 60 && <div className={`bar${close ? ' coral' : ''}`} aria-hidden="true"><div style={{ width: `${Math.min(100, (c.days / c.limit) * 100)}%` }} /></div>}
                </div>
              )
            })}
          </div>
        </section>
      </main>
      <button className="fab" aria-label="Plan a stay or add a booked trip" onClick={() => onNew(false)}><Plus /></button>
    </>
  )
}

