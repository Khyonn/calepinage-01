import type { BackgroundPlan, PlankType, Project, Room, Row } from '@/core/types'
import { clampYOffset } from '@/core/rowYStart'

export const JSON_SCHEMA_VERSION = 1

export interface SerializedImage {
  name: string
  mimeType: string
  dataUrl: string
}

type SerializedBackgroundPlan = Omit<BackgroundPlan, 'imageFile'>

export interface SerializedProject {
  version: number
  exportedAt: string
  project: {
    id: string
    name: string
    poseParams: Project['poseParams']
    catalog: PlankType[]
    rooms: Room[]
    backgroundPlan?: SerializedBackgroundPlan
  }
  image?: SerializedImage
}

export function projectToJson(project: Project, image?: SerializedImage): string {
  const { backgroundPlan, ...rest } = project
  const serializedPlan = backgroundPlan ? stripImageFile(backgroundPlan) : undefined
  const payload: SerializedProject = {
    version: JSON_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    project: {
      id: rest.id,
      name: rest.name,
      poseParams: rest.poseParams,
      catalog: rest.catalog,
      rooms: rest.rooms,
      ...(serializedPlan ? { backgroundPlan: serializedPlan } : {}),
    },
    ...(image ? { image } : {}),
  }
  return JSON.stringify(payload, null, 2)
}

function stripImageFile(plan: BackgroundPlan): SerializedBackgroundPlan {
  const copy = { ...plan }
  delete copy.imageFile
  return copy
}

export interface ImportResult {
  project: Project
  image?: SerializedImage
}

export function projectFromJson(jsonString: string): ImportResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(jsonString)
  } catch {
    throw new Error('Fichier corrompu')
  }

  if (!looksLikeSerialized(parsed)) throw new Error('Fichier corrompu')
  if (parsed.version !== JSON_SCHEMA_VERSION) throw new Error('Format non supporté')

  const project = remapProjectIds(parsed.project)
  return { project, ...(parsed.image ? { image: parsed.image } : {}) }
}

function looksLikeSerialized(v: unknown): v is SerializedProject {
  if (!v || typeof v !== 'object') return false
  const r = v as Record<string, unknown>
  if (typeof r.version !== 'number') return false
  if (typeof r.exportedAt !== 'string') return false
  const p = r.project as Record<string, unknown> | undefined
  if (!p || typeof p !== 'object') return false
  if (typeof p.id !== 'string' || typeof p.name !== 'string') return false
  if (!p.poseParams || typeof p.poseParams !== 'object') return false
  if (!Array.isArray(p.catalog) || !Array.isArray(p.rooms)) return false
  return true
}

/**
 * Re-generate project/room/row/plankType/plan ids and remap cross-references.
 * Pure function; reusable for cloning (jalon 15.5).
 */
export function remapProjectIds(source: SerializedProject['project']): Project {
  const newProjectId = crypto.randomUUID()
  const plankIdMap = new Map<string, string>()
  const roomIdMap = new Map<string, string>()

  const catalog: PlankType[] = source.catalog.map(pt => {
    const newId = crypto.randomUUID()
    plankIdMap.set(pt.id, newId)
    return { ...pt, id: newId, projectId: newProjectId }
  })

  const rooms: Room[] = source.rooms.map(room => {
    const newRoomId = crypto.randomUUID()
    roomIdMap.set(room.id, newRoomId)
    const rows: Row[] = room.rows.map(row => ({
      ...row,
      id: crypto.randomUUID(),
      roomId: newRoomId,
      plankTypeId: plankIdMap.get(row.plankTypeId) ?? row.plankTypeId,
    }))
    const yOffset = clampYOffset(room.yOffset ?? 0, catalog)
    return { ...room, id: newRoomId, projectId: newProjectId, yOffset, rows }
  })

  const project: Project = {
    id: newProjectId,
    name: source.name,
    poseParams: source.poseParams,
    catalog,
    rooms,
  }

  if (source.backgroundPlan) {
    project.backgroundPlan = {
      ...source.backgroundPlan,
      id: crypto.randomUUID(),
      projectId: newProjectId,
    }
  }

  return project
}

export function disambiguateName(name: string, existing: string[]): string {
  if (!existing.includes(name)) return name
  const suffixed = `${name} (importé)`
  if (!existing.includes(suffixed)) return suffixed
  let counter = 2
  while (existing.includes(`${name} (importé ${counter})`)) counter++
  return `${name} (importé ${counter})`
}
