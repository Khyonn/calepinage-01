import { useRef } from 'react'

export function useRadioGroup(
  options: { value: string }[],
  onChange: (value: string) => void,
) {
  const groupRef = useRef<HTMLDivElement>(null)

  function focusButton(index: number) {
    const btns = groupRef.current?.querySelectorAll<HTMLButtonElement>('button')
    btns?.[index]?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent, optValue: string) {
    const values  = options.map(o => o.value)
    const current = values.indexOf(optValue)

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      const next = (current + 1) % values.length
      onChange(values[next])
      focusButton(next)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      const prev = (current - 1 + values.length) % values.length
      onChange(values[prev])
      focusButton(prev)
    }
  }

  return { groupRef, handleKeyDown }
}
