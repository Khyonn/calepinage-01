// ─── Geometry ────────────────────────────────────────────────────────────────

export interface Point {
  x: number
  y: number
}

export interface Viewport {
  zoom: number
  panX: number
  panY: number
}

// ─── Calibration ─────────────────────────────────────────────────────────────

export interface Calibration {
  point1: Point        // pixel coords on image
  point2: Point        // pixel coords on image
  realDistance: number // cm
}

// ─── Plank types ─────────────────────────────────────────────────────────────

export type PlankTypePricing =
  | { type: 'unit'; pricePerUnit: number }
  | { type: 'lot'; pricePerLot: number; lotSize: number }

export interface PlankType {
  id: string
  projectId: string
  name: string
  length: number // cm
  width: number  // cm
  pricing: PlankTypePricing
  description: string
}

// ─── Pose parameters ─────────────────────────────────────────────────────────

export interface PoseParams {
  cale: number           // dilatation gap (cm), default 0.5
  sawWidth: number       // saw blade width (cm), default 0.1
  minPlankLength: number // minimum valid plank length (cm), default 30
  minRowGap: number      // minimum gap between row end joints (cm), default 15
}

// ─── Domain entities (assembled by store layer from DB records) ───────────────
//
// These types represent the fully-assembled view used by business logic.
// The store layer (src/store/) is responsible for loading and assembling
// individual records into these structures.

export interface Row {
  id: string
  roomId: string
  plankTypeId: string
  segments: { xOffset: number }[]  // one per geometric segment, xOffset persisted
}

export interface Room {
  id: string
  projectId: string
  name: string
  vertices: Point[]
  rows: Row[]
}

export interface BackgroundPlan {
  id: string
  projectId: string
  imageFile?: File     // resolved from files store; undefined if no image yet
  calibration?: Calibration
  opacity: number      // 0–1
  rotation: number     // 0 | 90 | 180 | 270
  x: number            // cm — horizontal position (drag in plan mode)
  y: number            // cm — vertical position (drag in plan mode)
}

export interface Project {
  id: string
  name: string
  poseParams: PoseParams   // embedded (1:1 with project)
  catalog: PlankType[]     // assembled from plankTypes store
  rooms: Room[]            // assembled from rooms + rows stores
  backgroundPlan?: BackgroundPlan // assembled from plans + files stores
}

// ─── Computed types (never stored) ───────────────────────────────────────────

export interface Plank {
  x: number      // position within available width (cm), starts at 0
  length: number // cm
}

export type ConstraintViolationType =
  | 'first-plank-too-short'
  | 'last-plank-too-short'
  | 'row-gap-too-small'

export interface ConstraintViolation {
  type: ConstraintViolationType
  rowId: string
}

export interface OffcutLink {
  sourceRowId: string // row that generated the offcut (at its end)
  targetRowId: string // row that consumes the offcut (at its start)
  length: number      // offcut length in cm
}

export interface PlankTypeSummary {
  plankTypeId: string
  planksNeeded: number
  cost: number
}

export interface SummaryResult {
  byType: PlankTypeSummary[]
  totalCost: number
}
