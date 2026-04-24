import { useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import {
  selectCurrentProject, selectOffcutLinks, offcutLinkId,
} from '@/store/selectors'
import { uiActions } from '@/store/uiSlice'
import styles from './OffcutTable.module.css'

interface Resolved {
  id: string
  sourceRoomName: string
  sourceRowIndex: number
  targetRoomName: string
  targetRowIndex: number
  length: number
}

export function OffcutTable() {
  const dispatch = useAppDispatch()
  const links = useAppSelector(selectOffcutLinks)
  const project = useAppSelector(selectCurrentProject)

  const resolved = useMemo<Resolved[]>(() => {
    if (!project) return []
    return links.flatMap(link => {
      const sourceRoom = project.rooms.find(r => r.rows.some(row => row.id === link.sourceRowId))
      const targetRoom = project.rooms.find(r => r.rows.some(row => row.id === link.targetRowId))
      if (!sourceRoom || !targetRoom) return []
      const sourceRowIndex = sourceRoom.rows.findIndex(r => r.id === link.sourceRowId)
      const targetRowIndex = targetRoom.rows.findIndex(r => r.id === link.targetRowId)
      return [{
        id: offcutLinkId(link),
        sourceRoomName: sourceRoom.name,
        sourceRowIndex: sourceRowIndex + 1,
        targetRoomName: targetRoom.name,
        targetRowIndex: targetRowIndex + 1,
        length: link.length,
      }]
    })
  }, [links, project])

  if (resolved.length === 0) {
    return <p className={styles.empty}>Pas encore de chutes réutilisées.</p>
  }

  const onEnter = (id: string) => () => dispatch(uiActions.setHoveredOffcutLinkId(id))
  const onLeave = () => dispatch(uiActions.setHoveredOffcutLinkId(null))

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th scope="col">Source</th>
          <th scope="col">Cible</th>
          <th scope="col" className={styles.num}>Longueur (cm)</th>
        </tr>
      </thead>
      <tbody>
        {resolved.map(r => (
          <tr
            key={r.id}
            onPointerEnter={onEnter(r.id)}
            onPointerLeave={onLeave}
          >
            <td>
              <div>{r.sourceRoomName}</div>
              <div className={styles.sub}>Rangée {r.sourceRowIndex}</div>
            </td>
            <td>
              <div>{r.targetRoomName}</div>
              <div className={styles.sub}>Rangée {r.targetRowIndex}</div>
            </td>
            <td className={styles.num}>{r.length.toFixed(1)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
