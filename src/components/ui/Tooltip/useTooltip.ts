import { useEffect, useRef, useState } from 'react'

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right'

export interface TooltipPosition {
  x: number
  y: number
}

export interface TooltipHandlers {
  onPointerEnter: () => void
  onPointerLeave: () => void
  onPointerDown: () => void
  onFocus: () => void
  onBlur: () => void
}

interface UseTooltipResult {
  open: boolean
  position: TooltipPosition
  handlers: TooltipHandlers
}

const ARROW_GAP = 6 // px entre trigger et tooltip

export function useTooltip(
  triggerRef: { current: Element | null },
  placement: TooltipPlacement,
  delay: number,
): UseTooltipResult {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState<TooltipPosition>({ x: 0, y: 0 })
  const timerRef = useRef<number | null>(null)
  const dismissedRef = useRef(false)

  const computeAnchor = (): TooltipPosition => {
    const node = triggerRef.current
    if (!node) return { x: 0, y: 0 }
    const r = node.getBoundingClientRect()
    switch (placement) {
      case 'top':    return { x: r.left + r.width / 2, y: r.top - ARROW_GAP }
      case 'bottom': return { x: r.left + r.width / 2, y: r.bottom + ARROW_GAP }
      case 'left':   return { x: r.left - ARROW_GAP, y: r.top + r.height / 2 }
      case 'right':  return { x: r.right + ARROW_GAP, y: r.top + r.height / 2 }
    }
  }

  const show = (immediate: boolean) => {
    if (dismissedRef.current) return
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
    const reveal = () => {
      setPosition(computeAnchor())
      setOpen(true)
    }
    if (immediate) reveal()
    else timerRef.current = window.setTimeout(reveal, delay)
  }

  const hide = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dismissedRef.current = true
        if (timerRef.current !== null) {
          window.clearTimeout(timerRef.current)
          timerRef.current = null
        }
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current)
  }, [])

  const handlers: TooltipHandlers = {
    onPointerEnter: () => show(false),
    onPointerLeave: () => { hide(); dismissedRef.current = false },
    onPointerDown:  () => { dismissedRef.current = true; hide() },
    onFocus:        () => show(true),
    onBlur:         () => { hide(); dismissedRef.current = false },
  }

  return { open, position, handlers }
}
