import { Topbar } from '@/components/layout/Topbar'
import { ContextualPanel } from '@/components/layout/ContextualPanel'
import styles from './AppShell.module.css'

export function AppShell() {
  return (
    <div className={styles.shell}>
      <Topbar />
      <main className={styles.canvas}>
        <ContextualPanel />
      </main>
    </div>
  )
}
