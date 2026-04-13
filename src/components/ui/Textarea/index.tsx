import type { TextareaHTMLAttributes } from 'react'
import styles from './Textarea.module.css'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function Textarea({ label, error, className, id, ...rest }: TextareaProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={styles.wrapper}>
      {label && <label htmlFor={inputId} className={styles.label}>{label}</label>}
      <textarea
        id={inputId}
        className={[styles.textarea, error && styles.textareaError, className].filter(Boolean).join(' ')}
        {...rest}
      />
      {error && <span className={styles.error}>{error}</span>}
    </div>
  )
}
