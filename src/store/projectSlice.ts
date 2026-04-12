import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { BackgroundPlan, PlankType, PoseParams, Project, Point } from '@/core/types'
import type { ProjectState, ProjectsListEntry } from '@/store/types'

const DEFAULT_POSE_PARAMS: PoseParams = {
  cale: 0.5,
  sawWidth: 0.1,
  minPlankLength: 30,
  minRowGap: 15,
}

const initialState: ProjectState = {
  list: [],
  current: null,
}

export const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    open: (state, action: PayloadAction<Project>) => {
      state.current = { ...action.payload, lastOpenedAt: Date.now() }
    },

    close: (state) => {
      state.current = null
    },

    create: (state, action: PayloadAction<{ name: string }>) => {
      const project: Project = {
        id: crypto.randomUUID(),
        name: action.payload.name,
        poseParams: DEFAULT_POSE_PARAMS,
        catalog: [],
        rooms: [],
        lastOpenedAt: Date.now(),
      }
      const entry: ProjectsListEntry = { id: project.id, name: project.name, lastOpenedAt: project.lastOpenedAt }
      state.list.push(entry)
      state.current = project
    },

    updateName: (state, action: PayloadAction<{ name: string }>) => {
      if (!state.current) return
      state.current.name = action.payload.name
      const entry = state.list.find(p => p.id === state.current!.id)
      if (entry) entry.name = action.payload.name
    },

    updatePoseParams: (state, action: PayloadAction<PoseParams>) => {
      if (!state.current) return
      state.current.poseParams = action.payload
    },

    delete: (state, action: PayloadAction<{ id: string }>) => {
      state.list = state.list.filter(p => p.id !== action.payload.id)
      if (state.current?.id === action.payload.id) state.current = null
    },

    addRoom: (state, action: PayloadAction<{ name: string; vertices: Point[]; yOffset?: number }>) => {
      if (!state.current) return
      state.current.rooms.push({
        id: crypto.randomUUID(),
        projectId: state.current.id,
        name: action.payload.name,
        vertices: action.payload.vertices,
        ...(action.payload.yOffset !== undefined ? { yOffset: action.payload.yOffset } : {}),
        rows: [],
      })
    },

    updateRoom: (state, action: PayloadAction<{ id: string; name?: string; vertices?: Point[]; yOffset?: number }>) => {
      if (!state.current) return
      const room = state.current.rooms.find(r => r.id === action.payload.id)
      if (!room) return
      if (action.payload.name !== undefined) room.name = action.payload.name
      if (action.payload.vertices !== undefined) room.vertices = action.payload.vertices
      if (action.payload.yOffset !== undefined) room.yOffset = action.payload.yOffset
    },

    deleteRoom: (state, action: PayloadAction<{ id: string }>) => {
      if (!state.current) return
      state.current.rooms = state.current.rooms.filter(r => r.id !== action.payload.id)
    },

    addRow: (state, action: PayloadAction<{ roomId: string; plankTypeId: string; xOffset: number }>) => {
      if (!state.current) return
      const room = state.current.rooms.find(r => r.id === action.payload.roomId)
      if (!room) return
      room.rows.push({
        id: crypto.randomUUID(),
        roomId: action.payload.roomId,
        plankTypeId: action.payload.plankTypeId,
        xOffset: action.payload.xOffset,
      })
    },

    updateRow: (state, action: PayloadAction<{ id: string; roomId: string; xOffset: number }>) => {
      if (!state.current) return
      const room = state.current.rooms.find(r => r.id === action.payload.roomId)
      if (!room) return
      const row = room.rows.find(r => r.id === action.payload.id)
      if (!row) return
      row.xOffset = action.payload.xOffset
    },

    deleteRow: (state, action: PayloadAction<{ id: string; roomId: string }>) => {
      if (!state.current) return
      const room = state.current.rooms.find(r => r.id === action.payload.roomId)
      if (!room) return
      room.rows = room.rows.filter(r => r.id !== action.payload.id)
    },

    addPlankType: (state, action: PayloadAction<Omit<PlankType, 'id' | 'projectId'>>) => {
      if (!state.current) return
      state.current.catalog.push({ id: crypto.randomUUID(), projectId: state.current.id, ...action.payload })
    },

    updatePlankType: (state, action: PayloadAction<PlankType>) => {
      if (!state.current) return
      const idx = state.current.catalog.findIndex(pt => pt.id === action.payload.id)
      if (idx !== -1) state.current.catalog[idx] = action.payload
    },

    deletePlankType: (state, action: PayloadAction<{ id: string }>) => {
      if (!state.current) return
      state.current.catalog = state.current.catalog.filter(pt => pt.id !== action.payload.id)
    },

    setPlan: (state, action: PayloadAction<BackgroundPlan>) => {
      if (!state.current) return
      state.current.backgroundPlan = action.payload
    },

    updatePlan: (state, action: PayloadAction<Partial<Omit<BackgroundPlan, 'id' | 'projectId'>>>) => {
      if (!state.current?.backgroundPlan) return
      Object.assign(state.current.backgroundPlan, action.payload)
    },

    removePlan: (state) => {
      if (!state.current) return
      delete state.current.backgroundPlan
    },
  },
})

export const projectActions = projectSlice.actions
export const projectReducer = projectSlice.reducer
