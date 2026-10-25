import { Day, fmtLong, fmtRange, toNum } from '../lib/dates'
import { entryEnds, isBooked, legs, Profile, status, Trip } from '../lib/plan'
import { Chevron, AlertSmall } from './Icons'

/**
 * The stays of one trip as a timeline. One line joins them so they read as one trip.
 * The line is solid into a stay that is booked, done or now, and dashed into one not booked yet.
 * A stay after the entry ends shows a small coral icon next to its dates. The reason is inside the stay.
 */
export function StayTimeline({ trip, profile, today, onStay, head, foot }: { trip: Trip; profile: Profile; today: Day; onStay: (i: number) => void; head?: React.ReactNode; foot?: React.ReactNode }) {
  const ls = legs(trip, profile)
  const st = status(trip, profile, today)
  const now = st.phase === 'in' ? st.index : -1
  const nextIdx = st.phase === 'out' ? st.next : -1
  const ends = entryEnds(trip, profile)
  const t = toNum(today)
  const plural = (n: number) => `${n} ${n === 1 ? 'day' : 'days'}`
  const kindOf = (i: number) => (i === now ? 'now' : toNum(ls[i].end) < t ? 'past' : isBooked(trip, ls, i) ? 'booked' : 'open')
  const lateText = trip.entry.kind === 'visa' ? 'After your visa ends' : 'After visa free ends'
  return (
    <div className="card timeline">
      {head}
      {ls.map((l, i) => {
        const kind = kindOf(i)
        const label =
          kind === 'now' ? 'Now'
          : kind === 'past' ? 'Done'
          : i === nextIdx ? `Back in ${plural(st.phase === 'out' ? st.daysToGo : 0)}`
          : kind === 'booked' ? 'Booked'
          : 'Not booked'
        const late = !!ends && toNum(l.end) > toNum(ends)
        const into = i > 0 ? (kind === 'open' ? 'dash' : 'solid') : 'off'
        const out = i < ls.length - 1 ? (kindOf(i + 1) === 'open' ? 'dash' : 'solid') : 'off'
        return (
          <button key={i} className={`stay-row ${kind}`} onClick={() => onStay(i)} aria-label={`${fmtLong(l.start)} to ${fmtLong(l.end)}, ${plural(l.days)}, ${label}${late ? `, ${lateText}` : ''}`}>
            <span className="tl" aria-hidden="true"><i className={into} /><b /><i className={out} /></span>
            <span className="in">
              <span className="what">
                <span className="t">{fmtRange(l.start, l.end, today)}{late && <AlertSmall />}</span>
                <span className="state">{label}</span>
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
