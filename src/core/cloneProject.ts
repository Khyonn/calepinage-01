import type { BackgroundPlan, PlankType, Project, Room } from '@/core/types'
import { remapProjectIds, type SerializedProject } from '@/core/projectSerialize'
import { DEFAULT_POSE_PARAMS } from '@/core/defaults'

export interface CloneOptions {
  catalog: boolean
  poseParams: boolean
  backgroundPlan: boolean
  rooms: boolean
  rows: boolean
}

/**
 * Clone an existing project. Each section (catalog, pose, plan, rooms, rows)
 * is copied selectively. Dependencies are enforced automatically: copying rows
 * implies copying rooms and catalog (otherwise plankTypeId references would be
 * broken).
 *
 * The returned Project has freshly generated UUIDs and no shared id with
 * the source.
 */
export function cloneProject(
  source: Project,
  options: CloneOptions,
  newName: string,
): Project {
  const opts: CloneOptions = {
    ...options,
    rooms: options.rooms || options.rows,
    catalog: options.catalog || options.rows,
  }

  const catalog: PlankType[] = opts.catalog ? source.catalog : []
  const rooms: Room[] = opts.rooms
    ? source.rooms.map(r => ({
        ...r,
        rows: opts.rows ? r.rows : [],
      }))
    : []

  const filtered: SerializedProject['project'] = {
    id: source.id,
    name: newName,
    poseParams: opts.poseParams ? source.poseParams : DEFAULT_POSE_PARAMS,
    catalog,
    rooms,
  }

  if (opts.backgroundPlan && source.backgroundPlan) {
    filtered.backgroundPlan = stripImageFile(source.backgroundPlan)
  }

  const cloned = remapProjectIds(filtered)

  if (opts.backgroundPlan && source.backgroundPlan?.imageFile && cloned.backgroundPlan) {
    cloned.backgroundPlan = {
      ...cloned.backgroundPlan,
      imageFile: source.backgroundPlan.imageFile,
    }
  }

  return cloned
}

function stripImageFile(plan: BackgroundPlan): Omit<BackgroundPlan, 'imageFile'> {
  const copy: BackgroundPlan = { ...plan }
  delete copy.imageFile
  return copy
}
