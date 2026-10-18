import { ReactNode, useEffect } from 'react'
import { Day, fmtWeekday } from '../lib/dates'
import { Chevron, HomeIcon, TripsIcon } from './Icons'

export type Tab = 'today' | 'trips'

export function TabBar({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="nav">
      <span className="brand">Stay Counter</span>
      <button className={tab === 'today' ? 'on' : ''} onClick={() => onChange('today')}><HomeIcon on={tab === 'today'} />Today</button>
      <button className={tab === 'trips' ? 'on' : ''} onClick={() => onChange('trips')}><TripsIcon on={tab === 'trips'} />Trips</button>
    </nav>
  )
}

export function Sec({ children }: { children: ReactNode }) {
  return <div className="sec">{children}</div>
}

/** A bottom sheet on phones, a centered panel on desktop. Title on top, one action row at the bottom. */
/** Top left leaves the sheet. × closes it, ‹ goes back one step. The bottom holds one forward action. */
export function Sheet({ title, children, foot, onClose, onBack, action }: { title: string; children: ReactNode; foot?: ReactNode; onClose?: () => void; onBack?: () => void; action?: { label: string; onClick: () => void } }) {
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])
  return (
    <div className="sheet-wrap" role="dialog" aria-modal="true" aria-label={title}>
      <div className="sheet">
        <div className="sheet-head">
          {onBack ? (
            <button className="nav-btn" aria-label="Back" onClick={onBack}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg></button>
          ) : onClose ? (
            <button className="nav-btn" aria-label="Close" onClick={onClose}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg></button>
          ) : <span />}
          <div className="sheet-title">{title}</div>
          {action ? <button className="head-action" onClick={action.onClick}>{action.label}</button> : <span />}
        </div>
        <div className="sheet-body">{children}</div>
        {foot && <div className="sheet-foot">{foot}</div>}
      </div>
    </div>
  )
}

export function Primary({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
  return <button className="btn primary" onClick={onClick} disabled={disabled}>{label}</button>
}

export function Seg<T extends string>({ value, options, onChange, label }: { value: T | ''; options: T[]; onChange: (v: T) => void; label: string }) {
  return (
    <div className="seg" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button key={o} role="radio" aria-checked={o === value} className={o === value ? 'on' : ''} onClick={() => onChange(o)}>{o}</button>
      ))}
    </div>
  )
}

/** Row that opens a native list picker. */
export function SelectRow({ k, value, options, onChange }: { k: string; value: string; options: readonly string[]; onChange: (v: string) => void }) {
  return (
    <label className="row">
      <span className="k">{k}</span>
      <span className="v">{value || <span className="placeholder">Choose</span>}<Chevron /></span>
      <select aria-label={k} value={value} onChange={(e) => onChange(e.target.value)}>
        {!value && <option value="" disabled>Choose</option>}
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </label>
  )
}

/** Row that opens the native date picker. */
export function DateRow({ k, value, today, onChange, min }: { k: string; value: Day; today: Day; onChange: (d: Day) => void; min?: Day }) {
  return (
    <label className="row">
      <span className="k">{k}</span>
      <span className="v">{value ? fmtWeekday(value, today) : <span className="placeholder">Choose</span>}<Chevron /></span>
      <input
        className="overlay"
        type="date"
        aria-label={k}
        value={value}
        min={min || undefined}
        onClick={(e) => { try { (e.currentTarget as HTMLInputElement).showPicker?.() } catch { /* not supported */ } }}
        onChange={(e) => e.target.value && onChange(e.target.value)}
      />
    </label>
  )
}

export function Ring({ n, unit, of, value }: { n: number; unit: string; of?: number; value?: number }) {
  const r = 53
  const c = 2 * Math.PI * r
  const frac = of && value !== undefined ? Math.max(0, Math.min(1, value / of)) : 0
  return (
    <div className="disc" style={{ background: 'none' }}>
      <svg width="112" height="112" viewBox="0 0 112 112" aria-hidden="true">
        <circle cx="56" cy="56" r={r} fill="rgba(255,255,255,0.09)" stroke="rgba(255,255,255,0.12)" strokeWidth="4" />
        {of && <circle cx="56" cy="56" r={r} fill="none" stroke="#B7A5FF" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${(c * frac).toFixed(1)} ${c.toFixed(1)}`} transform="rotate(-90 56 56)" />}
      </svg>
      <div className="n">{n}</div>
      <div className="u">{unit}</div>
    </div>
  )
}
