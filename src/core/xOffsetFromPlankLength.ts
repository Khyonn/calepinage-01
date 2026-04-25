import type { PlankType, PoseParams } from '@/core/types'
import { fillRow } from '@/core/rowFill'

const EPSILON = 0.001
const MIN_FIRST = 0.1 // cm — sliver minimal pour éviter xOffset = L (planche nulle)

/**
 * Convert a desired first-plank length into the corresponding xOffset.
 *
 * - `firstLength >= plankType.length` → xOffset = 0 (planche pleine).
 * - `firstLength <= 0`                → xOffset = L - MIN_FIRST (sliver, violation visible).
 * - sinon                             → xOffset = L - firstLength (formule directe).
 *
 * Résultat quantizé au 0,1 cm pour cohérence avec drag et persistance.
 */
export function xOffsetFromFirstLength(firstLength: number, plankType: PlankType): number {
  const L = plankType.length
  if (firstLength + EPSILON >= L) return 0
  if (firstLength <= MIN_FIRST) return quantize(L - MIN_FIRST)
  return quantize(L - firstLength)
}

/**
 * Find the xOffset (∈ [0, L), step 0,1 cm) that produces a last plank closest
 * to `targetLast`. Tie-break: smallest xOffset (least material wasted upfront).
 *
 * Robuste vs formule directe :
 *   - dernière planche initialement pleine (ℓ_orig = L)
 *   - édition qui traverse une frontière de planche pleine
 *   - valeurs cibles hors plage atteignable (renvoie le best match)
 */
export function xOffsetFromLastLength(
  targetLast: number,
  plankType: PlankType,
  segWidth: number,
  poseParams: PoseParams,
): number {
  const L = plankType.length
  const maxTenths = Math.round(L * 10) - 1

  let bestXOffset = 0
  let bestDelta = Number.POSITIVE_INFINITY

  for (let tenths = 0; tenths <= maxTenths; tenths++) {
    const x = tenths / 10
    const planks = fillRow(x, segWidth, plankType, poseParams)
    if (planks.length === 0) continue
    const last = planks[planks.length - 1].length
    const delta = Math.abs(last - targetLast)
    if (delta + EPSILON < bestDelta) {
      bestDelta = delta
      bestXOffset = x
    }
  }
  return bestXOffset
}

function quantize(n: number): number {
  return Math.round(n * 10) / 10
}
