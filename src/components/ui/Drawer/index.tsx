import { type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import styles from './Drawer.module.css'
import { useDrawer } from './useDrawer'

export interface DrawerProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
}

export function Drawer({ open, onClose, title, children, footer }: DrawerProps) {
  const { drawerRef, width, onResizeMouseDown } = useDrawer(open, onClose)

  return createPortal(
    <div
      ref={drawerRef}
      className={[styles.drawer, open && styles.drawerOpen].filter(Boolean).join(' ')}
      style={{ width }}
      {...(!open ? { inert: true } : {})}
    >
      <div className={styles.resizeHandle} onMouseDown={onResizeMouseDown} />

      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        <button type="button" onClick={onClose} className={styles.closeBtn}>
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          <span className="sr-only">Fermer</span>
        </button>
      </div>

      <div className={styles.body}>{children}</div>

      {footer && <div className={styles.footer}>{footer}</div>}
    </div>,
    document.body
  )
}
