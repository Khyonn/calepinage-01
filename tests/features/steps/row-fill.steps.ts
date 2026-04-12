import { expect } from 'vitest'
import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'

import { computeOffcutLength, fillRow } from '@/core/rowFill'
import type { Plank, PlankType, PoseParams } from '@/core/types'

const feature = await loadFeature('tests/features/row-fill.feature', { language: 'fr' })

describeFeature(feature, ({ Background, BeforeEachScenario, Scenario }) => {
  let plankType: PlankType
  let poseParams: PoseParams
  let roomWidth: number
  let planks: Plank[]
  let offcutLength: number

  BeforeEachScenario(() => {
    roomWidth = 0
    planks = []
    offcutLength = 0
  })

  Background(({ Given, And }) => {
    Given('un type de lame de longueur 120 cm et largeur 14 cm', () => {
      plankType = {
        id: 'pt-1', projectId: 'proj-1', name: 'Test',
        length: 120, width: 14,
        pricing: { type: 'unit', pricePerUnit: 10 },
        description: '',
      }
    })
    And('des paramètres de pose avec une cale de 5 cm et une largeur de scie de 0.1 cm et une longueur minimale de 30 cm', () => {
      poseParams = { cale: 5, sawWidth: 0.1, minPlankLength: 30, minRowGap: 15 }
    })
  })

  Scenario('Rangée démarrant avec une planche entière', ({ Given, When, Then, And }) => {
    Given('une pièce de largeur 400 cm', () => { roomWidth = 400 })
    When('je remplis une rangée avec un décalage de 0 cm', () => {
      planks = fillRow(0, roomWidth, plankType, poseParams)
    })
    Then('la rangée contient 4 lames', () => { expect(planks).toHaveLength(4) })
    And('la première lame mesure 120 cm', () => { expect(planks[0].length).toBe(120) })
    And('la dernière lame mesure 30 cm', () => { expect(planks[planks.length - 1].length).toBe(30) })
  })

  Scenario('Rangée démarrant avec une chute', ({ Given, When, Then, And }) => {
    Given('une pièce de largeur 400 cm', () => { roomWidth = 400 })
    When('je remplis une rangée avec un décalage de 50 cm', () => {
      planks = fillRow(50, roomWidth, plankType, poseParams)
    })
    Then('la rangée contient 4 lames', () => { expect(planks).toHaveLength(4) })
    And('la première lame mesure 70 cm', () => { expect(planks[0].length).toBe(70) })
    And('la dernière lame mesure 80 cm', () => { expect(planks[planks.length - 1].length).toBe(80) })
  })

  Scenario('Rangée sans coupe finale (fit exact)', ({ Given, When, Then, And }) => {
    Given('une pièce de largeur 370 cm', () => { roomWidth = 370 })
    When('je remplis une rangée avec un décalage de 0 cm', () => {
      planks = fillRow(0, roomWidth, plankType, poseParams)
    })
    Then('la rangée contient 3 lames', () => { expect(planks).toHaveLength(3) })
    And('chaque lame mesure 120 cm', () => {
      planks.forEach(p => expect(p.length).toBe(120))
    })
  })

  Scenario('Calcul de la chute générée en fin de rangée', ({ Given, When, Then }) => {
    Given('une pièce de largeur 400 cm', () => { roomWidth = 400 })
    When("je calcule la chute d'une rangée avec un décalage de 0 cm", () => {
      offcutLength = computeOffcutLength(0, roomWidth, plankType, poseParams)
    })
    Then('la chute mesure 89.9 cm', () => { expect(offcutLength).toBeCloseTo(89.9, 5) })
  })

  Scenario('Aucune chute quand le fit est exact', ({ Given, When, Then }) => {
    Given('une pièce de largeur 370 cm', () => { roomWidth = 370 })
    When("je calcule la chute d'une rangée avec un décalage de 0 cm", () => {
      offcutLength = computeOffcutLength(0, roomWidth, plankType, poseParams)
    })
    Then("il n'y a pas de chute", () => { expect(offcutLength).toBe(0) })
  })
})
