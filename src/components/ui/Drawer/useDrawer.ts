import { useCallback, useEffect, useRef, useState } from 'react'

const MIN_WIDTH_PX = 320 // min(50vw, 20rem) — 20rem = 320px à 16px base
const MAX_WIDTH_RATIO = 0.5

export function useDrawer(open: boolean, onClose: () => void) {
  const drawerRef   = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(MIN_WIDTH_PX)

  // Fermeture sur Échap
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  // Resize par drag sur le bord gauche
  const onResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const startX     = e.clientX
    const startWidth = width

    function onMouseMove(ev: MouseEvent) {
      const delta    = startX - ev.clientX
      const maxWidth = window.innerWidth * MAX_WIDTH_RATIO
      setWidth(Math.min(maxWidth, Math.max(MIN_WIDTH_PX, startWidth + delta)))
    }

    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }, [width])

  return { drawerRef, width, onResizeMouseDown }
}
