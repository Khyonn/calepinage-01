import { useEffect, useRef } from 'react'

export function useHamburgerMenu(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (!ref.current) return
      const target = e.target as Element | null
      if (!target) return
      if (ref.current.contains(target)) return
      // Ignore clicks inside any portaled submenu (role="menu" outside the anchor).
      if (typeof target.closest === 'function' && target.closest('[role="menu"]')) return
      onClose()
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    const first = ref.current?.querySelector<HTMLElement>('[role="menuitem"]')
    first?.focus()
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open, onClose])

  return { ref }
}
