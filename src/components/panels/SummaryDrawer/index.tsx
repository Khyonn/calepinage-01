import { FileSpreadsheet } from 'lucide-react'
import { Drawer } from '@/components/ui/Drawer'
import { Button } from '@/components/ui/Button'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { uiActions } from '@/store/uiSlice'
import { selectCurrentProject, selectDrawerOpen } from '@/store/selectors'
import { SummaryTable } from './SummaryTable'
import { RowRecap } from './RowRecap'
import { useExportCsv } from './useExportCsv'
import styles from './SummaryDrawer.module.css'

export function SummaryDrawer() {
  const dispatch = useAppDispatch()
  const open = useAppSelector(selectDrawerOpen)
  const current = useAppSelector(selectCurrentProject)
  const exportCsv = useExportCsv()

  return (
    <Drawer
      open={open}
      onClose={() => dispatch(uiActions.setDrawerOpen(false))}
      title="Résumé matière"
      footer={
        <Button
          variant="primary"
          onClick={exportCsv}
          disabled={!current}
          className={styles.exportBtn}
        >
          <FileSpreadsheet size={16} />
          <span>Exporter en CSV</span>
        </Button>
      }
    >
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Par type de lame</h3>
        <SummaryTable />
      </section>
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Détail par rangée</h3>
        <RowRecap />
      </section>
    </Drawer>
  )
}
