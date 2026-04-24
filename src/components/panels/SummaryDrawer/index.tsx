import { Drawer } from '@/components/ui/Drawer'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { uiActions } from '@/store/uiSlice'
import { selectDrawerOpen } from '@/store/selectors'
import { SummaryTable } from './SummaryTable'
import { OffcutTable } from './OffcutTable'
import styles from './SummaryDrawer.module.css'

export function SummaryDrawer() {
  const dispatch = useAppDispatch()
  const open = useAppSelector(selectDrawerOpen)

  return (
    <Drawer
      open={open}
      onClose={() => dispatch(uiActions.setDrawerOpen(false))}
      title="Résumé matière"
    >
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Par type de lame</h3>
        <SummaryTable />
      </section>
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Liens de réutilisation</h3>
        <OffcutTable />
      </section>
    </Drawer>
  )
}
