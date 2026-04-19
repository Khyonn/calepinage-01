import { useCallback, useRef, useState, type ReactNode } from 'react'
import { useAppDispatch } from '@/hooks/redux'
import { projectActions } from '@/store/projectSlice'
import type { Point } from '@/core/types'
import { CalibrationContext, type CalibrationContextValue } from './CalibrationContext'

interface DraftState {
  active: boolean
  point1: Point
  point2: Point
  initialDistance: number | null
}

const IDLE: DraftState = {
  active: false,
  point1: { x: 0, y: 0 },
  point2: { x: 0, y: 0 },
  initialDistance: null,
}

export function CalibrationProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch()
  const [draft, setDraft] = useState<DraftState>(IDLE)
  const draftRef = useRef(draft)
  draftRef.current = draft

  const start = useCallback((p1: Point, p2: Point, initialDistance: number | null) => {
    setDraft({ active: true, point1: p1, point2: p2, initialDistance })
  }, [])

  const cancel = useCallback(() => setDraft(IDLE), [])

  const setPoint1 = useCallback((p: Point) => setDraft(d => ({ ...d, point1: p })), [])
  const setPoint2 = useCallback((p: Point) => setDraft(d => ({ ...d, point2: p })), [])

  const validate = useCallback((distance: number) => {
    const current = draftRef.current
    if (!current.active) return
    dispatch(projectActions.updatePlan({
      calibration: { point1: current.point1, point2: current.point2, realDistance: distance },
    }))
    setDraft(IDLE)
  }, [dispatch])

  const value: CalibrationContextValue = {
    active: draft.active,
    point1: draft.point1,
    point2: draft.point2,
    initialDistance: draft.initialDistance,
    setPoint1,
    setPoint2,
    start,
    cancel,
    validate,
  }

  return (
    <CalibrationContext.Provider value={value}>
      {children}
    </CalibrationContext.Provider>
  )
}
