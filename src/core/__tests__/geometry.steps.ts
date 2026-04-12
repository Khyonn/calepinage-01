import { expect } from 'vitest'
import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { worldToScreen, screenToWorld, computeScale } from '@/core/geometry'

const feature = await loadFeature('src/core/__tests__/geometry.feature', { language: 'fr' })

describeFeature(feature, ({ Scenario }) => {

  Scenario('Conversion monde vers écran avec zoom et décalage', ({ When, Then }) => {
    let screen: { x: number; y: number }
    When('je convertis le point monde (10, 20) avec un zoom de 2 et un décalage de (5, 10)', () => {
      screen = worldToScreen({ x: 10, y: 20 }, { zoom: 2, panX: 5, panY: 10 })
    })
    Then('le point écran est (25, 50)', () => {
      expect(screen).toEqual({ x: 25, y: 50 })
    })
  })

  Scenario('Conversion monde vers écran sans transformation', ({ When, Then }) => {
    let screen: { x: number; y: number }
    When('je convertis le point monde (100, 200) avec un zoom de 1 et aucun décalage', () => {
      screen = worldToScreen({ x: 100, y: 200 }, { zoom: 1, panX: 0, panY: 0 })
    })
    Then('le point écran est (100, 200)', () => {
      expect(screen).toEqual({ x: 100, y: 200 })
    })
  })

  Scenario('La conversion écran vers monde est l\'inverse de monde vers écran', ({ Given, When, Then }) => {
    const viewport = { zoom: 2, panX: 5, panY: 10 }
    let screenPoint: { x: number; y: number }
    let worldPoint: { x: number; y: number }
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

  Scenario('Calcul de l\'échelle depuis une distance horizontale', ({ When, Then }) => {
    // 3px de distance écran, 30cm réels → 10 cm/px
    let scale: number
    When('je calibre avec deux points séparés de 3 px pour une distance réelle de 30 cm', () => {
      scale = computeScale({ x: 0, y: 0 }, { x: 3, y: 0 }, 30)
    })
    Then('l\'échelle est de 10 cm par pixel', () => {
      expect(scale).toBeCloseTo(10, 5)
    })
  })

  Scenario('Calcul de l\'échelle depuis une distance diagonale', ({ When, Then }) => {
    // triangle 3-4-5 → 5px, 50cm réels → 10 cm/px
    let scale: number
    When('je calibre avec deux points formant un triangle 3-4-5 pixels pour une distance réelle de 50 cm', () => {
      scale = computeScale({ x: 0, y: 0 }, { x: 3, y: 4 }, 50)
    })
    Then('l\'échelle est de 10 cm par pixel', () => {
      expect(scale).toBeCloseTo(10, 5)
    })
  })
})
