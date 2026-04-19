import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { projectReducer, projectActions } from '@/store/projectSlice'
import { uiReducer } from '@/store/uiSlice'
import { idbMiddleware } from '@/store/idbMiddleware'
import { listProjects, loadProject } from '@/persistence/db'
import {
  localStorageLastProjectId,
  type LastProjectIdStore,
} from '@/persistence/lastProjectId'

const rootReducer = combineReducers({
  project: projectReducer,
  ui: uiReducer,
})

interface CreateAppStoreOptions {
  lastProjectIdStore?: LastProjectIdStore
}

export async function createAppStore({
  lastProjectIdStore = localStorageLastProjectId,
}: CreateAppStoreOptions = {}) {
  const list = await listProjects()
  const lastId = lastProjectIdStore.read()

  let current = null
  if (lastId && list.some(p => p.id === lastId)) current = await loadProject(lastId)
  else if (list.length > 0) current = await loadProject(list[0].id)

  const store = configureStore({
    reducer: rootReducer,
    preloadedState: { project: { list, current } },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredPaths: ['project.current.backgroundPlan.imageFile'],
        },
      }).concat(idbMiddleware),
  })

  if (!current) {
    store.dispatch(projectActions.create({ name: 'Nouveau projet' }))
  }

  const resolved = store.getState().project.current
  if (resolved) lastProjectIdStore.write(resolved.id)

  return store
}

export type AppStore = Awaited<ReturnType<typeof createAppStore>>
export type AppDispatch = AppStore['dispatch']
