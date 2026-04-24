import { useCallback } from 'react'
import { useAppSelector } from '@/hooks/redux'
import {
  selectCurrentProject, selectOffcutLinks, selectSummary,
} from '@/store/selectors'
import { projectToCsv } from '@/core/exportCsv'

export function useExportCsv() {
  const project = useAppSelector(selectCurrentProject)
  const summary = useAppSelector(selectSummary)
  const links = useAppSelector(selectOffcutLinks)

  return useCallback(() => {
    if (!project) return
    const csv = projectToCsv(project, summary, links)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `calepinage-${slug(project.name)}-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }, [project, summary, links])
}

function slug(s: string): string {
  return s.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'projet'
}
