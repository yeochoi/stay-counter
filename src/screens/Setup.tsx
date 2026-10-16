import { useState } from 'react'
import { Profile } from '../lib/plan'
import { COUNTRIES, PASSPORTS } from '../lib/rules'
import { ChevronRight, Globe } from '../components/Icons'
import { Sheet } from '../components/ui'

const HOMES = [...new Set([...COUNTRIES, 'Netherlands', 'South Korea'])].sort()

function ProfileRows({ value, onChange }: { value: Profile; onChange: (p: Profile) => void }) {
  return (
    <div className="group">
      <label className="group-row">
        <span className="k">Passport</span>
        <span className="v">{value.passport}<ChevronRight /></span>
        <select aria-label="Passport" value={value.passport} onChange={(e) => onChange({ ...value, passport: e.target.value })}>
          {PASSPORTS.map((c) => <option key={c}>{c}</option>)}
        </select>
      </label>
      <label className="group-row">
        <span className="k">Home</span>
        <span className="v">{value.home}<ChevronRight /></span>
        <select aria-label="Home" value={value.home} onChange={(e) => onChange({ ...value, home: e.target.value })}>
          {HOMES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </label>
    </div>
  )
}

export function Onboarding({ onDone }: { onDone: (p: Profile) => void }) {
  const [p, setP] = useState<Profile>({ passport: 'South Korea', home: 'Netherlands' })
  return (
    <main className="screen" style={{ display: 'flex', flexDirection: 'column', paddingTop: 62, paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 34px)' }}>
      <div className="spacer" />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <Globe />
        <h1 className="large-title" style={{ margin: 0, paddingTop: 24, lineHeight: 1.2 }}>Know your days,<br />wherever you are</h1>
        <div className="body muted" style={{ lineHeight: 1.5, paddingTop: 10 }}>We use these to find the rules that apply to you.</div>
      </div>
      <div style={{ marginTop: 34 }}>
        <ProfileRows value={p} onChange={setP} />
      </div>
      <div className="spacer" />
      <button className="btn primary" onClick={() => onDone(p)}>Continue</button>
    </main>
  )
}

type SettingsProps = {
  profile: Profile
  previewDate?: string
  onProfile: (p: Profile) => void
  onPreview: (d?: string) => void
  onSample: () => void
  onClear: () => void
  onDesign: () => void
  onClose: () => void
}

export function Settings({ profile, previewDate, onProfile, onPreview, onSample, onClear, onDesign, onClose }: SettingsProps) {
  return (
    <Sheet title="Settings" right={{ label: 'Done', done: true, onClick: onClose }}>
      <div className="label form-label" style={{ paddingTop: 14 }}>You</div>
      <ProfileRows value={profile} onChange={onProfile} />

      <div className="label form-label">Try it out</div>
      <div className="group">
        <button className="group-row" onClick={onSample}>
          <span className="k">Load example trips</span>
          <span className="v"><ChevronRight /></span>
        </button>
        <label className="group-row">
          <span className="k">Pretend today is</span>
          <span className="v">{previewDate ?? 'Today'}</span>
          <input type="date" aria-label="Pretend today is" value={previewDate ?? ''} onChange={(e) => onPreview(e.target.value || undefined)} />
        </label>
        {previewDate && (
          <button className="group-row" onClick={() => onPreview(undefined)}>
            <span className="k purple">Back to today</span>
          </button>
        )}
      </div>

      <div className="label form-label">About</div>
      <div className="group">
        <button className="group-row" onClick={onDesign}>
          <span className="k">Design system</span>
          <span className="v"><ChevronRight /></span>
        </button>
        <button className="group-row" onClick={onClear}>
          <span className="k coral">Delete all trips</span>
        </button>
      </div>
      <div className="footnote" style={{ paddingTop: 22 }}>Trips stay on this phone. Not legal or tax advice.</div>
    </Sheet>
  )
}
