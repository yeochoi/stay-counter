import { useState } from 'react'
import { AlertSmall, Chevron } from '../components/Icons'
import { Primary, Ring, Seg, Sheet, Switch } from '../components/ui'

const COLORS: [string, string][] = [
  ['Hero', '#2F2360'], ['Hero text', '#CFC4FF'], ['Ring', '#B7A5FF'], ['Primary', '#5B3FD0'],
  ['Purple text', '#4B32B8'], ['Soft', '#EEEAFB'], ['Current', '#F1EDFD'], ['Background', '#F7F5F2'],
  ['Ink', '#1E1B2E'], ['Muted', '#6B6778'], ['Line', '#ECE9E4'], ['Chip', '#EFECE7'],
  ['Coral text', '#A83C18'], ['Coral', '#E2683C'], ['Coral soft', '#FCEEE8'], ['Backdrop', '#3A3550'],
]

const TYPE: [string, React.CSSProperties, string][] = [
  ['Sat, Nov 28', { fontSize: 34, fontWeight: 600, letterSpacing: '-0.02em' }, '34 semibold. The one answer and page titles. 44 on laptops'],
  ['China trip', { fontSize: 20, fontWeight: 600 }, '20 semibold. Section headers, 32 above and 12 below'],
  ['Oct 15 – Nov 13', { fontSize: 17, fontWeight: 600 }, '17 semibold. Stay dates, buttons, sheet titles'],
  ['Leave China by', { fontSize: 17, color: 'var(--muted)' }, '17 regular. Everything you read, labels and values. Like iOS body text'],
  ['Not booked', { fontSize: 13, color: 'var(--muted)' }, '13 regular. Status, days, notes, chips, tab labels'],
]

const RULES = [
  'One typeface, Outfit, everywhere.',
  'The hero answers one question with one number and one date.',
  'Five text styles, like iOS. 34 semibold, 20 semibold, 17 semibold, 17 regular, 13 regular. The same in all three apps.',
  'Layers follow iOS. Things that float over content get a shadow. The tab bar is glass, the add button keeps its purple. Things on the page are flat.',
  'Every round button is 44 wide with a 20 icon, flat with no shadow.',
  'Destructive actions always go last. A single one is plain coral text, centered. Two or more related ones are grouped in one card. They always ask first.',
  'Top left leaves a sheet. × closes it, ‹ goes back one step. The bottom holds one forward action.',
  'Show each problem once, where it lives. A problem with a stay is an icon on that stay, the reason is inside it. A problem with the whole trip is a count on Trip details.',
  'Booked is only what the person says. Each stay has its own switch, the trip is booked when every stay is.',
  'One line joins the stays of a trip. Grey between finished stays, purple from now on, dashed into a stay not booked yet. No dividers between stays.',
  'A chevron means a row opens something. Rows without one only show information.',
  'Cards only for controls and tappable lists. White with a 1px line and radius 16. No shadows.',
]

const X = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
const B = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
const Bar = ({ icon, title, action }: { icon: JSX.Element; title: string; action?: string }) => (
  <div className="sheet-head" style={{ padding: '0 8px', height: 48 }}>
    <span className="nav-btn">{icon}</span>
    <div className="sheet-title">{title}</div>
    {action ? <span className="head-action">{action}</span> : <span />}
  </div>
)

export function DesignSystem({ onBack, onClose, onDismiss }: { onBack?: () => void; onClose?: () => void; onDismiss?: () => void }) {
  return (
    <Sheet title="Design system" onBack={onBack} onClose={onClose} onDismiss={onDismiss}>
      <div className="ds">
        <h3>Color</h3>
        <div className="sw">{COLORS.map(([n, c]) => <div key={n}><span style={{ background: c }} /><p>{n}<br /><span className="muted" style={{ display: 'inline', height: 'auto' }}>{c}</span></p></div>)}</div>

        <h3>Type</h3>
        <div className="card">
          {TYPE.map(([t, st, note]) => (
            <div key={note} className="row two" style={{ display: 'block' }}>
              <div style={st}>{t}</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', paddingTop: 6 }}>{note}</div>
            </div>
          ))}
        </div>

        <h3>Hero</h3>
        <div className="hero" style={{ borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="hero-main" style={{ paddingTop: 0, gap: 16 }}>
            <Ring n={20} unit="days left" of={30} value={10} />
            <div className="stack"><div className="l">Leave China by</div><div className="a">Sat, Nov 7</div></div>
          </div>
          <div className="hero-main" style={{ paddingTop: 0, gap: 16 }}>
            <Ring n={17} unit="days to go" />
            <div className="stack"><div className="l">Next trip</div><div className="a">China</div></div>
          </div>
        </div>

        <h3>Stay timeline</h3>
        <div className="sec" style={{ paddingTop: 0 }}>China trip</div>
        <div className="card timeline">
          {([['Sep 8 – Oct 7', 'Done', 'past', false, 'off', 'solid'], ['Oct 9 – Nov 7', 'Now', 'now', false, 'solid', 'solid'], ['Nov 9 – Dec 8', 'Booked', 'booked', false, 'solid', 'dash'], ['Jan 2 – 31, 2027', 'Not booked', 'open', true, 'dash', 'off']] as const).map(([d, label, kind, late, a, b], i) => (
            <div key={i} className={`stay-row ${kind}`}>
              <span className="tl" aria-hidden="true"><i className={a} /><b /><i className={b} /></span>
              <span className="in">
                <span className="what"><span className="t">{d}{late && <AlertSmall />}</span><span className="state">{label}</span></span>
                <span className="s">30 days<Chevron /></span>
              </span>
            </div>
          ))}
          <div className="row trip-foot"><span className="body-text">Trip details</span><span className="s"><Chevron /></span></div>
        </div>
        <div className="note">Grey dot done, large dot now, filled dot booked, hollow dot not booked. The coral icon marks a stay with something to check.</div>

        <h3>Booking a stay</h3>
        <BookDemo />

        <h3>Warnings</h3>
        <div className="alert-chip" style={{ marginTop: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C4502A" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M12 8v5M12 16.5v.5M10.3 3.9L2.5 18a2 2 0 001.7 3h15.6a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" /></svg>
          2 rules to check. See below
        </div>
        <div className="card" style={{ marginTop: 12 }}>
          <div className="row rule-bad"><div className="top"><span className="k">Visa free until</span><span className="v">Dec 31, 2026</span></div><div className="why">Your trip goes past this date</div></div>
          <div className="row rule-bad"><div className="top"><span className="k">Tax limit</span><span className="v">183 days a year</span></div><div className="why">You reach it on Dec 12</div></div>
        </div>

        <h3>Sheet bar</h3>
        <div className="card" style={{ padding: '8px 0' }}>
          <Bar icon={X} title="China" action="Edit" />
          <Bar icon={B} title="Edit trip" />
          <Bar icon={B} title="Stay 2 of 5" />
        </div>

        <h3>Rows</h3>
        <div className="card">
          <div className="row"><span className="k">Arrive</span><span className="v">Wed, Dec 2<Chevron /></span></div>
          <div className="row"><span className="k">Leave</span><span className="v"><span className="placeholder">Choose</span><Chevron /></span></div>
          <div className="row two"><span className="col"><span className="t">Japan</span><span className="sub">Sep 26 – Oct 2 · 7 days · Personal</span></span><Chevron /></div>
        </div>

        <h3>Tax days</h3>
        <div className="card" style={{ padding: '0 16px' }}>
          <div className="row" style={{ padding: '14px 0', display: 'block' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span className="col"><span className="t">China</span><span className="sub">In 2026</span></span><span className="pill coral">164 of 183 days</span></div>
            <div className="bar coral"><div style={{ width: '90%' }} /></div>
          </div>
          <div className="row" style={{ padding: '14px 0' }}><span className="col"><span className="t">Korea</span><span className="sub">Past 12 months</span></span><span className="s">15 days</span></div>
        </div>

        <h3>Chips and notes</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><span className="pill now">8 days left</span><span className="pill coral">164 of 183 days</span></div>
        <div className="done-note">This stay is done. Change the dates only if you arrived or left on a different day.</div>

        <h3>Controls</h3>
        <Seg label="Example" value="Business" options={['Business', 'Personal']} onChange={() => {}} />
        <div style={{ height: 12 }} />
        <Primary label="Save trip" onClick={() => {}} />

        <h3>Rules</h3>
        <div className="card">
          {RULES.map((r) => <div key={r} className="row two" style={{ fontSize: 17, lineHeight: 1.45 }}>{r}</div>)}
        </div>
      </div>
    </Sheet>
  )
}

function BookDemo() {
  const [on, setOn] = useState(false)
  return (
    <div className="card">
      <div className="row"><span className="k">Arrive</span><span className="v">Wed, Feb 3<Chevron /></span></div>
      <div className="row"><span className="k">Leave</span><span className="v">Thu, Mar 4<Chevron /></span></div>
      <Switch label="Booked" on={on} onChange={setOn} />
    </div>
  )
}
