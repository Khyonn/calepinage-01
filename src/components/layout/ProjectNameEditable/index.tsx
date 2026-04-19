import { useEffect, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { selectCurrentProject } from '@/store/selectors'
import { projectActions } from '@/store/projectSlice'
import styles from './ProjectNameEditable.module.css'

export function ProjectNameEditable() {
  const current = useAppSelector(selectCurrentProject)
  const dispatch = useAppDispatch()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      setDraft(current?.name ?? '')
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing, current?.name])

  if (!current) return <span className={styles.name}>—</span>

  const commit = () => {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== current.name) {
      dispatch(projectActions.updateName({ name: trimmed }))
    }
    setEditing(false)
  }

  const cancel = () => setEditing(false)

  if (editing) {
    return (
      <input
        ref={inputRef}
        className={styles.input}
        value={draft}
        onChange={e => setDraft(e.currentTarget.value)}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === 'Enter') commit()
          else if (e.key === 'Escape') cancel()
        }}
      />
    )
  }

  return (
    <button
      type="button"
      className={styles.name}
      onClick={() => setEditing(true)}
      aria-label={`Renommer le projet ${current.name}`}
    >
      {current.name}
    </button>
  )
}
