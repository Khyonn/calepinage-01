import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { selectInteractionMode } from '@/store/selectors'
import { uiActions } from '@/store/uiSlice'
import type { InteractionMode } from '@/store/types'
import { RoomSwitcher } from './RoomSwitcher'
import styles from './ModeSelector.module.css'

interface ModeEntry {
  value: Exclude<InteractionMode, 'edit'>
  label: string
}

const ENTRIES: ModeEntry[] = [
  { value: 'nav',  label: 'Vue' },
  { value: 'plan', label: 'Plan de fond' },
  { value: 'draw', label: 'Dessiner' },
]

export function ModeSelector() {
  const mode = useAppSelector(selectInteractionMode)
  const dispatch = useAppDispatch()

  return (
    <div role="group" aria-label="Mode d'interaction" className={styles.group}>
      {ENTRIES.map((entry, i) => {
        const selected = mode === entry.value
        const position = i === 0 ? 'first' : 'middle'
        return (
          <button
            key={entry.value}
            type="button"
            aria-pressed={selected}
            onClick={() => {
              if (entry.value === 'nav') dispatch(uiActions.setActiveRoom(null))
              dispatch(uiActions.setMode(entry.value))
            }}
            className={[styles.btn, styles[position], selected && styles.selected].filter(Boolean).join(' ')}
          >
            {entry.label}
          </button>
        )
      })}
      <RoomSwitcher />
    </div>
  )
}
