import { Topbar } from '@/components/layout/Topbar'
import { ContextualPanel } from '@/components/layout/ContextualPanel'
import { HelperPanel } from '@/components/layout/HelperPanel'
import { Scene } from '@/components/canvas/Scene'
import { BackgroundPlan } from '@/components/canvas/BackgroundPlan'
import { CalibrationOverlay } from '@/components/canvas/BackgroundPlan/CalibrationOverlay'
import { CalibrationProvider } from '@/components/panels/PlanImportForm/CalibrationProvider'
import { RoomsLayer } from '@/components/canvas/Room/RoomsLayer'
import { DrawOverlay } from '@/components/canvas/DrawOverlay'
import { VertexHandles } from '@/components/canvas/Room/VertexHandles'
import { VertexEditProvider } from '@/components/canvas/Room/VertexEditContext'
import styles from './AppShell.module.css'

export function AppShell() {
  return (
    <div className={styles.shell}>
      <Topbar />
      <main className={styles.canvas}>
        <CalibrationProvider>
          <VertexEditProvider>
            <Scene overlay={<><CalibrationOverlay /><DrawOverlay /><VertexHandles /></>}>
              <BackgroundPlan />
              <RoomsLayer />
            </Scene>
            <ContextualPanel />
            <HelperPanel />
          </VertexEditProvider>
        </CalibrationProvider>
      </main>
    </div>
  )
}
