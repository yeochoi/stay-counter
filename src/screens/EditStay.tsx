import { useState } from 'react'
import { addDays, Day, daysInclusive, fmtDate, fmtWeekday, toNum } from '../lib/dates'
import { daysPerEntry, legs, Profile, Trip } from '../lib/plan'
import { shortName } from '../lib/rules'
import { Actions, DateRow, Sec, Sheet } from '../components/ui'

/** Change one stay to match real flights. Later stays move along. */
export function EditStay({ trip, profile, index, today, onCancel, onSave }: { trip: Trip; profile: Profile; index: number; today: Day; onCancel: () => void; onSave: (start: Day, end: Day) => void }) {
  const ls = legs(trip, profile)
  const leg = ls[index]
  const [start, setStart] = useState(leg.start)
  const [end, setEnd] = useState(leg.end)
  const max = daysPerEntry(trip, profile)
  const valid = toNum(end) >= toNum(start)
  const days = valid ? daysInclusive(start, end) : 0
  const prev = ls[index - 1]
  const tooEarly = prev && toNum(start) <= toNum(prev.end)
  const country = shortName(trip.country)
  const hasNext = index < ls.length - 1 || toNum(end) + 2 <= toNum(trip.end)
  let sub = ''
  let over = false
  if (!valid) { sub = 'Leave must be after you arrive'; over = true }
  else if (tooEarly) { sub = `Stay ${index} ends ${fmtDate(prev.end, today)}`; over = true }
  else if (max) {
    if (days > max) { sub = `${days - max} ${days - max === 1 ? 'day' : 'days'} over the ${max} day limit`; over = true }
    else if (days === max) sub = `The full ${max} days`
    else sub = `${max - days} ${max - days === 1 ? 'day' : 'days'} under the ${max} day limit`
  }

  return (
    <Sheet title={`Stay ${index + 1}`} foot={<Actions left="Cancel" right="Save" onLeft={onCancel} onRight={() => onSave(start, end)} disabled={!valid || !!tooEarly} />}>
      <div className="big">{days} {days === 1 ? 'day' : 'days'}</div>
      <div className="big-sub" style={over ? { color: 'var(--coral-text)' } : undefined}>{sub}</div>
      <div className="card" style={{ marginTop: 20 }}>
        <DateRow k="Arrive" value={start} today={today} onChange={(d) => { setStart(d); if (toNum(end) < toNum(d)) setEnd(d) }} />
        <DateRow k="Leave" value={end} today={today} min={start} onChange={setEnd} />
      </div>
      <div className="note">Match these to your flights.{max ? ` Each stay can last up to ${max} days.` : ''}</div>
      {hasNext && valid && (
        <>
          <Sec>Next stays move too</Sec>
          <div className="card">
            <div className="row small"><span className="k">Out of {country}</span><span className="v">{fmtDate(addDays(end, 1), today)}</span></div>
            <div className="row small"><span className="k">Stay {index + 2} starts</span><span className="v">{fmtWeekday(addDays(end, 2), today)}</span></div>
          </div>
          <div className="note">Changed something else? Edit that stay next.</div>
        </>
      )}
    </Sheet>
  )
}
