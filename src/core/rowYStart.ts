import type { PlankType, PoseParams, Room } from '@/core/types'

const EPSILON = 0.001

/**
 * Largest plank.width in catalog (cm). Used to bound a room's yOffset.
 * Returns 0 for an empty catalog.
 */
export function maxPlankWidth(catalog: PlankType[]): number {
  return catalog.reduce((m, pt) => Math.max(m, pt.width), 0)
}

/**
 * Clamp a raw yOffset value into [-maxPlankWidth(catalog), 0]. Applied at
 * read-time so the runtime stays consistent even when the catalog shrinks
 * after a yOffset was set with a wider plank type.
 */
export function clampYOffset(raw: number, catalog: PlankType[]): number {
  const max = maxPlankWidth(catalog)
  if (raw > 0) return 0
  if (raw < -max) return -max
  return raw
}

/**
 * Sum widths of rows[0..rowIndex-1] using each row's own plankType width.
 * Returns the y of that row's top edge (= roomMinY + yOffset + cale + Σ prior widths).
 *
 * Replaces the legacy `rowIndex × plankType.width` formula, which assumed
 * every prior row shared the new row's width and produced wrong Y positions
 * when types alternated (cf. bug "largeur planche").
 */
export function computeRowYStart(
  room: Room,
  rowIndex: number,
  catalog: PlankType[],
  poseParams: PoseParams,
): number {
  const roomMinY = room.vertices.length > 0 ? Math.min(...room.vertices.map(v => v.y)) : 0
  const yOffset = clampYOffset(room.yOffset ?? 0, catalog)
  let y = roomMinY + yOffset + poseParams.cale
  const upTo = Math.min(rowIndex, room.rows.length)
  for (let i = 0; i < upTo; i++) {
    const pt = catalog.find(p => p.id === room.rows[i].plankTypeId)
    if (!pt) continue
    y += pt.width
  }
  return y
}

/**
 * True if a new row can be appended at the end of `room.rows`.
 *
 * Rule: the previous row must end inside the room — i.e. the y at which
 * the new row would start (= sum of prior row widths + cale + yOffset)
 * must not exceed `roomMaxY`. The new row itself may extend beyond
 * `roomMaxY`; the renderer truncates via `intersectStripExtents`.
 */
export function canAppendRow(
  room: Room,
  catalog: PlankType[],
  poseParams: PoseParams,
): boolean {
  if (room.vertices.length === 0) return false
  const roomMaxY = Math.max(...room.vertices.map(v => v.y))
  const yStart = computeRowYStart(room, room.rows.length, catalog, poseParams)
  return yStart <= roomMaxY + EPSILON
}
