import type { Middleware } from '@reduxjs/toolkit'
import type { AppState } from '@/store/types'
import { isProjectAction } from '@/store/types'
import { projectSlice } from '@/store/projectSlice'
import { saveProject, deleteProject } from '@/persistence/db'

/**
 * Synchronizes project state to IndexedDB after every project action.
 * UI actions (interaction mode, selection) are intentionally not persisted.
 *
 * Fire-and-forget: IDB writes are async but don't block dispatch.
 */
export const idbMiddleware: Middleware<object, AppState> = (store) => (next) => (action) => {
  const result = next(action)

  if (!isProjectAction(action as { type: string })) return result

  const { project } = store.getState()

  if (projectSlice.actions.delete.match(action)) {
    void deleteProject(action.payload.id)
  } else if (project.current) {
    void saveProject(project.current)
  }

  return result
}
