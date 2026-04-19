import { expect } from 'vitest'
import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { computeScale } from '@/core/calibration'
import type { Calibration } from '@/core/types'

const feature = await loadFeature('src/core/__tests__/calibration.feature', { language: 'fr' })

describeFeature(feature, ({ Scenario }) => {

  Scenario('Pas de calibration retourne une échelle neutre', ({ When, Then }) => {
    let scale = 0
    When('je calcule l\'échelle sans calibration', () => {
      scale = computeScale(undefined)
    })
    Then('l\'échelle vaut 1', () => {
      expect(scale).toBe(1)
    })
  })

  Scenario('Points distants de 150 pixels pour une distance réelle de 300 cm', ({ Given, When, Then }) => {
    let calibration: Calibration
    let scale = 0
    Given('une calibration avec les points (0, 0) et (150, 0) pour une distance réelle de 300 cm', () => {
      calibration = { point1: { x: 0, y: 0 }, point2: { x: 150, y: 0 }, realDistance: 300 }
    })
    When('je calcule l\'échelle', () => {
      scale = computeScale(calibration)
    })
    Then('l\'échelle vaut 2', () => {
      expect(scale).toBe(2)
    })
  })

  Scenario('Points distants en diagonale', ({ Given, When, Then }) => {
    let calibration: Calibration
    let scale = 0
    Given('une calibration avec les points (0, 0) et (30, 40) pour une distance réelle de 100 cm', () => {
      calibration = { point1: { x: 0, y: 0 }, point2: { x: 30, y: 40 }, realDistance: 100 }
    })
    When('je calcule l\'échelle', () => {
      scale = computeScale(calibration)
    })
    Then('l\'échelle vaut 2', () => {
      expect(scale).toBe(2)
    })
  })

  Scenario('Points confondus retourne une échelle neutre', ({ Given, When, Then }) => {
    let calibration: Calibration
    let scale = 0
    Given('une calibration avec les points (50, 50) et (50, 50) pour une distance réelle de 100 cm', () => {
      calibration = { point1: { x: 50, y: 50 }, point2: { x: 50, y: 50 }, realDistance: 100 }
    })
    When('je calcule l\'échelle', () => {
      scale = computeScale(calibration)
    })
    Then('l\'échelle vaut 1', () => {
      expect(scale).toBe(1)
    })
  })
})
