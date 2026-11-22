import { Day, fmtDate, fmtLong, toNum } from '../lib/dates'
import { entryEnds, isBooked, legs, Profile, Trip } from '../lib/plan'

/**
 * The stays of one trip as one thin bar. Each stay is a piece, sized by its days.
 * The stay you are in is primary, every other stay is light purple.
 * A stay after the visa or visa free period ends gets a small coral mark above it.
 * A dark line marks today.
 */
export function StayBar({ trip, profile, today }: { trip: Trip; profile: Profile; today: Day }) {
  const ls = legs(trip, profile)
  const t = toNum(today)
  const ends = entryEnds(trip, profile)
  const desc = ls.map((l, i) => {
    const now = toNum(l.start) <= t && t <= toNum(l.end)
    const late = !!ends && toNum(l.end) > toNum(ends)
    return `${fmtLong(l.start)} to ${fmtLong(l.end)}${now ? ', now' : isBooked(trip, ls, i) ? ', booked' : ''}${late ? ', after the entry ends' : ''}`
  }).join('. ')
  return (
    <div className="staybar">
      <div className="staybar-track" role="img" aria-label={`${ls.length} ${ls.length === 1 ? 'stay' : 'stays'}. ${desc}`}>
        {ls.map((l, i) => {
          const now = toNum(l.start) <= t && t <= toNum(l.end)
          const done = toNum(l.end) < t
          const late = !!ends && toNum(l.end) > toNum(ends)
          const at = now ? ((t - toNum(l.start) + 0.5) / l.days) * 100 : 0
          return (
            <span key={i} className={`piece${now ? ' now' : done ? ' done' : ''}`} style={{ flexGrow: l.days }}>
              {now && <i className="today" style={{ left: `${at}%` }} />}
              {late && !done && (
                <svg className="late" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#A83C18" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3l9.5 17H2.5z" /><path d="M12 10v4M12 17.5v.01" /></svg>
              )}
            </span>
          )
        })}
      </div>
      <div className="staybar-ends"><span>{fmtDate(trip.start, today)}</span><span>{fmtDate(trip.end, today)}</span></div>
    </div>
  )
}
