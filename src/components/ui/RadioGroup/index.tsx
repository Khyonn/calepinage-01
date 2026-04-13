import { useId } from 'react'
import styles from './RadioGroup.module.css'
import { useRadioGroup } from './useRadioGroup'

export interface RadioOption {
  value: string
  label: string
}

export interface RadioGroupProps {
  label?: string
  options: RadioOption[]
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function RadioGroup({ label, options, value, onChange, disabled = false }: RadioGroupProps) {
  const legendId          = useId()
  const { groupRef, handleKeyDown } = useRadioGroup(options, onChange)

  return (
    <div className={styles.wrapper}>
      {label && <span id={legendId} className={styles.legend}>{label}</span>}
      <div
        ref={groupRef}
        role="radiogroup"
        aria-labelledby={label ? legendId : undefined}
        className={styles.group}
      >
        {options.map((opt, i) => {
          const selected  = opt.value === value
          const position  = i === 0 ? 'first' : i === options.length - 1 ? 'last' : 'middle'

          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected ? 0 : -1}
              disabled={disabled}
              onClick={() => onChange(opt.value)}
              onKeyDown={e => handleKeyDown(e, opt.value)}
              className={[styles.btn, styles[position], selected && styles.selected].filter(Boolean).join(' ')}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
