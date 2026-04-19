import { useEffect, useState } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAppDispatch } from '@/hooks/redux'
import { createProjectThunk } from '@/store/thunks'
import { localStorageLastProjectId } from '@/persistence/lastProjectId'

interface Props {
  open: boolean
  onClose: () => void
}

export function NewProjectDialog({ open, onClose }: Props) {
  const [name, setName] = useState('')
  const dispatch = useAppDispatch()

  useEffect(() => { if (open) setName('') }, [open])

  const submit = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    dispatch(createProjectThunk(trimmed, localStorageLastProjectId))
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Nouveau projet"
      actions={
        <>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button variant="primary" onClick={submit} disabled={!name.trim()}>Créer</Button>
        </>
      }
    >
      <Input
        label="Nom du projet"
        value={name}
        onChange={e => setName(e.currentTarget.value)}
        onKeyDown={e => { if (e.key === 'Enter') submit() }}
        autoFocus
      />
    </Dialog>
  )
}
