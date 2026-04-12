import type {
  Calibration, PlankTypePricing,
  Point, PoseParams, Project, Viewport,
} from '@/core/types'
import type { UnknownAction } from '@reduxjs/toolkit'

// ─── IDB Storage Records ──────────────────────────────────────────────────────
// Flat records persisted in IndexedDB — distinct from assembled domain types.

export interface ProjectRecord {
  id: string
  name: string
  lastOpenedAt: number
  poseParams: PoseParams
}

export interface RoomRecord {
  id: string
  projectId: string
  name: string
  vertices: Point[]
  yOffset?: number
}

export interface RowRecord {
  id: string
  roomId: string
  projectId: string  // denormalized for cleanup (not in domain model)
  plankTypeId: string
  xOffset: number
}

export interface PlankTypeRecord {
  id: string
  projectId: string
  name: string
  length: number
  width: number
  pricing: PlankTypePricing
  description: string
}

export interface FileRecord {
  id: string
  file: File
}

export interface PlanRecord {
  id: string
  projectId: string
  fileId?: string
  calibration?: Calibration
  opacity: number
  rotation: number
}

// ─── App State ────────────────────────────────────────────────────────────────

export type InteractionMode = 'nav' | 'draw' | 'plan' | 'rows'

export interface ProjectsListEntry {
  id: string
  name: string
  lastOpenedAt: number
}

export interface ProjectState {
  list: ProjectsListEntry[]
  current: Project | null
}

export interface UIState {
  mode: InteractionMode
  activeRoomId: string | null
  viewport: Viewport
}

export interface AppState {
  project: ProjectState
  ui: UIState
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function isProjectAction(action: UnknownAction): boolean {
  return action.type.startsWith('project/')
}
