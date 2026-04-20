import { useAppSelector } from '@/hooks/redux'
import { selectPoseParams, selectOffcutLinks, selectViolations } from '@/store/selectors'
import { useViewportContext } from '@/components/canvas/Scene/ViewportContext'
import { Segment } from './Segment'
import { useRowGeometry } from './useRowGeometry'

interface Props {
  roomId: string
  rowId: string
}

export function Row({ roomId, rowId }: Props) {
  const geometry = useRowGeometry(roomId, rowId)
  const poseParams = useAppSelector(selectPoseParams)
  const links = useAppSelector(selectOffcutLinks)
  const allViolations = useAppSelector(selectViolations)
  const { viewport } = useViewportContext()

  if (!geometry || !poseParams) return null

  const startLinked = links.some(l => l.targetRowId === rowId)
  const endLinked = links.some(l => l.sourceRowId === rowId)
  const rowViolations = allViolations.filter(v => v.rowId === rowId)

  const height = geometry.yEnd - geometry.yStart
  return (
    <g>
      {geometry.segments.map((seg, i) => (
        <Segment
          key={i}
          roomId={roomId}
          xStart={seg.xStart}
          xEnd={seg.xEnd}
          yStart={geometry.yStart}
          height={height}
          planks={seg.planks}
          plankType={geometry.plankType}
          poseParams={poseParams}
          zoom={viewport.zoom}
          startLinked={startLinked}
          endLinked={endLinked}
          rowViolations={rowViolations}
        />
      ))}
    </g>
  )
}
