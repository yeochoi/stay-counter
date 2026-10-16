import { useState } from 'react'
import { addDays, Day, fmtDate, fmtRange, toNum } from '../lib/dates'
import { daysPerEntry, editStay, Entry, legs, newId, Profile, Trip, warnings } from '../lib/plan'
import { COUNTRIES, entryRule, shortName, taxRule } from '../lib/rules'
import { Alert, Check, Chevron } from '../components/Icons'
import { Actions, DateRow, Sec, Seg, SelectRow, Sheet } from '../components/ui'
import { EditStay } from './EditStay'

type Props = {
  profile: Profile
  trips: Trip[]
  today: Day
  existing?: Trip
  startBooked?: boolean
  onClose: () => void
  onSave: (t: Trip) => void
  onDelete: (id: string) => void
}

type Step = { kind: 'form' } | { kind: 'visa' } | { kind: 'plan' } | { kind: 'stay'; index: number }

const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const long = (d: Day) => { const [y, m, dd] = d.split('-').map(Number); return `${M[m - 1]} ${dd}, ${y}` }

export function TripFlow({ profile, trips, today, existing, startBooked, onClose, onSave, onDelete }: Props) {
  const [trip, setTrip] = useState<Trip>(
    () => existing ?? { id: newId(), country: 'China', start: addDays(today, 17), end: addDays(today, 167), entry: { kind: 'visafree' }, type: 'Business', booked: !!startBooked },
  )
  const [step, setStep] = useState<Step>({ kind: 'form' })
  const others = trips.filter((t) => t.id !== trip.id)

  // Changing dates, country or entry brings back the suggested stays.
  const change = (p: Partial<Trip>) => setTrip((t) => ({ ...t, ...p, stays: undefined }))

  if (step.kind === 'visa') return <VisaStep entry={trip.entry} today={today} onCancel={() => setStep({ kind: 'form' })} onSave={(e) => { change({ entry: e }); setStep({ kind: 'form' }) }} />

  if (step.kind === 'stay') {
    return (
      <EditStay
        trip={trip}
        profile={profile}
        index={step.index}
        today={today}
        onCancel={() => setStep({ kind: 'plan' })}
        onSave={(s, e) => { setTrip((t) => editStay(t, profile, step.index, s, e)); setStep({ kind: 'plan' }) }}
      />
    )
  }

  if (step.kind === 'plan') {
    const ls = legs(trip, profile)
    const max = daysPerEntry(trip, profile)
    const warns = warnings(trip, others, profile)
    const exits = ls.length - 1
    const suggested = ls.some((l) => !l.edited)
    return (
      <Sheet title={shortName(trip.country)} foot={<><div className="note" style={{ textAlign: 'center', padding: '0 0 12px' }}>Not legal advice.</div><Actions left="Back" right={existing ? 'Save' : 'Save trip'} onLeft={() => setStep({ kind: 'form' })} onRight={() => onSave(trip)} /></>}>
        <div className="big">{exits === 0 ? 'No need to leave' : `Leave ${exits === 1 ? 'once' : `${exits} times`}`}</div>
        <div className="big-sub">{max ? `${trip.entry.kind === 'visafree' ? 'Visa free' : 'Your visa'} allows ${max} days per entry` : 'No entry limit we know of'}</div>
        <div className="card" style={{ marginTop: 20, padding: '0 16px' }}>
          {ls.map((l, i) => (
            <button key={i} className="stay-row" onClick={() => setStep({ kind: 'stay', index: i })}>
              <span className="tl" aria-hidden="true"><i className={i === 0 ? 'off' : ''} /><b /><i className={i === ls.length - 1 ? 'off' : ''} /></span>
              <span className="in">
                <span className="t" style={{ fontSize: 17, fontWeight: 600 }}>{fmtRange(l.start, l.end, today)}</span>
                <span className="s" style={{ fontSize: 15, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>{l.edited && <Check />}{l.days} days<Chevron /></span>
              </span>
            </button>
          ))}
        </div>
        {suggested && <div className="note">Suggested dates. Tap a stay to match your flights.</div>}
        {warns.length > 0 && (
          <div className="warn">
            <Alert />
            <div>{warns.map((w, i) => (i === 0 ? <b key={w.id}>{w.text}</b> : <div key={w.id}>{w.text}</div>))}</div>
          </div>
        )}
      </Sheet>
    )
  }

  // Form
  const rule = entryRule(profile.passport, trip.country)
  const tax = taxRule(trip.country)
  const visa = trip.entry.kind === 'visa' ? trip.entry : undefined
  const valid = toNum(trip.end) >= toNum(trip.start)
  return (
    <Sheet title={existing ? shortName(existing.country) : 'New trip'} foot={<Actions left="Cancel" right="See plan" onLeft={onClose} onRight={() => setStep({ kind: 'plan' })} disabled={!valid} />}>
      <div style={{ marginTop: 6 }}>
        <Seg label="Status" value={trip.booked ? 'Booked' : 'Planning'} options={['Planning', 'Booked']} onChange={(v) => setTrip((t) => ({ ...t, booked: v === 'Booked' }))} />
      </div>
      <div className="card" style={{ marginTop: 14 }}>
        <SelectRow k="Country" value={trip.country} options={COUNTRIES} onChange={(c) => change({ country: c })} />
        <DateRow k="Arrive" value={trip.start} today={today} onChange={(d) => change({ start: d, end: toNum(trip.end) < toNum(d) ? d : trip.end })} />
        <DateRow k="Leave" value={trip.end} today={today} min={trip.start} onChange={(d) => change({ end: d })} />
      </div>
      <Sec>Entry</Sec>
      <div className="card">
        <button className="row" onClick={() => change({ entry: { kind: 'visafree' } })}>
          <span className="t">Visa free</span>{!visa && <Check />}
        </button>
        <button className="row" onClick={() => setStep({ kind: 'visa' })}>
          <span className="t">With a visa</span>
          <span className="s">{visa ? <>{visa.days} days, {visa.multiple ? 'multiple' : 'single'}<Check /></> : <Chevron />}</span>
        </button>
      </div>
      <Sec>Type</Sec>
      <Seg label="Type" value={trip.type} options={['Business', 'Personal']} onChange={(v) => setTrip((t) => ({ ...t, type: v }))} />
      <Sec>Rules for this trip</Sec>
      <div className="card">
        <div className="row small"><span className="k">Stay per entry</span><span className="v">{visa ? `${visa.days} days` : rule.visaFreeDays ? `${rule.visaFreeDays} days` : 'Visa needed'}</span></div>
        {visa ? (
          <div className="row small"><span className="k">Visa valid until</span><span className="v">{long(visa.validUntil)}</span></div>
        ) : rule.visaFreeUntil ? (
          <div className="row small"><span className="k">Visa free until</span><span className="v">{long(rule.visaFreeUntil)}</span></div>
        ) : null}
        <div className="row small"><span className="k">Tax limit</span><span className="v">{tax.days} days {tax.window === 'calendar' ? 'a year' : 'in 12 months'}</span></div>
      </div>
      {existing && <button className="text-btn" style={{ marginTop: 12 }} onClick={() => { if (confirm('Delete this trip?')) onDelete(existing.id) }}>Delete trip</button>}
    </Sheet>
  )
}


function VisaStep({ entry, today, onCancel, onSave }: { entry: Entry; today: Day; onCancel: () => void; onSave: (e: Entry) => void }) {
  const init = entry.kind === 'visa' ? entry : { kind: 'visa' as const, days: 90, validUntil: addDays(today, 365), multiple: true }
  const [days, setDays] = useState(String(init.days))
  const [until, setUntil] = useState(init.validUntil)
  const [multiple, setMultiple] = useState(init.multiple)
  const n = parseInt(days, 10)
  const ok = n > 0 && n < 1000
  return (
    <Sheet title="Your visa" foot={<Actions left="Cancel" right="Save" onLeft={onCancel} onRight={() => onSave({ kind: 'visa', days: n, validUntil: until, multiple })} disabled={!ok} />}>
      <div className="note" style={{ padding: '16px 4px 0' }}>As printed on your visa.</div>
      <div className="card" style={{ marginTop: 8 }}>
        <label className="row">
          <span className="k">Days per stay</span>
          <input className="num" inputMode="numeric" value={days} onChange={(e) => setDays(e.target.value.replace(/\D/g, ''))} aria-label="Days per stay" />
        </label>
        <DateRow k="Valid until" value={until} today={today} onChange={setUntil} />
      </div>
      <Sec>Entries</Sec>
      <Seg label="Entries" value={multiple ? 'Multiple' : 'Single'} options={['Single', 'Multiple']} onChange={(v) => setMultiple(v === 'Multiple')} />
      <div className="note">
        {multiple
          ? `Each stay can last up to ${ok ? n : '…'} days. Leave and come back as often as you like until ${long(until)}.`
          : `One stay of up to ${ok ? n : '…'} days, before ${fmtDate(until, today)}.`}
      </div>
    </Sheet>
  )
}
