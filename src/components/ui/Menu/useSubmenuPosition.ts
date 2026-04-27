import { useLayoutEffect, useState, type RefObject } from 'react'

export interface SubmenuPosition {
  x: number
  y: number
  ready: boolean
}

const GAP = 4

export function useSubmenuPosition(
  triggerRef: RefObject<HTMLElement | null>,
  submenuRef: RefObject<HTMLElement | null>,
  open: boolean,
): SubmenuPosition {
  const [pos, setPos] = useState<SubmenuPosition>({ x: 0, y: 0, ready: false })

  useLayoutEffect(() => {
    if (!open) {
      setPos(p => p.ready ? { ...p, ready: false } : p)
      return
    }
    const trigger = triggerRef.current
    const submenu = submenuRef.current
    if (!trigger || !submenu) return
    const tRect = trigger.getBoundingClientRect()
    const subWidth = submenu.offsetWidth || 200
    const subHeight = submenu.offsetHeight || 200
    const vw = window.innerWidth
    const vh = window.innerHeight
    const fitsRight = tRect.right + subWidth + GAP <= vw
    const x = fitsRight ? tRect.right + GAP : Math.max(GAP, tRect.left - subWidth - GAP)
    const maxY = vh - subHeight - GAP
    const y = Math.max(GAP, Math.min(tRect.top, maxY))
    setPos({ x, y, ready: true })
  }, [open, triggerRef, submenuRef])

  return pos
}
