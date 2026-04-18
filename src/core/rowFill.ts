import type { OffcutLink, Plank, PlankType, PoseParams, Room } from '@/core/types'

const EPSILON = 0.001 // cm — float comparison tolerance

/**
 * Fill a row with planks given an xOffset.
 *
 * xOffset (cm): the portion of the first plank that lies "behind" the left wall.
 *   - 0 → row starts with a full plank
 *   - >0 → row starts with a partial plank of length (plankType.length - xOffset)
 *
 * Returns planks positioned within the available width (after cale), x starting at 0.
 */
export function fillRow(
  xOffset: number,
  roomWidth: number,
  plankType: PlankType,
  poseParams: PoseParams,
): Plank[] {
  const available = roomWidth - 2 * poseParams.cale
  if (available <= 0) return []

  const planks: Plank[] = []
  const firstLength = xOffset === 0 ? plankType.length : plankType.length - xOffset
  let cursor = 0

  // First plank (may be partial if xOffset > 0)
  const first = Math.min(firstLength, available)
  planks.push({ x: cursor, length: first })
  cursor += first

  // Fill with full planks
  while (cursor + plankType.length <= available - EPSILON) {
    planks.push({ x: cursor, length: plankType.length })
    cursor += plankType.length
  }

  // Last cut plank (if something remains)
  const remaining = available - cursor
  if (remaining > EPSILON) {
    planks.push({ x: cursor, length: remaining })
  }

  return planks
}

/**
 * Compute the offcut length generated at the end of a row.
 * Returns 0 if the last plank is a full plank (no offcut).
 */
export function computeOffcutLength(
  xOffset: number,
  roomWidth: number,
  plankType: PlankType,
  poseParams: PoseParams,
): number {
  const planks = fillRow(xOffset, roomWidth, plankType, poseParams)
  if (planks.length === 0) return 0

  const lastPlank = planks[planks.length - 1]
  if (Math.abs(lastPlank.length - plankType.length) < EPSILON) return 0

  const offcut = plankType.length - lastPlank.length - poseParams.sawWidth
  return offcut > 0 ? offcut : 0
}

interface RowWithContext {
  rowId: string
  roomId: string
  xOffset: number
  roomWidth: number
}

/**
 * Infer offcut reuse links across all rooms in the project.
 *
 * For each plankType, rows that start with xOffset > 0 may be consuming
 * an offcut produced by a previous row of the same type.
 * A link exists when: offcut(sourceRow) ≈ plankType.length - xOffset(targetRow).
 *
 * Each offcut can only be consumed once (greedy, order-preserving).
 */
export function computeOffcutLinks(
  rooms: Room[],
  plankTypes: PlankType[],
  poseParams: PoseParams,
): OffcutLink[] {
  const links: OffcutLink[] = []

  for (const plankType of plankTypes) {
    // Collect all rows of this type across all rooms, in order
    const rows: RowWithContext[] = []
    for (const room of rooms) {
      for (const row of room.rows) {
        if (row.plankTypeId === plankType.id) {
          rows.push({ rowId: row.id, roomId: room.id, xOffset: row.segments[0]?.xOffset ?? 0, roomWidth: computeRoomWidth(room) })
        }
      }
    }

    // Available offcuts pool: { sourceRowId, length }
    const offcuts: Array<{ sourceRowId: string; length: number }> = []

    for (const row of rows) {
      const consumed = row.xOffset > 0 ? plankType.length - row.xOffset : 0

      if (consumed > EPSILON) {
        // Try to match with an available offcut
        const idx = offcuts.findIndex(o => Math.abs(o.length - consumed) < EPSILON)
        if (idx !== -1) {
          const match = offcuts.splice(idx, 1)[0]
          links.push({ sourceRowId: match.sourceRowId, targetRowId: row.rowId, length: match.length })
        }
      }

      // Produce an offcut at the end of this row
      const offcutLen = computeOffcutLength(row.xOffset, row.roomWidth, plankType, poseParams)
      if (offcutLen > EPSILON) {
        offcuts.push({ sourceRowId: row.rowId, length: offcutLen })
      }
    }
  }

  return links
}

function computeRoomWidth(room: Room): number {
  if (room.vertices.length < 2) return 0
  const xs = room.vertices.map(v => v.x)
  return Math.max(...xs) - Math.min(...xs)
}
