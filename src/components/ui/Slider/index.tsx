import type { InputHTMLAttributes } from 'react'
import styles from './Slider.module.css'

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  unit?: string
}

export function Slider({ label, value, onChange, min = 0, max = 100, step = 1, unit = '', id, ...rest }: SliderProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <label htmlFor={inputId} className={styles.label}>{label}</label>
        <span className={styles.value}>{value}{unit}</span>
      </div>
      <input
        type="range"
        id={inputId}
        min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className={styles.input}
        {...rest}
      />
    </div>
  )
}
