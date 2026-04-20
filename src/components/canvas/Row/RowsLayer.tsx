import { useAppSelector } from '@/hooks/redux'
import { selectRooms, selectActiveRoomId, selectPoseParams } from '@/store/selectors'
import { Row } from './index'
import styles from './RowsLayer.module.css'

export function RowsLayer() {
  const rooms = useAppSelector(selectRooms)
  const activeRoomId = useAppSelector(selectActiveRoomId)
  const poseParams = useAppSelector(selectPoseParams)

  const cale = poseParams?.cale ?? 0

  return (
    <g className={styles.layer}>
      <defs>
        {rooms.map(room => (
          <clipPath key={room.id} id={`row-clip-${room.id}`}>
            <polygon points={room.vertices.map(v => `${v.x},${v.y}`).join(' ')} />
          </clipPath>
        ))}
      </defs>
      {rooms.map(room => {
        const isActive = room.id === activeRoomId
        const groupClass = isActive ? '' : styles.dim
        const xs = room.vertices.map(v => v.x)
        const ys = room.vertices.map(v => v.y)
        const minX = Math.min(...xs)
        const maxX = Math.max(...xs)
        const minY = Math.min(...ys)
        const maxY = Math.max(...ys)
        return (
          <g key={room.id} className={groupClass}>
            {cale > 0 && (
              <g clipPath={`url(#row-clip-${room.id})`}>
                <rect
                  x={minX} y={minY} width={maxX - minX} height={cale}
                  className={styles.caleY} vectorEffect="non-scaling-stroke"
                />
                <rect
                  x={minX} y={maxY - cale} width={maxX - minX} height={cale}
                  className={styles.caleY} vectorEffect="non-scaling-stroke"
                />
              </g>
            )}
            {room.rows.map(row => (
              <Row key={row.id} roomId={room.id} rowId={row.id} />
            ))}
          </g>
        )
      })}
    </g>
  )
}
