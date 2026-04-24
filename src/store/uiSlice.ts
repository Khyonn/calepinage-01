import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { InteractionMode, UIState } from '@/store/types'

const initialState: UIState = {
  mode: 'nav',
  activeRoomId: null,
  selectedPlankTypeId: null,
  drawerOpen: false,
  hoveredOffcutLinkId: null,
}

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setMode: (state, action: PayloadAction<InteractionMode>) => {
      state.mode = action.payload
    },

    setActiveRoom: (state, action: PayloadAction<string | null>) => {
      state.activeRoomId = action.payload
    },

    setSelectedPlankTypeId: (state, action: PayloadAction<string | null>) => {
      state.selectedPlankTypeId = action.payload
    },

    toggleDrawer: (state) => {
      state.drawerOpen = !state.drawerOpen
    },

    setDrawerOpen: (state, action: PayloadAction<boolean>) => {
      state.drawerOpen = action.payload
    },

    setHoveredOffcutLinkId: (state, action: PayloadAction<string | null>) => {
      state.hoveredOffcutLinkId = action.payload
    },
  },
})

export const uiActions = uiSlice.actions
export const uiReducer = uiSlice.reducer
