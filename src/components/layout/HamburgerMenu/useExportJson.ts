import { useCallback } from 'react'
import { useAppSelector } from '@/hooks/redux'
import { selectCurrentProject } from '@/store/selectors'
import { projectToJson, type SerializedImage } from '@/core/projectSerialize'

export function useExportJson() {
  const project = useAppSelector(selectCurrentProject)

  return useCallback(async () => {
    if (!project) return

    let image: SerializedImage | undefined
    const file = project.backgroundPlan?.imageFile
    if (file) {
      try {
        image = {
          name: file.name,
          mimeType: file.type,
          dataUrl: await fileToDataUrl(file),
        }
      } catch {
        alert('Erreur : impossible de lire l\'image du plan de fond.')
        return
      }
    }

    const json = projectToJson(project, image)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `calepinage-${slug(project.name)}-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }, [project])
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function slug(s: string): string {
  return s.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'projet'
}
