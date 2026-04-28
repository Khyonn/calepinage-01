import { createSelector } from '@reduxjs/toolkit'
import type { AppState } from '@/store/types'
import { computeOffcutLinks } from '@/core/rowFill'
import { validateRow } from '@/core/validateRow'
import { computeSummary } from '@/core/computeSummary'
import { computeScale } from '@/core/calibration'
import { computeRowGeometry, type RowGeometry } from '@/core/rowGeometry'
import { canAppendRow, maxPlankWidth } from '@/core/rowYStart'
import type { ConstraintViolation, OffcutLink, Plank } from '@/core/types'

export const OFFCUT_LINK_ID_SEP = '→'
export const offcutLinkId = (link: OffcutLink) =>
  `${link.sourceRowId}${OFFCUT_LINK_ID_SEP}${link.targetRowId}`

// ─── Base selectors ───────────────────────────────────────────────────────────

export const selectCurrentProject = (state: AppState) => state.project.current
export const selectProjectList = (state: AppState) => state.project.list
export const selectUI = (state: AppState) => state.ui
export const selectActiveRoomId = (state: AppState) => state.ui.activeRoomId
export const selectInteractionMode = (state: AppState) => state.ui.mode
export const selectDrawerOpen = (state: AppState) => state.ui.drawerOpen
export const selectHoveredOffcutLinkId = (state: AppState) => state.ui.hoveredOffcutLinkId

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

export const selectBackgroundPlan = createSelector(
  selectCurrentProject,
  (project) => project?.backgroundPlan ?? null
)

export const selectBackgroundPlanScale = createSelector(
  selectBackgroundPlan,
  (plan) => computeScale(plan?.calibration)
)

export const selectActiveRoom = createSelector(
  selectRooms,
  selectActiveRoomId,
  (rooms, activeRoomId) => rooms.find(r => r.id === activeRoomId) ?? null
)

export const selectActiveRoomHasRows = createSelector(
  selectActiveRoom,
  (room) => (room?.rows.length ?? 0) > 0
)

export const selectSelectedPlankTypeId = (state: AppState) => state.ui.selectedPlankTypeId

/**
 * True when a new row can still be appended in the active room — i.e. the
 * previous row's bottom edge does not exceed roomMaxY. Independent of the
 * selected plank type's width: the rule only checks that vertical room
 * remains, not whether the new row fits entirely.
 */
export const selectCanAppendRowToActiveRoom = createSelector(
  selectActiveRoom,
  selectCatalog,
  selectPoseParams,
  selectSelectedPlankTypeId,
  (room, catalog, poseParams, selectedId) => {
    if (!room || !poseParams || !selectedId) return false
    return canAppendRow(room, catalog, poseParams)
  }
)

/**
 * Bornes du yOffset de pièce (cm). max=0, min=-max(catalog.width).
 * Avec catalog vide, min=max=0 → champ neutralisé côté UI.
 */
export const selectRoomYOffsetBounds = createSelector(
  selectCatalog,
  (catalog) => ({ min: -maxPlankWidth(catalog), max: 0 })
)

export const selectUsedPlankTypeIds = createSelector(
  selectRooms,
  (rooms): Set<string> => new Set(rooms.flatMap(r => r.rows.map(row => row.plankTypeId)))
)

export const selectPlankTypeUsage = createSelector(
  selectRooms,
  (rooms): Map<string, number> => {
    const usage = new Map<string, number>()
    for (const room of rooms) {
      for (const row of room.rows) {
        usage.set(row.plankTypeId, (usage.get(row.plankTypeId) ?? 0) + 1)
      }
    }
    return usage
  }
)

// ─── Row geometry (per-row, parametric) ──────────────────────────────────────

interface RowGeometryProps {
  roomId: string
  rowId: string
}

/**
 * Factory — create a parametric selector returning the geometry of one row
 * (y strip + per-segment x range and planks). Use `useMemo(makeSelectRowGeometry, [])`
 * per component instance so each <Row> gets its own memoization cache.
 */
export function makeSelectRowGeometry() {
  return createSelector(
    [
      selectCurrentProject,
      selectPoseParams,
      (_: AppState, props: RowGeometryProps) => props.roomId,
      (_: AppState, props: RowGeometryProps) => props.rowId,
    ],
    (project, poseParams, roomId, rowId): RowGeometry | null => {
      if (!project || !poseParams) return null
      const room = project.rooms.find(r => r.id === roomId)
      if (!room) return null
      const rowIndex = room.rows.findIndex(r => r.id === rowId)
      if (rowIndex === -1) return null
      return computeRowGeometry(room, rowIndex, project.catalog, poseParams)
    }
  )
}

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
 * Returns a map of rowId → flattened Plank[] (all segments concatenated).
 * Planks keep their segment-local x; use makeSelectRowGeometry for rendering.
 */
export const selectAllPlanks = createSelector(
  selectRooms,
  selectCatalog,
  selectPoseParams,
  (rooms, catalog, poseParams): Map<string, Plank[]> => {
    const result = new Map<string, Plank[]>()
    if (!poseParams) return result
    for (const room of rooms) {
      room.rows.forEach((row, idx) => {
        const geom = computeRowGeometry(room, idx, catalog, poseParams)
        if (!geom) return
        result.set(row.id, geom.segments.flatMap(s => s.planks))
      })
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

export interface HighlightedPlank {
  rowId: string
  position: 'first' | 'last'
}

export const selectHighlightedPlanks = createSelector(
  selectHoveredOffcutLinkId,
  (hoveredId): HighlightedPlank[] => {
    if (!hoveredId) return []
    const [sourceId, targetId] = hoveredId.split(OFFCUT_LINK_ID_SEP)
    const out: HighlightedPlank[] = []
    if (sourceId) out.push({ rowId: sourceId, position: 'last' })
    if (targetId) out.push({ rowId: targetId, position: 'first' })
    return out
  }
)

export const selectViolations = createSelector(
  selectRooms,
  selectCatalog,
  selectPoseParams,
  (rooms, catalog, poseParams) => {
    if (!poseParams) return []
    const out: ConstraintViolation[] = []
    for (const room of rooms) {
      for (let idx = 0; idx < room.rows.length; idx++) {
        const row = room.rows[idx]
        const geom = computeRowGeometry(room, idx, catalog, poseParams)
        if (!geom) continue
        const prevGeom = idx > 0 ? computeRowGeometry(room, idx - 1, catalog, poseParams) : null
        geom.segments.forEach((seg, segIdx) => {
          const available = (seg.xEnd - seg.xStart) - 2 * poseParams.cale
          if (available <= 0) return
          const prevPlanks = prevGeom?.segments[segIdx]?.planks
          out.push(...validateRow(row.id, seg.planks, prevPlanks, available, poseParams))
        })
      }
    }
    return out
  }
)
