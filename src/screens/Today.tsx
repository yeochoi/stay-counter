import { Day, fmtDate, fmtRange, fmtWeekday, toNum } from '../lib/dates'
import { daysIn, Profile, status, taxCount, taxHit, Trip, yearDays } from '../lib/plan'
import { Chevron, Plus } from '../components/Icons'
import { Ring, Stats } from '../components/ui'
import { StayBar } from '../components/StayBar'
import { YearBar } from '../components/YearBar'

type Props = {
  trips: Trip[]
  profile: Profile
  today: Day
  onNew: (booked: boolean) => void
  onOpen: (t: Trip) => void
  onEditStay: (t: Trip, i: number) => void
}

/** Today. One ring in the middle, the trip as one bar, and two numbers. Nothing in cards. */
export function Today({ trips, profile, today, onNew, onOpen, onEditStay }: Props) {
  const t = toNum(today)
  const sorted = [...trips].sort((a, b) => a.start.localeCompare(b.start))
  const current = sorted.find((x) => toNum(x.start) <= t && t <= toNum(x.end))
  const main = current ?? sorted.find((x) => toNum(x.start) > t)

  const head = (
    <div className="today-head">
      <span className="today-date">{fmtWeekday(today, today)}</span>
      <button className="add-round" aria-label="Plan a stay or add a booked trip" onClick={() => onNew(false)}><Plus size={20} /></button>
    </div>
  )

  if (!trips.length) {
    return (
      <main className="today-page">
        <h1 className="sr-only">Today</h1>
        {head}
        <div className="empty-mid">
          <h2 className="first-title">No trips yet</h2>
          <p className="first-sub">See how long you can stay in China and when to leave, before you book.</p>
        </div>
        <div className="pair">
          <button className="btn primary" onClick={() => onNew(false)}>Plan a stay</button>
          <button className="btn outline" onClick={() => onNew(true)}>Add booked trip</button>
        </div>
      </main>
    )
  }

  const CHINA = 'China'
  const y = Number(today.slice(0, 4))
  const st = main ? status(main, profile, today) : undefined

  // In China, the ring counts the days left in this stay. Anywhere else it counts this year's days in China.
  if (!main || !st || st.phase !== 'in') {
    const limit = taxCount(trips, profile, CHINA, today).limit
    const used = yearDays(trips, profile, CHINA, y, today)
    const left = limit - used
    const lastEnd = sorted.filter((x) => toNum(x.end) < t).map((x) => toNum(x.end)).sort((a, b) => b - a)[0]
    const ahead = sorted.filter((x) => toNum(x.end) >= t).length
    const thisYear = sorted.filter((x) => x.country === CHINA && Number(x.start.slice(0, 4)) <= y && Number(x.end.slice(0, 4)) >= y).length
    return (
      <main className="today-page">
        <h1 className="sr-only">Today</h1>
        {head}
        <div className="ring-btn" role="group" aria-label={`${used} of ${limit} days in China in ${y}`}>
          <Ring label={`In China in ${y}`} n={used} unit={`of ${limit} days`} left={used} of={limit} />
          <span className={`ring-line${left <= 0 ? ' bad' : ''}`}>{left > 0 ? `${left} ${left === 1 ? 'day' : 'days'} left before the tax limit` : `Past the tax limit by ${-left} ${left === -1 ? 'day' : 'days'}`}</span>
        </div>
        <div className="today-body">
          {main ? (
            <>
              <button className="link-line" onClick={() => onOpen(main)}>
                <span>{current ? 'This trip' : 'Next trip'}</span>
                <span className="s">{fmtRange(main.start, main.end, today)}<Chevron /></span>
              </button>
              <StayBar trip={main} profile={profile} today={today} />
              {(() => {
                const hit = taxHit(main, trips.filter((x) => x.id !== main.id), profile)
                const go = st && (st.phase === 'out' || st.phase === 'before') ? st.daysToGo : 0
                return (
                  <Stats items={[
                    { n: go, label: st?.phase === 'out' ? `Days until back in China` : 'Days to go' },
                    hit ? { n: fmtDate(hit, today), label: `You reach ${limit} days`, bad: true } : { n: daysIn(main, profile), label: current ? 'Days this trip' : 'Days next trip' },
                  ]} />
                )
              })()}
            </>
          ) : (
            <>
              <div className="link-line" style={{ cursor: 'default' }}>
                <span>This year</span>
                <span className="s">{thisYear} {thisYear === 1 ? 'trip' : 'trips'}</span>
              </div>
              <YearBar trips={trips} profile={profile} country={CHINA} today={today} />
              <Stats items={[
                { n: lastEnd !== undefined ? t - lastEnd : 0, label: 'Days at home' },
                { n: ahead, label: ahead === 1 ? 'Trip ahead' : 'Trips ahead' },
              ]} />
            </>
          )}
        </div>
      </main>
    )
  }

  const ring = <Ring label="This stay" n={st.daysLeft} unit={st.daysLeft === 1 ? 'day left' : 'days left'} left={st.daysLeft} of={st.leg.days} />
  const line = `Leave by ${fmtWeekday(st.leg.end, today)}`
  const tap = () => onEditStay(main, st.index)

  const tax = taxCount(trips, profile, main.country, today)
  const hit = taxHit(main, trips.filter((x) => x.id !== main.id), profile)
  return (
    <main className="today-page">
      <h1 className="sr-only">Today</h1>
      {head}
      <button className="ring-btn" onClick={tap} aria-label={`${line}. Open`}>
        {ring}
        <span className="ring-line">{line}</span>
      </button>
      <div className="today-body">
        <button className="link-line" onClick={() => onOpen(main)}>
          <span>This trip</span>
          <span className="s">{fmtRange(main.start, main.end, today)}<Chevron /></span>
        </button>
        <StayBar trip={main} profile={profile} today={today} />
        <Stats
          items={[
            { n: daysIn(main, profile), label: 'Days this trip' },
            { n: tax.days, label: hit ? `Days in China this year, ${tax.limit} on ${fmtDate(hit, today)}` : `Days in China this year, of ${tax.limit}`, bad: !!hit },
          ]}
        />
      </div>
    </main>
  )
}
