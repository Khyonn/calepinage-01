import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { selectActiveRoom, selectActiveRoomHasRows } from '@/store/selectors'
import { projectActions } from '@/store/projectSlice'
import { uiActions } from '@/store/uiSlice'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import styles from './RoomEditPanel.module.css'

export function RoomEditPanel() {
  const room = useAppSelector(selectActiveRoom)
  const hasRows = useAppSelector(selectActiveRoomHasRows)
  const dispatch = useAppDispatch()
  const [confirmOpen, setConfirmOpen] = useState(false)

  if (!room) return null

  const handleConfirm = () => {
    dispatch(projectActions.deleteRoom({ id: room.id }))
    dispatch(uiActions.setActiveRoom(null))
    dispatch(uiActions.setMode('nav'))
    setConfirmOpen(false)
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.section}>
        <p className={styles.label}>Pièce active</p>
        <p className={styles.name}>{room.name}</p>
        <p className={styles.meta}>{room.vertices.length} sommets — {room.rows.length} rangée{room.rows.length > 1 ? 's' : ''}</p>
      </div>
      {!hasRows && (
        <p className={styles.hint}>
          Glissez les croix sur le canvas pour ajuster les sommets. Maintenez <kbd>Ctrl</kbd> pour aligner, <kbd>Shift</kbd> pour pousser le mur.
        </p>
      )}
      <Button variant="danger" onClick={() => setConfirmOpen(true)} className={styles.deleteBtn}>
        Supprimer la pièce
      </Button>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Supprimer la pièce"
        actions={
          <>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>Annuler</Button>
            <Button variant="danger" onClick={handleConfirm}>Supprimer</Button>
          </>
        }
      >
        <p>Supprimer <strong>{room.name}</strong> ? Cette action est irréversible.</p>
      </Dialog>
    </div>
  )
}
