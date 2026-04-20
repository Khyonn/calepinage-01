import type { ConstraintViolationType } from '@/core/types'
import styles from './ViolationBadge.module.css'

interface Props {
  x: number
  y: number
  zoom: number
  messages: string[]
}

const SIZE_PX = 14

export function ViolationBadge({ x, y, zoom, messages }: Props) {
  const size = SIZE_PX / zoom
  const half = size / 2
  const title = messages.join(' — ')
  return (
    <g transform={`translate(${x - size}, ${y})`} className={styles.badge}>
      <title>{title}</title>
      <polygon
        points={`${half},0 ${size},${size} 0,${size}`}
        className={styles.shape}
        strokeWidth={1.5 / zoom}
      />
      <text
        x={half}
        y={size * 0.85}
        textAnchor="middle"
        fontSize={size * 0.7}
        className={styles.bang}
      >
        !
      </text>
    </g>
  )
}

export function messageForViolation(type: ConstraintViolationType, info: { length?: number; min?: number; gap?: number } = {}): string {
  const { length, min, gap } = info
  switch (type) {
    case 'first-plank-too-short':
      return `Première lame trop courte : ${length}cm < ${min}cm`
    case 'last-plank-too-short':
      return `Dernière lame trop courte : ${length}cm < ${min}cm`
    case 'row-gap-too-small':
      return `Écart fin de rangée trop faible : ${gap}cm < ${min}cm`
  }
}
