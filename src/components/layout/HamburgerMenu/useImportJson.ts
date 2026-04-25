import { useCallback } from 'react'
import { useAppDispatch } from '@/hooks/redux'
import { importProjectThunk } from '@/store/thunks'
import { projectFromJson } from '@/core/projectSerialize'
import { localStorageLastProjectId } from '@/persistence/lastProjectId'

export function useImportJson() {
  const dispatch = useAppDispatch()

  return useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json,.json'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      try {
        const text = await file.text()
        const { project, image } = projectFromJson(text)
        await dispatch(importProjectThunk(project, image, localStorageLastProjectId))
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Fichier corrompu'
        alert(`Import impossible : ${message}`)
      }
    }
    input.click()
  }, [dispatch])
}
