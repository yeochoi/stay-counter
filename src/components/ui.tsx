import { PointerEvent as RPointerEvent, ReactNode, useContext, useEffect, useLayoutEffect, useRef } from 'react'
import { Day, fmtWeekday } from '../lib/dates'
import { sheetLayer, SheetClosing } from '../lib/layers'
import { Chevron } from './Icons'

export type Tab = 'today' | 'trips' | 'settings'

const TAB_ICONS: Record<Tab, ReactNode> = {
  today: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  trips: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
  settings: <><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></>,
}
const TAB_LABELS: Record<Tab, string> = { today: 'Today', trips: 'Trips', settings: 'Settings' }

/** A full width tab bar on the page background, the same as SaySay and Manna. */
export function TabBar({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="tabbar" aria-label="Main">
      <div className="tabbar-in">
        {(['today', 'trips', 'settings'] as Tab[]).map((t) => (
          <button key={t} className={`tab${t === tab ? ' on' : ''}`} aria-current={t === tab ? 'page' : undefined} onClick={() => onChange(t)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{TAB_ICONS[t]}</svg>
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>
    </nav>
  )
}

/** Page title with an optional action on the right, like SaySay. */
export function PageHead({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="tv-head">
      <h1 className="tv-title">{title}</h1>
      {children}
    </div>
  )
}

// When one sheet page replaces another, the new one slides in sideways instead of rising again.
// The old page is copied just before it goes, so it can slide out next to the new one.
let ghost: { node: HTMLElement; scroll: number } | null = null
let goneAt = -1
let trail: string[] = []

const phone = () => window.matchMedia('(max-width: 559px)').matches

export function Sec({ children }: { children: ReactNode }) {
  return <div className="sec">{children}</div>
}

/** A bottom sheet on phones, a centered panel on desktop. Title on top, one action row at the bottom. */
/** Top left leaves the sheet. × closes it, ‹ goes back one step. The bottom holds one forward action. */
/** onDismiss runs when you tap outside the sheet or press Escape. It closes the whole sheet, like ×. Defaults to onClose. */
export function Sheet({ title, children, foot, onClose, onBack, onDismiss, action }: { title: string; children: ReactNode; foot?: ReactNode; onClose?: () => void; onBack?: () => void; onDismiss?: () => void; action?: { label: string; onClick: () => void } }) {
  const dismiss = onDismiss ?? onClose
  useEffect(() => {
    if (!dismiss) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') dismiss() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [dismiss])
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  const closing = useContext(SheetClosing)
  useEffect(() => {
    if (closing) return
    sheetLayer.open()
    return () => sheetLayer.close()
  }, [closing])

  const wrapRef = useRef<HTMLDivElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const pageRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const wrap = wrapRef.current, sheet = sheetRef.current, page = pageRef.current
    if (!wrap || !sheet || !page) return
    const swapped = ghost && performance.now() - goneAt < 80 ? ghost : null
    ghost = null
    if (!swapped) {
      trail = [title]
    } else {
      wrap.classList.add('swap')
      const at = trail.lastIndexOf(title, trail.length - 2)
      const back = at >= 0
      trail = back ? trail.slice(0, at + 1) : [...trail, title]
      const old = swapped.node
      old.classList.add('sheet-ghost', back ? 'out-back' : 'out-fwd')
      old.setAttribute('aria-hidden', 'true')
      old.setAttribute('inert', '')
      sheet.appendChild(old)
      const body = old.querySelector('.sheet-body')
      if (body) body.scrollTop = swapped.scroll
      page.classList.add(back ? 'in-back' : 'in-fwd')
      const done = () => { old.remove(); page.classList.remove('in-back', 'in-fwd') }
      const t = window.setTimeout(done, 450)
      return () => { window.clearTimeout(t); done(); keep(page) }
    }
    return () => keep(page)
    // The title is read once, when this page first shows.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Pull the grabber or the title bar down to close, like iOS.
  const drag = useRef<{ y: number; t: number; id: number; dy: number } | null>(null)
  const grabDown = (e: RPointerEvent) => {
    if (!dismiss || !phone() || (e.target as HTMLElement).closest('button')) return
    drag.current = { y: e.clientY, t: performance.now(), id: e.pointerId, dy: 0 }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    sheetRef.current?.classList.add('dragging')
  }
  const grabMove = (e: RPointerEvent) => {
    const d = drag.current, s = sheetRef.current
    if (!d || !s) return
    const dy = e.clientY - d.y
    d.dy = dy > 0 ? dy : dy / 6
    s.style.transform = `translateY(${d.dy}px)`
  }
  const grabUp = () => {
    const d = drag.current, s = sheetRef.current
    drag.current = null
    if (!d || !s) return
    s.classList.remove('dragging')
    const fast = d.dy / Math.max(1, performance.now() - d.t) > 0.6
    if (d.dy > 120 || (fast && d.dy > 40)) {
      s.style.transform = 'translateY(110%)'
      wrapRef.current?.classList.add('leaving')
      window.setTimeout(() => dismiss?.(), 220)
    } else {
      s.style.transform = ''
    }
  }

  return (
    <div className="sheet-wrap" ref={wrapRef} role="dialog" aria-modal="true" aria-label={title} onClick={(e) => { if (e.target === e.currentTarget) dismiss?.() }}>
      <div className="sheet" ref={sheetRef}>
       <div className="sheet-page" ref={pageRef}>
        <div className="sheet-grab" onPointerDown={grabDown} onPointerMove={grabMove} onPointerUp={grabUp} onPointerCancel={grabUp}>
        {dismiss && <span className="grabber" aria-hidden="true" />}
        <div className="sheet-head">
          {onBack ? (
            <button className="nav-btn" aria-label="Back" onClick={onBack}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg></button>
          ) : onClose ? (
            <button className="nav-btn" aria-label="Close" onClick={onClose}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg></button>
          ) : <span />}
          <div className="sheet-title">{title}</div>
          {action ? <button className="head-action" onClick={action.onClick}>{action.label}</button> : <span />}
        </div>
        </div>
        <div className="sheet-body">{children}</div>
        {foot && <div className="sheet-foot">{foot}</div>}
       </div>
      </div>
    </div>
  )
}

/** Keep a copy of a sheet page as it leaves, in case the next page slides in to replace it. */
function keep(page: HTMLElement) {
  const body = page.querySelector('.sheet-body')
  const node = page.cloneNode(true) as HTMLElement
  node.classList.remove('in-back', 'in-fwd')
  ghost = { node, scroll: body ? body.scrollTop : 0 }
  goneAt = performance.now()
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
/** A row with an on and off switch. The track has an outline when off, so it passes 3 to 1. */
export function Switch({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" className="row switch-row" role="switch" aria-checked={on} onClick={() => onChange(!on)}>
      <span className="k">{label}</span>
      <span className={`switch${on ? ' on' : ''}`} aria-hidden="true"><i /></span>
    </button>
  )
}

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

/** The big ring on Today. A thin track, and an arc for the part that is left. */
export function Ring({ label, n, unit, left, of, soft }: { label: string; n: number; unit: string; left?: number; of?: number; soft?: boolean }) {
  const r = 106
  const c = 2 * Math.PI * r
  const frac = of ? Math.max(0, Math.min(1, (left ?? 0) / of)) : 0
  return (
    <div className="ring">
      <svg width="232" height="232" viewBox="0 0 232 232" aria-hidden="true">
        <circle cx="116" cy="116" r={r} fill="none" stroke="var(--line)" strokeWidth="6" />
        {frac > 0 && <circle cx="116" cy="116" r={r} fill="none" stroke={soft ? 'var(--planned)' : 'var(--primary)'} strokeWidth="6" strokeLinecap="round" strokeDasharray={`${(c * frac).toFixed(1)} ${c.toFixed(1)}`} transform="rotate(-90 116 116)" />}
      </svg>
      <span className="ring-l">{label}</span>
      <span className="ring-n">{n}</span>
      <span className="ring-u">{unit}</span>
    </div>
  )
}

/** Two big numbers side by side with a thin line between them, like the Manna journal. */
export function Stats({ items }: { items: { n: ReactNode; label: string; bad?: boolean }[] }) {
  return (
    <div className="stats">
      {items.map((it, i) => (
        <div key={i} className="stat">
          <span className="stat-n">{it.n}</span>
          <span className={`stat-l${it.bad ? ' bad' : ''}`}>{it.label}</span>
        </div>
      ))}
    </div>
  )
}
