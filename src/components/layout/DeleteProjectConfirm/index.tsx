import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { selectCurrentProject } from '@/store/selectors'
import { deleteProjectThunk } from '@/store/thunks'
import { localStorageLastProjectId } from '@/persistence/lastProjectId'

interface Props {
  open: boolean
  onClose: () => void
}

export function DeleteProjectConfirm({ open, onClose }: Props) {
  const current = useAppSelector(selectCurrentProject)
  const dispatch = useAppDispatch()

  const confirm = () => {
    if (!current) return
    dispatch(deleteProjectThunk(current.id, localStorageLastProjectId))
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Supprimer le projet"
      actions={
        <>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button variant="danger" onClick={confirm}>Supprimer</Button>
        </>
      }
    >
      <p>Supprimer <strong>{current?.name ?? ''}</strong> ? Cette action est irréversible.</p>
    </Dialog>
  )
}
