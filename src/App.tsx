import { useEffect, useState } from 'react'
import { todayDay } from './lib/dates'
import { editStay, legs, Trip } from './lib/plan'
import { sampleTrips, useStore } from './lib/store'
import { Tab, TabBar } from './components/ui'
import { Today } from './screens/Today'
import { Trips } from './screens/Trips'
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
  const today = state.previewDate ?? todayDay()
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
  const exportCsv = () => {
    const rows = [['Country', 'Arrive', 'Leave', 'Days', 'Type', 'Stays']]
    for (const t of [...state.trips].sort((a, b) => a.start.localeCompare(b.start))) {
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

      {overlay?.kind === 'new' && (
        <TripFlow profile={profile} trips={state.trips} today={today} startBooked={overlay.booked} onClose={() => setOverlay(null)} onSave={save} onUpdate={update} onDelete={remove} />
      )}
      {overlay?.kind === 'trip' && (
        <TripFlow key={overlay.trip.id} profile={profile} trips={state.trips} today={today} existing={overlay.trip} onClose={() => setOverlay(null)} onSave={save} onUpdate={update} onDelete={remove} />
      )}
      {overlay?.kind === 'stay' && (
        <EditStay
          trip={overlay.trip}
          profile={profile}
          index={overlay.index}
          today={today}
          onCancel={() => setOverlay(null)}
          onSave={(s, e) => save(editStay(overlay.trip, profile, overlay.index, s, e))}
        />
      )}
      {overlay?.kind === 'settings' && (
        <Settings
          profile={profile}
          previewDate={state.previewDate}
          onProfile={(p) => setState((s) => ({ ...s, profile: p }))}
          onPreview={(d) => setState((s) => ({ ...s, previewDate: d }))}
          onSample={() => { setState((s) => ({ ...s, trips: sampleTrips(), previewDate: '2026-10-15' })); setOverlay(null); setTab('today') }}
          onClear={() => { setState((s) => ({ ...s, trips: [] })); setOverlay(null) }}
          onReset={() => { setState({ trips: [] }); setOverlay(null); setTab('today') }}
          onDesign={() => setOverlay({ kind: 'design', from: 'settings' })}
          onClose={() => setOverlay(null)}
        />
      )}
      {overlay?.kind === 'design' && (overlay.from === 'settings' ? <DesignSystem onBack={() => setOverlay({ kind: 'settings' })} /> : <DesignSystem onClose={closeDesign} />)}
    </div>
  )
}
