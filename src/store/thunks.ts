import type { AppDispatch, AppState } from '@/store/types'
import { projectActions } from '@/store/projectSlice'
import { loadProject } from '@/persistence/db'
import type { LastProjectIdStore } from '@/persistence/lastProjectId'

export { addRowThunk } from './addRowThunk'
export { importProjectThunk } from './importProjectThunk'

export const openProjectThunk = (id: string, lastStore: LastProjectIdStore) =>
  async (dispatch: AppDispatch) => {
    const project = await loadProject(id)
    if (!project) return
    dispatch(projectActions.open(project))
    lastStore.write(id)
  }

export const createProjectThunk = (name: string, lastStore: LastProjectIdStore) =>
  (dispatch: AppDispatch, getState: () => AppState) => {
    dispatch(projectActions.create({ name }))
    const created = getState().project.current
    if (created) lastStore.write(created.id)
  }

export const deleteProjectThunk = (id: string, lastStore: LastProjectIdStore) =>
  (dispatch: AppDispatch, getState: () => AppState) => {
    dispatch(projectActions.delete({ id }))
    const state = getState()
    if (state.project.list.length === 0) {
      dispatch(projectActions.create({ name: 'Nouveau projet' }))
    } else if (!state.project.current) {
      // pick first alpha as fallback
      const fallback = state.project.list[0]
      if (fallback) {
        void loadProject(fallback.id).then(p => {
          if (p) dispatch(projectActions.open(p))
        })
      }
    }
    const current = getState().project.current
    if (current) lastStore.write(current.id)
  }
