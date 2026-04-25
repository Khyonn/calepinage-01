import type { PlankType, PoseParams, Room, Row } from '@/core/types'
import { intersectStripExtents } from '@/core/geometry'
import { computeOffcutLength, fillRow } from '@/core/rowFill'

const EPSILON = 0.001

/**
 * Build a new Row for the given room and plank type.
 *
 * Y position is derived from the number of existing rows × plankType.width
 * (simplified: assumes all prior rows share the same width).
 *
 * Default xOffset for segment[0] consumes the offcut produced by the most
 * recent previous row of the same plank type within this room (if any).
 * Other segments initialize to xOffset: 0.
 */
export function addRow(
  room: Room,
  plankType: PlankType,
  poseParams?: PoseParams,
  plankTypes?: PlankType[],
): Row {
  const roomMinY = room.vertices.length > 0 ? Math.min(...room.vertices.map(v => v.y)) : 0
  const caleY = poseParams?.cale ?? 0
  const yStart = roomMinY + caleY + room.rows.length * plankType.width
  const yEnd = yStart + plankType.width

  const xSegments = intersectStripExtents(room.vertices, yStart, yEnd)

  const firstXOffset = poseParams
    ? computeDefaultXOffset(room, plankType, poseParams, undefined, plankTypes)
    : 0

  const segments = xSegments.length > 0
    ? xSegments.map((_, i) => ({ xOffset: i === 0 ? firstXOffset : 0 }))
    : [{ xOffset: firstXOffset }]

  return {
    id: crypto.randomUUID(),
    roomId: room.id,
    plankTypeId: plankType.id,
    segments,
  }
}

/**
 * Compute the default xOffset for segment[0] of a new or existing row.
 *
 * Strategy:
 *  - If a previous same-type row produces an exploitable offcut
 *    (≥ minPlankLength), consume it and search descending from xFull —
 *    maximizes offcut reuse while keeping first/last planks valid.
 *  - Otherwise, search ascending from 0 for the smallest valid xOffset.
 *
 * In both cases, `minRowGap` (joint distance from the immediately preceding
 * row, regardless of plank type) is enforced when possible. If no value
 * satisfies both `minPlankLength` AND `minRowGap`, the search retries
 * with `minPlankLength` only — bornage prefers a relaxed aesthetic
 * over a layout violation.
 *
 * upToRowIndex (exclusive): look only at rows[0..upToRowIndex-1].
 * plankTypes: required to look up the plankType of the row at index-1
 *   for `minRowGap` enforcement when it differs from the new row's type.
 *   If omitted, only same-type previous rows participate in row-gap.
 */
export function computeDefaultXOffset(
  room: Room,
  plankType: PlankType,
  poseParams: PoseParams,
  upToRowIndex?: number,
  plankTypes?: PlankType[],
): number {
  const rowIndex = upToRowIndex ?? room.rows.length
  const slice = room.rows.slice(0, rowIndex)
  const segWidth = computeFirstSegmentWidth(room, plankType, poseParams, rowIndex)
  const prevJoint = computePrevJointInfo(room, slice, plankTypes ?? [plankType], poseParams)

  let prevSameTypeIndex = -1
  for (let i = slice.length - 1; i >= 0; i--) {
    if (slice[i].plankTypeId === plankType.id) { prevSameTypeIndex = i; break }
  }

  if (prevSameTypeIndex === -1) {
    return findValidXOffsetAscending(segWidth, plankType, poseParams, prevJoint)
  }

  const prev = slice[prevSameTypeIndex]
  const prevSegWidth = computeFirstSegmentWidth(room, plankType, poseParams, prevSameTypeIndex)
  const prevXOffset = prev.segments[0]?.xOffset ?? 0
  const offcut = computeOffcutLength(prevXOffset, prevSegWidth, plankType, poseParams)
  if (offcut + EPSILON < poseParams.minPlankLength) {
    return findValidXOffsetAscending(segWidth, plankType, poseParams, prevJoint)
  }

  const xFull = plankType.length - offcut
  return findValidXOffsetDescending(xFull, segWidth, plankType, poseParams, prevJoint)
}

interface PrevJointInfo {
  available: number
  lastPlankLength: number
}

function computePrevJointInfo(
  room: Room,
  slice: Row[],
  plankTypes: PlankType[],
  poseParams: PoseParams,
): PrevJointInfo | null {
  if (slice.length === 0) return null
  const prevIndex = slice.length - 1
  const prevRow = slice[prevIndex]
  const prevPlankType = plankTypes.find(pt => pt.id === prevRow.plankTypeId)
  if (!prevPlankType) return null
  const prevWidth = computeFirstSegmentWidth(room, prevPlankType, poseParams, prevIndex)
  if (prevWidth <= 0) return null
  const planks = fillRow(prevRow.segments[0]?.xOffset ?? 0, prevWidth, prevPlankType, poseParams)
  if (planks.length === 0) return null
  return {
    available: prevWidth - 2 * poseParams.cale,
    lastPlankLength: planks[planks.length - 1].length,
  }
}

/**
 * Compute the actual width of segment[0] for the row at `rowIndex`,
 * matching the geometry the renderer uses (`intersectStripExtents`).
 *
 * For non-rectangular rooms, the bounding-box width can differ from the
 * actual strip width at a given y-band — using bbox would let bornage
 * compute an xOffset that doesn't actually validate `minPlankLength`
 * once the row is rendered.
 */
function computeFirstSegmentWidth(
  room: Room,
  plankType: PlankType,
  poseParams: PoseParams,
  rowIndex: number,
): number {
  if (room.vertices.length === 0) return 0
  const roomMinY = Math.min(...room.vertices.map(v => v.y))
  const yStart = roomMinY + poseParams.cale + rowIndex * plankType.width
  const yEnd = yStart + plankType.width
  const segments = intersectStripExtents(room.vertices, yStart, yEnd)
  if (segments.length === 0) return 0
  return segments[0][1] - segments[0][0]
}

/**
 * Search the largest xOffset ∈ [0, xFull] (step 0.1 cm) satisfying both
 * `minPlankLength` and `minRowGap`; falls back to `minPlankLength`-only
 * if no value satisfies both, then to 0 if even that fails.
 */
function findValidXOffsetDescending(
  xFull: number,
  segWidth: number,
  plankType: PlankType,
  poseParams: PoseParams,
  prevJoint: PrevJointInfo | null,
): number {
  const xFullTenths = Math.round(xFull * 10)
  if (prevJoint !== null) {
    for (let t = xFullTenths; t >= 0; t--) {
      const x = t / 10
      if (checkConstraints(x, segWidth, plankType, poseParams, prevJoint, true)) return x
    }
  }
  for (let t = xFullTenths; t >= 0; t--) {
    const x = t / 10
    if (checkConstraints(x, segWidth, plankType, poseParams, null, false)) return x
  }
  return 0
}

/**
 * Search the smallest xOffset ∈ [0, plankType.length) (step 0.1 cm)
 * satisfying both constraints; falls back to `minPlankLength`-only
 * if none, then to 0.
 */
function findValidXOffsetAscending(
  segWidth: number,
  plankType: PlankType,
  poseParams: PoseParams,
  prevJoint: PrevJointInfo | null,
): number {
  const maxTenths = Math.round(plankType.length * 10) - 1
  if (prevJoint !== null) {
    for (let t = 0; t <= maxTenths; t++) {
      const x = t / 10
      if (checkConstraints(x, segWidth, plankType, poseParams, prevJoint, true)) return x
    }
  }
  for (let t = 0; t <= maxTenths; t++) {
    const x = t / 10
    if (checkConstraints(x, segWidth, plankType, poseParams, null, false)) return x
  }
  return 0
}

function checkConstraints(
  xOffset: number,
  segWidth: number,
  plankType: PlankType,
  poseParams: PoseParams,
  prevJoint: PrevJointInfo | null,
  enforceRowGap: boolean,
): boolean {
  const planks = fillRow(xOffset, segWidth, plankType, poseParams)
  if (planks.length === 0) return false

  if (planks.length > 1) {
    const first = planks[0]
    const last = planks[planks.length - 1]
    const min = poseParams.minPlankLength
    const firstFull = Math.abs(first.length - plankType.length) < EPSILON
    const lastFull = Math.abs(last.length - plankType.length) < EPSILON
    if (!firstFull && first.length + EPSILON < min) return false
    if (!lastFull && last.length + EPSILON < min) return false
  }

  if (enforceRowGap && prevJoint !== null) {
    const available = segWidth - 2 * poseParams.cale
    const last = planks[planks.length - 1]
    const thisJoint = available - last.length
    const prevJointPos = prevJoint.available - prevJoint.lastPlankLength
    const gap = Math.abs(thisJoint - prevJointPos)
    if (gap + EPSILON < poseParams.minRowGap) return false
  }
  return true
}

