import { createSelector } from '@reduxjs/toolkit'
import type { AppState } from '@/store/types'
import { fillRow, computeOffcutLinks } from '@/core/rowFill'
import { validateRow } from '@/core/validateRow'
import { computeSummary } from '@/core/computeSummary'
import type { Plank } from '@/core/types'

// ─── Base selectors ───────────────────────────────────────────────────────────

export const selectCurrentProject = (state: AppState) => state.project.current
export const selectProjectList = (state: AppState) => state.project.list
export const selectUI = (state: AppState) => state.ui
export const selectViewport = (state: AppState) => state.ui.viewport
export const selectActiveRoomId = (state: AppState) => state.ui.activeRoomId
export const selectInteractionMode = (state: AppState) => state.ui.mode

export const selectRooms = createSelector(
  selectCurrentProject,
  (project) => project?.rooms ?? []
)

export const selectCatalog = createSelector(
  selectCurrentProject,
  (project) => project?.catalog ?? []
)

export const selectPoseParams = createSelector(
  selectCurrentProject,
  (project) => project?.poseParams ?? null
)

export const selectActiveRoom = createSelector(
  selectRooms,
  selectActiveRoomId,
  (rooms, activeRoomId) => rooms.find(r => r.id === activeRoomId) ?? null
)

export const selectUsedPlankTypeIds = createSelector(
  selectRooms,
  (rooms): Set<string> => new Set(rooms.flatMap(r => r.rows.map(row => row.plankTypeId)))
)

// ─── Derived computations (memoized) ─────────────────────────────────────────

export const selectOffcutLinks = createSelector(
  selectRooms,
  selectCatalog,
  selectPoseParams,
  (rooms, catalog, poseParams) => {
    if (!poseParams) return []
    return computeOffcutLinks(rooms, catalog, poseParams)
  }
)

/**
 * Returns a map of rowId → Plank[] for all rows in the current project.
 * Recomputed only when rooms, catalog, or poseParams change.
 */
export const selectAllPlanks = createSelector(
  selectRooms,
  selectCatalog,
  selectPoseParams,
  (rooms, catalog, poseParams): Map<string, Plank[]> => {
    const result = new Map<string, Plank[]>()
    if (!poseParams) return result

    for (const room of rooms) {
      const xs = room.vertices.map(v => v.x)
      const roomWidth = xs.length >= 2 ? Math.max(...xs) - Math.min(...xs) : 0
      const plankType = catalog.find(pt => room.rows.some(r => r.plankTypeId === pt.id))

      for (const row of room.rows) {
        const type = catalog.find(pt => pt.id === row.plankTypeId) ?? plankType
        if (type) result.set(row.id, fillRow(row.segments[0]?.xOffset ?? 0, roomWidth, type, poseParams))
      }
    }
    return result
  }
)

export const selectSummary = createSelector(
  selectRooms,
  selectCatalog,
  selectPoseParams,
  selectOffcutLinks,
  (rooms, catalog, poseParams, offcutLinks) => {
    if (!poseParams) return null
    return computeSummary(rooms, catalog, poseParams, offcutLinks)
  }
)

export const selectViolations = createSelector(
  selectRooms,
  selectPoseParams,
  selectAllPlanks,
  (rooms, poseParams, allPlanks) => {
    if (!poseParams) return []
    return rooms.flatMap(room =>
      room.rows.flatMap((row, idx) => {
        const planks = allPlanks.get(row.id) ?? []
        const prevRow = idx > 0 ? room.rows[idx - 1] : undefined
        const prevPlanks = prevRow ? (allPlanks.get(prevRow.id) ?? []) : undefined
        const xs = room.vertices.map(v => v.x)
        const availableWidth = xs.length >= 2 ? Math.max(...xs) - Math.min(...xs) - 2 * poseParams.cale : 0
        return validateRow(row.id, planks, prevPlanks, availableWidth, poseParams)
      })
    )
  }
)
