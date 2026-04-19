import { useState } from 'react'
import { useAppSelector } from '@/hooks/redux'
import { selectInteractionMode, selectCurrentProject } from '@/store/selectors'
import { NavPanel } from '@/components/panels/NavPanel'
import styles from './ContextualPanel.module.css'

export function ContextualPanel() {
  const [collapsed, setCollapsed] = useState(false)
  const mode = useAppSelector(selectInteractionMode)
  const current = useAppSelector(selectCurrentProject)

  if (!current) return null

  let title = ''
  let content: React.ReactNode = null
  if (mode === 'nav') {
    title = 'Paramètres du projet'
    content = <NavPanel />
  } else {
    return null
  }

  return (
    <aside className={styles.panel}>
      <button
        type="button"
        className={styles.header}
        onClick={() => setCollapsed(c => !c)}
        aria-expanded={!collapsed}
      >
        <span>{title}</span>
        <span aria-hidden>{collapsed ? '▸' : '▾'}</span>
      </button>
      {!collapsed && <div className={styles.body}>{content}</div>}
    </aside>
  )
}
