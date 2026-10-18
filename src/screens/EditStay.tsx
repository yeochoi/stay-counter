import { useState } from 'react'
import { addDays, Day, daysInclusive, fmtDate, fmtWeekday, toNum } from '../lib/dates'
import { daysPerEntry, legs, Profile, Trip } from '../lib/plan'
import { shortName } from '../lib/rules'
import { DateRow, Primary, Sheet } from '../components/ui'

/** Change one stay to match real flights. Later stays move along. */
export function EditStay({ trip, profile, index, today, nav = 'close', onCancel, onSave, onDismiss }: { trip: Trip; profile: Profile; index: number; today: Day; nav?: 'close' | 'back'; onCancel: () => void; onSave: (start: Day, end: Day) => void; onDismiss?: () => void }) {
  const ls = legs(trip, profile)
  const leg = ls[index]
  // A finished stay can still be corrected, for example if you left earlier than planned.
  const done = toNum(leg.end) < toNum(today)
  const [start, setStart] = useState(leg.start)
  const [end, setEnd] = useState(leg.end)
  const max = daysPerEntry(trip, profile)
  const valid = toNum(end) >= toNum(start)
  const days = valid ? daysInclusive(start, end) : 0
  const prev = ls[index - 1]
  const tooEarly = prev && toNum(start) <= toNum(prev.end)
  const hasNext = index < ls.length - 1 || toNum(end) + 1 <= toNum(trip.end)
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
    <Sheet title={ls.length > 1 ? `Stay ${index + 1} of ${ls.length}` : shortName(trip.country)} {...(nav === 'back' ? { onBack: onCancel } : { onClose: onCancel })} onDismiss={onDismiss ?? onCancel} foot={<Primary label="Save" onClick={() => onSave(start, end)} disabled={!valid || !!tooEarly} />}>
      <div className="big">{days} {days === 1 ? 'day' : 'days'}</div>
      <div className="big-sub" style={over ? { color: 'var(--coral-text)' } : undefined}>{sub}</div>
      {done && <div className="done-note">This stay is done. Change the dates only if you arrived or left on a different day.</div>}
      <div className="card" style={{ marginTop: 20 }}>
        <DateRow k="Arrive" value={start} today={today} onChange={(d) => { setStart(d); if (toNum(end) < toNum(d)) setEnd(d) }} />
        <DateRow k="Leave" value={end} today={today} min={start} onChange={setEnd} />
      </div>
      {!done && (
        <div className="note">
          Match these to your flights.
          {hasNext && valid && !over && <><br />Stay {index + 2} can start from {fmtWeekday(addDays(end, 1), today)}.</>}
        </div>
      )}
    </Sheet>
  )
}
