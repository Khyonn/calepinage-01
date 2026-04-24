import { useMemo } from 'react'
import { useAppSelector } from '@/hooks/redux'
import {
  selectPoseParams, selectOffcutLinks, selectViolations,
  selectInteractionMode, selectActiveRoomId, selectCurrentProject,
  selectHighlightedRowIds,
} from '@/store/selectors'
import { useViewportContext } from '@/components/canvas/Scene/ViewportContext'
import { fillRow } from '@/core/rowFill'
import { validateRow } from '@/core/validateRow'
import { computeRowGeometry } from '@/core/rowGeometry'
import type { ConstraintViolation, PoseParams, Project } from '@/core/types'
import type { RowSegmentGeometry } from '@/core/rowGeometry'
import { Segment } from './Segment'
import { useRowGeometry } from './useRowGeometry'
import { useSegmentDrag } from './useSegmentDrag'

interface Props {
  roomId: string
  rowId: string
}

export function Row({ roomId, rowId }: Props) {
  const geometry = useRowGeometry(roomId, rowId)
  const poseParams = useAppSelector(selectPoseParams)
  const links = useAppSelector(selectOffcutLinks)
  const allViolations = useAppSelector(selectViolations)
  const mode = useAppSelector(selectInteractionMode)
  const activeRoomId = useAppSelector(selectActiveRoomId)
  const project = useAppSelector(selectCurrentProject)
  const highlightedRowIds = useAppSelector(selectHighlightedRowIds)
  const { viewport } = useViewportContext()

  const dragActive = activeRoomId === roomId && mode === 'edit'

  const initialXOffsets = useMemo(() => {
    const room = project?.rooms.find(r => r.id === roomId)
    const row = room?.rows.find(r => r.id === rowId)
    return row?.segments.map(s => s.xOffset) ?? []
  }, [project, roomId, rowId])

  const plankLength = geometry?.plankType.length ?? 0

  const { previewOffsets, draggingIndex, onSegmentPointerDown } = useSegmentDrag({
    roomId, rowId, active: dragActive, initialXOffsets, plankLength,
  })

  if (!geometry || !poseParams) return null

  const effectiveSegments: RowSegmentGeometry[] = previewOffsets === null
    ? geometry.segments
    : geometry.segments.map((seg, i) => (
        previewOffsets[i] === initialXOffsets[i]
          ? seg
          : { ...seg, planks: fillRow(previewOffsets[i], seg.xEnd - seg.xStart, geometry.plankType, poseParams) }
      ))

  const isDragging = draggingIndex !== null
  const rowViolations = isDragging
    ? computeLiveRowViolations(project, roomId, rowId, effectiveSegments, poseParams)
    : allViolations.filter(v => v.rowId === rowId)

  const startLinked = links.some(l => l.targetRowId === rowId)
  const endLinked = links.some(l => l.sourceRowId === rowId)
  const height = geometry.yEnd - geometry.yStart

  return (
    <g>
      {effectiveSegments.map((seg, i) => (
        <Segment
          key={i}
          roomId={roomId}
          xStart={seg.xStart}
          xEnd={seg.xEnd}
          yStart={geometry.yStart}
          height={height}
          planks={seg.planks}
          snapshotPlanks={isDragging ? geometry.segments[i]?.planks : undefined}
          plankType={geometry.plankType}
          poseParams={poseParams}
          zoom={viewport.zoom}
          startLinked={startLinked}
          endLinked={endLinked}
          rowViolations={rowViolations}
          dragActive={dragActive}
          dragging={draggingIndex === i}
          highlighted={highlightedRowIds.has(rowId)}
          onPointerDown={dragActive ? onSegmentPointerDown(i) : undefined}
        />
      ))}
    </g>
  )
}

function computeLiveRowViolations(
  project: Project | null,
  roomId: string,
  rowId: string,
  effectiveSegments: RowSegmentGeometry[],
  poseParams: PoseParams,
): ConstraintViolation[] {
  if (!project) return []
  const room = project.rooms.find(r => r.id === roomId)
  if (!room) return []
  const rowIndex = room.rows.findIndex(r => r.id === rowId)
  if (rowIndex === -1) return []
  const prevGeom = rowIndex > 0
    ? computeRowGeometry(room, rowIndex - 1, project.catalog, poseParams)
    : null
  const out: ConstraintViolation[] = []
  effectiveSegments.forEach((seg, segIdx) => {
    const available = (seg.xEnd - seg.xStart) - 2 * poseParams.cale
    if (available <= 0) return
    const prevPlanks = prevGeom?.segments[segIdx]?.planks
    out.push(...validateRow(rowId, seg.planks, prevPlanks, available, poseParams))
  })
  return out
}
