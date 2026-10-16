import { Day, fmtDate, fmtRange, fmtWeekday, toNum } from '../lib/dates'
import { last12Months, Profile, status, Trip } from '../lib/plan'
import { shortName, taxRule } from '../lib/rules'
import { Check, Chevron, Gear, Plane, Plus } from '../components/Icons'
import { Ring, Sec } from '../components/ui'

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
      const next = ls[st.index + 1]
      hero = (
        <>
          <button className="hero-main" onClick={() => onEditStay(main, st.index)}>
            <Ring n={st.daysLeft} unit={st.daysLeft === 1 ? 'day left' : 'days left'} of={st.leg.days} value={st.dayOf} />
            <div className="stack">
              <div className="l">Leave {country} by</div>
              <div className="a">{fmtWeekday(st.leg.end, today)}</div>
              <div className="l">Stay {st.index + 1} of {ls.length}</div>
            </div>
          </button>
          {next && <div className="chips"><span>Next entry {fmtDate(next.start, today)}</span></div>}
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
            <div className="l">Stay {st.next + 1} of {ls.length}</div>
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
            <span>{main.type}</span>
            <span>{main.entry.kind === 'visafree' ? 'Visa free' : 'Visa'}</span>
            {ls.length > 1 && <span>{ls.length} stays</span>}
            {!main.booked && <span>Planning</span>}
          </div>
        </>
      )
    }
    if (current && ls.length > 1) {
      const suggested = ls.some((l) => !l.edited)
      const now = st.phase === 'in' ? st.index : -1
      stays = (
        <section>
          <Sec>{suggested ? 'Suggested stays' : 'Your stays'}</Sec>
          <div className="card">
            {ls.map((l, i) => (
              <button key={i} className="row" style={{ minHeight: 54 }} onClick={() => onEditStay(main, i)}>
                <span className="t">{fmtRange(l.start, l.end, today)}</span>
                <span className="s">
                  {i === now ? <span className="pill now">Now</span> : <>{l.edited && <Check />}{l.days} {l.days === 1 ? 'day' : 'days'}</>}
                  <Chevron />
                </span>
              </button>
            ))}
          </div>
          {suggested && <div className="note">Tap a stay to match your flights.</div>}
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

  const counts = last12Months(trips, profile, today)
  return (
    <>
      <header className="hero">
        {top}
        {hero}
      </header>
      <main className="content today">
        {stays}
        {later.length > 0 && (
          <section>
            <Sec>Later</Sec>
            <div className="card">
              {later.map((x) => (
                <button key={x.id} className="row" onClick={() => onOpen(x)}>
                  <span className="t">{shortName(x.country)}</span>
                  <span className="s">{fmtRange(x.start, x.end, today)}</span>
                </button>
              ))}
            </div>
          </section>
        )}
        <section className="past">
        <Sec>Past 12 months</Sec>
        <div className="card" style={{ padding: '0 16px' }}>
          {counts.length === 0 && <div className="row" style={{ padding: 0 }}><span className="k">No days abroad yet</span></div>}
          {counts.map((c) => {
            const limit = taxRule(c.country).days
            const showBar = c.country !== profile.home && c.days >= 60
            const name = shortName(c.country)
            if (!showBar) {
              return (
                <div key={c.country} className="row" style={{ padding: 0 }}>
                  <span className="t">{name}</span>
                  <span className="s">{c.days} days</span>
                </div>
              )
            }
            const close = c.days / limit >= 0.85
            return (
              <div key={c.country} className="row" style={{ padding: '14px 0', display: 'block' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="t">{name}</span>
                  {close ? <span className="pill coral">{c.days} of {limit} days</span> : <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--purple-text)' }}>{c.days} of {limit}</span>}
                </div>
                <div className={`bar${close ? ' coral' : ''}`} aria-hidden="true"><div style={{ width: `${Math.min(100, (c.days / limit) * 100)}%` }} /></div>
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

