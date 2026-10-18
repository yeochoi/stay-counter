import { Day, fmtRange, toNum } from '../lib/dates'
import { entryEnds, legs, Profile, status, Trip } from '../lib/plan'
import { Chevron } from './Icons'

/**
 * The stays of one trip as a timeline. Each stay says what it is under its dates,
 * the right side is always the days, so every row lines up.
 */
export function StayTimeline({ trip, profile, today, onStay, head, foot }: { trip: Trip; profile: Profile; today: Day; onStay: (i: number) => void; head?: React.ReactNode; foot?: React.ReactNode }) {
  const ls = legs(trip, profile)
  const st = status(trip, profile, today)
  const now = st.phase === 'in' ? st.index : -1
  const nextIdx = st.phase === 'out' ? st.next : -1
  const ends = entryEnds(trip, profile)
  const t = toNum(today)
  const plural = (n: number) => `${n} ${n === 1 ? 'day' : 'days'}`
  return (
    <div className="card timeline">
      {head}
      {ls.map((l, i) => {
        const kind = i === now ? 'now' : toNum(l.end) < t ? 'past' : 'next'
        const label =
          kind === 'now' && st.phase === 'in' ? `Now · ${plural(st.daysLeft)} left`
          : kind === 'past' ? 'Done'
          : i === nextIdx && st.phase === 'out' ? `Back in ${plural(st.daysToGo)}`
          : l.edited ? 'Matched to flights' : 'Suggested'
        const late = ends && toNum(l.end) > toNum(ends)
        return (
          <button key={i} className={`stay-row ${kind}`} onClick={() => onStay(i)}>
            <span className="tl" aria-hidden="true"><i className={i === 0 ? 'off' : ''} /><b /><i className={i === ls.length - 1 ? 'off' : ''} /></span>
            <span className="in">
              <span className="what">
                <span className="t">{fmtRange(l.start, l.end, today)}</span>
                <span className="state">{label}</span>
                {late && <span className="sub bad">{trip.entry.kind === 'visa' ? 'After your visa ends' : 'After visa free ends'}</span>}
              </span>
              <span className="s">{plural(l.days)}<Chevron /></span>
            </span>
          </button>
        )
      })}
      {foot}
    </div>
  )
}
