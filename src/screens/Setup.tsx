import { useState } from 'react'
import { Profile } from '../lib/plan'
import { COUNTRIES, PASSPORTS } from '../lib/rules'
import { Chevron, Plus } from '../components/Icons'
import { PageHead } from '../components/ui'
import { ExportKind } from './Trips'

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
    <div className="first">
      <div className="first-name">Stay Counter</div>
      <div className="first-mid">
        <h1 className="first-title">Know your days<br />in China.</h1>
        <p className="first-sub">We use your passport and home to find the rules that apply to you.</p>
        <PassportCard p={p} setP={setP} />
        <PickCard k="Home" value={p.home} options={HOMES} onChange={(v) => setP({ ...p, home: v })} />
      </div>
      <button className="btn primary" disabled={!p.passport || !p.home} onClick={() => onDone(p)}>Continue</button>
    </div>
  )
}

type SettingsProps = {
  profile: Profile
  trips: number
  onProfile: (p: Profile) => void
  onExport: (k: ExportKind) => void
  onClear: () => void
  onReset: () => void
  onDesign: () => void
}

/** Settings is a tab, like SaySay and Manna. Same background, a light title, white cards. */
export function Settings({ profile, trips, onProfile, onExport, onClear, onReset, onDesign }: SettingsProps) {
  return (
    <main className="tv">
      <PageHead title="Settings" />
      <div className="tv-body">
        <h2 className="sec" style={{ paddingTop: 8 }}>You</h2>
        <div style={{ marginTop: -12 }}><PassportCard p={profile} setP={onProfile} /></div>
        <PickCard k="Home" value={profile.home} options={HOMES} onChange={(v) => onProfile({ ...profile, home: v })} />

        <h2 className="sec">Your trips</h2>
        <div className="card">
          <button className="row" onClick={() => onExport('All')} disabled={!trips}><span className="label">Export all trips</span><span className="s">{trips}<Chevron /></span></button>
          <button className="row" onClick={() => onExport('Business')} disabled={!trips}><span className="label">Export business trips</span><Chevron /></button>
        </div>
        <div className="note">A spreadsheet with dates and days, for tax or HR.</div>

        <h2 className="sec">About</h2>
        <div className="card">
          <button className="row" onClick={onDesign}><span className="label">Design system</span><Chevron /></button>
        </div>
        <div className="note">Your trips stay on this device only. General information, not legal or tax advice.</div>

        {/* Destructive actions go last, grouped in one card. They always ask first. */}
        <div className="card" style={{ marginTop: 40 }}>
          <button className="row" onClick={() => confirm('Remove all trips?') && onClear()}><span className="label" style={{ color: 'var(--coral-text)' }}>Remove all trips</span></button>
          <button className="row" onClick={() => confirm('Start over from the first screen? This removes everything.') && onReset()}><span className="label" style={{ color: 'var(--coral-text)' }}>Start over</span></button>
        </div>
      </div>
    </main>
  )
}
