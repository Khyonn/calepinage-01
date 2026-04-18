import type { PlankType, Room, Row } from '@/core/types'
import { intersectStripWithPolygon } from '@/core/geometry'

/**
 * Build a new Row for the given room and plank type.
 *
 * Y position is derived from the number of existing rows × plankType.width
 * (simplified: assumes all prior rows share the same width).
 * Each geometric segment gets xOffset: 0 as initial value.
 */
export function addRow(room: Room, plankType: PlankType): Row {
  const roomMinY = room.vertices.length > 0 ? Math.min(...room.vertices.map(v => v.y)) : 0
  const yStart = roomMinY + (room.yOffset ?? 0) + room.rows.length * plankType.width
  const yEnd = yStart + plankType.width

  const xSegments = intersectStripWithPolygon(room.vertices, yStart, yEnd)

  return {
    id: crypto.randomUUID(),
    roomId: room.id,
    plankTypeId: plankType.id,
    segments: xSegments.length > 0 ? xSegments.map(() => ({ xOffset: 0 })) : [{ xOffset: 0 }],
  }
}
