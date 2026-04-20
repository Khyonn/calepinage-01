import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { selectCatalog } from '@/store/selectors'
import { uiActions } from '@/store/uiSlice'
import { addRowThunk } from '@/store/thunks'
import { Button } from '@/components/ui/Button'
import { Combobox } from '@/components/ui/Combobox'
import styles from './RoomEditPanel.module.css'

export function AddRowForm() {
  const catalog = useAppSelector(selectCatalog)
  const selectedPlankTypeId = useAppSelector(s => s.ui.selectedPlankTypeId)
  const dispatch = useAppDispatch()

  const options = catalog.map(pt => ({
    value: pt.id,
    label: `${pt.name} — ${pt.length}×${pt.width} cm`,
  }))

  const handleAdd = () => {
    if (!selectedPlankTypeId) return
    dispatch(addRowThunk())
  }

  if (catalog.length === 0) {
    return <p className={styles.emptyHint}>Ajoute d'abord un type de lame au catalogue.</p>
  }

  return (
    <div className={styles.addRow}>
      <Combobox
        label="Type de lame"
        options={options}
        value={selectedPlankTypeId ?? ''}
        onChange={id => dispatch(uiActions.setSelectedPlankTypeId(id || null))}
      />
      <Button
        variant="primary"
        onClick={handleAdd}
        disabled={!selectedPlankTypeId}
        className={styles.addBtn}
      >
        Ajouter une rangée
      </Button>
    </div>
  )
}
