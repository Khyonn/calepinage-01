import { useEffect, useRef, useState } from 'react'
import type { Point } from '@/core/types'
import { findSnap } from '@/core/snap'
import { useAppDispatch } from '@/hooks/redux'
import { projectActions } from '@/store/projectSlice'
import { useViewportContext } from '@/components/canvas/Scene/ViewportContext'
import { useVertexEdit } from '../VertexEditContext'

interface DragState {
  pointerId: number
  index: number
  startVertices: Point[]
  shift: boolean
}

interface Params {
  roomId: string
  vertices: Point[]
  active: boolean
}

export function useVertexDrag({ roomId, vertices, active }: Params) {
  const dispatch = useAppDispatch()
  const { viewport, screenToWorld, svgRef } = useViewportContext()
  const { setDraft, clearDraft } = useVertexEdit()
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null)
  const dragRef = useRef<DragState | null>(null)
  const rootFontPx = typeof window !== 'undefined'
    ? parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
    : 16

  useEffect(() => {
    if (!active && dragRef.current) {
      clearDraft()
      dragRef.current = null
      setDraggingIndex(null)
    }
  }, [active, clearDraft])

  useEffect(() => {
    if (!active) return
    const svg = svgRef.current
    if (!svg) return

    const toWorld = (e: PointerEvent): Point => {
      const rect = svg.getBoundingClientRect()
      return screenToWorld({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    }

    const onMove = (e: PointerEvent) => {
      const drag = dragRef.current
      if (!drag || drag.pointerId !== e.pointerId) return
      const world = toWorld(e)
      const others = drag.startVertices.filter((_, i) => i !== drag.index)
      const target = e.ctrlKey
        ? findSnap(world, others, viewport.zoom, rootFontPx)
        : { x: world.x, y: world.y }
      const dx = target.x - drag.startVertices[drag.index].x
      const dy = target.y - drag.startVertices[drag.index].y
      const n = drag.startVertices.length
      const next = drag.startVertices.map((v, i) => {
        if (i === drag.index) return { x: target.x, y: target.y }
        if (e.shiftKey && (i === (drag.index - 1 + n) % n || i === (drag.index + 1) % n)) {
          return { x: v.x + dx, y: v.y + dy }
        }
        return v
      })
      setDraft(roomId, next)
    }

    const onUp = (e: PointerEvent) => {
      const drag = dragRef.current
      if (!drag || drag.pointerId !== e.pointerId) return
      const rect = svg.getBoundingClientRect()
      const world = screenToWorld({ x: e.clientX - rect.left, y: e.clientY - rect.top })
      const others = drag.startVertices.filter((_, i) => i !== drag.index)
      const target = e.ctrlKey
        ? findSnap(world, others, viewport.zoom, rootFontPx)
        : { x: world.x, y: world.y }
      const dx = target.x - drag.startVertices[drag.index].x
      const dy = target.y - drag.startVertices[drag.index].y
      const n = drag.startVertices.length
      const finalVertices = drag.startVertices.map((v, i) => {
        if (i === drag.index) return { x: target.x, y: target.y }
        if (e.shiftKey && (i === (drag.index - 1 + n) % n || i === (drag.index + 1) % n)) {
          return { x: v.x + dx, y: v.y + dy }
        }
        return v
      })
      dispatch(projectActions.updateRoom({ id: roomId, vertices: finalVertices }))
      clearDraft()
      dragRef.current = null
      setDraggingIndex(null)
      svg.releasePointerCapture?.(e.pointerId)
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dragRef.current) {
        const drag = dragRef.current
        clearDraft()
        dragRef.current = null
        setDraggingIndex(null)
        svg.releasePointerCapture?.(drag.pointerId)
      }
    }

    svg.addEventListener('pointermove', onMove)
    svg.addEventListener('pointerup', onUp)
    svg.addEventListener('pointercancel', onUp)
    window.addEventListener('keydown', onKey)
    return () => {
      svg.removeEventListener('pointermove', onMove)
      svg.removeEventListener('pointerup', onUp)
      svg.removeEventListener('pointercancel', onUp)
      window.removeEventListener('keydown', onKey)
    }
  }, [active, svgRef, screenToWorld, viewport.zoom, rootFontPx, roomId, dispatch, setDraft, clearDraft])

  const startDrag = (e: React.PointerEvent<SVGGElement>, index: number) => {
    if (!active) return
    if (e.button !== 0) return
    e.stopPropagation()
    const svg = svgRef.current
    svg?.setPointerCapture?.(e.pointerId)
    dragRef.current = {
      pointerId: e.pointerId,
      index,
      startVertices: vertices.map(v => ({ ...v })),
      shift: e.shiftKey,
    }
    setDraggingIndex(index)
  }

  return { startDrag, draggingIndex }
}
