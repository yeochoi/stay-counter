import { Day, fmtDate, fmtRange, fmtWeekday, toNum } from '../lib/dates'
import { daysIn, Profile, status, taxCount, taxHit, Trip } from '../lib/plan'
import { shortName } from '../lib/rules'
import { Chevron, Plus } from '../components/Icons'
import { Ring, Stats } from '../components/ui'
import { StayBar } from '../components/StayBar'

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

  if (!main) {
    return (
      <main className="today-page">
        <h1 className="sr-only">Today</h1>
        {head}
        <div className="empty-mid">
          <h2 className="first-title">No trips ahead</h2>
          <p className="first-sub">Tap + to plan your next stay.</p>
        </div>
      </main>
    )
  }

  const st = status(main, profile, today)
  const country = shortName(main.country)
  let ring
  let line
  let tap: () => void = () => onOpen(main)
  if (st.phase === 'in') {
    ring = <Ring label="This stay" n={st.daysLeft} unit={st.daysLeft === 1 ? 'day left' : 'days left'} left={st.daysLeft} of={st.leg.days} />
    line = `Leave by ${fmtWeekday(st.leg.end, today)}`
    tap = () => onEditStay(main, st.index)
  } else if (st.phase === 'out') {
    ring = <Ring label={`Out of ${country}`} n={st.daysToGo} unit={st.daysToGo === 1 ? 'day to go' : 'days to go'} />
    line = `Back in ${country} on ${fmtWeekday(st.legs[st.next].start, today)}`
    tap = () => onEditStay(main, st.next)
  } else {
    const days = toNum(main.start) - t
    ring = <Ring label="At home" n={days} unit={days === 1 ? 'day to go' : 'days to go'} />
    line = `${country} from ${fmtWeekday(main.start, today)}`
  }

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
          <span>{current ? 'This trip' : 'Next trip'}</span>
          <span className="s">{fmtRange(main.start, main.end, today)}<Chevron /></span>
        </button>
        <StayBar trip={main} profile={profile} today={today} />
        <Stats
          items={[
            { n: daysIn(main, profile), label: current ? 'Days this trip' : 'Days next trip' },
            { n: tax.days, label: hit ? `Tax days, ${tax.limit} on ${fmtDate(hit, today)}` : `Tax days of ${tax.limit}`, bad: !!hit },
          ]}
        />
      </div>
    </main>
  )
}
