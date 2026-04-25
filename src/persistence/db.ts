import { openDB, type DBSchema } from 'idb'
import type { BackgroundPlan, PlankType, Project, Room, Row } from '@/core/types'
import type { FileRecord, PlanRecord, PlankTypeRecord, ProjectRecord, ProjectsListEntry, RoomRecord, RowRecord } from '@/store/types'

// ─── Schema ───────────────────────────────────────────────────────────────────

interface CalepinageDB extends DBSchema {
  projects:   { key: string; value: ProjectRecord }
  rooms:      { key: string; value: RoomRecord;      indexes: { projectId: string } }
  rows:       { key: string; value: RowRecord;        indexes: { roomId: string; projectId: string } }
  plankTypes: { key: string; value: PlankTypeRecord;  indexes: { projectId: string } }
  files:      { key: string; value: FileRecord }
  plans:      { key: string; value: PlanRecord;       indexes: { projectId: string } }
}

const dbPromise = openDB<CalepinageDB>('calepinage', 2, {
  async upgrade(db, oldVersion, _newVersion, tx) {
    if (oldVersion < 1) {
      db.createObjectStore('projects', { keyPath: 'id' })
      db.createObjectStore('rooms', { keyPath: 'id' }).createIndex('projectId', 'projectId')
      const rows = db.createObjectStore('rows', { keyPath: 'id' })
      rows.createIndex('roomId', 'roomId')
      rows.createIndex('projectId', 'projectId')
      db.createObjectStore('plankTypes', { keyPath: 'id' }).createIndex('projectId', 'projectId')
      db.createObjectStore('files', { keyPath: 'id' })
      db.createObjectStore('plans', { keyPath: 'id' }).createIndex('projectId', 'projectId')
    }
    if (oldVersion < 2) {
      // v2 — RowRecord gains `order: number`. Original insertion order is
      // unrecoverable from existing data (cursor walks by primary key UUID).
      // Backfill assigns order = encounter index per roomId so every record
      // has the field populated; the next save of any project rewrites
      // order from the live `room.rows` array (correct order). Until that
      // save occurs, row layout may visibly shift on first reload —
      // documented as a known limitation of the v1 → v2 migration.
      const rowsStore = tx.objectStore('rows')
      const perRoomCount = new Map<string, number>()
      let cursor = await rowsStore.openCursor()
      while (cursor) {
        const value = cursor.value as RowRecord & { order?: number }
        if (value.order === undefined) {
          const idx = perRoomCount.get(value.roomId) ?? 0
          await cursor.update({ ...value, order: idx })
          perRoomCount.set(value.roomId, idx + 1)
        }
        cursor = await cursor.continue()
      }
    }
  },
})

// ─── Public API ───────────────────────────────────────────────────────────────

export async function listProjects(): Promise<ProjectsListEntry[]> {
  const db = await dbPromise
  const records = await db.getAll('projects')
  return records
    .map(r => ({ id: r.id, name: r.name }))
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'))
}

export async function loadProject(id: string): Promise<Project | null> {
  const db = await dbPromise
  const tx = db.transaction(['projects', 'rooms', 'rows', 'plankTypes', 'plans', 'files'], 'readonly')

  const projectRecord = await tx.objectStore('projects').get(id)
  if (!projectRecord) return null

  const [roomRecords, plankTypeRecords, planRecords] = await Promise.all([
    tx.objectStore('rooms').index('projectId').getAll(id),
    tx.objectStore('plankTypes').index('projectId').getAll(id),
    tx.objectStore('plans').index('projectId').getAll(id),
  ])

  const planRecord = planRecords[0] as PlanRecord | undefined

  const [rowGroups, fileRecord] = await Promise.all([
    Promise.all(roomRecords.map(r => tx.objectStore('rows').index('roomId').getAll(r.id))),
    planRecord?.fileId ? tx.objectStore('files').get(planRecord.fileId) : Promise.resolve(undefined),
  ])

  await tx.done

  const rooms: Room[] = roomRecords.map((room, i) => ({
    id: room.id, projectId: room.projectId, name: room.name, vertices: room.vertices,
    rows: (rowGroups[i] ?? [])
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((row): Row => ({
        id: row.id, roomId: row.roomId, plankTypeId: row.plankTypeId, segments: row.segments,
      })),
  }))

  const catalog: PlankType[] = plankTypeRecords.map(pt => ({
    id: pt.id, projectId: pt.projectId, name: pt.name,
    length: pt.length, width: pt.width, pricing: pt.pricing, description: pt.description,
  }))

  let backgroundPlan: BackgroundPlan | undefined
  if (planRecord) {
    backgroundPlan = {
      id: planRecord.id, projectId: planRecord.projectId,
      calibration: planRecord.calibration, opacity: planRecord.opacity, rotation: planRecord.rotation,
      x: planRecord.x, y: planRecord.y,
      ...(fileRecord ? { imageFile: fileRecord.file } : {}),
    }
  }

  return {
    id: projectRecord.id, name: projectRecord.name,
    poseParams: projectRecord.poseParams,
    rooms, catalog, backgroundPlan,
  }
}

export async function saveProject(project: Project): Promise<void> {
  const db = await dbPromise
  const tx = db.transaction(['projects', 'rooms', 'rows', 'plankTypes', 'plans', 'files'], 'readwrite')

  const [roomKeys, rowKeys, ptKeys, planKeys] = await Promise.all([
    tx.objectStore('rooms').index('projectId').getAllKeys(project.id),
    tx.objectStore('rows').index('projectId').getAllKeys(project.id),
    tx.objectStore('plankTypes').index('projectId').getAllKeys(project.id),
    tx.objectStore('plans').index('projectId').getAllKeys(project.id),
  ])

  await Promise.all([
    ...roomKeys.map(k => tx.objectStore('rooms').delete(k)),
    ...rowKeys.map(k => tx.objectStore('rows').delete(k)),
    ...ptKeys.map(k => tx.objectStore('plankTypes').delete(k)),
    ...planKeys.map(k => tx.objectStore('plans').delete(k)),
    tx.objectStore('projects').put({ id: project.id, name: project.name, poseParams: project.poseParams }),
    ...project.rooms.map(room =>
      tx.objectStore('rooms').put({
        id: room.id, projectId: room.projectId, name: room.name, vertices: room.vertices,
      })
    ),
    ...project.rooms.flatMap(room =>
      room.rows.map((row, order) => tx.objectStore('rows').put({
        id: row.id, roomId: row.roomId, projectId: project.id,
        plankTypeId: row.plankTypeId, segments: row.segments, order,
      }))
    ),
    ...project.catalog.map(pt =>
      tx.objectStore('plankTypes').put({ id: pt.id, projectId: pt.projectId, name: pt.name, length: pt.length, width: pt.width, pricing: pt.pricing, description: pt.description })
    ),
  ])

  if (project.backgroundPlan) {
    const { imageFile, ...planFields } = project.backgroundPlan
    const fileId = imageFile ? `${project.backgroundPlan.id}-file` : undefined
    await tx.objectStore('plans').put({ ...planFields, fileId })
    if (imageFile && fileId) await tx.objectStore('files').put({ id: fileId, file: imageFile })
  }

  await tx.done
}

export async function deleteProject(id: string): Promise<void> {
  const db = await dbPromise
  const tx = db.transaction(['projects', 'rooms', 'rows', 'plankTypes', 'plans'], 'readwrite')

  const [roomKeys, rowKeys, ptKeys, planKeys] = await Promise.all([
    tx.objectStore('rooms').index('projectId').getAllKeys(id),
    tx.objectStore('rows').index('projectId').getAllKeys(id),
    tx.objectStore('plankTypes').index('projectId').getAllKeys(id),
    tx.objectStore('plans').index('projectId').getAllKeys(id),
  ])

  await Promise.all([
    tx.objectStore('projects').delete(id),
    ...roomKeys.map(k => tx.objectStore('rooms').delete(k)),
    ...rowKeys.map(k => tx.objectStore('rows').delete(k)),
    ...ptKeys.map(k => tx.objectStore('plankTypes').delete(k)),
    ...planKeys.map(k => tx.objectStore('plans').delete(k)),
  ])

  await tx.done
}
