import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { selectCurrentProject, selectProjectList } from '@/store/selectors'
import { openProjectThunk } from '@/store/thunks'
import { localStorageLastProjectId } from '@/persistence/lastProjectId'
import styles from './OpenProjectDialog.module.css'

interface Props {
  open: boolean
  onClose: () => void
}

export function OpenProjectDialog({ open, onClose }: Props) {
  const list = useAppSelector(selectProjectList)
  const current = useAppSelector(selectCurrentProject)
  const dispatch = useAppDispatch()

  const choose = (id: string) => {
    void dispatch(openProjectThunk(id, localStorageLastProjectId))
    onClose()
  }

  const others = list.filter(p => p.id !== current?.id)

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Ouvrir un projet"
      actions={<Button variant="ghost" onClick={onClose}>Fermer</Button>}
    >
      {others.length === 0 ? (
        <p className={styles.empty}>Aucun autre projet disponible.</p>
      ) : (
        <ul className={styles.list}>
          {others.map(entry => (
            <li key={entry.id}>
              <button type="button" className={styles.item} onClick={() => choose(entry.id)}>
                {entry.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Dialog>
  )
}
