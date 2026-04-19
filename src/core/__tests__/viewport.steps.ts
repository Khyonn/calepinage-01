import { expect } from 'vitest'
import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import {
  worldToScreen,
  screenToWorld,
  clampZoom,
  zoomAroundPoint,
  pickNiceScale,
} from '@/core/viewport'
import type { Point, Viewport } from '@/core/types'

const feature = await loadFeature('src/core/__tests__/viewport.feature', { language: 'fr' })

describeFeature(feature, ({ Scenario }) => {

  Scenario('Conversion monde vers écran avec zoom et décalage', ({ When, Then }) => {
    let screen: Point
    When('je convertis le point monde (10, 20) avec un zoom de 2 et un décalage de (5, 10)', () => {
      screen = worldToScreen({ x: 10, y: 20 }, { zoom: 2, panX: 5, panY: 10 })
    })
    Then('le point écran est (25, 50)', () => {
      expect(screen).toEqual({ x: 25, y: 50 })
    })
  })

  Scenario('Conversion monde vers écran sans transformation', ({ When, Then }) => {
    let screen: Point
    When('je convertis le point monde (100, 200) avec un zoom de 1 et aucun décalage', () => {
      screen = worldToScreen({ x: 100, y: 200 }, { zoom: 1, panX: 0, panY: 0 })
    })
    Then('le point écran est (100, 200)', () => {
      expect(screen).toEqual({ x: 100, y: 200 })
    })
  })

  Scenario('La conversion écran vers monde est l\'inverse de monde vers écran', ({ Given, When, Then }) => {
    const viewport: Viewport = { zoom: 2, panX: 5, panY: 10 }
    let screenPoint: Point
    let worldPoint: Point
    Given('le point monde (10, 20) converti vers l\'écran avec un zoom de 2 et un décalage de (5, 10)', () => {
      screenPoint = worldToScreen({ x: 10, y: 20 }, viewport)
    })
    When('je reconvertis ce point vers le repère monde', () => {
      worldPoint = screenToWorld(screenPoint, viewport)
    })
    Then('j\'obtiens le point monde d\'origine (10, 20)', () => {
      expect(worldPoint).toEqual({ x: 10, y: 20 })
    })
  })

  Scenario('Zoom borné au minimum', ({ When, Then }) => {
    let z = 0
    When('je clampe le zoom 0.01', () => { z = clampZoom(0.01) })
    Then('le zoom résultant est 0.1', () => { expect(z).toBeCloseTo(0.1, 10) })
  })

  Scenario('Zoom borné au maximum', ({ When, Then }) => {
    let z = 0
    When('je clampe le zoom 100', () => { z = clampZoom(100) })
    Then('le zoom résultant est 10', () => { expect(z).toBe(10) })
  })

  Scenario('Zoom autour d\'un point garde le point écran invariant', ({ Given, When, Then }) => {
    let vp: Viewport = { zoom: 2, panX: 50, panY: 60 }
    const screenPoint: Point = { x: 100, y: 80 }
    let worldBefore: Point = { x: 0, y: 0 }
    Given('un viewport zoom 2 décalage (50, 60) et le point écran (100, 80)', () => {
      worldBefore = screenToWorld(screenPoint, vp)
    })
    When('je zoome de facteur 1.5 autour de ce point', () => {
      vp = zoomAroundPoint(vp, screenPoint.x, screenPoint.y, 1.5)
    })
    Then('le point monde sous le point écran est inchangé', () => {
      const after = screenToWorld(screenPoint, vp)
      expect(after.x).toBeCloseTo(worldBefore.x, 8)
      expect(after.y).toBeCloseTo(worldBefore.y, 8)
    })
  })

  Scenario('Échelle ronde pour un span donné', ({ When, Then }) => {
    let scale = pickNiceScale(1)
    When('je choisis l\'échelle ronde pour un span monde de 37 cm', () => {
      scale = pickNiceScale(37)
    })
    Then('la valeur est 20 et l\'unité cm', () => {
      expect(scale.value).toBe(20)
      expect(scale.unit).toBe('cm')
    })
  })

  Scenario('Échelle ronde bascule en mètres au-delà de 1 m', ({ When, Then }) => {
    let scale = pickNiceScale(1)
    When('je choisis l\'échelle ronde pour un span monde de 240 cm', () => {
      scale = pickNiceScale(240)
    })
    Then('la valeur est 2 et l\'unité m', () => {
      expect(scale.value).toBe(2)
      expect(scale.unit).toBe('m')
    })
  })
})
