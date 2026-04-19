import { useEffect, useRef } from 'react'

export interface Shortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  handler: (e: KeyboardEvent) => void
}

const FORM_SELECTOR = 'input, textarea, select, [contenteditable]'

function focusInsideForm(): boolean {
  const el = document.activeElement as HTMLElement | null
  return !!el && typeof el.matches === 'function' && el.matches(FORM_SELECTOR)
}

function matches(e: KeyboardEvent, s: Shortcut): boolean {
  if (e.key.toLowerCase() !== s.key.toLowerCase()) return false
  if (!!s.ctrl !== (e.ctrlKey || e.metaKey)) return false
  if (!!s.shift !== e.shiftKey) return false
  if (!!s.alt !== e.altKey) return false
  return true
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]): void {
  const ref = useRef(shortcuts)
  ref.current = shortcuts

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (focusInsideForm()) return
      for (const s of ref.current) {
        if (matches(e, s)) {
          e.preventDefault()
          s.handler(e)
          return
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}
