import { Chevron, Check } from '../components/Icons'
import { Primary, Ring, Seg, Sheet } from '../components/ui'

const COLORS: [string, string][] = [
  ['Hero', '#2F2360'], ['Hero text', '#CFC4FF'], ['Ring', '#B7A5FF'], ['Primary', '#5B3FD0'],
  ['Purple text', '#4B32B8'], ['Soft', '#EEEAFB'], ['Current', '#F1EDFD'], ['Background', '#F7F5F2'],
  ['Ink', '#1E1B2E'], ['Muted', '#6B6778'], ['Line', '#ECE9E4'], ['Chip', '#EFECE7'],
  ['Coral text', '#A83C18'], ['Coral', '#E2683C'], ['Coral soft', '#FCEEE8'], ['Backdrop', '#3A3550'],
]

const TYPE: [string, React.CSSProperties, string][] = [
  ['Mon, Nov 30', { fontSize: 34, fontWeight: 600, letterSpacing: '-0.02em' }, '34 semibold. Answers and big numbers'],
  ['China', { fontSize: 17, fontWeight: 600 }, '17 semibold. Primary content'],
  ['Leave China by', { fontSize: 15, color: 'var(--muted)' }, '15 regular. Labels and secondary values'],
  ['Match these to your flights.', { fontSize: 13, color: 'var(--muted)' }, '13 regular. Notes'],
  ['SECTION LABEL', { fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--muted)' }, '12 semibold caps. Section labels'],
]

const RULES = [
  'One typeface, Outfit, everywhere.',
  'Bold only for primary content. Status chips stay semibold.',
  'The hero answers one question with one number and one date.',
  'Text next to the ring uses the same sizes as the ring, so tops and bottoms line up.',
  'White cards with a 1px line and radius 16. No shadows, no strong strokes.',
  'Top left leaves a sheet. × closes it, ‹ goes back one step.',
  'The bottom holds one forward action, like See plan or Save trip. Reading pages have none.',
  'Only show dates the person entered or the app knows. Mark suggestions as suggestions.',
]

export function DesignSystem({ onBack, onClose }: { onBack?: () => void; onClose?: () => void }) {
  return (
    <Sheet title="Design system" onBack={onBack} onClose={onClose}>
      <div className="ds">
        <h3>Color</h3>
        <div className="sw">{COLORS.map(([n, c]) => <div key={n}><span style={{ background: c }} /><p>{n}<br /><span className="muted" style={{ display: 'inline', height: 'auto' }}>{c}</span></p></div>)}</div>

        <h3>Type</h3>
        <div className="card">
          {TYPE.map(([t, st, note]) => (
            <div key={note} className="row two" style={{ display: 'block' }}>
              <div style={st}>{t}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', paddingTop: 6 }}>{note}</div>
            </div>
          ))}
        </div>

        <h3>Hero</h3>
        <div className="hero" style={{ borderRadius: 16, padding: 16 }}>
          <div className="hero-main" style={{ paddingTop: 0, gap: 16 }}>
            <Ring n={17} unit="days left" of={24} value={7} />
            <div className="stack"><div className="l">Leave China by</div><div className="a">Mon, Nov 2</div></div>
          </div>
        </div>

        <h3>Rows</h3>
        <div className="card">
          <div className="row"><span className="k">Arrive</span><span className="v">Wed, Dec 2<Chevron /></span></div>
          <div className="row"><span className="t">Nov 1 – 30</span><span className="s"><span className="pill now">Now</span><Chevron /></span></div>
          <div className="row"><span className="t">Dec 2 – 28</span><span className="s"><Check />27 days<Chevron /></span></div>
        </div>

        <h3>Chips</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><span className="pill now">Now</span><span className="pill grey">Personal</span><span className="pill coral">164 of 183 days</span></div>

        <h3>Controls</h3>
        <Seg label="Example" value="Planning" options={['Planning', 'Booked']} onChange={() => {}} />
        <div style={{ height: 12 }} />
        <Primary label="Save" onClick={() => {}} />

        <h3>Rules</h3>
        <div className="card">
          {RULES.map((r) => <div key={r} className="row two" style={{ fontSize: 15, lineHeight: 1.45 }}>{r}</div>)}
        </div>
      </div>
    </Sheet>
  )
}
