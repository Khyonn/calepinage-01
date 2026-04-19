import { useRef } from 'react'
import type { Point } from '@/core/types'
import { useOverlayPointDrag } from './useOverlayPointDrag'
import type { PlanTransform } from './geometry'
import styles from './CalibrationOverlay.module.css'

interface Props {
  screenPoint: Point
  label: string
  transform: PlanTransform
  onChange: (imagePoint: Point) => void
}

export function OverlayPoint({ screenPoint, label, transform, onChange }: Props) {
  const groupRef = useRef<SVGGElement | null>(null)
  useOverlayPointDrag({ groupRef, transform, onChange })

  return (
    <g ref={groupRef} transform={`translate(${screenPoint.x} ${screenPoint.y})`} className={styles.point}>
      <line x1={-10} y1={0} x2={10} y2={0} className={styles.cross} />
      <line x1={0} y1={-10} x2={0} y2={10} className={styles.cross} />
      <circle r={6} className={styles.circle} />
      <text x={10} y={-10} className={styles.label}>{label}</text>
    </g>
  )
}
