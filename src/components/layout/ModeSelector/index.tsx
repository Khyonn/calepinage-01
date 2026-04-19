import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { selectInteractionMode, selectActiveRoomId } from '@/store/selectors'
import { uiActions } from '@/store/uiSlice'
import type { InteractionMode } from '@/store/types'
import styles from './ModeSelector.module.css'

interface ModeEntry {
  value: InteractionMode
  label: string
  enabled: boolean
}

export function ModeSelector() {
  const mode = useAppSelector(selectInteractionMode)
  const activeRoomId = useAppSelector(selectActiveRoomId)
  const dispatch = useAppDispatch()

  const entries: ModeEntry[] = [
    { value: 'nav',  label: 'Vue',          enabled: true },
    { value: 'plan', label: 'Plan de fond', enabled: false },
    { value: 'draw', label: 'Dessiner',     enabled: false },
  ]
  if (activeRoomId) entries.push({ value: 'edit', label: 'Éditer', enabled: false })

  return (
    <div role="radiogroup" aria-label="Mode d'interaction" className={styles.group}>
      {entries.map((entry, i) => {
        const selected = mode === entry.value
        const position = i === 0 ? 'first' : i === entries.length - 1 ? 'last' : 'middle'
        return (
          <button
            key={entry.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={!entry.enabled}
            onClick={() => dispatch(uiActions.setMode(entry.value))}
            className={[styles.btn, styles[position], selected && styles.selected].filter(Boolean).join(' ')}
          >
            {entry.label}
          </button>
        )
      })}
    </div>
  )
}
