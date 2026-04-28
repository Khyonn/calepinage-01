import { PanelRightOpen, PanelRightClose } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Tooltip } from '@/components/ui/Tooltip'
import { ModeSelector } from '@/components/layout/ModeSelector'
import { HamburgerMenu } from '@/components/layout/HamburgerMenu'
import { ProjectNameEditable } from '@/components/layout/ProjectNameEditable'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { uiActions } from '@/store/uiSlice'
import { selectDrawerOpen } from '@/store/selectors'
import styles from './Topbar.module.css'

export function Topbar() {
  const dispatch = useAppDispatch()
  const drawerOpen = useAppSelector(selectDrawerOpen)

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <HamburgerMenu />
        <ProjectNameEditable />
      </div>
      <div className={styles.center}>
        <ModeSelector />
      </div>
      <div className={styles.right}>
        <Tooltip content="Résumé matière" placement="bottom">
          <Button
            variant="ghost"
            iconOnly
            aria-label="Résumé"
            aria-pressed={drawerOpen}
            onClick={() => dispatch(uiActions.toggleDrawer())}
          >
            {drawerOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
          </Button>
        </Tooltip>
      </div>
    </header>
  )
}
