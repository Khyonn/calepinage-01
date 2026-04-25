import type { PlankType, PoseParams, Room } from '@/core/types'
import { computeDefaultXOffset } from '@/core/addRow'

/**
 * Propagate offcut changes to downstream rows of the same plank type
 * within a single room.
 *
 * Mutates room.rows[i].segments[0].xOffset for every row positioned
 * after `changedRowId` that shares its plankTypeId. Each downstream row
 * recomputes its default xOffset based on the new state of the upstream
 * chain (via computeDefaultXOffset).
 *
 * Intended to be called inside an Immer-enabled reducer on the draft.
 * Only segments[0] is touched — inner segments (concave rooms) keep
 * their manually set offsets.
 *
 * If `changedRowId` is not found, this function is a no-op.
 */
export function propagateOffcuts(
  room: Room,
  plankTypes: PlankType[],
  poseParams: PoseParams,
  changedRowId: string,
): void {
  const changedIndex = room.rows.findIndex(r => r.id === changedRowId)
  if (changedIndex === -1) return

  const changedRow = room.rows[changedIndex]
  const plankType = plankTypes.find(pt => pt.id === changedRow.plankTypeId)
  if (!plankType) return

  for (let i = changedIndex + 1; i < room.rows.length; i++) {
    const row = room.rows[i]
    if (row.plankTypeId !== changedRow.plankTypeId) continue
    if (!row.segments[0]) continue

    row.segments[0].xOffset = computeDefaultXOffset(room, plankType, poseParams, i, plankTypes)
  }
}
