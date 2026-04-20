import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { selectActiveRoom, selectCatalog } from '@/store/selectors'
import { projectActions } from '@/store/projectSlice'
import { Button } from '@/components/ui/Button'
import styles from './RoomEditPanel.module.css'

export function RowList() {
  const room = useAppSelector(selectActiveRoom)
  const catalog = useAppSelector(selectCatalog)
  const dispatch = useAppDispatch()

  if (!room || room.rows.length === 0) return null

  return (
    <ul className={styles.rowList}>
      {room.rows.map((row, idx) => {
        const plankType = catalog.find(pt => pt.id === row.plankTypeId)
        const label = plankType ? plankType.name : 'Type inconnu'
        const isLast = idx === room.rows.length - 1
        return (
          <li key={row.id} className={styles.rowItem}>
            <span className={styles.rowIndex}>{idx + 1}.</span>
            <span className={styles.rowLabel}>{label}</span>
            {isLast && (
              <Button
                variant="danger"
                size="sm"
                iconOnly
                onClick={() => dispatch(projectActions.deleteRow({ id: row.id, roomId: room.id }))}
                aria-label={`Supprimer la rangée ${idx + 1}`}
              >
                ×
              </Button>
            )}
          </li>
        )
      })}
    </ul>
  )
}
