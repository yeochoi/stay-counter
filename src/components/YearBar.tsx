import { Day, toNum } from '../lib/dates'
import { legs, Profile, Trip } from '../lib/plan'

/** One calendar year as a thin bar. The days you were in the country are purple, a dark line marks today. */
export function YearBar({ trips, profile, country, today }: { trips: Trip[]; profile: Profile; country: string; today: Day }) {
  const y = Number(today.slice(0, 4))
  const a = toNum(`${y}-01-01`)
  const len = toNum(`${y}-12-31`) - a + 1
  const pieces: { left: number; width: number; future: boolean }[] = []
  for (const t of trips) {
    if (t.country !== country) continue
    for (const l of legs(t, profile)) {
      const s = Math.max(toNum(l.start), a), e = Math.min(toNum(l.end), a + len - 1)
      if (s > e) continue
      pieces.push({ left: ((s - a) / len) * 100, width: ((e - s + 1) / len) * 100, future: s > toNum(today) })
    }
  }
  return (
    <div className="staybar">
      <div className="yearbar-track" role="img" aria-label={`Days in ${country} in ${y}`}>
        {pieces.map((p, i) => <span key={i} className={`ypiece${p.future ? ' future' : ''}`} style={{ left: `${p.left}%`, width: `${p.width}%` }} />)}
        <i className="today" style={{ left: `${((toNum(today) - a + 0.5) / len) * 100}%` }} />
      </div>
      <div className="staybar-ends"><span>Jan</span><span>Apr</span><span>Jul</span><span>Oct</span><span>Dec</span></div>
    </div>
  )
}
