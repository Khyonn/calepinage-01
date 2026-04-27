import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useSubmenuPosition } from './useSubmenuPosition'
import styles from './Menu.module.css'

interface MenuProps {
  children: ReactNode
  className?: string
}

export function Menu({ children, className }: MenuProps) {
  return (
    <div role="menu" className={[styles.menu, className].filter(Boolean).join(' ')}>
      {children}
    </div>
  )
}

interface MenuItemProps {
  children: ReactNode
  disabled?: boolean
  onSelect?: () => void
  className?: string
}

export function MenuItem({ children, disabled, onSelect, className }: MenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      className={[styles.item, className].filter(Boolean).join(' ')}
      disabled={disabled}
      onClick={onSelect}
    >
      {children}
    </button>
  )
}

export function MenuSeparator() {
  return <hr className={styles.separator} />
}

interface MenuSubmenuProps {
  label: ReactNode
  disabled?: boolean
  delay?: number
  children: ReactNode
}

export function MenuSubmenu({ label, disabled, delay = 150, children }: MenuSubmenuProps) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const submenuRef = useRef<HTMLDivElement | null>(null)
  const openTimer = useRef<number | null>(null)
  const closeTimer = useRef<number | null>(null)
  const position = useSubmenuPosition(triggerRef, submenuRef, open)

  const cancelTimers = () => {
    if (openTimer.current !== null) { window.clearTimeout(openTimer.current); openTimer.current = null }
    if (closeTimer.current !== null) { window.clearTimeout(closeTimer.current); closeTimer.current = null }
  }
  const openSoon = () => {
    cancelTimers()
    openTimer.current = window.setTimeout(() => setOpen(true), delay)
  }
  const closeSoon = () => {
    cancelTimers()
    closeTimer.current = window.setTimeout(() => setOpen(false), delay)
  }
  useEffect(() => () => cancelTimers(), [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'ArrowLeft') {
        e.stopPropagation()
        e.preventDefault()
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const onTriggerKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setOpen(true)
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        role="menuitem"
        aria-haspopup="menu"
        aria-expanded={open}
        className={`${styles.item} ${styles.submenuTrigger}`}
        disabled={disabled}
        onPointerEnter={!disabled ? openSoon : undefined}
        onPointerLeave={!disabled ? closeSoon : undefined}
        onFocus={!disabled ? () => setOpen(true) : undefined}
        onClick={!disabled ? () => setOpen(o => !o) : undefined}
        onKeyDown={!disabled ? onTriggerKey : undefined}
      >
        <span>{label}</span>
        <span aria-hidden className={styles.chevron}>▸</span>
      </button>
      {open && createPortal(
        <div
          ref={submenuRef}
          role="menu"
          className={styles.flyout}
          data-ready={position.ready ? '' : undefined}
          style={{ left: position.x, top: position.y }}
          onPointerEnter={cancelTimers}
          onPointerLeave={closeSoon}
        >
          {children}
        </div>,
        document.body,
      )}
    </>
  )
}
