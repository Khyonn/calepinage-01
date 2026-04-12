import type { Point, Viewport } from '@/core/types'

/**
 * Convert a point from world coordinates (cm) to screen coordinates (px).
 */
export function worldToScreen(point: Point, viewport: Viewport): Point {
  return {
    x: point.x * viewport.zoom + viewport.panX,
    y: point.y * viewport.zoom + viewport.panY,
  }
}

/**
 * Convert a point from screen coordinates (px) to world coordinates (cm).
 */
export function screenToWorld(point: Point, viewport: Viewport): Point {
  return {
    x: (point.x - viewport.panX) / viewport.zoom,
    y: (point.y - viewport.panY) / viewport.zoom,
  }
}

/**
 * Compute the scale factor (cm per pixel) from a calibration's two points
 * and the known real distance between them.
 */
export function computeScale(
  point1: Point,
  point2: Point,
  realDistance: number,
): number {
  const dx = point2.x - point1.x
  const dy = point2.y - point1.y
  const pixelDistance = Math.sqrt(dx * dx + dy * dy)
  return realDistance / pixelDistance
}
