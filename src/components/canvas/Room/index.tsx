import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { selectActiveRoomId, selectInteractionMode } from '@/store/selectors'
import { uiActions } from '@/store/uiSlice'
import type { Room as RoomType } from '@/core/types'
import { useVertexEdit } from './VertexEditContext'
import styles from './Room.module.css'

interface Props {
  room: RoomType
}

export function Room({ room }: Props) {
  const mode = useAppSelector(selectInteractionMode)
  const activeRoomId = useAppSelector(selectActiveRoomId)
  const dispatch = useAppDispatch()
  const { draft } = useVertexEdit()

  const isActive = activeRoomId === room.id
  const isDimmed = mode === 'plan' || (mode === 'edit' && !isActive)
  const isClickable = mode === 'nav'

  const className = [
    styles.room,
    isActive && styles.active,
    isDimmed && styles.dimmed,
    isClickable && styles.clickable,
  ].filter(Boolean).join(' ')

  const effectiveVertices = draft?.roomId === room.id ? draft.vertices : room.vertices
  const points = effectiveVertices.map(v => `${v.x},${v.y}`).join(' ')

  const handleClick = () => {
    if (!isClickable) return
    dispatch(uiActions.setActiveRoom(room.id))
    dispatch(uiActions.setMode('edit'))
  }

  return (
    <polygon
      points={points}
      className={className}
      onClick={handleClick}
      vectorEffect="non-scaling-stroke"
    />
  )
}
