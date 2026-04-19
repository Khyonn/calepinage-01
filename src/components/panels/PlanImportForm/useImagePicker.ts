import { useCallback, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { selectCurrentProject } from '@/store/selectors'
import { projectActions } from '@/store/projectSlice'

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp']
const MAX_SIZE_BYTES = 10 * 1024 * 1024
const ACCEPT_ATTR = ACCEPTED_TYPES.join(',')

interface PickerApi {
  inputRef: React.RefObject<HTMLInputElement | null>
  acceptAttr: string
  openPicker: () => void
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleDropFile: (file: File) => void
}

export function useImagePicker(): PickerApi {
  const dispatch = useAppDispatch()
  const project = useAppSelector(selectCurrentProject)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const accept = useCallback((file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      console.warn(`[PlanImport] type non supporté : ${file.type}`)
      return
    }
    if (file.size > MAX_SIZE_BYTES) {
      console.warn(`[PlanImport] fichier volumineux (${(file.size / 1024 / 1024).toFixed(1)} MB)`)
    }
    if (!project) return
    dispatch(projectActions.setPlan({
      id: crypto.randomUUID(),
      projectId: project.id,
      imageFile: file,
      opacity: 0.6,
      rotation: 0,
      x: 0,
      y: 0,
    }))
  }, [dispatch, project])

  const openPicker = useCallback(() => inputRef.current?.click(), [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0]
    if (file) accept(file)
    e.currentTarget.value = ''
  }, [accept])

  const handleDropFile = useCallback((file: File) => accept(file), [accept])

  return { inputRef, acceptAttr: ACCEPT_ATTR, openPicker, handleInputChange, handleDropFile }
}
