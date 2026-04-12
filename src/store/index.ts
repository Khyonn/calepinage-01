import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { projectReducer } from '@/store/projectSlice'
import { uiReducer } from '@/store/uiSlice'
import { idbMiddleware } from '@/store/idbMiddleware'
import { listProjects, loadProject } from '@/store/db'

const rootReducer = combineReducers({
  project: projectReducer,
  ui: uiReducer,
})

export async function createAppStore() {
  const list = await listProjects()
  const current = list[0] ? await loadProject(list[0].id) : null

  return configureStore({
    reducer: rootReducer,
    preloadedState: { project: { list, current } },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: false,
        serializableCheck: {
          ignoredPaths: ['project.current.backgroundPlan.imageFile'],
        },
      }).concat(idbMiddleware),
  })
}

export type AppStore = Awaited<ReturnType<typeof createAppStore>>
export type AppDispatch = AppStore['dispatch']
