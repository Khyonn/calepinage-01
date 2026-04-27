import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Tooltip } from '@/components/ui/Tooltip'
import { Menu, MenuItem, MenuSubmenu, MenuSeparator } from '@/components/ui/Menu'
import { NewProjectDialog } from '@/components/layout/NewProjectDialog'
import { CloneProjectDialog } from '@/components/layout/CloneProjectDialog'
import { DeleteProjectConfirm } from '@/components/layout/DeleteProjectConfirm'
import { ThemeSwitcher } from '@/components/layout/ThemeSwitcher'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { selectCurrentProject, selectProjectList } from '@/store/selectors'
import { openProjectThunk } from '@/store/thunks'
import { localStorageLastProjectId } from '@/persistence/lastProjectId'
import { useHamburgerMenu } from './useHamburgerMenu'
import { useExportCsv } from './useExportCsv'
import { useExportJson } from './useExportJson'
import { useImportJson } from './useImportJson'
import styles from './HamburgerMenu.module.css'

type ActiveDialog = null | 'new' | 'clone' | 'delete'

export function HamburgerMenu() {
  const [open, setOpen] = useState(false)
  const [dialog, setDialog] = useState<ActiveDialog>(null)
  const { ref } = useHamburgerMenu(open, () => setOpen(false))
  const dispatch = useAppDispatch()

  const current = useAppSelector(selectCurrentProject)
  const list = useAppSelector(selectProjectList)
  const exportCsv = useExportCsv()
  const exportJson = useExportJson()
  const importJson = useImportJson()

  const close = () => setOpen(false)
  const openDialog = (d: ActiveDialog) => { setDialog(d); close() }
  const others = list.filter(p => p.id !== current?.id)
  const canOpenOthers = others.length > 0

  const chooseProject = (id: string) => {
    void dispatch(openProjectThunk(id, localStorageLastProjectId))
    close()
  }

  return (
    <div className={styles.anchor} ref={ref}>
      <Tooltip content="Menu" placement="bottom">
        <Button variant="ghost" iconOnly aria-label="Menu" onClick={() => setOpen(o => !o)}>
          ☰
        </Button>
      </Tooltip>
      {open && (
        <Menu className={styles.menu}>
          <MenuSubmenu label="Nouveau projet">
            <MenuItem onSelect={() => openDialog('new')}>À partir de rien</MenuItem>
            <MenuItem onSelect={() => { importJson(); close() }}>
              Depuis un fichier JSON
            </MenuItem>
            <MenuItem
              disabled={list.length === 0}
              onSelect={() => openDialog('clone')}
            >
              Depuis un projet existant
            </MenuItem>
          </MenuSubmenu>
          <MenuSubmenu label="Ouvrir un projet" disabled={!canOpenOthers}>
            {others.map(p => (
              <MenuItem key={p.id} onSelect={() => chooseProject(p.id)}>
                {p.name}
              </MenuItem>
            ))}
          </MenuSubmenu>
          <MenuItem disabled={!current} onSelect={() => { exportCsv(); close() }}>
            Exporter CSV
          </MenuItem>
          <MenuItem disabled={!current} onSelect={() => { void exportJson(); close() }}>
            Exporter JSON
          </MenuItem>
          <MenuItem
            disabled={!current}
            onSelect={() => openDialog('delete')}
            className={styles.danger}
          >
            Supprimer le projet
          </MenuItem>
          <MenuSeparator />
          <ThemeSwitcher />
        </Menu>
      )}

      <NewProjectDialog open={dialog === 'new'} onClose={() => setDialog(null)} />
      <CloneProjectDialog open={dialog === 'clone'} onClose={() => setDialog(null)} />
      <DeleteProjectConfirm open={dialog === 'delete'} onClose={() => setDialog(null)} />
    </div>
  )
}
