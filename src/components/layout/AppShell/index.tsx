import { Topbar } from '@/components/layout/Topbar'
import { ContextualPanel } from '@/components/layout/ContextualPanel'
import { HelperPanel } from '@/components/layout/HelperPanel'
import { Scene } from '@/components/canvas/Scene'
import styles from './AppShell.module.css'

export function AppShell() {
  return (
    <div className={styles.shell}>
      <Topbar />
      <main className={styles.canvas}>
        <Scene />
        <ContextualPanel />
        <HelperPanel />
      </main>
    </div>
  )
}
