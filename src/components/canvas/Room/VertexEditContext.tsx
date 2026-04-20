import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Point } from '@/core/types'

interface DraftState {
  roomId: string
  vertices: Point[]
}

export interface VertexEditContextValue {
  draft: DraftState | null
  setDraft: (roomId: string, vertices: Point[]) => void
  clearDraft: () => void
}

const VertexEditContext = createContext<VertexEditContextValue | null>(null)

export function VertexEditProvider({ children }: { children: ReactNode }) {
  const [draft, setDraftState] = useState<DraftState | null>(null)
  const setDraft = useCallback((roomId: string, vertices: Point[]) => {
    setDraftState({ roomId, vertices })
  }, [])
  const clearDraft = useCallback(() => setDraftState(null), [])
  return (
    <VertexEditContext.Provider value={{ draft, setDraft, clearDraft }}>
      {children}
    </VertexEditContext.Provider>
  )
}

export function useVertexEdit(): VertexEditContextValue {
  const ctx = useContext(VertexEditContext)
  if (!ctx) throw new Error('useVertexEdit must be used within <VertexEditProvider>')
  return ctx
}
