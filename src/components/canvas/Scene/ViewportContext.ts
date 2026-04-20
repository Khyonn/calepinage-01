import { createContext, useContext, type RefObject } from 'react'
import type { ViewportApi } from '@/hooks/useViewport'

export interface SceneContextValue extends ViewportApi {
  svgRef: RefObject<SVGSVGElement | null>
}

export const ViewportContext = createContext<SceneContextValue | null>(null)

export function useViewportContext(): SceneContextValue {
  const ctx = useContext(ViewportContext)
  if (!ctx) throw new Error('useViewportContext must be used within <Scene>')
  return ctx
}
