import { createContext, useSyncExternalStore } from 'react'

/** True while a sheet is on its way out, so the page behind can come forward at the same time. */
export const SheetClosing = createContext(false)

// Counts the sheets on screen, so the page behind knows when to step back.
let count = 0
const subs = new Set<() => void>()
const emit = () => subs.forEach((f) => f())

export const sheetLayer = {
  open() { count++; emit() },
  close() { count = Math.max(0, count - 1); emit() },
}

export function useSheetOpen() {
  return useSyncExternalStore(
    (f) => { subs.add(f); return () => { subs.delete(f) } },
    () => count > 0,
  )
}
