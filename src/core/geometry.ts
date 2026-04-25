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
 * Samples the polygon at the midpoint, just inside y1 and y2, and any vertex
 * strictly inside the band. Merges all scanline segments across samples into
 * disjoint extents. Handles diagonal walls (e.g. "L inversé") where the row
 * must start at the leftmost X reached over its own height, and degenerate
 * cases where the strip exceeds the polygon on one side (last row with
 * `remainingHeight < plankWidth/2`) — the midpoint may be outside, but
 * samples at y1 remain inside.
 */
export function intersectStripExtents(
  vertices: Point[],
  y1: number,
  y2: number,
): [number, number][] {
  const eps = 1e-6
  const sampleYs = new Set<number>([(y1 + y2) / 2, y1 + eps, y2 - eps])
  for (const v of vertices) {
    if (v.y > y1 + eps && v.y < y2 - eps) sampleYs.add(v.y)
  }

  const allSegs: [number, number][] = []
  for (const y of sampleYs) {
    for (const seg of scanlineAt(vertices, y)) allSegs.push(seg)
  }
  if (allSegs.length === 0) return []

  allSegs.sort((a, b) => a[0] - b[0])
  const merged: [number, number][] = [[allSegs[0][0], allSegs[0][1]]]
  for (let i = 1; i < allSegs.length; i++) {
    const [sa, sb] = allSegs[i]
    const last = merged[merged.length - 1]
    if (sa <= last[1]) {
      last[1] = Math.max(last[1], sb)
    } else {
      merged.push([sa, sb])
    }
  }
  return merged
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
