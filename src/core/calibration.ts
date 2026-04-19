import type { Calibration } from '@/core/types'

export function computeScale(calibration: Calibration | undefined): number {
  if (!calibration) return 1
  const dx = calibration.point2.x - calibration.point1.x
  const dy = calibration.point2.y - calibration.point1.y
  const pixelDistance = Math.hypot(dx, dy)
  if (pixelDistance === 0) return 1
  return calibration.realDistance / pixelDistance
}
