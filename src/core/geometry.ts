import type { Point } from '@/core/types'

export function roundToTenth(value: number): number {
  return Math.round(value * 10) / 10
}

/**
 * Compute the X intervals of the intersection between a horizontal strip [y1, y2]
 * and a polygon defined by its vertices (in order, closed).
 *
 * Uses a scanline at the strip midpoint with the even-odd rule.
 * Returns sorted [xStart, xEnd] pairs — one per disjoint segment inside the polygon.
 */
export function intersectStripWithPolygon(
  vertices: Point[],
  y1: number,
  y2: number,
): [number, number][] {
  const yMid = (y1 + y2) / 2
  const xIntercepts: number[] = []

  for (let i = 0; i < vertices.length; i++) {
    const p1 = vertices[i]
    const p2 = vertices[(i + 1) % vertices.length]
    const crosses = (p1.y <= yMid && p2.y > yMid) || (p2.y <= yMid && p1.y > yMid)
    if (crosses) {
      const t = (yMid - p1.y) / (p2.y - p1.y)
      xIntercepts.push(p1.x + t * (p2.x - p1.x))
    }
  }

  xIntercepts.sort((a, b) => a - b)

  const segments: [number, number][] = []
  for (let i = 0; i + 1 < xIntercepts.length; i += 2) {
    segments.push([xIntercepts[i], xIntercepts[i + 1]])
  }
  return segments
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
