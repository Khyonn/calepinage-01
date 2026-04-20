import { expect } from 'vitest'
import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { findSnap, type SnapResult } from '@/core/snap'
import type { Point } from '@/core/types'

const feature = await loadFeature('src/core/__tests__/snap.feature', { language: 'fr' })

describeFeature(feature, ({ Scenario }) => {

  Scenario('Snap actif en X uniquement', ({ Given, When, Then, And }) => {
    const vertices: Point[] = []
    let cursor: Point = { x: 0, y: 0 }
    let result: SnapResult = { x: 0, y: 0 }

    Given('un sommet en (100, 100) et un curseur en (102, 200)', () => {
      vertices.push({ x: 100, y: 100 })
      cursor = { x: 102, y: 200 }
    })
    When('je calcule le snap avec un zoom de 1 et un rootFontPx de 16', () => {
      result = findSnap(cursor, vertices, 1, 16)
    })
    Then('snappedX vaut 100', () => {
      expect(result.snappedX).toBe(100)
    })
    And('snappedY est absent', () => {
      expect(result.snappedY).toBeUndefined()
    })
    And('x vaut 100 et y vaut 200', () => {
      expect(result.x).toBe(100)
      expect(result.y).toBe(200)
    })
  })

  Scenario('Snap simultané X et Y sur deux sommets différents', ({ Given, When, Then, And }) => {
    const vertices: Point[] = []
    let cursor: Point = { x: 0, y: 0 }
    let result: SnapResult = { x: 0, y: 0 }

    Given('un sommet en (100, 50) et un sommet en (200, 400) et un curseur en (102, 402)', () => {
      vertices.push({ x: 100, y: 50 }, { x: 200, y: 400 })
      cursor = { x: 102, y: 402 }
    })
    When('je calcule le snap avec un zoom de 1 et un rootFontPx de 16', () => {
      result = findSnap(cursor, vertices, 1, 16)
    })
    Then('snappedX vaut 100', () => {
      expect(result.snappedX).toBe(100)
    })
    And('snappedY vaut 400', () => {
      expect(result.snappedY).toBe(400)
    })
    And('x vaut 100 et y vaut 400', () => {
      expect(result.x).toBe(100)
      expect(result.y).toBe(400)
    })
  })

  Scenario('Aucun snap hors seuil', ({ Given, When, Then, And }) => {
    const vertices: Point[] = []
    let cursor: Point = { x: 0, y: 0 }
    let result: SnapResult = { x: 0, y: 0 }

    Given('un sommet en (0, 0) et un curseur en (50, 50)', () => {
      vertices.push({ x: 0, y: 0 })
      cursor = { x: 50, y: 50 }
    })
    When('je calcule le snap avec un zoom de 1 et un rootFontPx de 16', () => {
      result = findSnap(cursor, vertices, 1, 16)
    })
    Then('snappedX est absent', () => {
      expect(result.snappedX).toBeUndefined()
    })
    And('snappedY est absent', () => {
      expect(result.snappedY).toBeUndefined()
    })
    And('x vaut 50 et y vaut 50', () => {
      expect(result.x).toBe(50)
      expect(result.y).toBe(50)
    })
  })

  Scenario('Le seuil monde dépend du zoom', ({ Given, When, Then }) => {
    const vertices: Point[] = []
    let cursor: Point = { x: 0, y: 0 }
    let result: SnapResult = { x: 0, y: 0 }

    Given('un sommet en (0, 0) et un curseur en (10, 0)', () => {
      vertices.push({ x: 0, y: 0 })
      cursor = { x: 10, y: 0 }
    })
    When('je calcule le snap avec un zoom de 2 et un rootFontPx de 16', () => {
      result = findSnap(cursor, vertices, 2, 16)
    })
    Then('snappedX est absent', () => {
      expect(result.snappedX).toBeUndefined()
    })
  })

  Scenario('Au zoom faible, le seuil monde s\'élargit', ({ Given, When, Then }) => {
    const vertices: Point[] = []
    let cursor: Point = { x: 0, y: 0 }
    let result: SnapResult = { x: 0, y: 0 }

    Given('un sommet en (0, 0) et un curseur en (20, 0)', () => {
      vertices.push({ x: 0, y: 0 })
      cursor = { x: 20, y: 0 }
    })
    When('je calcule le snap avec un zoom de 0.5 et un rootFontPx de 16', () => {
      result = findSnap(cursor, vertices, 0.5, 16)
    })
    Then('snappedX vaut 0', () => {
      expect(result.snappedX).toBe(0)
    })
  })
})
