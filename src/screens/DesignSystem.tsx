import tokens from '../design/tokens.json'
import { useState } from 'react'
import { ChevronLeft } from '../components/Icons'
import { Ring, Segmented, Warnings } from '../components/ui'

type Style = { name: string; fontSize: string; lineHeight: string; fontWeight: number; letterSpacing?: string; textTransform?: string; sample: string; usage: string }

export function DesignSystem({ onBack }: { onBack: () => void }) {
  const [seg, setSeg] = useState<'Planning' | 'Booked'>('Planning')
  const styles = tokens.type.groups[0].styles as Style[]
  return (
    <div className="backdrop" style={{ padding: 0, background: 'var(--bg)' }} role="dialog" aria-label="Design system">
      <main className="screen" style={{ paddingBottom: 60 }}>
        <div className="sheet-bar" style={{ paddingTop: 0 }}>
          <button className="left" onClick={onBack}><ChevronLeft />Back</button>
          <div className="center">Design system</div>
          <span />
        </div>

        <h1 className="large-title" style={{ margin: '14px 0 0' }}>Stay Counter</h1>
        <p className="body muted" style={{ lineHeight: 1.5, margin: '6px 0 0' }}>
          Calm, native and purple. One answer per screen, lists not cards, purple acts and coral warns.
        </p>

        <section className="section">
          <div className="label">Color</div>
          <div className="rows">
            {tokens.color.tokens.map((c) => (
              <div key={c.name} className="list-row" style={{ alignItems: 'flex-start', padding: '12px 0', gap: 14 }}>
                <span style={{ width: 36, height: 36, borderRadius: 10, background: c.value, border: '1px solid var(--line)', flexShrink: 0 }} />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <span className="name" style={{ fontSize: 15 }}>{c.name}</span>
                    <span className="value" style={{ fontSize: 13 }}>{c.value}</span>
                  </span>
                  <span className="muted" style={{ display: 'block', fontSize: 13, lineHeight: 1.4, paddingTop: 2 }}>{c.usage}</span>
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="section after-plain">
          <div className="label">Type</div>
          <div className="rows">
            {styles.map((s) => (
              <div key={s.name} className="list-row" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '12px 0', gap: 4 }}>
                <span style={{ fontSize: s.fontSize, lineHeight: s.lineHeight, fontWeight: s.fontWeight, letterSpacing: s.letterSpacing, textTransform: s.textTransform as 'uppercase' | undefined }}>{s.sample}</span>
                <span className="muted" style={{ fontSize: 13 }}>{s.name} · {parseInt(s.fontSize)} · {s.fontWeight}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="section after-plain">
          <div className="label">Spacing and shape</div>
          <div className="rows">
            {[...tokens.spacing.tokens, ...tokens.radius.tokens].map((t) => (
              <div key={t.name} className="list-row" style={{ minHeight: 48 }}>
                <span className="name" style={{ fontSize: 15 }}>{t.name}</span>
                <span className="value">{t.value}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="section after-plain">
          <div className="label">Components</div>
          <div className="stack" style={{ paddingTop: 12 }}>
            <button className="btn primary">Save trip</button>
            <button className="btn secondary">Add booked trip</button>
            <Segmented label="Example" options={['Planning', 'Booked'] as const} value={seg} onChange={setSeg} />
          </div>
          <div className="hero" style={{ paddingTop: 28 }}>
            <div className="ring">
              <Ring value={22} total={30} />
              <div className="inside"><div className="num">8</div><div className="unit muted">days left</div></div>
            </div>
            <div className="disc"><div className="num">17</div><div className="unit">days to go</div></div>
          </div>
          <Warnings items={['Visa free ends Dec 31, 2026', 'You hit 183 days on Dec 12']} />
        </section>
      </main>
    </div>
  )
}
