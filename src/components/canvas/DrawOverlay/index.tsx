import { useRef } from 'react'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { selectInteractionMode } from '@/store/selectors'
import { projectActions } from '@/store/projectSlice'
import { uiActions } from '@/store/uiSlice'
import { useViewportContext } from '@/components/canvas/Scene/ViewportContext'
import type { Point } from '@/core/types'
import { useDrawInteraction } from './useDrawInteraction'
import { NameDialog } from './NameDialog'
import styles from './DrawOverlay.module.css'

export function DrawOverlay() {
  const mode = useAppSelector(selectInteractionMode)
  const dispatch = useAppDispatch()
  const { svgRef, viewport, screenToWorld, worldToScreen } = useViewportContext()
  const enabled = mode === 'draw'
  const pendingName = useRef('')

  const handleCommit = (vertices: Point[]) => {
    const id = crypto.randomUUID()
    dispatch(projectActions.addRoom({ id, name: pendingName.current, vertices }))
    dispatch(uiActions.setActiveRoom(id))
    dispatch(uiActions.setMode('edit'))
  }

  const { vertices, cursor, snap, dialogOpen, commit, cancelDialog } =
    useDrawInteraction({
      svgRef,
      screenToWorld,
      zoom: viewport.zoom,
      enabled,
      onCommit: handleCommit,
    })

  if (!enabled) return null

  const screenVertices = vertices.map(worldToScreen)
  const screenCursor = cursor ? worldToScreen(cursor) : null
  const last = screenVertices[screenVertices.length - 1]
  const first = screenVertices[0]

  return (
    <>
      <g pointerEvents="none">
        {snap?.snappedX !== undefined && cursor && (() => {
          const s = worldToScreen({ x: snap.snappedX, y: cursor.y })
          return <line x1={s.x} y1={-9999} x2={s.x} y2={9999} className={styles.guide} />
        })()}
        {snap?.snappedY !== undefined && cursor && (() => {
          const s = worldToScreen({ x: cursor.x, y: snap.snappedY })
          return <line x1={-9999} y1={s.y} x2={9999} y2={s.y} className={styles.guide} />
        })()}
        {last && screenCursor && (
          <line x1={last.x} y1={last.y} x2={screenCursor.x} y2={screenCursor.y} className={styles.preview} />
        )}
        {screenVertices.length >= 2 && (
          <polyline
            points={screenVertices.map(p => `${p.x},${p.y}`).join(' ')}
            className={styles.path}
          />
        )}
        {screenVertices.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={i === 0 ? 6 : 4}
            className={i === 0 && vertices.length >= 3 ? styles.firstClosable : styles.vertex}
          />
        ))}
        {first && screenVertices.length >= 3 && (
          <circle cx={first.x} cy={first.y} r={10} className={styles.closeHitZone} />
        )}
      </g>
      <NameDialog
        open={dialogOpen}
        onCancel={cancelDialog}
        onSave={(name) => { pendingName.current = name; commit() }}
      />
    </>
  )
}
