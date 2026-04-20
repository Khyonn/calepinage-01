import { useEffect, useRef, useState, type RefObject } from 'react'
import type { Point } from '@/core/types'
import { findSnap, type SnapResult } from '@/core/snap'
import { useSpaceKey } from '@/hooks/useSpaceKey'

const FORM_SELECTOR = 'input, textarea, select, [contenteditable]'

function focusInsideForm(): boolean {
  const el = document.activeElement as HTMLElement | null
  return !!el && typeof el.matches === 'function' && el.matches(FORM_SELECTOR)
}

interface Params {
  svgRef: RefObject<SVGSVGElement | null>
  screenToWorld: (p: Point) => Point
  zoom: number
  enabled: boolean
  onCommit: (vertices: Point[]) => void
}

export interface DrawInteractionState {
  vertices: Point[]
  cursor: Point | null
  snap: SnapResult | null
  ctrlDown: boolean
}

export function useDrawInteraction({ svgRef, screenToWorld, zoom, enabled, onCommit }: Params) {
  const [vertices, setVertices] = useState<Point[]>([])
  const [cursor, setCursor] = useState<Point | null>(null)
  const [snap, setSnap] = useState<SnapResult | null>(null)
  const [ctrlDown, setCtrlDown] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const { spaceDownRef } = useSpaceKey()

  const verticesRef = useRef<Point[]>([])
  const ctrlRef = useRef(false)
  verticesRef.current = vertices
  ctrlRef.current = ctrlDown

  const rootFontPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
  const closeThresholdPx = 0.75 * rootFontPx

  useEffect(() => {
    if (!enabled) {
      setVertices([])
      setCursor(null)
      setSnap(null)
      setDialogOpen(false)
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled) return
    const svg = svgRef.current
    if (!svg) return

    const toWorld = (e: PointerEvent): Point => {
      const rect = svg.getBoundingClientRect()
      return screenToWorld({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    }

    const handleMove = (e: PointerEvent) => {
      const world = toWorld(e)
      if (ctrlRef.current && verticesRef.current.length > 0) {
        const result = findSnap(world, verticesRef.current, zoom, rootFontPx)
        setSnap(result)
        setCursor({ x: result.x, y: result.y })
      } else {
        setSnap(null)
        setCursor(world)
      }
    }

    const handleDown = (e: PointerEvent) => {
      if (e.button !== 0 || spaceDownRef.current || dialogOpen) return
      svg.focus()
      const world = toWorld(e)
      const placed = ctrlRef.current
        ? findSnap(world, verticesRef.current, zoom, rootFontPx)
        : { x: world.x, y: world.y, snappedX: undefined, snappedY: undefined }
      const current = verticesRef.current

      if (current.length >= 3) {
        const first = current[0]
        const dx = (first.x - world.x) * zoom
        const dy = (first.y - world.y) * zoom
        if (Math.hypot(dx, dy) <= closeThresholdPx) {
          setDialogOpen(true)
          return
        }
      }
      setVertices([...current, { x: placed.x, y: placed.y }])
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (focusInsideForm()) {
        if (e.key === 'Escape') {
          setDialogOpen(false)
        }
        return
      }
      if (e.key === 'Control') { setCtrlDown(true); return }
      if (e.key === 'Enter') {
        e.preventDefault()
        if (verticesRef.current.length >= 3) setDialogOpen(true)
        return
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        setVertices(verticesRef.current.slice(0, -1))
        return
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        setVertices([])
        setDialogOpen(false)
        return
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Control') setCtrlDown(false)
    }

    svg.addEventListener('pointermove', handleMove)
    svg.addEventListener('pointerdown', handleDown)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      svg.removeEventListener('pointermove', handleMove)
      svg.removeEventListener('pointerdown', handleDown)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [enabled, svgRef, screenToWorld, zoom, rootFontPx, closeThresholdPx, spaceDownRef, dialogOpen])

  const commit = () => {
    onCommit(verticesRef.current)
    setVertices([])
    setSnap(null)
    setCursor(null)
    setDialogOpen(false)
  }

  const cancelDialog = () => setDialogOpen(false)

  return {
    vertices,
    cursor,
    snap,
    ctrlDown,
    dialogOpen,
    commit,
    cancelDialog,
  }
}
