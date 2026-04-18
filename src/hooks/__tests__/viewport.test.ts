import { describe, it, expect } from 'vitest'
import {
  screenToWorld,
  worldToScreen,
  zoomTowards,
  centerViewport,
  roomsBoundingBox,
  ZOOM_MIN,
  ZOOM_MAX,
} from '../viewport'

describe('screenToWorld', () => {
  it('identité à zoom=1 sans pan', () => {
    expect(screenToWorld(100, 200, { zoom: 1, panX: 0, panY: 0 })).toEqual({ x: 100, y: 200 })
  })
  it('applique zoom et pan', () => {
    expect(screenToWorld(120, 220, { zoom: 2, panX: 20, panY: 20 })).toEqual({ x: 50, y: 100 })
  })
})

describe('worldToScreen', () => {
  it('est l\'inverse de screenToWorld', () => {
    const vp = { zoom: 3, panX: 50, panY: -30 }
    const world = screenToWorld(100, 200, vp)
    const back = worldToScreen(world.x, world.y, vp)
    expect(back.x).toBeCloseTo(100)
    expect(back.y).toBeCloseTo(200)
  })
})

describe('zoomTowards', () => {
  it('conserve le point focal en coordonnées monde', () => {
    const vp = { zoom: 1, panX: 0, panY: 0 }
    const next = zoomTowards(vp, 200, 150, 2)
    const worldBefore = screenToWorld(200, 150, vp)
    const worldAfter = screenToWorld(200, 150, next)
    expect(worldAfter.x).toBeCloseTo(worldBefore.x)
    expect(worldAfter.y).toBeCloseTo(worldBefore.y)
  })
  it('conserve le point focal avec pan existant', () => {
    const vp = { zoom: 2, panX: -100, panY: 50 }
    const next = zoomTowards(vp, 400, 300, 1.5)
    const worldBefore = screenToWorld(400, 300, vp)
    const worldAfter = screenToWorld(400, 300, next)
    expect(worldAfter.x).toBeCloseTo(worldBefore.x)
    expect(worldAfter.y).toBeCloseTo(worldBefore.y)
  })
  it('plafonne au zoom minimum', () => {
    const vp = { zoom: ZOOM_MIN + 0.01, panX: 0, panY: 0 }
    const next = zoomTowards(vp, 0, 0, 0.01)
    expect(next.zoom).toBeGreaterThanOrEqual(ZOOM_MIN)
  })
  it('plafonne au zoom maximum', () => {
    const vp = { zoom: ZOOM_MAX - 1, panX: 0, panY: 0 }
    const next = zoomTowards(vp, 0, 0, 100)
    expect(next.zoom).toBeLessThanOrEqual(ZOOM_MAX)
  })
})

describe('centerViewport', () => {
  it('centre la bounding box dans la fenêtre', () => {
    const bbox = { minX: 0, minY: 0, maxX: 100, maxY: 100 }
    const vp = centerViewport(bbox, 800, 600, 4)
    const screen = worldToScreen(50, 50, vp)
    expect(screen.x).toBeCloseTo(400)
    expect(screen.y).toBeCloseTo(300)
  })
  it('fonctionne avec une bbox asymétrique', () => {
    const bbox = { minX: 10, minY: 20, maxX: 110, maxY: 70 }
    const vp = centerViewport(bbox, 1000, 800, 2)
    const cx = (10 + 110) / 2 // 60
    const cy = (20 + 70) / 2  // 45
    const screen = worldToScreen(cx, cy, vp)
    expect(screen.x).toBeCloseTo(500)
    expect(screen.y).toBeCloseTo(400)
  })
})

describe('roomsBoundingBox', () => {
  it('retourne null pour un tableau vide', () => {
    expect(roomsBoundingBox([])).toBeNull()
  })
  it('retourne null pour des pièces sans sommets', () => {
    expect(roomsBoundingBox([{ vertices: [] }])).toBeNull()
  })
  it('calcule la bbox sur plusieurs pièces', () => {
    const rooms = [
      { vertices: [{ x: 10, y: 20 }, { x: 50, y: 80 }] },
      { vertices: [{ x: -5, y: 5 }, { x: 30, y: 60 }] },
    ]
    expect(roomsBoundingBox(rooms)).toEqual({ minX: -5, minY: 5, maxX: 50, maxY: 80 })
  })
})
