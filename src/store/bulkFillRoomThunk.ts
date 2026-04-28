import type { AppDispatch, AppState } from '@/store/types'
import { projectActions } from '@/store/projectSlice'
import { addRow as addRowCore } from '@/core/addRow'

const MAX_ITERATIONS = 1000

/**
 * Append rows of the selected plank type to the active room until no more
 * fit (canAppendRow → false). Each row uses computeDefaultXOffset for
 * straight pose with offcut reuse where applicable.
 *
 * No-op if no active room or no selected plank type.
 */
export const bulkFillRoomThunk = () => (dispatch: AppDispatch, getState: () => AppState) => {
  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const state = getState()
    const { activeRoomId, selectedPlankTypeId } = state.ui
    if (!activeRoomId || !selectedPlankTypeId || !state.project.current) return

    const room = state.project.current.rooms.find(r => r.id === activeRoomId)
    const plankType = state.project.current.catalog.find(pt => pt.id === selectedPlankTypeId)
    const poseParams = state.project.current.poseParams
    if (!room || !plankType) return

    const row = addRowCore(room, plankType, poseParams, state.project.current.catalog)
    if (!row) return
    dispatch(projectActions.addRow({ roomId: activeRoomId, row }))
  }
}
