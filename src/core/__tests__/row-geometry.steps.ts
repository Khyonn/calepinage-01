import { expect } from 'vitest'
import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { computeRowGeometry, type RowGeometry } from '@/core/rowGeometry'
import type { PlankType, PoseParams, Room } from '@/core/types'

const feature = await loadFeature('src/core/__tests__/row-geometry.feature', { language: 'fr' })

const DEFAULT_POSE: PoseParams = { cale: 0.5, sawWidth: 0.1, minPlankLength: 30, minRowGap: 15 }

function makePlankType(name: string, length: number, width: number): PlankType {
  return {
    id: `pt-${name}`,
    projectId: 'proj',
    name,
    length,
    width,
    pricing: { type: 'unit', pricePerUnit: 0 },
    description: '',
  }
}

function makeRectRoom(width: number, height: number, rowCount: number, plankTypeId: string): Room {
  return {
    id: 'room-rect',
    projectId: 'proj',
    name: 'Rect',
    vertices: [
      { x: 0, y: 0 },
      { x: width, y: 0 },
      { x: width, y: height },
      { x: 0, y: height },
    ],
    rows: Array.from({ length: rowCount }, (_, i) => ({
      id: `row-${i}`,
      roomId: 'room-rect',
      plankTypeId,
      segments: [{ xOffset: 0 }, { xOffset: 0 }],
    })),
  }
}

// U-shape 200×120 with 100×60 notch carved into the top-center:
//   (0,0) → (50,0) → (50,60) → (150,60) → (150,0) → (200,0)
//   → (200,120) → (0,120) → back to (0,0)
function makeURoom(rowCount: number, plankTypeId: string): Room {
  return {
    id: 'room-u',
    projectId: 'proj',
    name: 'U',
    vertices: [
      { x: 0, y: 0 }, { x: 50, y: 0 },
      { x: 50, y: 60 }, { x: 150, y: 60 },
      { x: 150, y: 0 }, { x: 200, y: 0 },
      { x: 200, y: 120 }, { x: 0, y: 120 },
    ],
    rows: Array.from({ length: rowCount }, (_, i) => ({
      id: `row-${i}`,
      roomId: 'room-u',
      plankTypeId,
      segments: [{ xOffset: 0 }, { xOffset: 0 }],
    })),
  }
}

describeFeature(feature, ({ Scenario }) => {

  Scenario('Pièce rectangulaire 300×100 cm — 1 segment par rangée', ({ Given, And, When, Then }) => {
    let plankType: PlankType
    let room: Room
    let pose: PoseParams
    let geom: RowGeometry | null

    Given('une pièce rectangulaire 300 cm sur 100 cm à l\'origine', () => {
      room = makeRectRoom(300, 100, 5, 'pt-Chêne')
    })
    And('un type de lame "Chêne" de 100 cm par 20 cm', () => {
      plankType = makePlankType('Chêne', 100, 20)
    })
    And('des paramètres de pose par défaut', () => {
      pose = DEFAULT_POSE
    })
    When('je calcule la géométrie de la rangée d\'index 0', () => {
      geom = computeRowGeometry(room, 0, [plankType], pose)
    })
    Then('la bande occupe Y de 0,5 à 20,5', () => {
      expect(geom?.yStart).toBeCloseTo(0.5, 5)
      expect(geom?.yEnd).toBeCloseTo(20.5, 5)
    })
    And('la rangée compte 1 segment', () => {
      expect(geom?.segments).toHaveLength(1)
    })
    And('le segment couvre X de 0 à 300', () => {
      expect(geom?.segments[0].xStart).toBeCloseTo(0, 5)
      expect(geom?.segments[0].xEnd).toBeCloseTo(300, 5)
    })
    And('le segment contient 3 lames', () => {
      expect(geom?.segments[0].planks).toHaveLength(3)
    })
  })

  Scenario('Pièce concave en U — rangée du haut coupée en 2 segments', ({ Given, And, When, Then }) => {
    let plankType: PlankType
    let room: Room
    let pose: PoseParams
    let geom: RowGeometry | null

    Given('une pièce en U de 200×120 avec une encoche centrale 100×60', () => {
      room = makeURoom(6, 'pt-Chêne')
    })
    And('un type de lame "Chêne" de 100 cm par 20 cm', () => {
      plankType = makePlankType('Chêne', 100, 20)
    })
    And('des paramètres de pose par défaut', () => {
      pose = DEFAULT_POSE
    })
    When('je calcule la géométrie de la rangée d\'index 0', () => {
      geom = computeRowGeometry(room, 0, [plankType], pose)
    })
    Then('la rangée compte 2 segments', () => {
      expect(geom?.segments).toHaveLength(2)
    })
  })

  Scenario('Pièce concave en U — rangée du bas en un seul segment', ({ Given, And, When, Then }) => {
    let plankType: PlankType
    let room: Room
    let pose: PoseParams
    let geom: RowGeometry | null

    Given('une pièce en U de 200×120 avec une encoche centrale 100×60', () => {
      room = makeURoom(6, 'pt-Chêne')
    })
    And('un type de lame "Chêne" de 100 cm par 20 cm', () => {
      plankType = makePlankType('Chêne', 100, 20)
    })
    And('des paramètres de pose par défaut', () => {
      pose = DEFAULT_POSE
    })
    When('je calcule la géométrie de la rangée d\'index 5', () => {
      geom = computeRowGeometry(room, 5, [plankType], pose)
    })
    Then('la rangée compte 1 segment', () => {
      expect(geom?.segments).toHaveLength(1)
    })
  })

  Scenario('Pièce 400×49 — la 4e rangée déborde mais reste visible (bug correctif)', ({ Given, And, When, Then }) => {
    let plankType: PlankType
    let room: Room
    let pose: PoseParams
    let geom: RowGeometry | null

    Given('une pièce rectangulaire 400 cm sur 49 cm à l\'origine', () => {
      room = makeRectRoom(400, 49, 4, 'pt-Chêne')
    })
    And('un type de lame "Chêne" de 100 cm par 14 cm', () => {
      plankType = makePlankType('Chêne', 100, 14)
    })
    And('des paramètres de pose par défaut', () => {
      pose = DEFAULT_POSE
    })
    When('je calcule la géométrie de la rangée d\'index 3', () => {
      geom = computeRowGeometry(room, 3, [plankType], pose)
    })
    Then('la rangée compte 1 segment', () => {
      expect(geom?.segments).toHaveLength(1)
    })
    And('le segment couvre X de 0 à 400', () => {
      expect(geom?.segments[0].xStart).toBeCloseTo(0, 5)
      expect(geom?.segments[0].xEnd).toBeCloseTo(400, 5)
    })
  })

})
