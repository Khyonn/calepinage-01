import { useEffect, useState } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Combobox } from '@/components/ui/Combobox'
import { Checkbox } from '@/components/ui/Checkbox'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { selectCurrentProject, selectProjectList } from '@/store/selectors'
import { cloneProjectThunk } from '@/store/thunks'
import { localStorageLastProjectId } from '@/persistence/lastProjectId'
import { useCloneOptions, INITIAL } from './useCloneOptions'
import styles from './CloneProjectDialog.module.css'

interface Props {
  open: boolean
  onClose: () => void
}

export function CloneProjectDialog({ open, onClose }: Props) {
  const dispatch = useAppDispatch()
  const list = useAppSelector(selectProjectList)
  const current = useAppSelector(selectCurrentProject)

  const [sourceId, setSourceId] = useState('')
  const [name, setName] = useState('')
  const { options, setKey, reset, locks } = useCloneOptions()

  useEffect(() => {
    if (!open) return
    const initialSource = current?.id ?? list[0]?.id ?? ''
    setSourceId(initialSource)
    const sourceName = list.find(p => p.id === initialSource)?.name ?? ''
    setName(sourceName ? `${sourceName} (copie)` : '')
    reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const sourceOptions = list.map(p => ({ value: p.id, label: p.name }))
  const trimmed = name.trim()
  const canSubmit = !!sourceId && !!trimmed

  const submit = () => {
    if (!canSubmit) return
    void dispatch(cloneProjectThunk(sourceId, options, trimmed, localStorageLastProjectId))
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Cloner un projet"
      actions={
        <>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button variant="primary" onClick={submit} disabled={!canSubmit}>Cloner</Button>
        </>
      }
    >
      <div className={styles.body}>
        <Combobox
          label="Projet source"
          options={sourceOptions}
          value={sourceId}
          onChange={id => {
            setSourceId(id)
            const sourceName = list.find(p => p.id === id)?.name ?? ''
            setName(sourceName ? `${sourceName} (copie)` : '')
          }}
        />
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Éléments à reprendre</legend>
          <Checkbox
            label="Catalogue"
            checked={options.catalog}
            disabled={locks.catalog}
            onChange={e => setKey('catalog', e.currentTarget.checked)}
          />
          <Checkbox
            label="Paramètres de pose"
            checked={options.poseParams}
            onChange={e => setKey('poseParams', e.currentTarget.checked)}
          />
          <Checkbox
            label="Plan de fond"
            checked={options.backgroundPlan}
            onChange={e => setKey('backgroundPlan', e.currentTarget.checked)}
          />
          <Checkbox
            label="Pièces (sommets)"
            checked={options.rooms}
            disabled={locks.rooms}
            onChange={e => setKey('rooms', e.currentTarget.checked)}
          />
          <Checkbox
            label="Rangées"
            checked={options.rows}
            onChange={e => setKey('rows', e.currentTarget.checked)}
          />
        </fieldset>
        <Input
          label="Nom du nouveau projet"
          value={name}
          onChange={e => setName(e.currentTarget.value)}
          onKeyDown={e => { if (e.key === 'Enter') submit() }}
        />
      </div>
    </Dialog>
  )
}

export { INITIAL as INITIAL_CLONE_OPTIONS }
