import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { useAppDispatch } from '@/hooks/redux'
import { projectActions } from '@/store/projectSlice'
import type { PlankType } from '@/core/types'

interface Props {
  type: PlankType
  onClose: () => void
}

export function DeletePlankTypeConfirm({ type, onClose }: Props) {
  const dispatch = useAppDispatch()

  const confirm = () => {
    dispatch(projectActions.deletePlankType({ id: type.id }))
    onClose()
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title="Supprimer le type de lame"
      actions={
        <>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button variant="danger" onClick={confirm}>Supprimer</Button>
        </>
      }
    >
      <p>Supprimer <strong>{type.name}</strong> ({type.length} × {type.width} cm) ? Cette action est irréversible.</p>
    </Dialog>
  )
}
