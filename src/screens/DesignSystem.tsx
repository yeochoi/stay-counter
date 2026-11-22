import { useState } from 'react'
import { AlertSmall, Chevron } from '../components/Icons'
import { Primary, Ring, Seg, Sheet, Stats, Switch } from '../components/ui'

const COLORS: [string, string][] = [
  ['Background', '#FBFAF7'], ['Card', '#FFFFFF'], ['Ink', '#1E1B2E'], ['Muted', '#6B6778'],
  ['Line', '#ECE9E4'], ['Border', '#D9D5CE'], ['Primary', '#5B3FD0'], ['Purple text', '#4B32B8'],
  ['Planned', '#D9D1F7'], ['Soft', '#EEEAFB'], ['Coral text', '#A83C18'], ['Coral soft', '#FCEEE8'],
]

const TYPE: [string, React.CSSProperties, string][] = [
  ['8', { fontSize: 80, lineHeight: 1, fontWeight: 300, letterSpacing: '-0.03em' }, '80 light. The number in the ring, once per screen'],
  ['Know your days', { fontSize: 36, fontWeight: 300, letterSpacing: '-0.02em' }, '36 light. First open title and big numbers'],
  ['Trips', { fontSize: 28, fontWeight: 300, letterSpacing: '-0.02em' }, '28 light. Page titles'],
  ['Stays', { fontSize: 20, fontWeight: 500 }, '20 medium. Section headers, 32 above and 12 below'],
  ['Leave by Mon, Nov 30', { fontSize: 17 }, '17 regular. Everything you read. Buttons use 17 medium'],
  ['147 days, Business', { fontSize: 13, color: 'var(--muted)' }, '13 regular. Second lines, notes, labels under numbers'],
  ['Today', { fontSize: 11, color: 'var(--purple-text)', fontWeight: 500 }, '11. Tab labels only'],
]

const RULES = [
  'One typeface, Outfit, everywhere. Light for big text, regular for reading, medium for buttons and headers. Never bold.',
  'Every screen has the same background. No colored hero. The same in SaySay and Manna.',
  'One picture per screen at most. Today has the ring, a trip has the stay bar. Nothing else is drawn.',
  'In China, the ring counts the days left in this stay. Anywhere else, it counts this year\'s days in China against the tax limit, because that is the number that matters most.',
  'Content sits on the page. White cards only for settings and controls, with a 1px line and radius 16. No shadows.',
  'Numbers come in pairs, big and light, split by a thin line, like the Manna journal.',
  'Purple means now or an action. Light purple means planned. Coral means something to check, and is used only for that.',
  'The tab bar runs full width at the bottom, on the background. Today, Trips, Settings.',
  'Add is a round purple button, 44 wide, top right of the page.',
  'Destructive actions always go last, in coral, and always ask first.',
  'Top left leaves a sheet. × closes it, ‹ goes back one step. The bottom holds one forward action.',
  'Booked is only what the person says. The trip is booked when every stay is.',
  'A chevron means a row opens something. Rows without one only show information.',
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

        <h3>Ring</h3>
        <div style={{ display: 'flex', justifyContent: 'center' }}><Ring label="This stay" n={8} unit="days left" left={8} of={30} /></div>
        <div className="ring-line">Leave by Mon, Nov 30</div>

        <h3>Stay bar</h3>
        <div className="staybar" style={{ marginTop: 24 }}>
          <div className="staybar-track" aria-hidden="true">
            <span className="piece now" style={{ flexGrow: 30 }}><i className="today" style={{ left: '73%' }} /></span>
            <span className="piece" style={{ flexGrow: 30 }} />
            <span className="piece" style={{ flexGrow: 30 }}>
              <svg className="late" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#A83C18" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l9.5 17H2.5z" /><path d="M12 10v4M12 17.5v.01" /></svg>
            </span>
          </div>
          <div className="staybar-ends"><span>Nov 1</span><span>Jan 31, 2027</span></div>
        </div>
        <div className="note">Purple is the stay you are in, light purple is planned, grey is done. The dark line is today. A coral mark sits over a stay after the entry ends.</div>

        <h3>Numbers</h3>
        <Stats items={[{ n: 147, label: 'Days this trip' }, { n: 164, label: 'Tax days, 183 on Dec 12', bad: true }]} />

        <h3>List</h3>
        <div className="list" style={{ marginTop: 0, paddingLeft: 14 }}>
          <div className="list-row"><span className="dot" aria-hidden="true" /><span className="col"><span className="t">Nov 1 – Mar 31, 2027</span><span className="sub">147 days, Business, now</span></span><Chevron /></div>
          <div className="list-row"><span className="col"><span className="t">May 10 – Jun 5, 2027</span><span className="sub">27 days, Business, not booked</span></span><Chevron /></div>
        </div>

        <h3>Buttons</h3>
        <div className="pair" style={{ padding: 0 }}>
          <button className="btn primary">Plan a stay</button>
          <button className="btn outline">Add booked trip</button>
        </div>

        <h3>Stay timeline</h3>
        <div className="sec" style={{ paddingTop: 0 }}>Stays</div>
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
          <Bar icon={X} title="Trip" action="Edit" />
          <Bar icon={B} title="Edit trip" />
          <Bar icon={B} title="Stay 2 of 5" />
        </div>

        <h3>Rows</h3>
        <div className="card">
          <div className="row"><span className="k">Arrive</span><span className="v">Wed, Dec 2<Chevron /></span></div>
          <div className="row"><span className="k">Leave</span><span className="v"><span className="placeholder">Choose</span><Chevron /></span></div>
                  </div>

        <h3>Notes</h3>
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
