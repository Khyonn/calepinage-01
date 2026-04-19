import { Topbar } from '@/components/layout/Topbar'
import { ContextualPanel } from '@/components/layout/ContextualPanel'
import { HelperPanel } from '@/components/layout/HelperPanel'
import { Scene } from '@/components/canvas/Scene'
import { BackgroundPlan } from '@/components/canvas/BackgroundPlan'
import { CalibrationOverlay } from '@/components/canvas/BackgroundPlan/CalibrationOverlay'
import { CalibrationProvider } from '@/components/panels/PlanImportForm/CalibrationProvider'
import styles from './AppShell.module.css'

export function AppShell() {
  return (
    <div className={styles.shell}>
      <Topbar />
      <main className={styles.canvas}>
        <CalibrationProvider>
          <Scene overlay={<CalibrationOverlay />}>
            <BackgroundPlan />
          </Scene>
          <ContextualPanel />
          <HelperPanel />
        </CalibrationProvider>
      </main>
    </div>
  )
}
