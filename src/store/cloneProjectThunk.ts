import type { AppDispatch, AppState } from '@/store/types'
import { projectActions } from '@/store/projectSlice'
import { loadProject } from '@/persistence/db'
import { cloneProject, type CloneOptions } from '@/core/cloneProject'
import { disambiguateName } from '@/core/projectSerialize'
import type { LastProjectIdStore } from '@/persistence/lastProjectId'

export const cloneProjectThunk = (
  sourceId: string,
  options: CloneOptions,
  newName: string,
  lastStore: LastProjectIdStore,
) =>
  async (dispatch: AppDispatch, getState: () => AppState) => {
    const source = await loadProject(sourceId)
    if (!source) return

    const existingNames = getState().project.list.map(p => p.name)
    const resolvedName = disambiguateName(newName, existingNames)
    const cloned = cloneProject(source, options, resolvedName)

    dispatch(projectActions.open(cloned))
    lastStore.write(cloned.id)
  }
