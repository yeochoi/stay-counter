import { Sheet } from '../components/ui'

const COLORS: [string, string][] = [
  ['Hero', '#2F2360'], ['Hero text', '#CFC4FF'], ['Ring', '#B7A5FF'], ['Primary', '#5B3FD0'],
  ['Purple text', '#4B32B8'], ['Soft', '#EEEAFB'], ['Current', '#F1EDFD'], ['Background', '#F7F5F2'],
  ['Ink', '#1E1B2E'], ['Muted', '#6B6778'], ['Line', '#ECE9E4'], ['Chip', '#EFECE7'],
  ['Coral text', '#A83C18'], ['Coral', '#E2683C'], ['Coral soft', '#FCEEE8'], ['Backdrop', '#3A3550'],
]

export function DesignSystem({ onBack }: { onBack: () => void }) {
  return (
    <Sheet title="Design system" foot={<button className="btn primary" onClick={onBack}>Done</button>}>
      <div className="ds">
        <h3>Color</h3>
        <div className="sw">{COLORS.map(([n, c]) => <div key={n}><span style={{ background: c }} /><p>{n}<br /><span className="muted" style={{ display: 'inline', height: 'auto' }}>{c}</span></p></div>)}</div>
        <h3>Type</h3>
        <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontWeight: 600, letterSpacing: '-0.02em', fontSize: 34, lineHeight: 1 }}>17 <span className="muted" style={{ fontSize: 13, fontWeight: 400, letterSpacing: 0 }}>Outfit 34 semibold, numbers</span></div>
          <div style={{ fontWeight: 600, letterSpacing: '-0.02em', fontSize: 34, lineHeight: 1 }}>Mon, Nov 30 <span className="muted" style={{ fontSize: 13, fontWeight: 400, letterSpacing: 0 }}>34 semibold, answers</span></div>
          <div style={{ fontSize: 17, fontWeight: 600 }}>China <span className="muted" style={{ fontSize: 13, fontWeight: 400 }}>Outfit 17 semibold, primary content</span></div>
          <div style={{ fontSize: 15 }} className="muted">Visa free allows 30 days per entry <span style={{ fontSize: 13 }}>15, labels</span></div>
          <div className="sec" style={{ padding: 0 }}>Section label 12 caps</div>
        </div>
        <h3>Hero</h3>
        <div className="hero" style={{ borderRadius: 16, padding: 20 }}>
          <div className="stack"><div className="l">Leave China by</div><div className="a">Mon, Nov 30</div><div className="l">Stay 1 of 5</div></div>
          <div className="chips"><span>Next entry Dec 2</span></div>
        </div>
        <h3>Buttons</h3>
        <div className="actions"><button className="btn soft">Cancel</button><button className="btn primary">Save</button></div>
        <h3>Chips</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><span className="pill now">Now</span><span className="pill grey">Personal</span><span className="pill coral">164 of 183 days</span></div>
        <h3>Rules</h3>
        <div className="note" style={{ paddingTop: 0 }}>One typeface, Outfit. Semibold for answers and numbers. Bold only for primary content. White cards with a 1px line, radius 16, no shadows. One action row at the bottom of each sheet, soft left and primary right.</div>
      </div>
    </Sheet>
  )
}
