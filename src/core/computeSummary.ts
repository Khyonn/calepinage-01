import type { OffcutLink, PlankType, PoseParams, Room, SummaryResult } from '@/core/types'
import { fillRow } from '@/core/rowFill'
import { intersectStripExtents } from '@/core/geometry'
import { computeRowYStart } from '@/core/rowYStart'

/**
 * Compute how many planks need to be purchased per type, and the total cost.
 *
 * A row starting with a reused offcut (= has an inbound OffcutLink) does not
 * require purchasing a plank for its first piece — it was already counted in
 * the source row.
 *
 * Multi-segment rows (non-rectangular rooms) are summed across all geometric
 * segments. Each row's segment widths come from `intersectStripExtents`,
 * matching the renderer and `computeOffcutLinks` (cf. 13.4).
 */
export function computeSummary(
  rooms: Room[],
  catalog: PlankType[],
  poseParams: PoseParams,
  offcutLinks: OffcutLink[],
): SummaryResult {
  const consumingRowIds = new Set(offcutLinks.map(l => l.targetRowId))

  const byType = catalog.map(plankType => {
    let planksNeeded = 0

    for (const room of rooms) {
      for (let i = 0; i < room.rows.length; i++) {
        const row = room.rows[i]
        if (row.plankTypeId !== plankType.id) continue

        const yStart = computeRowYStart(room, i, catalog, poseParams)
        const yEnd = yStart + plankType.width
        const segments = intersectStripExtents(room.vertices, yStart, yEnd)
        if (segments.length === 0) continue

        const startsFromOffcut = consumingRowIds.has(row.id)

        segments.forEach(([xStart, xEnd], segIdx) => {
          const segWidth = xEnd - xStart
          const xOffset = row.segments[segIdx]?.xOffset ?? 0
          const planks = fillRow(xOffset, segWidth, plankType, poseParams)
          if (planks.length === 0) return

          // First piece of segment[0]: covered by the reused offcut when the
          // row is a target. Other segments are independent and always need
          // a fresh first plank.
          const firstFromOffcut = segIdx === 0 && startsFromOffcut
          if (!firstFromOffcut) planksNeeded++

          planksNeeded += planks.length - 1
        })
      }
    }

    const cost = computeCost(planksNeeded, plankType)
    return { plankTypeId: plankType.id, planksNeeded, cost }
  })

  const totalCost = byType.reduce((sum, s) => sum + s.cost, 0)
  return { byType, totalCost }
}

function computeCost(planksNeeded: number, plankType: PlankType): number {
  const { pricing } = plankType
  if (pricing.type === 'unit') {
    return planksNeeded * pricing.pricePerUnit
  }
  return Math.ceil(planksNeeded / pricing.lotSize) * pricing.pricePerLot
}
