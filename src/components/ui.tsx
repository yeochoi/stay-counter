import { PointerEvent as RPointerEvent, ReactNode, useContext, useEffect, useLayoutEffect, useRef } from 'react'
import { Day, fmtWeekday } from '../lib/dates'
import { sheetLayer, SheetClosing } from '../lib/layers'
import { Chevron, HomeIcon, TripsIcon } from './Icons'

export type Tab = 'today' | 'trips'

const TABS: Tab[] = ['today', 'trips']

/** On phones a glass pill sits behind the selected tab. It slides when you tap, and you can drag it from one tab to the other. */
export function TabBar({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  const nav = useRef<HTMLElement>(null)
  const pill = useRef<HTMLSpanElement>(null)
  const drag = useRef<{ x: number; id: number; moved: boolean } | null>(null)
  const skipClick = useRef(false)

  const buttons = () => Array.from(nav.current?.querySelectorAll<HTMLButtonElement>('button[data-tab]') ?? [])
  const place = (i: number) => {
    const b = buttons()[i]
    if (!b || !pill.current) return
    pill.current.style.transform = `translateX(${b.offsetLeft}px)`
    pill.current.style.width = `${b.offsetWidth}px`
  }
  const nearest = (clientX: number) => {
    let best = 0, d = Infinity
    buttons().forEach((b, i) => {
      const r = b.getBoundingClientRect()
      const dd = Math.abs(clientX - (r.left + r.width / 2))
      if (dd < d) { d = dd; best = i }
    })
    return best
  }

  useLayoutEffect(() => {
    place(TABS.indexOf(tab))
    const onResize = () => place(TABS.indexOf(tab))
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  })

  const down = (e: RPointerEvent) => {
    skipClick.current = false
    if (e.pointerType === 'mouse' && e.button !== 0) return
    drag.current = { x: e.clientX, id: e.pointerId, moved: false }
  }
  const move = (e: RPointerEvent) => {
    const d = drag.current
    if (!d || !pill.current || !nav.current) return
    if (!d.moved) {
      if (Math.abs(e.clientX - d.x) < 6) return
      d.moved = true
      nav.current.setPointerCapture(d.id)
      pill.current.classList.add('dragging')
    }
    const bs = buttons()
    const first = bs[0], last = bs[bs.length - 1]
    const w = pill.current.offsetWidth
    const navLeft = nav.current.getBoundingClientRect().left
    const x = Math.max(first.offsetLeft, Math.min(last.offsetLeft + last.offsetWidth - w, e.clientX - navLeft - w / 2))
    pill.current.style.transform = `translateX(${x}px)`
    const i = nearest(e.clientX)
    bs.forEach((b, j) => b.classList.toggle('hover', j === i))
  }
  const up = (e: RPointerEvent) => {
    const d = drag.current
    drag.current = null
    if (!d?.moved) return
    skipClick.current = true
    window.setTimeout(() => { skipClick.current = false }, 0)
    pill.current?.classList.remove('dragging')
    buttons().forEach((b) => b.classList.remove('hover'))
    const i = nearest(e.clientX)
    place(i)
    if (TABS[i] !== tab) onChange(TABS[i])
  }
  const pick = (t: Tab) => {
    if (skipClick.current) { skipClick.current = false; return }
    onChange(t)
  }

  return (
    <nav className="nav" ref={nav} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
      <span className="nav-pill" ref={pill} aria-hidden="true" />
      <button className="brand" onClick={() => onChange('today')}>Stay Counter</button>
      <button data-tab="today" className={tab === 'today' ? 'on' : ''} onClick={() => pick('today')}><HomeIcon on={tab === 'today'} />Today</button>
      <button data-tab="trips" className={tab === 'trips' ? 'on' : ''} onClick={() => pick('trips')}><TripsIcon on={tab === 'trips'} />Trips</button>
    </nav>
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

export function Ring({ n, unit, of, value }: { n: number; unit: string; of?: number; value?: number }) {
  // A clean ring. No filled disc, a visible 6px track and a 6px arc that runs inside it, so it reads as one shape.
  const r = 53
  const c = 2 * Math.PI * r
  const frac = of && value !== undefined ? Math.max(0, Math.min(1, value / of)) : 0
  return (
    <div className="disc" style={{ background: 'none' }}>
      <svg width="112" height="112" viewBox="0 0 112 112" aria-hidden="true">
        <circle cx="56" cy="56" r={r} fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="6" />
        {of && <circle cx="56" cy="56" r={r} fill="none" stroke="#B7A5FF" strokeWidth="6" strokeLinecap="round" strokeDasharray={`${(c * frac).toFixed(1)} ${c.toFixed(1)}`} transform="rotate(-90 56 56)" />}
      </svg>
      <div className="n">{n}</div>
      <div className="u">{unit}</div>
    </div>
  )
}
