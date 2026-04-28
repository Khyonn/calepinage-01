import type { AppDispatch, AppState } from '@/store/types'
import { projectActions } from '@/store/projectSlice'
import { addRow as addRowCore } from '@/core/addRow'

export const addRowThunk = () => (dispatch: AppDispatch, getState: () => AppState) => {
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
