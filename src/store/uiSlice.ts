import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Viewport } from '@/core/types'
import type { InteractionMode, UIState } from '@/store/types'

const initialState: UIState = {
  mode: 'nav',
  activeRoomId: null,
  viewport: { zoom: 1, panX: 0, panY: 0 },
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

    setViewport: (state, action: PayloadAction<Viewport>) => {
      state.viewport = action.payload
    },
  },
})

export const uiActions = uiSlice.actions
export const uiReducer = uiSlice.reducer
