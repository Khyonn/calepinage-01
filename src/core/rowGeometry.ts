import type { Plank, PlankType, PoseParams, Room } from '@/core/types'
import { intersectStripExtents } from '@/core/geometry'
import { fillRow } from '@/core/rowFill'

export interface RowSegmentGeometry {
  xStart: number
  xEnd: number
  planks: Plank[]
}

export interface RowGeometry {
  plankType: PlankType
  yStart: number
  yEnd: number
  segments: RowSegmentGeometry[]
}

/**
 * Compute the geometry of a row within a room: y strip + per-segment x range
 * and plank positions (planks.x is local to segment, after left cale).
 *
 * Returns null if the row index is invalid or the plank type is missing.
 */
export function computeRowGeometry(
  room: Room,
  rowIndex: number,
  catalog: PlankType[],
  poseParams: PoseParams,
): RowGeometry | null {
  const row = room.rows[rowIndex]
  if (!row) return null

  const plankType = catalog.find(pt => pt.id === row.plankTypeId)
  if (!plankType) return null

  const roomMinY = room.vertices.length > 0 ? Math.min(...room.vertices.map(v => v.y)) : 0
  const yStart = roomMinY + poseParams.cale + rowIndex * plankType.width
  const yEnd = yStart + plankType.width

  const xSegments = intersectStripExtents(room.vertices, yStart, yEnd)
  const segments: RowSegmentGeometry[] = xSegments.map(([xStart, xEnd], i) => ({
    xStart,
    xEnd,
    planks: fillRow(row.segments[i]?.xOffset ?? 0, xEnd - xStart, plankType, poseParams),
  }))

  return { plankType, yStart, yEnd, segments }
}
