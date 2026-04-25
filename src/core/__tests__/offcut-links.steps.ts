import { expect } from 'vitest'
import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { computeOffcutLinks } from '@/core/rowFill'
import type { PlankType, PoseParams, Room } from '@/core/types'

const feature = await loadFeature('src/core/__tests__/offcut-links.feature', { language: 'fr' })

describeFeature(feature, ({ Background, Scenario }) => {
  let plankType: PlankType
  let poseParams: PoseParams
  let rooms: Room[]
  let rowAId: string
  let rowBId: string

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

  Scenario('Un lien est établi quand la chute d\'une rangée correspond au début d\'une autre', ({ Given, Then }) => {
    // Rangée A (xOffset=0, room 400cm) → chute = 120 - 30 - 0.1 = 89.9 cm
    // Rangée B (xOffset=30.1) → début = 120 - 30.1 = 89.9 cm → match
    Given('une pièce avec une rangée A au décalage 0 cm et une rangée B au décalage 30.1 cm', () => {
      rowAId = 'row-a'
      rowBId = 'row-b'
      rooms = [{
        id: 'room-1', projectId: 'proj-1', name: 'Salon',
        vertices: [{ x: 0, y: 0 }, { x: 400, y: 0 }, { x: 400, y: 300 }, { x: 0, y: 300 }],
        rows: [
          { id: rowAId, roomId: 'room-1', plankTypeId: 'pt-1', segments: [{ xOffset: 0 }] },
          { id: rowBId, roomId: 'room-1', plankTypeId: 'pt-1', segments: [{ xOffset: 30.1 }] },
        ],
      }]
    })
    Then('un lien est établi de A vers B avec une chute d\'environ 89.9 cm', () => {
      const links = computeOffcutLinks(rooms, [plankType], poseParams)
      expect(links).toHaveLength(1)
      expect(links[0].sourceRowId).toBe(rowAId)
      expect(links[0].targetRowId).toBe(rowBId)
      expect(links[0].length).toBeCloseTo(89.9, 1)
    })
  })

  Scenario('Aucun lien quand la chute est trop petite pour couvrir le début de la rangée suivante', ({ Given, Then }) => {
    // Rangée A → chute 89.9 cm, Rangée B commence à xOffset=10 (besoin de 110 cm) → pas de match
    Given('une pièce avec une rangée A au décalage 0 cm et une rangée B au décalage 10 cm', () => {
      rooms = [{
        id: 'room-1', projectId: 'proj-1', name: 'Salon',
        vertices: [{ x: 0, y: 0 }, { x: 400, y: 0 }, { x: 400, y: 300 }, { x: 0, y: 300 }],
        rows: [
          { id: 'row-a', roomId: 'room-1', plankTypeId: 'pt-1', segments: [{ xOffset: 0 }] },
          { id: 'row-b', roomId: 'room-1', plankTypeId: 'pt-1', segments: [{ xOffset: 10 }] },
        ],
      }]
    })
    Then("aucun lien de réutilisation n'est établi", () => {
      expect(computeOffcutLinks(rooms, [plankType], poseParams)).toHaveLength(0)
    })
  })

  Scenario('Réutilisation partielle — la chute couvre le début sans match exact', ({ Given, Then }) => {
    // Rangée A → chute 89.9 cm, Rangée B commence à xOffset=50 (besoin de 70 cm) → match partiel, lien avec length=70
    Given('une pièce avec une rangée A au décalage 0 cm et une rangée B au décalage 50 cm', () => {
      rowAId = 'row-a'
      rowBId = 'row-b'
      rooms = [{
        id: 'room-1', projectId: 'proj-1', name: 'Salon',
        vertices: [{ x: 0, y: 0 }, { x: 400, y: 0 }, { x: 400, y: 300 }, { x: 0, y: 300 }],
        rows: [
          { id: rowAId, roomId: 'room-1', plankTypeId: 'pt-1', segments: [{ xOffset: 0 }] },
          { id: rowBId, roomId: 'room-1', plankTypeId: 'pt-1', segments: [{ xOffset: 50 }] },
        ],
      }]
    })
    Then("un lien est établi de A vers B avec une longueur réutilisée d'environ 70 cm", () => {
      const links = computeOffcutLinks(rooms, [plankType], poseParams)
      expect(links).toHaveLength(1)
      expect(links[0].sourceRowId).toBe(rowAId)
      expect(links[0].targetRowId).toBe(rowBId)
      expect(links[0].length).toBeCloseTo(70, 1)
    })
  })

  Scenario('Aucun lien quand toutes les rangées démarrent à zéro', ({ Given, Then }) => {
    Given('une pièce avec deux rangées démarrant au décalage 0 cm', () => {
      rooms = [{
        id: 'room-1', projectId: 'proj-1', name: 'Salon',
        vertices: [{ x: 0, y: 0 }, { x: 400, y: 0 }, { x: 400, y: 300 }, { x: 0, y: 300 }],
        rows: [
          { id: 'row-a', roomId: 'room-1', plankTypeId: 'pt-1', segments: [{ xOffset: 0 }] },
          { id: 'row-b', roomId: 'room-1', plankTypeId: 'pt-1', segments: [{ xOffset: 0 }] },
        ],
      }]
    })
    Then("aucun lien de réutilisation n'est établi", () => {
      expect(computeOffcutLinks(rooms, [plankType], poseParams)).toHaveLength(0)
    })
  })

  Scenario('Un lien peut être établi entre des rangées de pièces différentes', ({ Given, And, Then }) => {
    Given('une pièce "Salon" avec une rangée A au décalage 0 cm', () => {
      rowAId = 'row-a'
      rooms = [{
        id: 'room-1', projectId: 'proj-1', name: 'Salon',
        vertices: [{ x: 0, y: 0 }, { x: 400, y: 0 }, { x: 400, y: 300 }, { x: 0, y: 300 }],
        rows: [{ id: rowAId, roomId: 'room-1', plankTypeId: 'pt-1', segments: [{ xOffset: 0 }] }],
      }]
    })
    And('une pièce "Couloir" avec une rangée B au décalage 30.1 cm', () => {
      rowBId = 'row-b'
      rooms = [...rooms, {
        id: 'room-2', projectId: 'proj-1', name: 'Couloir',
        vertices: [{ x: 0, y: 0 }, { x: 400, y: 0 }, { x: 400, y: 300 }, { x: 0, y: 300 }],
        rows: [{ id: rowBId, roomId: 'room-2', plankTypeId: 'pt-1', segments: [{ xOffset: 30.1 }] }],
      }]
    })
    Then('un lien est établi de A vers B', () => {
      const links = computeOffcutLinks(rooms, [plankType], poseParams)
      expect(links).toHaveLength(1)
      expect(links[0].sourceRowId).toBe(rowAId)
      expect(links[0].targetRowId).toBe(rowBId)
    })
  })
})
