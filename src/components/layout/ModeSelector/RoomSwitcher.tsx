import { useEffect, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { selectActiveRoomId, selectInteractionMode, selectRooms } from '@/store/selectors'
import { uiActions } from '@/store/uiSlice'
import styles from './ModeSelector.module.css'

export function RoomSwitcher() {
  const mode = useAppSelector(selectInteractionMode)
  const rooms = useAppSelector(selectRooms)
  const activeRoomId = useAppSelector(selectActiveRoomId)
  const dispatch = useAppDispatch()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handlePointer = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handlePointer)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handlePointer)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  if (!activeRoomId) return null

  const selected = mode === 'edit'
  const activeName = rooms.find(r => r.id === activeRoomId)?.name
  const label = activeName ?? 'Éditer'

  const handleSelect = (roomId: string) => {
    dispatch(uiActions.setActiveRoom(roomId))
    dispatch(uiActions.setMode('edit'))
    setOpen(false)
  }

  return (
    <div ref={containerRef} className={styles.switcher}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        className={[styles.btn, styles.last, selected && styles.selected].filter(Boolean).join(' ')}
      >
        <span className={styles.switcherLabel}>{label}</span>
        <span aria-hidden className={styles.caret}>▾</span>
      </button>
      {open && (
        <ul role="listbox" className={styles.dropdown}>
          {rooms.map(r => (
            <li key={r.id}>
              <button
                type="button"
                role="option"
                aria-selected={r.id === activeRoomId}
                onClick={() => handleSelect(r.id)}
                className={[styles.option, r.id === activeRoomId && selected && styles.optionSelected].filter(Boolean).join(' ')}
              >
                {r.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
