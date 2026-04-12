import type { OffcutLink, PlankType, PoseParams, Room, SummaryResult } from '@/core/types'
import { fillRow } from '@/core/rowFill'

/**
 * Compute how many planks need to be purchased per type, and the total cost.
 *
 * A row starting with a reused offcut (= has an inbound OffcutLink) does not
 * require purchasing a plank for its first piece — it was already counted in
 * the source row.
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
      const roomWidth = computeRoomWidth(room)

      for (const row of room.rows) {
        if (row.plankTypeId !== plankType.id) continue

        const planks = fillRow(row.xOffset, roomWidth, plankType, poseParams)
        if (planks.length === 0) continue

        const startsFromOffcut = consumingRowIds.has(row.id)

        // First piece: needs a fresh plank unless it comes from a reused offcut
        if (!startsFromOffcut) planksNeeded++

        // Middle + last planks (index 1 onward), each cut from a fresh plank
        planksNeeded += planks.length - 1
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

function computeRoomWidth(room: Room): number {
  if (room.vertices.length < 2) return 0
  const xs = room.vertices.map(v => v.x)
  return Math.max(...xs) - Math.min(...xs)
}
