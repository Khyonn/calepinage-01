import { createContext, useContext } from 'react'
import type { Point } from '@/core/types'

export interface CalibrationContextValue {
  active: boolean
  point1: Point
  point2: Point
  initialDistance: number | null
  setPoint1: (p: Point) => void
  setPoint2: (p: Point) => void
  start: (p1: Point, p2: Point, initialDistance: number | null) => void
  cancel: () => void
  validate: (distance: number) => void
}

export const CalibrationContext = createContext<CalibrationContextValue | null>(null)

export function useCalibrationContext(): CalibrationContextValue | null {
  return useContext(CalibrationContext)
}
