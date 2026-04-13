import type { InputHTMLAttributes } from 'react'
import styles from './Checkbox.module.css'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
}

export function Checkbox({ label, id, ...rest }: CheckboxProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')

  return (
    <label htmlFor={inputId} className={styles.label}>
      <input type="checkbox" id={inputId} className={styles.input} {...rest} />
      {label}
    </label>
  )
}
