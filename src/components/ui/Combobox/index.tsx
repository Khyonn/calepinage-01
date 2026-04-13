import styles from './Combobox.module.css'
import { useCombobox } from './useCombobox'

export interface ComboboxOption {
  value: string
  label: string
}

export interface ComboboxProps {
  label?: string
  options: ComboboxOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
}

export function Combobox({
  label,
  options,
  value,
  onChange,
  placeholder = 'Sélectionner…',
  disabled = false,
  clearable = false,
}: ComboboxProps) {
  const selectedLabel = options.find(o => o.value === value)?.label ?? ''

  const {
    inputRef, listRef,
    inputId, listId, showClear,
    open, query, highlighted, filtered,
    openDropdown, select, clear,
    setQuery, setHighlighted,
    handleKeyDown, handleBlur,
  } = useCombobox(options, onChange, value, clearable, disabled)

  return (
    <div className={styles.wrapper}>
      {label && <label htmlFor={inputId} className={styles.label}>{label}</label>}

      <div className={styles.inputWrapper}>
        <input
          ref={inputRef}
          id={inputId}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
          disabled={disabled}
          placeholder={open ? 'Filtrer…' : (selectedLabel || placeholder)}
          value={open ? query : selectedLabel}
          onChange={e => { setQuery(e.target.value); setHighlighted(-1) }}
          onFocus={() => { if (!disabled) openDropdown() }}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={[styles.input, showClear && styles.inputWithClear].filter(Boolean).join(' ')}
        />

        {showClear && (
          <button
            type="button"
            tabIndex={0}
            onMouseDown={e => e.preventDefault()}
            onClick={clear}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); clear() } }}
            className={styles.clearBtn}
          >
            <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            <span className="sr-only">Effacer la sélection</span>
          </button>
        )}

        <svg
          width="12" height="12" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2.5"
          className={[styles.chevron, open && styles.chevronOpen].filter(Boolean).join(' ')}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>

      {open && (
        <ul ref={listRef} id={listId} role="listbox" className={styles.dropdown}>
          {filtered.length === 0 ? (
            <li className={styles.empty}>Aucun résultat</li>
          ) : filtered.map((opt, i) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              onMouseDown={e => e.preventDefault()}
              onClick={() => select(opt)}
              onMouseEnter={() => setHighlighted(i)}
              className={[
                styles.option,
                i === highlighted && styles.optionHighlighted,
                opt.value === value && styles.optionSelected,
              ].filter(Boolean).join(' ')}
            >
              {opt.label}
              {opt.value === value && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
