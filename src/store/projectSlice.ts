import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { BackgroundPlan, PlankType, PoseParams, Project, Point, Row } from '@/core/types'
import type { ProjectState, ProjectsListEntry } from '@/store/types'
import { propagateOffcuts } from '@/core/propagateOffcuts'
import { DEFAULT_POSE_PARAMS } from '@/core/defaults'
import { clampYOffset } from '@/core/rowYStart'

const initialState: ProjectState = {
  list: [],
  current: null,
}

export const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    open: (state, action: PayloadAction<Project>) => {
      state.current = action.payload
      const entry = state.list.find(p => p.id === action.payload.id)
      if (!entry) state.list.push({ id: action.payload.id, name: action.payload.name })
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
      }
      const entry: ProjectsListEntry = { id: project.id, name: project.name }
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

    addRoom: (state, action: PayloadAction<{ id?: string; name: string; vertices: Point[] }>) => {
      if (!state.current) return
      state.current.rooms.push({
        id: action.payload.id ?? crypto.randomUUID(),
        projectId: state.current.id,
        name: action.payload.name,
        vertices: action.payload.vertices,
        yOffset: 0,
        rows: [],
      })
    },

    updateRoom: (state, action: PayloadAction<{ id: string; name?: string; vertices?: Point[] }>) => {
      if (!state.current) return
      const room = state.current.rooms.find(r => r.id === action.payload.id)
      if (!room) return
      if (action.payload.name !== undefined) room.name = action.payload.name
      if (action.payload.vertices !== undefined) room.vertices = action.payload.vertices
    },

    setRoomYOffset: (state, action: PayloadAction<{ id: string; yOffset: number }>) => {
      if (!state.current) return
      const room = state.current.rooms.find(r => r.id === action.payload.id)
      if (!room) return
      room.yOffset = clampYOffset(action.payload.yOffset, state.current.catalog)
    },

    deleteRoom: (state, action: PayloadAction<{ id: string }>) => {
      if (!state.current) return
      state.current.rooms = state.current.rooms.filter(r => r.id !== action.payload.id)
    },

    addRow: (state, action: PayloadAction<{ roomId: string; row: Row }>) => {
      if (!state.current) return
      const room = state.current.rooms.find(r => r.id === action.payload.roomId)
      if (!room) return
      room.rows.push(action.payload.row)
    },

    updateSegmentOffset: (state, action: PayloadAction<{ roomId: string; rowId: string; segmentIndex: number; xOffset: number }>) => {
      if (!state.current) return
      const room = state.current.rooms.find(r => r.id === action.payload.roomId)
      if (!room) return
      const row = room.rows.find(r => r.id === action.payload.rowId)
      if (!row) return
      const segment = row.segments[action.payload.segmentIndex]
      if (!segment) return
      segment.xOffset = action.payload.xOffset
      // Cascade : seul le segment[0] produit la chute "fin de rangée"
      // utilisée par les rangées suivantes. Les autres segments (portions
      // intérieures d'une pièce concave) conservent leurs offsets manuels.
      if (action.payload.segmentIndex === 0) {
        propagateOffcuts(room, state.current.catalog, state.current.poseParams, action.payload.rowId)
      }
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
      if (idx === -1) return
      const inUse = state.current.rooms.some(r => r.rows.some(row => row.plankTypeId === action.payload.id))
      if (inUse) {
        const existing = state.current.catalog[idx]
        // Lock length and width when the type is referenced in at least one row
        state.current.catalog[idx] = { ...action.payload, length: existing.length, width: existing.width }
      } else {
        state.current.catalog[idx] = action.payload
      }
    },

    deletePlankType: (state, action: PayloadAction<{ id: string }>) => {
      if (!state.current) return
      const inUse = state.current.rooms.some(r => r.rows.some(row => row.plankTypeId === action.payload.id))
      if (inUse) return
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
