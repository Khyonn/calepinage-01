import { useEffect, useRef, type RefObject } from 'react'
import { useAppDispatch } from '@/hooks/redux'
import { projectActions } from '@/store/projectSlice'
import { useSpaceKey } from '@/hooks/useSpaceKey'
import { useViewportContext } from '@/components/canvas/Scene/ViewportContext'
import type { BackgroundPlan } from '@/core/types'
import type { InteractionMode } from '@/store/types'

interface Params {
  imageRef: RefObject<SVGImageElement | null>
  plan: BackgroundPlan | null
  mode: InteractionMode
}

interface DragState {
  pointerId: number
  startClientX: number
  startClientY: number
  startPlanX: number
  startPlanY: number
}

export function useBackgroundPlanDrag({ imageRef, plan, mode }: Params): void {
  const dispatch = useAppDispatch()
  const { spaceDownRef } = useSpaceKey()
  const { viewport } = useViewportContext()
  const zoomRef = useRef(viewport.zoom)
  zoomRef.current = viewport.zoom
  const dragStateRef = useRef<DragState | null>(null)
  const planRef = useRef(plan)
  planRef.current = plan

  useEffect(() => {
    const img = imageRef.current
    if (!img || !plan || mode !== 'plan') return

    const handlePointerDown = (e: PointerEvent) => {
      if (spaceDownRef.current || e.button !== 0) return
      e.stopPropagation()
      e.preventDefault()
      img.setPointerCapture(e.pointerId)
      dragStateRef.current = {
        pointerId: e.pointerId,
        startClientX: e.clientX,
        startClientY: e.clientY,
        startPlanX: planRef.current?.x ?? 0,
        startPlanY: planRef.current?.y ?? 0,
      }
    }

    const handlePointerMove = (e: PointerEvent) => {
      const st = dragStateRef.current
      if (!st || st.pointerId !== e.pointerId) return
      const zoom = zoomRef.current || 1
      dispatch(projectActions.updatePlan({
        x: st.startPlanX + (e.clientX - st.startClientX) / zoom,
        y: st.startPlanY + (e.clientY - st.startClientY) / zoom,
      }))
    }

    const handlePointerEnd = (e: PointerEvent) => {
      const st = dragStateRef.current
      if (!st || st.pointerId !== e.pointerId) return
      img.releasePointerCapture?.(e.pointerId)
      dragStateRef.current = null
    }

    img.addEventListener('pointerdown', handlePointerDown)
    img.addEventListener('pointermove', handlePointerMove)
    img.addEventListener('pointerup', handlePointerEnd)
    img.addEventListener('pointercancel', handlePointerEnd)

    return () => {
      img.removeEventListener('pointerdown', handlePointerDown)
      img.removeEventListener('pointermove', handlePointerMove)
      img.removeEventListener('pointerup', handlePointerEnd)
      img.removeEventListener('pointercancel', handlePointerEnd)
    }
  }, [imageRef, plan, mode, dispatch, spaceDownRef])
}
