import { useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { uiActions } from '@/store/uiSlice'
import type { AppDispatch, InteractionMode } from '@/store/types'
import type { Viewport } from '@/core/types'
import { zoomTowards } from '@/hooks/viewport'

const WHEEL_ZOOM_SENSITIVITY = 0.002
const PAN_KEY_STEP = 30

const FORM_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT'])

function isFormElement(target: EventTarget | null): boolean {
  if (!target) return false
  const el = target as HTMLElement
  return FORM_TAGS.has(el.tagName) || el.isContentEditable
}

export function useCanvasEvents(
  svgRef: React.RefObject<SVGSVGElement | null>,
  viewportRef: React.MutableRefObject<Viewport>,
  modeRef: React.MutableRefObject<InteractionMode>,
) {
  const dispatch = useDispatch<AppDispatch>()
  const isPanning = useRef(false)
  const lastPointer = useRef({ x: 0, y: 0 })
  const isSpaceDown = useRef(false)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    function setVp(vp: Viewport) {
      dispatch(uiActions.setViewport(vp))
    }

    function handleWheel(e: WheelEvent) {
      e.preventDefault()
      const vp = viewportRef.current
      const rect = svg!.getBoundingClientRect()

      if (e.ctrlKey) {
        const factor = Math.exp(-e.deltaY * WHEEL_ZOOM_SENSITIVITY)
        setVp(zoomTowards(vp, e.clientX - rect.left, e.clientY - rect.top, factor))
      } else if (e.shiftKey) {
        setVp({ ...vp, panX: vp.panX - e.deltaY })
      } else {
        setVp({ ...vp, panY: vp.panY - e.deltaY })
      }
    }

    function startPan(clientX: number, clientY: number, pointerId: number) {
      isPanning.current = true
      lastPointer.current = { x: clientX, y: clientY }
      svg!.setPointerCapture(pointerId)
      svg!.style.cursor = 'grabbing'
    }

    function handlePointerDown(e: PointerEvent) {
      const isMiddle = e.button === 1
      const isNavLeft = e.button === 0 && modeRef.current === 'nav'
      const isSpaceLeft = e.button === 0 && isSpaceDown.current

      if (isMiddle || isNavLeft || isSpaceLeft) {
        e.preventDefault()
        startPan(e.clientX, e.clientY, e.pointerId)
      }
    }

    function handlePointerMove(e: PointerEvent) {
      if (!isPanning.current) return
      const vp = viewportRef.current
      const dx = e.clientX - lastPointer.current.x
      const dy = e.clientY - lastPointer.current.y
      lastPointer.current = { x: e.clientX, y: e.clientY }
      setVp({ ...vp, panX: vp.panX + dx, panY: vp.panY + dy })
    }

    function stopPan() {
      isPanning.current = false
      svg!.style.cursor = ''
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (isFormElement(e.target)) return

      if (e.key === ' ') {
        isSpaceDown.current = true
        e.preventDefault()
        return
      }

      if (!e.ctrlKey) return
      const vp = viewportRef.current
      switch (e.key) {
        case 'ArrowLeft':  setVp({ ...vp, panX: vp.panX + PAN_KEY_STEP }); e.preventDefault(); break
        case 'ArrowRight': setVp({ ...vp, panX: vp.panX - PAN_KEY_STEP }); e.preventDefault(); break
        case 'ArrowUp':    setVp({ ...vp, panY: vp.panY + PAN_KEY_STEP }); e.preventDefault(); break
        case 'ArrowDown':  setVp({ ...vp, panY: vp.panY - PAN_KEY_STEP }); e.preventDefault(); break
      }
    }

    function handleKeyUp(e: KeyboardEvent) {
      if (e.key === ' ') isSpaceDown.current = false
    }

    svg.addEventListener('wheel', handleWheel, { passive: false })
    svg.addEventListener('pointerdown', handlePointerDown)
    svg.addEventListener('pointermove', handlePointerMove)
    svg.addEventListener('pointerup', stopPan)
    svg.addEventListener('pointercancel', stopPan)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      svg.removeEventListener('wheel', handleWheel)
      svg.removeEventListener('pointerdown', handlePointerDown)
      svg.removeEventListener('pointermove', handlePointerMove)
      svg.removeEventListener('pointerup', stopPan)
      svg.removeEventListener('pointercancel', stopPan)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [svgRef, viewportRef, modeRef, dispatch])
}
