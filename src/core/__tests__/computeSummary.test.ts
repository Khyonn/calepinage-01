import { describe, it, expect, beforeEach } from 'vitest'
import { computeSummary } from '@/core/computeSummary'
import type { PlankType, PoseParams, Room } from '@/core/types'

describe('computeSummary', () => {
  let poseParams: PoseParams
  let room: Room

  beforeEach(() => {
    poseParams = { cale: 5, sawWidth: 0.1, minPlankLength: 30, minRowGap: 15 }
    // room 400cm → available 390cm → fillRow(0) = [120, 120, 120, 30] = 4 planks
    room = {
      id: 'room-1', projectId: 'proj-1', name: 'Salon',
      vertices: [{ x: 0, y: 0 }, { x: 400, y: 0 }, { x: 400, y: 300 }, { x: 0, y: 300 }],
      rows: [{ id: 'row-a', roomId: 'room-1', plankTypeId: 'pt-1', xOffset: 0 }],
    }
  })

  it('calcule le nombre de lames et le coût à l\'unité', () => {
    const plankType: PlankType = {
      id: 'pt-1', projectId: 'proj-1', name: 'Test',
      length: 120, width: 14,
      pricing: { type: 'unit', pricePerUnit: 10 },
      description: '',
    }

    const result = computeSummary([room], [plankType], poseParams, [])

    expect(result.byType).toHaveLength(1)
    expect(result.byType[0].planksNeeded).toBe(4)
    expect(result.byType[0].cost).toBe(40)
    expect(result.totalCost).toBe(40)
  })

  it('calcule le coût au lot (arrondi au lot supérieur)', () => {
    const plankType: PlankType = {
      id: 'pt-1', projectId: 'proj-1', name: 'Test',
      length: 120, width: 14,
      pricing: { type: 'lot', pricePerLot: 100, lotSize: 10 },
      description: '',
    }

    // 4 planks needed, lotSize=10 → 1 lot acheté → 100€
    const result = computeSummary([room], [plankType], poseParams, [])
    expect(result.byType[0].planksNeeded).toBe(4)
    expect(result.byType[0].cost).toBe(100)
  })

  it('ne compte pas la première lame si la rangée réutilise une chute', () => {
    const plankType: PlankType = {
      id: 'pt-1', projectId: 'proj-1', name: 'Test',
      length: 120, width: 14,
      pricing: { type: 'unit', pricePerUnit: 10 },
      description: '',
    }

    // row-b démarre depuis une chute de row-a → sa première lame n'est pas achetée
    const roomWithTwoRows: Room = {
      ...room,
      rows: [
        { id: 'row-a', roomId: 'room-1', plankTypeId: 'pt-1', xOffset: 0 },
        { id: 'row-b', roomId: 'room-1', plankTypeId: 'pt-1', xOffset: 30.1 },
      ],
    }
    // row-a: 4 planks, row-b sans offcut reuse: 4 planks → total 8
    // avec offcut reuse sur row-b: 4 + 3 = 7
    const offcutLinks = [{ sourceRowId: 'row-a', targetRowId: 'row-b', length: 89.9 }]

    const result = computeSummary([roomWithTwoRows], [plankType], poseParams, offcutLinks)
    expect(result.byType[0].planksNeeded).toBe(7)
  })

  it('renvoie 0 pour un type sans rangée associée', () => {
    const unusedType: PlankType = {
      id: 'pt-2', projectId: 'proj-1', name: 'Autre',
      length: 100, width: 10,
      pricing: { type: 'unit', pricePerUnit: 5 },
      description: '',
    }

    const result = computeSummary([room], [unusedType], poseParams, [])
    expect(result.byType[0].planksNeeded).toBe(0)
    expect(result.byType[0].cost).toBe(0)
    expect(result.totalCost).toBe(0)
  })
})
