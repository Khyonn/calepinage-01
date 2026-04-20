import styles from './Annotation.module.css'

interface Props {
  x: number
  y: number
  length: number
  linked: boolean
  zoom: number
  anchor: 'start' | 'end'
}

const PX_SIZE = 11

export function Annotation({ x, y, length, linked, zoom, anchor }: Props) {
  const textAnchor = anchor === 'start' ? 'start' : 'end'
  const fontSize = PX_SIZE / zoom
  const className = [styles.text, linked ? styles.linked : styles.unlinked].join(' ')
  return (
    <text
      x={x}
      y={y}
      fontSize={fontSize}
      strokeWidth={3 / zoom}
      textAnchor={textAnchor}
      dominantBaseline="middle"
      className={className}
      paintOrder="stroke"
    >
      {Math.round(length * 10) / 10} cm
    </text>
  )
}
