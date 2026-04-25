import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react'
import styles from './Button.module.css'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size    = 'sm' | 'md'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  iconOnly?: boolean
  children: ReactNode
  ref?: Ref<HTMLButtonElement>
}

export function Button({
  variant = 'secondary',
  size = 'md',
  iconOnly = false,
  className,
  children,
  ref,
  ...rest
}: ButtonProps) {
  const cls = [
    styles.btn,
    styles[variant],
    size === 'sm' && styles.sm,
    iconOnly && styles.iconOnly,
    className,
  ].filter(Boolean).join(' ')

  return (
    <button ref={ref} className={cls} {...rest}>
      {children}
    </button>
  )
}
