import { expect } from 'vitest'
import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { computeSummary } from '@/core/computeSummary'
import type { OffcutLink, PlankType, PoseParams, Room } from '@/core/types'

const feature = await loadFeature('src/core/__tests__/compute-summary.feature', { language: 'fr' })

const BASE_VERTICES = [
  { x: 0, y: 0 }, { x: 400, y: 0 },
  { x: 400, y: 300 }, { x: 0, y: 300 },
]

describeFeature(feature, ({ Background, BeforeEachScenario, Scenario }) => {
  let poseParams: PoseParams
  let rooms: Room[]
  let plankType: PlankType
  let offcutLinks: OffcutLink[]

  BeforeEachScenario(() => {
    offcutLinks = []
  })

  Background(({ Given, And }) => {
    Given('une pièce de 400 cm de large avec une rangée au décalage 0 cm', () => {
      rooms = [{
        id: 'room-1', projectId: 'proj-1', name: 'Salon',
        vertices: BASE_VERTICES,
        yOffset: 0,
        rows: [{ id: 'row-a', roomId: 'room-1', plankTypeId: 'pt-1', segments: [{ xOffset: 0 }] }],
      }]
    })
    And('des paramètres de pose avec une cale de 5 cm et une largeur de scie de 0.1 cm et une longueur minimale de 30 cm', () => {
      poseParams = { cale: 5, sawWidth: 0.1, minPlankLength: 30, minRowGap: 15 }
    })
  })

  Scenario('Calcul du nombre de lames et du coût à l\'unité', ({ Given, Then }) => {
    // room 400cm → available 390cm → fillRow(0) = [120, 120, 120, 30] = 4 lames
    Given('un type de lame de longueur 120 cm au prix unitaire de 10 €', () => {
      plankType = {
        id: 'pt-1', projectId: 'proj-1', name: 'Test',
        length: 120, width: 14,
        pricing: { type: 'unit', pricePerUnit: 10 },
        description: '',
      }
    })
    Then('le résumé indique 4 lames nécessaires au coût total de 40 €', () => {
      const result = computeSummary(rooms, [plankType], poseParams, offcutLinks)
      expect(result.byType[0].planksNeeded).toBe(4)
      expect(result.byType[0].cost).toBe(40)
      expect(result.totalCost).toBe(40)
    })
  })

  Scenario('Calcul du coût au lot avec arrondi au lot supérieur', ({ Given, Then }) => {
    // 4 lames nécessaires, lotSize=10 → 1 lot acheté → 100 €
    Given('un type de lame de longueur 120 cm vendu par lot de 10 à 100 €', () => {
      plankType = {
        id: 'pt-1', projectId: 'proj-1', name: 'Test',
        length: 120, width: 14,
        pricing: { type: 'lot', pricePerLot: 100, lotSize: 10 },
        description: '',
      }
    })
    Then('le résumé indique 4 lames nécessaires au coût total de 100 €', () => {
      const result = computeSummary(rooms, [plankType], poseParams, offcutLinks)
      expect(result.byType[0].planksNeeded).toBe(4)
      expect(result.byType[0].cost).toBe(100)
    })
  })

  Scenario('La première lame d\'une rangée réutilisant une chute n\'est pas commandée', ({ Given, And, Then }) => {
    // row-a: 4 lames, row-b sans réutilisation: 4 lames → total 8
    // avec réutilisation sur row-b: 4 + 3 = 7
    Given('un type de lame de longueur 120 cm au prix unitaire de 10 €', () => {
      plankType = {
        id: 'pt-1', projectId: 'proj-1', name: 'Test',
        length: 120, width: 14,
        pricing: { type: 'unit', pricePerUnit: 10 },
        description: '',
      }
    })
    And('une deuxième rangée au décalage 30.1 cm réutilisant la chute de la première', () => {
      rooms = [{
        id: 'room-1', projectId: 'proj-1', name: 'Salon',
        vertices: BASE_VERTICES,
        yOffset: 0,
        rows: [
          { id: 'row-a', roomId: 'room-1', plankTypeId: 'pt-1', segments: [{ xOffset: 0 }] },
          { id: 'row-b', roomId: 'room-1', plankTypeId: 'pt-1', segments: [{ xOffset: 30.1 }] },
        ],
      }]
      offcutLinks = [{ sourceRowId: 'row-a', targetRowId: 'row-b', length: 89.9 }]
    })
    Then('le résumé indique 7 lames nécessaires', () => {
      const result = computeSummary(rooms, [plankType], poseParams, offcutLinks)
      expect(result.byType[0].planksNeeded).toBe(7)
    })
  })

  Scenario('Un type de lame sans rangée associée n\'engendre aucun coût', ({ Given, Then }) => {
    Given('un type de lame de longueur 100 cm non utilisé dans la pièce', () => {
      plankType = {
        id: 'pt-2', projectId: 'proj-1', name: 'Autre',
        length: 100, width: 10,
        pricing: { type: 'unit', pricePerUnit: 5 },
        description: '',
      }
    })
    Then('le résumé indique 0 lames nécessaires au coût total de 0 €', () => {
      const result = computeSummary(rooms, [plankType], poseParams, offcutLinks)
      expect(result.byType[0].planksNeeded).toBe(0)
      expect(result.byType[0].cost).toBe(0)
      expect(result.totalCost).toBe(0)
    })
  })

  Scenario('Pièce non-rectangulaire — la dernière rangée utilise la largeur réelle du segment', ({ Given, And, Then }) => {
    // Régression : avant le fix, computeSummary utilisait la bbox de la pièce
    // (400 cm de large) pour toutes les rangées, surcomptant les lames pour
    // les rangées situées dans la zone étroite (100 cm de large).
    // Forme L : zone large 0..400 sur y 0..40, zone étroite 0..100 sur y 40..60.
    // Rangée 1 (y 0-20) → segWidth 400, 4 lames.
    // Rangée 2 (y 20-40) → segWidth 400, 4 lames.
    // Rangée 3 (y 40-60) → segWidth 100, 1 lame (pas 4 comme avec bbox).
    Given('une pièce en L avec une zone étroite en bas', () => {
      rooms = [{
        id: 'room-l', projectId: 'proj-1', name: 'L',
        vertices: [
          { x: 0, y: 0 }, { x: 400, y: 0 },
          { x: 400, y: 40 }, { x: 100, y: 40 },
          { x: 100, y: 60 }, { x: 0, y: 60 },
        ],
        yOffset: 0,
        rows: [],
      }]
    })
    And('trois rangées en pose droite au décalage 0', () => {
      rooms[0].rows = [
        { id: 'r1', roomId: 'room-l', plankTypeId: 'pt-1', segments: [{ xOffset: 0 }] },
        { id: 'r2', roomId: 'room-l', plankTypeId: 'pt-1', segments: [{ xOffset: 0 }] },
        { id: 'r3', roomId: 'room-l', plankTypeId: 'pt-1', segments: [{ xOffset: 0 }] },
      ]
    })
    And('un type de lame de longueur 120 cm largeur 20 cm au prix unitaire de 1 €', () => {
      plankType = {
        id: 'pt-1', projectId: 'proj-1', name: 'Test',
        length: 120, width: 20,
        pricing: { type: 'unit', pricePerUnit: 1 },
        description: '',
      }
    })
    And('des paramètres de pose cale 0 scie 0.1 minimum 30', () => {
      poseParams = { cale: 0, sawWidth: 0.1, minPlankLength: 30, minRowGap: 15 }
    })
    Then('le résumé indique 9 lames nécessaires', () => {
      const result = computeSummary(rooms, [plankType], poseParams, offcutLinks)
      expect(result.byType[0].planksNeeded).toBe(9)
    })
  })
})
