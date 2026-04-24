import { expect } from 'vitest'
import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { propagateOffcuts } from '@/core/propagateOffcuts'
import type { PlankType, PoseParams, Room } from '@/core/types'

const feature = await loadFeature('src/core/__tests__/propagate-offcuts.feature', { language: 'fr' })

function makePlankType(id: string, name: string, length: number, width: number): PlankType {
  return {
    id, projectId: 'proj', name,
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
    rows: [],
  }
}

describeFeature(feature, ({ Background, Scenario }) => {
  let plankA: PlankType
  let plankB: PlankType
  let poseParams: PoseParams
  let room: Room

  Background(({ Given, And }) => {
    Given('un type de lame "A" de longueur 120 cm et largeur 14 cm', () => {
      plankA = makePlankType('pt-a', 'A', 120, 14)
    })
    And('un type de lame "B" de longueur 100 cm et largeur 10 cm', () => {
      plankB = makePlankType('pt-b', 'B', 100, 10)
    })
    And('des paramètres de pose avec cale 5 cm, scie 0.1 cm, longueur min 30 cm', () => {
      poseParams = { cale: 5, sawWidth: 0.1, minPlankLength: 30, minRowGap: 15 }
    })
  })

  Scenario('Cascade simple — 3 rangées du même type', ({ Given, When, Then, And }) => {
    Given('une pièce 400×300 contenant 3 rangées A avec xOffsets [0, 99, 99]', () => {
      room = makeRectRoom(400, 300)
      room.rows = [
        { id: 'a0', roomId: room.id, plankTypeId: plankA.id, segments: [{ xOffset: 0 }] },
        { id: 'a1', roomId: room.id, plankTypeId: plankA.id, segments: [{ xOffset: 99 }] },
        { id: 'a2', roomId: room.id, plankTypeId: plankA.id, segments: [{ xOffset: 99 }] },
      ]
    })
    When('je propage à partir de la rangée d\'index 0', () => {
      propagateOffcuts(room, [plankA], poseParams, 'a0')
    })
    Then('la rangée d\'index 1 a un xOffset d\'environ 30.1 cm', () => {
      expect(room.rows[1].segments[0].xOffset).toBeCloseTo(30.1, 1)
    })
    And('la rangée d\'index 2 a un xOffset d\'environ 60.2 cm', () => {
      expect(room.rows[2].segments[0].xOffset).toBeCloseTo(60.2, 1)
    })
  })

  Scenario('Mix de types — seul le type modifié cascade', ({ Given, When, Then, And }) => {
    Given('une pièce 400×300 contenant A0, B0, A1, B1, A2 avec xOffsets [0, 33, 99, 77, 99]', () => {
      room = makeRectRoom(400, 300)
      room.rows = [
        { id: 'a0', roomId: room.id, plankTypeId: plankA.id, segments: [{ xOffset: 0 }] },
        { id: 'b0', roomId: room.id, plankTypeId: plankB.id, segments: [{ xOffset: 33 }] },
        { id: 'a1', roomId: room.id, plankTypeId: plankA.id, segments: [{ xOffset: 99 }] },
        { id: 'b1', roomId: room.id, plankTypeId: plankB.id, segments: [{ xOffset: 77 }] },
        { id: 'a2', roomId: room.id, plankTypeId: plankA.id, segments: [{ xOffset: 99 }] },
      ]
    })
    When('je propage à partir de la rangée A0', () => {
      propagateOffcuts(room, [plankA, plankB], poseParams, 'a0')
    })
    Then('la rangée A1 a un xOffset d\'environ 30.1 cm', () => {
      const a1 = room.rows.find(r => r.id === 'a1')!
      expect(a1.segments[0].xOffset).toBeCloseTo(30.1, 1)
    })
    And('la rangée A2 a un xOffset d\'environ 60.2 cm', () => {
      const a2 = room.rows.find(r => r.id === 'a2')!
      expect(a2.segments[0].xOffset).toBeCloseTo(60.2, 1)
    })
    And('la rangée B0 garde son xOffset de 33 cm', () => {
      const b0 = room.rows.find(r => r.id === 'b0')!
      expect(b0.segments[0].xOffset).toBe(33)
    })
    And('la rangée B1 garde son xOffset de 77 cm', () => {
      const b1 = room.rows.find(r => r.id === 'b1')!
      expect(b1.segments[0].xOffset).toBe(77)
    })
  })

  Scenario('Source sans chute — downstream retombe à zéro', ({ Given, When, Then }) => {
    let plankC: PlankType
    Given('une pièce 400×300 sans cale contenant 2 rangées du type "C" 100 cm avec xOffsets [0, 55]', () => {
      plankC = makePlankType('pt-c', 'C', 100, 10)
      poseParams = { cale: 0, sawWidth: 0.1, minPlankLength: 30, minRowGap: 15 }
      room = makeRectRoom(400, 300)
      room.rows = [
        { id: 'c0', roomId: room.id, plankTypeId: plankC.id, segments: [{ xOffset: 0 }] },
        { id: 'c1', roomId: room.id, plankTypeId: plankC.id, segments: [{ xOffset: 55 }] },
      ]
    })
    When('je propage à partir de la rangée d\'index 0', () => {
      propagateOffcuts(room, [plankC], poseParams, 'c0')
    })
    Then('la rangée d\'index 1 a un xOffset de 0 cm', () => {
      expect(room.rows[1].segments[0].xOffset).toBe(0)
    })
  })
})
