import { useState } from 'react'
import { EditInput } from './EditInput'
import styles from './Annotation.module.css'

interface Props {
  x: number
  y: number
  length: number
  linked: boolean
  zoom: number
  anchor: 'start' | 'end'
  editable?: boolean
  onCommit?: (newLength: number) => void
}

const PX_SIZE = 11

export function Annotation({ x, y, length, linked, zoom, anchor, editable, onCommit }: Props) {
  const [editing, setEditing] = useState(false)
  const textAnchor = anchor === 'start' ? 'start' : 'end'
  const fontSize = PX_SIZE / zoom
  const className = [
    styles.text,
    linked ? styles.linked : styles.unlinked,
    editable && styles.editable,
  ].filter(Boolean).join(' ')

  if (editing && editable && onCommit) {
    return (
      <EditInput
        x={x}
        y={y}
        initialLength={length}
        zoom={zoom}
        anchor={anchor}
        onCommit={(newLength) => {
          setEditing(false)
          onCommit(newLength)
        }}
        onCancel={() => setEditing(false)}
      />
    )
  }

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
      onPointerDown={(e) => { if (editable) e.stopPropagation() }}
      onDoubleClick={(e) => {
        if (!editable || !onCommit) return
        e.stopPropagation()
        setEditing(true)
      }}
    >
      {Math.round(length * 10) / 10} cm
    </text>
  )
}
