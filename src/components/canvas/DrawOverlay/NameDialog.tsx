import { useState, useEffect } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface Props {
  open: boolean
  onCancel: () => void
  onSave: (name: string) => void
}

export function NameDialog({ open, onCancel, onSave }: Props) {
  const [name, setName] = useState('')

  useEffect(() => {
    if (open) setName('')
  }, [open])

  const handleSave = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    onSave(trimmed)
  }

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      title="Nommer la pièce"
      actions={
        <>
          <Button variant="ghost" onClick={onCancel}>Annuler</Button>
          <Button variant="primary" onClick={handleSave} disabled={!name.trim()}>Enregistrer</Button>
        </>
      }
    >
      <Input
        label="Nom"
        value={name}
        onChange={e => setName(e.target.value)}
        autoFocus
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSave() } }}
      />
    </Dialog>
  )
}
