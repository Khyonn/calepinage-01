import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { NewProjectDialog } from '@/components/layout/NewProjectDialog'
import { OpenProjectDialog } from '@/components/layout/OpenProjectDialog'
import { DeleteProjectConfirm } from '@/components/layout/DeleteProjectConfirm'
import { ThemeSwitcher } from '@/components/layout/ThemeSwitcher'
import { useAppSelector } from '@/hooks/redux'
import { selectCurrentProject, selectProjectList } from '@/store/selectors'
import { useHamburgerMenu } from './useHamburgerMenu'
import { useExportCsv } from './useExportCsv'
import styles from './HamburgerMenu.module.css'

type ActiveDialog = null | 'new' | 'open' | 'delete'

export function HamburgerMenu() {
  const [open, setOpen] = useState(false)
  const [dialog, setDialog] = useState<ActiveDialog>(null)
  const { ref } = useHamburgerMenu(open, () => setOpen(false))

  const current = useAppSelector(selectCurrentProject)
  const list = useAppSelector(selectProjectList)
  const exportCsv = useExportCsv()

  const close = () => setOpen(false)
  const openDialog = (d: ActiveDialog) => { setDialog(d); close() }
  const canOpenOthers = list.some(p => p.id !== current?.id)

  return (
    <div className={styles.anchor} ref={ref}>
      <Button variant="ghost" iconOnly aria-label="Menu" onClick={() => setOpen(o => !o)}>
        ☰
      </Button>
      {open && (
        <div role="menu" className={styles.menu}>
          <button role="menuitem" className={styles.item} onClick={() => openDialog('new')}>
            Nouveau projet
          </button>
          <button
            role="menuitem"
            className={styles.item}
            onClick={() => openDialog('open')}
            disabled={!canOpenOthers}
          >
            Ouvrir un projet
          </button>
          <button
            role="menuitem"
            className={styles.item}
            onClick={() => { exportCsv(); close() }}
            disabled={!current}
          >
            Exporter CSV
          </button>
          <button
            role="menuitem"
            className={`${styles.item} ${styles.danger}`}
            onClick={() => openDialog('delete')}
            disabled={!current}
          >
            Supprimer le projet
          </button>
          <hr className={styles.separator} />
          <ThemeSwitcher />
        </div>
      )}

      <NewProjectDialog open={dialog === 'new'} onClose={() => setDialog(null)} />
      <OpenProjectDialog open={dialog === 'open'} onClose={() => setDialog(null)} />
      <DeleteProjectConfirm open={dialog === 'delete'} onClose={() => setDialog(null)} />
    </div>
  )
}
