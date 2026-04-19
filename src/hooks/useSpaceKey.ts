import { useEffect, useRef, useState } from 'react'

const FORM_SELECTOR = 'input, textarea, select, [contenteditable]'

function focusInsideForm(): boolean {
  const el = document.activeElement as HTMLElement | null
  return !!el && typeof el.matches === 'function' && el.matches(FORM_SELECTOR)
}

export function useSpaceKey() {
  const spaceDownRef = useRef(false)
  const [spaceDown, setSpaceDown] = useState(false)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || focusInsideForm()) return
      if (spaceDownRef.current) return
      spaceDownRef.current = true
      setSpaceDown(true)
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return
      spaceDownRef.current = false
      setSpaceDown(false)
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  return { spaceDownRef, spaceDown }
}
