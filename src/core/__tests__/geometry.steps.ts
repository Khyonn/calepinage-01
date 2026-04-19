import { expect } from 'vitest'
import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { computeScale } from '@/core/geometry'

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
})
