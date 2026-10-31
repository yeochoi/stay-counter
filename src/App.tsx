import { CSSProperties, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { todayDay } from './lib/dates'
import { editStay, legs, Trip } from './lib/plan'
import { useStore } from './lib/store'
import { SheetClosing, useSheetOpen } from './lib/layers'
import { Tab, TabBar } from './components/ui'
import { Today } from './screens/Today'
import { ExportKind, Trips } from './screens/Trips'
import { TripFlow } from './screens/TripFlow'
import { EditStay } from './screens/EditStay'
import { Onboarding, Settings } from './screens/Setup'
import { DesignSystem } from './screens/DesignSystem'

type Overlay =
  | { kind: 'new'; booked: boolean }
  | { kind: 'trip'; trip: Trip }
  | { kind: 'stay'; trip: Trip; index: number }
  | { kind: 'settings' }
  | { kind: 'design'; from?: 'settings' }
  | null

export default function App() {
  const [state, setState] = useStore()
  const [tab, setTab] = useState<Tab>(() => (location.hash === '#trips' ? 'trips' : 'today'))
  const [overlay, setOverlay] = useState<Overlay>(() => (location.hash === '#design' ? { kind: 'design' } : null))
  useEffect(() => { window.scrollTo(0, 0) }, [tab])

  // A closing sheet stays on screen a moment longer, so it can slide down.
  const last = useRef(overlay)
  if (overlay) last.current = overlay
  const [gone, setGone] = useState(true)
  useEffect(() => {
    if (overlay) { setGone(false); return }
    const t = window.setTimeout(() => setGone(true), 320)
    return () => window.clearTimeout(t)
  }, [overlay])
  const closing = !overlay && !gone
  const shown = overlay ?? (closing ? last.current : null)

  // While a sheet is open on a phone, the page steps back behind it, smaller and dimmed, like iOS.
  const behind = useSheetOpen()
  const [sy, setSy] = useState(0)
  const syRef = useRef(0)
  useLayoutEffect(() => {
    document.documentElement.classList.toggle('sheet-open', behind)
    if (behind) {
      syRef.current = window.scrollY
      setSy(window.scrollY)
    } else {
      window.scrollTo(0, syRef.current)
    }
  }, [behind])

  const today = todayDay()
  const profile = state.profile
  const closeDesign = () => { if (location.hash) history.replaceState(null, '', location.pathname); setOverlay(null) }

  if (!profile) {
    return (
      <div className="app">
        <Onboarding onDone={(p) => setState((s) => ({ ...s, profile: p }))} />
        {overlay?.kind === 'design' && <DesignSystem onClose={closeDesign} />}
      </div>
    )
  }

  const save = (t: Trip) => {
    setState((s) => ({ ...s, trips: [...s.trips.filter((x) => x.id !== t.id), t] }))
    setOverlay(null)
  }
  const update = (t: Trip) => setState((s) => ({ ...s, trips: [...s.trips.filter((x) => x.id !== t.id), t] }))
  const remove = (id: string) => {
    setState((s) => ({ ...s, trips: s.trips.filter((x) => x.id !== id) }))
    setOverlay(null)
  }
  const exportCsv = (kind: ExportKind = 'All') => {
    const rows = [['Country', 'Arrive', 'Leave', 'Days', 'Type', 'Stays']]
    for (const t of [...state.trips].filter((x) => kind === 'All' || x.type === kind).sort((a, b) => a.start.localeCompare(b.start))) {
      const ls = legs(t, profile)
      rows.push([t.country, t.start, t.end, String(ls.reduce((n, l) => n + l.days, 0)), t.type, String(ls.length)])
    }
    const blob = new Blob([rows.map((r) => r.join(',')).join('\n')], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'stay-counter-trips.csv'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="app">
      <div className={`page${behind ? ' behind' : ''}`} style={{ '--sy': `${sy}px` } as CSSProperties}>
      {tab === 'today' ? (
        <Today
          trips={state.trips}
          profile={profile}
          today={today}
          onNew={(booked) => setOverlay({ kind: 'new', booked })}
          onOpen={(trip) => setOverlay({ kind: 'trip', trip })}
          onEditStay={(trip, index) => setOverlay({ kind: 'stay', trip, index })}
          onSettings={() => setOverlay({ kind: 'settings' })}
        />
      ) : (
        <Trips trips={state.trips} profile={profile} today={today} onOpen={(trip) => setOverlay({ kind: 'trip', trip })} onExport={exportCsv} onNew={() => setOverlay({ kind: 'new', booked: false })} />
      )}
      <TabBar tab={tab} onChange={setTab} />
      </div>

      <SheetClosing.Provider value={closing}>
      <div className={closing ? 'layer closing' : 'layer'}>
      {shown?.kind === 'new' && (
        <TripFlow profile={profile} trips={state.trips} today={today} startBooked={shown.booked} onClose={() => setOverlay(null)} onSave={save} onUpdate={update} onDelete={remove} />
      )}
      {shown?.kind === 'trip' && (
        <TripFlow key={shown.trip.id} profile={profile} trips={state.trips} today={today} existing={shown.trip} onClose={() => setOverlay(null)} onSave={save} onUpdate={update} onDelete={remove} />
      )}
      {shown?.kind === 'stay' && (
        <EditStay
          trip={shown.trip}
          profile={profile}
          index={shown.index}
          today={today}
          onCancel={() => setOverlay(null)}
          onSave={(s, e, b) => save(editStay(shown.trip, profile, shown.index, s, e, b))}
        />
      )}
      {shown?.kind === 'settings' && (
        <Settings
          profile={profile}
          onProfile={(p) => setState((s) => ({ ...s, profile: p }))}
          onClear={() => { setState((s) => ({ ...s, trips: [] })); setOverlay(null) }}
          onReset={() => { setState({ trips: [] }); setOverlay(null); setTab('today') }}
          onDesign={() => setOverlay({ kind: 'design', from: 'settings' })}
          onClose={() => setOverlay(null)}
        />
      )}
      {shown?.kind === 'design' && (shown.from === 'settings' ? <DesignSystem onBack={() => setOverlay({ kind: 'settings' })} onDismiss={() => setOverlay(null)} /> : <DesignSystem onClose={closeDesign} />)}
      </div>
      </SheetClosing.Provider>
    </div>
  )
}
