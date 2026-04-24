import { useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { useAppDispatch } from '@/hooks/redux'
import { projectActions } from '@/store/projectSlice'
import { useViewportContext } from '@/components/canvas/Scene/ViewportContext'

interface DragState {
  pointerId: number
  segmentIndex: number
  startClientX: number
  startXOffset: number
  startZoom: number
}

interface Params {
  roomId: string
  rowId: string
  active: boolean
  initialXOffsets: number[]
  plankLength: number
}

export function useSegmentDrag({ roomId, rowId, active, initialXOffsets, plankLength }: Params) {
  const dispatch = useAppDispatch()
  const { viewport, svgRef } = useViewportContext()
  const [previewOffsets, setPreviewOffsets] = useState<number[] | null>(null)
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null)
  const dragRef = useRef<DragState | null>(null)
  const previewRef = useRef<number[] | null>(null)
  const initialRef = useRef(initialXOffsets)
  const zoomRef = useRef(viewport.zoom)
  const plankLengthRef = useRef(plankLength)

  useEffect(() => { initialRef.current = initialXOffsets }, [initialXOffsets])
  useEffect(() => { zoomRef.current = viewport.zoom }, [viewport.zoom])
  useEffect(() => { plankLengthRef.current = plankLength }, [plankLength])

  useEffect(() => {
    if (!active) {
      if (dragRef.current) {
        dragRef.current = null
        previewRef.current = null
        setDraggingIndex(null)
        setPreviewOffsets(null)
      }
      return
    }
    const svg = svgRef.current
    if (!svg) return

    const quantize = (n: number) => Math.round(n * 10) / 10

    const onMove = (e: PointerEvent) => {
      const drag = dragRef.current
      if (!drag || drag.pointerId !== e.pointerId) return
      const deltaScreen = e.clientX - drag.startClientX
      const deltaWorld = deltaScreen / drag.startZoom
      // Drag right → plank joints shift right → xOffset shrinks
      const maxOffset = Math.max(0, plankLengthRef.current - 0.1)
      const raw = quantize(drag.startXOffset - deltaWorld)
      const next = Math.max(0, Math.min(maxOffset, raw))
      const arr = previewRef.current ? [...previewRef.current] : [...initialRef.current]
      arr[drag.segmentIndex] = next
      previewRef.current = arr
      setPreviewOffsets(arr)
    }

    const finish = (commit: boolean, pointerId: number) => {
      const drag = dragRef.current
      if (!drag) return
      if (commit) {
        const final = previewRef.current?.[drag.segmentIndex] ?? drag.startXOffset
        dispatch(projectActions.updateSegmentOffset({
          roomId, rowId, segmentIndex: drag.segmentIndex, xOffset: final,
        }))
      }
      svg.releasePointerCapture?.(pointerId)
      dragRef.current = null
      previewRef.current = null
      setDraggingIndex(null)
      setPreviewOffsets(null)
    }

    const onUp = (e: PointerEvent) => {
      const drag = dragRef.current
      if (!drag || drag.pointerId !== e.pointerId) return
      finish(true, e.pointerId)
    }

    const onCancel = (e: PointerEvent) => {
      const drag = dragRef.current
      if (!drag || drag.pointerId !== e.pointerId) return
      finish(false, e.pointerId)
    }

    const onKey = (e: KeyboardEvent) => {
      const drag = dragRef.current
      if (e.key === 'Escape' && drag) finish(false, drag.pointerId)
    }

    svg.addEventListener('pointermove', onMove)
    svg.addEventListener('pointerup', onUp)
    svg.addEventListener('pointercancel', onCancel)
    window.addEventListener('keydown', onKey)
    return () => {
      svg.removeEventListener('pointermove', onMove)
      svg.removeEventListener('pointerup', onUp)
      svg.removeEventListener('pointercancel', onCancel)
      window.removeEventListener('keydown', onKey)
    }
  }, [active, svgRef, dispatch, roomId, rowId])

  const onSegmentPointerDown = (segmentIndex: number) => (e: ReactPointerEvent<SVGGElement>) => {
    if (!active) return
    if (e.button !== 0) return
    e.stopPropagation()
    e.preventDefault()
    const svg = svgRef.current
    svg?.setPointerCapture?.(e.pointerId)
    dragRef.current = {
      pointerId: e.pointerId,
      segmentIndex,
      startClientX: e.clientX,
      startXOffset: initialRef.current[segmentIndex] ?? 0,
      startZoom: zoomRef.current,
    }
    setDraggingIndex(segmentIndex)
  }

  return { previewOffsets, draggingIndex, onSegmentPointerDown }
}
