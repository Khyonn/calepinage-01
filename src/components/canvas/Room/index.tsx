import type { Room as RoomType } from '@/core/types'
import styles from './Room.module.css'

interface RoomProps {
  room: RoomType
}

export function Room({ room }: RoomProps) {
  const points = room.vertices.map(v => `${v.x},${v.y}`).join(' ')
  return (
    <polygon
      points={points}
      className={styles.room}
      vectorEffect="non-scaling-stroke"
    />
  )
}
