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

function makeRectRoom(width: number, height: number, rowCount: number, plankTypeId: string, yOffset = 0): Room {
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
    yOffset,
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
    yOffset: 0,
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

  Scenario('Pièce avec rangées de types alternés — Y cumulatif et non rowIndex × width courant', ({ Given, And, When, Then }) => {
    let catalog: PlankType[]
    let room: Room
    let pose: PoseParams
    let geom: RowGeometry | null

    Given('une pièce rectangulaire 300 cm sur 200 cm avec 3 rangées de types alternés A 15 / B 22 / C 18', () => {
      catalog = [
        makePlankType('A', 100, 15),
        makePlankType('B', 100, 22),
        makePlankType('C', 100, 18),
      ]
      room = {
        id: 'room-alt',
        projectId: 'proj',
        name: 'Alt',
        vertices: [
          { x: 0, y: 0 }, { x: 300, y: 0 },
          { x: 300, y: 200 }, { x: 0, y: 200 },
        ],
        yOffset: 0,
        rows: [
          { id: 'r0', roomId: 'room-alt', plankTypeId: 'pt-A', segments: [{ xOffset: 0 }] },
          { id: 'r1', roomId: 'room-alt', plankTypeId: 'pt-B', segments: [{ xOffset: 0 }] },
          { id: 'r2', roomId: 'room-alt', plankTypeId: 'pt-C', segments: [{ xOffset: 0 }] },
        ],
      }
    })
    And('des paramètres de pose par défaut', () => {
      pose = DEFAULT_POSE
    })
    When('je calcule la géométrie de la rangée d\'index 2', () => {
      geom = computeRowGeometry(room, 2, catalog, pose)
    })
    Then('la bande occupe Y de 37,5 à 55,5', () => {
      // yStart correct = cale 0.5 + width(A=15) + width(B=22) = 37.5
      // yEnd correct = 37.5 + width(C=18) = 55.5
      // Ancien bug aurait donné 2 * 18 + 0.5 = 36.5 → 54.5.
      expect(geom?.yStart).toBeCloseTo(37.5, 5)
      expect(geom?.yEnd).toBeCloseTo(55.5, 5)
    })
  })

  Scenario('yOffset négatif décale la première rangée vers le haut', ({ Given, And, When, Then }) => {
    let plankType: PlankType
    let room: Room
    let pose: PoseParams
    let geom: RowGeometry | null

    Given('une pièce rectangulaire 300 cm sur 100 cm avec yOffset -1,5 cm', () => {
      room = makeRectRoom(300, 100, 1, 'pt-Chêne', -1.5)
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
    Then('la bande occupe Y de -1 à 19', () => {
      // yStart = roomMinY(0) + yOffset(-1.5) + cale(0.5) = -1
      // yEnd = -1 + width(20) = 19
      expect(geom?.yStart).toBeCloseTo(-1, 5)
      expect(geom?.yEnd).toBeCloseTo(19, 5)
    })
  })

  Scenario('yOffset hors bornes est clampé au calcul', ({ Given, And, When, Then }) => {
    let plankType: PlankType
    let room: Room
    let pose: PoseParams
    let geom: RowGeometry | null

    Given('une pièce rectangulaire 300 cm sur 100 cm avec yOffset -50 cm', () => {
      // -50 hors bornes (catalog max width = 20). clampYOffset → -20.
      room = makeRectRoom(300, 100, 1, 'pt-Chêne', -50)
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
    Then('la bande occupe Y de -19,5 à 0,5', () => {
      // yOffset clampé à -20 → yStart = 0 + (-20) + 0.5 = -19.5
      // yEnd = -19.5 + 20 = 0.5
      expect(geom?.yStart).toBeCloseTo(-19.5, 5)
      expect(geom?.yEnd).toBeCloseTo(0.5, 5)
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
