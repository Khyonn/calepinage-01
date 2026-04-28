import { Hand, Image as ImageIcon, Pencil } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { selectInteractionMode } from '@/store/selectors'
import { uiActions } from '@/store/uiSlice'
import type { InteractionMode } from '@/store/types'
import { RoomSwitcher } from './RoomSwitcher'
import styles from './ModeSelector.module.css'
import type { ComponentType, SVGProps } from 'react'

interface ModeEntry {
  value: Exclude<InteractionMode, 'edit'>
  label: string
  Icon: ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>
}

const ENTRIES: ModeEntry[] = [
  { value: 'nav',  label: 'Vue',          Icon: Hand },
  { value: 'plan', label: 'Plan de fond', Icon: ImageIcon },
  { value: 'draw', label: 'Dessiner',     Icon: Pencil },
]

export function ModeSelector() {
  const mode = useAppSelector(selectInteractionMode)
  const dispatch = useAppDispatch()

  return (
    <div role="group" aria-label="Mode d'interaction" className={styles.group}>
      {ENTRIES.map((entry, i) => {
        const selected = mode === entry.value
        const position = i === 0 ? 'first' : 'middle'
        const { Icon } = entry
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
            <Icon size={16} aria-hidden />
            <span>{entry.label}</span>
          </button>
        )
      })}
      <RoomSwitcher />
    </div>
  )
}
