import { describe, it, expect, beforeEach } from 'vitest'
import { computeOffcutLinks } from '@/core/rowFill'
import type { PlankType, PoseParams, Room } from '@/core/types'

describe('computeOffcutLinks', () => {
  let plankType: PlankType
  let poseParams: PoseParams

  beforeEach(() => {
    plankType = {
      id: 'pt-1', projectId: 'proj-1', name: 'Test',
      length: 120, width: 14,
      pricing: { type: 'unit', pricePerUnit: 10 },
      description: '',
    }
    poseParams = { cale: 5, sawWidth: 0.1, minPlankLength: 30, minRowGap: 15 }
  })

  it('produit un lien quand la chute d\'une rangée correspond au début d\'une autre', () => {
    // Rangée A (xOffset=0, room 400cm) → chute = 120 - 30 - 0.1 = 89.9 cm
    // Rangée B (xOffset=30.1) → début = 120 - 30.1 = 89.9 cm → match
    const rooms: Room[] = [
      {
        id: 'room-1', projectId: 'proj-1', name: 'Salon',
        vertices: [{ x: 0, y: 0 }, { x: 400, y: 0 }, { x: 400, y: 300 }, { x: 0, y: 300 }],
        rows: [
          { id: 'row-a', roomId: 'room-1', plankTypeId: 'pt-1', xOffset: 0 },
          { id: 'row-b', roomId: 'room-1', plankTypeId: 'pt-1', xOffset: 30.1 },
        ],
      },
    ]

    const links = computeOffcutLinks(rooms, [plankType], poseParams)

    expect(links).toHaveLength(1)
    expect(links[0]).toMatchObject({ sourceRowId: 'row-a', targetRowId: 'row-b' })
    expect(links[0].length).toBeCloseTo(89.9, 1)
  })

  it('ne produit aucun lien quand les chutes ne correspondent pas', () => {
    // Rangée A → chute 89.9 cm, Rangée B commence à xOffset=50 (besoin de 70cm) → pas de match
    const rooms: Room[] = [
      {
        id: 'room-1', projectId: 'proj-1', name: 'Salon',
        vertices: [{ x: 0, y: 0 }, { x: 400, y: 0 }, { x: 400, y: 300 }, { x: 0, y: 300 }],
        rows: [
          { id: 'row-a', roomId: 'room-1', plankTypeId: 'pt-1', xOffset: 0 },
          { id: 'row-b', roomId: 'room-1', plankTypeId: 'pt-1', xOffset: 50 },
        ],
      },
    ]

    const links = computeOffcutLinks(rooms, [plankType], poseParams)
    expect(links).toHaveLength(0)
  })

  it('ne produit aucun lien si toutes les rangées démarrent à xOffset=0', () => {
    const rooms: Room[] = [
      {
        id: 'room-1', projectId: 'proj-1', name: 'Salon',
        vertices: [{ x: 0, y: 0 }, { x: 400, y: 0 }, { x: 400, y: 300 }, { x: 0, y: 300 }],
        rows: [
          { id: 'row-a', roomId: 'room-1', plankTypeId: 'pt-1', xOffset: 0 },
          { id: 'row-b', roomId: 'room-1', plankTypeId: 'pt-1', xOffset: 0 },
        ],
      },
    ]

    const links = computeOffcutLinks(rooms, [plankType], poseParams)
    expect(links).toHaveLength(0)
  })

  it('fonctionne sur plusieurs pièces', () => {
    const rooms: Room[] = [
      {
        id: 'room-1', projectId: 'proj-1', name: 'Salon',
        vertices: [{ x: 0, y: 0 }, { x: 400, y: 0 }, { x: 400, y: 300 }, { x: 0, y: 300 }],
        rows: [{ id: 'row-a', roomId: 'room-1', plankTypeId: 'pt-1', xOffset: 0 }],
      },
      {
        id: 'room-2', projectId: 'proj-1', name: 'Couloir',
        vertices: [{ x: 0, y: 0 }, { x: 400, y: 0 }, { x: 400, y: 300 }, { x: 0, y: 300 }],
        rows: [{ id: 'row-b', roomId: 'room-2', plankTypeId: 'pt-1', xOffset: 30.1 }],
      },
    ]

    const links = computeOffcutLinks(rooms, [plankType], poseParams)
    expect(links).toHaveLength(1)
    expect(links[0]).toMatchObject({ sourceRowId: 'row-a', targetRowId: 'row-b' })
  })
})
