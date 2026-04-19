import { useEffect, useRef, type RefObject } from 'react'
import { useViewportContext } from '@/components/canvas/Scene/ViewportContext'
import type { Point } from '@/core/types'
import { worldPointToImage, type PlanTransform } from './geometry'

interface Params {
  groupRef: RefObject<SVGGElement | null>
  transform: PlanTransform
  onChange: (imagePoint: Point) => void
}

interface DragState {
  pointerId: number
}

export function useOverlayPointDrag({ groupRef, transform, onChange }: Params): void {
  const { screenToWorld } = useViewportContext()
  const screenToWorldRef = useRef(screenToWorld)
  screenToWorldRef.current = screenToWorld
  const transformRef = useRef(transform)
  transformRef.current = transform
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const stateRef = useRef<DragState | null>(null)

  useEffect(() => {
    const el = groupRef.current
    if (!el) return

    const svg = el.ownerSVGElement
    if (!svg) return

    const screenOf = (e: PointerEvent): Point => {
      const rect = svg.getBoundingClientRect()
      return { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }

    const handleDown = (e: PointerEvent) => {
      if (e.button !== 0) return
      e.stopPropagation()
      e.preventDefault()
      el.setPointerCapture(e.pointerId)
      stateRef.current = { pointerId: e.pointerId }
    }

    const handleMove = (e: PointerEvent) => {
      const st = stateRef.current
      if (!st || st.pointerId !== e.pointerId) return
      const world = screenToWorldRef.current(screenOf(e))
      onChangeRef.current(worldPointToImage(world, transformRef.current))
    }

    const handleEnd = (e: PointerEvent) => {
      const st = stateRef.current
      if (!st || st.pointerId !== e.pointerId) return
      el.releasePointerCapture?.(e.pointerId)
      stateRef.current = null
    }

    el.addEventListener('pointerdown', handleDown)
    el.addEventListener('pointermove', handleMove)
    el.addEventListener('pointerup', handleEnd)
    el.addEventListener('pointercancel', handleEnd)

    return () => {
      el.removeEventListener('pointerdown', handleDown)
      el.removeEventListener('pointermove', handleMove)
      el.removeEventListener('pointerup', handleEnd)
      el.removeEventListener('pointercancel', handleEnd)
    }
  }, [groupRef])
}
