import type { Point, Viewport } from '@/core/types'

export const ZOOM_MIN = 0.1
export const ZOOM_MAX = 10

export function worldToScreen(point: Point, viewport: Viewport): Point {
  return {
    x: point.x * viewport.zoom + viewport.panX,
    y: point.y * viewport.zoom + viewport.panY,
  }
}

export function screenToWorld(point: Point, viewport: Viewport): Point {
  return {
    x: (point.x - viewport.panX) / viewport.zoom,
    y: (point.y - viewport.panY) / viewport.zoom,
  }
}

export function clampZoom(zoom: number): number {
  if (!Number.isFinite(zoom)) return 1
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom))
}

/**
 * Zoom around a fixed screen point — the world coord under that screen point
 * stays invariant across the transform.
 */
export function zoomAroundPoint(
  viewport: Viewport,
  screenX: number,
  screenY: number,
  factor: number,
): Viewport {
  const nextZoom = clampZoom(viewport.zoom * factor)
  const effective = nextZoom / viewport.zoom
  return {
    zoom: nextZoom,
    panX: screenX - (screenX - viewport.panX) * effective,
    panY: screenY - (screenY - viewport.panY) * effective,
  }
}

const NICE_STEPS_CM = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000]

export interface NiceScale {
  /** Value in the chosen unit. */
  value: number
  /** 'cm' if value < 100 cm, 'm' above. */
  unit: 'cm' | 'm'
  /** Span in raw cm (for screen-width computation). */
  spanCm: number
}

/**
 * Pick the nicest round span ≤ `worldSpanCm`, choosing from {1, 2, 5} × 10^n cm.
 * Returns the value labeled in cm or m depending on magnitude.
 */
export function pickNiceScale(worldSpanCm: number): NiceScale {
  if (!Number.isFinite(worldSpanCm) || worldSpanCm <= 0) {
    return { value: 1, unit: 'cm', spanCm: 1 }
  }
  let chosen = NICE_STEPS_CM[0]
  for (const step of NICE_STEPS_CM) {
    if (step <= worldSpanCm) chosen = step
    else break
  }
  if (chosen >= 100) return { value: chosen / 100, unit: 'm', spanCm: chosen }
  return { value: chosen, unit: 'cm', spanCm: chosen }
}
