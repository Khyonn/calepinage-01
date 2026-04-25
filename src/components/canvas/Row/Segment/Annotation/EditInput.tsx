import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent, FocusEvent as ReactFocusEvent } from 'react'
import styles from './EditInput.module.css'

interface Props {
  x: number
  y: number
  initialLength: number
  zoom: number
  anchor: 'start' | 'end'
  onCommit: (newLength: number) => void
  onCancel: () => void
}

const PX_HEIGHT = 18
const PX_WIDTH = 56

export function EditInput({ x, y, initialLength, zoom, anchor, onCommit, onCancel }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [draft, setDraft] = useState(formatInitial(initialLength))
  const cancelledRef = useRef(false)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  const commit = () => {
    if (cancelledRef.current) return
    const parsed = parseFr(draft)
    if (Number.isFinite(parsed)) onCommit(parsed)
    else onCancel()
  }

  const onKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      e.currentTarget.blur() // déclenche commit via onBlur
    } else if (e.key === 'Escape') {
      e.preventDefault()
      cancelledRef.current = true
      onCancel()
    }
    e.stopPropagation()
  }

  const onBlur = (_e: ReactFocusEvent<HTMLInputElement>) => {
    commit()
  }

  const widthWorld = PX_WIDTH / zoom
  const heightWorld = PX_HEIGHT / zoom
  // Anchor 'end' aligne le bord droit de l'input sur x ; 'start' aligne le bord gauche.
  const foX = anchor === 'end' ? x - widthWorld : x
  const foY = y - heightWorld / 2

  return (
    <foreignObject x={foX} y={foY} width={widthWorld} height={heightWorld}>
      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        className={styles.input}
        style={{ fontSize: `${11 / zoom}px` }}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        onPointerDown={e => e.stopPropagation()}
        onClick={e => e.stopPropagation()}
        onDoubleClick={e => e.stopPropagation()}
      />
    </foreignObject>
  )
}

function formatInitial(n: number): string {
  return (Math.round(n * 10) / 10).toString().replace('.', ',')
}

function parseFr(s: string): number {
  const trimmed = s.trim().replace(',', '.')
  if (trimmed === '') return NaN
  const n = Number(trimmed)
  return Number.isFinite(n) ? n : NaN
}
