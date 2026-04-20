import { useAppSelector } from '@/hooks/redux'
import { selectRooms } from '@/store/selectors'
import { Room } from './index'

export function RoomsLayer() {
  const rooms = useAppSelector(selectRooms)
  return (
    <g>
      {rooms.map(room => <Room key={room.id} room={room} />)}
    </g>
  )
}
