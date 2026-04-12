import { describe, it, expect } from 'vitest'
import { worldToScreen, screenToWorld, computeScale } from '@/core/geometry'

describe('worldToScreen', () => {
  it('applique zoom et pan', () => {
    const result = worldToScreen({ x: 10, y: 20 }, { zoom: 2, panX: 5, panY: 10 })
    expect(result).toEqual({ x: 25, y: 50 })
  })

  it('zoom 1 sans pan = coordonnées identiques', () => {
    const result = worldToScreen({ x: 100, y: 200 }, { zoom: 1, panX: 0, panY: 0 })
    expect(result).toEqual({ x: 100, y: 200 })
  })
})

describe('screenToWorld', () => {
  it('est l\'inverse de worldToScreen', () => {
    const viewport = { zoom: 2, panX: 5, panY: 10 }
    const world = { x: 10, y: 20 }
    const screen = worldToScreen(world, viewport)
    expect(screenToWorld(screen, viewport)).toEqual(world)
  })
})

describe('computeScale', () => {
  it('calcule l\'échelle depuis deux points et une distance réelle', () => {
    // 3px de distance écran, 30cm réels → 10 cm/px
    const scale = computeScale({ x: 0, y: 0 }, { x: 3, y: 0 }, 30)
    expect(scale).toBeCloseTo(10, 5)
  })

  it('fonctionne avec une distance diagonale', () => {
    // triangle 3-4-5 → 5px, 50cm réels → 10 cm/px
    const scale = computeScale({ x: 0, y: 0 }, { x: 3, y: 4 }, 50)
    expect(scale).toBeCloseTo(10, 5)
  })
})
