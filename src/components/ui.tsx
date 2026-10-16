import { ReactNode } from 'react'
import { Alert, Calendar, ChevronLeft, Home } from './Icons'

export function TabHeader({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  return (
    <header className="tab-header">
      <div className="eyebrow label">{eyebrow}</div>
      <div className="bar">
        <h1 className="large-title" style={{ margin: 0 }}>{title}</h1>
        {action}
      </div>
    </header>
  )
}

export type Tab = 'today' | 'trips'

export function TabBar({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="tabbar" aria-label="Tabs">
      <button className={`tab ${tab === 'today' ? 'active' : ''}`} onClick={() => onChange('today')} aria-current={tab === 'today'}>
        <Home active={tab === 'today'} />
        Today
      </button>
      <button className={`tab ${tab === 'trips' ? 'active' : ''}`} onClick={() => onChange('trips')} aria-current={tab === 'trips'}>
        <Calendar active={tab === 'trips'} />
        Trips
      </button>
    </nav>
  )
}

type BarAction = { label: string; onClick: () => void; back?: boolean; done?: boolean; disabled?: boolean }

export function Sheet({ title, left, right, children }: { title: string; left?: BarAction; right?: BarAction; children: ReactNode }) {
  return (
    <div className="backdrop" role="dialog" aria-modal="true" aria-label={title}>
      <div className="sheet">
        <div className="sheet-scroll">
          <div className="sheet-bar">
            {left ? (
              <button className={`left ${left.back ? '' : 'plain'}`} onClick={left.onClick}>
                {left.back && <ChevronLeft />}
                {left.label}
              </button>
            ) : <span />}
            <div className="center">{title}</div>
            {right ? (
              <button className={`right ${right.done ? 'done' : ''}`} onClick={right.onClick} disabled={right.disabled}>
                {right.label}
              </button>
            ) : <span />}
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}

export function Segmented<T extends string>({ options, value, onChange, label }: { options: readonly T[]; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <div className="segmented" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button key={o} role="radio" aria-checked={o === value} className={o === value ? 'on' : ''} onClick={() => onChange(o)}>
          {o}
        </button>
      ))}
    </div>
  )
}

export function Warnings({ items }: { items: string[] }) {
  if (!items.length) return null
  return (
    <div className="warning" role="note">
      <div className="icon"><Alert /></div>
      <div className="text">
        {items.map((t) => <div key={t}>{t}</div>)}
      </div>
    </div>
  )
}

export function Ring({ value, total, coral }: { value: number; total: number; coral?: boolean }) {
  const r = 46
  const c = 2 * Math.PI * r
  const fill = Math.max(0, Math.min(1, value / total)) * c
  return (
    <svg width="104" height="104" viewBox="0 0 104 104" aria-hidden="true">
      <circle cx="52" cy="52" r={r} fill="none" stroke="var(--ring-track)" strokeWidth="8" />
      <circle cx="52" cy="52" r={r} fill="none" stroke={coral ? 'var(--secondary)' : 'var(--primary)'} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${fill} ${c}`} transform="rotate(-90 52 52)" />
    </svg>
  )
}
