import { useAppSelector } from '@/hooks/redux'
import { selectActiveRoom, selectInteractionMode } from '@/store/selectors'
import { useViewportContext } from '@/components/canvas/Scene/ViewportContext'
import { useVertexEdit } from '../VertexEditContext'
import { useVertexDrag } from './useVertexDrag'
import styles from './VertexHandles.module.css'

export function VertexHandles() {
  const mode = useAppSelector(selectInteractionMode)
  const room = useAppSelector(selectActiveRoom)
  const { worldToScreen } = useViewportContext()
  const { draft } = useVertexEdit()

  const active = mode === 'edit' && !!room && room.rows.length === 0
  const vertices = active && draft?.roomId === room!.id ? draft.vertices : (room?.vertices ?? [])

  const { startDrag, draggingIndex } = useVertexDrag({
    roomId: room?.id ?? '',
    vertices: active ? (room?.vertices ?? []) : [],
    active,
  })

  if (!active || !room) return null

  return (
    <g>
      {vertices.map((v, i) => {
        const s = worldToScreen(v)
        const isDragging = draggingIndex === i
        return (
          <g
            key={i}
            transform={`translate(${s.x} ${s.y})`}
            className={[styles.handle, isDragging && styles.dragging].filter(Boolean).join(' ')}
            onPointerDown={e => startDrag(e, i)}
          >
            <circle r={10} className={styles.hitZone} />
            <line x1={-6} y1={-6} x2={6} y2={6} className={styles.cross} />
            <line x1={-6} y1={6} x2={6} y2={-6} className={styles.cross} />
          </g>
        )
      })}
    </g>
  )
}
