import { useState } from 'react'
import { Day, fmtDate, fmtRange, toNum } from '../lib/dates'
import { daysIn, daysPerEntry, editStay, Entry, legs, newId, Profile, Trip, warnings } from '../lib/plan'
import { COUNTRIES, entryRule, shortName, taxRule } from '../lib/rules'
import { Alert, Check, Chevron } from '../components/Icons'
import { DateRow, Primary, Sec, Seg, SelectRow, Sheet } from '../components/ui'
import { EditStay } from './EditStay'

type Props = {
  profile: Profile
  trips: Trip[]
  today: Day
  existing?: Trip
  startBooked?: boolean
  onClose: () => void
  onSave: (t: Trip) => void
  /** Save without closing, used on the trip overview. */
  onUpdate: (t: Trip) => void
  onDelete: (id: string) => void
}

type Step = { kind: 'overview' } | { kind: 'form' } | { kind: 'visa' } | { kind: 'plan' } | { kind: 'stay'; index: number; from: 'plan' | 'overview' }

const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const long = (d: Day) => { const [y, m, dd] = d.split('-').map(Number); return `${M[m - 1]} ${dd}, ${y}` }

export function TripFlow({ profile, trips, today, existing, startBooked, onClose, onSave, onUpdate, onDelete }: Props) {
  const [trip, setTrip] = useState<Trip>(
    () => existing ?? { id: newId(), country: '', start: '', end: '', entry: { kind: 'visafree' }, type: 'Business', booked: !!startBooked },
  )
  // A saved trip opens on its overview. Editing is a choice.
  const [step, setStep] = useState<Step>(existing ? { kind: 'overview' } : { kind: 'form' })
  const [saved, setSaved] = useState<Trip | undefined>(existing)
  // A new trip starts empty. Entry and type count as picked once the person taps them.
  const [entryPicked, setEntryPicked] = useState(!!existing)
  const [typePicked, setTypePicked] = useState(!!existing)
  const others = trips.filter((t) => t.id !== trip.id)

  // Changing dates, country or entry brings back the suggested stays.
  const change = (p: Partial<Trip>) => setTrip((t) => ({ ...t, ...p, stays: undefined }))

  if (step.kind === 'visa') return <VisaStep entry={trip.entry} today={today} onCancel={() => setStep({ kind: 'form' })} onSave={(e) => { change({ entry: e }); setEntryPicked(true); setStep({ kind: 'form' }) }} />

  if (step.kind === 'stay') {
    return (
      <EditStay
        trip={trip}
        profile={profile}
        index={step.index}
        today={today}
        nav="back"
        onCancel={() => setStep({ kind: step.from })}
        onSave={(s, e) => {
          const next = editStay(trip, profile, step.index, s, e)
          setTrip(next)
          if (step.from === 'overview') { setSaved(next); onUpdate(next) }
          setStep({ kind: step.from })
        }}
      />
    )
  }

  if (step.kind === 'overview' && saved) {
    const max = daysPerEntry(trip, profile)
    return (
      <Sheet title={shortName(trip.country)} onClose={onClose} action={{ label: 'Edit', onClick: () => setStep({ kind: 'form' }) }}>
        <Summary trip={trip} profile={profile} max={max} />
        <div className="card" style={{ marginTop: 20 }}>
          <div className="row small"><span className="k">Dates</span><span className="v">{fmtRange(trip.start, trip.end, today)}</span></div>
          <div className="row small"><span className="k">Status</span><span className="v">{trip.booked ? 'Booked' : 'Planning'}</span></div>
          <div className="row small"><span className="k">Entry</span><span className="v">{trip.entry.kind === 'visafree' ? 'Visa free' : `Visa, ${trip.entry.days} days`}</span></div>
          <div className="row small"><span className="k">Type</span><span className="v">{trip.type}</span></div>
        </div>
        <Sec>Stays</Sec>
        <StayList trip={trip} profile={profile} today={today} others={others} onStay={(i) => setStep({ kind: 'stay', index: i, from: 'overview' })} />
        <div className="note" style={{ textAlign: 'center', paddingTop: 20 }}>Not legal advice.</div>
      </Sheet>
    )
  }

  if (step.kind === 'plan') {
    const max = daysPerEntry(trip, profile)
    return (
      <Sheet title={shortName(trip.country)} onBack={() => setStep({ kind: 'form' })} foot={<><div className="note" style={{ textAlign: 'center', padding: '0 0 12px' }}>Not legal advice.</div><Primary label="Save trip" onClick={() => onSave(trip)} /></>}>
        <Summary trip={trip} profile={profile} max={max} />
        <div style={{ height: 20 }} />
        <StayList trip={trip} profile={profile} today={today} others={others} onStay={(i) => setStep({ kind: 'stay', index: i, from: 'plan' })} />
      </Sheet>
    )
  }

  // Form
  const rule = entryRule(profile.passport, trip.country)
  const tax = taxRule(trip.country)
  const visa = entryPicked && trip.entry.kind === 'visa' ? trip.entry : undefined
  const valid = !!trip.country && !!trip.start && !!trip.end && toNum(trip.end) >= toNum(trip.start) && entryPicked && typePicked
  return (
    <Sheet
      title={saved ? 'Edit trip' : 'New trip'}
      {...(saved ? { onBack: () => { setTrip(saved); setStep({ kind: 'overview' }) } } : { onClose })}
      foot={saved
        ? <Primary label="Save" onClick={() => { setSaved(trip); onUpdate(trip); setStep({ kind: 'overview' }) }} disabled={!valid} />
        : <Primary label="See stays" onClick={() => setStep({ kind: 'plan' })} disabled={!valid} />}
    >
      <div style={{ marginTop: 6 }}>
        <Seg label="Status" value={trip.booked ? 'Booked' : 'Planning'} options={['Planning', 'Booked']} onChange={(v) => setTrip((t) => ({ ...t, booked: v === 'Booked' }))} />
      </div>
      <div className="card" style={{ marginTop: 14 }}>
        <SelectRow k="Country" value={trip.country} options={COUNTRIES} onChange={(c) => change({ country: c })} />
        <DateRow k="Arrive" value={trip.start} today={today} onChange={(d) => change({ start: d, end: trip.end && toNum(trip.end) < toNum(d) ? d : trip.end })} />
        <DateRow k="Leave" value={trip.end} today={today} min={trip.start} onChange={(d) => change({ end: d })} />
      </div>
      <Sec>Entry</Sec>
      <div className="card">
        <button className="row" onClick={() => { change({ entry: { kind: 'visafree' } }); setEntryPicked(true) }}>
          <span className="t">Visa free</span>{entryPicked && !visa && <Check />}
        </button>
        <button className="row" onClick={() => setStep({ kind: 'visa' })}>
          <span className="t">With a visa</span>
          <span className="s">{visa ? <>{visa.days} days, {visa.multiple ? 'multiple' : 'single'}<Check /></> : <Chevron />}</span>
        </button>
      </div>
      <Sec>Type</Sec>
      <Seg label="Type" value={typePicked ? trip.type : ''} options={['Business', 'Personal']} onChange={(v) => { setTrip((t) => ({ ...t, type: v })); setTypePicked(true) }} />
      {trip.country && <>
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
      </>}
      {saved && <button className="text-btn" style={{ marginTop: 20, alignSelf: 'center' }} onClick={() => { if (confirm('Delete this trip?')) onDelete(saved.id) }}>Delete trip</button>}
    </Sheet>
  )
}


function VisaStep({ entry, today, onCancel, onSave }: { entry: Entry; today: Day; onCancel: () => void; onSave: (e: Entry) => void }) {
  const init = entry.kind === 'visa' ? entry : undefined
  const [days, setDays] = useState(init ? String(init.days) : '')
  const [until, setUntil] = useState<Day>(init?.validUntil ?? '')
  const [multiple, setMultiple] = useState<boolean | undefined>(init?.multiple)
  const n = parseInt(days, 10)
  const ok = n > 0 && n < 1000 && !!until && multiple !== undefined
  return (
    <Sheet title="Your visa" onBack={onCancel} foot={<Primary label="Save" onClick={() => onSave({ kind: 'visa', days: n, validUntil: until, multiple: !!multiple })} disabled={!ok} />}>
      <div className="note" style={{ padding: '16px 4px 0' }}>As printed on your visa.</div>
      <div className="card" style={{ marginTop: 8 }}>
        <label className="row">
          <span className="k">Days per stay</span>
          <input className="num" inputMode="numeric" placeholder="Enter" value={days} onChange={(e) => setDays(e.target.value.replace(/\D/g, ''))} aria-label="Days per stay" />
        </label>
        <DateRow k="Valid until" value={until} today={today} onChange={setUntil} />
      </div>
      <Sec>Entries</Sec>
      <Seg label="Entries" value={multiple === undefined ? '' : multiple ? 'Multiple' : 'Single'} options={['Single', 'Multiple']} onChange={(v) => setMultiple(v === 'Multiple')} />
      {ok && (
        <div className="note">
          {multiple
            ? `Each stay can last up to ${n} days. Leave and come back as often as you like until ${long(until)}.`
            : `One stay of up to ${n} days, before ${fmtDate(until, today)}.`}
        </div>
      )}
    </Sheet>
  )
}

function Summary({ trip, profile, max }: { trip: Trip; profile: Profile; max?: number }) {
  const exits = legs(trip, profile).length - 1
  const n = daysIn(trip, profile)
  return (
    <>
      <div className="big">{exits === 0 ? 'No need to leave' : `Leave ${exits === 1 ? 'once' : `${exits} times`}`}</div>
      <div className="big-sub">{`${n} ${n === 1 ? 'day' : 'days'} in ${shortName(trip.country)}. `}{max ? `${trip.entry.kind === 'visafree' ? 'Visa free' : 'Your visa'} allows ${max} days per entry` : 'No entry limit we know of'}</div>
    </>
  )
}

function StayList({ trip, profile, today, others, onStay }: { trip: Trip; profile: Profile; today: Day; others: Trip[]; onStay: (i: number) => void }) {
  const ls = legs(trip, profile)
  const warns = warnings(trip, others, profile)
  const suggested = ls.length > 1 && ls.some((l) => !l.edited)
  return (
    <>
      <div className="card" style={{ padding: '0 16px' }}>
        {ls.map((l, i) => (
          <button key={i} className="stay-row" onClick={() => onStay(i)}>
            <span className="tl" aria-hidden="true"><i className={i === 0 ? 'off' : ''} /><b /><i className={i === ls.length - 1 ? 'off' : ''} /></span>
            <span className="in">
              <span className="t" style={{ fontSize: 17, fontWeight: 600 }}>{fmtRange(l.start, l.end, today)}</span>
              <span className="s" style={{ fontSize: 15, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>{l.edited && <Check />}{l.days} {l.days === 1 ? 'day' : 'days'}<Chevron /></span>
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
    </>
  )
}
