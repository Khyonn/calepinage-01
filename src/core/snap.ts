import type { Point } from '@/core/types'

export interface SnapResult {
  x: number
  y: number
  snappedX?: number
  snappedY?: number
}

export function findSnap(
  cursor: Point,
  vertices: Point[],
  zoom: number,
  rootFontPx: number,
): SnapResult {
  const thresholdWorld = (0.75 * rootFontPx) / zoom
  let bestX: { dist: number; value: number } | undefined
  let bestY: { dist: number; value: number } | undefined

  for (const v of vertices) {
    const dx = Math.abs(v.x - cursor.x)
    if (dx <= thresholdWorld && (!bestX || dx < bestX.dist)) bestX = { dist: dx, value: v.x }
    const dy = Math.abs(v.y - cursor.y)
    if (dy <= thresholdWorld && (!bestY || dy < bestY.dist)) bestY = { dist: dy, value: v.y }
  }

  return {
    x: bestX?.value ?? cursor.x,
    y: bestY?.value ?? cursor.y,
    snappedX: bestX?.value,
    snappedY: bestY?.value,
  }
}
