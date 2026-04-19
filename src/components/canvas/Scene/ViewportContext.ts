import { createContext, useContext } from 'react'
import type { ViewportApi } from '@/hooks/useViewport'

export const ViewportContext = createContext<ViewportApi | null>(null)

export function useViewportContext(): ViewportApi {
  const ctx = useContext(ViewportContext)
  if (!ctx) throw new Error('useViewportContext must be used within <Scene>')
  return ctx
}
