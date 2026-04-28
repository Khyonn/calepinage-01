import { describe, it, expect } from 'vitest'
import { addRow } from '@/core/addRow'
import { fillRow } from '@/core/rowFill'
import { intersectStripExtents } from '@/core/geometry'
import type { PlankType, PoseParams, Room } from '@/core/types'

describe('Bornage minRowGap — pièce A (étroite, allongée) deuxième rangée', () => {
  const poseParams: PoseParams = {
    cale: 0.5,
    sawWidth: 0.3,
    minPlankLength: 30,
    minRowGap: 15,
  }

  const plankType: PlankType = {
    id: '37bd5114-f7d8-4102-a427-1ad4dcc723bc',
    projectId: 'fce8ad68-b42e-45a6-9d17-ab40a5bbf495',
    name: 'Intenso ARTENS granya',
    length: 125.7,
    width: 19.2,
    pricing: { type: 'lot', pricePerLot: 33.58, lotSize: 7 },
    description: '',
  }

  const room: Room = {
    id: '94fdf526-4cae-49a6-b540-088ac40daf0c',
    projectId: 'fce8ad68-b42e-45a6-9d17-ab40a5bbf495',
    name: 'Pièce A',
    vertices: [
      { x: -323.5474825850006, y: 253.35021006911055 },
      { x: -323.5474825850006, y: 175.5405643842415 },
      { x: -318.114827143039, y: 175.5405643842415 },
      { x: -318.114827143039, y: 165.20099434954042 },
      { x: -284.46741279282537, y: 165.20099434954042 },
      { x: -284.46741279282537, y: 160.64457365628232 },
      { x: -205.78153235925285, y: 160.64457365628232 },
      { x: -205.78153235925285, y: 165.20099434954042 },
      { x: -179.31924294840775, y: 165.20099434954042 },
      { x: -179.31924294840775, y: 161.8980309526521 },
      { x: -102.83107543639866, y: 161.8980309526521 },
      { x: -102.83107543639866, y: 165.20099434954042 },
      { x: -90.23107543639867, y: 165.20099434954042 },
      { x: -90.23107543639867, y: 255.2850059894957 },
      { x: -97.83107543639866, y: 255.2850059894957 },
      { x: -97.83107543639866, y: 259.5850059894957 },
      { x: -138.63107543639867, y: 259.5850059894957 },
      { x: -138.63107543639867, y: 263.2850059894957 },
      { x: -318.114827143039, y: 263.2850059894957 },
      { x: -318.114827143039, y: 253.35021006911055 },
    ],
    rows: [
      { id: '800a9221', roomId: '94fdf526-4cae-49a6-b540-088ac40daf0c', plankTypeId: '37bd5114-f7d8-4102-a427-1ad4dcc723bc', segments: [{ xOffset: 0 }] },
    ],
  }

  it('rangée 2 doit respecter minRowGap par rapport à rangée 1', () => {
    const row = addRow(room, plankType, poseParams, [plankType])!
    const xOffset = row.segments[0].xOffset

    const roomMinY = Math.min(...room.vertices.map(v => v.y))

    // prev row (index 0)
    const yStart0 = roomMinY + poseParams.cale
    const yEnd0 = yStart0 + plankType.width
    const prevSegs = intersectStripExtents(room.vertices, yStart0, yEnd0)
    const prevWidth = prevSegs[0][1] - prevSegs[0][0]
    const prevPlanks = fillRow(0, prevWidth, plankType, poseParams)
    const prevAvailable = prevWidth - 2 * poseParams.cale
    const prevJoint = prevAvailable - prevPlanks[prevPlanks.length - 1].length

    // new row (index 1)
    const yStart1 = roomMinY + poseParams.cale + plankType.width
    const yEnd1 = yStart1 + plankType.width
    const newSegs = intersectStripExtents(room.vertices, yStart1, yEnd1)
    const newWidth = newSegs[0][1] - newSegs[0][0]
    const newPlanks = fillRow(xOffset, newWidth, plankType, poseParams)
    const newAvailable = newWidth - 2 * poseParams.cale
    const newJoint = newAvailable - newPlanks[newPlanks.length - 1].length

    const gap = Math.abs(newJoint - prevJoint)
    console.log('xOffset:', xOffset, 'prevJoint:', prevJoint.toFixed(2), 'newJoint:', newJoint.toFixed(2), 'gap:', gap.toFixed(2))

    expect(gap).toBeGreaterThanOrEqual(poseParams.minRowGap - 0.001)
  })
})

describe('Bornage minPlankLength — pièce B (concave, chute prev quasi nulle)', () => {
  const poseParams: PoseParams = {
    cale: 0.5,
    sawWidth: 0.3,
    minPlankLength: 30,
    minRowGap: 15,
  }

  const plankType: PlankType = {
    id: '37bd5114-f7d8-4102-a427-1ad4dcc723bc',
    projectId: 'fce8ad68-b42e-45a6-9d17-ab40a5bbf495',
    name: 'Intenso ARTENS granya',
    length: 125.7,
    width: 19.2,
    pricing: { type: 'lot', pricePerLot: 33.58, lotSize: 7 },
    description: '',
  }

  const room: Room = {
    id: '370bb543-1e1f-4bdd-9159-215029462d2a',
    projectId: 'fce8ad68-b42e-45a6-9d17-ab40a5bbf495',
    name: 'Pièce B',
    vertices: [
      { x: -125.46999999999997, y: -183.2815 },
      { x: 143.39200000000008, y: -183.2815 },
      { x: 143.39200000000008, y: 157.45450000000005 },
      { x: -106.17049999999996, y: 157.45450000000005 },
      { x: -106.17049999999996, y: 160.31719265665035 },
      { x: -179.7952577726822, y: 160.31719265665035 },
      { x: -179.7952577726822, y: 157.45450000000005 },
      { x: -187.1205802718433, y: 157.45450000000005 },
      { x: -187.1205802718433, y: 52.55784326109634 },
      { x: -127.87137987390015, y: 52.55784326109634 },
      { x: -127.87137987390015, y: 43.38953779058623 },
      { x: -187.1205802718433, y: 43.38953779058623 },
      { x: -187.1205802718433, y: -127.21046220941375 },
      { x: -125.46999999999997, y: -127.21046220941375 },
    ],
    rows: [
      { id: '2b727400', roomId: '370bb543-1e1f-4bdd-9159-215029462d2a', plankTypeId: '37bd5114-f7d8-4102-a427-1ad4dcc723bc', segments: [{ xOffset: 13.6 }] },
      { id: 'adb17636', roomId: '370bb543-1e1f-4bdd-9159-215029462d2a', plankTypeId: '37bd5114-f7d8-4102-a427-1ad4dcc723bc', segments: [{ xOffset: 30.4 }] },
      { id: '2023ae7d', roomId: '370bb543-1e1f-4bdd-9159-215029462d2a', plankTypeId: '37bd5114-f7d8-4102-a427-1ad4dcc723bc', segments: [{ xOffset: 47.2 }] },
    ],
  }

  it('chute du prev quasi nulle → ne tente pas de reuse, première planche entière', () => {
    const row = addRow(room, plankType, poseParams, [plankType])!

    const roomMinY = Math.min(...room.vertices.map(v => v.y))
    const yStart = roomMinY + poseParams.cale + room.rows.length * plankType.width
    const yEnd = yStart + plankType.width
    const xSegments = intersectStripExtents(room.vertices, yStart, yEnd)
    expect(xSegments.length).toBeGreaterThan(0)
    const segWidth = xSegments[0][1] - xSegments[0][0]
    const xOffset = row.segments[0].xOffset
    const planks = fillRow(xOffset, segWidth, plankType, poseParams)
    const first = planks[0]
    const last = planks[planks.length - 1]

    console.log('segWidth:', segWidth)
    console.log('xOffset auto:', xOffset)
    console.log('planks:', planks.map(p => p.length.toFixed(2)))

    expect(first.length).toBeGreaterThanOrEqual(poseParams.minPlankLength - 0.001)
    expect(last.length).toBeGreaterThanOrEqual(poseParams.minPlankLength - 0.001)
  })
})

describe('Bornage minPlankLength — pièce C (concave avec notch latéral)', () => {
  const poseParams: PoseParams = {
    cale: 0.5,
    sawWidth: 0.3,
    minPlankLength: 30,
    minRowGap: 15,
  }

  const plankType: PlankType = {
    id: '37bd5114-f7d8-4102-a427-1ad4dcc723bc',
    projectId: 'fce8ad68-b42e-45a6-9d17-ab40a5bbf495',
    name: 'Intenso ARTENS granya',
    length: 125.7,
    width: 19.2,
    pricing: { type: 'lot', pricePerLot: 33.58, lotSize: 7 },
    description: '',
  }

  const room: Room = {
    id: 'bae2f677-c7d6-485d-a5c2-a0e654a66aa6',
    projectId: 'fce8ad68-b42e-45a6-9d17-ab40a5bbf495',
    name: 'Pièce C',
    vertices: [
      { x: -606.2143327964734, y: 115.47083911595784 },
      { x: -327.4022817964733, y: 115.47083911595784 },
      { x: -327.4022817964733, y: 175.42916811595788 },
      { x: -324.0254657964733, y: 175.42916811595788 },
      { x: -324.0254657964733, y: 253.26619841595794 },
      { x: -327.4022817964733, y: 253.26619841595794 },
      { x: -327.4022817964733, y: 443.046069315958 },
      { x: -606.2143327964734, y: 443.046069315958 },
    ],
    rows: [],
  }

  it('rangée fraîchement ajoutée → dernière lame ≥ minPlankLength', () => {
    const row = addRow(room, plankType, poseParams, [plankType])!

    // Reproduire la géométrie réelle du segment[0] (comme au rendu)
    const roomMinY = Math.min(...room.vertices.map(v => v.y))
    const yStart = roomMinY + poseParams.cale
    const yEnd = yStart + plankType.width
    const xSegments = intersectStripExtents(room.vertices, yStart, yEnd)
    expect(xSegments.length).toBeGreaterThan(0)

    const segWidth = xSegments[0][1] - xSegments[0][0]
    const xOffset = row.segments[0].xOffset
    const planks = fillRow(xOffset, segWidth, plankType, poseParams)
    const last = planks[planks.length - 1]

    console.log('segWidth:', segWidth)
    console.log('xOffset auto:', xOffset)
    console.log('planks:', planks.map(p => p.length.toFixed(2)))
    console.log('last:', last.length.toFixed(2))

    expect(last.length).toBeGreaterThanOrEqual(poseParams.minPlankLength - 0.001)
  })
})
