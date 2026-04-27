import { useMemo } from 'react'
import { useAppSelector } from '@/hooks/redux'
import {
  selectCurrentProject, selectOffcutLinks, selectPoseParams, selectCatalog,
  offcutLinkId,
} from '@/store/selectors'
import { computeRowGeometry } from '@/core/rowGeometry'
import type { OffcutLink, PlankType, PoseParams, Project } from '@/core/types'

export interface ResolvedLink {
  linkId: string
  otherRoomName: string
  otherRowIndex: number
  sameRoom: boolean
}

export interface RowEntry {
  rowId: string
  rowIndex: number
  firstLength: number | null
  lastLength: number | null
  incoming: ResolvedLink | null
  outgoing: ResolvedLink | null
}

export interface RoomEntry {
  roomId: string
  roomName: string
  rows: RowEntry[]
}

const round1 = (n: number) => Math.round(n * 10) / 10

function buildRecap(
  project: Project | null,
  links: OffcutLink[],
  catalog: PlankType[],
  poseParams: PoseParams | null,
): RoomEntry[] {
  if (!project || !poseParams) return []

  const rowOwner = new Map<string, { roomId: string; roomName: string; rowIndex: number }>()
  for (const room of project.rooms) {
    room.rows.forEach((row, i) => {
      rowOwner.set(row.id, { roomId: room.id, roomName: room.name, rowIndex: i })
    })
  }

  const resolveLink = (link: OffcutLink, currentRoomId: string, side: 'source' | 'target'): ResolvedLink | null => {
    const otherId = side === 'source' ? link.targetRowId : link.sourceRowId
    const owner = rowOwner.get(otherId)
    if (!owner) return null
    return {
      linkId: offcutLinkId(link),
      otherRoomName: owner.roomName,
      otherRowIndex: owner.rowIndex + 1,
      sameRoom: owner.roomId === currentRoomId,
    }
  }

  return project.rooms.map(room => {
    const rows: RowEntry[] = room.rows.map((row, i) => {
      const geom = computeRowGeometry(room, i, catalog, poseParams)
      const seg0 = geom?.segments[0]
      const firstPlank = seg0?.planks[0] ?? null
      const lastPlank = seg0 && seg0.planks.length > 0 ? seg0.planks[seg0.planks.length - 1] : null
      const incomingRaw = links.find(l => l.targetRowId === row.id) ?? null
      const outgoingRaw = links.find(l => l.sourceRowId === row.id) ?? null
      return {
        rowId: row.id,
        rowIndex: i + 1,
        firstLength: firstPlank ? round1(firstPlank.length) : null,
        lastLength: lastPlank ? round1(lastPlank.length) : null,
        incoming: incomingRaw ? resolveLink(incomingRaw, room.id, 'target') : null,
        outgoing: outgoingRaw ? resolveLink(outgoingRaw, room.id, 'source') : null,
      }
    })
    return { roomId: room.id, roomName: room.name, rows }
  })
}

export function useRowRecapData(): RoomEntry[] {
  const project = useAppSelector(selectCurrentProject)
  const links = useAppSelector(selectOffcutLinks)
  const catalog = useAppSelector(selectCatalog)
  const poseParams = useAppSelector(selectPoseParams)
  return useMemo(
    () => buildRecap(project, links, catalog, poseParams),
    [project, links, catalog, poseParams],
  )
}
