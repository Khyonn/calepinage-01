import { Plus, Rows3 } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { selectCanAppendRowToActiveRoom, selectCatalog } from '@/store/selectors'
import { uiActions } from '@/store/uiSlice'
import { addRowThunk, bulkFillRoomThunk } from '@/store/thunks'
import { Button } from '@/components/ui/Button'
import { Combobox } from '@/components/ui/Combobox'
import styles from './RoomEditPanel.module.css'

export function AddRowForm() {
  const catalog = useAppSelector(selectCatalog)
  const selectedPlankTypeId = useAppSelector(s => s.ui.selectedPlankTypeId)
  const canAppend = useAppSelector(selectCanAppendRowToActiveRoom)
  const dispatch = useAppDispatch()

  const options = catalog.map(pt => ({
    value: pt.id,
    label: `${pt.name} — ${pt.length}×${pt.width} cm`,
  }))

  const handleAdd = () => {
    if (!selectedPlankTypeId || !canAppend) return
    dispatch(addRowThunk())
  }

  const handleBulkFill = () => {
    if (!selectedPlankTypeId || !canAppend) return
    dispatch(bulkFillRoomThunk())
  }

  if (catalog.length === 0) {
    return <p className={styles.emptyHint}>Ajoute d'abord un type de lame au catalogue.</p>
  }

  const disabled = !selectedPlankTypeId || !canAppend
  const fullHint = selectedPlankTypeId && !canAppend
    ? 'La pièce est complète — pas de place pour une nouvelle rangée.'
    : null

  return (
    <div className={styles.addRow}>
      <Combobox
        label="Type de lame"
        options={options}
        value={selectedPlankTypeId ?? ''}
        onChange={id => dispatch(uiActions.setSelectedPlankTypeId(id || null))}
      />
      <div className={styles.addBtnRow}>
        <Button
          variant="outline"
          onClick={handleAdd}
          disabled={disabled}
          className={styles.addBtnHalf}
        >
          <Plus size={16} />
          <span>Ajouter</span>
        </Button>
        <Button
          variant="primary"
          onClick={handleBulkFill}
          disabled={disabled}
          className={styles.addBtnHalf}
        >
          <Rows3 size={16} />
          <span>Remplir</span>
        </Button>
      </div>
      {fullHint && <p className={styles.emptyHint}>{fullHint}</p>}
    </div>
  )
}
