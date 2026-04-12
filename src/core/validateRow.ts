import type { ConstraintViolation, Plank, PoseParams } from '@/core/types'

/**
 * Validate a row against the three layout constraints.
 *
 * @param rowId        - ID of the row being validated
 * @param planks       - Computed planks for this row
 * @param prevPlanks   - Computed planks of the previous row of the same type (if any)
 * @param availableWidth - Room width minus 2× cale (cm)
 * @param poseParams   - Pose parameters
 */
export function validateRow(
  rowId: string,
  planks: Plank[],
  prevPlanks: Plank[] | undefined,
  availableWidth: number,
  poseParams: PoseParams,
): ConstraintViolation[] {
  if (planks.length === 0) return []

  const violations: ConstraintViolation[] = []

  const firstPlank = planks[0]
  const lastPlank = planks[planks.length - 1]

  // Constraint 1: first plank too short
  if (firstPlank.length < poseParams.minPlankLength) {
    violations.push({ type: 'first-plank-too-short', rowId })
  }

  // Constraint 2: last plank too short
  if (lastPlank.length < poseParams.minPlankLength) {
    violations.push({ type: 'last-plank-too-short', rowId })
  }

  // Constraint 3: gap between end joints too small
  if (prevPlanks !== undefined && prevPlanks.length > 0) {
    const prevLastPlank = prevPlanks[prevPlanks.length - 1]
    const thisJoint = availableWidth - lastPlank.length
    const prevJoint = availableWidth - prevLastPlank.length
    const gap = Math.abs(thisJoint - prevJoint)

    if (gap < poseParams.minRowGap) {
      violations.push({ type: 'row-gap-too-small', rowId })
    }
  }

  return violations
}
