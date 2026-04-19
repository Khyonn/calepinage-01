import { useEffect, useRef, useState, type RefObject } from 'react'
import type { ViewportApi } from '@/hooks/useViewport'

const FORM_SELECTOR = 'input, textarea, select, [contenteditable]'

function focusInsideForm(): boolean {
  const el = document.activeElement as HTMLElement | null
  return !!el && el.matches?.(FORM_SELECTOR)
}

export type CursorMode = '' | 'spaceDown' | 'panning'

export function useCanvasEvents(
  svgRef: RefObject<SVGSVGElement | null>,
  api: ViewportApi,
): { cursorMode: CursorMode } {
  const [cursorMode, setCursorMode] = useState<CursorMode>('')
  const apiRef = useRef(api)
  apiRef.current = api
  const spaceDownRef = useRef(false)
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
      setCursorMode('panning')
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
      setCursorMode(spaceDownRef.current ? 'spaceDown' : '')
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || focusInsideForm()) return
      if (document.activeElement !== svg) return
      e.preventDefault()
      if (spaceDownRef.current) return
      spaceDownRef.current = true
      if (!panStateRef.current) setCursorMode('spaceDown')
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return
      spaceDownRef.current = false
      if (!panStateRef.current) setCursorMode('')
    }

    svg.addEventListener('wheel', handleWheel, { passive: false })
    svg.addEventListener('pointerdown', handlePointerDown)
    svg.addEventListener('pointermove', handlePointerMove)
    svg.addEventListener('pointerup', handlePointerEnd)
    svg.addEventListener('pointercancel', handlePointerEnd)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      svg.removeEventListener('wheel', handleWheel)
      svg.removeEventListener('pointerdown', handlePointerDown)
      svg.removeEventListener('pointermove', handlePointerMove)
      svg.removeEventListener('pointerup', handlePointerEnd)
      svg.removeEventListener('pointercancel', handlePointerEnd)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [svgRef])

  return { cursorMode }
}
