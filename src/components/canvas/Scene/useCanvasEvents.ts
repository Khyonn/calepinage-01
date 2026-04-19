import { useEffect, useRef, useState, type RefObject } from 'react'
import type { ViewportApi } from '@/hooks/useViewport'
import { useSpaceKey } from '@/hooks/useSpaceKey'

export type CursorMode = '' | 'spaceDown' | 'panning'

export function useCanvasEvents(
  svgRef: RefObject<SVGSVGElement | null>,
  api: ViewportApi,
): { cursorMode: CursorMode } {
  const [isPanning, setIsPanning] = useState(false)
  const { spaceDownRef, spaceDown } = useSpaceKey()
  const apiRef = useRef(api)
  apiRef.current = api
  const panStateRef = useRef<{ pointerId: number; lastX: number; lastY: number } | null>(null)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault()
        const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1
        apiRef.current.zoomAt(e.offsetX, e.offsetY, factor)
        return
      }
      if (e.shiftKey) {
        e.preventDefault()
        apiRef.current.pan(-e.deltaY, 0)
        return
      }
      e.preventDefault()
      apiRef.current.pan(-e.deltaX, -e.deltaY)
    }

    const handlePointerDown = (e: PointerEvent) => {
      const panButton = (spaceDownRef.current && e.button === 0) || e.button === 1
      if (!panButton) return
      e.preventDefault()
      svg.setPointerCapture(e.pointerId)
      panStateRef.current = { pointerId: e.pointerId, lastX: e.clientX, lastY: e.clientY }
      setIsPanning(true)
    }

    const handlePointerMove = (e: PointerEvent) => {
      const st = panStateRef.current
      if (!st || st.pointerId !== e.pointerId) return
      apiRef.current.pan(e.clientX - st.lastX, e.clientY - st.lastY)
      st.lastX = e.clientX
      st.lastY = e.clientY
    }

    const handlePointerEnd = (e: PointerEvent) => {
      const st = panStateRef.current
      if (!st || st.pointerId !== e.pointerId) return
      svg.releasePointerCapture?.(e.pointerId)
      panStateRef.current = null
      setIsPanning(false)
    }

    svg.addEventListener('wheel', handleWheel, { passive: false })
    svg.addEventListener('pointerdown', handlePointerDown)
    svg.addEventListener('pointermove', handlePointerMove)
    svg.addEventListener('pointerup', handlePointerEnd)
    svg.addEventListener('pointercancel', handlePointerEnd)

    return () => {
      svg.removeEventListener('wheel', handleWheel)
      svg.removeEventListener('pointerdown', handlePointerDown)
      svg.removeEventListener('pointermove', handlePointerMove)
      svg.removeEventListener('pointerup', handlePointerEnd)
      svg.removeEventListener('pointercancel', handlePointerEnd)
    }
  }, [svgRef, spaceDownRef])

  const cursorMode: CursorMode = isPanning ? 'panning' : spaceDown ? 'spaceDown' : ''
  return { cursorMode }
}
