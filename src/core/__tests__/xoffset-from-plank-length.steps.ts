import { expect } from 'vitest'
import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { xOffsetFromFirstLength, xOffsetFromLastLength } from '@/core/xOffsetFromPlankLength'
import { fillRow } from '@/core/rowFill'
import type { PlankType, PoseParams } from '@/core/types'

const feature = await loadFeature('src/core/__tests__/xoffset-from-plank-length.feature', { language: 'fr' })

function makePlank(length: number): PlankType {
  return {
    id: 'pt', projectId: 'proj', name: 'Test',
    length, width: 14,
    pricing: { type: 'unit', pricePerUnit: 0 },
    description: '',
  }
}

describeFeature(feature, ({ Scenario }) => {

  Scenario('Première planche — formule directe', ({ Given, When, Then }) => {
    let plank: PlankType
    let xOffset = 0
    Given('un type de lame de longueur 120 cm', () => { plank = makePlank(120) })
    When('je calcule le xOffset pour une première planche de 80 cm', () => {
      xOffset = xOffsetFromFirstLength(80, plank)
    })
    Then('le xOffset vaut 40 cm', () => { expect(xOffset).toBeCloseTo(40, 1) })
  })

  Scenario('Première planche supérieure à la longueur nominale → planche pleine', ({ Given, When, Then }) => {
    let plank: PlankType
    let xOffset = -1
    Given('un type de lame de longueur 120 cm', () => { plank = makePlank(120) })
    When('je calcule le xOffset pour une première planche de 130 cm', () => {
      xOffset = xOffsetFromFirstLength(130, plank)
    })
    Then('le xOffset vaut 0 cm', () => { expect(xOffset).toBe(0) })
  })

  Scenario('Première planche égale à la longueur nominale → planche pleine', ({ Given, When, Then }) => {
    let plank: PlankType
    let xOffset = -1
    Given('un type de lame de longueur 120 cm', () => { plank = makePlank(120) })
    When('je calcule le xOffset pour une première planche de 120 cm', () => {
      xOffset = xOffsetFromFirstLength(120, plank)
    })
    Then('le xOffset vaut 0 cm', () => { expect(xOffset).toBe(0) })
  })

  Scenario('Première planche nulle → clamp à L - 0,1 (sliver)', ({ Given, When, Then }) => {
    let plank: PlankType
    let xOffset = 0
    Given('un type de lame de longueur 120 cm', () => { plank = makePlank(120) })
    When('je calcule le xOffset pour une première planche de 0 cm', () => {
      xOffset = xOffsetFromFirstLength(0, plank)
    })
    Then('le xOffset vaut 119,9 cm', () => { expect(xOffset).toBeCloseTo(119.9, 1) })
  })

  Scenario('Dernière planche atteignable — simulation produit la valeur exacte', ({ Given, When, Then }) => {
    let plank: PlankType
    let pose: PoseParams
    const segWidth = 400
    let xOffset = 0
    Given('un type 120 cm, pièce 400 cm utile, cale 0', () => {
      plank = makePlank(120)
      pose = { cale: 0, sawWidth: 0.1, minPlankLength: 30, minRowGap: 15 }
    })
    When('je cherche le xOffset pour une dernière planche de 50 cm', () => {
      xOffset = xOffsetFromLastLength(50, plank, segWidth, pose)
    })
    Then('la dernière planche du fillRow résultant est environ 50 cm', () => {
      const planks = fillRow(xOffset, segWidth, plank, pose)
      const last = planks[planks.length - 1].length
      expect(last).toBeCloseTo(50, 1)
    })
  })

  Scenario('Dernière planche initialement pleine → simulation trouve un xOffset adapté', ({ Given, When, Then, And }) => {
    let plank: PlankType
    let pose: PoseParams
    const segWidth = 300
    let xOffset = 0
    Given('un type 100 cm, pièce 300 cm utile, cale 0', () => {
      plank = makePlank(100)
      pose = { cale: 0, sawWidth: 0.1, minPlankLength: 30, minRowGap: 15 }
    })
    When('je cherche le xOffset pour une dernière planche de 30 cm', () => {
      xOffset = xOffsetFromLastLength(30, plank, segWidth, pose)
    })
    Then('la dernière planche du fillRow résultant est environ 30 cm', () => {
      const planks = fillRow(xOffset, segWidth, plank, pose)
      const last = planks[planks.length - 1].length
      expect(last).toBeCloseTo(30, 1)
    })
    And('le xOffset est strictement positif', () => {
      expect(xOffset).toBeGreaterThan(0)
    })
  })

  Scenario('Dernière planche cible impossible → meilleur match', ({ Given, When, Then }) => {
    let plank: PlankType
    let pose: PoseParams
    const segWidth = 300
    let xOffset = 0
    Given('un type 100 cm, pièce 300 cm utile, cale 0', () => {
      plank = makePlank(100)
      pose = { cale: 0, sawWidth: 0.1, minPlankLength: 30, minRowGap: 15 }
    })
    When('je cherche le xOffset pour une dernière planche de 200 cm', () => {
      xOffset = xOffsetFromLastLength(200, plank, segWidth, pose)
    })
    Then('la dernière planche du fillRow résultant est aussi proche que possible de 200 cm', () => {
      const planks = fillRow(xOffset, segWidth, plank, pose)
      const last = planks[planks.length - 1].length
      // Cap réel : ne peut pas dépasser plankType.length (les full planks sont coupés)
      // ni segWidth - cale - first. Le best match attendu : last = plankType.length = 100 (planche pleine)
      // ou plus selon la config. On vérifie juste que le delta est minimal sur l'espace de recherche.
      const allCandidates = []
      for (let t = 0; t <= 999; t++) {
        const x = t / 10
        const ps = fillRow(x, segWidth, plank, pose)
        if (ps.length > 0) allCandidates.push(Math.abs(ps[ps.length - 1].length - 200))
      }
      const minDelta = Math.min(...allCandidates)
      expect(Math.abs(last - 200)).toBeCloseTo(minDelta, 1)
    })
  })
})
