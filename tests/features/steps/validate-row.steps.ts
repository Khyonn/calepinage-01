import { expect } from 'vitest'
import { loadFeature, describeFeature } from '@amiceli/vitest-cucumber'

import { validateRow } from '@/core/validateRow'
import type { ConstraintViolation, ConstraintViolationType, Plank, PoseParams } from '@/core/types'

const feature = await loadFeature('tests/features/validate-row.feature', { language: 'fr' })

describeFeature(feature, ({ BeforeEachScenario, Background, Scenario }) => {
  let poseParams: PoseParams
  let planks: Plank[]
  let prevPlanks: Plank[] | undefined
  let availableWidth: number
  let violations: ConstraintViolation[]

  BeforeEachScenario(() => {
    planks = []
    prevPlanks = undefined
    availableWidth = 0
    violations = []
  })

  Background(({ Given }) => {
    Given('des paramètres de pose avec une longueur minimale de 30 cm et un écart minimal de 15 cm', () => {
      poseParams = { cale: 5, sawWidth: 0.1, minPlankLength: 30, minRowGap: 15 }
    })
  })

  Scenario('Rangée valide sans violation', ({ Given, Then, And }) => {
    Given('une rangée avec une première lame de 80 cm et une dernière lame de 60 cm', () => {
      planks = [{ x: 0, length: 80 }, { x: 0, length: 60 }]
    })
    And('aucune rangée précédente du même type', () => {
      prevPlanks = undefined
    })
    Then("il n'y a aucune violation", () => {
      violations = validateRow('row-1', planks, prevPlanks, availableWidth, poseParams)
      expect(violations).toHaveLength(0)
    })
  })

  Scenario('Première lame trop courte', ({ Given, Then, And }) => {
    Given('une rangée avec une première lame de 20 cm et une dernière lame de 60 cm', () => {
      planks = [{ x: 0, length: 20 }, { x: 0, length: 60 }]
    })
    And('aucune rangée précédente du même type', () => {
      prevPlanks = undefined
    })
    Then('il y a une violation de type "first-plank-too-short"', () => {
      violations = validateRow('row-1', planks, prevPlanks, availableWidth, poseParams)
      expect(violations.some((v) => v.type === ('first-plank-too-short' as ConstraintViolationType))).toBe(true)
    })
  })

  Scenario('Dernière lame trop courte', ({ Given, Then, And }) => {
    Given('une rangée avec une première lame de 80 cm et une dernière lame de 10 cm', () => {
      planks = [{ x: 0, length: 80 }, { x: 0, length: 10 }]
    })
    And('aucune rangée précédente du même type', () => {
      prevPlanks = undefined
    })
    Then('il y a une violation de type "last-plank-too-short"', () => {
      violations = validateRow('row-1', planks, prevPlanks, availableWidth, poseParams)
      expect(violations.some((v) => v.type === ('last-plank-too-short' as ConstraintViolationType))).toBe(true)
    })
  })

  Scenario('Écart entre fins de rangées trop petit', ({ Given, Then, And }) => {
    Given('une rangée avec une première lame de 80 cm et une dernière lame de 60 cm', () => {
      planks = [{ x: 0, length: 80 }, { x: 0, length: 60 }]
    })
    And('une rangée précédente dont la dernière lame mesure 65 cm', () => {
      prevPlanks = [{ x: 0, length: 65 }]
    })
    And('une largeur disponible de 390 cm', () => {
      availableWidth = 390
    })
    Then('il y a une violation de type "row-gap-too-small"', () => {
      violations = validateRow('row-1', planks, prevPlanks, availableWidth, poseParams)
      expect(violations.some((v) => v.type === ('row-gap-too-small' as ConstraintViolationType))).toBe(true)
    })
  })

  Scenario('Écart entre fins de rangées suffisant', ({ Given, Then, And }) => {
    Given('une rangée avec une première lame de 80 cm et une dernière lame de 60 cm', () => {
      planks = [{ x: 0, length: 80 }, { x: 0, length: 60 }]
    })
    And('une rangée précédente dont la dernière lame mesure 90 cm', () => {
      prevPlanks = [{ x: 0, length: 90 }]
    })
    And('une largeur disponible de 390 cm', () => {
      availableWidth = 390
    })
    Then("il n'y a aucune violation", () => {
      violations = validateRow('row-1', planks, prevPlanks, availableWidth, poseParams)
      expect(violations).toHaveLength(0)
    })
  })
})
