import { expect } from 'vitest'
import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { computeDefaultXOffset } from '@/core/addRow'
import { fillRow } from '@/core/rowFill'
import type { PlankType, PoseParams, Room } from '@/core/types'

const feature = await loadFeature('src/core/__tests__/default-xoffset.feature', { language: 'fr' })

function makePlankType(length: number, width: number): PlankType {
  return {
    id: 'pt-1', projectId: 'proj', name: 'Lame',
    length, width,
    pricing: { type: 'unit', pricePerUnit: 0 },
    description: '',
  }
}

function makeRectRoom(width: number, height: number): Room {
  return {
    id: 'room-1', projectId: 'proj', name: 'Rect',
    vertices: [
      { x: 0, y: 0 }, { x: width, y: 0 },
      { x: width, y: height }, { x: 0, y: height },
    ],
    yOffset: 0,
    rows: [],
  }
}

function roomWidthOf(room: Room): number {
  const xs = room.vertices.map(v => v.x)
  return Math.max(...xs) - Math.min(...xs)
}

function seedPrevRow(room: Room, plank: PlankType, xOffset: number) {
  room.rows.push({
    id: 'prev', roomId: room.id, plankTypeId: plank.id,
    segments: [{ xOffset }],
  })
}

function lastPlank(xOffset: number, room: Room, plank: PlankType, pose: PoseParams) {
  const planks = fillRow(xOffset, roomWidthOf(room), plank, pose)
  return planks[planks.length - 1]
}

describeFeature(feature, ({ Scenario }) => {

  Scenario('Reuse complet ne viole pas minPlankLength — xOffset = xOffset_full', ({ Given, And, When, Then }) => {
    let room: Room
    let plank: PlankType
    let pose: PoseParams
    let xOffset = 0

    Given('une pièce rectangulaire 400 cm sur 280 cm', () => {
      room = makeRectRoom(400, 280)
    })
    And('un type de lame de longueur 120 cm et largeur 14 cm', () => {
      plank = makePlankType(120, 14)
    })
    And('des paramètres cale 0,5 scie 0,1 minPlankLength 30', () => {
      pose = { cale: 0.5, sawWidth: 0.1, minPlankLength: 30, minRowGap: 15 }
    })
    And('une rangée existante du même type avec xOffset 0', () => {
      seedPrevRow(room, plank, 0)
    })
    When('je calcule le xOffset par défaut pour une nouvelle rangée du même type', () => {
      xOffset = computeDefaultXOffset(room, plank, pose)
    })
    Then('le xOffset vaut environ 39,1 cm', () => {
      expect(xOffset).toBeCloseTo(39.1, 1)
    })
    And('la dernière lame de la rangée est supérieure ou égale à 30 cm', () => {
      const last = lastPlank(xOffset, room, plank, pose)
      expect(last.length).toBeGreaterThanOrEqual(30 - 0.001)
    })
  })

  Scenario('Reuse complet violerait minPlankLength — xOffset borné', ({ Given, And, When, Then }) => {
    let room: Room
    let plank: PlankType
    let pose: PoseParams
    let xOffset = 0

    Given('une pièce rectangulaire 161 cm sur 200 cm', () => {
      room = makeRectRoom(161, 200)
    })
    And('un type de lame de longueur 100 cm et largeur 10 cm', () => {
      plank = makePlankType(100, 10)
    })
    And('des paramètres cale 0,5 scie 0,1 minPlankLength 30', () => {
      pose = { cale: 0.5, sawWidth: 0.1, minPlankLength: 30, minRowGap: 15 }
    })
    And('une rangée existante du même type avec xOffset 0', () => {
      seedPrevRow(room, plank, 0)
    })
    When('je calcule le xOffset par défaut pour une nouvelle rangée du même type', () => {
      xOffset = computeDefaultXOffset(room, plank, pose)
    })
    Then('le xOffset est strictement inférieur à 60,1 cm', () => {
      expect(xOffset).toBeLessThan(60.1)
    })
    And('la dernière lame de la rangée est supérieure ou égale à 30 cm', () => {
      const last = lastPlank(xOffset, room, plank, pose)
      const isFull = Math.abs(last.length - plank.length) < 0.001
      if (!isFull) expect(last.length).toBeGreaterThanOrEqual(30 - 0.001)
    })
  })

  Scenario('Première rangée — bornage applique sans chute préalable pour satisfaire minPlankLength', ({ Given, And, When, Then }) => {
    let room: Room
    let plank: PlankType
    let pose: PoseParams
    let xOffset = 0

    Given('une pièce rectangulaire 280 cm sur 200 cm', () => {
      room = makeRectRoom(280, 200)
    })
    And('un type de lame de longueur 125,7 cm et largeur 14 cm', () => {
      plank = makePlankType(125.7, 14)
    })
    And('des paramètres cale 0,5 scie 0,1 minPlankLength 30', () => {
      pose = { cale: 0.5, sawWidth: 0.1, minPlankLength: 30, minRowGap: 15 }
    })
    When('je calcule le xOffset par défaut pour une nouvelle rangée du même type sans rangée précédente', () => {
      xOffset = computeDefaultXOffset(room, plank, pose)
    })
    Then('le xOffset vaut environ 2,4 cm', () => {
      expect(xOffset).toBeCloseTo(2.4, 1)
    })
    And('la dernière lame de la rangée est supérieure ou égale à 30 cm', () => {
      const last = lastPlank(xOffset, room, plank, pose)
      expect(last.length).toBeGreaterThanOrEqual(30 - 0.001)
    })
  })

  Scenario('Aucun xOffset ne satisfait — fallback xOffset 0', ({ Given, And, When, Then }) => {
    let room: Room
    let plank: PlankType
    let pose: PoseParams
    let xOffset = 0

    Given('une pièce rectangulaire 130 cm sur 100 cm', () => {
      room = makeRectRoom(130, 100)
    })
    And('un type de lame de longueur 100 cm et largeur 10 cm', () => {
      plank = makePlankType(100, 10)
    })
    And('des paramètres cale 0 scie 0,1 minPlankLength 61', () => {
      pose = { cale: 0, sawWidth: 0.1, minPlankLength: 61, minRowGap: 15 }
    })
    And('une rangée existante du même type avec xOffset 0', () => {
      seedPrevRow(room, plank, 0)
    })
    When('je calcule le xOffset par défaut pour une nouvelle rangée du même type', () => {
      xOffset = computeDefaultXOffset(room, plank, pose)
    })
    Then('le xOffset vaut 0 cm', () => {
      expect(xOffset).toBe(0)
    })
  })
})
