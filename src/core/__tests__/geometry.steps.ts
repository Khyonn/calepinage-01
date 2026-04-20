import { expect } from 'vitest'
import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { computeScale, intersectStripExtents } from '@/core/geometry'

const feature = await loadFeature('src/core/__tests__/geometry.feature', { language: 'fr' })

describeFeature(feature, ({ Scenario }) => {

  Scenario('Calcul de l\'échelle depuis une distance horizontale', ({ When, Then }) => {
    let scale: number
    When('je calibre avec deux points séparés de 3 px pour une distance réelle de 30 cm', () => {
      scale = computeScale({ x: 0, y: 0 }, { x: 3, y: 0 }, 30)
    })
    Then('l\'échelle est de 10 cm par pixel', () => {
      expect(scale).toBeCloseTo(10, 5)
    })
  })

  Scenario('Calcul de l\'échelle depuis une distance diagonale', ({ When, Then }) => {
    let scale: number
    When('je calibre avec deux points formant un triangle 3-4-5 pixels pour une distance réelle de 50 cm', () => {
      scale = computeScale({ x: 0, y: 0 }, { x: 3, y: 4 }, 50)
    })
    Then('l\'échelle est de 10 cm par pixel', () => {
      expect(scale).toBeCloseTo(10, 5)
    })
  })

  Scenario('Extents d\'une bande sur un L inversé étend vers le x minimum', ({ When, Then, And }) => {
    let extents: [number, number][]
    When('je calcule les extents de la bande y=[0,20] sur le polygone L inversé (50,0) (200,0) (200,100) (0,100) (0,50)', () => {
      const vertices = [
        { x: 50, y: 0 }, { x: 200, y: 0 }, { x: 200, y: 100 },
        { x: 0, y: 100 }, { x: 0, y: 50 },
      ]
      extents = intersectStripExtents(vertices, 0, 20)
    })
    Then('il y a 1 segment', () => {
      expect(extents).toHaveLength(1)
    })
    And('le segment a x_start ≈ 30 et x_end = 200', () => {
      expect(extents[0][0]).toBeCloseTo(30, 3)
      expect(extents[0][1]).toBeCloseTo(200, 5)
    })
  })
})
