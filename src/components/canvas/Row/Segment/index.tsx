import type { ConstraintViolation, Plank, PlankType, PoseParams } from '@/core/types'
import { Annotation } from './Annotation'
import { ViolationBadge, messageForViolation } from './ViolationBadge'
import styles from './Segment.module.css'

interface Props {
  roomId: string
  xStart: number
  xEnd: number
  yStart: number
  height: number
  planks: Plank[]
  plankType: PlankType
  poseParams: PoseParams
  zoom: number
  startLinked: boolean
  endLinked: boolean
  rowViolations: ConstraintViolation[]
}

const EPSILON = 0.001

export function Segment({
  roomId, xStart, xEnd, yStart, height, planks, plankType, poseParams, zoom,
  startLinked, endLinked, rowViolations,
}: Props) {
  const cale = poseParams.cale
  const minLen = poseParams.minPlankLength
  const innerX = xStart + cale
  const midY = yStart + height / 2
  const firstPlank = planks[0]
  const lastPlank = planks[planks.length - 1]
  const firstIndex = 0
  const lastIndex = planks.length - 1

  const firstViolates = !!firstPlank && firstPlank.length < minLen
  const lastViolates = !!lastPlank && planks.length > 0 && lastPlank.length < minLen

  const rowGapViolation = rowViolations.find(v => v.type === 'row-gap-too-small')
  const round1 = (n: number) => Math.round(n * 10) / 10

  const messages: string[] = []
  if (firstViolates) messages.push(messageForViolation('first-plank-too-short', {
    length: round1(firstPlank!.length), min: minLen,
  }))
  if (lastViolates && planks.length > 1) messages.push(messageForViolation('last-plank-too-short', {
    length: round1(lastPlank!.length), min: minLen,
  }))
  if (rowGapViolation) messages.push(messageForViolation('row-gap-too-small', {
    gap: round1(rowGapViolation.value), min: poseParams.minRowGap,
  }))

  const showStart = firstPlank && firstPlank.length < plankType.length - EPSILON
  const showEnd = lastPlank && planks.length > 1 && lastPlank.length < plankType.length - EPSILON

  return (
    <g>
      <g clipPath={`url(#row-clip-${roomId})`}>
        <rect
          x={xStart} y={yStart} width={cale} height={height}
          className={styles.cale} vectorEffect="non-scaling-stroke"
        />
        {planks.map((plank, i) => {
          const violates =
            (i === firstIndex && firstViolates) ||
            (i === lastIndex && lastViolates && planks.length > 1)
          const cls = [styles.plank, violates && styles.violating].filter(Boolean).join(' ')
          return (
            <rect
              key={i}
              x={innerX + plank.x}
              y={yStart}
              width={plank.length}
              height={height}
              className={cls}
              vectorEffect="non-scaling-stroke"
            />
          )
        })}
        <rect
          x={xEnd - cale} y={yStart} width={cale} height={height}
          className={styles.cale} vectorEffect="non-scaling-stroke"
        />
      </g>

      {showStart && (
        <Annotation
          x={innerX + firstPlank.length / 2}
          y={midY}
          length={firstPlank.length}
          linked={startLinked}
          zoom={zoom}
          anchor="start"
        />
      )}
      {showEnd && (
        <Annotation
          x={innerX + lastPlank.x + lastPlank.length / 2}
          y={midY}
          length={lastPlank.length}
          linked={endLinked}
          zoom={zoom}
          anchor="end"
        />
      )}

      {messages.length > 0 && (
        <ViolationBadge
          x={xEnd - cale}
          y={yStart}
          zoom={zoom}
          messages={messages}
        />
      )}
    </g>
  )
}
