import { useState } from 'react'
import { Day, todayDay } from '../lib/dates'
import { Profile } from '../lib/plan'
import { COUNTRIES, PASSPORTS } from '../lib/rules'
import { Chevron, Plus } from '../components/Icons'
import { DateRow, Sec, Sheet } from '../components/ui'

const HOMES = [...new Set([...COUNTRIES, 'Netherlands', 'South Korea'])].sort()

function PickCard({ k, value, options, onChange, extra }: { k: string; value: string; options: readonly string[]; onChange: (v: string) => void; extra?: React.ReactNode }) {
  return (
    <div className="card" style={{ marginTop: 12 }}>
      <label className="row two">
        <span className="field"><span className="k">{k}</span>{value ? <span className="t">{value}</span> : <span className="t" style={{ color: 'var(--muted)', fontWeight: 400 }}>Choose</span>}</span>
        <Chevron />
        <select aria-label={k} value={value} onChange={(e) => onChange(e.target.value)}>
          {!value && <option value="" disabled>Choose</option>}
          {options.map((o) => <option key={o}>{o}</option>)}
        </select>
      </label>
      {extra}
    </div>
  )
}

function PassportCard({ p, setP }: { p: Profile; setP: (p: Profile) => void }) {
  const second = PASSPORTS.filter((x) => x !== p.passport)
  return (
    <PickCard
      k="Passport"
      value={p.passport}
      options={PASSPORTS}
      onChange={(v) => setP({ ...p, passport: v, passport2: p.passport2 === v ? undefined : p.passport2 })}
      extra={
        !p.passport ? null : p.passport2 ? (
          <label className="row two">
            <span className="field"><span className="k">Second passport</span><span className="t">{p.passport2}</span></span>
            <Chevron />
            <select aria-label="Second passport" value={p.passport2} onChange={(e) => setP({ ...p, passport2: e.target.value || undefined })}>
              <option value="">None</option>
              {second.map((o) => <option key={o}>{o}</option>)}
            </select>
          </label>
        ) : (
          <button className="row link-row" onClick={() => setP({ ...p, passport2: second[0] })}><Plus size={18} color="#4B32B8" />Add second passport</button>
        )
      }
    />
  )
}

export function Onboarding({ onDone }: { onDone: (p: Profile) => void }) {
  const [p, setP] = useState<Profile>({ passport: '', home: '' })
  return (
    <div className="welcome">
      <header className="hero w-intro">
        <div className="eyebrow">Stay Counter</div>
        <h1>Know your days,<br /><span style={{ color: 'var(--hero-text)' }}>Wherever you are</span></h1>
        <div className="chips"><span>Visa free limits</span><span>Tax days</span><span>Leave by dates</span></div>
      </header>
      <main className="content w-form">
        <div style={{ fontSize: 15, color: 'var(--muted)' }}>We use these to find the rules that apply to you.</div>
        <div style={{ marginTop: 2 }}><PassportCard p={p} setP={setP} /></div>
        <PickCard k="Home" value={p.home} options={HOMES} onChange={(v) => setP({ ...p, home: v })} />
        <div className="w-gap" />
        <button className="btn primary" disabled={!p.passport || !p.home} onClick={() => onDone(p)}>Continue</button>
      </main>
    </div>
  )
}

type SettingsProps = {
  profile: Profile
  previewDate?: Day
  onProfile: (p: Profile) => void
  onPreview: (d?: Day) => void
  onSample: () => void
  onClear: () => void
  onReset: () => void
  onDesign: () => void
  onClose: () => void
}

export function Settings({ profile, previewDate, onProfile, onPreview, onSample, onClear, onReset, onDesign, onClose }: SettingsProps) {
  const real = todayDay()
  return (
    <Sheet title="Settings" foot={<button className="btn primary" onClick={onClose}>Done</button>}>
      <Sec>You</Sec>
      <div style={{ marginTop: -12 }}><PassportCard p={profile} setP={onProfile} /></div>
      <PickCard k="Home" value={profile.home} options={HOMES} onChange={(v) => onProfile({ ...profile, home: v })} />

      <Sec>Testing</Sec>
      <div className="card">
        <DateRow k="Pretend today is" value={previewDate ?? real} today={previewDate ?? real} onChange={(d) => onPreview(d === real ? undefined : d)} />
        <button className="row" onClick={() => onPreview('2026-10-15')}><span className="k">Before the China trip</span><span className="v">Oct 15<Chevron /></span></button>
        <button className="row" onClick={() => onPreview('2026-11-22')}><span className="k">During stay 1</span><span className="v">Nov 22<Chevron /></span></button>
        <button className="row" onClick={() => onPreview('2026-12-01')}><span className="k">Between stays</span><span className="v">Dec 1<Chevron /></span></button>
        {previewDate && <button className="row" onClick={() => onPreview(undefined)}><span className="k">Use the real date</span><span className="v">{real.slice(5).replace('-', '/')}<Chevron /></span></button>}
      </div>
      <div className="card" style={{ marginTop: 12 }}>
        <button className="row" onClick={onSample}><span className="t" style={{ color: 'var(--purple-text)' }}>Load sample trips</span></button>
        <button className="row" onClick={() => confirm('Remove all trips?') && onClear()}><span className="t" style={{ color: 'var(--coral-text)' }}>Remove all trips</span></button>
        <button className="row" onClick={() => confirm('Start over from the first screen? This removes everything.') && onReset()}><span className="t" style={{ color: 'var(--coral-text)' }}>Start over</span></button>
      </div>

      <Sec>About</Sec>
      <div className="card">
        <button className="row" onClick={onDesign}><span className="k">Design system</span><Chevron /></button>
      </div>
      <div className="note">Your trips stay on this device only. General information, not legal or tax advice.</div>
    </Sheet>
  )
}
