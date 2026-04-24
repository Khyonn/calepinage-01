import type { PlankType, PoseParams, Room, Row } from '@/core/types'
import { intersectStripWithPolygon } from '@/core/geometry'
import { computeOffcutLength } from '@/core/rowFill'

const EPSILON = 0.001

/**
 * Build a new Row for the given room and plank type.
 *
 * Y position is derived from the number of existing rows × plankType.width
 * (simplified: assumes all prior rows share the same width).
 *
 * Default xOffset for segment[0] consumes the offcut produced by the most
 * recent previous row of the same plank type within this room (if any).
 * Other segments initialize to xOffset: 0.
 */
export function addRow(room: Room, plankType: PlankType, poseParams?: PoseParams): Row {
  const roomMinY = room.vertices.length > 0 ? Math.min(...room.vertices.map(v => v.y)) : 0
  const caleY = poseParams?.cale ?? 0
  const yStart = roomMinY + caleY + room.rows.length * plankType.width
  const yEnd = yStart + plankType.width

  const xSegments = intersectStripWithPolygon(room.vertices, yStart, yEnd)

  const firstXOffset = poseParams ? computeDefaultXOffset(room, plankType, poseParams) : 0

  const segments = xSegments.length > 0
    ? xSegments.map((_, i) => ({ xOffset: i === 0 ? firstXOffset : 0 }))
    : [{ xOffset: firstXOffset }]

  return {
    id: crypto.randomUUID(),
    roomId: room.id,
    plankTypeId: plankType.id,
    segments,
  }
}

/**
 * Compute the default xOffset for segment[0] of a new or existing row,
 * consuming the offcut produced by the most recent previous row of the
 * same plank type in the same room.
 *
 * upToRowIndex (exclusive): look only at rows[0..upToRowIndex-1].
 * Defaults to room.rows.length (all rows considered).
 */
export function computeDefaultXOffset(
  room: Room,
  plankType: PlankType,
  poseParams: PoseParams,
  upToRowIndex?: number,
): number {
  const end = upToRowIndex ?? room.rows.length
  const slice = room.rows.slice(0, end)
  const prev = [...slice].reverse().find(r => r.plankTypeId === plankType.id)
  if (!prev) return 0

  const prevXOffset = prev.segments[0]?.xOffset ?? 0
  const roomWidth = computeRoomWidth(room)
  const offcut = computeOffcutLength(prevXOffset, roomWidth, plankType, poseParams)
  if (offcut <= EPSILON) return 0

  return plankType.length - offcut
}

function computeRoomWidth(room: Room): number {
  if (room.vertices.length < 2) return 0
  const xs = room.vertices.map(v => v.x)
  return Math.max(...xs) - Math.min(...xs)
}
