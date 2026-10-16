import { useState } from 'react'
import { addDays, Day, fmtDate, fmtRange, fmtWeekday, plural, toNum } from '../lib/dates'
import { daysPerEntry, Entry, legs, newId, Profile, Trip, warnings } from '../lib/plan'
import { COUNTRIES, entryRule } from '../lib/rules'
import { Check, ChevronRight } from '../components/Icons'
import { Segmented, Sheet, Warnings } from '../components/ui'

type Step = 'form' | 'visa' | 'plan'

type Props = {
  profile: Profile
  trips: Trip[]
  today: Day
  /** An existing trip to view, or undefined for a new one. */
  existing?: Trip
  startBooked?: boolean
  onClose: () => void
  onSave: (t: Trip) => void
  onDelete: (id: string) => void
}

export function TripFlow({ profile, trips, today, existing, startBooked, onClose, onSave, onDelete }: Props) {
  const [step, setStep] = useState<Step>(existing ? 'plan' : 'form')
  const [trip, setTrip] = useState<Trip>(
    existing ?? {
      id: newId(),
      country: 'China',
      start: addDays(today, 14),
      end: addDays(today, 43),
      entry: { kind: 'visafree' },
      type: 'Business',
      booked: !!startBooked,
    },
  )
  const [visa, setVisa] = useState<Extract<Entry, { kind: 'visa' }>>(
    trip.entry.kind === 'visa' ? trip.entry : { kind: 'visa', days: 90, validUntil: addDays(today, 365), multiple: true },
  )
  const set = (p: Partial<Trip>) => setTrip((t) => ({ ...t, ...p }))
  const valid = toNum(trip.end) >= toNum(trip.start)

  if (step === 'visa') {
    return (
      <Sheet
        title="Your visa"
        left={{ label: 'Back', back: true, onClick: () => setStep('form') }}
        right={{ label: 'Done', done: true, onClick: () => { set({ entry: visa }); setStep('form') } }}
      >
        <div className="body muted" style={{ lineHeight: 1.5, paddingTop: 14 }}>As printed on your visa.</div>
        <div className="group" style={{ marginTop: 20 }}>
          <label className="group-row" htmlFor="days">
            <span className="k">Days per stay</span>
            <input
              id="days" className="num" inputMode="numeric" value={visa.days || ''}
              onChange={(e) => setVisa({ ...visa, days: Number(e.target.value.replace(/\D/g, '')) || 0 })}
            />
          </label>
          <label className="group-row">
            <span className="k">Valid until</span>
            <span className="v">{fmtDate(visa.validUntil, today)}</span>
            <input type="date" aria-label="Valid until" value={visa.validUntil} onChange={(e) => e.target.value && setVisa({ ...visa, validUntil: e.target.value })} />
          </label>
        </div>
        <div className="label form-label">Entries</div>
        <Segmented label="Entries" options={['Single', 'Multiple'] as const} value={visa.multiple ? 'Multiple' : 'Single'} onChange={(v) => setVisa({ ...visa, multiple: v === 'Multiple' })} />
      </Sheet>
    )
  }

  if (step === 'plan') {
    const ls = legs(trip, profile)
    const per = daysPerEntry(trip, profile)
    const exits = ls.length - 1
    const others = trips.filter((t) => t.id !== trip.id)
    const warn = warnings(trip, others, profile).map((w) => w.text)
    const answer = exits === 0 ? `Stay all ${plural(ls[0].days, 'day')}` : `Leave ${exits === 1 ? 'once' : `${exits} times`}`
    const reason = !per
      ? `No limit we know of for ${trip.country}`
      : trip.entry.kind === 'visa'
        ? `Your visa allows ${per} days per entry`
        : `Visa free allows ${per} days per entry`
    const isSaved = trips.some((t) => t.id === trip.id) && JSON.stringify(trip) === JSON.stringify(existing)

    return (
      <Sheet
        title={trip.country}
        left={existing ? undefined : { label: 'Back', back: true, onClick: () => setStep('form') }}
        right={{ label: 'Close', onClick: onClose }}
      >
        <div className="title" style={{ paddingTop: 14 }}>{answer}</div>
        <div className="body muted" style={{ paddingTop: 6 }}>{reason}</div>
        <div style={{ paddingTop: 18 }}>
          {ls.map((l, i) => (
            <div key={l.start} className="step">
              <div className="n">{i + 1}</div>
              <div className="r">{fmtRange(l.start, l.end, today)}</div>
              <div className="d">{plural(l.days, 'day')}</div>
            </div>
          ))}
        </div>
        <Warnings items={warn} />
        <div className="spacer" style={{ minHeight: 24 }} />
        {isSaved ? (
          <div className="stack">
            <button className="btn secondary" onClick={() => setStep('form')}>Edit trip</button>
            <button className="btn" style={{ color: 'var(--secondary-ink)', background: 'transparent' }} onClick={() => onDelete(trip.id)}>Delete trip</button>
          </div>
        ) : (
          <button className="btn primary" onClick={() => onSave(trip)}>Save trip</button>
        )}
        <div className="footnote">Not legal or tax advice.</div>
      </Sheet>
    )
  }

  const rule = entryRule(profile.passport, trip.country)
  return (
    <Sheet title={existing ? 'Edit trip' : 'New trip'} left={{ label: 'Cancel', onClick: existing ? () => { setTrip(existing); setStep('plan') } : onClose }}>
      <div style={{ marginTop: 6 }}>
        <Segmented label="Trip status" options={['Planning', 'Booked'] as const} value={trip.booked ? 'Booked' : 'Planning'} onChange={(v) => set({ booked: v === 'Booked' })} />
      </div>
      <div className="group" style={{ marginTop: 22 }}>
        <label className="group-row">
          <span className="k">Country</span>
          <span className="v">{trip.country}</span>
          <select aria-label="Country" value={trip.country} onChange={(e) => set({ country: e.target.value })}>
            {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label className="group-row">
          <span className="k">Arrive</span>
          <span className="v">{fmtWeekday(trip.start, today)}</span>
          <input type="date" aria-label="Arrive" value={trip.start} onChange={(e) => e.target.value && set({ start: e.target.value })} />
        </label>
        <label className="group-row">
          <span className="k">Leave</span>
          <span className="v" style={valid ? undefined : { color: 'var(--secondary-ink)' }}>{fmtWeekday(trip.end, today)}</span>
          <input type="date" aria-label="Leave" value={trip.end} onChange={(e) => e.target.value && set({ end: e.target.value })} />
        </label>
      </div>

      <div className="label form-label">Entry</div>
      <div className="group">
        <button className="group-row" onClick={() => set({ entry: { kind: 'visafree' } })} aria-pressed={trip.entry.kind === 'visafree'}>
          <span className="k">Visa free</span>
          <span className="v">
            {!rule.visaFreeDays && <span>Not known</span>}
            {trip.entry.kind === 'visafree' && <Check />}
          </span>
        </button>
        <button className="group-row" onClick={() => setStep('visa')}>
          <span className="k">With a visa</span>
          <span className="v">
            {trip.entry.kind === 'visa' ? <>{trip.entry.days} days <Check /></> : <ChevronRight />}
          </span>
        </button>
      </div>

      <div className="label form-label">Type</div>
      <Segmented label="Type" options={['Business', 'Personal'] as const} value={trip.type} onChange={(v) => set({ type: v })} />

      <div className="spacer" style={{ minHeight: 24 }} />
      <button className="btn primary" disabled={!valid} onClick={() => setStep('plan')}>See plan</button>
    </Sheet>
  )
}
