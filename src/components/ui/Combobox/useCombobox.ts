import { useId, useRef, useState } from 'react'
import type { ComboboxOption } from './index'

export function useCombobox(
  options: ComboboxOption[],
  onChange: (value: string) => void,
  value: string,
  clearable: boolean,
  disabled: boolean,
) {
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef  = useRef<HTMLUListElement>(null)
  const inputId  = useId()
  const listId   = useId()

  const [open,        setOpen]        = useState(false)
  const [query,       setQuery]       = useState('')
  const [highlighted, setHighlighted] = useState(-1)

  const filtered = query.trim()
    ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
    : options

  function openDropdown() {
    setQuery('')
    setHighlighted(-1)
    setOpen(true)
  }

  function closeDropdown() {
    setOpen(false)
    setQuery('')
    setHighlighted(-1)
  }

  function select(opt: ComboboxOption) {
    onChange(opt.value)
    closeDropdown()
    inputRef.current?.blur()
  }

  function clear() {
    onChange('')
    setQuery('')
    closeDropdown()
    inputRef.current?.focus()
  }

  function scrollToItem(index: number) {
    const item = listRef.current?.children[index] as HTMLElement | undefined
    item?.scrollIntoView({ block: 'nearest' })
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') { openDropdown(); e.preventDefault() }
      return
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlighted(h => { const n = Math.min(h + 1, filtered.length - 1); scrollToItem(n); return n })
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlighted(h => { const n = Math.max(h - 1, 0); scrollToItem(n); return n })
        break
      case 'Enter':
        e.preventDefault()
        if (highlighted >= 0 && filtered[highlighted]) select(filtered[highlighted])
        else if (filtered.length === 1) select(filtered[0])
        break
      case 'Escape':
        e.preventDefault()
        closeDropdown()
        break
      case 'Tab':
        closeDropdown()
        break
    }
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    if (!e.currentTarget.parentElement?.parentElement?.contains(e.relatedTarget)) {
      closeDropdown()
    }
  }

  const showClear = clearable && !!value && !disabled

  return {
    inputRef, listRef,
    inputId, listId, showClear,
    open, query, highlighted, filtered,
    openDropdown, closeDropdown, select, clear,
    setQuery, setHighlighted,
    handleKeyDown, handleBlur,
  }
}
