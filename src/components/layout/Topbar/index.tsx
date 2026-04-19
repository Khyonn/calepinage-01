import { Button } from '@/components/ui/Button'
import { ModeSelector } from '@/components/layout/ModeSelector'
import { HamburgerMenu } from '@/components/layout/HamburgerMenu'
import { ProjectNameEditable } from '@/components/layout/ProjectNameEditable'
import styles from './Topbar.module.css'

export function Topbar() {
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
        {/* TODO jalon 12.1 : brancher le toggle drawer */}
        <Button variant="ghost" iconOnly aria-label="Résumé" disabled>☷</Button>
      </div>
    </header>
  )
}
