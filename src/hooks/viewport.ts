import type { Point, Viewport } from '@/core/types'

export const ZOOM_MIN = 0.2
export const ZOOM_MAX = 40

export interface BoundingBox {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

export function screenToWorld(screenX: number, screenY: number, vp: Viewport): Point {
  return {
    x: (screenX - vp.panX) / vp.zoom,
    y: (screenY - vp.panY) / vp.zoom,
  }
}

export function worldToScreen(worldX: number, worldY: number, vp: Viewport): Point {
  return {
    x: worldX * vp.zoom + vp.panX,
    y: worldY * vp.zoom + vp.panY,
  }
}

export function zoomTowards(vp: Viewport, focalScreenX: number, focalScreenY: number, factor: number): Viewport {
  const nextZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, vp.zoom * factor))
  const scale = nextZoom / vp.zoom
  return {
    zoom: nextZoom,
    panX: focalScreenX - (focalScreenX - vp.panX) * scale,
    panY: focalScreenY - (focalScreenY - vp.panY) * scale,
  }
}

export function centerViewport(bbox: BoundingBox, svgWidth: number, svgHeight: number, zoom: number): Viewport {
  const cx = (bbox.minX + bbox.maxX) / 2
  const cy = (bbox.minY + bbox.maxY) / 2
  return {
    zoom,
    panX: svgWidth / 2 - cx * zoom,
    panY: svgHeight / 2 - cy * zoom,
  }
}

export function roomsBoundingBox(rooms: { vertices: Point[] }[]): BoundingBox | null {
  const allPts = rooms.flatMap(r => r.vertices)
  if (allPts.length === 0) return null
  return {
    minX: Math.min(...allPts.map(p => p.x)),
    minY: Math.min(...allPts.map(p => p.y)),
    maxX: Math.max(...allPts.map(p => p.x)),
    maxY: Math.max(...allPts.map(p => p.y)),
  }
}
