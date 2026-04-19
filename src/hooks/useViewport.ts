import { useCallback, useMemo, useState } from 'react'
import type { Point, Viewport } from '@/core/types'
import {
  worldToScreen as worldToScreenPure,
  screenToWorld as screenToWorldPure,
  zoomAroundPoint,
  clampZoom,
} from '@/core/viewport'

const INITIAL: Viewport = { zoom: 2, panX: 0, panY: 0 }

export interface ViewportApi {
  viewport: Viewport
  setViewport: (v: Viewport) => void
  pan: (dx: number, dy: number) => void
  zoomAt: (screenX: number, screenY: number, factor: number) => void
  worldToScreen: (p: Point) => Point
  screenToWorld: (p: Point) => Point
}

export function useViewport(initial: Viewport = INITIAL): ViewportApi {
  const [viewport, setViewportState] = useState<Viewport>(initial)

  const setViewport = useCallback((v: Viewport) => {
    setViewportState({ ...v, zoom: clampZoom(v.zoom) })
  }, [])

  const pan = useCallback((dx: number, dy: number) => {
    setViewportState(v => ({ ...v, panX: v.panX + dx, panY: v.panY + dy }))
  }, [])

  const zoomAt = useCallback((screenX: number, screenY: number, factor: number) => {
    setViewportState(v => zoomAroundPoint(v, screenX, screenY, factor))
  }, [])

  const helpers = useMemo(() => ({
    worldToScreen: (p: Point) => worldToScreenPure(p, viewport),
    screenToWorld: (p: Point) => screenToWorldPure(p, viewport),
  }), [viewport])

  return { viewport, setViewport, pan, zoomAt, ...helpers }
}
