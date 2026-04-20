import type { Point } from '@/core/types'

export function roundToTenth(value: number): number {
  return Math.round(value * 10) / 10
}

function scanlineAt(vertices: Point[], y: number): [number, number][] {
  const xIntercepts: number[] = []
  for (let i = 0; i < vertices.length; i++) {
    const p1 = vertices[i]
    const p2 = vertices[(i + 1) % vertices.length]
    const crosses = (p1.y <= y && p2.y > y) || (p2.y <= y && p1.y > y)
    if (crosses) {
      const t = (y - p1.y) / (p2.y - p1.y)
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
  return scanlineAt(vertices, (y1 + y2) / 2)
}

/**
 * Compute the X extents of a strip [y1, y2] across the polygon, using the
 * widest bounds on the whole band (min X and max X reached anywhere between
 * y1 and y2) — not just the midpoint scanline.
 *
 * Partition comes from the midpoint scanline; each base segment is then
 * extended using samples at y1, y2, and any vertex.y strictly inside the band.
 * This handles diagonal walls (e.g. "L inversé" corners) where the row must
 * start at the leftmost X reached over its own height.
 */
export function intersectStripExtents(
  vertices: Point[],
  y1: number,
  y2: number,
): [number, number][] {
  const base = intersectStripWithPolygon(vertices, y1, y2)
  if (base.length === 0) return []

  const eps = 1e-6
  const sampleYs = new Set<number>([y1 + eps, y2 - eps])
  for (const v of vertices) {
    if (v.y > y1 + eps && v.y < y2 - eps) sampleYs.add(v.y)
  }

  const extents = base.map(([a, b]) => ({ min: a, max: b }))

  for (const y of sampleYs) {
    const segs = scanlineAt(vertices, y)
    for (const [sa, sb] of segs) {
      for (const ext of extents) {
        if (sa < ext.max && sb > ext.min) {
          if (sa < ext.min) ext.min = sa
          if (sb > ext.max) ext.max = sb
          break
        }
      }
    }
  }

  return extents.map(e => [e.min, e.max])
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
