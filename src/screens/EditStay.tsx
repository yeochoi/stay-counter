import { useState } from 'react'
import { addDays, Day, daysInclusive, fmtDate, fmtLong, fmtWeekday, toNum } from '../lib/dates'
import { daysPerEntry, entryEnds, isBooked, legs, Profile, Trip } from '../lib/plan'
import { shortName } from '../lib/rules'
import { DateRow, Primary, Sheet, Switch } from '../components/ui'
import { Alert } from '../components/Icons'

/** Change one stay, or say it is booked. Later stays move along. Booked is only ever what the person says. */
export function EditStay({ trip, profile, index, today, nav = 'close', onCancel, onSave, onDismiss }: { trip: Trip; profile: Profile; index: number; today: Day; nav?: 'close' | 'back'; onCancel: () => void; onSave: (start: Day, end: Day, booked: boolean) => void; onDismiss?: () => void }) {
  const ls = legs(trip, profile)
  const leg = ls[index]
  // A finished stay can still be corrected, for example if you left earlier than planned.
  const done = toNum(leg.end) < toNum(today)
  const [start, setStart] = useState(leg.start)
  const [end, setEnd] = useState(leg.end)
  const [booked, setBooked] = useState(isBooked(trip, ls, index))
  const started = toNum(leg.start) <= toNum(today)
  const ends = entryEnds(trip, profile)
  const late = !!ends && toNum(end) > toNum(ends)
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
    <Sheet title={ls.length > 1 ? `Stay ${index + 1} of ${ls.length}` : shortName(trip.country)} {...(nav === 'back' ? { onBack: onCancel } : { onClose: onCancel })} onDismiss={onDismiss ?? onCancel} foot={<Primary label="Save" onClick={() => onSave(start, end, booked)} disabled={!valid || !!tooEarly} />}>
      <div className="big">{days} {days === 1 ? 'day' : 'days'}</div>
      <div className="big-sub" style={over ? { color: 'var(--coral-text)' } : undefined}>{sub}</div>
      {done && <div className="done-note">This stay is done. Change the dates only if you arrived or left on a different day.</div>}
      {late && ends && (
        <div className="warn">
          <Alert />
          <div>{toNum(start) > toNum(ends)
            ? (trip.entry.kind === 'visa' ? `This stay is after your visa ends on ${fmtLong(ends)}.` : `This stay is after visa free entry ends on ${fmtLong(ends)}. You need a visa for it.`)
            : (trip.entry.kind === 'visa' ? `This stay goes past the day your visa ends, ${fmtLong(ends)}.` : `This stay goes past the day visa free entry ends, ${fmtLong(ends)}. You need a visa for the days after it.`)}</div>
        </div>
      )}
      <div className="card" style={{ marginTop: 20 }}>
        <DateRow k="Arrive" value={start} today={today} onChange={(d) => { setStart(d); if (toNum(end) < toNum(d)) setEnd(d) }} />
        <DateRow k="Leave" value={end} today={today} min={start} onChange={setEnd} />
        {!started && <Switch label="I booked travel for this stay" on={booked} onChange={setBooked} />}
      </div>
      {!done && hasNext && valid && !over && (
        <div className="note">Stay {index + 2} can start from {fmtWeekday(addDays(end, 1), today)}.</div>
      )}
    </Sheet>
  )
}
